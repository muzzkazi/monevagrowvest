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
  duration = 900, 
  start = 0, 
  prefix = '', 
  suffix = '',
  delay = 0 
}: UseCountUpProps) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const hasStarted = useRef(false);
  const hasCompleted = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible || hasCompleted.current) return;

    timeoutRef.current = setTimeout(() => {
      if (hasCompleted.current) return;

      const steps = Math.max(1, Math.floor(duration / 16));
      const increment = (end - start) / steps;
      let step = 0;

      intervalRef.current = setInterval(() => {
        if (hasCompleted.current) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return;
        }
        step += 1;
        if (step >= steps) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setCount(end);
          hasCompleted.current = true;
        } else {
          setCount(Math.round(start + increment * step));
        }
      }, 16);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible, end, start, duration, delay]);

  useEffect(() => {
    if (!isVisible || isInView || hasCompleted.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setCount(end);
    hasCompleted.current = true;
  }, [isVisible, isInView, end]);

  // Fallback: ensure the final value is shown even if the element is only
  // briefly visible (e.g., user scrolls past quickly) or never triggers.
  useEffect(() => {
    const fallback = setTimeout(() => {
      if (hasCompleted.current) return;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setCount(end);
      hasCompleted.current = true;
    }, delay + duration + 100);

    return () => clearTimeout(fallback);
  }, [delay, duration, end]);

  const displayValue = `${prefix}${Math.round(count)}${suffix}`;

  return { value: displayValue, ref };
};