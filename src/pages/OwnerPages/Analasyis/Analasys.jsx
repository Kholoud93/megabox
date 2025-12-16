import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { promoterService } from '../../../services/promoterService';
import { useLanguage } from '../../../context/LanguageContext';
import StatCard from '../../../components/StatCard/StatCard';
import { FaUsers, FaFileAlt, FaDollarSign, FaChartLine, FaDownload, FaEye, FaLink, FaMoneyBillWave, FaHdd, FaUserPlus, FaCrown } from 'react-icons/fa';
import './Analasys.scss';

// cspell:ignore Analasys
export default function Analasys() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;

    // Fetch all users
    const { data: usersData, isLoading: usersLoading } = useQuery(
        ['allUsers'],
        async () => {
            const response = await adminService.getAllUsers(token);
            return response?.message?.users || response?.data?.users || [];
        },
        { enabled: !!token }
    );

    // Fetch all withdrawals
    const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery(
        ['allWithdrawals'],
        () => adminService.getAllWithdrawals(token),
        { enabled: !!token }
    );

    // Fetch all promoters
    const { data: promotersData, isLoading: promotersLoading } = useQuery(
        ['allPromoters'],
        async () => {
            try {
                const response = await promoterService.getAllPromoters(token);
                // Handle different response structures
                if (Array.isArray(response)) {
                    return response;
                }
                if (response?.promoters && Array.isArray(response.promoters)) {
                    return response.promoters;
                }
                if (response?.data?.promoters && Array.isArray(response.data.promoters)) {
                    return response.data.promoters;
                }
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }
                return [];
            } catch (error) {
                console.error('Error fetching promoters:', error);
                return [];
            }
        },
        { enabled: !!token }
    );

    // Fetch user statistics
    const { data: userStatsData, isLoading: userStatsLoading } = useQuery(
        ['userStats'],
        () => adminService.getUserStats(token),
        { enabled: !!token }
    );

    // Fetch platform statistics including downloads and views from all promoters
    const { data: platformStats, isLoading: platformStatsLoading } = useQuery(
        ['platformStats', promotersData],
        async () => {
            try {
                // Normalize promotersData to ensure it's always an array
                const promotersArray = Array.isArray(promotersData) 
                    ? promotersData 
                    : (promotersData?.promoters && Array.isArray(promotersData.promoters))
                        ? promotersData.promoters
                        : (promotersData?.data?.promoters && Array.isArray(promotersData.data.promoters))
                            ? promotersData.data.promoters
                            : [];

                // Use getAllStorageStats for storage statistics
                const storageStats = await adminService.getAllStorageStats(token);
                // Calculate total storage from storage stats
                let totalStorageGB = 0;
                
                // Handle different response structures (matching Storage page format)
                if (storageStats?.stats?.totalUsedSpaceMB !== undefined) {
                    // Format: { stats: { totalUsedSpaceMB: ... } }
                    // totalUsedSpaceMB is in MB, convert to GB
                    totalStorageGB = storageStats.stats.totalUsedSpaceMB / 1024;
                } else if (storageStats?.data?.stats?.totalUsedSpaceMB !== undefined) {
                    // Nested format: { data: { stats: { totalUsedSpaceMB: ... } } }
                    totalStorageGB = storageStats.data.stats.totalUsedSpaceMB / 1024;
                } else if (storageStats?.totalUsedSpaceMB !== undefined) {
                    // Direct format: { totalUsedSpaceMB: ... }
                    totalStorageGB = storageStats.totalUsedSpaceMB / 1024;
                } else if (storageStats?.storage && Array.isArray(storageStats.storage)) {
                    // Old format: { storage: [...] }
                    totalStorageGB = storageStats.storage.reduce((sum, item) => {
                        const total = item.totalStorage || 0;
                        // Convert bytes to GB if needed (assuming bytes if > 1MB)
                        const totalGB = total > 1000000 ? total / (1024 * 1024 * 1024) : total;
                        return sum + totalGB;
                    }, 0);
                } else if (storageStats?.data?.storage && Array.isArray(storageStats.data.storage)) {
                    // Nested old format: { data: { storage: [...] } }
                    totalStorageGB = storageStats.data.storage.reduce((sum, item) => {
                        const total = item.totalStorage || 0;
                        const totalGB = total > 1000000 ? total / (1024 * 1024 * 1024) : total;
                        return sum + totalGB;
                    }, 0);
                }
                
                // Log for debugging
                if (totalStorageGB === 0) {
                    console.log('Storage stats response:', storageStats);
                }
                
                // Calculate promoters with plans
                const promotersWithPlansCount = promotersArray.filter(p =>
                    p.Downloadsplan === "true" || p.Downloadsplan === true ||
                    p.watchingplan === "true" || p.watchingplan === true
                ).length;

                // Fetch downloads and views from all promoters
                let totalDownloads = 0;
                let totalViews = 0;
                
                if (promotersArray && promotersArray.length > 0) {
                    // Fetch analytics for all promoters in parallel
                    const promoterPromises = promotersArray
                        .filter(promoter => promoter._id || promoter.id || promoter.userId)
                        .map(async (promoter) => {
                            const userId = promoter._id || promoter.id || promoter.userId;
                            if (!userId) return { downloads: 0, views: 0 };
                            
                            try {
                                const response = await adminService.getShareLinkAnalyticdownloads(userId, token);
                                
                                // Extract analytics data from response
                                let analyticsData = [];
                                
                                if (response.analytics && Array.isArray(response.analytics)) {
                                    analyticsData = response.analytics;
                                } else if (response.downloadsViews && Array.isArray(response.downloadsViews)) {
                                    analyticsData = response.downloadsViews;
                                } else if (response.data && Array.isArray(response.data)) {
                                    analyticsData = response.data;
                                } else if (Array.isArray(response)) {
                                    analyticsData = response;
                                }

                                // Sum downloads and views for this promoter
                                const promoterDownloads = analyticsData.reduce((sum, item) => {
                                    return sum + (item.downloads || item.totalDownloads || 0);
                                }, 0);
                                
                                const promoterViews = analyticsData.reduce((sum, item) => {
                                    return sum + (item.views || item.totalViews || 0);
                                }, 0);

                                return { downloads: promoterDownloads, views: promoterViews };
                            } catch (error) {
                                // Only log non-404 errors (404 means user has no shared files, which is expected)
                                if (error?.response?.status !== 404 && error?.status !== 404) {
                                    console.error(`Error fetching analytics for promoter ${userId}:`, error);
                                }
                                return { downloads: 0, views: 0 };
                            }
                        });

                    // Wait for all promises to resolve
                    const allPromoterStats = await Promise.all(promoterPromises);
                    
                    // Aggregate all downloads and views
                    totalDownloads = allPromoterStats.reduce((sum, stat) => sum + stat.downloads, 0);
                    totalViews = allPromoterStats.reduce((sum, stat) => sum + stat.views, 0);
                }

                return {
                    totalStorage: Math.round(totalStorageGB * 100) / 100, // Round to 2 decimal places
                    totalPayments: 0, // Will be calculated from paymentsData
                    totalSubscriptions: promotersWithPlansCount,
                    totalDownloads: totalDownloads,
                    totalViews: totalViews
                };
            } catch (error) {
                console.error('Error fetching platform stats:', error);
                // Calculate promoters with plans even on error
                // Normalize promotersData to ensure it's always an array
                const promotersArray = Array.isArray(promotersData) 
                    ? promotersData 
                    : (promotersData?.promoters && Array.isArray(promotersData.promoters))
                        ? promotersData.promoters
                        : (promotersData?.data?.promoters && Array.isArray(promotersData.data.promoters))
                            ? promotersData.data.promoters
                            : [];
                const promotersWithPlansCount = promotersArray.filter(p =>
                    p.Downloadsplan === "true" || p.Downloadsplan === true ||
                    p.watchingplan === "true" || p.watchingplan === true
                ).length;
                
                // Try to get storage stats even on error
                let totalStorageGB = 0;
                try {
                    const storageStats = await adminService.getAllStorageStats(token);
                    if (storageStats?.stats?.totalUsedSpaceMB !== undefined) {
                        totalStorageGB = storageStats.stats.totalUsedSpaceMB / 1024;
                    } else if (storageStats?.data?.stats?.totalUsedSpaceMB !== undefined) {
                        totalStorageGB = storageStats.data.stats.totalUsedSpaceMB / 1024;
                    } else if (storageStats?.totalUsedSpaceMB !== undefined) {
                        totalStorageGB = storageStats.totalUsedSpaceMB / 1024;
                    }
                } catch (storageError) {
                    console.error('Error fetching storage stats in error handler:', storageError);
                }
                
                return {
                    totalStorage: Math.round(totalStorageGB * 100) / 100,
                    totalPayments: 0,
                    totalSubscriptions: promotersWithPlansCount,
                    totalDownloads: 0,
                    totalViews: 0
                };
            }
        },
        { enabled: !!token && !!promotersData }
    );

    const isLoading = usersLoading || withdrawalsLoading || promotersLoading || platformStatsLoading || userStatsLoading;

    // Normalize promotersData to ensure it's always an array
    const normalizedPromotersData = useMemo(() => {
        if (Array.isArray(promotersData)) {
            return promotersData;
        }
        if (promotersData?.promoters && Array.isArray(promotersData.promoters)) {
            return promotersData.promoters;
        }
        if (promotersData?.data?.promoters && Array.isArray(promotersData.data.promoters)) {
            return promotersData.data.promoters;
        }
        return [];
    }, [promotersData]);

    // Calculate statistics
    const totalUsers = usersData?.length || 0;
    const totalPromoters = normalizedPromotersData.length || 0;
    const totalWithdrawals = withdrawalsData?.withdrawals?.length || 0;
    const totalWithdrawalAmount = withdrawalsData?.withdrawals?.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0) || 0;
    const pendingWithdrawals = withdrawalsData?.withdrawals?.filter(w => w.status === 'pending')?.length || 0;
    const approvedWithdrawals = withdrawalsData?.withdrawals?.filter(w => w.status === 'approved')?.length || 0;
    const currency = withdrawalsData?.withdrawals?.[0]?.currency || 'USD';

    // Calculate promoter statistics
    const promotersWithPlans = normalizedPromotersData.filter(p =>
        p.Downloadsplan === "true" || p.Downloadsplan === true ||
        p.watchingplan === "true" || p.watchingplan === true
    ).length;

    // Calculate new users (last 30 days)
    const newUsers = useMemo(() => {
        if (!usersData) return 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return usersData.filter(user => {
            const createdAt = user.createdAt || user.created_at || user.dateCreated;
            if (!createdAt) return false;
            return new Date(createdAt) >= thirtyDaysAgo;
        }).length;
    }, [usersData]);

    // Platform statistics
    const totalStorage = platformStats?.totalStorage || 0; // GB
    const totalSubscriptions = platformStats?.totalSubscriptions !== undefined ? platformStats.totalSubscriptions : promotersWithPlans; // Fallback to promoters with plans
    const totalDownloads = platformStats?.totalDownloads || 0;
    const totalViews = platformStats?.totalViews || 0;


    return (
        <div className="admin-analytics-page">
            <div className="admin-analytics-page__wrapper">
                {/* Header */}
                <motion.div
                    className="admin-analytics-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="admin-analytics-header__content">
                        <FaChartLine className="admin-analytics-header__icon" />
                        <div>
                            <h1 className="admin-analytics-header__title">{t('adminAnalytics.title')}</h1>
                            <p className="admin-analytics-header__subtitle">{t('adminAnalytics.subtitle')}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                {isLoading ? (
                    <div className="admin-analytics-skeleton">
                        {[...Array(13)].map((_, i) => (
                            <div key={i} className="skeleton-card"></div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="admin-analytics-stats"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <StatCard
                            label={t('adminAnalytics.totalUsers')}
                            value={totalUsers}
                            icon={<FaUsers />}
                            color="#6366f1"
                            index={0}
                            onClick={() => navigate('/Owner/Users')}
                        />
                        <StatCard
                            label={t('adminAnalytics.newUsers')}
                            value={newUsers}
                            icon={<FaUserPlus />}
                            color="#06b6d4"
                            index={1}
                            onClick={() => navigate('/Owner/Users')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalPromoters')}
                            value={totalPromoters}
                            icon={<FaUsers />}
                            color="#10b981"
                            index={2}
                            onClick={() => navigate('/Owner/AllPromoters')}
                        />
                        <StatCard
                            label={t('adminAnalytics.promotersWithPlans')}
                            value={promotersWithPlans}
                            icon={<FaUsers />}
                            color="#f59e0b"
                            index={3}
                            onClick={() => navigate('/Owner/Subscriptions')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalStorage')}
                            value={`${totalStorage} GB`}
                            icon={<FaHdd />}
                            color="#3b82f6"
                            index={4}
                            onClick={() => navigate('/Owner/Storage')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalSubscriptions')}
                            value={totalSubscriptions}
                            icon={<FaCrown />}
                            color="#f59e0b"
                            index={5}
                            onClick={() => navigate('/Owner/Subscriptions')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalDownloads')}
                            value={totalDownloads}
                            icon={<FaDownload />}
                            color="#10b981"
                            index={6}
                            onClick={() => navigate('/Owner/DownloadsViews')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalViews')}
                            value={totalViews}
                            icon={<FaEye />}
                            color="#ef4444"
                            index={7}
                            onClick={() => navigate('/Owner/DownloadsViews')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalWithdrawals')}
                            value={totalWithdrawals}
                            icon={<FaMoneyBillWave />}
                            color="#ef4444"
                            index={8}
                            onClick={() => navigate('/Owner/Withdrawals')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalWithdrawalAmount')}
                            value={`${totalWithdrawalAmount.toFixed(2)} ${currency}`}
                            icon={<FaDollarSign />}
                            color="#8b5cf6"
                            index={9}
                            onClick={() => navigate('/Owner/Withdrawals')}
                        />
                        <StatCard
                            label={t('adminAnalytics.pendingWithdrawals')}
                            value={pendingWithdrawals}
                            icon={<FaChartLine />}
                            color="#f59e0b"
                            index={10}
                            onClick={() => navigate('/Owner/Withdrawals')}
                        />
                        <StatCard
                            label={t('adminAnalytics.approvedWithdrawals')}
                            value={approvedWithdrawals}
                            icon={<FaChartLine />}
                            color="#10b981"
                            index={11}
                            onClick={() => navigate('/Owner/Withdrawals')}
                        />
                        {userStatsData && (
                            <StatCard
                                label={t('adminAnalytics.userStats') || 'User Statistics'}
                                value={userStatsData?.totalUsers || userStatsData?.count || Object.keys(userStatsData || {}).length || 0}
                                icon={<FaUsers />}
                                color="#9333ea"
                                index={13}
                                onClick={() => navigate('/Owner/UserStats')}
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};
