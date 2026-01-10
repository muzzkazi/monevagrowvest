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
          ? 'backdrop-blur-2xl bg-background/80 border-b border-border/40 shadow-2xl shadow-black/10' 
          : 'glass-nav'
      }`}>
        <div className="container mx-auto max-w-screen-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/ed65aa4c-20d0-4af6-9c5c-9dc7c42a42d6.png" 
                alt="Moneva Logo" 
                className="h-9 w-auto drop-shadow-sm"
              />
            </div>
          
            <nav className="flex items-center space-x-6 ml-10">
              <Link 
                to="/" 
                className={`text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 ${
                  location.pathname === '/' ? 'text-financial-accent' : 'text-foreground/90 hover:text-financial-accent'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 ${
                  location.pathname === '/about' ? 'text-financial-accent' : 'text-foreground/90 hover:text-financial-accent'
                }`}
              >
                About
              </Link>
              <Link 
                to="/services" 
                className={`text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 ${
                  location.pathname === '/services' ? 'text-financial-accent' : 'text-foreground/90 hover:text-financial-accent'
                }`}
              >
                Services
              </Link>
              <Link 
                to="/calculators" 
                className={`text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 ${
                  location.pathname === '/calculators' ? 'text-financial-accent' : 'text-foreground/90 hover:text-financial-accent'
                }`}
              >
                Calculators
              </Link>
              <Link 
                to="/debt-management" 
                className={`text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 ${
                  location.pathname === '/debt-management' ? 'text-financial-accent' : 'text-foreground/90 hover:text-financial-accent'
                }`}
              >
                Debt Management
              </Link>
              <div className="relative group">
                <span className={`text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 ${
                  location.pathname.startsWith('/ai-planning') || location.pathname === '/mutual-fund-comparison' || location.pathname === '/goal-based-planning' || location.pathname === '/sip-based-planning'
                    ? 'text-financial-accent' 
                    : 'text-foreground/90 hover:text-financial-accent'
                }`}>
                  AI Planning
                </span>
                <div className="absolute top-full left-0 pt-3 z-50 transition-all duration-300 ease-out opacity-0 translate-y-2 scale-95 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl shadow-black/10 min-w-[220px] py-2 overflow-hidden">
                    <Link 
                      to="/ai-planning" 
                      className="block px-4 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      AI Planning
                    </Link>
                    <Link 
                      to="/goal-based-planning" 
                      className="block px-4 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      Goal Based Planning
                    </Link>
                    <Link 
                      to="/sip-based-planning" 
                      className="block px-4 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      SIP Based Planning
                    </Link>
                    <Link 
                      to="/mutual-fund-comparison" 
                      className="block px-4 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      Mutual Fund Comparison
                    </Link>
                  </div>
                </div>
              </div>
              <Link 
                to="/financial-education" 
                className={`text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 ${
                  location.pathname === '/financial-education' ? 'text-financial-accent' : 'text-foreground/90 hover:text-financial-accent'
                }`}
              >
                Learning Hub
              </Link>
              <Link 
                to="/contact" 
                className={`text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 ${
                  location.pathname === '/contact' ? 'text-financial-accent' : 'text-foreground/90 hover:text-financial-accent'
                }`}
              >
                Contact
              </Link>
            </nav>
            
            <div className="flex items-center gap-5">
              <ThemeToggle />
              <a href="tel:+918087855185" className="flex items-center gap-2 text-financial-accent hover:text-financial-accent/80 transition-all duration-200 hover:scale-105">
                <Phone className="h-4 w-4" />
                <span className="font-semibold text-sm">+91 80878 55185</span>
              </a>
              <Button className="btn-enhance bg-financial-accent hover:bg-financial-accent/90 text-white shadow-lg shadow-financial-accent/25 font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-financial-accent/30">
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