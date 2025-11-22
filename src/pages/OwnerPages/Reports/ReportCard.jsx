import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiUser, FiMail, FiMapPin, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import { MdDelete } from "react-icons/md";
import { useLanguage } from '../../../context/LanguageContext';
import { useCookies } from 'react-cookie';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { adminService } from '../../../services/api';

export default function CopyrightCard({ data }) {
    const { t } = useLanguage();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const queryClient = useQueryClient();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const {
        fileName,
        fileType,
        fileSize,
        url,
        createdAt,
        copyrightOwnerName,
        relationshipWithContent,
        email,
        phoneNumber,
        country,
        province,
        streetAddress,
        city,
        postalCode,
        signature,
        userId,
    } = data;

    const formattedDate = format(new Date(createdAt), 'PPPpp');

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await adminService.deleteComplaint(data._id || data.id, token);
            toast.success(t("adminReports.complaintDeletedSuccess") || "Complaint deleted successfully", ToastOptions("success"));
            queryClient.invalidateQueries("Get all compaints");
            setShowDeleteConfirm(false);
        } catch (error) {
            toast.error(error.response?.data?.message || t("adminReports.deleteComplaintFailed") || "Failed to delete complaint", ToastOptions("error"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <motion.div
                className="copyright-card relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="admin-reports-delete-btn"
                    title={t("adminReports.deleteComplaint")}
                    type="button"
                >
                    <MdDelete size={20} />
                </button>
            <div className="card-header">
                <FiFileText className="icon" />
                <div>
                    <h2>{fileName}</h2>
                    <span>{fileType} • {fileSize}MB</span>
                </div>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <strong>{t("adminReports.owner")}:</strong> {copyrightOwnerName}
                </div>
                <div className="info-row">
                    <strong>{t("adminReports.relationship")}:</strong> {relationshipWithContent}
                </div>
                <div className="info-row">
                    <strong>{t("adminReports.email")}:</strong> {email}
                </div>
                <div className="info-row">
                    <strong>{t("adminReports.phone")}:</strong> {phoneNumber}
                </div>
                <div className="info-row">
                    <strong>{t("adminReports.address")}:</strong> {streetAddress}, {city}, {province}, {country}, {postalCode}
                </div>
                <div className="info-row">
                    <strong>{t("adminReports.signature")}:</strong> {signature}
                </div>
                <div className="info-row">
                    <strong>{t("adminReports.submittedBy")}:</strong> {
                        typeof userId === 'object' && userId !== null
                            ? `${userId.username || userId.email || userId._id || t("adminReports.unknown")} (${userId.email || t("adminReports.noEmail")})`
                            : userId || t("adminReports.unknown")
                    }
                </div>
                <div className="info-row">
                    <strong>{t("adminReports.submittedOn")}:</strong> {formattedDate}
                </div>
            </div>

            <div className="card-footer">
                <a href={url} target="_blank" rel="noopener noreferrer" className="download-btn w-full flex justify-center items-center">
                    <FiDownload className="icon" /> {t("adminReports.downloadDocument")}
                </a>
            </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
            {showDeleteConfirm && (
                <motion.div
                    className="admin-delete-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !isDeleting && setShowDeleteConfirm(false)}
                >
                    <motion.div
                        className="admin-delete-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>{t("adminReports.deleteComplaint")}</h3>
                        <p>{t("adminReports.deleteComplaintConfirm")}</p>
                        <p className="admin-delete-modal__warning">{t("adminReports.deleteComplaintWarning")}</p>
                        <div className="admin-delete-modal__actions">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="admin-delete-modal__btn admin-delete-modal__btn--cancel"
                            >
                                {t("adminUsers.cancel")}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="admin-delete-modal__btn admin-delete-modal__btn--delete"
                            >
                                {isDeleting ? t("adminUsers.deleting") || "Deleting..." : t("adminUsers.delete")}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
}
