import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from "react-icons/md";
import { useLanguage } from '../../context/LanguageContext';

const NotificationModal = ({
    isOpen,
    onClose,
    onSubmit,
    formik,
    title,
    submitButtonText,
    showUsername = false,
    username = ''
}) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="admin-notification-modal-backdrop" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="admin-notification-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="admin-notification-modal__header">
                        <h3 className="admin-notification-modal__title">
                            {title}
                            {showUsername && username && (
                                <span className="admin-notification-modal__username"> {username}</span>
                            )}
                        </h3>
                        <button
                            onClick={onClose}
                            className="admin-notification-modal__close"
                        >
                            <MdClose size={24} />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="admin-notification-modal__form">
                        <div className="admin-notification-modal__field">
                            <label htmlFor="notification-title" className="admin-notification-modal__label">
                                {t("adminUsers.titleLabel")}
                            </label>
                            <input
                                type="text"
                                id="notification-title"
                                name="title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="admin-notification-modal__input"
                                placeholder={t("adminUsers.titlePlaceholder")}
                            />
                            {formik.touched.title && formik.errors.title && (
                                <p className="admin-notification-modal__error">{formik.errors.title}</p>
                            )}
                        </div>

                        <div className="admin-notification-modal__field">
                            <label htmlFor="notification-body" className="admin-notification-modal__label">
                                {t("adminUsers.messageLabel")}
                            </label>
                            <textarea
                                id="notification-body"
                                name="body"
                                rows={4}
                                value={formik.values.body}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="admin-notification-modal__textarea"
                                placeholder={t("adminUsers.messagePlaceholder")}
                            />
                            {formik.touched.body && formik.errors.body && (
                                <p className="admin-notification-modal__error">{formik.errors.body}</p>
                            )}
                        </div>

                        <div className="admin-notification-modal__actions">
                            <button
                                type="button"
                                onClick={onClose}
                                className="admin-notification-modal__btn admin-notification-modal__btn--cancel"
                            >
                                {t("adminUsers.cancel")}
                            </button>
                            <button
                                type="submit"
                                className="admin-notification-modal__btn admin-notification-modal__btn--submit"
                            >
                                {submitButtonText}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NotificationModal;

