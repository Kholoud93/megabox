import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_URL, userService, fileService, authService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaCamera, FaEdit, FaSave, FaTimes, FaCrown, FaUser, FaTrash } from 'react-icons/fa';
import { ToastOptions } from '../../helpers/ToastOptions';
import './Profile.scss';
import { useCookies } from 'react-cookie';
import { StoragePrecentage } from '../../helpers/GetStoragePercentage';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from 'react-router-dom';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [imageError, setImageError] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();
    const [Token] = useCookies(['MegaBox']);
    const { t, language } = useLanguage();
    const premiumFileInputRef = useRef(null);
    const location = useLocation();
    const isOwner = location.pathname.startsWith('/Owner');

    const GetUserStorage = async () => {
        const response = await fileService.getUserStorageUsage(Token.MegaBox);
        return response?.data || response;
    }

    const { data: userStorage, isLoading: StorageLoading } = useQuery("Get user storage", GetUserStorage, {
        cacheTime: 3000000
    })

    // Get user analytics
    const GetUserAnalytics = async () => {
        if (!Token.MegaBox) return null;
        try {
            const response = await authService.getUserAnalytics(Token.MegaBox);
            return response?.data || response;
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            return null;
        }
    }

    const { data: userAnalytics, isLoading: analyticsLoading } = useQuery('userAnalytics', GetUserAnalytics, {
        enabled: !!Token.MegaBox,
        cacheTime: 300000,
        retry: 1
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

    const deleteProfileImageMutation = useMutation(
        () => userService.deleteProfileImage(Token.MegaBox),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userProfile');
                setImageError(false);
                toast.success(t('profile.imageDeleted'), ToastOptions('success'));
            },
            onError: (error) => {
                toast.error(error.message || t('profile.imageDeleteFailed'), ToastOptions('error'));
            }
        }
    );

    const subscribeToPremiumMutation = useMutation(
        (file) => userService.subscribeToPremium(file, Token.MegaBox),
        {
            onSuccess: (response) => {
                queryClient.invalidateQueries('userProfile');
                // Reset file input after successful upload
                if (premiumFileInputRef.current) {
                    premiumFileInputRef.current.value = '';
                }
                // Check if subscription is pending approval
                const isPending = response?.data?.premiumPending || response?.premiumPending || response?.status === 'pending';
                if (isPending) {
                    toast.success(t('profile.premiumPendingApproval') || 'Your premium subscription request has been submitted and is pending approval. We will review your payment proof shortly.', ToastOptions('success'));
                } else {
                    toast.success(t('profile.premiumSubscribed') || 'Premium subscription successful!', ToastOptions('success'));
                }
            },
            onError: (error) => {
                // Reset file input on error too
                if (premiumFileInputRef.current) {
                    premiumFileInputRef.current.value = '';
                }
                toast.error(error.message || t('profile.premiumSubscribeFailed') || 'Failed to subscribe to premium', ToastOptions('error'));
            }
        }
    );

    const handlePremiumSubscribe = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (optional - adjust limit as needed)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error(t('profile.fileTooLarge') || 'File size is too large. Maximum size is 10MB.', ToastOptions('error'));
                event.target.value = ''; // Reset input
                return;
            }
            subscribeToPremiumMutation.mutate(file);
        } else {
            // Reset input if no file selected
            event.target.value = '';
        }
    };



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
            <div className="Profile flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-purple-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-t-4 border-purple-600 border-r-4 border-r-transparent absolute top-0 left-0"></div>
                    </div>
                    <p className="text-sm sm:text-base text-purple-600 font-medium animate-pulse">{t('common.loading') || 'Loading...'}</p>
                </div>
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
        <div className="Profile min-h-screen bg-indigo-50 pb-32" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            <motion.div
                className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border-2 border-indigo-100">
                    <div className="flex flex-col md:flex-row">
                        <motion.div
                            className="md:flex-shrink-0 flex flex-col items-center md:items-start"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="relative flex justify-center md:justify-start">
                                {userData?.profilePic && typeof userData.profilePic === 'string' && userData.profilePic.trim() !== '' && !imageError ? (
                                    <img
                                        key={userData.profilePic}
                                        className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 xl:h-64 xl:w-64 object-cover rounded-lg m-2 sm:m-3 md:m-4 lg:m-5 border-4 border-indigo-200 shadow-md"
                                        src={userData.profilePic}
                                        alt="Profile"
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"
                                        onError={() => {
                                            // Silently handle image load errors and show fallback
                                            setImageError(true);
                                        }}
                                        onLoad={() => {
                                            setImageError(false);
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="flex h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 xl:h-64 xl:w-64 items-center justify-center rounded-lg m-2 sm:m-3 md:m-4 lg:m-5 border-4 border-indigo-200 shadow-md bg-gradient-to-br from-indigo-100 to-indigo-200"
                                    >
                                        <FaUser className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-indigo-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 sm:gap-3 justify-center md:justify-start items-center w-full px-3 sm:px-4 md:px-5 lg:px-6 mt-2 mb-2">
                                {userData?.profilePic && typeof userData.profilePic === 'string' && userData.profilePic.trim() !== '' && !imageError && (
                                    <motion.button
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg transition-all flex-shrink-0"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={deleteProfileImageMutation.isLoading}
                                        title={t('profile.deleteImage')}
                                    >
                                        {deleteProfileImageMutation.isLoading ? (
                                            <div className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FaTrash className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                        )}
                                    </motion.button>
                                )}
                                <motion.button
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg transition-all flex-shrink-0"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={updateProfileImageMutation.isLoading}
                                    title={t('profile.changeImage')}
                                >
                                    {updateProfileImageMutation.isLoading ? <div className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaCamera className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />}
                                </motion.button>
                            </div>
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
                                <div className={`grid gap-2 sm:gap-3 md:gap-4 ${isOwner ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                    <div className="bg-indigo-50 border-2 border-indigo-100 p-2.5 sm:p-3 md:p-4 rounded-lg">
                                        <p className="text-xs sm:text-sm text-indigo-600 font-medium">{t('profile.userId')}</p>
                                        <p className="text-xs sm:text-sm md:text-base text-indigo-900 font-semibold mt-1 break-all">{userData.userId}</p>
                                    </div>
                                    {!isOwner && (
                                    <div className="bg-indigo-50 border-2 border-indigo-100 p-2.5 sm:p-3 md:p-4 rounded-lg">
                                        <p className="text-xs sm:text-sm text-indigo-600 font-medium">{t('profile.accountType')}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex flex-col">
                                                <p className={`text-xs sm:text-sm md:text-base font-semibold ${userData.isBrimume ? 'text-yellow-600' : userData.premiumPending ? 'text-orange-600' : 'text-indigo-700'}`}>
                                                    {userData.isBrimume ? t('profile.premium') : userData.premiumPending ? (t('profile.premiumPending') || 'Pending Approval') : t('profile.standard')}
                                                </p>
                                                {userData.premiumPending && (
                                                    <p className="text-[8px] sm:text-[9px] text-orange-500 mt-0.5">
                                                        {t('profile.waitingForApproval') || 'Waiting for admin approval'}
                                                    </p>
                                                )}
                                            </div>
                                            {!userData.isBrimume && !userData.premiumPending && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => {
                                                            if (premiumFileInputRef.current) {
                                                                premiumFileInputRef.current.click();
                                                            }
                                                        }}
                                                        disabled={subscribeToPremiumMutation.isLoading}
                                                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-1.5"
                                                        whileHover={{ scale: subscribeToPremiumMutation.isLoading ? 1 : 1.05 }}
                                                        whileTap={{ scale: subscribeToPremiumMutation.isLoading ? 1 : 0.95 }}
                                                    >
                                                        <FaCrown className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                                        <span className="whitespace-normal">
                                                            {subscribeToPremiumMutation.isLoading ? (t('common.loading') || 'Loading...') : (t('profile.subscribeToPremium') || 'Subscribe to Premium')}
                                                        </span>
                                                    </motion.button>
                                                    <p className="text-[8px] sm:text-[9px] text-gray-500 text-right max-w-[100px] sm:max-w-none">
                                                        {t('profile.uploadFileToSubscribe') || 'Upload file to subscribe'}
                                                    </p>
                                                </div>
                                            )}
                                            {userData.premiumPending && (
                                                <div className="flex items-center gap-1 text-orange-500">
                                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-orange-500 border-t-transparent"></div>
                                                    <span className="text-[8px] sm:text-[9px]">{t('profile.pending') || 'Pending'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={premiumFileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePremiumSubscribe}
                                        disabled={subscribeToPremiumMutation.isLoading}
                                    />
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
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border-2 border-indigo-100">
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
                        <motion.div
                            className={`uppercase tracking-wide text-xs sm:text-sm text-indigo-600 font-semibold flex items-center gap-2 mt-4 sm:mt-5 md:mt-6 lg:mt-8 mb-3 sm:mb-4 md:mb-5 lg:mb-6 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}
                            style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
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

            {/* User Analytics Section - Only for Promoters (not Owners) */}
            {(userData?.isPromoter === "true" || userData?.isPromoter === true) && !isOwner && (
            <motion.div
                className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-5 lg:py-6 xl:py-8 mb-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border-2 border-indigo-100">
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
                        <motion.div
                            className={`uppercase tracking-wide text-xs sm:text-sm text-indigo-600 font-semibold flex items-center gap-2 mb-3 sm:mb-4 md:mb-5 lg:mb-6 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}
                            style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            {t('profile.userAnalytics')}
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </motion.div>

                        {analyticsLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 border-r-4 border-r-transparent absolute top-0 left-0"></div>
                                    </div>
                                    <p className="text-sm text-purple-600 font-medium animate-pulse">{t('profile.analytics.loading')}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Analytics Cards Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-6">
                                    {/* Total Files Card */}
                                    <motion.div
                                        className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="bg-indigo-500 rounded-lg p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-indigo-600 font-medium mb-2">{t('profile.analytics.totalFiles')}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-indigo-900">
                                            {userAnalytics?.totalFiles ?? 0}
                                        </p>
                                    </motion.div>

                                    {/* Total Views Card */}
                                    <motion.div
                                        className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="bg-blue-500 rounded-lg p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-blue-600 font-medium mb-2">{t('profile.analytics.totalViews')}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                                            {userAnalytics?.totalViews ?? 0}
                                        </p>
                                    </motion.div>

                                    {/* Total Downloads Card */}
                                    <motion.div
                                        className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="bg-green-500 rounded-lg p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-green-600 font-medium mb-2">{t('profile.analytics.totalDownloads')}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-green-900">
                                            {userAnalytics?.totalDownloads ?? 0}
                                        </p>
                                    </motion.div>

                                    {/* Total Shares Card */}
                                    <motion.div
                                        className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="bg-purple-500 rounded-lg p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-purple-600 font-medium mb-2">{t('profile.analytics.totalShares')}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                                            {userAnalytics?.totalShares ?? 0}
                                        </p>
                                    </motion.div>

                                    {/* Total Folders Card */}
                                    <motion.div
                                        className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="bg-orange-500 rounded-lg p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-orange-600 font-medium mb-2">{t('profile.analytics.totalFolders')}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-orange-900">
                                            {userAnalytics?.totalFolders ?? 0}
                                        </p>
                                    </motion.div>

                                    {/* Storage Used Card */}
                                    <motion.div
                                        className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.0 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="bg-pink-500 rounded-lg p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-pink-600 font-medium mb-2">{t('profile.analytics.storageUsed')}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-pink-900">
                                            {userAnalytics?.storageUsedGB ?? userAnalytics?.totalStorageUsed ?? 0} GB
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Analytics Table (Optional - for detailed view) */}
                                <div className="mt-6 overflow-x-auto">
                                    <div className="bg-indigo-50 rounded-lg border-2 border-indigo-100 p-4">
                                        <h3 className={`text-sm sm:text-base font-semibold text-indigo-900 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {t('profile.analytics.totalFiles')} - {t('profile.analytics.detailedView') || 'Detailed View'}
                                        </h3>
                                        <div className="bg-white rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-indigo-100">
                                                    <tr>
                                                        <th className={`px-4 py-3 text-xs sm:text-sm font-semibold text-indigo-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {t('profile.analytics.metric') || 'Metric'}
                                                        </th>
                                                        <th className={`px-4 py-3 text-xs sm:text-sm font-semibold text-indigo-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {t('profile.analytics.value') || 'Value'}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-indigo-100">
                                                    <tr className="hover:bg-indigo-50 transition-colors">
                                                        <td className={`px-4 py-3 text-indigo-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {t('profile.analytics.totalFiles')}
                                                        </td>
                                                        <td className={`px-4 py-3 font-semibold text-indigo-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {userAnalytics?.totalFiles ?? 0}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-indigo-50 transition-colors">
                                                        <td className={`px-4 py-3 text-indigo-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {t('profile.analytics.totalViews')}
                                                        </td>
                                                        <td className={`px-4 py-3 font-semibold text-indigo-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {userAnalytics?.totalViews ?? 0}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-indigo-50 transition-colors">
                                                        <td className={`px-4 py-3 text-indigo-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {t('profile.analytics.totalDownloads')}
                                                        </td>
                                                        <td className={`px-4 py-3 font-semibold text-indigo-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {userAnalytics?.totalDownloads ?? 0}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-indigo-50 transition-colors">
                                                        <td className={`px-4 py-3 text-indigo-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {t('profile.analytics.totalShares')}
                                                        </td>
                                                        <td className={`px-4 py-3 font-semibold text-indigo-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {userAnalytics?.totalShares ?? 0}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-indigo-50 transition-colors">
                                                        <td className={`px-4 py-3 text-indigo-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {t('profile.analytics.totalFolders')}
                                                        </td>
                                                        <td className={`px-4 py-3 font-semibold text-indigo-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {userAnalytics?.totalFolders ?? 0}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-indigo-50 transition-colors">
                                                        <td className={`px-4 py-3 text-indigo-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {t('profile.analytics.storageUsed')}
                                                        </td>
                                                        <td className={`px-4 py-3 font-semibold text-indigo-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            {userAnalytics?.storageUsedGB ?? userAnalytics?.totalStorageUsed ?? 0} GB
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-indigo-100"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-red-100 rounded-full p-3">
                                    <FaTrash className="text-red-600 text-2xl" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                                {t('profile.deleteImage')}
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                {t('profile.confirmDeleteImage')}
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleteProfileImageMutation.isLoading}
                                >
                                    {t('profile.cancel')}
                                </motion.button>
                                <motion.button
                                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        deleteProfileImageMutation.mutate();
                                        setShowDeleteConfirm(false);
                                    }}
                                    disabled={deleteProfileImageMutation.isLoading}
                                >
                                    {deleteProfileImageMutation.isLoading ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t('common.deleting') || 'Deleting...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaTrash className="h-4 w-4" />
                                            {t('profile.delete')}
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
