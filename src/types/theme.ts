
export type ThemeCategory = 
  | 'Dark Study'
  | 'Light Minimal'
  | 'Motivation'
  | 'Anime'
  | 'Focus'
  | 'Heritage'
  | 'Toppers'
  | 'Premium'
  | 'Neon'
  | 'Night Revision'
  | 'Nature'
  | 'Productivity Theme'
  | 'Calm Blue Theme';

export interface AppTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  gradients: {
    primary: string;
    surface: string;
    background?: string;
  };
  fontFamily: string;
  borderRadius: string;
  glassOpacity: string;
  animationStyle: 'smooth' | 'snappy' | 'playful';
  backgroundImage?: string;
  animeStyle?: string; // Optional property for anime-specific effects
}

export interface FontPreference {
  family: 'Poppins' | 'Roboto' | 'Montserrat' | 'Nunito' | 'Inter' | 'Playfair Display' | 'Orbitron' | 'Rajdhani' | 'Mukta';
  size: 'small' | 'medium' | 'large';
  weight: 'light' | 'normal' | 'bold';
}

export interface ThemeContextType {
  currentTheme: AppTheme;
  currentFont: FontPreference;
  setTheme: (themeId: string) => void;
  setFont: (font: Partial<FontPreference>) => void;
  isMotivationMode: boolean;
  setMotivationMode: (active: boolean) => void;
  availableThemes: AppTheme[];
  recommendedThemeId: string | null;
}
