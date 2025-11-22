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
import { HiViewGrid, HiViewList, HiShare } from "react-icons/hi";
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


    // Get shared files - only files that have been shared (have shareLink)
    const GetSharedFiles = async () => {
        try {
            const data = await fileService.getSharedFilesByUser(Token.MegaBox);
            // Filter to only show files that have been shared (have shareLink or isShared flag)
            if (data?.files) {
                data.files = data.files.filter(file =>
                    file.shareLink ||
                    file.shareUrl ||
                    file.isShared === true ||
                    file.isShared === "true" ||
                    file.shared === true ||
                    file.shared === "true"
                );
            }
            return data || { files: [] };
        } catch (error) {
            console.error('Error fetching shared files:', error);
            return { files: [] };
        }
    };

    const { data, isLoading: filesLoading, refetch } = useQuery("GetSharedFiles", GetSharedFiles);

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

    // Get shared links data for table - different fields based on plan
    const sharedLinksData = data?.files?.map(file => ({
        id: file._id || file.id,
        creationTime: file.createdAt || file.uploadDate || new Date().toISOString(),
        link: file.shareLink || file.shareUrl || '',
        totalInstall: file.totalInstalls || file.installs || 0,
        totalViews: file.totalViews || file.views || 0
    })) || [];

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
                                    to="/dashboard/Earnings"
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
                                                    {t("linkDataSection.creationTime") || "Creation Time"}
                                                    <div className="sort-icons">
                                                        <FaArrowUp className="sort-icon" />
                                                        <FaArrowDown className="sort-icon" />
                                                    </div>
                                                </div>
                                            </th>
                                            <th>{t("linkDataSection.link") || "Link"}</th>
                                            <th>
                                                <div className="table-header-sortable">
                                                    {isDownloadsPlan 
                                                        ? (t("linkDataSection.totalInstall") || "Total Install")
                                                        : (t("linkDataSection.totalViews") || "Total Views")
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
                                                        <span className="link-text" title={link.link}>
                                                            {link.link.length > 30 ? `${link.link.substring(0, 30)}...` : link.link}
                                                        </span>
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