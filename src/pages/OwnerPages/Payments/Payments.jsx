import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { FaCreditCard } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import './Payments.scss';

export default function Payments() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="admin-payments-page">
            <div className="admin-payments-page__wrapper">
                <div className="admin-payments-header">
                    <div className="admin-payments-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-payments-header__back"
                            title={t('adminPayments.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaCreditCard className="admin-payments-header__icon" />
                        <div>
                            <h1 className="admin-payments-header__title">{t('adminPayments.title')}</h1>
                            <p className="admin-payments-header__subtitle">{t('adminPayments.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="admin-payments-content">
                    <p>{t('adminPayments.comingSoon')}</p>
                </div>
            </div>
        </div>
    );
}

