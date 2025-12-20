import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import PaymentServices from '../../../components/PaymentServices/PaymentServices';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi2';
import { FaCreditCard } from 'react-icons/fa';
import '../_shared-admin-styles.scss';
import './AdminPaymentServices.scss';

export default function AdminPaymentServices() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="admin-payment-services-page">
            <div className="admin-payment-services-page__wrapper">
                <div className="admin-payment-services-header">
                    <div className="admin-payment-services-header__content">
                        <button
                            onClick={() => navigate('/Owner')}
                            className="admin-payment-services-header__back"
                            title={t('adminPaymentServices.backToAnalytics') || 'Back to Analytics'}
                        >
                            {language === 'ar' ? <HiArrowRight size={24} /> : <HiArrowLeft size={24} />}
                        </button>
                        <FaCreditCard className="admin-payment-services-header__icon" />
                        <div>
                            <h1 className="admin-payment-services-header__title">
                                {t('adminPaymentServices.title') || 'Payment Services Management'}
                            </h1>
                            <p className="admin-payment-services-header__subtitle">
                                {t('adminPaymentServices.subtitle') || 'Manage payment methods available for withdrawals'}
                            </p>
                        </div>
                    </div>
                </div>

                <PaymentServices />
            </div>
        </div>
    );
}

