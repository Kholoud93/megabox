import React from 'react'
import { motion } from 'framer-motion'

export default function PartnerCards({ icon, title, desc, index }) {
    return <motion.div
        initial={{ opacity: 0 }}
        transition={{ delay: 0.1 * index }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className='PartnerCards shadow-md rounded-xl'>

        <div className="">
            <div className='w-[50px] h-[50px] flex bg-primary-50 justify-center items-center rounded-full'>
                {icon}
            </div>
        </div>

        <div className="mt-5 mb-2">
            <h1 className='text-xl font-bold'>{title}</h1>
        </div>
        <div className="">
            <p>{desc}</p>
        </div>
    </motion.div>

}
