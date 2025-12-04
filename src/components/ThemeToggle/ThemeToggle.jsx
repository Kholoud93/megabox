import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import './ThemeToggle.scss';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      type="button"
    >
      {theme === 'light' ? (
        <FiMoon size={20} className="theme-toggle__icon" />
      ) : (
        <FiSun size={20} className="theme-toggle__icon" />
      )}
    </button>
  );
};

export default ThemeToggle;

