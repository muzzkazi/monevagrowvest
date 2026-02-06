import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { StockInfo } from '@/data/stockDatabase';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import { CandlestickChart } from './CandlestickChart';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Building2, 
  Percent,
  Calendar,
  LineChart,
  CandlestickChart as CandlestickIcon,
  Loader2,
  X
} from 'lucide-react';

interface StockDetailModalProps {
  stock: StockInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  livePrice?: number;
  priceChange?: number;
  changePercent?: number;
}

export const StockDetailModal = ({
  stock,
  open,
  onOpenChange,
  livePrice,
  priceChange = 0,
  changePercent = 0,
}: StockDetailModalProps) => {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showEMA20, setShowEMA20] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [chartDays, setChartDays] = useState(90);
  
  const { data: historicalData, fullData, isLoading } = useHistoricalData(stock, chartDays);
  
  if (!stock) return null;
  
  const isPositive = priceChange >= 0;
  const currentPrice = livePrice || stock.high52Week * 0.9;
  
  // Calculate price position in 52-week range
  const pricePosition = ((currentPrice - stock.low52Week) / (stock.high52Week - stock.low52Week)) * 100;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl font-bold">{stock.symbol}</DialogTitle>
                <Badge variant="outline">{stock.sector}</Badge>
                {stock.indices.includes("NIFTY50") && (
                  <Badge className="bg-financial-accent/20 text-financial-accent border-0">N50</Badge>
                )}
                {stock.indices.includes("SENSEX") && (
                  <Badge className="bg-amber-500/20 text-amber-600 border-0">BSE</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{stock.name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                ₹{currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center justify-end gap-1 text-lg ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
                <span className="text-sm">({isPositive ? '+' : ''}₹{priceChange.toFixed(2)})</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]">
          <div className="p-6">
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="chart" className="gap-2">
                  <CandlestickIcon className="w-4 h-4" />
                  Chart
                </TabsTrigger>
                <TabsTrigger value="technicals" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Technicals
                </TabsTrigger>
                <TabsTrigger value="fundamentals" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Fundamentals
                </TabsTrigger>
              </TabsList>
              
              {/* Chart Tab */}
              <TabsContent value="chart" className="space-y-4">
                {/* Time Period Selector */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Period:</span>
                  {[
                    { label: '1M', days: 30 },
                    { label: '3M', days: 90 },
                    { label: '6M', days: 180 },
                    { label: '1Y', days: 365 },
                  ].map(({ label, days }) => (
                    <Button
                      key={days}
                      variant={chartDays === days ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartDays(days)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                
                {/* Indicator Toggles */}
                <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sma20" checked={showSMA20} onCheckedChange={(c) => setShowSMA20(!!c)} />
                    <Label htmlFor="sma20" className="text-sm cursor-pointer">
                      <span className="inline-block w-3 h-0.5 bg-chart-3 mr-1" /> SMA 20
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sma50" checked={showSMA50} onCheckedChange={(c) => setShowSMA50(!!c)} />
                    <Label htmlFor="sma50" className="text-sm cursor-pointer">
                      <span className="inline-block w-3 h-0.5 bg-chart-4 mr-1" /> SMA 50
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ema20" checked={showEMA20} onCheckedChange={(c) => setShowEMA20(!!c)} />
                    <Label htmlFor="ema20" className="text-sm cursor-pointer">
                      <span className="inline-block w-3 h-0.5 bg-chart-5 mr-1" /> EMA 20
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bollinger" checked={showBollinger} onCheckedChange={(c) => setShowBollinger(!!c)} />
                    <Label htmlFor="bollinger" className="text-sm cursor-pointer">Bollinger Bands</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="volume" checked={showVolume} onCheckedChange={(c) => setShowVolume(!!c)} />
                    <Label htmlFor="volume" className="text-sm cursor-pointer">Volume</Label>
                  </div>
                </div>
                
                {/* Chart */}
                {isLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <CandlestickChart
                    data={historicalData}
                    fullData={fullData}
                    showSMA20={showSMA20}
                    showSMA50={showSMA50}
                    showEMA20={showEMA20}
                    showBollinger={showBollinger}
                    showVolume={showVolume}
                  />
                )}
                
                {/* 52-Week Range */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>52-Week Low</span>
                      <span>52-Week High</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full">
                      <div 
                        className="absolute top-0 h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
                        style={{ width: '100%' }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background shadow-md"
                        style={{ left: `calc(${Math.min(100, Math.max(0, pricePosition))}% - 6px)` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 font-medium">
                      <span>₹{stock.low52Week.toLocaleString('en-IN')}</span>
                      <span>₹{stock.high52Week.toLocaleString('en-IN')}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Technicals Tab */}
              <TabsContent value="technicals" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Moving Averages */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <LineChart className="w-4 h-4" />
                        Moving Averages
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SMA 20</span>
                        <span className={currentPrice > stock.sma20 ? 'text-emerald-600' : 'text-rose-600'}>
                          ₹{stock.sma20.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SMA 50</span>
                        <span className={currentPrice > stock.sma50 ? 'text-emerald-600' : 'text-rose-600'}>
                          ₹{stock.sma50.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SMA 200</span>
                        <span className={currentPrice > stock.sma200 ? 'text-emerald-600' : 'text-rose-600'}>
                          ₹{stock.sma200.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">EMA 20</span>
                        <span className={currentPrice > stock.ema20 ? 'text-emerald-600' : 'text-rose-600'}>
                          ₹{stock.ema20.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Momentum Indicators */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Momentum
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">RSI (14)</span>
                        <Badge variant={stock.rsi < 30 ? 'default' : stock.rsi > 70 ? 'destructive' : 'secondary'}>
                          {stock.rsi}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Stochastic</span>
                        <Badge variant={stock.stochastic < 20 ? 'default' : stock.stochastic > 80 ? 'destructive' : 'secondary'}>
                          {stock.stochastic.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Williams %R</span>
                        <span>{stock.williamsR.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">MFI</span>
                        <Badge variant={stock.mfi < 20 ? 'default' : stock.mfi > 80 ? 'destructive' : 'secondary'}>
                          {stock.mfi.toFixed(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* MACD */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">MACD Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MACD</span>
                        <span className={stock.macd > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {stock.macd.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signal</span>
                        <span>{stock.macdSignal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Histogram</span>
                        <Badge variant={stock.macdHistogram > 0 ? 'default' : 'destructive'}>
                          {stock.macdHistogram > 0 ? 'Bullish' : 'Bearish'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Volatility */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Volatility</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ADX</span>
                        <Badge variant={stock.adx > 25 ? 'default' : 'secondary'}>
                          {stock.adx.toFixed(1)} {stock.adx > 25 ? '(Strong)' : '(Weak)'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ATR %</span>
                        <span>{stock.atrPercent.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Beta</span>
                        <span className={stock.beta > 1 ? 'text-amber-600' : 'text-emerald-600'}>
                          {stock.beta.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bollinger Width</span>
                        <span>{stock.bollingerWidth.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Returns */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Historical Returns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">1 Week</div>
                        <div className={`font-semibold ${stock.weeklyReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock.weeklyReturn >= 0 ? '+' : ''}{stock.weeklyReturn.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">1 Month</div>
                        <div className={`font-semibold ${stock.monthlyReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock.monthlyReturn >= 0 ? '+' : ''}{stock.monthlyReturn.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">3 Months</div>
                        <div className={`font-semibold ${stock.quarterlyReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock.quarterlyReturn >= 0 ? '+' : ''}{stock.quarterlyReturn.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">1 Year</div>
                        <div className={`font-semibold ${stock.yearlyReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock.yearlyReturn >= 0 ? '+' : ''}{stock.yearlyReturn.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Fundamentals Tab */}
              <TabsContent value="fundamentals" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Valuation */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Valuation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P/E Ratio</span>
                        <span className="font-medium">{stock.peRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P/B Ratio</span>
                        <span className="font-medium">{stock.pbRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">EPS</span>
                        <span className="font-medium">₹{stock.eps.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dividend Yield</span>
                        <span className="font-medium">{stock.dividendYield.toFixed(2)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Profitability */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Profitability
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROE</span>
                        <span className={`font-medium ${stock.roe > 15 ? 'text-emerald-600' : ''}`}>
                          {stock.roe.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROCE</span>
                        <span className={`font-medium ${stock.roce > 15 ? 'text-emerald-600' : ''}`}>
                          {stock.roce.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Debt/Equity</span>
                        <span className={`font-medium ${stock.debtToEquity < 1 ? 'text-emerald-600' : stock.debtToEquity > 2 ? 'text-rose-600' : ''}`}>
                          {stock.debtToEquity.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Company Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Company Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sector</span>
                        <span className="font-medium">{stock.sector}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="font-medium text-right max-w-[180px]">{stock.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap</span>
                        <span className="font-medium">
                          {stock.marketCap >= 100000 
                            ? `₹${(stock.marketCap / 100000).toFixed(1)}L Cr`
                            : `₹${stock.marketCap.toLocaleString('en-IN')} Cr`
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Shareholding */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Shareholding Pattern</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Promoters</span>
                          <span className="font-medium">{stock.promoterHolding.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-chart-1 rounded-full"
                            style={{ width: `${stock.promoterHolding}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">FII</span>
                          <span className="font-medium">{stock.fiiHolding.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-chart-2 rounded-full"
                            style={{ width: `${stock.fiiHolding}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">DII</span>
                          <span className="font-medium">{stock.diiHolding.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-chart-3 rounded-full"
                            style={{ width: `${stock.diiHolding}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
