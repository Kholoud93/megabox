import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FaCreditCard } from 'react-icons/fa';
import './Payments.scss';

export default function Payments() {
    const { t } = useLanguage();

    return (
        <div className="admin-payments-page">
            <div className="admin-payments-page__wrapper">
                <div className="admin-payments-header">
                    <div className="admin-payments-header__content">
                        <FaCreditCard className="admin-payments-header__icon" />
                        <div>
                            <h1 className="admin-payments-header__title">{t('adminPayments.title')}</h1>
                            <p className="admin-payments-header__subtitle">{t('adminPayments.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="admin-payments-content">
                    <p>{t('adminPayments.comingSoon')}</p>
                </div>
            </div>
        </div>
    );
}

