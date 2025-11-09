import React, { useEffect } from 'react'
import Hero from '../components/Hero/Hero'
import Features from '../components/Features/Features'
import HowItWorks from '../components/HowItWorks/HowItWorks'
import Pricing from '../components/Pricing/Pricing'
import Footer from '../components/Footer/Footer'
import CTASection from '../components/CTASection/CTASection'

const LandingPage = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <div className="w-full bg-light">
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage 