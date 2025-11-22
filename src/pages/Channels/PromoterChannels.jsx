import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { channelService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { HiPlus } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import './Channels.scss';

export default function PromoterChannels() {
    const [Token] = useCookies(['MegaBox']);
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Mockup data structure for endpoint preview
    const mockupData = useMemo(() => ({
        success: true,
        message: t('channels.mockup.message') || "تم جلب القنوات",
        data: {
            myChannels: [
                {
                    _id: "6921b7309ad89d1d8ba8fb3f",
                    name: t('channels.mockup.myChannel1.name') || "My Tech Channel",
                    description: t('channels.mockup.myChannel1.description') || "Technology tutorials and reviews",
                    image: {
                        secure_url: "https://via.placeholder.com/400x300/6366f1/ffffff?text=My+Tech+Channel",
                        public_id: "channels/my-tech-channel"
                    },
                    filesCount: 25,
                    subscribersCount: 3420,
                    createdAt: "2025-11-20T10:30:00.000Z",
                    createdBy: "691393863050c43d28b86b81"
                },
                {
                    _id: "6921b75b9ad89d1d8ba8fb8e",
                    name: t('channels.mockup.myChannel2.name') || "Business Tips",
                    description: t('channels.mockup.myChannel2.description') || "Entrepreneurship and business advice",
                    image: {
                        secure_url: "https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Business+Channel",
                        public_id: "channels/business-channel"
                    },
                    filesCount: 12,
                    subscribersCount: 1850,
                    createdAt: "2025-11-18T14:20:00.000Z",
                    createdBy: "691393863050c43d28b86b81"
                }
            ],
            subscribedChannels: [
                {
                    _id: "6921c1239ad89d1d8ba8fc12",
                    name: t('channels.mockup.subscribedChannel1.name') || "Design Masterclass",
                    description: t('channels.mockup.subscribedChannel1.description') || "Learn design from experts",
                    image: {
                        secure_url: "https://via.placeholder.com/400x300/10b981/ffffff?text=Design+Masterclass",
                        public_id: "channels/design-masterclass"
                    },
                    filesCount: 18,
                    subscribersCount: 2100,
                    createdAt: "2025-11-15T09:15:00.000Z",
                    createdBy: "691393863050c43d28b86b82"
                }
            ]
        }
    }), [t]);

    // Close sidenav when modal opens
    useEffect(() => {
        if (showCreateModal) {
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
    }, [showCreateModal]);

    // Form states
    const [channelName, setChannelName] = useState('');
    const [channelDescription, setChannelDescription] = useState('');
    const [channelImage, setChannelImage] = useState(null);

    // Fetch subscribed channels (promoters can also subscribe to other channels)
    const { data: channelsData, isLoading: channelsLoading } = useQuery(
        'mySubscribedChannels',
        () => channelService.getMySubscribedChannels(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            cacheTime: 300000
        }
    );

    // Combine myChannels and subscribedChannels
    const allChannels = useMemo(() => {
        const data = channelsData?.data || channelsData;
        const myChannels = data?.myChannels || [];
        const subscribedChannels = data?.subscribedChannels || [];
        
        // Show mockup data if no real data exists
        if (myChannels.length === 0 && subscribedChannels.length === 0) {
            return [...mockupData.data.myChannels, ...mockupData.data.subscribedChannels];
        }
        
        // Combine and remove duplicates based on _id
        const combined = [...myChannels, ...subscribedChannels];
        const uniqueChannels = combined.filter((channel, index, self) =>
            index === self.findIndex((c) => (c._id || c.id) === (channel._id || channel.id))
        );
        return uniqueChannels;
    }, [channelsData]);

    // Create channel mutation
    const createChannelMutation = useMutation(
        (formData) => channelService.createChannel(
            formData.image,
            formData.name,
            formData.description,
            Token.MegaBox
        ),
        {
            onSuccess: (response) => {
                // Manually add the created channel to the cache
                queryClient.setQueryData('mySubscribedChannels', (oldData) => {
                    const newChannel = response?.data || response;
                    if (newChannel) {
                        const data = oldData?.data || oldData;
                        const myChannels = data?.myChannels || [];
                        
                        // Check if channel already exists
                        const exists = myChannels.some(c => (c._id || c.id) === (newChannel._id || newChannel.id));
                        
                        if (!exists) {
                            return {
                                ...oldData,
                                data: {
                                    ...data,
                                    myChannels: [...myChannels, newChannel],
                                    subscribedChannels: data?.subscribedChannels || []
                                }
                            };
                        }
                    }
                    return oldData;
                });
                // Also invalidate to refetch from server
                queryClient.invalidateQueries('mySubscribedChannels');
                setShowCreateModal(false);
                setChannelName('');
                setChannelDescription('');
                setChannelImage(null);
            }
        }
    );

    const handleCreateChannel = (e) => {
        e.preventDefault();
        if (!channelName || !channelImage) {
            return;
        }
        createChannelMutation.mutate({
            name: channelName,
            description: channelDescription,
            image: channelImage
        });
    };

    if (channelsLoading) {
        return <Loading />;
    }

    return (
        <div className="Channels min-h-screen bg-indigo-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-indigo-900">
                        {t('channels.myChannels') || 'My Channels'}
                    </h1>
                    <motion.button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <HiPlus className="w-5 h-5" />
                        {t('channels.createChannel') || 'Create Channel'}
                    </motion.button>
                </div>

                {/* Created/Subscribed Channels Grid */}
                {allChannels && allChannels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allChannels.map((channel) => (
                            <motion.div
                                key={channel._id || channel.id}
                                className="bg-white rounded-xl shadow-lg border-2 border-indigo-100 p-6 hover:shadow-xl transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                {(channel.image || (typeof channel.image === 'object' && channel.image?.secure_url)) && (
                                    <img
                                        src={typeof channel.image === 'object' ? channel.image.secure_url : channel.image}
                                        alt={channel.name || t('channels.placeholder.channelName') || 'Channel'}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                {!channel.image && (typeof channel.image !== 'object' || !channel.image?.secure_url) && (
                                    <div className="w-full h-48 bg-indigo-100 rounded-lg mb-4 flex items-center justify-center">
                                        <span className="text-indigo-400 text-sm">{t('channels.placeholder.channelName') || 'No Image'}</span>
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold text-indigo-900 mb-2">
                                    {channel.name || t('channels.placeholder.channelName') || 'Unnamed Channel'}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {channel.description || t('channels.noDescription') || 'No description'}
                                </p>
                                {/* Placeholder for channel stats */}
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                                    {channel.filesCount !== undefined && (
                                        <span>{t('channels.filesCount', { count: channel.filesCount }) || `${channel.filesCount} files`}</span>
                                    )}
                                    {channel.subscribersCount !== undefined && (
                                        <span>{t('channels.subscribersCount', { count: channel.subscribersCount }) || `${channel.subscribersCount} subscribers`}</span>
                                    )}
                                    {channel.createdAt && (
                                        <span>{t('channels.createdAt') || 'Created'}: {new Date(channel.createdAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        navigate(`/Promoter/channels/${channel._id || channel.id}/files`);
                                    }}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
                                >
                                    {t('channels.manageFiles') || 'Manage Files'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-indigo-100">
                        <p className="text-gray-600 text-lg mb-4">
                            {t('channels.noChannelsCreated') || 'No channels created yet'}
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            {t('channels.createFirstChannel') || 'Create Your First Channel'}
                        </button>
                    </div>
                )}

                {/* Create Channel Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000002 }}>
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <h2 className="text-2xl font-bold text-indigo-900 mb-4">
                                {t('channels.createChannel') || 'Create Channel'}
                            </h2>
                            <form onSubmit={handleCreateChannel}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('channels.channelName') || 'Channel Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={channelName}
                                        onChange={(e) => setChannelName(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('channels.description') || 'Description'}
                                    </label>
                                    <textarea
                                        value={channelDescription}
                                        onChange={(e) => setChannelDescription(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        rows="3"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('channels.channelImage') || 'Channel Image'}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setChannelImage(e.target.files[0])}
                                        className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                                    >
                                        {t('common.cancel') || 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createChannelMutation.isLoading}
                                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {createChannelMutation.isLoading
                                            ? t('common.loading') || 'Loading...'
                                            : t('channels.create') || 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

