import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import Pagination from '../../../components/Pagination/Pagination';
import { FaMoneyBillWave, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { format } from 'date-fns';
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
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch all withdrawals
    const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery(
        ['allWithdrawals'],
        () => adminService.getAllWithdrawals(token),
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
                const paymentMethodStr = typeof withdrawal.paymentMethod === 'object' && withdrawal.paymentMethod !== null
                    ? (withdrawal.paymentMethod.name || withdrawal.paymentMethod.type || withdrawal.paymentMethod.walletId || '').toLowerCase()
                    : (withdrawal.paymentMethod || '').toLowerCase();
                if (!userInfo.toLowerCase().includes(searchLower) &&
                    !withdrawal.amount?.toString().toLowerCase().includes(searchLower) &&
                    !paymentMethodStr.includes(searchLower)) {
                    return false;
                }
            }

            // Status filter
            if (filters.status && withdrawal.status !== filters.status) {
                return false;
            }

            // Payment method filter
            if (filters.paymentMethod) {
                const withdrawalPaymentMethod = typeof withdrawal.paymentMethod === 'object' && withdrawal.paymentMethod !== null
                    ? (withdrawal.paymentMethod.name || withdrawal.paymentMethod.type || withdrawal.paymentMethod.walletId || '')
                    : (withdrawal.paymentMethod || '');
                if (withdrawalPaymentMethod !== filters.paymentMethod) {
                    return false;
                }
            }

            return true;
        });
    }, [withdrawalsData?.withdrawals, searchTerm, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedWithdrawals = filteredWithdrawals.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Get unique payment methods for filter
    const paymentMethods = useMemo(() => {
        if (!withdrawalsData?.withdrawals) return [];
        const methods = new Set();
        withdrawalsData.withdrawals.forEach(w => {
            if (w.paymentMethod) {
                const methodValue = typeof w.paymentMethod === 'object' && w.paymentMethod !== null
                    ? (w.paymentMethod.name || w.paymentMethod.type || w.paymentMethod.walletId || '')
                    : (w.paymentMethod || '');
                if (methodValue) methods.add(methodValue);
            }
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

    // Handle approve withdrawal
    const handleApprove = async (withdrawalId) => {
        setProcessingWithdrawals(prev => new Set(prev).add(withdrawalId));
        try {
            await adminService.updateWithdrawalStatus(withdrawalId, 'approved', token);
            toast.success(t('adminWithdrawals.approvedSuccess') || 'Withdrawal approved successfully', ToastOptions("success"));
            queryClient.invalidateQueries(['allWithdrawals']);
            // Optimistic update
            queryClient.setQueryData(['allWithdrawals'], (oldData) => {
                if (!oldData?.withdrawals) return oldData;
                return {
                    ...oldData,
                    withdrawals: oldData.withdrawals.map(w => 
                        (w._id === withdrawalId || w.id === withdrawalId) 
                            ? { ...w, status: 'approved' }
                            : w
                    )
                };
            });
        } catch (error) {
            toast.error(error.response?.data?.message || t('adminWithdrawals.approveFailed') || 'Failed to approve withdrawal', ToastOptions("error"));
        } finally {
            setProcessingWithdrawals(prev => {
                const newSet = new Set(prev);
                newSet.delete(withdrawalId);
                return newSet;
            });
        }
    };

    // Handle reject withdrawal
    const handleReject = async (withdrawalId) => {
        setProcessingWithdrawals(prev => new Set(prev).add(withdrawalId));
        try {
            await adminService.updateWithdrawalStatus(withdrawalId, 'rejected', token);
            toast.success(t('adminWithdrawals.rejectedSuccess') || 'Withdrawal rejected successfully', ToastOptions("success"));
            queryClient.invalidateQueries(['allWithdrawals']);
            // Optimistic update
            queryClient.setQueryData(['allWithdrawals'], (oldData) => {
                if (!oldData?.withdrawals) return oldData;
                return {
                    ...oldData,
                    withdrawals: oldData.withdrawals.map(w => 
                        (w._id === withdrawalId || w.id === withdrawalId) 
                            ? { ...w, status: 'rejected' }
                            : w
                    )
                };
            });
        } catch (error) {
            toast.error(error.response?.data?.message || t('adminWithdrawals.rejectFailed') || 'Failed to reject withdrawal', ToastOptions("error"));
        } finally {
            setProcessingWithdrawals(prev => {
                const newSet = new Set(prev);
                newSet.delete(withdrawalId);
                return newSet;
            });
        }
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

                        <div className="admin-withdrawals-table-wrapper">
                            <table className="admin-users-table">
                                <thead className="admin-users-table__header">
                                    <tr>
                                        <th scope="col">{t('adminWithdrawals.user')}</th>
                                        <th scope="col">{t('adminWithdrawals.amount')}</th>
                                        <th scope="col">{t('adminWithdrawals.paymentMethod')}</th>
                                        <th scope="col">{t('adminWithdrawals.status')}</th>
                                        <th scope="col">{t('adminWithdrawals.date')}</th>
                                        <th scope="col">{t('adminWithdrawals.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedWithdrawals.length > 0 ? (
                                        paginatedWithdrawals.map((withdrawal, index) => (
                                            <tr key={withdrawal._id || withdrawal.id || index}>
                                                <td data-label={t('adminWithdrawals.user')}>
                                                    {typeof withdrawal.userId === 'object' && withdrawal.userId !== null
                                                        ? (withdrawal.userId.username || withdrawal.userId.email || withdrawal.userId._id || '-')
                                                        : (withdrawal.userId || withdrawal.username || '-')
                                                    }
                                                </td>
                                                <td data-label={t('adminWithdrawals.amount')}>
                                                    {withdrawal.amount} {withdrawal.currency || currency}
                                                </td>
                                                <td data-label={t('adminWithdrawals.paymentMethod')}>
                                                    {typeof withdrawal.paymentMethod === 'object' && withdrawal.paymentMethod !== null
                                                        ? (withdrawal.paymentMethod.name || withdrawal.paymentMethod.type || withdrawal.paymentMethod.walletId || JSON.stringify(withdrawal.paymentMethod))
                                                        : (withdrawal.paymentMethod || '-')
                                                    }
                                                </td>
                                                <td data-label={t('adminWithdrawals.status')}>
                                                    <span className={`status-badge status-${withdrawal.status || 'pending'}`}>
                                                        {withdrawal.status === 'approved'
                                                            ? t('adminWithdrawals.approved')
                                                            : withdrawal.status === 'pending'
                                                                ? t('adminWithdrawals.pending')
                                                                : withdrawal.status === 'rejected'
                                                                    ? t('adminWithdrawals.rejected')
                                                                    : withdrawal.status || t('adminWithdrawals.pending')}
                                                    </span>
                                                </td>
                                                <td data-label={t('adminWithdrawals.date')}>
                                                    {withdrawal.createdAt
                                                        ? new Date(withdrawal.createdAt).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td data-label={t('adminWithdrawals.actions')}>
                                                    <div className="action-buttons">
                                                        <motion.button
                                                            className="admin-withdrawals-actions__btn admin-withdrawals-actions__btn--view"
                                                            onClick={() => setSelectedWithdrawal(withdrawal)}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title={t('adminWithdrawals.viewDetails')}
                                                        >
                                                            <FaEye size={18} />
                                                        </motion.button>
                                                        {withdrawal.status === 'pending' ? (
                                                            <>
                                                                <motion.button
                                                                    className="admin-withdrawals-actions__btn admin-withdrawals-actions__btn--approve"
                                                                    onClick={() => handleApprove(withdrawal._id || withdrawal.id)}
                                                                    disabled={processingWithdrawals.has(withdrawal._id || withdrawal.id)}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    title={t('adminWithdrawals.approve')}
                                                                >
                                                                    <FaCheck size={18} />
                                                                </motion.button>
                                                                <motion.button
                                                                    className="admin-withdrawals-actions__btn admin-withdrawals-actions__btn--reject"
                                                                    onClick={() => handleReject(withdrawal._id || withdrawal.id)}
                                                                    disabled={processingWithdrawals.has(withdrawal._id || withdrawal.id)}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    title={t('adminWithdrawals.reject')}
                                                                >
                                                                    <FaTimes size={18} />
                                                                </motion.button>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                                {t('adminWithdrawals.noWithdrawalsFound')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            showCount={true}
                            startIndex={startIndex}
                            endIndex={Math.min(endIndex, filteredWithdrawals.length)}
                            totalItems={filteredWithdrawals.length}
                            itemsLabel={t('adminWithdrawals.withdrawals')}
                        />
                    </>
                ) : (
                    <div className="admin-withdrawals-empty">
                        <p>{t('adminWithdrawals.noWithdrawals')}</p>
                    </div>
                )}
            </div>

            {/* Withdrawal Details Modal */}
            {selectedWithdrawal && (
                <div
                    className="admin-withdrawal-modal-backdrop"
                    onClick={() => setSelectedWithdrawal(null)}
                >
                    <div
                        className="admin-withdrawal-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                            <div className="admin-withdrawal-modal__header">
                                <h2>{t('adminWithdrawals.withdrawalDetails')}</h2>
                                <button
                                    onClick={() => setSelectedWithdrawal(null)}
                                    className="admin-withdrawal-modal__close"
                                    aria-label="Close"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="admin-withdrawal-modal__body">
                                <div className="admin-withdrawal-modal__row">
                                    <strong>{t('adminWithdrawals.user')}:</strong>
                                    <span>
                                        {typeof selectedWithdrawal.userId === 'object' && selectedWithdrawal.userId !== null
                                            ? (selectedWithdrawal.userId.username || selectedWithdrawal.userId.email || selectedWithdrawal.userId._id || '-')
                                            : (selectedWithdrawal.userId || selectedWithdrawal.username || '-')
                                        }
                                    </span>
                                </div>

                                <div className="admin-withdrawal-modal__row">
                                    <strong>{t('adminWithdrawals.amount')}:</strong>
                                    <span>
                                        {typeof selectedWithdrawal.amount === 'object' && selectedWithdrawal.amount !== null
                                            ? JSON.stringify(selectedWithdrawal.amount)
                                            : String(selectedWithdrawal.amount || '-')
                                        } {typeof selectedWithdrawal.currency === 'object' && selectedWithdrawal.currency !== null
                                            ? JSON.stringify(selectedWithdrawal.currency)
                                            : (selectedWithdrawal.currency || currency)
                                        }
                                    </span>
                                </div>

                                <div className="admin-withdrawal-modal__row">
                                    <strong>{t('adminWithdrawals.paymentMethod')}:</strong>
                                    <span>
                                        {typeof selectedWithdrawal.paymentMethod === 'object' && selectedWithdrawal.paymentMethod !== null
                                            ? (selectedWithdrawal.paymentMethod.name || selectedWithdrawal.paymentMethod.type || selectedWithdrawal.paymentMethod.walletId || JSON.stringify(selectedWithdrawal.paymentMethod))
                                            : (selectedWithdrawal.paymentMethod || '-')
                                        }
                                    </span>
                                </div>

                                <div className="admin-withdrawal-modal__row">
                                    <strong>{t('adminWithdrawals.status')}:</strong>
                                    <span className={`status-badge status-${selectedWithdrawal.status || 'pending'}`}>
                                        {selectedWithdrawal.status === 'approved'
                                            ? t('adminWithdrawals.approved')
                                            : selectedWithdrawal.status === 'pending'
                                                ? t('adminWithdrawals.pending')
                                                : selectedWithdrawal.status === 'rejected'
                                                    ? t('adminWithdrawals.rejected')
                                                    : selectedWithdrawal.status || t('adminWithdrawals.pending')}
                                    </span>
                                </div>

                                <div className="admin-withdrawal-modal__row">
                                    <strong>{t('adminWithdrawals.date')}:</strong>
                                    <span>
                                        {selectedWithdrawal.createdAt
                                            ? (typeof selectedWithdrawal.createdAt === 'string' || selectedWithdrawal.createdAt instanceof Date
                                                ? format(new Date(selectedWithdrawal.createdAt), 'PPPpp')
                                                : String(selectedWithdrawal.createdAt))
                                            : '-'}
                                    </span>
                                </div>

                                {selectedWithdrawal.whatsappNumber && (
                                    <div className="admin-withdrawal-modal__row">
                                        <strong>{t('adminWithdrawals.whatsappNumber')}:</strong>
                                        <span>
                                            {typeof selectedWithdrawal.whatsappNumber === 'object' && selectedWithdrawal.whatsappNumber !== null
                                                ? JSON.stringify(selectedWithdrawal.whatsappNumber)
                                                : String(selectedWithdrawal.whatsappNumber || '-')
                                            }
                                        </span>
                                    </div>
                                )}

                                {selectedWithdrawal.details && (
                                    <div className="admin-withdrawal-modal__row admin-withdrawal-modal__row--full">
                                        <strong>{t('adminWithdrawals.details')}:</strong>
                                        <p>
                                            {typeof selectedWithdrawal.details === 'object' && selectedWithdrawal.details !== null
                                                ? JSON.stringify(selectedWithdrawal.details)
                                                : String(selectedWithdrawal.details || '-')
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedWithdrawal.status === 'pending' && (
                                <div className="admin-withdrawal-modal__actions">
                                    <motion.button
                                        className="admin-withdrawal-modal__btn admin-withdrawal-modal__btn--approve"
                                        onClick={() => {
                                            handleApprove(selectedWithdrawal._id || selectedWithdrawal.id);
                                            setSelectedWithdrawal(null);
                                        }}
                                        disabled={processingWithdrawals.has(selectedWithdrawal._id || selectedWithdrawal.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaCheck /> {t('adminWithdrawals.approve')}
                                    </motion.button>
                                    <motion.button
                                        className="admin-withdrawal-modal__btn admin-withdrawal-modal__btn--reject"
                                        onClick={() => {
                                            handleReject(selectedWithdrawal._id || selectedWithdrawal.id);
                                            setSelectedWithdrawal(null);
                                        }}
                                        disabled={processingWithdrawals.has(selectedWithdrawal._id || selectedWithdrawal.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaTimes /> {t('adminWithdrawals.reject')}
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

