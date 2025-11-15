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
import { FaShare, FaFolder } from 'react-icons/fa';
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

    return (
        <>
            <div className="min-h-screen bg-indigo-50 shared-files-page" style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <div className="shared-files-page__wrapper">
                    {/* Header Card */}
                    <motion.div
                        className="shared-files-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="shared-files-header__content">
                            <FaShare className="shared-files-header__icon" />
                            <div>
                                <h1 className="shared-files-header__title">{t("sharedFiles.title")}</h1>
                                <p className="shared-files-header__subtitle">
                                    {filesLoading ? t("sharedFiles.loadingFiles") : `${filteredFiles.length} ${t("sharedFiles.filesCount")}`}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* View Mode Toggle */}
                    <div className="shared-files-controls">
                        <div className="view-mode-toggle">
                            <span className="view-mode-toggle__label">{t("files.view")}</span>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`view-mode-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`}
                            >
                                <HiViewGrid />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`view-mode-toggle__btn ${viewMode === 'list' ? 'active' : ''}`}
                            >
                                <HiViewList />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="shared-files-filters">
                        {filterOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => SelectFilter(option.key)}
                                className={`filter-btn ${FilterKey === option.key ? 'active' : ''}`}
                            >
                                <span>{option.label}</span>
                                <span className="filter-btn__count">{option.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Shared Folders Section */}
                    {sharedFoldersData?.folders && sharedFoldersData.folders.length > 0 && (
                        <motion.div
                            className="shared-folders-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="shared-folders-section__title">
                                <FaFolder className="shared-folders-section__icon" />
                                {t("sharedFiles.sharedFolders") || "Shared Folders"}
                            </h2>
                            <div className="shared-folders-grid">
                                {sharedFoldersData.folders.map((folder, index) => (
                                    <motion.div
                                        key={folder._id || folder.id || `folder-${index}`}
                                        className="shared-folder-card"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <FaFolder className="shared-folder-card__icon" />
                                        <h3 className="shared-folder-card__name">{folder.name || folder.folderName || "Untitled Folder"}</h3>
                                        <p className="shared-folder-card__count">
                                            {folder.files?.length || 0} {t("sharedFiles.files") || "files"}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Files Grid/List */}
                    {filesLoading ? (
                        <div className={`shared-files-grid ${viewMode === 'grid' ? 'grid' : 'list'}`}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-lg h-24 sm:h-28 md:h-32"></div>
                                    <div className="mt-2 sm:mt-3 bg-gray-200 rounded h-3 sm:h-4 w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <EmptyState
                            icon={FaShare}
                            title={t("sharedFiles.noFilesFound")}
                            message={t("sharedFiles.noFilesMessage")}
                            buttonText={t("sharedFiles.goToFiles")}
                            buttonLink="/dashboard"
                        />
                    ) : (
                        <motion.div
                            className={`shared-files-grid ${viewMode === 'grid' ? 'grid' : 'list'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {filteredFiles.map((ele, index) => (
                                <File
                                    key={ele?._id || ele?.id || `file-${index}`}
                                    Type={getFileCategory(ele?.fileType)}
                                    data={ele}
                                    Representation={Representation}
                                    refetch={refetch}
                                    viewMode={viewMode}
                                />
                            ))}
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

