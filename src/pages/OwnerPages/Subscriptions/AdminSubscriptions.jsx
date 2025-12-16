import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaTimes, FaUser, FaPhone, FaCalendar, FaFileInvoice, FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft, HiCurrencyDollar, HiClock } from 'react-icons/hi2';
import { FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import Loading from '../../../components/Loading/Loading';
import Pagination from '../../../components/Pagination/Pagination';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import './Subscriptions.scss';

export default function AdminSubscriptions() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
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

    const [isApproving, setIsApproving] = useState(false);

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

    // Pagination logic
    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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

    const handleApproveSubscription = async (subscription = null) => {
        const subToApprove = subscription || selectedSubscription;
        if (!subToApprove) return;

        setIsApproving(true);
        try {
            // Activate premium using toggleBrimumeByOwner
            await handleSetPremium(subToApprove);
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries('allSubscriptions');
            
            toast.success(t('adminSubscriptions.subscriptionApprovedAndPremium') || 'Subscription approved and premium activated successfully!', ToastOptions("success"));
            setSelectedSubscription(null);
        } catch (error) {
            toast.error(error.message || t('adminSubscriptions.approveFailed') || 'Failed to approve subscription', ToastOptions("error"));
        } finally {
            setIsApproving(false);
        }
    };

    // Get user ID from subscription
    const getUserIdFromSubscription = (subscription) => {
        if (!subscription) return null;
        
        // Try to extract ID from various possible locations
        // Check direct ID fields first
        let userId = subscription.userId?._id || subscription.userId?.id || subscription.userId ||
                     subscription.promoterId?._id || subscription.promoterId?.id || subscription.promoterId ||
                     subscription.createdBy?._id || subscription.createdBy?.id || subscription.createdBy ||
                     subscription.promoter?._id || subscription.promoter?.id || subscription.promoter ||
                     subscription.user?._id || subscription.user?.id || subscription.user ||
                     subscription.subscriber?._id || subscription.subscriber?.id || subscription.subscriber ||
                     subscription.subscriberId?._id || subscription.subscriberId?.id || subscription.subscriberId;
        
        // If still not found, check if subscription itself has an _id that might be the user ID
        // (though this is less likely, it's a fallback)
        if (!userId && subscription._id) {
            // Only use subscription._id if it's clearly a user ID (not a subscription ID)
            // This is a last resort and might not be correct
        }
        
        // Ensure we return a string, not an object
        if (!userId) return null;
        
        // If userId is an object, try to extract _id or id from it
        if (typeof userId === 'object' && userId !== null) {
            const extractedId = userId._id || userId.id;
            if (extractedId) {
                return String(extractedId);
            }
            return null;
        }
        
        // Convert to string to ensure it's not an ObjectId or other type
        return String(userId);
    };

    // Find user by phone number
    const findUserByPhone = async (phone) => {
        if (!phone) return null;
        
        try {
            const response = await adminService.getAllUsers(token);
            const users = response?.users || response?.data?.users || response || [];
            
            // Search for user by phone number
            const user = users.find(u => {
                const userPhone = u.phone || u.phoneNumber || '';
                // Remove any formatting (spaces, dashes, etc.) for comparison
                const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
                const normalizedUserPhone = userPhone.replace(/[\s\-\(\)]/g, '');
                return normalizedUserPhone === normalizedPhone || 
                       normalizedUserPhone.endsWith(normalizedPhone) ||
                       normalizedPhone.endsWith(normalizedUserPhone);
            });
            
            if (user) {
                return user._id || user.id || null;
            }
            return null;
        } catch (error) {
            console.error('Error searching for user by phone:', error);
            return null;
        }
    };

    // Set premium for user/promoter
    const handleSetPremium = async (subscription) => {
        if (!subscription) return;
        
        let userId = getUserIdFromSubscription(subscription);
        
        // If user ID not found, try to find user by phone number
        if (!userId && subscription.phone) {
            userId = await findUserByPhone(subscription.phone);
        }
        
        if (!userId) {
            // Log subscription structure for debugging
            console.warn('User ID not found in subscription:', subscription);
            toast.warning(
                t('adminSubscriptions.userNotFound') || 
                `User ID not found for subscriber "${subscription.subscriberName || subscription.phone}". Premium not activated.`, 
                ToastOptions("warning")
            );
            return;
        }

        try {
            const durationDays = subscription.durationDays || subscription.days || 30;
            // Ensure userId is a string before passing to API
            await adminService.toggleBrimumeByOwner(String(userId), true, durationDays, token);
            queryClient.invalidateQueries("getAllusers");
            queryClient.invalidateQueries("getAllPromoters");
            toast.success(t('adminSubscriptions.premiumActivated') || 'Premium activated successfully!', ToastOptions("success"));
        } catch (error) {
            toast.error(error.message || t('adminSubscriptions.premiumActivationFailed') || 'Failed to activate premium', ToastOptions("error"));
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
                    <div className="admin-subscriptions-search__wrapper">
                        <FiSearch className="admin-subscriptions-search__icon" />
                        <input
                            type="text"
                            placeholder={t('adminSubscriptions.searchSubscriptions') || 'Search by subscriber, plan, or phone...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-subscriptions-search__input"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="admin-subscriptions-search__clear"
                                title={t('adminSubscriptions.clearSearch') || 'Clear search'}
                            >
                                <FiX />
                            </button>
                        )}
                    </div>
                </div>

                {subscriptionsLoading ? (
                    <div className="admin-subscriptions-loading">
                        <Loading />
                    </div>
                ) : filteredSubscriptions.length > 0 ? (
                    <>
                        <div className="admin-subscriptions-table-wrapper">
                            <table className="admin-users-table">
                                <thead className="admin-users-table__header">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t("adminSubscriptions.subscriberName") || "Subscriber"}</th>
                                        <th scope="col" className="px-6 py-3">{t("adminSubscriptions.phone") || "Phone"}</th>
                                        <th scope="col" className="px-6 py-3">{t("adminSubscriptions.planName") || "Plan"}</th>
                                        <th scope="col" className="px-6 py-3">{t("adminSubscriptions.duration") || "Duration"}</th>
                                        <th scope="col" className="px-6 py-3">{t("adminSubscriptions.status") || "Status"}</th>
                                        <th scope="col" className="px-6 py-3">{t("adminSubscriptions.createdAt") || "Created At"}</th>
                                        <th scope="col" className="px-6 py-3">{t("adminSubscriptions.actions") || "Actions"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSubscriptions.map((subscription, index) => (
                                    <tr 
                                        key={subscription._id || subscription.id || index}
                                        className="bg-white border-b hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" data-label={t("adminSubscriptions.subscriberName") || "Subscriber"}>
                                            <div className="flex items-center gap-2">
                                                <FaUser className="text-indigo-600" size={16} />
                                                <span>{subscription.subscriberName || subscription.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label={t("adminSubscriptions.phone") || "Phone"}>
                                            <div className="flex items-center gap-2">
                                                <FaPhone className="text-gray-400" size={14} />
                                                <span>{subscription.phone || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label={t("adminSubscriptions.planName") || "Plan"}>
                                            <span className="font-medium text-indigo-600">
                                                {subscription.planName || subscription.plan?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" data-label={t("adminSubscriptions.duration") || "Duration"}>
                                            <div className="flex items-center gap-2">
                                                <HiClock className="text-gray-400" size={14} />
                                                <span>{subscription.durationDays || subscription.days || '-'} {t('adminSubscriptions.days') || 'days'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label={t("adminSubscriptions.status") || "Status"}>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium admin-subscription-status admin-subscription-status--${(subscription.status || 'pending').toLowerCase()}`}>
                                                {subscription.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" data-label={t("adminSubscriptions.createdAt") || "Created At"}>
                                            <div className="flex items-center gap-2">
                                                <FaCalendar className="text-gray-400" size={14} />
                                                <span>{formatDate(subscription.createdAt || subscription.created)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label={t("adminSubscriptions.actions") || "Actions"}>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleViewDetails(subscription)}
                                                    className="action-buttons__view-btn"
                                                    title={t("adminSubscriptions.viewDetails") || "View Details"}
                                                >
                                                    <FaEye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            showCount={true}
                            startIndex={startIndex}
                            endIndex={Math.min(endIndex, filteredSubscriptions.length)}
                            totalItems={filteredSubscriptions.length}
                            itemsLabel={t('adminSubscriptions.subscriptions') || 'subscriptions'}
                        />
                    </>
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
                                        onClick={() => handleApproveSubscription(selectedSubscription)}
                                        disabled={isApproving}
                                        className="admin-subscription-details-modal__btn admin-subscription-details-modal__btn--approve"
                                    >
                                        {isApproving 
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
