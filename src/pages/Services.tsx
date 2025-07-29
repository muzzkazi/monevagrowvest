import Services from "@/components/Services";
import PageLayout from "@/components/shared/PageLayout";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const ServicesPage = () => {
  return (
    <PageLayout>
      <div className="pt-20">
        <Services />
      </div>
      <WhatsAppButton message="Hi! I'm interested in learning more about your investment services" />
    </PageLayout>
  );
};

export default ServicesPage;