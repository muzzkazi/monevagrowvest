import { useState, useEffect } from "react";

const SecondaryBand = () => {
  const [indices, setIndices] = useState([
    { name: "NIFTY 50", value: "24,837.00", change: "-225.10", changePercent: "-0.90%" },
    { name: "SENSEX", value: "81,463.09", change: "-721.08", changePercent: "-0.88%" },
    { name: "NIFTY BANK", value: "56,528.90", change: "-534.20", changePercent: "-0.94%" },
    { name: "NIFTY IT", value: "44,256.85", change: "-187.45", changePercent: "-0.42%" },
    { name: "NIFTY AUTO", value: "23,678.50", change: "+156.30", changePercent: "+0.66%" }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % indices.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [indices.length]);

  const currentData = indices[currentIndex];
  const isPositive = !currentData.change.startsWith('-');

  return (
    <div className="bg-financial-primary text-white py-6 w-full z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium">{currentData.name}</span>
            <span className="text-lg font-bold">{currentData.value}</span>
            <span className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{isPositive ? '↗' : '↘'}</span>
              <span>{currentData.change}</span>
              <span>({currentData.changePercent})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondaryBand;