import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

const LanguageContext = createContext();

// Helper function to get language from URL (can be used outside Router)
const getLanguageFromPath = (pathname) => {
  if (!pathname) return null;
  if (pathname.startsWith('/ar/') || pathname === '/ar') {
    return 'ar';
  }
  if (pathname.startsWith('/en/') || pathname === '/en') {
    return 'en';
  }
  return null;
};

// Helper function to update URL with language prefix
const updateUrlWithLanguage = (lang, currentPath, navigate) => {
  if (!navigate || !currentPath) return;
  
  const search = window.location.search;
  const hash = window.location.hash;
  
  // Remove existing language prefix if any
  let newPath = currentPath.replace(/^\/(en|ar)/, '');
  if (!newPath.startsWith('/')) {
    newPath = '/' + newPath;
  }
  
  // Add new language prefix
  const langPrefix = lang === 'ar' ? '/ar' : '/en';
  const finalPath = langPrefix + newPath;
  
  navigate(finalPath + search + hash, { replace: true });
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [cookies, setCookie] = useCookies(['language']);

  useEffect(() => {
    // Get current pathname
    const pathname = window.location.pathname;
    
    // First, try to get language from URL
    const urlLanguage = getLanguageFromPath(pathname);
    
    // Then try cookie, then default to 'en'
    const savedLanguage = urlLanguage || cookies.language || 'en';
    
    setLanguage(savedLanguage);
    setCookie('language', savedLanguage, { path: '/', maxAge: 365 * 24 * 60 * 60 }); // 1 year
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLanguage;
  }, [cookies.language, setCookie]);

  // Listen to pathname changes
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;
      const urlLanguage = getLanguageFromPath(pathname);
      
      if (urlLanguage && urlLanguage !== language) {
        setLanguage(urlLanguage);
        setCookie('language', urlLanguage, { path: '/', maxAge: 365 * 24 * 60 * 60 });
        document.documentElement.dir = urlLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = urlLanguage;
      }
    };

    // Listen to popstate (back/forward navigation)
    window.addEventListener('popstate', handleLocationChange);
    
    // Also check on mount
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [language, setCookie]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setCookie('language', lang, { path: '/', maxAge: 365 * 24 * 60 * 60 }); // 1 year
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update URL if we have access to navigate
    const pathname = window.location.pathname;
    if (typeof window !== 'undefined' && window.history) {
      updateUrlWithLanguage(lang, pathname, (path) => {
        window.history.replaceState(null, '', path);
      });
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    const translations = language === 'ar' ? arTranslations : enTranslations;
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default values if context is not available
    return {
      language: 'en',
      changeLanguage: () => { },
      t: (key) => key
    };
  }
  return context;
};

