import axios from 'axios';
import React, { useState } from 'react'
import { useCookies } from 'react-cookie';
import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../../../services/api';
import { getFileCategory } from '../../../helpers/MimeType';
import File from '../../../components/File/File';
import { AnimatePresence } from 'framer-motion';
import UploadFile from '../../../components/Upload/UploadFile/UploadFile';
import UploadOptions from '../../../components/Upload/UploadOptions/UploadOptions';
import UploadFromMegaBox from '../../../components/Upload/UploadFromMegaBox/UploadFromMegaBox';
import { HiOutlinePlus } from 'react-icons/hi2';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import { HiViewGrid, HiViewList } from "react-icons/hi";
import Represents from '../../../components/Represents/Represents';
import ChangeName from '../../../components/ChangeName/ChangeName';
import { useLanguage } from '../../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import ShareLinkModal from '../../../components/ShareLinkModal/ShareLinkModal';

export default function fileDetails() {
    const { t, language } = useLanguage();

    const Active = "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const InActive = "inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

    const { fileId, fileName } = useParams();
    const [FilterKey, setFilterKey] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [Token] = useCookies(['MegaBox']);

    const GetFiles = async ({ queryKey }) => {
        const [, filterKey] = queryKey;
        const config = {
            headers: {
                Authorization: `Bearer ${Token.MegaBox}`,
            },
        };

        if (filterKey.toLowerCase() !== 'all') {
            config.params = { type: filterKey };
        }

        const { data } = await axios.get(`${API_URL}/user/getFolderFiles/${fileId}`, config);
        return data;
    };

    const [AddFileShow, setAddFileShow] = useState(false);
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [showUploadFromMegaBox, setShowUploadFromMegaBox] = useState(false);
    const ToggleShowAddFile = () => setAddFileShow(!AddFileShow);
    const ToggleUploadOptions = () => setShowUploadOptions(!showUploadOptions);
    const ToggleUploadFromMegaBox = () => setShowUploadFromMegaBox(!showUploadFromMegaBox);

    const handleSelectDesktop = () => {
        setAddFileShow(true);
    };

    const handleSelectMegaBox = () => {
        setShowUploadFromMegaBox(true);
    };

    const { data, refetch, isLoading: filesLoading } = useQuery([`GetUserFile-${fileId}`, FilterKey], GetFiles);

    const SelectFilter = async (type) => {
        setFilterKey(type);
    };

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
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [shareTitle, setShareTitle] = useState('');

    const ToggleNameChange = (name, close, id) => {
        if (close) {
            setupdateName(!ShowUpdateName);
            return;
        }
        setFileId(id)
        setOldName(name)
        setupdateName(!ShowUpdateName);
    };

    const ShareFile = async (id, isFolder = true) => {
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

    const filterOptions = [
        { key: "All", label: t("fileDetails.allFiles"), count: data?.files?.length || 0 },
        { key: "image", label: t("fileDetails.images"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'image')?.length || 0 },
        { key: "video", label: t("fileDetails.videos"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'video')?.length || 0 },
        { key: "document", label: t("fileDetails.documents"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'document')?.length || 0 },
        { key: "zip", label: t("fileDetails.zipFolders"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'zip')?.length || 0 },
    ];

    return <>
        <div className="min-h-screen bg-indigo-50" style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Header Section */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg border-b border-indigo-400">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="py-4 sm:py-5 md:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg shadow-lg transition-all duration-200 hover:bg-white/30 hover:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 flex-shrink-0"
                                    style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                                >
                                    {language === 'ar' ? (
                                        <>
                                            <HiArrowLeft className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ transform: 'scaleX(-1)' }} />
                                            <span className="hidden xs:inline">{t("fileDetails.backToFiles")}</span>
                                            <span className="xs:hidden">Back</span>
                                        </>
                                    ) : (
                                        <>
                                            <HiArrowLeft className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span className="hidden xs:inline">{t("fileDetails.backToFiles")}</span>
                                            <span className="xs:hidden">Back</span>
                                        </>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg truncate" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.3)' }}>{fileName}</h1>
                                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-white/90" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>{t("fileDetails.folderContents")}</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="w-full sm:w-auto sm:mt-0">
                                <button
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg shadow-lg transition-all duration-200 hover:bg-white/30 hover:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2"
                                    style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                                    onClick={ToggleUploadOptions}
                                >
                                    <HiOutlinePlus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    {t("fileDetails.uploadFile")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Files Section */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 md:mb-6 gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{t("fileDetails.filesInThisFolder")}</h2>
                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-indigo-700" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {filesLoading ? t("fileDetails.loadingFiles") : `${data?.files?.length || 0} ${t("fileDetails.files")}`}
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="text-xs sm:text-sm text-indigo-700 mr-1 sm:mr-2 hidden xs:inline" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{t("fileDetails.view")}</span>
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
                            <h3 className="mt-2 text-sm font-medium text-indigo-900 drop-shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{t("fileDetails.noFilesInFolder")}</h3>
                            <p className="mt-1 text-xs sm:text-sm text-indigo-700 px-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {FilterKey === 'All'
                                    ? t("fileDetails.emptyFolderMessage")
                                    : t("fileDetails.noFilesFound").replace("{type}", t(`fileDetails.${FilterKey === 'image' ? 'images' : FilterKey === 'video' ? 'videos' : FilterKey === 'document' ? 'documents' : 'zipFolders'}`).toLowerCase())
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
                                        {t("fileDetails.uploadFile")}
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
                                    refetch={refetch}
                                    onRename={ToggleNameChange}
                                    onShare={(id) => ShareFile(id, false)}
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
            {AddFileShow && <UploadFile key="upload-file" ToggleUploadFile={ToggleShowAddFile} refetch={refetch} insideFile={true} id={fileId} />}
            {showUploadFromMegaBox && (
                <UploadFromMegaBox 
                    key="upload-from-megabox" 
                    ToggleUploadFile={ToggleUploadFromMegaBox} 
                    refetch={refetch}
                    insideFile={true}
                    id={fileId}
                />
            )}
            {ShowRepresent && <Represents key="represents" path={Path} type={fileType} ToggleUploadFile={() => Representation("", "", true)} />}
            {ShowUpdateName && <ChangeName key="change-name" oldFileName={OldName} Toggle={ToggleNameChange} refetch={refetch} FileId={FileId} />}
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
