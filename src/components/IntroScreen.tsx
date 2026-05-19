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
      heading: "Rajasthan’s Smartest RPSC Preparation App",
      subheading: "",
      body: "Prepare for RAS, REET, 2nd Grade, SI, Patwar, and other Rajasthan exams with AI-powered practice questions designed on real RPSC exam patterns.",
      features: [
        "📚 Hard & Exam-Level Questions",
        "🎯 Real RPSC Pattern",
        "⚡ Instant Question Generation",
        "📱 Fully Mobile Friendly",
        "🧠 Smart AI Explanations",
        "🔄 Unlimited Practice Sets",
        "🇮🇳 Rajasthan GK Focused"
      ],
      description: "Our AI creates high-quality analytical MCQs with tricky options, detailed explanations, and real competitive exam difficulty to help you practice smarter and score higher.",
      button: "Start Your Preparation Now",
      footer: "🚀 POWERED BY AI PRECISION"
    },
    HI: {
      heading: "राजस्थान का स्मार्ट RPSC तैयारी ऐप",
      subheading: "",
      body: "RAS, REET, 2nd Grade, SI, Patwar और अन्य राजस्थान परीक्षाओं के लिए वास्तविक RPSC परीक्षा पैटर्न पर आधारित AI-संचालित प्रश्नों के साथ तैयारी करें।",
      features: [
        "📚 कठिन और परीक्षा-स्तर के प्रश्न",
        "🎯 वास्तविक RPSC पैटर्न",
        "⚡ तत्काल प्रश्न निर्माण",
        "📱 पूरी तरह से मोबाइल फ्रेंडली",
        "🧠 स्मार्ट AI स्पष्टीकरण",
        "🔄 असीमित अभ्यास सेट",
        "🇮🇳 राजस्थान GK फोकस्ड"
      ],
      description: "हमारा AI पेचीदा विकल्पों, विस्तृत स्पष्टीकरण और वास्तविक प्रतिस्पर्धी परीक्षा कठिनाई के साथ उच्च गुणवत्ता वाले विश्लेषणात्मक MCQ बनाता है ताकि आपको बेहतर अभ्यास करने और उच्च स्कोर करने में मदद मिल सके।",
      button: "तैयारी अभी शुरू करें",
      footer: "🚀 AI परिशुद्धता द्वारा संचालित"
    }
  };

  const curr = content[lang];

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-main text-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 flex flex-col items-center max-w-2xl px-4 py-12"
      >
        <button 
          onClick={toggleLang}
          className="mb-8 flex items-center gap-2 px-6 py-2.5 bg-surface/50 backdrop-blur-md border border-border rounded-full hover:bg-surface transition-all text-xs font-bold uppercase tracking-widest text-muted"
        >
          <Languages size={14} />
          {lang === 'EN' ? 'हिंदी में बदलें' : 'Switch to English'}
        </button>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-20 h-20 bg-gradient-to-br from-primary to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl mb-8 rotate-6"
        >
          <div className="-rotate-6">
            <BrainCircuit size={40} className="text-white" />
          </div>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 font-display leading-tight text-slate-900">
          🚀 {curr.heading}
        </h1>
        
        <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed font-medium">
          {curr.body}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 w-full text-left">
          {curr.features.map((feature, idx) => (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"
            >
              <span className="text-sm font-bold text-slate-800">{feature}</span>
            </motion.div>
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-10 italic leading-relaxed">
          {curr.description}
        </p>

        <button
          onClick={handleStart}
          className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
        >
          🔥 {curr.button} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>


      <footer className="absolute bottom-8 left-0 w-full text-center text-muted text-[10px] font-bold uppercase tracking-[0.3em]">
        {curr.footer}
      </footer>
    </div>
  );
}
