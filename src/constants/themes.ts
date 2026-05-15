
import { AppTheme } from '../types/theme';

export const THEME_PRESETS: AppTheme[] = [
  {
    id: 'geometric-default',
    name: 'Geometric Pro',
    category: 'Premium',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#14b8a6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      border: '#334155'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      surface: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5), rgba(30, 41, 59, 0.8))'
    },
    fontFamily: 'Inter',
    borderRadius: '1rem',
    glassOpacity: '0.1',
    animationStyle: 'smooth'
  },
  {
    id: 'rajasthan-royal',
    name: 'Royal Rajputana',
    category: 'Heritage',
    colors: {
      primary: '#E91E63',
      secondary: '#7B1E3A',
      accent: '#D4A017',
      background: '#F5E6C8',
      surface: '#ffffff',
      text: '#2D1B15',
      textMuted: '#6B4F4F',
      border: '#E2D1B3'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #E91E63, #7B1E3A)',
      surface: 'linear-gradient(180deg, #ffffff, #fdf8ef)'
    },
    fontFamily: 'Rajdhani',
    borderRadius: '2rem',
    glassOpacity: '0.05',
    animationStyle: 'smooth',
    backgroundImage: 'https://www.transparenttextures.com/patterns/cubes.png'
  },
  {
    id: 'dark-study-zen',
    name: 'Study Zen',
    category: 'Dark Study',
    colors: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#10b981',
      background: '#000000',
      surface: '#121212',
      text: '#ffffff',
      textMuted: '#888888',
      border: '#222222'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      surface: 'linear-gradient(180deg, #121212, #0a0a0a)'
    },
    fontFamily: 'Roboto',
    borderRadius: '0.75rem',
    glassOpacity: '0.2',
    animationStyle: 'snappy'
  },
  {
    id: 'anime-motivation-lofi',
    name: 'Lofi Study Desk',
    category: 'Anime',
    colors: {
      primary: '#ff8a65',
      secondary: '#f4511e',
      accent: '#ce93d8',
      background: '#1a1a2e',
      surface: '#16213e',
      text: '#e94560',
      textMuted: '#95afc0',
      border: '#0f3460'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ff8a65, #f4511e)',
      surface: 'linear-gradient(180deg, rgba(22, 33, 62, 0.8), rgba(26, 26, 46, 0.9))'
    },
    fontFamily: 'Poppins',
    borderRadius: '1.5rem',
    glassOpacity: '0.15',
    animationStyle: 'playful',
    backgroundImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2128&auto=format&fit=crop',
    animeStyle: 'lofi'
  },
  {
    id: 'focus-mode-minimal',
    name: 'Deep Focus',
    category: 'Focus',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#000000',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textMuted: '#6b7280',
      border: '#e5e7eb'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #000, #333)',
      surface: 'linear-gradient(180deg, #f9fafb, #ffffff)'
    },
    fontFamily: 'Inter',
    borderRadius: '0.25rem',
    glassOpacity: '0.02',
    animationStyle: 'snappy'
  },
  {
    id: 'night-revision-pulse',
    name: 'Midnight Revision',
    category: 'Night Revision',
    colors: {
      primary: '#8b5cf6',
      secondary: '#6d28d9',
      accent: '#f43f5e',
      background: '#09090b',
      surface: '#18181b',
      text: '#f4f4f5',
      textMuted: '#71717a',
      border: '#27272a'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      surface: 'linear-gradient(180deg, #18181b, #09090b)'
    },
    fontFamily: 'Montserrat',
    borderRadius: '1.25rem',
    glassOpacity: '0.1',
    animationStyle: 'smooth'
  },
  {
    id: 'forest-focus',
    name: 'Emerald Forest',
    category: 'Nature',
    colors: {
      primary: '#059669',
      secondary: '#065f46',
      accent: '#fbbf24',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
      textMuted: '#4b5563',
      border: '#dcfce7'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669, #065f46)',
      surface: 'linear-gradient(180deg, #ffffff, #f0fdf4)'
    },
    fontFamily: 'Nunito',
    borderRadius: '1.5rem',
    glassOpacity: '0.05',
    animationStyle: 'smooth'
  },
  {
    id: 'black-gold-premium',
    name: 'Black & Gold',
    category: 'Premium',
    colors: {
      primary: '#d4af37',
      secondary: '#aa8a2e',
      accent: '#ffffff',
      background: '#050505',
      surface: '#111111',
      text: '#fdfdfd',
      textMuted: '#a0a0a0',
      border: '#222222'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #d4af37, #f1d37e)',
      surface: 'linear-gradient(180deg, #111111, #050505)'
    },
    fontFamily: 'Playfair Display',
    borderRadius: '1rem',
    glassOpacity: '0.1',
    animationStyle: 'smooth'
  },
  {
    id: 'neon-cyber-exam',
    name: 'Cyber Exam',
    category: 'Neon',
    colors: {
      primary: '#00ff41',
      secondary: '#008f11',
      accent: '#ff00ff',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#00ff41',
      textMuted: '#003b00',
      border: '#00ff4133'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00ff41, #008f11)',
      surface: 'linear-gradient(180deg, #1a1a1a, #0a0a0a)'
    },
    fontFamily: 'Orbitron',
    borderRadius: '0.5rem',
    glassOpacity: '0.3',
    animationStyle: 'snappy'
  },
  {
    id: 'toppers-blue',
    name: 'Toppers Blueprint',
    category: 'Toppers',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#f59e0b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #2563eb, #1e40af)',
      surface: 'linear-gradient(180deg, #ffffff, #f8fafc)'
    },
    fontFamily: 'Inter',
    borderRadius: '0.75rem',
    glassOpacity: '0.05',
    animationStyle: 'snappy'
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dreams',
    category: 'Calm Blue Theme',
    colors: {
      primary: '#a78bfa',
      secondary: '#8b5cf6',
      accent: '#fbcfe8',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#4c1d95',
      textMuted: '#7c3aed',
      border: '#f3e8ff'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
      surface: 'linear-gradient(180deg, #ffffff, #faf5ff)'
    },
    fontFamily: 'Nunito',
    borderRadius: '2rem',
    glassOpacity: '0.1',
    animationStyle: 'smooth'
  },
  {
    id: 'ocean-productivity',
    name: 'Ocean Flow',
    category: 'Productivity Theme',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#22d3ee',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
      textMuted: '#0369a1',
      border: '#e0f2fe'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      surface: 'linear-gradient(180deg, #ffffff, #f0f9ff)'
    },
    fontFamily: 'Montserrat',
    borderRadius: '1rem',
    glassOpacity: '0.05',
    animationStyle: 'snappy'
  },
  {
    id: 'midnight-nebula',
    name: 'Midnight Nebula',
    category: 'Neon',
    colors: {
      primary: '#f472b6',
      secondary: '#db2777',
      accent: '#818cf8',
      background: '#020617',
      surface: '#0f172a',
      text: '#fdf2f8',
      textMuted: '#94a3b8',
      border: '#1e293b'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #f472b6, #db2777)',
      surface: 'linear-gradient(180deg, #0f172a, #020617)'
    },
    fontFamily: 'Orbitron',
    borderRadius: '1.5rem',
    glassOpacity: '0.2',
    animationStyle: 'playful',
    backgroundImage: 'https://www.transparenttextures.com/patterns/carbon-fibre.png'
  },
  {
    id: 'premium-dark-noble',
    name: 'Premium Dark Noble',
    category: 'Premium',
    colors: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#fbbf24',
      background: '#020617',
      surface: '#0f172a',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      border: '#1e293b'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      surface: 'linear-gradient(180deg, #0f172a, #020617)'
    },
    fontFamily: 'Outfit',
    borderRadius: '1.5rem',
    glassOpacity: '0.15',
    animationStyle: 'smooth',
    backgroundImage: 'https://www.transparenttextures.com/patterns/stardust.png'
  }
];
