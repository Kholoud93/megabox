import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import { fileService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getFileCategory } from '../../helpers/MimeType';
import File from '../../components/File/File';
import Represents from '../../components/Represents/Represents';
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { FaShare, FaFileAlt, FaFileImage, FaFileVideo, FaFilePdf, FaFileWord } from 'react-icons/fa';
import './SharedFiles.scss';

export default function SharedFiles() {
    const { t } = useLanguage();
    const [Token] = useCookies(['MegaBox']);
    const [viewMode, setViewMode] = useState('grid');
    const [FilterKey, setFilterKey] = useState('All');
    const [ShowRepresent, setRepresents] = useState(false);
    const [Path, setPath] = useState();
    const [fileType, setfileType] = useState();

    const Active = "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const InActive = "inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

    // Get shared files
    const GetSharedFiles = async () => {
        try {
            const data = await fileService.getSharedFilesByUser(Token.MegaBox);
            return data || { files: [] };
        } catch (error) {
            console.error('Error fetching shared files:', error);
            return { files: [] };
        }
    };

    const { data, isLoading: filesLoading, refetch } = useQuery("GetSharedFiles", GetSharedFiles);

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
                {/* Header Section */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg border-b border-indigo-400">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                        <div className="py-4 sm:py-6 md:py-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                                    <FaShare className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0 text-white" style={{ filter: 'drop-shadow(0 4px 8px rgba(255,255,255,0.3))' }} />
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg truncate" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.3)' }}>
                                            {t("sharedFiles.title")}
                                        </h1>
                                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/90" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>
                                            {t("sharedFiles.subtitle")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 md:mb-6 gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {t("sharedFiles.sharedFiles")}
                            </h2>
                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-indigo-700" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {filesLoading ? t("sharedFiles.loadingFiles") : `${filteredFiles.length} ${t("sharedFiles.filesCount")}`}
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="text-xs sm:text-sm text-indigo-700 mr-1 sm:mr-2 hidden xs:inline" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {t("files.view")}
                            </span>
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
                                    <span
                                        className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${FilterKey === option.key
                                            ? 'bg-white bg-opacity-20 text-white'
                                            : 'bg-indigo-100 text-indigo-600'
                                            }`}
                                    >
                                        {option.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Files Grid/List */}
                    {filesLoading ? (
                        <div
                            className={`grid gap-4 sm:gap-5 md:gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                : 'grid-cols-1'
                                }`}
                        >
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-lg h-24 sm:h-28 md:h-32"></div>
                                    <div className="mt-2 sm:mt-3 bg-gray-200 rounded h-3 sm:h-4 w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-8 sm:py-10 md:py-12 bg-white rounded-lg border-2 border-dashed border-indigo-300 px-4">
                            <FaShare className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-indigo-400" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                            <h3 className="mt-2 text-sm font-medium text-indigo-900 drop-shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                {t("sharedFiles.noFilesFound")}
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm text-indigo-700 px-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {t("sharedFiles.noFilesMessage")}
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            className={`grid gap-4 sm:gap-5 md:gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                : 'grid-cols-1'
                                }`}
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

