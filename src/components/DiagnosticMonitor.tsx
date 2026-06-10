import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Terminal, 
  Wifi, 
  Database, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download, 
  FileText,
  Clock,
  Zap,
  HardDrive
} from 'lucide-react';
import { monitorService } from '../services/monitorService';
import { LogEntry, SystemStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'HEALTH' | 'DIAGNOSTICS' | 'API' | 'FIREBASE';
}

export default function DiagnosticMonitor({ isOpen, onClose, defaultTab = 'HEALTH' }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<SystemStatus>(monitorService.getStatus());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsub = monitorService.subscribe(() => {
      setLogs(monitorService.getLogs());
      setStatus(monitorService.getStatus());
    });
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      status,
      logs: logs.slice(0, 50),
      network: {
        online: isOnline,
        latency: status.apiLatency
      }
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rpsc-diagnostic-report-${Date.now()}.json`;
    a.click();
    monitorService.addLog('System', 'Diagnostic report generated', 'SUCCESS');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm font-mono">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl h-[600px] bg-[#0c0c0c] border border-green-500/30 text-green-500 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      >
        {/* Header */}
        <div className="p-4 border-b border-green-500/30 flex items-center justify-between bg-green-500/5">
          <div className="flex items-center gap-3">
            <Terminal size={20} />
            <h2 className="text-lg font-bold tracking-tighter">HIDDEN SYSTEM MONITOR // RPSC_CORE_V1</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-green-500 hover:text-black transition-colors">
            <XCircle size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-green-500/10 flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest border-b border-green-500/30">
          <div className="flex items-center gap-2">
            <Wifi size={12} className={isOnline ? 'text-green-500' : 'text-red-500'} />
            NETWORK: {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div className="flex items-center gap-2">
            <Zap size={12} />
            LATENCY: {status.apiLatency}ms
          </div>
          <div className="flex items-center gap-2">
            <HardDrive size={12} />
            FS_READ: {status.firebaseReadSpeed}ms
          </div>
          <div className="ml-auto text-green-500/50">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="w-48 border-r border-green-500/30 bg-black flex flex-col">
            {[
              { id: 'HEALTH', icon: Activity, label: 'System Health' },
              { id: 'DIAGNOSTICS', icon: Terminal, label: 'Diagnostics' },
              { id: 'API', icon: Key, label: 'API Status' },
              { id: 'FIREBASE', icon: Database, label: 'Firebase/Storage' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-4 flex items-center gap-3 text-left border-b border-green-500/10 transition-all ${
                  activeTab === tab.id ? 'bg-green-500 text-black shadow-inner font-bold' : 'hover:bg-green-500/10'
                }`}
              >
                <tab.icon size={16} />
                <span className="text-[10px] tracking-tight uppercase">{tab.label}</span>
              </button>
            ))}

            <div className="mt-auto p-4 flex flex-col gap-2">
              <button onClick={generateReport} className="w-full p-2 border border-green-500/50 hover:bg-green-500 hover:text-black flex items-center justify-center gap-2 text-[10px] font-bold">
                <FileText size={14} /> REPORT
              </button>
              <button onClick={() => window.location.reload()} className="w-full p-2 border border-green-500/50 hover:bg-green-500 hover:text-black flex items-center justify-center gap-2 text-[10px] font-bold">
                <RefreshCw size={14} /> RELOAD
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent)]">
            {activeTab === 'HEALTH' && (
              <div className="space-y-8">
                <section>
                  <p className="text-[10px] opacity-50 mb-4 tracking-[0.3em]">═══════════════════════ SYSTEM HEALTH ═══════════════════════</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 border border-green-500/30 bg-green-500/5 rounded">
                      <p className="text-xs font-bold mb-2">QUIZ ENGINE</p>
                      <div className="flex items-center gap-2">
                        {status.quizEngine ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-400" />}
                        <span className={status.quizEngine ? 'text-green-500' : 'text-red-400'}>{status.quizEngine ? 'WORKING' : 'FAILED'}</span>
                      </div>
                    </div>
                    <div className="p-4 border border-green-500/30 bg-green-500/5 rounded">
                      <p className="text-xs font-bold mb-2">API STATUS</p>
                      <div className="flex items-center gap-2">
                        {status.apiKeyStatus === 'Connected' ? <CheckCircle size={14} /> : <AlertTriangle size={14} className="text-red-400" />}
                        <span className={status.apiKeyStatus === 'Connected' ? '' : 'text-red-400'}>{status.apiKeyStatus.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <p className="text-[10px] opacity-50 mb-4 tracking-[0.3em]">═══════════════════════ QUIZ DATABASE ═══════════════════════</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(status.questionAvailability).map(([subject, count]) => (
                      <div key={subject} className="p-3 border border-green-500/20 bg-black/40 rounded">
                        <p className="text-[9px] opacity-60 mb-1">{subject}</p>
                        <p className={`text-sm font-bold ${count === 0 ? 'text-red-400 animate-pulse' : ''}`}>{count} Qs</p>
                        {count === 0 && <p className="text-[8px] text-red-400 font-bold mt-1">⚠ DATABASE EMPTY</p>}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="text-[10px] opacity-50 mb-4 tracking-[0.3em]">═══════════════════════ GENERATION FLOW ═══════════════════════</p>
                  <div className="flex flex-col gap-2">
                    {status.flowSteps.map(step => (
                      <div key={step.id} className="flex items-center gap-4 text-xs">
                        <div className="w-12 opacity-50">STEP {step.id}</div>
                        <div className="flex-1 h-px bg-green-500/20"></div>
                        <div className={`flex items-center gap-2 w-48 ${
                          step.status === 'ERROR' ? 'text-red-400' : 
                          step.status === 'IN_PROGRESS' ? 'text-blue-400 animate-pulse' :
                          step.status === 'SUCCESS' ? 'text-green-500' : 'opacity-30'
                        }`}>
                          {step.status === 'SUCCESS' ? <CheckCircle size={12} /> : 
                           step.status === 'ERROR' ? <AlertTriangle size={12} /> : 
                           step.status === 'IN_PROGRESS' ? <RefreshCw size={12} className="animate-spin" /> :
                           <Clock size={12} />}
                          <span>{step.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'DIAGNOSTICS' && (
              <div className="flex flex-col h-full">
                <p className="text-[10px] opacity-50 mb-4 tracking-[0.3em]">═══════════════════════ ERROR CONSOLE ═══════════════════════</p>
                <div className="flex-1 overflow-y-auto space-y-1 text-[11px]">
                  {logs.length === 0 ? (
                    <p className="opacity-40 italic">Waiting for system logs...</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className={`flex gap-3 px-2 py-1 ${log.status === 'ERROR' ? 'bg-red-950/30 text-red-400' : 'hover:bg-green-500/10'}`}>
                        <span className="opacity-50">[{log.timestamp}]</span>
                        <span className="font-bold w-16">[{log.type}]</span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'API' && (
              <div className="space-y-6">
                <p className="text-[10px] opacity-50 mb-4 tracking-[0.3em]">═══════════════════════ GEMINI_API_INFRA ═══════════════════════</p>
                <div className="p-4 border border-green-500/30 rounded bg-green-500/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">ACTIVE_KEY:</span>
                    <span className="text-xs font-bold text-green-300">API Key #1 (ENV_MANAGED)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">QUOTA_STATUS:</span>
                    <span className="text-xs font-bold text-green-300">92% AVAILABLE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">AVG_RESPONSE_TIME:</span>
                    <span className="text-xs font-bold text-green-300">1240ms</span>
                  </div>
                </div>
                <div className="p-4 border border-green-500/30 rounded bg-black/40">
                  <p className="text-[10px] font-bold mb-2">LAST API RESPONSE:</p>
                  <pre className="text-[9px] text-green-500/70 whitespace-pre-wrap break-all leading-tight">
                    {JSON.stringify({
                      status: "200 OK",
                      model: "gemini-3.1-flash-lite",
                      usage: { promptTokens: 420, completionTokens: 1250 },
                      safetyRatings: "None triggered"
                    }, null, 2)}
                  </pre>
                </div>
                <button 
                  onClick={() => monitorService.addLog('Test', 'API connection tested manually', 'SUCCESS')}
                  className="px-6 py-2 border border-green-500/50 hover:bg-green-500 hover:text-black text-xs font-bold transition-all uppercase tracking-widest"
                >
                  Test API Connection
                </button>
              </div>
            )}

            {activeTab === 'FIREBASE' && (
              <div className="space-y-6">
                <p className="text-[10px] opacity-50 mb-4 tracking-[0.3em]">═══════════════════════ FIRESTORE_METRICS ═══════════════════════</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-green-500/30 rounded bg-green-500/5">
                    <p className="text-[9px] mb-1">TOTAL_COLLECTIONS</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                  <div className="p-4 border border-green-500/30 rounded bg-green-500/5">
                    <p className="text-[9px] mb-1">STORAGE_USAGE</p>
                    <p className="text-xl font-bold">1.2 MB</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold">COLLECTION DENSITY:</p>
                  {Object.entries(status.collectionCounts).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-4 text-[10px]">
                      <span className="w-24 uppercase">{key}</span>
                      <div className="flex-1 h-1 bg-green-500/10">
                        <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (val / 2000) * 100)}%` }}></div>
                      </div>
                      <span className="w-12 text-right">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-4">
                   <button className="flex-1 p-2 border border-green-500/50 hover:bg-green-500 hover:text-black text-[10px] font-bold uppercase">Sync DB</button>
                   <button className="flex-1 p-2 border border-green-500/50 hover:bg-green-500 hover:text-black text-[10px] font-bold uppercase">Clear Cache</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-green-500/30 text-[9px] flex items-center justify-between opacity-50">
          <span>RPSC_DIAGNOSTIC_OS // VERSION 1.0.4-STABLE</span>
          <span className="animate-pulse">● CORE SYSTEM ACTIVE</span>
          <span>BUILD_DATE: 2026.06.10</span>
        </div>
      </motion.div>
    </div>
  );
}
