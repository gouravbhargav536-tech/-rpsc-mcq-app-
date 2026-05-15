import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, ChevronRight, Languages } from 'lucide-react';
import { useFeedback } from '../hooks/useFeedback';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const { feedback } = useFeedback();

  const handleStart = () => {
    feedback('click');
    onStart();
  };

  const toggleLang = () => {
    feedback('click');
    setLang(lang === 'EN' ? 'HI' : 'EN');
  };

  const content = {
    EN: {
      heading: "Welcome to RPSC AI MCQ Master",
      subheading: "Your Smart Study Partner",
      body: "Practice, test, and improve your score with AI-generated quizzes tailored for RPSC exams. Study anytime, anywhere with personalized feedback.",
      button: "Get Started",
      footer: "Powered by ClickCraft"
    },
    HI: {
      heading: "RPSC AI MCQ मास्टर में आपका स्वागत है",
      subheading: "आपकी तैयारी का स्मार्ट साथी",
      body: "राजस्थान लोक सेवा आयोग (RPSC) की परीक्षाओं के लिए AI-संचालित क्विज़ के साथ अभ्यास करें। अपनी प्रगति को ट्रैक करें और व्यक्तिगत प्रतिक्रिया के साथ अपनी तैयारी को बेहतर बनाएं।",
      button: "शुरू करें",
      footer: "Powered by ClickCraft"
    }
  };

  const curr = content[lang];

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-main text-center relative overflow-hidden">
      {/* Background Decor (Geometric Balance Style) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 flex flex-col items-center max-w-2xl px-4"
      >
        <button 
          onClick={toggleLang}
          className="mb-10 flex items-center gap-2 px-6 py-2.5 bg-surface/50 backdrop-blur-md border border-border rounded-full hover:bg-surface transition-all text-xs font-bold uppercase tracking-widest text-muted"
        >
          <Languages size={14} />
          {lang === 'EN' ? 'हिंदी में बदलें' : 'Switch to English'}
        </button>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-24 h-24 bg-primary/10 border-2 border-primary/30 rounded-3xl flex items-center justify-center shadow-2xl mb-10 rotate-12"
        >
          <div className="-rotate-12">
            <BrainCircuit size={48} className="text-primary" />
          </div>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 font-display leading-tight text-main">
          {curr.heading}
        </h1>
        <p className="text-xl md:text-2xl text-primary font-display font-medium mb-8">
          {curr.subheading}
        </p>
        
        <p className="text-base md:text-lg text-muted mb-10 md:mb-12 leading-relaxed font-light">
          {curr.body}
        </p>

        <button
          onClick={handleStart}
          className="px-12 py-5 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 group"
        >
          {curr.button} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>


      <footer className="absolute bottom-8 left-0 w-full text-center text-muted text-[10px] font-bold uppercase tracking-[0.3em]">
        {curr.footer}
      </footer>
    </div>
  );
}
