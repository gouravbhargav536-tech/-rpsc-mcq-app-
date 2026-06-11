import { auth } from "../firebase";

export const logSystemError = async (message: string, stack?: string) => {
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
