import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  Terminal, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  History,
  Lock,
  Server,
  Zap,
  ChevronRight,
  Database,
  ArrowLeft
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { adminFetch } from '../services/logger';
import { checkSystemHealth, SystemHealth } from '../services/healthMonitor';
import { AdminStats, HealthCheckResult, SystemError } from '../types/admin';

export default function AdminMonitor() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthResults, setHealthResults] = useState<SystemHealth | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const fetchStats = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch('/api/admin/stats', key);
      if (!response.ok) throw new Error('Invalid Admin Key or Server Error');
      const data = await response.json();
      setStats(data);
      setIsAuthenticated(true);
      localStorage.setItem('admin_key', key);
      
      // Fetch questions count
      console.log("DEBUG: Fetching questions count...");
      fetch('/api/debug/count-questions')
        .then(res => {
          console.log("DEBUG: Questions count fetch response status:", res.status);
          return res.json();
        })
        .then(data => {
            console.log("DEBUG: Questions count data:", data);
            setTotalQuestions(data.totalQuestions);
        })
        .catch(err => console.error("DEBUG: Failed to fetch questions count", err));
      
      // Auto-run health check on login
      runHealthCheck(key);
    } catch (err: any) {
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
      fetchStats(savedKey);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(adminKey);
  };

  const runHealthCheck = async (keyOverride?: string) => {
    const key = keyOverride || adminKey;
    if (!key) return;
    
    setCheckingHealth(true);
    try {
      const results = await checkSystemHealth(key);
      setHealthResults(results);
    } catch (err) {
      console.error('Health Check Failed:', err);
    } finally {
      setCheckingHealth(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access Required</h1>
            <p className="text-slate-400 text-center mt-2">Enter your secret monitoring key to proceed</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter Admin Secret Key"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
              </p>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Authenticate"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const StatusBadge = ({ status }: { status: 'Healthy' | 'Working' | 'Warning' | 'Failed' | boolean }) => {
    const isWorking = status === 'Working' || status === 'Healthy' || status === true;
    const isWarning = status === 'Warning';
    
    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isWorking ? 'bg-emerald-500/10 text-emerald-500' : 
        isWarning ? 'bg-amber-500/10 text-amber-500' : 
        'bg-red-500/10 text-red-500'
      }`}>
        {isWorking ? '🟢 Working' : isWarning ? '🟡 Warning' : '🔴 Failed'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">System Monitor</h1>
            <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded uppercase font-mono tracking-widest">v{stats?.appVersion}</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                localStorage.removeItem('admin_key');
                window.location.href = '/';
              }}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Core Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <StatusBadge status="Working" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Total Registered Users</p>
            <h2 className="text-3xl font-bold text-white mt-1">{stats?.totalUsers || 0}</h2>
          </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Database className="w-6 h-6 text-indigo-400" />
              <StatusBadge status="Working" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Total Questions</p>
            <h2 className="text-3xl font-bold text-white mt-1">{totalQuestions !== null ? totalQuestions : '...'}</h2>
            <button 
              onClick={() => {
                fetch('/api/admin/bulk-import-questions', { method: 'POST' })
                  .then(res => res.json())
                  .then(data => alert(data.message))
                  .catch(err => alert("Failed to import: " + err));
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Bulk Import Questions
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Activity className="w-6 h-6 text-purple-400" />
              <StatusBadge status="Working" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Total Quiz Attempts</p>
            <h2 className="text-3xl font-bold text-white mt-1">{stats?.totalQuizzes || 0}</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Zap className="w-6 h-6 text-amber-400" />
              <StatusBadge status={stats?.geminiStatus === 'Working'} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Gemini AI Engine</p>
            <h2 className="text-xl font-bold text-white mt-1">v3.5 Flash Elite</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Server className="w-6 h-6 text-emerald-400" />
              <StatusBadge status="Working" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Environment</p>
            <h2 className="text-xl font-bold text-white mt-1 uppercase tracking-wide">{stats?.environment}</h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Health & Logs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Health Check Section */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-white">System Health Check</h3>
                </div>
                <button 
                  onClick={() => runHealthCheck()}
                  disabled={checkingHealth}
                  className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors active:scale-95 disabled:opacity-50"
                >
                  {checkingHealth ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                  Run Full Diagnostics
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Firebase Auth Connectivity', key: 'auth', status: healthResults?.auth },
                  { label: 'Firestore Read Access', key: 'firestoreRead', status: healthResults?.firestoreRead },
                  { label: 'Firestore Write Integrity', key: 'firestoreWrite', status: healthResults?.firestoreWrite },
                  { label: 'Gemini API Latency Check', key: 'gemini', status: healthResults?.gemini },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-sm font-medium text-slate-300">{item.label}</span>
                    {healthResults ? (
                      <div className="flex items-center gap-2">
                        {item.status === 'Healthy' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600">
                        <History className="w-5 h-5" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">Pending</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {healthResults && (
                <div className="bg-slate-950/50 p-4 border-t border-slate-800 px-6">
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Last Diagnostic Trace: {new Date(healthResults.timestamp).toLocaleString()}</p>
                </div>
              )}
            </section>

            {/* Error Log Section */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <Terminal className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white">System Error Logs</h3>
              </div>
              <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
                {stats?.errors?.length > 0 ? (
                  stats.errors.map((err: any) => (
                    <div key={err.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium line-clamp-2">{err.error || err.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <History className="w-3 h-3" /> {err.timestamp?.seconds ? new Date(err.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                            </span>
                            {err.userEmail && (
                              <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                                USER: {err.userEmail}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 self-center" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-500">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No system errors detected in current cycle</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Infrastructure Details */}
          <div className="space-y-8">
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" /> Infrastructure
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Firestore Instance", value: "Primary (Spark)" },
                  { label: "Deployment Node", value: "asia-southeast1" },
                  { label: "Runtime", value: "Cloud Run" },
                  { label: "Last Heartbeat", value: new Date().toLocaleTimeString() },
                  { label: "Last Gen Time", value: stats?.lastQuizTime ? new Date(stats.lastQuizTime).toLocaleTimeString() : 'N/A' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-xs font-mono text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 text-white shadow-xl shadow-red-900/20">
              <ShieldAlert className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Emergency Protocols</h3>
              <p className="text-red-100 text-sm mb-6 leading-relaxed">System critical actions. Proceed with extreme caution. These actions cannot be undone.</p>
              <div className="space-y-3">
                <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 rounded-xl text-xs font-bold transition-all backdrop-blur-sm">
                  FLUSH SYSTEM CACHE
                </button>
                <button className="w-full bg-slate-950/40 hover:bg-slate-950/60 py-2.5 rounded-xl text-xs font-bold text-red-200 transition-all">
                  RESET ALL ANALYTICS
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
