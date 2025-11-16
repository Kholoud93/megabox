import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL, adminService, withdrawalService } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import StatCard from '../../../components/StatCard/StatCard';
import { FaUsers, FaFileAlt, FaDollarSign, FaChartLine, FaDownload, FaEye, FaLink, FaMoneyBillWave } from 'react-icons/fa';
import './Analasys.scss';

export default function Analasys() {
    const { t } = useLanguage();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;

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
                        <h2 className="admin-analytics-withdrawals__title">{t('adminAnalytics.recentWithdrawals')}</h2>
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
                                    {withdrawalsData.withdrawals.slice(0, 10).map((withdrawal, index) => (
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
                                                    {withdrawal.status || 'pending'}
                                                </span>
                                            </td>
                                            <td>
                                                {withdrawal.createdAt
                                                    ? new Date(withdrawal.createdAt).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                        </motion.tr>
                                    ))}
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
