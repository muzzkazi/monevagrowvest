import Header from "@/components/Header";
import SecondaryBand from "@/components/SecondaryBand";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import SuccessStories from "@/components/SuccessStories";
import Partners from "@/components/Partners";
import FeaturedInsights from "@/components/FeaturedInsights";
import StockRecommendations from "@/components/StockRecommendations";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { ParallaxWrapper } from "@/hooks/useCSSParallax";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <SecondaryBand />
      <main id="home">
        <Hero />
        
        <ParallaxWrapper speed={0.08} direction="up">
          <AnimatedSection animation="fade-in">
            <Testimonials />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={0.05} direction="up">
          <AnimatedSection animation="slide-right" delay={0.1}>
            <SuccessStories />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={0.1} direction="up">
          <AnimatedSection animation="scale-in">
            <Partners />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={0.06} direction="up">
          <AnimatedSection animation="fade-in" delay={0.1}>
            <StockRecommendations />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={0.08} direction="up">
          <AnimatedSection animation="slide-left" delay={0.1}>
            <FeaturedInsights />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={0.04} direction="up">
          <AnimatedSection animation="scale-in">
            <CallToAction />
          </AnimatedSection>
        </ParallaxWrapper>
      </main>
      <Footer />
      <WhatsAppButton message="Hi! I'm interested in your financial planning services" />
    </div>
  );
};

export default Index;
