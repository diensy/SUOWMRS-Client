import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const DEFAULT_THEME = 'light';
const THEME_KEY = 'suowmrs-theme';
// Set only when the user presses the theme toggle. Earlier builds auto-saved the old "dark"
// default on first load, so a saved value alone does not mean the user chose it.
const USER_CHOICE_KEY = 'suowmrs-theme-user';

const readInitialTheme = () => {
  try {
    if (localStorage.getItem(USER_CHOICE_KEY) === '1') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    }
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_THEME;
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  // Persist only explicit user choices so the bright default applies to everyone else
  const setTheme = useCallback((next) => {
    const value = typeof next === 'function' ? next(theme) : next;
    if (value !== 'dark' && value !== 'light') return;
    setThemeState(value);
    try {
      localStorage.setItem(THEME_KEY, value);
      localStorage.setItem(USER_CHOICE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
