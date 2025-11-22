import React from 'react'
import { motion } from 'framer-motion'
import './StepCard.scss'

export default function StepCard({ step, idx }) {
    return <motion.div
        key={idx}
        initial={{ y: -10, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 * idx }}
        className="step-card"
    >
        <div className="step-card__icon-wrapper">
            {step.icon}
        </div>
        <div className="step-card__content">
            <h3 className="step-card__title">
                {idx + 1}. {step.title}
            </h3>
            <p className="step-card__desc">{step.desc}</p>
        </div>
    </motion.div>
}
