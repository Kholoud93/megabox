import React, { useRef, useState } from 'react'
import '../Upload.scss'
import { HiX } from "react-icons/hi";
import { PreventFunction } from '../../../helpers/Prevent';
import { motion } from 'framer-motion';
import { LuFolderOpen } from "react-icons/lu";
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { useCookies } from 'react-cookie';
import { API_URL } from '../../../services/api';
import axios from 'axios';
import { HiArrowPath } from "react-icons/hi2";
import { HiTrash } from "react-icons/hi2";
import { HiCheckCircle } from "react-icons/hi2";

export default function UploadFile({ ToggleUploadFile, refetch, insideFile, id }) {

    const Active = "inline-block p-4 cursor-pointer text-white bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded shadow-lg transition-all";
    const InActive = "inline-block p-4 rounded cursor-pointer text-white/80 hover:text-white hover:bg-white/20 hover:border-white/30 border-2 border-white/20 transition-all"

    const [FileType, setFileType] = useState("All");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [UploadLoading, setUploadLoading] = useState(false);

    const SelectFileType = (Type) => setFileType(Type);

    const [Token] = useCookies(['MegaBox']);

    const acceptedMimeTypes = {
        All: '*',
        Image: 'image/*',
        Video: 'video/*',
        Document: '.pdf',
        Zip: '.zip,.rar,.7z'
    };

    const getFileTypeIcon = (file) => {
        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type.startsWith('video/')) return '🎥';
        if (file.type === 'application/pdf') return '📄';
        if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) return '📦';
        return '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const HandleUserFile = (event) => {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;

        // Add new files to existing ones
        setSelectedFiles(prev => {
            const newFiles = [...prev];
            files.forEach(file => {
                // Check if file already exists (by name and size)
                const exists = newFiles.some(f => f.name === file.name && f.size === file.size);
                if (!exists) {
                    newFiles.push(file);
                }
            });
            return newFiles;
        });

        // Reset input to allow selecting same files again
        event.target.value = '';
    }

    const RemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        // Also remove from upload progress
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[index];
            return newProgress;
        });
    }

    const ClearAllFiles = () => {
        setSelectedFiles([]);
        setUploadProgress({});
        if (ref.current) {
            ref.current.value = '';
        }
    }

    const AddFiles = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select at least one file.", ToastOptions("error"));
            return;
        }

        setUploadLoading(true);
        const userUrl = insideFile ? `user/createFile/${id}` : "auth/createFile";
        let successCount = 0;
        let failCount = 0;

        // Upload files sequentially
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            try {
                setUploadProgress(prev => ({ ...prev, [i]: 'uploading' }));

                const formData = new FormData();
                formData.append("file", file);

                const { data } = await axios.post(`${API_URL}/${userUrl}`, formData, {
                    headers: {
                        Authorization: `Bearer ${Token.MegaBox}`
                    }
                });

                if (data?.message === "✅ تم رفع الملف بنجاح") {
                    setUploadProgress(prev => ({ ...prev, [i]: 'success' }));
                    successCount++;
                } else {
                    setUploadProgress(prev => ({ ...prev, [i]: 'error' }));
                    failCount++;
                }
            } catch (err) {
                setUploadProgress(prev => ({ ...prev, [i]: 'error' }));
                failCount++;
            }
        }

        setUploadLoading(false);

        // Show results
        if (successCount > 0 && failCount === 0) {
            toast.success(`${successCount} file(s) uploaded successfully`, ToastOptions("success"));
            await refetch();
            setTimeout(() => {
                ToggleUploadFile();
            }, 1000);
        } else if (successCount > 0 && failCount > 0) {
            toast.warning(`${successCount} file(s) uploaded, ${failCount} failed`, ToastOptions("warning"));
            await refetch();
        } else {
            toast.error("All file uploads failed", ToastOptions("error"));
        }
    }

    const ref = useRef();


    return <motion.div className='UploadFile_backDrob' onClick={ToggleUploadFile} initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: 'linear' }} exit={{ opacity: 0 }} >

        <motion.div 
            className="UploadFile relative p-6 bg-gradient-to-br from-indigo-400 to-indigo-500"
            style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}
            onClick={PreventFunction} 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 20, opacity: 0 }} 
            transition={{ duration: 0.4, type: 'spring' }}
        >

            <HiX 
                className='Close !text-indigo-100 hover:!text-white transition-all duration-200 hover:scale-110 cursor-pointer' 
                onClick={ToggleUploadFile}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))', color: 'rgb(224, 231, 255) !important' }}
            />

            <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.3)' }}>Upload Files</h2>
                <p className="text-sm text-white/90" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>Select file type and upload multiple files at once</p>
            </div>

            <ul className="flex flex-wrap mt-3 text-sm font-medium text-center">
                <li className="me-2" onClick={() => SelectFileType("All")}>
                    <p className={FileType === "All" ? Active : InActive}>All Files</p>
                </li>
                <li className="me-2" onClick={() => SelectFileType("Image")}>
                    <p className={FileType === "Image" ? Active : InActive}>Image</p>
                </li>
                <li className="me-2" onClick={() => SelectFileType("Video")}>
                    <p className={FileType === "Video" ? Active : InActive}>Video</p>
                </li>
                <li className="me-2" onClick={() => SelectFileType("Document")}>
                    <p className={FileType === "Document" ? Active : InActive}>Document</p>
                </li>
                <li className="me-2" onClick={() => SelectFileType("Zip")}>
                    <p className={FileType === "Zip" ? Active : InActive}>Zip Folder</p>
                </li>
            </ul>

            <div className="rounded-lg overflow-hidden w-full mt-4">

                <div className="md:flex">
                    <div className="w-full p-3 cursor-pointer">
                        <div className="relative border-solid w-full h-48 rounded-lg border-2 border-white/40 bg-white/10 backdrop-blur-sm flex justify-center items-center transition-all hover:border-white/60 hover:bg-white/15">

                            <div className="absolute">
                                <div className="flex flex-col items-center">
                                    <LuFolderOpen className="text-4xl text-white drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.3))' }} />
                                    <span className="block text-white/90 font-normal mt-2 drop-shadow-md text-center" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>
                                        Click to select files<br />
                                        <span className="text-xs text-white/70">(You can select multiple files)</span>
                                    </span>
                                </div>
                            </div>

                            <input
                                type="file"
                                onChange={HandleUserFile}
                                className="h-full w-full opacity-0 cursor-pointer"
                                name="file"
                                accept={FileType ? acceptedMimeTypes[FileType] : '*'}
                                multiple
                                ref={ref}
                            />
                        </div>
                    </div>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-white font-medium drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>
                                {selectedFiles.length} file(s) selected
                            </p>
                            <button
                                onClick={ClearAllFiles}
                                className="text-white/80 hover:text-white text-sm underline transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="p-3 text-sm text-white relative rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-xl">{getFileTypeIcon(file)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate drop-shadow-md" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.2)' }}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-white/70">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {uploadProgress[index] === 'uploading' && (
                                            <HiArrowPath className='h-5 w-5 text-white animate-spin' />
                                        )}
                                        {uploadProgress[index] === 'success' && (
                                            <HiCheckCircle className='h-5 w-5 text-green-300' />
                                        )}
                                        {uploadProgress[index] === 'error' && (
                                            <span className="text-red-300 text-xs">Failed</span>
                                        )}
                                        <HiTrash
                                            className='h-5 w-5 text-white cursor-pointer hover:text-white/80 transition-colors'
                                            onClick={() => RemoveFile(index)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="w-full flex justify-center items-center mt-4">
                    <button
                        type="button"
                        onClick={AddFiles}
                        disabled={selectedFiles.length === 0 || UploadLoading}
                        className="w-[300px] bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white h-[40px] rounded-md hover:bg-white/30 hover:border-white/60 transition-all flex justify-center items-center font-semibold drop-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                    >
                        {UploadLoading ? (
                            <>
                                <HiArrowPath className='LoadingButton mr-2' />
                                Uploading...
                            </>
                        ) : (
                            `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} File${selectedFiles.length !== 1 ? 's' : ''}`
                        )}
                    </button>
                </div>

            </div>





        </motion.div>
    </motion.div>
}
