import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import { API_URL } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/EmptyState/EmptyState';
import { FaChartLine, FaDollarSign, FaDownload, FaUsers } from 'react-icons/fa';
import './RevenueData.scss';

const REVENUE_URL = `${API_URL}/auth/getUserRevenue`;

export default function RevenueData() {
    const { t } = useLanguage();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [selectedTab, setSelectedTab] = useState('all'); // all, estimated, settled

    // Fetch revenue data
    const { data: revenueData, isLoading } = useQuery(
        ['userRevenue'],
        async () => {
            const res = await fetch(REVENUE_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.json();
        },
        { enabled: !!token }
    );

    // Extract data
    const revenueList = revenueData?.revenue || revenueData?.data || [];
    const currency = revenueData?.currency || 'USD';
    const estimatedRevenue = revenueData?.estimatedRevenue || [];
    const settledRevenue = revenueData?.settledRevenue || [];

    // Filter data based on selected tab
    const filteredData = selectedTab === 'estimated'
        ? estimatedRevenue
        : selectedTab === 'settled'
            ? settledRevenue
            : revenueList;

    // Calculate totals
    const totalRevenue = filteredData?.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) || 0;
    const totalInstallRevenue = filteredData?.reduce((sum, item) => sum + (parseFloat(item.installRevenue) || 0), 0) || 0;

    return (
        <div className="revenue-data-page">
            <div className="revenue-data-page__wrapper">
                {/* Header */}
                <motion.div
                    className="revenue-data-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="revenue-data-header__content">
                        <FaChartLine className="revenue-data-header__icon" />
                        <div>
                            <h1 className="revenue-data-header__title">{t('revenueData.title')}</h1>
                            <p className="revenue-data-header__subtitle">{t('revenueData.subtitle')}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="revenue-summary">
                    <motion.div
                        className="revenue-summary__card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <FaDollarSign className="revenue-summary__icon" />
                        <div className="revenue-summary__content">
                            <div className="revenue-summary__label">{t('revenueData.totalRevenue')}</div>
                            <div className="revenue-summary__value">{totalRevenue.toFixed(4)} {currency}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="revenue-summary__card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <FaDownload className="revenue-summary__icon" />
                        <div className="revenue-summary__content">
                            <div className="revenue-summary__label">{t('revenueData.totalInstallRevenue')}</div>
                            <div className="revenue-summary__value">{totalInstallRevenue.toFixed(4)} {currency}</div>
                        </div>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div className="revenue-tabs">
                    <button
                        className={`revenue-tabs__tab ${selectedTab === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('all')}
                    >
                        {t('revenueData.all')}
                    </button>
                    <button
                        className={`revenue-tabs__tab ${selectedTab === 'estimated' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('estimated')}
                    >
                        {t('revenueData.estimated')}
                    </button>
                    <button
                        className={`revenue-tabs__tab ${selectedTab === 'settled' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('settled')}
                    >
                        {t('revenueData.settled')}
                    </button>
                </div>

                {/* Revenue Table */}
                {isLoading ? (
                    <div className="revenue-table">
                        <div className="revenue-table__skeleton">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="skeleton-row">
                                    <div className="skeleton-cell"></div>
                                    <div className="skeleton-cell"></div>
                                    <div className="skeleton-cell"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : filteredData?.length === 0 ? (
                    <EmptyState
                        icon={FaChartLine}
                        title={t('revenueData.noDataTitle')}
                        message={t('revenueData.noDataMessage')}
                    />
                ) : (
                    <motion.div
                        className="revenue-table"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="revenue-table__container">
                            <table className="revenue-table__table">
                                <thead>
                                    <tr>
                                        <th>{t('revenueData.date')}</th>
                                        <th>{t('revenueData.total')}</th>
                                        <th>{t('revenueData.installRevenue')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <motion.tr
                                            key={index}
                                            className="revenue-table__row"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td>
                                                {item.date || item.dateUTC
                                                    ? new Date(item.date || item.dateUTC).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td>{parseFloat(item.total || 0).toFixed(4)} {currency}</td>
                                            <td>{parseFloat(item.installRevenue || 0).toFixed(4)} {currency}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

