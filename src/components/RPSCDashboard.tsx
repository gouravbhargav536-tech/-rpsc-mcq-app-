import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  RotateCw, 
  Calendar, 
  ExternalLink, 
  AlertCircle, 
  FileText, 
  Clock, 
  CheckCircle2,
  CalendarDays,
  Target,
  BadgeAlert
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RPSCNotification {
  id: string;
  title: string;
  date: string;
  category: string;
  isNew: boolean;
  department: string;
  status: string;
}

interface ApiResponse {
  success: boolean;
  lastUpdated: string;
  data: RPSCNotification[];
}

export const RPSCDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<RPSCNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNotifications = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else if (notifications.length === 0) setLoading(true);

    try {
      console.log('Attempting to fetch RPSC notifications...');
      
      // 1. Try local API first (Works in AI Studio / Node environments)
      let response;
      let data: RPSCNotification[] = [];
      let updateTime = new Date();

      try {
        response = await fetch('/api/rpsc');
        if (response.ok) {
          const result: ApiResponse = await response.json();
          if (result.success) {
            data = result.data;
            updateTime = new Date(result.lastUpdated);
          }
        }
      } catch (localErr) {
        console.warn('Local API fetch failed, switching to CORS proxy fallback:', localErr);
      }

      // 2. Fallback to scraping RPSC via CORS Proxy if local API failed or was unreachable (Static host like Netlify)
      if (data.length === 0) {
        console.log('Using AllOrigins CORS proxy to fetch real RPSC data...');
        const targetUrl = 'https://rpsc.rajasthan.gov.in/news_event';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) throw new Error('CORS Proxy failed to respond');
        
        const json = await proxyResponse.json();
        const html = json.contents;

        if (html) {
          // Robust Regex parsing for RPSC notification table pattern
          // Note: RPSC site usually uses a table with specific IDs or classes
          // This is a simplified extraction based on standard gov site patterns
          const extracted: RPSCNotification[] = [];
          
          // Regular expression to find links and text in the news section
          // Looking for patterns like <a href="...">Press Note...</a> ... <span>15/05/2026</span>
          const itemRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>.*?<span[^>]*>(\d{2}\/\d{2}\/\d{4})<\/span>/gis;
          let match;
          let count = 0;
          
          while ((match = itemRegex.exec(html)) !== null && count < 10) {
            const [, link, title, dateParts] = match;
            const cleanTitle = title.replace(/<[^>]*>?/gm, '').trim();
            
            // Format date correctly (DD/MM/YYYY to ISO)
            const [d, m, y] = dateParts.split('/');
            const isoDate = `${y}-${m}-${d}T12:00:00Z`;

            if (cleanTitle && dateParts) {
              extracted.push({
                id: `scraped-${count}`,
                title: cleanTitle,
                date: isoDate,
                category: cleanTitle.toLowerCase().includes('exam') ? 'Exam' : 
                         cleanTitle.toLowerCase().includes('result') ? 'Result' : 'Notice',
                isNew: count < 2, // Assume first 2 are new
                department: "RPSC Official",
                status: cleanTitle.toLowerCase().includes('admit') ? 'Admit Card' : 
                        cleanTitle.toLowerCase().includes('press') ? 'Press Note' : 'Update'
              });
              count++;
            }
          }

          if (extracted.length > 0) {
            data = extracted;
          } else {
            // If scraping fail to find matches (site structure changed), use high-quality fallback data
            throw new Error('Could not parse RPSC site structure');
          }
        }
      }

      if (data.length > 0) {
        setNotifications(data);
        setLastUpdated(updateTime);
        setError(null);
      } else {
        throw new Error('No data could be retrieved from local or remote sources');
      }

    } catch (err) {
      console.error('Final RPSC Fetch Error:', err);
      setError(err instanceof Error ? err.message : 'Unable to bypass CORS or connect to RPSC portal');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [notifications.length]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-sans selection:bg-orange-200">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-wider">Official Updates</span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              RPSC Dashboard
            </h1>
          </div>
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            <Clock size={14} />
            Auto-refreshing every 30s • 
            {lastUpdated && (
              <span className="text-slate-400 italic ml-1">
                Last updated at {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => fetchNotifications(true)}
          disabled={isRefreshing || loading}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all active:scale-95 text-sm font-medium",
            isRefreshing 
              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
              : "bg-white border-orange-100 text-orange-600 hover:border-orange-500 hover:text-orange-700 shadow-sm"
          )}
        >
          <RotateCw size={16} className={cn(isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Checking...' : 'Refresh Portal'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#FDFCF6] border-2 border-orange-50 rounded-[32px] p-2 md:p-6 shadow-xl shadow-orange-900/5 min-h-[500px] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <CalendarDays size={200} />
        </div>

        {loading ? (
          <div className="space-y-4 pt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl animate-pulse flex gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[400px] text-center p-8"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Portal Connectivity Issue</h3>
            <p className="text-slate-500 max-w-sm mb-6">{error}</p>
            <button 
              onClick={() => fetchNotifications(true)}
              className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
            >
              Retry Connection
            </button>
          </motion.div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center opacity-60">
            <BadgeAlert size={48} className="text-slate-300 mb-4" />
            <p className="text-lg text-slate-500">No new notifications found at this moment.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            <AnimatePresence mode="popLayout">
              {notifications.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  className={cn(
                    "group relative bg-white border border-slate-200 p-5 md:p-6 rounded-2xl transition-all hover:border-orange-200 hover:shadow-lg hover:shadow-orange-900/5",
                    item.isNew && "border-l-4 border-l-orange-500 bg-orange-50/10"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      item.isNew ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                    )}>
                      {item.category.includes('Exam') ? <Target size={24} /> : 
                       item.category.includes('Paper') ? <FileText size={24} /> :
                       item.category.includes('Result') ? <CheckCircle2 size={24} /> :
                       <Bell size={24} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={cn(
                          "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded",
                          item.isNew ? "bg-orange-500 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                        )}>
                          {item.isNew ? 'New Update' : item.category}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                        </span>
                        {item.status && (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                {item.status}
                            </span>
                        )}
                      </div>

                      <h3 className="text-base md:text-lg font-semibold text-slate-800 leading-snug group-hover:text-orange-900 transition-colors">
                        {item.title}
                      </h3>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] md:max-w-md">
                          Department: <span className="text-slate-600">{item.department}</span>
                        </p>
                        <a 
                          href="#" 
                          className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors group/link"
                          onClick={(e) => e.preventDefault()}
                        >
                          View Details
                          <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-20 transition-opacity blur-2xl" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer Info */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-slate-400 text-[11px] uppercase tracking-widest font-medium"
      >
        Verified RPSC Portal Stream • © 2026 Rajasthan Public Service commission
      </motion.p>
    </div>
  );
};
