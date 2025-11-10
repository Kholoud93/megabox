import React from "react";
import { motion } from "framer-motion";
import { FiShield, FiDatabase, FiGlobe, FiLink } from "react-icons/fi";
import heroImage from "../../assets/undraw_sync-files_64mj.svg";
import heroImage2 from "../../assets/undraw_online-banking_l9sn.svg";

const AboutUsDescription = () => {
    return (
        <section className="py-16 md:py-24 relative overflow-hidden" style={{
            background: `
                radial-gradient(circle at 15% 25%, var(--color-indigo-600) 0%, transparent 50%),
                radial-gradient(circle at 85% 75%, var(--color-indigo-500) 0%, transparent 50%),
                radial-gradient(circle at 45% 55%, var(--color-indigo-400) 0%, transparent 65%),
                radial-gradient(circle at 70% 30%, var(--color-indigo-700) 0%, transparent 40%),
                linear-gradient(135deg, var(--color-indigo-700) 0%, var(--color-indigo-600) 50%, var(--color-indigo-500) 100%)
            `
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Image on the left */}
                    <motion.div
                        className="w-full lg:w-1/2"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-indigo-400/20 rounded-2xl transform rotate-3"></div>
                            <img
                                src={heroImage}
                                alt="Secure Data Storage"
                                className="relative w-full max-w-lg mx-auto object-cover rounded-2xl shadow-2xl"
                            />
                        </div>
                    </motion.div>

                    {/* Text on the right */}
                    <motion.div
                        className="w-full lg:w-1/2 space-y-8"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-4">
                                    Your Safe Place to Store Data
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-indigo-400 to-indigo-300 rounded-full"></div>
                            </div>

                            <p className="text-xl text-gray-200 leading-relaxed">
                                Mega Box is a secure and reliable cloud platform designed to
                                protect everything you care about. From important documents and
                                business files to personal photos and videos, your data is always
                                encrypted and stored safely.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-white">
                                Why choose Mega Box?
                            </h3>
                            <p className="text-gray-200 leading-relaxed">
                                We believe storing your data should be simple and stress-free.
                                Here are some reasons why thousands of users trust Mega Box every day:
                            </p>

                            <div className="grid gap-6">
                                <motion.div
                                    className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.03 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiShield className="w-6 h-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Advanced Security</h4>
                                        <p className="text-gray-200">Every file you upload is protected with state-of-the-art encryption, ensuring your data stays private and secure.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.03 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiDatabase className="w-6 h-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Generous Storage</h4>
                                        <p className="text-gray-200">Enjoy up to <span className="font-semibold text-indigo-300">1TB</span> of cloud space, giving you the freedom to save, organize, and access all your content whenever you need it.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.03 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiGlobe className="w-6 h-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Seamless Access</h4>
                                        <p className="text-gray-200">Whether you're working on your laptop, tablet, or phone, Mega Box keeps your files in sync across all your devices.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.03 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiLink className="w-6 h-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Safe Sharing Links</h4>
                                        <p className="text-gray-200">Share your files with confidence using secure links that protect your content and control who can access it.</p>
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
    return (
        <section className="py-16 md:py-24 relative overflow-hidden" style={{
            background: `
                radial-gradient(circle at 10% 20%, var(--color-indigo-500) 0%, transparent 45%),
                radial-gradient(circle at 90% 80%, var(--color-indigo-600) 0%, transparent 45%),
                radial-gradient(circle at 60% 40%, var(--color-indigo-700) 0%, transparent 60%),
                radial-gradient(circle at 30% 70%, var(--color-indigo-400) 0%, transparent 55%),
                linear-gradient(135deg, var(--color-indigo-800) 0%, var(--color-indigo-700) 50%, var(--color-indigo-600) 100%)
            `
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
                    {/* Image on the right */}
                    <motion.div
                        className="w-full lg:w-1/2"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-indigo-500/20 rounded-2xl transform -rotate-3"></div>
                            <img
                                src={heroImage2}
                                alt="Earning Money Securely"
                                className="relative w-full max-w-lg mx-auto object-cover rounded-2xl shadow-2xl"
                            />
                        </div>
                    </motion.div>

                    {/* Text on the left */}
                    <motion.div
                        className="w-full lg:w-1/2 space-y-8"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-4">
                                    Earn Money Safely with Mega Box
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-indigo-400 to-indigo-300 rounded-full"></div>
                            </div>

                            <p className="text-xl text-gray-200 leading-relaxed">
                                Mega Box isn't just a place to store your files—it's a platform
                                where you can share your content and earn income securely. Whether
                                you create videos, documents, or digital products, Mega Box makes it
                                easy to monetize your work with confidence.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-white">
                                Why trust Mega Box for your earnings?
                            </h3>
                            <p className="text-gray-200 leading-relaxed">
                                We are committed to helping you grow your revenue while keeping
                                your data and payments fully protected. Here are some of the reasons
                                creators and businesses rely on us:
                            </p>

                            <div className="grid gap-6">
                                <motion.div
                                    className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.03 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiShield className="w-6 h-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Secure Transactions</h4>
                                        <p className="text-gray-200">All financial operations are encrypted and processed through trusted payment providers, ensuring your earnings reach you safely and quickly.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.03 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiDatabase className="w-6 h-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Protected Content</h4>
                                        <p className="text-gray-200">Your files remain secure behind robust encryption, so you can confidently share your work without worrying about unauthorized access.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="flex items-start space-x-4 p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:shadow-md transition-all duration-300"
                                    whileHover={{ y: -2, scale: 1.03 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                                        <FiGlobe className="w-6 h-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Flexible Monetization</h4>
                                        <p className="text-gray-200">Set your own prices, offer subscriptions, or share paid downloads—Mega Box gives you the tools to earn on your terms.</p>
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
