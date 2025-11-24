import React, { useRef, useState, useMemo, useEffect } from 'react'
import "./Promoters.scss"
import { useQuery, useQueryClient } from 'react-query';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { API_URL, adminService, promoterService } from '../../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { TbDeviceAnalytics } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import { MdAttachMoney } from "react-icons/md";
import { useLanguage } from '../../../context/LanguageContext';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import Pagination from '../../../components/Pagination/Pagination';

export default function Promoters() {
    const { t, language } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const queryClient = useQueryClient();

    const animationRef = useRef();
    const animationInView = useInView(animationRef, { once: true });
    const navigate = useNavigate()

    const AllPromoters = async () => {
        const response = await promoterService.getAllPromoters(token);
        return response?.data?.promoters || response?.promoters || response;
    }

    const { data: Promoters } = useQuery("getAllPromoters", AllPromoters, {
        cacheTime: 300000,
        onError: () => {
            navigate("/login")
        }
    })

    // Filter promoters based on search and filters
    const filteredPromoters = useMemo(() => {
        if (!Promoters) return [];

        return Promoters.filter((promoter) => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const searchableText = `${promoter.username || ''} ${promoter.email || ''}`.toLowerCase();
                if (!searchableText.includes(searchLower)) {
                    return false;
                }
            }

            // Watching plan filter
            if (filters.watchingPlan !== undefined) {
                const hasWatchingPlan = promoter.watchingplan === true || promoter.watchingplan === "true";
                if (filters.watchingPlan === 'subscribed' && !hasWatchingPlan) {
                    return false;
                }
                if (filters.watchingPlan === 'unsubscribed' && hasWatchingPlan) {
                    return false;
                }
            }

            // Downloads plan filter
            if (filters.downloadsPlan !== undefined) {
                const hasDownloadsPlan = promoter.Downloadsplan === true || promoter.Downloadsplan === "true";
                if (filters.downloadsPlan === 'subscribed' && !hasDownloadsPlan) {
                    return false;
                }
                if (filters.downloadsPlan === 'unsubscribed' && hasDownloadsPlan) {
                    return false;
                }
            }

            return true;
        });
    }, [Promoters, searchTerm, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredPromoters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPromoters = filteredPromoters.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Handle delete promoter
    const handleDeletePromoter = async () => {
        if (!deleteConfirm) return;
        
        setIsDeleting(true);
        try {
            await adminService.deletePromoter(deleteConfirm._id || deleteConfirm.id, token);
            toast.success(t("adminPromoters.promoterDeletedSuccess") || "Promoter deleted successfully", ToastOptions("success"));
            queryClient.invalidateQueries("getAllPromoters");
            setDeleteConfirm(null);
        } catch (error) {
            toast.error(error.response?.data?.message || t("adminPromoters.deletePromoterFailed") || "Failed to delete promoter", ToastOptions("error"));
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter configuration
    const filterConfig = [
        {
            key: 'watchingPlan',
            label: t('adminPromoters.watchingPlan'),
            allLabel: t('searchFilter.all'),
            options: [
                { value: 'subscribed', label: t('adminPromoters.subscribed') },
                { value: 'unsubscribed', label: t('adminPromoters.unsubscribed') }
            ]
        },
        {
            key: 'downloadsPlan',
            label: t('adminPromoters.downloadsPlan'),
            allLabel: t('searchFilter.all'),
            options: [
                { value: 'subscribed', label: t('adminPromoters.subscribed') },
                { value: 'unsubscribed', label: t('adminPromoters.unsubscribed') }
            ]
        }
    ];

    return (
        <div className="admin-promoters-page">
            <div className="admin-promoters-page__wrapper">
            <motion.div
                layout
                ref={animationRef}
                initial={{ opacity: 0 }}
                animate={animationInView && { opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='Promoters'
            >
                <div className="mb-4">
                    <SearchFilter
                        searchPlaceholder={t('adminPromoters.searchPromoters')}
                        filters={filterConfig}
                        onSearchChange={setSearchTerm}
                        onFilterChange={setFilters}
                    />
                    {Promoters && (
                        <p className="admin-users-count text-sm text-gray-600 mt-2">
                            {paginatedPromoters.length > 0 ? (
                                <>
                                    {startIndex + 1}-{Math.min(endIndex, filteredPromoters.length)} {t('adminPromoters.of')} {filteredPromoters.length} {t('adminPromoters.promoters')}
                                </>
                            ) : (
                                <>
                                    0 {t('adminPromoters.of')} {filteredPromoters.length} {t('adminPromoters.promoters')}
                                </>
                            )}
                        </p>
                    )}
                </div>

                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="admin-users-table">
                        <thead className="admin-users-table__header">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.username")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.email")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.watchingPlan")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.downloadsPlan")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPromoters.length > 0 ? (
                                paginatedPromoters.map((ele, index) => {
                                    return (
                                        <tr key={ele._id || ele.id || index}>
                                            <td data-label={t("adminPromoters.username")}>{ele.username}</td>
                                            <td data-label={t("adminPromoters.email")}>{ele.email}</td>

                                            <td data-label={t("adminPromoters.watchingPlan")}>
                                                {ele?.watchingplan ? (
                                                    <span className='text-green-700'>{t("adminPromoters.subscribed")}</span>
                                                ) : (
                                                    <span className='text-red-700'>{t("adminPromoters.unsubscribed")}</span>
                                                )}
                                            </td>

                                            <td data-label={t("adminPromoters.downloadsPlan")}>
                                                {ele?.Downloadsplan ? (
                                                    <span className='text-green-700'>{t("adminPromoters.subscribed")}</span>
                                                ) : (
                                                    <span className='text-red-700'>{t("adminPromoters.unsubscribed")}</span>
                                                )}
                                            </td>

                                            <td data-label={t("adminPromoters.actions")}>
                                                <div className="action-buttons">
                                                    <Link
                                                        title={t("adminPromoters.viewEarnings")}
                                                        to={`/Owner/Promoter/${ele?._id}`}
                                                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                    >
                                                        <MdAttachMoney size={20} />
                                                    </Link>
                                                    <button
                                                        title={t("adminPromoters.delete")}
                                                        onClick={() => setDeleteConfirm(ele)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        {t('adminPromoters.noPromotersFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    showCount={true}
                    startIndex={startIndex}
                    endIndex={Math.min(endIndex, filteredPromoters.length)}
                    totalItems={filteredPromoters.length}
                    itemsLabel={t('adminPromoters.promoters')}
                />
            </motion.div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        className="admin-delete-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isDeleting && setDeleteConfirm(null)}
                    >
                        <motion.div
                            className="admin-delete-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>{t("adminPromoters.deletePromoter")}</h3>
                            <p>{t("adminPromoters.deletePromoterConfirm") || `Are you sure you want to delete ${deleteConfirm.username || deleteConfirm.email}?`}</p>
                            <p className="admin-delete-modal__warning">{t("adminPromoters.deletePromoterWarning") || "This action cannot be undone."}</p>
                            <div className="admin-delete-modal__actions">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={isDeleting}
                                    className="admin-delete-modal__btn admin-delete-modal__btn--cancel"
                                >
                                    {t("adminUsers.cancel")}
                                </button>
                                <button
                                    onClick={handleDeletePromoter}
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
        </div>
    )
}