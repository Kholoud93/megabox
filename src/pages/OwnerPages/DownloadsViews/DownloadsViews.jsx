import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../services/api';
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

    // Mock data for downloads and views (will be replaced with API call later)
    const mockDownloadsViews = [
        {
            _id: '1',
            fileName: 'document.pdf',
            userId: { username: 'ahmed_mohamed', email: 'ahmed@example.com', _id: 'user1_id' },
            downloads: 45,
            views: 120,
            lastDownload: new Date('2024-01-20'),
            lastView: new Date('2024-01-20')
        },
        {
            _id: '2',
            fileName: 'image.jpg',
            userId: { username: 'sara_ali', email: 'sara@example.com', _id: 'user2_id' },
            downloads: 32,
            views: 89,
            lastDownload: new Date('2024-01-19'),
            lastView: new Date('2024-01-19')
        },
        {
            _id: '3',
            fileName: 'video.mp4',
            userId: { username: 'mohamed_hassan', email: 'mohamed@example.com', _id: 'user3_id' },
            downloads: 78,
            views: 250,
            lastDownload: new Date('2024-01-18'),
            lastView: new Date('2024-01-18')
        },
        {
            _id: '4',
            fileName: 'presentation.pptx',
            userId: { username: 'fatima_ibrahim', email: 'fatima@example.com', _id: 'user4_id' },
            downloads: 12,
            views: 56,
            lastDownload: new Date('2024-01-17'),
            lastView: new Date('2024-01-17')
        },
        {
            _id: '5',
            fileName: 'spreadsheet.xlsx',
            userId: { username: 'ali_khalid', email: 'ali@example.com', _id: 'user5_id' },
            downloads: 23,
            views: 67,
            lastDownload: new Date('2024-01-16'),
            lastView: new Date('2024-01-16')
        },
        {
            _id: '6',
            fileName: 'archive.zip',
            userId: { username: 'nour_ahmed', email: 'nour@example.com', _id: 'user6_id' },
            downloads: 15,
            views: 34,
            lastDownload: new Date('2024-01-15'),
            lastView: new Date('2024-01-15')
        },
        {
            _id: '7',
            fileName: 'audio.mp3',
            userId: { username: 'omar_said', email: 'omar@example.com', _id: 'user7_id' },
            downloads: 67,
            views: 180,
            lastDownload: new Date('2024-01-14'),
            lastView: new Date('2024-01-14')
        },
        {
            _id: '8',
            fileName: 'text.txt',
            userId: { username: 'layla_mahmoud', email: 'layla@example.com', _id: 'user8_id' },
            downloads: 8,
            views: 25,
            lastDownload: new Date('2024-01-13'),
            lastView: new Date('2024-01-13')
        },
        {
            _id: '9',
            fileName: 'code.js',
            userId: { username: 'youssef_karim', email: 'youssef@example.com', _id: 'user9_id' },
            downloads: 34,
            views: 95,
            lastDownload: new Date('2024-01-12'),
            lastView: new Date('2024-01-12')
        },
        {
            _id: '10',
            fileName: 'design.psd',
            userId: { username: 'mariam_fouad', email: 'mariam@example.com', _id: 'user10_id' },
            downloads: 19,
            views: 42,
            lastDownload: new Date('2024-01-11'),
            lastView: new Date('2024-01-11')
        },
        {
            _id: '11',
            fileName: 'database.sql',
            userId: { username: 'khaled_omar', email: 'khaled@example.com', _id: 'user11_id' },
            downloads: 5,
            views: 18,
            lastDownload: new Date('2024-01-10'),
            lastView: new Date('2024-01-10')
        },
        {
            _id: '12',
            fileName: 'ebook.pdf',
            userId: { username: 'dina_samir', email: 'dina@example.com', _id: 'user12_id' },
            downloads: 92,
            views: 320,
            lastDownload: new Date('2024-01-09'),
            lastView: new Date('2024-01-09')
        }
    ];

    // Fetch all downloads and views data
    const { data: downloadsViewsData, isLoading: downloadsViewsLoading } = useQuery(
        ['allDownloadsViews'],
        async () => {
            try {
                const response = await axios.get(`${API_URL}/auth/getAllDownloadsViews`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching downloads and views:', error);
                // Return mock data if API fails
                return { downloadsViews: mockDownloadsViews };
            }
        },
        { 
            enabled: !!token,
            // Use mock data for now until API is ready
            initialData: { downloadsViews: mockDownloadsViews }
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
    }, [downloadsViewsData?.downloadsViews, searchTerm, filters]);

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
