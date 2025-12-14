import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaTimes, FaUser, FaPhone, FaCalendar, FaFileInvoice, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft, HiCurrencyDollar, HiClock } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import Loading from '../../../components/Loading/Loading';
import './Subscriptions.scss';

export default function AdminSubscriptions() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch all subscriptions
    const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery(
        ['allSubscriptions'],
        async () => {
            try {
                const response = await adminService.getAllSubscriptions(token);
                let subscriptions = [];
                if (response.subscriptions && Array.isArray(response.subscriptions)) {
                    subscriptions = response.subscriptions;
                } else if (Array.isArray(response)) {
                    subscriptions = response;
                } else if (response.data && Array.isArray(response.data)) {
                    subscriptions = response.data;
                }
                return subscriptions;
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                return [];
            }
        },
        {
            enabled: !!token,
            retry: false
        }
    );

    // Approve/Activate subscription mutation
    const approveSubscriptionMutation = useMutation(
        async (subscriptionId) => {
            return await adminService.approveSubscription(subscriptionId, token);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('allSubscriptions');
                toast.success(t('adminSubscriptions.subscriptionApproved') || 'Subscription approved successfully!', ToastOptions("success"));
                setSelectedSubscription(null);
            },
            onError: (error) => {
                toast.error(error.message || t('adminSubscriptions.approveFailed') || 'Failed to approve subscription', ToastOptions("error"));
            }
        }
    );

    // Filter subscriptions
    const filteredSubscriptions = useMemo(() => {
        if (!subscriptionsData) return [];
        
        return subscriptionsData.filter((sub) => {
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const subscriberName = (sub.subscriberName || sub.name || '').toLowerCase();
                const planName = (sub.planName || sub.plan?.name || '').toLowerCase();
                const phone = (sub.phone || '').toLowerCase();
                
                if (!subscriberName.includes(searchLower) &&
                    !planName.includes(searchLower) &&
                    !phone.includes(searchLower)) {
                    return false;
                }
            }
            return true;
        });
    }, [subscriptionsData, searchTerm]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const handleViewDetails = (subscription) => {
        setSelectedSubscription(subscription);
    };

    const handleApproveSubscription = () => {
        if (!selectedSubscription) return;
        const subscriptionId = selectedSubscription._id || selectedSubscription.id;
        if (subscriptionId) {
            approveSubscriptionMutation.mutate(subscriptionId);
        }
    };

    const getUserProfileLink = (subscription) => {
        const userId = subscription.userId?._id || subscription.userId?.id || subscription.userId ||
                      subscription.promoterId?._id || subscription.promoterId?.id || subscription.promoterId ||
                      subscription.createdBy?._id || subscription.createdBy?.id || subscription.createdBy ||
                      subscription.promoter?._id || subscription.promoter?.id;
        
        if (!userId) return null;
        
        // Check if user is promoter
        const isPromoter = subscription.promoterId || subscription.createdBy || subscription.promoter;
        if (isPromoter) {
            return `/Owner/Promoter/${userId}`;
        }
        return null; // Regular users don't have a detail page yet
    };

    return (
        <div className="admin-subscriptions-page">
            <div className="admin-subscriptions-page__wrapper">
                <div className="admin-subscriptions-header">
                    <div className="admin-subscriptions-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-subscriptions-header__back"
                            title={t('adminSubscriptions.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaCrown className="admin-subscriptions-header__icon" />
                        <div>
                            <h1 className="admin-subscriptions-header__title">{t('adminSubscriptions.title') || 'Subscriptions Management'}</h1>
                            <p className="admin-subscriptions-header__subtitle">{t('adminSubscriptions.subtitle') || 'View and manage all subscriptions'}</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="admin-subscriptions-search">
                    <input
                        type="text"
                        placeholder={t('adminSubscriptions.searchSubscriptions') || 'Search by subscriber, plan, or phone...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-subscriptions-search__input"
                    />
                </div>

                {subscriptionsLoading ? (
                    <div className="admin-subscriptions-loading">
                        <Loading />
                    </div>
                ) : filteredSubscriptions.length > 0 ? (
                    <div className="admin-subscriptions-list">
                        {filteredSubscriptions.map((subscription, index) => (
                            <motion.div
                                key={subscription._id || subscription.id || index}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="admin-subscription-item"
                                onClick={() => handleViewDetails(subscription)}
                            >
                                <div className="admin-subscription-item__header">
                                    <div className="admin-subscription-item__user-info">
                                        <FaUser className="admin-subscription-item__icon" />
                                        <div>
                                            <h3 className="admin-subscription-item__name">
                                                {subscription.subscriberName || subscription.name || '-'}
                                            </h3>
                                            <p className="admin-subscription-item__plan">
                                                {subscription.planName || subscription.plan?.name || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`admin-subscription-item__status admin-subscription-item__status--${(subscription.status || 'pending').toLowerCase()}`}>
                                        {subscription.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="admin-subscription-item__details">
                                    <div className="admin-subscription-item__detail">
                                        <FaPhone className="admin-subscription-item__detail-icon" />
                                        <span>{subscription.phone || '-'}</span>
                                    </div>
                                    <div className="admin-subscription-item__detail">
                                        <HiClock className="admin-subscription-item__detail-icon" />
                                        <span>{subscription.durationDays || subscription.days || '-'} {t('adminSubscriptions.days') || 'days'}</span>
                                    </div>
                                    <div className="admin-subscription-item__detail">
                                        <FaCalendar className="admin-subscription-item__detail-icon" />
                                        <span>{formatDate(subscription.createdAt || subscription.created)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="admin-subscriptions-empty">
                        <p>{t('adminSubscriptions.noSubscriptions') || 'No subscriptions found'}</p>
                    </div>
                )}
            </div>

            {/* Subscription Details Modal */}
            <AnimatePresence>
                {selectedSubscription && (
                    <motion.div
                        className="admin-subscription-details-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSubscription(null)}
                    >
                        <motion.div
                            className="admin-subscription-details-modal"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-subscription-details-modal__header">
                                <h2>{t('adminSubscriptions.subscriptionDetails') || 'Subscription Details'}</h2>
                                <button
                                    onClick={() => setSelectedSubscription(null)}
                                    className="admin-subscription-details-modal__close"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="admin-subscription-details-modal__body">
                                {/* User Info */}
                                <div className="admin-subscription-details-section">
                                    <h3 className="admin-subscription-details-section__title">
                                        {t('adminSubscriptions.userInfo') || 'User Information'}
                                    </h3>
                                    <div className="admin-subscription-details-row">
                                        <span className="admin-subscription-details-label">
                                            {t('adminSubscriptions.subscriberName') || 'Subscriber Name'}:
                                        </span>
                                        <span className="admin-subscription-details-value">
                                            {selectedSubscription.subscriberName || selectedSubscription.name || '-'}
                                        </span>
                                    </div>
                                    <div className="admin-subscription-details-row">
                                        <span className="admin-subscription-details-label">
                                            {t('adminSubscriptions.phone') || 'Phone'}:
                                        </span>
                                        <span className="admin-subscription-details-value">
                                            {selectedSubscription.phone || '-'}
                                        </span>
                                    </div>
                                    {getUserProfileLink(selectedSubscription) && (
                                        <div className="admin-subscription-details-row">
                                            <a
                                                href={getUserProfileLink(selectedSubscription)}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(getUserProfileLink(selectedSubscription));
                                                }}
                                                className="admin-subscription-details-link"
                                            >
                                                <FaExternalLinkAlt />
                                                {t('adminSubscriptions.viewUserProfile') || 'View User Profile'}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Plan Info */}
                                <div className="admin-subscription-details-section">
                                    <h3 className="admin-subscription-details-section__title">
                                        {t('adminSubscriptions.planInfo') || 'Plan Information'}
                                    </h3>
                                    <div className="admin-subscription-details-row">
                                        <span className="admin-subscription-details-label">
                                            {t('adminSubscriptions.planName') || 'Plan Name'}:
                                        </span>
                                        <span className="admin-subscription-details-value">
                                            {selectedSubscription.planName || selectedSubscription.plan?.name || '-'}
                                        </span>
                                    </div>
                                    <div className="admin-subscription-details-row">
                                        <span className="admin-subscription-details-label">
                                            {t('adminSubscriptions.duration') || 'Duration'}:
                                        </span>
                                        <span className="admin-subscription-details-value">
                                            {selectedSubscription.durationDays || selectedSubscription.days || '-'} {t('adminSubscriptions.days') || 'days'}
                                        </span>
                                    </div>
                                    <div className="admin-subscription-details-row">
                                        <span className="admin-subscription-details-label">
                                            {t('adminSubscriptions.status') || 'Status'}:
                                        </span>
                                        <span className={`admin-subscription-details-status admin-subscription-details-status--${(selectedSubscription.status || 'pending').toLowerCase()}`}>
                                            {selectedSubscription.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="admin-subscription-details-section">
                                    <h3 className="admin-subscription-details-section__title">
                                        {t('adminSubscriptions.paymentInfo') || 'Payment Information'}
                                    </h3>
                                    <div className="admin-subscription-details-row">
                                        <span className="admin-subscription-details-label">
                                            {t('adminSubscriptions.paymentMethod') || 'Payment Method'}:
                                        </span>
                                        <span className="admin-subscription-details-value">
                                            {selectedSubscription.paymentMethod || '-'}
                                        </span>
                                    </div>
                                    {(selectedSubscription.invoice || selectedSubscription.invoiceFile || selectedSubscription.invoiceUrl) && (
                                        <div className="admin-subscription-details-row">
                                            <span className="admin-subscription-details-label">
                                                {t('adminSubscriptions.invoice') || 'Invoice'}:
                                            </span>
                                            <a
                                                href={selectedSubscription.invoice || selectedSubscription.invoiceUrl || (selectedSubscription.invoiceFile?.url || selectedSubscription.invoiceFile)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="admin-subscription-details-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FaFileInvoice />
                                                {t('adminSubscriptions.viewInvoice') || 'View Invoice'}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Date Info */}
                                <div className="admin-subscription-details-section">
                                    <h3 className="admin-subscription-details-section__title">
                                        {t('adminSubscriptions.dateInfo') || 'Date Information'}
                                    </h3>
                                    <div className="admin-subscription-details-row">
                                        <span className="admin-subscription-details-label">
                                            {t('adminSubscriptions.createdAt') || 'Created At'}:
                                        </span>
                                        <span className="admin-subscription-details-value">
                                            {formatDate(selectedSubscription.createdAt || selectedSubscription.created)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-subscription-details-modal__actions">
                                <button
                                    onClick={() => setSelectedSubscription(null)}
                                    className="admin-subscription-details-modal__btn admin-subscription-details-modal__btn--cancel"
                                >
                                    {t('adminSubscriptions.close') || 'Close'}
                                </button>
                                {(selectedSubscription.status === 'pending' || !selectedSubscription.status) && (
                                    <button
                                        onClick={handleApproveSubscription}
                                        disabled={approveSubscriptionMutation.isLoading}
                                        className="admin-subscription-details-modal__btn admin-subscription-details-modal__btn--approve"
                                    >
                                        {approveSubscriptionMutation.isLoading 
                                            ? (t('adminSubscriptions.approving') || 'Approving...')
                                            : (t('adminSubscriptions.approve') || 'Approve Subscription')
                                        }
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
