/**
 * 🌓 Theme Toggle Button
 *
 * Beautiful toggle button for switching between light/dark modes
 * Shows sun icon for light mode, moon icon for dark mode
 */

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        transition-all duration-200
        ${isDark
          ? 'bg-gray-800 text-amber-400 hover:bg-gray-700'
          : 'bg-gray-100 text-yellow-500 hover:bg-gray-200'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}
        focus:ring-SIB-primary
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      {isDark ? (
        // Moon icon
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        // Sun icon
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.415 0l1.414 1.414a1 1 0 01-1.415 1.415L13.22 5.22a1 1 0 010-1.415zm2.828 2.828a1 1 0 011.415 0l1.414 1.414a1 1 0 01-1.415 1.415l-1.414-1.414a1 1 0 010-1.415zm2.828 2.829a1 1 0 011.415 0l1.414 1.414a1 1 0 01-1.415 1.415l-1.414-1.414a1 1 0 010-1.415zM10 11a1 1 0 110 2 1 1 0 010-2zm4.22-1.78a1 1 0 011.415 0l1.414 1.414a1 1 0 01-1.415 1.415l-1.414-1.414a1 1 0 010-1.415z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
