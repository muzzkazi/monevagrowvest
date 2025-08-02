import { Button } from "@/components/ui/button";
import heroImage from "@/assets/premium-financial-hero.jpg";
import { useCountUp } from "@/hooks/useCountUp";

const Hero = () => {
  const researchCount = useCountUp({ end: 100, suffix: '%', duration: 2000, delay: 500 });
  const clientsCount = useCountUp({ end: 500, suffix: '+', duration: 2500, delay: 800 });
  const aumCount = useCountUp({ end: 12, prefix: '₹', suffix: 'Cr+', duration: 3000, delay: 1100 });
  const returnsCount = useCountUp({ end: 12, suffix: '%+', duration: 2200, delay: 1400 });

  return (
    <section id="home" className="relative min-h-screen bg-gradient-mesh pt-20 overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-88 h-88 bg-financial-accent/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-financial-gold/6 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-financial-tertiary/4 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-financial-accent-light/5 rounded-full blur-lg animate-float" style={{ animationDelay: '4.5s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 animate-fade-in-up">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-glass backdrop-blur-sm border border-financial-accent/20 animate-shimmer">
                <span className="text-sm font-medium text-financial-primary">🚀 Premium Financial Planning</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Take control of your{" "}
                <span className="gradient-text">
                  financial future
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-financial-secondary leading-relaxed max-w-2xl font-light">
                Whether you're saving for a new home, planning your child's education, or growing your retirement fund, 
                we're here to support you in reaching your financial goals with expert guidance.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group bg-gradient-accent hover:shadow-glow hover:scale-105 transition-spring text-white px-10 py-6 text-lg font-semibold rounded-2xl hover-lift"
                onClick={() => window.location.href = '/contact'}
              >
                <span className="flex items-center gap-2">
                  Start Your Journey
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="glass px-10 py-6 text-lg font-semibold border-financial-accent/30 text-financial-primary hover:bg-financial-accent/10 hover:scale-105 transition-spring rounded-2xl hover-lift"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Consultation
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-12">
              <div className="text-center group hover-lift">
                <div className="p-4 rounded-2xl bg-gradient-card shadow-card group-hover:shadow-accent transition-smooth">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    100%
                  </div>
                  <div className="text-sm text-financial-secondary font-medium">Research Based</div>
                </div>
              </div>
              <div className="text-center group hover-lift">
                <div className="p-4 rounded-2xl bg-gradient-card shadow-card group-hover:shadow-accent transition-smooth">
                  <div ref={clientsCount.ref} className="text-4xl font-bold gradient-text mb-2">
                    {clientsCount.value}
                  </div>
                  <div className="text-sm text-financial-secondary font-medium">Happy Clients</div>
                </div>
              </div>
              <div className="text-center group hover-lift">
                <div className="p-4 rounded-2xl bg-gradient-card shadow-card group-hover:shadow-accent transition-smooth">
                  <div ref={aumCount.ref} className="text-4xl font-bold gradient-text mb-2">
                    {aumCount.value}
                  </div>
                  <div className="text-sm text-financial-secondary font-medium">Assets Managed</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-slide-in-right">
            <div className="relative group">
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-gradient-accent/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 animate-pulse-glow"></div>
              
              {/* Main image */}
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Financial Success" 
                  className="relative w-full h-auto rounded-3xl shadow-glass transform group-hover:scale-105 transition-spring"
                />
                
                {/* Glass overlay for depth */}
                <div className="absolute inset-0 bg-gradient-glass rounded-3xl opacity-30"></div>
              </div>
              
              {/* Enhanced floating stats card */}
              <div className="absolute -top-6 -right-6 glass p-8 rounded-3xl shadow-glass animate-float hover:animate-none hover:scale-110 transition-spring cursor-pointer group/card">
                <div className="text-center">
                  <div ref={returnsCount.ref} className="text-3xl font-bold gradient-text mb-1">
                    {returnsCount.value}
                  </div>
                  <div className="text-sm text-financial-secondary font-medium">Avg. Returns</div>
                  <div className="w-full h-1 bg-gradient-accent rounded-full mt-3 opacity-70 group-hover/card:opacity-100 transition-opacity"></div>
                </div>
              </div>
              
              {/* Additional floating element */}
              <div className="absolute -bottom-4 -left-4 glass p-6 rounded-2xl shadow-glass animate-float hover:scale-110 transition-spring cursor-pointer" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-financial-success rounded-full animate-pulse"></div>
                  <div className="text-sm font-medium text-financial-primary">Live Portfolio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;