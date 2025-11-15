import React from 'react';
import Earning from '../Earning/Earning';
import './PromoterDashboard.scss';

export default function PromoterDashboard() {
    // Promoter dashboard uses the same Earning component
    // but with promoter-specific styling or modifications if needed
    return (
        <div className="promoter-dashboard">
            <Earning />
        </div>
    );
}

