
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppTheme, FontPreference, ThemeContextType } from '../types/theme';
import { THEME_PRESETS } from '../constants/themes';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('app_theme');
    return saved ? JSON.parse(saved) : THEME_PRESETS[0];
  });

  const [currentFont, setCurrentFontState] = useState<FontPreference>(() => {
    const saved = localStorage.getItem('app_font');
    return saved ? JSON.parse(saved) : { family: 'Inter', size: 'medium', weight: 'normal' };
  });

  const [isMotivationMode, setMotivationMode] = useState(false);
  const [recommendedThemeId, setRecommendedThemeId] = useState<string | null>(null);

  // Apply theme to DOM
  const applyTheme = useCallback((theme: AppTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--bg-page', theme.colors.background);
    root.style.setProperty('--surface', theme.colors.surface);
    root.style.setProperty('--text-main', theme.colors.text);
    root.style.setProperty('--text-muted', theme.colors.textMuted);
    root.style.setProperty('--border-color', theme.colors.border);
    root.style.setProperty('--primary-gradient', theme.gradients.primary);
    root.style.setProperty('--surface-gradient', theme.gradients.surface);
    root.style.setProperty('--border-radius', theme.borderRadius);
    root.style.setProperty('--glass-opacity', theme.glassOpacity);
    root.style.setProperty('--font-family', theme.fontFamily);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-category', theme.category.toLowerCase().replace(' ', '-'));
  }, []);

  // Apply font to DOM
  const applyFont = useCallback((font: FontPreference) => {
    const root = document.documentElement;
    root.style.setProperty('--font-main', font.family);
    
    const sizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', sizeMap[font.size]);
    
    const weightMap = { light: '300', normal: '400', bold: '700' };
    root.style.setProperty('--base-font-weight', weightMap[font.weight]);
  }, []);

  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem('app_theme', JSON.stringify(currentTheme));
  }, [currentTheme, applyTheme]);

  useEffect(() => {
    applyFont(currentFont);
    localStorage.setItem('app_font', JSON.stringify(currentFont));
  }, [currentFont, applyFont]);

  // Smart AI Engine Logic
  useEffect(() => {
    const checkAIRecommendation = () => {
      const hour = new Date().getHours();
      
      // Night Revision recommendation
      if (hour >= 22 || hour <= 4) {
        if (currentTheme.category !== 'Night Revision') {
          setRecommendedThemeId('night-revision-pulse');
        }
      } 
      // Early morning focus
      else if (hour >= 5 && hour <= 9) {
        if (currentTheme.category !== 'Focus') {
          setRecommendedThemeId('focus-mode-minimal');
        }
      }
      else {
        setRecommendedThemeId(null);
      }
    };

    checkAIRecommendation();
    const interval = setInterval(checkAIRecommendation, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = THEME_PRESETS.find(t => t.id === themeId);
    if (theme) {
      setCurrentThemeState(theme);
    }
  };

  const setFont = (font: Partial<FontPreference>) => {
    setCurrentFontState(prev => ({ ...prev, ...font }));
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      currentFont,
      setTheme,
      setFont,
      isMotivationMode,
      setMotivationMode,
      availableThemes: THEME_PRESETS,
      recommendedThemeId
    }}>
      <div className={`theme-root font-main transition-colors duration-500 min-h-screen`} style={{ 
        fontFamily: `var(--font-main), sans-serif`,
        fontSize: 'var(--base-font-size)',
        fontWeight: 'var(--base-font-weight)' as any,
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-main)'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
};
