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
import { AnimatedSection, ParallaxSection } from "@/hooks/useScrollAnimation";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <SecondaryBand />
      <main id="home" className="relative">
        <Hero />
        
        <ParallaxSection speed={0.05} className="relative z-10">
          <AnimatedSection animation="fade-in">
            <Testimonials />
          </AnimatedSection>
        </ParallaxSection>
        
        <ParallaxSection speed={-0.03} className="relative z-10">
          <AnimatedSection animation="slide-right" delay={0.05}>
            <SuccessStories />
          </AnimatedSection>
        </ParallaxSection>
        
        <ParallaxSection speed={0.04} className="relative z-10">
          <AnimatedSection animation="scale-in">
            <Partners />
          </AnimatedSection>
        </ParallaxSection>
        
        <ParallaxSection speed={-0.05} className="relative z-10">
          <AnimatedSection animation="fade-in" delay={0.05}>
            <StockRecommendations />
          </AnimatedSection>
        </ParallaxSection>
        
        <ParallaxSection speed={0.03} className="relative z-10">
          <AnimatedSection animation="slide-left" delay={0.05}>
            <FeaturedInsights />
          </AnimatedSection>
        </ParallaxSection>
        
        <ParallaxSection speed={-0.02} className="relative z-10">
          <AnimatedSection animation="scale-in">
            <CallToAction />
          </AnimatedSection>
        </ParallaxSection>
      </main>
      <Footer />
      <WhatsAppButton message="Hi! I'm interested in your financial planning services" />
    </div>
  );
};

export default Index;
