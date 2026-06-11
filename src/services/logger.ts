import { auth } from "../firebase";

export interface LogEntry {
  message: string;
  stack?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  source?: string;
  metadata?: any;
}

export const logSystemError = async (message: string, stack?: string, severity: 'info' | 'warning' | 'error' | 'critical' = 'error', source: string = 'frontend', metadata: any = {}) => {
  try {
    await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        stack,
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        severity,
        source,
        metadata
      }),
    });
  } catch (err) {
    console.error("Failed to log system error to server:", err);
  }
};

export const adminFetch = async (url: string, adminKey: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "x-admin-key": adminKey,
    },
  });
};
