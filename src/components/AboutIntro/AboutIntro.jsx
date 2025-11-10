import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiShield, FiDatabase, FiGlobe, FiLink } from "react-icons/fi";
import privateDataSvgContent from "../../assets/animations/private-data-animate.svg?raw";
import nftSvgContent from "../../assets/animations/nft-animate.svg?raw";
import { modifySvgToIndigo } from "../../utils/svgColorModifier";
import { useLanguage } from "../../context/LanguageContext";

const PrivateDataAnimation = () => {
    const svgRef = useRef(null);
    const modifiedSvgContent = modifySvgToIndigo(privateDataSvgContent, { isFirstImage: false, isThirdImage: false });

    useEffect(() => {
        if (svgRef.current) {
            const svgElement = svgRef.current.querySelector('svg');
            if (svgElement) {
                svgElement.classList.add('animated');
            }
        }
    }, []);

    return (
        <div 
            className="w-full max-w-lg mx-auto"
            ref={svgRef}
            dangerouslySetInnerHTML={{ __html: modifiedSvgContent }}
        />
    );
};

const NFTAnimation = () => {
    const svgRef = useRef(null);
    const modifiedSvgContent = modifySvgToIndigo(nftSvgContent, { isFirstImage: false, isThirdImage: false });

    useEffect(() => {
        if (svgRef.current) {
            const svgElement = svgRef.current.querySelector('svg');
            if (svgElement) {
                svgElement.classList.add('animated');
            }
        }
    }, []);

    return (
        <div 
            className="w-full max-w-lg mx-auto"
            ref={svgRef}
            dangerouslySetInnerHTML={{ __html: modifiedSvgContent }}
        />
    );
};

const AboutUsDescription = () => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    
    return (
        <section id="about-storage" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden" style={{
            background: `
                radial-gradient(circle at 15% 25%, var(--color-indigo-600) 0%, transparent 50%),
                radial-gradient(circle at 85% 75%, var(--color-indigo-500) 0%, transparent 50%),
                radial-gradient(circle at 45% 55%, var(--color-indigo-400) 0%, transparent 65%),
                radial-gradient(circle at 70% 30%, var(--color-indigo-700) 0%, transparent 40%),
                linear-gradient(135deg, var(--color-indigo-700) 0%, var(--color-indigo-600) 50%, var(--color-indigo-500) 100%)
            `
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16">
                    {/* Image on the left */}
                    <motion.div
                        className="w-full sm:w-5/6 md:w-4/5 lg:w-1/2"
                        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-indigo-400/20 rounded-xl sm:rounded-2xl transform rotate-2 sm:rotate-3"></div>
                            <div className="relative w-full max-w-lg mx-auto rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden">
                                <PrivateDataAnimation />
                            </div>
                        </div>
                    </motion.div>

                    {/* Text on the right */}
                    <motion.div
                        className="w-full lg:w-1/2 space-y-6 sm:space-y-7 md:space-y-8"
                        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <div className="space-y-4 sm:space-y-5 md:space-y-6">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                                    {t("about.storage.title")}
                                </h2>
                                <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-indigo-400 to-indigo-300 rounded-full"></div>
                            </div>

                            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">
                                {t("about.storage.description")}
                            </p>
                        </div>

                        <div className="space-y-4 sm:space-y-5 md:space-y-6">
                            <h3 className="text-xl sm:text-2xl font-semibold text-white">
                                {t("about.storage.whyChoose")}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                                {t("about.storage.whyChooseDesc")}
                            </p>

                            <div className="grid gap-4 sm:gap-5 md:gap-6">
                                <motion.div
                                    className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 md:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiShield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{t("about.storage.features.security.title")}</h4>
                                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">{t("about.storage.features.security.description")}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 md:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiDatabase className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{t("about.storage.features.storage.title")}</h4>
                                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                                            {t("about.storage.features.storage.description").split("{storage}").map((part, index, array) => 
                                                index < array.length - 1 ? (
                                                    <React.Fragment key={index}>
                                                        {part}
                                                        <span className="font-semibold text-indigo-300">{t("about.storage.features.storage.storageValue")}</span>
                                                    </React.Fragment>
                                                ) : part
                                            )}
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 md:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiGlobe className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{t("about.storage.features.access.title")}</h4>
                                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">{t("about.storage.features.access.description")}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 md:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiLink className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{t("about.storage.features.sharing.title")}</h4>
                                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">{t("about.storage.features.sharing.description")}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export const AboutUsDescriptionReversedImage = () => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    
    return (
        <section id="about-earnings" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden" style={{
            background: `
                radial-gradient(circle at 10% 20%, var(--color-indigo-500) 0%, transparent 45%),
                radial-gradient(circle at 90% 80%, var(--color-indigo-600) 0%, transparent 45%),
                radial-gradient(circle at 60% 40%, var(--color-indigo-700) 0%, transparent 60%),
                radial-gradient(circle at 30% 70%, var(--color-indigo-400) 0%, transparent 55%),
                linear-gradient(135deg, var(--color-indigo-800) 0%, var(--color-indigo-700) 50%, var(--color-indigo-600) 100%)
            `
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16">
                    {/* Image on the right */}
                    <motion.div
                        className="w-full sm:w-5/6 md:w-4/5 lg:w-1/2"
                        initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-indigo-500/20 rounded-xl sm:rounded-2xl transform -rotate-2 sm:-rotate-3"></div>
                            <div className="relative w-full max-w-lg mx-auto rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden">
                                <NFTAnimation />
                            </div>
                        </div>
                    </motion.div>

                    {/* Text on the left */}
                    <motion.div
                        className="w-full lg:w-1/2 space-y-6 sm:space-y-7 md:space-y-8"
                        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <div className="space-y-4 sm:space-y-5 md:space-y-6">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                                    {t("about.earnings.title")}
                                </h2>
                                <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-indigo-400 to-indigo-300 rounded-full"></div>
                            </div>

                            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">
                                {t("about.earnings.description")}
                            </p>
                        </div>

                        <div className="space-y-4 sm:space-y-5 md:space-y-6">
                            <h3 className="text-xl sm:text-2xl font-semibold text-white">
                                {t("about.earnings.whyTrust")}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                                {t("about.earnings.whyTrustDesc")}
                            </p>

                            <div className="grid gap-4 sm:gap-5 md:gap-6">
                                <motion.div
                                    className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 md:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiShield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{t("about.earnings.features.transactions.title")}</h4>
                                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">{t("about.earnings.features.transactions.description")}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 md:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiDatabase className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{t("about.earnings.features.content.title")}</h4>
                                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">{t("about.earnings.features.content.description")}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 md:p-6 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiGlobe className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{t("about.earnings.features.monetization.title")}</h4>
                                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">{t("about.earnings.features.monetization.description")}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutUsDescription;
