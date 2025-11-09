import React from 'react'
import { motion } from 'framer-motion'

export default function StepCard({ step, idx }) {
    return <motion.div
        key={idx}
        initial={{ y: -10, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 * idx }}
        className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex space-x-4 items-start"
    >
        <div className="flex-shrink-0">
            <div className="w-12 h-12 flex items-center justify-center bg-primary-50 rounded-full">
                {step.icon}
            </div>
        </div>
        <div>
            <h3 className="text-xl font-semibold mb-2">
                {idx + 1}. {step.title}
            </h3>
            <p className="text-gray-600">{step.desc}</p>
        </div>
    </motion.div>
}
