import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL, adminService, withdrawalService } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import StatCard from '../../../components/StatCard/StatCard';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import { FaUsers, FaFileAlt, FaDollarSign, FaChartLine, FaDownload, FaEye, FaLink, FaMoneyBillWave, FaCheck, FaTimes, FaHdd, FaUserPlus, FaCreditCard, FaCrown } from 'react-icons/fa';
import './Analasys.scss';

export default function Analasys() {
    const { t } = useLanguage();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const queryClient = useQueryClient();
    const [processingWithdrawals, setProcessingWithdrawals] = useState(new Set());

    // Fetch all users
    const { data: usersData, isLoading: usersLoading } = useQuery(
        ['allUsers'],
        async () => {
            const res = await axios.get(`${API_URL}/user/getAllUsers`);
            return res?.data?.message?.users || [];
        },
        { enabled: !!token }
    );

    // Fetch all withdrawals
    const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery(
        ['allWithdrawals'],
        () => withdrawalService.getAllWithdrawals(token),
        { enabled: !!token }
    );

    // Fetch all promoters
    const { data: promotersData, isLoading: promotersLoading } = useQuery(
        ['allPromoters'],
        async () => {
            const res = await axios.get(`${API_URL}/auth/getAllPromoters`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res?.data?.promoters || [];
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

    // Filter withdrawals based on search and filters
    const filteredWithdrawals = useMemo(() => {
        if (!withdrawalsData?.withdrawals) return [];

        return withdrawalsData.withdrawals.filter((withdrawal) => {
            // Search filter
            if (searchTerm) {
                const userInfo = typeof withdrawal.userId === 'object' && withdrawal.userId !== null
                    ? `${withdrawal.userId.username || ''} ${withdrawal.userId.email || ''} ${withdrawal.userId._id || ''}`
                    : `${withdrawal.userId || ''} ${withdrawal.username || ''}`;

                const searchLower = searchTerm.toLowerCase();
                if (!userInfo.toLowerCase().includes(searchLower) &&
                    !withdrawal.amount?.toString().toLowerCase().includes(searchLower) &&
                    !withdrawal.paymentMethod?.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }

            // Status filter
            if (filters.status && withdrawal.status !== filters.status) {
                return false;
            }

            // Payment method filter
            if (filters.paymentMethod && withdrawal.paymentMethod !== filters.paymentMethod) {
                return false;
            }

            return true;
        });
    }, [withdrawalsData?.withdrawals, searchTerm, filters]);

    // Get unique payment methods for filter
    const paymentMethods = useMemo(() => {
        if (!withdrawalsData?.withdrawals) return [];
        const methods = new Set();
        withdrawalsData.withdrawals.forEach(w => {
            if (w.paymentMethod) methods.add(w.paymentMethod);
        });
        return Array.from(methods).map(method => ({
            value: method,
            label: method
        }));
    }, [withdrawalsData?.withdrawals]);

    // Filter configuration
    const filterConfig = [
        {
            key: 'status',
            label: t('adminAnalytics.status'),
            allLabel: t('searchFilter.all'),
            options: [
                { value: 'pending', label: t('adminAnalytics.pending') },
                { value: 'approved', label: t('adminAnalytics.approved') },
                { value: 'rejected', label: t('adminAnalytics.rejected') }
            ]
        },
        ...(paymentMethods.length > 0 ? [{
            key: 'paymentMethod',
            label: t('adminAnalytics.paymentMethod'),
            allLabel: t('searchFilter.all'),
            options: paymentMethods
        }] : [])
    ];

    // Handle approve withdrawal (placeholder - will be connected to API later)
    const handleApprove = async (withdrawalId) => {
        setProcessingWithdrawals(prev => new Set(prev).add(withdrawalId));
        // TODO: Connect to API endpoint
        // await withdrawalService.updateWithdrawalStatus(withdrawalId, 'approved', token);
        // queryClient.invalidateQueries(['allWithdrawals']);
        setTimeout(() => {
            setProcessingWithdrawals(prev => {
                const newSet = new Set(prev);
                newSet.delete(withdrawalId);
                return newSet;
            });
        }, 1000);
    };

    // Handle reject withdrawal (placeholder - will be connected to API later)
    const handleReject = async (withdrawalId) => {
        setProcessingWithdrawals(prev => new Set(prev).add(withdrawalId));
        // TODO: Connect to API endpoint
        // await withdrawalService.updateWithdrawalStatus(withdrawalId, 'rejected', token);
        // queryClient.invalidateQueries(['allWithdrawals']);
        setTimeout(() => {
            setProcessingWithdrawals(prev => {
                const newSet = new Set(prev);
                newSet.delete(withdrawalId);
                return newSet;
            });
        }, 1000);
    };

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
                        />
                        <StatCard
                            label={t('adminAnalytics.newUsers')}
                            value={newUsers}
                            icon={<FaUserPlus />}
                            color="#06b6d4"
                            index={1}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalPromoters')}
                            value={totalPromoters}
                            icon={<FaUsers />}
                            color="#10b981"
                            index={2}
                        />
                        <StatCard
                            label={t('adminAnalytics.promotersWithPlans')}
                            value={promotersWithPlans}
                            icon={<FaUsers />}
                            color="#f59e0b"
                            index={3}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalStorage')}
                            value={`${totalStorage} GB`}
                            icon={<FaHdd />}
                            color="#3b82f6"
                            index={4}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalPayments')}
                            value={totalPayments}
                            icon={<FaCreditCard />}
                            color="#8b5cf6"
                            index={5}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalSubscriptions')}
                            value={totalSubscriptions}
                            icon={<FaCrown />}
                            color="#f59e0b"
                            index={6}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalDownloads')}
                            value={totalDownloads}
                            icon={<FaDownload />}
                            color="#10b981"
                            index={7}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalViews')}
                            value={totalViews}
                            icon={<FaEye />}
                            color="#ef4444"
                            index={8}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalWithdrawals')}
                            value={totalWithdrawals}
                            icon={<FaMoneyBillWave />}
                            color="#ef4444"
                            index={9}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalWithdrawalAmount')}
                            value={`${totalWithdrawalAmount.toFixed(2)} ${currency}`}
                            icon={<FaDollarSign />}
                            color="#8b5cf6"
                            index={10}
                        />
                        <StatCard
                            label={t('adminAnalytics.pendingWithdrawals')}
                            value={pendingWithdrawals}
                            icon={<FaChartLine />}
                            color="#f59e0b"
                            index={11}
                        />
                        <StatCard
                            label={t('adminAnalytics.approvedWithdrawals')}
                            value={approvedWithdrawals}
                            icon={<FaChartLine />}
                            color="#10b981"
                            index={12}
                        />
                    </motion.div>
                )}

                {/* Withdrawals Summary */}
                {!isLoading && withdrawalsData?.withdrawals?.length > 0 && (
                    <motion.div
                        className="admin-analytics-withdrawals"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="admin-analytics-withdrawals__header">
                            <h2 className="admin-analytics-withdrawals__title">{t('adminAnalytics.recentWithdrawals')}</h2>
                            <p className="admin-analytics-withdrawals__count">
                                {filteredWithdrawals.length} {t('adminAnalytics.of')} {withdrawalsData.withdrawals.length}
                            </p>
                        </div>

                        <SearchFilter
                            searchPlaceholder={t('adminAnalytics.searchWithdrawals')}
                            filters={filterConfig}
                            onSearchChange={setSearchTerm}
                            onFilterChange={setFilters}
                        />

                        <div className="admin-analytics-withdrawals__table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('adminAnalytics.user')}</th>
                                        <th>{t('adminAnalytics.amount')}</th>
                                        <th>{t('adminAnalytics.paymentMethod')}</th>
                                        <th>{t('adminAnalytics.status')}</th>
                                        <th>{t('adminAnalytics.date')}</th>
                                        <th>{t('adminAnalytics.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWithdrawals.length > 0 ? (
                                        filteredWithdrawals.slice(0, 10).map((withdrawal, index) => (
                                            <motion.tr
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <td>
                                                    {typeof withdrawal.userId === 'object' && withdrawal.userId !== null
                                                        ? (withdrawal.userId.username || withdrawal.userId.email || withdrawal.userId._id || '-')
                                                        : (withdrawal.userId || withdrawal.username || '-')
                                                    }
                                                </td>
                                                <td>{withdrawal.amount} {withdrawal.currency || currency}</td>
                                                <td>{withdrawal.paymentMethod || '-'}</td>
                                                <td>
                                                    <span className={`status-badge status-${withdrawal.status || 'pending'}`}>
                                                        {withdrawal.status === 'approved'
                                                            ? t('adminAnalytics.approved')
                                                            : withdrawal.status === 'pending'
                                                                ? t('adminAnalytics.pending')
                                                                : withdrawal.status === 'rejected'
                                                                    ? t('adminAnalytics.rejected')
                                                                    : withdrawal.status || t('adminAnalytics.pending')}
                                                    </span>
                                                </td>
                                                <td>
                                                    {withdrawal.createdAt
                                                        ? new Date(withdrawal.createdAt).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td>
                                                    <div className="admin-analytics-actions">
                                                        {withdrawal.status === 'pending' ? (
                                                            <>
                                                                <motion.button
                                                                    className="admin-analytics-actions__btn admin-analytics-actions__btn--approve"
                                                                    onClick={() => handleApprove(withdrawal._id || withdrawal.id)}
                                                                    disabled={processingWithdrawals.has(withdrawal._id || withdrawal.id)}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    title={t('adminAnalytics.approve')}
                                                                >
                                                                    <FaCheck />
                                                                </motion.button>
                                                                <motion.button
                                                                    className="admin-analytics-actions__btn admin-analytics-actions__btn--reject"
                                                                    onClick={() => handleReject(withdrawal._id || withdrawal.id)}
                                                                    disabled={processingWithdrawals.has(withdrawal._id || withdrawal.id)}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    title={t('adminAnalytics.reject')}
                                                                >
                                                                    <FaTimes />
                                                                </motion.button>
                                                            </>
                                                        ) : (
                                                            <span className="admin-analytics-actions__no-action">
                                                                {t('adminAnalytics.noAction')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                                {t('adminAnalytics.noWithdrawalsFound')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
