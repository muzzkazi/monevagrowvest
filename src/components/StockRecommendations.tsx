import { useState } from "react";
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
  ArrowDownRight
} from "lucide-react";

interface StockRecommendation {
  stock: string;
  ticker: string;
  currentPrice: number;
  targetPrice: number;
  recommendation: "Buy" | "Hold" | "Sell";
  upside: number;
  broker: string;
  date: string;
  sourceUrl: string;
  rationale: string;
}

const StockRecommendations = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stock recommendations based on actual brokerage reports
  const recommendations: StockRecommendation[] = [
    {
      stock: "HDFC Bank",
      ticker: "HDFCBANK",
      currentPrice: 1842,
      targetPrice: 2350,
      recommendation: "Buy",
      upside: 27.6,
      broker: "ICICI Securities",
      date: "Jan 2025",
      sourceUrl: "https://www.moneycontrol.com/news/business/buy-hdfc-bank-target-of-rs-2350-icici-securities-13312866.html",
      rationale: "Strong loan growth momentum and improving asset quality"
    },
    {
      stock: "State Bank of India",
      ticker: "SBIN",
      currentPrice: 812,
      targetPrice: 1030,
      recommendation: "Buy",
      upside: 27,
      broker: "Motilal Oswal",
      date: "Jan 2025",
      sourceUrl: "https://www.ndtvprofit.com/research-reports/top-stock-pick-for-2025-buy-sbi-for-an-upside-of-27-says-motilal-oswal-heres-why",
      rationale: "Better positioned to navigate systemic pressures with robust asset quality"
    },
    {
      stock: "Hindalco Industries",
      ticker: "HINDALCO",
      currentPrice: 715,
      targetPrice: 900,
      recommendation: "Buy",
      upside: 25.9,
      broker: "Emkay Global",
      date: "Jan 2025",
      sourceUrl: "https://www.moneycontrol.com/news/business/stocks/buy-hindalco-target-of-rs-900-emkay-global-financial-13573816.html",
      rationale: "Strong aluminum demand and favorable commodity cycle"
    },
    {
      stock: "HDFC AMC",
      ticker: "HDFCAMC",
      currentPrice: 4320,
      targetPrice: 5200,
      recommendation: "Buy",
      upside: 20.4,
      broker: "Motilal Oswal",
      date: "Jan 2025",
      sourceUrl: "https://www.moneycontrol.com/news/business/stocks/buy-hdfc-amc-target-of-rs-5200-motilal-oswal-12911351.html",
      rationale: "Market leader benefiting from growing mutual fund industry"
    },
    {
      stock: "Voltas",
      ticker: "VOLTAS",
      currentPrice: 1285,
      targetPrice: 1450,
      recommendation: "Buy",
      upside: 12.8,
      broker: "Emkay Global",
      date: "Jan 2025",
      sourceUrl: "https://www.moneycontrol.com/news/business/stocks/buy-voltas-target-of-rs-1450-emkay-global-financial-13138520.html",
      rationale: "Strong summer demand and market share gains in AC segment"
    },
    {
      stock: "3M India",
      ticker: "3MINDIA",
      currentPrice: 32450,
      targetPrice: 35610,
      recommendation: "Buy",
      upside: 9.7,
      broker: "ICICI Securities",
      date: "Jan 2025",
      sourceUrl: "https://www.moneycontrol.com/news/business/stocks/buy-3m-india-target-of-rs-35-610-icici-securities-13531553.html",
      rationale: "Diversified industrial play with consistent growth trajectory"
    }
  ];

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "Buy":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "Hold":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "Sell":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "Buy":
        return <TrendingUp className="w-4 h-4" />;
      case "Hold":
        return <Minus className="w-4 h-4" />;
      case "Sell":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl font-bold">
              Brokerage <span className="text-financial-accent">Stock Picks</span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Curated buy/hold/sell recommendations from India's top brokerage firms
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="text-yellow-600">⚠️ Disclaimer:</span> These are third-party recommendations. Please do your own research before investing.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <Card 
              key={index} 
              className="bg-gradient-card border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">{rec.stock}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{rec.ticker}</p>
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
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                    <p className="text-lg font-bold font-mono">{formatCurrency(rec.currentPrice)}</p>
                  </div>
                  <div className="bg-financial-accent/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Target Price
                    </p>
                    <p className="text-lg font-bold font-mono text-financial-accent">{formatCurrency(rec.targetPrice)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Potential Upside</span>
                  <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    {rec.upside.toFixed(1)}%
                  </span>
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
          ))}
        </div>

        <div className="mt-12 text-center">
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
