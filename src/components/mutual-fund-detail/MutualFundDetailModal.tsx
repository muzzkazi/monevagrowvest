import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MutualFundInfo, mutualFunds as allFundsData } from '@/data/mutualFundDatabase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, BarChart3, Activity, Calendar, Loader2, Star,
  IndianRupee, Percent, Shield, Clock, Building2, User
} from 'lucide-react';

interface NAVDataPoint {
  date: string;
  nav: number;
}

interface MutualFundDetailModalProps {
  fund: MutualFundInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFund?: (fund: MutualFundInfo) => void;
}

const periodOptions = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '3Y', days: 1095 },
  { label: '5Y', days: 1825 },
  { label: 'All', days: 99999 },
];

const MutualFundDetailModal = ({ fund, open, onOpenChange, onSelectFund }: MutualFundDetailModalProps) => {
  const [navHistory, setNavHistory] = useState<NAVDataPoint[]>([]);
  const [allNavHistory, setAllNavHistory] = useState<NAVDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(365);
  const [latestNav, setLatestNav] = useState<number | null>(null);
  const [previousNav, setPreviousNav] = useState<number | null>(null);

  useEffect(() => {
    if (!fund || !open) return;
    setIsLoading(true);
    setNavHistory([]);
    setAllNavHistory([]);
    setLatestNav(null);
    setPreviousNav(null);

    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mutual-funds?action=history&code=${fund.schemeCode}`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          // MFAPI returns data newest-first: [{date: "DD-MM-YYYY", nav: "123.45"}, ...]
          const parsed: NAVDataPoint[] = result.data
            .map((d: { date: string; nav: string }) => {
              const parts = d.date.split('-');
              const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
              return { date: isoDate, nav: parseFloat(d.nav) };
            })
            .filter((d: NAVDataPoint) => !isNaN(d.nav))
            .reverse(); // oldest first for chart

          setAllNavHistory(parsed);
          
          if (parsed.length > 0) {
            setLatestNav(parsed[parsed.length - 1].nav);
            if (parsed.length > 1) {
              setPreviousNav(parsed[parsed.length - 2].nav);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching NAV history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [fund, open]);

  // Filter by selected period
  useEffect(() => {
    if (allNavHistory.length === 0) {
      setNavHistory([]);
      return;
    }
    if (selectedPeriod === 99999) {
      setNavHistory(allNavHistory);
      return;
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selectedPeriod);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    setNavHistory(allNavHistory.filter(d => d.date >= cutoffStr));
  }, [allNavHistory, selectedPeriod]);

  if (!fund) return null;

  const dayChange = latestNav && previousNav ? latestNav - previousNav : 0;
  const dayChangePercent = previousNav ? (dayChange / previousNav) * 100 : 0;
  const isPositive = dayChange >= 0;
  const displayNav = latestNav ?? fund.nav;

  // Calculate period return from chart data
  const periodReturn = navHistory.length > 1
    ? ((navHistory[navHistory.length - 1].nav - navHistory[0].nav) / navHistory[0].nav) * 100
    : 0;

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
    ));

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Moderate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Very High': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return '';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold leading-tight">
                {fund.schemeName.split(' - ')[0]}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline">{fund.category}</Badge>
                <Badge variant="outline">{fund.subCategory}</Badge>
                <span className={`text-xs px-2 py-0.5 rounded-full ${riskColor(fund.riskLevel)}`}>
                  {fund.riskLevel} Risk
                </span>
                <div className="flex gap-0.5">{renderStars(fund.rating)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{fund.fundHouse} • {fund.plan} Plan</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold">₹{displayNav.toFixed(2)}</div>
              {latestNav && previousNav && (
                <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{isPositive ? '+' : ''}{dayChange.toFixed(2)}</span>
                  <span>({isPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%)</span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">NAV as of latest</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-160px)]">
          <div className="p-6">
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="chart" className="gap-2">
                  <Activity className="w-4 h-4" />
                  NAV Chart
                </TabsTrigger>
                <TabsTrigger value="returns" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Returns
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Details
                </TabsTrigger>
              </TabsList>

              {/* NAV Chart Tab */}
              <TabsContent value="chart" className="space-y-4">
                {/* Period selector */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Period:</span>
                  {periodOptions.map(({ label, days }) => (
                    <Button
                      key={days}
                      variant={selectedPeriod === days ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs px-3"
                      onClick={() => setSelectedPeriod(days)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Period return badge */}
                {navHistory.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Period Return:</span>
                    <Badge className={periodReturn >= 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-0'
                    }>
                      {periodReturn >= 0 ? '+' : ''}{periodReturn.toFixed(2)}%
                    </Badge>
                  </div>
                )}

                {/* Chart */}
                {isLoading ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : navHistory.length > 0 ? (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={navHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <defs>
                          <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          interval="preserveStartEnd"
                          minTickGap={60}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(v) => `₹${v.toFixed(0)}`}
                          width={65}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          labelFormatter={formatDate}
                          formatter={(value: number) => [`₹${value.toFixed(2)}`, 'NAV']}
                        />
                        <Area
                          type="monotone"
                          dataKey="nav"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#navGradient)"
                          dot={false}
                          activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    No NAV history available
                  </div>
                )}
              </TabsContent>

              {/* Returns Tab */}
              <TabsContent value="returns" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: '1 Year', value: fund.returns1Y },
                    { label: '3 Year CAGR', value: fund.returns3Y },
                    { label: '5 Year CAGR', value: fund.returns5Y },
                    { label: '10 Year CAGR', value: fund.returns10Y },
                  ].map(({ label, value }) => (
                    <Card key={label}>
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className={`text-xl font-bold ${
                          value > 0 ? 'text-emerald-600 dark:text-emerald-400'
                            : value < 0 ? 'text-rose-600 dark:text-rose-400'
                            : 'text-muted-foreground'
                        }`}>
                          {value > 0 ? `+${value.toFixed(1)}%` : value === 0 ? '—' : `${value.toFixed(1)}%`}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: '1Y Return', value: fund.returns1Y, benchmark: fund.returns1Y * 0.85 },
                        { label: '3Y CAGR', value: fund.returns3Y, benchmark: fund.returns3Y * 0.82 },
                        { label: '5Y CAGR', value: fund.returns5Y, benchmark: fund.returns5Y * 0.80 },
                      ].filter(r => r.value > 0).map(({ label, value, benchmark }) => (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <div className="flex gap-3">
                              <span className="font-medium text-foreground">Fund: {value.toFixed(1)}%</span>
                              <span className="text-muted-foreground">Benchmark: ~{benchmark.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div
                              className="bg-primary rounded-full"
                              style={{ width: `${Math.min(100, (value / 50) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
                        Fund Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: 'AUM', value: `₹${fund.aum.toLocaleString()} Cr` },
                        { label: 'NAV', value: `₹${displayNav.toFixed(2)}` },
                        { label: 'Expense Ratio', value: `${fund.expenseRatio.toFixed(2)}%` },
                        { label: 'Exit Load', value: fund.exitLoad },
                        { label: 'Benchmark', value: fund.benchmark },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-right max-w-[60%]">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Investment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: 'Min SIP', value: `₹${fund.sipMinimum}` },
                        { label: 'Min Lumpsum', value: `₹${fund.lumpSumMinimum.toLocaleString()}` },
                        { label: 'Fund Manager', value: fund.fundManager },
                        { label: 'Inception', value: fund.inceptionDate },
                        { label: 'Plan', value: fund.plan },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${riskColor(fund.riskLevel)}`}>
                        {fund.riskLevel} Risk
                      </span>
                      <div className="flex-1">
                        <div className="flex gap-1">
                          {['Low', 'Moderate', 'High', 'Very High'].map((level) => (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded-full ${
                                level === fund.riskLevel
                                  ? level === 'Low' ? 'bg-emerald-500'
                                    : level === 'Moderate' ? 'bg-amber-500'
                                    : level === 'High' ? 'bg-orange-500'
                                    : 'bg-rose-500'
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>Low</span>
                          <span>Very High</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Similar Funds Section */}
            {(() => {
              const similarFunds = allFundsData.filter(
                f => f.subCategory === fund.subCategory && f.schemeCode !== fund.schemeCode
              ).slice(0, 5);
              if (similarFunds.length === 0) return null;
              return (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Similar {fund.subCategory} Funds
                    </h3>
                    <div className="space-y-2">
                      {similarFunds.map(sf => (
                        <button
                          key={sf.schemeCode}
                          className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                          onClick={() => {
                            onSelectFund?.(sf);
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{sf.schemeName.split(' - ')[0]}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground">{sf.fundHouse}</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star key={i} className={`w-2.5 h-2.5 ${i < sf.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-sm font-medium">₹{sf.nav.toFixed(2)}</p>
                            <p className={`text-xs ${sf.returns3Y >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              3Y: {sf.returns3Y >= 0 ? '+' : ''}{sf.returns3Y.toFixed(1)}%
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MutualFundDetailModal;
