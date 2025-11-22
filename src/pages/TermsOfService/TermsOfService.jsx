import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import './TermsOfService.scss';

export default function TermsOfService() {
    const { t, language } = useLanguage();

    return (
        <div className="TermsOfService" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="TermsOfService__container">
                <Link to="/" className="TermsOfService__back">
                    {language === 'ar' ? <HiArrowRight /> : <HiArrowLeft />}
                    <span>{t('common.back') || 'Back'}</span>
                </Link>
                
                <header className="TermsOfService__header">
                    <h1 className="TermsOfService__title">{t('termsModal.termsOfServiceTitle')} — MegaBox</h1>
                    <p className="TermsOfService__meta">
                        {t('termsModal.lastUpdated')}: January 2025
                    </p>
                </header>

                <article className="TermsOfService__content">
                    <p className="TermsOfService__welcome">
                        {t('termsModal.welcomeText')}
                    </p>
                    <div 
                        className="TermsOfService__text"
                        dangerouslySetInnerHTML={{ __html: t('termsModal.termsContent') }}
                    />
                </article>
            </div>
        </div>
    );
}

