import { useEffect, useState } from 'react';

const AnimatedGrowthCurve = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        width="600"
        height="400"
        viewBox="0 0 600 400"
        className="overflow-visible"
      >
        {/* Main wavy growth curve path - matches the reference image exactly */}
        <path
          d="M 80 350 Q 120 320 160 330 Q 200 340 240 310 Q 280 280 320 290 Q 360 300 400 270 Q 440 240 480 200 Q 520 160 560 120"
          fill="none"
          stroke="url(#growthGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={isAnimating ? "0" : "1000"}
          className="transition-all duration-[5000ms] ease-out"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="growthGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="30%" stopColor="#4ade80" />
            <stop offset="70%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        
        {/* End point circle */}
        <circle
          cx="560"
          cy="120"
          r="16"
          fill="#16a34a"
          className={`transition-all duration-500 delay-[4500ms] ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
        
        {/* Pulsing effect on the circle */}
        <circle
          cx="560"
          cy="120"
          r="16"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          className={`animate-ping transition-all duration-500 delay-[4500ms] ${
            isAnimating ? 'opacity-75' : 'opacity-0'
          }`}
        />
      </svg>
      
      {/* 100% Research badge */}
      <div
        className={`absolute top-16 right-8 bg-gradient-to-br from-orange-100 to-yellow-200 px-6 py-3 rounded-full shadow-lg transform transition-all duration-700 delay-[4800ms] ${
          isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <div className="text-xl font-bold text-gray-800">100%</div>
            <div className="text-sm text-gray-600 -mt-1">Research based advice</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedGrowthCurve;