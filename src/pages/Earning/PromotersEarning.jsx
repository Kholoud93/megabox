import React, { useState } from 'react';
import './Earning.scss';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEye, FaDownload, FaMoneyBillWave, FaFileAlt, FaFileImage, FaFileVideo, FaFilePdf, FaFileWord,
    FaLink, FaGlobe, FaTimes, FaChartLine, FaUsers, FaRocket, FaEdit
} from 'react-icons/fa';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import { adminService } from '../../services/adminService';
import { useParams, useNavigate } from 'react-router-dom';
import { MdPendingActions } from "react-icons/md";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdOutlineAssuredWorkload } from "react-icons/md";
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';


// Enhanced Animation variants with smoother 
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 40,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 20,
            mass: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const statsVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.9 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 25,
            mass: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 60,
        rotateX: -15
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 30,
            mass: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 60,
        rotateX: 15,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

function LoadingSkeleton() {
    return (
        <div className="loading-skeleton">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className="skeleton-card"
                    initial={{ opacity: 0.2, scale: 0.95 }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [0.95, 1, 0.95]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                />
            ))}
        </div>
    );
}

function StatCard({ label, value, icon, color, index }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="earning-stat-card"
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
                scale: 1.03,
                y: -8,
                boxShadow: `0 15px 35px ${color}25`,
                transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }
            }}
            whileTap={{
                scale: 0.98,
                transition: { duration: 0.1 }
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            style={{
                background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                borderLeft: `4px solid ${color}`
            }}
        >
            <motion.div
                className="icon"
                style={{ color }}
                animate={{
                    rotate: isHovered ? 360 : 0,
                    scale: isHovered ? 1.15 : 1
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    type: "spring",
                    stiffness: 200
                }}
            >
                {icon}
            </motion.div>
            <div className="info">
                <motion.div
                    className="label"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: index * 0.1 + 0.4,
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    {label}
                </motion.div>
                <motion.div
                    className="value"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 20,
                        delay: index * 0.1 + 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    {value}
                </motion.div>
            </div>
        </motion.div>
    );
}

function CountryModal({ file, isOpen, onClose, t }) {
    if (!isOpen) return null;

    return (
        <motion.div
            className="country-modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <motion.div
                className="country-modal"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    className="modal-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.15,
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    <h3>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            <FaGlobe />
                        </motion.div>
                        {t('earning.countryAnalytics')}
                    </h3>
                    <motion.button
                        className="close-btn"
                        onClick={onClose}
                        whileHover={{
                            scale: 1.1,
                            rotate: 90,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaTimes />
                    </motion.button>
                </motion.div>
                <motion.div
                    className="modal-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.25,
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    <motion.div
                        className="file-info-header"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            delay: 0.35,
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                    >
                        <h4>{file.fileName || file.name || 'Unknown File'}</h4>
                        <div className="total-views">
                            <FaChartLine /> {file.views || 0} {t('earning.totalViews')}
                        </div>
                        {file.fileId && (
                            <div className="file-id-info">
                                <FaFileAlt /> <span className="file-id-label">File ID:</span>
                                <span className="file-id-value">{file.fileId}</span>
                            </div>
                        )}
                        {file.sharedUrl && (
                            <div className="file-url-info">
                                <FaLink /> <span className="file-url-label">Share URL:</span>
                                <a 
                                    href={file.sharedUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="file-url-link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {file.sharedUrl}
                                </a>
                            </div>
                        )}
                    </motion.div>
                    {file.viewsByCountry && file.viewsByCountry.length > 0 ? (
                        <motion.ul
                            className="country-list"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {file.viewsByCountry.map((c, index) => (
                                <motion.li
                                    key={c.country}
                                    className="country-item"
                                    variants={cardVariants}
                                    whileHover={{
                                        scale: 1.02,
                                        backgroundColor: "#f8fafc",
                                        transition: {
                                            duration: 0.3,
                                            ease: [0.25, 0.46, 0.45, 0.94]
                                        }
                                    }}
                                >
                                    <div className="country-info">
                                        <span className="country-flag">🌍</span>
                                        <span className="country-name">{c.country}</span>
                                    </div>
                                    <motion.div
                                        className="country-views"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: index * 0.1 + 0.5,
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20
                                        }}
                                    >
                                        <FaUsers /> {c.views}
                                    </motion.div>
                                </motion.li>
                            ))}
                        </motion.ul>
                    ) : (
                        <motion.p
                            className="no-data"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.4,
                                duration: 0.5,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                        >
                            <FaChartLine /> {t('earning.noCountryData')}
                        </motion.p>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext)) return <FaFileImage />;
    if (["mp4", "avi", "mov", "wmv", "flv", "mkv"].includes(ext)) return <FaFileVideo />;
    if (["pdf"].includes(ext)) return <FaFilePdf />;
    if (["doc", "docx"].includes(ext)) return <FaFileWord />;
    return <FaFileAlt />;
}

function FileCard({ file, onShowCountries, index, t }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="earning-file-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,62,75,0.12)",
                transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            layout
            layoutTransition={{
                type: "spring",
                stiffness: 200,
                damping: 25
            }}
        >
            <div className="file-header">
                <motion.div
                    className="file-icon-bg"
                    animate={{
                        rotate: isHovered ? 8 : 0,
                        scale: isHovered ? 1.08 : 1
                    }}
                    transition={{
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    {getFileIcon(file.fileName || file.name || '')}
                </motion.div>
                <div className="file-info">
                    <motion.div
                        className="file-name"
                        title={file.fileName || file.name || 'Unknown File'}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            delay: index * 0.08 + 0.3,
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                    >
                        {file.fileName || file.name || 'Unknown File'}
                    </motion.div>
                    <motion.div
                        className="file-actions"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: index * 0.08 + 0.4,
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                    >
                        <motion.a
                            className="file-link-btn"
                            href={file.sharedUrl || file.shareUrl || file.fileUrl || file.link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                if (!file.sharedUrl && !file.shareUrl && !file.fileUrl && !file.link) {
                                    e.preventDefault();
                                }
                            }}
                            whileHover={{
                                scale: 1.05,
                                y: -2,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaRocket /> {t('earning.launch')}
                        </motion.a>
                        <motion.button
                            className="countries-btn"
                            onClick={() => onShowCountries(file)}
                            whileHover={{
                                scale: 1.05,
                                y: -2,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaGlobe /> {t('earning.analytics')}
                        </motion.button>
                    </motion.div>
                </div>
            </div>

            <motion.div
                className="file-stats"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: index * 0.08 + 0.5,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
            >
                <motion.div
                    className="stat-item"
                    whileHover={{
                        scale: 1.08,
                        transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }
                    }}
                >
                    <motion.div
                        className="stat-icon"
                        animate={{
                            color: isHovered ? "#01677e" : "#64748b"
                        }}
                        transition={{
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                    >
                        <FaEye />
                    </motion.div>
                    <span className="stat-value">{file.views}</span>
                    <span className="stat-label">{t('earning.views')}</span>
                </motion.div>
                <motion.div
                    className="stat-item"
                    whileHover={{
                        scale: 1.08,
                        transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }
                    }}
                >
                    <motion.div
                        className="stat-icon"
                        animate={{
                            color: isHovered ? "#44546a" : "#64748b"
                        }}
                        transition={{
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                    >
                        <FaDownload />
                    </motion.div>
                    <span className="stat-value">{file.downloads}</span>
                    <span className="stat-label">{t('earning.downloads')}</span>
                </motion.div>
            </motion.div>

            <motion.div
                className="file-date"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    delay: index * 0.08 + 0.6,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
            >
                Last Activity: {new Date(file.lastUpdated).toLocaleDateString()}
            </motion.div>
        </motion.div>
    );
}

export default function PromotersEarning() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [selectedFile, setSelectedFile] = useState(null);

    const { id } = useParams()
    const queryClient = useQueryClient();
    const [showUpdateRewardModal, setShowUpdateRewardModal] = useState(false);
    const [showUpdateAnalyticsModal, setShowUpdateAnalyticsModal] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [rewardAmount, setRewardAmount] = useState('');
    const [analyticsFormData, setAnalyticsFormData] = useState({ totalDownloads: '', totalViews: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch user data to get username
    const { data: userData } = useQuery(
        ['userData', id],
        async () => {
            try {
                const result = await adminService.searchUser(id, token);
                return result.user || result;
            } catch (error) {
                console.error('Error fetching user data:', error);
                return null;
            }
        },
        { enabled: !!token && !!id, retry: false }
    );

    const username = userData?.username || userData?.email || userData?.name || '';

    // Fetch total earnings
    // API Response structure: { "message", "userId", "pendingRewards", "confirmedRewards", "totalEarnings", "currency" }
    const { data: earningsData, isLoading: earningsLoading, error: earningsError } = useQuery(
        ['userEarnings', id],
        () => adminService.getUserEarningsadmin(id, token),
        {
            enabled: !!token && !!id,
            retry: 2
        }
    );

    // Fetch total views/downloads
    // API Response structure: { "message", "userId", "totalAnalytics": { "totalDownloads", "totalViews" } }
    const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery(
        ['userAnalytics', id],
        () => adminService.getUserAnalyticsadmin(id, token),
        {
            enabled: !!token && !!id,
            retry: 2
        }
    );

    // Fetch shared files analytics with downloads and views
    // API Response structure: { "analytics": [{ "fileId", "fileName", "sharedUrl", "downloads", "views", "lastUpdated", "viewsByCountry" }] }
    // or { "downloadsViews": [...] } or { "data": [...] }
    const { data: shareLinksData, isLoading: shareLinksLoading, error: shareLinksError } = useQuery(
        ['shareLinkAnalytics', id],
        () => adminService.getShareLinkAnalyticdownloads(id, token),
        {
            enabled: !!token && !!id,
            retry: 2
        }
    );

    const isLoading = earningsLoading || analyticsLoading || shareLinksLoading;
    const hasError = earningsError || analyticsError || shareLinksError;

    // Extract data from API responses
    // API Response structure: { "message", "userId", "pendingRewards", "confirmedRewards", "totalEarnings", "currency", "pendingRewardsList" }
    const totalEarnings = earningsData?.totalEarnings || '0.000000';
    const PendingEarnings = earningsData?.pendingRewards || '0.000000';
    const ConfirmedEarnings = earningsData?.confirmedRewards || '0.000000';
    const currency = earningsData?.currency || 'USD';
    const pendingRewardsList = earningsData?.pendingRewardsList || 
                               earningsData?.rewards || 
                               earningsData?.pendingRewardsList || 
                               [];
    
    
    // API Response structure: { "message", "userId", "totalAnalytics": { "totalDownloads", "totalViews" } }
    const totalViews = analyticsData?.totalAnalytics?.totalViews || 0;
    const totalDownloads = analyticsData?.totalAnalytics?.totalDownloads || 0;

    // Handle update pending reward
    const handleUpdateReward = async () => {
        if (!selectedReward || !rewardAmount || parseFloat(rewardAmount) < 0) {
            toast.error(t('earning.invalidRewardAmount') || 'Please enter a valid reward amount', ToastOptions("error"));
            return;
        }

        // Extract reward ID with multiple fallback options
        const rewardId = selectedReward._id || 
                        selectedReward.id || 
                        selectedReward.rewardId || 
                        selectedReward.pendingRewardId ||
                        selectedReward.reward?._id ||
                        selectedReward.reward?.id;

        if (!rewardId) {
            toast.error(t('earning.rewardIdNotFound') || 'Reward ID not found. Please try again.', ToastOptions("error"));
            return;
        }

        setIsUpdating(true);
        try {
            await adminService.updateSinglePendingReward(id, rewardId, parseFloat(rewardAmount), token);
            toast.success(t('earning.rewardUpdated') || 'Pending reward updated successfully!', ToastOptions("success"));
            queryClient.invalidateQueries(['userEarnings', id]);
            setShowUpdateRewardModal(false);
            setSelectedReward(null);
            setRewardAmount('');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                t('earning.rewardUpdateFailed') || 
                                'Failed to update reward';
            toast.error(errorMessage, ToastOptions("error"));
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle update analytics data
    const handleUpdateAnalytics = async () => {
        const downloads = parseInt(analyticsFormData.totalDownloads);
        const views = parseInt(analyticsFormData.totalViews);

        if (isNaN(downloads) || downloads < 0 || isNaN(views) || views < 0) {
            toast.error(t('earning.invalidAnalyticsData') || 'Please enter valid numbers for downloads and views', ToastOptions("error"));
            return;
        }

        setIsUpdating(true);
        try {
            await adminService.updateAnalyticsData(id, {
                totalDownloads: downloads,
                totalViews: views
            }, token);
            toast.success(t('earning.analyticsUpdated') || 'Analytics data updated successfully!', ToastOptions("success"));
            queryClient.invalidateQueries(['userAnalytics', id]);
            setShowUpdateAnalyticsModal(false);
            setAnalyticsFormData({ totalDownloads: '', totalViews: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || t('earning.analyticsUpdateFailed') || 'Failed to update analytics', ToastOptions("error"));
        } finally {
            setIsUpdating(false);
        }
    };

    const openUpdateRewardModal = (reward) => {
        if (!reward) {
            toast.error(t('earning.noRewardSelected') || 'No reward selected', ToastOptions("error"));
            return;
        }
        
        setSelectedReward(reward);
        setRewardAmount(reward.amount || reward.value || reward.pendingAmount || reward.reward?.amount || '');
        setShowUpdateRewardModal(true);
    };

    // Open update analytics modal
    const openUpdateAnalyticsModal = () => {
        setAnalyticsFormData({
            totalDownloads: totalDownloads.toString(),
            totalViews: totalViews.toString()
        });
        setShowUpdateAnalyticsModal(true);
    };
    
    // Extract files from response - handle different response structures
    let files = [];
    if (shareLinksData?.analytics && Array.isArray(shareLinksData.analytics)) {
        files = shareLinksData.analytics;
    } else if (shareLinksData?.downloadsViews && Array.isArray(shareLinksData.downloadsViews)) {
        files = shareLinksData.downloadsViews;
    } else if (shareLinksData?.data && Array.isArray(shareLinksData.data)) {
        files = shareLinksData.data;
    } else if (Array.isArray(shareLinksData)) {
        files = shareLinksData;
    }
    const totalLinks = files.length;

    return (
        <motion.div
            className="earning-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <div className="earning-container__wrapper">
                {/* Header with Back Button */}
                <motion.div
                    className="page-header-with-back"
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    <button
                        onClick={() => navigate('/Owner/AllPromoters')}
                        className="back-btn"
                        type="button"
                    >
                        {language === 'ar' ? <HiArrowRight /> : <HiArrowLeft />}
                        <span>{t('common.back')}</span>
                    </button>
                    <div className="page-header">
                        <h1>
                            {username 
                                ? `${t('earning.analyticsDashboard')} - ${username}`
                                : t('earning.analyticsDashboard')
                            }
                        </h1>
                        <p>
                            {username 
                                ? t('earning.trackPerformanceWithUser').replace('{{username}}', username)
                                : t('earning.trackPerformance')
                            }
                        </p>
                    </div>
                </motion.div>

            {/* Stats Dashboard */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : (totalViews === 0 && totalDownloads === 0 && totalLinks === 0) ? (
                <motion.div
                    className="no-analytics-message"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    <FaChartLine />
                    <h3>{t('earning.noAnalyticsData') || 'No Analytics Data Available'}</h3>
                    <p>{t('earning.noAnalyticsMessage') || 'This promoter has not shared any content yet. Analytics will appear here once they start sharing files.'}</p>
                </motion.div>
            ) : (
                <motion.div
                    className="earning-stats"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={cardVariants} style={{ position: 'relative' }}>
                        <StatCard label={t('earning.totalViews')} value={totalViews} icon={<FaEye />} color="#9333ea" index={0} />
                        <button
                            className="update-analytics-btn"
                            onClick={openUpdateAnalyticsModal}
                            title={t('earning.updateAnalytics') || 'Update Analytics'}
                        >
                            <FaEdit />
                        </button>
                    </motion.div>
                    <StatCard label={t('earning.totalDownloads')} value={totalDownloads} icon={<FaDownload />} color="#9333ea" index={1} />
                    <StatCard label={t('earning.totalLinks')} value={totalLinks} icon={<FaLink />} color="#9333ea" index={2} />
                    <motion.div variants={cardVariants} style={{ position: 'relative' }}>
                        <StatCard label={t('promoterDashboard.pendingEarnings')} value={`${PendingEarnings} ${currency}`} icon={<MdPendingActions />} color="#9333ea" index={3} />
                        {pendingRewardsList.length > 0 && (
                            <button
                                className="update-reward-btn"
                                onClick={() => openUpdateRewardModal(pendingRewardsList[0])}
                                title={t('earning.updatePendingReward') || 'Update Pending Reward'}
                            >
                                <FaEdit />
                            </button>
                        )}
                    </motion.div>
                    <StatCard label={t('promoterDashboard.confirmedEarnings')} value={`${ConfirmedEarnings} ${currency}`} icon={<MdOutlineAssuredWorkload />} color="#9333ea" index={4} />
                    <StatCard label={t('promoterDashboard.totalEarnings')} value={`${totalEarnings} ${currency}`} icon={<GiTakeMyMoney />} color="#9333ea" index={5} />
                </motion.div>
            )}

            {/* Files Cards */}
            <motion.div
                className="files-section"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    delay: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
            >
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    {username || t('earning.contentPerformance')}
                </motion.h2>

                <motion.div
                    className="earning-files-list"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {isLoading ? (
                        <motion.div
                            className="loading-message"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.6,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                <FaRocket />
                            </motion.div>
                            {t('earning.loadingAnalytics')}
                        </motion.div>
                    ) : hasError ? (
                        <motion.div
                            className="no-files-message"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                        >
                            <FaChartLine />
                            <h3>{username ? t('earning.noSharedLinksForUser').replace('{{username}}', username) : t('earning.noSharedLinks')}</h3>
                            <p>{username ? t('earning.noSharedLinksForUserMessage').replace('{{username}}', username) : t('earning.noSharedLinksMessage')}</p>
                        </motion.div>
                    ) : files.length === 0 ? (
                        <motion.div
                            className="no-files-message"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                        >
                            <FaChartLine />
                            <h3>{t('earning.noSharedLinks') || 'No Shared Links Available'}</h3>
                            <p>{t('earning.noSharedLinksMessage') || 'This promoter has not created any shared links yet. Shared link analytics will appear here once they start sharing files.'}</p>
                        </motion.div>
                    ) : (
                        files.map((file, index) => {
                            // Ensure file has required fields from API response
                            // API Response: { "fileId", "fileName", "sharedUrl", "downloads", "views", "lastUpdated", "viewsByCountry" }
                            const fileData = {
                                fileId: file.fileId || file.id || file._id || `file-${index}`,
                                fileName: file.fileName || file.name || 'Unknown File',
                                sharedUrl: file.sharedUrl || file.shareUrl || file.fileUrl || file.link || '',
                                downloads: file.downloads || file.totalDownloads || 0,
                                views: file.views || file.totalViews || 0,
                                lastUpdated: file.lastUpdated || file.createdAt || file.date || new Date().toISOString(),
                                viewsByCountry: file.viewsByCountry || []
                            };
                            
                            return (
                                <FileCard
                                    key={fileData.fileId}
                                    file={fileData}
                                    onShowCountries={setSelectedFile}
                                    index={index}
                                    t={t}
                                />
                            );
                        })
                    )}
                </motion.div>
            </motion.div>

            {/* Update Pending Reward Modal */}
            <AnimatePresence mode="wait">
                {showUpdateRewardModal && (
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowUpdateRewardModal(false);
                            setSelectedReward(null);
                            setRewardAmount('');
                        }}
                    >
                        <motion.div
                            className="modal-content"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{t('earning.updatePendingReward') || 'Update Pending Reward'}</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => {
                                        setShowUpdateRewardModal(false);
                                        setSelectedReward(null);
                                        setRewardAmount('');
                                    }}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t('earning.rewardId') || 'Reward ID'}</label>
                                    <input
                                        type="text"
                                        value={
                                            (() => {
                                                const rewardId = selectedReward?._id || 
                                                                selectedReward?.id || 
                                                                selectedReward?.rewardId || 
                                                                selectedReward?.pendingRewardId ||
                                                                selectedReward?.reward?._id ||
                                                                selectedReward?.reward?.id;
                                                if (rewardId) {
                                                    return String(rewardId);
                                                }
                                                // If no ID found, show a warning message
                                                return t('earning.noRewardId') || 'N/A - Reward ID not found';
                                            })()
                                        }
                                        disabled
                                        className="form-input reward-id-input"
                                        readOnly
                                    />
                                    {!selectedReward?._id && !selectedReward?.id && !selectedReward?.rewardId && (
                                        <small className="form-help-text" style={{ color: '#ef4444' }}>
                                            {t('earning.rewardIdWarning') || '⚠️ Warning: Reward ID not found. Update may fail.'}
                                        </small>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>{t('earning.rewardAmount') || 'Reward Amount'} *</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        min="0"
                                        value={rewardAmount}
                                        onChange={(e) => setRewardAmount(e.target.value)}
                                        className="form-input"
                                        placeholder={t('earning.enterRewardAmount') || 'Enter reward amount'}
                                    />
                                    <small className="form-help-text">
                                        {t('earning.rewardAmountHelp') || 'Enter the new amount for this pending reward'}
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowUpdateRewardModal(false);
                                        setSelectedReward(null);
                                        setRewardAmount('');
                                    }}
                                    disabled={isUpdating}
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpdateReward}
                                    disabled={isUpdating || !rewardAmount || parseFloat(rewardAmount) < 0}
                                >
                                    {isUpdating ? (t('common.updating') || 'Updating...') : (t('common.update') || 'Update')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Update Analytics Data Modal */}
            <AnimatePresence mode="wait">
                {showUpdateAnalyticsModal && (
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowUpdateAnalyticsModal(false);
                            setAnalyticsFormData({ totalDownloads: '', totalViews: '' });
                        }}
                    >
                        <motion.div
                            className="modal-content"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{t('earning.updateAnalyticsData') || 'Update Analytics Data'}</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => {
                                        setShowUpdateAnalyticsModal(false);
                                        setAnalyticsFormData({ totalDownloads: '', totalViews: '' });
                                    }}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t('earning.totalDownloads') || 'Total Downloads'} *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={analyticsFormData.totalDownloads}
                                        onChange={(e) => setAnalyticsFormData(prev => ({ ...prev, totalDownloads: e.target.value }))}
                                        className="form-input"
                                        placeholder={t('earning.enterTotalDownloads') || 'Enter total downloads'}
                                    />
                                    <small className="form-help-text">
                                        {t('earning.totalDownloadsDescription') || 'Total number of downloads across all shared content'}
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>{t('earning.totalViews') || 'Total Views'} *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={analyticsFormData.totalViews}
                                        onChange={(e) => setAnalyticsFormData(prev => ({ ...prev, totalViews: e.target.value }))}
                                        className="form-input"
                                        placeholder={t('earning.enterTotalViews') || 'Enter total views'}
                                    />
                                    <small className="form-help-text">
                                        {t('earning.totalViewsDescription') || 'Total number of views across all shared content'}
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowUpdateAnalyticsModal(false);
                                        setAnalyticsFormData({ totalDownloads: '', totalViews: '' });
                                    }}
                                    disabled={isUpdating}
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpdateAnalytics}
                                    disabled={isUpdating || !analyticsFormData.totalDownloads || !analyticsFormData.totalViews}
                                >
                                    {isUpdating ? (t('common.updating') || 'Updating...') : (t('common.update') || 'Update')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Country Modal */}
            <AnimatePresence mode="wait">
                {selectedFile && (
                    <CountryModal
                        file={selectedFile}
                        isOpen={!!selectedFile}
                        onClose={() => setSelectedFile(null)}
                        t={t}
                    />
                )}
            </AnimatePresence>
            </div>
        </motion.div>
    );
}
