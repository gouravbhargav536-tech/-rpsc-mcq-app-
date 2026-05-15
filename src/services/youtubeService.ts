import { YTVideo, VideoCategory } from '../types';

// Cache key
const YT_CACHE_KEY = 'rpsc_video_cache';

interface CachedData {
  timestamp: number;
  data: YTVideo[];
}

// Mock data generator for fallback or if API key is not provided
const generateMockVideos = (category: VideoCategory): YTVideo[] => {
  const mocks: YTVideo[] = [];
  const titles = {
    lectures: ["Rajasthan Economy Deep Dive", "Ancient History for RAS", "Constitution of India Part 1", "Geography of Rajasthan Stats"],
    shorts: ["Quick Trick: Rivers of Rajasthan", "Capital of Mewar in 30s", "RPSC Form Correction Tip", "MNES Scheme explained"],
    strategy: ["How to crack RAS in 6 months", "Booklist for RPSC 2026", "Time Management for Students", "Avoiding Negative Marking"],
    trending: ["New District Formation Update", "Current Affairs 2026 Live", "Budget 2026 Summary", "RPSC Notification News"]
  };

  const selectedTitles = titles[category] || titles.lectures;

  for (let i = 0; i < selectedTitles.length; i++) {
    mocks.push({
      id: `mock_${category}_${i}`,
      title: selectedTitles[i],
      description: "Full in-depth analysis for RPSC aspirants. Master the concepts with expert guidance.",
      thumbnail: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60`,
      publishDate: new Date().toLocaleDateString(),
      channelTitle: "RPSC Master Gurukul",
      category
    });
  }
  return mocks;
};

export const fetchVideos = async (category: VideoCategory): Promise<YTVideo[]> => {
  // Check local cache first (firebase logic can be added here)
  const cachedStr = localStorage.getItem(`${YT_CACHE_KEY}_${category}`);
  if (cachedStr) {
    const cached: CachedData = JSON.parse(cachedStr);
    const now = Date.now();
    // Cache valid for 6 hours
    if (now - cached.timestamp < 6 * 60 * 60 * 1000) {
      return cached.data;
    }
  }

  // Simulate API delay
  await new Promise(r => setTimeout(r, 1000));
  
  // Real implementation would fetch from YouTube API
  // Using Mock for now to ensure working preview
  const data = generateMockVideos(category);

  // Save to cache
  localStorage.setItem(`${YT_CACHE_KEY}_${category}`, JSON.stringify({
    timestamp: Date.now(),
    data
  }));

  return data;
};

export interface UserStats {
  weakTopics: string[];
  recentSubject: string;
  accuracy: number;
}

export const getSmartRecommendations = async (stats: UserStats): Promise<YTVideo[]> => {
  // Logic: 
  // 1. Weak (<50%): Concept Deep Dive (Longer foundational videos)
  // 2. Average (50%-80%): Practice Tricks & Most Repeated Questions (Medium length)
  // 3. Strong (>80%): Advanced Strategy & Revision Shorts (Quick tips)
  
  const recommendations: YTVideo[] = [];
  await new Promise(r => setTimeout(r, 800));

  const isWeak = stats.accuracy < 0.5;
  const isAverage = stats.accuracy >= 0.5 && stats.accuracy < 0.8;
  const isStrong = stats.accuracy >= 0.8;

  // Level 1: Weak Topics (Concept Clarity)
  if (isWeak || stats.weakTopics.length > 0) {
    const topicsToFix = stats.weakTopics.length > 0 ? stats.weakTopics : [stats.recentSubject];
    topicsToFix.slice(0, 2).forEach((topic, i) => {
      recommendations.push({
        id: `rec_weak_${topic}_${i}`,
        title: `${topic}: Zero to Hero Foundation Class`,
        description: `Complete breakdown of ${topic} concepts. Essential for aspirants struggling with basic concepts.`,
        thumbnail: `https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=500&auto=format&fit=crop&q=60`,
        publishDate: "3 days ago",
        channelTitle: "RPSC Concept Gurukul",
        category: 'lectures',
        viewCount: "45K views",
        recommendationReason: `Master ${topic}: Detected as a weak area`,
        duration: "28:45"
      });
    });
  }

  // Level 2: Practice & Tricks
  if (isAverage) {
    recommendations.push({
      id: `rec_avg_1`,
      title: `Top 50 Most Repeated MCQs: ${stats.recentSubject}`,
      description: `Targeting 2026 Shift: High-yield questions and solving tricks.`,
      thumbnail: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60`,
      publishDate: "5 days ago",
      channelTitle: "Exam Cracker Live",
      category: 'trending',
      viewCount: "120K views",
      recommendationReason: `Practice Boost: Solve high-yield MCQs for ${stats.recentSubject}`,
      duration: "15:20"
    });
  }

  // Level 3: Mastery & Review
  if (isStrong) {
    recommendations.push({
      id: `rec_strong_1`,
      title: `${stats.recentSubject}: 5 Minute Marathon Revision`,
      description: `Revise all critical dates and facts in record time.`,
      thumbnail: `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60`,
      publishDate: "Yesterday",
      channelTitle: "Quick GK Revision",
      category: 'shorts',
      viewCount: "89K views",
      recommendationReason: `Sharp Mastery: Rapid revision for ${stats.recentSubject}`,
      duration: "05:12"
    });
  }

  // Trending / Strategy (Always 1)
  recommendations.push({
    id: `rec_strategy_global`,
    title: "How to Avoid Negative Marking in RPSC exams",
    description: "Crucial exam strategy for RAS and REET aspirants.",
    thumbnail: `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&auto=format&fit=crop&q=60`,
    publishDate: "2 hours ago",
    channelTitle: "Gurukul Strategy Hub",
    category: 'strategy',
    viewCount: "12K views",
    recommendationReason: "Bonus: Improve your overall test-taking strategy",
    duration: "08:10"
  });

  return recommendations;
};
