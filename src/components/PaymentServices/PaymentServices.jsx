import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import { useLanguage } from '../../context/LanguageContext';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaCreditCard, FaPaypal, FaWallet, FaMobileAlt } from 'react-icons/fa';
import './PaymentServices.scss';

const PAYMENT_TYPES = [
    { value: 'PayPal', label: 'PayPal', icon: FaPaypal },
    { value: 'VodafoneCash', label: 'Vodafone Cash', icon: FaMobileAlt },
    { value: 'USDT_TRC20', label: 'USDT (TRC20)', icon: FaWallet },
    { value: 'Payoneer', label: 'Payoneer', icon: FaCreditCard },
    { value: 'Payeer', label: 'Payeer', icon: FaCreditCard },
    { value: 'WebMoney', label: 'WebMoney', icon: FaWallet }
];

export default function PaymentServices() {
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        paymentType: '',
        accountName: '',
        credentials: {},
        isActive: true,
        isDefault: false,
        note: ''
    });

    // Fetch payment services
    const { data: paymentServicesData, isLoading } = useQuery(
        ['paymentServices'],
        () => paymentService.getPaymentServices(token),
        {
            enabled: !!token,
            retry: 2
        }
    );

    const paymentServices = paymentServicesData?.paymentServices || paymentServicesData?.data || paymentServicesData || [];

    // Create payment service mutation
    const createMutation = useMutation(
        (data) => paymentService.createPaymentService(data, token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('paymentServices');
                setShowAddModal(false);
                resetForm();
            }
        }
    );

    // Update payment service mutation
    const updateMutation = useMutation(
        ({ id, data }) => paymentService.updatePaymentService(id, data, token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('paymentServices');
                setShowEditModal(false);
                setEditingService(null);
                resetForm();
            }
        }
    );

    // Delete payment service mutation
    const deleteMutation = useMutation(
        (id) => paymentService.deletePaymentService(id, token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('paymentServices');
            }
        }
    );

    const resetForm = () => {
        setFormData({
            paymentType: '',
            accountName: '',
            credentials: {},
            isActive: true,
            isDefault: false,
            note: ''
        });
    };

    const handleAddClick = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleEditClick = (service) => {
        setEditingService(service);
        setFormData({
            paymentType: service.paymentType || '',
            accountName: service.accountName || '',
            credentials: service.credentials || {},
            isActive: service.isActive !== undefined ? service.isActive : true,
            isDefault: service.isDefault !== undefined ? service.isDefault : false,
            note: service.note || ''
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm(t('paymentServices.confirmDelete') || 'Are you sure you want to delete this payment service?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const getCredentialsFields = (paymentType) => {
        switch (paymentType) {
            case 'PayPal':
            case 'Payoneer':
                return [
                    { key: 'email', label: 'Email', type: 'email', required: true },
                    { key: 'accountId', label: 'Account ID', type: 'text', required: false }
                ];
            case 'VodafoneCash':
                return [
                    { key: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true }
                ];
            case 'USDT_TRC20':
                return [
                    { key: 'walletAddress', label: 'Wallet Address', type: 'text', required: true }
                ];
            case 'Payeer':
            case 'WebMoney':
                return [
                    { key: 'accountId', label: 'Account ID', type: 'text', required: true }
                ];
            default:
                return [];
        }
    };

    const handleCredentialChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            credentials: {
                ...prev.credentials,
                [key]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.paymentType) {
            toast.error(t('paymentServices.paymentTypeRequired') || 'Please select a payment type', ToastOptions("error"));
            return;
        }

        const credentialsFields = getCredentialsFields(formData.paymentType);
        const requiredFields = credentialsFields.filter(f => f.required);
        
        for (const field of requiredFields) {
            if (!formData.credentials[field.key]) {
                toast.error(t('paymentServices.fieldRequired', { field: field.label }) || `${field.label} is required`, ToastOptions("error"));
                return;
            }
        }

        const submitData = {
            paymentType: formData.paymentType,
            credentials: formData.credentials,
            isActive: formData.isActive
        };

        if (formData.accountName) submitData.accountName = formData.accountName;
        if (formData.isDefault) submitData.isDefault = formData.isDefault;
        if (formData.note) submitData.note = formData.note;

        if (editingService) {
            await updateMutation.mutateAsync({ id: editingService._id || editingService.id, data: submitData });
        } else {
            await createMutation.mutateAsync(submitData);
        }
    };

    const getPaymentIcon = (paymentType) => {
        const type = PAYMENT_TYPES.find(t => t.value === paymentType);
        return type ? type.icon : FaCreditCard;
    };

    const getPaymentLabel = (paymentType) => {
        const type = PAYMENT_TYPES.find(t => t.value === paymentType);
        return type ? type.label : paymentType;
    };

    return (
        <div className="payment-services-container">
            <div className="payment-services-header">
                <h2>{t('paymentServices.title') || 'Payment Services'}</h2>
                <motion.button
                    className="add-payment-btn"
                    onClick={handleAddClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaPlus /> {t('paymentServices.addPayment') || 'Add Payment Method'}
                </motion.button>
            </div>

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>{t('paymentServices.loading') || 'Loading payment services...'}</p>
                </div>
            ) : paymentServices.length === 0 ? (
                <div className="empty-state">
                    <FaCreditCard className="empty-icon" />
                    <p>{t('paymentServices.noPaymentMethods') || 'No payment methods added yet'}</p>
                    <button onClick={handleAddClick} className="add-first-btn">
                        <FaPlus /> {t('paymentServices.addFirst') || 'Add Your First Payment Method'}
                    </button>
                </div>
            ) : (
                <div className="payment-services-grid">
                    {paymentServices.map((service) => {
                        const Icon = getPaymentIcon(service.paymentType);
                        return (
                            <motion.div
                                key={service._id || service.id}
                                className={`payment-service-card ${service.isDefault ? 'default' : ''} ${!service.isActive ? 'inactive' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="card-header">
                                    <div className="icon-wrapper">
                                        <Icon />
                                    </div>
                                    <div className="card-title">
                                        <h3>{getPaymentLabel(service.paymentType)}</h3>
                                        {service.isDefault && (
                                            <span className="default-badge">{t('paymentServices.default') || 'Default'}</span>
                                        )}
                                        {!service.isActive && (
                                            <span className="inactive-badge">{t('paymentServices.inactive') || 'Inactive'}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="card-body">
                                    {service.accountName && (
                                        <div className="info-row">
                                            <span className="label">{t('paymentServices.accountName') || 'Account Name'}:</span>
                                            <span className="value">{service.accountName}</span>
                                        </div>
                                    )}
                                    
                                    {service.credentials && Object.entries(service.credentials).map(([key, value]) => (
                                        <div key={key} className="info-row">
                                            <span className="label">{key}:</span>
                                            <span className="value">{value}</span>
                                        </div>
                                    ))}
                                    
                                    {service.note && (
                                        <div className="info-row">
                                            <span className="label">{t('paymentServices.note') || 'Note'}:</span>
                                            <span className="value">{service.note}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card-actions">
                                    <motion.button
                                        className="edit-btn"
                                        onClick={() => handleEditClick(service)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaEdit /> {t('paymentServices.edit') || 'Edit'}
                                    </motion.button>
                                    <motion.button
                                        className="delete-btn"
                                        onClick={() => handleDeleteClick(service._id || service.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={deleteMutation.isLoading}
                                    >
                                        <FaTrash /> {t('paymentServices.delete') || 'Delete'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || showEditModal) && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowAddModal(false);
                            setShowEditModal(false);
                            setEditingService(null);
                            resetForm();
                        }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>{editingService ? (t('paymentServices.editPayment') || 'Edit Payment Method') : (t('paymentServices.addPayment') || 'Add Payment Method')}</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                        setEditingService(null);
                                        resetForm();
                                    }}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="payment-form">
                                <div className="form-group">
                                    <label>{t('paymentServices.paymentType') || 'Payment Type'} *</label>
                                    <select
                                        value={formData.paymentType}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, paymentType: e.target.value, credentials: {} }));
                                        }}
                                        required
                                        disabled={!!editingService}
                                    >
                                        <option value="">{t('paymentServices.selectType') || 'Select Payment Type'}</option>
                                        {PAYMENT_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.paymentType && (
                                    <>
                                        <div className="form-group">
                                            <label>{t('paymentServices.accountName') || 'Account Name'}</label>
                                            <input
                                                type="text"
                                                value={formData.accountName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                                                placeholder={t('paymentServices.accountNamePlaceholder') || 'e.g., Ahmed Ali'}
                                            />
                                        </div>

                                        {getCredentialsFields(formData.paymentType).map(field => (
                                            <div key={field.key} className="form-group">
                                                <label>
                                                    {field.label} {field.required && '*'}
                                                </label>
                                                <input
                                                    type={field.type}
                                                    value={formData.credentials[field.key] || ''}
                                                    onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                                                    placeholder={field.label}
                                                    required={field.required}
                                                />
                                            </div>
                                        ))}

                                        <div className="form-group">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isDefault}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                                />
                                                {t('paymentServices.setAsDefault') || 'Set as default payment method'}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                />
                                                {t('paymentServices.isActive') || 'Active'}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label>{t('paymentServices.note') || 'Note'}</label>
                                            <textarea
                                                value={formData.note}
                                                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                                placeholder={t('paymentServices.notePlaceholder') || 'Optional note...'}
                                                rows="3"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="form-actions">
                                    <motion.button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={createMutation.isLoading || updateMutation.isLoading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {createMutation.isLoading || updateMutation.isLoading ? (
                                            <span className="spinner-small"></span>
                                        ) : (
                                            <FaCheck />
                                        )}
                                        {editingService ? (t('paymentServices.update') || 'Update') : (t('paymentServices.create') || 'Create')}
                                    </motion.button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setShowEditModal(false);
                                            setEditingService(null);
                                            resetForm();
                                        }}
                                    >
                                        <FaTimes /> {t('paymentServices.cancel') || 'Cancel'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
