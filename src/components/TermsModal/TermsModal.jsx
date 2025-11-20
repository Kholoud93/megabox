import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import './TermsModal.scss';

export default function TermsModal({ isOpen, onClose, onAccept }) {
    const { t, language } = useLanguage();
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleAccept = () => {
        if (termsAccepted) {
            localStorage.setItem('termsAccepted', 'true');
            onAccept();
            onClose();
        }
    };

    const openTermsOfService = () => {
        const termsWindow = window.open('', 'terms', 'width=900,height=700,scrollbars=yes');
        termsWindow.document.write(`
            <!DOCTYPE html>
            <html lang="${language}">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>${t('termsModal.termsOfServiceTitle')} — MegaBox</title>
                <style>
                    :root{--bg:#f7f8fb;--card:#ffffff;--muted:#6b7280;--accent:#0f62fe;--danger:#dc2626;--max:900px}
                    *{box-sizing:border-box}
                    body{font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:#111;padding:24px;display:flex;justify-content:center;direction:${language === 'ar' ? 'rtl' : 'ltr'}}
                    .container{max-width:var(--max);width:100%}
                    header{background:linear-gradient(90deg,#0f62fe22,#06b6d422);padding:28px;border-radius:12px;margin-bottom:20px}
                    header h1{margin:0;font-size:24px}
                    header p{margin:6px 0 0;color:var(--muted)}
                    .card{background:var(--card);padding:22px;border-radius:12px;box-shadow:0 6px 18px rgba(15,23,42,0.06);margin-bottom:14px}
                    h2{margin-top:0;font-size:18px}
                    p{line-height:1.6;color:#111}
                    ul{margin-left:18px}
                    code{background:#f3f4f6;padding:2px 6px;border-radius:6px;font-family:monospace}
                    footer{text-align:center;color:var(--muted);font-size:13px;margin-top:12px}
                    .meta{color:var(--muted);font-size:13px;margin-bottom:12px}
                    @media (max-width:520px){header h1{font-size:20px;padding-right:0}}
                </style>
            </head>
            <body>
                <div class="container">
                    <header>
                        <h1>${t('termsModal.termsOfServiceTitle')} — MegaBox</h1>
                        <p class="small">${t('termsModal.lastUpdated')}: January 2025</p>
                    </header>
                    <article class="card">
                        <p class="meta">${t('termsModal.welcomeText')}</p>
                        ${t('termsModal.termsContent')}
                    </article>
                </div>
            </body>
            </html>
        `);
        termsWindow.document.close();
    };

    const openRewardsRules = () => {
        const rulesWindow = window.open('', 'rewards', 'width=900,height=700,scrollbars=yes');
        rulesWindow.document.write(`
            <!DOCTYPE html>
            <html lang="${language}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width,initial-scale=1.0">
                <title>${t('termsModal.rewardsEligibilityTitle')}</title>
                <style>
                    body{font-family:Arial,sans-serif;line-height:1.6;background-color:#f9f9f9;color:#333;padding:20px;direction:${language === 'ar' ? 'rtl' : 'ltr'}}
                    h2{color:#2c3e50}
                    ul{list-style-type:disc;margin-left:20px}
                    li{margin-bottom:10px}
                    strong{color:#e74c3c}
                </style>
            </head>
            <body>
                <h2>${t('termsModal.rewardsEligibilityTitle')}</h2>
                <p>${t('termsModal.rewardsEligibilityDesc')}</p>
                <ul>
                    <li>${t('termsModal.rewardsRule1')}</li>
                    <li>${t('termsModal.rewardsRule2')}</li>
                    <li>${t('termsModal.rewardsRule3')}</li>
                    <li>${t('termsModal.rewardsRule4')}</li>
                </ul>
            </body>
            </html>
        `);
        rulesWindow.document.close();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="terms-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="terms-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                    <button
                        className="terms-modal__close"
                        onClick={onClose}
                    >
                        <FaTimes />
                    </button>
                    <div className="terms-modal__content">
                        <h2 className="terms-modal__title">{t('termsModal.title')}</h2>
                        <p className="terms-modal__description">
                            {t('termsModal.description')}
                        </p>
                        <div className="terms-modal__links">
                            <div className="terms-modal__link-item">
                                <span className="terms-modal__link-number">1.</span>
                                <button
                                    className="terms-modal__link"
                                    onClick={openTermsOfService}
                                >
                                    {t('termsModal.termsOfServiceLink')}
                                    <FaExternalLinkAlt className="terms-modal__link-icon" />
                                </button>
                            </div>
                            <div className="terms-modal__link-item">
                                <span className="terms-modal__link-number">2.</span>
                                <button
                                    className="terms-modal__link"
                                    onClick={openRewardsRules}
                                >
                                    {t('termsModal.rewardsRulesLink')}
                                    <FaExternalLinkAlt className="terms-modal__link-icon" />
                                </button>
                            </div>
                        </div>
                        <div className="terms-modal__checkbox">
                            <input
                                type="checkbox"
                                id="termsCheckbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                            />
                            <label htmlFor="termsCheckbox">
                                {t('termsModal.acceptTerms')}
                            </label>
                        </div>
                        <button
                            className="terms-modal__button"
                            onClick={handleAccept}
                            disabled={!termsAccepted}
                        >
                            {t('termsModal.understood')}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

