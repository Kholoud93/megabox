import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const fileService = {
    uploadFile: async (file, token) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const { data } = await api.post("/auth/createFile", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (data?.message === "✅ تم رفع الملف بنجاح")
                return true;

            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    deletFile: async (id, token) => {
        try {
            const { data } = await api.delete(`/auth/deleteFile/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data?.message === "✅ تم حذف الملف بنجاح")
                return true;

            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    changeFileName: async (id, token, newFileName) => {
        try {
            const { data } = await api.patch(`/auth/updateFileName/${id}`, {
                newFileName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data?.message === "✅ تم تعديل اسم الملف بنجاح")
                return true;

            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    generateShareLink: async (fileId, token) => {
        try {
            const { data } = await api.post('/auth/generateShareLink', {
                fileId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Show success toast if message indicates success
            if (data?.message && (data.message.includes('نجاح') || data.message.includes('success') || data.shareUrl || data.shareLink)) {
                toast.success(data.message || "Share link generated successfully", ToastOptions("success"));
            }
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate share link", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    saveFile: async (fileId, token) => {
        try {
            const { data } = await api.post('/auth/saveFile', {
                fileId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("File saved successfully!", ToastOptions("success"));
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save file", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Get all files (excluding archived) - includes created zip files
    getAllFiles: async (token) => {
        try {
            const { data } = await api.get('/auth/getUserFiles', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Filter out archived files
            if (data?.files) {
                data.files = data.files.filter(file => !file.archived && !file.isArchived);
            }
            
            // Also include created zip files from getMyZips (call API directly to avoid circular dependency)
            try {
                const zipResponse = await api.get('/auth/getMyZips', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const createdZips = zipResponse.data?.zips || zipResponse.data?.files || [];
                if (createdZips.length > 0) {
                    // Merge created zips with regular files, avoiding duplicates
                    // Use a more robust duplicate check that includes both _id and id fields
                    const existingIds = new Set();
                    (data?.files || []).forEach(f => {
                        if (f._id) existingIds.add(String(f._id));
                        if (f.id) existingIds.add(String(f.id));
                    });
                    
                    const newZips = createdZips
                        .filter(zip => {
                            const zipId = zip._id || zip.id;
                            // Also filter out archived zips
                            const isArchived = zip.archived === true || zip.isArchived === true;
                            return zipId && !existingIds.has(String(zipId)) && !isArchived;
                        })
                        .map(zip => {
                            const zipId = zip._id || zip.id;
                            if (zipId) existingIds.add(String(zipId)); // Track added IDs
                            return {
                                ...zip,
                                fileType: zip.fileType || 'application/zip', // Ensure zip type is set
                                fileName: zip.fileName || zip.name || 'zip_file.zip'
                            };
                        });
                    if (newZips.length > 0) {
                        data.files = [...(data?.files || []), ...newZips];
                    }
                }
            } catch (zipError) {
                // Silently fail - created zips are optional
                console.warn('Failed to fetch created zips:', zipError);
            }
            
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get image files only
    getImageFiles: async (token) => {
        try {
            const { data } = await api.get('/auth/getUserFiles', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Filter for images only, excluding archived
            if (data?.files) {
                data.files = data.files.filter(file =>
                    file.fileType?.startsWith('image/') &&
                    !file.archived &&
                    !file.isArchived
                );
            }
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get video files only
    getVideoFiles: async (token) => {
        try {
            const { data } = await api.get('/auth/getUserFiles', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Filter for videos only, excluding archived
            if (data?.files) {
                data.files = data.files.filter(file =>
                    file.fileType?.startsWith('video/') &&
                    !file.archived &&
                    !file.isArchived
                );
            }
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get document files only
    getDocumentFiles: async (token) => {
        try {
            const { data } = await api.get('/auth/getUserFiles', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Filter for documents only, excluding archived
            const documentTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.oasis.opendocument.text',
                'application/vnd.oasis.opendocument.spreadsheet',
                'application/vnd.oasis.opendocument.presentation',
                'application/vnd.oasis.opendocument.graphics',
                'application/odf',
                'text/plain'
            ];
            if (data?.files) {
                data.files = data.files.filter(file =>
                    documentTypes.includes(file.fileType) &&
                    !file.archived &&
                    !file.isArchived
                );
            }
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get zip files only
    getZipFiles: async (token) => {
        try {
            const { data } = await api.get('/auth/getUserFiles', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Filter for zip files only, excluding archived
            const zipTypes = [
                'application/zip',
                'application/x-zip-compressed',
                'multipart/x-zip',
                'application/x-compressed',
            ];
            if (data?.files) {
                data.files = data.files.filter(file =>
                    zipTypes.includes(file.fileType) &&
                    !file.archived &&
                    !file.isArchived
                );
            }
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get archived files only
    getArchivedFiles: async (token) => {
        try {
            const { data } = await api.get('/auth/getUserFiles', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Filter for archived files only
            if (data?.files) {
                data.files = data.files.filter(file =>
                    file.archived === true || file.isArchived === true
                );
            }
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Archive file - Use createArchive (POST) endpoint for archiving individual files
    archiveFile: async (fileId, token) => {
        try {
            // Use POST /auth/createArchive endpoint (the only available endpoint)
            const { data } = await api.post('/auth/createArchive', {
                files: [fileId],
                folders: []
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("File archived successfully", ToastOptions("success"));
            return data;
        } catch (error) {
            console.error('Archive file error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to archive file", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Unarchive file
    unarchiveFile: async (fileId, token) => {
        try {
            // Try /user/archiveFile first (matches folder pattern)
            let data;
            try {
                const response = await api.patch(`/user/archiveFile/${fileId}`, {
                    archived: false
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                data = response.data;
                toast.success("File unarchived successfully", ToastOptions("success"));
                return data;
            } catch (userError) {
                // If /user/archiveFile fails, try /auth/archiveFile
                if (userError.response?.status === 404) {
                    try {
                        const response = await api.patch(`/auth/archiveFile/${fileId}`, {
                            archived: false
                        }, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        data = response.data;
                        toast.success("File unarchived successfully", ToastOptions("success"));
                        return data;
                    } catch (authError) {
                        // If both endpoints fail, the unarchive endpoint doesn't exist
                        console.warn('Unarchive file endpoint not available:', authError.response?.status || authError.message);
                        toast.error("Unarchive endpoint not available", ToastOptions("error"));
                        throw new Error('Unarchive endpoint not available.');
                    }
                } else {
                    throw userError;
                }
            }
        } catch (error) {
            console.error('Unarchive file error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to unarchive file", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Create zip from files and folders (Postman collection format)
    createZip: async (items, token) => {
        try {
            // items format: [{ type: "file", id: "..." }, { type: "folder", id: "..." }]
            const { data } = await api.post('/auth/createZip', {
                items: items || []
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Zip file created successfully", ToastOptions("success"));
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create zip file", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Create zip from files and folders (legacy format - for backward compatibility)
    createZipLegacy: async (fileIds, folderIds, zipName, token) => {
        try {
            // Convert legacy format to Postman format
            const items = [];
            if (fileIds && fileIds.length > 0) {
                fileIds.forEach(id => items.push({ type: "file", id }));
            }
            if (folderIds && folderIds.length > 0) {
                folderIds.forEach(id => items.push({ type: "folder", id }));
            }
            return await fileService.createZip(items, token);
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user's zip files
    getMyZips: async (token) => {
        try {
            const { data } = await api.get('/auth/getMyZips', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Download zip file by ID
    downloadZip: async (zipId, items, token, fileName) => {
        try {
            const response = await api.post(`/auth/downloadZip/${zipId}`, {
                items: items || []
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob' // Important for file downloads
            });
            
            // Get filename from response headers or use provided/default
            const contentDisposition = response.headers['content-disposition'];
            let downloadFileName = fileName || 'download.zip';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
                }
            }
            
            // Create download link for blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', downloadFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success("Zip file downloaded successfully", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to download zip file", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Create archive with files and folders
    createArchive: async (files, folders, token) => {
        try {
            const { data } = await api.post('/auth/createArchive', {
                files: files || [],
                folders: folders || []
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Archive created successfully", ToastOptions("success"));
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create archive", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Get user's archives
    getMyArchives: async (token) => {
        try {
            const { data } = await api.get('/auth/getMyArchives', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Remove items from archive
    removeFromArchive: async (itemId, files, folders, token) => {
        try {
            const { data } = await api.delete(`/auth/removeFromArchive/${itemId}`, {
                data: {
                    files: files || [],
                    folders: folders || []
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Items removed from archive successfully", ToastOptions("success"));
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove items from archive", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Get shared files by user
    getSharedFilesByUser: async (token) => {
        try {
            const { data } = await api.get('/auth/getSharedFilesByUser', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get shared folder content
    getSharedFolderContent: async (folderId, token) => {
        try {
            const { data } = await api.get(`/auth/getSharedFolderContent/${folderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Disable file share
    disableFileShare: async (fileId, token) => {
        try {
            const { data } = await api.patch(`/user/disableFileShare/${fileId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("File sharing disabled successfully", ToastOptions("success"));
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to disable file sharing", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Get user storage usage
    getUserStorageUsage: async (token) => {
        try {
            const { data } = await api.get('/auth/getUserStorageUsage', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get shared file
    getSharedFile: async (fileId) => {
        try {
            const { data } = await api.get(`/auth/getSharedFile/${fileId}`);
            return data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default fileService;

