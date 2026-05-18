import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Wand2, 
  Clapperboard, 
  RotateCcw, 
  ChevronRight, 
  Play, 
  Download,
  Share2,
  FileText,
  Volume2,
  Camera,
  Layers,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface Scene {
  visualPrompt: string;
  narration: string;
  overlayText: string;
  camera: string;
  duration: number;
  music: string;
  generatedImageUrl?: string;
}

interface VideoScript {
  title: string;
  summary: string;
  scenes: Scene[];
  characterState: string;
}

interface Props {
  onBack: () => void;
  initialTopic?: string;
}

export const VideoGenerator: React.FC<Props> = ({ onBack, initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'IDLE' | 'SCRIPTING' | 'VISUALS' | 'PLAYING'>('IDLE');
  const [script, setScript] = useState<VideoScript | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPreviewIdx, setCurrentPreviewIdx] = useState(0);

  const startGeneration = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    setCurrentStep('SCRIPTING');
    setProgress(10);

    try {
      // 1. Generate Script
      const scriptRes = await fetch('/api/video/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: topic, type: 'Reel' }),
      });
      
      if (!scriptRes.ok) throw new Error('Scripting failed');
      const scriptData: VideoScript = await scriptRes.json();
      setScript(scriptData);
      setProgress(40);
      setCurrentStep('VISUALS');

      // 2. Generate Visuals for each scene
      const updatedScenes = [...scriptData.scenes];
      for (let i = 0; i < updatedScenes.length; i++) {
        const visualRes = await fetch('/api/video/visual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: updatedScenes[i].visualPrompt }),
        });
        
        if (visualRes.ok) {
          const { imageUrl } = await visualRes.json();
          updatedScenes[i].generatedImageUrl = imageUrl;
        } else {
          // Fallback
          updatedScenes[i].generatedImageUrl = `https://picsum.photos/seed/scene-${i}/1080/1920`;
        }
        setProgress(40 + ((i + 1) / updatedScenes.length) * 50);
      }

      setScript({ ...scriptData, scenes: updatedScenes });
      setProgress(100);
      setTimeout(() => setCurrentStep('PLAYING'), 500);

    } catch (error) {
      console.error('Generation failed:', error);
      setIsGenerating(false);
      setCurrentStep('IDLE');
    }
  };

  const reset = () => {
    setScript(null);
    setCurrentStep('IDLE');
    setIsGenerating(false);
    setProgress(0);
  };

  const renderIdle = () => (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-100 animate-bounce-slow">
          <Wand2 size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">AI Cinematic Director</h2>
        <p className="text-slate-500">
          Enter a topic, exam concept, or MCQ. Our AI will direct, script, and animate a premium educational reel for you.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100 border border-slate-100">
        <div className="mb-8">
          <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Video Topic or Concept</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Fundamental Rights in Indian Constitution for RPSC Exam..."
            className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-lg font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none"
          />
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-tight">Cinematic Style</p>
          <div className="flex flex-wrap gap-3">
            {['Suzume Anime', 'Vintage Documentary', 'Modern Infographic', 'Hand-drawn Animation'].map((style) => (
              <button key={style} className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${style === 'Suzume Anime' ? 'bg-indigo-900 border-indigo-900 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}>
                {style}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startGeneration}
          disabled={!topic || isGenerating}
          className="w-full mt-10 py-5 bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-full font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {isGenerating ? <RotateCcw className="animate-spin" /> : <Sparkles />}
          Generate AI Reel
        </button>
      </div>

      <button 
        onClick={onBack}
        className="mt-8 mx-auto flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
      >
        <ArrowLeft size={16} /> Cancel & Exit
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="max-w-xl mx-auto py-24 flex flex-col items-center text-center">
      <div className="relative w-40 h-40 mb-12">
        <div className="absolute inset-0 border-8 border-indigo-50 rounded-full" />
        <motion.div 
          className="absolute inset-0 border-8 border-indigo-900 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Clapperboard className="text-indigo-900 animate-pulse" size={48} />
        </div>
      </div>

      <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
        {currentStep === 'SCRIPTING' ? 'AI is Director is Writing Script...' : 'AI is Animating Scenes...'}
      </h3>
      <p className="text-slate-500 mb-10 max-w-sm">
        {currentStep === 'SCRIPTING' 
          ? 'Analyzing topic and creating cinematic storyboard with professional pedagogy.' 
          : 'Generating high-quality anime visuals with Suzume-style environmental lighting.'}
      </p>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-900 to-purple-900"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-indigo-900 font-black text-sm tracking-widest uppercase">{Math.round(progress)}% Processed</p>
    </div>
  );

  const renderPlayer = () => {
    if (!script) return null;
    return <VideoPlayerSimulator script={script} onReset={reset} />;
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {currentStep === 'IDLE' && <motion.div key="idle">{renderIdle()}</motion.div>}
        {(currentStep === 'SCRIPTING' || currentStep === 'VISUALS') && <motion.div key="loading">{renderLoading()}</motion.div>}
        {currentStep === 'PLAYING' && <motion.div key="player">{renderPlayer()}</motion.div>}
      </AnimatePresence>
    </div>
  );
};

// Video Player Component
const VideoPlayerSimulator: React.FC<{ script: VideoScript, onReset: () => void }> = ({ script, onReset }) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isPlaying || isFinished) return;

    const currentScene = script.scenes[currentSceneIdx];
    const timer = setTimeout(() => {
      if (currentSceneIdx < script.scenes.length - 1) {
        setCurrentSceneIdx(prev => prev + 1);
      } else {
        setIsFinished(true);
        setIsPlaying(false);
      }
    }, currentScene.duration * 1000);

    return () => clearTimeout(timer);
  }, [currentSceneIdx, isPlaying, isFinished, script.scenes]);

  const scene = script.scenes[currentSceneIdx];

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start py-4">
      {/* Phone Simulator Player */}
      <div className="w-full md:w-[400px] aspect-[9/16] bg-black rounded-[60px] border-[12px] border-slate-900 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSceneIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Visual with Camera Movement */}
            <motion.img
              src={scene.generatedImageUrl}
              className="w-full h-full object-cover"
              animate={{ 
                scale: scene.camera.toLowerCase().includes('zoom') ? [1, 1.15] : 1,
                x: scene.camera.toLowerCase().includes('pan') ? [0, 20] : 0
              }}
              transition={{ duration: scene.duration, ease: 'linear' }}
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Subtitles/Text Overlay */}
            <div className="absolute inset-x-8 bottom-24 z-20">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl"
              >
                <p className="text-white text-xl font-black leading-tight text-center">
                  {scene.overlayText}
                </p>
              </motion.div>
            </div>

            {/* AI Voice Assistant Marker */}
            <div className="absolute top-12 left-8 flex items-center gap-2 z-20">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                <Volume2 size={16} className="text-white animate-pulse" />
              </div>
              <span className="text-white font-bold text-xs shadow-sm">AI Narration Auto-Gen</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Finished UI Overlay */}
        <AnimatePresence>
          {isFinished && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-indigo-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-900 mb-6 shadow-2xl">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Generation Ready!</h3>
              <p className="text-indigo-100 text-sm mb-8">Your cinematic educational reel is ready for export.</p>
              
              <div className="space-y-3 w-full">
                <button className="w-full py-4 bg-white text-indigo-900 rounded-full font-bold flex items-center justify-center gap-2">
                  <Download size={20} /> Download MP4
                </button>
                <button className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold flex items-center justify-center gap-2">
                  <Share2 size={20} /> Post to Reels
                </button>
                <button onClick={onReset} className="w-full py-4 text-indigo-200 font-bold">Start New Create</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Storyboard / Scene Inspector (Desktop only) */}
      <div className="flex-1 hidden md:block">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900">Cinematic Storyboard</h3>
          <div className="flex items-center gap-2">
             <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
               {currentSceneIdx + 1} / {script.scenes.length} Scenes
             </span>
          </div>
        </div>

        <div className="grid gap-4">
          {script.scenes.map((s, idx) => (
            <motion.div
              key={idx}
              onClick={() => {
                setCurrentSceneIdx(idx);
                setIsPlaying(false);
              }}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                currentSceneIdx === idx 
                ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100' 
                : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-24 aspect-video rounded-xl bg-slate-200 overflow-hidden shadow-inner shrink-0 scale-95 hover:scale-100 transition-transform">
                  <img src={s.generatedImageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                      <Layers size={14} className="text-slate-400" />
                      Scene {idx + 1}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.duration}s</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 italic mb-3">"{s.narration}"</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 rounded text-[9px] font-bold uppercase">
                      <Camera size={10} /> {s.camera}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 rounded text-[9px] font-bold uppercase">
                      <Volume2 size={10} /> {s.music}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-amber-900 font-bold mb-1">AI Director Notes</h4>
            <p className="text-amber-800/70 text-sm leading-relaxed">
              Mascot state is <span className="font-bold underline">{script.characterState}</span>. 
              The visual tone uses High-Dynamic Range (HDR) anime shading compatible with Suzume cinematic lighting rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
