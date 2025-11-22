import React from "react";
import { motion } from "framer-motion";
import PartnerCards from "./PartnerCards";
import './PartnerIntro.scss'
import { BsUpload } from "react-icons/bs";
import { MdVideoLibrary } from "react-icons/md";
import { LuDownload } from "react-icons/lu";
import { PiFileVideoBold } from "react-icons/pi";
import { TbDeviceAnalytics } from "react-icons/tb";
import { AiOutlineFileProtect } from "react-icons/ai";
import { useLanguage } from "../../context/LanguageContext";
import abstractBg from '../../assets/Images/abstract bg.avif';

export default function PartnerIntro() {
    const { t } = useLanguage();

    const Services = [
        {
            title: t('partners.services.videoUploads.title'),
            desc: t('partners.services.videoUploads.desc'),
            icon: <BsUpload />
        },
        {
            title: t('partners.services.videoPlayer.title'),
            desc: t('partners.services.videoPlayer.desc'),
            icon: <MdVideoLibrary />
        },
        {
            title: t('partners.services.referrals.title'),
            desc: t('partners.services.referrals.desc'),
            icon: <LuDownload />
        },
        {
            title: t('partners.services.viewEarnings.title'),
            desc: t('partners.services.viewEarnings.desc'),
            icon: <PiFileVideoBold />
        },
        {
            title: t('partners.services.analytics.title'),
            desc: t('partners.services.analytics.desc'),
            icon: <TbDeviceAnalytics />
        },
        {
            title: t('partners.services.protection.title'),
            desc: t('partners.services.protection.desc'),
            icon: <AiOutlineFileProtect />
        }
    ]

    return (
        <section className="partner-intro" style={{ backgroundImage: `url(${abstractBg})` }}>
            <div className="partner-intro__overlay"></div>
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="partner-intro__title"
            >
                {t('partners.title')}
            </motion.h2>
            <div className="partner-intro__grid">
                {Services.map((ele, idx) => <PartnerCards index={idx} key={idx} desc={ele.desc} title={ele.title} icon={ele.icon} />)}
            </div>
        </section>
    );
}
