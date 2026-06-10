import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { monitorService } from './monitorService';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();

// Monitor connection
async function testConnection() {
  const start = Date.now();
  try {
    // Attempt to read a small amount of data to test speed/status
    await getDocFromServer(doc(db, 'system', 'health'));
    monitorService.updateStatus({ 
      firebaseStatus: true, 
      firebaseReadSpeed: Date.now() - start 
    });
    monitorService.addLog('Firebase', 'Connected to Firestore', 'SUCCESS');
    
    // Fetch counts for common collections (mocking for now to avoid large reads)
    // In a real app, you'd use count() aggregation for better performance
    monitorService.updateStatus({
      collectionCounts: {
        questions: 1542,
        users: 820,
        subjects: 24,
        currentAffairs: 120,
        dbTotal: 2506
      }
    });

  } catch (error: any) {
    monitorService.updateStatus({ firebaseStatus: false });
    monitorService.addLog('Firebase', `Connection failed: ${error.message}`, 'ERROR');
  }
}

testConnection();

onAuthStateChanged(auth, (user) => {
  if (user) {
    monitorService.addLog('Auth', `User logged in: ${user.email}`, 'SUCCESS');
  } else {
    monitorService.addLog('Auth', 'User logged out', 'SUCCESS');
  }
});
