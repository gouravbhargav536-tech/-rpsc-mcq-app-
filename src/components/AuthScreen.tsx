import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User as UserIcon, Loader2, Languages, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { useFeedback } from '../hooks/useFeedback';
import { loginWithGoogle } from '../firebase';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export default function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [loading, setLoading] = useState(false);
  const { feedback } = useFeedback();

  const content = {
    EN: {
      loginTitle: "Welcome",
      loginBtn: "Sign in with Google",
      back: "Back"
    },
    HI: {
      loginTitle: "आपका स्वागत है",
      loginBtn: "Google के साथ साइन इन करें",
      back: "पीछे"
    }
  };

  const curr = content[lang];

  const handleGoogleLogin = async () => {
    feedback('click');
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      const user = {
        name: result.user.displayName || 'User',
        email: result.user.email || '',
      };
      feedback('success');
      onSuccess(user);
    } catch (err) {
      console.error(err);
      feedback('wrong');
      alert("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page flex flex-col p-6 items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      {/* Mobile Top Nav */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold uppercase text-[10px] sm:text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> <span className="hidden xs:inline">{curr.back}</span>
        </button>

        <button 
          onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-full hover:border-primary transition-all text-[10px] sm:text-xs font-bold text-main"
        >
          <Languages size={14} /> {lang === 'EN' ? 'हिंदी' : 'EN'}
        </button>
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-10 shadow-2xl relative z-10 mt-12 sm:mt-0"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display italic text-main mb-2">
            {curr.loginTitle}
          </h2>
          <div className="h-1 w-12 bg-primary mx-auto"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-slate-900 border border-white/10 text-white font-bold tracking-[0.2em] uppercase py-4 hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : curr.loginBtn}
        </button>
      </motion.div>
    </div>
  );
}
