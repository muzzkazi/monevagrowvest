import { useRef, useEffect, useState, ReactNode } from "react";

interface ParallaxWrapperProps {
  children: ReactNode;
  speed?: number; // -1 to 1, negative = slower, positive = faster
  className?: string;
}

export const ParallaxWrapper = ({ 
  children, 
  speed = 0.5, 
  className = "" 
}: ParallaxWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let rafId: number;
    let targetOffset = 0;
    let currentOffset = 0;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      targetOffset = distanceFromCenter * speed * 0.1;
    };

    const animate = () => {
      currentOffset = lerp(currentOffset, targetOffset, 0.1);
      setOffset(currentOffset);
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        transform: `translate3d(0, ${offset}px, 0)`,
      }}
    >
      {children}
    </div>
  );
};

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
}

export const ParallaxContainer = ({ children, className = "" }: ParallaxContainerProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface ParallaxBackgroundProps {
  children?: ReactNode;
  speed?: number;
  className?: string;
  overlay?: boolean;
  overlayColor?: string;
}

export const ParallaxBackground = ({
  children,
  speed = 0.3,
  className = "",
  overlay = false,
  overlayColor = "bg-background/60"
}: ParallaxBackgroundProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let rafId: number;
    let targetOffset = 0;
    let currentOffset = 0;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const handleScroll = () => {
      if (!ref.current) return;
      
      const scrollY = window.scrollY;
      const rect = ref.current.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      
      targetOffset = (scrollY - elementTop) * speed;
    };

    const animate = () => {
      currentOffset = lerp(currentOffset, targetOffset, 0.1);
      setOffset(currentOffset);
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className={`absolute inset-0 scale-110 will-change-transform ${className}`}
        style={{
          transform: `translate3d(0, ${offset}px, 0)`,
        }}
      >
        {children}
      </div>
      {overlay && <div className={`absolute inset-0 ${overlayColor}`} />}
    </div>
  );
};

export default ParallaxWrapper;
