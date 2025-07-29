import Header from "@/components/Header";
import StockTicker from "@/components/StockTicker";
import Footer from "@/components/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Header />
      <StockTicker />
      {children}
      <Footer />
    </div>
  );
};

export default PageLayout;