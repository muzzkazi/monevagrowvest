import Header from "@/components/Header";
import TickerBand from "@/components/TickerBand";
import SecondaryBand from "@/components/SecondaryBand";
import Footer from "@/components/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Header />
      <TickerBand />
      <SecondaryBand />
      {children}
      <Footer />
    </div>
  );
};

export default PageLayout;