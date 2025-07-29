import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/src/assets/moneva-logo.svg" alt="Moneva" className="w-8 h-8" />
            <span className="text-2xl font-bold text-primary">moneva</span>
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
                to="/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left transition-colors py-2 ${
                  location.pathname === '/contact' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Contact
              </Link>
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