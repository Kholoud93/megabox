import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
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
                                <Link
                                    to="/terms-of-service"
                                    className="terms-modal__link"
                                    onClick={onClose}
                                >
                                    {t('termsModal.termsOfServiceLink')}
                                </Link>
                            </div>
                            <div className="terms-modal__link-item">
                                <span className="terms-modal__link-number">2.</span>
                                <Link
                                    to="/rewards-eligibility"
                                    className="terms-modal__link"
                                    onClick={onClose}
                                >
                                    {t('termsModal.rewardsRulesLink')}
                                </Link>
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

