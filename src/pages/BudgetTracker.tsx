import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import BudgetTracker from "@/components/debt-management/BudgetTracker";

const BudgetTrackerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Budget Tracker
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take control of your finances with our comprehensive budget tracking tool. 
              Set budgets, track expenses, and achieve your financial goals.
            </p>
          </div>
          <BudgetTracker />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BudgetTrackerPage;
