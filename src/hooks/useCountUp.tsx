import { useState, useEffect, useRef } from 'react';

interface UseCountUpProps {
  end: number;
  duration?: number;
  start?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

export const useCountUp = ({ 
  end, 
  duration = 2000, 
  start = 0, 
  prefix = '', 
  suffix = '',
  delay = 0 
}: UseCountUpProps) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        setCount(prevCount => {
          const nextCount = prevCount + increment;
          if (nextCount >= end) {
            clearInterval(timer);
            return end;
          }
          return nextCount;
        });
      }, 16);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, end, duration, delay]);

  const displayValue = `${prefix}${Math.floor(count)}${suffix}`;

  return { value: displayValue, ref };
};