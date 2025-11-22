import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import Pagination from '../../../components/Pagination/Pagination';
import { FaCrown, FaEye } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import { format } from 'date-fns';
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
    const itemsPerPage = 10;

    // Mock data for subscriptions (will be replaced with API call later)
    const mockSubscriptions = [
        {
            _id: '1',
            userId: { username: 'ahmed_mohamed', email: 'ahmed@example.com', _id: 'user1_id' },
            planType: 'Premium',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-02-01'),
            status: 'active',
            amount: 29.99,
            currency: 'USD',
            autoRenew: true
        },
        {
            _id: '2',
            userId: { username: 'sara_ali', email: 'sara@example.com', _id: 'user2_id' },
            planType: 'Premium',
            startDate: new Date('2024-01-05'),
            endDate: new Date('2024-02-05'),
            status: 'active',
            amount: 29.99,
            currency: 'USD',
            autoRenew: true
        },
        {
            _id: '3',
            userId: { username: 'mohamed_hassan', email: 'mohamed@example.com', _id: 'user3_id' },
            planType: 'Premium',
            startDate: new Date('2023-12-15'),
            endDate: new Date('2024-01-15'),
            status: 'expired',
            amount: 29.99,
            currency: 'USD',
            autoRenew: false
        },
        {
            _id: '4',
            userId: { username: 'fatima_ibrahim', email: 'fatima@example.com', _id: 'user4_id' },
            planType: 'Premium',
            startDate: new Date('2024-01-10'),
            endDate: new Date('2024-02-10'),
            status: 'active',
            amount: 29.99,
            currency: 'USD',
            autoRenew: true
        },
        {
            _id: '5',
            userId: { username: 'ali_khalid', email: 'ali@example.com', _id: 'user5_id' },
            planType: 'Premium',
            startDate: new Date('2023-11-20'),
            endDate: new Date('2023-12-20'),
            status: 'expired',
            amount: 29.99,
            currency: 'USD',
            autoRenew: false
        },
        {
            _id: '6',
            userId: { username: 'nour_ahmed', email: 'nour@example.com', _id: 'user6_id' },
            planType: 'Premium',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-02-15'),
            status: 'active',
            amount: 29.99,
            currency: 'USD',
            autoRenew: true
        },
        {
            _id: '7',
            userId: { username: 'omar_said', email: 'omar@example.com', _id: 'user7_id' },
            planType: 'Premium',
            startDate: new Date('2024-01-08'),
            endDate: new Date('2024-02-08'),
            status: 'active',
            amount: 29.99,
            currency: 'USD',
            autoRenew: false
        },
        {
            _id: '8',
            userId: { username: 'layla_mahmoud', email: 'layla@example.com', _id: 'user8_id' },
            planType: 'Premium',
            startDate: new Date('2023-12-10'),
            endDate: new Date('2024-01-10'),
            status: 'expired',
            amount: 29.99,
            currency: 'USD',
            autoRenew: false
        },
        {
            _id: '9',
            userId: { username: 'youssef_karim', email: 'youssef@example.com', _id: 'user9_id' },
            planType: 'Premium',
            startDate: new Date('2024-01-20'),
            endDate: new Date('2024-02-20'),
            status: 'active',
            amount: 29.99,
            currency: 'USD',
            autoRenew: true
        },
        {
            _id: '10',
            userId: { username: 'mariam_fouad', email: 'mariam@example.com', _id: 'user10_id' },
            planType: 'Premium',
            startDate: new Date('2024-01-12'),
            endDate: new Date('2024-02-12'),
            status: 'active',
            amount: 29.99,
            currency: 'USD',
            autoRenew: true
        },
        {
            _id: '11',
            userId: { username: 'khaled_omar', email: 'khaled@example.com', _id: 'user11_id' },
            planType: 'Premium',
            startDate: new Date('2023-11-25'),
            endDate: new Date('2023-12-25'),
            status: 'expired',
            amount: 29.99,
            currency: 'USD',
            autoRenew: false
        },
        {
            _id: '12',
            userId: { username: 'dina_samir', email: 'dina@example.com', _id: 'user12_id' },
            planType: 'Premium',
            startDate: new Date('2024-01-18'),
            endDate: new Date('2024-02-18'),
            status: 'active',
            amount: 29.99,
            currency: 'USD',
            autoRenew: true
        }
    ];

    // Fetch all subscriptions
    const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery(
        ['allSubscriptions'],
        async () => {
            try {
                const response = await axios.get(`${API_URL}/auth/getAllSubscriptions`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                // Return mock data if API fails
                return { subscriptions: mockSubscriptions };
            }
        },
        { 
            enabled: !!token,
            // Use mock data for now until API is ready
            initialData: { subscriptions: mockSubscriptions }
        }
    );

    // Filter subscriptions based on search and filters
    const filteredSubscriptions = useMemo(() => {
        if (!subscriptionsData?.subscriptions) return [];

        return subscriptionsData.subscriptions.filter((subscription) => {
            // Search filter
            if (searchTerm) {
                const userInfo = typeof subscription.userId === 'object' && subscription.userId !== null
                    ? `${subscription.userId.username || ''} ${subscription.userId.email || ''} ${subscription.userId._id || ''}`
                    : `${subscription.userId || ''} ${subscription.username || ''}`;

                const searchLower = searchTerm.toLowerCase();
                const planTypeStr = (subscription.planType || '').toLowerCase();
                if (!userInfo.toLowerCase().includes(searchLower) &&
                    !planTypeStr.includes(searchLower) &&
                    !subscription.amount?.toString().toLowerCase().includes(searchLower)) {
                    return false;
                }
            }

            // Status filter
            if (filters.status && subscription.status !== filters.status) {
                return false;
            }

            // Plan type filter
            if (filters.planType && subscription.planType !== filters.planType) {
                return false;
            }

            return true;
        });
    }, [subscriptionsData?.subscriptions, searchTerm, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

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
        {
            key: 'planType',
            label: t('adminSubscriptions.planType'),
            allLabel: t('searchFilter.all'),
            options: [
                { value: 'Premium', label: t('adminSubscriptions.premium') }
            ]
        }
    ];

    const currency = subscriptionsData?.subscriptions?.[0]?.currency || 'USD';

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
                                        paginatedSubscriptions.map((subscription, index) => (
                                            <tr key={subscription._id || subscription.id || index}>
                                                <td data-label={t('adminSubscriptions.user')}>
                                                    {typeof subscription.userId === 'object' && subscription.userId !== null
                                                        ? (subscription.userId.username || subscription.userId.email || subscription.userId._id || '-')
                                                        : (subscription.userId || subscription.username || '-')
                                                    }
                                                </td>
                                                <td data-label={t('adminSubscriptions.planType')}>
                                                    <span className="subscription-plan-badge">
                                                        {subscription.planType || '-'}
                                                    </span>
                                                </td>
                                                <td data-label={t('adminSubscriptions.startDate')}>
                                                    {subscription.startDate
                                                        ? (typeof subscription.startDate === 'string' || subscription.startDate instanceof Date
                                                            ? format(new Date(subscription.startDate), 'PPP')
                                                            : String(subscription.startDate))
                                                        : '-'}
                                                </td>
                                                <td data-label={t('adminSubscriptions.endDate')}>
                                                    {subscription.endDate
                                                        ? (typeof subscription.endDate === 'string' || subscription.endDate instanceof Date
                                                            ? format(new Date(subscription.endDate), 'PPP')
                                                            : String(subscription.endDate))
                                                        : '-'}
                                                </td>
                                                <td data-label={t('adminSubscriptions.status')}>
                                                    <span className={`status-badge status-${subscription.status || 'expired'}`}>
                                                        {subscription.status === 'active'
                                                            ? t('adminSubscriptions.active')
                                                            : subscription.status === 'expired'
                                                                ? t('adminSubscriptions.expired')
                                                                : subscription.status || t('adminSubscriptions.expired')}
                                                    </span>
                                                </td>
                                                <td data-label={t('adminSubscriptions.amount')}>
                                                    {typeof subscription.amount === 'object' && subscription.amount !== null
                                                        ? JSON.stringify(subscription.amount)
                                                        : String(subscription.amount || '-')
                                                    } {typeof subscription.currency === 'object' && subscription.currency !== null
                                                        ? JSON.stringify(subscription.currency)
                                                        : (subscription.currency || currency)
                                                    }
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
                                        ))
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
                                <strong>{t('adminSubscriptions.user')}:</strong>
                                <span>
                                    {typeof selectedSubscription.userId === 'object' && selectedSubscription.userId !== null
                                        ? (selectedSubscription.userId.username || selectedSubscription.userId.email || selectedSubscription.userId._id || '-')
                                        : (selectedSubscription.userId || selectedSubscription.username || '-')
                                    }
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.planType')}:</strong>
                                <span className="subscription-plan-badge">
                                    {selectedSubscription.planType || '-'}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.startDate')}:</strong>
                                <span>
                                    {selectedSubscription.startDate
                                        ? (typeof selectedSubscription.startDate === 'string' || selectedSubscription.startDate instanceof Date
                                            ? format(new Date(selectedSubscription.startDate), 'PPPpp')
                                            : String(selectedSubscription.startDate))
                                        : '-'}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.endDate')}:</strong>
                                <span>
                                    {selectedSubscription.endDate
                                        ? (typeof selectedSubscription.endDate === 'string' || selectedSubscription.endDate instanceof Date
                                            ? format(new Date(selectedSubscription.endDate), 'PPPpp')
                                            : String(selectedSubscription.endDate))
                                        : '-'}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.status')}:</strong>
                                <span className={`status-badge status-${selectedSubscription.status || 'expired'}`}>
                                    {selectedSubscription.status === 'active'
                                        ? t('adminSubscriptions.active')
                                        : selectedSubscription.status === 'expired'
                                            ? t('adminSubscriptions.expired')
                                            : selectedSubscription.status || t('adminSubscriptions.expired')}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.amount')}:</strong>
                                <span>
                                    {typeof selectedSubscription.amount === 'object' && selectedSubscription.amount !== null
                                        ? JSON.stringify(selectedSubscription.amount)
                                        : String(selectedSubscription.amount || '-')
                                    } {typeof selectedSubscription.currency === 'object' && selectedSubscription.currency !== null
                                        ? JSON.stringify(selectedSubscription.currency)
                                        : (selectedSubscription.currency || currency)
                                    }
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.autoRenew')}:</strong>
                                <span>
                                    {selectedSubscription.autoRenew ? t('adminSubscriptions.yes') : t('adminSubscriptions.no')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
