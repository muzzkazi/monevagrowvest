import { useState, useEffect } from "react";

const SecondaryBand = () => {
  const indices = [
    { name: "NIFTY 50", value: "24,837.00", change: "-225.10", changePercent: "-0.90%" },
    { name: "SENSEX", value: "81,463.09", change: "-721.08", changePercent: "-0.88%" },
    { name: "NIFTY BANK", value: "56,528.90", change: "-534.20", changePercent: "-0.94%" },
    { name: "NIFTY IT", value: "44,256.85", change: "-187.45", changePercent: "-0.42%" },
    { name: "NIFTY AUTO", value: "23,678.50", change: "+156.30", changePercent: "+0.66%" }
  ];

  return (
    <div className="bg-financial-primary text-white py-6 w-full z-10 overflow-hidden">
      <div className="relative">
        <div className="flex animate-[scroll_30s_linear_infinite]">
          {/* First set of indices */}
          {indices.map((item, index) => {
            const isPositive = !item.change.startsWith('-');
            return (
              <div key={`first-${index}`} className="flex items-center gap-2 px-8 whitespace-nowrap">
                <span className="font-medium text-sm">{item.name}</span>
                <span className="text-base font-bold">{item.value}</span>
                <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{isPositive ? '↗' : '↘'}</span>
                  <span>{item.change}</span>
                  <span>({item.changePercent})</span>
                </span>
                <span className="text-white/40 mx-4">|</span>
              </div>
            );
          })}
          {/* Duplicate set for seamless loop */}
          {indices.map((item, index) => {
            const isPositive = !item.change.startsWith('-');
            return (
              <div key={`second-${index}`} className="flex items-center gap-2 px-8 whitespace-nowrap">
                <span className="font-medium text-sm">{item.name}</span>
                <span className="text-base font-bold">{item.value}</span>
                <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{isPositive ? '↗' : '↘'}</span>
                  <span>{item.change}</span>
                  <span>({item.changePercent})</span>
                </span>
                <span className="text-white/40 mx-4">|</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecondaryBand;