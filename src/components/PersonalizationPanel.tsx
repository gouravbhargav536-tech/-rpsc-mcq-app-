
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Palette, 
  Type, 
  Zap, 
  Sparkles, 
  Check, 
  Search, 
  Clock, 
  Star,
  LayoutGrid,
  Info,
  BrainCircuit
} from 'lucide-react';
import { useAppTheme } from '../context/ThemeContext';
import { ThemeCategory } from '../types/theme';

interface PersonalizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({ isOpen, onClose }) => {
  const { 
    currentTheme, 
    currentFont, 
    setTheme, 
    setFont, 
    availableThemes, 
    recommendedThemeId 
  } = useAppTheme();
  
  const [activeTab, setActiveTab] = useState<'themes' | 'fonts' | 'ai'>('themes');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | 'All'>('All');

  const categories: (ThemeCategory | 'All')[] = [
    'All', 'Dark Study', 'Light Minimal', 'Motivation', 'Anime', 'Focus', 'Heritage', 'Premium', 'Neon'
  ];

  const filteredThemes = availableThemes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || theme.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface z-[1001] shadow-2xl flex flex-col border-l border-border-color"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-color flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-display font-black text-main flex items-center gap-2">
                  <Palette className="text-primary" /> Personalization
                </h2>
                <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Design Your Study Environment</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center text-muted hover:text-main hover:bg-border-color transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-2 bg-surface/50 border-b border-border-color">
              {(['themes', 'fonts', 'ai'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                    activeTab === tab 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-muted hover:bg-border-color'
                  }`}
                >
                  {tab === 'ai' ? 'Smart AI' : tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'themes' && (
                  <motion.div
                    key="themes-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Search & Categories */}
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search themes..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-12 bg-border-color/30 border border-border-color rounded-2xl pl-12 pr-4 text-sm font-bold focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                              activeCategory === cat 
                                ? 'bg-primary/10 border-primary text-primary' 
                                : 'bg-surface border-border-color text-muted hover:border-muted'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendation Highlight */}
                    {recommendedThemeId && (
                      <div className="bg-gradient-to-r from-indigo-600 to-primary p-4 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                          <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80 flex items-center gap-1">
                            <Sparkles size={12} /> AI Recommendation
                          </div>
                          <h4 className="font-display font-black text-sm italic">Optimize for {new Date().getHours() >= 22 ? 'Night Study' : 'Focus'}</h4>
                          <button 
                            onClick={() => setTheme(recommendedThemeId)}
                            className="mt-3 w-full h-10 bg-white text-primary font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            Apply Suggested Theme
                          </button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                          <Zap size={100} fill="white" />
                        </div>
                      </div>
                    )}

                    {/* Theme Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {filteredThemes.map(theme => (
                        <motion.button
                          key={theme.id}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setTheme(theme.id)}
                          className={`p-1 rounded-3xl border-2 transition-all text-left relative group ${
                            currentTheme.id === theme.id 
                              ? 'border-primary ring-4 ring-primary/10' 
                              : 'border-border-color hover:border-muted shadow-sm'
                          }`}
                        >
                          <div 
                            className="h-24 rounded-2xl relative overflow-hidden mb-3"
                            style={{ background: theme.colors.background }}
                          >
                            {/* Color Preview */}
                            <div className="absolute inset-0 flex items-center justify-center gap-1">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                            </div>
                            
                            {/* Selected Badge */}
                            {currentTheme.id === theme.id && (
                              <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                                <Check size={12} />
                              </div>
                            )}

                            {/* Overlay info */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                              <span className="text-[8px] font-black uppercase text-white/80 tracking-tighter">{theme.category}</span>
                            </div>
                          </div>
                          <div className="px-2 pb-2">
                             <div className="text-[11px] font-black text-main truncate leading-none mb-1">{theme.name}</div>
                             <div className="text-[9px] text-muted font-bold uppercase tracking-widest truncate">{theme.animationStyle}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'fonts' && (
                  <motion.div
                    key="fonts-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-muted">Font Family</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Rajdhani', 'Mukta', 'Playfair Display', 'Orbitron', 'Nunito'].map(font => (
                          <button
                            key={font}
                            onClick={() => setFont({ family: font as any })}
                            className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${
                              currentFont.family === font 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border-color hover:border-muted'
                            }`}
                            style={{ fontFamily: font }}
                          >
                            <span className="text-lg font-medium">{font} <span className="text-xs opacity-50 ml-2">Sample Text</span></span>
                            {currentFont.family === font && <Check size={20} className="text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-muted">Font Weight</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {(['light', 'normal', 'bold'] as const).map(w => (
                          <button
                            key={w}
                            onClick={() => setFont({ weight: w })}
                            className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                              currentFont.weight === w 
                                ? 'border-primary bg-primary text-white' 
                                : 'border-border-color text-muted hover:border-muted'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div
                    key="ai-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-4 py-8">
                       <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                          <BrainCircuit size={40} className="text-primary animate-pulse" />
                          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                       </div>
                       <h3 className="text-xl font-display font-black text-main">Smart UI Engine</h3>
                       <p className="text-sm text-muted leading-relaxed px-4">
                          Our AI analyzes your study patterns to create the perfect focus environment.
                       </p>
                    </div>

                    <div className="space-y-4">
                       <div className="p-6 border-2 border-border-color rounded-[2rem] bg-surface/50 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <Clock size={20} />
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-main">Automated Night Mode</h4>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Active after 10:00 PM</p>
                             </div>
                          </div>
                          <p className="text-xs text-muted leading-relaxed italic">
                             Switches to high-contrast, low-blue-light themes like "Midnight Revision" to protect your eyes during late-night studies.
                          </p>
                       </div>

                       <div className="p-6 border-2 border-border-color rounded-[2rem] bg-surface/50 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <Zap size={20} />
                             </div>
                             <div>
                                <h4 className="text-sm font-black text-main">Deep Focus Shield</h4>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Triggered by Session Length</p>
                             </div>
                          </div>
                          <p className="text-xs text-muted leading-relaxed italic">
                             If your study session exceeds 45 minutes, we recommend the "Study Zen" theme to minimize distractions and maximize retention.
                          </p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer / Apply */}
            <div className="p-6 bg-surface border-t border-border-color">
               <button 
                onClick={onClose}
                className="w-full h-14 bg-gradient-to-r from-primary to-secondary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
               >
                 Confirm Settings
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PersonalizationPanel;
