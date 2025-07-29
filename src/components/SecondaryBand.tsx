import { useState, useEffect } from "react";

const SecondaryBand = () => {
  const indices = [
    { name: "NIFTY 50", value: "24,837.00", change: "-225.10", changePercent: "-0.90%" },
    { name: "SENSEX", value: "81,463.09", change: "-721.08", changePercent: "-0.88%" },
    { name: "NIFTY BANK", value: "56,528.90", change: "-534.20", changePercent: "-0.94%" },
    { name: "NIFTY IT", value: "44,256.85", change: "-187.45", changePercent: "-0.42%" },
    { name: "NIFTY AUTO", value: "23,678.50", change: "+156.30", changePercent: "+0.66%" }
  ];

  const nifty50Stocks = [
    { symbol: "RELIANCE", price: "2,456.30", change: "+12.50" },
    { symbol: "TCS", price: "3,789.45", change: "-23.80" },
    { symbol: "HDFCBANK", price: "1,623.75", change: "+8.90" },
    { symbol: "INFY", price: "1,834.20", change: "-15.60" },
    { symbol: "ICICIBANK", price: "1,156.80", change: "+7.30" },
    { symbol: "HINDUNILVR", price: "2,678.90", change: "+18.40" },
    { symbol: "ITC", price: "456.75", change: "-3.20" },
    { symbol: "SBIN", price: "823.45", change: "+12.80" },
    { symbol: "BHARTIARTL", price: "1,234.60", change: "-8.90" },
    { symbol: "KOTAKBANK", price: "1,789.30", change: "+15.70" },
    { symbol: "LT", price: "3,456.80", change: "-45.60" },
    { symbol: "ASIANPAINT", price: "2,890.45", change: "+23.80" },
    { symbol: "MARUTI", price: "11,234.70", change: "-78.90" },
    { symbol: "TITAN", price: "3,456.20", change: "+34.50" },
    { symbol: "WIPRO", price: "567.80", change: "-4.30" }
  ];

  return (
    <div className="bg-financial-primary text-white py-4 w-full z-20 relative overflow-hidden">
      {/* First line - Indices */}
      <div className="relative mb-2 overflow-hidden">
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

      {/* Second line - NIFTY 50 Stocks */}
      <div className="relative overflow-hidden">
        <div className="flex animate-[scroll_20s_linear_infinite]">
          {/* First set of stocks */}
          {nifty50Stocks.map((stock, index) => {
            const isPositive = !stock.change.startsWith('-');
            return (
              <div key={`stock-first-${index}`} className="flex items-center gap-2 px-6 whitespace-nowrap">
                <span className="font-medium text-xs text-white/90">{stock.symbol}</span>
                <span className="text-sm font-semibold">{stock.price}</span>
                <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change}
                </span>
                <span className="text-white/30 mx-3">•</span>
              </div>
            );
          })}
          {/* Duplicate set for seamless loop */}
          {nifty50Stocks.map((stock, index) => {
            const isPositive = !stock.change.startsWith('-');
            return (
              <div key={`stock-second-${index}`} className="flex items-center gap-2 px-6 whitespace-nowrap">
                <span className="font-medium text-xs text-white/90">{stock.symbol}</span>
                <span className="text-sm font-semibold">{stock.price}</span>
                <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change}
                </span>
                <span className="text-white/30 mx-3">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecondaryBand;