import axios from 'axios';
import React, { useState } from 'react'
import { useCookies } from 'react-cookie';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_URL, userService, fileService } from '../../../services/api';
import { getFileCategory } from '../../../helpers/MimeType';
import File from '../../../components/File/File';
import { Folder } from '../../../components/Folder/Folder';
import { AnimatePresence } from 'framer-motion';
import UploadFile from '../../../components/Upload/UploadFile/UploadFile';
import UploadOptions from '../../../components/Upload/UploadOptions/UploadOptions';
import UploadFromMegaBox from '../../../components/Upload/UploadFromMegaBox/UploadFromMegaBox';
import AddFolder from '../../../components/Upload/AddFolder/AddFolder';
import { HiOutlinePlus } from 'react-icons/hi2';
import { LuFolderPlus } from 'react-icons/lu';
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import Represents from '../../../components/Represents/Represents';
import ChangeName from '../../../components/ChangeName/ChangeName';
import { useLanguage } from '../../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import ShareLinkModal from '../../../components/ShareLinkModal/ShareLinkModal';

export default function fileDetails() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const Active = "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const InActive = "inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

    const { fileId, fileName } = useParams();
    
    // Determine the files route based on current path
    const getFilesRoute = () => {
        if (location.pathname.includes('/Promoter')) {
            return '/Promoter/files';
        } else if (location.pathname.includes('/Owner')) {
            return '/Owner/files';
        }
        return '/dashboard/files';
    };
    const [FilterKey, setFilterKey] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [Token] = useCookies(['MegaBox']);
    const queryClient = useQueryClient();

    const GetFiles = async ({ queryKey }) => {
        const [, filterKey] = queryKey;
        const type = filterKey.toLowerCase() !== 'all' ? filterKey : null;
        const response = await userService.getFolderFiles(fileId, type, Token.MegaBox);
        return response;
    };
    
    // Get user folders to find subfolders
    const GetFolders = async () => {
        try {
            const foldersData = await userService.getUserFolders(Token.MegaBox);
            return foldersData || { folders: [] };
        } catch (error) {
            return { folders: [] };
        }
    };

    const [AddFileShow, setAddFileShow] = useState(false);
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [showUploadFromMegaBox, setShowUploadFromMegaBox] = useState(false);
    const [AddFolderAdding, setAddFolderAdding] = useState(false);
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

    const { data, refetch, isLoading: filesLoading } = useQuery([`GetUserFile-${fileId}`, FilterKey], GetFiles, {
        enabled: !!fileId && !!Token.MegaBox,
    });
    
    const { data: foldersData, refetch: refetchFolders } = useQuery(['userFolders'], GetFolders, {
        enabled: !!Token.MegaBox,
    });
    
    // Get user data to check if user is promoter
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            retry: false
        }
    );
    
    const isPromoter = userData?.isPromoter === "true" || userData?.isPromoter === true;
    
    // Handle upload button click - show options for promoters, direct upload for regular users
    // Defined after isPromoter to ensure it has the correct value
    const handleUploadClick = () => {
        if (isPromoter) {
            ToggleUploadOptions();
        } else {
            // Regular users go directly to desktop upload
            handleSelectDesktop();
        }
    };

    // Enhanced refetch function that also invalidates related queries
    const refetchFolderData = async () => {
        try {
            // First, invalidate all folder-related queries (this marks them as stale)
            queryClient.invalidateQueries(['userFolders']);
            queryClient.invalidateQueries(['GetUserFolders']);
            
            // Refetch the local folders query first
            await refetchFolders();
            
            // Refetch the current folder's files
            await queryClient.invalidateQueries([`GetUserFile-${fileId}`, FilterKey]);
            await refetch();
            
            // Force refetch all queries with 'userFolders' key (including sidenav)
            // Using refetchQueries without active filter to refetch all matching queries
            await queryClient.refetchQueries(['userFolders'], { 
                exact: false,
                type: 'active'
            });
            
            // Also refetch GetUserFolders queries
            await queryClient.refetchQueries(['GetUserFolders'], { 
                exact: false,
                type: 'active'
            });
        } catch (error) {
            console.error('Error refetching folder data:', error);
        }
    };

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
    const [IsFolder, setIsFolder] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [shareTitle, setShareTitle] = useState('');

    const ToggleNameChange = (name, close, id, isFolder = false) => {
        if (close) {
            setupdateName(!ShowUpdateName);
            return;
        }
        setFileId(id)
        setOldName(name)
        setIsFolder(isFolder)
        setupdateName(!ShowUpdateName);
    };

    const ShareFile = async (id, isFolder = true) => {
        try {
            if (isFolder) {
                // Share folder
                const response = await userService.generateFolderShareLink(id, Token.MegaBox);
                // Handle both shareUrl and shareLink properties
                const link = response?.shareUrl || response?.shareLink;
                if (link) {
                    setShareUrl(link);
                    setShareTitle("Share Folder");
                    setShowShareModal(true);
                } else {
                    toast.error("Failed to generate share link", ToastOptions("error"));
                }
            } else {
                // Share file
                const response = await fileService.generateShareLink(id, Token.MegaBox);
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

    // Find a folder by ID in the nested structure
    const findFolderById = (folders, folderId) => {
        if (!folders || !Array.isArray(folders)) return null;
        for (const folder of folders) {
            if (folder._id === folderId) {
                return folder;
            }
            if (folder.children && folder.children.length > 0) {
                const found = findFolderById(folder.children, folderId);
                if (found) return found;
            }
        }
        return null;
    };
    
    // Find subfolders of the current folder from the folders data
    const findSubfolders = (folders, parentId) => {
        if (!folders || !Array.isArray(folders)) return [];
        const result = [];
        for (const folder of folders) {
            if (folder._id === parentId && folder.children) {
                return folder.children;
            }
            if (folder.children && folder.children.length > 0) {
                const found = findSubfolders(folder.children, parentId);
                if (found.length > 0) return found;
            }
        }
        return result;
    };
    
    // Get current folder and parent folder info
    const currentFolder = findFolderById(foldersData?.folders || [], fileId);
    const parentFolderId = currentFolder?.parentFolder;
    const parentFolder = parentFolderId ? findFolderById(foldersData?.folders || [], parentFolderId) : null;
    
    const subfolders = findSubfolders(foldersData?.folders || [], fileId);
    const totalItems = (data?.files?.length || 0) + subfolders.length;
    
    // Get back navigation route
    const getBackRoute = () => {
        const basePath = location.pathname.includes('/Promoter') 
            ? '/Promoter/file' 
            : location.pathname.includes('/Owner')
            ? '/Owner/file'
            : '/dashboard/file';
        
        if (parentFolder && parentFolderId) {
            // Navigate to parent folder
            return `${basePath}/${encodeURIComponent(parentFolder.name)}/${parentFolderId}`;
        } else {
            // Navigate to all files
            return getFilesRoute();
        }
    };
    
    const filterOptions = [
        { key: "All", label: t("fileDetails.allFiles"), count: totalItems },
        { key: "image", label: t("fileDetails.images"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'image')?.length || 0 },
        { key: "video", label: t("fileDetails.videos"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'video')?.length || 0 },
        { key: "document", label: t("fileDetails.documents"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'document')?.length || 0 },
        { key: "zip", label: t("fileDetails.zipFolders"), count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'zip')?.length || 0 },
    ];

    return <>
        <div className="min-h-screen bg-indigo-50" style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Back Button */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={() => navigate(getBackRoute())}
                        className="inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        {language === 'ar' ? (
                            <>
                                <span>{t("fileDetails.backToFolder") || "Back"}</span>
                                <HiArrowRight className="h-4 w-4 mr-2" />
                            </>
                        ) : (
                            <>
                                <HiArrowLeft className="h-4 w-4 mr-2" />
                                <span>{t("fileDetails.backToFolder") || "Back"}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Files Section */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 md:mb-6 gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{t("fileDetails.filesInThisFolder")}</h2>
                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-indigo-700" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {filesLoading ? t("fileDetails.loadingFiles") : `${totalItems} ${t("fileDetails.items") || "items"}`}
                            </p>
                        </div>

                        {/* View Mode Toggle and Action Buttons */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center space-x-2">
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
                            {/* Upload and Create Folder Buttons - Always Visible */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    onClick={handleUploadClick}
                                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                    style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                                >
                                    <HiOutlinePlus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">{t("fileDetails.uploadFile") || "Upload File"}</span>
                                    <span className="sm:hidden">{t("fileDetails.uploadFile") || "Upload"}</span>
                                </button>
                                <button
                                    onClick={ToggleFolderAdding}
                                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                    style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                                >
                                    <LuFolderPlus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">{t("files.createFolder") || "Create Folder"}</span>
                                    <span className="sm:hidden">{t("files.createFolder") || "Folder"}</span>
                                </button>
                            </div>
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
                    ) : totalItems === 0 ? (
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
                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
                                    <button
                                        onClick={handleUploadClick}
                                        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                        style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                                    >
                                        <HiOutlinePlus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        {t("fileDetails.uploadFile")}
                                    </button>
                                    <button
                                        onClick={ToggleFolderAdding}
                                        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                        style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                                    >
                                        <LuFolderPlus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        {t("files.createFolder") || "Create Folder"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`grid gap-4 sm:gap-5 md:gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                            : 'grid-cols-1'
                            }`}>
                            {/* Display Folders First */}
                            {subfolders.map((folder, index) => (
                                <Folder
                                    key={folder?._id || folder?.id || `folder-${index}`}
                                    name={folder?.name}
                                    data={folder}
                                    onRename={ToggleNameChange}
                                    onDelete={async (folderId) => {
                                        try {
                                            await userService.deleteFolder(folderId, Token.MegaBox);
                                            toast.success(t("files.folderDeletedSuccess") || "Folder deleted successfully", ToastOptions("success"));
                                            refetchFolderData();
                                        } catch (error) {
                                            toast.error(t("files.folderDeleteFailed") || "Failed to delete folder", ToastOptions("error"));
                                        }
                                    }}
                                    onShare={(id) => ShareFile(id, true)}
                                    onArchive={async (folderId) => {
                                        try {
                                            await userService.archiveFolder(folderId, Token.MegaBox);
                                            toast.success("Folder archived successfully", ToastOptions("success"));
                                            refetchFolderData();
                                        } catch (error) {
                                            toast.error("Failed to archive folder", ToastOptions("error"));
                                        }
                                    }}
                                />
                            ))}
                            {/* Display Files */}
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
                    isPromoter={isPromoter}
                />
            )}
            {AddFileShow && <UploadFile key="upload-file" ToggleUploadFile={ToggleShowAddFile} refetch={refetchFolderData} insideFile={true} id={fileId} />}
            {showUploadFromMegaBox && (
                <UploadFromMegaBox 
                    key="upload-from-megabox" 
                    ToggleUploadFile={ToggleUploadFromMegaBox} 
                    refetch={refetchFolderData}
                    insideFile={true}
                    id={fileId}
                />
            )}
                    {AddFolderAdding && (
                        <AddFolder
                            key="add-folder"
                            ToggleUploadFile={ToggleFolderAdding}
                            refetch={refetchFolderData}
                            parentFolderId={fileId}
                        />
                    )}
            {ShowRepresent && <Represents key="represents" path={Path} type={fileType} ToggleUploadFile={() => Representation("", "", true)} />}
            {ShowUpdateName && <ChangeName key="change-name" oldFileName={OldName} Toggle={ToggleNameChange} refetch={IsFolder ? refetchFolderData : refetch} FileId={FileId} isFolder={IsFolder} />}
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
