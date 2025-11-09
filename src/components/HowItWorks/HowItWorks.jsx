import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './HowItWorks.scss';
import step1SvgContent from '../../assets/How_it_works/Image upload-bro.svg?raw';
import step2SvgContent from '../../assets/How_it_works/Organizing projects-rafiki.svg?raw';
import step3SvgContent from '../../assets/How_it_works/Cloud sync-rafiki.svg?raw';
import { useLanguage } from '../../context/LanguageContext';

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

// Function to modify SVG colors to indigo palette
const modifySvgColors = (svgContent, isFirstImage = false, isThirdImage = false) => {
    let modified = svgContent;
    
    // For third image (Stream or Share), use specific color replacements
    if (isThirdImage) {
        // Replace dark teal/cyan colors with indigo
        modified = modified.replace(/#033440/gi, 'rgb(99, 102, 241)'); // indigo-500
        modified = modified.replace(/#263238/gi, 'rgb(79, 70, 229)'); // indigo-600
        
        // Replace red/brown colors with indigo
        modified = modified.replace(/#630f0f/gi, 'rgb(129, 140, 248)'); // indigo-400
        modified = modified.replace(/#7f3e3b/gi, 'rgb(165, 180, 252)'); // indigo-300
        
        // Also replace in style attributes specifically
        modified = modified.replace(/fill:#033440/gi, 'fill:rgb(99, 102, 241)');
        modified = modified.replace(/stroke:#033440/gi, 'stroke:rgb(99, 102, 241)');
        modified = modified.replace(/fill:#263238/gi, 'fill:rgb(79, 70, 229)');
        modified = modified.replace(/stroke:#263238/gi, 'stroke:rgb(79, 70, 229)');
        modified = modified.replace(/fill:#630f0f/gi, 'fill:rgb(129, 140, 248)');
        modified = modified.replace(/stroke:#630f0f/gi, 'stroke:rgb(129, 140, 248)');
        modified = modified.replace(/fill:#7f3e3b/gi, 'fill:rgb(165, 180, 252)');
        modified = modified.replace(/stroke:#7f3e3b/gi, 'stroke:rgb(165, 180, 252)');
    }
    // For first image, use lighter indigo colors
    else if (isFirstImage) {
        // Replace dark teal/cyan colors with lighter indigo
        modified = modified.replace(/#03323D/gi, 'rgb(99, 102, 241)'); // indigo-500 (lighter)
        modified = modified.replace(/#263238/gi, 'rgb(79, 70, 229)'); // indigo-600 (lighter)
        
        // Also replace in style attributes specifically
        modified = modified.replace(/fill:#03323D/gi, 'fill:rgb(99, 102, 241)');
        modified = modified.replace(/stroke:#03323D/gi, 'stroke:rgb(99, 102, 241)');
        modified = modified.replace(/fill:#263238/gi, 'fill:rgb(79, 70, 229)');
        modified = modified.replace(/stroke:#263238/gi, 'stroke:rgb(79, 70, 229)');
    } else {
        // For other images, use darker indigo colors
        modified = modified.replace(/#03323D/gi, 'rgb(55, 48, 163)'); // indigo-800
        modified = modified.replace(/#263238/gi, 'rgb(67, 56, 202)'); // indigo-700
        
        // Also replace in style attributes specifically
        modified = modified.replace(/fill:#03323D/gi, 'fill:rgb(55, 48, 163)');
        modified = modified.replace(/stroke:#03323D/gi, 'stroke:rgb(55, 48, 163)');
        modified = modified.replace(/fill:#263238/gi, 'fill:rgb(67, 56, 202)');
        modified = modified.replace(/stroke:#263238/gi, 'stroke:rgb(67, 56, 202)');
    }
    
    // Common color replacements to indigo
    // Blue colors to indigo-500/600
    modified = modified.replace(/#3b82f6|#2563eb|#1d4ed8|rgb\(59,\s*130,\s*246\)|rgb\(37,\s*99,\s*235\)|rgb\(29,\s*78,\s*216\)/gi, 'rgb(99, 102, 241)'); // indigo-500
    modified = modified.replace(/#60a5fa|rgb\(96,\s*165,\s*250\)/gi, 'rgb(129, 140, 248)'); // indigo-400
    modified = modified.replace(/#1e40af|rgb\(30,\s*64,\s*175\)/gi, 'rgb(79, 70, 229)'); // indigo-600
    
    // Purple/Violet to indigo
    modified = modified.replace(/#8b5cf6|#7c3aed|rgb\(139,\s*92,\s*246\)|rgb\(124,\s*58,\s*237\)/gi, 'rgb(99, 102, 241)'); // indigo-500
    modified = modified.replace(/#a78bfa|rgb\(167,\s*139,\s*250\)/gi, 'rgb(129, 140, 248)'); // indigo-400
    
    // Teal/Cyan to indigo
    modified = modified.replace(/#06b6d4|#0891b2|rgb\(6,\s*182,\s*212\)|rgb\(8,\s*145,\s*178\)/gi, 'rgb(99, 102, 241)'); // indigo-500
    
    // Light blue to indigo-300
    modified = modified.replace(/#93c5fd|#bfdbfe|rgb\(147,\s*197,\s*253\)|rgb\(191,\s*219,\s*254\)/gi, 'rgb(165, 180, 252)'); // indigo-300
    
    // Dark blue to indigo-700/800
    modified = modified.replace(/#1e3a8a|rgb\(30,\s*58,\s*138\)/gi, 'rgb(67, 56, 202)'); // indigo-700
    
    return modified;
};

const HowItWorks = () => {
    const { t, language } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    const steps = [
        {
            svgContent: modifySvgColors(step1SvgContent, true, false), // First image with lighter colors
            titleKey: 'howItWorks.steps.step1.title',
            descKey: 'howItWorks.steps.step1.desc',
        },
        {
            svgContent: modifySvgColors(step2SvgContent, false, false),
            titleKey: 'howItWorks.steps.step2.title',
            descKey: 'howItWorks.steps.step2.desc',
        },
        {
            svgContent: modifySvgColors(step3SvgContent, false, true), // Third image (Stream or Share) with specific colors
            titleKey: 'howItWorks.steps.step3.title',
            descKey: 'howItWorks.steps.step3.desc',
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