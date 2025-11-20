import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaBullhorn, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import './RevenueData.scss';

export default function RevenueData() {
    const { t } = useLanguage();
    const [userId] = useState('1752693445887135746'); // Default user ID

    // Default values (no API) - removed placeholder numbers
    const currency = 'USD';

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
                        <span className="revenue-earning-section__id">{userId}</span>
                    </div>
                    
                    <div className="revenue-earning-card">
                        <div className="revenue-earning-card__top">
                            <div className="revenue-earning-card__item">
                                <div className="revenue-earning-card__label">
                                    {t('revenueData.withdrawable') || 'Withdrawable'} / {currency}
                                    <FaQuestionCircle className="revenue-earning-card__help-icon" />
                                </div>
                                <div className="revenue-earning-card__value revenue-earning-card__value--large">
                                    {/* Value removed - placeholder */}
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
                                    {/* Value removed - placeholder */}
                                </div>
                            </div>
                            
                            <div className="revenue-earning-card__item">
                                <div className="revenue-earning-card__label">
                                    {t('revenueData.actualIncome') || 'Actual income'} / {currency}
                                    <FaQuestionCircle className="revenue-earning-card__help-icon" />
                                </div>
                                <div className="revenue-earning-card__value">
                                    {/* Value removed - placeholder */}
                                </div>
                            </div>
                        </div>
                        
                        <div className="revenue-earning-card__background">
                            <span className="revenue-earning-card__dollar-sign">$</span>
                        </div>
                    </div>
                </motion.div>

                {/* Revenue Notification Section */}
                <motion.div
                    className="revenue-notification-section"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="revenue-notification-section__title">{t('revenueData.revenue') || 'Revenue'}</h2>
                    <div className="revenue-notification">
                        <FaBullhorn className="revenue-notification__icon" />
                        <p className="revenue-notification__text">
                            {t('revenueData.congratulationsMessage') || 'Congratulations to user S***H for withdrawing 23.85 USD!'}
                        </p>
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
                                            {t('revenueData.install') || 'Install'}
                                        </div>
                                    </th>
                                    <th>
                                        <div className="table-header-sortable">
                                            {t('revenueData.referralRevenue') || 'Referral revenue'}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Empty rows - no placeholder data */}
                                <tr>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
