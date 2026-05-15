import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Play, 
  ChevronRight, 
  Trophy,
  AlertCircle,
  MessageSquare,
  PlayCircle
} from 'lucide-react';
import { getSmartRecommendations, UserStats } from '../services/youtubeService';
import { YTVideo } from '../types';

interface SmartRecommendationsProps {
  stats: UserStats;
  onVideoSelect: (video: YTVideo) => void;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ stats, onVideoSelect }) => {
  const [recommendations, setRecommendations] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const data = await getSmartRecommendations(stats);
        setRecommendations(data);
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [stats]);

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-slate-50 rounded-3xl animate-pulse">
        <div className="h-6 bg-slate-200 w-1/3 mb-4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-display font-black text-white flex items-center gap-3">
              <Sparkles className="text-amber-400" size={24} /> 
              Recommended for You
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Based on your <span className="text-primary">{stats.recentSubject}</span> practice
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-[10px] font-black border backdrop-blur-md ${
              stats.accuracy < 0.5 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
              stats.accuracy < 0.8 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {stats.accuracy < 0.5 ? 'CONCEPT FOCUS' : stats.accuracy < 0.8 ? 'PRACTICE MODE' : 'REVISION MODE'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendations.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              onClick={() => onVideoSelect(video)}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex gap-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="text-white" size={32} />
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-[8px] font-bold text-white rounded">
                      {video.duration}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {stats.accuracy < 0.6 && (video.category === 'lectures' || video.recommendationReason?.includes('weak')) ? (
                      <AlertCircle size={12} className="text-rose-400" />
                    ) : (
                      <Trophy size={12} className="text-amber-400" />
                    )}
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      {video.recommendationReason}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight mb-1.5 line-clamp-2">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] text-slate-500">{video.viewCount}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className="text-[10px] text-slate-500">{video.publishDate}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                      {video.channelTitle}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-primary group-hover:gap-2 transition-all">
                      WATCH NOW <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                 <MessageSquare className="text-indigo-400" size={20} />
              </div>
              <div>
                 <p className="text-xs font-bold text-white">Need more help with {stats.recentSubject}?</p>
                 <p className="text-[10px] text-slate-400 font-medium">Chat with Guruji AI for instant doubt solving.</p>
              </div>
           </div>
           <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-indigo-900/20">
              OPEN GURUJI CHAT
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SmartRecommendations;
