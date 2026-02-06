import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee,
  Calendar,
  Target,
  AlertTriangle,
  Info
} from 'lucide-react';

interface MarketData {
  year: number;
  nifty: number;
  sensex: number;
  event: string;
  description: string;
}

const MarketExplorer = () => {
  const [selectedIndex, setSelectedIndex] = useState<'nifty' | 'sensex'>('nifty');
  const [timeframe, setTimeframe] = useState<'5y' | '10y' | '20y'>('10y');

  const marketData: MarketData[] = [
    { year: 2004, nifty: 2080, sensex: 6603, event: 'Economic Boom', description: 'India growth story begins' },
    { year: 2005, nifty: 2837, sensex: 9398, event: 'Bull Run', description: 'Strong economic fundamentals' },
    { year: 2006, nifty: 3966, sensex: 13787, event: 'Peak Rally', description: 'FII inflows drive markets' },
    { year: 2007, nifty: 6287, sensex: 20873, event: 'All-time High', description: 'Global liquidity boom' },
    { year: 2008, nifty: 3035, sensex: 9647, event: 'Global Crisis', description: 'Lehman Brothers collapse' },
    { year: 2009, nifty: 5201, sensex: 17465, event: 'Recovery Begins', description: 'Stimulus measures help' },
    { year: 2010, nifty: 6134, sensex: 20509, event: 'Post-Crisis Recovery', description: 'Markets recover from 2008 crisis' },
    { year: 2011, nifty: 4624, sensex: 15455, event: 'European Debt Crisis', description: 'Global uncertainty affects markets' },
    { year: 2012, nifty: 5905, sensex: 19427, event: 'QE Boost', description: 'Global liquidity drives recovery' },
    { year: 2013, nifty: 6304, sensex: 21171, event: 'Taper Tantrum', description: 'Fed tapering fears create volatility' },
    { year: 2014, nifty: 8282, sensex: 27499, event: 'Modi Wave', description: 'BJP victory drives massive rally' },
    { year: 2015, nifty: 8488, sensex: 26118, event: 'Rate Cut Cycle', description: 'RBI cuts rates, China concerns' },
    { year: 2016, nifty: 8656, sensex: 26626, event: 'Demonetization', description: 'Currency ban creates uncertainty' },
    { year: 2017, nifty: 10530, sensex: 34057, event: 'GST Implementation', description: 'Tax reform and global liquidity' },
    { year: 2018, nifty: 10863, sensex: 36068, event: 'NBFC Crisis', description: 'IL&FS default triggers crisis' },
    { year: 2019, nifty: 12168, sensex: 41253, event: 'Election Rally', description: 'Modi re-election, rate cuts' },
    { year: 2020, nifty: 13982, sensex: 47751, event: 'COVID Recovery', description: 'Pandemic crash then liquidity boom' },
    { year: 2021, nifty: 17354, sensex: 58254, event: 'Retail Investor Surge', description: 'Massive retail participation' },
    { year: 2022, nifty: 18105, sensex: 60841, event: 'Rate Hike Cycle', description: 'RBI fights inflation aggressively' },
    { year: 2023, nifty: 21737, sensex: 72240, event: 'Resilient India', description: 'India outperforms global markets' },
    { year: 2024, nifty: 24500, sensex: 81000, event: 'AI & Growth', description: 'Technology and growth optimism' }
  ];

  const getTimeframeData = () => {
    const currentYear = 2024;
    const years = timeframe === '5y' ? 5 : timeframe === '10y' ? 10 : 20;
    return marketData.filter(d => d.year >= currentYear - years);
  };

  const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  };

  const formatIndianCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLargeNumber = (value: number): string => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const data = getTimeframeData();
  const latestData = data[data.length - 1];
  const oldestData = data[0];
  
  const niftyCagr = calculateCAGR(oldestData.nifty, latestData.nifty, data.length - 1);
  const sensexCagr = calculateCAGR(oldestData.sensex, latestData.sensex, data.length - 1);

  const niftySectorsData = [
    { name: 'IT', weight: 18.2, performance: '+2.3%' },
    { name: 'Banking', weight: 15.8, performance: '+1.8%' },
    { name: 'Oil & Gas', weight: 8.4, performance: '-0.5%' },
    { name: 'Auto', weight: 7.9, performance: '+3.2%' },
    { name: 'FMCG', weight: 6.1, performance: '+0.8%' },
    { name: 'Pharma', weight: 5.9, performance: '+1.5%' },
    { name: 'Metals', weight: 5.2, performance: '+4.1%' },
    { name: 'Others', weight: 32.5, performance: '+1.2%' }
  ];

  const sensexSectorsData = [
    { name: 'Banking', weight: 28.5, performance: '+1.9%' },
    { name: 'IT', weight: 14.8, performance: '+2.1%' },
    { name: 'Oil & Gas', weight: 12.3, performance: '-0.3%' },
    { name: 'FMCG', weight: 10.2, performance: '+0.9%' },
    { name: 'Auto', weight: 8.6, performance: '+3.0%' },
    { name: 'Pharma', weight: 5.4, performance: '+1.4%' },
    { name: 'Power', weight: 4.8, performance: '+2.6%' },
    { name: 'Others', weight: 15.4, performance: '+1.0%' }
  ];

  const sectorsData = selectedIndex === 'nifty' ? niftySectorsData : sensexSectorsData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{data.event}</p>
          <div className="space-y-1 mt-2">
            <p className="text-financial-accent">NIFTY 50: {formatLargeNumber(data.nifty)}</p>
            <p className="text-financial-gold">SENSEX: {formatLargeNumber(data.sensex)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-financial-accent" />
                Market Explorer (India)
              </CardTitle>
              <CardDescription>
                Explore Indian market performance with key events and insights
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={timeframe === '5y' ? 'default' : 'outline'}
                onClick={() => setTimeframe('5y')}
              >
                5Y
              </Button>
              <Button
                size="sm"
                variant={timeframe === '10y' ? 'default' : 'outline'}
                onClick={() => setTimeframe('10y')}
              >
                10Y
              </Button>
              <Button
                size="sm"
                variant={timeframe === '20y' ? 'default' : 'outline'}
                onClick={() => setTimeframe('20y')}
              >
                20Y
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedIndex} onValueChange={(value) => setSelectedIndex(value as 'nifty' | 'sensex')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="nifty">NIFTY 50</TabsTrigger>
              <TabsTrigger value="sensex">SENSEX</TabsTrigger>
            </TabsList>

            <TabsContent value="nifty" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-financial-accent/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Current Level</div>
                  <div className="text-lg font-bold text-financial-accent">{formatLargeNumber(latestData.nifty)}</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">CAGR ({timeframe})</div>
                  <div className={`text-lg font-bold ${niftyCagr > 0 ? 'text-accent' : 'text-destructive'}`}>
                    {niftyCagr.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Return</div>
                  <div className="text-lg font-bold text-financial-gold">
                    {((latestData.nifty / oldestData.nifty - 1) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">₹1L Investment</div>
                  <div className="text-lg font-bold">
                    {formatIndianCurrency(100000 * (latestData.nifty / oldestData.nifty))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sensex" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-financial-gold/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Current Level</div>
                  <div className="text-lg font-bold text-financial-gold">{formatLargeNumber(latestData.sensex)}</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">CAGR ({timeframe})</div>
                  <div className={`text-lg font-bold ${sensexCagr > 0 ? 'text-accent' : 'text-destructive'}`}>
                    {sensexCagr.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Return</div>
                  <div className="text-lg font-bold text-financial-gold">
                    {((latestData.sensex / oldestData.sensex - 1) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">₹1L Investment</div>
                  <div className="text-lg font-bold">
                    {formatIndianCurrency(100000 * (latestData.sensex / oldestData.sensex))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey={selectedIndex} 
                  stroke={selectedIndex === 'nifty' ? 'hsl(var(--financial-accent))' : 'hsl(var(--financial-gold))'} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sector Composition */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-financial-accent" />
              {selectedIndex === 'nifty' ? 'NIFTY 50' : 'SENSEX'} Sector Weights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectorsData.map((sector, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{sector.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-financial-accent"
                        style={{ width: `${(sector.weight / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm w-12 text-right">{sector.weight}%</span>
                    <Badge variant={sector.performance.startsWith('+') ? 'default' : 'destructive'} className="text-xs">
                      {sector.performance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2 text-financial-gold" />
              Investment Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-financial-accent/5 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 mr-2 text-accent" />
                  <span className="font-medium text-sm">Long-term Growth</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Indian markets have delivered strong returns over the long term despite volatility
                </p>
              </div>
              
              <div className="p-3 bg-financial-gold/5 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-financial-gold" />
                  <span className="font-medium text-sm">SIP Advantage</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Systematic investing helps average out market volatility over time
                </p>
              </div>
              
              <div className="p-3 bg-destructive/5 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
                  <span className="font-medium text-sm">Risk Awareness</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Markets can be volatile - invest only what you can afford to lose
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketExplorer;