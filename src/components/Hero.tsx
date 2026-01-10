import { Button } from "@/components/ui/button";
import heroImage from "@/assets/premium-financial-hero.jpg";
import heroVideo from "@/assets/hero-video.mp4";
import { useCountUp } from "@/hooks/useCountUp";
import { useBackgroundParallax } from "@/hooks/useParallax";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, Wallet } from "lucide-react";

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

  const stats = [
    { icon: TrendingUp, value: "100%", label: "Research Based", ref: null },
    { icon: Users, value: clientsCount.value, label: "Happy Clients", ref: clientsCount.ref },
    { icon: Wallet, value: aumCount.value, label: "Assets Managed", ref: aumCount.ref },
  ];

  return (
    <section id="home" className="relative min-h-screen overflow-hidden flex items-center">
      {/* Video Background */}
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
        
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/85 to-background/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Animated Accent Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 right-10 w-96 h-96 bg-financial-accent/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-72 h-72 bg-financial-gold/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content - 7 columns */}
          <motion.div 
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-financial-accent/10 border border-financial-accent/20 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-financial-accent animate-pulse" />
              <span className="text-sm font-medium text-financial-accent">Trusted by 500+ Investors</span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                <span className="text-foreground">Build Your</span>
                <br />
                <span className="bg-gradient-to-r from-financial-accent via-financial-gold to-financial-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                  Financial Future
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Expert guidance for your investments. From retirement planning to wealth creation, 
                we craft personalized strategies that grow with you.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button 
                size="lg" 
                className="group bg-financial-accent hover:bg-financial-accent/90 text-white px-8 py-6 text-lg shadow-lg shadow-financial-accent/25 hover:shadow-xl hover:shadow-financial-accent/30 transition-all duration-300"
                onClick={() => window.location.href = '/contact'}
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg border-2 border-border hover:border-financial-accent hover:text-financial-accent transition-all duration-300"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Consultation
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              className="flex flex-wrap gap-8 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-financial-accent/10 text-financial-accent">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div 
                      ref={stat.ref}
                      className="text-2xl font-bold text-foreground"
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right Visual - 5 columns */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={getScrollParallaxStyle(-0.03)}
          >
            <div className="relative">
              {/* Glow effect behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-financial-accent/20 via-financial-gold/20 to-financial-accent/20 rounded-3xl blur-2xl opacity-60" />
              
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Financial Success - Professional advisor helping clients achieve their investment goals" 
                  className="w-full h-auto object-cover"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
              
              {/* Floating Stats Card */}
              <motion.div 
                className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 glass-card p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div ref={returnsCount.ref} className="text-xl font-bold text-foreground">
                      {returnsCount.value}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg. Returns</div>
                  </div>
                </div>
              </motion.div>

              {/* Trust Badge */}
              <motion.div 
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 glass-card px-4 py-2 rounded-full border border-white/10 shadow-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-financial-accent to-financial-gold border-2 border-background" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">500+ trust us</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
