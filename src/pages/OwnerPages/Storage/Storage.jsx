import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import Pagination from '../../../components/Pagination/Pagination';
import { FaHdd, FaEye } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import { format } from 'date-fns';
import './Storage.scss';

export default function Storage() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [selectedStorage, setSelectedStorage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Helper function to format bytes
    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // Fetch all storage data
    const { data: storageData, isLoading: storageLoading } = useQuery(
        ['allStorage'],
        async () => {
            try {
                const response = await adminService.getAllStorage(token);
                // Handle different response structures
                if (response.storage) return response;
                if (Array.isArray(response)) return { storage: response };
                if (response.data) return { storage: response.data };
                return { storage: [] };
            } catch {
                // Return empty array on error
                return { storage: [] };
            }
        },
        { 
            enabled: !!token
        }
    );

    // Filter storage based on search and filters
    const filteredStorage = useMemo(() => {
        if (!storageData?.storage) return [];

        return storageData.storage.filter((item) => {
            // Search filter
            if (searchTerm) {
                const userInfo = typeof item.userId === 'object' && item.userId !== null
                    ? `${item.userId.username || ''} ${item.userId.email || ''} ${item.userId._id || ''}`
                    : `${item.userId || ''} ${item.username || ''}`;

                const searchLower = searchTerm.toLowerCase();
                if (!userInfo.toLowerCase().includes(searchLower) &&
                    !formatBytes(item.usedStorage || 0).toLowerCase().includes(searchLower) &&
                    !formatBytes(item.totalStorage || 0).toLowerCase().includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });
    }, [storageData?.storage, searchTerm, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredStorage.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStorage = filteredStorage.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Calculate percentage
    const calculatePercentage = (used, total) => {
        if (!total || total === 0) return 0;
        return Math.round((used / total) * 100);
    };

    return (
        <div className="admin-storage-page">
            <div className="admin-storage-page__wrapper">
                <div className="admin-storage-header">
                    <div className="admin-storage-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-storage-header__back"
                            title={t('adminStorage.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaHdd className="admin-storage-header__icon" />
                        <div>
                            <h1 className="admin-storage-header__title">{t('adminStorage.title')}</h1>
                            <p className="admin-storage-header__subtitle">{t('adminStorage.subtitle')}</p>
                        </div>
                    </div>
                </div>

                {storageLoading ? (
                    <div className="admin-storage-loading">
                        <p>{t('adminStorage.loading')}</p>
                    </div>
                ) : storageData?.storage?.length > 0 ? (
                    <>
                        <SearchFilter
                            searchPlaceholder={t('adminStorage.searchStorage')}
                            filters={[]}
                            onSearchChange={setSearchTerm}
                            onFilterChange={setFilters}
                        />

                        <div className="admin-storage-table-wrapper">
                            <table className="admin-users-table">
                                <thead className="admin-users-table__header">
                                    <tr>
                                        <th scope="col">{t('adminStorage.user')}</th>
                                        <th scope="col">{t('adminStorage.usedStorage')}</th>
                                        <th scope="col">{t('adminStorage.totalStorage')}</th>
                                        <th scope="col">{t('adminStorage.percentage')}</th>
                                        <th scope="col">{t('adminStorage.lastUpdated')}</th>
                                        <th scope="col">{t('adminStorage.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedStorage.length > 0 ? (
                                        paginatedStorage.map((item, index) => {
                                            const percentage = calculatePercentage(item.usedStorage || 0, item.totalStorage || 0);
                                            return (
                                                <tr key={item._id || item.id || index}>
                                                    <td data-label={t('adminStorage.user')}>
                                                        {typeof item.userId === 'object' && item.userId !== null
                                                            ? (item.userId.username || item.userId.email || item.userId._id || '-')
                                                            : (item.userId || item.username || '-')
                                                        }
                                                    </td>
                                                    <td data-label={t('adminStorage.usedStorage')}>
                                                        {formatBytes(item.usedStorage || 0)}
                                                    </td>
                                                    <td data-label={t('adminStorage.totalStorage')}>
                                                        {formatBytes(item.totalStorage || 0)}
                                                    </td>
                                                    <td data-label={t('adminStorage.percentage')}>
                                                        <div className="storage-percentage">
                                                            <div className="storage-percentage__bar">
                                                                <div 
                                                                    className="storage-percentage__fill"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="storage-percentage__text">{percentage}%</span>
                                                        </div>
                                                    </td>
                                                    <td data-label={t('adminStorage.lastUpdated')}>
                                                        {item.lastUpdated
                                                            ? (typeof item.lastUpdated === 'string' || item.lastUpdated instanceof Date
                                                                ? format(new Date(item.lastUpdated), 'PPP')
                                                                : String(item.lastUpdated))
                                                            : '-'}
                                                    </td>
                                                    <td data-label={t('adminStorage.actions')}>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="admin-storage-actions__btn admin-storage-actions__btn--view"
                                                                onClick={() => setSelectedStorage(item)}
                                                                title={t('adminStorage.viewDetails')}
                                                            >
                                                                <FaEye size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                                {t('adminStorage.noStorageFound')}
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
                            endIndex={Math.min(endIndex, filteredStorage.length)}
                            totalItems={filteredStorage.length}
                            itemsLabel={t('adminStorage.storage')}
                        />
                    </>
                ) : (
                    <div className="admin-storage-empty">
                        <p>{t('adminStorage.noStorage')}</p>
                    </div>
                )}
            </div>

            {/* Storage Details Modal */}
            {selectedStorage && (
                <div
                    className="admin-storage-modal-backdrop"
                    onClick={() => setSelectedStorage(null)}
                >
                    <div
                        className="admin-storage-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-storage-modal__header">
                            <h2>{t('adminStorage.storageDetails')}</h2>
                            <button
                                onClick={() => setSelectedStorage(null)}
                                className="admin-storage-modal__close"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-storage-modal__body">
                            <div className="admin-storage-modal__row">
                                <strong>{t('adminStorage.user')}:</strong>
                                <span>
                                    {typeof selectedStorage.userId === 'object' && selectedStorage.userId !== null
                                        ? (selectedStorage.userId.username || selectedStorage.userId.email || selectedStorage.userId._id || '-')
                                        : (selectedStorage.userId || selectedStorage.username || '-')
                                    }
                                </span>
                            </div>

                            <div className="admin-storage-modal__row">
                                <strong>{t('adminStorage.usedStorage')}:</strong>
                                <span>{formatBytes(selectedStorage.usedStorage || 0)}</span>
                            </div>

                            <div className="admin-storage-modal__row">
                                <strong>{t('adminStorage.totalStorage')}:</strong>
                                <span>{formatBytes(selectedStorage.totalStorage || 0)}</span>
                            </div>

                            <div className="admin-storage-modal__row">
                                <strong>{t('adminStorage.availableStorage')}:</strong>
                                <span>{formatBytes((selectedStorage.totalStorage || 0) - (selectedStorage.usedStorage || 0))}</span>
                            </div>

                            <div className="admin-storage-modal__row">
                                <strong>{t('adminStorage.percentage')}:</strong>
                                <span>{calculatePercentage(selectedStorage.usedStorage || 0, selectedStorage.totalStorage || 0)}%</span>
                            </div>

                            <div className="admin-storage-modal__row">
                                <strong>{t('adminStorage.lastUpdated')}:</strong>
                                <span>
                                    {selectedStorage.lastUpdated
                                        ? (typeof selectedStorage.lastUpdated === 'string' || selectedStorage.lastUpdated instanceof Date
                                            ? format(new Date(selectedStorage.lastUpdated), 'PPPpp')
                                            : String(selectedStorage.lastUpdated))
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
