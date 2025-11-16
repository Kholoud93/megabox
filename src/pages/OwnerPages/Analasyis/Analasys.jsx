import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL, adminService, withdrawalService } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import StatCard from '../../../components/StatCard/StatCard';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import { FaUsers, FaFileAlt, FaDollarSign, FaChartLine, FaDownload, FaEye, FaLink, FaMoneyBillWave } from 'react-icons/fa';
import './Analasys.scss';

export default function Analasys() {
    const { t } = useLanguage();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});

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

    const isLoading = usersLoading || withdrawalsLoading || promotersLoading;

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
                        {[...Array(6)].map((_, i) => (
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
                            label={t('adminAnalytics.totalPromoters')}
                            value={totalPromoters}
                            icon={<FaUsers />}
                            color="#10b981"
                            index={1}
                        />
                        <StatCard
                            label={t('adminAnalytics.promotersWithPlans')}
                            value={promotersWithPlans}
                            icon={<FaUsers />}
                            color="#f59e0b"
                            index={2}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalWithdrawals')}
                            value={totalWithdrawals}
                            icon={<FaMoneyBillWave />}
                            color="#ef4444"
                            index={3}
                        />
                        <StatCard
                            label={t('adminAnalytics.totalWithdrawalAmount')}
                            value={`${totalWithdrawalAmount.toFixed(2)} ${currency}`}
                            icon={<FaDollarSign />}
                            color="#8b5cf6"
                            index={4}
                        />
                        <StatCard
                            label={t('adminAnalytics.pendingWithdrawals')}
                            value={pendingWithdrawals}
                            icon={<FaChartLine />}
                            color="#f59e0b"
                            index={5}
                        />
                        <StatCard
                            label={t('adminAnalytics.approvedWithdrawals')}
                            value={approvedWithdrawals}
                            icon={<FaChartLine />}
                            color="#10b981"
                            index={6}
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
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-gray-500">
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
