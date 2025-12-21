import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimes, FaFileInvoice, FaPhone } from 'react-icons/fa';
import { HiCurrencyDollar, HiClock } from 'react-icons/hi2';
import { adminService, promoterService, userService } from '../../services/api';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../../components/Loading/Loading';
import TermsModal from '../../components/TermsModal/TermsModal';
import './Subscribe.scss';

export default function Subscribe() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const queryClient = useQueryClient();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [subscriptionForm, setSubscriptionForm] = useState({
        invoiceFile: null,
        phone: '',
        paymentMethod: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch plans from API
    const { data: plansData, isLoading: plansLoading } = useQuery(
        ['subscription-plans'],
        async () => {
            try {
                const response = await adminService.getPlans();
                if (response.plans) return response;
                if (Array.isArray(response)) return { plans: response };
                if (response.data) return { plans: response.data };
                return { plans: [] };
            } catch (error) {
                console.error('Error fetching plans:', error);
                return { plans: [] };
            }
        },
        { enabled: true }
    );

    const plans = plansData?.plans || [];

    // Fetch user data to get name/username
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(cookies.MegaBox),
        {
            enabled: !!cookies.MegaBox,
            retry: false
        }
    );

    // Payment methods
    const paymentMethods = [
        { value: 'USDT', label: 'USDT' },
        { value: 'PayPal', label: 'PayPal' },
        { value: 'Payoneer', label: 'Payoneer' },
        { value: 'Bank Transfer', label: t('subscribe.bankTransfer') || 'Bank Transfer' }
    ];

    const handleSubscribe = (plan) => {
        if (!cookies.MegaBox) {
            navigate('/login');
            return;
        }

        const termsAccepted = localStorage.getItem('termsAccepted');
        if (!termsAccepted) {
            setSelectedPlan(plan);
            setShowTermsModal(true);
            return;
        }

        setSelectedPlan(plan);
        setShowSubscriptionModal(true);
    };

    const handleTermsAccept = () => {
        if (selectedPlan) {
            setShowTermsModal(false);
            setShowSubscriptionModal(true);
        }
    };

    const handleSubscriptionSubmit = async (e) => {
        e.preventDefault();

        if (!subscriptionForm.phone || !subscriptionForm.paymentMethod || !subscriptionForm.invoiceFile || !selectedPlan) {
            toast.error(t('subscribe.fillAllFields') || 'Please fill all required fields', ToastOptions("error"));
            return;
        }

        // Validate all required fields
        const phone = subscriptionForm.phone?.trim();
        const paymentMethod = subscriptionForm.paymentMethod?.trim();
        const invoiceFile = subscriptionForm.invoiceFile;
        const durationDays = selectedPlan.days || selectedPlan.durationDays || 30;
        const planName = selectedPlan.name || selectedPlan.planName || selectedPlan.planKey || selectedPlan.title || '';

        // Debug: Log selected plan data
        console.log('Selected Plan:', selectedPlan);
        console.log('Form Data:', {
            phone,
            paymentMethod,
            hasInvoice: !!invoiceFile,
            durationDays,
            planName
        });

        if (!phone || !paymentMethod || !invoiceFile || !planName) {
            const missingFields = [];
            if (!phone) missingFields.push('Phone');
            if (!paymentMethod) missingFields.push('Payment Method');
            if (!invoiceFile) missingFields.push('Invoice File');
            if (!planName) missingFields.push('Plan Name');
            
            toast.error(
                `${t('subscribe.fillAllFields') || 'Please fill all required fields'}: ${missingFields.join(', ')}`,
                ToastOptions("error")
            );
            return;
        }

        setIsSubmitting(true);
        try {
            // Get user name/username if available
            const subscriberName = userData?.name || userData?.username || userData?.user?.name || userData?.user?.username || '';
            
            console.log('User data for subscriberName:', {
                userData,
                subscriberName,
                extractedFrom: {
                    name: userData?.name,
                    username: userData?.username,
                    user_name: userData?.user?.name,
                    user_username: userData?.user?.username
                }
            });
            
            await promoterService.createSubscription(
                invoiceFile,
                phone,
                subscriberName, // Use user's name if available
                durationDays,
                planName,
                cookies.MegaBox,
                paymentMethod // Add payment method
            );

            setShowSubscriptionModal(false);
            setSubscriptionForm({
                invoiceFile: null,
                phone: '',
                paymentMethod: ''
            });
            setSelectedPlan(null);
            
            queryClient.invalidateQueries(['subscription-plans']);
            queryClient.invalidateQueries(['userAccount']);
            
            toast.success(t('subscribe.success') || 'Subscription request submitted successfully!', ToastOptions("success"));
        } catch (error) {
            console.error('Error creating subscription:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSubscriptionForm(prev => ({ ...prev, invoiceFile: file }));
        }
    };

    return (
        <>
            <div className="subscribe-page">
                <div className="subscribe-page__container">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="subscribe-page__header"
                    >
                        <h1 className="subscribe-page__title">
                            {t('subscribe.title') || 'Subscribe to a Plan'}
                        </h1>
                        <p className="subscribe-page__subtitle">
                            {t('subscribe.subtitle') || 'Choose a subscription plan and subscribe'}
                        </p>
                    </motion.div>

                    {/* Plans Section */}
                    <div className="subscribe-page__section">
                        <h2 className="subscribe-page__section-title">
                            {t('subscribe.availablePlans') || 'Available Plans'}
                        </h2>
                        {plansLoading ? (
                            <div className="subscribe-page__loading">
                                <Loading />
                            </div>
                        ) : plans.length > 0 ? (
                            <div className="subscribe-page__plans">
                                {plans.map((plan, idx) => (
                                    <motion.div
                                        key={plan._id || plan.id || idx}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className="subscribe-page__plan-card"
                                    >
                                        <div className="subscribe-page__plan-header">
                                            <h3 className="subscribe-page__plan-title">
                                                {plan.name || t('subscribe.plan.defaultName') || 'Subscription Plan'}
                                            </h3>
                                            <div className="subscribe-page__plan-price">
                                                <HiCurrencyDollar className="subscribe-page__plan-price-icon" />
                                                <span className="subscribe-page__plan-amount">
                                                    {plan.price || '0'}
                                                </span>
                                                <span className="subscribe-page__plan-currency">
                                                    {plan.currency || 'USD'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="subscribe-page__plan-content">
                                            <ul className="subscribe-page__plan-features">
                                                <li className="subscribe-page__plan-feature">
                                                    <HiClock className="subscribe-page__plan-feature-icon" />
                                                    <span>
                                                        {plan.days || 30} {t('subscribe.plan.days') || 'days'}
                                                    </span>
                                                </li>
                                                {plan.description && (
                                                    <li className="subscribe-page__plan-feature">
                                                        <FaCheckCircle className="subscribe-page__plan-feature-icon" />
                                                        <span>{plan.description}</span>
                                                    </li>
                                                )}
                                            </ul>
                                            <button
                                                onClick={() => handleSubscribe(plan)}
                                                className="subscribe-page__plan-button"
                                            >
                                                {t('subscribe.subscribe') || 'Subscribe'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="subscribe-page__empty">
                                <p>{t('subscribe.noPlans') || 'No subscription plans available at the moment.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            <TermsModal
                isOpen={showTermsModal}
                onClose={() => {
                    setShowTermsModal(false);
                    setSelectedPlan(null);
                }}
                onAccept={handleTermsAccept}
            />

            {/* Subscription Modal */}
            <AnimatePresence>
                {showSubscriptionModal && selectedPlan && (
                    <motion.div
                        className="subscribe-page__modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isSubmitting && setShowSubscriptionModal(false)}
                    >
                        <motion.div
                            className="subscribe-page__modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="subscribe-page__modal-close"
                                onClick={() => !isSubmitting && setShowSubscriptionModal(false)}
                                disabled={isSubmitting}
                            >
                                <FaTimes />
                            </button>
                            <h3 className="subscribe-page__modal-title">
                                {t('subscribe.modal.title') || 'Subscribe to Plan'}
                            </h3>
                            <p className="subscribe-page__modal-subtitle">
                                {t('subscribe.modal.selectedPlan') || 'Selected Plan'}: <strong>{selectedPlan.name || selectedPlan.title}</strong>
                            </p>
                            <form onSubmit={handleSubscriptionSubmit} className="subscribe-page__modal-form">
                                <div className="subscribe-page__form-group">
                                    <label>
                                        <FaPhone className="subscribe-page__form-icon" />
                                        {t('subscribe.modal.phone') || 'Phone Number'} *
                                    </label>
                                    <input
                                        type="tel"
                                        value={subscriptionForm.phone}
                                        onChange={(e) => setSubscriptionForm(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                        disabled={isSubmitting}
                                        placeholder={t('subscribe.modal.phonePlaceholder') || 'Enter your phone number'}
                                    />
                                </div>
                                <div className="subscribe-page__form-group">
                                    <label>
                                        <HiCurrencyDollar className="subscribe-page__form-icon" />
                                        {t('subscribe.modal.paymentMethod') || 'Payment Method'} *
                                    </label>
                                    <select
                                        value={subscriptionForm.paymentMethod}
                                        onChange={(e) => setSubscriptionForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                        required
                                        disabled={isSubmitting}
                                        className="subscribe-page__form-select"
                                    >
                                        <option value="">{t('subscribe.modal.selectPaymentMethod') || 'Select payment method'}</option>
                                        {paymentMethods.map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="subscribe-page__form-group">
                                    <label>
                                        <FaFileInvoice className="subscribe-page__form-icon" />
                                        {t('subscribe.modal.invoice') || 'Invoice'} *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {subscriptionForm.invoiceFile && (
                                        <span className="subscribe-page__file-name">
                                            {subscriptionForm.invoiceFile.name}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="subscribe-page__modal-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting 
                                        ? (t('subscribe.modal.submitting') || 'Submitting...') 
                                        : (t('subscribe.modal.submit') || 'Submit Subscription')
                                    }
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
