import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [cookies, setCookie] = useCookies(['theme']);

  useEffect(() => {
    // Load theme from cookie or default to 'light'
    const savedTheme = cookies.theme || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, [cookies.theme]);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setCookie('theme', newTheme, { path: '/', maxAge: 365 * 24 * 60 * 60 }); // 1 year
    applyTheme(newTheme);
  };

  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
      setCookie('theme', mode, { path: '/', maxAge: 365 * 24 * 60 * 60 });
      applyTheme(mode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default values if context is not available
    return {
      theme: 'light',
      toggleTheme: () => {},
      setThemeMode: () => {}
    };
  }
  return context;
};

