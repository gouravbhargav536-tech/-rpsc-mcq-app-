/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PersonalizationPanel from './components/PersonalizationPanel';
import { useAppTheme } from './context/ThemeContext';
import { 
  BookOpen, 
  ChevronRight, 
  Timer, 
  RotateCcw, 
  Flag,
  CheckCircle2, 
  XCircle, 
  Award, 
  BrainCircuit,
  ArrowLeft,
  Loader2,
  History,
  Calculator,
  FlaskConical,
  Languages,
  Zap,
  Activity,
  LayoutGrid,
  Info,
  ShieldCheck,
  ChevronLeft,
  LogOut,
  Palette,
  Castle,
  Sun,
  Trophy,
  Star,
  Map as MapIcon,
  Compass,
  User as UserIcon,
  Menu,
  Play,
  Youtube,
  Clock,
  Target,
  Video,
  ArrowRight,
  Sparkles,
  X,
  FileText,
  Bell,
  Crown,
  Home,
  Lock,
  GraduationCap,
  Bookmark,
  Tv,
  AlertCircle
} from 'lucide-react';

const formatQuestionText = (text: string) => {
  if (!text) return "";
  // Add space after common punctuation (Hindi and English) if missing
  return text.replace(/([।.,:;?!])([^\s])/g, '$1 $2');
};

const HighlightedText = ({ text }: { text: string }) => {
  if (!text) return null;

  // Cleanup punctuation spacing
  const cleanedText = text.replace(/([।.,:;?!])([^\s0-9])/g, '$1 $2');

  // Let's replace statement starts with newlines to ensure they split into separate rows/blocks
  // Look for spaces followed by "1. ", "(A) ", "(1) ", "कथन 1: " etc.
  let preProcessed = cleanedText;
  const splitRegex = /(\s+)(?=(?:\d+\.[ \u00a0]\D|\((?:\d+|[A-D|I|V|X|a-d])\)[ \u00a0]|Statement\s+\d+:|कथन\s*(?:\d+|[I|V|X]+|A|B|C|D)[:\- ]|Assertion\s*\(?[A-Z]\)?[:\-]|Reason\s*\(?[A-Z]\)?[:\-]|कथन\s*\(?[A-Z]\)?[:\-]|कारण\s*\(?[A-Z]\)?[:\-]))/g;
  preProcessed = preProcessed.replace(splitRegex, '\n');

  // Splitting by newlines to form clean paragraphs/blocks
  const rawLines = preProcessed.split(/\n+/);
  const blocks: { type: 'assertion' | 'statement' | 'paragraph'; marker?: string; text: string }[] = [];

  rawLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Detect Assertion / Reason format (e.g. "Assertion (A): ", "कथन (A): ")
    const assertionRegex = /^((?:Assertion\s*\(?[A-Z]\)?|Reason\s*\(?[A-Z]\)?|कथन\s*\(?[A-Z]\)?|कारण\s*\(?[A-Z]\)?|कथन\s*[I|V|X]+|कथन\s*\d+)):/i;
    // Detect Numbered statement format (e.g. "1. ", "(A) ", "Statement 1: ", etc.)
    const numberedRegex = /^((?:\d+\.|(?:\((?:[A-De-z0-9]|[a-d]|i+)\))|Statement\s+\d+:|कथन\s+I+|कथन\s+\d+[:\-]?))\s+/i;

    let match = trimmed.match(assertionRegex);
    if (match) {
      const marker = match[1];
      const remainder = trimmed.substring(match[0].length).trim();
      blocks.push({
        type: 'assertion',
        marker,
        text: remainder
      });
      return;
    }

    match = trimmed.match(numberedRegex);
    if (match) {
      const marker = match[1];
      const remainder = trimmed.substring(match[0].length).trim();
      blocks.push({
        type: 'statement',
        marker,
        text: remainder
      });
      return;
    }

    blocks.push({
      type: 'paragraph',
      text: trimmed
    });
  });

  return (
    <div 
      className="space-y-2 text-left"
      style={{ fontFamily: "'Poppins', 'Noto Sans Devanagari', 'Inter', sans-serif" }}
    >
      {blocks.map((block, i) => {
        if (block.type === 'assertion') {
          return (
            <div key={i} className="flex gap-2 items-start pl-1 mt-2 mb-2 leading-[1.65] text-[#111827]">
              <span className="font-extrabold text-[#111827] shrink-0 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] sm:text-[12px] select-none uppercase tracking-wide leading-none h-fit pt-1 pb-1">
                {block.marker}
              </span>
              <span className="flex-1 text-[#111827] text-[17px] font-semibold leading-[1.65] tracking-[0.2px] break-words whitespace-normal">
                {block.text}
              </span>
            </div>
          );
        }

        if (block.type === 'statement') {
          return (
            <div key={i} className="flex gap-2 items-start pl-1 mt-2.5 mb-2.5 leading-[1.65] text-[#111827]">
              <span className="font-bold text-[#111827] shrink-0 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] sm:text-[12px] tabular-nums select-none tracking-tight">
                {block.marker}
              </span>
              <span className="flex-1 text-[#111827] text-[17px] font-semibold leading-[1.65] tracking-[0.2px] break-words whitespace-normal font-sans">
                {block.text}
              </span>
            </div>
          );
        }

        return (
          <p 
            key={i} 
            className="text-[#111827] text-[17px] font-semibold leading-[1.65] tracking-[0.2px] break-words whitespace-normal my-2"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
};

import { RPSCDashboard } from './components/RPSCDashboard';
import { AIVideoStudio } from './components/AIVideoStudio';
import { generateQuizQuestions, fetchRPSCNotifications } from './services/geminiService';
import { Question, QuizConfig, Subject, Difficulty, Language, ThemeType, User, ExamPattern, QuizMode, YTVideo } from './types';
import { mockAuth } from './services/authService';
import IntroScreen from './components/IntroScreen';
import AuthScreen from './components/AuthScreen';
import RiverMap from './components/RiverMap';
import RajasthanMap from './components/RajasthanMap';
import VideoLibrary from './components/VideoLibrary';
import SmartRecommendations from './components/SmartRecommendations';
import VideoAnalysis from './components/VideoAnalysis';
import { useFeedback } from './hooks/useFeedback';
import { UserStats } from './services/youtubeService';

export default function App() {
  const [screen, setScreen] = useState<'LANDING' | 'INTRO' | 'AUTH' | 'HOME' | 'SETUP' | 'RULES' | 'QUIZ' | 'RESULTS' | 'VIDEO_STUDIO'>('LANDING');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { currentTheme, setTheme, recommendedThemeId, availableThemes } = useAppTheme();
  const theme = currentTheme.id.includes('rajasthan') ? 'rajasthan' : 'geometric';

  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [hasSavedQuiz, setHasSavedQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  
  // Selection state
  const [config, setConfig] = useState<QuizConfig>({
    subject: 'Rajasthan GK',
    difficulty: 'Medium',
    language: 'English',
    questionCount: 15,
    pattern: '2021-Present',
    mode: 'instant',
    topic: ''
  });

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [quizTimer, setQuizTimer] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionExpanded, setQuestionExpanded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gamification state
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [dailyDone, setDailyDone] = useState(false);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isRajasthanMapOpen, setIsRajasthanMapOpen] = useState(false);
  const [isVideoLibraryOpen, setIsVideoLibraryOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<YTVideo | null>(null);
  const [reportedQuestions, setReportedQuestions] = useState<number[]>([]);
  const [currentTab, setCurrentTab] = useState<'tests' | 'gurukul' | 'profile'>('tests');
  const [activeTab, setActiveTab] = useState<'home' | 'practice' | 'mock' | 'bookmarks' | 'profile'>('home');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customGoalQuestions, setCustomGoalQuestions] = useState(12);
  const [systime, setSystime] = useState(new Date());
  const [showQuickConfigModal, setShowQuickConfigModal] = useState(false);
  const [quickConfigData, setQuickConfigData] = useState<{
    name: string;
    subject: Subject;
    topic: string;
    difficulty: Difficulty;
    pattern: ExamPattern;
    mode: QuizMode;
  } | null>(null);

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setSystime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    setQuestionExpanded(false);
  }, [currentIndex]);

  const { feedback } = useFeedback();

  // Check for saved quiz on mount
  useEffect(() => {
    const saved = localStorage.getItem('rpsc_current_quiz');
    if (saved) setHasSavedQuiz(true);
  }, [screen]);

  // Persist user and progress
  useEffect(() => {
    const savedUser = localStorage.getItem('rpsc_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setScreen('HOME');
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rpsc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rpsc_user');
      localStorage.removeItem('rpsc_current_quiz');
    }
  }, [user]);

  // Save quiz progress
  useEffect(() => {
    if (screen === 'QUIZ' && questions.length > 0) {
      const progress = {
        config,
        questions,
        userAnswers,
        currentIndex,
        quizTimer,
        isAnswered,
        isReviewMode,
        isDailyChallenge
      };
      localStorage.setItem('rpsc_current_quiz', JSON.stringify(progress));
    } else if (screen === 'RESULTS') {
      localStorage.removeItem('rpsc_current_quiz');
    }
  }, [screen, userAnswers, currentIndex, quizTimer, isAnswered]);

  // Restore progress
  const restoreQuiz = () => {
    const saved = localStorage.getItem('rpsc_current_quiz');
    if (saved) {
      const data = JSON.parse(saved);
      setConfig(data.config);
      setQuestions(data.questions);
      setUserAnswers(data.userAnswers);
      setCurrentIndex(data.currentIndex);
      setQuizTimer(data.quizTimer);
      setIsAnswered(data.isAnswered);
      setIsReviewMode(data.isReviewMode);
      setIsDailyChallenge(data.isDailyChallenge);
      setScreen('QUIZ');
      feedback('success');
    }
  };

  useEffect(() => {
    const savedUser = mockAuth.getCurrentUser();
    if (savedUser) setUser(savedUser);

    if (screen === 'LANDING') {
      const timer = setTimeout(() => {
        setScreen(savedUser ? 'HOME' : 'INTRO');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleLogout = () => {
    feedback('click');
    mockAuth.logout();
    setUser(null);
    setScreen('INTRO');
  };

  const toggleTheme = () => {
    feedback('click');
    setPersonalizationOpen(true);
  };

  const [isRoyalTransition, setIsRoyalTransition] = useState(false);

  useEffect(() => {
    if (screen === 'QUIZ' && !loading) {
      timerRef.current = setInterval(() => {
        setQuizTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, loading]);

  const startSetup = (subject: Subject) => {
    feedback('click');
    setConfig(prev => ({ 
      ...prev, 
      subject,
      pattern: subject === 'Daily Live Quiz' ? '2021-Present' : prev.pattern,
      mode: 'instant'
    }));
    setIsReviewMode(false);
    setIsDailyChallenge(false);
    setScreen('SETUP');
  };

  const startMistakeReview = () => {
    if (mistakes.length === 0) return;
    setQuestions(mistakes);
    setUserAnswers(new Array(mistakes.length).fill(null));
    setCurrentIndex(0);
    setIsReviewMode(true);
    setIsDailyChallenge(false);
    setScreen('QUIZ');
  };

  useEffect(() => {
    const savedStats = localStorage.getItem('rpsc-gamification');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setStreak(stats.streak || 0);
      setXp(stats.xp || 0);
      setBadges(stats.badges || []);
      
      const today = new Date().toDateString();
      if (stats.lastDailyDate === today) {
        setDailyDone(true);
      }
    }
  }, []);

  const updateGamification = (newScore: number, total: number) => {
    const statsStr = localStorage.getItem('rpsc-gamification');
    let stats = statsStr ? JSON.parse(statsStr) : { streak: 0, xp: 0, badges: [], lastDailyDate: '', quizCount: 0 };
    
    // Update Streak
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (stats.lastQuizDate === yesterday.toDateString()) {
      stats.streak += 1;
    } else if (stats.lastQuizDate !== today) {
      stats.streak = 1;
    }
    stats.lastQuizDate = today;

    // Daily Challenge update
    if (isDailyChallenge && newScore >= 8) {
      stats.lastDailyDate = today;
      stats.xp = (stats.xp || 0) + 50; // Add 50 XP
      setDailyDone(true);
      if (!stats.badges.includes('Daily Warrior')) stats.badges.push('Daily Warrior');
      feedback('royal');
    }

    // Base XP Reward
    stats.xp = (stats.xp || 0) + (newScore * 5);

    // Badge logic
    stats.quizCount = (stats.quizCount || 0) + 1;
    if (stats.quizCount >= 10 && !stats.badges.includes('Exam Ninja')) stats.badges.push('Exam Ninja');
    if (newScore === total && total >= 10 && !stats.badges.includes('Perfectionist')) stats.badges.push('Perfectionist');
    if (newScore === total && !isDailyChallenge && !stats.badges.includes('Topic Master')) stats.badges.push('Topic Master');
    if (streak >= 7 && !stats.badges.includes('Consistency King')) stats.badges.push('Consistency King');

    localStorage.setItem('rpsc-gamification', JSON.stringify(stats));
    setStreak(stats.streak);
    setXp(stats.xp);
    setBadges(stats.badges);
  };

  useEffect(() => {
    if (screen === 'RESULTS') {
      updateGamification(getScore(), questions.length);
    }
  }, [screen]);

  const startDailyChallenge = () => {
    if (dailyDone) return;
    setConfig({
      subject: 'Daily Live Quiz',
      difficulty: 'Hard',
      language: 'Bilingual',
      questionCount: 10,
      pattern: '2021-Present',
      mode: 'daily',
      topic: 'Mixed Competitive Exam Topics'
    });
    setIsDailyChallenge(true);
    handleStartQuiz();
  };

  const reportQuestion = () => {
    feedback('click');
    if (!reportedQuestions.includes(currentIndex)) {
      setReportedQuestions(prev => [...prev, currentIndex]);
    }
  };

  const handleStartQuiz = () => {
    feedback('click');
    setScreen('RULES');
  };

  const confirmStartQuiz = async () => {
    feedback('click');
    setLoading(true);
    setQuizError(null);
    try {
      const generatedQuestions = await generateQuizQuestions(config);
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("No questions retrieved");
      }
      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));
      setCurrentIndex(0);
      setQuizTimer(0);
      setIsAnswered(false);
      setScreen('QUIZ');
    } catch (error: any) {
      console.error("AI Studio Error Details:", error);
      setQuizError("Unable to generate quiz. Please try again.");
      setScreen('SETUP');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered && config.mode === 'instant') return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);
    setIsAnswered(true);
    
    if (config.mode === 'instant') {
      if (answer === questions[currentIndex].correctAnswer) {
        feedback('correct');
        setConsecutiveCorrect(prev => prev + 1);
      } else {
        feedback('wrong');
        setConsecutiveCorrect(0);
        setMistakes(prev => {
          if (prev.find(m => m.id === questions[currentIndex].id)) return prev;
          return [...prev, questions[currentIndex]];
        });
      }
    } else {
      feedback('click');
    }
  };

  const nextQuestion = () => {
    feedback('click');
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsAnswered(userAnswers[nextIdx] !== null && userAnswers[nextIdx] !== 'SKIPPED');
    } else {
      feedback('success');
      setScreen('RESULTS');
    }
  };

  const skipQuestion = () => {
    feedback('click');
    setUserAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = 'SKIPPED';
      return next;
    });
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsAnswered(userAnswers[nextIdx] !== null && userAnswers[nextIdx] !== 'SKIPPED');
    } else {
      feedback('success');
      setScreen('RESULTS');
    }
  };

  const prevQuestion = () => {
    feedback('click');
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIsAnswered(userAnswers[prevIdx] !== null && userAnswers[prevIdx] !== 'SKIPPED');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = () => {
    return userAnswers.reduce((acc, ans, idx) => {
      return ans === questions[idx]?.correctAnswer ? acc + 1 : acc;
    }, 0);
  };

  const getSkippedCount = () => {
    return userAnswers.filter(ans => ans === 'SKIPPED').length;
  };

  const getIncorrectCount = () => {
    return userAnswers.filter((ans, idx) => ans !== 'SKIPPED' && ans !== null && ans !== questions[idx]?.correctAnswer).length;
  };

  const examCards = [
    { id: 'daily-quiz', name: 'Daily Quiz', sub: 'Daily Live Quiz', desc: '10 MCQ Rapid fire current news', icon: Sun, actionType: 'daily' },
    { id: 'constable-test', name: 'Constable Test', sub: 'Rajasthan GK', desc: 'Police Constable special exam', icon: ShieldCheck, actionType: 'constable' },
    { id: 'ras-mock', name: 'RAS Mock Test', sub: 'Indian GK', desc: 'PCS Administrative Prelims GS', icon: Award, actionType: 'ras' },
    { id: 'rajasthan-gk', name: 'Rajasthan GK', sub: 'Rajasthan GK', desc: 'Culture, Geography & history MCQ', icon: History, actionType: 'rajasthan-gk' },
    { id: 'current-affairs', name: 'Current Affairs', sub: 'Rajasthan Current Affairs', desc: 'State and National updates 2026', icon: Zap, actionType: 'current-affairs' },
    { id: 'reasoning-test', name: 'Reasoning Test', sub: 'Reasoning', desc: 'Mental Ability & Analytical puzzles', icon: BrainCircuit, actionType: 'reasoning' },
    { id: 'english-quiz', name: 'English Quiz', sub: 'English', desc: 'RPSC Grammar rules & vocab drills', icon: Languages, actionType: 'english' },
    { id: 'hindi-quiz', name: 'Hindi Quiz', sub: 'Hindi', desc: 'Hindi Vyakaran complete coverage', icon: BookOpen, actionType: 'hindi' },
    { id: 'ai-pattern', name: 'AI Pattern Test', sub: 'Daily Live Quiz', desc: 'Syllabus weightage projection tool', icon: Sparkles, actionType: 'ai-pattern' },
    { id: 'pyp', name: 'Previous Papers', sub: 'Indian GK', desc: '2012-2020 authentic past tests', icon: FileText, actionType: 'pyp' },
  ];

  const subjects: { name: Subject; icon: any; color: string; desc: string }[] = [
    { name: 'Daily Live Quiz', icon: Activity, color: 'bg-indigo-600', desc: 'Real-time News: BBC, Google, Utkarsh' },
    { name: 'Rajasthan Current Affairs', icon: Zap, color: 'bg-amber-600', desc: 'Sports, Politics, Schemes 2026' },
    { name: 'National Current Affairs', icon: Sun, color: 'bg-rose-600', desc: 'National & Global Events' },
    { name: 'Rajasthan GK', icon: History, color: 'bg-blue-600', desc: 'Geography, History, Culture' },
    { name: 'Indian GK', icon: BookOpen, color: 'bg-indigo-600', desc: 'Constitution, Polity, Economy' },
    { name: 'Mathematics', icon: Calculator, color: 'bg-orange-600', desc: 'Algebra, Calculus, Probability' },
    { name: 'Science', icon: FlaskConical, color: 'bg-green-600', desc: 'Physics, Chemistry, Biology' },
    { name: 'Reasoning', icon: BrainCircuit, color: 'bg-teal-600', desc: 'Series, Analogy, Puzzles' },
    { name: 'Hindi', icon: Languages, color: 'bg-red-600', desc: 'Grammar, Vocab, Samas' },
    { name: 'English', icon: Zap, color: 'bg-purple-600', desc: 'Grammar, Tense, Voice' },
  ];

  return (
    <div 
      className={`app-container selection:bg-primary selection:text-white transition-all duration-1000 ${theme === 'rajasthan' ? 'theme-rajasthan' : ''}`}
      style={{ 
        backgroundImage: currentTheme.backgroundImage ? `url(${currentTheme.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
      data-theme={currentTheme.id}
    >
      <PersonalizationPanel isOpen={personalizationOpen} onClose={() => setPersonalizationOpen(false)} />

      {/* QUIZ GENERATION ERROR POPUP DIALOG */}
      <AnimatePresence>
        {quizError && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuizError(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center overflow-hidden"
            >
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2 font-display">
                Quiz Generation Update
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                {quizError}
              </p>
              <button
                onClick={() => setQuizError(null)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white transition-colors rounded-xl font-bold uppercase text-xs tracking-wider font-mono"
              >
                Acknowledge
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Motivational Floating Particles (Only in Motivation/Anime themes) */}
      {(currentTheme.category === 'Motivation' || currentTheme.category === 'Anime') && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/20"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                scale: 0 
              }}
              animate={{ 
                y: [null, '-100vh'],
                scale: [0, 1.5, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: 10 + Math.random() * 20, 
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* LANDING SCREEN */}
        {screen === 'LANDING' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden"
          >
            {/* Ambient visual depth circles */}
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-soft"></div>
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-float"></div>

            <div className="flex flex-col items-center justify-center text-center max-w-sm z-10">
              {/* Brand icon block */}
              <motion.div 
                initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="w-20 h-20 bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-rose-950/40 border border-slate-700/50 mb-6"
              >
                UЗ
              </motion.div>

              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black tracking-tight font-display mb-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-indigo-200"
              >
                RPSC AI Ustad
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.4 }}
                className="text-xs tracking-[0.2em] uppercase font-bold text-amber-400 mb-8"
              >
                CBT Exam Simulator
              </motion.p>

              {/* Dynamic loading indicators */}
              <div className="flex flex-col items-center mb-10 w-full px-4">
                <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin mb-4 shadow-md shadow-amber-500/10"></div>
                <p className="text-sm font-medium text-slate-300 animate-pulse">
                  Loading AI Ustad Quiz...
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Syncing Question Bank & CBT Console
                </p>
              </div>

              {/* Hindi footer tagline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="border-t border-slate-800/80 pt-4 w-full"
              >
                <p className="text-xs text-slate-400 italic">
                  "आपकी तैयारी का सबसे विश्वसनीय डिजिटल गुरु"
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* INTRO SCREEN */}
        {screen === 'INTRO' && (
          <IntroScreen onStart={() => setScreen('AUTH')} />
        )}

        {/* AUTH SCREEN */}
        {screen === 'AUTH' && (
          <AuthScreen 
            onSuccess={(u) => {
              setUser(u);
              setScreen('HOME');
            }} 
            onBack={() => setScreen('INTRO')}
          />
        )}

        {/* QUIZ SHELL (Used for screens after intro/auth) */}
        {(screen !== 'LANDING' && screen !== 'INTRO' && screen !== 'AUTH') && (
          <motion.div
            key="app-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Premium Header Navigation */}
            <header className={`${
              screen === 'HOME'
                ? 'mx-auto mt-2 mb-1.5 w-[96%] max-w-5xl rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm p-1.5 px-3 flex items-center justify-between sticky top-2 z-50 transition-all duration-300 max-h-[58px]'
                : 'top-bar max-h-[58px]'
            }`}>
                <div className="logo-area cursor-pointer flex items-center gap-2" onClick={() => {
                  feedback('click');
                  setScreen('HOME');
                  setActiveTab('home');
                }}>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-black shadow-md select-none shrink-0">
                     <GraduationCap size={16} className="text-white drop-shadow-sm rotate-[-10deg]" />
                  </div>
                  <div>
                    <div className="logo-title font-sans tracking-tight text-[#1e293b] font-extrabold text-[13px] sm:text-[14px] flex items-center gap-1">
                      AI USTAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 font-black">QUIZ</span>
                    </div>
                    <div className="text-[7.5px] font-black tracking-widest text-[#64748b] uppercase leading-none mt-0.5">PREMIUM PORTAL</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  {(screen === 'QUIZ' || screen === 'RESULTS') && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        ...(config.mode === 'exam' && ((questions.length * 60) - quizTimer) < 120 ? {
                          scale: [1, 1.05, 1],
                        } : {})
                      }}
                      transition={{ 
                        scale: { repeat: Infinity, duration: 1.5 } 
                      }}
                      className="timer-box"
                    >
                      <span className="leading-none transition-colors">
                        {config.mode === 'exam' 
                          ? formatTime(Math.max(0, (questions.length * 60) - quizTimer)) 
                          : formatTime(quizTimer)}
                      </span>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Pro Member Upgrade Button with crown icon */}
                    {screen === 'HOME' && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          feedback('royal');
                          setProModalOpen(true);
                        }}
                        className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white rounded-full text-[10px] md:text-xs font-black shadow-[0_4px_12px_rgba(245,158,11,0.2)] tracking-wider uppercase border border-amber-400/30"
                      >
                        <Crown size={12} className="animate-pulse text-white fill-white" />
                        <span className="sm:inline hidden text-white">GO PRO</span>
                        <span className="sm:hidden text-white font-extrabold text-[9px]">PRO</span>
                      </motion.button>
                    )}

                    {/* Notification bell button */}
                    {screen === 'HOME' && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          feedback('click');
                          setNotificationsOpen(!notificationsOpen);
                        }}
                        className="relative w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200/60 rounded-xl text-slate-600 hover:text-purple-600 transition-colors"
                      >
                        <Bell size={16} />
                        <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-bounce"></span>
                      </motion.button>
                    )}

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPersonalizationOpen(true)}
                      className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200/60 rounded-xl text-slate-600 hover:text-primary transition-colors cursor-pointer"
                      title="Skins & Themes"
                    >
                      <Palette size={16} className="text-slate-600" />
                    </motion.button>

                    <div className="hidden xs:block h-6 w-px bg-slate-200 mx-1"></div>

                  {user && (
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest leading-none text-slate-400 mb-0.5">STUDENT</span>
                        <span className="text-xs font-extrabold text-slate-800">{user.name}</span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        title="Logout"
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <LogOut size={15} />
                      </button>
                    </div>
                  )}

                  {screen === 'QUIZ' && (
                    <button 
                      onClick={() => setScreen('RESULTS')}
                      className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-extrabold rounded-lg hover:bg-slate-800 transition-colors shadow-sm ml-1"
                    >
                      SUBMIT
                    </button>
                  )}
                  {screen === 'RESULTS' && (
                    <button 
                      onClick={() => {
                        feedback('click');
                        setScreen('HOME');
                        setActiveTab('home');
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-extrabold rounded-lg hover:bg-indigo-700 transition-all shadow-sm ml-1"
                    >
                      EXIT
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="main-screen">
              
              {/* Sidebar Left: Progress & Stats (Quiz) - Desktop and Tablet */}
              {screen === 'QUIZ' && !loading && (
                <aside className="hidden lg:flex w-72 border-r border-white/10 bg-white/5 backdrop-blur-sm p-6 flex-col gap-8 shrink-0 relative z-10 transition-all">
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-display">
                       <Activity size={12} /> Adaptive Progress
                    </h3>
                    <div className="flex items-end gap-1.5 h-12">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-sm transition-all duration-500 ${
                            i <= (currentIndex / questions.length) * 5 ? 'bg-primary' : 'bg-slate-100'
                          }`} 
                          style={{ height: `${(5 - i) * 20}%` }} 
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-slate-600 italic">
                      Difficulty: <span className="font-bold text-accent">{config.difficulty}</span>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <LayoutGrid size={14} className="text-pink-500" /> Question Map
                    </h3>
                    <div className="grid grid-cols-5 gap-3">
                      {questions.map((_, i) => {
                        const isCurrent = i === currentIndex;
                        const isAnswered = userAnswers[i] !== null;
                        return (
                          <motion.div 
                            key={i}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentIndex(i)}
                            className={`aspect-square rounded-xl border flex items-center justify-center text-[11px] font-black cursor-pointer transition-all duration-300 ${
                              isCurrent 
                                ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-[0_4px_15px_rgba(236,72,153,0.4)] border-transparent scale-110 z-10' 
                                : isAnswered 
                                  ? 'border-pink-200 bg-pink-50 text-pink-600 font-bold'
                                  : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {i + 1}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto p-4 bg-slate-50 border border-slate-200 rounded">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      <span className="font-bold block mb-1 uppercase tracking-tighter text-slate-400 flex items-center gap-1"><Info size={10} /> RPSC Context</span>
                      AI-curated patterns based on previous years' exams.
                    </p>
                  </div>
                </aside>
              )}

              {/* Central Section */}
              <section className="flex-1 bg-transparent overflow-y-auto px-4 md:px-12 py-8 md:py-12 flex flex-col pb-32 md:pb-12 xl:px-24">
                <AnimatePresence mode="wait">
                  {screen === 'VIDEO_STUDIO' && (
          <div className="pt-20">
            <AIVideoStudio />
            {/* Back to Home Button floating */}
            <button 
              onClick={() => setScreen('HOME')}
              className="fixed bottom-8 right-8 p-4 bg-white shadow-2xl rounded-2xl border border-slate-100 font-bold text-slate-900 flex items-center gap-2 hover:bg-slate-50 transition-all z-[90]"
            >
              <ArrowLeft size={18} /> Home
            </button>
          </div>
        )}
        
        {screen === 'HOME' && (
          <motion.div
            key="premium-exam-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-5xl mx-auto w-full flex flex-col relative pb-28 md:pb-20"
          >
            {/* INTERACTIVE NOTIFICATION DRAWER / PANEL */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute inset-x-4 top-2 z-[200] max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-150 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Bell size={14} className="text-purple-600 animate-swing" /> live exam announcements
                    </h4>
                    <button 
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    <div className="p-3 bg-purple-50/50 hover:bg-purple-50 rounded-2xl border border-purple-150 transition-colors">
                      <p className="text-xs font-black text-purple-900 leading-tight">📢 RPSC CBT Guidelines 2026</p>
                      <p className="text-[10px] text-purple-700 leading-relaxed mt-1">Official circular released. Standardized CBT template to be adopted for Rajasthan Lecturer recruitment exams.</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 hover:bg-amber-50 rounded-2xl border border-amber-100 transition-colors">
                      <p className="text-xs font-black text-amber-950 leading-tight">🔥 Daily Preparation Speed Booster is Active!</p>
                      <p className="text-[10px] text-amber-800 leading-relaxed mt-1">Practice Rajasthan Current Affairs today to gain an extra +50 XP multiplier.</p>
                    </div>
                    <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                      <p className="text-xs font-black text-slate-800 leading-tight">💡 Science & Technology Special Update</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">150+ high-yield CBT style questions added to the RPSC General Science Question Bank.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotificationsOpen(false)}
                    className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    DISMISS ALL
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PREMIUM PRO VIP MEMBERSHIP POPUP */}
            <AnimatePresence>
              {proModalOpen && (
                <div className="fixed inset-0 z-[600] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-purple-950 rounded-[2.5rem] p-6 text-white border border-purple-500/30 shadow-[0_25px_60px_rgba(79,70,229,0.3)] text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
                    
                    <button 
                      onClick={() => setProModalOpen(false)}
                      className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 transition-all border border-white/10"
                    >
                      <X size={14} />
                    </button>

                    <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-float">
                      <Crown size={32} className="text-white fill-white" />
                    </div>

                    <h3 className="text-xl font-bold font-sans tracking-tight text-white uppercase">AI USTAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 font-extrabold">VIP GURUKUL</span></h3>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] mt-1">Become an Elite Rank Holder</p>

                    <div className="my-6 space-y-3.5 text-left border-y border-white/10 py-5">
                      <div className="flex items-start gap-3 text-xs text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 text-[10px] font-bold">✓</div>
                        <p><strong>Unlimited AI Video Stories</strong>: Transcribe your revision notes into cinematic video lessons instantly.</p>
                      </div>
                      <div className="flex items-start gap-3 text-xs text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 text-[10px] font-bold">✓</div>
                        <p><strong>Full Mock tests series</strong>: Interactive CBT mode replicating exact previous questions & weightage.</p>
                      </div>
                      <div className="flex items-start gap-3 text-xs text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 text-[10px] font-bold">✓</div>
                        <p><strong>Guruji AI Insights</strong>: Deep conceptual explanations on Rajasthan GK, polity & science.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 rounded-2xl p-3 border border-white/10 mb-6">
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Promo Monthly Pass</p>
                        <p className="text-lg font-black text-white">₹199 <span className="text-xs font-normal text-slate-400">/mo</span></p>
                      </div>
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">SAVE 60%</span>
                    </div>

                    <button 
                      onClick={() => {
                        feedback('royal');
                        alert("🎉 Payment Success! You are now a premium AI USTAD VIP Member.");
                        setProModalOpen(false);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-pink-500 hover:brightness-110 font-bold rounded-2xl text-[11px] tracking-widest uppercase text-slate-950 transition-all shadow-lg active:scale-98"
                    >
                      ACTIVATE PREP PASS NOW
                    </button>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tight mt-3">Cancel anytime • 100% money back guarantee</p>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>


            {/* ======================================= */}
            {/* TAB CONTENT 1: HOME PANEL */}
            {/* ======================================= */}
            {activeTab === 'home' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 px-1.5"
              >
                {/* WELCOME BANNER (COMPACT HERO CARD) */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-700 via-[#5a38bf] to-pink-600 rounded-2xl shadow-md text-white border border-indigo-500/20 relative overflow-hidden flex flex-row items-center justify-between gap-4 group">
                  <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-3xl"></div>
                  <div className="absolute top-[-30%] right-[-10%] w-52 h-52 bg-gradient-to-tr from-pink-500/20 to-purple-500/30 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none"></div>
                  
                  <div className="relative z-10 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-[0.2em] select-none">नमस्ते,</span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white leading-none">
                        {user?.name || "Aspirant"}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-indigo-100 mt-1 font-medium tracking-wide">
                        जारी रखें अपनी तैयारी! ✨
                      </p>
                    </div>

                    {/* Bottom Small Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3.5 max-w-xs">
                      {/* Streak Card */}
                      <div className="p-1.5 px-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5 hover:bg-white/15 transition-all">
                        <span className="text-sm">🔥</span>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-black text-amber-200 uppercase tracking-widest leading-none">Streak</span>
                          <span className="text-[10px] font-black text-white leading-none mt-0.5">{streak || 5} Days</span>
                        </div>
                      </div>

                      {/* XP Points Card */}
                      <div className="p-1.5 px-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5 hover:bg-white/15 transition-all">
                        <Zap size={11} className="text-indigo-300 fill-indigo-300 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-black text-indigo-200 uppercase tracking-widest leading-none">XP Points</span>
                          <span className="text-[10px] font-black text-white leading-none mt-0.5">{xp || 320} Coins</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: PREMIUM COMPACT CSS EDUCATION GRAPHIC */}
                  <div className="w-16 h-16 self-center shrink-0 relative hidden sm:flex items-center justify-center pointer-events-none select-none z-10">
                    <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl"></div>
                    <motion.div 
                      className="relative w-12 h-12 flex items-center justify-center"
                      animate={{ y: [-1, 1, -1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-10 h-5 bg-slate-900 border border-slate-700 transform rotate-[-14deg] skew-x-12 rounded flex items-center justify-center shadow-lg relative">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full border border-amber-300"></div>
                      </div>
                    </motion.div>
                  </div>
                </div>


                {/* MAIN FEATURE SECTION (2 CARDS IN COMPACT GRID) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CARD 1: DAILY LIVE QUIZ */}
                  <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-rose-500 text-white rounded-2xl p-4 shadow-sm border border-pink-400/20 flex flex-col justify-between min-h-[120px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[1px]"></div>
                    <div className="absolute bottom-[-10px] right-[-10px] w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                    
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[8.5px] font-black uppercase tracking-wider border border-white/25">
                          <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></span>
                          LIVE RAPID FIRE
                        </div>
                        <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight mt-1.5">DAILY LIVE MCQ</h3>
                        <p className="text-[10px] text-white/85 mt-0.5">10 Mixed Questions • 5 Mins • +100 XP Coins</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center animate-bounce">
                        <Sparkles size={14} className="text-yellow-200" />
                      </div>
                    </div>

                    <div className="relative z-10 mt-3 flex items-center justify-between gap-2">
                      {dailyDone ? (
                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-100 bg-white/10 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 size={12} className="text-yellow-300" /> COMPLETED
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            feedback('click');
                            startDailyChallenge();
                          }}
                          className="px-4 py-1.5 bg-white text-rose-600 font-extrabold text-[10px] uppercase tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all shadow text-center animate-pulse"
                        >
                          अभी शुरू करें
                        </button>
                      )}
                      <span className="text-[8.5px] italic text-rose-100 uppercase tracking-wide shrink-0 font-medium">Reset in 8h</span>
                    </div>
                  </div>

                  {/* CARD 2: PROGRESS & EXAM READINESS */}
                  {(() => {
                    const readinessScore = Math.min(100, Math.max(40, Math.round((((xp || 320) + (streak || 5) * 20) / 1000) * 100)));
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[120px] overflow-hidden group hover:border-purple-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-[#a855f7]">Prep Projection</span>
                            <h3 className="text-base font-extrabold tracking-tight text-slate-800 mt-0.5">EXAM READINESS</h3>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">Based on mock speed & accuracy metrics.</p>
                          </div>
                          <div className="shrink-0 relative">
                            {/* Circular progress SVG */}
                            <svg className="w-12 h-12" viewBox="0 0 36 36">
                              <path
                                className="text-slate-100"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-purple-600 drop-shadow-[0_2px_6px_rgba(147,51,234,0.2)]"
                                strokeWidth="3.5"
                                strokeDasharray={`${readinessScore}, 100`}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800 tracking-tighter">
                              {readinessScore}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold text-slate-500">
                          <span className="flex items-center gap-1"><Trophy size={11} className="text-amber-500" /> Rank Projection: #140</span>
                          <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px]">Excellent</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>


                {/* FEATURE GRID (COMPACT VERTICAL LAYOUT CARDS) */}
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#64748b] mb-3">EXAM STUDY UTILITIES</h4>
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {/* GK MAP */}
                    <button 
                      onClick={() => {
                        feedback('royal');
                        setIsRajasthanMapOpen(true);
                      }}
                      className="p-3 bg-white border border-slate-150 rounded-2xl flex flex-col items-center text-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.015)] hover:border-indigo-300 hover:shadow-md transition-all active:scale-95 group"
                    >
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110 mb-2">
                        <MapIcon size={16} className="sm:size-18" />
                      </div>
                      <span className="text-[9px] sm:text-xs font-extrabold text-[#111827] leading-none uppercase tracking-tight">GK MAP</span>
                    </button>

                    {/* GURUKUL TV */}
                    <div 
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center text-center justify-between shadow-md relative overflow-hidden group cursor-not-allowed select-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/10"></div>
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 transition-transform group-hover:scale-105 mb-2 relative">
                        <Tv size={16} className="sm:size-18 text-purple-400 fill-purple-500/10 animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-xs font-black text-slate-200 leading-none uppercase tracking-tight">GURUKUL TV</span>
                      <span className="mt-1 px-1.5 py-[2px] bg-gradient-to-r from-pink-600 to-purple-600 rounded text-[7px] font-black text-white tracking-widest uppercase select-none shadow-[0_0_8px_rgba(219,39,119,0.3)] leading-none">SOON</span>
                    </div>

                    {/* AI VIDEO STORY ENGINE */}
                    <button 
                      onClick={() => {
                        feedback('click');
                        setScreen('VIDEO_STUDIO');
                      }}
                      className="p-3 bg-white border border-slate-150 rounded-2xl flex flex-col items-center text-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.015)] hover:border-purple-300 hover:shadow-md transition-all active:scale-95 group"
                    >
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 transition-transform group-hover:scale-110 mb-2">
                        <Video size={16} className="sm:size-18" />
                      </div>
                      <span className="text-[9px] sm:text-xs font-extrabold text-[#111827] leading-none uppercase tracking-tight">AI VIDEO</span>
                    </button>

                    {/* CURRENT AFFAIRS BUTTON */}
                    <button 
                      onClick={() => {
                        feedback('click');
                        setActiveTab('practice');
                        setSearchQuery('Current Affairs');
                      }}
                      className="p-3 bg-white border border-slate-150 rounded-2xl flex flex-col items-center text-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.015)] hover:border-pink-300 hover:shadow-md transition-all active:scale-95 group"
                    >
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 transition-transform group-hover:scale-110 mb-2">
                        <FileText size={16} className="sm:size-18" />
                      </div>
                      <span className="text-[9px] sm:text-xs font-extrabold text-[#111827] leading-none uppercase tracking-tight">AFFAIRS</span>
                    </button>
                  </div>
                </div>


                {/* DAILY TARGET SECTION (GLOWING PURPLE CARD) */}
                <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 text-white rounded-[2.2rem] p-6 shadow-[0_12px_32px_rgba(147,51,234,0.15)] relative overflow-hidden border border-purple-800/30 group">
                  {/* Subtle Neon Glow Effect */}
                  <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow">
                        <Trophy size={20} className="fill-amber-400/20" />
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-[#a855f7] uppercase leading-none">TARGET WORKSPACE</span>
                        <h4 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">आज का लक्ष्य</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">{customGoalQuestions} MCQs Target</span>
                    </div>
                  </div>

                  {/* Progress Bar with Glow */}
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                      <span>Daily CBT Progress</span>
                      <span className="text-white">60% Complete</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "60%" }}
                        className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.5)]"
                      ></motion.div>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[9px] text-slate-400">
                      <span>Completed 12 MCQs today</span>
                      <span>8 left to hit streak goals</span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-5 flex justify-end gap-2.5">
                    <button 
                      onClick={() => {
                        feedback('click');
                        setCustomGoalQuestions(prev => prev === 12 ? 20 : 12);
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      Change Goal
                    </button>
                    <button 
                      onClick={() => {
                        feedback('click');
                        startSetup('Rajasthan GK');
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:brightness-110 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-purple-900/40 border border-purple-500/20"
                    >
                      Complete Now
                    </button>
                  </div>
                </div>


                {/* QUESTION BANK SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#64748b]">STANDARD EXAM SUBJECTS</h4>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">CBT LEVEL 1</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                    {/* Live Quiz */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => startSetup('Daily Live Quiz')}
                      className="p-4 bg-white border border-slate-150 hover:border-purple-300 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left flex items-start justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Activity size={18} className="animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs sm:text-sm font-extrabold text-slate-800">Daily Live Quiz</h5>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-500 italic mt-0.5">Real-time Current News</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-[#a855f7] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md mt-1 shrink-0">120 MCQs</span>
                    </motion.button>

                    {/* Rajasthan Current Affairs */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => startSetup('Rajasthan Current Affairs')}
                      className="p-4 bg-white border border-slate-150 hover:border-purple-300 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left flex items-start justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Zap size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-extrabold text-slate-800">Rajasthan Current Affairs</h5>
                          <p className="text-[10px] sm:text-xs text-slate-500 italic mt-0.5">Schemes, Politics, Sports 2026</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-[#a855f7] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md mt-1 shrink-0">340 MCQs</span>
                    </motion.button>

                    {/* National Current Affairs */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => startSetup('National Current Affairs')}
                      className="p-4 bg-white border border-slate-150 hover:border-purple-300 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left flex items-start justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <Sun size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-extrabold text-slate-800">National Current Affairs</h5>
                          <p className="text-[10px] sm:text-xs text-slate-500 italic mt-0.5">National & Global Events</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-[#a855f7] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md mt-1 shrink-0">210 MCQs</span>
                    </motion.button>

                    {/* Rajasthan GK */}
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => startSetup('Rajasthan GK')}
                      className="p-4 bg-white border border-slate-150 hover:border-purple-300 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left flex items-start justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <History size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-extrabold text-slate-800">Rajasthan GK</h5>
                          <p className="text-[10px] sm:text-xs text-slate-500 italic mt-0.5">History, Culture, Geography</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-[#a855f7] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md mt-1 shrink-0">1,200 MCQs</span>
                    </motion.button>
                  </div>
                </div>


                {/* BOTTOM CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    feedback('royal');
                    setActiveTab('practice');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-[#5a38bf] to-pink-500 hover:brightness-110 text-white rounded-[1.5rem] font-sans tracking-widest text-[11px] font-black uppercase shadow-[0_8px_30px_rgba(90,56,191,0.25)] flex items-center justify-center gap-2 cursor-pointer border border-purple-500/20 active:scale-95"
                >
                  VIEW ALL SUBJECTS <ChevronRight size={16} />
                </motion.button>
              </motion.div>
            )}


            {/* ======================================= */}
            {/* TAB CONTENT 2: PRACTICE LIBRARY */}
            {/* ======================================= */}
            {activeTab === 'practice' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 px-1.5"
              >
                <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#a855f7]">Revision Suite</span>
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1">Syllabus Practice Books</h3>
                  <p className="text-xs text-slate-500 mt-1">Select any subject below to configure learning parameters & start an interactive adaptive quiz.</p>

                  {/* Search bar input for Practice Books */}
                  <div className="mt-4 relative flex items-center">
                    <input 
                      type="text"
                      placeholder="Search subject databases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-5 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 outline-none text-xs sm:text-sm font-semibold transition-all"
                    />
                    {searchQuery ? (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 p-1 rounded-full hover:bg-slate-200 text-slate-400">
                        <X size={14} />
                      </button>
                    ) : (
                      <span className="absolute right-4 text-slate-400">🔍</span>
                    )}
                  </div>
                </div>

                {/* Grid of All 10 Subjects matching subjects list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {subjects
                    .filter(sub => 
                      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      sub.desc.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((sub, idx) => (
                      <motion.button
                        key={sub.name}
                        whileHover={{ y: -3, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => startSetup(sub.name)}
                        className="p-5 bg-white border border-slate-150/70 hover:border-purple-300 rounded-[1.8rem] shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left flex items-start justify-between group transition-all"
                      >
                        <div className="flex items-start gap-3.5 flex-1">
                          <div className={`w-11 h-11 rounded-2xl ${sub.color.includes('bg-') ? sub.color : 'bg-primary'} text-white flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110`}>
                            <sub.icon size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 tracking-tight leading-snug group-hover:text-purple-600 transition-colors">{sub.name}</h4>
                            <p className="text-[11px] text-slate-500 font-medium italic mt-1 leading-normal">{sub.desc}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-all mt-3 ml-2 shrink-0 group-hover:translate-x-1" />
                      </motion.button>
                    ))}
                </div>

                {/* ACTIVE RPSC RECRUITMENT NOTIFICATIONS IN PRACTICE */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#64748b]">RPSC NEWS & PRESS NOTES</h4>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <RPSCDashboard />
                </div>
              </motion.div>
            )}


            {/* ======================================= */}
            {/* TAB CONTENT 3: MOCK TEST SIMULATOR */}
            {/* ======================================= */}
            {activeTab === 'mock' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 px-1.5"
              >
                <div className="bg-slate-900 text-white rounded-[2.2rem] p-6 border border-slate-800 shadow-xl relative overflow-hidden text-center sm:text-left flex sm:flex-row flex-col items-center justify-between gap-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-wider border border-white/10 mb-2">
                      <Lock size={10} className="text-amber-400" /> CBT exam portal
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans leading-none">RPSC CBT Simulator</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Time-bound simulator mimicking actual CBT platforms (RAS, Lecturer exams, etc). Includes negative marking rules.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-red-900/40">
                      CBT
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#64748b]">EXAM PAPER SERIES 2026</h4>

                  {/* Mock Paper Card 1 */}
                  <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-sm hover:border-red-300 transition-colors flex sm:flex-row flex-col items-start sm:items-center justify-between gap-5 group">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-none">RPSC GS Paper (Paper I) Mock</h4>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">Bilingual • 30 Syllabus Items • PYP Weightage Grid</p>
                      
                      <div className="flex items-center gap-3.5 mt-3 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1.5"><Timer size={12} /> 30 Mins</span>
                        <span>•</span>
                        <span>-1/3 Negative Marking</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        feedback('click');
                        setConfig({
                          subject: 'Rajasthan GK',
                          difficulty: 'Medium',
                          language: 'Bilingual',
                          questionCount: 30,
                          pattern: '2021-Present',
                          mode: 'exam',
                          topic: 'GS Paper I Full Mock'
                        });
                        handleStartQuiz();
                      }}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all self-stretch sm:self-auto text-center"
                    >
                      BEGIN SIMULATION
                    </button>
                  </div>

                  {/* Mock Paper Card 2 */}
                  <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-sm hover:border-red-300 transition-colors flex sm:flex-row flex-col items-start sm:items-center justify-between gap-5 group">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-none">Rajasthan Administrative Services Prep</h4>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">Core Subject Areas • English / Hinglish • Advanced Tier</p>
                      
                      <div className="flex items-center gap-3.5 mt-3 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1.5"><Timer size={12} /> 15 Mins</span>
                        <span>•</span>
                        <span>-0.33 Score Penalty</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        feedback('click');
                        setConfig({
                          subject: 'Rajasthan Current Affairs',
                          difficulty: 'Hard',
                          language: 'English',
                          questionCount: 15,
                          pattern: '2021-Present',
                          mode: 'exam',
                          topic: 'RAS Prelims Spec'
                        });
                        handleStartQuiz();
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all self-stretch sm:self-auto text-center"
                    >
                      BEGIN SIMULATION
                    </button>
                  </div>

                  {/* Mock Paper Card 3 */}
                  <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-sm hover:border-red-300 transition-colors flex sm:flex-row flex-col items-start sm:items-center justify-between gap-5 group">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-none">Mathematics & Mental Ability Speed Drill</h4>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">Bilingual • 15 Standard Questions • Live Calculations</p>
                      
                      <div className="flex items-center gap-3.5 mt-3 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1.5"><Timer size={12} /> 15 Mins</span>
                        <span>•</span>
                        <span>No Penalty Mode</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        feedback('click');
                        setConfig({
                          subject: 'Mathematics',
                          difficulty: 'Medium',
                          language: 'Bilingual',
                          questionCount: 15,
                          pattern: '2021-Present',
                          mode: 'exam',
                          topic: 'Aptitude Practice'
                        });
                        handleStartQuiz();
                      }}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all self-stretch sm:self-auto text-center"
                    >
                      BEGIN SIMULATION
                    </button>
                  </div>
                </div>
              </motion.div>
            )}


            {/* ======================================= */}
            {/* TAB CONTENT 4: BOOKMARKS */}
            {/* ======================================= */}
            {activeTab === 'bookmarks' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 px-1.5"
              >
                <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-sm">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#a855f7]">Digital Locker</span>
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-800 mt-1">Saved GK Facts & Lecturers</h3>
                  <p className="text-xs text-slate-500 mt-1">Review complex topics and GK notes you bookmarked during study sessions or lectures.</p>
                </div>

                {/* Hand-selected, rich authentic bookmarks */}
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-slate-150 rounded-2xl flex items-start gap-4 hover:border-purple-300 transition-colors relative group">
                    <span className="text-2xl mt-1 select-none">📌</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded uppercase leading-none">GK Fact</span>
                        <span className="text-[9px] text-slate-400">Saved 4 Days ago</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight mt-1.5 leading-snug">Rajasthan River Basins & Flow Tracing</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Excellent visual trick to remember Banas and Luni rivers using the interactive map explorer.</p>
                      
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => {
                            feedback('click');
                            setIsRajasthanMapOpen(true);
                          }}
                          className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black rounded-lg hover:bg-purple-100 transition-colors uppercase tracking-wider"
                        >
                          View map
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-150 rounded-2xl flex items-start gap-4 hover:border-purple-300 transition-colors relative group">
                    <span className="text-2xl mt-1 select-none">📌</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded uppercase leading-none">Syllabus</span>
                        <span className="text-[9px] text-slate-400">Saved 1 Week ago</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight mt-1.5 leading-snug">Sanskrit Vidyalaya Recourse Questions</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1">High weightage on epic literature, Panini grammars, and language structures to drill.</p>
                      
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => startSetup('Hindi')}
                          className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black rounded-lg hover:bg-purple-100 transition-colors uppercase tracking-wider"
                        >
                          Practice hindi
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-150 rounded-2xl flex items-start gap-4 hover:border-purple-300 transition-colors relative group">
                    <span className="text-2xl mt-1 select-none">📌</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded uppercase leading-none">Polity Study</span>
                        <span className="text-[9px] text-slate-400">Saved 2 Weeks ago</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight mt-1.5 leading-snug">Rajasthan Panchayats Act 1994</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Memorize Amendment clauses, administrative hierarchy, and local governance weightage.</p>
                      
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => startSetup('Indian GK')}
                          className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black rounded-lg hover:bg-purple-100 transition-colors uppercase tracking-wider"
                        >
                          Practice polity
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* ======================================= */}
            {/* TAB CONTENT 5: PROFILE HUB */}
            {/* ======================================= */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 px-1.5"
              >
                {/* CANDIDATE AVATAR CARD */}
                <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-sm text-center relative overflow-hidden">
                  <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 mx-auto flex items-center justify-center text-white text-xl font-black shadow-[0_4px_15px_rgba(147,51,234,0.2)] select-none">
                     {user?.name ? user.name.slice(0,2).toUpperCase() : "AS"}
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight mt-3">{user?.name || "Aspirant Scholar"}</h3>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Master Tier Candidate</p>
                  
                  {/* Stats highlights */}
                  <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 mt-4">
                    <div className="text-center">
                      <p className="text-lg font-black text-slate-800">{streak || 5}</p>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Prep Days</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <p className="text-lg font-black text-slate-800">{xp || 320}</p>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Total XP</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-green-600">84%</p>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Accuracy</p>
                    </div>
                  </div>
                </div>

                {/* UNLOCKED BADGES CHEST RACK */}
                <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Award size={14} className="text-purple-600" /> unlocked achievement chest
                  </h4>
                  
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <div className="p-3 bg-[#fffbeb] border border-[#fef3c7] rounded-2.5xl flex items-center gap-2 shadow-sm min-w-[125px]">
                      <span className="text-xl">🔥</span>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-amber-800 uppercase leading-none">Consistency</span>
                        <span className="text-[10px] text-amber-700 mt-1 leading-none font-medium">Daily Warrior</span>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-2.5xl flex items-center gap-2 shadow-sm min-w-[125px]">
                      <Zap size={16} className="text-purple-600 fill-purple-600" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-purple-900 uppercase leading-none">Speed Drill</span>
                        <span className="text-[10px] text-purple-700 mt-1 leading-none font-medium">Speedstar</span>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2.5xl flex items-center gap-2 shadow-sm min-w-[125px]">
                      <Star size={16} className="text-[#3b82f6] fill-[#3b82f6]" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#1e3a8a] uppercase leading-none">Precision</span>
                        <span className="text-[10px] text-[#2563eb] mt-1 leading-none font-medium">GK Genius</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* USER PREFERENCES & PORTAL LOGOUT */}
                <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-sm text-left space-y-3.5">
                  <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-none">Exam Settings</h4>
                  
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-black text-slate-800">Notification Sound Effects</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Audible buzz and streaks congrats cues.</p>
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">ACTIVE</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-black text-slate-800">Skins & Custom Theme Category</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Current skin: {currentTheme.name}</p>
                    </div>
                    <button 
                      onClick={() => setPersonalizationOpen(true)}
                      className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black rounded-lg uppercase tracking-wider"
                    >
                      SWITCH
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3.5 bg-rose-50 hover:bg-rose-100/50 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-600 uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 mt-4"
                  >
                    <LogOut size={14} /> LOG OUT CANDIDATE SESSION
                  </button>
                </div>
              </motion.div>
            )}


            {/* ======================================= */}
            {/* STICKY BOTTOM NAVIGATION BAR (MOBILE FIRST) */}
            {/* ======================================= */}
            <div className="fixed bottom-4 inset-x-4 max-w-sm sm:max-w-md mx-auto z-[400] bg-white/95 backdrop-blur-md rounded-[2rem] border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-2">
              <nav className="flex justify-around items-center h-12 relative">
                {/* Dynamic tab items */}
                <button 
                  onClick={() => {
                    feedback('click');
                    setActiveTab('home');
                  }}
                  className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative ${
                    activeTab === 'home' ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Home size={18} className={activeTab === 'home' ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(147,51,234,0.2)]' : 'stroke-[2px]'} />
                  <span className="text-[8px] font-extrabold uppercase tracking-tight leading-none">Home</span>
                  {activeTab === 'home' && (
                    <motion.span 
                      layoutId="activeTabBadge"
                      className="absolute -bottom-1.5 w-1 h-1 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.8)]"
                    ></motion.span>
                  )}
                </button>

                <button 
                  onClick={() => {
                    feedback('click');
                    setActiveTab('practice');
                    setSearchQuery('');
                  }}
                  className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative ${
                    activeTab === 'practice' ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <BookOpen size={18} className={activeTab === 'practice' ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(147,51,234,0.2)]' : 'stroke-[2px]'} />
                  <span className="text-[8px] font-extrabold uppercase tracking-tight leading-none">Practice</span>
                  {activeTab === 'practice' && (
                    <motion.span 
                      layoutId="activeTabBadge"
                      className="absolute -bottom-1.5 w-1 h-1 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.8)]"
                    ></motion.span>
                  )}
                </button>

                <button 
                  onClick={() => {
                    feedback('royal');
                    setActiveTab('mock');
                  }}
                  className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative ${
                    activeTab === 'mock' ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Compass size={18} className={activeTab === 'mock' ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(147,51,234,0.2)]' : 'stroke-[2px]'} />
                  <span className="text-[8px] font-extrabold uppercase tracking-tight leading-none">Mock Test</span>
                  {activeTab === 'mock' && (
                    <motion.span 
                      layoutId="activeTabBadge"
                      className="absolute -bottom-1.5 w-1 h-1 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.8)]"
                    ></motion.span>
                  )}
                </button>

                <button 
                  onClick={() => {
                    feedback('click');
                    setActiveTab('bookmarks');
                  }}
                  className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative ${
                    activeTab === 'bookmarks' ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Bookmark size={18} className={activeTab === 'bookmarks' ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(147,51,234,0.2)]' : 'stroke-[2px]'} />
                  <span className="text-[8px] font-extrabold uppercase tracking-tight leading-none">Bookmarks</span>
                  {activeTab === 'bookmarks' && (
                    <motion.span 
                      layoutId="activeTabBadge"
                      className="absolute -bottom-1.5 w-1 h-1 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.8)]"
                    ></motion.span>
                  )}
                </button>

                <button 
                  onClick={() => {
                    feedback('click');
                    setActiveTab('profile');
                  }}
                  className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative ${
                    activeTab === 'profile' ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <UserIcon size={18} className={activeTab === 'profile' ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(147,51,234,0.2)]' : 'stroke-[2px]'} />
                  <span className="text-[8px] font-extrabold uppercase tracking-tight leading-none">Profile</span>
                  {activeTab === 'profile' && (
                    <motion.span 
                      layoutId="activeTabBadge"
                      className="absolute -bottom-1.5 w-1 h-1 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.8)]"
                    ></motion.span>
                  )}
                </button>
              </nav>
            </div>
          </motion.div>
        )}

                  {screen === 'SETUP' && (
                    <motion.div
                      key="setup-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="max-w-2xl mx-auto w-full"
                    >
                      <button 
                        onClick={() => setScreen('HOME')}
                        className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors mb-8"
                      >
                        <ChevronLeft size={16} /> Back to Library
                      </button>
                      
                      <div className={`p-6 md:p-10 ${
                        theme === 'rajasthan' ? 'bg-white rounded-[2rem] border-2 border-amber-500 shadow-2xl' : 'bg-white border border-slate-200'
                      }`}>
                        <div className="mb-8 md:mb-10 flex flex-col md:flex-row border-b border-slate-100 pb-8">
                           <div className={`w-12 h-12 md:w-14 md:h-14 ${
                             theme === 'rajasthan' ? 'bg-rose-800' : (subjects.find(s => s.name === config.subject)?.color.includes('blue') ? 'bg-primary' : subjects.find(s => s.name === config.subject)?.color)
                           } text-white flex items-center justify-center rounded-sm mx-auto md:ml-0 md:mr-6 mb-4 md:mb-0`}>
                             {(() => {
                               const SIcon = subjects.find(s => s.name === config.subject)?.icon || History;
                               return <SIcon size={28} />;
                             })()}
                           </div>
                           <div className="text-center md:text-left">
                             <h2 className="text-2xl md:text-3xl font-display text-main">{config.subject}</h2>
                             <p className="text-xs md:text-sm text-slate-500 italic">Configuration & AI Tuning</p>
                           </div>
                        </div>

                    <div className="grid gap-6 md:gap-8">
                          <div className="group">
                             <label className="block text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Exam Pattern Style</label>
                             <div className="grid grid-cols-2 gap-2">
                               {(['2012-2020', '2021-Present'] as ExamPattern[]).map(p => (
                                 <button
                                   key={p}
                                   onClick={() => setConfig({ ...config, pattern: p })}
                                   className={`py-2.5 md:py-3 border text-[10px] md:text-xs font-bold transition-all ${
                                     config.pattern === p 
                                       ? 'border-primary bg-primary text-white shadow-md' 
                                       : 'border-slate-200 text-slate-500 hover:border-primary/20'
                                   }`}
                                 >
                                   {p}
                                 </button>
                               ))}
                             </div>
                          </div>

                          <div className="group">
                             <label className="block text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quiz Language</label>
                             <div className="grid grid-cols-4 gap-2">
                               {(['English', 'Hindi', 'Hinglish', 'Bilingual'] as Language[]).map(lang => (
                                 <button
                                   key={lang}
                                   onClick={() => setConfig({ ...config, language: lang })}
                                   className={`py-2.5 md:py-3 border text-[10px] md:text-xs font-bold transition-all ${
                                     config.language === lang 
                                       ? 'border-primary bg-primary text-white shadow-md' 
                                       : 'border-slate-200 text-slate-500 hover:border-primary/20'
                                   }`}
                                 >
                                   {lang.toUpperCase()}
                                 </button>
                               ))}
                             </div>
                          </div>

                          <div className="group">
                              <label className="block text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quiz Mode</label>
                              <div className="grid grid-cols-2 gap-2">
                                {(['instant', 'exam'] as QuizMode[]).map(m => (
                                  <button
                                    key={m}
                                    onClick={() => setConfig({ ...config, mode: m })}
                                    className={`py-2.5 md:py-3 border text-[10px] md:text-xs font-bold transition-all ${
                                      config.mode === m 
                                        ? 'border-primary bg-primary text-white shadow-md' 
                                        : 'border-slate-200 text-slate-500 hover:border-primary/20'
                                    }`}
                                  >
                                    {m === 'instant' ? 'LEARNING (INSTANT)' : 'CHALLENGE (EXAM)'}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2 italic whitespace-normal leading-tight">
                                {config.mode === 'instant' 
                                  ? '* In Learning mode, you see answers and Guruji\'s insights immediately after each question.' 
                                  : '* In Challenge mode, you see the result and full analysis only after completing the entire quiz.'}
                              </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            <div>
                               <label className="block text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Difficulty Level</label>
                               <select 
                                 value={config.difficulty}
                                 onChange={(e) => setConfig({ ...config, difficulty: e.target.value as Difficulty })}
                                 className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 text-xs md:text-sm font-medium focus:border-primary outline-none appearance-none"
                               >
                                 <option value="Easy">EASY</option>
                                 <option value="Medium">MEDIUM</option>
                                 <option value="Hard">HARD</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Question Count</label>
                               <select 
                                 value={config.questionCount}
                                 onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
                                 className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 text-xs md:text-sm font-medium focus:border-primary outline-none appearance-none"
                               >
                                 <option value={5}>05 QUESTIONS</option>
                                 <option value={15}>15 QUESTIONS</option>
                                 <option value={30}>30 QUESTIONS</option>
                                 <option value={60}>60 QUESTIONS</option>
                                 <option value={120}>120 QUESTIONS</option>
                               </select>
                            </div>
                          </div>

                          <div>
                             <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Syllabus Focus (Optional)</label>
                             <input 
                               type="text"
                               placeholder="e.g. Geography of Aravalli..."
                               value={config.topic}
                               onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                               className="w-full bg-slate-800/5 border border-slate-200 p-3 md:p-4 text-xs md:text-sm font-medium focus:border-primary outline-none text-main"
                             />
                          </div>

                          <button
                            onClick={handleStartQuiz}
                            className="bg-slate-900 text-white font-bold tracking-widest uppercase py-4 md:py-5 mt-4 hover:bg-primary transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 text-xs md:text-sm"
                          >
                            Generate Quiz <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {screen === 'RULES' && (
                    <motion.div
                      key="rules"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="max-w-xl mx-auto w-full"
                    >
                      <div className={`p-8 md:p-12 ${
                        theme === 'rajasthan' ? 'bg-white rounded-[2rem] border-2 border-amber-500 shadow-2xl shadow-amber-900/10' : 'bg-white border border-slate-200'
                      }`}>
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                              <Info size={24} />
                           </div>
                           <div>
                              <h2 className="text-2xl font-display font-bold text-main italic">Pre-Exam <span className="text-primary">Protocols</span></h2>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">RPSC AI Compliance v2.4</p>
                           </div>
                        </div>

                        <div className="space-y-6 mb-10">
                           {[
                             { icon: Timer, text: "The session is strictly timed. Auto-submit on expiry." },
                             { icon: Star, text: "Focus entirely on the screen. Do not switch tabs." },
                             { icon: BookOpen, text: "Instant AI feedback is available after selecting answers." },
                             { icon: ShieldCheck, text: "Questions are generated based on RPSC official syllabus." }
                           ].map((rule, i) => (
                             <div key={i} className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                                <rule.icon size={20} className="text-slate-400 shrink-0 group-hover:text-primary transition-colors" />
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">{rule.text}</p>
                             </div>
                           ))}
                        </div>

                        <label className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/10 transition-colors mb-8">
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 rounded border-primary text-primary focus:ring-primary shadow-sm"
                             onChange={(e) => setRulesAccepted(e.target.checked)}
                           />
                           <span className="text-xs font-bold text-slate-700">I have read and understood the examination protocols.</span>
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                           <button 
                             onClick={() => setScreen('SETUP')}
                             className="py-4 border border-slate-200 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                           >
                              Back
                           </button>
                           <button 
                             disabled={!rulesAccepted}
                             onClick={confirmStartQuiz}
                             className="py-4 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-primary/20 hover:brightness-110 flex items-center justify-center gap-2 active:scale-95"
                           >
                              Proceed to Exam <ChevronRight size={14} />
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {screen === 'QUIZ' && (
                    <motion.div
                      key="quiz-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full flex-1 flex flex-col h-full overflow-hidden"
                    >
                      {loading ? (
                        <div className="ai-loading-card">
                          <div className="spinner"></div>
                          <h3 className="loading-title">Assembling Exam Questions...</h3>
                          <p className="loading-sub">Our AI is curating the most relevant MCQs based on latest RPSC patterns and your syllabus focus.</p>
                          <div className="ai-status">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <span>AI ENGINE ACTIVE</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          {/* Scrollable Content Container */}
                          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                            <div className="w-full max-w-2xl mx-auto pt-1 pb-16 px-1.5 sm:px-4 md:py-4">
                              {/* PRESTIGE CBT STATUS CONTROL STATION */}
                              <div className="w-[94%] sm:w-full mx-auto mb-3.5 bg-slate-900 border border-slate-800 text-white rounded-2xl p-3.5 shadow-md relative overflow-hidden">
                                 {/* Radial ambient glow */}
                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_60%)] pointer-events-none" />
                                 
                                 <div className="relative flex flex-col gap-3">
                                    {/* Row 1: Session Progress Bar with labels */}
                                    <div className="flex flex-col gap-1">
                                       <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                          <span>Session Progress</span>
                                          <span>{currentIndex + 1} of {questions.length} Questions</span>
                                       </div>
                                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                          <motion.div 
                                             initial={{ width: 0 }}
                                             animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                             className="h-full bg-blue-500 rounded-full"
                                          />
                                       </div>
                                    </div>

                                    {/* Row 2: Subject Details & Live Digital Ticking Clock */}
                                    <div className="flex items-center justify-between border-t border-b border-slate-800/80 py-2.5">
                                       <div className="flex flex-col text-left">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                             <span className="text-[10px] sm:text-xs font-extrabold bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                                {config.subject}
                                             </span>
                                             <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                                config.difficulty === 'Easy' ? 'bg-emerald-50500/10 text-emerald-400 border-emerald-500/20' :
                                                config.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                             }`}>
                                                {config.difficulty === 'Easy' ? '🟢 Easy' : config.difficulty === 'Medium' ? '🟡 Medium' : '🔴 Hard'}
                                             </span>
                                          </div>
                                          {config.topic && (
                                             <span className="text-[9px] font-medium text-slate-400 mt-1 truncate max-w-[140px] sm:max-w-[260px]">
                                                📌 Focus: {config.topic}
                                             </span>
                                          )}
                                       </div>
                                       
                                       {/* Ticking computer-based test Digital Clock */}
                                       <div className="bg-slate-800/90 border border-slate-700/50 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-inner min-w-[78px] justify-center select-none shrink-0">
                                          <Clock size={11} className="text-[#3b82f6] animate-pulse" />
                                          <span className="font-mono text-xs sm:text-sm font-black tracking-tight text-[#3b82f6]">
                                             {formatTime(quizTimer)}
                                          </span>
                                       </div>
                                    </div>

                                    {/* Row 3: Live Attempt metrics & negative marking caution */}
                                    <div className="flex flex-wrap items-center justify-between gap-2.5 text-[10px]">
                                       <div className="flex items-center gap-3 text-slate-300">
                                          <div className="flex items-center gap-1.5">
                                             <span className="text-slate-500">Attempted:</span>
                                             <span className="font-mono bg-emerald-500/15 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/25">
                                                {userAnswers.filter(a => a !== null && a !== 'SKIPPED').length}
                                             </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                             <span className="text-slate-500">Skipped:</span>
                                             <span className="font-mono bg-amber-500/10 text-amber-400 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/20">
                                                {userAnswers.filter(a => a === 'SKIPPED').length}
                                             </span>
                                          </div>
                                       </div>
                                       
                                       {/* Real negative marking warning badge */}
                                       <div className="flex items-center select-none">
                                          <span className="px-2 py-0.5 rounded font-black uppercase text-[8px] sm:text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 tracking-wider">
                                             ⚠️ 1/3 Negative Penalty applies
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                                 
                                 <AnimatePresence>
                                    {isAnswered && config.mode === 'instant' && (
                                      <motion.div 
                                        initial={{ scale: 0, x: 20 }}
                                        animate={{ scale: 1, x: 0 }}
                                        className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-sm border ${
                                          userAnswers[currentIndex] === questions[currentIndex]?.correctAnswer 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}
                                      >
                                        {userAnswers[currentIndex] === questions[currentIndex]?.correctAnswer ? 'CORRECT! +1' : 'INCORRECT! -1/3'}
                                      </motion.div>
                                    )}
                                 </AnimatePresence>
 
                               {/* Question Container */}
                               <motion.div 
                                 initial={{ y: 20, opacity: 0 }}
                                 animate={{ y: 0, opacity: 1 }}
                                 className="w-[94%] max-w-full mx-auto p-3.5 rounded-2xl relative bg-white border border-slate-200 shadow-sm overflow-hidden mb-2.5 text-slate-900"
                               >
                                 <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pb-2 border-b border-slate-150">
                                   <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                     {isReviewMode ? 'REFINE AREA' : config.subject}
                                   </span>
                                   <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                                     config.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                     config.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                     'bg-rose-50 text-rose-700 border-rose-200'
                                   }`}>
                                     {config.difficulty}
                                   </span>
                                   <span className="px-1.5 py-0.5 rounded font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-0.5 text-[8px]">
                                     <ShieldCheck size={9} /> CBT VERIFIED
                                   </span>
                                   
                                   <AnimatePresence>
                                     {consecutiveCorrect >= 3 && (
                                       <motion.span
                                         initial={{ scale: 0 }}
                                         animate={{ scale: 1 }}
                                         key="streak"
                                         className="px-1.5 py-0.5 bg-orange-50 text-orange-700 text-[8px] font-bold rounded uppercase tracking-wide flex items-center gap-0.5 border border-orange-100"
                                       >
                                         <Zap size={9} fill="currentColor" /> {consecutiveCorrect} STREAK
                                       </motion.span>
                                     )}
                                   </AnimatePresence>
                                 </div>
                                
                                <div 
                                  className={`text-[14px] sm:text-[15px] font-bold leading-relaxed tracking-wide text-slate-900 max-w-full break-words whitespace-normal text-left relative transition-all duration-300 ${!questionExpanded ? 'max-h-[142px] overflow-hidden pb-6' : 'max-h-none'}`}
                                  style={{ fontFamily: "'Poppins', 'Noto Sans Devanagari', 'Inter', sans-serif" }}
                                >
                                   {((questions[currentIndex] as any)?.question_hindi || (questions[currentIndex] as any)?.question_english) ? (
                                     <div className="space-y-3">
                                       {(questions[currentIndex] as any).question_hindi && (
                                         <div className="text-left">
                                           <div className="inline-flex items-center gap-1 mb-1 bg-slate-100 border border-slate-200 rounded px-1.5 py-[1.5px] select-none">
                                             <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest leading-none">हिन्दी</span>
                                           </div>
                                           <div>
                                             <HighlightedText text={(questions[currentIndex] as any).question_hindi} />
                                           </div>
                                         </div>
                                       )}
                                       
                                       {(questions[currentIndex] as any).question_hindi && (questions[currentIndex] as any).question_english && (
                                         <div className="border-t border-slate-100 my-2"></div>
                                       )}
 
                                       {(questions[currentIndex] as any).question_english && (
                                         <div className="text-left font-sans">
                                           <div className="inline-flex items-center gap-1 mb-1 bg-slate-100 border border-slate-200 rounded px-1.5 py-[1.5px] select-none">
                                             <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest leading-none">ENGLISH</span>
                                           </div>
                                           <div>
                                             <HighlightedText text={(questions[currentIndex] as any).question_english} />
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   ) : (
                                     <HighlightedText text={formatQuestionText(questions[currentIndex]?.question)} />
                                    )}
                                    {!questionExpanded && (
                                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-10" />
                                    )}
                                  </div>

                                  <div className="flex justify-end mt-1.5 z-20 relative">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        feedback('click');
                                        setQuestionExpanded(!questionExpanded);
                                      }}
                                      className="px-2.5 py-0.5 bg-slate-50/80 hover:bg-[#faf5ff] text-[#5a38bf] hover:text-[#4c2bb3] text-[8px] font-black uppercase tracking-widest rounded-md border border-slate-200 hover:border-purple-300 transition-all outline-none"
                                    >
                                      {questionExpanded ? 'Show Less Area ▲' : 'Read Full Question ▼'}
                                    </button>
                                  </div>
                                  <div className="hidden" style={{ display: 'none' }}>
                                    <span></span>
                                  </div>
                               </motion.div>
 
                               {/* Options Grid */}
                               <div className="grid grid-cols-1 gap-2 w-[94%] mx-auto mb-3 mt-1">
                                 {questions[currentIndex] && Object.entries(questions[currentIndex].options).map(([key, value]) => {
                                   const isCorrect = key === questions[currentIndex].correctAnswer;
                                   const isSelected = key === userAnswers[currentIndex];
                                   const showResults = isAnswered && config.mode === 'instant';
                                   
                                   // Default styles (not answered yet or hovering)
                                   let btnClass = "border-[#d1d5db] bg-white hover:border-slate-400 hover:bg-slate-50 text-[#111827] shadow-sm";
                                   let labelClass = "bg-slate-100 text-slate-700 group-hover:bg-slate-200";
 
                                   // Selected but result not revealed yet (or in exam mode)
                                   if (isSelected && !showResults) {
                                     btnClass = "border-[#2563eb] bg-[#2563eb] text-white shadow-sm pointer-events-none";
                                     labelClass = "bg-white/20 text-white";
                                   }
 
                                   // Results revealed state
                                   if (showResults) {
                                     if (isCorrect) {
                                       btnClass = "border-emerald-600 bg-emerald-50 text-emerald-950 pointer-events-none ring-1 ring-emerald-600/30 shadow-sm";
                                       labelClass = "bg-emerald-600 text-white";
                                     } else if (isSelected) {
                                       btnClass = "border-rose-500 bg-rose-50 text-rose-950 pointer-events-none ring-1 ring-rose-500/30 shadow-sm";
                                       labelClass = "bg-rose-500 text-white";
                                     } else {
                                       btnClass = "opacity-45 pointer-events-none border-slate-200 bg-slate-50 text-slate-400 shadow-none";
                                       labelClass = "bg-slate-100 text-slate-400";
                                     }
                                   }
 
                                   return (
                                     <motion.button
                                       key={key}
                                       whileHover={!isAnswered ? { scale: 1.002 } : {}}
                                       whileTap={!isAnswered ? { scale: 0.998 } : {}}
                                       onClick={() => handleSelectAnswer(key)}
                                       className={`group relative w-full flex items-center gap-2.5 p-2.5 px-3.5 border rounded-xl transition-all text-left text-xs sm:text-sm font-semibold leading-relaxed break-words z-10 ${btnClass}`}
                                       style={{ fontFamily: "'Poppins', 'Noto Sans Devanagari', 'Inter', sans-serif" }}
                                     >
                                       <span className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center font-black text-[11px] leading-none transition-colors border border-transparent ${labelClass}`}>
                                         {key}
                                       </span>
                                       
                                       <span className="text-xs sm:text-sm flex-1 leading-normal font-semibold break-words text-inherit">
                                         {(() => {
                                           const optionsBilingual = (questions[currentIndex] as any)?.options_bilingual as any;
                                           const optionHindi = optionsBilingual?.[key]?.hindi || optionsBilingual?.[key]?.Hindi || null;
                                           const optionEnglish = optionsBilingual?.[key]?.english || optionsBilingual?.[key]?.English || null;
                                           if (optionHindi && optionEnglish) {
                                             return (
                                               <span className="space-y-0.5 block">
                                                 <span className={`${isSelected && !showResults ? 'text-white' : 'text-slate-900'} font-bold block text-xs sm:text-[13px] leading-snug`}>{optionHindi}</span>
                                                 <span className={`${isSelected && !showResults ? 'text-white/80' : 'text-slate-500'} text-[9.5px] font-medium block leading-none`}>{optionEnglish}</span>
                                               </span>
                                             );
                                           }
                                           return value;
                                         })()}
                                       </span>
 
                                       <AnimatePresence>
                                         {(isSelected && (!showResults || !isCorrect)) && (
                                           <motion.div 
                                             initial={{ scale: 0, rotate: 45 }} 
                                             animate={{ scale: 1, rotate: 0 }} 
                                             className={`absolute -right-1.5 -top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white z-20 ${
                                               showResults && !isCorrect ? 'bg-rose-500' : 'bg-[#2563eb]'
                                             }`}
                                           >
                                             {showResults && !isCorrect ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                                           </motion.div>
                                         )}
                                         {showResults && isCorrect && (
                                           <motion.div 
                                             initial={{ scale: 0, rotate: -45 }} 
                                             animate={{ scale: 1, rotate: 0 }} 
                                             className="absolute -right-1.5 -top-1.5 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white z-20"
                                           >
                                             <CheckCircle2 size={15} />
                                           </motion.div>
                                         )}
                                       </AnimatePresence>
                                     </motion.button>
                                   );
                                 })}
                               </div>

                               {/* CBT Interactive Question Palette Map */}
                               <div className="mt-4 p-[15px] bg-slate-50/70 border border-slate-200 rounded-xl text-left">
                                 <div className="flex items-center justify-between mb-2">
                                   <div className="flex flex-col">
                                     <span className="text-[9px] font-black text-[#2563eb] uppercase tracking-widest leading-none mb-0.5">CBT MCQ PALETTE</span>
                                     <span className="text-xs font-semibold text-slate-705">Jump directly to any question</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                     <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-600 rounded-full"></span><span className="text-[9px] text-slate-500 font-bold">Answered</span></span>
                                     <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-400 rounded-full"></span><span className="text-[9px] text-slate-500 font-bold">Skipped</span></span>
                                   </div>
                                 </div>
                                 <div className="flex flex-wrap gap-1.5 max-h-[115px] overflow-y-auto p-0.5 custom-scrollbar">
                                   {questions.map((_, i) => {
                                     const isCurrent = i === currentIndex;
                                     const ansVal = userAnswers[i];
                                     const isAns = ansVal !== null && ansVal !== 'SKIPPED';
                                     const isSkp = ansVal === 'SKIPPED';
                                     
                                     let badgeType = "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"; // neutral unanswered
                                     if (isCurrent) {
                                       badgeType = "bg-blue-50 text-blue-700 border-[#2563eb] font-bold"; // current
                                     } else if (isAns) {
                                       badgeType = "bg-emerald-600 text-white border-transparent font-bold"; // answered
                                     } else if (isSkp) {
                                       badgeType = "bg-slate-400 text-white border-transparent font-bold"; // skipped
                                     }

                                     return (
                                       <button
                                         key={i}
                                         onClick={() => {
                                           feedback('click');
                                           setCurrentIndex(i);
                                           setIsAnswered(userAnswers[i] !== null && userAnswers[i] !== 'SKIPPED');
                                         }}
                                         className={`w-8 h-8 rounded-lg border text-[10px] font-mono flex items-center justify-center transition-all active:scale-95 ${badgeType}`}
                                       >
                                         {String(i + 1).padStart(2, '0')}
                                       </button>
                                     );
                                   })}
                                 </div>
                               </div>

                              {isAnswered && config.mode === 'instant' && questions[currentIndex] && (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-4 space-y-3 pb-24"
                                >
                                  {/* Immediate Correctness / Incorrectness Status & Explanation Banner */}
                                  {(() => {
                                    const selectedAnswer = userAnswers[currentIndex];
                                    const correctAnswer = questions[currentIndex].correctAnswer;
                                    const isSelectionCorrect = selectedAnswer === correctAnswer;
                                    const selectedText = selectedAnswer && selectedAnswer !== 'SKIPPED' 
                                      ? `${selectedAnswer}. ${questions[currentIndex].options[selectedAnswer as 'A'|'B'|'C'|'D']}`
                                      : 'No answer selected (Skipped)';
                                    const correctText = `${correctAnswer}. ${questions[currentIndex].options[correctAnswer as 'A'|'B'|'C'|'D']}`;

                                    return (
                                      <div className={`w-[94%] mx-auto p-4 rounded-[18px] border-[1.5px] shadow-sm relative overflow-hidden flex flex-col gap-3 ${
                                        isSelectionCorrect 
                                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' 
                                          : 'bg-rose-50/90 border-rose-200 text-rose-955'
                                      }`}>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                                            isSelectionCorrect ? 'bg-emerald-600 shadow-sm' : 'bg-rose-600 shadow-sm'
                                          }`}>
                                            {isSelectionCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                          </div>
                                          <div>
                                            <div className={`text-[8px] font-black uppercase tracking-wider ${
                                              isSelectionCorrect ? 'text-emerald-700' : 'text-rose-700'
                                            }`}>YOUR ANSWER STATUS</div>
                                            <h3 className="text-[13px] sm:text-sm font-extrabold tracking-tight font-sans leading-none">
                                              {isSelectionCorrect ? 'CORRECT ANSWER' : 'INCORRECT ANSWER'}
                                            </h3>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          <div className={`p-2.5 rounded-xl border text-left ${
                                            isSelectionCorrect ? 'bg-emerald-100/30 border-emerald-200' : 'bg-rose-100/30 border-rose-200'
                                          }`}>
                                            <span className="text-[8px] font-black opacity-55 uppercase tracking-wider block mb-0.5">YOUR ATTEMPT</span>
                                            <span className="text-[12px] font-semibold block">{selectedText}</span>
                                          </div>
                                          <div className="p-2.5 rounded-xl border bg-emerald-100/30 border-emerald-200 text-left">
                                            <span className="text-[8px] font-black text-emerald-700 opacity-75 uppercase tracking-wider block mb-0.5">CORRECT CHOICE</span>
                                            <span className="text-[12px] font-extrabold text-emerald-900 block">{correctText}</span>
                                          </div>
                                        </div>

                                        {/* Detailed Explanation */}
                                        <div className="border-t border-dashed border-slate-300/60 pt-2.5 mt-1 text-left">
                                          <label className={`text-[8px] font-black uppercase tracking-wider block mb-1 ${
                                            isSelectionCorrect ? 'text-emerald-700' : 'text-rose-700'
                                          }`}>CONCEPT EXPLANATION</label>
                                          <p className="text-[12px] sm:text-[13px] leading-relaxed font-semibold text-[#334155]">
                                            {questions[currentIndex].explanation}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Guruji's Insight Section */}
                                  <div className="w-[94%] mx-auto bg-amber-50/50 backdrop-blur-sm border-l-[6px] border-amber-500 p-4 shadow-sm rounded-[18px] border border-slate-200/50 relative overflow-hidden group text-left">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-amber-500/10 transition-all"></div>
                                    <div className="text-[8px] text-amber-700 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                                      <BrainCircuit size={12} /> GURUJI'S PERSPECTIVE
                                    </div>
                                    <p className="text-[13px] sm:text-[14px] text-slate-850 leading-relaxed font-bold italic mb-2">
                                      "{questions[currentIndex].teacherInsight}"
                                    </p>
                                    {questions[currentIndex].patternYear && (
                                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-[8px] font-black rounded uppercase tracking-wider whitespace-nowrap shadow-sm border border-amber-200">
                                        <Target size={10} /> Pattern Source: {questions[currentIndex].patternYear} RPSC
                                      </div>
                                    )}
                                  </div>

                                  {/* Why Other Options are Wrong */}
                                  {questions[currentIndex].wrongOptionsAnalysis && (
                                    <div className="w-[94%] mx-auto bg-white/95 backdrop-blur-sm border border-slate-200 p-4 rounded-[18px] shadow-sm relative overflow-hidden text-left">
                                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-orange-400"></div>
                                      <h4 className="text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-1">
                                        <RotateCcw size={12} /> ELIMINATION LOGIC
                                      </h4>
                                      <div className="grid grid-cols-1 gap-2.5">
                                        {(['A', 'B', 'C', 'D'] as const).map(key => (
                                          <div key={key} className={`p-3 rounded-xl border-[1.5px] flex items-start gap-3 transition-all ${key === questions[currentIndex].correctAnswer ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-slate-50/40 border-slate-100'}`}>
                                            <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] shadow-sm transition-all ${key === questions[currentIndex].correctAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                              {key}
                                            </span>
                                            <span className="text-[12px] sm:text-[13px] text-slate-700 font-semibold leading-relaxed">
                                              {(questions[currentIndex].wrongOptionsAnalysis as any)[key]}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Youtube Video Player */}
                                  {questions[currentIndex].videoUrl && (
                                    <div className="w-[94%] mx-auto space-y-2 text-left">
                                      <div className="flex items-center justify-between">
                                        <div className="text-[9px] text-rose-600 font-black uppercase tracking-[0.15em] flex items-center gap-1">
                                          <Zap size={12} className="fill-rose-500 animate-pulse" /> CONCEPT RECAP
                                        </div>
                                        <a 
                                          href={`https://www.youtube.com/watch?v=${
                                            questions[currentIndex].videoUrl.includes('v=') 
                                              ? questions[currentIndex].videoUrl.split('v=')[1]?.split('&')[0] 
                                              : questions[currentIndex].videoUrl
                                          }`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[8px] font-black text-primary hover:underline uppercase tracking-[0.15em]"
                                        >
                                          WATCH ON YOUTUBE
                                        </a>
                                      </div>
                                      <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-sm bg-black border-2 border-white ring-1 ring-slate-100">
                                        <iframe 
                                          className="absolute inset-0 w-full h-full"
                                          src={`https://www.youtube.com/embed/${
                                            questions[currentIndex].videoUrl.includes('v=') 
                                              ? questions[currentIndex].videoUrl.split('v=')[1]?.split('&')[0] 
                                              : questions[currentIndex].videoUrl.includes('youtu.be/')
                                                ? questions[currentIndex].videoUrl.split('youtu.be/')[1]?.split('?')[0]
                                                : questions[currentIndex].videoUrl
                                          }?hl=hi&cc_lang_pref=hi&cc_load_policy=1&modestbranding=1&rel=0`}
                                          title="YouTube video player"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                          allowFullScreen
                                        ></iframe>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Fixed Bottom Action Container */}
                          <div className="bg-surface border-t border-border p-4 md:p-6 pb-safe z-50">
                            <div className="max-w-2xl mx-auto w-full flex items-center justify-between gap-4">
                               <div className="flex items-center gap-3">
                                  <button 
                                    onClick={reportQuestion}
                                    title="Report Issue"
                                    className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all active:scale-95 ${
                                      reportedQuestions.includes(currentIndex) 
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-lg shadow-rose-500/10' 
                                        : 'bg-page border-border text-muted hover:bg-surface shadow-sm'
                                    }`}
                                  >
                                    <Flag size={24} className={reportedQuestions.includes(currentIndex) ? 'fill-rose-500' : ''} />
                                  </button>

                                  <div className="hidden sm:flex flex-col">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time Left</span>
                                     <span className={`text-sm font-mono font-black ${
                                       config.mode === 'exam' && ((questions.length * 60) - quizTimer) < 120 ? 'text-rose-500 animate-pulse' : 'text-slate-800'
                                     }`}>
                                       {config.mode === 'exam' 
                                         ? formatTime(Math.max(0, (questions.length * 60) - quizTimer)) 
                                         : formatTime(quizTimer)}
                                     </span>
                                  </div>
                               </div>

                               <AnimatePresence mode="wait">
                                 {isAnswered ? (
                                   <motion.button 
                                     key="next-btn"
                                     initial={{ scale: 0.9, opacity: 0 }}
                                     animate={{ scale: 1, opacity: 1 }}
                                     exit={{ scale: 0.9, opacity: 0 }}
                                     onClick={nextQuestion}
                                     className="flex-1 max-w-[280px] h-14 md:h-16 bg-gradient-to-r from-primary to-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
                                   >
                                     {currentIndex === questions.length - 1 ? 'SUBMIT EXAM' : 'NEXT QUESTION'}
                                     <ChevronRight size={20} />
                                   </motion.button>
                                 ) : (
                                   <div className="flex-1 flex flex-col items-end sm:hidden">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Timer</span>
                                      <span className={`text-base font-mono font-black ${
                                        config.mode === 'exam' && ((questions.length * 60) - quizTimer) < 120 ? 'text-rose-500' : 'text-primary'
                                      }`}>
                                        {config.mode === 'exam' 
                                          ? formatTime(Math.max(0, (questions.length * 60) - quizTimer)) 
                                          : formatTime(quizTimer)}
                                      </span>
                                   </div>
                                 )}
                               </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {screen === 'RESULTS' && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-4xl mx-auto w-full"
                    >
                      <div className="text-center mb-10">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30"
                        >
                          <Trophy size={48} />
                        </motion.div>
                        <h2 className="text-4xl font-display font-bold italic text-main tracking-tight">
                          {isDailyChallenge ? 'Daily Challenge ' : 'Session '}
                          <span className="text-primary">Completed!</span>
                        </h2>
                        {isDailyChallenge && getScore() >= 8 && (
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-orange-500 text-white px-6 py-3 rounded-2xl inline-flex items-center gap-2 mt-4 shadow-xl"
                          >
                            <Zap size={20} fill="currentColor" />
                            <span className="font-black uppercase tracking-widest text-sm">+50 XP Earned!</span>
                          </motion.div>
                        )}
                        <p className="text-slate-500 mt-2 uppercase tracking-[0.3em] text-[10px] font-bold">Deep Performance Analysis Ready</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        <div className={`p-6 shadow-xl border backdrop-blur-md ${
                          theme === 'rajasthan' ? 'bg-surface/50 rounded-3xl border-accent/30' : 'bg-surface/50 border-border rounded-2xl'
                        }`}>
                          <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Accuracy dashboard</h4>
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold font-mono text-main">{getScore()}/{questions.length}</div>
                            <div className="h-10 w-px bg-border mx-2"></div>
                            <div className="flex-1">
                               <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${(getScore() / questions.length) * 100}%` }}
                                   className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                                 />
                               </div>
                               <p className="text-[10px] text-muted mt-2 font-bold uppercase">{Math.round((getScore() / questions.length) * 100)}% Match rate</p>
                            </div>
                          </div>
                        </div>

                        <div className={`p-6 shadow-sm border ${
                          theme === 'rajasthan' ? 'bg-white rounded-3xl border-rose-100 shadow-rose-100/20' : 'bg-white border-slate-200'
                        }`}>
                          <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-4">AI Story Recap</h4>
                          <button 
                            onClick={() => setScreen('VIDEO_STUDIO')}
                            className="w-full py-4 bg-rose-50 text-rose-600 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-100 transition-all border border-rose-100"
                          >
                            <Sparkles size={16} /> GENERATE RECAP REEL
                          </button>
                        </div>

                         <div className={`p-6 shadow-md border ${
                           theme === 'rajasthan' ? 'bg-white rounded-3xl border-orange-500 shadow-orange-100/10' : 'bg-white border-slate-200 rounded-2xl shadow-sm'
                         }`}>
                           <h4 className="text-[10px] font-black text-[#2563eb] uppercase tracking-widest mb-3 flex items-center gap-1">
                             <Award size={14} /> Official Statement of Marks
                           </h4>
                           <div className="space-y-1.5 text-xs text-slate-700">
                             <div className="flex justify-between border-b border-slate-100 pb-1 font-bold">
                               <span className="flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                 <span>Correct (+2.00):</span>
                               </span>
                               <span className="text-emerald-600 font-mono">+{ (getScore() * 2).toFixed(2) } ({getScore()})</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-100 pb-1 font-bold">
                               <span className="flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                 <span>Wrong (-0.33):</span>
                               </span>
                               <span className="text-rose-600 font-mono">-{ (getIncorrectCount() * 0.33).toFixed(2) } ({getIncorrectCount()})</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-100 pb-1 font-bold">
                               <span className="flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                 <span>Skipped (0.00):</span>
                               </span>
                               <span className="text-slate-500 font-mono">0.00 ({getSkippedCount()})</span>
                             </div>
                             <div className="flex justify-between pt-1.5 font-black text-sm text-slate-900 bg-blue-50 p-2 rounded-lg items-center mt-2.5">
                               <span>NET MARKS:</span>
                               <span className="text-blue-700 font-mono">
                                 {Math.max(0, (getScore() * 2) - (getIncorrectCount() * 0.33)).toFixed(2)} / {(questions.length * 2).toFixed(2)}
                               </span>
                             </div>
                           </div>
                         </div>

                        <div className={`p-6 shadow-sm border ${
                          theme === 'rajasthan' ? 'bg-white rounded-3xl border-teal-600' : 'bg-white border-slate-200'
                        }`}>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Vitals & Pace</h4>
                          <div className="flex items-center gap-4">
                             <Timer className="text-slate-300" size={24} />
                             <div>
                                <span className="text-2xl font-mono font-bold text-main">{formatTime(quizTimer)}</span>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Total Duration</p>
                             </div>
                          </div>
                        </div>

                        <div className={`p-6 shadow-sm border md:col-span-2 lg:col-span-1 ${
                          theme === 'rajasthan' ? 'bg-white rounded-3xl border-orange-500' : 'bg-white border-slate-200'
                        }`}>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Study Insight</h4>
                          <div className="flex items-start gap-3">
                            <Zap size={16} className="text-accent shrink-0" />
                            <p className="text-xs text-slate-500 italic leading-relaxed">
                              Focus on <span className="text-main font-bold">"{config.subject}"</span>. Your response time was optimal, but consistency peaked in the first half.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Summary Card */}
                        <div className={`p-6 md:p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px] md:h-80 shadow-2xl ${
                          theme === 'rajasthan' ? 'bg-gradient-to-br from-rose-800 to-rose-950 rounded-[2rem]' : 'bg-brand-bg rounded-2xl'
                        }`}>
                           <div className="relative z-10">
                             <h4 className="text-[10px] font-bold opacity-60 uppercase tracking-[0.3em] mb-2">Examination Score</h4>
                             <p className="text-5xl md:text-7xl font-mono font-bold italic tracking-tighter">{getScore()} <span className="text-xl md:text-2xl opacity-40 font-serif not-italic">/ {questions.length}</span></p>
                           </div>
                           
                           <div className="relative z-10">
                              <div className="flex -space-x-2 mb-4">
                                {[1, 2, 3, 4].map(i => (
                                  <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-bg bg-primary flex items-center justify-center text-[10px] font-bold">#{i}</div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-brand-bg bg-slate-800 flex items-center justify-center text-[10px] font-bold hidden xs:flex">+RPSC</div>
                              </div>
                              <p className="text-xs md:text-sm font-light leading-relaxed text-slate-300">You outperformed <span className="text-white font-bold">82% of peers</span> in the {config.difficulty} module.</p>
                           </div>

                           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                        </div>

                        {/* Analysis Card */}
                        <div className={`p-8 flex flex-col shadow-sm border ${
                          theme === 'rajasthan' ? 'bg-white rounded-[2rem] border-amber-500' : 'bg-white border-slate-200 rounded-2xl'
                        }`}>
                           <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2 flex items-center gap-2">
                             <Activity size={14} /> Subject Vitals
                           </h3>
                           <div className="space-y-6 flex-1">
                             <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-150 transition-transform"></div>
                                   <span className="text-sm font-bold text-slate-700">MCQ Accuracy</span>
                                </div>
                                <span className="text-sm font-mono font-bold text-main">{Math.round((getScore() / questions.length) * 100)}%</span>
                             </div>
                             <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
                                   <span className="text-sm font-bold text-slate-700">Processing Pace</span>
                                </div>
                                <span className="text-sm font-mono font-bold text-main">{Math.round(quizTimer / questions.length)}s per item</span>
                             </div>
                             <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:scale-150 transition-transform"></div>
                                   <span className="text-sm font-bold text-slate-700">System Difficulty</span>
                                </div>
                                <span className="text-sm font-mono font-bold text-main italic px-2 bg-slate-100 rounded text-[10px] uppercase tracking-tighter">{config.difficulty}</span>
                             </div>
                           </div>

                           <div className="mt-8 grid grid-cols-2 gap-4">
                              <button 
                                onClick={handleStartQuiz}
                                className="touch-target bg-primary text-white font-bold text-[10px] uppercase tracking-widest py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                              >
                                <RotateCcw size={14} /> Re-Generate
                              </button>
                              <button 
                                onClick={() => setScreen('HOME')}
                                className="touch-target bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                              >
                                Exit Session <ChevronRight size={14} />
                              </button>
                           </div>
                        </div>
                      </div>


                      {/* AI-Powered Smart Recommendations */}
                      <SmartRecommendations 
                        stats={{
                          recentSubject: config.subject,
                          accuracy: getScore() / questions.length,
                          weakTopics: Array.from(new Set(mistakes.map(m => m.question.split(' ')[0]))).slice(0, 3) 
                        }} 
                        onVideoSelect={(video) => {
                          feedback('click');
                          setPlayingVideo(video);
                        }}
                      />

                      {/* Detailed Answer Key (Exam Analysis) */}
                      <div className="mt-12">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-display font-bold italic text-main tracking-tight flex items-center gap-3">
                               <Info size={24} className="text-primary text-main" /> विकल्प एवं सटीक विश्लेषण <span className="text-primary">(Detailed Analysis)</span>
                            </h3>
                            <div className="flex gap-2">
                               <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-200">Correct: {getScore()}</span>
                               <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-200">Wrong: {getIncorrectCount()}</span>
                            </div>
                         </div>
                         
                         <div className="space-y-6">
                            {questions.map((q, idx) => (
                              <div key={q.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                 <div className="p-5 md:p-6 border-b border-slate-50">
                                    <div className="flex items-start gap-4">
                                       <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0">
                                          {idx + 1}
                                       </span>
                                       <div className="flex-1">
                                          <h4 className="text-base md:text-lg font-bold text-main mb-4 leading-snug">
                                             {q.question}
                                          </h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                             {Object.entries(q.options).map(([key, val]) => {
                                               const isCorrect = key === q.correctAnswer;
                                               const isSelected = key === userAnswers[idx];
                                               
                                               let statusClass = "border-slate-100 bg-slate-50 text-slate-600";
                                               if (isCorrect) statusClass = "border-green-200 bg-green-50 text-green-700 font-bold ring-1 ring-green-100";
                                               if (isSelected && !isCorrect) statusClass = "border-red-200 bg-red-50 text-red-700 font-bold ring-1 ring-red-100";

                                               return (
                                                 <div key={key} className={`flex items-center gap-3 p-3 border rounded-xl text-xs transition-all ${statusClass}`}>
                                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold shrink-0 ${isCorrect ? 'bg-green-500 text-white' : (isSelected ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400')}`}>
                                                       {key}
                                                    </span>
                                                    <span className="flex-1">{val}</span>
                                                    {isCorrect && <CheckCircle2 size={14} className="text-green-500" />}
                                                    {isSelected && !isCorrect && <XCircle size={14} className="text-red-500" />}
                                                 </div>
                                               );
                                             })}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                       <div className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                          <BrainCircuit size={14} /> Guruji's Trick
                                       </div>
                                       <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium italic">
                                          {q.teacherInsight}
                                       </p>
                                    </div>
                                    <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                                       <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                          <Info size={12} /> Expert Explanation
                                       </div>
                                       <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed">
                                          {q.explanation}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Sidebar Right: Info Panel (Only in Quiz) */}
              {screen === 'QUIZ' && !loading && (
                <aside className="hidden xl:flex w-80 bg-white border-l border-slate-200 p-8 flex flex-col gap-8 shrink-0">
                  <div className="p-6 bg-brand-bg text-white rounded overflow-hidden relative group">
                     <div className="relative z-10">
                       <h4 className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Session Score</h4>
                       <p className="text-4xl font-mono font-bold italic">{getScore()} <span className="text-lg opacity-40 font-serif not-italic">pts</span></p>
                       <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(getScore() / questions.length) * 100}%` }}></div>
                       </div>
                     </div>
                     <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary rounded-full opacity-30 group-hover:scale-125 transition-transform duration-700"></div>
                   </div>

                   <div>
                     <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Topic Metrics</h3>
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                           <div className="flex items-center justify-between text-xs">
                             <span className="text-slate-500 font-medium">{config.subject} Concepts</span>
                             <span className="font-bold text-slate-900">{Math.round((currentIndex / questions.length) * 100)}% Coverage</span>
                           </div>
                           <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${(currentIndex / questions.length) * 100}%` }}></div>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div className="mt-auto">
                             <div className="p-5 border border-primary/10 bg-primary/5 rounded relative overflow-hidden">
                        <div className="w-1 h-full bg-primary absolute left-0 top-0"></div>
                        <p className="text-[9px] text-primary font-bold uppercase mb-2 flex items-center gap-1"><Zap size={10} /> AI Recommendation</p>
                        <p className="text-xs text-primary/80 leading-snug font-medium">
                          "Maintain your pace. High accuracy in early questions suggests you can transition to more complex topics."
                        </p>
                     </div>
                   </div>
                </aside>
              )}
            </main>

            {/* Footer Bar */}
            <footer className="h-10 bg-brand-bg text-slate-500 text-[10px] uppercase tracking-[0.2em] flex items-center justify-between px-4 md:px-8 shrink-0">
              <span className="flex items-center gap-2">AI Engine <span className="hidden xs:inline">v2.4</span> <span className="opacity-30">|</span> <span className="text-primary italic font-bold">RPSC Optimized</span></span>
              <div className="flex gap-6 items-center">
                <span className="hidden md:inline">ClickCraft v1.0 <span className="opacity-30">|</span> Session ID: AIQ-2024-{quizTimer}</span>
                <span className="flex items-center gap-1.5 text-primary"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div> <ShieldCheck size={12} /> <span className="hidden xs:inline">Secure Portal</span></span>
              </div>
            </footer>

            <AnimatePresence>
              {isMapOpen && (
                <RiverMap onClose={() => setIsMapOpen(false)} feedback={feedback} />
              )}
              {isRajasthanMapOpen && (
                <RajasthanMap onClose={() => setIsRajasthanMapOpen(false)} />
              )}
              {isVideoLibraryOpen && (
                <VideoLibrary onClose={() => setIsVideoLibraryOpen(false)} />
              )}
              {playingVideo && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[500] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-6"
                >
                  <div className="w-full max-w-4xl bg-white sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col h-full sm:h-auto">
                    <VideoAnalysis 
                      video={playingVideo} 
                      onClose={() => setPlayingVideo(null)} 
                      onSeek={(seconds) => {
                        const iframe = document.getElementById('player-iframe') as HTMLIFrameElement;
                        if (iframe && iframe.contentWindow) {
                          iframe.contentWindow.postMessage(JSON.stringify({
                            event: 'command',
                            func: 'seekTo',
                            args: [seconds, true]
                          }), '*');
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
