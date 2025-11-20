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
import { FaShare, FaFolder, FaLink, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './SharedFiles.scss';

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

    // Get shared links data for table
    const sharedLinksData = data?.files?.map(file => ({
        id: file._id || file.id,
        creationTime: file.createdAt || file.uploadDate || new Date().toISOString(),
        link: file.shareLink || file.shareUrl || '',
        totalInstall: file.totalInstalls || file.installs || 0
    })) || [];

    // Sort by total install (descending) and take top 10
    const topSharedLinks = [...sharedLinksData]
        .sort((a, b) => b.totalInstall - a.totalInstall)
        .slice(0, 10);

    return (
        <>
            <div className="min-h-screen bg-indigo-50 shared-files-page" style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <div className="shared-files-page__wrapper">
                    {/* Header Section */}
                    <motion.div
                        className="shared-files-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="shared-files-header__title">{t("linkDataSection.title") || "Shared link"}</h1>
                        <p className="shared-files-header__description">
                            {t("linkDataSection.top10Description") || "Only display the top 10 items with the highest number of views"}
                        </p>
                        <p className="shared-files-header__note">
                            {t("linkDataSection.startDate") || "Shared links start counting from May 13, 2024."}
                        </p>
                    </motion.div>

                    {/* Shared Links Table */}
                    {filesLoading ? (
                        <div className="shared-links-table-loading">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="loading-row">
                                    <div className="loading-cell"></div>
                                    <div className="loading-cell"></div>
                                    <div className="loading-cell"></div>
                                </div>
                            ))}
                        </div>
                    ) : topSharedLinks.length === 0 ? (
                        <EmptyState
                            icon={FaLink}
                            title={t("linkDataSection.noData") || "No shared links"}
                            message={t("linkDataSection.noDataMessage") || "You haven't shared any links yet"}
                            buttonText={t("sharedFiles.goToFiles")}
                            buttonLink="/dashboard"
                        />
                    ) : (
                        <motion.div
                            className="shared-links-table-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <table className="shared-links-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <div className="table-header-sortable">
                                                {t("linkDataSection.creationTime") || "Creation time"}
                                                <div className="sort-icons">
                                                    <FaArrowUp className="sort-icon" />
                                                    <FaArrowDown className="sort-icon" />
                                                </div>
                                            </div>
                                        </th>
                                        <th>{t("linkDataSection.link") || "Link"}</th>
                                        <th>
                                            <div className="table-header-sortable">
                                                {t("linkDataSection.totalInstall") || "Total install"}
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
                                            className="shared-links-table__row"
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
                                            <td>{link.totalInstall}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
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

