import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      {/* Enhanced background with mesh gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-financial-primary/95 to-financial-secondary/95"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-financial-accent/10 via-transparent to-financial-gold/10"></div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-financial-gold/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-financial-accent/10 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/6 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Premium glass card container */}
          <div className="glass-card max-w-4xl mx-auto p-8 md:p-12 rounded-3xl backdrop-blur-glass border border-white/20">
            <h2 className="text-4xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Ready to secure your{" "}
              <span className="bg-gradient-to-r from-financial-gold to-financial-gold-light bg-clip-text text-transparent animate-glow-pulse">
                financial future?
              </span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              Take the first step towards financial freedom. Our expert advisors are ready to create a personalized investment strategy that aligns with your goals and dreams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                variant="premium"
                size="lg" 
                className="px-8 py-4 text-lg font-semibold shadow-floating hover:shadow-glow animate-spring-bounce"
                onClick={() => window.location.href = '/contact'}
                style={{ animationDelay: '0.2s' }}
              >
                ✨ Get Free Consultation
              </Button>
              <Button 
                variant="glass" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold text-white border-white/30 hover:bg-white/20 animate-spring-bounce"
                onClick={() => window.location.href = 'tel:+918087855185'}
                style={{ animationDelay: '0.4s' }}
              >
                📞 Call Now: +91 80878 55185
              </Button>
            </div>
            
            {/* Enhanced trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center group">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-financial-gold rounded-full mr-2 group-hover:animate-glow-pulse"></div>
                  <span className="text-white/90 font-medium">No hidden fees</span>
                </div>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-financial-gold rounded-full mr-2 group-hover:animate-glow-pulse"></div>
                  <span className="text-white/90 font-medium">Transparent advice</span>
                </div>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-financial-gold rounded-full mr-2 group-hover:animate-glow-pulse"></div>
                  <span className="text-white/90 font-medium">Personalized strategies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;