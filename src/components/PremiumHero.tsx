import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCountUp } from "@/hooks/useCountUp";
import { Sparkles, TrendingUp, Users, Banknote, ArrowRight, Shield, Award } from "lucide-react";

const PremiumHero = () => {
  const research = useCountUp({ end: 3500, duration: 3000, delay: 500 });
  const clients = useCountUp({ end: 15000, duration: 3000, delay: 800 });
  const aum = useCountUp({ end: 2800, duration: 3000, delay: 1100 });
  const returns = useCountUp({ end: 18.5, duration: 3000, delay: 1400 });

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-financial-accent/10 rounded-full animate-float animate-morph"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-financial-gold/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-financial-premium/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-financial-success/10 rounded-full animate-float animate-morph" style={{ animationDelay: '1s' }}></div>
        
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 interactive-bg opacity-50"></div>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="bg-financial-gold/20 text-financial-primary border-financial-gold/30 hover:bg-financial-gold/30 transition-all duration-300 glass-card">
                <Sparkles className="w-4 h-4 mr-2" />
                Wealth Management Excellence
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight">
                Build Your
                <span className="text-gradient block">Financial Empire</span>
                with Expert Guidance
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform your financial future with our AI-powered investment strategies, 
                personalized wealth management, and award-winning advisory services. 
                Join thousands who've already secured their financial freedom.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="btn-enhance btn-premium text-white px-8 py-6 text-lg font-semibold"
                onClick={() => window.location.href = '/contact'}
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-enhance px-8 py-6 text-lg glass-card border-financial-accent/30 hover:border-financial-accent/50"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Consultation
                <Shield className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-financial-gold" />
                <span className="text-sm font-medium">SEBI Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-financial-success" />
                <span className="text-sm font-medium">Secure & Trusted</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-financial-accent" />
                <span className="text-sm font-medium">18.5% Avg Returns</span>
              </div>
            </div>
          </div>

          {/* Right Content - Stats */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative rounded-3xl overflow-hidden group">
              <img 
                src="/src/assets/premium-financial-hero.jpg" 
                alt="Financial success and growth" 
                className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-financial-dark/80 via-transparent to-transparent"></div>
              
              {/* Floating Stats Cards */}
              <div className="absolute inset-0 p-8">
                {/* Research Hours Card */}
                <div className="absolute top-8 left-8 glass-premium p-6 rounded-2xl card-float glow-on-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-financial-accent/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-financial-accent" />
                    </div>
                    <div>
                      <div ref={research.ref} className="text-2xl font-bold text-financial-accent">{research.value}+</div>
                      <div className="text-sm text-muted-foreground">Research Hours</div>
                    </div>
                  </div>
                </div>

                {/* Clients Card */}
                <div className="absolute top-32 right-8 glass-premium p-6 rounded-2xl card-float glow-on-hover" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-financial-success/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-financial-success" />
                    </div>
                    <div>
                      <div ref={clients.ref} className="text-2xl font-bold text-financial-success">{clients.value}+</div>
                      <div className="text-sm text-muted-foreground">Happy Clients</div>
                    </div>
                  </div>
                </div>

                {/* AUM Card */}
                <div className="absolute bottom-32 left-8 glass-premium p-6 rounded-2xl card-float glow-on-hover" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-financial-gold/20 flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-financial-gold" />
                    </div>
                    <div>
                      <div ref={aum.ref} className="text-2xl font-bold text-financial-gold">₹{aum.value}Cr+</div>
                      <div className="text-sm text-muted-foreground">Assets Under Management</div>
                    </div>
                  </div>
                </div>

                {/* Returns Badge */}
                <div className="absolute bottom-8 right-8 glass-premium p-4 rounded-2xl card-float animate-pulse-glow" style={{ animationDelay: '0.6s' }}>
                  <div className="text-center">
                    <div ref={returns.ref} className="text-3xl font-bold text-gradient">{returns.value}%</div>
                    <div className="text-sm text-muted-foreground">Average Returns</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-financial-premium/20 rounded-full animate-float animate-pulse-glow"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-financial-gold/20 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default PremiumHero;