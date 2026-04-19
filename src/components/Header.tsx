import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";

const navLinkClass = (isActive: boolean) =>
  `text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-financial-accent after:transition-all after:duration-300 hover:after:w-full ${
    isActive ? 'text-financial-accent after:w-full' : 'text-foreground hover:text-financial-accent'
  }`;

const MobileNavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '?');
  return (
    <SheetClose asChild>
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'text-financial-accent bg-financial-accent/10'
            : 'text-foreground hover:bg-muted hover:text-financial-accent'
        }`}
      >
        {children}
      </Link>
    </SheetClose>
  );
};

const MobileSectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 pt-4 pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
    {children}
  </div>
);

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

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
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Call us for expert financial advice</span>
        </div>
      </div>

      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'backdrop-blur-2xl bg-background/85 border-b border-financial-accent/20 shadow-2xl shadow-financial-accent/5'
          : 'glass-nav'
      }`}>
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-nowrap">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img
                src="/lovable-uploads/ed65aa4c-20d0-4af6-9c5c-9dc7c42a42d6.png"
                alt="Moneva Logo"
                className="h-10 w-auto drop-shadow-md cursor-pointer transition-transform duration-200 hover:scale-110"
              />
            </Link>

            {/* Desktop nav — collapsed to 5 top-level groups */}
            <nav className="hidden lg:flex items-center space-x-5 ml-8 flex-shrink-0">
              <Link to="/" className={navLinkClass(location.pathname === '/')}>Home</Link>

              {/* Tools dropdown — calculators, screeners, budget, debt */}
              <div className="relative group">
                <span className={`${navLinkClass(
                  ['/calculators', '/stock-screener', '/mutual-fund-comparison', '/portfolio-overlap', '/portfolio-review', '/budget-tracker', '/debt-management'].includes(location.pathname)
                )} flex items-center gap-1.5`}>
                  Tools
                </span>
                <div className="absolute top-full left-0 pt-4 z-50 transition-all duration-300 ease-out opacity-0 translate-y-2 scale-95 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/15 min-w-[260px] py-2 overflow-hidden">
                    <div className="px-5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Calculators</div>
                    <Link to="/calculators?tab=sip" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      SIP Calculator
                    </Link>
                    <Link to="/calculators?tab=emi" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      EMI Calculator
                    </Link>
                    <Link to="/calculators?tab=tax" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      Tax Calculator
                    </Link>
                    <Link to="/calculators?tab=retirement" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      Retirement Planner
                    </Link>
                    <div className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Screeners</div>
                    <Link to="/stock-screener" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors group/item">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover/item:bg-blue-500/20 transition-colors dark:bg-blue-500/20 dark:text-blue-400">
                      </div>
                      Stock Screener
                    </Link>
                    <Link to="/mutual-fund-comparison" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors group/item">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover/item:bg-emerald-500/20 transition-colors dark:bg-emerald-500/20 dark:text-emerald-400">
                      </div>
                      Mutual Fund Screener
                    </Link>
                    <Link to="/portfolio-overlap" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors group/item">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 group-hover/item:bg-amber-500/20 transition-colors dark:bg-amber-500/20 dark:text-amber-400">
                      </div>
                      <div className="flex flex-col">
                        <span>Portfolio Overlap</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Check fund duplication</span>
                      </div>
                    </Link>
                    <Link to="/portfolio-review" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors group/item">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 group-hover/item:bg-purple-500/20 transition-colors dark:bg-purple-500/20 dark:text-purple-400">
                      </div>
                      <div className="flex flex-col">
                        <span>AI Portfolio Review</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Review your existing SIPs</span>
                      </div>
                    </Link>
                    <div className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Money Management</div>
                    <Link to="/budget-tracker" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      Budget Tracker
                    </Link>
                    <Link to="/debt-management" className="flex items-center gap-3 px-5 py-2 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      Debt Management
                    </Link>
                  </div>
                </div>
              </div>

              {/* AI Planning dropdown — pure planning flows */}
              <div className="relative group">
                <span className={`${navLinkClass(
                  location.pathname.startsWith('/ai-planning') || location.pathname === '/tax-planning'
                )} flex items-center gap-1.5`}>
                  <Sparkles className="h-4 w-4" /> AI Planning
                </span>
                <div className="absolute top-full left-0 pt-4 z-50 transition-all duration-300 ease-out opacity-0 translate-y-2 scale-95 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/15 min-w-[240px] py-2 overflow-hidden">
                    <Link to="/ai-planning" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      <Sparkles className="h-4 w-4" /> AI Planner Overview
                    </Link>
                    <Link to="/ai-planning?mode=goals" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      <Target className="h-4 w-4" /> Goal Based Planning
                    </Link>
                    <Link to="/ai-planning?mode=sip" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      <TrendingUp className="h-4 w-4" /> SIP Based Planning
                    </Link>
                    <Link to="/tax-planning" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">
                      <FileText className="h-4 w-4" /> Tax Planning
                    </Link>
                  </div>
                </div>
              </div>

              <Link to="/financial-education" className={`${navLinkClass(location.pathname === '/financial-education')} flex items-center gap-1.5`}>
                <GraduationCap className="h-4 w-4" /> Learning
              </Link>

              {/* Company dropdown — about, services, blog, contact */}
              <div className="relative group">
                <span className={`${navLinkClass(
                  ['/about', '/services', '/contact', '/blog'].includes(location.pathname)
                )} flex items-center gap-1.5`}>
                  <Info className="h-4 w-4" /> Company
                </span>
                <div className="absolute top-full left-0 pt-4 z-50 transition-all duration-300 ease-out opacity-0 translate-y-2 scale-95 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/15 min-w-[200px] py-2 overflow-hidden">
                    <Link to="/about" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">About Us</Link>
                    <Link to="/services" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">Our Services</Link>
                    <Link to="/blog" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">Blog</Link>
                    <Link to="/contact" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium hover:bg-financial-accent/10 hover:text-financial-accent transition-colors">Contact</Link>
                  </div>
                </div>
              </div>
            </nav>
            {/* Right side */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <ThemeToggle />
              <a href="tel:+918087855185" className="hidden xl:flex items-center gap-2 text-financial-accent hover:text-financial-accent/80 transition-all duration-200 group">
                <div className="p-1.5 rounded-full bg-financial-accent/10 group-hover:bg-financial-accent/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">+91 80878 55185</span>
              </a>
              <Button className="hidden sm:inline-flex bg-gradient-to-r from-financial-accent to-financial-accent/80 hover:from-financial-accent/90 hover:to-financial-accent/70 text-white shadow-lg shadow-financial-accent/30 font-semibold px-5 py-2.5 text-sm rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-financial-accent/40">
                Get Started
              </Button>

              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-background border-border p-0 overflow-y-auto">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="p-4 border-b border-border">
                    <img
                      src="/lovable-uploads/ed65aa4c-20d0-4af6-9c5c-9dc7c42a42d6.png"
                      alt="Moneva Logo"
                      className="h-8 w-auto"
                    />
                  </div>

                  <div className="py-2">
                    <MobileNavLink to="/" onClick={closeMobile}>Home</MobileNavLink>

                    <MobileSectionLabel>Tools — Calculators</MobileSectionLabel>
                    <MobileNavLink to="/calculators?tab=sip" onClick={closeMobile}>
                      <TrendingUp className="h-4 w-4" /> SIP Calculator
                    </MobileNavLink>
                    <MobileNavLink to="/calculators?tab=emi" onClick={closeMobile}>
                      <Receipt className="h-4 w-4" /> EMI Calculator
                    </MobileNavLink>
                    <MobileNavLink to="/calculators?tab=tax" onClick={closeMobile}>
                      <Landmark className="h-4 w-4" /> Tax Calculator
                    </MobileNavLink>
                    <MobileNavLink to="/calculators?tab=retirement" onClick={closeMobile}>
                      <Clock className="h-4 w-4" /> Retirement Planner
                    </MobileNavLink>

                    <MobileSectionLabel>Tools — Screeners</MobileSectionLabel>
                    <MobileNavLink to="/stock-screener" onClick={closeMobile}>
                      <LineChart className="h-4 w-4" /> Stock Screener
                    </MobileNavLink>
                    <MobileNavLink to="/mutual-fund-comparison" onClick={closeMobile}>
                      <PieChart className="h-4 w-4" /> Mutual Fund Screener
                    </MobileNavLink>
                    <MobileNavLink to="/portfolio-overlap" onClick={closeMobile}>
                      <Layers className="h-4 w-4" /> Portfolio Overlap
                    </MobileNavLink>
                    <MobileNavLink to="/portfolio-review" onClick={closeMobile}>
                      <ClipboardCheck className="h-4 w-4" /> AI Portfolio Review
                    </MobileNavLink>

                    <MobileSectionLabel>Tools — Money Management</MobileSectionLabel>
                    <MobileNavLink to="/budget-tracker" onClick={closeMobile}>
                      <PiggyBank className="h-4 w-4" /> Budget Tracker
                    </MobileNavLink>
                    <MobileNavLink to="/debt-management" onClick={closeMobile}>
                      <Wallet className="h-4 w-4" /> Debt Management
                    </MobileNavLink>

                    <MobileSectionLabel>AI Planning</MobileSectionLabel>
                    <MobileNavLink to="/ai-planning" onClick={closeMobile}>
                      <Sparkles className="h-4 w-4" /> AI Planner Overview
                    </MobileNavLink>
                    <MobileNavLink to="/ai-planning?mode=goals" onClick={closeMobile}>
                      <Target className="h-4 w-4" /> Goal Based Planning
                    </MobileNavLink>
                    <MobileNavLink to="/ai-planning?mode=sip" onClick={closeMobile}>
                      <TrendingUp className="h-4 w-4" /> SIP Based Planning
                    </MobileNavLink>
                    <MobileNavLink to="/tax-planning" onClick={closeMobile}>
                      <FileText className="h-4 w-4" /> Tax Planning
                    </MobileNavLink>

                    <div className="my-2 border-t border-border" />
                    <MobileNavLink to="/financial-education" onClick={closeMobile}>
                      <GraduationCap className="h-4 w-4" /> Learning
                    </MobileNavLink>

                    <MobileSectionLabel>Company</MobileSectionLabel>
                    <MobileNavLink to="/about" onClick={closeMobile}>About Us</MobileNavLink>
                    <MobileNavLink to="/services" onClick={closeMobile}>Our Services</MobileNavLink>
                    <MobileNavLink to="/blog" onClick={closeMobile}>Blog</MobileNavLink>
                    <MobileNavLink to="/contact" onClick={closeMobile}>Contact</MobileNavLink>
                  </div>

                  <div className="p-4 border-t border-border">
                    <Button className="w-full bg-gradient-to-r from-financial-accent to-financial-accent/80 text-white font-semibold rounded-xl">
                      Get Started
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
