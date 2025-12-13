import React from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import { FaUsers, FaChartLine } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import StatCard from '../../../components/StatCard/StatCard';
import Loading from '../../../components/Loading/Loading';
import './UserStats.scss';

export default function UserStats() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;

    // Fetch user statistics
    const { data: userStats, isLoading: userStatsLoading } = useQuery(
        ['userStats'],
        () => adminService.getUserStats(token),
        { enabled: !!token }
    );

    return (
        <div className="admin-user-stats-page">
            <div className="admin-user-stats-page__wrapper">
                <div className="admin-user-stats-header">
                    <div className="admin-user-stats-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-user-stats-header__back"
                            title={t('adminUserStats.backToAnalytics') || 'Back to Analytics'}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaChartLine className="admin-user-stats-header__icon" />
                        <div>
                            <h1 className="admin-user-stats-header__title">
                                {t('adminUserStats.title') || 'User Statistics'}
                            </h1>
                            <p className="admin-user-stats-header__subtitle">
                                {t('adminUserStats.subtitle') || 'Comprehensive user statistics and analytics'}
                            </p>
                        </div>
                    </div>
                </div>

                {userStatsLoading ? (
                    <div className="admin-user-stats-loading">
                        <Loading />
                    </div>
                ) : userStats ? (
                    <div className="admin-user-stats-content">
                        <div className="admin-user-stats-grid">
                            {userStats.totalUsers !== undefined && (
                                <StatCard
                                    label={t('adminUserStats.totalUsers') || 'Total Users'}
                                    value={userStats.totalUsers}
                                    icon={<FaUsers />}
                                    color="#6366f1"
                                    index={0}
                                    onClick={() => navigate('/Owner/Users')}
                                />
                            )}
                            {userStats.activeUsers !== undefined && (
                                <StatCard
                                    label={t('adminUserStats.activeUsers') || 'Active Users'}
                                    value={userStats.activeUsers}
                                    icon={<FaUsers />}
                                    color="#10b981"
                                    index={1}
                                />
                            )}
                            {userStats.newUsers !== undefined && (
                                <StatCard
                                    label={t('adminUserStats.newUsers') || 'New Users'}
                                    value={userStats.newUsers}
                                    icon={<FaUsers />}
                                    color="#06b6d4"
                                    index={2}
                                />
                            )}
                            {userStats.premiumUsers !== undefined && (
                                <StatCard
                                    label={t('adminUserStats.premiumUsers') || 'Premium Users'}
                                    value={userStats.premiumUsers}
                                    icon={<FaUsers />}
                                    color="#f59e0b"
                                    index={3}
                                />
                            )}
                            {userStats.totalFiles !== undefined && (
                                <StatCard
                                    label={t('adminUserStats.totalFiles') || 'Total Files'}
                                    value={userStats.totalFiles}
                                    icon={<FaChartLine />}
                                    color="#3b82f6"
                                    index={4}
                                />
                            )}
                            {userStats.totalStorage !== undefined && (
                                <StatCard
                                    label={t('adminUserStats.totalStorage') || 'Total Storage'}
                                    value={`${(userStats.totalStorage / (1024 * 1024 * 1024)).toFixed(2)} GB`}
                                    icon={<FaChartLine />}
                                    color="#8b5cf6"
                                    index={5}
                                />
                            )}
                            {/* Display any additional stats from the API */}
                            {Object.entries(userStats).map(([key, value], index) => {
                                // Skip already displayed stats
                                if (['totalUsers', 'activeUsers', 'newUsers', 'premiumUsers', 'totalFiles', 'totalStorage'].includes(key)) {
                                    return null;
                                }
                                // Skip non-numeric values
                                if (typeof value !== 'number') {
                                    return null;
                                }
                                return (
                                    <StatCard
                                        key={key}
                                        label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                        value={value}
                                        icon={<FaChartLine />}
                                        color="#9333ea"
                                        index={6 + index}
                                    />
                                );
                            })}
                        </div>

                        {/* Display raw data if available */}
                        {userStats && Object.keys(userStats).length > 0 && (
                            <div className="admin-user-stats-details">
                                <h2 className="admin-user-stats-details__title">
                                    {t('adminUserStats.detailedStats') || 'Detailed Statistics'}
                                </h2>
                                <div className="admin-user-stats-details__content">
                                    <pre className="admin-user-stats-details__json">
                                        {JSON.stringify(userStats, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="admin-user-stats-empty">
                        <p>{t('adminUserStats.noStats') || 'No user statistics available'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
