import { useEffect, useState, useRef, useCallback } from 'react';

interface ParallaxOptions {
  speed?: number; // 0.1 = slow, 1 = same as scroll, -1 = opposite
  direction?: 'vertical' | 'horizontal';
  easing?: boolean;
}

export const useParallax = (options: ParallaxOptions = {}) => {
  const { speed = 0.5, direction = 'vertical', easing = true } = options;
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);
  const targetOffset = useRef(0);
  const currentOffset = useRef(0);
  const animationFrame = useRef<number>();

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const animate = useCallback(() => {
    // Smooth interpolation with lerp for ultra-smooth movement
    currentOffset.current = lerp(currentOffset.current, targetOffset.current, 0.08);
    
    // Only update if there's significant change
    if (Math.abs(currentOffset.current - targetOffset.current) > 0.01) {
      setOffset(currentOffset.current);
      animationFrame.current = requestAnimationFrame(animate);
    } else {
      setOffset(targetOffset.current);
      ticking.current = false;
    }
  }, []);

  const updateOffset = useCallback(() => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    const distanceFromCenter = elementCenter - viewportCenter;
    
    targetOffset.current = distanceFromCenter * speed * -1;
    
    if (!ticking.current) {
      ticking.current = true;
      animationFrame.current = requestAnimationFrame(animate);
    }
  }, [speed, animate]);

  const handleScroll = useCallback(() => {
    updateOffset();
  }, [updateOffset]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateOffset();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [handleScroll, updateOffset]);

  const style = {
    transform: direction === 'vertical' 
      ? `translate3d(0, ${offset}px, 0)` 
      : `translate3d(${offset}px, 0, 0)`,
    transition: easing ? 'none' : 'none', // Animation is handled by lerp
    willChange: 'transform',
  };

  return { ref: elementRef, style, offset };
};

// Hook for background parallax effect with smooth interpolation
export const useBackgroundParallax = (speed: number = 0.3) => {
  const [smoothScrollY, setSmoothScrollY] = useState(0);
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);
  const animationFrame = useRef<number>();
  const ticking = useRef(false);

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const animate = useCallback(() => {
    currentScrollY.current = lerp(currentScrollY.current, targetScrollY.current, 0.06);
    
    if (Math.abs(currentScrollY.current - targetScrollY.current) > 0.5) {
      setSmoothScrollY(currentScrollY.current);
      animationFrame.current = requestAnimationFrame(animate);
    } else {
      setSmoothScrollY(targetScrollY.current);
      ticking.current = false;
    }
  }, []);

  const handleScroll = useCallback(() => {
    targetScrollY.current = window.scrollY;
    
    if (!ticking.current) {
      ticking.current = true;
      animationFrame.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [handleScroll]);

  return {
    backgroundPositionY: `${smoothScrollY * speed}px`,
    transform: `translate3d(0, ${smoothScrollY * speed}px, 0)`,
    smoothScrollY,
  };
};

// Component wrapper for parallax sections
interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  backgroundImage?: string;
  overlay?: boolean;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.3,
  className = '',
  backgroundImage,
  overlay = true,
}) => {
  const { backgroundPositionY } = useBackgroundParallax(speed);

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            transform: `translateY(${parseFloat(backgroundPositionY) * -1}px) scale(1.2)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
      {overlay && backgroundImage && (
        <div className="absolute inset-0 bg-background/80 dark:bg-background/90" />
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
};
