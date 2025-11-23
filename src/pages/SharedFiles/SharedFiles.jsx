import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import { fileService, userService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getFileCategory } from '../../helpers/MimeType';
import File from '../../components/File/File';
import Represents from '../../components/Represents/Represents';
import EmptyState from '../../components/EmptyState/EmptyState';
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { HiShare } from "react-icons/hi2";
import { FaShare, FaFolder, FaLink, FaArrowUp, FaArrowDown, FaQuestionCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { promoterService } from '../../services/api';
import './SharedFiles.scss';
import '../RevenueData/RevenueData.scss';

export default function SharedFiles() {
    const { t } = useLanguage();
    const [Token] = useCookies(['MegaBox']);
    const [viewMode, setViewMode] = useState('grid');
    const [FilterKey, setFilterKey] = useState('All');
    const [ShowRepresent, setRepresents] = useState(false);
    const [Path, setPath] = useState();
    const [fileType, setfileType] = useState();


    // Get share link analytics - contains link data with views, downloads, etc.
    const { data: shareLinkAnalyticsData, isLoading: shareLinkAnalyticsLoading, refetch: refetchAnalytics } = useQuery(
        ['shareLinkAnalytics'],
        () => promoterService.getShareLinkAnalytics(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            retry: 2,
        }
    );

    // Extract analytics data from getShareLinkAnalytics response
    // Response structure: { analytics: [...] } or { data: [...] } or { links: [...] }
    const analyticsList = shareLinkAnalyticsData?.analytics || shareLinkAnalyticsData?.data || shareLinkAnalyticsData?.links || [];
    
    // For backward compatibility with existing file grid/list view, convert analytics to files format
    const data = {
        files: analyticsList.map(link => ({
            _id: link.fileId || link.id || link._id,
            id: link.fileId || link.id || link._id,
            shareLink: link.shareLink || link.fileUrl || link.link || link.shareUrl,
            shareUrl: link.shareLink || link.fileUrl || link.link || link.shareUrl,
            createdAt: link.createdAt || link.date || link.lastUpdated || link.uploadDate || new Date().toISOString(),
            uploadDate: link.createdAt || link.date || link.lastUpdated || link.uploadDate || new Date().toISOString(),
            totalInstalls: link.downloads || link.totalDownloads || link.installs || 0,
            installs: link.downloads || link.totalDownloads || link.installs || 0,
            totalViews: link.views || link.totalViews || 0,
            views: link.views || link.totalViews || 0,
            fileName: link.fileName || link.name || link.fileName || 'Unknown',
            fileType: link.fileType || link.mimeType || 'unknown',
            isShared: true,
            shared: true
        }))
    };
    
    const filesLoading = shareLinkAnalyticsLoading;

    // Get shared folders with files
    const GetSharedFolders = async () => {
        try {
            const data = await userService.getSharedFoldersWithFiles(Token.MegaBox);
            return data || { folders: [] };
        } catch (error) {
            console.error('Error fetching shared folders:', error);
            return { folders: [] };
        }
    };

    const { data: sharedFoldersData, isLoading: foldersLoading } = useQuery("GetSharedFolders", GetSharedFolders);

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

    // Filter files based on selected filter
    const filteredFiles = data?.files?.filter(file => {
        if (FilterKey === 'All') return true;
        const category = getFileCategory(file?.fileType);
        switch (FilterKey.toLowerCase()) {
            case 'image':
                return category === 'image';
            case 'video':
                return category === 'video';
            case 'document':
                return category === 'document';
            case 'zip':
                return category === 'zip';
            default:
                return true;
        }
    }) || [];

    const filterOptions = [
        { key: "All", label: t("files.allFiles"), count: data?.files?.length || 0 },
        { key: "image", label: t("files.images"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'image')?.length || 0 },
        { key: "video", label: t("files.videos"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'video')?.length || 0 },
        { key: "document", label: t("files.documents"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'document')?.length || 0 },
        { key: "zip", label: t("files.zipFolders"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'zip')?.length || 0 },
    ];

    // Fetch user data to get user ID and plan type
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(Token.MegaBox),
        { enabled: !!Token.MegaBox, retry: false }
    );

    const userId = userData?._id || userData?.id || '';
    
    // Check user's plan type
    const hasDownloadsPlan = userData?.Downloadsplan === "true" || userData?.Downloadsplan === true;
    const hasWatchingPlan = userData?.watchingplan === "true" || userData?.watchingplan === true;
    // If user has both plans, prioritize Downloads plan, otherwise use the one they have
    const isDownloadsPlan = hasDownloadsPlan; // Downloads plan takes priority
    const isWatchingPlan = hasWatchingPlan && !hasDownloadsPlan; // Only watching plan if no downloads plan

    // Get shared links data for table - use analytics data directly from getShareLinkAnalytics
    // Response structure from getShareLinkAnalytics:
    // { analytics: [{ fileId, fileName, fileUrl/shareLink, views/totalViews, downloads/totalDownloads, createdAt/date/lastUpdated }] }
    const sharedLinksData = analyticsList.map(link => ({
        id: link.fileId || link.id || link._id,
        creationTime: link.createdAt || link.date || link.lastUpdated || link.uploadDate || new Date().toISOString(),
        link: link.shareLink || link.fileUrl || link.link || link.shareUrl || '',
        totalInstall: link.downloads || link.totalDownloads || link.installs || 0,
        totalViews: link.views || link.totalViews || 0,
        fileName: link.fileName || link.name || 'Unknown'
    }));

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
                                        {sharedFoldersData.folders.map((folder, index) => (
                                            <motion.div
                                                key={folder._id || folder.id || index}
                                                className="bg-white rounded-lg border-2 border-indigo-200 p-4 hover:shadow-lg transition-shadow"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <FaFolder className="text-indigo-600 text-2xl" />
                                                    <h3 className="font-semibold text-indigo-900 truncate flex-1">
                                                        {folder.name || folder.folderName || 'Unnamed Folder'}
                                                    </h3>
                                                </div>
                                                {folder.files && folder.files.length > 0 && (
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">{folder.files.length}</span> {t("sharedFiles.files") || "files"}
                                                    </div>
                                                )}
                                                {folder.shareLink && (
                                                    <a
                                                        href={folder.shareLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <FaLink /> {t("sharedFiles.viewLink") || "View Link"}
                                                    </a>
                                                )}
                                            </motion.div>
                                        ))}
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
                                            <th>
                                                <div className="table-header-sortable">
                                                    {t("sidenav.linkDataSection.creationTime") || "Creation Time"}
                                                </div>
                                            </th>
                                            <th>{t("sidenav.linkDataSection.link") || "Link"}</th>
                                            <th>
                                                <div className="table-header-sortable">
                                                    {isDownloadsPlan 
                                                        ? (t("sidenav.linkDataSection.totalInstall") || "Total Install")
                                                        : (t("sidenav.linkDataSection.totalViews") || "Total Views")
                                                    }
                                                </div>
                                            </th>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : topSharedLinks.length === 0 ? (
                                <table className="revenue-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <div className="table-header-sortable">
                                                    {t("sidenav.linkDataSection.creationTime") || "Creation Time"}
                                                </div>
                                            </th>
                                            <th>{t("sidenav.linkDataSection.link") || "Link"}</th>
                                            <th>
                                                <div className="table-header-sortable">
                                                    {isDownloadsPlan 
                                                        ? (t("sidenav.linkDataSection.totalInstall") || "Total Install")
                                                        : (t("sidenav.linkDataSection.totalViews") || "Total Views")
                                                    }
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
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
                                                    {isDownloadsPlan 
                                                        ? (t("sidenav.linkDataSection.totalInstall") || "Total Install")
                                                        : (t("sidenav.linkDataSection.totalViews") || "Total Views")
                                                    }
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
                                                key={link.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <td>
                                                    {new Date(link.creationTime).toLocaleDateString('en-CA')}
                                                </td>
                                                <td>
                                                    <div className="link-cell">
                                                        <FaLink className="link-icon" />
                                                        <a 
                                                            href={link.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="link-text" 
                                                            title={link.link}
                                                        >
                                                            {link.link.length > 30 ? `${link.link.substring(0, 30)}...` : link.link}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td>{isDownloadsPlan ? link.totalInstall : link.totalViews}</td>
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