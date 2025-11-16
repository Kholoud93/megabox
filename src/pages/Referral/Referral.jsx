import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, API_URL } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/EmptyState/EmptyState';
import { FaUsers, FaLink, FaCopy, FaCheck, FaDollarSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import './Referral.scss';

const REFERRAL_DATA_URL = `${API_URL}/auth/getReferralData`;

// Mock data for UI display
const MOCK_REFERRAL_DATA = {
    todayRefers: 12,
    totalRefers: 145,
    todayReferralRevenue: 45.75,
    totalReferralRevenue: 1250.50,
    currency: 'USD',
    referUsers: [
        {
            username: 'john_doe',
            email: 'john@example.com',
            todayReferral: 5.25,
            totalRef: 125.50
        },
        {
            username: 'jane_smith',
            email: 'jane@example.com',
            todayReferral: 8.50,
            totalRef: 210.75
        },
        {
            username: 'mike_wilson',
            email: 'mike@example.com',
            todayReferral: 3.20,
            totalRef: 95.30
        },
        {
            username: 'sarah_jones',
            email: 'sarah@example.com',
            todayReferral: 12.40,
            totalRef: 285.60
        },
        {
            username: 'david_brown',
            email: 'david@example.com',
            todayReferral: 6.80,
            totalRef: 158.90
        },
        {
            username: 'emily_davis',
            email: 'emily@example.com',
            todayReferral: 9.60,
            totalRef: 375.45
        }
    ]
};

const USE_MOCK_DATA = true; // Set to false to use real API data

export default function Referral() {
    const { t } = useLanguage();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [copied, setCopied] = useState(false);
    const [showRulesModal, setShowRulesModal] = useState(false);

    // Fetch user data for referral link
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(token),
        { enabled: !!token, retry: false }
    );

    // Fetch referral data
    const { data: referralData, isLoading, error: referralError } = useQuery(
        ['referralData'],
        async () => {
            if (USE_MOCK_DATA) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return MOCK_REFERRAL_DATA;
            }
            const res = await fetch(REFERRAL_DATA_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch referral data: ${res.status}`);
            }
            return res.json();
        },
        {
            enabled: USE_MOCK_DATA || !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching referral data:', error);
                if (!USE_MOCK_DATA) {
                    toast.error(error.message || t('referral.fetchError'), ToastOptions("error"));
                }
            }
        }
    );

    const referralLink = userData?.referralLink || `https://mega-box.vercel.app/register?ref=${userData?._id || 'mock123'}`;
    const todayRefers = referralData?.todayRefers || MOCK_REFERRAL_DATA.todayRefers;
    const totalRefers = referralData?.totalRefers || MOCK_REFERRAL_DATA.totalRefers;
    const todayReferralRevenue = referralData?.todayReferralRevenue || MOCK_REFERRAL_DATA.todayReferralRevenue;
    const totalReferralRevenue = referralData?.totalReferralRevenue || MOCK_REFERRAL_DATA.totalReferralRevenue;
    const referUsers = referralData?.referUsers || MOCK_REFERRAL_DATA.referUsers;
    const currency = referralData?.currency || MOCK_REFERRAL_DATA.currency;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            toast.success(t('referral.linkCopied'), ToastOptions("success"));
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error(t('referral.copyFailed'), ToastOptions("error"));
        }
    };

    return (
        <div className="referral-page">
            <div className="referral-page__wrapper">
                {/* Promotional Banner */}
                <motion.div
                    className="referral-banner"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="referral-banner__content">
                        <div className="referral-banner__text">
                            <h2 className="referral-banner__title">{t('referral.bannerTitle')}</h2>
                            <button
                                className="referral-banner__button"
                                onClick={() => handleCopyLink()}
                            >
                                {t('referral.getReferralLink')}
                            </button>
                            <button
                                className="referral-banner__rules"
                                onClick={() => setShowRulesModal(true)}
                            >
                                {t('referral.referralRules')}
                            </button>
                        </div>
                        <div className="referral-banner__illustration">
                            💰
                        </div>
                    </div>
                </motion.div>

                {/* Referral Link Modal */}
                <AnimatePresence>
                    {showRulesModal && (
                        <motion.div
                            className="referral-modal-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRulesModal(false)}
                        >
                            <motion.div
                                className="referral-modal"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="referral-modal__title">{t('referral.recommendedRules')}</h3>
                                <div className="referral-modal__content">
                                    <ol className="referral-modal__rules">
                                        <li>{t('referral.rule1')}</li>
                                        <li>{t('referral.rule2')}</li>
                                        <li>{t('referral.rule3')}</li>
                                        <li>{t('referral.rule4')}</li>
                                        <li>{t('referral.rule5')}</li>
                                    </ol>
                                </div>
                                <button
                                    className="referral-modal__close"
                                    onClick={() => setShowRulesModal(false)}
                                >
                                    {t('referral.ok')}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <div className="referral-stats">
                    <motion.div
                        className="referral-stats__card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="referral-stats__title">{t('referral.refers')}</h3>
                        <div className="referral-stats__content">
                            <div className="referral-stats__item">
                                <span className="referral-stats__label">{t('referral.todayRefers')}</span>
                                <span className="referral-stats__value">{todayRefers}</span>
                            </div>
                            <div className="referral-stats__item">
                                <span className="referral-stats__label">{t('referral.totalRefers')}</span>
                                <span className="referral-stats__value">{totalRefers}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="referral-stats__card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="referral-stats__title">{t('referral.referralRevenue')}</h3>
                        <div className="referral-stats__content">
                            <div className="referral-stats__item">
                                <span className="referral-stats__label">{t('referral.todayReferralRevenue')}</span>
                                <span className="referral-stats__value">{todayReferralRevenue.toFixed(4)} {currency}</span>
                            </div>
                            <div className="referral-stats__item">
                                <span className="referral-stats__label">{t('referral.totalReferralRevenue')}</span>
                                <span className="referral-stats__value">{totalReferralRevenue.toFixed(4)} {currency}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Referral Link Card */}
                <motion.div
                    className="referral-link-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="referral-link-card__title">{t('referral.getReferralLink')}</h3>
                    <p className="referral-link-card__description">{t('referral.linkDescription')}</p>
                    <div className="referral-link-card__input-group">
                        <input
                            type="text"
                            readOnly
                            value={referralLink}
                            className="referral-link-card__input"
                        />
                        <button
                            className="referral-link-card__copy"
                            onClick={handleCopyLink}
                        >
                            {copied ? <FaCheck /> : <FaCopy />}
                            {copied ? t('referral.copied') : t('referral.copyLink')}
                        </button>
                    </div>
                </motion.div>

                {/* Refer Users Table */}
                <motion.div
                    className="refer-users-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="refer-users-section__title">{t('referral.referUsers')}</h3>
                    {isLoading ? (
                        <div className="refer-users-section__skeleton">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="skeleton-row">
                                    <div className="skeleton-cell"></div>
                                    <div className="skeleton-cell"></div>
                                    <div className="skeleton-cell"></div>
                                </div>
                            ))}
                        </div>
                    ) : referralError ? (
                        <EmptyState
                            icon={FaUsers}
                            title={t('referral.errorTitle')}
                            message={referralError.message || t('referral.errorMessage')}
                        />
                    ) : referUsers.length === 0 ? (
                        <EmptyState
                            icon={FaUsers}
                            title={t('referral.noReferUsers')}
                            message={t('referral.noReferUsersMessage')}
                        />
                    ) : (
                        <div className="refer-users-table">
                            <table className="refer-users-table__table">
                                <thead>
                                    <tr>
                                        <th>{t('referral.user')}</th>
                                        <th>{t('referral.todayReferral')}</th>
                                        <th>{t('referral.totalRef')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referUsers.map((user, index) => (
                                        <motion.tr
                                            key={index}
                                            className="refer-users-table__row"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td>{user.username || user.email || '-'}</td>
                                            <td>{parseFloat(user.todayReferral || 0).toFixed(4)} {currency}</td>
                                            <td>{parseFloat(user.totalRef || 0).toFixed(4)} {currency}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

