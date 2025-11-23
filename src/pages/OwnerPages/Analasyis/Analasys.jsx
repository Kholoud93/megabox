import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { promoterService } from '../../../services/promoterService';
import { useLanguage } from '../../../context/LanguageContext';
import StatCard from '../../../components/StatCard/StatCard';
import { FaUsers, FaFileAlt, FaDollarSign, FaChartLine, FaDownload, FaEye, FaLink, FaMoneyBillWave, FaHdd, FaUserPlus, FaCreditCard, FaCrown } from 'react-icons/fa';
import './Analasys.scss';

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
            const response = await promoterService.getAllPromoters(token);
            return response?.promoters || response?.data?.promoters || [];
        },
        { enabled: !!token }
    );

    // Fetch platform statistics (placeholder - will be connected to API later)
    const { data: platformStats, isLoading: platformStatsLoading } = useQuery(
        ['platformStats'],
        async () => {
            // TODO: Connect to API endpoint
            // const res = await axios.get(`${API_URL}/admin/getPlatformStats`, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // return res?.data;
            return {
                totalStorage: 0, // GB
                newUsers: 0, // Last 30 days
                totalPayments: 0,
                totalSubscriptions: 0,
                totalDownloads: 0,
                totalViews: 0
            };
        },
        { enabled: !!token }
    );

    const isLoading = usersLoading || withdrawalsLoading || promotersLoading || platformStatsLoading;

    // Calculate statistics
    const totalUsers = usersData?.length || 0;
    const totalPromoters = promotersData?.length || 0;
    const totalWithdrawals = withdrawalsData?.withdrawals?.length || 0;
    const totalWithdrawalAmount = withdrawalsData?.withdrawals?.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0) || 0;
    const pendingWithdrawals = withdrawalsData?.withdrawals?.filter(w => w.status === 'pending')?.length || 0;
    const approvedWithdrawals = withdrawalsData?.withdrawals?.filter(w => w.status === 'approved')?.length || 0;
    const currency = withdrawalsData?.withdrawals?.[0]?.currency || 'USD';

    // Calculate promoter statistics
    const promotersWithPlans = promotersData?.filter(p =>
        p.Downloadsplan === "true" || p.Downloadsplan === true ||
        p.watchingplan === "true" || p.watchingplan === true
    )?.length || 0;

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
    const totalPayments = platformStats?.totalPayments || 0;
    const totalSubscriptions = platformStats?.totalSubscriptions || promotersWithPlans; // Fallback to promoters with plans
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
                            label={t('adminAnalytics.totalPayments')}
                            value={totalPayments}
                            icon={<FaCreditCard />}
                            color="#8b5cf6"
                            index={5}
                            onClick={() => navigate('/Owner/Payments')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalSubscriptions')}
                            value={totalSubscriptions}
                            icon={<FaCrown />}
                            color="#f59e0b"
                            index={6}
                            onClick={() => navigate('/Owner/Subscriptions')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalDownloads')}
                            value={totalDownloads}
                            icon={<FaDownload />}
                            color="#10b981"
                            index={7}
                            onClick={() => navigate('/Owner/DownloadsViews')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalViews')}
                            value={totalViews}
                            icon={<FaEye />}
                            color="#ef4444"
                            index={8}
                            onClick={() => navigate('/Owner/DownloadsViews')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalWithdrawals')}
                            value={totalWithdrawals}
                            icon={<FaMoneyBillWave />}
                            color="#ef4444"
                            index={9}
                            onClick={() => navigate('/Owner/Withdrawals')}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalWithdrawalAmount')}
                            value={`${totalWithdrawalAmount.toFixed(2)} ${currency}`}
                            icon={<FaDollarSign />}
                            color="#8b5cf6"
                            index={10}
                            onClick={() => navigate('/Owner/Withdrawals')}
                        />
                        <StatCard
                            label={t('adminAnalytics.pendingWithdrawals')}
                            value={pendingWithdrawals}
                            icon={<FaChartLine />}
                            color="#f59e0b"
                            index={11}
                            onClick={() => navigate('/Owner/Withdrawals')}
                        />
                        <StatCard
                            label={t('adminAnalytics.approvedWithdrawals')}
                            value={approvedWithdrawals}
                            icon={<FaChartLine />}
                            color="#10b981"
                            index={12}
                            onClick={() => navigate('/Owner/Withdrawals')}
                        />
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
