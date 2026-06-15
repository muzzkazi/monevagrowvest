import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  Target,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useBrokerRecos } from "@/hooks/useBrokerRecos";

function formatRelativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

const StockRecommendations = () => {
  const { recos: recommendations, isLoading: recosLoading, error: recosError, lastUpdated: recosUpdatedAt, refresh: refreshRecos } = useBrokerRecos(9);

  const symbols = useMemo(() => recommendations.map(r => r.ticker).filter(Boolean), [recommendations]);
  const { prices, isLoading: pricesLoading, refreshPrices } = useStockPrices(symbols);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.1 });

  const isLoading = recosLoading || pricesLoading;
  const lastUpdated = recosUpdatedAt;

  const handleRefresh = async () => {
    await refreshRecos();
    refreshPrices();
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "Buy":
      case "Accumulate":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "Hold":
      case "Neutral":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "Sell":
      case "Reduce":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "Buy":
      case "Accumulate":
        return <TrendingUp className="w-4 h-4" />;
      case "Hold":
      case "Neutral":
        return <Minus className="w-4 h-4" />;
      case "Sell":
      case "Reduce":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateUpside = (currentPrice: number, targetPrice: number) => {
    if (currentPrice <= 0) return 0;
    return ((targetPrice - currentPrice) / currentPrice) * 100;
  };

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div 
          ref={headerRef}
          className={`text-center mb-6 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Brokerage <span className="text-financial-accent">Stock Picks</span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Latest buy/sell calls from India's top brokerage firms — auto-refreshed from live RSS feeds every 5 minutes
          </p>
          
          {/* Live status indicator */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              {Object.keys(prices).length > 0 ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">Live Prices</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Connecting...</span>
                </>
              )}
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            <span className="text-yellow-600">⚠️ Disclaimer:</span> These are third-party recommendations. Please do your own research before investing.
          </p>
        </div>

        <div ref={gridRef} className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">
          {recommendations.map((rec, index) => {
            const livePrice = prices[rec.ticker];
            const currentPrice = livePrice?.price || 0;
            const priceChange = livePrice?.change || 0;
            const changePercent = livePrice?.changePercent || 0;
            const upside = currentPrice > 0 ? calculateUpside(currentPrice, rec.targetPrice) : 0;

            return (
              <Card 
                key={index} 
                className={`bg-gradient-card border shadow-card hover:shadow-lg transition-all duration-500 hover:-translate-y-1 overflow-hidden ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: gridVisible ? `${index * 80}ms` : '0ms' }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold line-clamp-2">{rec.stock}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        {rec.ticker && <p className="text-sm text-muted-foreground font-mono">{rec.ticker}</p>}
                        {livePrice && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${changePercent >= 0 ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}`}
                          >
                            {changePercent >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getRecommendationColor(rec.recommendation)} font-semibold flex items-center gap-1`}
                    >
                      {getRecommendationIcon(rec.recommendation)}
                      {rec.recommendation}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3 relative">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        {livePrice && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                        Live Price
                      </p>
                      {isLoading && !livePrice ? (
                        <div className="h-7 bg-muted animate-pulse rounded" />
                      ) : livePrice ? (
                        <div>
                          <p className="text-lg font-bold font-mono">{formatCurrency(currentPrice)}</p>
                          <p className={`text-xs font-mono ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      )}
                    </div>
                    <div className="bg-financial-accent/10 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Target Price
                      </p>
                      <p className="text-lg font-bold font-mono text-financial-accent">{formatCurrency(rec.targetPrice)}</p>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between rounded-lg p-3 ${upside >= 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                    <span className="text-sm text-muted-foreground">Potential Upside</span>
                    {currentPrice > 0 ? (
                      <span className={`text-lg font-bold flex items-center gap-1 ${upside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {upside >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">--</span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {rec.rationale}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-financial-accent" />
                      <span className="font-medium">{rec.broker}</span>
                      <span className="text-muted-foreground">• {rec.date}</span>
                    </div>
                    <a 
                      href={rec.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-financial-accent hover:text-financial-accent/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Card className="inline-block bg-gradient-gold border-0 shadow-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-financial-accent/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-financial-accent" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-financial-primary">Want Personalized Recommendations?</h3>
                <p className="text-sm text-financial-secondary">Get expert advice tailored to your risk profile and goals</p>
              </div>
              <Button 
                className="bg-financial-accent hover:bg-financial-accent/90 text-white ml-4"
                onClick={() => window.location.href = '/contact'}
              >
                Consult Now
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StockRecommendations;
