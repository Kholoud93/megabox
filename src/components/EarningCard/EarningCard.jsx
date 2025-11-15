import React from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import './EarningCard.scss';

export default function EarningCard({
    withdrawable,
    estimatedIncome,
    actualIncome,
    currency = 'USD',
    onWithdraw,
    showWithdraw = true
}) {
    return (
        <motion.div
            className="earning-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <div className="earning-card__content">
                <div className="earning-card__item">
                    <div className="earning-card__label">Withdrawable / {currency}</div>
                    <div className="earning-card__value">{withdrawable || '0.00'}</div>
                    {showWithdraw && (
                        <motion.button
                            className="earning-card__withdraw-btn"
                            onClick={onWithdraw}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaWallet />
                            Withdraw
                        </motion.button>
                    )}
                </div>

                <div className="earning-card__divider"></div>

                <div className="earning-card__item">
                    <div className="earning-card__label">Estimated income / {currency}</div>
                    <div className="earning-card__value">{estimatedIncome || '0.00'}</div>
                    <div className="earning-card__icon">
                        <FaChartLine />
                    </div>
                </div>

                <div className="earning-card__divider"></div>

                <div className="earning-card__item">
                    <div className="earning-card__label">Actual income / {currency}</div>
                    <div className="earning-card__value">{actualIncome || '0.00'}</div>
                    <div className="earning-card__icon">
                        <FaMoneyBillWave />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

