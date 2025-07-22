import { Button } from "@/components/ui/button";
import heroImage from "@/assets/financial-hero.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen bg-gradient-hero pt-20 overflow-hidden">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Take control of your{" "}
                <span className="bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">
                  financial destiny
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Whether you're saving for a new home, planning your child's education, or growing your retirement fund, we're here to support you in reaching your financial goals.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-financial-accent hover:bg-financial-accent/90 text-white px-8 py-4 text-lg">
                Start Your Journey
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
                Schedule Consultation
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-financial-accent">100%</div>
                <div className="text-sm text-muted-foreground">Research Based</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-financial-accent">500+</div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-financial-accent">₹50Cr+</div>
                <div className="text-sm text-muted-foreground">Assets Managed</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-slide-up">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Financial Growth" 
                className="w-full h-auto rounded-3xl shadow-financial"
              />
              <div className="absolute -top-4 -right-4 bg-gradient-gold p-6 rounded-2xl shadow-gold animate-float">
                <div className="text-center">
                  <div className="text-2xl font-bold text-financial-primary">12%+</div>
                  <div className="text-sm text-financial-secondary">Avg. Returns</div>
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