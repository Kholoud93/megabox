import React, { useState, useEffect, useRef } from 'react';
import { RiFolderVideoFill } from "react-icons/ri";
import { IoImageSharp, IoDocumentsSharp } from "react-icons/io5";
import { motion } from 'framer-motion';
import { AgoFormatter } from '../../helpers/DateFormates';
import { FiArchive, FiMoreVertical, FiFolder } from 'react-icons/fi';
import { downloadCloudinaryFile } from '../../helpers/DownLoadCloudnairy';
import { HiTrash, HiPencil, HiShare, HiFolderOpen, HiEye } from "react-icons/hi2";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaPlay } from 'react-icons/fa';
import { LuFileArchive } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import axios from 'axios';
import { API_URL, fileService } from '../../services/api';

// Helper function to get document icon based on file extension
const getDocumentIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FaFilePdf className='w-16 h-16 text-red-600' />;
    if (['doc', 'docx'].includes(ext)) return <FaFileWord className='w-16 h-16 text-blue-600' />;
    if (['xls', 'xlsx'].includes(ext)) return <FaFileExcel className='w-16 h-16 text-green-600' />;
    if (['ppt', 'pptx'].includes(ext)) return <FaFilePowerpoint className='w-16 h-16 text-orange-600' />;
    return <FaFileAlt className='w-16 h-16 text-indigo-600' />;
};

const typeConfig = {
    image: {
        icon: <IoImageSharp className='text-secondary-600 w-[25px] h-[25px]' />,
        previewStyle: (url) => ({
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }),
    },
    video: {
        icon: <RiFolderVideoFill className='text-secondary-600 w-[25px] h-[25px]' />,
        previewStyle: (url) => ({
            background: '#000',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }),
        previewComponent: (url) => (
            <div className="w-full h-full relative bg-black flex items-center justify-center">
                <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                    playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border-4 border-white/40 shadow-2xl transform hover:scale-110 transition-transform">
                        <FaPlay className="w-8 h-8 text-white ml-1" />
                    </div>
                </div>
            </div>
        ),
    },
    document: {
        icon: <IoDocumentsSharp className='text-secondary-600 w-[25px] h-[25px]' />,
        previewStyle: (url, fileName) => {
            const ext = fileName?.split('.').pop()?.toLowerCase();
            if (ext === 'pdf') {
                return {
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                };
            }
            return {
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            };
        },
        previewComponent: (url, fileName) => {
            const ext = fileName?.split('.').pop()?.toLowerCase();

            // For PDFs, show actual PDF preview
            if (ext === 'pdf') {
                return (
                    <div className="w-full h-full bg-white">
                        <iframe
                            src={`${url}#view=FitH`}
                            className="w-full h-full border-0"
                            title="PDF Preview"
                        />
                    </div>
                );
            }

            // For other documents, show icon with better styling
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
                    {getDocumentIcon(fileName)}
                    <p className="mt-3 text-sm font-semibold text-indigo-700">Document</p>
                </div>
            );
        }
    },
    zip: {
        icon: <FiFolder className='text-secondary-600 w-[25px] h-[25px]' />,
        previewStyle: (url) => ({
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }),
        previewComponent: (url) => (
            <div className="w-full h-full relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-start justify-start p-3">
                {/* Folder tab */}
                <div className="absolute top-2 left-3 w-12 h-2 bg-amber-400 rounded-t-sm"></div>

                {/* Folder body with files */}
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg border-2 border-amber-300/50 shadow-inner mt-3 p-3 flex flex-col gap-2">
                    {/* File representations */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-8 bg-blue-500/60 rounded-sm shadow-sm"></div>
                        <div className="flex-1 h-2 bg-amber-600/30 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-8 bg-green-500/60 rounded-sm shadow-sm"></div>
                        <div className="flex-1 h-2 bg-amber-600/30 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-8 bg-purple-500/60 rounded-sm shadow-sm"></div>
                        <div className="flex-1 h-2 bg-amber-600/30 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-8 bg-red-500/60 rounded-sm shadow-sm"></div>
                        <div className="flex-1 h-2 bg-amber-600/30 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                        <LuFileArchive className="w-5 h-5 text-amber-700" />
                        <span className="text-xs font-semibold text-amber-800">ZIP Archive</span>
                    </div>
                </div>
            </div>
        ),
        isDownloadOnly: false,
    }
};

export default function File({ Type, data, Representation, onRename, refetch, onShare, viewMode }) {

    const [showMenu, setShowMenu] = useState(false);
    const { url, createdAt, fileName, fileType, _id } = data;
    const config = typeConfig[Type];
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const [MegaBox] = useCookies(['MegaBox'])

    const { DeleteFile } = useAuth();

    const truncateString = (str) =>
        str?.length <= 20 ? str : str?.slice(0, 20) + '...';

    if (!config) return null;

    // Close menu when clicking outside
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

    const handleOpenFile = () => {
        if (Type === 'image') {
            Representation(url, fileType);
        } else if (Type === 'zip') {
            // For zip files, download them so user can open/extract
            downloadCloudinaryFile(url, fileName);
            toast.info("Downloading zip file...", ToastOptions("info"));
        } else if (Type === 'video') {
            Representation(url, fileType);
        } else if (Type === 'document') {
            Representation(url, fileType);
        }
    };

    const handleArchive = async () => {
        try {
            await fileService.archiveFile(_id, MegaBox.MegaBox);
            toast.success("File archived successfully", ToastOptions("success"));
            refetch();
        } catch (error) {
            toast.error("Failed to archive file", ToastOptions("error"));
        }
    };

    const handleAction = async (action) => {
        setShowMenu(false);
        switch (action) {
            case 'open':
                handleOpenFile();
                break;
            case 'delete':
                const DeleteRes = await DeleteFile(_id, MegaBox.MegaBox);

                if (DeleteRes)
                    toast.success("File deleted successfully", ToastOptions("success"));
                refetch();
                break;
            case 'rename':
                onRename(fileName, false, _id);
                break;
            case "share":
                await onShare(_id)
                break;
            case "archive":
                await handleArchive();
                break;
            default:
                break;
        }
    };

    return (
        <motion.div
            className={`relative bg-white border rounded-lg ${viewMode === 'list' ? 'h-auto flex items-center gap-4 p-4' : 'h-[300px]'} cursor-pointer hover:shadow-lg transition-shadow`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={handleOpenFile}
        >
            <div
                ref={buttonRef}
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering file click
                    setShowMenu(!showMenu);
                }}
            >
                <FiMoreVertical className="w-5 h-5 text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors" />
            </div>

            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute top-10 right-2 bg-white border-2 border-indigo-100 shadow-xl rounded-lg py-2 z-30 text-sm min-w-[180px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {(Type === 'image' || Type === 'zip' || Type === 'video' || Type === 'document') && (
                        <button
                            onClick={() => handleAction('open')}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                        >
                            {Type === 'zip' ? (
                                <>
                                    <HiFolderOpen className='w-5 h-5 text-indigo-600' />
                                    <span className="font-medium">Open</span>
                                </>
                            ) : (
                                <>
                                    <HiEye className='w-5 h-5 text-indigo-600' />
                                    <span className="font-medium">Open</span>
                                </>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => handleAction('rename')}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                    >
                        <HiPencil className='w-5 h-5 text-green-600' />
                        <span className="font-medium">Rename</span>
                    </button>
                    <button
                        onClick={() => handleAction('share')}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                    >
                        <HiShare className='w-5 h-5 text-blue-600' />
                        <span className="font-medium">Share</span>
                    </button>
                    <button
                        onClick={() => handleAction('archive')}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                    >
                        <FiArchive className='w-5 h-5 text-purple-600' />
                        <span className="font-medium">Archive</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                        onClick={() => handleAction('delete')}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full text-left transition-colors text-red-600"
                    >
                        <HiTrash className='w-5 h-5 text-red-600' />
                        <span className="font-medium">Delete</span>
                    </button>
                </div>
            )}

            {viewMode === 'list' ? (
                <>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {config.icon}
                        <p className="truncate flex-1">{truncateString(fileName)}</p>
                    </div>
                    <div className="w-32 h-24 flex-shrink-0 rounded overflow-hidden">
                        {config.previewComponent ? (
                            config.previewComponent(url, fileName)
                        ) : (
                            <div style={config.previewStyle(url, fileName)} className="w-full h-full" />
                        )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <p className='text-sm text-gray-500'>{AgoFormatter(createdAt)}</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-full h-[40px] p-2 flex gap-2 items-center">
                        {config.icon}
                        <p className="truncate">{truncateString(fileName)}</p>
                    </div>
                    <div className="w-full h-[200px] overflow-hidden">
                        {config.previewComponent ? (
                            config.previewComponent(url, fileName)
                        ) : (
                            <div style={config.previewStyle(url, fileName)} className="w-full h-full" />
                        )}
                    </div>
                    <div className="w-full h-[60px] flex justify-end items-center p-2">
                        <p className='text-sm text-gray-500'>{AgoFormatter(createdAt)}</p>
                    </div>
                </>
            )}
        </motion.div>
    );
}
