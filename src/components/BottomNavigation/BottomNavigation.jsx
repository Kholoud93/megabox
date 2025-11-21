import React, { useState, useRef, useEffect } from 'react';
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

    // Close dropdown when clicking outside or when route changes
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            // Use setTimeout to avoid immediate closure
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
                document.addEventListener('touchstart', handleClickOutside);
                document.addEventListener('click', handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Close dropdown when route changes
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [pathname]);

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
                    path: isPromoter ? '/Promoter/files' : '/dashboard/files',
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
                    path: '/Owner/Withdrawals',
                    icon: HiCurrencyDollar,
                    label: t("sidenav.withdrawals"),
                    key: 'withdrawals'
                },
                {
                    path: '/Owner/Payments',
                    icon: HiCreditCard,
                    label: t("sidenav.payments"),
                    key: 'payments'
                },
                {
                    path: '/Owner/Subscriptions',
                    icon: HiUserGroup,
                    label: t("sidenav.subscriptions"),
                    key: 'subscriptions'
                },
                {
                    path: '/Owner/Storage',
                    icon: HiServer,
                    label: t("sidenav.storage"),
                    key: 'storage'
                },
                {
                    path: '/Owner/DownloadsViews',
                    icon: HiArrowDownTray,
                    label: t("sidenav.downloadsViews"),
                    key: 'downloadsViews'
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

    // Helper function to check if a path is active
    // Only the most specific matching tab should be active
    const isPathActive = (itemPath, currentPathname, allMenuItems) => {
        const normalizedPathname = currentPathname.endsWith('/') ? currentPathname.slice(0, -1) : currentPathname;
        const normalizedItemPath = itemPath.endsWith('/') ? itemPath.slice(0, -1) : itemPath;
        
        // Exact match - always active
        if (normalizedPathname === normalizedItemPath) {
            return true;
        }
        
        // Check if pathname starts with item path + '/'
        if (normalizedPathname.startsWith(normalizedItemPath + '/')) {
            // Check if there's a more specific menu item that also matches
            // If yes, this item should not be active (only the most specific one should be)
            const hasMoreSpecificMatch = allMenuItems.some(otherItem => {
                if (otherItem.path === itemPath) return false; // Skip self
                const normalizedOtherPath = otherItem.path.endsWith('/') ? otherItem.path.slice(0, -1) : otherItem.path;
                
                // Check if other item is more specific (longer path) and also matches
                if (normalizedOtherPath.startsWith(normalizedItemPath + '/')) {
                    return normalizedPathname === normalizedOtherPath || 
                           normalizedPathname.startsWith(normalizedOtherPath + '/');
                }
                return false;
            });
            
            // Only active if no more specific match exists
            return !hasMoreSpecificMatch;
        }
        
        return false;
    };

    return (
        <nav className="bottom-navigation" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="bottom-navigation__container">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    let isActive = false;
                    
                    // Check for files tab first (most specific)
                    if (item.key === 'files') {
                        // For files tab, check both dashboard/files and Promoter/files
                        isActive = pathname === '/dashboard/files' || 
                                   pathname === '/dashboard/files/' ||
                                   pathname.startsWith('/dashboard/files/') ||
                                   pathname === '/Promoter/files' || 
                                   pathname === '/Promoter/files/' ||
                                   pathname.startsWith('/Promoter/files/');
                    } else {
                        // Use the helper function for all other items
                        isActive = isPathActive(item.path, pathname, menuItems);
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
                    <div className="bottom-navigation__more" ref={dropdownRef}>
                        <button 
                            className={`bottom-navigation__more-button ${isDropdownOpen ? 'bottom-navigation__more-button--active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDropdownOpen(prev => !prev);
                            }}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                            type="button"
                        >
                            <HiBars3 className="bottom-navigation__icon" />
                            <span className="bottom-navigation__label">{t("sidenav.more") || "More"}</span>
                        </button>
                        {isDropdownOpen && (
                            <div 
                                className="bottom-navigation__dropdown bottom-navigation__dropdown--open"
                                onClick={(e) => e.stopPropagation()}
                                style={{ display: 'flex' }}
                            >
                            {overflowItems.map((item) => {
                                const Icon = item.icon;
                                let isActive = false;
                                
                                // Check for files tab first (most specific)
                                if (item.key === 'files') {
                                    // For files tab, check both dashboard/files and Promoter/files
                                    isActive = pathname === '/dashboard/files' || 
                                               pathname === '/dashboard/files/' ||
                                               pathname.startsWith('/dashboard/files/') ||
                                               pathname === '/Promoter/files' || 
                                               pathname === '/Promoter/files/' ||
                                               pathname.startsWith('/Promoter/files/');
                                } else {
                                    // Use the helper function for all other items
                                    isActive = isPathActive(item.path, pathname, menuItems);
                                }
                                
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

