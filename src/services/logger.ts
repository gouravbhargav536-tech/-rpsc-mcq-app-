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
    const errorPayload = {
      message: message || "Unknown error",
      stack: stack || "",
      userId: auth.currentUser?.uid || "anonymous",
      userEmail: auth.currentUser?.email || "unknown",
      severity,
      source,
      metadata: metadata || {}
    };

    const response = await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(errorPayload),
    });

    if (!response.ok) {
        console.warn("System error logged with non-200 status:", response.status);
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
