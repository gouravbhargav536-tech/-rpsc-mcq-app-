import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Activity, ShieldCheck, Database, RefreshCcw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SystemMonitor() {
  const [status, setStatus] = useState({
    gemini: "Not Checked",
    firebase: "Not Checked",
    firestore: "Not Checked",
    error: ""
  });
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setStatus({
      gemini: "Checking...",
      firebase: "Checking...",
      firestore: "Checking...",
      error: ""
    });

    try {
      // 1. Firebase/Firestore Write Test
      // This verifies the client can talk to Firestore and has permissions for system_test
      await addDoc(collection(db, "system_test"), {
        test: true,
        timestamp: serverTimestamp(),
        browser: navigator.userAgent
      });

      setStatus(prev => ({
        ...prev,
        firebase: "✅ Connected",
        firestore: "✅ Write Success"
      }));

      // 2. Gemini API Test (Securely via Server Proxy)
      const response = await fetch("/api/health-check");
      const health = await response.json();

      if (response.ok) {
        setStatus(prev => ({
          ...prev,
          gemini: health.gemini || "✅ API Working"
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          gemini: health.gemini || "❌ API Failed"
        }));
        if (health.error) throw new Error(`Gemini Check: ${health.error}`);
      }
    } catch (err: any) {
      console.error("Diagnostics failed:", err);
      setStatus(prev => ({
        ...prev,
        error: err.message || "An unexpected error occurred during diagnostics."
      }));
      
      // Update individual statuses if they haven't been updated yet
      setStatus(prev => ({
        ...prev,
        firebase: prev.firebase === "Checking..." ? "❌ Failed" : prev.firebase,
        firestore: prev.firestore === "Checking..." ? "❌ Failed" : prev.firestore,
        gemini: prev.gemini === "Checking..." ? "❌ Failed" : prev.gemini,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Diagnostics</h2>
        </div>
      </div>

      <div className="space-y-4">
        <StatusRow 
          label="Gemini AI Engine" 
          value={status.gemini} 
          icon={<ShieldCheck className="w-4 h-4" />}
          loading={status.gemini === "Checking..."}
        />
        <StatusRow 
          label="Firebase Auth" 
          value={status.firebase} 
          icon={<Database className="w-4 h-4" />}
          loading={status.firebase === "Checking..."}
        />
        <StatusRow 
          label="Cloud Firestore" 
          value={status.firestore} 
          icon={<Database className="w-4 h-4" />}
          loading={status.firestore === "Checking..."}
        />

        <AnimatePresence>
          {status.error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mt-4"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {status.error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="w-full mt-8 bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? (
          <RefreshCcw className="w-5 h-5 animate-spin" />
        ) : (
          <RefreshCcw className="w-5 h-5" />
        )}
        Run System Integrity Check
      </button>

      <p className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-widest font-mono">
        Last checked: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}

function StatusRow({ label, value, icon, loading }: { label: string, value: string, icon: React.ReactNode, loading: boolean }) {
  const isOk = value.includes('✅') || value.includes('Connected') || value.includes('Working');
  const isFailed = value.includes('❌') || value.includes('Failed');

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOk ? 'bg-emerald-500/10 text-emerald-500' : isFailed ? 'bg-red-500/10 text-red-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {loading && <RefreshCcw className="w-3 h-3 animate-spin text-indigo-500" />}
        <span className={`text-xs font-bold ${isOk ? 'text-emerald-500' : isFailed ? 'text-red-500' : 'text-slate-400'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
