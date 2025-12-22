import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../../services/adminService';
import { promoterService } from '../../../services/promoterService';
import { useLanguage } from '../../../context/LanguageContext';
import { FaCrown, FaTimes, FaUser, FaPhone, FaCalendar, FaFileInvoice, FaEye, FaExternalLinkAlt } from 'react-icons/fa';
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
            } catch {
                return [];
            }
        },
        {
            enabled: !!token,
            retry: false
        }
    );

    const [enrichedSubscription, setEnrichedSubscription] = useState(null);

    useEffect(() => {
        if (selectedSubscription) {
            // Try to fetch user data if email is missing and we have a userId
            const userId = selectedSubscription.userId?._id || 
                          selectedSubscription.userId?.id || 
                          selectedSubscription.userId ||
                          selectedSubscription.promoterId?._id ||
                          selectedSubscription.promoterId?.id ||
                          selectedSubscription.promoterId;

            if (userId && !selectedSubscription.email && !selectedSubscription.userId?.email) {
                // Fetch user data to get email
                adminService.getAllUsers(token)
                    .then(response => {
                        const users = response?.users || response?.data?.users || response || [];
                        const user = users.find(u => 
                            (u._id || u.id) === userId || 
                            String(u._id || u.id) === String(userId)
                        );
                        if (user) {
                            setEnrichedSubscription({
                                ...selectedSubscription,
                                email: user.email || selectedSubscription.email,
                                userId: {
                                    ...selectedSubscription.userId,
                                    email: user.email
                                }
                            });
                        } else {
                            setEnrichedSubscription(selectedSubscription);
                        }
                    })
                    .catch(() => {
                        setEnrichedSubscription(selectedSubscription);
                    });
            } else {
                setEnrichedSubscription(selectedSubscription);
            }
        } else {
            setEnrichedSubscription(null);
        }
    }, [selectedSubscription, token]);

    // Filter subscriptions - exclude premium users/promoters
    const filteredSubscriptions = useMemo(() => {
        if (!subscriptionsData) return [];
        
        return subscriptionsData.filter((sub) => {
            // Check if user/promoter has premium status (isBrimume: true)
            // Check multiple possible locations for premium status
            const isPremium = sub.isBrimume === true || sub.isBrimume === "true" ||
                            sub.userId?.isBrimume === true || sub.userId?.isBrimume === "true" ||
                            sub.createdBy?.isBrimume === true || sub.createdBy?.isBrimume === "true" ||
                            sub.promoterId?.isBrimume === true || sub.promoterId?.isBrimume === "true" ||
                            sub.promoter?.isBrimume === true || sub.promoter?.isBrimume === "true" ||
                            sub.user?.isBrimume === true || sub.user?.isBrimume === "true" ||
                            sub.subscriberId?.isBrimume === true || sub.subscriberId?.isBrimume === "true" ||
                            sub.subscriber?.isBrimume === true || sub.subscriber?.isBrimume === "true";
            
            // Filter out premium users/promoters
            if (isPremium) {
                return false;
            }
            
            // Apply search filter
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

    // Check if user is a promoter by watchingplan or Downloadsplan
    const isPromoter = (user) => {
        if (!user) return false;
        const watchingPlan = user.watchingplan === true || user.watchingplan === "true";
        const downloadsPlan = user.Downloadsplan === true || user.Downloadsplan === "true";
        return watchingPlan || downloadsPlan;
    };

    // Navigate to user or promoter page
    const handleNavigateToUser = async (subscription) => {
        if (!subscription) return;

        let userId = getUserIdFromSubscription(subscription);
        let userEmail = subscription.email || subscription.userId?.email || subscription.createdBy?.email;
        let searchValue = userEmail || subscription.phone || userId;
        let foundUser = null;
        let foundPromoter = null;
        
        // First, check if subscription data itself indicates promoter status
        const subscriptionUser = subscription.userId || subscription.createdBy || subscription.promoter || subscription.user;
        if (subscriptionUser && isPromoter(subscriptionUser)) {
            userId = subscriptionUser._id || subscriptionUser.id || userId;
            if (userId) {
                navigate(`/Owner/AllPromoters?search=${encodeURIComponent(searchValue || userId)}`);
                return;
            }
        }

        // If we have userId, check promoters first, then users
        if (userId) {
            try {
                // Check promoters first
                const promotersResponse = await promoterService.getAllPromoters(token);
                const promoters = Array.isArray(promotersResponse) 
                    ? promotersResponse 
                    : (promotersResponse?.promoters || promotersResponse?.data?.promoters || []);
                
                foundPromoter = promoters.find(p => 
                    String(p._id || p.id) === String(userId)
                );

                if (foundPromoter) {
                    navigate(`/Owner/AllPromoters?search=${encodeURIComponent(searchValue || userId)}`);
                    return;
                }

                // If not found in promoters, check users
                const usersResponse = await adminService.getAllUsers(token);
                const users = Array.isArray(usersResponse) 
                    ? usersResponse 
                    : (usersResponse?.users || usersResponse?.data?.users || []);
                
                foundUser = users.find(u => 
                    String(u._id || u.id) === String(userId)
                );

                if (foundUser) {
                    navigate(`/Owner/Users?search=${encodeURIComponent(searchValue || userId)}`);
                    return;
                }
            } catch (error) {
                console.error('Error checking user/promoter:', error);
            }
        }

        // If no user ID or user not found, try to find by email or phone
        if (!userId || (!foundUser && !foundPromoter)) {
            if (userEmail) {
                try {
                    // Check promoters first by searching
                    const promotersResponse = await promoterService.getAllPromoters(token);
                    const promoters = Array.isArray(promotersResponse) 
                        ? promotersResponse 
                        : (promotersResponse?.promoters || promotersResponse?.data?.promoters || []);
                    
                    foundPromoter = promoters.find(p => 
                        (p.email && p.email.toLowerCase() === userEmail.toLowerCase()) ||
                        (p.username && p.username.toLowerCase() === userEmail.toLowerCase())
                    );

                    if (foundPromoter) {
                        navigate(`/Owner/AllPromoters?search=${encodeURIComponent(userEmail)}`);
                        return;
                    }

                    // If not found in promoters, check users
                    const result = await adminService.searchUser(userEmail, token);
                    foundUser = result?.user || result;
                    userId = foundUser?._id || foundUser?.id || userId;
                    
                    if (foundUser) {
                        navigate(`/Owner/Users?search=${encodeURIComponent(userEmail)}`);
                        return;
                    }
                } catch (error) {
                    console.error('Error searching by email:', error);
                    // If search fails, try phone
                    if (subscription.phone) {
                        userId = await findUserByPhone(subscription.phone);
                        if (userId) {
                            // Check promoters first
                            try {
                                const promotersResponse = await promoterService.getAllPromoters(token);
                                const promoters = Array.isArray(promotersResponse) 
                                    ? promotersResponse 
                                    : (promotersResponse?.promoters || promotersResponse?.data?.promoters || []);
                                
                                foundPromoter = promoters.find(p => 
                                    String(p._id || p.id) === String(userId)
                                );

                                if (foundPromoter) {
                                    navigate(`/Owner/AllPromoters?search=${encodeURIComponent(subscription.phone)}`);
                                    return;
                                }

                                // Check users
                                const usersResponse = await adminService.getAllUsers(token);
                                const users = Array.isArray(usersResponse) 
                                    ? usersResponse 
                                    : (usersResponse?.users || usersResponse?.data?.users || []);
                                
                                foundUser = users.find(u => 
                                    String(u._id || u.id) === String(userId)
                                );

                                if (foundUser) {
                                    navigate(`/Owner/Users?search=${encodeURIComponent(subscription.phone)}`);
                                    return;
                                }
                            } catch {
                                // Fall through to error
                            }
                        }
                    }
                }
            } else if (subscription.phone) {
                userId = await findUserByPhone(subscription.phone);
                if (userId) {
                    // Check promoters first
                    try {
                        const promotersResponse = await promoterService.getAllPromoters(token);
                        const promoters = Array.isArray(promotersResponse) 
                            ? promotersResponse 
                            : (promotersResponse?.promoters || promotersResponse?.data?.promoters || []);
                        
                        foundPromoter = promoters.find(p => 
                            String(p._id || p.id) === String(userId)
                        );

                        if (foundPromoter) {
                            navigate(`/Owner/AllPromoters?search=${encodeURIComponent(subscription.phone)}`);
                            return;
                        }

                        // Check users
                        const usersResponse = await adminService.getAllUsers(token);
                        const users = Array.isArray(usersResponse) 
                            ? usersResponse 
                            : (usersResponse?.users || usersResponse?.data?.users || []);
                        
                        foundUser = users.find(u => 
                            String(u._id || u.id) === String(userId)
                        );

                        if (foundUser) {
                            navigate(`/Owner/Users?search=${encodeURIComponent(subscription.phone)}`);
                            return;
                        }
                    } catch {
                        // Fall through to error
                    }
                }
            }
        }

        if (!userId || (!foundUser && !foundPromoter)) {
            toast.error(
                t('adminSubscriptions.userNotFound') || 
                'User not found. Cannot navigate to user page.',
                ToastOptions("error")
            );
            return;
        }

        // Final check - if we found a promoter, go to promoters page
        if (foundPromoter) {
            navigate(`/Owner/AllPromoters?search=${encodeURIComponent(searchValue || userId)}`);
        } else if (foundUser) {
            navigate(`/Owner/Users?search=${encodeURIComponent(searchValue || userId)}`);
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
                const normalizedPhone = phone.replace(/[\s\-()]/g, '');
                const normalizedUserPhone = userPhone.replace(/[\s\-()]/g, '');
                return normalizedUserPhone === normalizedPhone || 
                       normalizedUserPhone.endsWith(normalizedPhone) ||
                       normalizedPhone.endsWith(normalizedUserPhone);
            });
            
            if (user) {
                return user._id || user.id || null;
            }
            return null;
        } catch {
            return null;
        }
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
                                        <th scope="col" className="px-6 py-3">{t("adminSubscriptions.premiumStatus") || "Premium Status"}</th>
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
                                                <button
                                                    onClick={() => handleNavigateToUser(subscription)}
                                                    className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                                    title={t("adminSubscriptions.goToUser") || "Go to User/Promoter Page"}
                                                >
                                                    <span>{subscription.subscriberName || subscription.name || '-'}</span>
                                                    <FaExternalLinkAlt size={12} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label={t("adminSubscriptions.phone") || "Phone"}>
                                            <div className="flex items-center gap-2">
                                                <FaPhone className="text-gray-400" size={14} />
                                                <button
                                                    onClick={() => handleNavigateToUser(subscription)}
                                                    className="text-gray-600 hover:text-indigo-600 hover:underline flex items-center gap-1"
                                                    title={t("adminSubscriptions.goToUser") || "Go to User/Promoter Page"}
                                                >
                                                    <span>{subscription.phone || '-'}</span>
                                                    <FaExternalLinkAlt size={12} />
                                                </button>
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
                                        <td className="px-6 py-4" data-label={t("adminSubscriptions.premiumStatus") || "Premium Status"}>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${subscription.isBrimume || subscription.userId?.isBrimume || subscription.createdBy?.isBrimume ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {subscription.isBrimume || subscription.userId?.isBrimume || subscription.createdBy?.isBrimume ? 'true' : 'false'}
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
                                {(() => {
                                    const subscription = enrichedSubscription || selectedSubscription;
                                    return (
                                        <>
                                            {/* User Info */}
                                            <div className="admin-subscription-details-section">
                                                <h3 className="admin-subscription-details-section__title">
                                                    {t('adminSubscriptions.userInfo') || 'User Information'}
                                                </h3>
                                                <div className="admin-subscription-details-row">
                                                    <span className="admin-subscription-details-label">
                                                        {t('adminSubscriptions.id') || 'ID'}:
                                                    </span>
                                                    <span className="admin-subscription-details-value">
                                                        {subscription.id || subscription._id || '-'}
                                                    </span>
                                                </div>
                                                <div className="admin-subscription-details-row">
                                                    <span className="admin-subscription-details-label">
                                                        {t('adminSubscriptions.phone') || 'Phone'}:
                                                    </span>
                                                    <span className="admin-subscription-details-value">
                                                        {subscription.phone || '-'}
                                                    </span>
                                                </div>
                                                <div className="admin-subscription-details-row">
                                                    <span className="admin-subscription-details-label">
                                                        {t('adminSubscriptions.createdBy') || 'Created By'}: {t('adminSubscriptions.name') || 'Name'}
                                                    </span>
                                                    <span className="admin-subscription-details-value">
                                                        {subscription.createdBy 
                                                            ? (typeof subscription.createdBy === 'object' 
                                                                ? (subscription.createdBy.name || 
                                                                   subscription.createdBy.username || 
                                                                   subscription.createdBy._id || 
                                                                   subscription.createdBy.id ||
                                                                   '-')
                                                                : String(subscription.createdBy))
                                                            : '-'}
                                                    </span>
                                                </div>
                                                {subscription.createdBy && typeof subscription.createdBy === 'object' && subscription.createdBy.email && (
                                                    <div className="admin-subscription-details-row">
                                                        <span className="admin-subscription-details-label">
                                                            {t('adminSubscriptions.createdBy') || 'Created By'}: {t('adminSubscriptions.email') || 'Email'}
                                                        </span>
                                                        <span className="admin-subscription-details-value">
                                                            {subscription.createdBy.email}
                                                        </span>
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
                                                        {subscription.planName || subscription.plan?.name || '-'}
                                                    </span>
                                                </div>
                                                <div className="admin-subscription-details-row">
                                                    <span className="admin-subscription-details-label">
                                                        {t('adminSubscriptions.duration') || 'Duration'}:
                                                    </span>
                                                    <span className="admin-subscription-details-value">
                                                        {subscription.durationDays || subscription.days || '-'} {t('adminSubscriptions.days') || 'days'}
                                                    </span>
                                                </div>
                                                <div className="admin-subscription-details-row">
                                                    <span className="admin-subscription-details-label">
                                                        {t('adminSubscriptions.premiumStatus') || 'Premium Status'}:
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${subscription.isBrimume || subscription.userId?.isBrimume || subscription.createdBy?.isBrimume ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {subscription.isBrimume || subscription.userId?.isBrimume || subscription.createdBy?.isBrimume ? 'true' : 'false'}
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
                                                    <span className="admin-subscription-details-value" data-field="paymentMethod">
                                                        {subscription.paymentMethod || 
                                                         subscription.payment?.method ||
                                                         subscription.paymentType ||
                                                         subscription.paymentDetails?.method ||
                                                         '-'}
                                                    </span>
                                                </div>
                                                {(subscription.invoicePic || subscription.invoice || subscription.invoiceFile || subscription.invoiceUrl) && (
                                                    <div className="admin-subscription-details-row">
                                                        <span className="admin-subscription-details-label">
                                                            {t('adminSubscriptions.invoice') || 'Invoice'}:
                                                        </span>
                                                        <a
                                                            href={subscription.invoicePic || 
                                                                  subscription.invoice || 
                                                                  subscription.invoiceUrl || 
                                                                  (subscription.invoiceFile?.url || subscription.invoiceFile)}
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
                                                        {t('adminSubscriptions.startDate') || 'Start Date'}:
                                                    </span>
                                                    <span className="admin-subscription-details-value">
                                                        {subscription.startDate ? formatDate(subscription.startDate) : '-'}
                                                    </span>
                                                </div>
                                                <div className="admin-subscription-details-row">
                                                    <span className="admin-subscription-details-label">
                                                        {t('adminSubscriptions.endDate') || 'End Date'}:
                                                    </span>
                                                    <span className="admin-subscription-details-value">
                                                        {subscription.endDate ? formatDate(subscription.endDate) : '-'}
                                                    </span>
                                                </div>
                                                <div className="admin-subscription-details-row">
                                                    <span className="admin-subscription-details-label">
                                                        {t('adminSubscriptions.createdAt') || 'Created At'}:
                                                    </span>
                                                    <span className="admin-subscription-details-value">
                                                        {formatDate(subscription.createdAt || subscription.created)}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="admin-subscription-details-modal__actions">
                                <button
                                    onClick={() => setSelectedSubscription(null)}
                                    className="admin-subscription-details-modal__btn admin-subscription-details-modal__btn--cancel"
                                >
                                    {t('adminSubscriptions.close') || 'Close'}
                                </button>
                                <button
                                    onClick={() => {
                                        handleNavigateToUser(enrichedSubscription || selectedSubscription);
                                        setSelectedSubscription(null);
                                    }}
                                    className="admin-subscription-details-modal__btn admin-subscription-details-modal__btn--approve"
                                >
                                    <FaExternalLinkAlt className="mr-2" />
                                    {t('adminSubscriptions.goToUser') || 'Go to User/Promoter'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
