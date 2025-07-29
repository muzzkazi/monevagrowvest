import Header from "@/components/Header";
import TickerBand from "@/components/TickerBand";
import SecondaryBand from "@/components/SecondaryBand";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import SuccessStories from "@/components/SuccessStories";
import Partners from "@/components/Partners";
import FeaturedInsights from "@/components/FeaturedInsights";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <TickerBand />
      <SecondaryBand />
      <main id="home">
        <Hero />
        <Testimonials />
        <SuccessStories />
        <Partners />
        <FeaturedInsights />
        <CallToAction />
      </main>
      <Footer />
      <WhatsAppButton message="Hi! I'm interested in your financial planning services" />
    </div>
  );
};

export default Index;