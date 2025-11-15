import React, { useState } from 'react'
import './Sidenave.scss'
import {
    HiChevronLeft,
    HiChevronRight,
    HiBars3,
    HiArrowRightOnRectangle,
    HiUserCircle,
    HiFolder,
    HiShare,
    HiUsers,
    HiChartBar,
    HiUserGroup,
    HiDocumentText,
    HiHandRaised,
    HiBell,
    HiCurrencyDollar
} from "react-icons/hi2";
import { FiGlobe } from 'react-icons/fi';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQuery } from 'react-query';
import { notificationService, userService } from '../../services';

export default function Sidenav({ role }) {
    const [collapsed, setcollapsed] = useState(false)
    const [Hide, setHide] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate()
    const { setUserRole } = useAuth();
    const { t, language, changeLanguage } = useLanguage();
    const [Token] = useCookies(['MegaBox']);

    const [, , removeToken] = useCookies(['MegaBox']);

    // Get unread notifications count
    const { data: notificationsData } = useQuery(
        ['userNotifications'],
        () => notificationService.getUserNotifications(Token.MegaBox),
        {
            enabled: !!Token.MegaBox && role === "User",
            refetchInterval: 30000, // Refetch every 30 seconds
            retry: false
        }
    );

    const unreadCount = notificationsData?.notifications?.filter(n => !n.read).length ||
        notificationsData?.data?.filter(n => !n.read).length || 0;

    // Get user data to check if user is promoter
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(Token.MegaBox),
        {
            enabled: !!Token.MegaBox && role === "User",
            retry: false
        }
    );

    const isPromoter = userData?.isPromoter === "true" || userData?.isPromoter === true;

    const Logout = () => {
        removeToken("MegaBox", {
            path: '/',
        })
        setUserRole(null)
        navigate('/Login')
    }

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        changeLanguage(newLang);
    }



    const handleHide = () => {
        setHide(!Hide)
    }
    const handleICon = () => {
        setcollapsed(!collapsed)
    }

    return <>
        <div className={Hide ? "dropback apper-dropback" : "dropback"} onClick={handleHide}>
        </div>
        <aside className={Hide ? 'allnav' : 'allnav apper'} >
            <Sidebar collapsed={collapsed}>
                <Menu className='main-menu'>

                    <Menu className={collapsed ? 'collapsed main-side overflow-y-auto min-h-screen' :
                        'main-side p-1 overflow-y-auto min-h-screen'}>

                        <MenuItem
                            className="mb-3 rounded-lg text-xl mt-3 text-white cursor-pointer close"
                            onClick={handleICon}
                            icon={collapsed ? <HiBars3 className="text-lg" /> : (language === 'ar' ? <HiChevronRight className="text-lg" /> : <HiChevronLeft className="text-lg" />)}
                        ></MenuItem>

                        <Link to={'/'} className='flex justify-center items-center my-3 mb-4 sidenav-logo-container' style={{ display: "flex", justifyContent: "center", flexDirection: collapsed ? 'column' : 'row', gap: collapsed ? '0.5rem' : '0.75rem' }}>
                            <svg
                                className={collapsed ? 'Logo-colaps' : 'Logo'}
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient id="sidenavLogoGradient" x1="0" y1="0" x2="48" y2="48">
                                        <stop offset="0%" stopColor="var(--color-indigo-400)" />
                                        <stop offset="50%" stopColor="var(--color-indigo-500)" />
                                        <stop offset="100%" stopColor="var(--color-indigo-600)" />
                                    </linearGradient>
                                    <linearGradient id="sidenavLogoGradient2" x1="0" y1="0" x2="48" y2="48">
                                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
                                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.85)" />
                                    </linearGradient>
                                </defs>
                                <rect width="48" height="48" rx="12" fill="url(#sidenavLogoGradient)" />
                                <path d="M24 12C18.5 12 14 16.5 14 22C14 22.5 14 23 14.1 23.5C12.3 24.2 11 25.8 11 27.5C11 29.7 12.8 31.5 15 31.5H33C35.2 31.5 37 29.7 37 27.5C37 25.8 35.7 24.2 33.9 23.5C34 23 34 22.5 34 22C34 16.5 29.5 12 24 12Z" fill="url(#sidenavLogoGradient2)" />
                                <rect x="16" y="16" width="16" height="16" rx="2.5" fill="var(--color-indigo-600)" opacity="0.95" />
                                <rect x="20" y="20" width="8" height="8" rx="1.5" fill="white" opacity="0.9" />
                                <line x1="16" y1="16" x2="16" y2="32" stroke="white" strokeWidth="2.5" opacity="0.8" />
                                <line x1="32" y1="16" x2="32" y2="32" stroke="white" strokeWidth="2.5" opacity="0.8" />
                                <line x1="16" y1="16" x2="32" y2="16" stroke="white" strokeWidth="2.5" opacity="0.8" />
                                <line x1="16" y1="24" x2="32" y2="24" stroke="white" strokeWidth="2" opacity="0.6" />
                                <line x1="24" y1="16" x2="24" y2="32" stroke="white" strokeWidth="2" opacity="0.6" />
                            </svg>
                            {!collapsed && <span className="sidenav-logo-text">MegaBox</span>}
                        </Link>



                        {role === "User" ? (
                            <>
                                <MenuItem onClick={handleHide} className={pathname === "/dashboard/profile" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/profile' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.profile") : ""}></Link>}
                                    icon={<HiUserCircle className={pathname === "/dashboard/profile" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.profile") : ""}>
                                    {t("sidenav.profile")}
                                </MenuItem>

                                <MenuItem onClick={handleHide} className={pathname === "/dashboard" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.allFiles") : ""}></Link>}
                                    icon={<HiFolder className={pathname === "/dashboard" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.allFiles") : ""}>
                                    {t("sidenav.allFiles")}
                                </MenuItem>

                                {/* Show Earnings and Shared Files only for promoters with plans */}
                                {(isPromoter && (userData?.Downloadsplan === "true" || userData?.Downloadsplan === true || userData?.watchingplan === "true" || userData?.watchingplan === true)) && (
                                    <>
                                        <MenuItem onClick={handleHide} className={pathname === "/dashboard/Earnings" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/Earnings' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.earnings") : ""}></Link>}
                                            icon={<HiChartBar className={pathname === "/dashboard/Earnings" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                            data-tooltip={collapsed ? t("sidenav.earnings") : ""}>
                                            {t("sidenav.earnings")}
                                        </MenuItem>

                                        <MenuItem onClick={handleHide} className={pathname === "/dashboard/shared-files" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/shared-files' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.sharedFiles") : ""}></Link>}
                                            icon={<HiShare className={pathname === "/dashboard/shared-files" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                            data-tooltip={collapsed ? t("sidenav.sharedFiles") : ""}>
                                            {t("sidenav.sharedFiles")}
                                        </MenuItem>

                                        <MenuItem onClick={handleHide} className={pathname === "/dashboard/revenue-data" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/revenue-data' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.revenueData") : ""}></Link>}
                                            icon={<HiChartBar className={pathname === "/dashboard/revenue-data" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                            data-tooltip={collapsed ? t("sidenav.revenueData") : ""}>
                                            {t("sidenav.revenueData")}
                                        </MenuItem>
                                    </>
                                )}

                                {/* Referral - Available for all users */}
                                <MenuItem onClick={handleHide} className={pathname === "/dashboard/referral" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/referral' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.referral") : ""}></Link>}
                                    icon={<HiUserGroup className={pathname === "/dashboard/referral" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.referral") : ""}>
                                    {t("sidenav.referral")}
                                </MenuItem>

                                {isPromoter && (
                                    <MenuItem onClick={handleHide} className={pathname === "/Promoter" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Promoter' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.promoterDashboard") : ""}></Link>}
                                        icon={<HiCurrencyDollar className={pathname === "/Promoter" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                        data-tooltip={collapsed ? t("sidenav.promoterDashboard") : ""}>
                                        {t("sidenav.promoterDashboard")}
                                    </MenuItem>
                                )}

                                <MenuItem onClick={handleHide} className={pathname === "/Partners" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Partners' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.partners") : ""}></Link>}
                                    icon={<HiHandRaised className={pathname === "/Partners" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.partners") : ""}>
                                    {t("sidenav.partners")}
                                </MenuItem>

                                <MenuItem onClick={handleHide} className={pathname === "/dashboard/notifications" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/notifications' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.notifications") : ""}></Link>}
                                    icon={
                                        <div className="relative">
                                            <HiBell className={pathname === "/dashboard/notifications" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ fontSize: '10px', minWidth: '20px' }}>
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    }
                                    data-tooltip={collapsed ? t("sidenav.notifications") : ""}>
                                    {t("sidenav.notifications")}
                                    {!collapsed && unreadCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </MenuItem>

                                <div className="sidenav-bottom-actions">
                                    <MenuItem
                                        className="ps-menuitem-root menu-items css-1t8x7v1 rounded-lg text-base text-white font-medium LanguageToggle"
                                        icon={<FiGlobe className="icon" />}
                                        type={"button"}
                                        onClick={toggleLanguage}
                                        data-tooltip={collapsed ? (language === 'en' ? 'العربية' : 'English') : ""}
                                    >
                                        {!collapsed && (language === 'en' ? 'العربية' : 'English')}
                                    </MenuItem>

                                    <MenuItem
                                        className="ps-menuitem-root menu-items css-1t8x7v1 rounded-lg text-base text-white font-medium Logout"
                                        icon={<HiArrowRightOnRectangle className="icon" />}
                                        type={"button"}
                                        onClick={Logout}
                                        data-tooltip={collapsed ? t("sidenav.logout") : ""}
                                    >
                                        {!collapsed && t("sidenav.logout")}
                                    </MenuItem>
                                </div>
                            </>
                        ) : role === "Owner" ? (
                            <>
                                <MenuItem onClick={handleHide} className={pathname === "/Owner/Reports" ? 'menu-items  Active' : 'menu-items'} component={<Link to='Reports' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.reports") : ""}></Link>}
                                    icon={<HiDocumentText className={pathname === "Reports" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.reports") : ""}>
                                    {t("sidenav.reports")}
                                </MenuItem>

                                <MenuItem onClick={handleHide} className={pathname === "/Owner/Users" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Owner/Users' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.users") : ""}></Link>}
                                    icon={<HiUsers className={pathname === "/Owner/Users" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.users") : ""}>
                                    {t("sidenav.users")}
                                </MenuItem>

                                <MenuItem onClick={handleHide} className={pathname === "/Owner/AllPromoters" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Owner/AllPromoters' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.promoters") : ""}></Link>}
                                    icon={<HiUserGroup className={pathname === "/Owner/AllPromoters" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.promoters") : ""}>
                                    {t("sidenav.promoters")}
                                </MenuItem>

                                <MenuItem onClick={handleHide} className={pathname === "/Owner/profile" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Owner/profile' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.profile") : ""}></Link>}
                                    icon={<HiUserCircle className={pathname === "/Owner/profile" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.profile") : ""}>
                                    {t("sidenav.profile")}
                                </MenuItem>

                                <MenuItem onClick={handleHide} className={pathname === "/Partners" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Partners' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.partners") : ""}></Link>}
                                    icon={<HiHandRaised className={pathname === "/Partners" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.partners") : ""}>
                                    {t("sidenav.partners")}
                                </MenuItem>

                                <div className="sidenav-bottom-actions">
                                    <MenuItem
                                        className="ps-menuitem-root menu-items css-1t8x7v1 rounded-lg text-base text-white font-medium LanguageToggle"
                                        icon={<FiGlobe className="icon" />}
                                        type={"button"}
                                        onClick={toggleLanguage}
                                        data-tooltip={collapsed ? (language === 'en' ? 'العربية' : 'English') : ""}
                                    >
                                        {!collapsed && (language === 'en' ? 'العربية' : 'English')}
                                    </MenuItem>

                                    <MenuItem
                                        className="ps-menuitem-root menu-items css-1t8x7v1 rounded-lg text-base text-white font-medium Logout"
                                        icon={<HiArrowRightOnRectangle className="icon" />}
                                        type={"button"}
                                        onClick={Logout}
                                        data-tooltip={collapsed ? t("sidenav.logout") : ""}
                                    >
                                        {!collapsed && t("sidenav.logout")}
                                    </MenuItem>
                                </div>
                            </>
                        ) : role === "Advertiser" ? (
                            <>
                                <MenuItem onClick={handleHide} className={pathname === "/dashboard/profile" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/profile' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.profile") : ""}></Link>}
                                    icon={<HiUserCircle className={pathname === "/dashboard/profile" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.profile") : ""}>
                                    {t("sidenav.profile")}
                                </MenuItem>
                                <MenuItem onClick={handleHide} className={pathname === "/Partners" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Partners' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.partners") : ""}></Link>}
                                    icon={<HiHandRaised className={pathname === "/Partners" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.partners") : ""}>
                                    {t("sidenav.partners")}
                                </MenuItem>

                                <div className="sidenav-bottom-actions">
                                    <MenuItem
                                        className="ps-menuitem-root menu-items css-1t8x7v1 rounded-lg text-base text-white font-medium LanguageToggle"
                                        icon={<FiGlobe className="icon" />}
                                        type={"button"}
                                        onClick={toggleLanguage}
                                        data-tooltip={collapsed ? (language === 'en' ? 'العربية' : 'English') : ""}
                                    >
                                        {!collapsed && (language === 'en' ? 'العربية' : 'English')}
                                    </MenuItem>

                                    <MenuItem
                                        className="ps-menuitem-root menu-items css-1t8x7v1 rounded-lg text-base text-white font-medium Logout"
                                        icon={<HiArrowRightOnRectangle className="icon" />}
                                        type={"button"}
                                        onClick={Logout}
                                        data-tooltip={collapsed ? t("sidenav.logout") : ""}
                                    >
                                        {!collapsed && t("sidenav.logout")}
                                    </MenuItem>
                                </div>
                            </>
                        ) : null}







                    </Menu>

                </Menu>
            </Sidebar >
        </aside >

        <span className='bars' onClick={handleHide}>
            {Hide ? (language === 'ar' ? <HiChevronRight /> : <HiChevronLeft />) : <HiBars3 />}
        </span>

    </>
}