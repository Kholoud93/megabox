import React, { useRef, useState, useMemo, useEffect } from 'react'
import "./Promoters.scss"
import { useQuery } from 'react-query';
import axios from 'axios';
import { motion, useInView } from 'framer-motion';
import { API_URL } from '../../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { TbDeviceAnalytics } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import { MdAttachMoney } from "react-icons/md";
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';

export default function Promoters() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const animationRef = useRef();
    const animationInView = useInView(animationRef, { once: true });
    const navigate = useNavigate()

    const AllPromoters = async () => {
        let Promoters = await axios.get(`${API_URL}/auth/getAllPromoters`);


        return Promoters?.data?.promoters;
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
                                                        onClick={() => { }}
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
                {totalPages > 1 && (
                    <div className="admin-users-pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="admin-users-pagination__btn admin-users-pagination__btn--prev"
                        >
                            {t("adminPromoters.prev")}
                        </button>
                        <div className="admin-users-pagination__info">
                            {t("adminPromoters.page")} {currentPage} {t("adminPromoters.of")} {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="admin-users-pagination__btn admin-users-pagination__btn--next"
                        >
                            {t("adminPromoters.next")}
                        </button>
                    </div>
                )}
            </motion.div>
            </div>
        </div>
    )
}