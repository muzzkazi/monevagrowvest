import PageLayout from "@/components/shared/PageLayout";
import DebtManagement from "@/components/DebtManagement";

const DebtManagementPage = () => {
  return (
    <PageLayout>
      <div className="pt-28">
        <DebtManagement />
      </div>
    </PageLayout>
  );
};

export default DebtManagementPage;