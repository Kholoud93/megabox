import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HiFolder,
    HiShare,
    HiChartBar,
    HiUserGroup,
    HiHandRaised,
    HiCurrencyDollar,
    HiUsers,
    HiDocumentText,
    HiCreditCard,
    HiServer,
    HiArrowDownTray,
    HiTv
} from "react-icons/hi2";
import { useLanguage } from '../../context/LanguageContext';
import './BottomNavigation.scss';

export default function BottomNavigation({ role, isPromoter, userData }) {
    const { t, language } = useLanguage();
    const { pathname } = useLocation();

    const getMenuItems = () => {
        if (role === "User") {
            // Hide bottom navigation for regular users (non-promoters)
            if (!isPromoter) {
                return [];
            }

            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                return [
                    {
                        path: '/Promoter/revenue-data',
                        icon: HiChartBar,
                        label: t("sidenav.revenueData"),
                        key: 'revenue'
                    },
                    {
                        path: '/Promoter/shared-files',
                        icon: HiShare,
                        label: t("sidenav.linkData"),
                        key: 'link-data'
                    },
                    {
                        path: '/Promoter/files',
                        icon: HiFolder,
                        label: t("sidenav.allFiles"),
                        key: 'files'
                    },
                    {
                        path: '/Promoter/channels',
                        icon: HiTv,
                        label: t("sidenav.channels") || "Channels",
                        key: 'channels'
                    },
                    {
                        path: '/Promoter/Earnings',
                        icon: HiCurrencyDollar,
                        label: t("sidenav.withdraw"),
                        key: 'withdraw'
                    },
                    {
                        path: '/Promoter/referral',
                        icon: HiUserGroup,
                        label: t("sidenav.referral"),
                        key: 'referral'
                    }
                ];
            }
            
            const items = [
                {
                    path: isPromoter ? '/Promoter/files' : '/dashboard/files',
                    icon: HiFolder,
                    label: t("sidenav.allFiles"),
                    key: 'files'
                }
            ];

            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                items.push({
                    path: '/Promoter/shared-files',
                    icon: HiShare,
                    label: t("sidenav.sharedFiles"),
                    key: 'shared-files'
                });
            }

            if (isPromoter) {
                items.push({
                    path: '/Promoter',
                    icon: HiCurrencyDollar,
                    label: t("sidenav.promoterDashboard"),
                    key: 'promoter'
                });
                items.push({
                    path: '/Promoter/channels',
                    icon: HiTv,
                    label: t("sidenav.channels") || "Channels",
                    key: 'channels'
                });
            }

            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                items.push({
                    path: '/Promoter/revenue-data',
                    icon: HiChartBar,
                    label: t("sidenav.revenueData"),
                    key: 'revenue'
                });
            }

            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                items.push({
                    path: '/Promoter/Earnings',
                    icon: HiChartBar,
                    label: t("sidenav.earnings"),
                    key: 'earnings'
                });
            }

            if (isPromoter) {
                items.push({
                    path: '/Promoter/referral',
                    icon: HiUserGroup,
                    label: t("sidenav.referral"),
                    key: 'referral'
                });
            }

            items.push({
                path: '/Partners',
                icon: HiHandRaised,
                label: t("sidenav.partners"),
                key: 'partners'
            });

            return items;
        } else if (role === "Owner") {
            return [
                { path: '/Owner', icon: HiChartBar, label: t("sidenav.analytics"), key: 'analytics' },
                { path: '/Owner/Users', icon: HiUsers, label: t("sidenav.users"), key: 'users' },
                { path: '/Owner/AllPromoters', icon: HiUserGroup, label: t("sidenav.promoters"), key: 'promoters' },
                { path: '/Owner/Reports', icon: HiDocumentText, label: t("sidenav.reports"), key: 'reports' },
                { path: '/Owner/Withdrawals', icon: HiCurrencyDollar, label: t("sidenav.withdrawals"), key: 'withdrawals' },
                { path: '/Owner/Payments', icon: HiCreditCard, label: t("sidenav.payments"), key: 'payments' },
                { path: '/Owner/Subscriptions', icon: HiUserGroup, label: t("sidenav.subscriptions"), key: 'subscriptions' },
                { path: '/Owner/Storage', icon: HiServer, label: t("sidenav.storage"), key: 'storage' },
                { path: '/Owner/DownloadsViews', icon: HiArrowDownTray, label: t("sidenav.downloadsViews"), key: 'downloadsViews' }
            ];
        }
        return [];
    };

    const menuItems = getMenuItems();

    // Don't render bottom navigation if there are no menu items
    if (menuItems.length === 0) {
        return null;
    }

    const isPathActive = (itemPath, currentPathname, allMenuItems) => {
        const normalizedPathname = currentPathname.endsWith('/') ? currentPathname.slice(0, -1) : currentPathname;
        const normalizedItemPath = itemPath.endsWith('/') ? itemPath.slice(0, -1) : itemPath;
        
        if (normalizedPathname === normalizedItemPath) return true;
        
        if (normalizedPathname.startsWith(normalizedItemPath + '/')) {
            const hasMoreSpecificMatch = allMenuItems.some(otherItem => {
                if (otherItem.path === itemPath) return false;
                const normalizedOtherPath = otherItem.path.endsWith('/') ? otherItem.path.slice(0, -1) : otherItem.path;
                if (normalizedOtherPath.startsWith(normalizedItemPath + '/')) {
                    return normalizedPathname === normalizedOtherPath || 
                           normalizedPathname.startsWith(normalizedOtherPath + '/');
                }
                return false;
            });
            return !hasMoreSpecificMatch;
        }
        return false;
    };

    const checkIsActive = (item) => {
        if (item.key === 'files') {
            return pathname === '/dashboard/files' || 
                   pathname === '/dashboard/files/' ||
                   pathname.startsWith('/dashboard/files/') ||
                   pathname === '/Promoter/files' || 
                   pathname === '/Promoter/files/' ||
                   pathname.startsWith('/Promoter/files/');
        }
        if (item.key === 'channels') {
            return pathname === '/Promoter/channels' || 
                   pathname === '/Promoter/channels/' ||
                   pathname.startsWith('/Promoter/channels/');
        }
        return isPathActive(item.path, pathname, menuItems);
    };

    return (
        <nav className="bottom-navigation" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bottom-navigation__container">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = checkIsActive(item);
                    
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
            </div>
        </nav>
    );
}