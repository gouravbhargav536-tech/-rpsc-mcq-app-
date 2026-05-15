import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Youtube, 
  Clock, 
  Eye, 
  ChevronRight, 
  Bookmark, 
  X,
  Sparkles,
  TrendingUp,
  BookOpen,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { fetchVideos } from '../services/youtubeService';
import { YTVideo, VideoCategory } from '../types';

interface VideoLibraryProps {
  onClose: () => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('trending');
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<YTVideo | null>(null);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        const fetched = await fetchVideos(activeCategory);
        setVideos(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, [activeCategory]);

  const categories: { id: VideoCategory; label: string; icon: any; color: string }[] = [
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-amber-500' },
    { id: 'shorts', label: 'GK Shorts', icon: Zap, color: 'text-purple-500' },
    { id: 'lectures', label: 'Lectures', icon: BookOpen, color: 'text-indigo-500' },
    { id: 'strategy', label: 'Strategy', icon: Sparkles, color: 'text-emerald-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-white flex flex-col md:inset-4 md:rounded-3xl md:shadow-2xl md:bg-slate-50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 font-display">
              <Youtube className="text-red-600" />
              Gurukul TV
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">RPSC Prep Video Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black border border-red-100 hidden sm:block">LIVE UPDATES</div>
           <button className="p-2 bg-slate-50 rounded-full shadow-sm">
             <Bookmark size={18} className="text-slate-400" />
           </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white px-5 py-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all text-xs font-bold border ${
              activeCategory === cat.id 
                ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
            }`}
          >
            <cat.icon size={14} className={activeCategory === cat.id ? 'text-white' : cat.color} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video Content Area */}
      <div className="flex-1 overflow-y-auto p-5 pb-24 custom-scrollbar">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-slate-200 rounded-2xl mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {videos.length > 0 ? videos.map((video, idx) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedVideo(video)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform">
                      <Play className="text-white fill-white" size={24} />
                    </div>
                  </div>
                  {activeCategory === 'shorts' && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg shadow-lg flex items-center gap-1">
                      <Zap size={10} /> SHORTS
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/20">
                    14:20
                  </div>
                </div>

                <div className="mt-3 px-1">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-bold">
                    <span className="truncate">{video.channelTitle}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>{video.publishDate}</span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Youtube className="text-slate-300" size={32} />
                </div>
                <h3 className="text-slate-800 font-bold">No videos found</h3>
                <p className="text-xs text-slate-400 mt-1">Try another category or check your connection.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Floating Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6"
          >
            <div className="w-full max-w-4xl bg-white sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col h-full sm:h-auto">
               <button 
                 onClick={() => setSelectedVideo(null)}
                 className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white"
               >
                 <X size={20} />
               </button>

               <div className="aspect-video w-full bg-black relative">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.id.startsWith('mock_') ? '5mNQ7m1FhzY' : selectedVideo.id}?autoplay=1&rel=0`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
               </div>

               <div className="p-6 flex-1 overflow-y-auto">
                 <div className="flex items-center gap-2 mb-3">
                   <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-widest">{selectedVideo.category}</span>
                   <span className="text-[10px] text-slate-400 font-bold ml-auto">{selectedVideo.publishDate}</span>
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 leading-tight mb-4">{selectedVideo.title}</h3>
                 
                 <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                       <div>
                          <p className="text-xs font-bold text-slate-800">{selectedVideo.channelTitle}</p>
                          <p className="text-[10px] text-slate-400 font-medium">1.2M Aspirants Subscribed</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.id.startsWith('mock_') ? '5mNQ7m1FhzY' : selectedVideo.id}`, '_blank')}
                        className="p-2 bg-white border border-slate-200 text-red-600 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-[10px] font-black"
                      >
                        <Youtube size={16} /> OPEN IN YT
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-red-200">SUBSCRIBE</button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedVideo.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                       <button className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-700">
                          <Bookmark size={14} /> SAVE FOR LATER
                       </button>
                       <button className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-xl text-[10px] font-black">
                          <ChevronRight size={14} /> VIEW STUDY NOTES
                       </button>
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoLibrary;
