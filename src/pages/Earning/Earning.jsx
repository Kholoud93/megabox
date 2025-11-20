import React, { useState } from 'react';
import './Earning.scss';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaGlobe, FaTimes, FaEye, FaDownload, FaLink, FaMoneyBillWave, FaChartLine, FaDollarSign
} from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi2';
import { API_URL, userService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import SharedLinksTable from '../../components/SharedLinksTable/SharedLinksTable';

const EARNINGS_URL = `${API_URL}/auth/getUserEarnings`;
const ANALYTICS_URL = `${API_URL}/auth/getUserAnalytics`;
const SHARE_LINK_ANALYTICS_URL = `${API_URL}/auth/getShareLinkAnalytics`;

// Mock data for UI display
const MOCK_EARNINGS_DATA = {
    totalEarnings: '2,450.75',
    withdrawable: '2,100.50',
    estimatedIncome: '350.25',
    actualIncome: '2,100.50',
    pendingRewards: '350.25',
    confirmedRewards: '2,100.50',
    currency: 'USD'
};

const MOCK_ANALYTICS_DATA = {
    totalAnalytics: {
        totalViews: 15420,
        totalDownloads: 8230
    }
};

const MOCK_SHARE_LINKS_DATA = {
    analytics: [
        {
            fileName: 'document.pdf',
            views: 1250,
            downloads: 680,
            sharedUrl: 'https://example.com/share/abc123',
            lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            viewsByCountry: [
                { country: 'United States', views: 450 },
                { country: 'United Kingdom', views: 320 },
                { country: 'Canada', views: 280 },
                { country: 'Australia', views: 200 }
            ]
        },
        {
            fileName: 'presentation.pptx',
            views: 980,
            downloads: 520,
            sharedUrl: 'https://example.com/share/def456',
            lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            viewsByCountry: [
                { country: 'Germany', views: 280 },
                { country: 'France', views: 250 },
                { country: 'Spain', views: 200 },
                { country: 'Italy', views: 150 },
                { country: 'Netherlands', views: 100 }
            ]
        },
        {
            fileName: 'video.mp4',
            views: 2150,
            downloads: 1450,
            sharedUrl: 'https://example.com/share/ghi789',
            lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            viewsByCountry: [
                { country: 'India', views: 650 },
                { country: 'China', views: 520 },
                { country: 'Japan', views: 380 },
                { country: 'South Korea', views: 300 },
                { country: 'Singapore', views: 300 }
            ]
        },
        {
            fileName: 'image.jpg',
            views: 750,
            downloads: 420,
            sharedUrl: 'https://example.com/share/jkl012',
            lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            viewsByCountry: [
                { country: 'Brazil', views: 250 },
                { country: 'Mexico', views: 200 },
                { country: 'Argentina', views: 150 },
                { country: 'Chile', views: 150 }
            ]
        }
    ]
};

const USE_MOCK_DATA = true; // Set to false to use real API data

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
            if (USE_MOCK_DATA) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return MOCK_EARNINGS_DATA;
            }
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
            enabled: USE_MOCK_DATA || !!token,
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
            if (USE_MOCK_DATA) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return MOCK_ANALYTICS_DATA;
            }
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
            enabled: USE_MOCK_DATA || !!token,
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
            if (USE_MOCK_DATA) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                return MOCK_SHARE_LINKS_DATA;
            }
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
            enabled: USE_MOCK_DATA || !!token,
            retry: 2,
            onError: (error) => {
                console.error('Error fetching share link analytics:', error);
            }
        }
    );

    const isLoading = earningsLoading || analyticsLoading || shareLinksLoading;

    // Remove placeholder values - only show labels
    const currency = earningsData?.currency || MOCK_EARNINGS_DATA.currency || 'USD';
    const amount = earningsData?.actualIncome || earningsData?.confirmedRewards || ''; // No placeholder
    const review = earningsData?.estimatedIncome || earningsData?.pendingRewards || ''; // No placeholder
    const withdrawn = earningsData?.withdrawn || ''; // No placeholder

    // Fetch user data to check if user has a plan
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(token),
        { enabled: !!token, retry: false }
    );

    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [whatsappTelegram, setWhatsappTelegram] = useState('');

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
            <div className="earning-container__wrapper">
                {/* Account Summary Cards */}
                <motion.div
                    className="withdraw-summary-cards"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <motion.div
                        className="withdraw-summary-card withdraw-summary-card--amount"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="withdraw-summary-card__icon">
                            <FaDollarSign />
                        </div>
                        <div className="withdraw-summary-card__content">
                            <div className="withdraw-summary-card__label">{t('withdrawSection.amount') || 'Amount'}</div>
                            <div className="withdraw-summary-card__value">
                                {amount ? `${amount} ${currency}` : '-'}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="withdraw-summary-card withdraw-summary-card--review"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="withdraw-summary-card__icon">
                            <FaDollarSign />
                        </div>
                        <div className="withdraw-summary-card__content">
                            <div className="withdraw-summary-card__label">{t('withdrawSection.review') || 'Review'}</div>
                            <div className="withdraw-summary-card__value">
                                {review ? `${review} ${currency}` : '-'}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="withdraw-summary-card withdraw-summary-card--withdrawn"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="withdraw-summary-card__icon">
                            <FaDollarSign />
                        </div>
                        <div className="withdraw-summary-card__content">
                            <div className="withdraw-summary-card__label">{t('withdrawSection.withdrawn') || 'Withdrawn'}</div>
                            <div className="withdraw-summary-card__value">
                                {withdrawn ? `${withdrawn} ${currency}` : '-'}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Apply Section */}
                <motion.div
                    className="withdraw-apply-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="withdraw-apply-section__header">
                        <h2 className="withdraw-apply-section__title">{t('withdrawSection.apply') || 'Apply'}</h2>
                        <a href="#" className="withdraw-apply-section__link">
                            {t('withdrawSection.record') || 'Record'} <HiArrowRight />
                        </a>
                    </div>

                    <div className="withdraw-apply-form">
                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.withdrawalAmount') || 'Withdrawal amount'}
                            </label>
                            <input
                                type="text"
                                className="withdraw-form-input"
                                placeholder={t('withdrawSection.withdrawalAmountPlaceholder') || 'Please enter the requested cash withdrawal amount'}
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                            />
                        </div>

                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.paymentMethod') || 'Payment method'}
                            </label>
                            <input
                                type="text"
                                className="withdraw-form-input"
                                placeholder={t('withdrawSection.paymentMethodPlaceholder') || 'Please enter the payment method'}
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                        </div>

                        <div className="withdraw-form-group">
                            <label className="withdraw-form-label">
                                * {t('withdrawSection.whatsappTelegram') || 'WhatsApp/Telegram accounts'}
                            </label>
                            <div className="withdraw-form-input-wrapper">
                                <input
                                    type="text"
                                    className="withdraw-form-input"
                                    placeholder={t('withdrawSection.whatsappTelegramPlaceholder') || 'Please enter the whatsapp/telegram accounts'}
                                    value={whatsappTelegram}
                                    onChange={(e) => setWhatsappTelegram(e.target.value)}
                                    maxLength={50}
                                />
                                <span className="withdraw-form-char-count">{whatsappTelegram.length}/50</span>
                            </div>
                        </div>

                        <button className="withdraw-submit-button">
                            {t('withdrawSection.withdraw') || 'Withdraw'}
                        </button>
                    </div>
                </motion.div>
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
