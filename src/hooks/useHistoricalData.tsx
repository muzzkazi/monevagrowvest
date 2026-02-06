import { useState, useEffect, useMemo } from 'react';
import { StockInfo } from '@/data/stockDatabase';

export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalDataResult {
  data: CandlestickData[];
  fullData: CandlestickData[]; // Includes warmup data for indicator calculation
  isLoading: boolean;
  error: string | null;
}

// Generate realistic historical data based on stock's technical indicators
// Extra days are generated for indicator warmup periods
const generateHistoricalData = (stock: StockInfo, days: number = 90, warmupDays: number = 60): CandlestickData[] => {
  const data: CandlestickData[] = [];
  const today = new Date();
  
  // Total days to generate includes warmup for indicators
  const totalDays = days + warmupDays;
  
  // Start with a base price derived from 52-week range
  const avgPrice = (stock.high52Week + stock.low52Week) / 2;
  const volatility = stock.atrPercent / 100;
  
  // Generate data going backwards
  let currentPrice = avgPrice;
  
  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random daily movement based on volatility
    const dailyChange = (Math.random() - 0.5) * volatility * 2;
    const trendBias = stock.monthlyReturn > 0 ? 0.001 : -0.001;
    
    currentPrice *= (1 + dailyChange + trendBias);
    
    // Clamp within 52-week range with some margin
    currentPrice = Math.max(stock.low52Week * 0.9, Math.min(stock.high52Week * 1.1, currentPrice));
    
    // Generate OHLC based on current price and volatility
    const dailyVolatility = volatility * (0.5 + Math.random());
    const open = currentPrice * (1 + (Math.random() - 0.5) * dailyVolatility);
    const close = currentPrice;
    const high = Math.max(open, close) * (1 + Math.random() * dailyVolatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * dailyVolatility * 0.5);
    
    // Generate volume based on average with variation
    const baseVolume = stock.volumeAvg * 100000;
    const volumeVariation = 0.5 + Math.random() * (stock.volumeChange / 100 + 1);
    const volume = baseVolume * volumeVariation;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.round(volume),
    });
  }
  
  return data;
};

// Calculate technical indicators from historical data
export const calculateIndicators = (data: CandlestickData[]) => {
  if (data.length < 20) return { sma20: [], sma50: [], ema20: [], bollingerBands: [] };
  
  const closes = data.map(d => d.close);
  
  // SMA calculations
  const sma20 = closes.map((_, i) => {
    if (i < 19) return null;
    const sum = closes.slice(i - 19, i + 1).reduce((a, b) => a + b, 0);
    return { date: data[i].date, value: sum / 20 };
  }).filter(Boolean);
  
  const sma50 = closes.map((_, i) => {
    if (i < 49) return null;
    const sum = closes.slice(i - 49, i + 1).reduce((a, b) => a + b, 0);
    return { date: data[i].date, value: sum / 50 };
  }).filter(Boolean);
  
  // EMA calculation
  const ema20: { date: string; value: number }[] = [];
  const multiplier = 2 / (20 + 1);
  let ema = closes.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
  
  for (let i = 19; i < closes.length; i++) {
    ema = (closes[i] - ema) * multiplier + ema;
    ema20.push({ date: data[i].date, value: ema });
  }
  
  // Bollinger Bands
  const bollingerBands = closes.map((_, i) => {
    if (i < 19) return null;
    const slice = closes.slice(i - 19, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / 20;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20;
    const stdDev = Math.sqrt(variance);
    return {
      date: data[i].date,
      upper: mean + 2 * stdDev,
      middle: mean,
      lower: mean - 2 * stdDev,
    };
  }).filter(Boolean);
  
  return { sma20, sma50, ema20, bollingerBands };
};

export const useHistoricalData = (stock: StockInfo | null, days: number = 90): HistoricalDataResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullData, setFullData] = useState<CandlestickData[]>([]);
  const [data, setData] = useState<CandlestickData[]>([]);
  
  useEffect(() => {
    if (!stock) {
      setData([]);
      setFullData([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Use setTimeout to simulate async and prevent blocking
    const timeoutId = setTimeout(() => {
      try {
      // Generate data with extra warmup period for indicators
        // SMA50 needs 50 trading days; 80 calendar days ≈ 57 trading days (accounting for weekends)
        const warmupDays = 80;
        const historicalData = generateHistoricalData(stock, days, warmupDays);
        
        // Store full data for indicator calculation
        setFullData(historicalData);
        
        // Only show the requested number of days on the chart
        const visibleData = historicalData.slice(-Math.min(days, historicalData.length));
        setData(visibleData);
      } catch (err) {
        setError('Failed to generate historical data');
        setData([]);
        setFullData([]);
      } finally {
        setIsLoading(false);
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [stock?.symbol, days]);
  
  return { data, fullData, isLoading, error };
};
