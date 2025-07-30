import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Top contact bar */}
      <div className="bg-financial-accent text-white py-2 text-center text-sm">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <a href="tel:+918087855185" className="hover:underline font-medium">
              +91 80878 55185
            </a>
          </div>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">Call us for expert financial advice</span>
        </div>
      </div>
      
      <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/ed65aa4c-20d0-4af6-9c5c-9dc7c42a42d6.png" 
                alt="Moneva Logo" 
                className="h-8 w-auto"
              />
            </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors cursor-pointer ${
                location.pathname === '/' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors cursor-pointer ${
                location.pathname === '/about' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
              }`}
            >
              About
            </Link>
            <Link 
              to="/services" 
              className={`transition-colors cursor-pointer ${
                location.pathname === '/services' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
              }`}
            >
              Services
            </Link>
            <Link 
              to="/calculators" 
              className={`transition-colors cursor-pointer ${
                location.pathname === '/calculators' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
              }`}
            >
              Calculators
            </Link>
            <Link 
              to="/ai-planning" 
              className={`transition-colors cursor-pointer ${
                location.pathname === '/ai-planning' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
              }`}
            >
              AI Powered Portfolio
            </Link>
            <Link 
              to="/contact" 
              className={`transition-colors cursor-pointer ${
                location.pathname === '/contact' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
              }`}
            >
              Contact
            </Link>
          </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
              <a href="tel:+918087855185" className="text-financial-accent">
                <Phone className="h-5 w-5" />
              </a>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <a href="tel:+918087855185" className="flex items-center gap-2 text-financial-accent hover:text-financial-accent/80 transition-colors">
                <Phone className="h-4 w-4" />
                <span className="font-medium">+91 80878 55185</span>
              </a>
              <Button className="bg-financial-accent hover:bg-financial-accent/90 text-white">
                Get Started
              </Button>
            </div>
        </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left transition-colors py-2 ${
                  location.pathname === '/' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left transition-colors py-2 ${
                  location.pathname === '/about' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                About
              </Link>
              <Link 
                to="/services" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left transition-colors py-2 ${
                  location.pathname === '/services' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Services
              </Link>
              <Link 
                to="/calculators" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left transition-colors py-2 ${
                  location.pathname === '/calculators' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Calculators
              </Link>
              <Link 
                to="/ai-planning" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left transition-colors py-2 ${
                  location.pathname === '/ai-planning' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                AI Powered Portfolio
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left transition-colors py-2 ${
                  location.pathname === '/contact' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Contact
              </Link>
                <div className="border-t border-border pt-4">
                  <a href="tel:+918087855185" className="flex items-center justify-center gap-2 text-financial-accent font-medium py-2">
                    <Phone className="h-4 w-4" />
                    +91 80878 55185
                  </a>
                  <Button className="w-full bg-financial-accent hover:bg-financial-accent/90 text-white mt-2">
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;