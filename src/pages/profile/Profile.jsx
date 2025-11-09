import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_URL, userService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaCamera, FaEdit, FaSave, FaTimes, FaCrown } from 'react-icons/fa';
import { ToastOptions } from '../../helpers/ToastOptions';
import './Profile.scss';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { StoragePrecentage } from '../../helpers/GetStoragePercentage';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();
    const [Token] = useCookies(['MegaBox']);

    const GetUserStorage = async () => {
        const response = await axios.get(`${API_URL}/auth/getUserStorageUsage`, {
            headers: {
                Authorization: `Bearer ${Token.MegaBox}`
            }
        });

        return response?.data
    }

    const { data: userStorage, isLoading: StorageLoading } = useQuery("Get user storage", GetUserStorage, {
        cacheTime: 3000000
    })

    // Fetch user data
    const { data: userData, isLoading, error } = useQuery('userProfile', () => userService.getUserInfo(Token.MegaBox), {
        onSuccess: (data) => {
            console.log('User data received:', data);
        },
        onError: (error) => {
            console.error('Error fetching user data:', error);
            toast.error('Failed to fetch user data', ToastOptions('error'));
        }
    });

    // Update username mutation
    const updateUsernameMutation = useMutation(
        (newUsername) => userService.updateUsername(newUsername, Token.MegaBox),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userProfile');
                setIsEditing(false);
                toast.success('Username updated successfully!', ToastOptions('success'));
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to update username', ToastOptions('error'));
            }
        }
    );

    const updateProfileImageMutation = useMutation(
        (file) => userService.updateProfileImage(file, Token.MegaBox),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userProfile');
                toast.success('Profile image updated successfully!', ToastOptions('success'));
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to update profile image', ToastOptions('error'));
            }
        }
    );


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            updateProfileImageMutation.mutate(file);
        }
    };

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        if (newUsername.trim()) {
            updateUsernameMutation.mutate(newUsername);
        }
    };

    if (isLoading) {
        return (
            <div className="Profile flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="Profile flex justify-center items-center min-h-[60vh]">
                <div className="text-red-500">Error loading profile data. Please try again later.</div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="Profile flex justify-center items-center min-h-[60vh]">
                <div className="text-gray-500">No profile data available.</div>
            </div>
        );
    }

    return (
        <div className="Profile">
            <motion.div
                className="container mx-auto px-4 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="md:flex">
                        <motion.div
                            className="md:flex-shrink-0 relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <img
                                className="h-48 w-64 object-cover rounded-lg m-6"
                                src={userData.profilePic || 'https://via.placeholder.com/150'}
                                alt="Profile"
                            />
                            <motion.button
                                className="absolute bottom-8 right-8 bg-primary-500 text-white p-3 rounded-full shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={updateProfileImageMutation.isLoading}
                            >
                                {updateProfileImageMutation.isLoading ? <AiOutlineLoading3Quarters className='LoadingButton' /> : <FaCamera />}
                            </motion.button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </motion.div>

                        <div className="p-8 flex-1">
                            <motion.div
                                className="uppercase tracking-wide text-sm text-primary-500 font-semibold flex items-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Profile Information
                                {userData.isBrimume && (
                                    <FaCrown className="text-yellow-500" title="Premium User" />
                                )}
                            </motion.div>


                            {/* Personal Link Section */}
                            <div className="mt-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Personal Link</h2>
                                <div className="flex items-center gap-4 bg-gray-50 rounded-lg">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`https://mega-box.vercel.app/register?ref=${userData._id}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white"
                                    />
                                    <motion.button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://mega-box.vercel.app/register?ref=${userData._id}`);
                                            toast.success("Link copied to clipboard!", ToastOptions("success"));
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-primary-500 text-white text-sm rounded-md"
                                    >
                                        Copy
                                    </motion.button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.form
                                        key="edit-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="mt-4"
                                        onSubmit={handleUsernameSubmit}
                                    >
                                        <input
                                            type="text"
                                            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:border-primary-500 focus:outline-none"
                                            placeholder="Enter new username"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                        />


                                        <div className="flex gap-2 mt-4">
                                            <motion.button
                                                type="submit"
                                                className="px-4 py-2 bg-primary-500 text-white rounded-md flex items-center gap-2"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <FaSave /> Save
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                className="px-4 py-2 bg-gray-500 text-white rounded-md flex items-center gap-2"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setIsEditing(false)}
                                            >
                                                <FaTimes /> Cancel
                                            </motion.button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="display-info"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="mt-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                {userData.username || 'User'}
                                            </h1>
                                            <motion.button
                                                className="text-primary-500"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setNewUsername(userData.username || '');
                                                    setIsEditing(true);
                                                }}
                                            >
                                                <FaEdit size={20} />
                                            </motion.button>
                                        </div>
                                        <p className="mt-2 text-gray-600">{userData.email}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8">
                                <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500">User ID</p>
                                        <p className="text-gray-900">{userData.userId}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500">Account Type</p>
                                        <p className={`font-semibold ${userData.isBrimume ? 'text-yellow-600' : 'text-gray-600'}`}>
                                            {userData.isBrimume ? 'Premium' : 'Standard'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Storage Usage Section */}
            <motion.div
                className="container mx-auto px-4 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        <motion.div
                            className="uppercase tracking-wide text-sm text-primary-500 font-semibold flex items-center gap-2 mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Storage Usage
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Storage Overview */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Overview</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Used Space</span>
                                            <span className="text-primary-500 font-medium">{userStorage?.totalUsedGB} GB</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${StoragePrecentage(1025, userStorage?.totalUsedGB)}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Space</span>
                                        <span className="text-gray-900 font-medium">1025 GB</span>
                                    </div>
                                </div>
                            </div>

                            {/* Storage Details */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Details</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-gray-600">Total Files</span>
                                        </div>
                                        <span className="text-gray-900 font-medium">{userStorage?.totalFiles} {userStorage?.totalFiles > 1 ? "files" : "file"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-gray-600">Total used in MB</span>
                                        </div>
                                        <span className="text-gray-900 font-medium">{userStorage?.totalUsedMB}  MB</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Tips */}
                        {/* <div className="mt-6 bg-blue-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-blue-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-blue-800 font-medium">Storage Tips</p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        You're using {StoragePrecentage(1025, userStorage?.totalUsedGB)}% of your storage. Consider upgrading your plan or removing unused files to free up space.
                                    </p>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
