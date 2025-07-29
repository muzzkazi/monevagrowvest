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
        width="800"
        height="500"
        viewBox="0 0 800 500"
        className="overflow-visible"
      >
        {/* Gradient definitions */}
        <defs>
          {/* Rectangle gradient matching the reference image */}
          <linearGradient id="rectangleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C6EB75" />
            <stop offset="100%" stopColor="#E0E8FF" />
          </linearGradient>
        </defs>

        {/* Rounded rectangle that fades in after curve connection */}
        <rect
          x="580"
          y="80"
          width="200"
          height="70"
          rx="35"
          ry="35"
          fill="url(#rectangleGradient)"
          className={`transition-all duration-1000 delay-[4000ms] ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Smooth curve matching the exact pattern from reference image */}
        <path
          d="M 50 450 Q 100 420 150 400 Q 200 380 250 420 Q 300 460 350 380 Q 400 300 450 340 Q 500 380 550 280 Q 570 240 580 200 Q 590 160 600 140 Q 610 120 620 115"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="1200"
          strokeDashoffset={isAnimating ? "0" : "1200"}
          className="transition-all duration-[3500ms] ease-out"
        />

        {/* Dark green circle at connection point */}
        <circle
          cx="620"
          cy="115"
          r="22"
          fill="#4CAF50"
          className={`transition-all duration-500 delay-[3500ms] drop-shadow-lg ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />

        {/* Text that fades in after rectangle appears */}
        <text
          x="690"
          y="110"
          textAnchor="middle"
          className={`fill-gray-700 font-semibold transition-all duration-1000 delay-[5000ms] ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ fontSize: '18px', fontFamily: 'system-ui, sans-serif' }}
        >
          <tspan x="690" dy="0" className="text-xl font-bold">100%</tspan>
          <tspan x="690" dy="20" className="text-sm font-medium fill-gray-600">Research based advice</tspan>
        </text>

        {/* Subtle pulse effect on the circle */}
        <circle
          cx="620"
          cy="115"
          r="22"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="1"
          opacity="0.4"
          className={`animate-pulse transition-all duration-500 delay-[3500ms] ${
            isAnimating ? 'opacity-40' : 'opacity-0'
          }`}
        />
      </svg>
    </div>
  );
};

export default AnimatedGrowthCurve;