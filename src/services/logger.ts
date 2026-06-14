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
    const response = await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
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

    if (!response.ok && response.headers.get("content-type")?.includes("application/json")) {
      const errData = await response.json();
      console.error("Server-side logging error:", errData);
    }
  } catch (err) {
    console.error("Failed to log system error to server:", err);
  }
};

export const adminFetch = async (url: string, adminKey: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "x-admin-key": adminKey,
      "Accept": "application/json"
    },
  });

  const contentType = response.headers.get("content-type");
  if (!response.ok && !contentType?.includes("application/json")) {
    throw new Error(`Critical Server Error (${response.status}): The server returned an HTML error page instead of JSON. Check backend routing.`);
  }
  
  return response;
};
