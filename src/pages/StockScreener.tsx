import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StockScreener from "@/components/StockScreener";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const StockScreenerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <StockScreener />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default StockScreenerPage;
