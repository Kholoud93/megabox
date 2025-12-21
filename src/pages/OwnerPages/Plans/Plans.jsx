import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import Pagination from '../../../components/Pagination/Pagination';

import { FaCrown, FaEye, FaPlus, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft, HiCurrencyDollar, HiClock } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import '../Subscriptions/Subscriptions.scss';

export default function Plans() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        days: '',
        price: ''
    });
    const [editFormData, setEditFormData] = useState({
        id: '',
        name: '',
        days: '',
        price: ''
    });
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    // Fetch all plans
    const { data: plansData, isLoading: plansLoading } = useQuery(
        ['plans'],
        async () => {
            try {
                const response = await adminService.getPlans();
                if (response.plans) return response;
                if (Array.isArray(response)) return { plans: response };
                if (response.data) return { plans: response.data };
                return { plans: [] };
            } catch (error) {
                console.error('Error fetching plans:', error);
                return { plans: [] };
            }
        },
        { 
            enabled: true
        }
    );

    // Handle create plan
    const handleCreatePlan = async (e) => {
        e.preventDefault();
        if (!createFormData.name || !createFormData.days || !createFormData.price) {
            toast.error(t('adminSubscriptions.fillAllFields') || "Please fill all required fields", ToastOptions("error"));
            return;
        }

        setIsCreating(true);
        try {
            await adminService.createPlan(
                parseInt(createFormData.days),
                parseFloat(createFormData.price),
                createFormData.name,
                token
            );
            setShowCreateModal(false);
            setCreateFormData({
                name: '',
                days: '',
                price: ''
            });
            queryClient.invalidateQueries('plans');
        } catch {
            // Error is handled by service
        } finally {
            setIsCreating(false);
        }
    };

    // Handle edit plan
    const handleEditPlan = async (e) => {
        e.preventDefault();
        if (!editFormData.name || !editFormData.days || !editFormData.price) {
            toast.error(t('adminSubscriptions.fillAllFields') || "Please fill all required fields", ToastOptions("error"));
            return;
        }

        setIsUpdating(true);
        try {
            await adminService.updatePlan(
                editFormData.id,
                parseInt(editFormData.days),
                parseFloat(editFormData.price),
                editFormData.name,
                token
            );
            setShowEditModal(false);
            setEditFormData({
                id: '',
                name: '',
                days: '',
                price: ''
            });
            queryClient.invalidateQueries('plans');
        } catch {
            // Error is handled by service
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle delete plan
    const handleDeletePlan = async () => {
        if (!showDeleteConfirm) return;
        
        setIsDeleting(true);
        try {
            await adminService.deletePlan(showDeleteConfirm._id || showDeleteConfirm.id, token);
            setShowDeleteConfirm(null);
            queryClient.invalidateQueries('plans');
        } catch {
            // Error is handled by service
        } finally {
            setIsDeleting(false);
        }
    };

    // Open edit modal
    const openEditModal = (plan) => {
        setEditFormData({
            id: plan._id || plan.id,
            name: plan.name || '',
            days: plan.days || '',
            price: plan.price || ''
        });
        setShowEditModal(true);
    };

    // Filter plans based on search and filters
    const filteredPlans = useMemo(() => {
        if (!plansData?.plans) return [];

        return plansData.plans.filter((plan) => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const nameStr = (plan.name || '').toLowerCase();
                const daysStr = (plan.days || '').toString().toLowerCase();
                const priceStr = (plan.price || '').toString().toLowerCase();
                
                if (!nameStr.includes(searchLower) &&
                    !daysStr.includes(searchLower) &&
                    !priceStr.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });
    }, [plansData?.plans, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    return (
        <div className="admin-subscriptions-page">
            <div className="admin-subscriptions-page__wrapper">
                <div className="admin-subscriptions-header">
                    <div className="admin-subscriptions-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-subscriptions-header__back"
                            title={t('adminSubscriptions.backToAnalytics')}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaCrown className="admin-subscriptions-header__icon" />
                        <div>
                            <h1 className="admin-subscriptions-header__title">{t('adminPlans.title') || 'Plans Management'}</h1>
                            <p className="admin-subscriptions-header__subtitle">{t('adminPlans.subtitle') || 'Manage subscription plans'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="admin-subscriptions-header__create-btn"
                        title={t('adminSubscriptions.createPlan')}
                    >
                        <FaPlus size={16} />
                        {t('adminSubscriptions.createPlan')}
                    </button>
                </div>

                {plansLoading ? (
                    <div className="admin-subscriptions-loading">
                        <p>{t('adminSubscriptions.loading')}</p>
                    </div>
                ) : plansData?.plans?.length > 0 ? (
                    <>
                        <SearchFilter
                            searchPlaceholder={t('adminSubscriptions.searchPlans')}
                            filters={[]}
                            onSearchChange={setSearchTerm}
                            onFilterChange={setFilters}
                        />

                        <div className="admin-subscriptions-plans">
                            {paginatedPlans.length > 0 ? (
                                paginatedPlans.map((plan, index) => (
                                    <motion.div
                                        key={plan._id || plan.id || index}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="admin-subscriptions-plan-card"
                                    >
                                        <div className="admin-subscriptions-plan-card__header">
                                            <h3 className="admin-subscriptions-plan-card__title">
                                                {plan.name || t('adminSubscriptions.planName') || 'Subscription Plan'}
                                            </h3>
                                            <div className="admin-subscriptions-plan-card__price">
                                                <HiCurrencyDollar className="admin-subscriptions-plan-card__price-icon" />
                                                <span className="admin-subscriptions-plan-card__amount">
                                                    {plan.price || '0'}
                                                </span>
                                                <span className="admin-subscriptions-plan-card__currency">
                                                    {plan.currency || 'USD'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="admin-subscriptions-plan-card__content">
                                            <ul className="admin-subscriptions-plan-card__features">
                                                <li className="admin-subscriptions-plan-card__feature">
                                                    <HiClock className="admin-subscriptions-plan-card__feature-icon" />
                                                    <span>
                                                        {plan.days || 30} {t('adminSubscriptions.days') || 'days'}
                                                    </span>
                                                </li>
                                            </ul>
                                            <div className="admin-subscriptions-plan-card__actions">
                                                <button
                                                    onClick={() => setSelectedPlan(plan)}
                                                    className="admin-subscriptions-plan-card__button admin-subscriptions-plan-card__button--view"
                                                    title={t('adminSubscriptions.viewDetails')}
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(plan)}
                                                    className="admin-subscriptions-plan-card__button admin-subscriptions-plan-card__button--edit"
                                                    title={t('adminSubscriptions.edit')}
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(plan)}
                                                    className="admin-subscriptions-plan-card__button admin-subscriptions-plan-card__button--delete"
                                                    title={t('adminSubscriptions.delete')}
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="admin-subscriptions-empty">
                                    <p>{t('adminSubscriptions.noPlansFound')}</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            showCount={true}
                            startIndex={startIndex}
                            endIndex={Math.min(endIndex, filteredPlans.length)}
                            totalItems={filteredPlans.length}
                            itemsLabel={t('adminSubscriptions.plans')}
                        />
                    </>
                ) : (
                    <div className="admin-subscriptions-empty">
                        <p>{t('adminSubscriptions.noPlans')}</p>
                    </div>
                )}
            </div>

            {/* Plan Details Modal */}
            {selectedPlan && (
                <div
                    className="admin-subscription-modal-backdrop"
                    onClick={() => setSelectedPlan(null)}
                >
                    <div
                        className="admin-subscription-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-subscription-modal__header">
                            <h2>{t('adminSubscriptions.planDetails')}</h2>
                            <button
                                onClick={() => setSelectedPlan(null)}
                                className="admin-subscription-modal__close"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-subscription-modal__body">
                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.planName')}:</strong>
                                <span className="subscription-plan-badge">
                                    {selectedPlan.name || '-'}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.durationDays')}:</strong>
                                <span>
                                    {selectedPlan.days || '-'} {t('adminSubscriptions.days')}
                                </span>
                            </div>

                            <div className="admin-subscription-modal__row">
                                <strong>{t('adminSubscriptions.price')}:</strong>
                                <span>
                                    {selectedPlan.price || '-'} {selectedPlan.currency || 'USD'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Plan Modal */}
            {showCreateModal && (
                <div
                    className="admin-subscription-modal-backdrop"
                    onClick={() => !isCreating && setShowCreateModal(false)}
                >
                    <div
                        className="admin-subscription-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-subscription-modal__header">
                            <h2>{t('adminSubscriptions.createPlan')}</h2>
                            <button
                                onClick={() => !isCreating && setShowCreateModal(false)}
                                className="admin-subscription-modal__close"
                                aria-label={t('adminSubscriptions.cancel')}
                                disabled={isCreating}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlan} className="admin-subscription-modal__body">
                            <div className="form-group">
                                <label htmlFor="planName">
                                    {t('adminSubscriptions.planName')}
                                </label>
                                <input
                                    id="planName"
                                    type="text"
                                    value={createFormData.name}
                                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                    required
                                    disabled={isCreating}
                                    placeholder={t('adminSubscriptions.planName')}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="days">
                                    {t('adminSubscriptions.durationDays')}
                                </label>
                                <input
                                    id="days"
                                    type="number"
                                    min="1"
                                    value={createFormData.days}
                                    onChange={(e) => setCreateFormData({ ...createFormData, days: e.target.value })}
                                    required
                                    disabled={isCreating}
                                    placeholder="30"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">
                                    {t('adminSubscriptions.price')}
                                </label>
                                <input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={createFormData.price}
                                    onChange={(e) => setCreateFormData({ ...createFormData, price: e.target.value })}
                                    required
                                    disabled={isCreating}
                                    placeholder="100.00"
                                />
                            </div>

                            <div className="admin-subscription-modal__actions">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={isCreating}
                                    className="btn btn-secondary"
                                >
                                    {t('adminSubscriptions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="btn btn-primary"
                                >
                                    {isCreating ? t('adminSubscriptions.creating') : t('adminSubscriptions.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Plan Modal */}
            {showEditModal && (
                <div
                    className="admin-subscription-modal-backdrop"
                    onClick={() => !isUpdating && setShowEditModal(false)}
                >
                    <div
                        className="admin-subscription-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-subscription-modal__header">
                            <h2>{t('adminSubscriptions.editPlan')}</h2>
                            <button
                                onClick={() => !isUpdating && setShowEditModal(false)}
                                className="admin-subscription-modal__close"
                                aria-label={t('adminSubscriptions.cancel')}
                                disabled={isUpdating}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleEditPlan} className="admin-subscription-modal__body">
                            <div className="form-group">
                                <label htmlFor="editPlanName">
                                    {t('adminSubscriptions.planName')}
                                </label>
                                <input
                                    id="editPlanName"
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    required
                                    disabled={isUpdating}
                                    placeholder={t('adminSubscriptions.planName')}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editDays">
                                    {t('adminSubscriptions.durationDays')}
                                </label>
                                <input
                                    id="editDays"
                                    type="number"
                                    min="1"
                                    value={editFormData.days}
                                    onChange={(e) => setEditFormData({ ...editFormData, days: e.target.value })}
                                    required
                                    disabled={isUpdating}
                                    placeholder="30"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editPrice">
                                    {t('adminSubscriptions.price')}
                                </label>
                                <input
                                    id="editPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editFormData.price}
                                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                                    required
                                    disabled={isUpdating}
                                    placeholder="100.00"
                                />
                            </div>

                            <div className="admin-subscription-modal__actions">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={isUpdating}
                                    className="btn btn-secondary"
                                >
                                    {t('adminSubscriptions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="btn btn-primary"
                                >
                                    {isUpdating ? t('adminSubscriptions.updating') : t('adminSubscriptions.update')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    className="admin-subscription-modal-backdrop"
                    onClick={() => !isDeleting && setShowDeleteConfirm(null)}
                >
                    <div
                        className="admin-subscription-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-subscription-modal__header">
                            <h2>{t('adminSubscriptions.deletePlan')}</h2>
                            <button
                                onClick={() => !isDeleting && setShowDeleteConfirm(null)}
                                className="admin-subscription-modal__close"
                                aria-label="Close"
                                disabled={isDeleting}
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-subscription-modal__body">
                            <p>{t('adminSubscriptions.deletePlanConfirm')} "{showDeleteConfirm.name}"?</p>
                            <p className="admin-subscription-modal__warning">{t('adminSubscriptions.deletePlanWarning')}</p>
                        </div>

                        <div className="admin-subscription-modal__actions">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={isDeleting}
                                className="btn btn-secondary"
                            >
                                {t('adminSubscriptions.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeletePlan}
                                disabled={isDeleting}
                                className="btn btn-danger"
                            >
                                {isDeleting ? t('adminSubscriptions.deleting') : t('adminSubscriptions.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
