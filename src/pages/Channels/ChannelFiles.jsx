import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { channelService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { FaUpload, FaFile, FaBell } from 'react-icons/fa';
import Loading from '../../components/Loading/Loading';
import File from '../../components/File/File';
import { getFileCategory } from '../../helpers/MimeType';
import UploadFile from '../../components/Upload/UploadFile/UploadFile';
import './Channels.scss';

export default function ChannelFiles() {
    const { channelId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const [Token] = useCookies(['MegaBox']);
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Close sidenav when modal opens
    useEffect(() => {
        if (showUploadModal) {
            // Close sidebar by clicking the backdrop or toggling
            const sidebarBackdrop = document.querySelector('.dropback');
            const sidebarToggle = document.querySelector('.bars');
            if (sidebarBackdrop && sidebarBackdrop.classList.contains('apper-dropback')) {
                sidebarBackdrop.click();
            } else if (sidebarToggle) {
                // Dispatch custom event to close sidebar
                window.dispatchEvent(new CustomEvent('closeSidebar'));
            }
        }
    }, [showUploadModal]);

    // Refetch function for UploadFile component
    const refetchChannelFiles = () => {
        queryClient.invalidateQueries(['channelFiles', channelId]);
    };

    // Fetch channel files
    const { data: channelFiles, isLoading: filesLoading } = useQuery(
        ['channelFiles', channelId],
        () => channelService.getUserFilesInChannel(channelId, Token.MegaBox),
        {
            enabled: !!Token.MegaBox && !!channelId,
            cacheTime: 300000,
            onSuccess: (data) => {
                // Check if user is subscribed (if channel data is available)
                setIsSubscribed(data?.channel?.isSubscribed || false);
            }
        }
    );

    // Subscribe to channel mutation
    const subscribeMutation = useMutation(
        () => channelService.subscribeToChannel(channelId, Token.MegaBox),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['channelFiles', channelId]);
                queryClient.invalidateQueries('mySubscribedChannels');
                setIsSubscribed(true);
            }
        }
    );

    const handleSubscribe = () => {
        subscribeMutation.mutate();
    };


    if (filesLoading) {
        return <Loading />;
    }

    return (
        <div className="ChannelFiles min-h-screen bg-indigo-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <button
                        onClick={() => {
                            const isPromoter = pathname?.includes('/Promoter');
                            navigate(isPromoter ? '/Promoter/channels' : '/dashboard/channels');
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        ← {t('channels.backToChannels') || 'Back to Channels'}
                    </button>
                    <div className="flex gap-3">
                        {!isSubscribed && !pathname?.includes('/Promoter') && (
                            <motion.button
                                onClick={handleSubscribe}
                                disabled={subscribeMutation.isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaBell className="w-5 h-5" />
                                {subscribeMutation.isLoading 
                                    ? (t('common.loading') || 'Loading...')
                                    : (t('channels.subscribeToChannel') || 'Subscribe to Channel')
                                }
                            </motion.button>
                        )}
                        {pathname?.includes('/Promoter') && (
                            <motion.button
                                onClick={() => setShowUploadModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaUpload className="w-5 h-5" />
                                {t('channels.uploadFile') || 'Upload File'}
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Channel Info Section */}
                <div className="mb-6 bg-white rounded-xl shadow-lg border-2 border-indigo-100 p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Channel Image */}
                        <div className="flex-shrink-0">
                            {(channelFiles?.channel?.image || (typeof channelFiles?.channel?.image === 'object' && channelFiles?.channel?.image?.secure_url)) ? (
                                <img
                                    src={typeof channelFiles.channel.image === 'object' ? channelFiles.channel.image.secure_url : channelFiles.channel.image}
                                    alt={channelFiles?.channel?.name || t('channels.placeholder.channelName') || 'Channel'}
                                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border-2 border-indigo-200"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-100 rounded-lg border-2 border-indigo-200 flex items-center justify-center" style={{ display: (channelFiles?.channel?.image || (typeof channelFiles?.channel?.image === 'object' && channelFiles?.channel?.image?.secure_url)) ? 'none' : 'flex' }}>
                                <span className="text-indigo-400 text-2xl">📺</span>
                            </div>
                        </div>
                        
                        {/* Channel Details */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-2">
                                {channelFiles?.channel?.name ?? t('channels.placeholder.channelName') ?? t('channels.channelName') ?? 'Channel Name'}
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {channelFiles?.channel?.description ?? t('channels.noDescription') ?? t('channels.placeholder.noDescription') ?? 'No description available'}
                            </p>
                            
                            {/* Channel Stats */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                                    <span className="text-indigo-600 font-semibold">
                                        {channelFiles?.files?.length || 0} {t('channels.files') || 'files'}
                                    </span>
                                </div>
                                {channelFiles?.channel?.subscribersCount !== undefined ? (
                                    <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                                        <span className="text-indigo-600 font-semibold">
                                            {t('channels.subscribersCount', { count: channelFiles.channel.subscribersCount }) || `${channelFiles.channel.subscribersCount} ${t('channels.subscribers') || 'subscribers'}`}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                        <span className="text-gray-400">
                                            {t('channels.placeholder.subscribersCount')}
                                        </span>
                                    </div>
                                )}
                                {channelFiles?.channel?.createdAt ? (
                                    <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                                        <span className="text-indigo-600 font-semibold">
                                            {t('channels.createdAt')}: {new Date(channelFiles.channel.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                        <span className="text-gray-400">
                                            {t('channels.placeholder.createdAt')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Files Grid */}
                {channelFiles?.files && channelFiles.files.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {channelFiles.files.map((file) => (
                            <File
                                key={file._id || file.id}
                                Type={getFileCategory(file.fileType || file.mimeType || '')}
                                data={{
                                    ...file,
                                    fileName: file.fileName || file.name || t('channels.placeholder.fileName') || 'Unnamed File',
                                    url: file.url || file.fileUrl || file.downloadUrl || '',
                                    fileSize: file.fileSize || file.size || 0,
                                    createdAt: file.createdAt || file.uploadedAt || ''
                                }}
                                viewMode="grid"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-indigo-100">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaFile className="w-12 h-12 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {t('channels.placeholder.noResults') || 'No files found'}
                        </h3>
                        <p className="text-gray-600 text-lg mb-4">
                            {t('channels.noFiles') || 'No files in this channel yet'}
                        </p>
                        {pathname?.includes('/Promoter') && (
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                {t('channels.uploadFirstFile') || 'Upload the first file'}
                            </button>
                        )}
                        {!pathname?.includes('/Promoter') && !isSubscribed && (
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribeMutation.isLoading}
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {subscribeMutation.isLoading
                                    ? (t('common.loading') || 'Loading...')
                                    : (t('channels.subscribeToChannel') || 'Subscribe to Channel')
                                }
                            </button>
                        )}
                    </div>
                )}

                {/* Upload File Modal */}
                {showUploadModal && (
                    <UploadFile 
                        ToggleUploadFile={() => setShowUploadModal(false)} 
                        refetch={refetchChannelFiles}
                        isChannel={true}
                        id={channelId}
                    />
                )}
            </div>
        </div>
    );
}

