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

const Services = [
    {
        title: "Video Uploads",
        desc: "Easily upload videos and get unique sharing links to increase the reach of your content.",
        icon: <BsUpload className='text-primary-700 text-xl' />
    },
    {
        title: "Specialized Video Player",
        desc: "The Tera Shield app offers an exceptional and seamless viewing experience for all types of videos.",
        icon: <MdVideoLibrary className='text-primary-700 text-xl' />
    },
    {
        title: "Referrals and Downloads",
        desc: "Earn money by referring new users to download the app via your sharing link.",
        icon: <LuDownload className='text-primary-700 text-xl' />
    },
    {
        title: "View Earnings",
        desc: "Earn from every view your content receives through the app.",
        icon: <PiFileVideoBold className='text-primary-700 text-xl' />
    },
    {
        title: "Detailed Analytics",
        desc: "Accurately track views, downloads, and earnings through an integrated dashboard.",
        icon: <TbDeviceAnalytics className='text-primary-700 text-xl' />
    },
    {
        title: "Content Protection",
        desc: "Tera Shield protects your content and ensures it cannot be played outside the app.",
        icon: <AiOutlineFileProtect className='text-primary-700 text-xl' />
    }
]


export default function PartnerIntro() {
    return (
        <section className="bg-gray-50 py-16 px-6 md:px-16">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-700"
            >
                Our Services
            </motion.h2>
            <div className="grid gap-4 md:grid-cols-3 container mx-auto">
                {Services.map((ele, idx) => <PartnerCards index={idx} key={idx} desc={ele.desc} title={ele.title} icon={ele.icon} />)}
            </div>
        </section>
    );
}
