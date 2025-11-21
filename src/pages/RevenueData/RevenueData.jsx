import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { HiArrowRight, HiShare } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { API_URL, userService } from '../../services/api';
import './RevenueData.scss';

const EARNINGS_URL = `${API_URL}/auth/getUserEarnings`;

export default function RevenueData() {
    const { t } = useLanguage();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;

    // Fetch user data to get user ID
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(token),
        { enabled: !!token, retry: false }
    );

    const userId = userData?._id || userData?.id || '';

    // Fetch earnings data
    const { data: earningsData, isLoading: earningsLoading } = useQuery(
        ['userEarnings'],
        async () => {
            const res = await fetch(EARNINGS_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch earnings: ${res.status}`);
            }
            return res.json();
        },
        {
            enabled: !!token,
            retry: 2,
        }
    );

    // Extract data
    const currency = earningsData?.currency || 'USD';
    const withdrawable = earningsData?.withdrawable || earningsData?.totalEarnings || '0';
    const estimatedIncome = earningsData?.totalEarnings || earningsData?.estimatedIncome || '0';
    const actualIncome = earningsData?.confirmedRewards || earningsData?.actualIncome || '0';
    const revenueList = [];

    return (
        <div className="revenue-data-page">
            <div className="revenue-data-page__wrapper">
                {/* Referral Income Section */}
                <motion.div
                    className="revenue-referral-section"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="revenue-referral-section__content">
                        <div className="revenue-referral-section__text">
                            <p className="revenue-referral-section__title">
                                {t('revenueData.referralIncomeTitle') || '10% of referral income'}
                            </p>
                            <Link 
                                to="/dashboard/referral"
                                className="revenue-referral-section__button"
                            >
                                {t('referral.getReferralLink') || 'Get Referral Link'}
                            </Link>
                        </div>
                        <div className="revenue-referral-section__decorations">
                            <div className="revenue-referral-section__arrow"></div>
                            <div className="revenue-referral-section__coins"></div>
                        </div>
                    </div>
                </motion.div>

                {/* Earning Section */}
                <motion.div
                    className="revenue-earning-section"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="revenue-earning-section__header">
                        <h2 className="revenue-earning-section__title">{t('revenueData.earning') || 'Earning'}</h2>
                        <span className="revenue-earning-section__id">{t('revenueData.id') || 'ID'}: {userId}</span>
                    </div>
                    
                    <div className="revenue-earning-card">
                        <div className="revenue-earning-card__top">
                            <div className="revenue-earning-card__item">
                                <div className="revenue-earning-card__label">
                                    {t('revenueData.withdrawable') || 'Withdrawable'} / {currency}
                                    <FaQuestionCircle className="revenue-earning-card__help-icon" />
                                </div>
                                <div className="revenue-earning-card__value revenue-earning-card__value--large">
                                    {earningsLoading ? '-' : parseFloat(withdrawable || 0).toFixed(4)}
                                </div>
                            </div>
                            <Link 
                                to="/dashboard/Earnings"
                                className="revenue-earning-card__withdraw-button"
                            >
                                {t('revenueData.withdraw') || 'Withdraw'}
                            </Link>
                        </div>
                        
                        <div className="revenue-earning-card__bottom">
                            <div className="revenue-earning-card__item">
                                <div className="revenue-earning-card__label">
                                    {t('revenueData.estimatedIncome') || 'Estimated income'} / {currency}
                                    <FaQuestionCircle className="revenue-earning-card__help-icon" />
                                </div>
                                <div className="revenue-earning-card__value">
                                    {earningsLoading ? '-' : parseFloat(estimatedIncome || 0).toFixed(4)}
                                </div>
                            </div>
                            
                            <div className="revenue-earning-card__item">
                                <div className="revenue-earning-card__label">
                                    {t('revenueData.actualIncome') || 'Actual income'} / {currency}
                                    <FaQuestionCircle className="revenue-earning-card__help-icon" />
                                </div>
                                <div className="revenue-earning-card__value">
                                    {earningsLoading ? '-' : parseFloat(actualIncome || 0).toFixed(4)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="revenue-earning-card__background">
                            <span className="revenue-earning-card__dollar-sign">$</span>
                        </div>
                    </div>
                </motion.div>

                {/* Revenue Table Section */}
                <motion.div
                    className="revenue-table-section"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="revenue-table-container">
                        <table className="revenue-table">
                            <thead>
                                <tr>
                                    <th>
                                        <div className="table-header-sortable">
                                            {t('revenueData.cpi') || 'cpi / USD'}
                                            <div className="sort-icons">
                                                <FaArrowUp className="sort-icon" />
                                                <FaArrowDown className="sort-icon" />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="table-header-sortable">
                                            {t('revenueData.date') || 'Date (UTC)'}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="table-header-sortable">
                                            {t('revenueData.total') || 'Total / USD'}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="table-header-sortable">
                                            {t('revenueData.install') || 'Install'}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="table-header-sortable">
                                            {t('revenueData.referralRevenue') || 'Referral revenue'}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="table-header-sortable">
                                            {t('revenueData.bonus') || 'Bonus'}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueList && revenueList.length > 0 ? (
                                    revenueList.map((item, index) => (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td>{parseFloat(item.cpi || 0).toFixed(4)} {currency}</td>
                                            <td>
                                                {item.date || item.dateUTC
                                                    ? new Date(item.date || item.dateUTC).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td>{parseFloat(item.total || 0).toFixed(4)} {currency}</td>
                                            <td>
                                                {item.install || item.installRevenue 
                                                    ? `${parseFloat(item.install || item.installRevenue || 0).toFixed(0)} ${item.detail ? 'Detail' : ''}`
                                                    : '0'}
                                            </td>
                                            <td>{parseFloat(item.referralRevenue || 0).toFixed(4)} {currency}</td>
                                            <td>{parseFloat(item.bonus || 0).toFixed(4)} {currency}</td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                <p style={{ color: '#6b7280', margin: 0 }}>
                                                    {t('revenueData.noDataMessage') || 'No data, make money by sharing videos'}
                                                </p>
                                                <Link 
                                                    to="/dashboard/referral"
                                                    className="revenue-earning-card__withdraw-button revenue-earning-card__share-button"
                                                >
                                                    <HiShare className="revenue-earning-card__share-icon" />
                                                    {t('revenueData.toShare') || 'To share'}
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
