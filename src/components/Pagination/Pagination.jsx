import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Pagination.scss';

export default function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange,
    showCount = false,
    startIndex = 0,
    endIndex = 0,
    totalItems = 0,
    itemsLabel = 'items'
}) {
    const { t } = useLanguage();

    if (totalPages <= 1) return null;

    return (
        <>
            <div className="admin-pagination">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="admin-pagination__btn admin-pagination__btn--prev"
                >
                    {t("adminPagination.prev")}
                </button>
                <div className="admin-pagination__info">
                    {t("adminPagination.page")} {currentPage} {t("adminPagination.of")} {totalPages}
                </div>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="admin-pagination__btn admin-pagination__btn--next"
                >
                    {t("adminPagination.next")}
                </button>
            </div>

            {showCount && totalItems > 0 && (
                <p className="admin-pagination-count">
                    {startIndex + 1}-{endIndex} {t('adminPagination.of')} {totalItems} {itemsLabel}
                </p>
            )}
        </>
    );
}

