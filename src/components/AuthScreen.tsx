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
  const [guestName, setGuestName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const { feedback } = useFeedback();

  const content = {
    EN: {
      loginTitle: "Exam Portal",
      loginSubtitle: "Sign in to sync your RPSC progress",
      loginBtn: "Sign in with Google",
      guestBtn: "Start as Guest",
      guestPlaceholder: "Enter full name (e.g., Sunil Kumar)",
      back: "Back",
      authHint: "Issues signing in? Try 'Guest Mode' or check if popups are blocked.",
      or: "OR"
    },
    HI: {
      loginTitle: "परीक्षा पोर्टल",
      loginSubtitle: "अपनी RPSC प्रगति सिंक करने के लिए साइन इन करें",
      loginBtn: "Google के साथ साइन इन करें",
      guestBtn: "अतिथि के रूप में शुरू करें",
      guestPlaceholder: "पूरा नाम दर्ज करें",
      back: "पीछे",
      authHint: "साइन इन करने में समस्या? 'अतिथि मोड' आज़माएं या पॉपअप की जांच करें।",
      or: "या"
    }
  };

  const curr = content[lang];

  const handleGoogleLogin = async () => {
    feedback('click');
    setLoading(true);
    setAuthError(null);
    try {
      const result = await loginWithGoogle();
      const user = {
        name: result.user.displayName || 'User',
        email: result.user.email || '',
      };
      feedback('success');
      onSuccess(user);
    } catch (err: any) {
      console.error(err);
      feedback('wrong');
      const msg = err.message || "Failed to reach Google. Check your connection or popup settings.";
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      feedback('wrong');
      return;
    }
    feedback('success');
    onSuccess({
      name: guestName.trim(),
      email: 'guest@rpsc-practice.local',
      isGuest: true
    });
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
        className="w-full max-w-md bg-white border border-slate-200 p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative z-10 mt-12 sm:mt-0 rounded-[2.5rem]"
      >
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <Lock size={30} />
           </div>
          <h2 className="text-3xl font-display font-medium text-main mb-3">
            {curr.loginTitle}
          </h2>
          <p className="text-sm text-slate-500 font-sans tracking-wide">
            {curr.loginSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-slate-900 border border-slate-800 text-white font-bold tracking-[0.1em] uppercase py-4 rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale invert brightness-200" alt="" />
                {curr.loginBtn}
              </>
            )}
          </button>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 leading-relaxed text-center"
            >
              <strong>{authError}</strong>
              <p className="mt-1 opacity-80">{curr.authHint}</p>
            </motion.div>
          )}

          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{curr.or}</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <form onSubmit={handleGuestLogin} className="space-y-4">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={curr.guestPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white border-2 border-slate-200 text-main font-bold tracking-[0.1em] uppercase py-4 rounded-2xl hover:border-primary hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
            >
              {curr.guestBtn}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
