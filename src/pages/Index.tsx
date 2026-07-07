import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import SecondaryBand from "@/components/SecondaryBand";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import DeferredMount from "@/components/DeferredMount";
import { AnimatedSection, ParallaxSection } from "@/hooks/useScrollAnimation";

// Below-the-fold sections: code-split + deferred mount.
// This prevents their JS, components AND data fetches (broker-recos,
// market-news, etc.) from competing with the LCP hero.
const InvestingLabTeaser = lazy(() => import("@/components/InvestingLabTeaser"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const SuccessStories = lazy(() => import("@/components/SuccessStories"));
const Partners = lazy(() => import("@/components/Partners"));
const MarketInsightsTeaser = lazy(() => import("@/components/MarketInsightsTeaser"));
const CallToAction = lazy(() => import("@/components/CallToAction"));

const SectionFallback = () => (
  <div className="py-16 sm:py-24" aria-hidden="true" />
);

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <SecondaryBand />
      <main id="home" className="relative">
        <Hero />

        <Suspense fallback={<SectionFallback />}>
          <DeferredMount minHeight={520}>
            <ParallaxSection speed={0.03} className="relative z-10">
              <AnimatedSection animation="fade-in">
                <InvestingLabTeaser />
              </AnimatedSection>
            </ParallaxSection>
          </DeferredMount>

          <DeferredMount minHeight={480}>
            <ParallaxSection speed={0.05} className="relative z-10">
              <AnimatedSection animation="fade-in">
                <Testimonials />
              </AnimatedSection>
            </ParallaxSection>
          </DeferredMount>


          <DeferredMount minHeight={480}>
            <ParallaxSection speed={-0.03} className="relative z-10">
              <AnimatedSection animation="slide-right" delay={0.05}>
                <SuccessStories />
              </AnimatedSection>
            </ParallaxSection>
          </DeferredMount>

          <DeferredMount minHeight={320}>
            <ParallaxSection speed={0.04} className="relative z-10">
              <AnimatedSection animation="scale-in">
                <Partners />
              </AnimatedSection>
            </ParallaxSection>
          </DeferredMount>

          <DeferredMount minHeight={480}>
            <ParallaxSection speed={-0.04} className="relative z-10">
              <AnimatedSection animation="fade-in" delay={0.05}>
                <MarketInsightsTeaser />
              </AnimatedSection>
            </ParallaxSection>
          </DeferredMount>



          <DeferredMount minHeight={320}>
            <ParallaxSection speed={-0.02} className="relative z-10">
              <AnimatedSection animation="scale-in">
                <CallToAction />
              </AnimatedSection>
            </ParallaxSection>
          </DeferredMount>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton message="Hi! I'm interested in your financial planning services" />
    </div>
  );
};

export default Index;
