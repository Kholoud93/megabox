import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    HiBars3,
    HiCreditCard,
    HiServer,
    HiArrowDownTray,
    HiEye
} from "react-icons/hi2";
import { useLanguage } from '../../context/LanguageContext';
import './BottomNavigation.scss';

export default function BottomNavigation({ role, isPromoter, userData }) {
    const { t, language } = useLanguage();
    const { pathname } = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Toggle dropdown
    const toggleDropdown = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropdownOpen(prev => !prev);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isDropdownOpen) return;

        const handleClickOutside = (event) => {
            // Check if click is outside both button and dropdown
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        // Add delay to prevent immediate closure
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside, { passive: true });
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Close dropdown when route changes
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [pathname]);

    const getMenuItems = () => {
        if (role === "User") {
            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                return [
                    {
                        path: '/dashboard/revenue-data',
                        icon: HiChartBar,
                        label: t("sidenav.revenueData"),
                        key: 'revenue'
                    },
                    {
                        path: '/dashboard/shared-files',
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
                        path: '/dashboard/Earnings',
                        icon: HiCurrencyDollar,
                        label: t("sidenav.withdraw"),
                        key: 'withdraw'
                    },
                    {
                        path: '/dashboard/referral',
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
                    path: '/dashboard/shared-files',
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
            }

            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                items.push({
                    path: '/dashboard/revenue-data',
                    icon: HiChartBar,
                    label: t("sidenav.revenueData"),
                    key: 'revenue'
                });
            }

            if (isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) {
                items.push({
                    path: '/dashboard/Earnings',
                    icon: HiChartBar,
                    label: t("sidenav.earnings"),
                    key: 'earnings'
                });
            }

            items.push({
                path: '/dashboard/referral',
                icon: HiUserGroup,
                label: t("sidenav.referral"),
                key: 'referral'
            });

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
        } else if (role === "Advertiser") {
            return [
                { path: '/Partners', icon: HiHandRaised, label: t("sidenav.partners"), key: 'partners' }
            ];
        }
        return [];
    };

    const menuItems = getMenuItems();
    const visibleItems = menuItems.slice(0, 4); // Show 4 items + More button
    const overflowItems = menuItems.slice(4);

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
        return isPathActive(item.path, pathname, menuItems);
    };

    // Check if any overflow item is active
    const isOverflowActive = overflowItems.some(item => checkIsActive(item));

    return (
        <nav className="bottom-navigation" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bottom-navigation__container">
                {visibleItems.map((item) => {
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

                {overflowItems.length > 0 && (
                    <div className="bottom-navigation__more">
                        <button 
                            ref={buttonRef}
                            className={`bottom-navigation__more-button ${isDropdownOpen || isOverflowActive ? 'bottom-navigation__more-button--active' : ''}`}
                            onClick={toggleDropdown}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                            type="button"
                        >
                            <HiBars3 className="bottom-navigation__icon" />
                            <span className="bottom-navigation__label">{t("sidenav.more") || "More"}</span>
                        </button>

                        {isDropdownOpen && (
                            <div 
                                ref={dropdownRef}
                                className="bottom-navigation__dropdown bottom-navigation__dropdown--open"
                            >
                                {overflowItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = checkIsActive(item);
                                    
                                    return (
                                        <Link
                                            key={item.key}
                                            to={item.path}
                                            className={`bottom-navigation__dropdown-item ${isActive ? 'bottom-navigation__dropdown-item--active' : ''}`}
                                            onClick={() => setIsDropdownOpen(false)}
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
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}