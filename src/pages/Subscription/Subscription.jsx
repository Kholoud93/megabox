import React, { useEffect, useState } from 'react'
import PartnerIntro from '../../components/PartnerIntro/PartnerIntro'
import Footer from '../../components/Footer/Footer'
import PartnerCTA from '../../components/PartnerCta/PartnerCta'
import EarningSteps from '../../components/EarningSteps/EarningSteps'
import { useCookies } from 'react-cookie'
import api from '../../services/api'
import { AnimatePresence, motion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

export default function Partners() {
    const [cookies] = useCookies(['MegaBox'])
    const [showModal, setShowModal] = useState(false)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        window.scrollTo(0, 0)
        checkUserAndShowModal()
    }, [])

    const checkUserAndShowModal = async () => {
        if (!cookies.MegaBox) {
            setLoading(false)
            return
        }

        try {
            const response = await api.get('/user/Getloginuseraccount', {
                headers: {
                    Authorization: `Bearer ${cookies.MegaBox}`
                }
            })
            const user = response.data.data
            setUserData(user)
            
            // Show modal if user doesn't have a plan (regular user or promoter without plan)
            const hasNoPlans = !user?.watchingplan && !user?.Downloadsplan
            
            if (hasNoPlans) {
                setShowModal(true)
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching user data:', error)
            setLoading(false)
        }
    }

    if (loading) {
        return null
    }

    return <>
        <AnimatePresence>
            {showModal && (
                <motion.div
                    className="partners-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        className="partners-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="partners-modal__close"
                            onClick={() => setShowModal(false)}
                        >
                            <FaTimes />
                        </button>
                        <div className="partners-modal__content">
                            <PartnerCTA isModal={true} onClose={() => setShowModal(false)} />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        <PartnerIntro />
        <EarningSteps />
        <PartnerCTA />
        <Footer />
    </>
}
