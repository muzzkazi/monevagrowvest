import Contact from "@/components/Contact";
import PageLayout from "@/components/shared/PageLayout";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const ContactPage = () => {
  return (
    <PageLayout>
      <div className="pt-20">
        <Contact />
      </div>
      <WhatsAppButton message="Hi! I'd like to get in touch for financial consultation" />
    </PageLayout>
  );
};

export default ContactPage;