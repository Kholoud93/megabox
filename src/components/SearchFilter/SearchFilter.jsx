import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import './SearchFilter.scss';

/**
 * SearchFilter Component
 * A reusable search and filter component for admin pages
 * 
 * @param {Object} props
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {Array} props.filters - Array of filter configurations
 * @param {Function} props.onFilterChange - Callback when filters change (receives filter object)
 * @param {Function} props.onSearchChange - Callback when search changes (receives search string)
 * @param {string} props.className - Additional CSS classes
 */
export default function SearchFilter({
    searchPlaceholder,
    filters = [],
    onFilterChange,
    onSearchChange,
    className = ''
}) {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleFilterChange = (filterKey, value) => {
        const newFilters = {
            ...activeFilters,
            [filterKey]: value === 'all' ? null : value
        };

        // Remove filter if set to 'all' or empty
        if (value === 'all' || value === '') {
            delete newFilters[filterKey];
        }

        setActiveFilters(newFilters);
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        if (onSearchChange) {
            onSearchChange('');
        }
    };

    const clearAllFilters = () => {
        setActiveFilters({});
        if (onFilterChange) {
            onFilterChange({});
        }
    };

    const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchTerm.length > 0;

    return (
        <div className={`search-filter ${className}`}>
            <div className="search-filter__container">
                {/* Search Input with Filter Button */}
                <div className="search-filter__search">
                    <FiSearch className="search-filter__search-icon" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder={searchPlaceholder || t('searchFilter.searchPlaceholder')}
                        className="search-filter__input"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="search-filter__clear"
                            title={t('searchFilter.clearSearch')}
                        >
                            <FiX />
                        </button>
                    )}
                    {/* Filter Toggle Button inside search */}
                    {filters.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`search-filter__toggle-inline ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
                            title={t('searchFilter.toggleFilters')}
                        >
                            <FiFilter />
                            {hasActiveFilters && (
                                <span className="search-filter__badge">
                                    {Object.keys(activeFilters).length}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && filters.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="search-filter__panel"
                    >
                        <div className="search-filter__panel-content">
                            {filters.map((filter) => (
                                <div key={filter.key} className="search-filter__filter-group">
                                    <label className="search-filter__label">
                                        {filter.label}
                                    </label>
                                    <select
                                        value={activeFilters[filter.key] || 'all'}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="search-filter__select"
                                    >
                                        <option value="all">{filter.allLabel || t('searchFilter.all')}</option>
                                        {filter.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}

                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="search-filter__clear-all"
                                >
                                    {t('searchFilter.clearAll')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

