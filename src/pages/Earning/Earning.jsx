import React, { useState } from 'react';
import './Earning.scss';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaGlobe, FaTimes, FaEye, FaDownload, FaLink, FaMoneyBillWave, FaChartLine
} from 'react-icons/fa';
import { API_URL, userService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import SharedLinksTable from '../../components/SharedLinksTable/SharedLinksTable';

const EARNINGS_URL = `${API_URL}/auth/getUserEarnings`;
const ANALYTICS_URL = `${API_URL}/auth/getUserAnalytics`;
const SHARE_LINK_ANALYTICS_URL = `${API_URL}/auth/getShareLinkAnalytics`;


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

function StatCard({ label, value, icon, color, index, onClick }) {
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
            onClick={onClick}
            style={{
                background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                borderLeft: `4px solid ${color}`,
                cursor: onClick ? 'pointer' : 'default'
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
                boxShadow: "0 20px 40px rgba(99, 102, 241, 0.15)",
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
                            color: isHovered ? "#6366f1" : "#64748b"
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
                            color: isHovered ? "#4f46e5" : "#64748b"
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
                {t('earning.lastActivity')}: {new Date(file.lastUpdated).toLocaleDateString()}
            </motion.div>
        </motion.div>
    );
}

function StatDetailModal({ statType, isOpen, onClose, data, t }) {
    if (!isOpen) return null;

    const getModalContent = () => {
        switch (statType) {
            case 'totalEarnings':
                return {
                    title: t('earning.totalEarnings'),
                    description: t('earning.withdrawableDescription'),
                    value: data?.withdrawable || '0.00',
                    currency: data?.currency || 'USD'
                };
            case 'views':
                return {
                    title: t('earning.totalViews'),
                    description: t('earning.totalViewsDescription'),
                    value: data?.totalViews || 0
                };
            case 'downloads':
                return {
                    title: t('earning.totalDownloads'),
                    description: t('earning.totalDownloadsDescription'),
                    value: data?.totalDownloads || 0
                };
            case 'links':
                return {
                    title: t('earning.totalLinks'),
                    description: t('earning.totalLinksDescription'),
                    value: data?.totalLinks || 0
                };
            default:
                return null;
        }
    };

    const content = getModalContent();
    if (!content) return null;

    return (
        <motion.div
            className="stat-modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="stat-modal"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="stat-modal-header">
                    <h3>{content.title}</h3>
                    <button onClick={onClose} className="close-btn">
                        <FaTimes />
                    </button>
                </div>
                <div className="stat-modal-content">
                    <div className="stat-modal-value">
                        {content.value} {content.currency && content.currency}
                    </div>
                    <p className="stat-modal-description">{content.description}</p>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function Earning() {
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedStat, setSelectedStat] = useState(null);
    const { t } = useLanguage();

    // Fetch total earnings (for content analytics - only totalEarnings is used here)
    const { data: earningsData, isLoading: earningsLoading, error: earningsError } = useQuery(
        ['userEarnings'],
        async () => {
            const res = await fetch(EARNINGS_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch earnings: ${res.status}`);
            }
            return res.json();
        },
        {
            enabled: !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching earnings:', error);
            }
        }
    );

    // Fetch total views/downloads (content analytics)
    const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery(
        ['userAnalytics'],
        async () => {
            const res = await fetch(ANALYTICS_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch analytics: ${res.status}`);
            }
            return res.json();
        },
        {
            enabled: !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching analytics:', error);
            }
        }
    );

    // Fetch shared files analytics (for links count)
    const { data: shareLinksData, isLoading: shareLinksLoading, error: shareLinksError } = useQuery(
        ['shareLinkAnalytics'],
        async () => {
            const res = await fetch(SHARE_LINK_ANALYTICS_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch share link analytics: ${res.status}`);
            }
            return res.json();
        },
        {
            enabled: !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching share link analytics:', error);
            }
        }
    );

    const isLoading = earningsLoading || analyticsLoading || shareLinksLoading;

    const totalEarnings = earningsData?.totalEarnings || '0.00';
    const withdrawable = earningsData?.withdrawable || earningsData?.totalEarnings || '0.00';
    const estimatedIncome = earningsData?.estimatedIncome || earningsData?.pendingRewards || '0.00';
    const actualIncome = earningsData?.actualIncome || earningsData?.confirmedRewards || earningsData?.totalEarnings || '0.00';
    const currency = earningsData?.currency || 'USD';
    const totalViews = analyticsData?.totalAnalytics?.totalViews || 0;
    const totalDownloads = analyticsData?.totalAnalytics?.totalDownloads || 0;
    const files = shareLinksData?.analytics || [];
    const totalLinks = files.length;

    // Fetch user data to check if user has a plan
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(token),
        { enabled: !!token, retry: false }
    );


    return (
        <motion.div
            className="earning-container min-h-screen bg-indigo-50"
            style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}
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
                <h1>{t('earning.analyticsDashboard')}</h1>
                <p>{t('earning.trackPerformance')}</p>
            </motion.div>

            <div className="earning-container__wrapper">
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
                        <StatCard
                            label={t('earning.totalViews')}
                            value={totalViews}
                            icon={<FaEye />}
                            color="#6366f1"
                            index={0}
                            onClick={() => setSelectedStat('views')}
                        />
                        <StatCard
                            label={t('earning.totalDownloads')}
                            value={totalDownloads}
                            icon={<FaDownload />}
                            color="#6366f1"
                            index={1}
                            onClick={() => setSelectedStat('downloads')}
                        />
                        <StatCard
                            label={t('earning.totalLinks')}
                            value={totalLinks}
                            icon={<FaLink />}
                            color="#6366f1"
                            index={2}
                            onClick={() => setSelectedStat('links')}
                        />
                        <StatCard
                            label={t('earning.totalEarnings')}
                            value={`${totalEarnings} ${currency}`}
                            icon={<FaMoneyBillWave />}
                            color="#4f46e5"
                            index={3}
                            onClick={() => setSelectedStat('totalEarnings')}
                        />
                    </motion.div>
                )}

                {/* Shared Links Table */}
                <SharedLinksTable
                    files={files}
                    isLoading={isLoading}
                    t={t}
                />

            </div>

            {/* Stat Detail Modal */}
            <AnimatePresence mode="wait">
                {selectedStat && (
                    <StatDetailModal
                        statType={selectedStat}
                        isOpen={!!selectedStat}
                        onClose={() => setSelectedStat(null)}
                        data={{
                            withdrawable,
                            estimatedIncome,
                            actualIncome,
                            currency,
                            totalViews,
                            totalDownloads,
                            totalLinks
                        }}
                        t={t}
                    />
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
        </motion.div>
    );
}
