import React, { useState } from 'react';
import './Earning.scss';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi2';
import { API_URL } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const EARNINGS_URL = `${API_URL}/auth/getUserEarnings`;

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 40,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 20,
            mass: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

export default function Earning() {
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const { t } = useLanguage();

    // Fetch earnings data
    const { data: earningsData, isLoading: earningsLoading } = useQuery(
        ['userEarnings'],
        async () => {
            const res = await fetch(EARNINGS_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch earnings: ${res.status}`);
            }
            return res.json();
        },
        {
            enabled: !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching earnings:', error);
            }
        }
    );

    const currency = earningsData?.currency || 'USD';
    const amount = earningsData?.actualIncome || earningsData?.confirmedRewards || '';
    const review = earningsData?.estimatedIncome || earningsData?.pendingRewards || '';
    const withdrawn = earningsData?.withdrawn || '';

    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [whatsappTelegram, setWhatsappTelegram] = useState('');

    return (
        <motion.div
            className="earning-container min-h-screen bg-indigo-50"
            style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <div className="earning-container__wrapper">
                {/* Account Summary Cards */}
                <motion.div
                    className="withdraw-summary-cards"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <motion.div
                        className="withdraw-summary-card withdraw-summary-card--amount"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="withdraw-summary-card__icon withdraw-summary-card__icon--amount">
                            <FaDollarSign />
                        </div>
                        <div className="withdraw-summary-card__content">
                            <div className="withdraw-summary-card__label">{t('withdrawSection.amount') || 'Amount'}</div>
                            <div className="withdraw-summary-card__value">
                                {amount ? `${amount} ${currency}` : '-'}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="withdraw-summary-card withdraw-summary-card--review"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="withdraw-summary-card__icon withdraw-summary-card__icon--review">
                            <FaDollarSign />
                        </div>
                        <div className="withdraw-summary-card__content">
                            <div className="withdraw-summary-card__label">{t('withdrawSection.review') || 'Review'}</div>
                            <div className="withdraw-summary-card__value">
                                {review ? `${review} ${currency}` : '-'}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="withdraw-summary-card withdraw-summary-card--withdrawn"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="withdraw-summary-card__icon withdraw-summary-card__icon--withdrawn">
                            <FaDollarSign />
                        </div>
                        <div className="withdraw-summary-card__content">
                            <div className="withdraw-summary-card__label">{t('withdrawSection.withdrawn') || 'Withdrawn'}</div>
                            <div className="withdraw-summary-card__value">
                                {withdrawn ? `${withdrawn} ${currency}` : '-'}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Apply Section */}
                <motion.div
                    className="withdraw-apply-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="withdraw-apply-section__header">
                        <h2 className="withdraw-apply-section__title">{t('withdrawSection.apply') || 'Apply'}</h2>
                        <a href="#" className="withdraw-apply-section__link">
                            {t('withdrawSection.record') || 'Record'} <HiArrowRight />
                        </a>
                    </div>

                    <div className="withdraw-apply-form">
                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.withdrawalAmount') || 'Withdrawal amount'}
                            </label>
                            <input
                                type="text"
                                className="withdraw-form-input"
                                placeholder={t('withdrawSection.withdrawalAmountPlaceholder') || 'Please enter the requested cash withdrawal amount'}
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                            />
                        </div>

                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.paymentMethod') || 'Payment method'}
                            </label>
                            <div className="withdraw-form-input-wrapper">
                                <select
                                    className="withdraw-form-input withdraw-form-select"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    required
                                >
                                    <option value="">{t('withdrawSection.paymentMethodPlaceholder') || 'Please enter the payment method'}</option>
                                    <option value="USDT">{t('withdrawSection.usdt') || 'USDT'}</option>
                                    <option value="PayPal">{t('withdrawSection.paypal') || 'PayPal'}</option>
                                    <option value="Payoneer">{t('withdrawSection.payoneer') || 'Payoneer'}</option>
                                    <option value="Bank Transfer">{t('withdrawSection.bankTransfer') || 'Bank transfer (personal)'}</option>
                                </select>
                                <HiArrowRight className="withdraw-form-select-arrow" />
                            </div>
                        </div>

                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.whatsappTelegram') || 'WhatsApp/Telegram accounts'}
                            </label>
                            <div className="withdraw-form-input-wrapper">
                                <input
                                    type="text"
                                    className="withdraw-form-input"
                                    placeholder={t('withdrawSection.whatsappTelegramPlaceholder') || 'Please enter the whatsapp/telegram accounts'}
                                    value={whatsappTelegram}
                                    onChange={(e) => setWhatsappTelegram(e.target.value)}
                                    maxLength={50}
                                />
                                <span className="withdraw-form-char-count">{whatsappTelegram.length}/50</span>
                            </div>
                        </div>

                        <button className="withdraw-submit-button">
                            {t('withdrawSection.withdraw') || 'Withdraw'}
                        </button>
                    </div>

                    <div className="withdraw-notice">
                        <div className="withdraw-notice__title">{t('withdrawSection.notice') || 'Notice:'}</div>
                        <div className="withdraw-notice__text">{t('withdrawSection.noticeText') || '1. The amount of cash withdrawal must be ≥ 10 US dollars If not please go ahead and share the link'}</div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
