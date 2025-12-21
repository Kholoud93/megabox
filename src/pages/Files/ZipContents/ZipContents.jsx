import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useQuery } from 'react-query';
import { fileService } from '../../../services/api';
import { getFileCategory } from '../../../helpers/MimeType';
import File from '../../../components/File/File';
import { Folder } from '../../../components/Folder/Folder';
import { HiArrowLeft } from 'react-icons/hi2';
import { HiViewGrid, HiViewList } from 'react-icons/hi';
import { useLanguage } from '../../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { LuFileArchive } from 'react-icons/lu';

export default function ZipContents() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { zipId, zipName } = useParams();
    const [Token] = useCookies(['MegaBox']);
    const [viewMode, setViewMode] = useState('grid');

    // Determine the files route based on current path
    const getFilesRoute = () => {
        if (location.pathname.includes('/Promoter')) {
            return '/Promoter/files';
        } else if (location.pathname.includes('/Owner')) {
            return '/Owner/files';
        }
        return '/dashboard/files';
    };

    // Get zip contents from getMyZips
    const GetZipContents = async () => {
        try {
            const response = await fileService.getMyZips(Token.MegaBox);
            const zips = response?.zips || response?.files || [];
            const zip = zips.find(z => (z._id || z.id) === zipId);
            
            if (!zip) {
                toast.error(t("files.zipFileNotFound"), ToastOptions("error"));
                navigate(getFilesRoute());
                return { files: [], folders: [] };
            }

            // Extract files and folders from zip content
            const zipFiles = zip.content?.files || [];
            const zipFolders = zip.content?.folders || [];

            // Format files to match expected structure
            const formattedFiles = zipFiles.map(file => ({
                ...file,
                fileType: file.fileType || 'application/octet-stream',
                fileName: file.fileName || file.name || 'file'
            }));

            // Format folders to match expected structure
            const formattedFolders = zipFolders.map(folder => ({
                ...folder,
                name: folder.name || folder.folderName || 'folder'
            }));

            return {
                files: formattedFiles,
                folders: formattedFolders,
                zipInfo: {
                    fileName: zip.fileName,
                    fileSize: zip.fileSize,
                    createdAt: zip.createdAt,
                    url: zip.url
                }
            };
        } catch (error) {
            console.error('Error fetching zip contents:', error);
            toast.error(t("files.failedToLoadZip"), ToastOptions("error"));
            return { files: [], folders: [] };
        }
    };

    const { data, refetch, isLoading } = useQuery(['zipContents', zipId], GetZipContents, {
        enabled: !!zipId && !!Token.MegaBox,
    });

    const handleBack = () => {
        navigate(getFilesRoute());
    };

    const Representation = (url, type) => {
        // Handle file preview - similar to Files page
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
                <div className="text-indigo-600 text-lg">{t("files.loadingZipContents")}</div>
            </div>
        );
    }

    const zipInfo = data?.zipInfo || {};
    const files = data?.files || [];
    const folders = data?.folders || [];

    return (
        <div className="min-h-screen bg-indigo-50" style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                        <span className="font-medium">{t("files.back")}</span>
                    </button>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <LuFileArchive className="w-8 h-8 text-amber-600" />
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900">
                                {decodeURIComponent(zipName || zipInfo.fileName || t("files.zipFolders"))}
                            </h1>
                            <p className="text-sm text-indigo-600 mt-1">
                                {files.length} {t("files.files")}, {folders.length} {t("files.folders")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex justify-end mb-4">
                    <div className="flex gap-2 bg-white p-1 rounded-lg border border-indigo-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-colors ${viewMode === 'grid'
                                ? 'bg-indigo-600 text-white'
                                : 'text-indigo-600 hover:bg-indigo-50'
                            }`}
                        >
                            <HiViewGrid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors ${viewMode === 'list'
                                ? 'bg-indigo-600 text-white'
                                : 'text-indigo-600 hover:bg-indigo-50'
                            }`}
                        >
                            <HiViewList className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Folders */}
                {folders.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                            {t("files.folders")} ({folders.length})
                        </h2>
                        <div className={`grid gap-4 sm:gap-5 md:gap-6 ${
                            viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                : 'grid-cols-1'
                        }`}>
                            {folders.map((folder, index) => (
                                <Folder
                                    key={folder._id || folder.id || `folder-${index}`}
                                    name={folder.name || folder.folderName}
                                    data={folder}
                                    onRename={() => {}}
                                    onDelete={() => {}}
                                    onShare={() => {}}
                                    onArchive={() => {}}
                                    isSelectionMode={false}
                                    isSelected={false}
                                    onToggleSelect={() => {}}
                                    refetch={refetch}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Files */}
                {files.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                            {t("files.files")} ({files.length})
                        </h2>
                        <div className={`grid gap-4 sm:gap-5 md:gap-6 ${
                            viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                : 'grid-cols-1'
                        }`}>
                            {files.map((file, index) => (
                                <File
                                    key={file._id || file.id || `file-${index}`}
                                    Type={getFileCategory(file.fileType)}
                                    data={file}
                                    Representation={Representation}
                                    refetch={refetch}
                                    onRename={() => {}}
                                    onShare={() => {}}
                                    viewMode={viewMode}
                                    isSelectionMode={false}
                                    isSelected={false}
                                    onToggleSelect={() => {}}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {files.length === 0 && folders.length === 0 && (
                    <div className="text-center py-12">
                        <LuFileArchive className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                        <p className="text-indigo-600 text-lg">
                            {t("files.emptyZip")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

