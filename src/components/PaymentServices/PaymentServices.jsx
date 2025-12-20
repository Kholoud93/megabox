import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';
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
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [formData, setFormData] = useState({
        paymentType: '',
        accountName: '',
        credentials: {},
        isActive: true,
        isDefault: false,
        note: ''
    });

    // Fetch payment services (using adminService for admin management)
    const { data: paymentServicesData, isLoading } = useQuery(
        ['paymentServices'],
        () => adminService.getPaymentServices(token),
        {
            enabled: !!token,
            retry: 2
        }
    );

    const paymentServices = paymentServicesData?.paymentServices || paymentServicesData?.data || paymentServicesData || [];

    // Create payment service mutation (Admin only)
    const createMutation = useMutation(
        (data) => adminService.createPaymentService(data, token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('paymentServices');
                setShowAddModal(false);
                resetForm();
            }
        }
    );

    // Update payment service mutation (Admin only)
    const updateMutation = useMutation(
        ({ id, data }) => adminService.updatePaymentService(id, data, token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('paymentServices');
                setShowEditModal(false);
                setEditingService(null);
                resetForm();
            }
        }
    );

    // Delete payment service mutation (Admin only)
    const deleteMutation = useMutation(
        (id) => adminService.deletePaymentService(id, token),
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

    const handleDeleteClick = (service) => {
        setServiceToDelete(service);
    };

    const confirmDelete = async () => {
        if (serviceToDelete) {
            await deleteMutation.mutateAsync(serviceToDelete._id || serviceToDelete.id);
            setServiceToDelete(null);
        }
    };

    const getCredentialsFields = (paymentType) => {
        switch (paymentType) {
            case 'PayPal':
            case 'Payoneer':
                return [
                    { key: 'email', label: t('earning.paymentServices.email') || 'Email', type: 'email', required: true },
                    { key: 'accountId', label: t('earning.paymentServices.accountId') || 'Account ID', type: 'text', required: false }
                ];
            case 'VodafoneCash':
                return [
                    { key: 'phoneNumber', label: t('earning.paymentServices.phoneNumber') || 'Phone Number', type: 'tel', required: true }
                ];
            case 'USDT_TRC20':
                return [
                    { key: 'walletAddress', label: t('earning.paymentServices.walletAddress') || 'Wallet Address', type: 'text', required: true }
                ];
            case 'Payeer':
            case 'WebMoney':
                return [
                    { key: 'accountId', label: t('earning.paymentServices.accountId') || 'Account ID', type: 'text', required: true }
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
            toast.error(t('earning.paymentServices.paymentTypeRequired'), ToastOptions("error"));
            return;
        }

        const credentialsFields = getCredentialsFields(formData.paymentType);
        const requiredFields = credentialsFields.filter(f => f.required);
        
        for (const field of requiredFields) {
            if (!formData.credentials[field.key]) {
                const errorMsg = t('earning.paymentServices.fieldRequired').replace('{{field}}', field.label);
                toast.error(errorMsg, ToastOptions("error"));
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
                <h2>{t('earning.paymentServices.title')}</h2>
                <motion.button
                    className="add-payment-btn"
                    onClick={handleAddClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaPlus /> {t('earning.paymentServices.addPayment')}
                </motion.button>
            </div>

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>{t('earning.paymentServices.loading')}</p>
                </div>
            ) : paymentServices.length === 0 ? (
                <div className="empty-state">
                    <FaCreditCard className="empty-icon" />
                    <p>{t('earning.paymentServices.noPaymentMethods')}</p>
                    <button onClick={handleAddClick} className="add-first-btn">
                        <FaPlus /> {t('earning.paymentServices.addFirst')}
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
                                            <span className="default-badge">{t('earning.paymentServices.default')}</span>
                                        )}
                                        {!service.isActive && (
                                            <span className="inactive-badge">{t('earning.paymentServices.inactive')}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="card-body">
                                    {service.accountName && (
                                        <div className="info-row">
                                            <span className="label">{t('earning.paymentServices.accountName')}:</span>
                                            <span className="value">{service.accountName}</span>
                                        </div>
                                    )}
                                    
                                    {service.credentials && Object.entries(service.credentials).map(([key, value]) => {
                                        // Get translated label for credential field
                                        const credentialFields = getCredentialsFields(service.paymentType);
                                        const field = credentialFields.find(f => f.key === key);
                                        const label = field ? field.label : key;
                                        
                                        return (
                                            <div key={key} className="info-row">
                                                <span className="label">{label}:</span>
                                                <span className="value">{value}</span>
                                            </div>
                                        );
                                    })}
                                    
                                    {service.note && (
                                        <div className="info-row">
                                            <span className="label">{t('earning.paymentServices.note')}:</span>
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
                                        <FaEdit /> {t('earning.paymentServices.edit')}
                                    </motion.button>
                                    <motion.button
                                        className="delete-btn"
                                        onClick={() => handleDeleteClick(service)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={deleteMutation.isLoading}
                                    >
                                        <FaTrash /> {t('earning.paymentServices.delete')}
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
                        className="modal-overlay edit-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            if (!createMutation.isLoading && !updateMutation.isLoading) {
                                setShowAddModal(false);
                                setShowEditModal(false);
                                setEditingService(null);
                                resetForm();
                            }
                        }}
                    >
                        <motion.div
                            className="modal-content edit-modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>{editingService ? t('earning.paymentServices.editPayment') : t('earning.paymentServices.addPayment')}</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => {
                                        if (!createMutation.isLoading && !updateMutation.isLoading) {
                                            setShowAddModal(false);
                                            setShowEditModal(false);
                                            setEditingService(null);
                                            resetForm();
                                        }
                                    }}
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="payment-form">
                                <div className="form-group">
                                    <label>{t('earning.paymentServices.paymentType')} *</label>
                                    <select
                                        value={formData.paymentType}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, paymentType: e.target.value, credentials: {} }));
                                        }}
                                        required
                                        disabled={!!editingService}
                                    >
                                        <option value="">{t('earning.paymentServices.selectType')}</option>
                                        {PAYMENT_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.paymentType && (
                                    <>
                                        <div className="form-group">
                                            <label>{t('earning.paymentServices.accountName')}</label>
                                            <input
                                                type="text"
                                                value={formData.accountName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                                                placeholder={t('earning.paymentServices.accountNamePlaceholder')}
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

                                        <div className="form-group checkbox-group">
                                            <label className="styled-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="styled-checkbox"
                                                    checked={formData.isDefault}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">{t('earning.paymentServices.setAsDefault')}</span>
                                            </label>
                                        </div>

                                        <div className="form-group checkbox-group">
                                            <label className="styled-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="styled-checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">{t('earning.paymentServices.isActive')}</span>
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label>{t('earning.paymentServices.note')}</label>
                                            <textarea
                                                value={formData.note}
                                                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                                placeholder={t('earning.paymentServices.notePlaceholder')}
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
                                        {editingService ? t('earning.paymentServices.update') : t('earning.paymentServices.create')}
                                    </motion.button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => {
                                            if (!createMutation.isLoading && !updateMutation.isLoading) {
                                                setShowAddModal(false);
                                                setShowEditModal(false);
                                                setEditingService(null);
                                                resetForm();
                                            }
                                        }}
                                        disabled={createMutation.isLoading || updateMutation.isLoading}
                                    >
                                        <FaTimes /> {t('earning.paymentServices.cancel')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {serviceToDelete && (
                    <motion.div
                        className="modal-overlay delete-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !deleteMutation.isLoading && setServiceToDelete(null)}
                    >
                        <motion.div
                            className="modal-content delete-modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header delete-modal-header">
                                <h3>{t('earning.paymentServices.delete')}</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => !deleteMutation.isLoading && setServiceToDelete(null)}
                                    disabled={deleteMutation.isLoading}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="payment-form delete-modal-body">
                                <div className="delete-confirm-message">
                                    <FaTrash className="delete-icon" />
                                    <p>{t('earning.paymentServices.confirmDelete')}</p>
                                </div>

                                <div className="form-actions delete-modal-actions">
                                    <motion.button
                                        type="button"
                                        className="delete-btn confirm-delete-btn"
                                        onClick={confirmDelete}
                                        disabled={deleteMutation.isLoading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {deleteMutation.isLoading ? (
                                            <span className="spinner-small"></span>
                                        ) : (
                                            <FaTrash />
                                        )}
                                        {t('earning.paymentServices.delete')}
                                    </motion.button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setServiceToDelete(null)}
                                        disabled={deleteMutation.isLoading}
                                    >
                                        <FaTimes /> {t('earning.paymentServices.cancel')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
