import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowUp } from "react-icons/io";
import { FiHelpCircle, FiChevronDown } from "react-icons/fi";

const FAQSection = () => {
    const faqs = [
        {
            question: "Why join the MegaBox referral program?",
            answer:
                "MegaBox is an innovative cloud storage app that offers 1024 GB of free lifetime cloud storage. Join the program and let's grow and succeed together.",
        },
        {
            question: "How can I earn commissions?",
            answer:
                "You earn a commission every time a new user registers on MegaBox using the link you shared.",
        },
        {
            question: "How can I track my commission?",
            answer:
                "You will be able to view detailed reports about your commissions and the number of registrations through your shared link in the Admin Center.",
        },
        {
            question: "When and how do I get paid?",
            answer:
                "You can see reward details in the Admin Center and withdraw your rewards. (This feature will be available in July 2025.) We will provide a dashboard where you can access all payout information.",
        },
        {
            question: "What does it cost to join?",
            answer:
                "Joining the program is completely free. You don't need to pay anything.",
        },
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 md:py-24 relative overflow-hidden" style={{
            background: `
                radial-gradient(circle at 50% 20%, var(--color-indigo-600) 0%, transparent 50%),
                radial-gradient(circle at 30% 80%, var(--color-indigo-500) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, var(--color-indigo-400) 0%, transparent 60%),
                linear-gradient(135deg, var(--color-indigo-700) 0%, var(--color-indigo-600) 50%, var(--color-indigo-500) 100%)
            `
        }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-indigo-500/30 backdrop-blur-md rounded-full border border-white/20">
                            <FiHelpCircle className="h-8 w-8 text-indigo-300" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-200 max-w-2xl mx-auto">
                        Find answers to common questions about MegaBox referral program and services
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 overflow-hidden hover:bg-white/15 hover:shadow-md transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors duration-200"
                            >
                                <h3 className="text-lg font-semibold text-white pr-4">
                                    {faq.question}
                                </h3>
                                <div className="flex-shrink-0">
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FiChevronDown className="w-5 h-5 text-indigo-300" />
                                    </motion.div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6">
                                            <div className="pt-4 border-t border-white/20">
                                                <p className="text-gray-200 leading-relaxed">
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
