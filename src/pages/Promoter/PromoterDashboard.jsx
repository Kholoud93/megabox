import React, { useState } from 'react';
import './PromoterDashboard.scss';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTimes, FaHistory, FaMoneyBillWave, FaWallet, FaShare, FaChartLine, FaDollarSign, FaDownload
} from 'react-icons/fa';
import { MdPendingActions } from "react-icons/md";
import { MdOutlineAssuredWorkload } from "react-icons/md";
import { GiTakeMyMoney } from "react-icons/gi";
import { withdrawalService, userService, promoterService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import EmptyState from '../../components/EmptyState/EmptyState';
import { useNavigate } from 'react-router-dom';

const USE_MOCK_DATA = false; // Use real API data

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const statsVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.9 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 25,
            mass: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 60,
        rotateX: -15
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 30,
            mass: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 60,
        rotateX: 15,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

function LoadingSkeleton() {
    return (
        <div className="loading-skeleton">
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="skeleton-card"
                    initial={{ opacity: 0.2, scale: 0.95 }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [0.95, 1, 0.95]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                />
            ))}
        </div>
    );
}

function StatCard({ label, value, icon, color, index, onClick }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="earning-stat-card"
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
                scale: 1.03,
                y: -8,
                boxShadow: `0 15px 35px ${color}25`,
                transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }
            }}
            whileTap={{
                scale: 0.98,
                transition: { duration: 0.1 }
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={onClick}
            style={{
                background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                borderLeft: `4px solid ${color}`,
                cursor: onClick ? 'pointer' : 'default'
            }}
        >
            <motion.div
                className="icon"
                style={{ color }}
                animate={{
                    rotate: isHovered ? 360 : 0,
                    scale: isHovered ? 1.15 : 1
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    type: "spring",
                    stiffness: 200
                }}
            >
                {icon}
            </motion.div>
            <div className="info">
                <motion.div
                    className="label"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: index * 0.1 + 0.4,
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    {label}
                </motion.div>
                <motion.div
                    className="value"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 20,
                        delay: index * 0.1 + 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    {value}
                </motion.div>
            </div>
        </motion.div>
    );
}

export default function PromoterDashboard() {
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const navigate = useNavigate();
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [withdrawalForm, setWithdrawalForm] = useState({
        amount: '',
        paymentMethod: 'Vodafone Cash',
        whatsappNumber: '',
        details: {
            accountName: '',
            username: '',
            'رقم فودافون': ''
        }
    });
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    // Fetch promoter earnings (financial data: pending, confirmed, total earnings)
    const { data: earningsData, isLoading: earningsLoading, error: earningsError } = useQuery(
        ['promoterEarnings'],
        () => promoterService.getUserEarnings(token),
        {
            enabled: !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching promoter earnings:', error);
                toast.error(error.message || t('promoterDashboard.fetchError') || 'Failed to fetch earnings', ToastOptions("error"));
            }
        }
    );

    const isLoading = earningsLoading;

    // Fetch user data to check if user has a plan
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(token),
        { enabled: !!token, retry: false }
    );

    // Check if user has a plan (Downloadsplan or watchingplan)
    const hasPlan = userData?.Downloadsplan === "true" || userData?.Downloadsplan === true ||
        userData?.watchingplan === "true" || userData?.watchingplan === true;

    // Fetch share link analytics (contains revenue and link data)
    const { data: shareLinkAnalyticsData, isLoading: shareLinkAnalyticsLoading, error: shareLinkAnalyticsError } = useQuery(
        ['shareLinkAnalytics'],
        () => promoterService.getShareLinkAnalytics(token),
        {
            enabled: !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching share link analytics:', error);
                toast.error(error.message || t('revenueData.fetchError'), ToastOptions("error"));
            }
        }
    );

    // Extract revenue data from share link analytics
    const revenueList = shareLinkAnalyticsData?.analytics || shareLinkAnalyticsData?.data || shareLinkAnalyticsData?.links || shareLinkAnalyticsData?.revenue || [];
    const currency = earningsData?.currency || 'USD';
    const estimatedRevenue = shareLinkAnalyticsData?.estimatedRevenue || [];
    const settledRevenue = shareLinkAnalyticsData?.settledRevenue || [];

    // Extract earnings data
    const totalEarnings = earningsData?.totalEarnings || '0';
    const pendingEarnings = earningsData?.pendingRewards || '0';
    const confirmedEarnings = earningsData?.confirmedRewards || '0';
    const withdrawable = earningsData?.withdrawable || earningsData?.totalEarnings || '0';

    // Fetch withdrawal history
    const { data: withdrawalHistory, isLoading: withdrawalHistoryLoading } = useQuery(
        ['withdrawalHistory'],
        async () => {
            return withdrawalService.getWithdrawalHistory(token);
        },
        { enabled: !!token }
    );

    // Request withdrawal mutation
    const requestWithdrawalMutation = useMutation(
        (formData) => withdrawalService.requestWithdrawal(
            formData.amount,
            formData.paymentMethod,
            formData.whatsappNumber,
            formData.details,
            token
        ),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('withdrawalHistory');
                queryClient.invalidateQueries('promoterEarnings');
                setShowWithdrawalModal(false);
                setWithdrawalForm({
                    amount: '',
                    paymentMethod: 'Vodafone Cash',
                    whatsappNumber: '',
                    details: {
                        accountName: '',
                        username: '',
                        'رقم فودافون': ''
                    }
                });
                toast.success(t('promoterDashboard.withdrawalRequested'), ToastOptions("success"));
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || t('promoterDashboard.withdrawalError'), ToastOptions("error"));
            }
        }
    );

    const handleWithdrawalSubmit = (e) => {
        e.preventDefault();
        if (!withdrawalForm.amount || parseFloat(withdrawalForm.amount) <= 0) {
            toast.error(t('promoterDashboard.invalidAmount'), ToastOptions("error"));
            return;
        }
        if (parseFloat(withdrawalForm.amount) > parseFloat(withdrawable)) {
            toast.error(t('promoterDashboard.amountExceeds'), ToastOptions("error"));
            return;
        }
        requestWithdrawalMutation.mutate(withdrawalForm);
    };

    return (
        <motion.div
            className="promoter-dashboard revenue-dashboard"
            style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <div className="revenue-dashboard__wrapper">
                {/* Header */}
                <motion.div
                    className="revenue-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="revenue-header__content">
                        <FaChartLine className="revenue-header__icon" />
                        <div>
                            <h1 className="revenue-header__title">{t('promoterDashboard.title') || 'Revenue'}</h1>
                            <p className="revenue-header__subtitle">{t('promoterDashboard.subtitle') || 'Track your earnings and revenue'}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="revenue-summary">
                    <motion.div
                        className="revenue-summary__card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <FaDollarSign className="revenue-summary__icon" />
                        <div className="revenue-summary__content">
                            <div className="revenue-summary__label">{t('revenueData.estimatedIncome') || 'Estimated income / USD'}</div>
                            <div className="revenue-summary__value">{totalEarnings} {currency}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="revenue-summary__card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <FaDollarSign className="revenue-summary__icon" />
                        <div className="revenue-summary__content">
                            <div className="revenue-summary__label">{t('revenueData.actualIncome') || 'Actual income / USD'}</div>
                            <div className="revenue-summary__value">{confirmedEarnings} {currency}</div>
                        </div>
                    </motion.div>
                </div>

                {/* Congratulations Banner - Only show if there's actual data */}
                {revenueList && revenueList.length > 0 && (
                    <motion.div
                        className="revenue-banner"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <FaDollarSign className="revenue-banner__icon" />
                        <span className="revenue-banner__text">
                            {t('revenueData.congratulations') || 'Congratulations to user x***C for withdrawing 298.43 USD!'}
                        </span>
                    </motion.div>
                )}

                {/* Revenue Table */}
                {shareLinkAnalyticsLoading ? (
                    <div className="revenue-table">
                        <div className="revenue-table__skeleton">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="skeleton-row">
                                    <div className="skeleton-cell"></div>
                                    <div className="skeleton-cell"></div>
                                    <div className="skeleton-cell"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : shareLinkAnalyticsError ? (
                    <EmptyState
                        icon={FaChartLine}
                        title={t('revenueData.errorTitle') || 'Error loading revenue data'}
                        message={shareLinkAnalyticsError.message || t('revenueData.errorMessage') || 'Failed to load revenue data'}
                    />
                ) : (
                    <motion.div
                        className="revenue-table"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="revenue-table__container">
                            <table className="revenue-table__table">
                                <thead>
                                    <tr>
                                        <th>{t('revenueData.date') || 'Date (UTC)'}</th>
                                        <th>{t('revenueData.total') || 'Total / USD'}</th>
                                        <th>{t('revenueData.installRevenue') || 'Install revenue'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueList && revenueList.length > 0 ? (
                                        revenueList.map((item, index) => (
                                            <motion.tr
                                                key={index}
                                                className="revenue-table__row"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <td>
                                                    {item.date || item.dateUTC
                                                        ? new Date(item.date || item.dateUTC).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td>{parseFloat(item.total || 0).toFixed(4)} {currency}</td>
                                                <td>{parseFloat(item.installRevenue || 0).toFixed(4)} {currency}</td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                                {t('revenueData.noDataMessage') || 'No data available'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Withdrawal Modal */}
            <AnimatePresence>
                {showWithdrawalModal && (
                    <motion.div
                        className="withdrawal-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowWithdrawalModal(false)}
                    >
                        <motion.div
                            className="withdrawal-modal"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="withdrawal-modal__header">
                                <div className="withdrawal-modal__title-wrapper">
                                    <FaWallet className="withdrawal-modal__icon" />
                                    <h3 className="withdrawal-modal__title">{t('promoterDashboard.requestWithdrawal')}</h3>
                                </div>
                                <motion.button
                                    onClick={() => setShowWithdrawalModal(false)}
                                    className="withdrawal-modal__close"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <FaTimes />
                                </motion.button>
                            </div>
                            <form onSubmit={handleWithdrawalSubmit} className="withdrawal-modal__form">
                                <div className="withdrawal-modal__field">
                                    <label className="withdrawal-modal__label">{t('promoterDashboard.amount')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={withdrawable}
                                        value={withdrawalForm.amount}
                                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                                        className="withdrawal-modal__input"
                                        placeholder={t('promoterDashboard.enterAmount')}
                                        required
                                    />
                                    <p className="withdrawal-modal__hint">
                                        {t('promoterDashboard.available')}: <span className="withdrawal-modal__available">{withdrawable} {currency}</span>
                                    </p>
                                </div>
                                <div className="withdrawal-modal__field">
                                    <label className="withdrawal-modal__label">{t('promoterDashboard.paymentMethod')}</label>
                                    <select
                                        value={withdrawalForm.paymentMethod}
                                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, paymentMethod: e.target.value })}
                                        className="withdrawal-modal__input"
                                        required
                                    >
                                        <option value="Vodafone Cash">Vodafone Cash</option>
                                        <option value="Orange Money">Orange Money</option>
                                        <option value="Etisalat Cash">Etisalat Cash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div className="withdrawal-modal__field">
                                    <label className="withdrawal-modal__label">{t('promoterDashboard.whatsappTelegram')}</label>
                                    <input
                                        type="tel"
                                        value={withdrawalForm.whatsappNumber}
                                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, whatsappNumber: e.target.value })}
                                        className="withdrawal-modal__input"
                                        placeholder="01012345678"
                                        required
                                    />
                                </div>
                                <div className="withdrawal-modal__field">
                                    <label className="withdrawal-modal__label">{t('promoterDashboard.accountName')}</label>
                                    <input
                                        type="text"
                                        value={withdrawalForm.details.accountName}
                                        onChange={(e) => setWithdrawalForm({
                                            ...withdrawalForm,
                                            details: { ...withdrawalForm.details, accountName: e.target.value }
                                        })}
                                        className="withdrawal-modal__input"
                                        placeholder={t('promoterDashboard.enterAccountName')}
                                        required
                                    />
                                </div>
                                <div className="withdrawal-modal__field">
                                    <label className="withdrawal-modal__label">{t('promoterDashboard.usernamePhone')}</label>
                                    <input
                                        type="text"
                                        value={withdrawalForm.details.username}
                                        onChange={(e) => setWithdrawalForm({
                                            ...withdrawalForm,
                                            details: { ...withdrawalForm.details, username: e.target.value, 'رقم فودافون': e.target.value }
                                        })}
                                        className="withdrawal-modal__input"
                                        placeholder={t('promoterDashboard.enterUsernamePhone')}
                                        required
                                    />
                                </div>
                                <div className="withdrawal-modal__actions">
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowWithdrawalModal(false)}
                                        className="withdrawal-modal__cancel"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {t('promoterDashboard.cancel')}
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={requestWithdrawalMutation.isLoading}
                                        className="withdrawal-modal__submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {requestWithdrawalMutation.isLoading ? t('promoterDashboard.submitting') : t('promoterDashboard.submitRequest')}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
