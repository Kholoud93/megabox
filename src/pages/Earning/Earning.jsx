import React, { useState } from 'react';
import './Earning.scss';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign, FaTimes } from 'react-icons/fa';
import { HiArrowRight, HiChevronDown } from 'react-icons/hi2';
import { API_URL } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { withdrawalService } from '../../services/withdrawalService';

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
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

    // Payment methods details
    const paymentMethodsDetails = {
        'USDT': {
            min: 10,
            fees: t('withdrawSection.free') || 'Free',
            time: t('withdrawSection.within24Hours') || 'Within 24 hours'
        },
        'PayPal': {
            min: 10,
            fees: t('withdrawSection.free') || 'Free',
            time: t('withdrawSection.within24Hours') || 'Within 24 hours'
        },
        'Payoneer': {
            min: 10,
            fees: t('withdrawSection.free') || 'Free',
            time: t('withdrawSection.within24Hours') || 'Within 24 hours'
        },
        'Bank Transfer': {
            min: 10,
            fees: t('withdrawSection.free') || 'Free',
            time: t('withdrawSection.threeToFiveDays') || '3-5 days'
        }
    };

    const selectedPaymentDetails = paymentMethod ? paymentMethodsDetails[paymentMethod] : null;

    // Fetch withdrawal history
    const { data: withdrawalHistory, isLoading: withdrawalHistoryLoading } = useQuery(
        ['withdrawalHistory'],
        async () => {
            return withdrawalService.getWithdrawalHistory(token);
        },
        {
            enabled: !!token && showRecordModal,
            retry: false
        }
    );

    // Validation functions
    const validateWithdrawalAmount = (value) => {
        if (!value || value.trim() === '') {
            return t('withdrawSection.amountRequired') || 'Withdrawal amount is required';
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            return t('withdrawSection.amountInvalid') || 'Please enter a valid amount';
        }
        if (numValue < 10) {
            return t('withdrawSection.amountMinimum') || 'Minimum withdrawal amount is 10 USD';
        }
        if (amount && numValue > parseFloat(amount)) {
            return t('withdrawSection.amountExceeds') || 'Amount exceeds available balance';
        }
        return '';
    };

    const validatePaymentMethod = (value) => {
        if (!value || value.trim() === '') {
            return t('withdrawSection.paymentMethodRequired') || 'Payment method is required';
        }
        return '';
    };

    const validateWhatsappTelegram = (value) => {
        if (!value || value.trim() === '') {
            return t('withdrawSection.accountRequired') || 'WhatsApp/Telegram account is required';
        }
        if (value.trim().length < 3) {
            return t('withdrawSection.accountInvalid') || 'Please enter a valid account';
        }
        return '';
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field);
    };

    const validateField = (field) => {
        let error = '';
        switch (field) {
            case 'withdrawalAmount':
                error = validateWithdrawalAmount(withdrawalAmount);
                break;
            case 'paymentMethod':
                error = validatePaymentMethod(paymentMethod);
                break;
            case 'whatsappTelegram':
                error = validateWhatsappTelegram(whatsappTelegram);
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Mark all fields as touched
        setTouched({
            withdrawalAmount: true,
            paymentMethod: true,
            whatsappTelegram: true
        });

        // Validate all fields
        const isAmountValid = validateField('withdrawalAmount');
        const isPaymentValid = validateField('paymentMethod');
        const isAccountValid = validateField('whatsappTelegram');

        if (isAmountValid && isPaymentValid && isAccountValid) {
            // Form is valid, proceed with submission
            console.log('Form submitted:', {
                withdrawalAmount,
                paymentMethod,
                whatsappTelegram
            });
            // TODO: Add API call here
        }
    };

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
                    transition={{ delay: 0.3 }}
                >
                    <div className="withdraw-apply-section__header">
                        <h2 className="withdraw-apply-section__title">{t('withdrawSection.apply') || 'Apply'}</h2>
                        <button 
                            type="button"
                            onClick={() => setShowRecordModal(true)}
                            className="withdraw-apply-section__link"
                        >
                            {t('withdrawSection.record') || 'Record'} <HiArrowRight />
                        </button>
                    </div>

                    <form className="withdraw-apply-form" onSubmit={handleSubmit} noValidate>
                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.withdrawalAmount') || 'Withdrawal amount'}
                            </label>
                            <input
                                type="text"
                                className={`withdraw-form-input ${touched.withdrawalAmount && errors.withdrawalAmount ? 'withdraw-form-input--error' : ''}`}
                                placeholder={t('withdrawSection.withdrawalAmountPlaceholder') || 'Please enter the requested cash withdrawal amount'}
                                value={withdrawalAmount}
                                onChange={(e) => {
                                    setWithdrawalAmount(e.target.value);
                                    if (touched.withdrawalAmount) {
                                        validateField('withdrawalAmount');
                                    }
                                }}
                                onBlur={() => handleBlur('withdrawalAmount')}
                            />
                            {touched.withdrawalAmount && errors.withdrawalAmount && (
                                <span className="withdraw-form-error">{errors.withdrawalAmount}</span>
                            )}
                        </div>

                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.paymentMethod') || 'Payment method'}
                            </label>
                            <div className="withdraw-form-input-wrapper withdraw-payment-dropdown-wrapper">
                                <div
                                    className={`withdraw-form-input withdraw-payment-dropdown ${touched.paymentMethod && errors.paymentMethod ? 'withdraw-form-input--error' : ''} ${showPaymentDropdown ? 'withdraw-payment-dropdown--open' : ''}`}
                                    onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                                    onBlur={() => {
                                        setTimeout(() => setShowPaymentDropdown(false), 200);
                                        handleBlur('paymentMethod');
                                    }}
                                    tabIndex={0}
                                >
                                    <span className="withdraw-payment-dropdown__selected">
                                        {paymentMethod 
                                            ? (paymentMethodsDetails[paymentMethod] 
                                                ? `${paymentMethod} | ${t('withdrawSection.minAmount') || 'Min'}: ${paymentMethodsDetails[paymentMethod].min} ${currency} | ${t('withdrawSection.fees') || 'Fees'}: ${paymentMethodsDetails[paymentMethod].fees} | ${t('withdrawSection.processingTime') || 'Time'}: ${paymentMethodsDetails[paymentMethod].time}`
                                                : paymentMethod)
                                            : (t('withdrawSection.paymentMethodPlaceholder') || 'Please enter the payment method')}
                                    </span>
                                    <HiChevronDown className={`withdraw-form-select-arrow ${showPaymentDropdown ? 'withdraw-form-select-arrow--open' : ''}`} />
                                </div>
                                {showPaymentDropdown && (
                                    <div className="withdraw-payment-dropdown__menu">
                                        {Object.keys(paymentMethodsDetails).map((method) => {
                                            const details = paymentMethodsDetails[method];
                                            const methodLabel = method === 'USDT' ? t('withdrawSection.usdt') || 'USDT' :
                                                               method === 'PayPal' ? t('withdrawSection.paypal') || 'PayPal' :
                                                               method === 'Payoneer' ? t('withdrawSection.payoneer') || 'Payoneer' :
                                                               t('withdrawSection.bankTransfer') || 'Bank transfer (personal)';
                                            return (
                                                <div
                                                    key={method}
                                                    className={`withdraw-payment-dropdown__option ${paymentMethod === method ? 'withdraw-payment-dropdown__option--selected' : ''}`}
                                                    onClick={() => {
                                                        setPaymentMethod(method);
                                                        setShowPaymentDropdown(false);
                                                        if (touched.paymentMethod) {
                                                            validateField('paymentMethod');
                                                        }
                                                    }}
                                                >
                                                    <div className="withdraw-payment-dropdown__option-header">
                                                        <span className="withdraw-payment-dropdown__option-name">{methodLabel}</span>
                                                    </div>
                                                    <div className="withdraw-payment-dropdown__option-details">
                                                        <span className="withdraw-payment-dropdown__option-detail">
                                                            {t('withdrawSection.minAmount') || 'Min'}: <strong>{details.min} {currency}</strong>
                                                        </span>
                                                        <span className="withdraw-payment-dropdown__option-detail">
                                                            {t('withdrawSection.fees') || 'Fees'}: <strong>{details.fees}</strong>
                                                        </span>
                                                        <span className="withdraw-payment-dropdown__option-detail">
                                                            {t('withdrawSection.processingTime') || 'Time'}: <strong>{details.time}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {touched.paymentMethod && errors.paymentMethod && (
                                <span className="withdraw-form-error">{errors.paymentMethod}</span>
                            )}
                        </div>

                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.whatsappTelegram') || 'WhatsApp/Telegram accounts'}
                            </label>
                            <div className="withdraw-form-input-wrapper">
                                <input
                                    type="text"
                                    className={`withdraw-form-input ${touched.whatsappTelegram && errors.whatsappTelegram ? 'withdraw-form-input--error' : ''}`}
                                    placeholder={t('withdrawSection.whatsappTelegramPlaceholder') || 'Please enter the whatsapp/telegram accounts'}
                                    value={whatsappTelegram}
                                    onChange={(e) => {
                                        setWhatsappTelegram(e.target.value);
                                        if (touched.whatsappTelegram) {
                                            validateField('whatsappTelegram');
                                        }
                                    }}
                                    onBlur={() => handleBlur('whatsappTelegram')}
                                    maxLength={50}
                                />
                                <span className="withdraw-form-char-count">{whatsappTelegram.length}/50</span>
                            </div>
                            {touched.whatsappTelegram && errors.whatsappTelegram && (
                                <span className="withdraw-form-error">{errors.whatsappTelegram}</span>
                            )}
                        </div>

                        <button type="submit" className="withdraw-submit-button">
                            {t('withdrawSection.withdraw') || 'Withdraw'}
                        </button>
                    </form>

                    <div className="withdraw-notice">
                        <div className="withdraw-notice__title">{t('withdrawSection.notice') || 'Notice:'}</div>
                        <div className="withdraw-notice__text">{t('withdrawSection.noticeText') || 'The amount of cash withdrawal must be ≥ 10 US dollars If not please go ahead and share the link'}</div>
                    </div>
                </motion.div>
            </div>

            {/* Withdrawal Record Modal */}
            <AnimatePresence>
                {showRecordModal && (
                    <motion.div
                        className="withdraw-record-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowRecordModal(false)}
                    >
                        <motion.div
                            className="withdraw-record-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="withdraw-record-modal__header">
                                <h3 className="withdraw-record-modal__title">
                                    {t('withdrawSection.record') || 'Withdrawal Record'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowRecordModal(false)}
                                    className="withdraw-record-modal__close"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="withdraw-record-modal__content">
                                {withdrawalHistoryLoading ? (
                                    <div className="withdraw-record-modal__loading">
                                        <div className="withdraw-record-modal__spinner"></div>
                                        <p>{t('withdrawSection.loadingHistory') || 'Loading withdrawal history...'}</p>
                                    </div>
                                ) : withdrawalHistory?.withdrawals?.length > 0 || withdrawalHistory?.data?.length > 0 ? (
                                    <div className="withdraw-table-container">
                                        <table className="withdraw-table">
                                            <thead>
                                                <tr>
                                                    <th>{t('withdrawSection.tableDate') || 'Date'}</th>
                                                    <th>{t('withdrawSection.tableAmount') || 'Amount'}</th>
                                                    <th>{t('withdrawSection.tableMethod') || 'Payment Method'}</th>
                                                    <th>{t('withdrawSection.tableStatus') || 'Status'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(withdrawalHistory?.withdrawals || withdrawalHistory?.data || []).map((withdrawal, index) => (
                                                    <tr key={withdrawal?._id || withdrawal?.id || index}>
                                                        <td className="withdraw-date">
                                                            {withdrawal?.createdAt 
                                                                ? new Date(withdrawal.createdAt).toLocaleDateString()
                                                                : withdrawal?.date || '-'}
                                                        </td>
                                                        <td className="withdraw-amount">
                                                            {withdrawal?.amount || '-'} {withdrawal?.currency || currency}
                                                        </td>
                                                        <td className="withdraw-payment-method">
                                                            {withdrawal?.paymentMethod || '-'}
                                                        </td>
                                                        <td>
                                                            <span className={`withdraw-status withdraw-status--${(withdrawal?.status || 'pending').toLowerCase()}`}>
                                                                {withdrawal?.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="withdraw-table-empty">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>{t('withdrawSection.noWithdrawalHistory') || 'No withdrawal history found'}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
