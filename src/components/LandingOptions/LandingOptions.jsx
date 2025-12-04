import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { FaHandshake, FaUsers, FaArrowRight } from 'react-icons/fa';
import './LandingOptions.scss';

export default function LandingOptions() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const options = [
        {
            id: 'partners',
            title: t('landingOptions.partners.title'),
            description: t('landingOptions.partners.description'),
            icon: <FaHandshake />,
            link: '/Partners',
            color: 'indigo'
        },
        {
            id: 'promoters',
            title: t('landingOptions.promoters.title'),
            description: t('landingOptions.promoters.description'),
            icon: <FaUsers />,
            link: '/Promoters',
            color: 'purple'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <section className="landing-options">
            <div className="landing-options__container">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="landing-options__title"
                >
                    {t('landingOptions.title')}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="landing-options__subtitle"
                >
                    {t('landingOptions.subtitle')}
                </motion.p>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="landing-options__grid"
                >
                    {options.map((option) => (
                        <motion.div
                            key={option.id}
                            variants={itemVariants}
                            className={`landing-options__card landing-options__card--${option.color}`}
                            onClick={() => {
                                if (option.id === 'partners') {
                                    navigate('/Partners');
                                } else if (option.id === 'promoters') {
                                    navigate('/Promoters');
                                }
                            }}
                        >
                            <div className="landing-options__icon">{option.icon}</div>
                            <h3 className="landing-options__card-title">{option.title}</h3>
                            <p className="landing-options__card-description">{option.description}</p>
                            <div className="landing-options__link">
                                <span>{t('landingOptions.learnMore')}</span>
                                <FaArrowRight className="landing-options__arrow" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

