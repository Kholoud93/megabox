import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_URL, userService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaCamera, FaEdit, FaSave, FaTimes, FaCrown, FaUser } from 'react-icons/fa';
import { ToastOptions } from '../../helpers/ToastOptions';
import './Profile.scss';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { StoragePrecentage } from '../../helpers/GetStoragePercentage';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useLanguage } from '../../context/LanguageContext';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();
    const [Token] = useCookies(['MegaBox']);
    const { t } = useLanguage();

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
            console.log('Profile Pic URL:', data?.profilePic);
            setImageError(false); // Reset image error when new data is loaded
        },
        onError: (error) => {
            console.error('Error fetching user data:', error);
            toast.error('Failed to fetch user data', ToastOptions('error'));
        }
    });

    // Reset image error when userData or profilePic changes
    useEffect(() => {
        if (userData?.profilePic) {
            setImageError(false);
        }
    }, [userData?.profilePic]);

    // Update username mutation
    const updateUsernameMutation = useMutation(
        (newUsername) => userService.updateUsername(newUsername, Token.MegaBox),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userProfile');
                setIsEditing(false);
                toast.success(t('profile.usernameUpdated'), ToastOptions('success'));
            },
            onError: (error) => {
                toast.error(error.message || t('profile.usernameUpdateFailed'), ToastOptions('error'));
            }
        }
    );

    const updateProfileImageMutation = useMutation(
        (file) => userService.updateProfileImage(file, Token.MegaBox),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userProfile');
                setImageError(false); // Reset image error on successful update
                toast.success(t('profile.imageUpdated'), ToastOptions('success'));
            },
            onError: (error) => {
                toast.error(error.message || t('profile.imageUpdateFailed'), ToastOptions('error'));
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
            <div className="Profile flex justify-center items-center min-h-[60vh] bg-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-indigo-600 border-r-4 border-r-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="Profile flex justify-center items-center min-h-[60vh] px-4">
                <div className="text-red-500 text-sm sm:text-base">{t('profile.errorLoading')}</div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="Profile flex justify-center items-center min-h-[60vh] px-4">
                <div className="text-gray-500 text-sm sm:text-base">{t('profile.noData')}</div>
            </div>
        );
    }

    return (
        <div className="Profile min-h-screen bg-indigo-50" style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            <motion.div
                className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border-2 border-indigo-100">
                    <div className="flex flex-col md:flex-row">
                        <motion.div
                            className="md:flex-shrink-0 relative flex justify-center md:justify-start"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            {userData?.profilePic && typeof userData.profilePic === 'string' && userData.profilePic.trim() !== '' && !imageError ? (
                                <img
                                    key={userData.profilePic}
                                    className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 xl:h-64 xl:w-64 object-cover rounded-lg m-3 sm:m-4 md:m-5 lg:m-6 border-4 border-indigo-200 shadow-md"
                                    src={userData.profilePic}
                                    alt="Profile"
                                    onError={(e) => {
                                        console.error('Image load error:', e);
                                        console.error('Failed to load image from:', userData.profilePic);
                                        setImageError(true);
                                    }}
                                    onLoad={() => {
                                        console.log('Image loaded successfully from:', userData.profilePic);
                                        setImageError(false);
                                    }}
                                />
                            ) : (
                                <div 
                                    className="flex h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 xl:h-64 xl:w-64 items-center justify-center rounded-lg m-3 sm:m-4 md:m-5 lg:m-6 border-4 border-indigo-200 shadow-md bg-gradient-to-br from-indigo-100 to-indigo-200"
                                >
                                    <FaUser className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-indigo-600" />
                                </div>
                            )}
                            <motion.button
                                className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 lg:bottom-6 lg:right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg transition-all z-10"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={updateProfileImageMutation.isLoading}
                            >
                                {updateProfileImageMutation.isLoading ? <AiOutlineLoading3Quarters className='LoadingButton h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5' /> : <FaCamera className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />}
                            </motion.button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </motion.div>

                        <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex-1 w-full">
                            <motion.div
                                className="uppercase tracking-wide text-xs sm:text-sm text-indigo-600 font-semibold flex items-center gap-2 mb-3 sm:mb-4 md:mb-5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {t('profile.profileInformation')}
                                {userData.isBrimume && (
                                    <FaCrown className="text-yellow-500 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" title={t('profile.premiumUser')} />
                                )}
                            </motion.div>


                            {/* Personal Link Section */}
                            <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8">
                                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-indigo-900 mb-2 sm:mb-3">{t('profile.personalLink')}</h2>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4 bg-indigo-50 rounded-lg p-2 sm:p-2.5 md:p-3">
                                    <input
                                        type="text"
                                        readOnly
                                        value={userData?.referralLink || `https://mega-box.vercel.app/register?ref=${userData?._id}`}
                                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-indigo-200 rounded-md text-xs sm:text-sm text-indigo-900 bg-white focus:border-indigo-400 focus:outline-none truncate"
                                    />
                                    <motion.button
                                        onClick={() => {
                                            const linkToCopy = userData?.referralLink || `https://mega-box.vercel.app/register?ref=${userData?._id}`;
                                            navigator.clipboard.writeText(linkToCopy);
                                            toast.success(t('profile.linkCopied'), ToastOptions("success"));
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm rounded-md transition-all font-medium whitespace-nowrap"
                                    >
                                        {t('profile.copy')}
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
                                        className="mt-3 sm:mt-4"
                                        onSubmit={handleUsernameSubmit}
                                    >
                                        <input
                                            type="text"
                                            className="block w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 mt-2 text-indigo-900 bg-white border-2 border-indigo-200 rounded-md focus:border-indigo-500 focus:outline-none text-xs sm:text-sm md:text-base"
                                            placeholder={t('profile.enterNewUsername')}
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                        />


                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                                            <motion.button
                                                type="submit"
                                                className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base font-medium transition-all"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <FaSave className="w-3 h-3 sm:w-4 sm:h-4" /> {t('profile.save')}
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base font-medium transition-all"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setIsEditing(false)}
                                            >
                                                <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" /> {t('profile.cancel')}
                                            </motion.button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="display-info"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="mt-3 sm:mt-4"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-900 break-words">
                                                {userData.username || t('profile.user')}
                                            </h1>
                                            <motion.button
                                                className="text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setNewUsername(userData.username || '');
                                                    setIsEditing(true);
                                                }}
                                            >
                                                <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </motion.button>
                                        </div>
                                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-indigo-700 break-words">{userData.email}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8">
                                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-indigo-900 mb-3 sm:mb-4">{t('profile.accountDetails')}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                                    <div className="bg-indigo-50 border-2 border-indigo-100 p-2.5 sm:p-3 md:p-4 rounded-lg">
                                        <p className="text-xs sm:text-sm text-indigo-600 font-medium">{t('profile.userId')}</p>
                                        <p className="text-xs sm:text-sm md:text-base text-indigo-900 font-semibold mt-1 break-all">{userData.userId}</p>
                                    </div>
                                    <div className="bg-indigo-50 border-2 border-indigo-100 p-2.5 sm:p-3 md:p-4 rounded-lg">
                                        <p className="text-xs sm:text-sm text-indigo-600 font-medium">{t('profile.accountType')}</p>
                                        <p className={`text-xs sm:text-sm md:text-base font-semibold mt-1 ${userData.isBrimume ? 'text-yellow-600' : 'text-indigo-700'}`}>
                                            {userData.isBrimume ? t('profile.premium') : t('profile.standard')}
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
                className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-5 lg:py-6 xl:py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border-2 border-indigo-100">
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
                        <motion.div
                            className="uppercase tracking-wide text-xs sm:text-sm text-indigo-600 font-semibold flex items-center gap-2 mb-3 sm:mb-4 md:mb-5 lg:mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {t('profile.storageUsage')}
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                            {/* Storage Overview */}
                            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6">
                                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-indigo-900 mb-2 sm:mb-3 md:mb-4">{t('profile.storageOverview')}</h3>
                                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                                            <span className="text-indigo-700 font-medium">{t('profile.usedSpace')}</span>
                                            <span className="text-indigo-600 font-semibold">{userStorage?.totalUsedGB} GB</span>
                                        </div>
                                        <div className="w-full bg-indigo-200 rounded-full h-2 sm:h-2.5">
                                            <div className="bg-indigo-600 h-2 sm:h-2.5 rounded-full transition-all duration-300" style={{ width: `${StoragePrecentage(1025, userStorage?.totalUsedGB)}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-1.5 sm:pt-2">
                                        <span className="text-indigo-700 text-xs sm:text-sm font-medium">{t('profile.totalSpace')}</span>
                                        <span className="text-indigo-900 font-semibold text-xs sm:text-sm md:text-base">1025 GB</span>
                                    </div>
                                </div>
                            </div>

                            {/* Storage Details */}
                            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6">
                                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-indigo-900 mb-2 sm:mb-3 md:mb-4">{t('profile.storageDetails')}</h3>
                                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-indigo-500 flex-shrink-0"></div>
                                            <span className="text-indigo-700 text-xs sm:text-sm font-medium">{t('profile.totalFiles')}</span>
                                        </div>
                                        <span className="text-indigo-900 font-semibold text-xs sm:text-sm">{userStorage?.totalFiles} {userStorage?.totalFiles > 1 ? t('profile.files') : t('profile.file')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-indigo-400 flex-shrink-0"></div>
                                            <span className="text-indigo-700 text-xs sm:text-sm font-medium">{t('profile.totalUsedMB')}</span>
                                        </div>
                                        <span className="text-indigo-900 font-semibold text-xs sm:text-sm">{userStorage?.totalUsedMB} MB</span>
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
