import React, { useEffect, useState } from 'react';
import './VideoPreview.scss';
import PreviewNav from '../../components/PreviewNav/PreviewNav';
import { GiSaveArrow } from "react-icons/gi";
import { GiSave } from "react-icons/gi";
import { CiMobile3 } from "react-icons/ci";
import { FaFile, FaFolder } from "react-icons/fa";
import { LuFolder } from "react-icons/lu";
import FilePreview from './FilePreview';
import { useParams, useSearchParams } from 'react-router-dom';
import { extractBranchDataFromUrl } from '../../helpers/Deeplink';
import { fileService, userService } from '../../services/api';
import Loading from '../../components/Loading/Loading';
import { DateFormatter } from '../../helpers/DateFormates';
import { GetFileTypeByName } from '../../helpers/GetFileTypeByName';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import File from '../../components/File/File';
import { Folder } from '../../components/Folder/Folder';
import { getFileCategory } from '../../helpers/MimeType';

export default function VideoPreview() {
    const { VideoId } = useParams();
    const [searchParams] = useSearchParams();
    const [fileData, setFileData] = useState(null);
    const [folderData, setFolderData] = useState(null);
    const [sharedItems, setSharedItems] = useState(null);
    const [contentType, setContentType] = useState('file'); // 'file', 'folder', 'multi'
    const [FileLoading, setFileLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [Token] = useCookies(['MegaBox']);
    const navigate = useNavigate();

    // Detect content type from URL params
    const type = searchParams.get('type'); // 'folder' or 'multi'
    const folderIds = searchParams.get('folderIds');
    const fileIds = searchParams.get('fileIds');
    const sharedBy = searchParams.get('sharedBy');

    useEffect(() => {
        const loadContent = async () => {
            setFileLoading(true);
            try {
                // Check if it's a multi-item share
                if (type === 'multi' && folderIds && fileIds && sharedBy) {
                    const folderIdsArray = folderIds.split(',').filter(id => id);
                    const fileIdsArray = fileIds.split(',').filter(id => id);
                    try {
                        const data = await userService.getSharedItems(folderIdsArray, fileIdsArray, sharedBy);
                        setSharedItems(data);
                        setContentType('multi');
                    } catch (err) {
                        console.log(err);
                        throw err;
                    }
                }
                // Check if it's a folder
                else if (type === 'folder' && VideoId) {
                    try {
                        const data = await fileService.getSharedFolderContent(VideoId, Token.MegaBox);
                        setFolderData(data);
                        setContentType('folder');
                    } catch (err) {
                        console.log(err);
                        throw err;
                    }
                }
                // Try Branch deep link first
                else {
                    const url = window.location.href;
                    try {
                        const branchData = await extractBranchDataFromUrl(url);
                        if (branchData?.fileId) {
                            try {
                                const data = await fileService.getSharedFile(branchData.fileId);
                                setFileData({
                                    ...data?.file,
                                    fileType: GetFileTypeByName(data?.file?.name)
                                });
                                setContentType('file');
                            } catch (err) {
                                console.log(err);
                                throw err;
                            }
                        } else if (VideoId) {
                            // Fallback to URL param
                            try {
                                const data = await fileService.getSharedFile(VideoId);
                                setFileData({
                                    ...data?.file,
                                    fileType: GetFileTypeByName(data?.file?.name)
                                });
                                setContentType('file');
                            } catch (err) {
                                console.log(err);
                                throw err;
                            }
                        } else {
                            navigate("/");
                            console.log("No valid ID found");
                        }
                    } catch {
                        // If Branch fails, try direct ID
                        if (VideoId) {
                            try {
                                const data = await fileService.getSharedFile(VideoId);
                                setFileData({
                                    ...data?.file,
                                    fileType: GetFileTypeByName(data?.file?.name)
                                });
                                setContentType('file');
                            } catch (err) {
                                console.log(err);
                                throw err;
                            }
                        } else {
                            navigate("/");
                            console.log("No valid ID found");
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading content:', error);
                toast.error("Failed to load content", ToastOptions("error"));
                navigate("/");
            } finally {
                setFileLoading(false);
            }
        };

        loadContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [VideoId, type, folderIds, fileIds, sharedBy, Token.MegaBox]);

    const handleSaveFile = async () => {
        if (!Token.MegaBox) {
            toast.error("Please login to save files", ToastOptions("error"));
            navigate('/login');
            return;
        }

        if (!fileData?._id && !fileData?.id) {
            toast.error("File ID not found", ToastOptions("error"));
            return;
        }

        setSaving(true);
        try {
            const fileId = fileData._id || fileData.id;
            await fileService.saveFile(fileId, Token.MegaBox);
            toast.success("File saved successfully!", ToastOptions("success"));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save file", ToastOptions("error"));
        } finally {
            setSaving(false);
        }
    };

    if (FileLoading)
        return <Loading />

    // Render folder content
    if (contentType === 'folder' && folderData) {
        return (
            <div className="VideoPreviewLayout min-h-screen">
                <PreviewNav />
                <section className="VideoPreview_main">
                    <div className="VideoPreview container mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <div className="flex items-center gap-4">
                                <LuFolder className="w-10 h-10 text-indigo-600" />
                                <div>
                                    <h2 className="text-xl font-semibold dark:text-white">{folderData?.folder?.name || 'Shared Folder'}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {folderData?.folder?.createdAt && DateFormatter(folderData.folder.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {folderData?.files && folderData.files.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folderData.files.map((file) => (
                                    <File
                                        key={file._id || file.id}
                                        Type={getFileCategory(file.fileType)}
                                        data={{
                                            ...file,
                                            fileName: file.name,
                                            url: file.url || file.fileUrl
                                        }}
                                        viewMode="grid"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">This folder is empty</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        );
    }

    // Render multi-item share
    if (contentType === 'multi' && sharedItems) {
        return (
            <div className="VideoPreviewLayout min-h-screen">
                <PreviewNav />
                <section className="VideoPreview_main">
                    <div className="VideoPreview container mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <h2 className="text-xl font-semibold dark:text-white">Shared Items</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Multiple files and folders shared together
                            </p>
                        </div>

                        {/* Folders */}
                        {sharedItems?.folders && sharedItems.folders.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4 dark:text-white">Folders</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {sharedItems.folders.map((folder) => (
                                        <Folder
                                            key={folder._id || folder.id}
                                            name={folder.name}
                                            data={folder}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files */}
                        {sharedItems?.files && sharedItems.files.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 dark:text-white">Files</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {sharedItems.files.map((file) => (
                                        <File
                                            key={file._id || file.id}
                                            Type={getFileCategory(file.fileType)}
                                            data={{
                                                ...file,
                                                fileName: file.name,
                                                url: file.url || file.fileUrl
                                            }}
                                            viewMode="grid"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {(!sharedItems?.folders || sharedItems.folders.length === 0) && 
                         (!sharedItems?.files || sharedItems.files.length === 0) && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">No items found</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        );
    }

    // Render file (default)
    return (
        <div className="VideoPreviewLayout min-h-screen">
            <PreviewNav />
            <section className="VideoPreview_main">

                <div className="VideoPreview container mx-auto flex lg:flex-nowrap gap-3 flex-wrap">
                    <div className="lg:w-1/3 w-full VideoPreview_buttons flex flex-col items-center gap-3">
                        {Token.MegaBox && (
                            <button 
                                onClick={handleSaveFile}
                                disabled={saving}
                                className="First_Button"
                            >
                                {saving ? 'Saving...' : 'Save to MegaBox'} <GiSave />
                            </button>
                        )}
                        <button className="Main_Button">Download <GiSaveArrow /></button>
                        <a href='https://play.google.com/store/apps/details?id=com.dubox.drive' className="First_Button">Show it in application <CiMobile3 /></a>
                    </div>

                    <div className="lg:w-3/4 w-full VideoPreview_main_sec2">
                        <div className="h-[80px] border-b felx justify-start">
                            <div className="flex items-center gap-4 h-full px-3">
                                <FaFile className="w-10 h-10 FileTypeIcon" />
                                <div className="font-medium dark:text-white">
                                    <div>{fileData?.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {DateFormatter(fileData?.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center items-center">
                            <FilePreview fileType={fileData} />
                        </div>

                    </div>
                </div>

            </section>
        </div>
    );
}

