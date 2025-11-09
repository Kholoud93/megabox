import React from 'react'
import { HeroForAboutUs } from '../../components/Hero/Hero'
import AboutUsIntroduction, { AboutUsDescriptionReversedImage } from '../../components/AboutIntro/AboutIntro'
import FAQSection from '../../components/Faq/Faq'
import Footer from '../../components/Footer/Footer'

export default function About() {
    return <>
        <HeroForAboutUs />
        <AboutUsIntroduction />
        <AboutUsDescriptionReversedImage />
        <FAQSection />
        <Footer />
    </>
}
