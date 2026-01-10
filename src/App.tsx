import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, Transition } from "framer-motion";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Calculators from "./pages/Calculators";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import AIPlanning from "./pages/AIPlanning";
import DebtManagement from "./pages/DebtManagement";
import MutualFundComparison from "./pages/MutualFundComparison";
import GoalBasedPlanning from "./pages/GoalBasedPlanning";
import SIPBasedPlanning from "./pages/SIPBasedPlanning";
import FinancialEducationPage from "./pages/FinancialEducation";
import DesktopOnlyNotice from "./components/DesktopOnlyNotice";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
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
          <Route path="/goal-based-planning" element={<GoalBasedPlanning />} />
          <Route path="/sip-based-planning" element={<SIPBasedPlanning />} />
          <Route path="/financial-education" element={<FinancialEducationPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <DesktopOnlyNotice />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
