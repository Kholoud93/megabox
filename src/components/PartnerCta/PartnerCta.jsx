import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { FaCheckCircle } from "react-icons/fa";
import api from "../../services/api";
import Loading from "../Loading/Loading";
import { useLanguage } from "../../context/LanguageContext";
import TermsModal from "../TermsModal/TermsModal";
import './PartnerCta.scss'


export default function PartnerCTA({ isModal = false, onClose }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const navigate = useNavigate();
    const [cookies] = useCookies(["MegaBox"]);
    const { t } = useLanguage();

    const cards = [
        {
            title: t('partners.plans.viewsPlan.title'),
            features: [
                t('partners.plans.viewsPlan.feature1'),
                t('partners.plans.viewsPlan.feature2'),
                t('partners.plans.viewsPlan.feature3'),
                t('partners.plans.viewsPlan.feature4'),
                t('partners.plans.viewsPlan.feature5'),
                t('partners.plans.viewsPlan.feature6')
            ],
            smallDesc: t('partners.plans.viewsPlan.desc'),
            planKey: "watchingplan"
        },
        {
            title: t('partners.plans.downloadsPlan.title'),
            features: [
                t('partners.plans.downloadsPlan.feature1'),
                t('partners.plans.downloadsPlan.feature2'),
                t('partners.plans.downloadsPlan.feature3'),
                t('partners.plans.downloadsPlan.feature4'),
                t('partners.plans.downloadsPlan.feature5'),
                t('partners.plans.downloadsPlan.feature6')
            ],
            smallDesc: t('partners.plans.downloadsPlan.desc'),
            planKey: "Downloadsplan"
        }
    ];

    useEffect(() => {
        if (!isModal) {
            fetchUserData();
        } else {
            // For modal, fetch user data if token exists
            if (cookies.MegaBox) {
                fetchUserData();
            } else {
                setUserData(null);
                setLoading(false);
            }
        }
    }, [isModal, cookies.MegaBox]);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/user/Getloginuseraccount', {
                headers: {
                    Authorization: `Bearer ${cookies.MegaBox}`
                }
            });
            setUserData(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    };

    const handleSubscribe = async (planKey) => {
        if (!cookies.MegaBox) return navigate("/login");
        
        // Check if user has already accepted terms
        const termsAccepted = localStorage.getItem('termsAccepted');
        
        if (!termsAccepted) {
            // Show terms modal first
            setSelectedPlan(planKey);
            setShowTermsModal(true);
            return;
        }
        
        // If terms already accepted, proceed with subscription
        await proceedWithSubscription(planKey);
    };

    const proceedWithSubscription = async (planKey) => {
        try {
            const updateData = {
                isPromoter: "true",
                [planKey]: "true"
            };
            await api.patch('/auth/updateProfile', updateData, {
                headers: {
                    Authorization: `Bearer ${cookies.MegaBox}`
                }
            });
            await fetchUserData(); // Refresh user data after update
            if (isModal && onClose) {
                onClose();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleTermsAccept = () => {
        if (selectedPlan) {
            proceedWithSubscription(selectedPlan);
        }
    };

    if (loading && !isModal) {
        return <Loading />;
    }

    const hasNoPlans = !userData || (!userData?.watchingplan && !userData?.Downloadsplan);

    return (
        <>
            <TermsModal
                isOpen={showTermsModal}
                onClose={() => {
                    setShowTermsModal(false);
                    setSelectedPlan(null);
                }}
                onAccept={handleTermsAccept}
            />
            <section className={`partner-cta ${isModal ? 'partner-cta--modal' : ''}`}>
                <div className="partner-cta__container">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="partner-cta__title"
                >
                    {hasNoPlans ? t('partners.selectPlan') : t('partners.alreadySubscribed')}
                </motion.h2>

                {hasNoPlans ? (
                    <div className="partner-cta__cards">
                        {cards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.2 }}
                                className={`partner-cta__card partner-cta__card--${idx === 0 ? 'purple' : 'orange'}`}
                            >
                                {/* Card Header */}
                                <div className="partner-cta__card-header">
                                    <h3 className="partner-cta__card-title">{card.title}</h3>
                                    <p className="partner-cta__card-desc">{card.smallDesc}</p>
                                </div>

                                {/* Card Content */}
                                <div className="partner-cta__card-content">
                                    <ul className="partner-cta__features">
                                        {card.features.map((feature, i) => (
                                            <li key={i} className="partner-cta__feature">
                                                <FaCheckCircle className="partner-cta__feature-icon" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handleSubscribe(card.planKey)}
                                        className={`partner-cta__button partner-cta__button--${idx === 0 ? 'purple' : 'orange'}`}
                                    >
                                        {t('partners.choosePlan')}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="partner-cta__subscribed"
                    >
                        <button
                            onClick={() => {
                                if (onClose) onClose();
                                navigate('/dashboard/Earnings');
                            }}
                            className="partner-cta__dashboard-button"
                        >
                            {t('partners.seeDashboard')}
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
        </>
    );
}
