import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import FloatingParticles from "@/components/shared/FloatingParticles";

const CallToAction = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-financial-primary/90 to-financial-secondary/90"></div>
      <FloatingParticles count={15} />
      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <div className={`text-center space-y-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className={`text-4xl lg:text-5xl font-bold text-white mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            Ready to secure your financial future?
          </h2>
          <p className={`text-xl text-white/80 max-w-3xl mx-auto mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Take the first step towards financial freedom. Our expert advisors are ready to create a personalized investment strategy that aligns with your goals and dreams.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button 
              size="lg" 
              className="bg-financial-gold hover:bg-financial-gold/90 text-financial-primary px-8 py-4 text-lg"
              onClick={() => window.location.href = '/contact'}
            >
              Get Free Consultation
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg border-white text-black hover:bg-white hover:text-black"
              onClick={() => window.location.href = 'tel:+918087855185'}
            >
              Call Now: +91 80878 55185
            </Button>
          </div>
          
          <div className={`pt-8 text-center transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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