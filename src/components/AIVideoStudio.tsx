import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Sparkles, 
  NotebookPen, 
  Clapperboard, 
  ArrowRight, 
  Upload, 
  FileText, 
  Zap, 
  Music, 
  Layout, 
  History,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VideoGenerator } from './VideoGenerator';

type StudioMode = 'DASHBOARD' | 'CREATOR' | 'NOTEBOOK_SYNC' | 'HISTORY';

export const AIVideoStudio: React.FC = () => {
  const [mode, setMode] = useState<StudioMode>('DASHBOARD');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const renderDashboard = () => (
    <div className="space-y-4">
      {/* Hero Banner (Streamlined and Compact) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-5 sm:p-6 text-white border border-indigo-500/10">
        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="px-2 py-0.5 bg-indigo-500/20 backdrop-blur-md rounded-md text-[9px] font-black uppercase tracking-widest text-[#a855f7] border border-indigo-500/20">
              New: Cinematic V3.1
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-lg sm:text-2xl font-black mb-1.5 tracking-tight leading-tight"
          >
            Turn Your Study Material into <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Cinematic Reels</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-purple-100/70 text-xs mb-4 leading-relaxed"
          >
            Connect with Google NotebookLM to extract concepts and generate premium anime-style educational stories automatically.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2.5"
          >
            <button 
              onClick={() => setMode('CREATOR')}
              className="group flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-black text-xs hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95 shadow shadow-purple-950/20"
            >
              <Sparkles size={14} className="text-pink-300 animate-pulse" />
              Create AI Reel
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => setMode('NOTEBOOK_SYNC')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 rounded-lg font-black text-xs hover:bg-white/10 transition-all active:scale-95"
            >
              <NotebookPen size={14} className="text-purple-300" />
              Sync NotebookLM
            </button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]" />
          <div className="absolute top-10 right-10 w-24 h-24 bg-pink-500/20 rounded-full blur-[50px]" />
        </div>
      </div>

      {/* Grid of tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: Clapperboard, title: 'MCQ to Story', desc: 'Turn complex questions into animated explanations.', color: 'from-orange-500 to-red-500' },
          { icon: Zap, title: 'Current Affairs News', desc: 'Daily news reels with AI voiceover and news-style graphics.', color: 'from-blue-500 to-indigo-500' },
          { icon: Layout, title: 'Smart Templates', desc: 'Choose from 20+ cinematic anime storytelling styles.', color: 'from-purple-500 to-pink-500' }
        ].map((tool, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="p-4 rounded-xl bg-white border border-slate-150 shadow-sm hover:border-purple-300 transition-all cursor-pointer group"
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-2.5 group-hover:scale-105 transition-transform shadow`}>
              <tool.icon size={16} />
            </div>
            <h3 className="text-xs font-black text-slate-800 mb-1">{tool.title}</h3>
            <p className="text-slate-500 text-[10px] leading-relaxed">{tool.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent generations section */}
      <div>
        <div className="flex items-center justify-between mb-3 mt-1">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
            <History size={16} className="text-slate-400" />
            Recent Creations
          </h3>
          <button onClick={() => setMode('HISTORY')} className="text-indigo-600 font-extrabold text-[10px] uppercase tracking-wider hover:underline">View All Library</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2].map((_, i) => (
            <div key={i} className="aspect-[9/16] max-h-[170px] rounded-xl overflow-hidden relative group cursor-pointer bg-slate-200">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all z-20">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-900 shadow">
                  <Play fill="currentColor" size={14} className="ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 z-20">
                <p className="text-white text-[9px] font-black line-clamp-2 leading-tight">RAS 2026: Economics Explained</p>
                <p className="text-white/60 text-[7.5px] mt-0.5 uppercase tracking-wide">Anime • 15s</p>
              </div>
              <img 
                src={`https://picsum.photos/seed/reel-${i}/300/500`} 
                alt="Reel thumbnail" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
          <div className="aspect-[9/16] max-h-[170px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-indigo-300 hover:text-indigo-400 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Sparkles size={16} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-wider">Start New</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotebookSync = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-8 md:p-12">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-indigo-100 shadow-xl">
            <NotebookPen size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Sync Your NotebookLM Library</h2>
          <p className="text-slate-500 max-w-lg">
            Connect your research, PDFs, and notes to our AI Brain. We extract the core concepts and turn them into cinematic storyboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <Upload className="text-indigo-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Upload PDFs/Notes</h4>
            <p className="text-sm text-slate-500">Drop your study material here for deep AI analysis.</p>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <FileText className="text-indigo-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Paste Content</h4>
            <p className="text-sm text-slate-500">Paste your raw text, MCQs, or explanations.</p>
          </div>
        </div>

        <div className="bg-indigo-900 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-2">Google NotebookLM Integration</h4>
            <p className="text-indigo-100/70 text-sm mb-4">Automatically fetching your latest source notes...</p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-indigo-700 border-2 border-indigo-900 flex items-center justify-center text-[10px] font-bold">
                    PDF {i}
                  </div>
                ))}
              </div>
              <span className="text-xs text-indigo-300">+ 12 more sources</span>
            </div>
          </div>
          <button className="md:ml-auto px-8 py-3 bg-white text-indigo-900 rounded-full font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap shadow-xl">
            Start Sync
          </button>
          
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
      </div>
      
      <button 
        onClick={() => setMode('DASHBOARD')}
        className="mt-8 mx-auto flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
      >
        <RotateCcw size={16} /> Back to Dashboard
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] py-4 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Navigation (Compact and Dense) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-950 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Video size={18} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">AI Story Engine</h1>
              <p className="text-slate-400 font-bold text-[9px] flex items-center gap-1 mt-0.5 leading-none">
                <Sparkles size={10} className="text-purple-500" />
                V3.1 Cinematic Engine Active
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-0.5 bg-white p-1 rounded-xl border border-slate-200/80 shadow-sm overflow-x-auto no-scrollbar">
            {[
              { id: 'DASHBOARD', label: 'Studio', icon: Clapperboard },
              { id: 'CREATOR', label: 'Create', icon: Sparkles },
              { id: 'NOTEBOOK_SYNC', label: 'NotebookLM', icon: NotebookPen },
              { id: 'HISTORY', label: 'Library', icon: History }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setMode(nav.id as StudioMode)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${
                  mode === nav.id 
                    ? 'bg-indigo-900 text-white shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <nav.icon size={13} />
                {nav.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          {mode === 'DASHBOARD' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderDashboard()}
            </motion.div>
          )}

          {mode === 'CREATOR' && (
            <motion.div
              key="creator"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <VideoGenerator onBack={() => setMode('DASHBOARD')} />
            </motion.div>
          )}

          {mode === 'NOTEBOOK_SYNC' && renderNotebookSync()}
          
          {(mode === 'HISTORY') && (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <History size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Video Library Empty</h3>
              <p className="text-slate-500 mb-8">Start creating videos to populate your learning library.</p>
              <button onClick={() => setMode('CREATOR')} className="px-8 py-3 bg-indigo-900 text-white rounded-full font-bold">New Creation</button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
