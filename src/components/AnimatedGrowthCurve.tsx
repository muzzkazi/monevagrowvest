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
        width="500"
        height="300"
        viewBox="0 0 500 300"
        className="overflow-visible"
      >
        {/* Main wavy growth curve path */}
        <path
          d="M 50 280 Q 100 260 120 240 Q 140 220 160 200 Q 180 180 200 160 Q 220 140 240 120 Q 260 100 280 110 Q 300 120 320 100 Q 340 80 360 70 Q 380 60 400 50"
          fill="none"
          stroke="url(#growthGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={isAnimating ? "0" : "1000"}
          className="transition-all duration-[4000ms] ease-out"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        
        {/* End point circle */}
        <circle
          cx="400"
          cy="50"
          r="12"
          fill="#16a34a"
          className={`transition-all duration-500 delay-[3500ms] ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
        
        {/* Pulsing effect on the circle */}
        <circle
          cx="400"
          cy="50"
          r="12"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          className={`animate-ping transition-all duration-500 delay-[3500ms] ${
            isAnimating ? 'opacity-75' : 'opacity-0'
          }`}
        />
      </svg>
      
      {/* 100% Research badge */}
      <div
        className={`absolute top-8 right-12 bg-gradient-to-br from-yellow-100 to-yellow-200 px-4 py-2 rounded-full shadow-lg transform transition-all duration-700 delay-[3800ms] ${
          isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <div className="text-lg font-bold text-gray-800">100%</div>
            <div className="text-xs text-gray-600 -mt-1">Research based advice</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedGrowthCurve;