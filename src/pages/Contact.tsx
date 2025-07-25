import Contact from "@/components/Contact";
import PageLayout from "@/components/shared/PageLayout";

const ContactPage = () => {
  return (
    <PageLayout>
      <div className="pt-20">
        <Contact />
      </div>
    </PageLayout>
  );
};

export default ContactPage;