import { useEffect, useRef } from 'react';

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ 
  count = 20,
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create particles
    const particles: HTMLDivElement[] = [];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 15;
      const left = Math.random() * 100;
      const opacity = Math.random() * 0.3 + 0.1;
      
      particle.className = 'absolute rounded-full bg-financial-accent/20 dark:bg-financial-gold/20 pointer-events-none';
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        bottom: -10px;
        opacity: ${opacity};
        animation: floatUp ${duration}s ease-in-out ${delay}s infinite;
      `;
      
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, [count]);

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '' : '-'}30px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
      <div 
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
        aria-hidden="true"
      />
    </>
  );
};

export default FloatingParticles;
