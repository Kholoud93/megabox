import React from 'react';
import { motion } from 'framer-motion';
import { HiX } from "react-icons/hi";
import { HiComputerDesktop, HiCloud } from "react-icons/hi2";
import { PreventFunction } from '../../../helpers/Prevent';
import { useLanguage } from '../../../context/LanguageContext';
import './UploadOptions.scss';

export default function UploadOptions({ onClose, onSelectDesktop, onSelectMegaBox, isPromoter = false }) {
    const { t } = useLanguage();

    return (
        <motion.div 
            className='UploadOptions_backdrop' 
            onClick={onClose} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.3, ease: 'linear' }} 
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="UploadOptions_modal"
                onClick={PreventFunction} 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: 20, opacity: 0 }} 
                transition={{ duration: 0.4, type: 'spring' }}
            >
                <HiX 
                    className='UploadOptions_close' 
                    onClick={onClose}
                />

                <div className="UploadOptions_header">
                    <h2 className="UploadOptions_title">{t("uploadOptions.title")}</h2>
                    <p className="UploadOptions_subtitle">{t("uploadOptions.subtitle")}</p>
                </div>

                <div className="UploadOptions_options">
                    <button
                        className="UploadOptions_option"
                        onClick={() => {
                            onSelectDesktop();
                            onClose();
                        }}
                    >
                        <div className="UploadOptions_option_icon">
                            <HiComputerDesktop />
                        </div>
                        <div className="UploadOptions_option_content">
                            <h3 className="UploadOptions_option_title">{t("uploadOptions.fromDesktop")}</h3>
                            <p className="UploadOptions_option_desc">{t("uploadOptions.fromDesktopDesc")}</p>
                        </div>
                    </button>

                    {isPromoter && (
                        <button
                            className="UploadOptions_option"
                            onClick={() => {
                                onSelectMegaBox();
                                onClose();
                            }}
                        >
                            <div className="UploadOptions_option_icon">
                                <HiCloud />
                            </div>
                            <div className="UploadOptions_option_content">
                                <h3 className="UploadOptions_option_title">{t("uploadOptions.fromMegaBox")}</h3>
                                <p className="UploadOptions_option_desc">{t("uploadOptions.fromMegaBoxDesc")}</p>
                            </div>
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

