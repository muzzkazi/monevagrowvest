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
        width="700"
        height="400"
        viewBox="0 0 700 400"
        className="overflow-visible"
      >
        {/* Gradient definitions */}
        <defs>
          {/* Curve gradient */}
          <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          
          {/* Rectangle gradient */}
          <linearGradient id="rectangleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
        </defs>

        {/* Rounded rectangle (appears first, static) */}
        <rect
          x="450"
          y="80"
          width="220"
          height="60"
          rx="30"
          ry="30"
          fill="url(#rectangleGradient)"
          opacity="0.9"
          className="drop-shadow-lg"
        />

        {/* Smooth undulating growth curve */}
        <path
          d="M 50 350 Q 100 320 150 280 Q 200 240 250 260 Q 300 280 350 200 Q 400 120 450 140 Q 480 150 500 110 L 500 110"
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="800"
          strokeDashoffset={isAnimating ? "0" : "800"}
          className="transition-all duration-[4000ms] ease-out"
        />

        {/* Dark green circle at connection point */}
        <circle
          cx="500"
          cy="110"
          r="20"
          fill="#15803d"
          className={`transition-all duration-500 delay-[3500ms] drop-shadow-md ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />

        {/* Text that fades in after curve completion */}
        <text
          x="580"
          y="115"
          textAnchor="middle"
          className={`fill-gray-800 text-lg font-semibold transition-all duration-1000 delay-[4000ms] ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ fontSize: '16px', fontFamily: 'system-ui, sans-serif' }}
        >
          <tspan x="580" dy="0">100%</tspan>
          <tspan x="580" dy="18" className="text-sm font-medium fill-gray-600">Research based advice</tspan>
        </text>

        {/* Subtle glow effect on circle */}
        <circle
          cx="500"
          cy="110"
          r="20"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          opacity="0.6"
          className={`animate-ping transition-all duration-500 delay-[3500ms] ${
            isAnimating ? 'opacity-60' : 'opacity-0'
          }`}
        />
      </svg>
    </div>
  );
};

export default AnimatedGrowthCurve;