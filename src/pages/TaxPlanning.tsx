import PageLayout from "@/components/shared/PageLayout";
import TaxPlanningWizard from "@/components/tax-planning/TaxPlanningWizard";

const TaxPlanningPage = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-financial-accent/5 pt-8 pb-16">
        <TaxPlanningWizard />
      </div>
    </PageLayout>
  );
};

export default TaxPlanningPage;
