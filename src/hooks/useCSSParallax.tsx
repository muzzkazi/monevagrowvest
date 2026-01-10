import { useEffect, useRef, useState, useCallback } from "react";

interface ParallaxOptions {
  speed?: number; // Parallax speed multiplier (0.1 = slow, 1 = normal)
  direction?: "up" | "down"; // Direction of parallax movement
  threshold?: number; // When to start the effect (0-1)
}

export const useCSSParallax = (options: ParallaxOptions = {}) => {
  const { speed = 0.3, direction = "up", threshold = 0 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementTop = rect.top;
    const elementHeight = rect.height;

    // Check if element is in viewport
    const inView = elementTop < windowHeight && elementTop + elementHeight > 0;
    setIsInView(inView);

    if (inView) {
      // Calculate how far into the viewport the element is
      const scrollProgress = (windowHeight - elementTop) / (windowHeight + elementHeight);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      
      // Calculate offset based on scroll progress
      const maxOffset = elementHeight * speed;
      const newOffset = direction === "up" 
        ? -clampedProgress * maxOffset 
        : clampedProgress * maxOffset;
      
      setOffset(newOffset);
    } else if (elementTop >= windowHeight) {
      // Reset when element is below viewport (user scrolled back to top)
      setOffset(0);
    }
  }, [speed, direction]);

  useEffect(() => {
    // Initial calculation
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  const style = {
    transform: `translate3d(0, ${offset}px, 0)`,
    willChange: "transform",
    transition: "transform 0.1s ease-out",
  };

  return { ref, style, isInView, offset };
};

// Hook for background parallax (slower movement for backgrounds)
export const useBackgroundCSSParallax = (speed = 0.15) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Reset on mount
    setScrollY(window.scrollY);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const style = {
    transform: `translate3d(0, ${scrollY * speed}px, 0)`,
    willChange: "transform",
  };

  return { scrollY, style };
};

// Component wrapper for parallax elements
interface ParallaxWrapperProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "up" | "down";
  className?: string;
}

export const ParallaxWrapper = ({ 
  children, 
  speed = 0.3, 
  direction = "up",
  className = "" 
}: ParallaxWrapperProps) => {
  const { ref, style } = useCSSParallax({ speed, direction });

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
};
