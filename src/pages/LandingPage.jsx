import React, { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import Hero from '../components/Hero/Hero'
import Features from '../components/Features/Features'
import HowItWorks from '../components/HowItWorks/HowItWorks'
import Pricing from '../components/Pricing/Pricing'
import Footer from '../components/Footer/Footer'
import CTASection from '../components/CTASection/CTASection'
import AboutUsDescription, { AboutUsDescriptionReversedImage } from '../components/AboutIntro/AboutIntro'
import FAQSection from '../components/Faq/Faq'
import LandingOptions from '../components/LandingOptions/LandingOptions'
import DashboardDemo from '../components/DashboardDemo/DashboardDemo'

const LandingPage = () => {
  const [cookies] = useCookies(['MegaBox'])
  const isLoggedIn = !!cookies.MegaBox

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <div className="w-full bg-light dark:bg-dark transition-colors duration-300">
      <Hero />
      <Features />
      <div id="about">
        <AboutUsDescription />
        <AboutUsDescriptionReversedImage />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      {!isLoggedIn && <DashboardDemo />}
      <div id="pricing">
        <Pricing />
      </div>
      <LandingOptions />
      {!isLoggedIn && <CTASection />}
      <div id="faq">
        <FAQSection />
      </div>
      <Footer />
    </div>
  )
}

export default LandingPage 