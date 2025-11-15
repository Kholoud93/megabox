import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const fileService = {
    uploadFile: async (file, token) => {
        try {
            const { data } = await api.post("/auth/createFile", file, {
                headers: {
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

    // Get all files (excluding archived)
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

    // Archive file
    archiveFile: async (fileId, token) => {
        try {
            const { data } = await api.patch(`/auth/archiveFile/${fileId}`, {
                archived: true
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        } catch (error) {
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
    }
};

export default fileService;

