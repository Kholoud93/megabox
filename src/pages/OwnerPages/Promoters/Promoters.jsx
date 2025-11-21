import React, { useRef, useState, useMemo } from 'react'
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
                        <p className="text-sm text-gray-600 mt-2">
                            {filteredPromoters.length} {t('adminPromoters.of')} {Promoters.length} {t('adminPromoters.promoters')}
                        </p>
                    )}
                </div>

                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.username")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.email")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.watchingPlan")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.downloadsPlan")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminPromoters.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPromoters.length > 0 ? (
                                filteredPromoters.map((ele, index) => {
                                    return (
                                        <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">{ele.username}</td>
                                            <td className="px-6 py-4">{ele.email}</td>

                                            <td className="px-6 py-4">
                                                {ele?.watchingplan ? (
                                                    <span className='text-green-700'>{t("adminPromoters.subscribed")}</span>
                                                ) : (
                                                    <span className='text-red-700'>{t("adminPromoters.unsubscribed")}</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {ele?.Downloadsplan ? (
                                                    <span className='text-green-700'>{t("adminPromoters.subscribed")}</span>
                                                ) : (
                                                    <span className='text-red-700'>{t("adminPromoters.unsubscribed")}</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 svg-del">
                                                <div className="w-full flex gap-2">
                                                    <Link
                                                        title={t("adminPromoters.viewEarnings")}
                                                        to={`/Owner/Promoter/${ele?._id}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <MdAttachMoney className='Analysis' size={20} />
                                                    </Link>
                                                    <button
                                                        title={t("adminPromoters.delete")}
                                                        onClick={() => { }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <MdDelete className='text-red-600 hover:text-red-800' size={20} />
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
            </motion.div>
            </div>
        </div>
    )
}