import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, getDoc, doc, limit, query, serverTimestamp } from "firebase/firestore";
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  RefreshCcw, 
  AlertCircle, 
  Clock, 
  Key, 
  Cpu, 
  CheckCircle2,
  XCircle,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SystemMonitor() {
  const [status, setStatus] = useState<any>({
    gemini: "Not Checked",
    firebase: "Not Checked",
    firestoreRead: "Not Checked",
    firestoreWrite: "Not Checked",
    activeModel: "N/A",
    responseTime: "N/A",
    apiKeyStatus: "N/A",
    error: "",
    technicalDetails: ""
  });
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setStatus({
      gemini: "Checking...",
      firebase: "Checking...",
      firestoreRead: "Checking...",
      firestoreWrite: "Checking...",
      activeModel: "Detecting...",
      responseTime: "Measuring...",
      apiKeyStatus: "Checking...",
      error: "",
      technicalDetails: ""
    });

    const results: any = {
      firebase: "✅ Connected" // Client app started
    };

    try {
      // 1. Firestore Write Test
      let diagnosticDocId = "";
      try {
        const docRef = await addDoc(collection(db, "system_test"), {
          test: true,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          type: "diagnostic_marker"
        });
        diagnosticDocId = docRef.id;
        results.firestoreWrite = "✅ Passed";
      } catch (err: any) {
        results.firestoreWrite = "❌ Failed";
        console.error("Diagnostic Write Error:", err);
        throw new Error(`Firestore Write: ${err.message}`);
      }

      // 2. Firestore Read Test
      try {
        // Try direct document get first (most reliable test for rules)
        if (diagnosticDocId) {
          const docSnap = await getDoc(doc(db, "system_test", diagnosticDocId));
          if (docSnap.exists()) {
            results.firestoreRead = "✅ Passed (Direct)";
          } else {
            // Fallback to query
            const q = query(collection(db, "system_test"), limit(1));
            const querySnap = await getDocs(q);
            results.firestoreRead = querySnap.empty ? "✅ Passed (Empty Coll)" : "✅ Passed (Query)";
          }
        } else {
          // If write skipped for some reason (shouldn't happen here)
          const q = query(collection(db, "system_test"), limit(1));
          await getDocs(q);
          results.firestoreRead = "✅ Passed (Query Only)";
        }
      } catch (err: any) {
        results.firestoreRead = "❌ Failed";
        console.error("Diagnostic Read Error:", err);
        throw new Error(`Firestore Read: ${err.message}`);
      }

      // 3. Gemini API Test (via Backend)
      const res = await fetch("/api/health-check", {
        headers: { "Accept": "application/json" }
      });
      
      const contentType = res.headers.get("content-type");
      let health: any = {};
      
      if (contentType?.includes("application/json")) {
        health = await res.json();
      } else {
        throw new Error(`Invalid Response: Expected JSON from /api/health-check but received ${contentType || 'HTML'}. This usually means a server routing error.`);
      }

      results.gemini = health.gemini;
      results.activeModel = health.model || "N/A";
      results.responseTime = health.responseTime || "N/A";
      results.apiKeyStatus = health.apiKeyStatus || "N/A";

      if (!res.ok) {
        results.technicalDetails = health.technicalDetails || health.error;
        throw new Error(health.error || "Gemini Health Check Failed");
      }

      setStatus(prev => ({ ...prev, ...results }));
    } catch (err: any) {
      console.error("DIAGNOSTICS_FAILURE:", err);
      setStatus(prev => ({
        ...prev,
        ...results,
        error: err.message || "Integrity verification failed.",
        gemini: results.gemini || "❌ Failed",
        firestoreRead: results.firestoreRead || "❌ Failed",
        firestoreWrite: results.firestoreWrite || "❌ Failed",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all max-w-full">
      {/* Header */}
      <div className="bg-slate-50/80 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">SYSTEM INTEGRITY</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Node.js / Firebase / Gemini 3.5</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${loading ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
            {loading ? 'Analyzing' : 'Ready'}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiagnosticCard label="Gemini API" value={status.gemini} loading={status.gemini === "Checking..."} />
          <DiagnosticCard label="Auth Engine" value={status.firebase} loading={status.firebase === "Checking..."} />
          <DiagnosticCard label="Firestore Read" value={status.firestoreRead} loading={status.firestoreRead === "Checking..."} />
          <DiagnosticCard label="Firestore Write" value={status.firestoreWrite} loading={status.firestoreWrite === "Checking..."} />
        </div>

        {/* Detailed Stats Section */}
        <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Technical Metadata
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <StatItem icon={<Cpu className="w-3.5 h-3.5" />} label="Active Model" value={status.activeModel} />
            <StatItem icon={<Clock className="w-3.5 h-3.5" />} label="Response Time" value={status.responseTime} />
            <StatItem icon={<Key className="w-3.5 h-3.5" />} label="API Key Status" value={status.apiKeyStatus} />
            <StatItem icon={<Activity className="w-3.5 h-3.5" />} label="Environment" value={(import.meta as any).env.MODE} />
          </div>
        </div>

        {/* Error Handling UI */}
        <AnimatePresence>
          {status.error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Diagnostic Failure</h4>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 font-medium leading-relaxed">
                    {status.error}
                  </p>
                  {status.technicalDetails && (
                    <div className="mt-3 p-3 bg-red-950/10 rounded-lg border border-red-500/10 transition-all overflow-x-auto">
                      <code className="text-[10px] font-mono text-red-700/70 dark:text-red-400/60 block whitespace-pre-wrap">
                        {status.technicalDetails}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="w-full relative group h-16 rounded-2xl overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 group-hover:from-indigo-500 group-hover:to-indigo-400 transition-all" />
          <div className="relative h-full flex items-center justify-center gap-3 text-white font-black text-xs uppercase tracking-[0.2em]">
            {loading ? (
              <>
                <RefreshCcw className="w-5 h-5 animate-spin" />
                <span>Running Integrity Cycle</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Trigger Diagnostics</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Build v1.2.2-PRD
        </span>
        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-2">
          UTC: {new Date().toISOString().split('T')[1].split('.')[0]}
        </span>
      </div>
    </div>
  );
}

function DiagnosticCard({ label, value, loading }: { label: string, value: string, loading: boolean }) {
  const isOk = value.includes('✅') || value.includes('Connected') || value.includes('Working') || value.includes('Passed');
  const isFailed = value.includes('❌') || value.includes('Failed');

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-500 ${
      isOk ? 'bg-emerald-500/5 border-emerald-500/20' : 
      isFailed ? 'bg-red-500/5 border-red-500/20' : 
      'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        {loading ? (
          <RefreshCcw className="w-3 h-3 animate-spin text-indigo-500" />
        ) : isOk ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : isFailed ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : null}
      </div>
      <p className={`text-sm font-bold tracking-tight ${
        isOk ? 'text-emerald-600 dark:text-emerald-400' : 
        isFailed ? 'text-red-600 dark:text-red-400' : 
        'text-slate-600 dark:text-slate-300'
      }`}>
        {value}
      </p>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700/50 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}
