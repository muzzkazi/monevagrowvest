import { useState, useEffect, useCallback, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseParallaxOptions {
  strength?: number;
  smoothing?: number;
}

export const useMouseParallax = (options: MouseParallaxOptions = {}) => {
  const { strength = 20, smoothing = 0.1 } = options;
  
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const targetPosition = useRef<MousePosition>({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Normalize mouse position to -1 to 1 range
    targetPosition.current = {
      x: (e.clientX - centerX) / centerX,
      y: (e.clientY - centerY) / centerY,
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      setMousePosition(prev => ({
        x: lerp(prev.x, targetPosition.current.x, smoothing),
        y: lerp(prev.y, targetPosition.current.y, smoothing),
      }));
      animationFrameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleMouseMove, smoothing]);

  // Get transform style for an element based on mouse position
  const getMouseParallaxStyle = useCallback((multiplier: number = 1, rotateAmount: number = 0) => {
    const translateX = mousePosition.x * strength * multiplier;
    const translateY = mousePosition.y * strength * multiplier;
    const rotateX = mousePosition.y * rotateAmount * -1;
    const rotateY = mousePosition.x * rotateAmount;

    return {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) ${rotateAmount ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : ''}`,
      willChange: 'transform',
      transition: 'none',
    };
  }, [mousePosition, strength]);

  return {
    mousePosition,
    getMouseParallaxStyle,
  };
};
