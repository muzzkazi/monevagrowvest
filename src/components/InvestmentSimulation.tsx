import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

const InvestmentSimulation = () => {
  const [simState, setSimState] = useState<SimulationState>({
    currentYear: 0,
    isRunning: false,
    isComplete: false,
    portfolio: { conservative: 10000, moderate: 10000, aggressive: 10000 },
    totalInvested: 30000,
    currentEvent: undefined
  });

  const [selectedStrategy, setSelectedStrategy] = useState<keyof Portfolio | null>(null);
  const [speed, setSpeed] = useState(1000); // milliseconds

  const marketEvents: MarketEvent[] = [
    {
      year: 1,
      event: 'Steady Growth',
      return: 0.08,
      description: 'Markets showing healthy growth with low inflation',
      news: '📈 Economic indicators positive, steady corporate earnings growth'
    },
    {
      year: 2,
      event: 'Tech Crash',
      return: -0.18,
      description: 'Technology sector bubble bursts, major correction',
      news: '📉 Tech stocks plummet 40%, fear spreads across markets'
    },
    {
      year: 3,
      event: 'Recovery Begins',
      return: 0.15,
      description: 'Markets bounce back as investors regain confidence',
      news: '🚀 Strong quarterly earnings drive market recovery'
    },
    {
      year: 4,
      event: 'Inflation Spike',
      return: 0.02,
      description: 'High inflation dampens returns despite growth',
      news: '⚠️ Central banks raise rates to combat 6% inflation'
    },
    {
      year: 5,
      event: 'Golden Period',
      return: 0.22,
      description: 'Perfect storm of innovation and low rates',
      news: '⭐ AI revolution drives unprecedented market gains'
    },
    {
      year: 6,
      event: 'Global Crisis',
      return: -0.25,
      description: 'International conflict disrupts global markets',
      news: '🌍 Geopolitical tensions cause major market selloff'
    },
    {
      year: 7,
      event: 'Slow Recovery',
      return: 0.06,
      description: 'Gradual improvement as tensions ease',
      news: '🔄 Markets slowly recover as diplomacy prevails'
    },
    {
      year: 8,
      event: 'Innovation Boom',
      return: 0.19,
      description: 'New technologies drive productivity gains',
      news: '💡 Breakthrough innovations fuel market optimism'
    },
    {
      year: 9,
      event: 'Market Correction',
      return: -0.12,
      description: 'Overvaluation leads to healthy correction',
      news: '📊 Markets cool down after extended bull run'
    },
    {
      year: 10,
      event: 'Mature Growth',
      return: 0.11,
      description: 'Stable, sustainable economic growth',
      news: '🏢 Mature economy delivers consistent returns'
    }
  ];

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
    setSimState(prev => ({
      ...prev,
      isRunning: true,
      currentYear: 0,
      isComplete: false,
      portfolio: { conservative: 10000, moderate: 10000, aggressive: 10000 }
    }));
  };

  const pauseSimulation = () => {
    setSimState(prev => ({ ...prev, isRunning: false }));
  };

  const resetSimulation = () => {
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
                Experience 10 years of market volatility with $10,000 in each strategy
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
                <span className="text-sm">Year {simState.currentYear}/10</span>
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
          
          <Progress value={(simState.currentYear / 10) * 100} className="h-2" />
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
              10-Year Simulation Complete!
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