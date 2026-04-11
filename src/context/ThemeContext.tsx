/**
 * 🌓 Theme Context - Dark Mode Management
 * 
 * Manages dark/light theme preference across the application
 * Persists preference to localStorage and applies class to document element
 * Syncs with Tailwind's dark mode configuration
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage — default always light (ignores system dark mode)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme === 'dark') {
        setIsDark(true);
      } else {
        // Default to light mode regardless of system preference (iPhone dark mode fix)
        setIsDark(false);
        if (!savedTheme) {
          localStorage.setItem('theme', 'light');
        }
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.warn('⚠️ Failed to initialize theme:', error);
      setIsInitialized(true);
    }
  }, []);

  // Apply theme to document when isDark changes
  useEffect(() => {
    if (!isInitialized) return;

    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark, isInitialized]);

  // NOTE: System theme change listener intentionally removed
  // to prevent automatic dark mode on iPhone/Android system dark mode

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (isDark: boolean) => {
    setIsDark(isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
