import { useMemo } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  Bar,
  Area,
} from 'recharts';
import { CandlestickData, calculateIndicators } from '@/hooks/useHistoricalData';

interface CandlestickChartProps {
  data: CandlestickData[];
  fullData?: CandlestickData[]; // Full data including warmup for indicator calculation
  showSMA20?: boolean;
  showSMA50?: boolean;
  showEMA20?: boolean;
  showBollinger?: boolean;
  showVolume?: boolean;
}

interface CustomCandleProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: CandlestickData;
}

const CustomCandle = ({ x = 0, y = 0, width = 0, payload }: CustomCandleProps) => {
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const fill = isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
  const stroke = isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
  
  // Calculate positions
  const candleWidth = Math.max(width * 0.7, 2);
  const candleX = x + (width - candleWidth) / 2;
  
  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + (payload as any).wickHeight || 0}
        stroke={stroke}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={candleX}
        y={y + Math.min((payload as any).bodyY || 0, (payload as any).bodyHeight || 0)}
        width={candleWidth}
        height={Math.abs((payload as any).bodyHeight || 0) || 1}
        fill={fill}
        stroke={stroke}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;
  
  const data = payload[0].payload;
  const isGreen = data.close >= data.open;
  
  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-sm">
      <div className="font-medium mb-2">{data.date}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-muted-foreground">Open:</span>
        <span className="font-mono">₹{data.open.toLocaleString('en-IN')}</span>
        <span className="text-muted-foreground">High:</span>
        <span className="font-mono">₹{data.high.toLocaleString('en-IN')}</span>
        <span className="text-muted-foreground">Low:</span>
        <span className="font-mono">₹{data.low.toLocaleString('en-IN')}</span>
        <span className="text-muted-foreground">Close:</span>
        <span className={`font-mono ${isGreen ? 'text-emerald-500' : 'text-rose-500'}`}>
          ₹{data.close.toLocaleString('en-IN')}
        </span>
        <span className="text-muted-foreground">Volume:</span>
        <span className="font-mono">{(data.volume / 100000).toFixed(1)}L</span>
      </div>
    </div>
  );
};

export const CandlestickChart = ({
  data,
  fullData,
  showSMA20 = false,
  showSMA50 = false,
  showEMA20 = false,
  showBollinger = false,
  showVolume = true,
}: CandlestickChartProps) => {
  // Calculate indicators using full data (with warmup) for accurate values
  const indicators = useMemo(() => calculateIndicators(fullData || data), [fullData, data]);
  
  // Prepare chart data with calculated values
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    const prices = data.map(d => [d.open, d.high, d.low, d.close]).flat();
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    return data.map((candle, i) => {
      const isGreen = candle.close >= candle.open;
      const bodyTop = Math.max(candle.open, candle.close);
      const bodyBottom = Math.min(candle.open, candle.close);
      
      // Find matching indicator values
      const sma20Val = indicators.sma20.find(s => s?.date === candle.date)?.value;
      const sma50Val = indicators.sma50.find(s => s?.date === candle.date)?.value;
      const ema20Val = indicators.ema20.find(s => s?.date === candle.date)?.value;
      const bbVal = indicators.bollingerBands.find(s => s?.date === candle.date);
      
      return {
        ...candle,
        // For bar chart rendering
        priceRange: [candle.low, candle.high],
        bodyRange: [bodyBottom, bodyTop],
        isGreen,
        // Indicators
        sma20: sma20Val,
        sma50: sma50Val,
        ema20: ema20Val,
        bbUpper: bbVal?.upper,
        bbMiddle: bbVal?.middle,
        bbLower: bbVal?.lower,
      };
    });
  }, [data, indicators]);
  
  if (data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }
  
  const prices = data.map(d => [d.open, d.high, d.low, d.close]).flat();
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;
  
  return (
    <div className="space-y-2">
      {/* Main Price Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Bollinger Bands */}
            {showBollinger && (
              <>
                <Area
                  type="monotone"
                  dataKey="bbUpper"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="bbLower"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fill="hsl(var(--muted) / 0.3)"
                />
              </>
            )}
            
            {/* Candlestick rendering using bars */}
            <Bar
              dataKey="high"
              fill="transparent"
              shape={(props: any) => {
                const { x, width, payload } = props;
                if (!payload) return null;
                
                const isGreen = payload.close >= payload.open;
                const color = isGreen ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(346.8 77.2% 49.8%)';
                const candleWidth = Math.max(width * 0.6, 1);
                const candleX = x + (width - candleWidth) / 2;
                
                // Scale prices to chart coordinates
                const yScale = (price: number) => {
                  return ((maxPrice - price) / (maxPrice - minPrice)) * 280 + 10;
                };
                
                const highY = yScale(payload.high);
                const lowY = yScale(payload.low);
                const openY = yScale(payload.open);
                const closeY = yScale(payload.close);
                const bodyTop = Math.min(openY, closeY);
                const bodyBottom = Math.max(openY, closeY);
                
                return (
                  <g>
                    {/* Wick */}
                    <line
                      x1={x + width / 2}
                      x2={x + width / 2}
                      y1={highY}
                      y2={lowY}
                      stroke={color}
                      strokeWidth={1}
                    />
                    {/* Body */}
                    <rect
                      x={candleX}
                      y={bodyTop}
                      width={candleWidth}
                      height={Math.max(bodyBottom - bodyTop, 1)}
                      fill={isGreen ? color : color}
                      stroke={color}
                    />
                  </g>
                );
              }}
            />
            
            {/* Moving Averages */}
            {showSMA20 && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="hsl(var(--chart-3))"
                strokeWidth={1.5}
                dot={false}
                name="SMA 20"
              />
            )}
            {showSMA50 && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="hsl(var(--chart-4))"
                strokeWidth={1.5}
                dot={false}
                name="SMA 50"
              />
            )}
            {showEMA20 && (
              <Line
                type="monotone"
                dataKey="ema20"
                stroke="hsl(var(--chart-5))"
                strokeWidth={1.5}
                dot={false}
                name="EMA 20"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Volume Chart */}
      {showVolume && (
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis 
                tick={{ fontSize: 9 }}
                tickFormatter={(value) => `${(value / 100000).toFixed(0)}L`}
                width={60}
              />
              <Bar
                dataKey="volume"
                fill="hsl(var(--muted-foreground) / 0.3)"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  if (!payload) return null;
                  const isGreen = payload.close >= payload.open;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isGreen ? 'hsl(142.1 76.2% 36.3% / 0.5)' : 'hsl(346.8 77.2% 49.8% / 0.5)'}
                    />
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
