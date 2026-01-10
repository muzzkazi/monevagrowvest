import Header from "@/components/Header";
import SecondaryBand from "@/components/SecondaryBand";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import { ParallaxWrapper, ParallaxContainer } from "@/components/shared/ParallaxWrapper";

import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import SuccessStories from "@/components/SuccessStories";
import Partners from "@/components/Partners";
import FeaturedInsights from "@/components/FeaturedInsights";
import StockRecommendations from "@/components/StockRecommendations";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const Index = () => {
  return (
    <ParallaxContainer className="min-h-screen">
      <Header />
      <SecondaryBand />
      <main id="home">
        <Hero />
        
        <ParallaxWrapper speed={-0.15}>
          <AnimatedSection animation="fade-in">
            <Testimonials />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={0.1}>
          <AnimatedSection animation="slide-right" delay={0.1}>
            <SuccessStories />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={-0.1}>
          <AnimatedSection animation="scale-in">
            <Partners />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={0.15}>
          <AnimatedSection animation="fade-in" delay={0.1}>
            <StockRecommendations />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={-0.12}>
          <AnimatedSection animation="slide-left" delay={0.1}>
            <FeaturedInsights />
          </AnimatedSection>
        </ParallaxWrapper>
        
        <ParallaxWrapper speed={0.08}>
          <AnimatedSection animation="scale-in">
            <CallToAction />
          </AnimatedSection>
        </ParallaxWrapper>
      </main>
      <Footer />
      <WhatsAppButton message="Hi! I'm interested in your financial planning services" />
    </ParallaxContainer>
  );
};

export default Index;
