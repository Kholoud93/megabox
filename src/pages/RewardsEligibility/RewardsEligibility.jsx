import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import './RewardsEligibility.scss';

export default function RewardsEligibility() {
    const { t, language } = useLanguage();

    return (
        <div className="RewardsEligibility" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="RewardsEligibility__container">
                <Link to="/" className="RewardsEligibility__back">
                    {language === 'ar' ? <HiArrowRight /> : <HiArrowLeft />}
                    <span>{t('common.back') || 'Back'}</span>
                </Link>
                
                <header className="RewardsEligibility__header">
                    <h1 className="RewardsEligibility__title">{t('termsModal.rewardsEligibilityTitle')}</h1>
                </header>

                <article className="RewardsEligibility__content">
                    <p className="RewardsEligibility__description">
                        {t('termsModal.rewardsEligibilityDesc')}
                    </p>
                    <ul className="RewardsEligibility__rules">
                        <li>{t('termsModal.rewardsRule1')}</li>
                        <li>{t('termsModal.rewardsRule2')}</li>
                        <li>{t('termsModal.rewardsRule3')}</li>
                        <li>{t('termsModal.rewardsRule4')}</li>
                    </ul>
                </article>
            </div>
        </div>
    );
}

