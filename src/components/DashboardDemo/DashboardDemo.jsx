import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { FaEye, FaDownload, FaChartLine, FaFile } from 'react-icons/fa';
import './DashboardDemo.scss';

export default function DashboardDemo() {
    const { t } = useLanguage();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    // Mock data for demo
    const mockStats = [
        { icon: <FaEye />, label: t('dashboardDemo.totalViews'), value: '1,234', color: 'indigo' },
        { icon: <FaDownload />, label: t('dashboardDemo.totalDownloads'), value: '567', color: 'purple' },
        { icon: <FaChartLine />, label: t('dashboardDemo.activeFiles'), value: '12', color: 'green' },
        { icon: <FaFile />, label: t('dashboardDemo.totalFiles'), value: '45', color: 'orange' }
    ];

    const mockFiles = [
        { name: t('dashboardDemo.sampleFile1'), views: '234', downloads: '89' },
        { name: t('dashboardDemo.sampleFile2'), views: '189', downloads: '56' },
        { name: t('dashboardDemo.sampleFile3'), views: '156', downloads: '34' }
    ];

    return (
        <section className="dashboard-demo">
            <div className="dashboard-demo__container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="dashboard-demo__header"
                >
                    <h2 className="dashboard-demo__title">
                        {t('dashboardDemo.title')}
                    </h2>
                    <p className="dashboard-demo__subtitle">
                        {t('dashboardDemo.subtitle')}
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="dashboard-demo__content"
                >
                    {/* Stats Cards */}
                    <div className="dashboard-demo__stats">
                        {mockStats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className={`dashboard-demo__stat-card dashboard-demo__stat-card--${stat.color}`}
                            >
                                <div className="dashboard-demo__stat-icon">{stat.icon}</div>
                                <div className="dashboard-demo__stat-content">
                                    <div className="dashboard-demo__stat-value">{stat.value}</div>
                                    <div className="dashboard-demo__stat-label">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart Area */}
                    <motion.div
                        variants={itemVariants}
                        className="dashboard-demo__chart"
                    >
                        <div className="dashboard-demo__chart-header">
                            <h3 className="dashboard-demo__chart-title">
                                {t('dashboardDemo.chartTitle')}
                            </h3>
                        </div>
                        <div className="dashboard-demo__chart-content">
                            <div className="dashboard-demo__chart-bars">
                                {[65, 80, 45, 90, 70, 55, 85].map((height, idx) => (
                                    <div
                                        key={idx}
                                        className="dashboard-demo__chart-bar"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                            <div className="dashboard-demo__chart-labels">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                                    <span key={idx} className="dashboard-demo__chart-label">{day}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Files Table */}
                    <motion.div
                        variants={itemVariants}
                        className="dashboard-demo__files"
                    >
                        <div className="dashboard-demo__files-header">
                            <h3 className="dashboard-demo__files-title">
                                {t('dashboardDemo.recentFiles')}
                            </h3>
                        </div>
                        <div className="dashboard-demo__files-table">
                            <div className="dashboard-demo__files-row dashboard-demo__files-row--header">
                                <div className="dashboard-demo__files-cell">{t('dashboardDemo.fileName')}</div>
                                <div className="dashboard-demo__files-cell">{t('dashboardDemo.views')}</div>
                                <div className="dashboard-demo__files-cell">{t('dashboardDemo.downloads')}</div>
                            </div>
                            {mockFiles.map((file, idx) => (
                                <div key={idx} className="dashboard-demo__files-row">
                                    <div className="dashboard-demo__files-cell dashboard-demo__files-cell--name">
                                        <FaFile className="dashboard-demo__file-icon" />
                                        {file.name}
                                    </div>
                                    <div className="dashboard-demo__files-cell">{file.views}</div>
                                    <div className="dashboard-demo__files-cell">{file.downloads}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                    className="dashboard-demo__note"
                >
                    <p className="dashboard-demo__note-text">
                        {t('dashboardDemo.note')}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

