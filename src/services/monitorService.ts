import { LogEntry, SystemStatus } from '../types';

const MAX_LOGS = 100;
let logs: LogEntry[] = [];
let status: SystemStatus = {
  quizEngine: true,
  apiKeyStatus: 'Connected',
  firebaseStatus: false,
  apiLatency: 0,
  firebaseReadSpeed: 0,
  firebaseWriteSpeed: 0,
  flowSteps: [
    { id: 1, label: 'Check Firebase', status: 'PENDING' },
    { id: 2, label: 'Check Cache', status: 'PENDING' },
    { id: 3, label: 'Check AI API', status: 'PENDING' },
    { id: 4, label: 'Generate Quiz', status: 'PENDING' }
  ],
  collectionCounts: {
    questions: 0,
    users: 0,
    subjects: 0,
    currentAffairs: 0,
    dbTotal: 0
  },
  questionAvailability: {
    'Rajasthan GK': 1500,
    'History': 800,
    'Geography': 1200,
    'Current Affairs': 0
  }
};

const listeners: Set<() => void> = new Set();

export const monitorService = {
  addLog: (type: string, message: string, status: 'SUCCESS' | 'ERROR' | 'PENDING' = 'SUCCESS') => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      status
    };
    logs = [entry, ...logs].slice(0, MAX_LOGS);
    listeners.forEach(l => l());
  },
  getLogs: () => logs,
  getStatus: () => status,
  updateStatus: (newStatus: Partial<SystemStatus>) => {
    status = { ...status, ...newStatus };
    listeners.forEach(l => l());
  },
  updateStep: (id: number, stepStatus: Partial<StepStatus>) => {
    const newSteps = status.flowSteps.map(s => s.id === id ? { ...s, ...stepStatus } : s);
    status = { ...status, flowSteps: newSteps };
    listeners.forEach(l => l());
  },
  resetSteps: () => {
    const newSteps = status.flowSteps.map(s => ({ ...s, status: 'PENDING' as const, error: undefined }));
    status = { ...status, flowSteps: newSteps };
    listeners.forEach(l => l());
  },
  subscribe: (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  reportStep: (id: number, action: string, ok: boolean, error?: string) => {
    monitorService.updateStep(id, { 
      status: ok ? 'SUCCESS' : 'ERROR',
      error: error
    });
    monitorService.addLog(`Step ${id}`, `${action}: ${ok ? 'OK' : 'FAILED'}${error ? ' - ' + error : ''}`, ok ? 'SUCCESS' : 'ERROR');
    return ok;
  }
};
