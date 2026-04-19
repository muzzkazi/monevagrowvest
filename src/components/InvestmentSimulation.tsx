import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import { 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calculator,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Target,
  AlertTriangle,
  Award
} from 'lucide-react';

interface MarketEvent {
  year: number;
  event: string;
  return: number;
  description: string;
  news: string;
}

interface Portfolio {
  conservative: number;
  moderate: number;
  aggressive: number;
}

interface SimulationState {
  currentYear: number;
  isRunning: boolean;
  isComplete: boolean;
  portfolio: Portfolio;
  totalInvested: number;
  currentEvent?: MarketEvent;
}

interface HistoryPoint {
  year: number;
  label: string;
  conservative: number;
  moderate: number;
  aggressive: number;
  event: string;
  return: number;
}

const initialHistory: HistoryPoint[] = [
  { year: 0, label: 'Start', conservative: 10000, moderate: 10000, aggressive: 10000, event: 'Initial Investment', return: 0 },
];

const InvestmentSimulation = () => {
  const [simState, setSimState] = useState<SimulationState>({
    currentYear: 0,
    isRunning: false,
    isComplete: false,
    portfolio: { conservative: 10000, moderate: 10000, aggressive: 10000 },
    totalInvested: 30000,
    currentEvent: undefined
  });
  const [history, setHistory] = useState<HistoryPoint[]>(initialHistory);

  const [selectedStrategy, setSelectedStrategy] = useState<keyof Portfolio | null>(null);
  const [speed, setSpeed] = useState(1000); // milliseconds

  // Full historical timeline 1999–2023. `year` is the position; calendar year is in `event` text.
  const allMarketEvents: MarketEvent[] = [
    { year: 1, event: '1999: Y2K & IT Boom', return: 0.64, description: 'Tech euphoria sweeps Indian markets', news: '💻 Sensex doubles on IT optimism, Infosys becomes a household name' },
    { year: 2, event: '2000: Dot-com Crash', return: -0.21, description: 'Global tech bubble bursts, IT stocks collapse', news: '📉 Nasdaq plunge drags Sensex; first lesson in bubbles' },
    { year: 3, event: '2001: 9/11 & Ketan Parekh Scam', return: -0.18, description: 'Geopolitical shock and broker fraud rattle markets', news: '🚨 Ketan Parekh scam exposed; markets crash post-9/11' },
    { year: 4, event: '2002: Slow Recovery', return: 0.04, description: 'Markets stabilise after two brutal years', news: '🐢 Patience pays as Sensex inches back from lows' },
    { year: 5, event: '2003: Bull Run Begins', return: 0.73, description: 'Historic rally driven by global liquidity and reforms', news: '🚀 Sensex up 73% — one of the best years ever' },
    { year: 6, event: '2004: Election Shock', return: 0.13, description: 'May 17 crash, then strong recovery', news: '🗳️ Sensex hits lower circuit; Manmohan-led UPA reassures markets' },
    { year: 7, event: '2005: FII Inflow Surge', return: 0.42, description: 'Foreign capital floods Indian equities', news: '🌏 Sensex crosses 9,000 for the first time' },
    { year: 8, event: '2006: Mid-cap Mania', return: 0.47, description: 'Broader market rally with mid/small caps leading', news: '📊 Sensex doubles in two years; retail investors pile in' },
    { year: 9, event: '2007: Pre-Crisis Peak', return: 0.47, description: 'Sensex hits 20,000 amid global liquidity boom', news: '🏔️ Markets at all-time highs as global cracks emerge' },
    { year: 10, event: '2008: Global Financial Crisis', return: -0.52, description: 'Lehman collapse triggers worst crash in modern history', news: '💥 Sensex halved in a year — the ultimate stress test' },
    { year: 11, event: '2009: V-Shaped Recovery', return: 0.81, description: 'Massive rebound rewards investors who stayed put', news: '📈 Sensex up 81% — patience after panic pays off big' },
    { year: 12, event: '2010: Post-Crisis Rally', return: 0.17, description: 'Steady gains as global stimulus continues', news: '🏦 RBI begins normalising rates; Sensex hits 21,000 again' },
    { year: 13, event: '2011: Eurozone Crisis', return: -0.25, description: 'Sovereign debt fears + high domestic inflation', news: '🇪🇺 European debt scare drags Sensex 25% lower' },
    { year: 14, event: '2012: QE Rally', return: 0.26, description: 'Global central bank stimulus lifts emerging markets', news: '💵 Fed QE3 + ECB OMT spark a strong recovery year' },
    { year: 15, event: '2013: Taper Tantrum', return: 0.09, description: 'Rupee crashes on Fed taper fears, but markets recover', news: '💱 Rupee hits record low; RBI Governor Rajan steadies the ship' },
    { year: 16, event: '2014: Modi Wave', return: 0.29, description: 'BJP victory and reform expectations drive massive rally', news: '🗳️ Sensex hits record highs on Modi victory, FII inflows surge' },
    { year: 17, event: '2015: Rate Cut Cycle', return: 0.05, description: 'RBI cuts rates but global headwinds limit gains', news: '🏦 RBI cuts repo rate, but China slowdown weighs on markets' },
    { year: 18, event: '2016: Demonetization', return: 0.02, description: 'Currency ban creates uncertainty, markets flat', news: '💸 Demonetization shocks economy, markets remain volatile' },
    { year: 19, event: '2017: GST Implementation', return: 0.28, description: 'GST launch and global liquidity drive strong gains', news: '📊 GST rollout smooth, Sensex crosses 30,000 for first time' },
    { year: 20, event: '2018: NBFC Crisis', return: 0.03, description: 'IL&FS default triggers NBFC sector crisis', news: '🏛️ IL&FS default sparks liquidity crisis in shadow banking' },
    { year: 21, event: '2019: Election Volatility', return: 0.14, description: 'Modi re-election and rate cuts support markets', news: '🎯 Modi 2.0 victory rally, RBI cuts rates aggressively' },
    { year: 22, event: '2020: COVID Crash', return: -0.24, description: 'Pandemic and lockdown crash Indian markets', news: '🦠 Sensex crashes 38% in March, worst fall since 2008' },
    { year: 23, event: '2021: Retail Boom', return: 0.23, description: 'Retail investor surge and liquidity drive rally', news: '📱 Zerodha crosses 6 million users, Sensex hits 60,000' },
    { year: 24, event: '2022: Rate Hike Cycle', return: 0.04, description: 'RBI hikes rates aggressively to combat inflation', news: '📈 RBI hikes repo rate 190 bps, FIIs sell ₹1.2 lakh crore' },
    { year: 25, event: '2023: Resilient India', return: 0.20, description: 'India outperforms global markets amid growth optimism', news: '🇮🇳 India fastest growing major economy, markets at record highs' },
  ];

  // Start-year options: end is always 2023. Slice the master array from the chosen start.
  const startYearOptions = [
    { startCalendar: 2014, label: '10 yrs (2014–2023)' },
    { startCalendar: 2009, label: '15 yrs (2009–2023)' },
    { startCalendar: 2004, label: '20 yrs (2004–2023)' },
    { startCalendar: 1999, label: '25 yrs (1999–2023)' },
  ];
  const [startCalendarYear, setStartCalendarYear] = useState<number>(2014);

  const marketEvents: MarketEvent[] = useMemo(() => {
    const sliceStart = startCalendarYear - 1999; // index of chosen start year in allMarketEvents
    return allMarketEvents
      .slice(sliceStart)
      .map((e, i) => ({ ...e, year: i + 1 }));
  }, [startCalendarYear]);


  const getStrategyMultiplier = (strategy: keyof Portfolio, baseReturn: number): number => {
    switch (strategy) {
      case 'conservative':
        // Conservative: Lower volatility, caps both gains and losses
        return baseReturn > 0 ? baseReturn * 0.6 : baseReturn * 0.4;
      case 'moderate':
        // Moderate: Balanced approach
        return baseReturn * 0.8;
      case 'aggressive':
        // Aggressive: High volatility, amplifies both gains and losses
        return baseReturn > 0 ? baseReturn * 1.3 : baseReturn * 1.5;
      default:
        return baseReturn;
    }
  };

  const startSimulation = () => {
    setHistory(initialHistory);
    setSimState(prev => ({
      ...prev,
      isRunning: true,
      currentYear: 0,
      isComplete: false,
      portfolio: { conservative: 10000, moderate: 10000, aggressive: 10000 },
      currentEvent: undefined,
    }));
  };

  const pauseSimulation = () => {
    setSimState(prev => ({ ...prev, isRunning: false }));
  };

  const resetSimulation = () => {
    setHistory(initialHistory);
    setSimState({
      currentYear: 0,
      isRunning: false,
      isComplete: false,
      portfolio: { conservative: 10000, moderate: 10000, aggressive: 10000 },
      totalInvested: 30000,
      currentEvent: undefined
    });
    setSelectedStrategy(null);
  };

  // Simulation ticker
  useEffect(() => {
    if (!simState.isRunning || simState.isComplete) return;

    const timer = setTimeout(() => {
      const nextYear = simState.currentYear + 1;
      
      if (nextYear > marketEvents.length) {
        setSimState(prev => ({ ...prev, isRunning: false, isComplete: true }));
        return;
      }

      const event = marketEvents[nextYear - 1];
      
      setSimState(prev => {
        const newPortfolio = {
          conservative: prev.portfolio.conservative * (1 + getStrategyMultiplier('conservative', event.return)),
          moderate: prev.portfolio.moderate * (1 + getStrategyMultiplier('moderate', event.return)),
          aggressive: prev.portfolio.aggressive * (1 + getStrategyMultiplier('aggressive', event.return))
        };

        setHistory(h => [
          ...h,
          {
            year: nextYear,
            label: event.event.split(':')[0],
            conservative: Math.round(newPortfolio.conservative),
            moderate: Math.round(newPortfolio.moderate),
            aggressive: Math.round(newPortfolio.aggressive),
            event: event.event,
            return: event.return,
          },
        ]);

        return {
          ...prev,
          currentYear: nextYear,
          portfolio: newPortfolio,
          currentEvent: event
        };
      });
    }, speed);

    return () => clearTimeout(timer);
  }, [simState.isRunning, simState.currentYear, simState.isComplete, speed]);

  const getBestStrategy = (): { strategy: keyof Portfolio; value: number } => {
    const entries = Object.entries(simState.portfolio) as [keyof Portfolio, number][];
    const best = entries.reduce((max, current) => current[1] > max[1] ? current : max);
    return { strategy: best[0], value: best[1] };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getReturnPercent = (initial: number, current: number) => {
    return ((current - initial) / initial * 100).toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Control Panel */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <LineChart className="w-6 h-6 mr-2 text-financial-accent" />
                Investment Time Machine
              </CardTitle>
              <CardDescription>
                Experience {marketEvents.length} years of market volatility with ₹10,000 in each strategy
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {!simState.isRunning && !simState.isComplete && (
                <Button onClick={startSimulation} className="bg-financial-accent hover:bg-financial-accent/90">
                  <Play className="w-4 h-4 mr-2" />
                  Start Simulation
                </Button>
              )}
              {simState.isRunning && (
                <Button onClick={pauseSimulation} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={resetSimulation} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Timer className="w-4 h-4 mr-1 text-muted-foreground" />
                <span className="text-sm">Year {simState.currentYear}/{marketEvents.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Speed:</span>
                <Button
                  size="sm"
                  variant={speed === 2000 ? "default" : "outline"}
                  onClick={() => setSpeed(2000)}
                >
                  Slow
                </Button>
                <Button
                  size="sm"
                  variant={speed === 1000 ? "default" : "outline"}
                  onClick={() => setSpeed(1000)}
                >
                  Normal
                </Button>
                <Button
                  size="sm"
                  variant={speed === 500 ? "default" : "outline"}
                  onClick={() => setSpeed(500)}
                >
                  Fast
                </Button>
              </div>
            </div>
          </div>
          
          <Progress value={(simState.currentYear / marketEvents.length) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Market Event */}
      {simState.currentEvent && (
        <Card className="glass-card border-financial-accent/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                simState.currentEvent.return > 0 ? 'bg-accent/20' : 'bg-destructive/20'
              }`}>
                {simState.currentEvent.return > 0 ? 
                  <TrendingUp className="w-6 h-6 text-accent" /> : 
                  <TrendingDown className="w-6 h-6 text-destructive" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-bold">Year {simState.currentEvent.year}: {simState.currentEvent.event}</h4>
                  <Badge variant={simState.currentEvent.return > 0 ? "default" : "destructive"}>
                    {simState.currentEvent.return > 0 ? '+' : ''}{(simState.currentEvent.return * 100).toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{simState.currentEvent.description}</p>
                <p className="text-sm font-medium">{simState.currentEvent.news}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market & Portfolio Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="w-5 h-5 mr-2 text-financial-accent" />
            Market Events & Portfolio Reaction
          </CardTitle>
          <CardDescription>
            Watch each strategy respond to historical market events year by year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={history} margin={{ top: 20, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelFormatter={(label, payload) => {
                    const p = payload?.[0]?.payload as HistoryPoint | undefined;
                    if (!p) return label;
                    const sign = p.return > 0 ? '+' : '';
                    return p.year === 0
                      ? p.event
                      : `${p.event} — Market: ${sign}${(p.return * 100).toFixed(1)}%`;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="conservative"
                  name="Conservative"
                  stroke="hsl(217 91% 60%)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="moderate"
                  name="Moderate"
                  stroke="hsl(var(--financial-accent))"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="aggressive"
                  name="Aggressive"
                  stroke="hsl(0 84% 60%)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
                {history
                  .filter((p) => p.return < 0)
                  .map((p) => (
                    <ReferenceDot
                      key={`crash-${p.year}`}
                      x={p.label}
                      y={p.moderate}
                      r={6}
                      fill="hsl(0 84% 60%)"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                      ifOverflow="extendDomain"
                    />
                  ))}
              </RLineChart>
            </ResponsiveContainer>
          </div>
          {history.length === 1 ? (
            <p className="text-xs text-center text-muted-foreground mt-3">
              Press <span className="font-semibold text-foreground">Start Simulation</span> to see how each strategy reacts to 10 years of Indian market events
            </p>
          ) : (
            <p className="text-xs text-center text-muted-foreground mt-3">
              Red dots mark market crashes — notice how the aggressive strategy drops further but recovers faster
            </p>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Performance */}
      <div className="grid md:grid-cols-3 gap-6">
        {(Object.entries(simState.portfolio) as [keyof Portfolio, number][]).map(([strategy, value]) => {
          const isSelected = selectedStrategy === strategy;
          const isRunning = simState.isRunning || simState.currentYear > 0;
          const returnPercent = getReturnPercent(10000, value);
          const isPositive = value >= 10000;
          
          return (
            <Card 
              key={strategy}
              className={`glass-card cursor-pointer transition-all hover:scale-105 ${
                isSelected ? 'ring-2 ring-financial-accent' : ''
              }`}
              onClick={() => setSelectedStrategy(strategy)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  strategy === 'conservative' ? 'bg-blue-500' :
                  strategy === 'moderate' ? 'bg-financial-accent' : 'bg-red-500'
                }`}>
                  {strategy === 'conservative' ? <Target className="w-8 h-8 text-white" /> :
                   strategy === 'moderate' ? <Calculator className="w-8 h-8 text-white" /> :
                   <TrendingUp className="w-8 h-8 text-white" />}
                </div>
                <CardTitle className="capitalize text-xl">{strategy}</CardTitle>
                <CardDescription>
                  {strategy === 'conservative' ? 'Low risk, steady returns' :
                   strategy === 'moderate' ? 'Balanced risk and reward' :
                   'High risk, high potential'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3">
                  <div>
                    <div className={`text-2xl font-bold ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                      {formatCurrency(value)}
                    </div>
                    <div className="text-sm text-muted-foreground">Current Value</div>
                  </div>
                  
                  {isRunning && (
                    <div className={`text-lg font-semibold ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{returnPercent}%
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Started with {formatCurrency(10000)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Results Summary */}
      {simState.isComplete && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-6 h-6 mr-2 text-financial-gold" />
              {marketEvents.length}-Year Simulation Complete!
            </CardTitle>
            <CardDescription>Here's how each strategy performed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {(Object.entries(simState.portfolio) as [keyof Portfolio, number][])
                  .sort(([,a], [,b]) => b - a)
                  .map(([strategy, value], index) => {
                    const returnPercent = getReturnPercent(10000, value);
                    const isPositive = value >= 10000;
                    
                    return (
                      <div key={strategy} className={`p-4 rounded-lg ${
                        index === 0 ? 'bg-financial-gold/10 border border-financial-gold/20' : 'bg-muted/50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{strategy}</span>
                          {index === 0 && <Badge className="bg-financial-gold text-financial-primary">Winner</Badge>}
                        </div>
                        <div className={`text-xl font-bold ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                          {formatCurrency(value)}
                        </div>
                        <div className={`text-sm ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}{returnPercent}% total return
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              <div className="mt-6 p-4 bg-financial-accent/5 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-financial-accent" />
                  Key Lessons
                </h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>• Higher risk strategies can deliver better long-term returns, but with more volatility</div>
                  <div>• Conservative approaches provide stability but may limit growth potential</div>
                  <div>• Market timing is impossible - consistent investing often wins</div>
                  <div>• Diversification across strategies can balance risk and reward</div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <Button onClick={resetSimulation}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Another Simulation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestmentSimulation;