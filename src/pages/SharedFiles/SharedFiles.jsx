import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { fileService, userService, promoterService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getFileCategory } from '../../helpers/MimeType';
import File from '../../components/File/File';
import Represents from '../../components/Represents/Represents';
import EmptyState from '../../components/EmptyState/EmptyState';
import ChangeName from '../../components/ChangeName/ChangeName';
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { HiShare } from "react-icons/hi2";
import { FaShare, FaFolder, FaLink, FaArrowUp, FaArrowDown, FaQuestionCircle } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import { Folder } from '../../components/Folder/Folder';
import { useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import './SharedFiles.scss';
import '../RevenueData/RevenueData.scss';

const SharedFolderCard = ({ folder, folderId, folderName, sharedUrl, files, index, navigate, t }) => {
    const [Token] = useCookies(['MegaBox']);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const queryClient = useQueryClient();

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
            queryClient.invalidateQueries(['sharedFilesByUser']);
            queryClient.invalidateQueries('GetSharedFolders');
            queryClient.invalidateQueries(['shareLinkAnalytics']);
            setShowMenu(false);
        } catch (error) {
            setShowMenu(false);
            console.error('Error disabling folder share:', error);
        }
    };

    const handleOpenFolder = async (e) => {
        if (menuRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (sharedUrl) {
            let urlToOpen = sharedUrl;

            if (urlToOpen.includes('mega-box.vercel.app') || urlToOpen.includes('vercel.app')) {
                const branchLink = folder.branchUrl || 
                                  folder.branchLink || 
                                  folder.originalUrl || 
                                  folder.originalLink ||
                                  (folder.sharedUrl && folder.sharedUrl.includes('test-app.link') ? folder.sharedUrl : null) ||
                                  (folder.shareLink && folder.shareLink.includes('test-app.link') ? folder.shareLink : null);
                if (branchLink) {
                    urlToOpen = branchLink;
                } else {
                    try {
                        const response = await userService.generateFolderShareLink(folderId, Token.MegaBox);
                        const fetchedBranchLink = response?.shareUrl || response?.shareLink || response?.data?.shareUrl || response?.data?.shareLink;
                        if (fetchedBranchLink && (fetchedBranchLink.includes('test-app.link') || fetchedBranchLink.includes('app.link') || fetchedBranchLink.includes('branch.io'))) {
                            urlToOpen = fetchedBranchLink;
                        }
                    } catch (error) {
                        console.error('Error fetching Branch.io link for folder:', error);
                    }
                }
            }

            const newWindow = window.open(urlToOpen, '_blank', 'noopener,noreferrer');
            if (!newWindow) {
                window.location.href = urlToOpen;
            }
        } else if (folderId) {
            navigate(`/share/${folderId}?type=folder`);
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

            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute top-8 right-2 bg-white border-2 border-indigo-100 shadow-xl rounded-lg py-1.5 text-xs min-w-[160px] z-[99999]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {folderId && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMenu(false);
                                navigate(`/share/${folderId}?type=folder`);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                        >
                            <FaFolder className='w-4 h-4 text-indigo-600 flex-shrink-0' />
                            <span className="font-medium">{t("sharedFiles.openFolder") || "Open Folder"}</span>
                        </button>
                    )}
                    {sharedUrl && (
                        <>
                            {folderId && <div className="border-t border-gray-200 my-1"></div>}
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
                        </>
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
    const [ShowUpdateName, setShowUpdateName] = useState(false);
    const [OldName, setOldName] = useState('');
    const [FileId, setFileId] = useState('');
    const [IsFolder, setIsFolder] = useState(false);


    const { data: shareLinkAnalyticsData, isLoading: shareLinkAnalyticsLoading } = useQuery(
        ['shareLinkAnalytics'],
        () => promoterService.getShareLinkAnalytics(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            retry: 2,
        }
    );

    const analyticsList = shareLinkAnalyticsData?.analytics || shareLinkAnalyticsData?.data || shareLinkAnalyticsData?.links || [];
    
    const filesLoading = shareLinkAnalyticsLoading;

    const GetSharedFolders = async () => {
        try {
            const data = await userService.getSharedFoldersWithFiles(Token.MegaBox);
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

    const { data: sharedFilesByUserData, isLoading: sharedFilesByUserLoading, refetch: refetchSharedFiles } = useQuery(
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

    const ToggleNameChange = (name, isFolder, id) => {
        setOldName(name);
        setIsFolder(isFolder || false);
        setFileId(id);
        setShowUpdateName(!ShowUpdateName);
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
            fileName: link.fileName || link.name || t("sidenav.linkDataSection.unknown") || "Unknown",
            viewsByCountry: link.viewsByCountry || [],
            downloads: link.downloads || link.totalDownloads || 0,
            views: link.views || link.totalViews || 0,
            lastUpdated: link.lastUpdated || link.createdAt || null
        };
    });

    const topSharedLinks = [...sharedLinksData]
        .sort((a, b) => {
            if (isDownloadsPlan) {
                return b.totalInstall - a.totalInstall;
            } else {
                return b.totalViews - a.totalViews;
            }
        })
        .slice(0, 10);

    const { data: earningsData, isLoading: earningsLoading } = useQuery(
        ['userEarnings'],
        () => promoterService.getUserEarnings(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            retry: 2,
        }
    );

    const currency = earningsData?.currency || 'USD';
    const withdrawable = earningsData?.withdrawable || earningsData?.totalEarnings || '0';
    const estimatedIncome = earningsData?.totalEarnings || earningsData?.estimatedIncome || '0';
    const actualIncome = earningsData?.confirmedRewards || earningsData?.actualIncome || '0';

    return (
        <>
            <div className="revenue-data-page">
                <div className="revenue-data-page__wrapper">
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
                                            const fileName = file.fileName || file.name || t("sidenav.linkDataSection.unknownFile") || "Unknown File";
                                            const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                                            let inferredFileType = 'application/octet-stream';
                                            
                                            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
                                                inferredFileType = 'image/' + (fileExtension === 'jpg' ? 'jpeg' : fileExtension);
                                            } else if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExtension)) {
                                                inferredFileType = 'video/' + (fileExtension === 'mp4' ? 'mp4' : fileExtension);
                                            } else if (['pdf'].includes(fileExtension)) {
                                                inferredFileType = 'application/pdf';
                                            } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
                                                inferredFileType = 'application/zip';
                                            }
                                            
                                            const fileUrl = file.url || file.fileUrl || file.fileURL || file.previewUrl || file.imageUrl || file.videoUrl || file.fileURL || '';

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

                                            const branchShareUrl = allPossibleShareUrls.find(url => 
                                                url && (url.includes('test-app.link') || url.includes('app.link') || url.includes('branch.io'))
                                            );
                                            const finalShareUrl = branchShareUrl || allPossibleShareUrls[0] || '';
                                            
                                            const fileData = {
                                                _id: file._id || file.id,
                                                id: file._id || file.id,
                                                fileName: fileName,
                                                fileType: file.fileType || file.type || file.mimeType || inferredFileType,
                                                url: fileUrl,
                                                createdAt: file.createdAt || file.created || file.date || new Date().toISOString(),
                                                shareLink: finalShareUrl,
                                                sharedUrl: finalShareUrl,
                                                shared: file.shared !== false,
                                                isShared: true,
                                                ...file
                                            };

                                            if (!fileData.url && fileData.sharedUrl) {
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
                                                        Representation={Representation}
                                                        onRename={ToggleNameChange}
                                                        refetch={async () => {
                                                            await refetchSharedFiles();
                                                        }}
                                                        onShare={async (id) => {
                                                            try {
                                                                await fileService.generateShareLink(id, Token.MegaBox);
                                                                refetchSharedFiles();
                                                            } catch {
                                                                void 0;
                                                            }
                                                        }}
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
                                            const folder = item.folder || item;
                                            const folderId = folder.id || folder._id || folder.folderId;
                                            const folderName = folder.name || folder.folderName || t("sidenav.linkDataSection.unnamedFolder") || "Unnamed Folder";
                                            const sharedUrl = folder.sharedUrl || folder.shareLink || item.sharedUrl;
                                            const files = item.files || folder.files || [];
                                            
                                            return (
                                                <SharedFolderCard
                                                    key={folderId || index}
                                                    folder={folder}
                                                    folderId={folderId}
                                                    folderName={folderName}
                                                    sharedUrl={sharedUrl}
                                                    files={files}
                                                    index={index}
                                                    navigate={navigate}
                                                    t={t}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

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
                                                        {link.fileName || t("sidenav.linkDataSection.unknown") || "Unknown"}
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
                                                                if (link.link) {
                                                                    let urlToOpen = link.link;

                                                                    if (urlToOpen.includes('mega-box.vercel.app') || urlToOpen.includes('vercel.app')) {
                                                                        try {
                                                                            const response = await fileService.generateShareLink(link.fileId, Token.MegaBox);
                                                                            const branchLink = response?.shareUrl || response?.shareLink || response?.data?.shareUrl || response?.data?.shareLink;
                                                                            if (branchLink && (branchLink.includes('test-app.link') || branchLink.includes('app.link') || branchLink.includes('branch.io'))) {
                                                                                urlToOpen = branchLink;
                                                                            }
                                                                        } catch (error) {
                                                                            console.error('Error fetching Branch.io link:', error);
                                                                        }
                                                                    }

                                                                    const newWindow = window.open(urlToOpen, '_blank', 'noopener,noreferrer');
                                                                    if (!newWindow) {
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
            {ShowUpdateName && (
                <ChangeName
                    oldFileName={OldName}
                    Toggle={ToggleNameChange}
                    refetch={IsFolder ? () => {} : refetchSharedFiles}
                    FileId={FileId}
                    isFolder={IsFolder}
                />
            )}
        </>
    );
}