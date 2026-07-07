import { lazy, Suspense, useEffect } from "react";
import PageLayout from "@/components/shared/PageLayout";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const StockRecommendations = lazy(() => import("@/components/StockRecommendations"));
const FeaturedInsights = lazy(() => import("@/components/FeaturedInsights"));

const SectionFallback = () => <div className="py-16 sm:py-24" aria-hidden="true" />;

const MarketInsights = () => {
  useEffect(() => {
    document.title = "Market Insights — Brokerage Picks & Trending News | Moneva";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Live brokerage stock picks and trending market news from India's top sources — all in one place.",
      );
    }
  }, []);

  return (
    <PageLayout>
      <main>
        {/* Page header */}
        <section className="py-12 sm:py-16 bg-background border-b border-border/40">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-financial-accent/10 text-financial-accent border-financial-accent/30 hover:bg-financial-accent/20">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Market Insights
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-foreground to-financial-accent bg-clip-text text-transparent">
              Brokerage Picks & Market News
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Live buy/sell calls from India's top brokerages and trending headlines — refreshed throughout the day.
            </p>
          </div>
        </section>

        <Suspense fallback={<SectionFallback />}>
          <StockRecommendations limit={12} />
          <FeaturedInsights />
        </Suspense>
      </main>
    </PageLayout>
  );
};

export default MarketInsights;
