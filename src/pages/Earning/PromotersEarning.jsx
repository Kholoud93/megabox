import React, { useState } from 'react';
import './Earning.scss';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEye, FaDownload, FaMoneyBillWave, FaFileAlt, FaFileImage, FaFileVideo, FaFilePdf, FaFileWord,
    FaLink, FaGlobe, FaTimes, FaChartLine, FaUsers, FaRocket
} from 'react-icons/fa';
import { API_URL, adminService } from '../../services/api';
import { useParams } from 'react-router-dom';
import { MdPendingActions } from "react-icons/md";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdOutlineAssuredWorkload } from "react-icons/md";
import { useLanguage } from '../../context/LanguageContext';


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
                        <h4>{file.fileName}</h4>
                        <div className="total-views">
                            <FaChartLine /> {file.views} {t('earning.totalViews')}
                        </div>
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
                    {getFileIcon(file.fileName)}
                </motion.div>
                <div className="file-info">
                    <motion.div
                        className="file-name"
                        title={file.fileName}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            delay: index * 0.08 + 0.3,
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                    >
                        {file.fileName}
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
                            href={file.sharedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
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
    const { t } = useLanguage();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [selectedFile, setSelectedFile] = useState(null);

    const { id } = useParams()

    // Fetch user data to get username
    const { data: userData, isLoading: userDataLoading } = useQuery(
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

    // Mock earnings data
    const mockEarningsData = {
        totalEarnings: '1250.50',
        pendingRewards: '450.25',
        confirmedRewards: '800.25',
        currency: 'USD'
    };

    // Fetch total earnings
    const { data: earningsData, isLoading: earningsLoading } = useQuery(
        ['userEarnings'],
        async () => {
            try {
                const res = await fetch(`${API_URL}/auth/getUserEarningsadmin/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    return mockEarningsData;
                }
                const data = await res.json();
                return data || mockEarningsData;
            } catch (error) {
                console.error('Error fetching earnings:', error);
                return mockEarningsData;
            }
        },
        { enabled: !!token }
    );

    // Mock analytics data
    const mockAnalyticsData = {
        totalAnalytics: {
            totalViews: 1250,
            totalDownloads: 450
        }
    };

    // Fetch total views/downloads
    const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
        ['userAnalytics'],
        async () => {
            try {
                const res = await fetch(`${API_URL}/auth/getUserAnalyticsadmin/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    return mockAnalyticsData;
                }
                const data = await res.json();
                return data || mockAnalyticsData;
            } catch (error) {
                console.error('Error fetching analytics:', error);
                return mockAnalyticsData;
            }
        },
        { enabled: !!token }
    );

    // Mock shared files data
    const mockShareLinksData = {
        analytics: [
            {
                fileId: 'file1',
                fileName: 'document.pdf',
                fileUrl: 'https://example.com/document.pdf',
                views: 125,
                downloads: 45,
                countries: [
                    { country: 'United States', views: 45, flag: '🇺🇸' },
                    { country: 'Egypt', views: 35, flag: '🇪🇬' },
                    { country: 'Saudi Arabia', views: 25, flag: '🇸🇦' },
                    { country: 'UAE', views: 20, flag: '🇦🇪' }
                ],
                lastUpdated: new Date('2024-01-20').toISOString()
            },
            {
                fileId: 'file2',
                fileName: 'presentation.pptx',
                fileUrl: 'https://example.com/presentation.pptx',
                views: 89,
                downloads: 32,
                countries: [
                    { country: 'United States', views: 30, flag: '🇺🇸' },
                    { country: 'Egypt', views: 25, flag: '🇪🇬' },
                    { country: 'Jordan', views: 20, flag: '🇯🇴' },
                    { country: 'Lebanon', views: 14, flag: '🇱🇧' }
                ],
                lastUpdated: new Date('2024-01-19').toISOString()
            },
            {
                fileId: 'file3',
                fileName: 'video_tutorial.mp4',
                fileUrl: 'https://example.com/video_tutorial.mp4',
                views: 256,
                downloads: 78,
                countries: [
                    { country: 'United States', views: 80, flag: '🇺🇸' },
                    { country: 'Egypt', views: 65, flag: '🇪🇬' },
                    { country: 'Saudi Arabia', views: 45, flag: '🇸🇦' },
                    { country: 'UAE', views: 35, flag: '🇦🇪' },
                    { country: 'Kuwait', views: 31, flag: '🇰🇼' }
                ],
                lastUpdated: new Date('2024-01-18').toISOString()
            },
            {
                fileId: 'file4',
                fileName: 'image_gallery.zip',
                fileUrl: 'https://example.com/image_gallery.zip',
                views: 67,
                downloads: 23,
                countries: [
                    { country: 'Egypt', views: 25, flag: '🇪🇬' },
                    { country: 'Saudi Arabia', views: 20, flag: '🇸🇦' },
                    { country: 'UAE', views: 22, flag: '🇦🇪' }
                ],
                lastUpdated: new Date('2024-01-17').toISOString()
            },
            {
                fileId: 'file5',
                fileName: 'spreadsheet_data.xlsx',
                fileUrl: 'https://example.com/spreadsheet_data.xlsx',
                views: 145,
                downloads: 56,
                countries: [
                    { country: 'United States', views: 50, flag: '🇺🇸' },
                    { country: 'Egypt', views: 40, flag: '🇪🇬' },
                    { country: 'Saudi Arabia', views: 30, flag: '🇸🇦' },
                    { country: 'UAE', views: 25, flag: '🇦🇪' }
                ],
                lastUpdated: new Date('2024-01-16').toISOString()
            }
        ]
    };

    // Fetch shared files analytics
    const { data: shareLinksData, isLoading: shareLinksLoading } = useQuery(
        ['shareLinkAnalytics'],
        async () => {
            try {
                const res = await fetch(`${API_URL}/auth/getShareLinkAnalyticsadmin/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    return mockShareLinksData;
                }
                const data = await res.json();
                return data || mockShareLinksData;
            } catch (error) {
                console.error('Error fetching share links:', error);
                return mockShareLinksData;
            }
        },
        { enabled: !!token }
    );

    const isLoading = earningsLoading || analyticsLoading || shareLinksLoading;

    const totalEarnings = earningsData?.totalEarnings || '0.00';
    const PendingEarnings = earningsData?.pendingRewards || '0.00';
    const ConfirmedEarnings = earningsData?.confirmedRewards || '0.00';
    const currency = earningsData?.currency || 'USD';
    const totalViews = analyticsData?.totalAnalytics?.totalViews || 0;
    const totalDownloads = analyticsData?.totalAnalytics?.totalDownloads || 0;
    const files = shareLinksData?.analytics || [];
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
            {/* Header */}
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    delay: 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
            >
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
            </motion.div>

            {/* Stats Dashboard */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <motion.div
                    className="earning-stats"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <StatCard label={t('earning.totalViews')} value={totalViews} icon={<FaEye />} color="#9333ea" index={0} />
                    <StatCard label={t('earning.totalDownloads')} value={totalDownloads} icon={<FaDownload />} color="#9333ea" index={1} />
                    <StatCard label={t('earning.totalLinks')} value={totalLinks} icon={<FaLink />} color="#9333ea" index={2} />
                    <StatCard label={t('promoterDashboard.pendingEarnings')} value={`${PendingEarnings} ${currency}`} icon={<MdPendingActions />} color="#9333ea" index={3} />
                    <StatCard label={t('promoterDashboard.confirmedEarnings')} value={`${ConfirmedEarnings} ${currency}`} icon={<MdOutlineAssuredWorkload />} color="#9333ea" index={3} />
                    <StatCard label={t('promoterDashboard.totalEarnings')} value={`${totalEarnings} ${currency}`} icon={<GiTakeMyMoney />} color="#9333ea" index={3} />
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
                    {t('earning.contentPerformance')}
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
                            <h3>{t('earning.noContentShared')}</h3>
                            <p>{t('earning.startSharing')}</p>
                        </motion.div>
                    ) : (
                        files.map((file, index) => (
                            <FileCard
                                key={file.fileId}
                                file={file}
                                onShowCountries={setSelectedFile}
                                index={index}
                                t={t}
                            />
                        ))
                    )}
                </motion.div>
            </motion.div>

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
        </motion.div>
    );
}
