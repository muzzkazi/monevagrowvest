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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <SecondaryBand />
      <main id="home">
        <Hero />
        
        <AnimatedSection animation="fade-in">
          <Testimonials />
        </AnimatedSection>
        
        <AnimatedSection animation="slide-right" delay={0.1}>
          <SuccessStories />
        </AnimatedSection>
        
        <AnimatedSection animation="scale-in">
          <Partners />
        </AnimatedSection>
        
        <AnimatedSection animation="fade-in" delay={0.1}>
          <StockRecommendations />
        </AnimatedSection>
        
        <AnimatedSection animation="slide-left" delay={0.1}>
          <FeaturedInsights />
        </AnimatedSection>
        
        <AnimatedSection animation="scale-in">
          <CallToAction />
        </AnimatedSection>
      </main>
      <Footer />
      <WhatsAppButton message="Hi! I'm interested in your financial planning services" />
    </div>
  );
};

export default Index;
