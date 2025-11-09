import React from "react";
import { BsUpload } from "react-icons/bs";
import { MdShare } from "react-icons/md";
import { PiVideo } from "react-icons/pi";
import { AiOutlineDollarCircle } from "react-icons/ai";
import StepCard from "./StepCard";

const steps = [
    {
        title: "Upload Your Videos",
        desc: "Upload your videos to the Saqr TV platform and get unique sharing links.",
        icon: <BsUpload className="text-primary-600 text-2xl" />,
    },
    {
        title: "Share Your Content",
        desc: "Share your video links on social media and other platforms.",
        icon: <MdShare className="text-primary-600 text-2xl" />,
    },
    {
        title: "Users Watch via the App",
        desc: "When users click your link, they will watch the videos through the Tera Shield app.",
        icon: <PiVideo className="text-primary-600 text-2xl" />,
    },
    {
        title: "Earn Profits",
        desc: "Earn profits from views or downloads based on the plan you selected.",
        icon: <AiOutlineDollarCircle className="text-primary-600 text-2xl" />,
    },
];

export default function EarningSteps() {
    return (
        <section className="bg-[#f1f5f9] py-16 px-6 md:px-16">
            <div className="container mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-700">
                    How to Start Earning
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {steps.map((step, idx) => <StepCard key={idx} step={step} idx={idx} />)}
                </div>
            </div>
        </section>
    );
}
