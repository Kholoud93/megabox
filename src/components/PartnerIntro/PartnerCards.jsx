import React from 'react'
import { motion } from 'framer-motion'
import './PartnerCards.scss'

export default function PartnerCards({ icon, title, desc, index }) {
    return <motion.div
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1 * index }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className='PartnerCards'>

        <div>
            <div className='w-[50px] h-[50px] flex justify-center items-center rounded-full'>
                {icon}
            </div>
        </div>

        <div>
            <h1>{title}</h1>
        </div>
        <div>
            <p>{desc}</p>
        </div>
    </motion.div>

}
