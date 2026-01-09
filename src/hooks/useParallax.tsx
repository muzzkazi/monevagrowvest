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

  const updateOffset = useCallback(() => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how far the element is from the center of the viewport
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    const distanceFromCenter = elementCenter - viewportCenter;
    
    // Apply parallax based on distance from center
    const parallaxOffset = distanceFromCenter * speed * -1;
    
    setOffset(parallaxOffset);
    ticking.current = false;
  }, [speed]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateOffset);
      ticking.current = true;
    }
  }, [updateOffset]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateOffset(); // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, updateOffset]);

  const style = {
    transform: direction === 'vertical' 
      ? `translateY(${offset}px)` 
      : `translateX(${offset}px)`,
    transition: easing ? 'transform 0.1s ease-out' : 'none',
    willChange: 'transform',
  };

  return { ref: elementRef, style, offset };
};

// Hook for background parallax effect
export const useBackgroundParallax = (speed: number = 0.3) => {
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  const updateScrollY = useCallback(() => {
    setScrollY(window.scrollY);
    ticking.current = false;
  }, []);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollY);
      ticking.current = true;
    }
  }, [updateScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    backgroundPositionY: `${scrollY * speed}px`,
    transform: `translateY(${scrollY * speed}px)`,
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
