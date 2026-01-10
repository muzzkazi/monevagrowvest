import { Button } from "@/components/ui/button";
import heroImage from "@/assets/premium-financial-hero.jpg";
import heroVideo from "@/assets/hero-video.mp4";
import { useCountUp } from "@/hooks/useCountUp";
import { useBackgroundParallax } from "@/hooks/useParallax";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Shield, TrendingUp, Users } from "lucide-react";

const Hero = () => {
  const clientsCount = useCountUp({ end: 500, suffix: '+', duration: 2500, delay: 800 });
  const aumCount = useCountUp({ end: 12, prefix: '₹', suffix: 'Cr+', duration: 3000, delay: 1100 });
  const returnsCount = useCountUp({ end: 12, suffix: '%+', duration: 2200, delay: 1400 });
  
  const { smoothScrollY } = useBackgroundParallax(0.3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const getScrollParallaxStyle = (multiplier: number) => ({
    transform: `translate3d(0, ${smoothScrollY * multiplier}px, 0)`,
    willChange: 'transform',
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Full-screen Video Background */}
      <div 
        className="absolute inset-0 parallax-layer"
        style={getScrollParallaxStyle(0.1)}
      >
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage}
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      </div>

      {/* Light Professional Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      
      {/* Subtle accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-financial-accent to-transparent opacity-40" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-8 py-12 sm:py-20 relative z-10 max-w-7xl">
        <div className="max-w-3xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-financial-accent/10 backdrop-blur-sm border border-financial-accent/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Shield className="w-4 h-4 text-financial-accent" />
            <span className="text-sm text-foreground/80 font-medium">SEBI Registered Investment Advisor</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6 animate-fade-in">
            Building Wealth with{" "}
            <span className="bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">
              Research-Driven
            </span>{" "}
            Financial Planning
          </h1>
          
          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Partner with experienced advisors who prioritize your financial goals. 
            From retirement planning to wealth creation, we deliver personalized strategies backed by thorough research.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              className="bg-financial-accent hover:bg-financial-accent/90 text-white px-8 py-6 text-lg font-semibold shadow-lg group transition-all duration-300"
              onClick={() => window.location.href = '/contact'}
            >
              Schedule Free Consultation
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white px-8 py-6 text-lg transition-all duration-300"
              onClick={() => window.location.href = '/services'}
            >
              Explore Our Services
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Users className="w-5 h-5 text-financial-accent hidden sm:block" />
                <span ref={clientsCount.ref} className="text-2xl sm:text-3xl md:text-4xl font-bold text-financial-accent">
                  {clientsCount.value}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Happy Clients</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-financial-accent hidden sm:block" />
                <span ref={aumCount.ref} className="text-2xl sm:text-3xl md:text-4xl font-bold text-financial-accent">
                  {aumCount.value}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Assets Managed</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Shield className="w-5 h-5 text-financial-accent hidden sm:block" />
                <span ref={returnsCount.ref} className="text-2xl sm:text-3xl md:text-4xl font-bold text-financial-accent">
                  {returnsCount.value}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Avg. Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;