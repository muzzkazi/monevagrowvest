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
    { symbol: "WIPRO", price: "567.80", change: "-4.30" },
    { symbol: "NESTLEIND", price: "2,456.90", change: "+45.20" },
    { symbol: "POWERGRID", price: "234.50", change: "-2.10" },
    { symbol: "NTPC", price: "345.80", change: "+5.40" },
    { symbol: "ONGC", price: "189.45", change: "-1.80" },
    { symbol: "COALINDIA", price: "412.30", change: "+8.70" },
    { symbol: "HCLTECH", price: "1,567.20", change: "-12.40" },
    { symbol: "TECHM", price: "1,234.80", change: "+18.90" },
    { symbol: "BAJFINANCE", price: "6,789.50", change: "-89.20" },
    { symbol: "BAJAJFINSV", price: "1,678.90", change: "+23.40" },
    { symbol: "SUNPHARMA", price: "1,234.70", change: "+15.60" },
    { symbol: "DRREDDY", price: "5,678.20", change: "-45.80" },
    { symbol: "CIPLA", price: "1,089.40", change: "+12.30" },
    { symbol: "DIVISLAB", price: "4,567.80", change: "-56.70" },
    { symbol: "HEROMOTOCO", price: "4,234.50", change: "+34.20" },
    { symbol: "BAJAJ-AUTO", price: "8,901.20", change: "-78.40" },
    { symbol: "M&M", price: "2,345.60", change: "+23.80" },
    { symbol: "TATAMOTORS", price: "890.30", change: "-8.90" },
    { symbol: "TATASTEEL", price: "134.70", change: "+2.40" },
    { symbol: "JSWSTEEL", price: "789.20", change: "-5.60" },
    { symbol: "HINDALCO", price: "567.80", change: "+8.90" },
    { symbol: "VEDL", price: "234.50", change: "-3.20" },
    { symbol: "ADANIPORTS", price: "789.40", change: "+12.30" },
    { symbol: "ULTRACEMCO", price: "8,234.50", change: "-89.60" },
    { symbol: "GRASIM", price: "2,345.80", change: "+34.70" },
    { symbol: "SHRIRAMFIN", price: "2,789.30", change: "-23.40" },
    { symbol: "SBILIFE", price: "1,456.20", change: "+18.90" },
    { symbol: "HDFCLIFE", price: "678.90", change: "-8.70" },
    { symbol: "INDUSINDBK", price: "1,234.50", change: "+15.60" },
    { symbol: "AXISBANK", price: "1,089.70", change: "-12.30" },
    { symbol: "APOLLOHOSP", price: "5,678.20", change: "+67.80" },
    { symbol: "BRITANNIA", price: "4,890.30", change: "-45.60" },
    { symbol: "TATACONSUM", price: "890.40", change: "+8.70" },
    { symbol: "EICHERMOT", price: "4,567.80", change: "-56.90" },
    { symbol: "BPCL", price: "345.60", change: "+4.50" },
    { symbol: "IOC", price: "123.80", change: "-1.90" }
  ];

  return (
    <div className="bg-financial-primary text-white pt-4 pb-2 w-full z-20 relative overflow-hidden mt-4 flex flex-col justify-center">
      {/* First line - Indices */}
      <div className="relative mb-2 overflow-hidden">
        <div className="flex animate-[scroll_25s_linear_infinite] will-change-transform">
          {/* First set of indices */}
          {indices.map((item, index) => {
            const isPositive = !item.change.startsWith('-');
            return (
              <div key={`first-${index}`} className="flex items-center gap-2 px-8 whitespace-nowrap flex-shrink-0">
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
          {/* Second set for seamless loop */}
          {indices.map((item, index) => {
            const isPositive = !item.change.startsWith('-');
            return (
              <div key={`second-${index}`} className="flex items-center gap-2 px-8 whitespace-nowrap flex-shrink-0">
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
        <div className="flex animate-[scroll_60s_linear_infinite] will-change-transform">
          {/* First set of stocks */}
          {nifty50Stocks.map((stock, index) => {
            const isPositive = !stock.change.startsWith('-');
            return (
              <div key={`stock-first-${index}`} className="flex items-center gap-2 px-4 whitespace-nowrap flex-shrink-0">
                <span className="font-medium text-xs text-white/90">{stock.symbol}</span>
                <span className="text-sm font-semibold">{stock.price}</span>
                <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change}
                </span>
                <span className="text-white/30 mx-2">•</span>
              </div>
            );
          })}
          {/* Second set for seamless loop */}
          {nifty50Stocks.map((stock, index) => {
            const isPositive = !stock.change.startsWith('-');
            return (
              <div key={`stock-second-${index}`} className="flex items-center gap-2 px-4 whitespace-nowrap flex-shrink-0">
                <span className="font-medium text-xs text-white/90">{stock.symbol}</span>
                <span className="text-sm font-semibold">{stock.price}</span>
                <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change}
                </span>
                <span className="text-white/30 mx-2">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecondaryBand;