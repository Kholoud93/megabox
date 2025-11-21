import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FaDownload, FaEye } from 'react-icons/fa';
import './DownloadsViews.scss';

export default function DownloadsViews() {
    const { t } = useLanguage();

    return (
        <div className="admin-downloads-views-page">
            <div className="admin-downloads-views-page__wrapper">
                <div className="admin-downloads-views-header">
                    <div className="admin-downloads-views-header__content">
                        <div className="admin-downloads-views-header__icons">
                            <FaDownload className="admin-downloads-views-header__icon" />
                            <FaEye className="admin-downloads-views-header__icon" />
                        </div>
                        <div>
                            <h1 className="admin-downloads-views-header__title">{t('adminDownloadsViews.title')}</h1>
                            <p className="admin-downloads-views-header__subtitle">{t('adminDownloadsViews.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="admin-downloads-views-content">
                    <p>{t('adminDownloadsViews.comingSoon')}</p>
                </div>
            </div>
        </div>
    );
}

