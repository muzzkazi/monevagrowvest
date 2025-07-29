import { useEffect, useRef, useState } from 'react';

const GrowthCurve = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
  }, []);

  return (
    <div ref={ref} className="relative w-full h-96">
      <svg 
        viewBox="0 0 400 300" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Growth curve path */}
        <path
          d="M 50 250 Q 100 200 150 180 Q 200 160 250 120 Q 300 80 350 50"
          fill="none"
          stroke="url(#growthGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          className={`${isVisible ? 'animate-growth-line' : ''}`}
          style={{
            strokeDasharray: isVisible ? '1000 1000' : '0 1000',
            strokeDashoffset: '0',
            transition: 'stroke-dasharray 3s ease-out'
          }}
        />
        
        {/* Growth indicator dot */}
        <circle
          cx="350"
          cy="50"
          r="8"
          fill="hsl(var(--financial-success))"
          className={`${isVisible ? 'animate-pulse' : 'opacity-0'} transition-opacity duration-1000 delay-2000`}
        />
        
        {/* Success badge background */}
        <rect
          x="320"
          y="30"
          width="70"
          height="25"
          rx="12"
          fill="hsl(var(--financial-success))"
          className={`${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 delay-2500`}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--financial-success))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--financial-success))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--financial-success))" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* 100% Research Based Badge */}
      <div className={`absolute top-4 right-4 bg-financial-success/10 backdrop-blur-sm border border-financial-success/20 rounded-2xl px-4 py-2 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '2.5s' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-financial-success rounded-full animate-pulse"></div>
          <div>
            <div className="text-2xl font-bold text-financial-success">100%</div>
            <div className="text-xs text-financial-secondary">Research based advice</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthCurve;