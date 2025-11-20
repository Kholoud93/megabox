import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiMail, FiAlertTriangle, FiShield, FiFileText } from "react-icons/fi";
import Footer from "../../components/Footer/Footer";
import { useLanguage } from "../../context/LanguageContext";
import './Contact.scss';

export default function Contact() {
    const { t, language } = useLanguage();

    return (
        <>
            <main className="Contact" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="contact-container">
                    <div className="contact-header">
                        <h1>{t('contact.title')}</h1>
                        <p>{t('contact.subtitle')}</p>
                    </div>

                    <div className="contact-content">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="contact-card"
                        >
                            <div className="contact-card__icon">
                                <FiMail />
                            </div>
                            <h2>{t('contact.emailTitle')}</h2>
                            <p>{t('contact.emailDesc')}</p>
                            <div className="contact-card__email">
                                <a href="mailto:support@megaboxapp.com">
                                    {t('contact.emailValue')}
                                </a>
                            </div>
                            <p className="contact-card__response">{t('contact.responseTime')}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="contact-other"
                        >
                            <h2>{t('contact.otherWays')}</h2>
                            <div className="contact-other__grid">
                                <Link to="/copyright-feedback" className="contact-other__item">
                                    <FiAlertTriangle className="contact-other__icon" />
                                    <div>
                                        <h3>{t('contact.reportIssue')}</h3>
                                        <p>{t('contact.reportDesc')}</p>
                                    </div>
                                </Link>

                                <Link to="/Privacy" className="contact-other__item">
                                    <FiShield className="contact-other__icon" />
                                    <div>
                                        <h3>{t('contact.privacyPolicy')}</h3>
                                        <p>{t('contact.privacyDesc')}</p>
                                    </div>
                                </Link>

                                <Link to="/Privacy-Removal" className="contact-other__item">
                                    <FiFileText className="contact-other__icon" />
                                    <div>
                                        <h3>{t('contact.removalPolicy')}</h3>
                                        <p>{t('contact.removalDesc')}</p>
                                    </div>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

