import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { adminFetch } from "./logger";

export interface SystemHealth {
  auth: 'Healthy' | 'Warning' | 'Failed';
  firestoreRead: 'Healthy' | 'Warning' | 'Failed';
  firestoreWrite: 'Healthy' | 'Warning' | 'Failed';
  gemini: 'Healthy' | 'Warning' | 'Failed';
  overall: 'Healthy' | 'Warning' | 'Failed';
  timestamp: string;
}

export const checkSystemHealth = async (adminKey: string): Promise<SystemHealth> => {
  const health: SystemHealth = {
    auth: 'Failed',
    firestoreRead: 'Failed',
    firestoreWrite: 'Failed',
    gemini: 'Failed',
    overall: 'Failed',
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Auth Check
    health.auth = auth.currentUser ? 'Healthy' : 'Warning';

    // 2. Firestore Read Check
    try {
      await getDoc(doc(db, 'system_config', 'health_check'));
      health.firestoreRead = 'Healthy';
    } catch (e) {
      health.firestoreRead = 'Failed';
    }

    // 3. Firestore Write Check
    try {
      const testRef = doc(db, 'system_config', 'health_check');
      await setDoc(testRef, {
        lastChecked: new Date().toISOString(),
        environment: 'production'
      }, { merge: true });
      health.firestoreWrite = 'Healthy';
    } catch (e) {
      health.firestoreWrite = 'Failed';
    }

    // 4. Gemini Check (via server)
    try {
      const response = await adminFetch('/api/admin/stats', adminKey);
      if (response.ok) {
        const data = await response.json();
        health.gemini = data.geminiStatus === 'Working' ? 'Healthy' : 'Failed';
      } else {
        health.gemini = 'Failed';
      }
    } catch (e) {
      health.gemini = 'Failed';
    }

    // Overall calculation
    const statuses = [health.auth, health.firestoreRead, health.firestoreWrite, health.gemini];
    if (statuses.every(s => s === 'Healthy')) {
      health.overall = 'Healthy';
    } else if (statuses.some(s => s === 'Failed')) {
      health.overall = 'Failed';
    } else {
      health.overall = 'Warning';
    }

  } catch (err) {
    console.error("Health monitor failed critical check", err);
    health.overall = 'Failed';
  }

  return health;
};
