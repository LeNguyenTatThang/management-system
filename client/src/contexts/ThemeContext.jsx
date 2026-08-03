import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themes } from '../data/themes';

const DEFAULT_THEME = 'burgundy';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return localStorage.getItem('activeTheme') || DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem('activeTheme', activeThemeId);
    document.documentElement.setAttribute('data-theme', activeThemeId);
  }, [activeThemeId]);

  const activeTheme = themes.find(t => t.id === activeThemeId) || themes[0];

  const setTheme = useCallback((id) => {
    setActiveThemeId(id);
  }, []);

  return (
    <ThemeContext.Provider value={{ themes, activeTheme, activeThemeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
