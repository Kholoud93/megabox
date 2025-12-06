import React from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import { FaHdd } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import './Storage.scss';

export default function Storage() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;


    // Fetch storage statistics
    const { data: storageStats, isLoading: storageLoading } = useQuery(
        ['allStorageStats'],
        async () => {
            try {
                const response = await adminService.getAllStorageStats(token);
                // Handle the expected response format: { success: true, stats: {...} }
                if (response?.stats) return response;
                if (response?.data?.stats) return { stats: response.data.stats, success: response.data.success };
                if (response?.success && response?.stats) return response;
                // Fallback to old format if needed
                return { success: true, stats: response || {} };
            } catch (error) {
                console.error('Error fetching storage stats:', error);
                return { success: false, stats: {} };
            }
        },
        { 
            enabled: !!token
        }
    );

    // Format MB to readable format
    const formatMB = (mb) => {
        if (!mb || mb === 0) return '0 MB';
        if (mb < 1024) return `${mb.toFixed(2)} MB`;
        const gb = mb / 1024;
        return `${gb.toFixed(2)} GB`;
    };

    const stats = storageStats?.stats || {};

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

                {storageLoading ? (
                    <div className="admin-storage-loading">
                        <p>{t('adminStorage.loading')}</p>
                    </div>
                ) : storageStats?.success && stats ? (
                    <div className="admin-storage-stats">
                        <div className="admin-storage-stats__grid">
                            <div className="admin-storage-stats__card">
                                <div className="admin-storage-stats__icon-wrapper">
                                    <svg className="admin-storage-stats__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="admin-storage-stats__label">{t('adminStorage.totalFiles')}</div>
                                <div className="admin-storage-stats__value">{stats.totalFiles || 0}</div>
                            </div>
                            <div className="admin-storage-stats__card">
                                <div className="admin-storage-stats__icon-wrapper">
                                    <svg className="admin-storage-stats__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <div className="admin-storage-stats__label">{t('adminStorage.totalFolders')}</div>
                                <div className="admin-storage-stats__value">{stats.totalFolders || 0}</div>
                            </div>
                            <div className="admin-storage-stats__card">
                                <div className="admin-storage-stats__icon-wrapper">
                                    <svg className="admin-storage-stats__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </div>
                                <div className="admin-storage-stats__label">{t('adminStorage.sharedFiles')}</div>
                                <div className="admin-storage-stats__value">{stats.sharedFiles || 0}</div>
                            </div>
                            <div className="admin-storage-stats__card">
                                <div className="admin-storage-stats__icon-wrapper">
                                    <svg className="admin-storage-stats__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="admin-storage-stats__label">{t('adminStorage.uniqueSharedUsers')}</div>
                                <div className="admin-storage-stats__value">{stats.uniqueSharedUsers || 0}</div>
                            </div>
                            <div className="admin-storage-stats__card admin-storage-stats__card--highlight">
                                <div className="admin-storage-stats__icon-wrapper">
                                    <FaHdd className="admin-storage-stats__icon" />
                                </div>
                                <div className="admin-storage-stats__label">{t('adminStorage.totalUsedSpace')}</div>
                                <div className="admin-storage-stats__value">{formatMB(stats.totalUsedSpaceMB || 0)}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="admin-storage-empty">
                        <p>{t('adminStorage.noStorage')}</p>
                    </div>
                )}
            </div>

        </div>
    );
}
