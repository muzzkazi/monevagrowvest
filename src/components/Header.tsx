import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Sparkles, Target, TrendingUp, BarChart3, Wallet } from "lucide-react";
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
          ? 'backdrop-blur-2xl bg-background/85 border-b border-financial-accent/20 shadow-2xl shadow-financial-accent/5' 
          : 'glass-nav'
      }`}>
        <div className="container mx-auto max-w-screen-2xl px-6 py-4">
          <div className="flex items-center justify-between flex-nowrap">
            <div className="flex items-center flex-shrink-0">
              <img 
                src="/lovable-uploads/ed65aa4c-20d0-4af6-9c5c-9dc7c42a42d6.png" 
                alt="Moneva Logo" 
                className="h-10 w-auto drop-shadow-md"
              />
            </div>
          
            <nav className="flex items-center space-x-5 ml-8 flex-shrink-0">
              <Link 
                to="/" 
                className={`text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-financial-accent after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === '/' ? 'text-financial-accent after:w-full' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-financial-accent after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === '/about' ? 'text-financial-accent after:w-full' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                About
              </Link>
              <Link 
                to="/services" 
                className={`text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-financial-accent after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === '/services' ? 'text-financial-accent after:w-full' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Services
              </Link>
              <Link 
                to="/calculators" 
                className={`text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-financial-accent after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === '/calculators' ? 'text-financial-accent after:w-full' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Calculators
              </Link>
              <div className="relative group">
                <span className={`text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-financial-accent after:transition-all after:duration-300 group-hover:after:w-full ${
                  location.pathname.startsWith('/ai-planning') || location.pathname === '/mutual-fund-comparison' || location.pathname === '/goal-based-planning' || location.pathname === '/sip-based-planning' || location.pathname === '/debt-management'
                    ? 'text-financial-accent after:w-full' 
                    : 'text-foreground hover:text-financial-accent'
                }`}>
                  AI Planning
                </span>
                <div className="absolute top-full left-0 pt-4 z-50 transition-all duration-300 ease-out opacity-0 translate-y-2 scale-95 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/15 min-w-[220px] py-2 overflow-hidden">
                    <Link 
                      to="/ai-planning" 
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Planner Overview
                    </Link>
                    <Link 
                      to="/goal-based-planning" 
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      <Target className="h-4 w-4" />
                      Goal Based Planning
                    </Link>
                    <Link 
                      to="/sip-based-planning" 
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      <TrendingUp className="h-4 w-4" />
                      SIP Based Planning
                    </Link>
                    <Link 
                      to="/mutual-fund-comparison" 
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Mutual Fund Comparison
                    </Link>
                    <Link 
                      to="/debt-management" 
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors"
                    >
                      <Wallet className="h-4 w-4" />
                      Debt Management
                    </Link>
                  </div>
                </div>
              </div>
              <Link 
                to="/financial-education" 
                className={`text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-financial-accent after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === '/financial-education' ? 'text-financial-accent after:w-full' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Learning
              </Link>
              <Link 
                to="/contact" 
                className={`text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-financial-accent after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === '/contact' ? 'text-financial-accent after:w-full' : 'text-foreground hover:text-financial-accent'
                }`}
              >
                Contact
              </Link>
            </nav>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <ThemeToggle />
              <a href="tel:+918087855185" className="hidden xl:flex items-center gap-2 text-financial-accent hover:text-financial-accent/80 transition-all duration-200 group">
                <div className="p-1.5 rounded-full bg-financial-accent/10 group-hover:bg-financial-accent/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">+91 80878 55185</span>
              </a>
              <Button className="bg-gradient-to-r from-financial-accent to-financial-accent/80 hover:from-financial-accent/90 hover:to-financial-accent/70 text-white shadow-lg shadow-financial-accent/30 font-semibold px-5 py-2.5 text-sm rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-financial-accent/40">
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