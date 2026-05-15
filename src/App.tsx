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
  X
} from 'lucide-react';

const formatQuestionText = (text: string) => {
  if (!text) return "";
  // Add space after common punctuation (Hindi and English) if missing
  return text.replace(/([।.,:;?!])([^\s])/g, '$1 $2');
};

const HighlightedText = ({ text }: { text: string }) => {
  if (!text) return null;
  
  // RPSC/GK related keywords to highlight
  const keywords = [
    { regex: /(Rajasthan|राजस्थान|Marwar|Mewar)/gi, color: 'text-amber-500 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' },
    { regex: /(Jaipur|Ajmer|Udaipur|Jodhpur|Bikaner|Kota|Bharthari|Chittorgarh)/gi, color: 'text-amber-400 font-bold' },
    { regex: /(202[0-9]|20[0-9]{2}|19[0-9]{2}|18[0-9]{2}|17[0-9]{2})/g, color: 'text-purple-500 font-bold underline decoration-purple-500/30' },
    { regex: /(Ganga|Luni|Chambal|Aravalli|Mahi|Yamuna|Indus|Narmada)/gi, color: 'text-blue-500 font-semibold drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' },
    { regex: /(RPSC|RAS|REET|UPSC|Bilingual|SSC)/gi, color: 'text-rose-500 font-black' },
    { regex: /(Article|Constitution|Fundamental Rights|Preamble|Governor|President|Prime Minister)/gi, color: 'text-emerald-500 font-bold' },
    { regex: /(Science|Math|History|Geography|Reasoning|Grammar)/gi, color: 'text-primary font-bold' },
    // Numbers, Currencies, Percentages, Formulas
    { regex: /(₹?\s?\d+[,.]?\d*%?)/g, color: 'text-pink-500 font-black drop-shadow-[0_0_4px_rgba(236,72,153,0.3)] underline decoration-pink-500/20' }
  ];

  let parts: (string | ReactNode)[] = [text];

  keywords.forEach(({ regex, color }) => {
    let newParts: (string | ReactNode)[] = [];
    parts.forEach(part => {
      if (typeof part === 'string') {
        const splitParts = part.split(regex);
        const matches = part.match(regex);
        
        splitParts.forEach((subPart, i) => {
          newParts.push(subPart);
          if (matches && matches[i]) {
            newParts.push(<span key={`${i}-${matches[i]}`} className={color}>{matches[i]}</span>);
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return <>{parts}</>;
};

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
  const [screen, setScreen] = useState<'LANDING' | 'INTRO' | 'AUTH' | 'HOME' | 'SETUP' | 'RULES' | 'QUIZ' | 'RESULTS'>('LANDING');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { currentTheme, setTheme, recommendedThemeId, availableThemes } = useAppTheme();
  const theme = currentTheme.id.includes('rajasthan') ? 'rajasthan' : 'geometric';

  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [hasSavedQuiz, setHasSavedQuiz] = useState(false);
  
  // Selection state
  const [config, setConfig] = useState<QuizConfig>({
    subject: 'Rajasthan GK',
    difficulty: 'Medium',
    language: 'English',
    questionCount: 10,
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [reportedQuestions, setReportedQuestions] = useState<number[]>([]);

  const { feedback } = useFeedback();

  // Fetch RPSC Notifications
  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const data = await fetchRPSCNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === 'HOME') {
      loadNotifications();
    }
  }, [screen, loadNotifications]);

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
    setScreen('QUIZ');
    try {
      const generatedQuestions = await generateQuizQuestions(config);
      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));
      setCurrentIndex(0);
      setQuizTimer(0);
      setIsAnswered(false);
    } catch (error) {
      alert("Error generating quiz. Please try again.");
      setScreen('SETUP');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    
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
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
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
    nextQuestion();
  };

  const prevQuestion = () => {
    feedback('click');
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsAnswered(true); // Assuming they already answered, if not it just shows question
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
            className="flex flex-col items-center justify-center min-h-screen bg-transparent text-slate-900 p-6"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary rounded flex items-center justify-center text-white font-bold text-3xl shadow-lg font-display">A</div>
              <h1 className="text-4xl font-bold tracking-tight font-display">RPSC <span className="text-primary underline underline-offset-8 decoration-2 italic">AI-Quizzer</span></h1>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-xl font-light tracking-wide text-slate-300">आपकी तैयारी का स्मार्ट साथी!</p>
              <p className="text-sm uppercase tracking-[0.3em] mt-4 text-primary font-bold">Initializing Engine</p>
            </motion.div>
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
            {/* Header Navigation */}
            <header className="top-bar">
                <div className="logo-area cursor-pointer" onClick={() => setScreen('HOME')}>
                  <div className="logo-circle transition-transform active:scale-95 shadow-lg">
                    {theme === 'rajasthan' ? <Castle size={20} /> : 'A'}
                  </div>
                  <div>
                    <div className="logo-title">
                      RPSC <span className="text-primary underline decoration-2 underline-offset-4">AI-Quizzer</span>
                    </div>
                    <div className="logo-sub">PREMIUM EXAM PORTAL</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
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
                  
                  <div className="flex items-center gap-1 md:gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPersonalizationOpen(true)}
                      className="top-btn flex items-center gap-2 group"
                    >
                      <Palette size={18} className="text-primary transition-all duration-500 group-hover:rotate-[30deg]" />
                      <span className="hidden md:inline uppercase tracking-widest text-[11px]">Themes</span>
                    </motion.button>

                    <div className="hidden xs:block h-6 md:h-8 w-px bg-slate-200 mx-1 md:mx-2"></div>

                  {user && (
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="flex flex-col items-end hidden lg:flex">
                        <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1 ${theme === 'rajasthan' ? 'text-orange-200 opacity-80' : 'text-slate-400'}`}>Authenticated</span>
                        <span className={`text-xs font-bold ${theme === 'rajasthan' ? 'text-white' : 'text-main'}`}>{user.name}</span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        title="Logout"
                        className={`p-1.5 md:p-2 transition-colors ${theme === 'rajasthan' ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-red-500'}`}
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  )}

                  {screen === 'QUIZ' && (
                    <button 
                      onClick={() => setScreen('RESULTS')}
                      className="px-3 md:px-6 py-1.5 md:py-2 bg-slate-900 text-white text-xs md:text-sm font-semibold rounded hover:bg-slate-800 transition-colors shadow-sm ml-1 md:ml-4"
                    >
                      Submit
                    </button>
                  )}
                  {screen === 'RESULTS' && (
                    <button 
                      onClick={() => setScreen('HOME')}
                      className="px-3 md:px-6 py-1.5 md:py-2 bg-primary text-white text-xs md:text-sm font-semibold rounded hover:brightness-110 transition-all shadow-sm ml-1 md:ml-4"
                    >
                      Exit
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
                  {screen === 'HOME' && (
                    <motion.div
                      key="home-grid"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-4xl mx-auto w-full"
                    >
                      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4 md:gap-6">
                        <div>
                          <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Select Examination Subject</span>
                          <h2 className="text-2xl md:text-4xl font-display mt-1 md:mt-2 text-main italic">RPSC <span className="text-primary">Practice Portal</span></h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 md:gap-4 items-center">
                          {streak > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-2xl shadow-sm">
                              <span className="text-xl">🔥</span>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter">Streak</span>
                                <span className="text-sm font-bold text-orange-700 leading-none">{streak} Days</span>
                              </div>
                            </div>
                          )}

                          {xp > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm">
                              <Zap size={16} className="text-indigo-500 fill-indigo-500" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Total XP</span>
                                <span className="text-sm font-bold text-indigo-700 leading-none">{xp}</span>
                              </div>
                            </div>
                          )}

                          {mistakes.length > 0 && (
                            <button 
                              onClick={startMistakeReview}
                              className={`flex items-center gap-2 px-6 py-3 font-bold border-b-2 transition-all uppercase text-xs tracking-widest ${
                                theme === 'rajasthan' 
                                  ? 'bg-rose-800 text-white rounded-2xl border-rose-900 shadow-rose-900/20 shadow-lg' 
                                  : 'bg-accent text-white rounded-sm border-accent/40 shadow-accent/20 shadow-lg'
                              } hover:brightness-110`}
                            >
                              <BrainCircuit size={16} /> Review Mistakes ({mistakes.length})
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Gamification Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Daily Challenge Card */}
                        <div className={`col-span-1 md:col-span-2 p-5 md:p-8 rounded-3xl border-2 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 relative overflow-hidden group ${
                          dailyDone 
                            ? 'bg-slate-50 border-slate-200 opacity-80' 
                            : 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-600 text-white'
                        }`}>
                          <div className="flex-1 relative z-10 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                              <Sun size={20} className={dailyDone ? 'text-slate-400' : 'text-white animate-spin-slow'} />
                              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Daily Challenge</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-display font-bold mb-2">10 MCQs Rapid Fire</h3>
                            <p className={`text-xs md:text-sm mb-6 ${dailyDone ? 'text-slate-500' : 'text-white/80'}`}>
                              {dailyDone ? 'You completed today\'s challenge! Return tomorrow.' : 'Finish in 5 minutes to earn the "Daily Warrior" badge.'}
                            </p>
                            
                            {!dailyDone && (
                              <button 
                                onClick={startDailyChallenge}
                                className="px-6 py-2.5 bg-white text-orange-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                              >
                                Start Challenge
                              </button>
                            )}
                            {dailyDone && (
                              <div className="flex items-center justify-center sm:justify-start gap-2 text-green-600 font-bold text-sm">
                                <CheckCircle2 size={18} /> Completed 
                              </div>
                            )}
                          </div>
                          <div className={`w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shrink-0 relative z-10 ${dailyDone ? 'grayscale opacity-20' : ''}`}>
                             <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                             <Star size={48} className="text-white drop-shadow-lg md:hidden" />
                             <Star size={64} className="text-white drop-shadow-lg hidden md:block" />
                          </div>
                        </div>

                        {/* Resume / Badges Panel */}
                        <div className="flex flex-col gap-6">
                           {hasSavedQuiz && (
                             <motion.button
                               initial={{ x: 20, opacity: 0 }}
                               animate={{ x: 0, opacity: 1 }}
                               onClick={restoreQuiz}
                               className="p-6 bg-slate-900 rounded-3xl text-white border border-slate-700 shadow-xl group relative overflow-hidden"
                             >
                                <div className="relative z-10">
                                   <div className="flex items-center gap-2 mb-2">
                                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Active Session</span>
                                   </div>
                                   <h3 className="text-xl font-display font-bold mb-1">Resume Test</h3>
                                   <p className="text-[10px] text-slate-400 italic">Curated: {config.subject}</p>
                                </div>
                                <Activity className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" size={100} />
                             </motion.button>
                           )}

                           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex-1">
                           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Award size={14} /> Unlocked Badges
                           </h3>
                           <div className="flex flex-wrap gap-3">
                             {badges.length === 0 ? (
                               <p className="text-xs text-slate-400 italic">Complete quizzes to unlock achievement badges.</p>
                             ) : (
                               badges.map(b => (
                                 <div key={b} className="group relative">
                                   <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-help shadow-sm">
                                     <Award size={18} />
                                   </div>
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                     {b}
                                   </div>
                                 </div>
                               ))
                             )}
                           </div>
                        </div>
                      </div>

                    </div>

                    {/* Interactive Map Explorer Card */}
                    <div className="mb-6 p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl shadow-xl shadow-indigo-200 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110"></div>
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                          <h3 className="text-xl md:text-2xl font-black text-white flex items-center justify-center md:justify-start gap-3 font-display">
                            <Compass className="text-amber-400 animate-pulse" /> 
                            Rajasthan GK Explorer Map
                          </h3>
                          <p className="text-indigo-100 mt-2 text-sm md:text-base max-w-lg">
                            Visually explore key historical forts, lakes, and administrative centers. Perfect for memorizing geographical locations for RAS & RPSC exams.
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            feedback('royal');
                            setIsRajasthanMapOpen(true);
                          }}
                          className="px-8 py-3 bg-white text-indigo-700 font-black rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm uppercase tracking-widest whitespace-nowrap"
                        >
                          Launch Map <ChevronRight size={18} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Gurukul TV Video Card */}
                    <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="p-6 bg-slate-900 rounded-3xl shadow-xl relative overflow-hidden group border border-slate-700">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-red-600/20 transition-all"></div>
                          <div className="relative z-10">
                             <div className="flex items-center gap-3 mb-4">
                               <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40">
                                 <Play size={20} className="text-white fill-white" />
                               </div>
                               <div>
                                 <h3 className="text-lg font-display font-bold text-white">Gurukul TV</h3>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Video Library</p>
                               </div>
                             </div>
                             <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                               Watch expert lectures, quick GK shorts, and exam strategy sessions curated specifically for RPSC aspirants.
                             </p>
                             <button
                               onClick={() => {
                                 feedback('click');
                                 setIsVideoLibraryOpen(true);
                               }}
                               className="w-full py-3 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                             >
                               Start Watching <ChevronRight size={14} />
                             </button>
                          </div>
                       </div>

                       <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-all">
                          <div>
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                               <Zap size={20} className="text-purple-600 fill-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">GK Shorts</h3>
                            <p className="text-xs text-slate-500">60-second tricks to remember historical dates and geographical facts.</p>
                          </div>
                          <div className="mt-6 flex items-center justify-between">
                             <div className="flex -space-x-2">
                                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>)}
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">+12</div>
                             </div>
                             <button 
                               onClick={() => {
                                 feedback('click');
                                 setIsVideoLibraryOpen(true);
                               }}
                               className="text-xs font-black text-primary hover:underline uppercase tracking-wide"
                             >
                               View All
                             </button>
                          </div>
                       </div>
                    </div>

                    {/* Latest RPSC Notifications Section */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-sm md:text-base font-bold text-slate-800 flex items-center gap-2">
                          <Zap size={18} className="text-amber-500 fill-amber-500" /> 
                          Latest RPSC Notifications & Exam Dates
                        </h3>
                        <button 
                          onClick={loadNotifications}
                          className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                          disabled={notifLoading}
                        >
                          <RotateCcw size={10} className={notifLoading ? 'animate-spin' : ''} /> Refresh
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notifLoading ? (
                          Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse" />
                          ))
                        ) : notifications.length > 0 ? (
                          notifications.map((notif, idx) => (
                            <motion.a
                              key={idx}
                              href={notif.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all group flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                    notif.type === 'EXAM' ? 'bg-indigo-100 text-indigo-700' : 
                                    notif.type === 'RESULT' ? 'bg-green-100 text-green-700' : 
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {notif.type}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400">{notif.date}</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{notif.title}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{notif.description}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                View Official Notice <ChevronRight size={10} />
                              </div>
                            </motion.a>
                          ))
                        ) : (
                          <div className="col-span-full p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                            <p className="text-xs text-slate-400">Failed to load real-time notifications. Try refreshing.</p>
                          </div>
                        )}
                      </div>
                    </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((sub, idx) => (
                          <motion.button
                            key={sub.name}
                            whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                            onClick={() => startSetup(sub.name)}
                            className={`p-6 border text-left transition-all group relative overflow-hidden ${
                              theme === 'rajasthan' 
                                ? 'bg-white rounded-3xl border-orange-200 shadow-md shadow-orange-100 hover:shadow-xl' 
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            {sub.name === 'Daily Live Quiz' && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse z-10">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                LIVE
                              </div>
                            )}
                            <div className={`w-10 h-10 ${
                              theme === 'rajasthan' ? 'bg-rose-800' : (sub.color.includes('blue') ? 'bg-primary' : sub.color)
                            } text-white flex items-center justify-center rounded-sm mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                              <sub.icon size={20} />
                            </div>
                            <h3 className={`text-lg font-bold underline underline-offset-4 pointer-events-none ${
                                theme === 'rajasthan' ? 'text-rose-900 decoration-orange-100 group-hover:decoration-rose-500' : 'text-slate-800 decoration-slate-200 group-hover:decoration-primary'
                              }`}>{sub.name}</h3>
                            <p className="text-sm text-slate-500 mt-2 italic pointer-events-none">{sub.desc}</p>
                          </motion.button>
                        ))}
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
                                 <option value={10}>10 QUESTIONS</option>
                                 <option value={15}>15 QUESTIONS</option>
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
                          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                            <div className="max-w-2xl mx-auto w-full px-4 md:px-0 pt-2 pb-10 md:py-10">
                              {/* Progress Header */}
                              <div className="flex items-center justify-between mb-4 md:mb-8 pt-2">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Progress</span>
                                    <div className="flex items-center gap-3">
                                       <div className="h-2 w-32 md:w-48 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-primary to-indigo-600 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                                          />
                                       </div>
                                       <span className="text-xs font-black text-main tabular-nums">{(currentIndex + 1)}/{questions.length}</span>
                                    </div>
                                 </div>
                                 
                                 <AnimatePresence>
                                   {isAnswered && config.mode === 'instant' && (
                                     <motion.div 
                                       initial={{ scale: 0, x: 20 }}
                                       animate={{ scale: 1, x: 0 }}
                                       className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                                         userAnswers[currentIndex] === questions[currentIndex]?.correctAnswer 
                                           ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                           : 'bg-rose-50 text-rose-600 border-rose-100'
                                       }`}
                                     >
                                       {userAnswers[currentIndex] === questions[currentIndex]?.correctAnswer ? 'BRAVO! +1' : 'OOPS! -0'}
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                               </div>

                                 {/* Question Container */}
                              <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="relative bg-surface/90 backdrop-blur-xl rounded-[32px] border border-border shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-7 md:p-10 overflow-hidden mb-10 w-full"
                              >
                                <div className="flex flex-wrap items-center gap-3 mb-8">
                                  <span className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] uppercase bg-main text-surface shadow-sm">
                                    {isReviewMode ? 'REFINE AREA' : config.subject}
                                  </span>
                                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] uppercase border shadow-sm ${
                                    config.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    config.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                  }`}>
                                    {config.difficulty}
                                  </span>
                                  <span className="px-4 py-1.5 rounded-full font-bold tracking-[2px] uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 text-[9px] shadow-sm">
                                    <ShieldCheck size={12} /> AI VERIFIED
                                  </span>
                                  
                                  <AnimatePresence>
                                    {consecutiveCorrect >= 3 && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        key="streak"
                                        className="px-4 py-1.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-orange-200 shadow-sm"
                                      >
                                        <Zap size={11} fill="currentColor" /> {consecutiveCorrect} STREAK
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                               </div>
                               
                               <h2 className="text-[24px] sm:text-[28px] md:text-[32px] leading-[1.8] font-semibold tracking-wide text-main max-w-[95%] break-words whitespace-normal drop-shadow-sm">
                                   <HighlightedText text={formatQuestionText(questions[currentIndex]?.question)} />
                                </h2>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full mt-10"></div>
                              </motion.div>

                              {/* Options Grid */}
                              <div className="grid grid-cols-1 gap-5 md:gap-6 mb-12">
                                {questions[currentIndex] && Object.entries(questions[currentIndex].options).map(([key, value]) => {
                                  const isCorrect = key === questions[currentIndex].correctAnswer;
                                  const isSelected = key === userAnswers[currentIndex];
                                  const showResults = isAnswered && config.mode === 'instant';
                                  const showSelectionOnly = isAnswered && config.mode === 'exam';
                                  
                                  // Default styles (not answered yet or hovering)
                                  let btnClass = "border-border bg-surface hover:border-pink-500/50 hover:bg-pink-500/5 hover:shadow-[0_8px_30px_rgba(236,72,153,0.15)] hover:-translate-y-1";
                                  let labelClass = "bg-page text-muted group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-orange-400 group-hover:text-white group-hover:shadow-lg";

                                  // Selected but result not revealed yet (or in exam mode)
                                  if (isSelected && !showResults) {
                                    btnClass = "border-pink-500 bg-pink-500/10 shadow-[0_0_25px_rgba(236,72,153,0.25)] scale-[1.02] pointer-events-none";
                                    labelClass = "bg-gradient-to-br from-pink-500 to-orange-400 text-white shadow-lg";
                                  }

                                  // Results revealed state
                                  if (showResults) {
                                    if (isCorrect) {
                                      btnClass = "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 pointer-events-none ring-2 ring-emerald-500/20 scale-[1.02]";
                                      labelClass = "bg-emerald-500 text-white border-emerald-500 shadow-lg scale-110";
                                    } else if (isSelected) {
                                      btnClass = "border-rose-500 bg-rose-500/10 pointer-events-none";
                                      labelClass = "bg-rose-500 text-white border-rose-500 shadow-lg";
                                    } else if (value === questions[currentIndex].correctAnswer) {
                                      btnClass = "border-emerald-500 bg-emerald-500/5 pointer-events-none animate-pulse-soft";
                                      labelClass = "bg-emerald-500 text-white shadow-sm";
                                    } else {
                                      btnClass = "opacity-30 grayscale pointer-events-none border-border bg-surface shadow-none";
                                      labelClass = "bg-page text-muted";
                                    }
                                  }

                                  return (
                                    <motion.button
                                      key={key}
                                      whileHover={!isAnswered ? { scale: 1.02, y: -4 } : {}}
                                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                      onClick={() => handleSelectAnswer(key)}
                                      className={`group relative w-full min-h-[85px] flex items-center gap-5 p-5 md:p-6 border-2 transition-all text-left shadow-lg rounded-3xl z-10 ${btnClass}`}
                                    >
                                      <span className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center font-bold text-xl transition-all border border-transparent ${labelClass}`}>
                                        {key}
                                      </span>
                                      
                                      <div className={`w-px h-10 hidden md:block transition-colors ${isSelected ? 'bg-pink-500/20' : 'bg-border'}`}></div>

                                      <span className={`text-[19px] md:text-[24px] flex-1 leading-relaxed font-semibold break-words transition-colors ${
                                        isSelected && !showResults ? 'text-pink-500' : 'text-main'
                                      }`}>
                                        {value}
                                      </span>

                                      <AnimatePresence>
                                        {(isSelected && (!showResults || !isCorrect)) && (
                                          <motion.div 
                                            initial={{ scale: 0, rotate: 45 }} 
                                            animate={{ scale: 1, rotate: 0 }} 
                                            className={`absolute -right-2 -top-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white z-20 ${
                                              showResults && !isCorrect ? 'bg-rose-500' : 'bg-pink-500'
                                            }`}
                                          >
                                            {showResults && !isCorrect ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                                          </motion.div>
                                        )}
                                        {showResults && isCorrect && (
                                          <motion.div 
                                            initial={{ scale: 0, rotate: -45 }} 
                                            animate={{ scale: 1, rotate: 0 }} 
                                            className="absolute -right-2 -top-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white z-20"
                                          >
                                            <CheckCircle2 size={24} />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </motion.button>
                                  );
                                })}
                              </div>

                              {isAnswered && config.mode === 'instant' && questions[currentIndex] && (
                                <motion.div
                                  initial={{ opacity: 0, y: 30 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-8 space-y-8 pb-32"
                                >
                                  {/* Guruji's Insight Section */}
                                  <div className="bg-white/80 backdrop-blur-xl border-l-[12px] border-amber-500 p-8 md:p-10 shadow-2xl rounded-[32px] border border-slate-200/50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
                                    <div className="text-[11px] text-amber-600 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                      <div className="w-8 h-px bg-amber-500/30"></div>
                                      <BrainCircuit size={18} /> GURUJI'S PERSPECTIVE
                                    </div>
                                    <p className="text-[20px] md:text-[24px] text-slate-800 leading-relaxed font-bold mb-6 italic">
                                      "{questions[currentIndex].teacherInsight}"
                                    </p>
                                    {questions[currentIndex].patternYear && (
                                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm border border-amber-200">
                                        <Target size={12} /> Pattern Source: {questions[currentIndex].patternYear} RPSC
                                      </div>
                                    )}
                                  </div>

                                  {/* Why Other Options are Wrong */}
                                  {questions[currentIndex].wrongOptionsAnalysis && (
                                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-8 md:p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-400"></div>
                                      <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <div className="w-8 h-px bg-rose-500/30"></div>
                                        <RotateCcw size={18} /> ELIMINATION LOGIC
                                      </h4>
                                      <div className="grid grid-cols-1 gap-6">
                                        {(['A', 'B', 'C', 'D'] as const).map(key => (
                                          <div key={key} className={`p-6 rounded-[24px] border-2 flex items-start gap-5 transition-all group ${key === questions[currentIndex].correctAnswer ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 'bg-slate-50/50 border-slate-50 opacity-80 hover:opacity-100 hover:bg-white hover:border-slate-100'}`}>
                                            <span className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md transition-all ${key === questions[currentIndex].correctAnswer ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 group-hover:bg-rose-500 group-hover:text-white'}`}>
                                              {key}
                                            </span>
                                            <span className="text-[17px] md:text-[19px] text-slate-700 font-semibold leading-relaxed">
                                              {(questions[currentIndex].wrongOptionsAnalysis as any)[key]}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Youtube Video Player */}
                                  {questions[currentIndex].videoUrl && (
                                    <div className="space-y-6">
                                      <div className="flex items-center justify-between">
                                        <div className="text-[12px] text-rose-600 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                          <Zap size={18} className="fill-rose-500 animate-pulse" /> CONCEPT RECAP
                                        </div>
                                        <a 
                                          href={`https://www.youtube.com/watch?v=${
                                            questions[currentIndex].videoUrl.includes('v=') 
                                              ? questions[currentIndex].videoUrl.split('v=')[1]?.split('&')[0] 
                                              : questions[currentIndex].videoUrl
                                          }`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.2em]"
                                        >
                                          WATCH ON YOUTUBE
                                        </a>
                                      </div>
                                      <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] shadow-2xl bg-black border-8 border-white ring-1 ring-slate-100">
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
                          theme === 'rajasthan' ? 'bg-white rounded-3xl border-teal-600' : 'bg-white border-slate-200'
                        }`}>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Detailed Performance</h4>
                          <div className="grid grid-cols-3 gap-2">
                             <div className="text-center">
                                <p className="text-lg font-bold text-green-600">{getScore()}</p>
                                <p className="text-[8px] uppercase font-bold text-slate-400">Correct</p>
                             </div>
                             <div className="text-center">
                                <p className="text-lg font-bold text-red-500">{getIncorrectCount()}</p>
                                <p className="text-[8px] uppercase font-bold text-slate-400">Wrong</p>
                             </div>
                             <div className="text-center">
                                <p className="text-lg font-bold text-slate-400">{getSkippedCount()}</p>
                                <p className="text-[8px] uppercase font-bold text-slate-400">Skipped</p>
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
