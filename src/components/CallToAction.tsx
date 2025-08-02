import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-32 bg-gradient-primary relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-financial-gold/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-financial-accent-light/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-financial-gold/6 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-12 max-w-4xl mx-auto">
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center px-6 py-3 rounded-full glass backdrop-blur-sm border border-white/20">
              <span className="text-sm font-medium text-white">🎯 Your Financial Future Starts Now</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Ready to secure your{" "}
              <span className="gradient-text bg-gradient-to-r from-financial-gold to-financial-gold-light bg-clip-text text-transparent">
                financial future?
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light">
              Take the first step towards financial freedom. Our expert advisors are ready to create a personalized investment strategy that aligns with your goals and dreams.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-in-right">
            <Button 
              size="lg" 
              className="group bg-gradient-gold hover:shadow-gold hover:scale-105 transition-spring text-financial-primary px-12 py-6 text-lg font-semibold rounded-2xl hover-lift"
              onClick={() => window.location.href = '/contact'}
            >
              <span className="flex items-center gap-3">
                Get Free Consultation
                <span className="group-hover:translate-x-1 transition-transform">✨</span>
              </span>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="glass px-12 py-6 text-lg font-semibold border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-spring rounded-2xl hover-lift backdrop-blur-sm"
              onClick={() => window.location.href = 'tel:+918087855185'}
            >
              📞 Call Now: +91 80878 55185
            </Button>
          </div>
          
          <div className="pt-12 animate-scale-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="glass p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover-lift">
                <div className="text-white/90 font-medium text-lg">✓ No hidden fees</div>
              </div>
              <div className="glass p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover-lift">
                <div className="text-white/90 font-medium text-lg">✓ Transparent advice</div>
              </div>
              <div className="glass p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover-lift">
                <div className="text-white/90 font-medium text-lg">✓ Personalized strategies</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;