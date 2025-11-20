import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsUpload } from "react-icons/bs";
import { MdShare } from "react-icons/md";
import { PiVideo } from "react-icons/pi";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import StepCard from "./StepCard";
import { useLanguage } from "../../context/LanguageContext";
import cloudStorageBg from '../../assets/Images/cloud storage.jpg';
import './EarningSteps.scss'

const slideVariants = (isRTL) => ({
    enter: (direction) => ({
        x: isRTL 
            ? (direction > 0 ? -1000 : 1000)
            : (direction > 0 ? 1000 : -1000),
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        zIndex: 0,
        x: isRTL
            ? (direction < 0 ? -1000 : 1000)
            : (direction < 0 ? 1000 : -1000),
        opacity: 0
    })
});

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

export default function EarningSteps() {
    const { t, language } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    const steps = [
        {
            title: t('partners.earningSteps.step1.title'),
            desc: t('partners.earningSteps.step1.desc'),
            icon: <BsUpload />,
        },
        {
            title: t('partners.earningSteps.step2.title'),
            desc: t('partners.earningSteps.step2.desc'),
            icon: <MdShare />,
        },
        {
            title: t('partners.earningSteps.step3.title'),
            desc: t('partners.earningSteps.step3.desc'),
            icon: <PiVideo />,
        },
        {
            title: t('partners.earningSteps.step4.title'),
            desc: t('partners.earningSteps.step4.desc'),
            icon: <AiOutlineDollarCircle />,
        },
    ];

    const paginate = (newDirection) => {
        setDirection(newDirection);
        if (newDirection === 1) {
            setCurrentSlide((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
        } else {
            setCurrentSlide((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
        }
    };

    const goToSlide = (index) => {
        const newDirection = index > currentSlide ? 1 : -1;
        setDirection(newDirection);
        setCurrentSlide(index);
    };

    // Auto-play functionality - starts automatically
    useEffect(() => {
        // Start auto-play immediately
        const startAutoPlay = () => {
            if (!isPaused) {
                intervalRef.current = setInterval(() => {
                    setDirection(1);
                    setCurrentSlide((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
                }, 5000); // Change slide every 5 seconds
            }
        };

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Start auto-play
        startAutoPlay();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isPaused, steps.length, currentSlide]);

    const handleMouseEnter = () => {
        setIsPaused(true);
        // Clear interval when paused
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
        // Restart auto-play when mouse leaves
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setDirection(1);
                setCurrentSlide((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
            }, 5000);
        }
    };

    return (
        <section className="earning-steps" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ backgroundImage: `url(${cloudStorageBg})` }}>
            <div className="earning-steps__overlay"></div>
            <div className="earning-steps__container">
                <h2 className="earning-steps__title">
                    {t('partners.earningSteps.title')}
                </h2>
                
                <div 
                    className="earning-steps__slider"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <button 
                        className="earning-steps__nav-button earning-steps__nav-button--prev"
                        onClick={() => {
                            setIsPaused(true);
                            if (intervalRef.current) {
                                clearInterval(intervalRef.current);
                                intervalRef.current = null;
                            }
                            paginate(-1);
                            // Resume auto-play after 5 seconds
                            setTimeout(() => {
                                setIsPaused(false);
                            }, 5000);
                        }}
                        aria-label="Previous"
                    >
                        <FiChevronLeft size={28} />
                    </button>

                    <div className="earning-steps__slide-wrapper">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentSlide}
                                custom={direction}
                                variants={slideVariants(language === 'ar')}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1}
                                onDragStart={() => {
                                    setIsPaused(true);
                                    if (intervalRef.current) {
                                        clearInterval(intervalRef.current);
                                        intervalRef.current = null;
                                    }
                                }}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipe = swipePower(offset.x, velocity.x);
                                    const isRTL = language === 'ar';

                                    if (isRTL) {
                                        if (swipe < -swipeConfidenceThreshold) {
                                            paginate(1);
                                        } else if (swipe > swipeConfidenceThreshold) {
                                            paginate(-1);
                                        }
                                    } else {
                                        if (swipe < -swipeConfidenceThreshold) {
                                            paginate(-1);
                                        } else if (swipe > swipeConfidenceThreshold) {
                                            paginate(1);
                                        }
                                    }
                                    // Resume auto-play after swipe
                                    setTimeout(() => {
                                        setIsPaused(false);
                                    }, 5000);
                                }}
                                className="earning-steps__slide"
                            >
                                <StepCard step={steps[currentSlide]} idx={currentSlide} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button 
                        className="earning-steps__nav-button earning-steps__nav-button--next"
                        onClick={() => {
                            setIsPaused(true);
                            if (intervalRef.current) {
                                clearInterval(intervalRef.current);
                                intervalRef.current = null;
                            }
                            paginate(1);
                            // Resume auto-play after 5 seconds
                            setTimeout(() => {
                                setIsPaused(false);
                            }, 5000);
                        }}
                        aria-label="Next"
                    >
                        <FiChevronRight size={28} />
                    </button>
                </div>

                {/* Pagination Dots */}
                <div className="earning-steps__pagination">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            className={`earning-steps__pagination-dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => {
                                setIsPaused(true);
                                if (intervalRef.current) {
                                    clearInterval(intervalRef.current);
                                    intervalRef.current = null;
                                }
                                goToSlide(index);
                                // Resume auto-play after 5 seconds
                                setTimeout(() => {
                                    setIsPaused(false);
                                }, 5000);
                            }}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
