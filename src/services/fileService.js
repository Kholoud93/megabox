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
            // Toast is shown in the component
            return data;
        } catch (error) {
            console.error('Archive file error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to archive file", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Unarchive file - use removeFromArchive endpoint
    // Backend expects Archive ID in URL, not File ID
    // We need to find which archive contains this file first
    unarchiveFile: async (fileId, token) => {
        try {
            console.log('📤 Unarchiving file:', fileId);
            
            // First, get all archives to find which archive contains this file
            const archivesResponse = await api.get('/auth/getMyArchives', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const archives = archivesResponse.data?.data || [];
            console.log('🔍 Searching for file in archives:', fileId);
            
            // Find the archive that contains this file
            let archiveId = null;
            for (const archive of archives) {
                const hasFile = archive.files?.some(f => (f._id || f.id) === fileId);
                if (hasFile) {
                    archiveId = archive._id;
                    console.log('✅ Found archive containing file:', archiveId);
                    break;
                }
            }
            
            if (!archiveId) {
                throw new Error("Archive not found for this file");
            }
            
            // Use Archive ID in URL, File ID in body
            const { data } = await api.delete(`/auth/removeFromArchive/${archiveId}`, {
                data: {
                    files: [fileId],
                    folders: []
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Unarchive file success:', data);
            // Toast is shown in the component
            return data;
        } catch (error) {
            console.error('❌ Unarchive file error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                data: error.response?.data,
                fileId
            });
            
            const errorMessage = error.response?.data?.message || error.message || "Failed to unarchive file";
            toast.error(errorMessage, ToastOptions("error"));
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
            // Toast is shown in the component
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
            
            console.log('📦 Raw getMyArchives response:', data);
            
            // Transform response: extract all files and folders from all archives
            // Response structure: { message, count, data: [{ files: [], folders: [] }, ...] }
            // OR: { message, count, data: [{ _id: archiveId, files: [], folders: [] }, ...] }
            const archives = data?.data || [];
            
            console.log('📦 Total archives:', archives.length);
            console.log('📦 API count:', data?.count);
            console.log('📦 Archive structure sample:', archives[0]);
            
            // Flatten all files and folders from all archives
            const allFiles = [];
            const allFolders = [];
            const seenFileIds = new Set();
            const seenFolderIds = new Set();
            let totalFilesProcessed = 0;
            let totalFoldersProcessed = 0;
            let filesWithoutId = 0;
            let foldersWithoutId = 0;
            
            archives.forEach((archive, archiveIdx) => {
                // Add files from this archive
                if (archive.files && Array.isArray(archive.files)) {
                    console.log(`📦 Archive ${archiveIdx + 1}: ${archive.files.length} files`);
                    archive.files.forEach(file => {
                        totalFilesProcessed++;
                        const fileId = file._id || file.id;
                        if (!fileId) {
                            filesWithoutId++;
                            console.warn('⚠️ File without ID:', file.fileName);
                        }
                        if (fileId && !seenFileIds.has(String(fileId))) {
                            seenFileIds.add(String(fileId));
                            // Mark as archived
                            allFiles.push({
                                ...file,
                                archived: true,
                                isArchived: true
                            });
                        } else if (fileId) {
                            console.log(`🔄 Duplicate file skipped: ${file.fileName} (${fileId})`);
                        }
                    });
                }
                
                // Add folders from this archive
                if (archive.folders && Array.isArray(archive.folders)) {
                    console.log(`📦 Archive ${archiveIdx + 1}: ${archive.folders.length} folders`);
                    archive.folders.forEach(folder => {
                        totalFoldersProcessed++;
                        const folderId = folder._id || folder.id;
                        if (!folderId) {
                            foldersWithoutId++;
                            console.warn('⚠️ Folder without ID:', folder.name);
                        }
                        if (folderId && !seenFolderIds.has(String(folderId))) {
                            seenFolderIds.add(String(folderId));
                            // Mark as archived
                            allFolders.push({
                                ...folder,
                                archived: true,
                                isArchived: true
                            });
                        } else if (folderId) {
                            console.log(`🔄 Duplicate folder skipped: ${folder.name} (${folderId})`);
                        }
                    });
                }
            });
            
            console.log(`📊 Summary: ${totalFilesProcessed} total files processed, ${allFiles.length} unique files, ${filesWithoutId} files without ID`);
            console.log(`📊 Summary: ${totalFoldersProcessed} total folders processed, ${allFolders.length} unique folders, ${foldersWithoutId} folders without ID`);
            
            return { files: allFiles, folders: allFolders };
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Remove items from archive
    // Backend expects Archive ID in URL, not File/Folder ID
    // We need to find which archive(s) contain the files/folders first
    removeFromArchive: async (itemId, files, folders, token) => {
        try {
            const fileIds = files || [];
            const folderIds = folders || [];
            
            if (fileIds.length === 0 && folderIds.length === 0 && !itemId) {
                throw new Error("No files or folders provided for removeFromArchive");
            }
            
            console.log('🗑️ Removing from archive:', { itemId, files: fileIds, folders: folderIds });
            
            // Get all archives to find which ones contain these files/folders
            const archivesResponse = await api.get('/auth/getMyArchives', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const archives = archivesResponse.data?.data || [];
            console.log('🔍 Found', archives.length, 'archives to search');
            
            // Find archives that contain any of the files/folders
            const archivesToUpdate = new Set();
            
            for (const archive of archives) {
                // Check if archive contains any of the files
                const hasFile = fileIds.some(fileId => 
                    archive.files?.some(f => (f._id || f.id) === fileId)
                );
                
                // Check if archive contains any of the folders
                const hasFolder = folderIds.some(folderId => 
                    archive.folders?.some(f => (f._id || f.id) === folderId)
                );
                
                if (hasFile || hasFolder) {
                    archivesToUpdate.add(archive._id);
                }
            }
            
            console.log('📦 Archives to update:', Array.from(archivesToUpdate));
            
            if (archivesToUpdate.size === 0) {
                throw new Error("No archives found containing the specified files/folders");
            }
            
            // If multiple archives, we need to call the endpoint for each archive
            // But if all items are in one archive, use that archive ID
            const archiveIds = Array.from(archivesToUpdate);
            const results = [];
            
            for (const archiveId of archiveIds) {
                // Get files/folders that are in this specific archive
                const archive = archives.find(a => a._id === archiveId);
                const filesInArchive = fileIds.filter(fileId => 
                    archive.files?.some(f => (f._id || f.id) === fileId)
                );
                const foldersInArchive = folderIds.filter(folderId => 
                    archive.folders?.some(f => (f._id || f.id) === folderId)
                );
                
                if (filesInArchive.length > 0 || foldersInArchive.length > 0) {
                    console.log(`🗑️ Removing from archive ${archiveId}:`, { files: filesInArchive, folders: foldersInArchive });
                    
                    const { data } = await api.delete(`/auth/removeFromArchive/${archiveId}`, {
                        data: {
                            files: filesInArchive,
                            folders: foldersInArchive
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    results.push(data);
                }
            }
            
            console.log('✅ Remove from archive success:', results);
            // Return the last result or combine them
            return results[results.length - 1] || { success: true };
        } catch (error) {
            console.error('❌ Remove from archive error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                data: error.response?.data,
                files,
                folders
            });
            
            const errorMessage = error.response?.data?.message || error.message || "Failed to remove items from archive";
            toast.error(errorMessage, ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Delete zip file - try dedicated deleteZip endpoint first, then fallback to deleteFile/deleteFolder
    deleteZip: async (zipId, token) => {
        try {
            console.log('🗑️ Deleting zip file:', zipId);
            
            // First, try the dedicated deleteZip endpoint
            try {
                const { data } = await api.delete(`/auth/deleteZip/${zipId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log('✅ Delete zip via deleteZip endpoint response:', data);

                if (data?.message === "✅ تم حذف الملف بنجاح" || data?.message?.includes('نجاح') || data?.message?.includes('success') || data?.message?.includes('حذف')) {
                    toast.success("Zip file deleted successfully", ToastOptions("success"));
                    return true;
                }

                return data;
            } catch (deleteZipError) {
                // If deleteZip fails, fallback to deleteFile
                if (deleteZipError.response?.status === 404) {
                    console.log('⚠️ deleteZip returned 404, trying deleteFile...');
                    
                    try {
                        const { data } = await api.delete(`/auth/deleteFile/${zipId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        console.log('✅ Delete zip via deleteFile response:', data);

                        if (data?.message === "✅ تم حذف الملف بنجاح" || data?.message?.includes('نجاح') || data?.message?.includes('success') || data?.message?.includes('حذف')) {
                            toast.success("Zip file deleted successfully", ToastOptions("success"));
                            return true;
                        }

                        return data;
                    } catch (deleteFileError) {
                        // If deleteFile also fails with 404, try deleteFolder as last fallback
                        if (deleteFileError.response?.status === 404) {
                            console.log('⚠️ deleteFile returned 404, trying deleteFolder...');
                            
                            const { data } = await api.delete(`/user/deleteFolder/${zipId}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });

                            console.log('✅ Delete zip via deleteFolder response:', data);

                            if (data?.message === "✅ تم حذف الملف بنجاح" || data?.message?.includes('نجاح') || data?.message?.includes('success') || data?.message?.includes('حذف')) {
                                toast.success("Zip file deleted successfully", ToastOptions("success"));
                                return true;
                            }

                            return data;
                        } else {
                            throw deleteFileError;
                        }
                    }
                } else {
                    // If it's not a 404, re-throw the error
                    throw deleteZipError;
                }
            }
        } catch (error) {
            console.error('❌ Delete zip error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                data: error.response?.data,
                zipId
            });
            
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete zip file";
            toast.error(errorMessage, ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Update zip file name
    updateZipName: async (zipId, fileName, token) => {
        try {
            const { data } = await api.patch(`/auth/updateZipName/${zipId}`, {
                fileName
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data?.message === "✅ تم تعديل اسم الملف بنجاح" || data?.message?.includes('نجاح') || data?.message?.includes('success') || data?.message?.includes('تعديل')) {
                toast.success("Zip file name updated successfully", ToastOptions("success"));
                return true;
            }

            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update zip file name", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Generate share link for zip file
    generateZipShareLink: async (zipId, token) => {
        try {
            const { data } = await api.post('/auth/generateZipShareLink', {
                zipId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Show success toast if message indicates success
            if (data?.message && (data.message.includes('نجاح') || data.message.includes('success') || data.shareUrl || data.shareLink)) {
                toast.success(data.message || "Zip share link generated successfully", ToastOptions("success"));
            }
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate zip share link", ToastOptions("error"));
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

