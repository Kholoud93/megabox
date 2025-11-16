import React, { useState } from 'react';
import './PromoterDashboard.scss';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTimes, FaHistory, FaMoneyBillWave, FaWallet
} from 'react-icons/fa';
import { MdPendingActions } from "react-icons/md";
import { MdOutlineAssuredWorkload } from "react-icons/md";
import { GiTakeMyMoney } from "react-icons/gi";
import { API_URL, withdrawalService, userService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';

const EARNINGS_URL = `${API_URL}/auth/getUserEarnings`;

// Mock data for UI display
const MOCK_EARNINGS_DATA = {
    totalEarnings: '1,250.50',
    pendingRewards: '350.25',
    confirmedRewards: '900.25',
    withdrawable: '900.25',
    currency: 'USD'
};

const MOCK_WITHDRAWAL_HISTORY = {
    withdrawals: [
        {
            amount: '500.00',
            currency: 'USD',
            paymentMethod: 'Vodafone Cash',
            status: 'approved',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            amount: '250.50',
            currency: 'USD',
            paymentMethod: 'Orange Money',
            status: 'pending',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            amount: '150.75',
            currency: 'USD',
            paymentMethod: 'Bank Transfer',
            status: 'approved',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]
};

const USE_MOCK_DATA = true; // Set to false to use real API data

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
        async () => {
            if (USE_MOCK_DATA) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return MOCK_EARNINGS_DATA;
            }
            const res = await fetch(EARNINGS_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch promoter earnings: ${res.status}`);
            }
            return res.json();
        },
        {
            enabled: USE_MOCK_DATA || !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching promoter earnings:', error);
                if (!USE_MOCK_DATA) {
                    toast.error(error.message || t('promoterDashboard.fetchError') || 'Failed to fetch earnings', ToastOptions("error"));
                }
            }
        }
    );

    const isLoading = earningsLoading;

    const totalEarnings = earningsData?.totalEarnings || MOCK_EARNINGS_DATA.totalEarnings;
    const pendingEarnings = earningsData?.pendingRewards || MOCK_EARNINGS_DATA.pendingRewards;
    const confirmedEarnings = earningsData?.confirmedRewards || MOCK_EARNINGS_DATA.confirmedRewards;
    const withdrawable = earningsData?.withdrawable || earningsData?.totalEarnings || MOCK_EARNINGS_DATA.withdrawable;
    const currency = earningsData?.currency || MOCK_EARNINGS_DATA.currency;

    // Fetch user data to check if user has a plan
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(token),
        { enabled: !!token, retry: false }
    );

    // Check if user has a plan (Downloadsplan or watchingplan)
    const hasPlan = userData?.Downloadsplan === "true" || userData?.Downloadsplan === true ||
        userData?.watchingplan === "true" || userData?.watchingplan === true;

    // Fetch withdrawal history
    const { data: withdrawalHistory, isLoading: withdrawalHistoryLoading } = useQuery(
        ['withdrawalHistory'],
        async () => {
            if (USE_MOCK_DATA) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return MOCK_WITHDRAWAL_HISTORY;
            }
            return withdrawalService.getWithdrawalHistory(token);
        },
        { enabled: USE_MOCK_DATA || !!token }
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
            className="promoter-dashboard earning-container min-h-screen bg-indigo-50"
            style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            {/* Header */}
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    delay: 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
            >
                <h1>{t('promoterDashboard.title')}</h1>
                <p>{t('promoterDashboard.subtitle')}</p>
            </motion.div>

            <div className="earning-container__wrapper">
                {/* Stats Dashboard */}
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <motion.div
                        className="earning-stats"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <StatCard
                            label={t('promoterDashboard.pendingEarnings')}
                            value={`${pendingEarnings} ${currency}`}
                            icon={<MdPendingActions />}
                            color="#f59e0b"
                            index={0}
                        />
                        <StatCard
                            label={t('promoterDashboard.confirmedEarnings')}
                            value={`${confirmedEarnings} ${currency}`}
                            icon={<MdOutlineAssuredWorkload />}
                            color="#10b981"
                            index={1}
                        />
                        <StatCard
                            label={t('promoterDashboard.totalEarnings')}
                            value={`${totalEarnings} ${currency}`}
                            icon={<GiTakeMyMoney />}
                            color="#6366f1"
                            index={2}
                        />

                        {/* Withdrawal Button - Only show if user has a plan */}
                        {hasPlan && (
                            <motion.div
                                className="earning-stat-card"
                                variants={statsVariants}
                                initial="hidden"
                                animate="visible"
                                style={{
                                    background: 'linear-gradient(135deg, #10b98110, #10b98105)',
                                    borderLeft: '4px solid #10b981',
                                    cursor: 'pointer'
                                }}
                                whileHover={{ scale: 1.03, y: -8 }}
                                onClick={() => setShowWithdrawalModal(true)}
                            >
                                <motion.div className="icon" style={{ color: '#10b981' }}>
                                    <FaWallet />
                                </motion.div>
                                <div className="info">
                                    <div className="label">{t('promoterDashboard.requestWithdrawal')}</div>
                                    <div className="value">{t('promoterDashboard.withdraw')}</div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Withdrawal History Section */}
                <motion.div
                    className="withdrawal-section"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title flex items-center gap-2">
                            <FaHistory /> {t('promoterDashboard.withdrawalHistory')}
                        </h2>
                    </div>
                    {withdrawalHistoryLoading ? (
                        <div className="text-center py-8">{t('promoterDashboard.loadingHistory')}</div>
                    ) : (withdrawalHistory?.withdrawals || MOCK_WITHDRAWAL_HISTORY.withdrawals)?.length > 0 ? (
                        <div className="space-y-3">
                            {(withdrawalHistory?.withdrawals || MOCK_WITHDRAWAL_HISTORY.withdrawals).map((withdrawal, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-indigo-900">{withdrawal.amount} {withdrawal.currency || currency}</p>
                                            <p className="text-sm text-gray-600">{withdrawal.paymentMethod}</p>
                                            <p className="text-xs text-gray-500">{new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {withdrawal.status || 'pending'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">{t('promoterDashboard.noWithdrawalHistory')}</div>
                    )}
                </motion.div>
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
