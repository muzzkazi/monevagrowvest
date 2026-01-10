import { Button } from "@/components/ui/button";
import heroImage from "@/assets/premium-financial-hero.jpg";
import heroVideo from "@/assets/hero-video.mp4";
import { useCountUp } from "@/hooks/useCountUp";
import { useBackgroundParallax } from "@/hooks/useParallax";
import { useRef, useEffect, useState } from "react";

const Hero = () => {
  const researchCount = useCountUp({ end: 100, suffix: '%', duration: 2000, delay: 500 });
  const clientsCount = useCountUp({ end: 500, suffix: '+', duration: 2500, delay: 800 });
  const aumCount = useCountUp({ end: 12, prefix: '₹', suffix: 'Cr+', duration: 3000, delay: 1100 });
  const returnsCount = useCountUp({ end: 12, suffix: '%+', duration: 2200, delay: 1400 });
  
  const { smoothScrollY } = useBackgroundParallax(0.3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Helper to get smooth scroll parallax transforms
  const getScrollParallaxStyle = (multiplier: number) => ({
    transform: `translate3d(0, ${smoothScrollY * multiplier}px, 0)`,
    willChange: 'transform',
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    }
  }, []);

  return (
    <section id="home" className="relative overflow-hidden">
      {/* Video Background with Parallax */}
      <div 
        className="absolute inset-0 parallax-layer"
        style={getScrollParallaxStyle(0.1)}
      >
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover scale-110 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage}
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        
        {/* Fallback image while video loads */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      </div>

      {/* Multi-layer gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-financial-primary/20 via-transparent to-transparent" />
      
      {/* Animated gradient orbs with scroll parallax only */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-financial-gold/10 rounded-full blur-3xl animate-float parallax-layer"
          style={getScrollParallaxStyle(0.05)}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-financial-accent/10 rounded-full blur-2xl animate-float parallax-layer" 
          style={{ 
            animationDelay: '1s',
            ...getScrollParallaxStyle(0.08)
          }}
        />
        <div 
          className="absolute top-1/2 right-1/3 w-32 h-32 bg-financial-gold/8 rounded-full blur-xl animate-float parallax-layer" 
          style={{ 
            animationDelay: '2s',
            ...getScrollParallaxStyle(0.04)
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-8 relative max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-4 sm:space-y-5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Take control of your{" "}
                <span className="bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent animate-pulse">
                  financial destiny
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Whether you're saving for a new home, planning your child's education, or growing your retirement fund, we're here to support you in reaching your financial goals.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-financial-accent hover:bg-financial-accent/90 hover:scale-105 transition-all duration-300 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg w-full sm:w-auto"
                onClick={() => window.location.href = '/contact'}
              >
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Consultation
              </Button>
            </div>
          </div>
          
          {/* Right image */}
          <div 
            className="relative animate-slide-up parallax-layer order-1 lg:order-2 flex justify-center lg:justify-end"
            style={getScrollParallaxStyle(-0.05)}
          >
            <div className="relative group max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-r from-financial-accent/20 to-financial-gold/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img 
                src={heroImage} 
                alt="Financial Success" 
                className="relative w-full h-auto rounded-2xl sm:rounded-3xl shadow-financial transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-gradient-gold p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-gold animate-float hover:animate-none hover:scale-110 transition-all duration-300 cursor-pointer">
                <div className="text-center">
                  <div ref={returnsCount.ref} className="text-lg sm:text-2xl font-bold text-financial-primary">
                    {returnsCount.value}
                  </div>
                  <div className="text-xs sm:text-sm text-financial-secondary">Avg. Returns</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats section - centered on page */}
        <div className="flex justify-center pt-8 sm:pt-10">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 md:gap-16 w-full max-w-2xl">
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-financial-accent">
                100%
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground">Research Based</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div ref={clientsCount.ref} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-financial-accent">
                {clientsCount.value}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground">Happy Clients</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div ref={aumCount.ref} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-financial-accent">
                {aumCount.value}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground">Assets Managed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
