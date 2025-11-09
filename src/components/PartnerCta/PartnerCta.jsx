import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { FaCheckCircle } from "react-icons/fa";
import api from "../../services/api";
import Loading from "../Loading/Loading";
import './PartnerCta.scss'

const cards = [
    {
        title: "Views Plan",
        features: [
            "Pay per thousand views (CPM)",
            "Competitive rates vary by country",
            "Ability to display in-video ads",
            "Detailed viewer analytics",
            "Withdraw earnings upon reaching minimum threshold",
            "24/7 technical support"
        ],
        smallDesc: "Ideal for content that gets a high number of views.",
        planKey: "watchingplan"
    },
    {
        title: "Downloads Plan",
        features: [
            "Pay per direct app install (CPI)",
            "Competitive rates vary by country",
            "Detailed conversion statistics",
            "Unique referral links",
            "Accurate tracking of downloads",
            "24/7 technical support"
        ],
        smallDesc: "Ideal for reaching a new audience and expanding your user base.",
        planKey: "Downloadsplan"
    }
];


export default function PartnerCTA() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [cookies] = useCookies(["MegaBox"]);

    useEffect(() => {
        fetchUserData();
    }, []);

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
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    if (loading) {
        return <Loading />;
    }

    const hasNoPlans = !userData?.watchingplan && !userData?.Downloadsplan;

    return (
        <section className="bg-gray-50 py-20 px-6 md:px-16 relative overflow-hidden">
            <div className="container mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="text-4xl md:text-5xl font-bold text-center mb-10 text-primary-700"
                >
                    {hasNoPlans ? "Choose Your Subscription Plan" : "You’re Already Subscribed"}
                </motion.h2>

                {hasNoPlans ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {cards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.2 }}
                                className="relative bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                            >
                                {/* Gradient Header */}
                                <div className={`h-[95px] flex justify-center flex-col p-4 text-white CardNav`}>
                                    <h3 className="text-2xl font-bold">{card.title}</h3>
                                    <p>{card.smallDesc}</p>
                                </div>

                                {/* Card Content */}
                                <div className="p-8">
                                    <ul className="space-y-3 mb-6">
                                        {card.features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-gray-700">
                                                <FaCheckCircle className="text-primary-600 mr-2" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handleSubscribe(card.planKey)}
                                        className="w-full bg-primary-600 text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition duration-200"
                                    >
                                        Select {card.title}
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
                        className="flex justify-center"
                    >
                        <button
                            onClick={() => navigate('/dashboard/Earnings')}
                            className="bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:bg-primary-500 transition"
                        >
                            See Your Dashboard
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Decorative blurred circles */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        </section>
    );
}
