import Calculators from "@/components/Calculators";
import PageLayout from "@/components/shared/PageLayout";

const CalculatorsPage = () => {
  return (
    <PageLayout>
      <div className="pt-20">
        <Calculators />
      </div>
    </PageLayout>
  );
};

export default CalculatorsPage;