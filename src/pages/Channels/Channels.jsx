import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { channelService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { FaFolder } from 'react-icons/fa';
import { HiPlus } from 'react-icons/hi2';
import Loading from '../../components/Loading/Loading';
import './Channels.scss';

export default function Channels() {
    const [Token] = useCookies(['MegaBox']);
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);

    // Mockup data structure for endpoint preview
    const mockupData = useMemo(() => ({
        success: true,
        message: t('channels.mockup.message') || "تم جلب القنوات",
        data: {
            subscribedChannels: [
                {
                    _id: "6921b7309ad89d1d8ba8fb3f",
                    name: t('channels.mockup.channel1.name') || "Technology Channel",
                    description: t('channels.mockup.channel1.description') || "Latest tech news and updates",
                    image: {
                        secure_url: "https://via.placeholder.com/400x300/6366f1/ffffff?text=Technology+Channel",
                        public_id: "channels/tech-channel"
                    },
                    filesCount: 15,
                    subscribersCount: 1250,
                    createdAt: "2025-11-22T13:14:24.111Z",
                    createdBy: "691393863050c43d28b86b81"
                },
                {
                    _id: "6921b75b9ad89d1d8ba8fb8e",
                    name: t('channels.mockup.channel2.name') || "Design Inspiration",
                    description: t('channels.mockup.channel2.description') || "Creative designs and inspiration for designers",
                    image: {
                        secure_url: "https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Design+Channel",
                        public_id: "channels/design-channel"
                    },
                    filesCount: 8,
                    subscribersCount: 890,
                    createdAt: "2025-11-22T13:15:07.970Z",
                    createdBy: "691393863050c43d28b86b81"
                },
                {
                    _id: "6921c1239ad89d1d8ba8fc12",
                    name: t('channels.mockup.channel3.name') || "Programming Tutorials",
                    description: t('channels.mockup.channel3.description') || "Learn programming from scratch",
                    image: {
                        secure_url: "https://via.placeholder.com/400x300/10b981/ffffff?text=Programming",
                        public_id: "channels/programming-channel"
                    },
                    filesCount: 32,
                    subscribersCount: 2100,
                    createdAt: "2025-11-20T09:15:00.000Z",
                    createdBy: "691393863050c43d28b86b82"
                }
            ]
        }
    }), [t]);

    // Close sidenav when modal opens
    useEffect(() => {
        if (showSubscribeModal) {
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
    }, [showSubscribeModal]);

    // Form states
    const [channelId, setChannelId] = useState('');

    // Fetch subscribed channels
    const { data: channelsData, isLoading: channelsLoading } = useQuery(
        'mySubscribedChannels',
        () => channelService.getMySubscribedChannels(Token.MegaBox),
        {
            enabled: !!Token.MegaBox,
            cacheTime: 300000
        }
    );

    // Get subscribed channels from the response
    const subscribedChannels = useMemo(() => {
        const data = channelsData?.data || channelsData;
        const channels = data?.subscribedChannels || [];
        
        // Show mockup data if no real data exists
        if (channels.length === 0) {
            return mockupData.data.subscribedChannels;
        }
        
        return channels;
    }, [channelsData, mockupData]);

    // Subscribe to channel mutation
    const subscribeMutation = useMutation(
        (channelId) => channelService.subscribeToChannel(channelId, Token.MegaBox),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('mySubscribedChannels');
                setShowSubscribeModal(false);
                setChannelId('');
            }
        }
    );

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!channelId) {
            return;
        }
        subscribeMutation.mutate(channelId);
    };

    if (channelsLoading) {
        return <Loading />;
    }

    return (
        <div className="Channels min-h-screen bg-indigo-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-indigo-900">
                        {t('channels.title') || 'My Channels'}
                    </h1>
                    <button
                        onClick={() => setShowSubscribeModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                    >
                        <HiPlus className="w-5 h-5" />
                        {t('channels.subscribeToChannel') || 'Subscribe to Channel'}
                    </button>
                </div>

                {/* Subscribed Channels Grid */}
                {subscribedChannels && subscribedChannels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subscribedChannels.map((channel) => (
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
                                {!channel.image && (!channel.image || (typeof channel.image === 'object' && !channel.image?.secure_url)) && (
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
                                </div>
                                <button
                                    onClick={() => {
                                        navigate(`/dashboard/channels/${channel._id || channel.id}/files`);
                                    }}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
                                >
                                    {t('channels.viewFiles') || 'View Files'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border-2 border-indigo-100">
                        <FaFolder className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                            {t('channels.noChannels') || 'No channels subscribed yet'}
                        </p>
                        <button
                            onClick={() => setShowSubscribeModal(true)}
                            className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            {t('channels.subscribeToChannel') || 'Subscribe to a channel'}
                        </button>
                    </div>
                )}

                {/* Subscribe to Channel Modal */}
                {showSubscribeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000002 }}>
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <h2 className="text-2xl font-bold text-indigo-900 mb-4">
                                {t('channels.subscribeToChannel') || 'Subscribe to Channel'}
                            </h2>
                            <form onSubmit={handleSubscribe}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('channels.channelId') || 'Channel ID'}
                                    </label>
                                    <input
                                        type="text"
                                        value={channelId}
                                        onChange={(e) => setChannelId(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        placeholder={t('channels.enterChannelId') || 'Enter channel ID'}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowSubscribeModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                                    >
                                        {t('common.cancel') || 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={subscribeMutation.isLoading}
                                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {subscribeMutation.isLoading
                                            ? t('common.loading') || 'Loading...'
                                            : t('channels.subscribe') || 'Subscribe'}
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

