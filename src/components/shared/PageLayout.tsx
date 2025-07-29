import Header from "@/components/Header";

import Footer from "@/components/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {children}
      <Footer />
    </div>
  );
};

export default PageLayout;