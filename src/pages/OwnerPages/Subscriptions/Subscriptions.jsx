import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { FaCrown } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import './Subscriptions.scss';

export default function Subscriptions() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="admin-subscriptions-page">
            <div className="admin-subscriptions-page__wrapper">
                <div className="admin-subscriptions-header">
                    <div className="admin-subscriptions-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-subscriptions-header__back"
                            title={t('adminSubscriptions.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaCrown className="admin-subscriptions-header__icon" />
                        <div>
                            <h1 className="admin-subscriptions-header__title">{t('adminSubscriptions.title')}</h1>
                            <p className="admin-subscriptions-header__subtitle">{t('adminSubscriptions.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="admin-subscriptions-content">
                    <p>{t('adminSubscriptions.comingSoon')}</p>
                </div>
            </div>
        </div>
    );
}

