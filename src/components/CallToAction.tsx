import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-financial-primary/90 to-financial-secondary/90"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to secure your financial future?
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Take the first step towards financial freedom. Our expert advisors are ready to create a personalized investment strategy that aligns with your goals and dreams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-financial-gold hover:bg-financial-gold/90 text-financial-primary px-8 py-4 text-lg">
              Get Free Consultation
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-financial-primary">
              Call Now: +91-XXX-XXXX-XXX
            </Button>
          </div>
          
          <div className="pt-8 text-center">
            <p className="text-white/60 text-sm">
              ✓ No hidden fees  ✓ Transparent advice  ✓ Personalized strategies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;