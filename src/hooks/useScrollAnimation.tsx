import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (_options: UseScrollAnimationOptions = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  // Scroll animations disabled — always visible
  return { ref, isVisible: true };
};

// Hook for scroll-based progress (0 to 1)
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const updateProgress = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate progress: 0 when element enters, 1 when it leaves
    const elementTop = rect.top;
    const elementHeight = rect.height;
    
    // Start when element enters viewport, end when it leaves
    const start = windowHeight;
    const end = -elementHeight;
    const current = elementTop;
    
    const calculatedProgress = 1 - (current - end) / (start - end);
    setProgress(Math.max(0, Math.min(1, calculatedProgress)));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, [updateProgress]);

  return { ref, progress };
};

// Hook for CSS parallax effect
export const useParallaxScroll = (_speed: number = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);
  // Parallax scroll disabled
  return { ref, offset: 0 };
};

// Component for animated sections
interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in';
  delay?: number;
  className?: string;
  staggerChildren?: boolean;
  triggerOnce?: boolean;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  animation = 'fade-in',
  delay = 0,
  className = '',
  staggerChildren = false,
  triggerOnce = false,
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce });

  const animationClass = {
    'fade-in': 'scroll-fade-in',
    'slide-left': 'scroll-slide-left',
    'slide-right': 'scroll-slide-right',
    'scale-in': 'scroll-scale-in',
  }[animation];

  return (
    <div
      ref={ref}
      className={`${staggerChildren ? 'stagger-children' : animationClass} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

// Parallax Section Component
interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.1,
  className = '',
}) => {
  const { ref, offset } = useParallaxScroll(speed);

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
};
