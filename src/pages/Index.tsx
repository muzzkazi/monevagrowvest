import Header from "@/components/Header";
import SecondaryBand from "@/components/SecondaryBand";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

import PremiumHero from "@/components/PremiumHero";
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
      <SecondaryBand />
      <main id="home">
        <PremiumHero />
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