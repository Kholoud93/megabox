import React, { useEffect } from 'react'
import Hero from '../components/Hero/Hero'
import Features from '../components/Features/Features'
import HowItWorks from '../components/HowItWorks/HowItWorks'
import Pricing from '../components/Pricing/Pricing'
import Footer from '../components/Footer/Footer'
import CTASection from '../components/CTASection/CTASection'
import AboutUsDescription, { AboutUsDescriptionReversedImage } from '../components/AboutIntro/AboutIntro'
import FAQSection from '../components/Faq/Faq'

const LandingPage = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <div className="w-full bg-light">
      <Hero />
      <Features />
      <AboutUsDescription />
      <AboutUsDescriptionReversedImage />
      <HowItWorks />
      <Pricing />
      <CTASection />
      <FAQSection />
      <Footer />
    </div>
  )
}

export default LandingPage 