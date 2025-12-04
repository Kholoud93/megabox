import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { usePageSEO } from '../../hooks/usePageSEO';
import { partnersData } from '../../data/partners';
import { FaHandshake, FaChartLine, FaShieldAlt, FaUsers, FaCode, FaServer, FaCloud, FaStore, FaCheckCircle } from 'react-icons/fa';
import PartnerFormModal from '../PartnerFormModal/PartnerFormModal';
import partnerImage from '../../assets/Images/partners.png';
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




    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="partners-page">
                {/* Hero Section */}
                <section className={`partners-hero partners-hero--${language}`}>
                    <div className="partners-hero__overlay"></div>
                    <div className="partners-hero__container">
                        <div className="partners-hero__content">
                            <div className={`partners-hero__text partners-hero__text--${language}`}>
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
                            <div className={`partners-hero__image-wrapper partners-hero__image-wrapper--${language}`}>
                                <img 
                                    src={partnerImage} 
                                    alt="Partners" 
                                    className="partners-hero__image"
                                    loading="eager"
                                />
                            </div>
                        </div>
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
                        <div className={`partners-types__grid partners-types__grid--${language}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                                className="partners-types__card"
                            >
                                <div className="partners-types__card-title-wrapper">
                                    <FaCode className="partners-types__card-title-icon" />
                                    <h3 className="partners-types__card-title">{t('partnersPage.partnershipTypes.api.title')}</h3>
                                </div>
                                <p className="partners-types__card-price">{t('partnersPage.partnershipTypes.api.price') || 'API Integration'}</p>
                                <ul className="partners-types__features">
                                    {(() => {
                                        const features = t('partnersPage.partnershipTypes.api.features', { returnObjects: true });
                                        if (Array.isArray(features)) {
                                            return features.map((feature, idx) => (
                                                <li key={idx} className="partners-types__feature">
                                                    <FaCheckCircle className="partners-types__feature-icon" />
                                                    <span>{feature}</span>
                                                </li>
                                            ));
                                        }
                                        return (
                                            <li className="partners-types__feature">
                                                <FaCheckCircle className="partners-types__feature-icon" />
                                                <span>{t('partnersPage.partnershipTypes.api.desc')}</span>
                                            </li>
                                        );
                                    })()}
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                                className="partners-types__card"
                            >
                                <div className="partners-types__card-title-wrapper">
                                    <FaStore className="partners-types__card-title-icon" />
                                    <h3 className="partners-types__card-title">{t('partnersPage.partnershipTypes.whiteLabel.title')}</h3>
                                </div>
                                <p className="partners-types__card-price">{t('partnersPage.partnershipTypes.whiteLabel.price') || 'White Label Solution'}</p>
                                <ul className="partners-types__features">
                                    {(() => {
                                        const features = t('partnersPage.partnershipTypes.whiteLabel.features', { returnObjects: true });
                                        if (Array.isArray(features)) {
                                            return features.map((feature, idx) => (
                                                <li key={idx} className="partners-types__feature">
                                                    <FaCheckCircle className="partners-types__feature-icon" />
                                                    <span>{feature}</span>
                                                </li>
                                            ));
                                        }
                                        return (
                                            <li className="partners-types__feature">
                                                <FaCheckCircle className="partners-types__feature-icon" />
                                                <span>{t('partnersPage.partnershipTypes.whiteLabel.desc')}</span>
                                            </li>
                                        );
                                    })()}
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                                className="partners-types__card"
                            >
                                <div className="partners-types__card-title-wrapper">
                                    <FaCloud className="partners-types__card-title-icon" />
                                    <h3 className="partners-types__card-title">{t('partnersPage.partnershipTypes.contentHosting.title')}</h3>
                                </div>
                                <p className="partners-types__card-price">{t('partnersPage.partnershipTypes.contentHosting.price') || 'Content Hosting'}</p>
                                <ul className="partners-types__features">
                                    {(() => {
                                        const features = t('partnersPage.partnershipTypes.contentHosting.features', { returnObjects: true });
                                        if (Array.isArray(features)) {
                                            return features.map((feature, idx) => (
                                                <li key={idx} className="partners-types__feature">
                                                    <FaCheckCircle className="partners-types__feature-icon" />
                                                    <span>{feature}</span>
                                                </li>
                                            ));
                                        }
                                        return (
                                            <li className="partners-types__feature">
                                                <FaCheckCircle className="partners-types__feature-icon" />
                                                <span>{t('partnersPage.partnershipTypes.contentHosting.desc')}</span>
                                            </li>
                                        );
                                    })()}
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.4 }}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                                className="partners-types__card"
                            >
                                <div className="partners-types__card-title-wrapper">
                                    <FaUsers className="partners-types__card-title-icon" />
                                    <h3 className="partners-types__card-title">{t('partnersPage.partnershipTypes.reseller.title')}</h3>
                                </div>
                                <p className="partners-types__card-price">{t('partnersPage.partnershipTypes.reseller.price') || 'Reseller Program'}</p>
                                <ul className="partners-types__features">
                                    {(() => {
                                        const features = t('partnersPage.partnershipTypes.reseller.features', { returnObjects: true });
                                        if (Array.isArray(features)) {
                                            return features.map((feature, idx) => (
                                                <li key={idx} className="partners-types__feature">
                                                    <FaCheckCircle className="partners-types__feature-icon" />
                                                    <span>{feature}</span>
                                                </li>
                                            ));
                                        }
                                        return (
                                            <li className="partners-types__feature">
                                                <FaCheckCircle className="partners-types__feature-icon" />
                                                <span>{t('partnersPage.partnershipTypes.reseller.desc')}</span>
                                            </li>
                                        );
                                    })()}
                                </ul>
                            </motion.div>
                        </div>
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
                        <div className="partners-technical__grid">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                className="partners-technical__card partners-technical__card--purple"
                            >
                                <div className="partners-technical__icon-wrapper">
                                    <FaShieldAlt className="partners-technical__icon" />
                                </div>
                                <h3 className="partners-technical__card-title">{t('partnersPage.technicalFeatures.secureStorage.title')}</h3>
                                <p className="partners-technical__card-desc">{t('partnersPage.technicalFeatures.secureStorage.desc')}</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                className="partners-technical__card partners-technical__card--indigo"
                            >
                                <div className="partners-technical__icon-wrapper">
                                    <FaChartLine className="partners-technical__icon" />
                                </div>
                                <h3 className="partners-technical__card-title">{t('partnersPage.technicalFeatures.fastUpload.title')}</h3>
                                <p className="partners-technical__card-desc">{t('partnersPage.technicalFeatures.fastUpload.desc')}</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, type: "spring", delay: 0.3 }}
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                className="partners-technical__card partners-technical__card--blue"
                            >
                                <div className="partners-technical__icon-wrapper">
                                    <FaServer className="partners-technical__icon" />
                                </div>
                                <h3 className="partners-technical__card-title">{t('partnersPage.technicalFeatures.largeCapacity.title')}</h3>
                                <p className="partners-technical__card-desc">{t('partnersPage.technicalFeatures.largeCapacity.desc')}</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, type: "spring", delay: 0.4 }}
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                className="partners-technical__card partners-technical__card--green"
                            >
                                <div className="partners-technical__icon-wrapper">
                                    <FaHandshake className="partners-technical__icon" />
                                </div>
                                <h3 className="partners-technical__card-title">{t('partnersPage.technicalFeatures.technicalSupport.title')}</h3>
                                <p className="partners-technical__card-desc">{t('partnersPage.technicalFeatures.technicalSupport.desc')}</p>
                            </motion.div>
                        </div>
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
