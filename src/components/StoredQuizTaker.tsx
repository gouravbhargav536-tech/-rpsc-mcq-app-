import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Pause, 
  Play, 
  Clock, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  Award,
  BookOpen,
  HelpCircle,
  BarChart3,
  AlertTriangle,
  Check,
  X,
  Timer,
  Target,
  FileText
} from 'lucide-react';
import defaultQuestionsData from '../data/questions.json';
import { RRB_GROUP_D_QUESTIONS, Question as RRBQuestion } from '../data/rrbGroupDPaper';
import { ENGLISH_GRAMMAR_QUESTIONS } from '../data/englishGrammarPaper';

interface StoredQuizTakerProps {
  onExit: () => void;
  category?: string;
}

export default function StoredQuizTaker({ onExit, category }: StoredQuizTakerProps) {
  const [allRawQuestions, setAllRawQuestions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Persistent user answers map across section switching
  // Key: question id or question string, Value: selected option index
  const [userAnswersMap, setUserAnswersMap] = useState<Record<string | number, number>>({});
  
  // Per-question time spent tracking in seconds
  const [timeSpentMap, setTimeSpentMap] = useState<Record<string | number, number>>({});

  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [initialTime, setInitialTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSectionMenu, setShowSectionMenu] = useState<boolean>(false);
  
  // Results view filter: 'mistakes' | 'unattempted' | 'correct' | 'all'
  const [reviewFilter, setReviewFilter] = useState<'mistakes' | 'unattempted' | 'correct' | 'all'>('mistakes');

  // Available sections definition
  const sectionsList = [
    { key: 'all', label: 'All Sections (75 Qs)', icon: '📚', count: 75 },
    { key: 'science', label: 'General Science', icon: '🔬', count: 15 },
    { key: 'math', label: 'Mathematics', icon: '📐', count: 10 },
    { key: 'reasoning', label: 'Reasoning', icon: '🧩', count: 10 },
    { key: 'current_affairs', label: 'Current Affairs 2026', icon: '📰', count: 40 },
  ];

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        let loadedQs: any[] = [];

        if (category === 'rrb_group_d') {
          loadedQs = RRB_GROUP_D_QUESTIONS;
        } else if (category === 'english') {
          loadedQs = ENGLISH_GRAMMAR_QUESTIONS;
        } else {
          const snap = await getDocs(collection(db, 'quizzes'));
          let qData = snap.docs.map(doc => doc.data());
          
          if (category) {
            qData = qData.filter(q => q.category === category);
          }

          if (qData.length === 0) {
            const jsonMatch = defaultQuestionsData.questions.filter(q => !category || q.category === category);
            const rrbMatch = RRB_GROUP_D_QUESTIONS.filter(q => !category || q.sectionKey === category);
            qData = [...rrbMatch, ...jsonMatch];
          }
          loadedQs = qData.length > 0 ? qData : RRB_GROUP_D_QUESTIONS;
        }

        setAllRawQuestions(loadedQs);
        
        // Initial setup
        setQuestions(loadedQs);
        setCurrentIndex(0);
        const totalSecs = Math.max(60, loadedQs.length * 45);
        setTimeLeft(totalSecs);
        setInitialTime(totalSecs);
      } catch (err) {
        console.error("Error fetching questions, falling back to RRB Group D Paper:", err);
        setAllRawQuestions(RRB_GROUP_D_QUESTIONS);
        setQuestions(RRB_GROUP_D_QUESTIONS);
        setCurrentIndex(0);
        const totalSecs = Math.max(60, RRB_GROUP_D_QUESTIONS.length * 45);
        setTimeLeft(totalSecs);
        setInitialTime(totalSecs);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [category]);

  // Section switcher without wiping existing answers or time spent
  const applySectionFilter = (secKey: string) => {
    setSelectedSection(secKey);
    let filtered = allRawQuestions;
    if (secKey !== 'all') {
      filtered = allRawQuestions.filter(q => q.sectionKey === secKey || q.category === secKey);
      if (filtered.length === 0) {
        filtered = allRawQuestions;
      }
    }
    setQuestions(filtered);
    setCurrentIndex(0);
    setIsPaused(false);
  };

  const currentQ = questions[currentIndex];
  const currentKey = currentQ ? (currentQ.id ?? currentQ.q) : '';

  // Timer & Per-Question Time Spent Tracker
  useEffect(() => {
    if (loading || finished || isPaused || timeLeft <= 0 || !currentQ) return;

    const interval = setInterval(() => {
      // Increment overall time countdown
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setFinished(true); // Auto-submit exam when time runs out
          return 0;
        }
        return prev - 1;
      });

      // Track time spent on the active question
      const qKey = currentQ.id ?? currentQ.q;
      if (qKey !== undefined) {
        setTimeSpentMap(prev => ({
          ...prev,
          [qKey]: (prev[qKey] || 0) + 1
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, finished, isPaused, timeLeft, currentQ]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white rounded-3xl shadow-xl text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
        <p className="text-slate-600 font-medium">Loading RRB Group D Paper & Questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4 text-slate-800">No Questions Available</h2>
        <p className="text-slate-500 mb-6">No questions found for this section.</p>
        <button onClick={onExit} className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium">
          Back to Home
        </button>
      </div>
    );
  }

  const handleAnswer = (optIdx: number) => {
    if (isPaused || finished) return;
    const qKey = currentQ.id ?? currentQ.q;
    setUserAnswersMap(prev => ({
      ...prev,
      [qKey]: optIdx
    }));
  };

  const handleNext = () => {
    if (isPaused) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(p => p + 1);
    } else {
      setFinished(true);
    }
  };

  const handleBack = () => {
    if (isPaused) return;
    if (currentIndex > 0) {
      setCurrentIndex(p => p - 1);
    }
  };

  const handleSkip = () => {
    if (isPaused) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(p => p + 1);
    } else {
      setFinished(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-save results to Firebase when finished
  useEffect(() => {
    if (finished) {
      const saveResults = async () => {
        try {
          // Temporarily calculate stats here for saving
          const targetSet = allRawQuestions.length > 0 ? allRawQuestions : questions;
          let correctCount = 0; let wrongCount = 0; let unattemptedCount = 0;
          let totalTimeSecs = initialTime - timeLeft;
          const sectionStats: Record<string, { total: number; correct: number; wrong: number }> = {};
          
          targetSet.forEach(q => {
            const qKey = q.id ?? q.q;
            const userAns = userAnswersMap[qKey];
            const sec = q.sectionKey || q.category || 'General';
            if (!sectionStats[sec]) sectionStats[sec] = { total: 0, correct: 0, wrong: 0 };
            sectionStats[sec].total++;

            if (userAns === undefined || userAns === null) {
              unattemptedCount++;
            } else if (userAns === q.a) {
              correctCount++;
              sectionStats[sec].correct++;
            } else {
              wrongCount++;
              sectionStats[sec].wrong++;
            }
          });

          let weakestSectionName = '';
          let maxWrongSec = -1;
          Object.entries(sectionStats).forEach(([secName, data]) => {
            if (data.wrong > maxWrongSec) {
              maxWrongSec = data.wrong;
              weakestSectionName = secName;
            }
          });

          const percentage = targetSet.length > 0 ? Math.round((correctCount / targetSet.length) * 100) : 0;

          await addDoc(collection(db, 'quizAttempts'), {
            userId: auth.currentUser?.uid || 'anonymous',
            category: category || 'all',
            score: correctCount,
            totalQs: targetSet.length,
            percentage,
            correctCount,
            wrongCount,
            unattemptedCount,
            totalTimeSecs,
            weakestSection: weakestSectionName,
            timeSpentMap,
            userAnswersMap,
            timestamp: serverTimestamp(),
          });
          console.log("Quiz attempt saved to Firebase successfully.");
        } catch (e) {
          console.error("Error saving quiz attempt:", e);
        }
      };
      saveResults();
    }
  }, [finished]);

  // Compute total performance across all questions or current section
  const computeAnalytics = () => {
    const targetSet = allRawQuestions.length > 0 ? allRawQuestions : questions;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    let totalTimeSecs = initialTime - timeLeft;

    let totalTimeCorrect = 0;
    let totalTimeWrong = 0;
    let slowestQ: { question: string; time: number; index: number } | null = null;
    let maxTimeSpent = -1;

    const sectionStats: Record<string, { total: number; correct: number; wrong: number }> = {};

    targetSet.forEach((q, idx) => {
      const qKey = q.id ?? q.q;
      const userAns = userAnswersMap[qKey];
      const spent = timeSpentMap[qKey] || 0;
      const sec = q.sectionKey || q.category || 'General';

      if (!sectionStats[sec]) {
        sectionStats[sec] = { total: 0, correct: 0, wrong: 0 };
      }
      sectionStats[sec].total++;

      if (spent > maxTimeSpent) {
        maxTimeSpent = spent;
        slowestQ = { question: q.q, time: spent, index: idx + 1 };
      }

      if (userAns === undefined || userAns === null) {
        unattemptedCount++;
      } else if (userAns === q.a) {
        correctCount++;
        totalTimeCorrect += spent;
        sectionStats[sec].correct++;
      } else {
        wrongCount++;
        totalTimeWrong += spent;
        sectionStats[sec].wrong++;
      }
    });

    const score = correctCount;
    const totalQs = targetSet.length;
    const percentage = totalQs > 0 ? Math.round((score / totalQs) * 100) : 0;
    const avgTimePerQ = totalQs > 0 ? Math.round(totalTimeSecs / totalQs) : 0;
    const avgTimeCorrect = correctCount > 0 ? Math.round(totalTimeCorrect / correctCount) : 0;
    const avgTimeWrong = wrongCount > 0 ? Math.round(totalTimeWrong / wrongCount) : 0;

    // Identify section needing most improvement
    let weakestSectionName = '';
    let maxWrongSec = -1;
    Object.entries(sectionStats).forEach(([secName, data]) => {
      if (data.wrong > maxWrongSec) {
        maxWrongSec = data.wrong;
        weakestSectionName = secName;
      }
    });

    return {
      score,
      totalQs,
      correctCount,
      wrongCount,
      unattemptedCount,
      percentage,
      totalTimeSecs,
      avgTimePerQ,
      avgTimeCorrect,
      avgTimeWrong,
      slowestQ,
      weakestSectionName,
      sectionStats
    };
  };

  const getSectionScore = (secKey: string) => {
    const secQuestions = allRawQuestions.filter(q => q.sectionKey === secKey || q.category === secKey);
    if (secQuestions.length === 0) return { score: 0, total: 0 };
    const score = secQuestions.reduce((acc, q) => {
      const qKey = q.id ?? q.q;
      return userAnswersMap[qKey] === q.a ? acc + 1 : acc;
    }, 0);
    return { score, total: secQuestions.length };
  };

  const selectedAnswerIndex = currentKey !== '' ? userAnswersMap[currentKey] : undefined;
  const isCurrentAnswered = selectedAnswerIndex !== undefined && selectedAnswerIndex !== null;
  const progressPercent = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;
  const analytics = computeAnalytics();

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <button onClick={onExit} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">
          <ArrowLeft size={18} /> Exit Paper
        </button>

        <div className="flex items-center gap-2">
          {/* Section Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSectionMenu(p => !p)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all border border-indigo-200"
            >
              <Layers size={14} />
              <span>
                {sectionsList.find(s => s.key === selectedSection)?.label || 'Sections'}
              </span>
            </button>

            {showSectionMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">Switch Section</p>
                {sectionsList.map(sec => (
                  <button
                    key={sec.key}
                    onClick={() => {
                      applySectionFilter(sec.key);
                      setShowSectionMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      selectedSection === sec.key 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{sec.icon}</span>
                      <span>{sec.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!finished ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedSection}>
          {/* Quick Section Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {sectionsList.map(sec => (
              <button
                key={sec.key}
                onClick={() => applySectionFilter(sec.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  selectedSection === sec.key
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            ))}
          </div>

          {/* Timer & Controls Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`} />
              <span className={`font-mono text-lg font-bold ${timeLeft < 30 ? 'text-red-600' : 'text-slate-800'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Time spent on current question */}
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <Timer size={12} className="text-indigo-600" />
              <span>Time on Q: {timeSpentMap[currentKey] || 0}s</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(p => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isPaused 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-xs font-bold transition-colors"
              >
                <SkipForward size={14} /> Skip
              </button>
            </div>
          </div>

          {/* Timer progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-red-500' : 'bg-indigo-600'}`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {isPaused ? (
            <div className="p-12 text-center bg-amber-50/60 rounded-3xl border border-amber-200/60 my-6">
              <Pause className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Exam Paused</h3>
              <p className="text-sm text-slate-600 mb-6">Take a break. Press resume when ready to continue.</p>
              <button 
                onClick={() => setIsPaused(false)}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-sm shadow-md transition-colors inline-flex items-center gap-2"
              >
                <Play size={16} /> Resume Quiz
              </button>
            </div>
          ) : (
            <>
              {/* Question Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  {currentQ?.section && (
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">
                      {currentQ.section}
                    </span>
                  )}
                </div>
                {isCurrentAnswered && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> Answer Selected
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 leading-relaxed">
                {currentQ.q}
              </h2>

              {/* Options list */}
              <div className="grid gap-3">
                {currentQ.o.map((opt: string, idx: number) => {
                  const isSelected = selectedAnswerIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`p-4 rounded-2xl border text-left font-medium transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-semibold shadow-md ring-2 ring-indigo-500/30' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm md:text-base">{opt}</span>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="text-indigo-600 shrink-0" size={20} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center gap-3">
                <button 
                  disabled={currentIndex === 0} 
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} /> Back
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < questions.length - 1 ? (
                    <button 
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setFinished(true)} 
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Submit Paper
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      ) : (
        /* Exam Completed Results & Mistake Analysis View */
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-2">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {timeLeft <= 0 ? '⏰ Time Up! Paper Auto-Submitted' : 'Exam Completed Successfully!'}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">
              Here is your overall score and detailed question time & mistake analysis.
            </p>
          </div>

          {/* Overall Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
              <p className="text-3xl font-extrabold text-indigo-600">{analytics.score} / {analytics.totalQs}</p>
              <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mt-1">Total Score ({analytics.percentage}%)</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
              <p className="text-3xl font-extrabold text-emerald-600">{analytics.correctCount}</p>
              <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mt-1">Correct Answers</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
              <p className="text-3xl font-extrabold text-red-600">{analytics.wrongCount}</p>
              <p className="text-[11px] font-bold text-red-900 uppercase tracking-wider mt-1">Wrong Answers</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
              <p className="text-3xl font-extrabold text-amber-600">{analytics.unattemptedCount}</p>
              <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mt-1">Unattempted</p>
            </div>
          </div>

          {/* Time Analysis Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="text-amber-400" size={18} />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Total Time Spent</p>
                <p className="font-mono text-base font-bold text-white">{formatTime(analytics.totalTimeSecs)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Timer className="text-indigo-400" size={18} />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Avg Time per Question</p>
                <p className="font-mono text-base font-bold text-white">{analytics.avgTimePerQ} seconds</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="text-emerald-400" size={18} />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Accuracy Rate</p>
                <p className="font-mono text-base font-bold text-white">{analytics.percentage}%</p>
              </div>
            </div>
          </div>

          {/* Smart AI Time & Mistake Insights Summary Card */}
          <div className="p-4 md:p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl mb-8">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider mb-2">
              <BookOpen size={16} className="text-indigo-600" /> Smart Performance & Time Analysis Insights
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100/60 shadow-2xl/5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  ⏱️ Speed Breakdown
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  Spent <span className="font-bold text-emerald-600">{analytics.avgTimeCorrect}s avg</span> on correct answers vs <span className="font-bold text-red-600">{analytics.avgTimeWrong}s avg</span> on wrong answers.
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100/60 shadow-2xl/5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  🐢 Slowest Question
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {analytics.slowestQ ? (
                    <>Question #{analytics.slowestQ.index} took the longest at <span className="font-bold text-amber-600">{analytics.slowestQ.time}s</span>.</>
                  ) : (
                    <>No time data recorded.</>
                  )}
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100/60 shadow-2xl/5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  🎯 Focus Area
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {analytics.wrongCount > 0 ? (
                    <>Practice more on <span className="font-bold text-indigo-700 capitalize">{analytics.weakestSectionName.replace('_', ' ')}</span> to reduce mistakes.</>
                  ) : (
                    <>Excellent! 100% accuracy recorded across all attempted questions.</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Section Breakdown Grid */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-600" /> Section-wise Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'science', label: 'General Science', icon: '🔬' },
                { key: 'math', label: 'Mathematics', icon: '📐' },
                { key: 'reasoning', label: 'Reasoning', icon: '🧩' },
                { key: 'current_affairs', label: 'Current Affairs 2026', icon: '📰' }
              ].map(sec => {
                const { score, total } = getSectionScore(sec.key);
                if (total === 0) return null;
                const percent = Math.round((score / total) * 100);
                return (
                  <div key={sec.key} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{sec.icon}</span>
                        <span>{sec.label}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">{score} of {total} correct</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      percent >= 70 ? 'bg-emerald-100 text-emerald-800' : percent >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Question Review & Mistake Analysis */}
          <div className="border-t border-slate-200 pt-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" /> Detailed Question & Mistake Analysis
              </h3>

              {/* Review Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setReviewFilter('mistakes')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    reviewFilter === 'mistakes' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ❌ Mistakes ({analytics.wrongCount})
                </button>
                <button
                  onClick={() => setReviewFilter('unattempted')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    reviewFilter === 'unattempted' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚠️ Skipped ({analytics.unattemptedCount})
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    reviewFilter === 'correct' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✅ Correct ({analytics.correctCount})
                </button>
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    reviewFilter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📚 All ({allRawQuestions.length})
                </button>
              </div>
            </div>

            {/* Questions Review List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {allRawQuestions
                .filter(q => {
                  const qKey = q.id ?? q.q;
                  const uAns = userAnswersMap[qKey];
                  if (reviewFilter === 'mistakes') return uAns !== undefined && uAns !== null && uAns !== q.a;
                  if (reviewFilter === 'unattempted') return uAns === undefined || uAns === null;
                  if (reviewFilter === 'correct') return uAns === q.a;
                  return true;
                })
                .map((q, idx) => {
                  const qKey = q.id ?? q.q;
                  const uAns = userAnswersMap[qKey];
                  const isUnattempted = uAns === undefined || uAns === null;
                  const isCorrect = uAns === q.a;
                  const secondsSpent = timeSpentMap[qKey] || 0;

                  return (
                    <div 
                      key={qKey} 
                      className={`p-4 md:p-5 rounded-2xl border text-left transition-all ${
                        isCorrect 
                          ? 'bg-emerald-50/40 border-emerald-200' 
                          : isUnattempted 
                          ? 'bg-amber-50/40 border-amber-200' 
                          : 'bg-red-50/40 border-red-200'
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase ${
                            isCorrect 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : isUnattempted 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? '✓ Correct' : isUnattempted ? '⚠️ Skipped' : '✗ Wrong'}
                          </span>
                          {q.section && (
                            <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {q.section}
                            </span>
                          )}
                        </div>

                        {/* Time Spent on this question */}
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Timer size={12} className="text-indigo-600" />
                          <span>Time taken: {secondsSpent}s</span>
                        </div>
                      </div>

                      <p className="font-bold text-slate-900 text-sm md:text-base mb-3 leading-snug">
                        {idx + 1}. {q.q}
                      </p>

                      {/* Options Grid */}
                      <div className="grid gap-2 mb-3">
                        {q.o.map((opt: string, oIdx: number) => {
                          const isUserSelected = uAns === oIdx;
                          const isRightOption = q.a === oIdx;

                          let optionStyle = "bg-white border-slate-200 text-slate-700";
                          if (isRightOption) {
                            optionStyle = "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold";
                          } else if (isUserSelected && !isRightOption) {
                            optionStyle = "bg-red-100 border-red-400 text-red-950 font-bold";
                          }

                          return (
                            <div key={oIdx} className={`p-2.5 rounded-xl border text-xs md:text-sm flex items-center justify-between ${optionStyle}`}>
                              <span className="flex items-center gap-2">
                                <span className="font-bold uppercase">{String.fromCharCode(65 + oIdx)}.</span>
                                <span>{opt}</span>
                              </span>

                              {isUserSelected && isRightOption && (
                                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Check size={12} /> Your Answer (Correct)
                                </span>
                              )}
                              {isUserSelected && !isRightOption && (
                                <span className="text-[11px] font-extrabold text-red-700 bg-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <X size={12} /> Your Answer (Incorrect)
                                </span>
                              )}
                              {!isUserSelected && isRightOption && (
                                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Check size={12} /> Correct Option
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Box */}
                      {q.explanation && (
                        <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 text-xs text-indigo-950 leading-relaxed font-medium">
                          <span className="font-bold text-indigo-900 block mb-1">💡 Solution & Trick:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

              {allRawQuestions.filter(q => {
                const qKey = q.id ?? q.q;
                const uAns = userAnswersMap[qKey];
                if (reviewFilter === 'mistakes') return uAns !== undefined && uAns !== null && uAns !== q.a;
                if (reviewFilter === 'unattempted') return uAns === undefined || uAns === null;
                if (reviewFilter === 'correct') return uAns === q.a;
                return true;
              }).length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-bold">
                  No questions found in this review filter! 🎉
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => {
                setUserAnswersMap({});
                setTimeSpentMap({});
                setCurrentIndex(0);
                setFinished(false);
                setTimeLeft(initialTime);
                setIsPaused(false);
              }}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-full transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} /> Retake Exam
            </button>

            <button onClick={onExit} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 rounded-full font-bold text-sm transition-colors">
              Back to Home
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}



