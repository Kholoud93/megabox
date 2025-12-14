import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimes, FaUser, FaPhone, FaCalendar, FaTag, FaFileInvoice } from 'react-icons/fa';
import { HiCurrencyDollar, HiClock } from 'react-icons/hi2';
import { promoterService, userService, adminService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../../components/Loading/Loading';
import TermsModal from '../../components/TermsModal/TermsModal';
import Footer from '../../components/Footer/Footer';
import './Subscription.scss';

export default function Subscription() {
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
        subscriberName: '',
        planName: '',
        durationDays: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch plans from API
    const { data: plansData, isLoading: plansLoading } = useQuery(
        ['subscription-plans'],
        async () => {
            try {
                const response = await promoterService.getPlans();
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

    // Fetch user data to check subscribed plans
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(cookies.MegaBox),
        {
            enabled: !!cookies.MegaBox,
            retry: false
        }
    );

    // Check if user is promoter
    const isPromoter = userData?.isPromoter === "true" || userData?.isPromoter === true;
    
    // Check if user has subscribed to a plan
    const hasWatchingPlan = userData?.watchingplan === "true" || userData?.watchingplan === true;
    const hasDownloadsPlan = userData?.Downloadsplan === "true" || userData?.Downloadsplan === true;

    // Fetch all subscriptions using getAllSubscriptions API
    const { data: allSubscriptionsData, isLoading: subscriptionsLoading } = useQuery(
        ['allSubscriptions'],
        async () => {
            try {
                const response = await adminService.getAllSubscriptions(cookies.MegaBox);
                const userId = userData?._id || userData?.id;
                
                if (!userId) return { created: [], subscribed: [] };
                
                // Handle different response structures
                let subscriptions = [];
                if (response.subscriptions && Array.isArray(response.subscriptions)) {
                    subscriptions = response.subscriptions;
                } else if (Array.isArray(response)) {
                    subscriptions = response;
                } else if (response.data && Array.isArray(response.data)) {
                    subscriptions = response.data;
                }
                
                // Separate subscriptions:
                // 1. Created by current user (for subscribers) - these are subscriptions the promoter created for others
                const createdSubscriptions = subscriptions.filter(sub => {
                    // Check if this subscription was created by the current user (as promoter)
                    const subPromoterId = sub.promoterId?._id || sub.promoterId?.id || sub.promoterId;
                    const subCreatedBy = sub.createdBy?._id || sub.createdBy?.id || sub.createdBy;
                    const subUserId = sub.userId?._id || sub.userId?.id || sub.userId;
                    const subPromoter = sub.promoter?._id || sub.promoter?.id;
                    
                    return subPromoterId === userId || 
                           subCreatedBy === userId || 
                           subUserId === userId ||
                           subPromoter === userId;
                });

                // 2. Subscriptions where current user is the subscriber (user's own subscriptions)
                // Since we don't have subscriberId, we'll use watchingplan/Downloadsplan from userData
                // and match by plan name if available
                const userSubscriptions = subscriptions.filter(sub => {
                    // Check by subscriber name/email matching
                    const subscriberName = (sub.subscriberName || sub.name || '').toLowerCase().trim();
                    const userEmail = (userData?.email || '').toLowerCase().trim();
                    const userName = (userData?.username || userData?.name || '').toLowerCase().trim();
                    
                    // Also check by subscriberId if available
                    const hasMatchingName = subscriberName && (subscriberName === userEmail || subscriberName === userName);
                    const hasMatchingId = sub.subscriberId === userId ||
                                         sub.subscriber?._id === userId ||
                                         sub.subscriber?.id === userId ||
                                         sub.user?._id === userId ||
                                         sub.user?.id === userId;
                    
                    return hasMatchingName || hasMatchingId;
                });

                return { created: createdSubscriptions, subscribed: userSubscriptions };
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                return { created: [], subscribed: [] };
            }
        },
        {
            enabled: !!cookies.MegaBox && !!userData,
            retry: false
        }
    );

    const mySubscriptions = allSubscriptionsData?.created || [];
    const userSubscribedPlans = allSubscriptionsData?.subscribed || [];

    // Get plans that user has subscribed to
    const getUserSubscribedPlans = () => {
        // Get plans from userSubscribedPlans (from getAllSubscriptions API)
        const plansFromSubscriptions = plans.filter(plan => {
            const planName = (plan.name || '').toLowerCase().trim();
            const planId = plan._id || plan.id;
            
            return userSubscribedPlans.some(sub => {
                const subPlanName = (sub.planName || sub.plan?.name || '').toLowerCase().trim();
                const subPlanId = sub.planId || sub.plan?._id || sub.plan?.id;
                
                return subPlanName === planName || subPlanId === planId;
            });
        });

        return plansFromSubscriptions;
    };

    const subscribedPlans = getUserSubscribedPlans();
    
    // Check if user has any legacy plans (watchingplan or Downloadsplan)
    const hasLegacyPlan = hasWatchingPlan || hasDownloadsPlan;

    const handleCreateSubscription = (plan) => {
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

        if (!subscriptionForm.phone || !subscriptionForm.subscriberName || !subscriptionForm.invoiceFile || !selectedPlan) {
            return;
        }

        setIsSubmitting(true);
        try {
            await promoterService.createSubscription(
                subscriptionForm.invoiceFile,
                subscriptionForm.phone,
                subscriptionForm.subscriberName,
                selectedPlan.days || 30,
                selectedPlan.name || selectedPlan.planName,
                cookies.MegaBox
            );

            setShowSubscriptionModal(false);
            setSubscriptionForm({
                invoiceFile: null,
                phone: '',
                subscriberName: '',
                planName: '',
                durationDays: ''
            });
            setSelectedPlan(null);
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries(['subscription-plans']);
            queryClient.invalidateQueries(['userAccount']);
            queryClient.invalidateQueries(['allSubscriptions']);
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


    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    return (
        <>
            <div className="subscription-page">
                <div className="subscription-page__container">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="subscription-page__header"
                    >
                        <h1 className="subscription-page__title">
                            {t('subscriptionPage.title') || 'Subscription Plans'}
                        </h1>
                        <p className="subscription-page__subtitle">
                            {isPromoter 
                                ? (t('subscriptionPage.subtitle') || 'Choose a subscription plan and create a subscription for your subscribers')
                                : (t('subscriptionPage.subtitleUser') || 'Browse available subscription plans')
                            }
                        </p>
                    </motion.div>

                    {/* Plans Section */}
                    <div className="subscription-page__section">
                        <h2 className="subscription-page__section-title">
                            {t('subscriptionPage.availablePlans') || 'Available Plans'}
                        </h2>
                        {plansLoading ? (
                            <div className="subscription-page__loading">
                                <Loading />
                            </div>
                        ) : plans.length > 0 ? (
                            <div className="subscription-page__plans">
                                {plans.map((plan, idx) => (
                                    <motion.div
                                        key={plan._id || plan.id || idx}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className="subscription-page__plan-card"
                                    >
                                        <div className="subscription-page__plan-header">
                                            <h3 className="subscription-page__plan-title">
                                                {plan.name || t('subscriptionPage.plan.defaultName') || 'Subscription Plan'}
                                            </h3>
                                            <div className="subscription-page__plan-price">
                                                <HiCurrencyDollar className="subscription-page__plan-price-icon" />
                                                <span className="subscription-page__plan-amount">
                                                    {plan.price || '0'}
                                                </span>
                                                <span className="subscription-page__plan-currency">
                                                    {plan.currency || 'USD'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="subscription-page__plan-content">
                                            <ul className="subscription-page__plan-features">
                                                <li className="subscription-page__plan-feature">
                                                    <HiClock className="subscription-page__plan-feature-icon" />
                                                    <span>
                                                        {plan.days || 30} {t('subscriptionPage.plan.days') || 'days'}
                                                    </span>
                                                </li>
                                                {plan.description && (
                                                    <li className="subscription-page__plan-feature">
                                                        <FaCheckCircle className="subscription-page__plan-feature-icon" />
                                                        <span>{plan.description}</span>
                                                    </li>
                                                )}
                                            </ul>
                                        {isPromoter ? (
                                            <button
                                                onClick={() => handleCreateSubscription(plan)}
                                                className="subscription-page__plan-button"
                                            >
                                                {t('subscriptionPage.createSubscription') || 'Create Subscription'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate('/dashboard/subscription-plans')}
                                                className="subscription-page__plan-button"
                                            >
                                                {t('subscriptionPage.subscribe') || 'Subscribe'}
                                            </button>
                                        )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="subscription-page__empty">
                                <p>{t('subscriptionPage.noPlans') || 'No subscription plans available at the moment.'}</p>
                            </div>
                        )}
                    </div>

                    {/* User's Subscribed Plans Section */}
                    {cookies.MegaBox && (subscribedPlans.length > 0 || hasLegacyPlan) && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="subscription-page__section subscription-page__subscribed-plans"
                        >
                            <h2 className="subscription-page__section-title">
                                {t('subscriptionPage.mySubscribedPlans') || 'My Subscribed Plans'}
                            </h2>
                            
                            {/* Legacy Plans Info */}
                            {hasLegacyPlan && (
                                <div className="subscription-page__legacy-plans">
                                    {hasWatchingPlan && (
                                        <div className="subscription-page__legacy-plan-item">
                                            <FaCheckCircle className="subscription-page__legacy-plan-icon" />
                                            <span>{t('subscriptionPage.watchingPlan') || 'Watching Plan'} - {t('subscriptionPage.active') || 'Active'}</span>
                                        </div>
                                    )}
                                    {hasDownloadsPlan && (
                                        <div className="subscription-page__legacy-plan-item">
                                            <FaCheckCircle className="subscription-page__legacy-plan-icon" />
                                            <span>{t('subscriptionPage.downloadsPlan') || 'Downloads Plan'} - {t('subscriptionPage.active') || 'Active'}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Plans from Subscriptions */}
                            {subscribedPlans.length > 0 && (
                                <div className="subscription-page__plans">
                                    {subscribedPlans.map((plan, idx) => (
                                        <motion.div
                                            key={plan._id || plan.id || idx}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                                            className="subscription-page__plan-card subscription-page__plan-card--subscribed"
                                        >
                                            <div className="subscription-page__plan-badge">
                                                <span className="subscription-page__plan-badge-text">
                                                    {t('subscriptionPage.subscribed') || 'Subscribed'}
                                                </span>
                                            </div>
                                            <div className="subscription-page__plan-header">
                                                <h3 className="subscription-page__plan-title">
                                                    {plan.name || t('subscriptionPage.plan.defaultName') || 'Subscription Plan'}
                                                </h3>
                                                <div className="subscription-page__plan-price">
                                                    <HiCurrencyDollar className="subscription-page__plan-price-icon" />
                                                    <span className="subscription-page__plan-amount">
                                                        {plan.price || '0'}
                                                    </span>
                                                    <span className="subscription-page__plan-currency">
                                                        {plan.currency || 'USD'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="subscription-page__plan-content">
                                                <ul className="subscription-page__plan-features">
                                                    <li className="subscription-page__plan-feature">
                                                        <HiClock className="subscription-page__plan-feature-icon" />
                                                        <span>
                                                            {plan.days || 30} {t('subscriptionPage.plan.days') || 'days'}
                                                        </span>
                                                    </li>
                                                    {plan.description && (
                                                        <li className="subscription-page__plan-feature">
                                                            <FaCheckCircle className="subscription-page__plan-feature-icon" />
                                                            <span>{plan.description}</span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* My Created Subscriptions Section - Only for Promoters */}
                    {cookies.MegaBox && isPromoter && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="subscription-page__section subscription-page__my-subscriptions"
                        >
                            <div className="subscription-page__section-header">
                                <div>
                                    <h2 className="subscription-page__section-title">
                                        {t('subscriptionPage.mySubscriptions') || 'My Created Subscriptions'}
                                    </h2>
                                    <p className="subscription-page__section-description">
                                        {t('subscriptionPage.mySubscriptionsDescription') || 'Subscriptions you created for your subscribers'}
                                    </p>
                                </div>
                                {mySubscriptions.length > 0 && (
                                    <span className="subscription-page__subscriptions-count">
                                        {mySubscriptions.length} {t('subscriptionPage.subscriptions') || 'subscriptions'}
                                    </span>
                                )}
                            </div>
                            {subscriptionsLoading ? (
                                <div className="subscription-page__loading">
                                    <Loading />
                                </div>
                            ) : mySubscriptions.length > 0 ? (
                                <div className="subscription-page__plans">
                                    {mySubscriptions.map((subscription, idx) => (
                                        <motion.div
                                            key={subscription.id || subscription._id || idx}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                                            className="subscription-page__plan-card"
                                        >
                                            <div className="subscription-page__plan-header">
                                                <h3 className="subscription-page__plan-title">
                                                    {subscription.planName || subscription.plan?.name || t('subscriptionPage.plan.defaultName') || 'Subscription Plan'}
                                                </h3>
                                                <div className="subscription-page__plan-price">
                                                    {subscription.status ? (
                                                        <span className={`subscription-page__subscription-status subscription-page__subscription-status--${(subscription.status || '').toLowerCase()}`}>
                                                            {subscription.status}
                                                        </span>
                                                    ) : (
                                                        <span className="subscription-page__subscription-status subscription-page__subscription-status--active">
                                                            {t('subscriptionPage.active') || 'Active'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="subscription-page__plan-content">
                                                <ul className="subscription-page__plan-features">
                                                    <li className="subscription-page__plan-feature">
                                                        <FaUser className="subscription-page__plan-feature-icon" />
                                                        <span>
                                                            {t('subscriptionPage.table.subscriber') || 'Subscriber'}: <strong>{subscription.subscriberName || subscription.name || '-'}</strong>
                                                        </span>
                                                    </li>
                                                    <li className="subscription-page__plan-feature">
                                                        <FaPhone className="subscription-page__plan-feature-icon" />
                                                        <span>
                                                            {t('subscriptionPage.table.phone') || 'Phone'}: <strong>{subscription.phone || '-'}</strong>
                                                        </span>
                                                    </li>
                                                    <li className="subscription-page__plan-feature">
                                                        <HiClock className="subscription-page__plan-feature-icon" />
                                                        <span>
                                                            {subscription.durationDays || subscription.days || subscription.duration || '-'} {t('subscriptionPage.plan.days') || 'days'}
                                                        </span>
                                                    </li>
                                                    <li className="subscription-page__plan-feature">
                                                        <FaCalendar className="subscription-page__plan-feature-icon" />
                                                        <span>
                                                            {t('subscriptionPage.table.date') || 'Date'}: {formatDate(subscription.createdAt || subscription.created || subscription.date)}
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="subscription-page__no-subscriptions">
                                    <FaFileInvoice className="subscription-page__no-subscriptions-icon" />
                                    <p>{t('subscriptionPage.noSubscriptions') || 'You haven\'t created any subscriptions yet.'}</p>
                                    <p className="subscription-page__no-subscriptions-hint">
                                        {t('subscriptionPage.createFirstSubscription') || 'Create your first subscription by selecting a plan above.'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
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
                        className="subscription-page__modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isSubmitting && setShowSubscriptionModal(false)}
                    >
                        <motion.div
                            className="subscription-page__modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="subscription-page__modal-close"
                                onClick={() => !isSubmitting && setShowSubscriptionModal(false)}
                                disabled={isSubmitting}
                            >
                                <FaTimes />
                            </button>
                            <h3 className="subscription-page__modal-title">
                                {t('subscriptionPage.modal.title') || 'Create Subscription'}
                            </h3>
                            <p className="subscription-page__modal-subtitle">
                                {t('subscriptionPage.modal.selectedPlan') || 'Selected Plan'}: <strong>{selectedPlan.name || selectedPlan.title}</strong>
                            </p>
                            <form onSubmit={handleSubscriptionSubmit} className="subscription-page__modal-form">
                                <div className="subscription-page__form-group">
                                    <label>
                                        <FaUser className="subscription-page__form-icon" />
                                        {t('subscriptionPage.modal.subscriberName') || 'Subscriber Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={subscriptionForm.subscriberName}
                                        onChange={(e) => setSubscriptionForm(prev => ({ ...prev, subscriberName: e.target.value }))}
                                        required
                                        disabled={isSubmitting}
                                        placeholder={t('subscriptionPage.modal.subscriberNamePlaceholder') || 'Enter subscriber name'}
                                    />
                                </div>
                                <div className="subscription-page__form-group">
                                    <label>
                                        <FaPhone className="subscription-page__form-icon" />
                                        {t('subscriptionPage.modal.phone') || 'Phone Number'}
                                    </label>
                                    <input
                                        type="tel"
                                        value={subscriptionForm.phone}
                                        onChange={(e) => setSubscriptionForm(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                        disabled={isSubmitting}
                                        placeholder={t('subscriptionPage.modal.phonePlaceholder') || 'Enter phone number'}
                                    />
                                </div>
                                <div className="subscription-page__form-group">
                                    <label>
                                        <FaFileInvoice className="subscription-page__form-icon" />
                                        {t('subscriptionPage.modal.invoice') || 'Invoice'} *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {subscriptionForm.invoiceFile && (
                                        <span className="subscription-page__file-name">
                                            {subscriptionForm.invoiceFile.name}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="subscription-page__modal-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting 
                                        ? (t('subscriptionPage.modal.submitting') || 'Submitting...') 
                                        : (t('subscriptionPage.modal.submit') || 'Submit Subscription')
                                    }
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </>
    );
}
