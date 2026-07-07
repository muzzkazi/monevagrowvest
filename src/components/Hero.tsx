import { Button } from "@/components/ui/button";
import heroImage from "@/assets/premium-financial-hero.jpg";
import heroVideo from "@/assets/hero-video.mp4";
import heroAdvisorAsset from "@/assets/hero-advisor.webp.asset.json";
const heroAdvisor = heroAdvisorAsset.url;
import { StatsBlock } from "@/components/shared/StatsBlock";
import { useCountUp } from "@/hooks/useCountUp";
import { useBackgroundParallax } from "@/hooks/useParallax";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
    },
  },
};


const Hero = () => {
  const returnsCount = useCountUp({ end: 12, suffix: '%+', duration: 1600, delay: 400 });
  
  const { smoothScrollY } = useBackgroundParallax(0.3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => setVideoFailed(true));
    }
  }, []);

  // Helper to get smooth scroll parallax transforms
  const getScrollParallaxStyle = (multiplier: number) => ({
    transform: `translate3d(0, ${smoothScrollY * multiplier}px, 0)`,
    willChange: 'transform',
  });

  return (
    <section id="home" className="relative overflow-hidden">
      {/* Hero background video with image poster fallback */}
      <div
        className="absolute inset-0 parallax-layer"
        style={getScrollParallaxStyle(0.1)}
      >
        {/* Static poster image — always rendered, prevents layout shift and shows if video fails */}
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          {...({ fetchpriority: "high" } as any)}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover scale-110"
        />
        {!videoFailed && (
          <video
            ref={videoRef}
            src={heroVideo}
            poster={heroImage}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover scale-110 transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
          />
        )}
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
          <motion.div 
            className="space-y-6 sm:space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-4 sm:space-y-5">
              <motion.h1 
                className="text-[28px] sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight text-balance"
                variants={itemVariants}
              >
                Take control of your{" "}
                <span className="bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">
                  financial destiny
                </span>
              </motion.h1>
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
                variants={itemVariants}
              >
                Whether you're saving for a new home, planning your child's education, or growing your retirement fund, we're here to support you in reaching your financial goals.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
              variants={itemVariants}
            >
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
            </motion.div>
          </motion.div>
          
          {/* Right image */}
          <motion.div 
            className="relative parallax-layer order-1 lg:order-2 flex justify-center lg:justify-end"
            style={getScrollParallaxStyle(-0.05)}
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative group max-w-md lg:w-fit">
              <div className="absolute inset-0 bg-gradient-to-r from-financial-accent/20 to-financial-gold/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img 
                src={heroAdvisor} 
                alt="Indian family reviewing investment portfolio together at home" 
                width={1024}
                height={1280}
                className="relative w-full lg:w-auto lg:max-h-[360px] rounded-2xl sm:rounded-3xl shadow-financial transform group-hover:scale-105 transition-transform duration-500"
              />
              <motion.div 
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-gradient-gold p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-gold animate-float hover:animate-none hover:scale-110 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="text-center">
                  <div ref={returnsCount.ref} className="text-lg sm:text-2xl font-bold text-financial-primary">
                    {returnsCount.value}
                  </div>
                  <div className="text-xs sm:text-sm text-financial-secondary">Avg. Returns</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Stats section - compact horizontal strip */}
        <motion.div 
          className="flex justify-center pt-8 sm:pt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <StatsBlock variant="compact" duration={1600} className="max-w-3xl" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
