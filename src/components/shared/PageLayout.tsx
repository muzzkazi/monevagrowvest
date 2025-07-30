import Header from "@/components/Header";
import SecondaryBand from "@/components/SecondaryBand";
import Footer from "@/components/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Header />
      <SecondaryBand />
      {children}
      <Footer />
    </div>
  );
};

export default PageLayout;