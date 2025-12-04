import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowUp } from "react-icons/io";
import { FiHelpCircle, FiChevronDown } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";
import "./Faq.scss";

const FAQSection = () => {
    const { t } = useLanguage();
    
    const faqs = [
        {
            question: t("faq.items.q1.question"),
            answer: t("faq.items.q1.answer"),
        },
        {
            question: t("faq.items.q2.question"),
            answer: t("faq.items.q2.answer"),
        },
        {
            question: t("faq.items.q3.question"),
            answer: t("faq.items.q3.answer"),
        },
        {
            question: t("faq.items.q4.question"),
            answer: t("faq.items.q4.answer"),
        },
        {
            question: t("faq.items.q5.question"),
            answer: t("faq.items.q5.answer"),
        },
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq-section" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden" style={{
            background: `
                radial-gradient(circle at 50% 20%, var(--color-indigo-600) 0%, transparent 50%),
                radial-gradient(circle at 30% 80%, var(--color-indigo-500) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, var(--color-indigo-400) 0%, transparent 60%),
                linear-gradient(135deg, var(--color-indigo-700) 0%, var(--color-indigo-600) 50%, var(--color-indigo-500) 100%)
            `
        }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 sm:mb-10 md:mb-12"
                >
                    <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
                        <div className="p-2.5 sm:p-3 bg-indigo-500/30 backdrop-blur-md rounded-full border border-white/20">
                            <FiHelpCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-indigo-300" />
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                        {t("faq.title")}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto px-2">
                        {t("faq.subtitle")}
                    </p>
                </motion.div>

                <div className="space-y-3 sm:space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl shadow-sm border border-white/20 overflow-hidden hover:bg-white/15 hover:shadow-md transition-all duration-300"
                            whileHover={{ scale: 1.01 }}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleFAQ(index);
                                    }
                                }}
                                aria-expanded={openIndex === index}
                                aria-controls={`faq-answer-${index}`}
                                className="w-full flex justify-between items-center p-4 sm:p-5 md:p-6 text-left hover:bg-white/5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg sm:rounded-xl"
                            >
                                <h3 id={`faq-question-${index}`} className="text-base sm:text-lg font-semibold text-white pr-3 sm:pr-4 flex-1 min-w-0">
                                    {faq.question}
                                </h3>
                                <div className="flex-shrink-0 ml-2">
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
                                    </motion.div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        key="content"
                                        id={`faq-answer-${index}`}
                                        role="region"
                                        aria-labelledby={`faq-question-${index}`}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                                            <div className="pt-3 sm:pt-4 border-t border-white/20">
                                                <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border border-primary-100">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            Still have questions?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Can't find the answer you're looking for? Please chat to our friendly team.
                        </p>
                        <button className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                            Contact Support
                        </button>
                    </div>
                </motion.div> */}
            </div>
        </section>
    );
};

export default FAQSection;
