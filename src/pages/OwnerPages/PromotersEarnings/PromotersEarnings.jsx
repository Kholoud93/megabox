import React from 'react'
import './PromotersEarnings.scss'

export default function PromotersAnalytics() {
    return <div className="earnings-container">
        <div className="earnings-card">
            <h2 className="main-heading">Earnings Details</h2>
            <div className="earnings-grid">
                <div className="earning-item">
                    <div className="label">Pending Rewards</div>
                    <div className="value">$0.000300 USD</div>
                </div>
                <div className="earning-item">
                    <div className="label">Confirmed Rewards</div>
                    <div className="value">$0.000000 USD</div>
                </div>
                <div className="earning-item total">
                    <div className="label">Total Earnings</div>
                    <div className="value">$0.000000 USD</div>
                </div>
            </div>
        </div>
    </div>


}
