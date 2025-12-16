import React, { useState, useEffect, useMemo } from 'react';
import './Earning.scss';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign, FaTimes } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft, HiChevronDown } from 'react-icons/hi2';
import { promoterService, paymentService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { withdrawalService } from '../../services/withdrawalService';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';

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
    const { t, language } = useLanguage();

    // Fetch earnings data
    const { data: earningsData, isLoading: earningsLoading } = useQuery(
        ['userEarnings'],
        () => promoterService.getUserEarnings(token),
        {
            enabled: !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching earnings:', error);
            }
        }
    );

    // API Response structure: { "pendingRewards", "confirmedRewards", "totalEarnings", "currency" }
    const currency = earningsData?.currency || 'USD';
    // Match API response structure - prioritize exact API fields
    const amount = earningsData?.confirmedRewards || earningsData?.actualIncome || '0.000000';
    const review = earningsData?.pendingRewards || earningsData?.estimatedIncome || '0.000000';
    const withdrawn = earningsData?.withdrawn || '0.000000';
    const totalEarnings = earningsData?.totalEarnings || earningsData?.promoterEarnings || '0.000000';
    const withdrawable = earningsData?.withdrawable || totalEarnings || '0.000000';
    const withdrawableAmount = parseFloat(withdrawable) || 0;

    // Debug logging
    useEffect(() => {
        console.log('Earning Page - Earnings Data:', {
            earningsData,
            earningsLoading,
            amount,
            withdrawable,
            withdrawableAmount,
            canShowQuickWithdraw: !earningsLoading && withdrawableAmount >= 10
        });
    }, [earningsData, earningsLoading, amount, withdrawable, withdrawableAmount]);

    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [whatsappTelegram, setWhatsappTelegram] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
    const [viewMode, setViewMode] = useState('all'); // 'all', 'approved', 'pending', 'rejected'
    const [selectedPaymentServiceId, setSelectedPaymentServiceId] = useState(null);
    const queryClient = useQueryClient();

    // Fetch payment services
    const { data: paymentServicesData } = useQuery(
        ['paymentServices'],
        () => paymentService.getPaymentServices(token),
        {
            enabled: !!token,
            retry: 2,
            onError: (error) => {
                // Silently handle errors - payment services are optional
                console.error('Error fetching payment services:', error);
            }
        }
    );

    const paymentServices = paymentServicesData?.paymentServices || paymentServicesData?.data || paymentServicesData || [];
    const activePaymentServices = paymentServices.filter(service => service.isActive !== false);

    // Get selected payment details from payment services only
    const selectedPaymentDetails = useMemo(() => {
        if (selectedPaymentServiceId) {
            const service = activePaymentServices.find(s => s._id === selectedPaymentServiceId || s.id === selectedPaymentServiceId);
            if (service) {
                return {
                    min: service.minAmount || 10,
                    fees: t('withdrawSection.free') || 'Free',
                    time: t('withdrawSection.within24Hours') || 'Within 24 hours',
                    service: service
                };
            }
        }
        return null;
    }, [selectedPaymentServiceId, activePaymentServices, t]);

    // Fetch withdrawal history using getUserWithdrawals API
    const { data: withdrawalHistory, isLoading: withdrawalHistoryLoading } = useQuery(
        ['userWithdrawals'],
        async () => {
            return promoterService.getUserWithdrawals(token);
        },
        {
            enabled: !!token && showRecordModal,
            retry: false
        }
    );

    // Filter withdrawals client-side based on view mode
    const displayWithdrawals = useMemo(() => {
        const allWithdrawals = withdrawalHistory?.withdrawals || withdrawalHistory?.data || withdrawalHistory || [];
        
        if (viewMode === 'approved') {
            // Filter to show only approved withdrawals
            return allWithdrawals.filter(w => {
                const status = (w.status || '').toLowerCase();
                return status === 'approved' || status === 'active';
            });
        } else if (viewMode === 'pending') {
            // Filter to show only pending withdrawals
            return allWithdrawals.filter(w => {
                const status = (w.status || '').toLowerCase();
                return status === 'pending';
            });
        } else if (viewMode === 'rejected') {
            // Filter to show only rejected withdrawals
            return allWithdrawals.filter(w => {
                const status = (w.status || '').toLowerCase();
                return status === 'rejected';
            });
        }
        
        // 'all' mode - show all withdrawals
        return allWithdrawals;
    }, [withdrawalHistory, viewMode]);

    const isLoadingWithdrawals = withdrawalHistoryLoading;

    // Request withdrawal mutation
    const requestWithdrawalMutation = useMutation(
        (formData) => {
            // If a payment service is selected, include its details
            if (formData.paymentServiceId) {
                const service = activePaymentServices.find(s => (s._id || s.id) === formData.paymentServiceId);
                if (service) {
                    // Include payment service details in the request
                    return withdrawalService.requestWithdrawal(
                        formData.amount,
                        formData.paymentMethod,
                        formData.whatsappNumber,
                        formData.details,
                        token,
                        {
                            paymentServiceId: formData.paymentServiceId,
                            paymentService: service
                        }
                    );
                }
            }
            // Standard withdrawal without payment service
            return withdrawalService.requestWithdrawal(
                formData.amount,
                formData.paymentMethod,
                formData.whatsappNumber,
                formData.details,
                token
            );
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userWithdrawals');
                queryClient.invalidateQueries('withdrawalHistory');
                queryClient.invalidateQueries('userEarnings');
                setWithdrawalAmount('');
                setPaymentMethod('');
                setSelectedPaymentServiceId(null);
                setWhatsappTelegram('');
                setErrors({});
                setTouched({});
                toast.success(t('withdrawSection.withdrawalRequested') || 'Withdrawal request submitted successfully!', ToastOptions("success"));
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || t('withdrawSection.withdrawalError') || 'Failed to request withdrawal', ToastOptions("error"));
            }
        }
    );

    // Quick withdraw earnings mutation (deprecated endpoint)
    const withdrawEarningsMutation = useMutation(
        () => withdrawalService.withdrawEarnings(token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userWithdrawals');
                queryClient.invalidateQueries('withdrawalHistory');
                queryClient.invalidateQueries('userEarnings');
                toast.success(t('withdrawSection.earningsWithdrawn') || 'Earnings withdrawn successfully!', ToastOptions("success"));
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || t('withdrawSection.withdrawalError') || 'Failed to withdraw earnings', ToastOptions("error"));
            }
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
        if (withdrawableAmount > 0 && numValue > withdrawableAmount) {
            return t('withdrawSection.amountExceeds') || 'Amount exceeds available balance';
        }
        return '';
    };

    const validatePaymentMethod = (value) => {
        // Payment method is valid if a payment service is selected
        if (!selectedPaymentServiceId) {
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
            const details = {
                accountName: whatsappTelegram,
                username: whatsappTelegram,
                whatsappNumber: whatsappTelegram
            };
            
            requestWithdrawalMutation.mutate({
                amount: parseFloat(withdrawalAmount),
                paymentMethod: paymentMethod,
                whatsappNumber: whatsappTelegram,
                details: details,
                paymentServiceId: selectedPaymentServiceId
            });
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
                            <div className="withdraw-summary-card__label">{t('withdrawSection.confirmedRewards') || 'Confirmed Rewards'}</div>
                            <div className="withdraw-summary-card__value">
                                {earningsLoading ? '-' : `${parseFloat(amount).toFixed(6)} ${currency}`}
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
                            <div className="withdraw-summary-card__label">{t('withdrawSection.pendingRewards') || 'Pending Rewards'}</div>
                            <div className="withdraw-summary-card__value">
                                {earningsLoading ? '-' : `${parseFloat(review).toFixed(6)} ${currency}`}
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
                            <div className="withdraw-summary-card__label">{t('withdrawSection.totalEarnings') || 'Total Earnings'}</div>
                            <div className="withdraw-summary-card__value">
                                {earningsLoading ? '-' : `${parseFloat(totalEarnings).toFixed(6)} ${currency}`}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="withdraw-summary-card withdraw-summary-card--withdrawable"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="withdraw-summary-card__icon withdraw-summary-card__icon--withdrawable">
                            <FaDollarSign />
                        </div>
                        <div className="withdraw-summary-card__content">
                            <div className="withdraw-summary-card__label">{t('withdrawSection.withdrawable') || 'Withdrawable'}</div>
                            <div className="withdraw-summary-card__value">
                                {earningsLoading ? '-' : `${parseFloat(withdrawable).toFixed(6)} ${currency}`}
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
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {!earningsLoading && withdrawableAmount >= 10 && (
                                <button 
                                    type="button"
                                    onClick={() => withdrawEarningsMutation.mutate()}
                                    disabled={withdrawEarningsMutation.isLoading}
                                    className="withdraw-apply-section__quick-withdraw"
                                >
                                    {withdrawEarningsMutation.isLoading 
                                        ? (t('withdrawSection.withdrawing') || 'Withdrawing...')
                                        : (t('withdrawSection.quickWithdrawAll') || 'Quick Withdraw All')}
                                </button>
                            )}
                            <button 
                                type="button"
                                onClick={() => setShowRecordModal(true)}
                                className="withdraw-apply-section__link"
                            >
                                {t('withdrawSection.record') || 'Record'} {language === 'ar' ? <HiArrowLeft /> : <HiArrowRight />}
                            </button>
                        </div>
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
                                        {(() => {
                                            if (selectedPaymentServiceId) {
                                                const service = activePaymentServices.find(s => (s._id || s.id) === selectedPaymentServiceId);
                                                if (service) {
                                                    const serviceName = service.accountName || service.paymentType || 'Payment Service';
                                                    const credentials = service.credentials || {};
                                                    const credentialValue = credentials.email || credentials.phone || credentials.accountNumber || credentials.walletAddress || '';
                                                    return `${serviceName}${credentialValue ? ` (${credentialValue})` : ''} | ${t('withdrawSection.minAmount') || 'Min'}: ${service.minAmount || 10} ${currency}`;
                                                }
                                            }
                                            return t('withdrawSection.paymentMethodPlaceholder') || 'Please select a payment method';
                                        })()}
                                    </span>
                                    <HiChevronDown className={`withdraw-form-select-arrow ${showPaymentDropdown ? 'withdraw-form-select-arrow--open' : ''}`} />
                                </div>
                                {showPaymentDropdown && (
                                    <div className="withdraw-payment-dropdown__menu">
                                        {/* Payment Services from API */}
                                        {activePaymentServices.length > 0 ? (
                                            activePaymentServices.map((service) => {
                                                const serviceId = service._id || service.id;
                                                const isSelected = selectedPaymentServiceId === serviceId;
                                                const serviceName = service.accountName || service.paymentType || 'Payment Service';
                                                const credentials = service.credentials || {};
                                                const credentialValue = credentials.email || credentials.phone || credentials.accountNumber || credentials.walletAddress || '';
                                                
                                                return (
                                                    <div
                                                        key={`service-${serviceId}`}
                                                        className={`withdraw-payment-dropdown__option ${isSelected ? 'withdraw-payment-dropdown__option--selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedPaymentServiceId(serviceId);
                                                            setPaymentMethod(service.paymentType || serviceName);
                                                            setShowPaymentDropdown(false);
                                                            if (touched.paymentMethod) {
                                                                validateField('paymentMethod');
                                                            }
                                                        }}
                                                    >
                                                        <div className="withdraw-payment-dropdown__option-header">
                                                            <span className="withdraw-payment-dropdown__option-name">
                                                                {serviceName} {service.isDefault && <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>({t('withdrawSection.default') || 'Default'})</span>}
                                                            </span>
                                                        </div>
                                                        <div className="withdraw-payment-dropdown__option-details">
                                                            <span className="withdraw-payment-dropdown__option-detail">
                                                                {t('withdrawSection.type') || 'Type'}: <strong>{service.paymentType || 'N/A'}</strong>
                                                            </span>
                                                            {credentialValue && (
                                                                <span className="withdraw-payment-dropdown__option-detail">
                                                                    {t('withdrawSection.account') || 'Account'}: <strong>{credentialValue}</strong>
                                                                </span>
                                                            )}
                                                            <span className="withdraw-payment-dropdown__option-detail">
                                                                {t('withdrawSection.minAmount') || 'Min'}: <strong>{service.minAmount || 10} {currency}</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="withdraw-payment-dropdown__empty">
                                                <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                                                    {t('withdrawSection.noPaymentServices') || 'No payment methods available. Please add a payment method first.'}
                                                </p>
                                            </div>
                                        )}
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

                        <button 
                            type="submit" 
                            className="withdraw-submit-button"
                            disabled={requestWithdrawalMutation.isLoading}
                        >
                            {requestWithdrawalMutation.isLoading 
                                ? (t('withdrawSection.submitting') || 'Submitting...') 
                                : (t('withdrawSection.withdraw') || 'Withdraw')}
                        </button>
                    </form>

                    <div className="withdraw-notice">
                        <div className="withdraw-notice__title">{t('withdrawSection.notice') || 'Notice:'}</div>
                        <div className="withdraw-notice__text">{t('withdrawSection.noticeText') || 'The amount of cash withdrawal must be ≥ 10 US dollars If not please go ahead and share the link'}</div>
                    </div>
                </motion.div>

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
                                    {/* Filter Buttons */}
                                    <div className="withdraw-filters">
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('all')}
                                            className={`withdraw-filter-btn ${viewMode === 'all' ? 'active' : ''}`}
                                        >
                                            <span className="filter-title">
                                                {t('withdrawSection.allWithdrawals') || 'All'}
                                            </span>
                                            <span className="filter-desc">
                                                {t('withdrawSection.allWithdrawalsDesc') || 'View all withdrawal requests'}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('pending')}
                                            className={`withdraw-filter-btn ${viewMode === 'pending' ? 'active' : ''}`}
                                        >
                                            <span className="filter-title">
                                                {t('withdrawSection.pending') || 'Pending'}
                                            </span>
                                            <span className="filter-desc">
                                                {t('withdrawSection.pendingDesc') || 'View pending withdrawals'}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('approved')}
                                            className={`withdraw-filter-btn ${viewMode === 'approved' ? 'active' : ''}`}
                                        >
                                            <span className="filter-title">
                                                {t('withdrawSection.approvedOnly') || 'Approved'}
                                            </span>
                                            <span className="filter-desc">
                                                {t('withdrawSection.approvedOnlyDesc') || 'View approved withdrawals only'}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('rejected')}
                                            className={`withdraw-filter-btn ${viewMode === 'rejected' ? 'active' : ''}`}
                                        >
                                            <span className="filter-title">
                                                {t('withdrawSection.rejected') || 'Rejected'}
                                            </span>
                                            <span className="filter-desc">
                                                {t('withdrawSection.rejectedDesc') || 'View rejected withdrawals'}
                                            </span>
                                        </button>
                                    </div>

                                    {isLoadingWithdrawals ? (
                                        <div className="withdraw-record-modal__loading">
                                            <div className="withdraw-record-modal__spinner"></div>
                                            <p>{t('withdrawSection.loadingHistory') || 'Loading withdrawal history...'}</p>
                                        </div>
                                    ) : displayWithdrawals.length > 0 ? (
                                        <div className="withdraw-table-container">
                                            <table className="withdraw-table">
                                                <thead>
                                                    <tr>
                                                        <th>{t('withdrawSection.tableDate') || 'Date'}</th>
                                                        <th>{t('withdrawSection.tableAmount') || 'Amount'}</th>
                                                        <th>{t('withdrawSection.tableMethod') || 'Payment Method'}</th>
                                                        <th>{t('withdrawSection.tableStatus') || 'Status'}</th>
                                                        <th>{t('withdrawSection.tableReason') || 'Reason'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayWithdrawals.map((withdrawal, index) => (
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
                                                            <td className="withdraw-reason">
                                                                {withdrawal?.status === 'rejected' ? (() => {
                                                                    // Check for reason in various possible field names
                                                                    const rejectionReason = withdrawal?.reason || 
                                                                                           withdrawal?.rejectionReason || 
                                                                                           withdrawal?.rejectReason ||
                                                                                           withdrawal?.rejection_reason;
                                                                    return rejectionReason ? (
                                                                        <span className="withdraw-reason__text" title={rejectionReason}>
                                                                            {rejectionReason}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="withdraw-reason__empty">-</span>
                                                                    );
                                                                })() : (
                                                                    <span className="withdraw-reason__empty">-</span>
                                                                )}
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
            </div>
        </motion.div>
    );
}
