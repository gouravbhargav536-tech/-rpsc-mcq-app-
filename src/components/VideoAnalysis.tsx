import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Clock, 
  Zap, 
  Play, 
  ArrowLeft,
  X,
  Youtube,
  Lightbulb,
  Target
} from 'lucide-react';
import { analyzeVideoContent } from '../services/geminiService';
import { YTVideo, VideoAnalysis as VideoAnalysisType } from '../types';

interface VideoAnalysisProps {
  video: YTVideo;
  onClose: () => void;
  onSeek: (seconds: number) => void;
}

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ video, onClose, onSeek }) => {
  const [analysis, setAnalysis] = useState<VideoAnalysisType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'QUIZ' | 'REVIEW'>('CONTENT');
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
  const [showQuizResult, setShowQuizResult] = useState(false);

  useEffect(() => {
    const getAnalysis = async () => {
      setLoading(true);
      try {
        const data = await analyzeVideoContent(video);
        setAnalysis(data);
      } catch (err) {
        console.error("Analysis failed", err);
      } finally {
        setLoading(false);
      }
    };
    getAnalysis();
  }, [video]);

  const handleQuizSelect = (qIdx: number, oIdx: number) => {
    if (showQuizResult) return;
    const newAnswers = [...quizAnswers];
    newAnswers[qIdx] = oIdx;
    setQuizAnswers(newAnswers);
  };

  const calculateQuizScore = () => {
    if (!analysis) return 0;
    return quizAnswers.reduce((score, ans, idx) => {
      return score + (ans === analysis.miniQuiz[idx].correctIndex ? 1 : 0);
    }, 0);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Video Sticky Header */}
      <div className="bg-black relative aspect-video shrink-0 shadow-lg">
        <iframe
          id="player-iframe"
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${video.id.startsWith('mock_') ? '5mNQ7m1FhzY' : video.id}?autoplay=1&enablejsapi=1`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Analysis UI */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"
            />
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">AI Analyst is scanning video...</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Generating key topics and practice materials</p>
          </div>
        ) : analysis ? (
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
              {(['CONTENT', 'QUIZ', 'REVIEW'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'CONTENT' && <span className="flex items-center gap-2"><Brain size={14} /> Key Concepts</span>}
                  {tab === 'QUIZ' && <span className="flex items-center gap-2"><HelpCircle size={14} /> Video Quiz</span>}
                  {tab === 'REVIEW' && <span className="flex items-center gap-2"><Target size={14} /> Smart Review</span>}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'CONTENT' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-8">
                    <h3 className="text-lg font-display font-black text-slate-800 italic mb-3 flex items-center gap-2">
                       <Lightbulb className="text-amber-500" size={20} /> Deep Insights
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {analysis.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Educational Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyTopics.map((topic, i) => (
                        <div key={i} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black border border-indigo-100/50 flex items-center gap-2">
                          <CheckCircle2 size={12} /> {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'QUIZ' && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                   {analysis.miniQuiz.map((q, qIdx) => (
                      <div key={qIdx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                         <p className="text-sm font-bold text-slate-800 mb-4">{qIdx + 1}. {q.question}</p>
                         <div className="grid grid-cols-1 gap-3">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = quizAnswers[qIdx] === oIdx;
                              const isCorrect = oIdx === q.correctIndex;
                              let btnClass = "bg-white text-slate-600 border-slate-200";
                              
                              if (showQuizResult) {
                                if (isCorrect) btnClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
                                else if (isSelected) btnClass = "bg-rose-50 text-rose-600 border-rose-200";
                              } else if (isSelected) {
                                btnClass = "bg-indigo-600 text-white border-indigo-600";
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleQuizSelect(qIdx, oIdx)}
                                  className={`p-4 rounded-2xl border text-[11px] font-bold text-left transition-all ${btnClass}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                         </div>
                         {showQuizResult && (
                           <motion.p 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             className="mt-4 text-[10px] text-slate-500 font-medium italic"
                           >
                             <span className="font-black text-indigo-600">Note:</span> {q.explanation}
                           </motion.p>
                         )}
                      </div>
                   ))}
                   
                   {!showQuizResult ? (
                     <button
                        onClick={() => setShowQuizResult(true)}
                        disabled={quizAnswers.includes(null)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest disabled:opacity-30 transition-all shadow-xl"
                     >
                        Check Answers
                     </button>
                   ) : (
                     <div className="p-6 bg-indigo-600 rounded-3xl text-center shadow-xl shadow-indigo-200">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Video Score</p>
                        <p className="text-3xl font-black text-white">{calculateQuizScore()} / {analysis.miniQuiz.length}</p>
                        <p className="text-[11px] text-white/80 font-medium mt-2">
                           {calculateQuizScore() === analysis.miniQuiz.length 
                             ? "Perfect! You've mastered this video." 
                             : "Good try! Consider reviewing the suggested segments."}
                        </p>
                     </div>
                   )}
                </motion.div>
              )}

              {activeTab === 'REVIEW' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-6">AI Identified High-Impact Concepts</p>
                  
                  {analysis.reviewSegments.map((seg, i) => (
                    <button
                      key={i}
                      onClick={() => onSeek(seg.seconds)}
                      className="w-full group flex items-start gap-4 p-5 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-3xl text-left transition-all hover:scale-[1.01]"
                    >
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                          <Play className="text-amber-600 fill-amber-600" size={20} />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">{seg.title}</span>
                             <span className="text-[10px] font-mono font-bold text-amber-400">{seg.timestamp}</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight mb-1 group-hover:text-amber-900 transition-colors">
                             {seg.reason}
                          </p>
                          <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                             TAP TO REWATCH <ChevronRight size={10} />
                          </p>
                       </div>
                    </button>
                  ))}

                  <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 bg-white/10 rounded-lg">
                            <Zap className="text-amber-400" size={20} />
                         </div>
                         <p className="text-xs font-black uppercase tracking-widest">Mastery Tip</p>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                         Rewatching key concepts significantly improves your long-term retention. Try to repeat the mini-quiz after reviewing these segments.
                      </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-slate-400 italic">Could not analyze video content at this time.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400">YT</div>
            <div className="min-w-0">
               <p className="text-[10px] font-black text-slate-800 truncate">{video.channelTitle}</p>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Verified Content</p>
            </div>
         </div>
         <button 
           onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
           className="px-4 py-2 bg-red-600 text-white text-[9px] font-black rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
         >
           <Youtube size={12} /> OPEN YOUTUBE
         </button>
      </div>
    </div>
  );
};

export default VideoAnalysis;
