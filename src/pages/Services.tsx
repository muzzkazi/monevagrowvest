import Services from "@/components/Services";
import PageLayout from "@/components/shared/PageLayout";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import BudgetTracker from "@/components/debt-management/BudgetTracker";

const ServicesPage = () => {
  return (
    <PageLayout>
      <div className="pt-28">
        <Services />
        
        {/* Personal Budget Tracker Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Personal <span className="text-financial-accent">Budget Tracker</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Take complete control of your finances with our comprehensive budget tracking tool. Monitor income, expenses, and achieve your financial goals.
              </p>
            </div>
            <BudgetTracker />
          </div>
        </section>
      </div>
      <WhatsAppButton message="Hi! I'm interested in learning more about your investment services" />
    </PageLayout>
  );
};

export default ServicesPage;