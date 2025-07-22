import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-primary">Moneva</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')} 
              className="text-foreground hover:text-financial-accent transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-foreground hover:text-financial-accent transition-colors cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('services')} 
              className="text-foreground hover:text-financial-accent transition-colors cursor-pointer"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('calculators')} 
              className="text-foreground hover:text-financial-accent transition-colors cursor-pointer"
            >
              Calculators
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-foreground hover:text-financial-accent transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
          
          <Button className="hidden md:block bg-financial-accent hover:bg-financial-accent/90 text-white">
            Get Started
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('home')} 
                className="block w-full text-left text-foreground hover:text-financial-accent transition-colors py-2"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="block w-full text-left text-foreground hover:text-financial-accent transition-colors py-2"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="block w-full text-left text-foreground hover:text-financial-accent transition-colors py-2"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('calculators')} 
                className="block w-full text-left text-foreground hover:text-financial-accent transition-colors py-2"
              >
                Calculators
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="block w-full text-left text-foreground hover:text-financial-accent transition-colors py-2"
              >
                Contact
              </button>
              <Button className="w-full bg-financial-accent hover:bg-financial-accent/90 text-white mt-4">
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;