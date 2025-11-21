import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HiFolder,
    HiShare,
    HiChartBar,
    HiUserGroup,
    HiHandRaised,
    HiBell,
    HiCurrencyDollar,
    HiUsers,
    HiDocumentText,
    HiBars3
} from "react-icons/hi2";
import { useLanguage } from '../../context/LanguageContext';
import './BottomNavigation.scss';

export default function BottomNavigation({ role, isPromoter, userData }) {
    const { t, language } = useLanguage();
    const { pathname } = useLocation();

    const getMenuItems = () => {
        if (role === "User") {
            // For promoters, show specific tabs in order
            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                return [
                    // 1. Revenue Data
                    {
                        path: '/dashboard/revenue-data',
                        icon: HiChartBar,
                        label: t("sidenav.revenueData"),
                        key: 'revenue'
                    },
                    // 2. Link Data (Shared Files)
                    {
                        path: '/dashboard/shared-files',
                        icon: HiShare,
                        label: t("sidenav.linkData"),
                        key: 'link-data'
                    },
                    // 3. My Files
                    {
                        path: '/Promoter/files',
                        icon: HiFolder,
                        label: t("sidenav.allFiles"),
                        key: 'files'
                    },
                    // 4. Withdraw (Earnings)
                    {
                        path: '/dashboard/Earnings',
                        icon: HiCurrencyDollar,
                        label: t("sidenav.withdraw"),
                        key: 'withdraw'
                    },
                    // 5. Referral
                    {
                        path: '/dashboard/referral',
                        icon: HiUserGroup,
                        label: t("sidenav.referral"),
                        key: 'referral'
                    }
                ];
            }
            
            // For regular users (non-promoters or promoters without plans)
            const items = [
                {
                    path: isPromoter ? '/Promoter/files' : '/dashboard',
                    icon: HiFolder,
                    label: t("sidenav.allFiles"),
                    key: 'files'
                }
            ];

            // Shared Files - Only for promoters with plans
            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                items.push({
                    path: '/dashboard/shared-files',
                    icon: HiShare,
                    label: t("sidenav.sharedFiles"),
                    key: 'shared-files'
                });
            }

            // Promoter Dashboard
            if (isPromoter) {
                items.push({
                    path: '/Promoter',
                    icon: HiCurrencyDollar,
                    label: t("sidenav.promoterDashboard"),
                    key: 'promoter'
                });
            }

            // Revenue Data - Only for promoters with plans
            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                items.push({
                    path: '/dashboard/revenue-data',
                    icon: HiChartBar,
                    label: t("sidenav.revenueData"),
                    key: 'revenue'
                });
            }

            // Earnings - Only for promoters with plans
            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                items.push({
                    path: '/dashboard/Earnings',
                    icon: HiChartBar,
                    label: t("sidenav.earnings"),
                    key: 'earnings'
                });
            }

            // Referral
            items.push({
                path: '/dashboard/referral',
                icon: HiUserGroup,
                label: t("sidenav.referral"),
                key: 'referral'
            });

            // Partners
            items.push({
                path: '/Partners',
                icon: HiHandRaised,
                label: t("sidenav.partners"),
                key: 'partners'
            });

            return items;
        } else if (role === "Owner") {
            return [
                {
                    path: '/Owner',
                    icon: HiChartBar,
                    label: t("sidenav.analytics"),
                    key: 'analytics'
                },
                {
                    path: '/Owner/Users',
                    icon: HiUsers,
                    label: t("sidenav.users"),
                    key: 'users'
                },
                {
                    path: '/Owner/AllPromoters',
                    icon: HiUserGroup,
                    label: t("sidenav.promoters"),
                    key: 'promoters'
                },
                {
                    path: '/Owner/Reports',
                    icon: HiDocumentText,
                    label: t("sidenav.reports"),
                    key: 'reports'
                },
                {
                    path: '/Owner/notifications',
                    icon: HiBell,
                    label: t("sidenav.notifications"),
                    key: 'notifications'
                },
                {
                    path: '/Partners',
                    icon: HiHandRaised,
                    label: t("sidenav.partners"),
                    key: 'partners'
                }
            ];
        } else if (role === "Advertiser") {
            return [
                {
                    path: '/Partners',
                    icon: HiHandRaised,
                    label: t("sidenav.partners"),
                    key: 'partners'
                }
            ];
        }
        return [];
    };

    const menuItems = getMenuItems();

    // Show only first 5 items on mobile, rest in overflow menu
    const visibleItems = menuItems.slice(0, 5);
    const overflowItems = menuItems.slice(5);

    return (
        <nav className="bottom-navigation" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bottom-navigation__container">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    let isActive = false;
                    
                    if (item.path === '/dashboard') {
                        // For dashboard, check if we're on the index route
                        isActive = pathname === '/dashboard' || pathname === '/dashboard/';
                    } else {
                        isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                    }
                    
                    return (
                        <Link
                            key={item.key}
                            to={item.path}
                            className={`bottom-navigation__item ${isActive ? 'bottom-navigation__item--active' : ''}`}
                        >
                            <div className="bottom-navigation__icon-wrapper">
                                <Icon className="bottom-navigation__icon" />
                                {item.badge && item.badge > 0 && (
                                    <span className="bottom-navigation__badge">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="bottom-navigation__label">{item.label}</span>
                        </Link>
                    );
                })}
                {overflowItems.length > 0 && (
                    <div className="bottom-navigation__more">
                        <button className="bottom-navigation__more-button">
                            <HiBars3 className="bottom-navigation__icon" />
                            <span className="bottom-navigation__label">{t("sidenav.more") || "More"}</span>
                        </button>
                        <div className="bottom-navigation__dropdown">
                            {overflowItems.map((item) => {
                                const Icon = item.icon;
                                let isActive = false;
                                
                                if (item.path === '/dashboard') {
                                    // For dashboard, check if we're on the index route
                                    isActive = pathname === '/dashboard' || pathname === '/dashboard/';
                                } else {
                                    isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                                }
                                
                                return (
                                    <Link
                                        key={item.key}
                                        to={item.path}
                                        className={`bottom-navigation__dropdown-item ${isActive ? 'bottom-navigation__dropdown-item--active' : ''}`}
                                    >
                                        <Icon className="bottom-navigation__dropdown-icon" />
                                        <span>{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="bottom-navigation__dropdown-badge">
                                                {item.badge > 9 ? '9+' : item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

