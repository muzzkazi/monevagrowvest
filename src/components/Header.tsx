import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <span>|</span>
          <span>Call us for expert financial advice</span>
        </div>
      </div>
      
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'backdrop-blur-2xl bg-background/60 border-b border-border/30 shadow-2xl' 
          : 'glass-nav'
      }`}>
        <div className="container mx-auto max-w-screen-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/ed65aa4c-20d0-4af6-9c5c-9dc7c42a42d6.png" 
                alt="Moneva Logo" 
                className="h-8 w-auto"
              />
            </div>
          
            <nav className="flex items-center space-x-8 ml-12">
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
                to="/debt-management" 
                className={`transition-colors cursor-pointer ${
                  location.pathname === '/debt-management' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Debt Management
              </Link>
              <div className="relative group">
                <span className={`transition-colors cursor-pointer ${
                  location.pathname.startsWith('/ai-planning') || location.pathname === '/mutual-fund-comparison' || location.pathname === '/goal-based-planning' || location.pathname === '/sip-based-planning'
                    ? 'text-financial-accent' 
                    : 'text-foreground hover:text-financial-accent'
                }`}>
                  AI Planning
                </span>
                <div className="absolute top-full left-0 pt-2 z-50 transition-all duration-300 ease-out opacity-0 translate-y-2 scale-95 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="bg-background border border-border rounded-md shadow-lg min-w-[200px]">
                    <Link 
                      to="/ai-planning" 
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      AI Planning
                    </Link>
                    <Link 
                      to="/goal-based-planning" 
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Goal Based Planning
                    </Link>
                    <Link 
                      to="/sip-based-planning" 
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      SIP Based Planning
                    </Link>
                    <Link 
                      to="/mutual-fund-comparison" 
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Mutual Fund Comparison
                    </Link>
                  </div>
                </div>
              </div>
              <Link 
                to="/financial-education" 
                className={`transition-colors cursor-pointer ${
                  location.pathname === '/financial-education' ? 'text-financial-accent' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Learning Hub
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
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <a href="tel:+918087855185" className="flex items-center gap-2 text-financial-accent hover:text-financial-accent/80 transition-colors">
                <Phone className="h-4 w-4" />
                <span className="font-medium">+91 80878 55185</span>
              </a>
              <Button className="btn-enhance bg-financial-accent hover:bg-financial-accent/90 text-white shadow-financial">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;