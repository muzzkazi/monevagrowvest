import { Button } from "@/components/ui/button";
import heroImage from "@/assets/premium-financial-hero.jpg";
import { useCountUp } from "@/hooks/useCountUp";
import GrowthCurve from "./GrowthCurve";

const Hero = () => {
  const researchCount = useCountUp({ end: 100, suffix: '%', duration: 2000, delay: 500 });
  const clientsCount = useCountUp({ end: 500, suffix: '+', duration: 2500, delay: 800 });
  const aumCount = useCountUp({ end: 12, prefix: '₹', suffix: 'Cr+', duration: 3000, delay: 1100 });
  const returnsCount = useCountUp({ end: 12, suffix: '%+', duration: 2200, delay: 1400 });

  return (
    <section id="home" className="relative min-h-screen bg-gradient-hero pt-20 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-financial-accent rounded-full blur-xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-financial-success rounded-full blur-lg"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-financial-primary">
                Take control of your{" "}
                <span className="text-financial-accent">
                  financial destiny.
                </span>
              </h1>
              <p className="text-xl text-financial-secondary leading-relaxed max-w-lg">
                Whether you're saving for a new home, planning your child's education, or growing your retirement fund, we're here to support you in reaching your financial goals.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-financial-accent hover:bg-financial-accent/90 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/contact'}
              >
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white transition-all duration-300"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Consultation
              </Button>
            </div>
            
            {/* Stats section */}
            <div className="flex items-center gap-12 pt-8">
              <div className="text-center">
                <div ref={clientsCount.ref} className="text-3xl font-bold text-financial-accent">
                  {clientsCount.value}
                </div>
                <div className="text-sm text-financial-secondary">Happy Clients</div>
              </div>
              <div className="text-center">
                <div ref={aumCount.ref} className="text-3xl font-bold text-financial-accent">
                  {aumCount.value}
                </div>
                <div className="text-sm text-financial-secondary">Assets Managed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-financial-accent">
                  12%+
                </div>
                <div className="text-sm text-financial-secondary">Avg. Returns</div>
              </div>
            </div>
          </div>
          
          {/* Right content with animated growth curve */}
          <div className="relative animate-slide-up">
            <GrowthCurve />
            
            {/* Call to action card */}
            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-financial-primary mb-2">
                Create a strategic plan to grow your wealth with our expert guidance.
              </h3>
              <Button 
                className="mt-4 bg-financial-accent hover:bg-financial-accent/90 text-white"
                onClick={() => window.location.href = '/contact'}
              >
                Connect Today !
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;