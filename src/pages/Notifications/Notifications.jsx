import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheck, FaCheckDouble, FaTimes, FaTrash } from 'react-icons/fa';
import { notificationService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import './Notifications.scss';

// Mock data for UI display
const MOCK_NOTIFICATIONS = [
    {
        _id: '1',
        id: '1',
        title: 'Withdrawal Approved',
        message: 'Your withdrawal request of $500.00 has been approved and processed.',
        content: 'Your withdrawal request of $500.00 has been approved and processed.',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '2',
        id: '2',
        title: 'New Referral',
        message: 'john_doe has signed up using your referral link!',
        content: 'john_doe has signed up using your referral link!',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '3',
        id: '3',
        title: 'Earnings Update',
        message: 'You have earned $45.75 from your shared content today.',
        content: 'You have earned $45.75 from your shared content today.',
        read: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '4',
        id: '4',
        title: 'Payment Received',
        message: 'Your payment of $250.50 has been successfully transferred to your account.',
        content: 'Your payment of $250.50 has been successfully transferred to your account.',
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '5',
        id: '5',
        title: 'Account Verified',
        message: 'Your account has been successfully verified. You can now access all features.',
        content: 'Your account has been successfully verified. You can now access all features.',
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '6',
        id: '6',
        title: 'New Feature Available',
        message: 'Check out our new analytics dashboard with enhanced insights!',
        content: 'Check out our new analytics dashboard with enhanced insights!',
        read: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '7',
        id: '7',
        title: 'Referral Bonus',
        message: 'You received a bonus of $12.50 for referring a new user.',
        content: 'You received a bonus of $12.50 for referring a new user.',
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: '8',
        id: '8',
        title: 'Weekly Summary',
        message: 'Your weekly earnings summary: $325.80 total revenue.',
        content: 'Your weekly earnings summary: $325.80 total revenue.',
        read: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const USE_MOCK_DATA = true; // Set to false to use real API data

export default function Notifications() {
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    // Fetch notifications
    const { data: notificationsData, isLoading } = useQuery(
        ['userNotifications'],
        async () => {
            if (USE_MOCK_DATA) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return { notifications: MOCK_NOTIFICATIONS, data: MOCK_NOTIFICATIONS };
            }
            return notificationService.getUserNotifications(token);
        },
        {
            enabled: USE_MOCK_DATA || !!token,
            refetchInterval: USE_MOCK_DATA ? false : 30000 // Refetch every 30 seconds
        }
    );

    const notifications = notificationsData?.notifications || notificationsData?.data || MOCK_NOTIFICATIONS;

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation(
        () => notificationService.markAllAsRead(token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('userNotifications');
            }
        }
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <motion.div
            className="notifications-container min-h-screen bg-indigo-50 p-4 md:p-6 lg:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="notifications-header bg-white rounded-xl shadow-sm p-6 mb-6"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <FaBell className="text-indigo-600 text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-indigo-900">Notifications</h1>
                                <p className="text-gray-600">
                                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <motion.button
                                onClick={() => markAllAsReadMutation.mutate()}
                                disabled={markAllAsReadMutation.isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaCheckDouble />
                                <span>Mark all as read</span>
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                        >
                            <FaBell className="text-4xl text-indigo-600" />
                        </motion.div>
                        <p className="mt-4 text-gray-600">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <motion.div
                        className="text-center py-12 bg-white rounded-xl shadow-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications</h3>
                        <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AnimatePresence>
                            {notifications.map((notification, index) => (
                                <motion.div
                                    key={notification._id || notification.id || index}
                                    className={`notification-item bg-white rounded-lg shadow-sm p-4 border-l-4 ${notification.read
                                        ? 'border-gray-300 opacity-75'
                                        : 'border-indigo-600 bg-indigo-50'
                                        }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-200' : 'bg-indigo-100'
                                            }`}>
                                            {notification.read ? (
                                                <FaCheck className="text-gray-600" />
                                            ) : (
                                                <FaBell className="text-indigo-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold mb-1 ${notification.read ? 'text-gray-700' : 'text-indigo-900'
                                                        }`}>
                                                        {notification.title || 'Notification'}
                                                    </h3>
                                                    <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800'
                                                        }`}>
                                                        {notification.message || notification.content || 'No message'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {notification.createdAt
                                                            ? new Date(notification.createdAt).toLocaleString()
                                                            : 'Recently'
                                                        }
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

