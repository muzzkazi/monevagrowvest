import { Button } from "@/components/ui/button";
import heroImage from "@/assets/premium-financial-hero.jpg";
import { useCountUp } from "@/hooks/useCountUp";
import AnimatedGrowthCurve from "./AnimatedGrowthCurve";

const Hero = () => {
  const researchCount = useCountUp({ end: 100, suffix: '%', duration: 2000, delay: 500 });
  const clientsCount = useCountUp({ end: 500, suffix: '+', duration: 2500, delay: 800 });
  const aumCount = useCountUp({ end: 12, prefix: '₹', suffix: 'Cr+', duration: 3000, delay: 1100 });
  const returnsCount = useCountUp({ end: 12, suffix: '%+', duration: 2200, delay: 1400 });

  return (
    <section id="home" className="relative min-h-screen bg-gradient-hero pt-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-financial-gold/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-financial-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-financial-gold/5 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Take control of your{" "}
                <span className="bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent animate-pulse">
                  financial destiny
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Whether you're saving for a new home, planning your child's education, or growing your retirement fund, we're here to support you in reaching your financial goals.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-financial-accent hover:bg-financial-accent/90 hover:scale-105 transition-all duration-300 text-white px-8 py-4 text-lg shadow-lg"
                onClick={() => window.location.href = '/contact'}
              >
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white hover:scale-105 transition-all duration-300"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Consultation
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-8">
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold text-financial-accent">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">Research Based</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div ref={clientsCount.ref} className="text-3xl font-bold text-financial-accent">
                  {clientsCount.value}
                </div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div ref={aumCount.ref} className="text-3xl font-bold text-financial-accent">
                  {aumCount.value}
                </div>
                <div className="text-sm text-muted-foreground">Assets Managed</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-slide-up">
            <AnimatedGrowthCurve />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;