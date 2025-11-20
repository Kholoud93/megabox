import React, { useState, useEffect } from 'react'
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
    HiCurrencyDollar,
    HiChevronDown
} from "react-icons/hi2";
import { FiGlobe } from 'react-icons/fi';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useQuery } from 'react-query';
import { notificationService, userService } from '../../services';
import { fileService } from '../../services/api';
import axios from 'axios';
import { API_URL } from '../../services/api';
import { getFileCategory } from '../../helpers/MimeType';
import Represents from '../Represents/Represents';

export default function Sidenav({ role }) {
    const [collapsed, setcollapsed] = useState(false)
    const [Hide, setHide] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [folderFiles, setFolderFiles] = useState({});
    const [allFilesOpen, setAllFilesOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [ShowRepresent, setRepresents] = useState(false);
    const [Path, setPath] = useState();
    const [fileType, setfileType] = useState();
    const { pathname } = useLocation();
    const navigate = useNavigate()
    const { setUserRole } = useAuth();
    const { t, language, changeLanguage } = useLanguage();
    const [Token] = useCookies(['MegaBox']);

    const [, , removeToken] = useCookies(['MegaBox']);

    const Representation = (path, type, close) => {
        if (close) {
            setPath(null)
            setfileType(null);
            setRepresents(false);
            return
        } else {
            setPath(path);
            setfileType(type);
            setRepresents(!ShowRepresent)
        }
    };

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

    // Get folders for User role
    const GetFolders = async () => {
        if (!Token.MegaBox || role !== "User") return { folders: [] };
        try {
            const { data } = await axios.get(`${API_URL}/user/getUserFolders`, {
                headers: { Authorization: `Bearer ${Token.MegaBox}` }
            });
            return data || { folders: [] };
        } catch (error) {
            return { folders: [] };
        }
    };

    const { data: foldersData } = useQuery(
        ['userFolders'],
        GetFolders,
        {
            enabled: !!Token.MegaBox && role === "User",
            retry: false
        }
    );

    // Get files for User role
    const GetFiles = async () => {
        if (!Token.MegaBox || role !== "User") return { files: [] };
        try {
            const data = await fileService.getAllFiles(Token.MegaBox);
            return data || { files: [] };
        } catch (error) {
            return { files: [] };
        }
    };

    const { data: filesData } = useQuery(
        ['userFiles'],
        GetFiles,
        {
            enabled: !!Token.MegaBox && role === "User",
            retry: false
        }
    );

    const handleFileClick = (file) => {
        const fileCategory = getFileCategory(file?.fileType);
        const fileUrl = file?.url || file?.fileUrl;
        
        // If it's an image or video, open it directly
        if (fileCategory === 'image' || fileCategory === 'video') {
            Representation(fileUrl, file?.fileType, false);
            handleHide();
        } else {
            // For other files, navigate to file page
            const filePath = isPromoter ? '/Promoter/file' : '/dashboard/file';
            navigate(`${filePath}/${encodeURIComponent(file?.fileName || file?.name)}/${file?._id || file?.id}`);
            handleHide();
        }
    };

    const handleFolderClick = (folder, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const folderId = folder?._id || folder?.id;
        const folderName = folder?.name;
        const filePath = isPromoter ? '/Promoter/file' : '/dashboard/file';
        navigate(`${filePath}/${encodeURIComponent(folderName)}/${folderId}`);
        handleHide();
    };

    // Filter files that are not in any folder
    const filesNotInFolders = filesData?.files?.filter(file => !file.folderId && !file.folder) || [];

    const Logout = () => {
        removeToken("MegaBox", {
            path: '/',
        })
        setUserRole(null)
        navigate('/Login')
    }

    const toggleLanguage = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const newLang = language === 'en' ? 'ar' : 'en';
        changeLanguage(newLang);
    }



    const handleHide = () => {
        setHide(!Hide)
    }
    const handleICon = () => {
        setcollapsed(!collapsed);
    }

    // Close All Files and folders when sidebar is collapsed
    useEffect(() => {
        if (collapsed) {
            setAllFilesOpen(false);
            setExpandedFolders({});
            setUserMenuOpen(false);
        }
    }, [collapsed]);

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
                                {/* Files and Folders Tree */}
                                <SubMenu
                                    label={t("sidenav.allFiles")}
                                    icon={<HiFolder className="icon transition ease-linear" />}
                                    className="sidenav-files-submenu"
                                    open={!collapsed && allFilesOpen}
                                    onOpenChange={(open) => {
                                        // Prevent opening when collapsed
                                        if (collapsed) {
                                            setAllFilesOpen(false);
                                            return;
                                        }
                                        setAllFilesOpen(open);
                                    }}
                                >
                                    {/* Folders */}
                                    {foldersData?.folders?.map((folder) => {
                                        const folderId = folder?._id || folder?.id;
                                        const isExpanded = expandedFolders[folderId];
                                        const files = folderFiles[folderId] || [];
                                        
                                        return (
                                            <SubMenu
                                                key={folderId}
                                                label={folder?.name}
                                                icon={
                                                    <div className="sidenav-folder-wrapper">
                                                        <svg className="sidenav-files-tree-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                                                            <path d="M3 6C3 4.89543 3.89543 4 5 4H8.58579C8.851 4 9.10536 4.10536 9.29289 4.29289L10.7071 5.70711C10.8946 5.89464 11.149 6 11.4142 6H15C16.1046 6 17 6.89543 17 8V14C17 15.1046 16.1046 16 15 16H5C3.89543 16 3 15.1046 3 14V6Z" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" />
                                                        </svg>
                                                    </div>
                                                }
                                                className="sidenav-folder-submenu"
                                                open={isExpanded}
                                                onOpenChange={async (open) => {
                                                    setExpandedFolders(prev => ({
                                                        ...prev,
                                                        [folderId]: open
                                                    }));
                                                    
                                                    // If opening folder and files not loaded, fetch them
                                                    if (open && !folderFiles[folderId]) {
                                                        try {
                                                            const { data } = await axios.get(`${API_URL}/user/getFolderFiles/${folderId}`, {
                                                                headers: { Authorization: `Bearer ${Token.MegaBox}` }
                                                            });
                                                            setFolderFiles(prev => ({
                                                                ...prev,
                                                                [folderId]: data?.files || []
                                                            }));
                                                        } catch (error) {
                                                            setFolderFiles(prev => ({
                                                                ...prev,
                                                                [folderId]: []
                                                            }));
                                                        }
                                                    }
                                                }}
                                            >
                                                {files.map((file) => (
                                                    <MenuItem
                                                        key={file?._id || file?.id}
                                                        className="sidenav-files-tree-item sidenav-files-tree-item--file"
                                                        onClick={() => handleFileClick(file)}
                                                        icon={
                                                            <svg className="sidenav-files-tree-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                                                                <path d="M4 4C4 2.89543 4.89543 2 6 2H10.5858C10.851 2 11.1054 2.10536 11.2929 2.29289L15.7071 6.70711C15.8946 6.89464 16 7.149 16 7.41421V16C16 17.1046 15.1046 18 14 18H6C4.89543 18 4 17.1046 4 16V4Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5"/>
                                                            </svg>
                                                        }
                                                    >
                                                        {file?.fileName || file?.name}
                                                    </MenuItem>
                                                ))}
                                                {files.length === 0 && isExpanded && (
                                                    <div className="sidenav-empty-folder">
                                                        {t("sidenav.emptyFolder") || "Empty folder"}
                                                    </div>
                                                )}
                                            </SubMenu>
                                        );
                                    })}
                                    
                                    {/* Files not in folders */}
                                    {filesNotInFolders.slice(0, 50).map((file) => (
                                        <MenuItem
                                            key={file?._id || file?.id}
                                            className="sidenav-files-tree-item sidenav-files-tree-item--file"
                                            onClick={() => handleFileClick(file)}
                                            icon={
                                                <svg className="sidenav-files-tree-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                                                    <path d="M4 4C4 2.89543 4.89543 2 6 2H10.5858C10.851 2 11.1054 2.10536 11.2929 2.29289L15.7071 6.70711C15.8946 6.89464 16 7.149 16 7.41421V16C16 17.1046 15.1046 18 14 18H6C4.89543 18 4 17.1046 4 16V4Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5"/>
                                                </svg>
                                            }
                                        >
                                            {file?.fileName || file?.name}
                                        </MenuItem>
                                    ))}
                                </SubMenu>
                            </>
                        ) : role === "Owner" ? (
                            <>
                                <MenuItem onClick={handleHide} className={pathname === "/Owner/profile" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Owner/profile' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.profile") : ""}></Link>}
                                    icon={<HiUserCircle className={pathname === "/Owner/profile" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}
                                    data-tooltip={collapsed ? t("sidenav.profile") : ""}>
                                    {t("sidenav.profile")}
                                </MenuItem>

                                {/* Notifications - Owner */}
                                <MenuItem onClick={handleHide} className={pathname === "/Owner/notifications" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Owner/notifications' className='Remove_hover transition ease-linear' data-tooltip={collapsed ? t("sidenav.notifications") : ""}></Link>}
                                    icon={
                                        <div className="relative">
                                            <HiBell className={pathname === "/Owner/notifications" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />
                                        </div>
                                    }
                                    data-tooltip={collapsed ? t("sidenav.notifications") : ""}>
                                    {t("sidenav.notifications")}
                                </MenuItem>

                                <div className="sidenav-bottom-actions">
                                    <MenuItem
                                        className="ps-menuitem-root menu-items css-1t8x7v1 rounded-lg text-base text-white font-medium LanguageToggle"
                                        icon={<FiGlobe className="icon" />}
                                        onClick={toggleLanguage}
                                        data-tooltip={collapsed ? (language === 'en' ? t("navbar.arabic") : t("navbar.english")) : ""}
                                    >
                                        {!collapsed && (language === 'en' ? t("navbar.arabic") : t("navbar.english"))}
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

                                <div className="sidenav-bottom-actions">
                                    <MenuItem
                                        className="ps-menuitem-root menu-items css-1t8x7v1 rounded-lg text-base text-white font-medium LanguageToggle"
                                        icon={<FiGlobe className="icon" />}
                                        onClick={toggleLanguage}
                                        data-tooltip={collapsed ? (language === 'en' ? t("navbar.arabic") : t("navbar.english")) : ""}
                                    >
                                        {!collapsed && (language === 'en' ? t("navbar.arabic") : t("navbar.english"))}
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

        {/* File Preview Modal */}
        {ShowRepresent && (
            <Represents 
                path={Path} 
                type={fileType} 
                ToggleUploadFile={() => Representation("", "", true)} 
            />
        )}

    </>
}