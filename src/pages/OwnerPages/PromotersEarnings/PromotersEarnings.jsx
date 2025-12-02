import React from 'react';
import { useQuery } from 'react-query';
import { useCookies } from 'react-cookie';
import { useParams } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../context/LanguageContext';
import Loading from '../../../components/Loading/Loading';
import './PromotersEarnings.scss';

export default function PromotersAnalytics() {
    const { t } = useLanguage();
    const { id } = useParams();
    const [cookies] = useCookies(['MegaBox']);
    const token = cookies.MegaBox;

    // Fetch promoter earnings
    const { data: earningsData, isLoading: earningsLoading, error: earningsError } = useQuery(
        ['promoterEarnings', id],
        () => adminService.getUserEarningsadmin(id, token),
        {
            enabled: !!id && !!token,
            onError: (error) => {
                console.error('Error fetching promoter earnings:', error);
            }
        }
    );

    // Extract earnings data
    const currency = earningsData?.currency || 'USD';
    const pendingRewards = earningsData?.pendingRewards || '0.000000';
    const confirmedRewards = earningsData?.confirmedRewards || '0.000000';
    const totalEarnings = earningsData?.totalEarnings || '0.000000';

    if (earningsLoading) {
        return (
            <div className="earnings-container">
                <div className="earnings-card">
                    <Loading />
                </div>
            </div>
        );
    }

    if (earningsError) {
        return (
            <div className="earnings-container">
                <div className="earnings-card">
                    <h2 className="main-heading">{t('adminPromotersEarnings.error') || 'Error'}</h2>
                    <p>{t('adminPromotersEarnings.fetchError') || 'Failed to fetch earnings data. Please try again later.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="earnings-container">
            <div className="earnings-card">
                <h2 className="main-heading">{t('adminPromotersEarnings.earningsDetails') || 'Earnings Details'}</h2>
                <div className="earnings-grid">
                    <div className="earning-item">
                        <div className="label">{t('adminPromotersEarnings.pendingRewards') || 'Pending Rewards'}</div>
                        <div className="value">{parseFloat(pendingRewards).toFixed(6)} {currency}</div>
                    </div>
                    <div className="earning-item">
                        <div className="label">{t('adminPromotersEarnings.confirmedRewards') || 'Confirmed Rewards'}</div>
                        <div className="value">{parseFloat(confirmedRewards).toFixed(6)} {currency}</div>
                    </div>
                    <div className="earning-item total">
                        <div className="label">{t('adminPromotersEarnings.totalEarnings') || 'Total Earnings'}</div>
                        <div className="value">{parseFloat(totalEarnings).toFixed(6)} {currency}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
