import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Award,
  Zap,
  Target,
  History
} from 'lucide-react';
import { formatTime } from './SessionTimer';

export interface FirestoreQuizResult {
  id: string;
  subject: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  createdAt: any;
}

interface HistoryPanelProps {
  results: FirestoreQuizResult[];
  loading: boolean;
  onSelect?: (result: FirestoreQuizResult) => void;
}

export default function HistoryPanel({ results, loading, onSelect }: HistoryPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl border border-slate-200" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
        <History className="mx-auto text-slate-300 mb-4" size={48} />
        <h3 className="text-lg font-display font-bold text-slate-600 italic">ईतिहास खाली है! (No History)</h3>
        <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Start your first quiz to track progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, idx) => {
        const date = result.createdAt?.toDate ? result.createdAt.toDate() : new Date();
        const percentage = Math.round((result.score / result.totalQuestions) * 100);
        
        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`group p-4 md:p-5 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-xl transition-all cursor-pointer relative overflow-hidden`}
            onClick={() => onSelect?.(result)}
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`}>
               <Trophy size={100} className="translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              {/* Score Circular Badge */}
              <div className="shrink-0 relative group-hover:scale-110 transition-transform duration-500">
                 <svg className="w-16 h-16 transform -rotate-90 drop-shadow-sm">
                    <circle
                       cx="32"
                       cy="32"
                       r="28"
                       stroke="currentColor"
                       strokeWidth="4"
                       fill="transparent"
                       className="text-slate-100"
                    />
                    <circle
                       cx="32"
                       cy="32"
                       r="28"
                       stroke="currentColor"
                       strokeWidth="4"
                       fill="transparent"
                       strokeDasharray={2 * Math.PI * 28}
                       strokeDashoffset={2 * Math.PI * 28 * (1 - result.score / result.totalQuestions)}
                       className={`${percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                       strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center flex-col leading-none">
                    <span className="text-sm font-bold text-main">{result.score}</span>
                    <div className="w-5 h-px bg-slate-300 my-0.5"></div>
                    <span className="text-[10px] font-bold text-slate-400">{result.totalQuestions}</span>
                 </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                    result.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                    result.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {result.difficulty}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                    <Calendar size={12} className="text-slate-300" /> {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h4 className="text-base md:text-xl font-display font-medium text-main truncate leading-tight group-hover:text-primary transition-colors tracking-tight">
                  {result.subject}
                </h4>
                <div className="flex items-center gap-6 mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-300" /> <span className="opacity-70">{formatTime(result.timeSpent)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Target size={14} className="text-slate-300" /> <span className="opacity-70">{percentage}% accuracy</span>
                   </div>
                </div>
              </div>

              <div className="shrink-0">
                 <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    <ChevronRight size={16} />
                 </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
