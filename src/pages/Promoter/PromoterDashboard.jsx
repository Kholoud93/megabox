import React, { useState } from 'react';
import './PromoterDashboard.scss';
import { useQuery } from 'react-query';
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

    // Fetch promoter earnings
    const { data: earningsData, isLoading: earningsLoading } = useQuery(
        ['promoterEarnings'],
        async () => {
            const res = await fetch(EARNINGS_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.json();
        },
        { enabled: !!token }
    );

    const isLoading = earningsLoading;

    const totalEarnings = earningsData?.totalEarnings || '0.00';
    const pendingEarnings = earningsData?.pendingRewards || '0.00';
    const confirmedEarnings = earningsData?.confirmedRewards || '0.00';
    const withdrawable = earningsData?.withdrawable || earningsData?.totalEarnings || '0.00';
    const currency = earningsData?.currency || 'USD';

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
        () => withdrawalService.getWithdrawalHistory(token),
        { enabled: !!token }
    );

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
                    ) : withdrawalHistory?.withdrawals?.length > 0 ? (
                        <div className="space-y-3">
                            {withdrawalHistory.withdrawals.map((withdrawal, index) => (
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowWithdrawalModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-indigo-900">{t('promoterDashboard.requestWithdrawal')}</h3>
                                <button
                                    onClick={() => setShowWithdrawalModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                toast.info("Withdrawal functionality will be implemented", ToastOptions("info"));
                                setShowWithdrawalModal(false);
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('promoterDashboard.amount')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={withdrawable}
                                        value={withdrawalForm.amount}
                                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={t('promoterDashboard.enterAmount')}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{t('promoterDashboard.available')}: {withdrawable} {currency}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('promoterDashboard.paymentMethod')}</label>
                                    <input
                                        type="text"
                                        value={withdrawalForm.paymentMethod}
                                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, paymentMethod: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={t('promoterDashboard.enterPaymentMethod')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('promoterDashboard.whatsappTelegram')}</label>
                                    <input
                                        type="text"
                                        maxLength={50}
                                        value={withdrawalForm.whatsappNumber}
                                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, whatsappNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={t('promoterDashboard.enterWhatsappTelegram')}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    {t('promoterDashboard.withdraw')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
