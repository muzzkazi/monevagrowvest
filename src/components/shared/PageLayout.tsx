import Header from "@/components/Header";
import TickerBand from "@/components/TickerBand";
import Footer from "@/components/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Header />
      <TickerBand />
      {children}
      <Footer />
    </div>
  );
};

export default PageLayout;