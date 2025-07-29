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
    { symbol: "RELIANCE", price: "2,456.30", change: "+12.50", percent: "+0.51%" },
    { symbol: "TCS", price: "3,789.45", change: "-23.80", percent: "-0.62%" },
    { symbol: "HDFCBANK", price: "1,623.75", change: "+8.90", percent: "+0.55%" },
    { symbol: "INFY", price: "1,834.20", change: "-15.60", percent: "-0.84%" },
    { symbol: "ICICIBANK", price: "1,156.80", change: "+7.30", percent: "+0.64%" },
    { symbol: "HINDUNILVR", price: "2,678.90", change: "+18.40", percent: "+0.69%" },
    { symbol: "ITC", price: "456.75", change: "-3.20", percent: "-0.69%" },
    { symbol: "SBIN", price: "823.45", change: "+12.80", percent: "+1.58%" },
    { symbol: "BHARTIARTL", price: "1,234.60", change: "-8.90", percent: "-0.72%" },
    { symbol: "KOTAKBANK", price: "1,789.30", change: "+15.70", percent: "+0.88%" },
    { symbol: "LT", price: "3,456.80", change: "-45.60", percent: "-1.30%" },
    { symbol: "ASIANPAINT", price: "2,890.45", change: "+23.80", percent: "+0.83%" },
    { symbol: "MARUTI", price: "11,234.70", change: "-78.90", percent: "-0.70%" },
    { symbol: "TITAN", price: "3,456.20", change: "+34.50", percent: "+1.01%" },
    { symbol: "WIPRO", price: "567.80", change: "-4.30", percent: "-0.75%" },
    { symbol: "NESTLEIND", price: "2,456.90", change: "+45.20", percent: "+1.87%" },
    { symbol: "POWERGRID", price: "234.50", change: "-2.10", percent: "-0.89%" },
    { symbol: "NTPC", price: "345.80", change: "+5.40", percent: "+1.59%" },
    { symbol: "ONGC", price: "189.45", change: "-1.80", percent: "-0.94%" },
    { symbol: "COALINDIA", price: "412.30", change: "+8.70", percent: "+2.16%" },
    { symbol: "HCLTECH", price: "1,567.20", change: "-12.40", percent: "-0.78%" },
    { symbol: "TECHM", price: "1,234.80", change: "+18.90", percent: "+1.55%" },
    { symbol: "BAJFINANCE", price: "6,789.50", change: "-89.20", percent: "-1.30%" },
    { symbol: "BAJAJFINSV", price: "1,678.90", change: "+23.40", percent: "+1.41%" },
    { symbol: "SUNPHARMA", price: "1,234.70", change: "+15.60", percent: "+1.28%" },
    { symbol: "DRREDDY", price: "5,678.20", change: "-45.80", percent: "-0.80%" },
    { symbol: "CIPLA", price: "1,089.40", change: "+12.30", percent: "+1.14%" },
    { symbol: "DIVISLAB", price: "4,567.80", change: "-56.70", percent: "-1.23%" },
    { symbol: "HEROMOTOCO", price: "4,234.50", change: "+34.20", percent: "+0.81%" },
    { symbol: "BAJAJ-AUTO", price: "8,901.20", change: "-78.40", percent: "-0.87%" },
    { symbol: "M&M", price: "2,345.60", change: "+23.80", percent: "+1.03%" },
    { symbol: "TATAMOTORS", price: "890.30", change: "-8.90", percent: "-0.99%" },
    { symbol: "TATASTEEL", price: "134.70", change: "+2.40", percent: "+1.81%" },
    { symbol: "JSWSTEEL", price: "789.20", change: "-5.60", percent: "-0.70%" },
    { symbol: "HINDALCO", price: "567.80", change: "+8.90", percent: "+1.59%" },
    { symbol: "VEDL", price: "234.50", change: "-3.20", percent: "-1.35%" },
    { symbol: "ADANIPORTS", price: "789.40", change: "+12.30", percent: "+1.58%" },
    { symbol: "ULTRACEMCO", price: "8,234.50", change: "-89.60", percent: "-1.08%" },
    { symbol: "GRASIM", price: "2,345.80", change: "+34.70", percent: "+1.50%" },
    { symbol: "SHRIRAMFIN", price: "2,789.30", change: "-23.40", percent: "-0.83%" },
    { symbol: "SBILIFE", price: "1,456.20", change: "+18.90", percent: "+1.31%" },
    { symbol: "HDFCLIFE", price: "678.90", change: "-8.70", percent: "-1.27%" },
    { symbol: "INDUSINDBK", price: "1,234.50", change: "+15.60", percent: "+1.28%" },
    { symbol: "AXISBANK", price: "1,089.70", change: "-12.30", percent: "-1.12%" },
    { symbol: "APOLLOHOSP", price: "5,678.20", change: "+67.80", percent: "+1.21%" },
    { symbol: "BRITANNIA", price: "4,890.30", change: "-45.60", percent: "-0.92%" },
    { symbol: "TATACONSUM", price: "890.40", change: "+8.70", percent: "+0.99%" },
    { symbol: "EICHERMOT", price: "4,567.80", change: "-56.90", percent: "-1.23%" },
    { symbol: "BPCL", price: "345.60", change: "+4.50", percent: "+1.32%" },
    { symbol: "IOC", price: "123.80", change: "-1.90", percent: "-1.51%" }
  ];

  return (
    <div className="bg-financial-primary text-white pt-4 pb-2 w-full z-20 relative overflow-hidden mt-4 flex flex-col justify-center">
      {/* First line - Indices */}
      <div className="relative mb-2 overflow-hidden">
        <div className="flex animate-scroll will-change-transform">
          {/* Continuous loop - multiple copies for seamless scrolling */}
          {[...indices, ...indices, ...indices, ...indices].map((item, index) => {
            const isPositive = !item.change.startsWith('-');
            return (
              <div key={`index-${index}`} className="flex items-center whitespace-nowrap flex-shrink-0">
                <div className="flex items-center gap-2 px-6">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-base font-bold">{item.value}</span>
                  <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <span>{isPositive ? '↗' : '↘'}</span>
                    <span>{item.change}</span>
                    <span>({item.changePercent})</span>
                  </span>
                </div>
                <span className="text-white/40 mx-4">|</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Second line - NIFTY 50 Stocks */}
      <div className="relative overflow-hidden">
        <div className="flex animate-scroll-fast will-change-transform">
          {/* Continuous loop - multiple copies for seamless scrolling */}
          {[...nifty50Stocks, ...nifty50Stocks, ...nifty50Stocks, ...nifty50Stocks].map((stock, index) => {
            const isPositive = !stock.change.startsWith('-');
            return (
              <div key={`stock-${index}`} className="flex items-center whitespace-nowrap flex-shrink-0">
                <div className="flex items-center gap-2 px-3">
                  <span className="font-medium text-xs text-white/90">{stock.symbol}</span>
                  <span className="text-sm font-semibold">{stock.price}</span>
                  <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change}
                  </span>
                  <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    ({stock.percent})
                  </span>
                </div>
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