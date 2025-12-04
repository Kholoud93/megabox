import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { usePageSEO } from '../../hooks/usePageSEO';
import { partnersData } from '../../data/partners';
import { FaHandshake, FaChartLine, FaShieldAlt, FaUsers, FaCode, FaServer, FaCloud, FaStore } from 'react-icons/fa';
import PartnerFormModal from '../PartnerFormModal/PartnerFormModal';
import './PartnersPage.scss';

export default function PartnersPage() {
    const { t, language } = useLanguage();
    const [showPartnerModal, setShowPartnerModal] = useState(false);

    // SEO with custom hook
    const title = language === 'ar' 
        ? 'شركاء Megabox – تعاون وثقة' 
        : 'Megabox Partners – Trust & Collaboration';
    const description = language === 'ar'
        ? 'نفتخر بالتعاون مع شركات عالمية تساعدنا في تقديم خدمة تخزين سحابي آمنة وسريعة.'
        : 'We are proud to collaborate with global companies that help us deliver secure and fast cloud storage services.';
    const ogImage = language === 'ar' 
        ? '/images/og/partners-ar.jpg' 
        : '/images/og/partners-en.jpg';

    usePageSEO({ title, description, image: ogImage });

    // Structured Data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Megabox",
        "partner": partnersData.map(partner => ({
            "@type": "Organization",
            "name": partner.name
        }))
    };

    // Animation Variants - Optimized
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

            <div className="partners-page">
                {/* Hero Section */}
                <section className="partners-hero">
                    <div className="partners-hero__overlay"></div>
                    <div className="partners-hero__container">
                        <motion.h1
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="partners-hero__title"
                        >
                            {t('partnersPage.hero.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="partners-hero__description"
                        >
                            {t('partnersPage.hero.description')}
                        </motion.p>
                    </div>
                </section>

                {/* Partnership Types Section */}
                <section className="partners-types">
                    <div className="partners-types__container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="partners-types__title"
                        >
                            {t('partnersPage.partnershipTypes.title')}
                        </motion.h2>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="partners-types__grid"
                        >
                            <motion.div variants={itemVariants} className="partners-types__card">
                                <FaCode className="partners-types__icon" />
                                <h3 className="partners-types__card-title">{t('partnersPage.partnershipTypes.api.title')}</h3>
                                <p className="partners-types__card-desc">{t('partnersPage.partnershipTypes.api.desc')}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="partners-types__card">
                                <FaServer className="partners-types__icon" />
                                <h3 className="partners-types__card-title">{t('partnersPage.partnershipTypes.whiteLabel.title')}</h3>
                                <p className="partners-types__card-desc">{t('partnersPage.partnershipTypes.whiteLabel.desc')}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="partners-types__card">
                                <FaCloud className="partners-types__icon" />
                                <h3 className="partners-types__card-title">{t('partnersPage.partnershipTypes.contentHosting.title')}</h3>
                                <p className="partners-types__card-desc">{t('partnersPage.partnershipTypes.contentHosting.desc')}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="partners-types__card">
                                <FaStore className="partners-types__icon" />
                                <h3 className="partners-types__card-title">{t('partnersPage.partnershipTypes.reseller.title')}</h3>
                                <p className="partners-types__card-desc">{t('partnersPage.partnershipTypes.reseller.desc')}</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Technical Features Section */}
                <section className="partners-technical">
                    <div className="partners-technical__container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="partners-technical__title"
                        >
                            {t('partnersPage.technicalFeatures.title')}
                        </motion.h2>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="partners-technical__grid"
                        >
                            <motion.div variants={itemVariants} className="partners-technical__card">
                                <FaShieldAlt className="partners-technical__icon" />
                                <h3 className="partners-technical__card-title">{t('partnersPage.technicalFeatures.secureStorage.title')}</h3>
                                <p className="partners-technical__card-desc">{t('partnersPage.technicalFeatures.secureStorage.desc')}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="partners-technical__card">
                                <FaChartLine className="partners-technical__icon" />
                                <h3 className="partners-technical__card-title">{t('partnersPage.technicalFeatures.fastUpload.title')}</h3>
                                <p className="partners-technical__card-desc">{t('partnersPage.technicalFeatures.fastUpload.desc')}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="partners-technical__card">
                                <FaServer className="partners-technical__icon" />
                                <h3 className="partners-technical__card-title">{t('partnersPage.technicalFeatures.largeCapacity.title')}</h3>
                                <p className="partners-technical__card-desc">{t('partnersPage.technicalFeatures.largeCapacity.desc')}</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="partners-technical__card">
                                <FaHandshake className="partners-technical__icon" />
                                <h3 className="partners-technical__card-title">{t('partnersPage.technicalFeatures.technicalSupport.title')}</h3>
                                <p className="partners-technical__card-desc">{t('partnersPage.technicalFeatures.technicalSupport.desc')}</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>


                {/* CTA Section (Simple) */}
                <section className="partners-cta">
                    <div className="partners-cta__divider"></div>
                    <div className="partners-cta__container">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="partners-cta__content"
                        >
                            <h2 className="partners-cta__title">{t('partnersPage.cta.title')}</h2>
                            <p className="partners-cta__description">{t('partnersPage.cta.description')}</p>
                            <div className="partners-cta__benefits">
                                <div className="partners-cta__benefit">
                                    <FaUsers className="partners-cta__benefit-icon" />
                                    <span>{t('partnersPage.cta.benefit1')}</span>
                                </div>
                                <div className="partners-cta__benefit">
                                    <FaChartLine className="partners-cta__benefit-icon" />
                                    <span>{t('partnersPage.cta.benefit2')}</span>
                                </div>
                                <div className="partners-cta__benefit">
                                    <FaHandshake className="partners-cta__benefit-icon" />
                                    <span>{t('partnersPage.cta.benefit3')}</span>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowPartnerModal(true)}
                                className="partners-cta__button"
                            >
                                {t('partnersPage.cta.button')}
                            </motion.button>
                        </motion.div>
                    </div>
                </section>

                {/* Partner Form Modal */}
                <PartnerFormModal
                    isOpen={showPartnerModal}
                    onClose={() => setShowPartnerModal(false)}
                />
            </div>
        </>
    );
}
