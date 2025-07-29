import Header from "@/components/Header";
import StockTicker from "@/components/StockTicker";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import SuccessStories from "@/components/SuccessStories";
import FeaturedInsights from "@/components/FeaturedInsights";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <StockTicker />
      <main id="home">
        <Hero />
        <Testimonials />
        <SuccessStories />
        <FeaturedInsights />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;