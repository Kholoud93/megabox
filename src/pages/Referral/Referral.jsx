import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/EmptyState/EmptyState';
import { FaUsers, FaLink, FaCopy, FaCheck, FaDollarSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import './Referral.scss';

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

    // Default values (no API call)
    const referralLink = userData?.referralLink || `https://mega-box.vercel.app/register?ref=${userData?._id || ''}`;
    const todayRefers = 0;
    const totalRefers = 0;
    const todayReferralRevenue = 0;
    const totalReferralRevenue = 0;
    const referUsers = [];
    const currency = 'USD';

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
                            <h2 className="referral-banner__title">
                                <span className="referral-banner__title-text">{t('referral.bannerTitle') || '10% of referral income'}</span>
                                <span className="referral-banner__icon">💰</span>
                            </h2>
                            <div className="referral-banner__actions">
                                <button
                                    className="referral-banner__button"
                                    onClick={() => handleCopyLink()}
                                >
                                    {t('referral.getReferralLink') || 'Get Referral Link'}
                                </button>
                                <button
                                    className="referral-banner__rules"
                                    onClick={() => setShowRulesModal(true)}
                                >
                                    {t('referral.referralRules') || 'Referral rules'}
                                </button>
                            </div>
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

                {/* Refer Users Table */}
                <motion.div
                    className="refer-users-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="refer-users-section__title">{t('referral.referUsers')}</h3>
                    <div className="refer-users-table">
                        <table className="refer-users-table__table">
                            <thead>
                                <tr>
                                    <th>{t('referral.user')}</th>
                                    <th>{t('referral.todayReferral')} / {currency}</th>
                                    <th>{t('referral.totalRef')} /</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-8 text-gray-500">
                                            <EmptyState
                                                icon={FaUsers}
                                                title={t('referral.noReferUsers')}
                                                message={t('referral.noReferUsersMessage')}
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    referUsers.map((user, index) => (
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

