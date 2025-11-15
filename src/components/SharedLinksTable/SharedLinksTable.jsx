import React from 'react';
import { motion } from 'framer-motion';
import { FaLink, FaEye, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import EmptyState from '../EmptyState/EmptyState';
import { useNavigate } from 'react-router-dom';
import './SharedLinksTable.scss';

export default function SharedLinksTable({ files, isLoading, t }) {
    const navigate = useNavigate();

    // Sort files by views (descending) and take top 10
    const topFiles = files
        ?.sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 10) || [];

    if (isLoading) {
        return (
            <div className="shared-links-table">
                <div className="shared-links-table__skeleton">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton-row">
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (topFiles.length === 0) {
        return (
            <div className="shared-links-table">
                <div className="shared-links-table__header">
                    <h3>{t('earning.sharedLinks')}</h3>
                    <p>{t('earning.top10Description')}</p>
                </div>
                <EmptyState
                    icon={FaLink}
                    title={t('earning.noDataTitle')}
                    message={t('earning.noDataMessage')}
                    buttonText={t('earning.toShare')}
                    buttonLink="/dashboard"
                />
            </div>
        );
    }

    return (
        <motion.div
            className="shared-links-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="shared-links-table__header">
                <h3>{t('earning.sharedLinks')}</h3>
                <p>{t('earning.top10Description')}</p>
            </div>

            <div className="shared-links-table__container">
                <table className="shared-links-table__table">
                    <thead>
                        <tr>
                            <th>{t('earning.creationTime')}</th>
                            <th>{t('earning.link')}</th>
                            <th>{t('earning.totalViews')}</th>
                            <th>{t('earning.totalDownloads')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topFiles.map((file, index) => (
                            <motion.tr
                                key={file.fileId || file._id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="shared-links-table__row"
                            >
                                <td>
                                    {file.createdAt || file.lastUpdated
                                        ? new Date(file.createdAt || file.lastUpdated).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td>
                                    <div className="link-cell">
                                        <FaLink className="link-icon" />
                                        <span className="link-text" title={file.shareLink || file.shareUrl}>
                                            {file.shareLink || file.shareUrl || '-'}
                                        </span>
                                        {(file.shareLink || file.shareUrl) && (
                                            <a
                                                href={file.shareLink || file.shareUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link-external"
                                            >
                                                <FaExternalLinkAlt />
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="stat-cell">
                                        <FaEye />
                                        <span>{file.views || 0}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="stat-cell">
                                        <FaDownload />
                                        <span>{file.downloads || 0}</span>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

