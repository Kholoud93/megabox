import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [cookies, setCookie] = useCookies(['language']);

  useEffect(() => {
    // Load language from cookie or default to 'en'
    const savedLanguage = cookies.language || 'en';
    setLanguage(savedLanguage);
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLanguage;
  }, [cookies.language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setCookie('language', lang, { path: '/', maxAge: 365 * 24 * 60 * 60 }); // 1 year
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
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

