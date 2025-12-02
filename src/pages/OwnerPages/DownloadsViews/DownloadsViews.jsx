import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import Pagination from '../../../components/Pagination/Pagination';
import { FaDownload, FaEye, FaEye as FaEyeIcon } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import { format } from 'date-fns';
import './DownloadsViews.scss';

export default function DownloadsViews() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch all downloads and views data
    const { data: downloadsViewsData, isLoading: downloadsViewsLoading } = useQuery(
        ['allDownloadsViews'],
        async () => {
            try {
                const response = await adminService.getAllDownloadsViews(token);
                // Handle different response structures
                if (response.downloadsViews) return response;
                if (Array.isArray(response)) return { downloadsViews: response };
                if (response.data) return { downloadsViews: response.data };
                return { downloadsViews: [] };
            } catch {
                // Return empty array on error
                return { downloadsViews: [] };
            }
        },
        { 
            enabled: !!token
        }
    );

    // Filter downloads and views based on search and filters
    const filteredDownloadsViews = useMemo(() => {
        if (!downloadsViewsData?.downloadsViews) return [];

        return downloadsViewsData.downloadsViews.filter((item) => {
            // Search filter
            if (searchTerm) {
                const userInfo = typeof item.userId === 'object' && item.userId !== null
                    ? `${item.userId.username || ''} ${item.userId.email || ''} ${item.userId._id || ''}`
                    : `${item.userId || ''} ${item.username || ''}`;

                const searchLower = searchTerm.toLowerCase();
                if (!userInfo.toLowerCase().includes(searchLower) &&
                    !(item.fileName || '').toLowerCase().includes(searchLower) &&
                    !(item.downloads || 0).toString().includes(searchLower) &&
                    !(item.views || 0).toString().includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });
    }, [downloadsViewsData?.downloadsViews, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredDownloadsViews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDownloadsViews = filteredDownloadsViews.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    return (
        <div className="admin-downloads-views-page">
            <div className="admin-downloads-views-page__wrapper">
                <div className="admin-downloads-views-header">
                    <div className="admin-downloads-views-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-downloads-views-header__back"
                            title={t('adminDownloadsViews.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <div className="admin-downloads-views-header__icons">
                            <FaDownload className="admin-downloads-views-header__icon" />
                            <FaEye className="admin-downloads-views-header__icon" />
                        </div>
                        <div>
                            <h1 className="admin-downloads-views-header__title">{t('adminDownloadsViews.title')}</h1>
                            <p className="admin-downloads-views-header__subtitle">{t('adminDownloadsViews.subtitle')}</p>
                        </div>
                    </div>
                </div>

                {downloadsViewsLoading ? (
                    <div className="admin-downloads-views-loading">
                        <p>{t('adminDownloadsViews.loading')}</p>
                    </div>
                ) : downloadsViewsData?.downloadsViews?.length > 0 ? (
                    <>
                        <SearchFilter
                            searchPlaceholder={t('adminDownloadsViews.searchDownloadsViews')}
                            filters={[]}
                            onSearchChange={setSearchTerm}
                            onFilterChange={setFilters}
                        />

                        <div className="admin-downloads-views-table-wrapper">
                            <table className="admin-users-table">
                                <thead className="admin-users-table__header">
                                    <tr>
                                        <th scope="col">{t('adminDownloadsViews.fileName')}</th>
                                        <th scope="col">{t('adminDownloadsViews.user')}</th>
                                        <th scope="col">{t('adminDownloadsViews.downloads')}</th>
                                        <th scope="col">{t('adminDownloadsViews.views')}</th>
                                        <th scope="col">{t('adminDownloadsViews.lastDownload')}</th>
                                        <th scope="col">{t('adminDownloadsViews.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDownloadsViews.length > 0 ? (
                                        paginatedDownloadsViews.map((item, index) => (
                                            <tr key={item._id || item.id || index}>
                                                <td data-label={t('adminDownloadsViews.fileName')}>
                                                    <span className="file-name-badge">
                                                        {item.fileName || '-'}
                                                    </span>
                                                </td>
                                                <td data-label={t('adminDownloadsViews.user')}>
                                                    {typeof item.userId === 'object' && item.userId !== null
                                                        ? (item.userId.username || item.userId.email || item.userId._id || '-')
                                                        : (item.userId || item.username || '-')
                                                    }
                                                </td>
                                                <td data-label={t('adminDownloadsViews.downloads')}>
                                                    <div className="downloads-views-count downloads">
                                                        <FaDownload size={16} />
                                                        <span>{item.downloads || 0}</span>
                                                    </div>
                                                </td>
                                                <td data-label={t('adminDownloadsViews.views')}>
                                                    <div className="downloads-views-count views">
                                                        <FaEyeIcon size={16} />
                                                        <span>{item.views || 0}</span>
                                                    </div>
                                                </td>
                                                <td data-label={t('adminDownloadsViews.lastDownload')}>
                                                    {item.lastDownload
                                                        ? (typeof item.lastDownload === 'string' || item.lastDownload instanceof Date
                                                            ? format(new Date(item.lastDownload), 'PPP')
                                                            : String(item.lastDownload))
                                                        : '-'}
                                                </td>
                                                <td data-label={t('adminDownloadsViews.actions')}>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="admin-downloads-views-actions__btn admin-downloads-views-actions__btn--view"
                                                            onClick={() => setSelectedItem(item)}
                                                            title={t('adminDownloadsViews.viewDetails')}
                                                        >
                                                            <FaEyeIcon size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                                {t('adminDownloadsViews.noDownloadsViewsFound')}
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
                            endIndex={Math.min(endIndex, filteredDownloadsViews.length)}
                            totalItems={filteredDownloadsViews.length}
                            itemsLabel={t('adminDownloadsViews.items')}
                        />
                    </>
                ) : (
                    <div className="admin-downloads-views-empty">
                        <p>{t('adminDownloadsViews.noDownloadsViews')}</p>
                    </div>
                )}
            </div>

            {/* Downloads & Views Details Modal */}
            {selectedItem && (
                <div
                    className="admin-downloads-views-modal-backdrop"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="admin-downloads-views-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-downloads-views-modal__header">
                            <h2>{t('adminDownloadsViews.details')}</h2>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="admin-downloads-views-modal__close"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-downloads-views-modal__body">
                            <div className="admin-downloads-views-modal__row">
                                <strong>{t('adminDownloadsViews.fileName')}:</strong>
                                <span>{selectedItem.fileName || '-'}</span>
                            </div>

                            <div className="admin-downloads-views-modal__row">
                                <strong>{t('adminDownloadsViews.user')}:</strong>
                                <span>
                                    {typeof selectedItem.userId === 'object' && selectedItem.userId !== null
                                        ? (selectedItem.userId.username || selectedItem.userId.email || selectedItem.userId._id || '-')
                                        : (selectedItem.userId || selectedItem.username || '-')
                                    }
                                </span>
                            </div>

                            <div className="admin-downloads-views-modal__row">
                                <strong>{t('adminDownloadsViews.downloads')}:</strong>
                                <span>{selectedItem.downloads || 0}</span>
                            </div>

                            <div className="admin-downloads-views-modal__row">
                                <strong>{t('adminDownloadsViews.views')}:</strong>
                                <span>{selectedItem.views || 0}</span>
                            </div>

                            <div className="admin-downloads-views-modal__row">
                                <strong>{t('adminDownloadsViews.lastDownload')}:</strong>
                                <span>
                                    {selectedItem.lastDownload
                                        ? (typeof selectedItem.lastDownload === 'string' || selectedItem.lastDownload instanceof Date
                                            ? format(new Date(selectedItem.lastDownload), 'PPPpp')
                                            : String(selectedItem.lastDownload))
                                        : '-'}
                                </span>
                            </div>

                            <div className="admin-downloads-views-modal__row">
                                <strong>{t('adminDownloadsViews.lastView')}:</strong>
                                <span>
                                    {selectedItem.lastView
                                        ? (typeof selectedItem.lastView === 'string' || selectedItem.lastView instanceof Date
                                            ? format(new Date(selectedItem.lastView), 'PPPpp')
                                            : String(selectedItem.lastView))
                                        : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
