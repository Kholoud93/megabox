import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useLanguage } from '../../context/LanguageContext';
import { usePageSEO } from '../../hooks/usePageSEO';
import PartnerCTA from '../../components/PartnerCta/PartnerCta';
import api from '../../services/api';
import { FaShareAlt, FaUsers, FaDollarSign, FaChartLine, FaDownload, FaEye, FaUserPlus, FaCheckCircle, FaCloud, FaServer, FaCode, FaShieldAlt } from 'react-icons/fa';
import './PromotersPage.scss';

export default function PromotersPage() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [userData, setUserData] = useState(null);

    // SEO with custom hook
    const title = language === 'ar' 
        ? 'برنامج المروجين – اربح من مشاركة المنصة' 
        : 'Promoters Program – Earn by Sharing';
    const description = language === 'ar'
        ? 'انضم إلى برنامج المروجين واكسب من كل تسجيل ومشاهدة وتحميل. سجّل مجاناً وابدأ الربح اليوم.'
        : 'Join our promoters program and earn from every signup, view, and download. Register for free and start earning today.';
    const ogImage = language === 'ar' 
        ? '/images/og/promoters-ar.jpg' 
        : '/images/og/promoters-en.jpg';

    usePageSEO({ title, description, image: ogImage });

    // Fetch user data if logged in
    const fetchUserData = async () => {
        try {
            const response = await api.get('/user/Getloginuseraccount', {
                headers: {
                    Authorization: `Bearer ${cookies.MegaBox}`
                }
            });
            setUserData(response.data.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        if (cookies.MegaBox) {
            fetchUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cookies.MegaBox]);

    // Check if user is subscribed to any plan
    const isSubscribed = userData && (userData?.watchingplan || userData?.Downloadsplan);

    // Structured Data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description
    };

    // How It Works Steps
    const howItWorks = [
        {
            step: 1,
            title: t('promotersPage.howItWorks.step1.title'),
            desc: t('promotersPage.howItWorks.step1.desc'),
            icon: <FaShareAlt />
        },
        {
            step: 2,
            title: t('promotersPage.howItWorks.step2.title'),
            desc: t('promotersPage.howItWorks.step2.desc'),
            icon: <FaUsers />
        },
        {
            step: 3,
            title: t('promotersPage.howItWorks.step3.title'),
            desc: t('promotersPage.howItWorks.step3.desc'),
            icon: <FaDollarSign />
        }
    ];

    // Features
    const features = [
        {
            icon: <FaUserPlus />,
            title: t('promotersPage.features.freeSignup.title'),
            desc: t('promotersPage.features.freeSignup.desc')
        },
        {
            icon: <FaChartLine />,
            title: t('promotersPage.features.dashboard.title'),
            desc: t('promotersPage.features.dashboard.desc')
        },
        {
            icon: <FaEye />,
            title: t('promotersPage.features.trackViews.title'),
            desc: t('promotersPage.features.trackViews.desc')
        },
        {
            icon: <FaDownload />,
            title: t('promotersPage.features.trackDownloads.title'),
            desc: t('promotersPage.features.trackDownloads.desc')
        }
    ];

    // Rewards System
    const rewards = [
        {
            icon: <FaEye />,
            title: t('promotersPage.rewards.views.title'),
            desc: t('promotersPage.rewards.views.desc')
        },
        {
            icon: <FaDownload />,
            title: t('promotersPage.rewards.downloads.title'),
            desc: t('promotersPage.rewards.downloads.desc')
        },
        {
            icon: <FaUserPlus />,
            title: t('promotersPage.rewards.signups.title'),
            desc: t('promotersPage.rewards.signups.desc')
        }
    ];

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="promoters-page">
                {/* Hero Section */}
                <section className="promoters-hero">
                    <div className="promoters-hero__overlay"></div>
                    <div className="promoters-hero__container">
                        <motion.h1
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="promoters-hero__title"
                        >
                            {t('promotersPage.hero.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="promoters-hero__description"
                        >
                            {t('promotersPage.hero.description')}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                            className="promoters-hero__cta"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="promoters-hero__button"
                            >
                                {t('promotersPage.hero.cta')}
                            </motion.button>
                        </motion.div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="promoters-services">
                    <div className="promoters-services__container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="promoters-services__title"
                        >
                            {t('partners.services.title') || t('promotersPage.services.title')}
                        </motion.h2>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="promoters-services__grid"
                        >
                            {[
                                {
                                    icon: <FaCloud />,
                                    title: t('partners.services.videoUploads.title'),
                                    desc: t('partners.services.videoUploads.desc')
                                },
                                {
                                    icon: <FaServer />,
                                    title: t('partners.services.videoPlayer.title'),
                                    desc: t('partners.services.videoPlayer.desc')
                                },
                                {
                                    icon: <FaUsers />,
                                    title: t('partners.services.referrals.title'),
                                    desc: t('partners.services.referrals.desc')
                                },
                                {
                                    icon: <FaChartLine />,
                                    title: t('partners.services.viewEarnings.title'),
                                    desc: t('partners.services.viewEarnings.desc')
                                },
                                {
                                    icon: <FaCode />,
                                    title: t('partners.services.analytics.title'),
                                    desc: t('partners.services.analytics.desc')
                                },
                                {
                                    icon: <FaShieldAlt />,
                                    title: t('partners.services.protection.title'),
                                    desc: t('partners.services.protection.desc')
                                }
                            ].map((service, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    className="promoters-services__card"
                                >
                                    <div className="promoters-services__icon">{service.icon}</div>
                                    <h3 className="promoters-services__card-title">{service.title}</h3>
                                    <p className="promoters-services__card-desc">{service.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="promoters-how">
                    <div className="promoters-how__container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="promoters-how__title"
                        >
                            {t('promotersPage.howItWorks.title')}
                        </motion.h2>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="promoters-how__grid"
                        >
                            {howItWorks.map((item) => (
                                <motion.div
                                    key={item.step}
                                    variants={itemVariants}
                                    className="promoters-how__card"
                                >
                                    <div className="promoters-how__step-number">{item.step}</div>
                                    <div className="promoters-how__icon">{item.icon}</div>
                                    <h3 className="promoters-how__card-title">{item.title}</h3>
                                    <p className="promoters-how__card-desc">{item.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="promoters-features">
                    <div className="promoters-features__divider"></div>
                    <div className="promoters-features__container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="promoters-features__title"
                        >
                            {t('promotersPage.features.title')}
                        </motion.h2>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="promoters-features__grid"
                        >
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    className="promoters-features__card"
                                >
                                    <div className="promoters-features__icon">{feature.icon}</div>
                                    <h3 className="promoters-features__card-title">{feature.title}</h3>
                                    <p className="promoters-features__card-desc">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Rewards System Section */}
                <section className="promoters-rewards">
                    <div className="promoters-rewards__divider"></div>
                    <div className="promoters-rewards__container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="promoters-rewards__title"
                        >
                            {t('promotersPage.rewards.title')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                            className="promoters-rewards__subtitle"
                        >
                            {t('promotersPage.rewards.subtitle')}
                        </motion.p>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="promoters-rewards__grid"
                        >
                            {rewards.map((reward, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    className="promoters-rewards__card"
                                >
                                    <div className="promoters-rewards__icon">{reward.icon}</div>
                                    <h3 className="promoters-rewards__card-title">{reward.title}</h3>
                                    <p className="promoters-rewards__card-desc">{reward.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="promoters-cta">
                    <div className="promoters-cta__divider"></div>
                    <div className="promoters-cta__container">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="promoters-cta__content"
                        >
                            <h2 className="promoters-cta__title">
                                {isSubscribed ? t('partners.alreadySubscribed') : t('promotersPage.cta.title')}
                            </h2>
                            <p className="promoters-cta__description">
                                {isSubscribed 
                                    ? (userData?.watchingplan && userData?.Downloadsplan 
                                        ? t('partners.subscribedBothPlans') || 'أنت مشترك في كلا الخطتين'
                                        : userData?.watchingplan 
                                            ? t('partners.subscribedViewsPlan') || 'أنت مشترك في خطة المشاهدات'
                                            : t('partners.subscribedDownloadsPlan') || 'أنت مشترك في خطة التحميلات'
                                    )
                                    : t('promotersPage.cta.description')
                                }
                            </p>
                            {!isSubscribed ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowPlansModal(true)}
                                    className="promoters-cta__button"
                                >
                                    {t('promotersPage.cta.button')}
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/Promoter/Earnings')}
                                    className="promoters-cta__button"
                                >
                                    {t('partners.seeDashboard')}
                                </motion.button>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* Promoter Plans Modal */}
                {showPlansModal && (
                    <div className="promoter-plans-modal__overlay" onClick={() => setShowPlansModal(false)}>
                        <div className="promoter-plans-modal__content" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="promoter-plans-modal__close"
                                onClick={() => setShowPlansModal(false)}
                            >
                                ×
                            </button>
                            <PartnerCTA isModal={true} onClose={() => setShowPlansModal(false)} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

