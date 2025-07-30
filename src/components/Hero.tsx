import { useCountUp } from "@/hooks/useCountUp";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Shield, Award } from "lucide-react";
import AnimatedGrowthCurve from "./AnimatedGrowthCurve";
import premiumHero from "@/assets/premium-hero.jpg";
import growthAbstract from "@/assets/growth-abstract.jpg";

const Hero = () => {
  const researchValue = useCountUp({ end: 10000, suffix: '+', duration: 2000, delay: 500 });
  const clientsValue = useCountUp({ end: 10000, suffix: '+', duration: 2500, delay: 800 });
  const aumValue = useCountUp({ end: 500, prefix: '₹', suffix: 'Cr+', duration: 3000, delay: 1100 });
  const returnsValue = useCountUp({ end: 15, suffix: '%', duration: 2200, delay: 1400 });

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Premium Background with Hero Image */}
      <div className="absolute inset-0">
        <img 
          src={premiumHero} 
          alt="Premium Financial Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>
      
      {/* Abstract Growth Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
        <img 
          src={growthAbstract} 
          alt="Growth Pattern" 
          className="w-full h-full object-cover mix-blend-overlay"
        />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-glow opacity-40 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-20 w-24 h-24 bg-gradient-glow opacity-30 rounded-full blur-xl animate-parallax-float"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          {/* Enhanced Content Section */}
          <div className="space-y-10 animate-slide-up">
            {/* Trust Indicators */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full glass-effect">
                <Shield className="h-4 w-4 text-financial-gold" />
                <span className="text-white text-sm font-medium">Certified Professionals</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full glass-effect">
                <Award className="h-4 w-4 text-financial-gold" />
                <span className="text-white text-sm font-medium">15+ Years Experience</span>
              </div>
            </div>
            
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-8xl font-bold text-white leading-tight">
                Build Your
                <span className="block gradient-text animate-glow-pulse">Wealth</span>
                <span className="block">Systematically</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl font-light">
                Transform your financial future with our <strong className="text-financial-gold">research-backed strategies</strong> that have delivered consistent returns for over <strong className="text-financial-gold">10,000+ investors</strong> across India.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                size="lg" 
                className="bg-financial-gold hover:bg-financial-gold/90 text-financial-primary px-10 py-6 text-xl font-bold group hover-lift rounded-xl shadow-gold"
                onClick={() => window.location.href = '/contact'}
              >
                Start Your Journey
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-all duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-6 text-xl border-white/40 text-white hover:bg-white/20 group glass-effect rounded-xl backdrop-blur-sm"
                onClick={() => window.location.href = '/ai-planning'}
              >
                <Play className="mr-3 h-6 w-6 group-hover:scale-125 transition-all duration-300" />
                Free Consultation
              </Button>
            </div>
            
            {/* Enhanced stats with premium styling */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              <div className="text-center luxury-card p-6 rounded-2xl hover-lift" ref={researchValue.ref}>
                <div className="text-4xl lg:text-5xl font-bold gradient-text mb-3">{researchValue.value}</div>
                <div className="text-white/80 text-sm uppercase tracking-wider font-medium">Research Hours</div>
                <TrendingUp className="h-5 w-5 text-financial-gold mx-auto mt-2" />
              </div>
              
              <div className="text-center luxury-card p-6 rounded-2xl hover-lift" ref={clientsValue.ref}>
                <div className="text-4xl lg:text-5xl font-bold gradient-text mb-3">{clientsValue.value}</div>
                <div className="text-white/80 text-sm uppercase tracking-wider font-medium">Happy Clients</div>
                <Shield className="h-5 w-5 text-financial-gold mx-auto mt-2" />
              </div>
              
              <div className="text-center luxury-card p-6 rounded-2xl hover-lift" ref={aumValue.ref}>
                <div className="text-4xl lg:text-5xl font-bold gradient-text mb-3">{aumValue.value}</div>
                <div className="text-white/80 text-sm uppercase tracking-wider font-medium">AUM (Crores)</div>
                <Award className="h-5 w-5 text-financial-gold mx-auto mt-2" />
              </div>
              
              <div className="text-center luxury-card p-6 rounded-2xl hover-lift" ref={returnsValue.ref}>
                <div className="text-4xl lg:text-5xl font-bold gradient-text mb-3">{returnsValue.value}</div>
                <div className="text-white/80 text-sm uppercase tracking-wider font-medium">Avg. Returns</div>
                <TrendingUp className="h-5 w-5 text-financial-gold mx-auto mt-2" />
              </div>
            </div>
          </div>
          
          {/* Enhanced Visual Section */}
          <div className="relative lg:ml-12 animate-scale-in">
            <div className="relative">
              {/* Premium chart container with enhanced styling */}
              <div className="luxury-card rounded-3xl p-10 shadow-luxury hover-lift">
                <AnimatedGrowthCurve />
              </div>
              
              {/* Floating premium badges */}
              <div className="absolute -top-6 -right-6 bg-gradient-gold text-financial-primary px-8 py-4 rounded-2xl font-bold shadow-gold animate-glow-pulse border border-financial-gold/30">
                <span className="text-2xl">⭐</span>
                <span className="ml-2 text-lg">15% Avg Returns</span>
              </div>
              
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-luxury px-10 py-4 rounded-2xl text-white font-bold shadow-luxury glass-effect border border-white/20">
                <span className="text-xl">🏆</span>
                <span className="ml-3">Certified Excellence</span>
              </div>
              
              {/* Side floating elements */}
              <div className="absolute top-20 -left-8 bg-white/10 backdrop-blur-sm p-4 rounded-xl glass-effect animate-float">
                <TrendingUp className="h-6 w-6 text-financial-gold" />
              </div>
              
              <div className="absolute bottom-20 -right-8 bg-white/10 backdrop-blur-sm p-4 rounded-xl glass-effect animate-parallax-float">
                <Shield className="h-6 w-6 text-financial-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;