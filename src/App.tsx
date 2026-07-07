import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, Transition } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import RouteLoadingSkeleton from "./components/shared/RouteLoadingSkeleton";

const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Calculators = lazy(() => import("./pages/Calculators"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AIPlanning = lazy(() => import("./pages/AIPlanning"));
const DebtManagement = lazy(() => import("./pages/DebtManagement"));
const MutualFundComparison = lazy(() => import("./pages/MutualFundComparison"));
const PortfolioOverlap = lazy(() => import("./pages/PortfolioOverlap"));
const PortfolioReview = lazy(() => import("./pages/PortfolioReview"));
const MutualFundTracker = lazy(() => import("./pages/MutualFundTracker"));
const GoalBasedPlanning = lazy(() => import("./pages/GoalBasedPlanning"));
const SIPBasedPlanning = lazy(() => import("./pages/SIPBasedPlanning"));
const FinancialEducationPage = lazy(() => import("./pages/FinancialEducation"));
const BudgetTrackerPage = lazy(() => import("./pages/BudgetTracker"));
const StockScreenerPage = lazy(() => import("./pages/StockScreener"));
const TaxPlanning = lazy(() => import("./pages/TaxPlanning"));
const Auth = lazy(() => import("./pages/Auth"));
const BrokerageCalls = lazy(() => import("./pages/BrokerageCalls"));

const queryClient = new QueryClient();

// Fade-in only — no exit animation. Removing the exit phase means the moment
// the route changes, the old page unmounts and the Suspense skeleton (or the
// new page) renders immediately, without waiting for an exit tween. A fixed
// tween duration guarantees the same feel on mobile and desktop.
const pageVariants = {
  initial: { opacity: 0, y: 6 },
  in: { opacity: 1, y: 0 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.25,
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Suspense fallback={<RouteLoadingSkeleton />}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/ai-planning" element={<AIPlanning />} />
          <Route path="/debt-management" element={<DebtManagement />} />
          <Route path="/mutual-fund-comparison" element={<MutualFundComparison />} />
          <Route path="/portfolio-overlap" element={<PortfolioOverlap />} />
          <Route path="/portfolio-review" element={<PortfolioReview />} />
          <Route path="/mutual-fund-tracker" element={<MutualFundTracker />} />
          <Route path="/goal-based-planning" element={<GoalBasedPlanning />} />
          <Route path="/sip-based-planning" element={<SIPBasedPlanning />} />
          <Route path="/financial-education" element={<FinancialEducationPage />} />
          <Route path="/budget-tracker" element={<BudgetTrackerPage />} />
          <Route path="/stock-screener" element={<StockScreenerPage />} />
          <Route path="/tax-planning" element={<TaxPlanning />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/brokerage-calls" element={<BrokerageCalls />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </motion.div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
