import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { withdrawalService } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import { FaMoneyBillWave, FaCheck, FaTimes } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import './Withdrawals.scss';

export default function Withdrawals() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const queryClient = useQueryClient();
    const [processingWithdrawals, setProcessingWithdrawals] = useState(new Set());

    // Fetch all withdrawals
    const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery(
        ['allWithdrawals'],
        () => withdrawalService.getAllWithdrawals(token),
        { enabled: !!token }
    );

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

    const currency = withdrawalsData?.withdrawals?.[0]?.currency || 'USD';

    return (
        <div className="admin-withdrawals-page">
            <div className="admin-withdrawals-page__wrapper">
                <div className="admin-withdrawals-header">
                    <div className="admin-withdrawals-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-withdrawals-header__back"
                            title={t('adminWithdrawals.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaMoneyBillWave className="admin-withdrawals-header__icon" />
                        <div>
                            <h1 className="admin-withdrawals-header__title">{t('adminWithdrawals.title')}</h1>
                            <p className="admin-withdrawals-header__subtitle">{t('adminWithdrawals.subtitle')}</p>
                        </div>
                    </div>
                </div>

                {withdrawalsLoading ? (
                    <div className="admin-withdrawals-loading">
                        <p>{t('adminWithdrawals.loading')}</p>
                    </div>
                ) : withdrawalsData?.withdrawals?.length > 0 ? (
                    <>
                        <SearchFilter
                            searchPlaceholder={t('adminAnalytics.searchWithdrawals')}
                            filters={filterConfig}
                            onSearchChange={setSearchTerm}
                            onFilterChange={setFilters}
                        />

                        <div className="admin-withdrawals-table">
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
                                        filteredWithdrawals.map((withdrawal, index) => (
                                            <motion.tr
                                                key={withdrawal._id || withdrawal.id || index}
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
                    </>
                ) : (
                    <div className="admin-withdrawals-empty">
                        <p>{t('adminWithdrawals.noWithdrawals')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

