import React, { useEffect } from 'react'
import { HeroForSubscription } from '../../components/Hero/Hero'
import PartnerIntro from '../../components/PartnerIntro/PartnerIntro'
import Footer from '../../components/Footer/Footer'
import PartnerCTA from '../../components/PartnerCta/PartnerCta'
import EarningSteps from '../../components/EarningSteps/EarningSteps'

export default function Partners() {

    useEffect(() => {
// scroll function 
        window.scrollTo(0, 0);
    }, [])

    return <>
        <HeroForSubscription />
        <PartnerIntro />
        <EarningSteps />
        <PartnerCTA />
        <Footer />
    </>
}
