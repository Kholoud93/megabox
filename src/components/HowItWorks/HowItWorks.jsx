import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './HowItWorks.scss';
import step1SvgContent from '../../assets/How_it_works/Image upload-bro.svg?raw';
import step2SvgContent from '../../assets/How_it_works/Organizing projects-rafiki.svg?raw';
import step3SvgContent from '../../assets/How_it_works/Cloud sync-rafiki.svg?raw';
import step4SvgContent from '../../assets/How_it_works/undraw_folder-files_5www.svg?raw';
import { useLanguage } from '../../context/LanguageContext';
import { modifySvgToIndigo } from '../../utils/svgColorModifier';

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

const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            type: 'spring',
            stiffness: 70
        }
    }
};

const HowItWorks = () => {
    const { t, language } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    const steps = [
        {
            svgContent: modifySvgToIndigo(step1SvgContent, { isFirstImage: true, isThirdImage: false }), // First image with lighter colors
            titleKey: 'howItWorks.steps.step1.title',
            descKey: 'howItWorks.steps.step1.desc',
        },
        {
            svgContent: modifySvgToIndigo(step2SvgContent, { isFirstImage: false, isThirdImage: false }),
            titleKey: 'howItWorks.steps.step2.title',
            descKey: 'howItWorks.steps.step2.desc',
        },
        {
            svgContent: modifySvgToIndigo(step3SvgContent, { isFirstImage: false, isThirdImage: true }), // Third image (Stream or Share) with specific colors
            titleKey: 'howItWorks.steps.step3.title',
            descKey: 'howItWorks.steps.step3.desc',
        },
        {
            svgContent: modifySvgToIndigo(step4SvgContent, { isFirstImage: false, isThirdImage: false }),
            titleKey: 'howItWorks.steps.step4.title',
            descKey: 'howItWorks.steps.step4.desc',
        }
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

    // Auto-play functionality
    useEffect(() => {
        if (!isPaused) {
            intervalRef.current = setInterval(() => {
                setDirection(1);
                setCurrentSlide((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
            }, 5000); // Change slide every 5 seconds
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, steps.length]);

    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    return (
        <section className="howitworks" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="howitworks__container">
                <motion.h2 
                    className="howitworks__title"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={titleVariants}
                >
                    {t('howItWorks.title')}
                </motion.h2>
                
                <div 
                    className="howitworks__slider"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <button 
                        className="howitworks__nav-button howitworks__nav-button--prev"
                        onClick={() => {
                            setIsPaused(true);
                            paginate(-1);
                        }}
                        aria-label={t('howItWorks.prev')}
                    >
                        <FiChevronLeft size={28} />
                    </button>

                    <div className="howitworks__slide-wrapper">
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
                                }}
                                onDragEnd={(e, { offset, velocity }) => {
                                    const swipe = swipePower(offset.x, velocity.x);
                                    const isRTL = language === 'ar';

                                    if (isRTL) {
                                        if (swipe > swipeConfidenceThreshold) {
                                            paginate(1);
                                        } else if (swipe < -swipeConfidenceThreshold) {
                                            paginate(-1);
                                        }
                                    } else {
                                        if (swipe < -swipeConfidenceThreshold) {
                                            paginate(1);
                                        } else if (swipe > swipeConfidenceThreshold) {
                                            paginate(-1);
                                        }
                                    }
                                }}
                                className="howitworks__slide"
                            >
                                <div className="howitworks__row">
                                    <motion.div
                                        className="howitworks__text"
                                        initial={{ opacity: 0, x: language === 'ar' ? 60 : -60 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <h3 className="howitworks__step-title">
                                            {t(steps[currentSlide].titleKey)}
                                        </h3>
                                        <p className="howitworks__step-desc">
                                            {t(steps[currentSlide].descKey)}
                                        </p>
                                    </motion.div>
                                    <motion.div
                                        className="howitworks__image-wrapper"
                                        initial={{ opacity: 0, x: language === 'ar' ? -60 : 60 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                    >
                                        <div 
                                            className="howitworks__image"
                                            dangerouslySetInnerHTML={{ __html: steps[currentSlide].svgContent }}
                                        />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button 
                        className="howitworks__nav-button howitworks__nav-button--next"
                        onClick={() => {
                            setIsPaused(true);
                            paginate(1);
                        }}
                        aria-label={t('howItWorks.next')}
                    >
                        <FiChevronRight size={28} />
                    </button>
                </div>

                <div className="howitworks__indicators">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            className={`howitworks__indicator ${index === currentSlide ? 'howitworks__indicator--active' : ''}`}
                            onClick={() => {
                                setIsPaused(true);
                                goToSlide(index);
                            }}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks; 