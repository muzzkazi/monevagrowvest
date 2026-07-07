import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Newspaper, Building2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useBrokerRecos } from "@/hooks/useBrokerRecos";
import { useMarketInsights } from "@/hooks/useMarketInsights";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const MarketInsightsTeaser = () => {
  const { recos } = useBrokerRecos(2);
  const { insights } = useMarketInsights();
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  const topPicks = recos.slice(0, 2);
  const topNews = insights.slice(0, 2);

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={`text-center mb-10 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge className="mb-4 bg-financial-accent/10 text-financial-accent border-financial-accent/30 hover:bg-financial-accent/20">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Market Insights
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Brokerage Picks & <span className="text-financial-accent">Trending News</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A quick pulse of the market — top buy/sell calls and latest headlines.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Broker picks (compact) */}
          {topPicks.map((rec, i) => (
            <Card
              key={`pick-${i}`}
              className="bg-gradient-card border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-financial-accent/10 text-financial-accent border-financial-accent/30 text-[10px] font-semibold">
                    <Building2 className="w-3 h-3 mr-1" />
                    {rec.broker}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      /buy|accumulate/i.test(rec.recommendation)
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : /sell|reduce/i.test(rec.recommendation)
                          ? "bg-red-500/10 text-red-600 border-red-500/30"
                          : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                    }`}
                  >
                    {rec.recommendation}
                  </Badge>
                </div>
                <h3 className="font-bold text-base line-clamp-2 leading-tight min-h-[2.5rem]">{rec.stock}</h3>
                <div className="flex items-baseline justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Target</span>
                  <span className="font-bold font-mono text-financial-accent">{formatCurrency(rec.targetPrice)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* News items (compact) */}
          {topNews.map((n, i) => (
            <Card
              key={`news-${i}`}
              className="bg-gradient-card border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="relative h-24 overflow-hidden">
                <img
                  src={n.image}
                  alt={n.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                {n.trending && (
                  <Badge className="absolute top-2 left-2 bg-financial-accent text-white text-[10px] px-1.5 py-0.5">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    Trending
                  </Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <Badge variant="outline" className="text-[10px]">
                  <Newspaper className="w-3 h-3 mr-1" />
                  {n.category}
                </Badge>
                <h3 className="font-semibold text-sm leading-snug line-clamp-3 min-h-[3.5rem]">{n.title}</h3>
                <div className="flex items-center text-[10px] text-muted-foreground pt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {n.readTime} · {n.source}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Skeletons if empty */}
          {topPicks.length === 0 &&
            topNews.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={`sk-${i}`} className="bg-gradient-card border shadow-card">
                <CardContent className="p-5 space-y-3">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-financial-accent hover:bg-financial-accent/90 text-white shadow-lg shadow-financial-accent/20"
          >
            <Link to="/market-insights">
              View All Market Insights
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MarketInsightsTeaser;
