import React, { useState, useEffect, useRef } from 'react'
import { Folder } from '../../../components/Folder/Folder'
import File from '../../../components/File/File'
import { HiOutlinePlus } from "react-icons/hi2";
import { LuFolderPlus, LuFolder } from "react-icons/lu";
import { HiViewGrid, HiViewList } from "react-icons/hi";
import UploadFile from '../../../components/Upload/UploadFile/UploadFile';
import UploadOptions from '../../../components/Upload/UploadOptions/UploadOptions';
import UploadFromMegaBox from '../../../components/Upload/UploadFromMegaBox/UploadFromMegaBox';
import { AnimatePresence } from 'framer-motion';
import AddFolder from '../../../components/Upload/AddFolder/AddFolder';
import axios from 'axios';
import { API_URL } from '../../../services/api';
import { useCookies } from 'react-cookie';
import { useQuery, useQueryClient } from 'react-query';
import { getFileCategory } from '../../../helpers/MimeType';
import Represents from '../../../components/Represents/Represents';
import ChangeName from '../../../components/ChangeName/ChangeName';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { fileService, userService } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import ShareLinkModal from '../../../components/ShareLinkModal/ShareLinkModal';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { HiUserCircle, HiArrowRightOnRectangle, HiUserGroup, HiCurrencyDollar } from 'react-icons/hi2';
import { FiGlobe } from 'react-icons/fi';
import { FaUser } from 'react-icons/fa';
import './Files.scss';

export default function Files() {
    const { t, language, changeLanguage } = useLanguage();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { setUserRole } = useAuth();
    const [Token, , removeToken] = useCookies(['MegaBox']);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [profileImageError, setProfileImageError] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0, left: 0 });
    const profileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);
    
    // Calculate dropdown position and close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        
        if (profileMenuOpen && profileButtonRef.current) {
            const rect = profileButtonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
                left: rect.left
            });
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileMenuOpen]);

    const Active = "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const InActive = "inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

    const [AddFileShow, setAddFileShow] = useState(false);
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [showUploadFromMegaBox, setShowUploadFromMegaBox] = useState(false);
    const [AddFolderAdding, setAddFolderAdding] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [shareTitle, setShareTitle] = useState('');

    const ToggleShowAddFile = () => setAddFileShow(!AddFileShow);
    const ToggleUploadOptions = () => setShowUploadOptions(!showUploadOptions);
    const ToggleUploadFromMegaBox = () => setShowUploadFromMegaBox(!showUploadFromMegaBox);
    const ToggleFolderAdding = () => setAddFolderAdding(!AddFolderAdding);

    const handleSelectDesktop = () => {
        setAddFileShow(true);
    };

    const handleSelectMegaBox = () => {
        setShowUploadFromMegaBox(true);
    };

    const [FilterKey, setFilterKey] = useState('All');
    const queryClient = useQueryClient();
    
    // Get user data for profile
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            retry: false
        }
    );
    
    const isPromoter = userData?.isPromoter === "true" || userData?.isPromoter === true;
    
    const Logout = () => {
        removeToken("MegaBox", {
            path: '/',
        });
        setUserRole(null);
        navigate('/Login');
    };
    
    const toggleLanguage = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const newLang = language === 'en' ? 'ar' : 'en';
        changeLanguage(newLang);
    };

    // get files - using separate APIs for each group
    const GetFiles = async ({ queryKey }) => {
        const [, filterKey] = queryKey;
        const token = Token.MegaBox;

        try {
            let data;

            // Use the appropriate API function based on filter
            switch (filterKey.toLowerCase()) {
                case 'image':
                    data = await fileService.getImageFiles(token);
                    break;
                case 'video':
                    data = await fileService.getVideoFiles(token);
                    break;
                case 'document':
                    data = await fileService.getDocumentFiles(token);
                    break;
                case 'zip':
                    data = await fileService.getZipFiles(token);
                    break;
                case 'archived':
                    data = await fileService.getArchivedFiles(token);
                    break;
                case 'all':
                default:
                    data = await fileService.getAllFiles(token);
                    break;
            }

            return data || { files: [] };
        } catch (error) {
            console.error('Error fetching files:', error);
            return { files: [] };
        }
    };

    const { data, refetch, isLoading: filesLoading } = useQuery(["GetUserFiles", FilterKey], GetFiles);

    // get folders 
    const Getfolders = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${Token.MegaBox}`,
            },
        };

        const { data } = await axios.get(`${API_URL}/user/getUserFolders`, config);
        return data;
    };

    const { data: folders, refetch: refFolders, isLoading: foldersLoading } = useQuery("GetUserFolders", Getfolders);

    const SelectFilter = async (type) => {
        setFilterKey(type);
    }

    const [ShowRepresent, setRepresents] = useState(false);
    const [Path, setPath] = useState();
    const [fileType, setfileType] = useState();

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
    }

    const [ShowUpdateName, setupdateName] = useState(false);
    const [OldName, setOldName] = useState(null);
    const [FileId, setFileId] = useState(null);
    const [IsFolder, setIsFolder] = useState(false);

    const ToggleNameChange = (name, close, id, isFolder = false) => {
        if (close) {
            setupdateName(!ShowUpdateName);
            return;
        }
        setFileId(id)
        setOldName(name)
        setIsFolder(isFolder)
        setupdateName(!ShowUpdateName);
    }

    const DeleteFolder = async (folderId) => {
        try {
            const response = await axios.delete(`${API_URL}/user/deleteFolder/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${Token.MegaBox}`
                }
            });
            if (response.status === 200 || response.data?.message?.includes('نجاح')) {
                toast.success(t("files.folderDeletedSuccess"), ToastOptions("success"));
                refFolders();
            }
        } catch (error) {
            toast.error(t("files.folderDeleteFailed"), ToastOptions("error"));
        }
    }

    const ArchiveFolder = async (folderId) => {
        try {
            await userService.archiveFolder(folderId, Token.MegaBox);
            toast.success("Folder archived successfully", ToastOptions("success"));
            refFolders();
        } catch (error) {
            toast.error("Failed to archive folder", ToastOptions("error"));
        }
    }

    const ShareFile = async (id, isFolder = false) => {
        try {
            if (isFolder) {
                // Share folder
                const response = await axios.post(`${API_URL}/user/generateFolderShareLink`, {
                    folderId: id
                }, {
                    headers: {
                        'Authorization': `Bearer ${Token.MegaBox}`
                    }
                });
                // Handle both shareUrl and shareLink properties
                const link = response.data?.shareUrl || response.data?.shareLink;
                if (link) {
                    setShareUrl(link);
                    setShareTitle("Share Folder");
                    setShowShareModal(true);
                } else {
                    toast.error("Failed to generate share link", ToastOptions("error"));
                }
            } else {
                // Share file
                const response = await axios.post(`${API_URL}/auth/generateShareLink`, {
                    fileId: id
                }, {
                    headers: {
                        'Authorization': `Bearer ${Token.MegaBox}`
                    }
                });
                // Handle both shareUrl and shareLink properties
                const link = response.data?.shareUrl || response.data?.shareLink || response.data?.data?.shareLink || response.data?.data?.shareUrl;
                if (link) {
                    setShareUrl(link);
                    setShareTitle("Share File");
                    setShowShareModal(true);
                } else {
                    toast.error("Failed to generate share link", ToastOptions("error"));
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate share link", ToastOptions("error"));
        }
    }

    // Get archived files count separately
    const GetArchivedFilesCount = async () => {
        try {
            const data = await fileService.getArchivedFiles(Token.MegaBox);
            return data?.files?.length || 0;
        } catch (error) {
            return 0;
        }
    };

    const { data: archivedData } = useQuery("GetArchivedFilesCount", GetArchivedFilesCount, {
        refetchInterval: false,
        staleTime: 30000, // Cache for 30 seconds
    });

    const filterOptions = [
        { key: "All", label: t("files.allFiles"), count: data?.files?.length || 0 },
        { key: "image", label: t("files.images"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'image')?.length || 0 },
        { key: "video", label: t("files.videos"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'video')?.length || 0 },
        { key: "document", label: t("files.documents"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'document')?.length || 0 },
        { key: "zip", label: t("files.zipFolders"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'zip')?.length || 0 },
        { key: "archived", label: t("files.archived"), count: archivedData || 0 },
    ];

    return <>
        <div className="min-h-screen bg-indigo-50" style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Header Section */}
            <div className="files-header">
                <div className="files-header__container">
                    <div className="files-header__content">
                        <div className="files-header__left">
                            <svg
                                className="files-header__icon"
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48">
                                        <stop offset="0%" stopColor="var(--color-indigo-400)" />
                                        <stop offset="50%" stopColor="var(--color-indigo-500)" />
                                        <stop offset="100%" stopColor="var(--color-indigo-600)" />
                                    </linearGradient>
                                    <linearGradient id="logoGradient2" x1="0" y1="0" x2="48" y2="48">
                                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
                                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.85)" />
                                    </linearGradient>
                                </defs>
                                <rect width="48" height="48" rx="12" fill="url(#logoGradient)" />
                                <path d="M24 12C18.5 12 14 16.5 14 22C14 22.5 14 23 14.1 23.5C12.3 24.2 11 25.8 11 27.5C11 29.7 12.8 31.5 15 31.5H33C35.2 31.5 37 29.7 37 27.5C37 25.8 35.7 24.2 33.9 23.5C34 23 34 22.5 34 22C34 16.5 29.5 12 24 12Z" fill="url(#logoGradient2)" />
                                <rect x="16" y="16" width="16" height="16" rx="2.5" fill="var(--color-indigo-600)" opacity="0.95" />
                                <rect x="20" y="20" width="8" height="8" rx="1.5" fill="white" opacity="0.9" />
                                <line x1="16" y1="16" x2="16" y2="32" stroke="white" strokeWidth="2.5" opacity="0.8" />
                                <line x1="32" y1="16" x2="32" y2="32" stroke="white" strokeWidth="2.5" opacity="0.8" />
                                <line x1="16" y1="16" x2="32" y2="16" stroke="white" strokeWidth="2.5" opacity="0.8" />
                                <line x1="16" y1="24" x2="32" y2="24" stroke="white" strokeWidth="2" opacity="0.6" />
                                <line x1="24" y1="16" x2="24" y2="32" stroke="white" strokeWidth="2" opacity="0.6" />
                            </svg>
                            <div className="files-header__text">
                                <h1 className="files-header__title">{t("files.headerTitle")}</h1>
                                <p className="files-header__subtitle">{t("files.headerSubtitle")}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="files-header__actions">
                            <button
                                className="files-header__button"
                                onClick={ToggleUploadOptions}
                            >
                                <HiOutlinePlus className="files-header__button-icon" />
                                {t("files.uploadFile")}
                            </button>
                            <button
                                className="files-header__button"
                                onClick={ToggleFolderAdding}
                            >
                                <LuFolderPlus className="files-header__button-icon" />
                                {t("files.newFolder")}
                            </button>
                            
                            {/* Profile Menu */}
                            <div className="files-header__profile-menu" ref={profileMenuRef}>
                                <button
                                    ref={profileButtonRef}
                                    className="files-header__profile-button"
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                >
                                    {userData?.profilePic && typeof userData.profilePic === 'string' && userData.profilePic.trim() !== '' && !profileImageError ? (
                                        <img
                                            src={userData.profilePic}
                                            alt="Profile"
                                            className="files-header__profile-image"
                                            onError={() => setProfileImageError(true)}
                                        />
                                    ) : (
                                        <div className="files-header__profile-placeholder">
                                            <FaUser className="files-header__profile-icon" />
                                        </div>
                                    )}
                                </button>
                                
                                {profileMenuOpen && (
                                    <div 
                                        className="files-header__profile-dropdown"
                                        style={{
                                            position: 'fixed',
                                            top: `${dropdownPosition.top}px`,
                                            right: language === 'ar' ? 'auto' : `${dropdownPosition.right}px`,
                                            left: language === 'ar' ? `${dropdownPosition.left}px` : 'auto',
                                            zIndex: 10000
                                        }}
                                    >
                                        <Link
                                            to={isPromoter ? '/Promoter/profile' : '/dashboard/profile'}
                                            className="files-header__profile-item"
                                            onClick={() => setProfileMenuOpen(false)}
                                        >
                                            <HiUserCircle className="files-header__profile-item-icon" />
                                            <span>{t("sidenav.profile")}</span>
                                        </Link>
                                        
                                        {!isPromoter && (
                                            <Link
                                                to="/Partners"
                                                className="files-header__profile-item"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <HiCurrencyDollar className="files-header__profile-item-icon" />
                                                <span>{t("sidenav.subscribe") || "Subscribe"}</span>
                                            </Link>
                                        )}
                                        
                                        {isPromoter && (
                                            <Link
                                                to="/Partners"
                                                className="files-header__profile-item"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <HiUserGroup className="files-header__profile-item-icon" />
                                                <span>{t("sidenav.partners") || "Partners Center"}</span>
                                            </Link>
                                        )}
                                        
                                        <button
                                            className="files-header__profile-item"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleLanguage(e);
                                                setProfileMenuOpen(false);
                                            }}
                                        >
                                            <FiGlobe className="files-header__profile-item-icon" />
                                            <span>{language === 'en' ? t("navbar.arabic") : t("navbar.english")}</span>
                                        </button>
                                        
                                        <button
                                            className="files-header__profile-item"
                                            onClick={() => {
                                                Logout();
                                                setProfileMenuOpen(false);
                                            }}
                                        >
                                            <HiArrowRightOnRectangle className="files-header__profile-item-icon" />
                                            <span>{t("sidenav.logout")}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="files-content max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Folders Section */}
                <div className="mb-8 sm:mb-10 md:mb-12">
                    <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{t("files.folders")}</h2>
                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-indigo-700" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {foldersLoading ? t("files.loadingFolders") : `${folders?.folders?.length || 0} ${t("files.foldersCount")}`}
                            </p>
                        </div>
                    </div>

                    {foldersLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-lg h-24 sm:h-28 md:h-32"></div>
                                    <div className="mt-2 sm:mt-3 bg-gray-200 rounded h-3 sm:h-4 w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : folders?.folders?.length === 0 ? (
                        <div className="text-center py-8 sm:py-10 md:py-12 px-4">
                            <LuFolder className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-indigo-400" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                            <h3 className="mt-2 text-sm font-medium text-indigo-900 drop-shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{t("files.noFolders")}</h3>
                            <p className="mt-1 text-xs sm:text-sm text-indigo-700 px-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{t("files.noFoldersMessage")}</p>
                            <div className="mt-4 sm:mt-6">
                                <button
                                    onClick={ToggleFolderAdding}
                                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-indigo-600 shadow-lg text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                    style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                                >
                                    <LuFolderPlus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    {t("files.createFolder")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
                            {folders?.folders?.map((ele, index) => (
                                <Folder
                                    key={ele?._id || ele?.id || `folder-${index}`}
                                    name={ele?.name}
                                    data={ele}
                                    onRename={(name, close, id) => ToggleNameChange(name, close, id, true)}
                                    onDelete={DeleteFolder}
                                    onShare={(id) => ShareFile(id, true)}
                                    onArchive={ArchiveFolder}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Files Section */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 md:mb-6 gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{t("files.files")}</h2>
                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-indigo-700" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {filesLoading ? t("files.loadingFiles") : `${data?.files?.length || 0} ${t("files.filesCount")}`}
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="text-xs sm:text-sm text-indigo-700 mr-1 sm:mr-2 hidden xs:inline" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{t("files.view")}</span>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                    ? 'bg-indigo-600 border-2 border-indigo-700 text-white'
                                    : 'bg-white border-2 border-indigo-300 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400'
                                    }`}
                            >
                                <HiViewGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${viewMode === 'list'
                                    ? 'bg-indigo-600 border-2 border-indigo-700 text-white'
                                    : 'bg-white border-2 border-indigo-300 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400'
                                    }`}
                            >
                                <HiViewList className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border border-indigo-200 p-0.5 sm:p-1 mb-4 sm:mb-5 md:mb-6 overflow-x-auto">
                        <div className="flex flex-wrap gap-0.5 sm:gap-1 min-w-max sm:min-w-0">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => SelectFilter(option.key)}
                                    className={`flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${FilterKey === option.key ? Active : InActive
                                        }`}
                                >
                                    <span className="hidden sm:inline">{option.label}</span>
                                    <span className="sm:hidden">{option.label.split(' ')[0]}</span>
                                    <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${FilterKey === option.key
                                        ? 'bg-white bg-opacity-20 text-white'
                                        : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                        {option.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Files Grid/List */}
                    {filesLoading ? (
                        <div className={`grid gap-4 sm:gap-5 md:gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                            : 'grid-cols-1'
                            }`}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-lg h-24 sm:h-28 md:h-32"></div>
                                    <div className="mt-2 sm:mt-3 bg-gray-200 rounded h-3 sm:h-4 w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : data?.files?.length === 0 ? (
                        <div className="text-center py-8 sm:py-10 md:py-12 bg-white rounded-lg border-2 border-dashed border-indigo-300 px-4">
                            <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-indigo-400" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-indigo-900 drop-shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{t("files.noFilesFound")}</h3>
                            <p className="mt-1 text-xs sm:text-sm text-indigo-700 px-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {FilterKey === 'All'
                                    ? t("files.noFilesMessage")
                                    : t("files.noFilesTypeMessage").replace("{type}", t(`files.${FilterKey === 'image' ? 'images' : FilterKey === 'video' ? 'videos' : FilterKey === 'document' ? 'documents' : FilterKey === 'zip' ? 'zipFolders' : 'archived'}`).toLowerCase())
                                }
                            </p>
                            {FilterKey === 'All' && (
                                <div className="mt-4 sm:mt-6">
                                    <button
                                        onClick={ToggleUploadOptions}
                                        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                        style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                                    >
                                        <HiOutlinePlus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        {t("files.uploadFile")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`grid gap-4 sm:gap-5 md:gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                            : 'grid-cols-1'
                            }`}>
                            {data?.files?.map((ele, index) => (
                                <File
                                    key={ele?._id || ele?.id || `file-${index}`}
                                    Type={getFileCategory(ele?.fileType)}
                                    data={ele}
                                    Representation={Representation}
                                    refetch={() => {
                                        refetch();
                                        queryClient.invalidateQueries("GetArchivedFilesCount");
                                    }}
                                    onRename={ToggleNameChange}
                                    onShare={ShareFile}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <AnimatePresence>
            {showUploadOptions && (
                <UploadOptions 
                    key="upload-options" 
                    onClose={ToggleUploadOptions}
                    onSelectDesktop={handleSelectDesktop}
                    onSelectMegaBox={handleSelectMegaBox}
                />
            )}
            {AddFileShow && <UploadFile key="upload-file" ToggleUploadFile={ToggleShowAddFile} refetch={refetch} />}
            {showUploadFromMegaBox && (
                <UploadFromMegaBox 
                    key="upload-from-megabox" 
                    ToggleUploadFile={ToggleUploadFromMegaBox} 
                    refetch={refetch} 
                />
            )}
            {AddFolderAdding && <AddFolder key="add-folder" ToggleUploadFile={ToggleFolderAdding} refetch={refFolders} />}
            {ShowRepresent && <Represents key="represents" path={Path} type={fileType} ToggleUploadFile={() => Representation("", "", true)} />}
            {ShowUpdateName && (
                <ChangeName
                    key="change-name"
                    oldFileName={OldName}
                    Toggle={ToggleNameChange}
                    refetch={IsFolder ? refFolders : refetch}
                    FileId={FileId}
                    isFolder={IsFolder}
                />
            )}
            {showShareModal && (
                <ShareLinkModal
                    key="share-link-modal"
                    isOpen={showShareModal}
                    onClose={() => {
                        setShowShareModal(false);
                        setShareUrl('');
                    }}
                    shareUrl={shareUrl}
                    title={shareTitle}
                />
            )}
        </AnimatePresence>
    </>
}
