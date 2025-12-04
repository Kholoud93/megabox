import { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageRoute({ children }) {
    const { language } = useLanguage();

    useEffect(() => {
        // Ensure document direction and lang attribute are set based on current language
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    return children;
}

