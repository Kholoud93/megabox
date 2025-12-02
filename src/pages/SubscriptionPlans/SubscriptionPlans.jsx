import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useLanguage } from '../../context/LanguageContext';
import { FaCrown, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import './SubscriptionPlans.scss';

export default function SubscriptionPlans() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        days: '',
        price: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        }
    );

    const plans = plansData?.plans || [];

    // Handle create plan
    const handleCreatePlan = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.days || !formData.price) {
            toast.error(t('subscriptionPlans.fillAllFields') || "Please fill all required fields", ToastOptions("error"));
            return;
        }

        setIsSubmitting(true);
        try {
            await adminService.createPlan(
                parseInt(formData.days),
                parseFloat(formData.price),
                formData.name,
                token
            );
            setShowCreateModal(false);
            setFormData({ name: '', days: '', price: '' });
            queryClient.invalidateQueries('plans');
        } catch (error) {
            // Error is handled by service
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit plan
    const handleEditPlan = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.days || !formData.price) {
            toast.error(t('subscriptionPlans.fillAllFields') || "Please fill all required fields", ToastOptions("error"));
            return;
        }

        setIsSubmitting(true);
        try {
            await adminService.updatePlan(
                selectedPlan._id || selectedPlan.id,
                parseInt(formData.days),
                parseFloat(formData.price),
                formData.name,
                token
            );
            setShowEditModal(false);
            setSelectedPlan(null);
            setFormData({ name: '', days: '', price: '' });
            queryClient.invalidateQueries('plans');
        } catch (error) {
            // Error is handled by service
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete plan
    const handleDeletePlan = async (planId) => {
        if (!window.confirm(t('subscriptionPlans.confirmDelete') || "Are you sure you want to delete this plan?")) {
            return;
        }

        try {
            await adminService.deletePlan(planId, token);
            queryClient.invalidateQueries('plans');
        } catch (error) {
            // Error is handled by service
        }
    };

    // Open edit modal
    const openEditModal = (plan) => {
        setSelectedPlan(plan);
        setFormData({
            name: plan.name || '',
            days: plan.days?.toString() || '',
            price: plan.price?.toString() || ''
        });
        setShowEditModal(true);
    };

    return (
        <div className="subscription-plans-page">
            <div className="subscription-plans-page__wrapper">
                <div className="subscription-plans-header">
                    <div className="subscription-plans-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="subscription-plans-header__back"
                            title={t('subscriptionPlans.backToDashboard') || "Back to Dashboard"}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaCrown className="subscription-plans-header__icon" />
                        <div>
                            <h1 className="subscription-plans-header__title">
                                {t('subscriptionPlans.title') || "Subscription Plans"}
                            </h1>
                            <p className="subscription-plans-header__subtitle">
                                {t('subscriptionPlans.subtitle') || "Manage subscription plans"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ name: '', days: '', price: '' });
                            setShowCreateModal(true);
                        }}
                        className="subscription-plans-header__create-btn"
                        title={t('subscriptionPlans.createPlan') || "Create Plan"}
                    >
                        <FaPlus size={16} />
                        {t('subscriptionPlans.createPlan') || "Create Plan"}
                    </button>
                </div>

                {plansLoading ? (
                    <div className="subscription-plans-loading">
                        <p>{t('subscriptionPlans.loading') || "Loading plans..."}</p>
                    </div>
                ) : plans.length > 0 ? (
                    <div className="subscription-plans-grid">
                        {plans.map((plan) => (
                            <div key={plan._id || plan.id} className="subscription-plan-card">
                                <div className="subscription-plan-card__header">
                                    <FaCrown className="subscription-plan-card__icon" />
                                    <h3 className="subscription-plan-card__name">{plan.name}</h3>
                                </div>
                                <div className="subscription-plan-card__body">
                                    <div className="subscription-plan-card__detail">
                                        <span className="subscription-plan-card__label">
                                            {t('subscriptionPlans.duration') || "Duration"}:
                                        </span>
                                        <span className="subscription-plan-card__value">
                                            {plan.days} {t('subscriptionPlans.days') || "days"}
                                        </span>
                                    </div>
                                    <div className="subscription-plan-card__detail">
                                        <span className="subscription-plan-card__label">
                                            {t('subscriptionPlans.price') || "Price"}:
                                        </span>
                                        <span className="subscription-plan-card__value">
                                            {plan.price} {plan.currency || 'USD'}
                                        </span>
                                    </div>
                                </div>
                                <div className="subscription-plan-card__actions">
                                    <button
                                        onClick={() => openEditModal(plan)}
                                        className="subscription-plan-card__btn subscription-plan-card__btn--edit"
                                        title={t('subscriptionPlans.edit') || "Edit Plan"}
                                    >
                                        <FaEdit size={16} />
                                        {t('subscriptionPlans.edit') || "Edit"}
                                    </button>
                                    <button
                                        onClick={() => handleDeletePlan(plan._id || plan.id)}
                                        className="subscription-plan-card__btn subscription-plan-card__btn--delete"
                                        title={t('subscriptionPlans.delete') || "Delete Plan"}
                                    >
                                        <FaTrash size={16} />
                                        {t('subscriptionPlans.delete') || "Delete"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="subscription-plans-empty">
                        <p>{t('subscriptionPlans.noPlans') || "No subscription plans found. Create your first plan!"}</p>
                    </div>
                )}
            </div>

            {/* Create Plan Modal */}
            {showCreateModal && (
                <div
                    className="subscription-plan-modal-backdrop"
                    onClick={() => !isSubmitting && setShowCreateModal(false)}
                >
                    <div
                        className="subscription-plan-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="subscription-plan-modal__header">
                            <h2>{t('subscriptionPlans.createPlan') || "Create Plan"}</h2>
                            <button
                                onClick={() => !isSubmitting && setShowCreateModal(false)}
                                className="subscription-plan-modal__close"
                                aria-label="Close"
                                disabled={isSubmitting}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlan} className="subscription-plan-modal__body">
                            <div className="form-group">
                                <label htmlFor="planName">
                                    {t('subscriptionPlans.planName') || "Plan Name"} *
                                </label>
                                <input
                                    id="planName"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                    placeholder={t('subscriptionPlans.planNamePlaceholder') || "e.g., Premium, Basic"}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="planDays">
                                    {t('subscriptionPlans.durationDays') || "Duration (Days)"} *
                                </label>
                                <input
                                    id="planDays"
                                    type="number"
                                    min="1"
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                    placeholder="30"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="planPrice">
                                    {t('subscriptionPlans.price') || "Price"} *
                                </label>
                                <input
                                    id="planPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                    placeholder="29.99"
                                />
                            </div>

                            <div className="subscription-plan-modal__actions">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={isSubmitting}
                                    className="btn btn-secondary"
                                >
                                    {t('subscriptionPlans.cancel') || "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary"
                                >
                                    {isSubmitting ? (t('subscriptionPlans.creating') || "Creating...") : (t('subscriptionPlans.create') || "Create")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Plan Modal */}
            {showEditModal && selectedPlan && (
                <div
                    className="subscription-plan-modal-backdrop"
                    onClick={() => !isSubmitting && setShowEditModal(false)}
                >
                    <div
                        className="subscription-plan-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="subscription-plan-modal__header">
                            <h2>{t('subscriptionPlans.editPlan') || "Edit Plan"}</h2>
                            <button
                                onClick={() => !isSubmitting && setShowEditModal(false)}
                                className="subscription-plan-modal__close"
                                aria-label="Close"
                                disabled={isSubmitting}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleEditPlan} className="subscription-plan-modal__body">
                            <div className="form-group">
                                <label htmlFor="editPlanName">
                                    {t('subscriptionPlans.planName') || "Plan Name"} *
                                </label>
                                <input
                                    id="editPlanName"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editPlanDays">
                                    {t('subscriptionPlans.durationDays') || "Duration (Days)"} *
                                </label>
                                <input
                                    id="editPlanDays"
                                    type="number"
                                    min="1"
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editPlanPrice">
                                    {t('subscriptionPlans.price') || "Price"} *
                                </label>
                                <input
                                    id="editPlanPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="subscription-plan-modal__actions">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={isSubmitting}
                                    className="btn btn-secondary"
                                >
                                    {t('subscriptionPlans.cancel') || "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary"
                                >
                                    {isSubmitting ? (t('subscriptionPlans.updating') || "Updating...") : (t('subscriptionPlans.update') || "Update")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
