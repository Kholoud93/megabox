import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';

import { fileService, userService, promoterService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getFileCategory } from '../../helpers/MimeType';
import File from '../../components/File/File';
import Represents from '../../components/Represents/Represents';
import EmptyState from '../../components/EmptyState/EmptyState';
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { HiShare } from "react-icons/hi2";
import { FaShare, FaFolder, FaLink, FaArrowUp, FaArrowDown, FaQuestionCircle } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import { Folder } from '../../components/Folder/Folder';
import { useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import './SharedFiles.scss';
import '../RevenueData/RevenueData.scss';

// Shared Folder Card Component with Menu
const SharedFolderCard = ({ folder, folderId, folderName, sharedUrl, files, index, navigate, t }) => {
    const [Token] = useCookies(['MegaBox']);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const queryClient = useQueryClient();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showMenu &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleDisableShare = async () => {
        try {
            await userService.disableFolderShare(folderId, Token.MegaBox);
            // Invalidate shared files and folders queries
            queryClient.invalidateQueries(['sharedFilesByUser']);
            queryClient.invalidateQueries('GetSharedFolders');
            queryClient.invalidateQueries(['shareLinkAnalytics']);
            setShowMenu(false);
        } catch (error) {
            // Error is handled in the service, but ensure menu closes
            setShowMenu(false);
            console.error('Error disabling folder share:', error);
        }
    };

    const handleOpenFolder = async (e) => {
        // Don't trigger if clicking on dropdown menu or button
        if (menuRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (sharedUrl) {
            // Open shared folder using the original Branch.io link directly
            // If it's a Vercel URL, try to find the original Branch.io link
            let urlToOpen = sharedUrl;
            
            // If it's a Vercel URL, we need to get the original Branch.io link
            if (urlToOpen.includes('mega-box.vercel.app') || urlToOpen.includes('vercel.app')) {
                // Try to find Branch.io link in folder data first
                const branchLink = folder.branchUrl || 
                                  folder.branchLink || 
                                  folder.originalUrl || 
                                  folder.originalLink ||
                                  (folder.sharedUrl && folder.sharedUrl.includes('test-app.link') ? folder.sharedUrl : null) ||
                                  (folder.shareLink && folder.shareLink.includes('test-app.link') ? folder.shareLink : null);
                if (branchLink) {
                    urlToOpen = branchLink;
                } else {
                    // If not found in folder data, try to fetch it from the backend
                    try {
                        const response = await userService.generateFolderShareLink(folderId, Token.MegaBox);
                        const fetchedBranchLink = response?.shareUrl || response?.shareLink || response?.data?.shareUrl || response?.data?.shareLink;
                        if (fetchedBranchLink && (fetchedBranchLink.includes('test-app.link') || fetchedBranchLink.includes('app.link') || fetchedBranchLink.includes('branch.io'))) {
                            urlToOpen = fetchedBranchLink;
                        }
                    } catch (error) {
                        console.error('Error fetching Branch.io link for folder:', error);
                        // Fallback to opening the Vercel URL if we can't get Branch.io link
                    }
                }
            }
            
            // Open in new tab - use location.href to bypass React Router
            const newWindow = window.open('', '_blank', 'noopener,noreferrer');
            if (newWindow) {
                newWindow.location.href = urlToOpen;
            } else {
                // Fallback if popup blocked
                window.location.href = urlToOpen;
            }
        } else if (folderId) {
            // Navigate to folder preview if no shared URL
            navigate(`/video-preview/${folderId}?type=folder`);
        }
    };

    return (
        <motion.div
            className="bg-white rounded-lg border-2 border-indigo-200 p-4 hover:shadow-lg transition-shadow cursor-pointer relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={handleOpenFolder}
        >
            {/* Three dots menu button */}
            <div
                ref={buttonRef}
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
                style={{ pointerEvents: 'auto', zIndex: 99998 }}
            >
                <FiMoreVertical className="w-5 h-5 text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors" />
            </div>

            {/* Dropdown menu */}
            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute top-8 right-2 bg-white border-2 border-indigo-100 shadow-xl rounded-lg py-1.5 text-xs min-w-[160px] z-[99999]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {sharedUrl && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDisableShare();
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-orange-50 w-full text-left transition-colors text-orange-600"
                        >
                            <HiShare className='w-4 h-4 text-orange-600 rotate-180 flex-shrink-0' />
                            <span className="font-medium">{t("folder.disableShare") || "Disable Share"}</span>
                        </button>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3 mb-3">
                <FaFolder className="text-indigo-600 text-2xl flex-shrink-0" />
                <h3 className="font-semibold text-indigo-900 truncate flex-1">
                    {folderName}
                </h3>
            </div>
            {files && files.length > 0 && (
                <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{files.length}</span> {t("sharedFiles.files") || "files"}
                </div>
            )}
            {sharedUrl && (
                <div className="mt-2 inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800">
                    <FaLink /> {t("sharedFiles.viewLink") || "View Link"}
                </div>
            )}
        </motion.div>
    );
};

export default function SharedFiles() {
    const { t } = useLanguage();
    const [Token] = useCookies(['MegaBox']);
    const navigate = useNavigate();
    const [FilterKey, setFilterKey] = useState('All');
    const [ShowRepresent, setRepresents] = useState(false);
    const [Path, setPath] = useState();
    const [fileType, setfileType] = useState();


    // Get share link analytics - contains link data with views, downloads, etc.
    const { data: shareLinkAnalyticsData, isLoading: shareLinkAnalyticsLoading } = useQuery(
        ['shareLinkAnalytics'],
        () => promoterService.getShareLinkAnalytics(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            retry: 2,
        }
    );

    // Extract analytics data from getShareLinkAnalytics response
    // API Response structure: { "analytics": [{ "fileId", "fileName", "sharedUrl", "downloads", "views", "lastUpdated", "viewsByCountry" }] }
    const analyticsList = shareLinkAnalyticsData?.analytics || shareLinkAnalyticsData?.data || shareLinkAnalyticsData?.links || [];
    
    const filesLoading = shareLinkAnalyticsLoading;

    // Get shared folders with files
    const GetSharedFolders = async () => {
        try {
            const data = await userService.getSharedFoldersWithFiles(Token.MegaBox);
            // Handle different response structures
            if (data?.folders && Array.isArray(data.folders)) {
                return data;
            } else if (Array.isArray(data)) {
                return { folders: data };
            }
            return data || { folders: [] };
        } catch (error) {
            console.error('Error fetching shared folders:', error);
            return { folders: [] };
        }
    };

    const { data: sharedFoldersData, isLoading: foldersLoading } = useQuery("GetSharedFolders", GetSharedFolders);

    // Get shared files by user
    const { data: sharedFilesByUserData, isLoading: sharedFilesByUserLoading } = useQuery(
        ['sharedFilesByUser'],
        () => fileService.getSharedFilesByUser(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            retry: 2,
        }
    );

    const Representation = (path, type, close) => {
        if (close) {
            setPath(null);
            setfileType(null);
            setRepresents(false);
            return;
        } else {
            setPath(path);
            setfileType(type);
            setRepresents(!ShowRepresent);
        }
    };

    const SelectFilter = (type) => {
        setFilterKey(type);
    };
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(Token.MegaBox),
        { enabled: !!Token.MegaBox, retry: false }
    );

    const userId = userData?._id || userData?.id || '';
    
    const hasDownloadsPlan = userData?.Downloadsplan === "true" || userData?.Downloadsplan === true;
    const isDownloadsPlan = hasDownloadsPlan;

    const sharedLinksData = analyticsList.map(link => {
        const allPossibleLinks = [
            link.branchUrl,
            link.branchLink,
            link.originalUrl,
            link.originalLink,
            link.sharedUrl,
            link.shareLink,
            link.shareUrl,
            link.fileUrl,
            link.link
        ].filter(Boolean);
        
        // Find Branch.io link first, fallback to any other link
        const branchLink = allPossibleLinks.find(url => 
            url && (url.includes('test-app.link') || url.includes('app.link') || url.includes('branch.io'))
        );
        const finalLink = branchLink || allPossibleLinks[0] || '';
        
        return {
            id: link.fileId || link.id || link._id,
            fileId: link.fileId || link.id || link._id,
            creationTime: link.lastUpdated || link.createdAt || link.date || link.uploadDate || new Date().toISOString(),
            link: finalLink,
            totalInstall: link.downloads || link.totalDownloads || link.installs || 0,
            totalViews: link.views || link.totalViews || 0,
            fileName: link.fileName || link.name || 'Unknown',
            viewsByCountry: link.viewsByCountry || [],
            downloads: link.downloads || link.totalDownloads || 0,
            views: link.views || link.totalViews || 0,
            lastUpdated: link.lastUpdated || link.createdAt || null
        };
    });

    // Sort by appropriate metric based on plan (descending) and take top 10
    const topSharedLinks = [...sharedLinksData]
        .sort((a, b) => {
            if (isDownloadsPlan) {
                return b.totalInstall - a.totalInstall;
            } else {
                return b.totalViews - a.totalViews;
            }
        })
        .slice(0, 10);

    // Fetch earnings data
    const { data: earningsData, isLoading: earningsLoading } = useQuery(
        ['userEarnings'],
        () => promoterService.getUserEarnings(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            retry: 2,
        }
    );

    // Extract earnings data
    const currency = earningsData?.currency || 'USD';
    const withdrawable = earningsData?.withdrawable || earningsData?.totalEarnings || '0';
    const estimatedIncome = earningsData?.totalEarnings || earningsData?.estimatedIncome || '0';
    const actualIncome = earningsData?.confirmedRewards || earningsData?.actualIncome || '0';

    return (
        <>
            <div className="revenue-data-page">
                <div className="revenue-data-page__wrapper">
                    {/* Earning Section */}
                    <motion.div
                        className="revenue-earning-section"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="revenue-earning-section__header">
                            <h2 className="revenue-earning-section__title">{t('revenueData.earning')}</h2>
                            <span className="revenue-earning-section__id">{t('revenueData.id')}: {userId}</span>
                        </div>
                        
                        <div className="revenue-earning-card">
                            <div className="revenue-earning-card__top">
                                <div className="revenue-earning-card__item">
                                    <div className="revenue-earning-card__label">
                                        {t('revenueData.withdrawable')} / {currency}
                                        <FaQuestionCircle className="revenue-earning-card__help-icon" />
                                    </div>
                                    <div className="revenue-earning-card__value revenue-earning-card__value--large">
                                        {earningsLoading ? '-' : parseFloat(withdrawable || 0).toFixed(4)}
                                    </div>
                                </div>
                                <Link 
                                    to="/Promoter/Earnings"
                                    className="revenue-earning-card__withdraw-button"
                                >
                                    {t('revenueData.withdraw')}
                                </Link>
                            </div>
                            
                            <div className="revenue-earning-card__bottom">
                                <div className="revenue-earning-card__item">
                                    <div className="revenue-earning-card__label">
                                        {t('revenueData.estimatedIncome')} / {currency}
                                        <FaQuestionCircle className="revenue-earning-card__help-icon" />
                                    </div>
                                    <div className="revenue-earning-card__value">
                                        {earningsLoading ? '-' : parseFloat(estimatedIncome || 0).toFixed(4)}
                                    </div>
                                </div>
                                
                                <div className="revenue-earning-card__item">
                                    <div className="revenue-earning-card__label">
                                        {t('revenueData.actualIncome')} / {currency}
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

                    {/* Shared Files by User Section */}
                    {sharedFilesByUserData?.files && sharedFilesByUserData.files.length > 0 && (
                        <motion.div
                            className="revenue-table-section"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="revenue-table-container">
                                <div className="shared-links-header">
                                    <h2 className="shared-links-header__title">{t("sharedFiles.sharedFiles") || "Shared Files"}</h2>
                                    <p className="shared-links-header__description">
                                        {t("sharedFiles.sharedFilesDescription") || "Files you've shared with others"}
                                    </p>
                                </div>

                                {sharedFilesByUserLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                                        {sharedFilesByUserData.files.map((file, index) => {
                                            // Map file data to match File component's expected structure
                                            // Response: {_id, fileName, sharedUrl, createdAt}
                                            // Determine file type from fileName extension if not provided
                                            const fileName = file.fileName || file.name || 'Unknown File';
                                            const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                                            let inferredFileType = 'application/octet-stream';
                                            
                                            // Infer file type from extension
                                            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
                                                inferredFileType = 'image/' + (fileExtension === 'jpg' ? 'jpeg' : fileExtension);
                                            } else if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExtension)) {
                                                inferredFileType = 'video/' + (fileExtension === 'mp4' ? 'mp4' : fileExtension);
                                            } else if (['pdf'].includes(fileExtension)) {
                                                inferredFileType = 'application/pdf';
                                            } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
                                                inferredFileType = 'application/zip';
                                            }
                                            
                                            // For shared files, try to get the actual file URL for preview
                                            // If we have a file ID, we might be able to construct a preview URL
                                            // Otherwise, use sharedUrl as fallback
                                            
                                            // Prioritize Branch.io links (test-app.link) over Vercel URLs
                                            const allPossibleShareUrls = [
                                                file.branchUrl,
                                                file.branchLink,
                                                file.originalUrl,
                                                file.originalLink,
                                                file.sharedUrl,
                                                file.shareLink,
                                                file.shareURL,
                                                file.shareUrl
                                            ].filter(Boolean);
                                            
                                            // Find Branch.io link first, fallback to any other link
                                            const branchShareUrl = allPossibleShareUrls.find(url => 
                                                url && (url.includes('test-app.link') || url.includes('app.link') || url.includes('branch.io'))
                                            );
                                            const finalShareUrl = branchShareUrl || allPossibleShareUrls[0] || '';
                                            
                                            const fileData = {
                                                _id: file._id || file.id,
                                                id: file._id || file.id,
                                                fileName: fileName,
                                                fileType: file.fileType || file.type || file.mimeType || inferredFileType,
                                                // Try to get file URL - prioritize actual file URL for preview
                                                // If file has an ID, we can try to fetch it or construct preview URL
                                                url: file.url || file.fileUrl || file.fileURL || file.previewUrl || '',
                                                createdAt: file.createdAt || file.created || file.date || new Date().toISOString(),
                                                shareLink: finalShareUrl,
                                                sharedUrl: finalShareUrl,
                                                shared: file.shared !== false,
                                                isShared: true,
                                                ...file // Include all other fields from response
                                            };
                                            
                                            // If file has sharedUrl but no url, clicking should open the shared link
                                            if (!fileData.url && fileData.sharedUrl) {
                                                // Store sharedUrl for click handling
                                                fileData._sharedUrl = fileData.sharedUrl;
                                            }
                                            
                                            return (
                                                <motion.div
                                                    key={fileData._id || index}
                                                    className="bg-white rounded-lg border-2 border-indigo-200 p-4 hover:shadow-lg transition-shadow"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <File
                                                        Type={getFileCategory(fileData.fileType)}
                                                        data={fileData}
                                                        viewMode="grid"
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Shared Folders Section */}
                    {sharedFoldersData?.folders && sharedFoldersData.folders.length > 0 && (
                        <motion.div
                            className="revenue-table-section"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <div className="revenue-table-container">
                                <div className="shared-links-header">
                                    <h2 className="shared-links-header__title">{t("sharedFiles.sharedFolders") || "Shared Folders"}</h2>
                                    <p className="shared-links-header__description">
                                        {t("sharedFiles.sharedFoldersDescription") || "Folders you've shared with others"}
                                    </p>
                                </div>

                                {foldersLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                                        {sharedFoldersData.folders.map((item, index) => {
                                            // Extract folder data from nested structure
                                            const folder = item.folder || item;
                                            const folderId = folder.id || folder._id || folder.folderId;
                                            const folderName = folder.name || folder.folderName || 'Unnamed Folder';
                                            const sharedUrl = folder.sharedUrl || folder.shareLink || item.sharedUrl;
                                            const files = item.files || folder.files || [];
                                            
                                            return (
                                                <motion.div
                                                    key={folderId || index}
                                                    className="bg-white rounded-lg border-2 border-indigo-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (sharedUrl) {
                                                            // Open shared folder using the original Branch.io link directly
                                                            // If it's a Vercel URL, try to find the original Branch.io link
                                                            let urlToOpen = sharedUrl;
                                                            
                                                            // If it's a Vercel URL, we need to get the original Branch.io link
                                                            if (urlToOpen.includes('mega-box.vercel.app') || urlToOpen.includes('vercel.app')) {
                                                                // Try to find Branch.io link in folder data first
                                                                const branchLink = folder.branchUrl || 
                                                                                  folder.branchLink || 
                                                                                  folder.originalUrl || 
                                                                                  folder.originalLink ||
                                                                                  (folder.sharedUrl && folder.sharedUrl.includes('test-app.link') ? folder.sharedUrl : null) ||
                                                                                  (folder.shareLink && folder.shareLink.includes('test-app.link') ? folder.shareLink : null);
                                                                if (branchLink) {
                                                                    urlToOpen = branchLink;
                                                                } else {
                                                                    // If not found in folder data, try to fetch it from the backend
                                                                    try {
                                                                        const response = await userService.generateFolderShareLink(folderId, Token.MegaBox);
                                                                        const fetchedBranchLink = response?.shareUrl || response?.shareLink || response?.data?.shareUrl || response?.data?.shareLink;
                                                                        if (fetchedBranchLink && (fetchedBranchLink.includes('test-app.link') || fetchedBranchLink.includes('app.link') || fetchedBranchLink.includes('branch.io'))) {
                                                                            urlToOpen = fetchedBranchLink;
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Error fetching Branch.io link for folder:', error);
                                                                        // Fallback to opening the Vercel URL if we can't get Branch.io link
                                                                    }
                                                                }
                                                            }
                                                            
                                                            // Open in new tab - use location.href to bypass React Router
                                                            const newWindow = window.open('', '_blank', 'noopener,noreferrer');
                                                            if (newWindow) {
                                                                newWindow.location.href = urlToOpen;
                                                            } else {
                                                                // Fallback if popup blocked
                                                                window.location.href = urlToOpen;
                                                            }
                                                        } else if (folderId) {
                                                            // Navigate to folder preview if no shared URL
                                                            navigate(`/video-preview/${folderId}?type=folder`);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <FaFolder className="text-indigo-600 text-2xl flex-shrink-0" />
                                                        <h3 className="font-semibold text-indigo-900 truncate flex-1">
                                                            {folderName}
                                                        </h3>
                                                    </div>
                                                    {files && files.length > 0 && (
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            <span className="font-medium">{files.length}</span> {t("sharedFiles.files") || "files"}
                                                        </div>
                                                    )}
                                                    {sharedUrl && (
                                                        <div className="mt-2 inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800">
                                                            <FaLink /> {t("sharedFiles.viewLink") || "View Link"}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Shared Links Table Section */}
                    <motion.div
                        className="revenue-table-section"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="revenue-table-container">
                            <div className="shared-links-header">
                                <h2 className="shared-links-header__title">{t("sidenav.linkDataSection.sharedLinksTitle")}</h2>
                                <p className="shared-links-header__description">
                                    {t("sidenav.linkDataSection.sharedLinksDescription")}
                                </p>
                            </div>

                            {filesLoading ? (
                                <table className="revenue-table">
                                    <thead>
                                        <tr>
                                            <th>{t("sidenav.linkDataSection.fileName") || "File Name"}</th>
                                            <th>{t("sidenav.linkDataSection.creationTime") || "Creation Time"}</th>
                                            <th>{t("sidenav.linkDataSection.link") || "Link"}</th>
                                            <th>{t("sidenav.linkDataSection.totalViews") || "Total Views"}</th>
                                            <th>{t("sidenav.linkDataSection.totalInstall") || "Total Downloads"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div className="loading-cell" style={{ height: '20px', background: 'var(--color-indigo-100)', borderRadius: '0.25rem', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                </td>
                                                <td>
                                                    <div className="loading-cell" style={{ height: '20px', background: 'var(--color-indigo-100)', borderRadius: '0.25rem', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                </td>
                                                <td>
                                                    <div className="loading-cell" style={{ height: '20px', background: 'var(--color-indigo-100)', borderRadius: '0.25rem', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                </td>
                                                <td>
                                                    <div className="loading-cell" style={{ height: '20px', background: 'var(--color-indigo-100)', borderRadius: '0.25rem', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                </td>
                                                <td>
                                                    <div className="loading-cell" style={{ height: '20px', background: 'var(--color-indigo-100)', borderRadius: '0.25rem', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : topSharedLinks.length === 0 ? (
                                <table className="revenue-table">
                                    <thead>
                                        <tr>
                                            <th>{t("sidenav.linkDataSection.fileName") || "File Name"}</th>
                                            <th>{t("sidenav.linkDataSection.creationTime") || "Creation Time"}</th>
                                            <th>{t("sidenav.linkDataSection.link") || "Link"}</th>
                                            <th>{t("sidenav.linkDataSection.totalViews") || "Total Views"}</th>
                                            <th>{t("sidenav.linkDataSection.totalInstall") || "Total Downloads"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                    <p style={{ color: '#6b7280', margin: 0 }}>
                                                        {t("sidenav.linkDataSection.noDataMessage") || "You haven't shared any links yet"}
                                                    </p>
                                                    <Link 
                                                        to="/dashboard"
                                                        className="revenue-earning-card__withdraw-button revenue-earning-card__share-button"
                                                    >
                                                        <HiShare className="revenue-earning-card__share-icon" />
                                                        {t("sharedFiles.goToFiles") || "Go to Files"}
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <table className="revenue-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <div className="table-header-sortable">
                                                    {t("sidenav.linkDataSection.fileName") || "File Name"}
                                                </div>
                                            </th>
                                            <th>
                                                <div className="table-header-sortable">
                                                    {t("sidenav.linkDataSection.creationTime") || "Creation Time"}
                                                    <div className="sort-icons">
                                                        <FaArrowUp className="sort-icon" />
                                                        <FaArrowDown className="sort-icon" />
                                                    </div>
                                                </div>
                                            </th>
                                            <th>{t("sidenav.linkDataSection.link") || "Link"}</th>
                                            <th>
                                                <div className="table-header-sortable">
                                                    {t("sidenav.linkDataSection.totalViews") || "Total Views"}
                                                    <div className="sort-icons">
                                                        <FaArrowUp className="sort-icon" />
                                                        <FaArrowDown className="sort-icon" />
                                                    </div>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="table-header-sortable">
                                                    {t("sidenav.linkDataSection.totalInstall") || "Total Downloads"}
                                                    <div className="sort-icons">
                                                        <FaArrowUp className="sort-icon" />
                                                        <FaArrowDown className="sort-icon" />
                                                    </div>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topSharedLinks.map((link, index) => (
                                            <motion.tr
                                                key={link.id || link.fileId || index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <td>
                                                    <div className="font-medium text-indigo-900 truncate max-w-[200px]" title={link.fileName}>
                                                        {link.fileName || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td>
                                                    {link.creationTime ? new Date(link.creationTime).toLocaleDateString('en-CA', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : '-'}
                                                </td>
                                                <td>
                                                    <div className="link-cell">
                                                        <FaLink className="link-icon" />
                                                        <button
                                                            type="button"
                                                            className="link-text text-left bg-transparent border-none cursor-pointer hover:text-indigo-800 underline"
                                                            title={link.link}
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                // Open the original Branch.io link directly without routing
                                                                if (link.link) {
                                                                    let urlToOpen = link.link;
                                                                    
                                                                    // If it's a Vercel URL, we need to get the original Branch.io link
                                                                    // The backend might be returning Vercel URL, so we need to fetch the original
                                                                    if (urlToOpen.includes('mega-box.vercel.app') || urlToOpen.includes('vercel.app')) {
                                                                        try {
                                                                            // Try to get the original Branch.io link by calling generateShareLink again
                                                                            // This will return the Branch.io link from the backend
                                                                            const response = await fileService.generateShareLink(link.fileId, Token.MegaBox);
                                                                            const branchLink = response?.shareUrl || response?.shareLink || response?.data?.shareUrl || response?.data?.shareLink;
                                                                            if (branchLink && (branchLink.includes('test-app.link') || branchLink.includes('app.link') || branchLink.includes('branch.io'))) {
                                                                                urlToOpen = branchLink;
                                                                            }
                                                                        } catch (error) {
                                                                            console.error('Error fetching Branch.io link:', error);
                                                                            // Fallback to opening the Vercel URL if we can't get Branch.io link
                                                                        }
                                                                    }
                                                                    
                                                                    // Open in new tab - use location.href to bypass React Router
                                                                    const newWindow = window.open('', '_blank', 'noopener,noreferrer');
                                                                    if (newWindow) {
                                                                        newWindow.location.href = urlToOpen;
                                                                    } else {
                                                                        // Fallback if popup blocked
                                                                        window.location.href = urlToOpen;
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            {link.link && link.link.length > 40 ? `${link.link.substring(0, 40)}...` : (link.link || '-')}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>{link.totalViews || link.views || 0}</td>
                                                <td>{link.totalInstall || link.downloads || 0}</td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {ShowRepresent && (
                <Represents
                    path={Path}
                    type={fileType}
                    ToggleUploadFile={() => Representation("", "", true)}
                />
            )}
        </>
    );
}