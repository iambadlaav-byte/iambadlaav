import { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME } from '../lib/themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeId] = useState(
    () => localStorage.getItem('badlaav-theme') ?? DEFAULT_THEME
  );

  useEffect(() => {
    const resolved = THEMES[theme] ?? THEMES[DEFAULT_THEME];
    const root = document.documentElement;
    Object.entries(resolved.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem('badlaav-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
