import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaArrowUp, FaArrowDown, FaLink, FaEye, FaDownload } from 'react-icons/fa';
import { HiShare } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { userService, promoterService } from '../../services/api';
import './RevenueData.scss';

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
        () => promoterService.getUserEarnings(token),
        {
            enabled: !!token,
            retry: 2,
        }
    );

    // Fetch share link analytics (contains both revenue and link data)
    const { data: shareLinkAnalyticsData, isLoading: shareLinkAnalyticsLoading } = useQuery(
        ['shareLinkAnalytics'],
        () => promoterService.getShareLinkAnalytics(token),
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
    
    // Extract share link analytics data - this will be used for the table
    const shareLinksAnalytics = shareLinkAnalyticsData?.analytics || shareLinkAnalyticsData?.data || shareLinkAnalyticsData?.links || shareLinkAnalyticsData?.revenue || [];
    const totalLinks = shareLinksAnalytics.length;
    const totalLinkViews = shareLinksAnalytics.reduce((sum, link) => sum + (link.views || link.totalViews || 0), 0);
    const totalLinkDownloads = shareLinksAnalytics.reduce((sum, link) => sum + (link.downloads || link.totalDownloads || 0), 0);
    
    // Use shareLinksAnalytics as revenueList for the table
    const revenueList = shareLinksAnalytics;

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
                                {shareLinkAnalyticsLoading ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            <p style={{ color: '#6b7280', margin: 0 }}>
                                                {t('revenueData.loading') || 'Loading...'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : revenueList && revenueList.length > 0 ? (
                                    revenueList.map((item, index) => (
                                        <motion.tr
                                            key={item.fileId || item.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td>
                                                {/* CPI or Revenue per view/download */}
                                                {item.cpi ? parseFloat(item.cpi || 0).toFixed(4) : 
                                                 item.revenuePerView ? parseFloat(item.revenuePerView || 0).toFixed(4) :
                                                 '-'} {currency}
                                            </td>
                                            <td>
                                                {item.date || item.dateUTC || item.createdAt || item.lastUpdated
                                                    ? new Date(item.date || item.dateUTC || item.createdAt || item.lastUpdated).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td>
                                                {/* Total revenue from this link */}
                                                {item.totalRevenue ? parseFloat(item.totalRevenue || 0).toFixed(4) :
                                                 item.total ? parseFloat(item.total || 0).toFixed(4) :
                                                 item.earnings ? parseFloat(item.earnings || 0).toFixed(4) :
                                                 '0.0000'} {currency}
                                            </td>
                                            <td>
                                                {/* Install/Downloads count */}
                                                {item.install || item.installRevenue || item.downloads || item.totalDownloads
                                                    ? `${(item.install || item.installRevenue || item.downloads || item.totalDownloads || 0).toLocaleString()}`
                                                    : '0'}
                                            </td>
                                            <td>
                                                {/* Referral revenue or views */}
                                                {item.referralRevenue ? parseFloat(item.referralRevenue || 0).toFixed(4) :
                                                 item.views || item.totalViews ? (item.views || item.totalViews || 0).toLocaleString() :
                                                 '0'} {item.referralRevenue ? currency : ''}
                                            </td>
                                            <td>
                                                {/* Bonus or file name */}
                                                {item.bonus ? parseFloat(item.bonus || 0).toFixed(4) :
                                                 item.fileName || item.name ? (item.fileName || item.name).substring(0, 20) + (item.fileName && item.fileName.length > 20 ? '...' : '') :
                                                 '-'} {item.bonus ? currency : ''}
                                            </td>
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
