import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { FaHdd } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import './Storage.scss';

export default function Storage() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="admin-storage-page">
            <div className="admin-storage-page__wrapper">
                <div className="admin-storage-header">
                    <div className="admin-storage-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-storage-header__back"
                            title={t('adminStorage.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaHdd className="admin-storage-header__icon" />
                        <div>
                            <h1 className="admin-storage-header__title">{t('adminStorage.title')}</h1>
                            <p className="admin-storage-header__subtitle">{t('adminStorage.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="admin-storage-content">
                    <p>{t('adminStorage.comingSoon')}</p>
                </div>
            </div>
        </div>
    );
}

