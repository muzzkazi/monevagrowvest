import { Receipt } from "lucide-react";
import PageLayout from "@/components/shared/PageLayout";
import TaxPlanningWizard from "@/components/tax-planning/TaxPlanningWizard";

const TaxPlanningPage = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-financial-accent/5 pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Shared planning shell header — matches Goal-Based & SIP-Based Planning */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Receipt className="h-8 w-8 text-financial-accent" />
              <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">
                Tax Planning
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare old vs new regime, find unused deductions, and see how much more you could be saving — in about 2 minutes.
            </p>
          </div>

          <TaxPlanningWizard />
        </div>
      </div>
    </PageLayout>
  );
};

export default TaxPlanningPage;
