export interface AdminStats {
  firebaseAuthStatus: 'Working' | 'Warning' | 'Failed';
  firestoreStatus: 'Working' | 'Warning' | 'Failed';
  geminiStatus: 'Working' | 'Warning' | 'Failed';
  loggedInUserCount: number;
  totalRegisteredUsers: number;
  totalQuizAttempts: number;
  lastQuizGenerationTime: string | null;
  lastLoginTime: string | null;
  firestoreReadWriteTest: 'Success' | 'Failed';
  appVersion: string;
  environment: string;
}

export interface SystemError {
  id: string;
  message: string;
  stack?: string;
  timestamp: any;
  userId?: string;
  userEmail?: string;
}

export interface HealthCheckResult {
  auth: boolean;
  firestoreRead: boolean;
  firestoreWrite: boolean;
  gemini: boolean;
  timestamp: string;
}
