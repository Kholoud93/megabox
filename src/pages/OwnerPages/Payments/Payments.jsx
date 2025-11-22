import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import Pagination from '../../../components/Pagination/Pagination';
import { FaCreditCard, FaEye } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import { format } from 'date-fns';
import './Payments.scss';

export default function Payments() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Mock data for payments (will be replaced with API call later)
    // These payments are created when withdrawals are approved
    const mockPayments = [
        {
            _id: '1',
            userId: { username: 'ahmed_mohamed', email: 'ahmed@example.com', _id: 'user1_id' },
            amount: 500,
            currency: 'USD',
            paymentMethod: 'PayPal',
            status: 'success',
            createdAt: new Date('2024-01-20'),
            transactionId: 'TXN123456'
        },
        {
            _id: '2',
            userId: { username: 'sara_ali', email: 'sara@example.com', _id: 'user2_id' },
            amount: 750,
            currency: 'USD',
            paymentMethod: 'USDT',
            status: 'success',
            createdAt: new Date('2024-01-19'),
            transactionId: 'TXN123457'
        },
        {
            _id: '3',
            userId: { username: 'mohamed_hassan', email: 'mohamed@example.com', _id: 'user3_id' },
            amount: 300,
            currency: 'USD',
            paymentMethod: 'Bank Transfer',
            status: 'success',
            createdAt: new Date('2024-01-18'),
            transactionId: 'TXN123458'
        },
        {
            _id: '4',
            userId: { username: 'fatima_ibrahim', email: 'fatima@example.com', _id: 'user4_id' },
            amount: 1000,
            currency: 'USD',
            paymentMethod: 'Payoneer',
            status: 'success',
            createdAt: new Date('2024-01-17'),
            transactionId: 'TXN123459'
        },
        {
            _id: '5',
            userId: { username: 'ali_khalid', email: 'ali@example.com', _id: 'user5_id' },
            amount: 450,
            currency: 'USD',
            paymentMethod: 'PayPal',
            status: 'success',
            createdAt: new Date('2024-01-16'),
            transactionId: 'TXN123460'
        },
        {
            _id: '6',
            userId: { username: 'nour_ahmed', email: 'nour@example.com', _id: 'user6_id' },
            amount: 200,
            currency: 'USD',
            paymentMethod: 'USDT',
            status: 'success',
            createdAt: new Date('2024-01-15'),
            transactionId: 'TXN123461'
        },
        {
            _id: '7',
            userId: { username: 'omar_said', email: 'omar@example.com', _id: 'user7_id' },
            amount: 600,
            currency: 'USD',
            paymentMethod: 'Bank Transfer',
            status: 'success',
            createdAt: new Date('2024-01-14'),
            transactionId: 'TXN123462'
        },
        {
            _id: '8',
            userId: { username: 'layla_mahmoud', email: 'layla@example.com', _id: 'user8_id' },
            amount: 350,
            currency: 'USD',
            paymentMethod: 'PayPal',
            status: 'success',
            createdAt: new Date('2024-01-13'),
            transactionId: 'TXN123463'
        },
        {
            _id: '9',
            userId: { username: 'youssef_karim', email: 'youssef@example.com', _id: 'user9_id' },
            amount: 800,
            currency: 'USD',
            paymentMethod: 'Payoneer',
            status: 'success',
            createdAt: new Date('2024-01-12'),
            transactionId: 'TXN123464'
        },
        {
            _id: '10',
            userId: { username: 'mariam_fouad', email: 'mariam@example.com', _id: 'user10_id' },
            amount: 250,
            currency: 'USD',
            paymentMethod: 'USDT',
            status: 'success',
            createdAt: new Date('2024-01-11'),
            transactionId: 'TXN123465'
        },
        {
            _id: '11',
            userId: { username: 'khaled_omar', email: 'khaled@example.com', _id: 'user11_id' },
            amount: 1200,
            currency: 'USD',
            paymentMethod: 'Bank Transfer',
            status: 'success',
            createdAt: new Date('2024-01-10'),
            transactionId: 'TXN123466'
        },
        {
            _id: '12',
            userId: { username: 'dina_samir', email: 'dina@example.com', _id: 'user12_id' },
            amount: 400,
            currency: 'USD',
            paymentMethod: 'PayPal',
            status: 'success',
            createdAt: new Date('2024-01-09'),
            transactionId: 'TXN123467'
        }
    ];

    // Fetch all payments
    const { data: paymentsData, isLoading: paymentsLoading } = useQuery(
        ['allPayments'],
        async () => {
            try {
                const response = await axios.get(`${API_URL}/auth/getAllPayments`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching payments:', error);
                // Return mock data if API fails
                return { payments: mockPayments };
            }
        },
        { 
            enabled: !!token,
            // Use mock data for now
            initialData: { payments: mockPayments }
        }
    );

    // Filter payments based on search and filters
    const filteredPayments = useMemo(() => {
        if (!paymentsData?.payments) return [];

        return paymentsData.payments.filter((payment) => {
            // Search filter
            if (searchTerm) {
                const userInfo = typeof payment.userId === 'object' && payment.userId !== null
                    ? `${payment.userId.username || ''} ${payment.userId.email || ''} ${payment.userId._id || ''}`
                    : `${payment.userId || ''} ${payment.username || ''}`;

                const searchLower = searchTerm.toLowerCase();
                const paymentMethodStr = typeof payment.paymentMethod === 'object' && payment.paymentMethod !== null
                    ? (payment.paymentMethod.name || payment.paymentMethod.type || payment.paymentMethod.walletId || '').toLowerCase()
                    : (payment.paymentMethod || '').toLowerCase();
                if (!userInfo.toLowerCase().includes(searchLower) &&
                    !payment.amount?.toString().toLowerCase().includes(searchLower) &&
                    !paymentMethodStr.includes(searchLower)) {
                    return false;
                }
            }

            // Status filter
            if (filters.status && payment.status !== filters.status) {
                return false;
            }

            // Payment method filter
            if (filters.paymentMethod) {
                const paymentMethodValue = typeof payment.paymentMethod === 'object' && payment.paymentMethod !== null
                    ? (payment.paymentMethod.name || payment.paymentMethod.type || payment.paymentMethod.walletId || '')
                    : (payment.paymentMethod || '');
                if (paymentMethodValue !== filters.paymentMethod) {
                    return false;
                }
            }

            return true;
        });
    }, [paymentsData?.payments, searchTerm, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Get unique payment methods for filter
    const paymentMethods = useMemo(() => {
        if (!paymentsData?.payments) return [];
        const methods = new Set();
        paymentsData.payments.forEach(p => {
            if (p.paymentMethod) {
                const methodValue = typeof p.paymentMethod === 'object' && p.paymentMethod !== null
                    ? (p.paymentMethod.name || p.paymentMethod.type || p.paymentMethod.walletId || '')
                    : (p.paymentMethod || '');
                if (methodValue) methods.add(methodValue);
            }
        });
        return Array.from(methods).map(method => ({
            value: method,
            label: method
        }));
    }, [paymentsData?.payments]);

    // Filter configuration
    const filterConfig = [
        {
            key: 'status',
            label: t('adminAnalytics.status'),
            allLabel: t('searchFilter.all'),
            options: [
                { value: 'success', label: t('adminPayments.success') },
                { value: 'pending', label: t('adminPayments.pending') },
                { value: 'failed', label: t('adminPayments.failed') }
            ]
        },
        ...(paymentMethods.length > 0 ? [{
            key: 'paymentMethod',
            label: t('adminAnalytics.paymentMethod'),
            allLabel: t('searchFilter.all'),
            options: paymentMethods
        }] : [])
    ];

    const currency = paymentsData?.payments?.[0]?.currency || 'USD';

    return (
        <div className="admin-payments-page">
            <div className="admin-payments-page__wrapper">
                <div className="admin-payments-header">
                    <div className="admin-payments-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-payments-header__back"
                            title={t('adminPayments.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaCreditCard className="admin-payments-header__icon" />
                        <div>
                            <h1 className="admin-payments-header__title">{t('adminPayments.title')}</h1>
                            <p className="admin-payments-header__subtitle">{t('adminPayments.subtitle')}</p>
                        </div>
                    </div>
                </div>

                {paymentsLoading ? (
                    <div className="admin-payments-loading">
                        <p>{t('adminPayments.loading')}</p>
                    </div>
                ) : paymentsData?.payments?.length > 0 ? (
                    <>
                        <SearchFilter
                            searchPlaceholder={t('adminPayments.searchPayments')}
                            filters={filterConfig}
                            onSearchChange={setSearchTerm}
                            onFilterChange={setFilters}
                        />

                        <div className="admin-payments-table-wrapper">
                            <table className="admin-users-table">
                                <thead className="admin-users-table__header">
                                    <tr>
                                        <th scope="col">{t('adminPayments.date')}</th>
                                        <th scope="col">{t('adminPayments.paymentMethod')}</th>
                                        <th scope="col">{t('adminPayments.user')}</th>
                                        <th scope="col">{t('adminPayments.amount')}</th>
                                        <th scope="col">{t('adminPayments.status')}</th>
                                        <th scope="col">{t('adminPayments.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPayments.length > 0 ? (
                                        paginatedPayments.map((payment, index) => (
                                            <tr key={payment._id || payment.id || index}>
                                                <td data-label={t('adminPayments.date')}>
                                                    {payment.createdAt
                                                        ? (typeof payment.createdAt === 'string' || payment.createdAt instanceof Date
                                                            ? format(new Date(payment.createdAt), 'PPP')
                                                            : String(payment.createdAt))
                                                        : '-'}
                                                </td>
                                                <td data-label={t('adminPayments.paymentMethod')}>
                                                    {typeof payment.paymentMethod === 'object' && payment.paymentMethod !== null
                                                        ? (payment.paymentMethod.name || payment.paymentMethod.type || payment.paymentMethod.walletId || JSON.stringify(payment.paymentMethod))
                                                        : (payment.paymentMethod || '-')
                                                    }
                                                </td>
                                                <td data-label={t('adminPayments.user')}>
                                                    {typeof payment.userId === 'object' && payment.userId !== null
                                                        ? (payment.userId.username || payment.userId.email || payment.userId._id || '-')
                                                        : (payment.userId || payment.username || '-')
                                                    }
                                                </td>
                                                <td data-label={t('adminPayments.amount')}>
                                                    {typeof payment.amount === 'object' && payment.amount !== null
                                                        ? JSON.stringify(payment.amount)
                                                        : String(payment.amount || '-')
                                                    } {typeof payment.currency === 'object' && payment.currency !== null
                                                        ? JSON.stringify(payment.currency)
                                                        : (payment.currency || currency)
                                                    }
                                                </td>
                                                <td data-label={t('adminPayments.status')}>
                                                    <span className={`status-badge status-${payment.status || 'pending'}`}>
                                                        {payment.status === 'success'
                                                            ? t('adminPayments.success')
                                                            : payment.status === 'pending'
                                                                ? t('adminPayments.pending')
                                                                : payment.status === 'failed'
                                                                    ? t('adminPayments.failed')
                                                                    : payment.status || t('adminPayments.pending')}
                                                    </span>
                                                </td>
                                                <td data-label={t('adminPayments.actions')}>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="admin-payments-actions__btn admin-payments-actions__btn--view"
                                                            onClick={() => setSelectedPayment(payment)}
                                                            title={t('adminPayments.viewDetails')}
                                                        >
                                                            <FaEye size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                                {t('adminPayments.noPaymentsFound')}
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
                            endIndex={Math.min(endIndex, filteredPayments.length)}
                            totalItems={filteredPayments.length}
                            itemsLabel={t('adminPayments.payments')}
                        />
                    </>
                ) : (
                    <div className="admin-payments-empty">
                        <p>{t('adminPayments.noPayments')}</p>
                    </div>
                )}
            </div>

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div
                    className="admin-payment-modal-backdrop"
                    onClick={() => setSelectedPayment(null)}
                >
                    <div
                        className="admin-payment-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-payment-modal__header">
                            <h2>{t('adminPayments.paymentDetails')}</h2>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="admin-payment-modal__close"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-payment-modal__body">
                            <div className="admin-payment-modal__row">
                                <strong>{t('adminPayments.user')}:</strong>
                                <span>
                                    {typeof selectedPayment.userId === 'object' && selectedPayment.userId !== null
                                        ? (selectedPayment.userId.username || selectedPayment.userId.email || selectedPayment.userId._id || '-')
                                        : (selectedPayment.userId || selectedPayment.username || '-')
                                    }
                                </span>
                            </div>

                            <div className="admin-payment-modal__row">
                                <strong>{t('adminPayments.amount')}:</strong>
                                <span>
                                    {typeof selectedPayment.amount === 'object' && selectedPayment.amount !== null
                                        ? JSON.stringify(selectedPayment.amount)
                                        : String(selectedPayment.amount || '-')
                                    } {typeof selectedPayment.currency === 'object' && selectedPayment.currency !== null
                                        ? JSON.stringify(selectedPayment.currency)
                                        : (selectedPayment.currency || currency)
                                    }
                                </span>
                            </div>

                            <div className="admin-payment-modal__row">
                                <strong>{t('adminPayments.paymentMethod')}:</strong>
                                <span>
                                    {typeof selectedPayment.paymentMethod === 'object' && selectedPayment.paymentMethod !== null
                                        ? (selectedPayment.paymentMethod.name || selectedPayment.paymentMethod.type || selectedPayment.paymentMethod.walletId || JSON.stringify(selectedPayment.paymentMethod))
                                        : (selectedPayment.paymentMethod || '-')
                                    }
                                </span>
                            </div>

                            <div className="admin-payment-modal__row">
                                <strong>{t('adminPayments.status')}:</strong>
                                <span className={`status-badge status-${selectedPayment.status || 'pending'}`}>
                                    {selectedPayment.status === 'success'
                                        ? t('adminPayments.success')
                                        : selectedPayment.status === 'pending'
                                            ? t('adminPayments.pending')
                                            : selectedPayment.status === 'failed'
                                                ? t('adminPayments.failed')
                                                : selectedPayment.status || t('adminPayments.pending')}
                                </span>
                            </div>

                            <div className="admin-payment-modal__row">
                                <strong>{t('adminPayments.date')}:</strong>
                                <span>
                                    {selectedPayment.createdAt
                                        ? (typeof selectedPayment.createdAt === 'string' || selectedPayment.createdAt instanceof Date
                                            ? format(new Date(selectedPayment.createdAt), 'PPPpp')
                                            : String(selectedPayment.createdAt))
                                        : '-'}
                                </span>
                            </div>

                            {selectedPayment.transactionId && (
                                <div className="admin-payment-modal__row">
                                    <strong>{t('adminPayments.transactionId')}:</strong>
                                    <span>
                                        {typeof selectedPayment.transactionId === 'object' && selectedPayment.transactionId !== null
                                            ? JSON.stringify(selectedPayment.transactionId)
                                            : String(selectedPayment.transactionId || '-')
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
