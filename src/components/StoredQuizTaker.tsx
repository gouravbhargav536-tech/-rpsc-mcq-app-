import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Pause, Play, Clock, SkipForward } from 'lucide-react';
import defaultQuestionsData from '../data/questions.json';

export default function StoredQuizTaker({ onExit, category }: { onExit: () => void, category?: string }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [initialTime, setInitialTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'quizzes'));
        let qData = snap.docs.map(doc => doc.data());
        if (category) {
          qData = qData.filter(q => q.category === category);
        }
        
        // Fallback to local default questions if firestore returns empty for this category
        if (qData.length === 0) {
          const localMatch = defaultQuestionsData.questions.filter(q => !category || q.category === category);
          qData = localMatch.length > 0 ? localMatch : defaultQuestionsData.questions;
        }

        setQuestions(qData);
        setAnswers(new Array(qData.length).fill(null));
        const totalSecs = Math.max(60, qData.length * 45); // 45 seconds per question
        setTimeLeft(totalSecs);
        setInitialTime(totalSecs);
      } catch (err) {
        console.error("Firestore read failed, using local questions:", err);
        const localMatch = defaultQuestionsData.questions.filter(q => !category || q.category === category);
        setQuestions(localMatch);
        setAnswers(new Array(localMatch.length).fill(null));
        const totalSecs = Math.max(60, localMatch.length * 45);
        setTimeLeft(totalSecs);
        setInitialTime(totalSecs);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [category]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || finished || isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setFinished(true); // Auto submit on time up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, finished, isPaused, timeLeft]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white rounded-3xl shadow-xl text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
        <p className="text-slate-600 font-medium">Fetching Quiz from Firebase...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4 text-slate-800">No Questions Found</h2>
        <p className="text-slate-500 mb-6">No questions are currently available for this category.</p>
        <button onClick={onExit} className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium">
          Back to Home
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleAnswer = (idx: number) => {
    if (isPaused) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = idx;
    setAnswers(newAnswers);
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

  const getScore = () => {
    return answers.reduce((acc, ans, idx) => {
      return ans === questions[idx]?.a ? acc + 1 : acc;
    }, 0);
  };

  const categoryTitle = category 
    ? category === 'current_affairs' ? 'Current Affairs / करंट अफेयर्स' : category.toUpperCase() 
    : 'Stored';

  const progressPercent = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <button onClick={onExit} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          <ArrowLeft size={18} /> Back to Home
        </button>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold tracking-wide uppercase">
          {categoryTitle} Quiz
        </span>
      </div>

      {!finished ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={currentIndex}>
          {/* Timer & Controls Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`} />
              <span className={`font-mono text-lg font-bold ${timeLeft < 30 ? 'text-red-600' : 'text-slate-800'}`}>
                {formatTime(timeLeft)}
              </span>
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
                {isPaused ? 'Resume Quiz' : 'Pause'}
              </button>

              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-xs font-bold transition-colors"
              >
                <SkipForward size={14} /> Skip Question
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">Quiz Paused</h3>
              <p className="text-sm text-slate-600 mb-6">Take a breath. Press resume when you are ready to continue.</p>
              <button 
                onClick={() => setIsPaused(false)}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-sm shadow-md transition-colors inline-flex items-center gap-2"
              >
                <Play size={16} /> Resume Quiz
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {answers[currentIndex] !== null && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Answered
                  </span>
                )}
              </div>

              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 leading-relaxed">{currentQ.q}</h2>

              <div className="grid gap-3">
                {currentQ.o.map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`p-4 rounded-2xl border text-left font-medium transition-all flex items-center justify-between ${
                      answers[currentIndex] === idx 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/30'
                    }`}
                  >
                    <span>{opt}</span>
                    {answers[currentIndex] === idx && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                <button 
                  disabled={currentIndex === 0} 
                  onClick={() => setCurrentIndex(p => p - 1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button 
                    onClick={() => setCurrentIndex(p => p + 1)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                  >
                    Next Question
                  </button>
                ) : (
                  <button 
                    onClick={() => setFinished(true)} 
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 text-sm mb-6">
            {timeLeft <= 0 ? '⏰ Time Ran Out! Here is your auto-submitted result:' : `Here is your result for ${categoryTitle}`}
          </p>
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 inline-block min-w-[200px]">
            <p className="text-4xl font-extrabold text-indigo-600 mb-1">{getScore()} / {questions.length}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Score</p>
          </div>
          <div>
            <button onClick={onExit} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-bold transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

