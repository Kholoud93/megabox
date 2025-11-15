import { api } from './apiConfig';

export const userService = {
    getUserInfo: async (token) => {
        try {
            const response = await api.get('/user/Getloginuseraccount', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateUsername: async (newUsername, token) => {
        try {
            const response = await api.patch('/user/updateUsername',
                { username: newUsername },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateProfileImage: async (imageFile, token) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const response = await api.patch('/user/updateimage',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteProfileImage: async (token) => {
        try {
            const response = await api.delete('/user/deleteimage', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Subscribe to premium
    subscribeToPremium: async (file, token) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.patch('/user/subscribeToPremium', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get shared folders with files
    getSharedFoldersWithFiles: async (token) => {
        try {
            const response = await api.get('/user/getSharedFoldersWithFiles', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Archive folder
    archiveFolder: async (folderId, token) => {
        try {
            const response = await api.patch(`/user/archiveFolder/${folderId}`, {
                archived: true
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default userService;

