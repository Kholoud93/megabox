import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageRoute({ children }) {
    const { lang } = useParams();
    const { changeLanguage } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        if (lang && (lang === 'en' || lang === 'ar')) {
            changeLanguage(lang);
        }
    }, [lang, changeLanguage]);

    return children;
}

