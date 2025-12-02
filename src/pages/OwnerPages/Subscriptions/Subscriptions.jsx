import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import Pagination from '../../../components/Pagination/Pagination';
import { FaCrown, FaEye, FaPlus } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import './Subscriptions.scss';

export default function Subscriptions() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        invoice: null,
        phone: '',
        subscriberName: '',
        durationDays: '',
        planName: ''
    });
    const [isCreating, setIsCreating] = useState(false);
    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    // Fetch all subscriptions
    const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery(
        ['allSubscriptions'],
        async () => {
            try {
                const response = await adminService.getAllSubscriptions(token);
                // Handle different response structures
                if (response.subscriptions) {
                    return response;
                } else if (Array.isArray(response)) {
                    return { subscriptions: response };
                } else if (response.data) {
                    return { subscriptions: response.data };
                }
                return { subscriptions: [] };
            } catch {
                // Return empty array on error instead of mock data
                return { subscriptions: [] };
            }
        },
        { 
            enabled: !!token
        }
    );

    // Fetch plans for dropdown
    const { data: plansData } = useQuery(
        ['plans'],
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
        }
    );

    // Handle create subscription
    const handleCreateSubscription = async (e) => {
        e.preventDefault();
        if (!createFormData.phone || !createFormData.subscriberName || !createFormData.durationDays || !createFormData.planName) {
            toast.error(t('adminSubscriptions.fillAllFields') || "Please fill all required fields", ToastOptions("error"));
            return;
        }

        setIsCreating(true);
        try {
            await adminService.createSubscription(
                createFormData.invoice,
                createFormData.phone,
                createFormData.subscriberName,
                createFormData.durationDays,
                createFormData.planName,
                token
            );
            setShowCreateModal(false);
            setCreateFormData({
                invoice: null,
                phone: '',
                subscriberName: '',
                durationDays: '',
                planName: ''
            });
            queryClient.invalidateQueries('allSubscriptions');
        } catch {
            // Error is handled by service
        } finally {
            setIsCreating(false);
        }
    };

    // Helper function to parse date from "MM/DD/YYYY" format
    const parseDate = React.useCallback((dateString) => {
        if (!dateString) return null;
        if (dateString instanceof Date) return dateString;
        // Handle "MM/DD/YYYY" format
        const parts = dateString.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[0] - 1, parts[1]);
        }
        return new Date(dateString);
    }, []);

    // Helper function to calculate subscription status
    const getSubscriptionStatus = React.useCallback((endDate) => {
        if (!endDate) return 'expired';
        const end = parseDate(endDate);
        if (!end || isNaN(end.getTime())) return 'expired';
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return end >= now ? 'active' : 'expired';
    }, [parseDate]);

    // Filter subscriptions based on search and filters
    const filteredSubscriptions = useMemo(() => {
        if (!subscriptionsData?.subscriptions) return [];

        return subscriptionsData.subscriptions.map(subscription => ({
            ...subscription,
            status: getSubscriptionStatus(subscription.endDate)
        })).filter((subscription) => {
            // Search filter
            if (searchTerm) {
                const userInfo = subscription.createdBy
                    ? `${subscription.createdBy.name || ''} ${subscription.createdBy.email || ''}`
                    : subscription.subscriberName || '';
                const searchLower = searchTerm.toLowerCase();
                const planNameStr = (subscription.planName || '').toLowerCase();
                const subscriberNameStr = (subscription.subscriberName || '').toLowerCase();
                const phoneStr = (subscription.phone || '').toLowerCase();
                
                if (!userInfo.toLowerCase().includes(searchLower) &&
                    !planNameStr.includes(searchLower) &&
                    !subscriberNameStr.includes(searchLower) &&
                    !phoneStr.includes(searchLower)) {
                    return false;
                }
            }

            // Status filter
            if (filters.status && subscription.status !== filters.status) {
                return false;
            }

            // Plan type filter
            if (filters.planType && subscription.planName !== filters.planType) {
                return false;
            }

            return true;
        });
    }, [subscriptionsData?.subscriptions, searchTerm, filters, getSubscriptionStatus]);

    // Pagination logic
    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Get unique plan names for filter
    const planNames = useMemo(() => {
        if (!subscriptionsData?.subscriptions) return [];
        const plans = new Set();
        subscriptionsData.subscriptions.forEach(sub => {
            if (sub.planName) plans.add(sub.planName);
        });
        return Array.from(plans).map(plan => ({
            value: plan,
            label: plan
        }));
    }, [subscriptionsData?.subscriptions]);

    // Filter configuration
    const filterConfig = [
        {
            key: 'status',
            label: t('adminAnalytics.status'),
            allLabel: t('searchFilter.all'),
            options: [
                { value: 'active', label: t('adminSubscriptions.active') },
                { value: 'expired', label: t('adminSubscriptions.expired') }
            ]
        },
        ...(planNames.length > 0 ? [{
            key: 'planType',
            label: t('adminSubscriptions.planType'),
            allLabel: t('searchFilter.all'),
            options: planNames
        }] : [])
    ];


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
                            <h1 className="admin-subscriptions-header__title">{t('adminSubscriptions.title')}</h1>
                            <p className="admin-subscriptions-header__subtitle">{t('adminSubscriptions.subtitle')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="admin-subscriptions-header__create-btn"
                        title={t('adminSubscriptions.createSubscription')}
                    >
                        <FaPlus size={16} />
                        {t('adminSubscriptions.createSubscription')}
                    </button>
                </div>

                {subscriptionsLoading ? (
                    <div className="admin-subscriptions-loading">
                        <p>{t('adminSubscriptions.loading')}</p>
                    </div>
                ) : subscriptionsData?.subscriptions?.length > 0 ? (
                    <>
                        <SearchFilter
                            searchPlaceholder={t('adminSubscriptions.searchSubscriptions')}
                            filters={filterConfig}
                            onSearchChange={setSearchTerm}
                            onFilterChange={setFilters}
                        />

                        <div className="admin-subscriptions-table-wrapper">
                            <table className="admin-users-table">
                                <thead className="admin-users-table__header">
                                    <tr>
                                        <th scope="col">{t('adminSubscriptions.user')}</th>
                                        <th scope="col">{t('adminSubscriptions.planType')}</th>
                                        <th scope="col">{t('adminSubscriptions.startDate')}</th>
                                        <th scope="col">{t('adminSubscriptions.endDate')}</th>
                                        <th scope="col">{t('adminSubscriptions.status')}</th>
                                        <th scope="col">{t('adminSubscriptions.amount')}</th>
                                        <th scope="col">{t('adminSubscriptions.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSubscriptions.length > 0 ? (
                                        paginatedSubscriptions.map((subscription, index) => {
                                            const startDate = parseDate(subscription.startDate);
                                            const endDate = parseDate(subscription.endDate);
                                            const userDisplay = subscription.createdBy
                                                ? (subscription.createdBy.name || subscription.createdBy.email || '-')
                                                : subscription.subscriberName || '-';
                                            
                                            return (
                                                <tr key={subscription.id || subscription._id || index}>
                                                    <td data-label={t('adminSubscriptions.user')}>
                                                        {userDisplay}
                                                    </td>
                                                    <td data-label={t('adminSubscriptions.planType')}>
                                                        <span className="subscription-plan-badge">
                                                            {subscription.planName || '-'}
                                                        </span>
                                                    </td>
                                                    <td data-label={t('adminSubscriptions.startDate')}>
                                                        {startDate && !isNaN(startDate.getTime())
                                                            ? format(startDate, 'PPP')
                                                            : subscription.startDate || '-'}
                                                    </td>
                                                    <td data-label={t('adminSubscriptions.endDate')}>
                                                        {endDate && !isNaN(endDate.getTime())
                                                            ? format(endDate, 'PPP')
                                                            : subscription.endDate || '-'}
                                                    </td>
                                                    <td data-label={t('adminSubscriptions.status')}>
                                                        <span className={`status-badge status-${subscription.status || 'expired'}`}>
                                                            {subscription.status === 'active'
                                                                ? t('adminSubscriptions.active')
                                                                : t('adminSubscriptions.expired')}
                                                        </span>
                                                    </td>
                                                    <td data-label={t('adminSubscriptions.amount')}>
                                                        {subscription.amount || '-'} {subscription.currency || '-'}
                                                    </td>
                                                    <td data-label={t('adminSubscriptions.actions')}>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="admin-subscriptions-actions__btn admin-subscriptions-actions__btn--view"
                                                                onClick={() => setSelectedSubscription(subscription)}
                                                                title={t('adminSubscriptions.viewDetails')}
                                                            >
                                                                <FaEye size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                            </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-8 text-gray-500">
                                                {t('adminSubscriptions.noSubscriptionsFound')}
                                            </td>
                                        </tr>
                                    )}
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
                            itemsLabel={t('adminSubscriptions.subscriptions')}
                        />
                    </>
                ) : (
                    <div className="admin-subscriptions-empty">
                        <p>{t('adminSubscriptions.noSubscriptions')}</p>
                    </div>
                )}
            </div>

            {/* Subscription Details Modal */}
            {selectedSubscription && (
                <div
                    className="admin-subscription-modal-backdrop"
                    onClick={() => setSelectedSubscription(null)}
                >
                    <div
                        className="admin-subscription-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-subscription-modal__header">
                            <h2>{t('adminSubscriptions.subscriptionDetails')}</h2>
                            <button
                                onClick={() => setSelectedSubscription(null)}
                                className="admin-subscription-modal__close"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-subscription-modal__body">
                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.subscriberName')}:</strong>
                                <span>
                                    {selectedSubscription.subscriberName || '-'}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.phone')}:</strong>
                                <span>
                                    {selectedSubscription.phone || '-'}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.user')}:</strong>
                                <span>
                                    {selectedSubscription.createdBy
                                        ? (selectedSubscription.createdBy.name || selectedSubscription.createdBy.email || '-')
                                        : '-'}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.planType')}:</strong>
                                <span className="subscription-plan-badge">
                                    {selectedSubscription.planName || '-'}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.durationDays')}:</strong>
                                <span>
                                    {selectedSubscription.durationDays || '-'} {t('adminSubscriptions.days')}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.startDate')}:</strong>
                                <span>
                                    {(() => {
                                        const startDate = parseDate(selectedSubscription.startDate);
                                        return startDate && !isNaN(startDate.getTime())
                                            ? format(startDate, 'PPPpp')
                                            : selectedSubscription.startDate || '-';
                                    })()}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.endDate')}:</strong>
                                <span>
                                    {(() => {
                                        const endDate = parseDate(selectedSubscription.endDate);
                                        return endDate && !isNaN(endDate.getTime())
                                            ? format(endDate, 'PPPpp')
                                            : selectedSubscription.endDate || '-';
                                    })()}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.status')}:</strong>
                                <span className={`status-badge status-${selectedSubscription.status || 'expired'}`}>
                                    {selectedSubscription.status === 'active'
                                        ? t('adminSubscriptions.active')
                                        : t('adminSubscriptions.expired')}
                                </span>
                            </div>

                            {selectedSubscription.invoicePic && (
                                <div className="admin-subscription-modal__row admin-subscription-modal__row--full">
                                    <strong>{t('adminSubscriptions.invoice')}:</strong>
                                    <div>
                                        <img 
                                            src={selectedSubscription.invoicePic} 
                                            alt="Invoice" 
                                            style={{ maxWidth: '100%', height: 'auto', marginTop: '0.5rem', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.createdAt')}:</strong>
                                <span>
                                    {(() => {
                                        const createdAt = parseDate(selectedSubscription.createdAt);
                                        return createdAt && !isNaN(createdAt.getTime())
                                            ? format(createdAt, 'PPPpp')
                                            : selectedSubscription.createdAt || '-';
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Subscription Modal */}
            {showCreateModal && (
                <div
                    className="admin-subscription-modal-backdrop"
                    onClick={() => !isCreating && setShowCreateModal(false)}
                >
                    <div
                        className="admin-subscription-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-subscription-modal__header">
                            <h2>{t('adminSubscriptions.createSubscription')}</h2>
                            <button
                                onClick={() => !isCreating && setShowCreateModal(false)}
                                className="admin-subscription-modal__close"
                                aria-label={t('adminSubscriptions.cancel')}
                                disabled={isCreating}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubscription} className="admin-subscription-modal__body">
                            <div className="form-group">
                                <label htmlFor="subscriberName">
                                    {t('adminSubscriptions.subscriberName')} *
                                </label>
                                <input
                                    id="subscriberName"
                                    type="text"
                                    value={createFormData.subscriberName}
                                    onChange={(e) => setCreateFormData({ ...createFormData, subscriberName: e.target.value })}
                                    required
                                    disabled={isCreating}
                                    placeholder={t('adminSubscriptions.subscriberName')}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    {t('adminSubscriptions.phone')} *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={createFormData.phone}
                                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                                    required
                                    disabled={isCreating}
                                    placeholder={t('adminSubscriptions.phone')}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="planName">
                                    {t('adminSubscriptions.planName')} *
                                </label>
                                <select
                                    id="planName"
                                    value={createFormData.planName}
                                    onChange={(e) => setCreateFormData({ ...createFormData, planName: e.target.value })}
                                    required
                                    disabled={isCreating}
                                >
                                    <option value="">{t('adminSubscriptions.selectPlan')}</option>
                                    {plansData?.plans?.map((plan) => (
                                        <option key={plan._id || plan.id} value={plan.name}>
                                            {plan.name} ({plan.days} {t('adminSubscriptions.days')} - {plan.price} {plan.currency || 'USD'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="durationDays">
                                    {t('adminSubscriptions.durationDays')} *
                                </label>
                                <input
                                    id="durationDays"
                                    type="number"
                                    min="1"
                                    value={createFormData.durationDays}
                                    onChange={(e) => setCreateFormData({ ...createFormData, durationDays: e.target.value })}
                                    required
                                    disabled={isCreating}
                                    placeholder="30"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="invoice">
                                    {t('adminSubscriptions.invoice')}
                                </label>
                                <input
                                    id="invoice"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setCreateFormData({ ...createFormData, invoice: e.target.files[0] })}
                                    disabled={isCreating}
                                />
                            </div>

                            <div className="admin-subscription-modal__actions">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={isCreating}
                                    className="btn btn-secondary"
                                >
                                    {t('adminSubscriptions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="btn btn-primary"
                                >
                                    {isCreating ? t('adminSubscriptions.creating') : t('adminSubscriptions.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
