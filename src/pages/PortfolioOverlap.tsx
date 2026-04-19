import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, Search, X, Plus, Sparkles, TrendingDown, Target, Eye } from "lucide-react";
import { mutualFunds, MutualFundInfo } from "@/data/mutualFundDatabase";
import FundOverlap from "@/components/mutual-fund-overlap/FundOverlap";

const MAX_FUNDS = 4;

const PortfolioOverlapPage = () => {
  const [selected, setSelected] = useState<MutualFundInfo[]>([]);
  const [query, setQuery] = useState("");

  const selectedCodes = useMemo(() => new Set(selected.map((f) => f.schemeCode)), [selected]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return mutualFunds
      .filter(
        (f) =>
          !selectedCodes.has(f.schemeCode) &&
          (f.schemeName.toLowerCase().includes(q) ||
            f.fundHouse.toLowerCase().includes(q) ||
            f.subCategory.toLowerCase().includes(q)),
      )
      .slice(0, 10);
  }, [query, selectedCodes]);

  const addFund = (fund: MutualFundInfo) => {
    if (selected.length >= MAX_FUNDS) return;
    setSelected((prev) => [...prev, fund]);
    setQuery("");
  };

  const removeFund = (code: string) => {
    setSelected((prev) => prev.filter((f) => f.schemeCode !== code));
  };

  const suggestions = useMemo(() => {
    return mutualFunds
      .filter((f) => f.rating >= 4 && !selectedCodes.has(f.schemeCode))
      .slice(0, 6);
  }, [selectedCodes]);

  return (
    <PageLayout>
      <div className="pt-28">
        {/* Hero band */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-financial-accent/10 via-financial-gold/5 to-transparent" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-financial-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-financial-gold/10 rounded-full blur-3xl translate-y-1/2" />

          <div className="relative container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="max-w-2xl">
                <Badge className="mb-4 bg-financial-accent/10 text-financial-accent border-financial-accent/20 hover:bg-financial-accent/20">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  New Tool
                </Badge>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-financial-accent to-financial-gold flex items-center justify-center shadow-lg shadow-financial-accent/30">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                    Portfolio Overlap
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Compare up to {MAX_FUNDS} mutual funds and see exactly how much they duplicate
                  each other. Discover real diversification gaps before you invest.
                </p>
              </div>

              {/* Stat tiles */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="bg-card/60 backdrop-blur-sm border rounded-xl p-3 text-center min-w-[90px]">
                  <Target className="w-4 h-4 mx-auto mb-1.5 text-financial-accent" />
                  <div className="text-xs text-muted-foreground">Up to</div>
                  <div className="text-lg font-bold text-foreground">{MAX_FUNDS} funds</div>
                </div>
                <div className="bg-card/60 backdrop-blur-sm border rounded-xl p-3 text-center min-w-[90px]">
                  <TrendingDown className="w-4 h-4 mx-auto mb-1.5 text-emerald-600" />
                  <div className="text-xs text-muted-foreground">Avoid</div>
                  <div className="text-lg font-bold text-foreground">overlap</div>
                </div>
                <div className="bg-card/60 backdrop-blur-sm border rounded-xl p-3 text-center min-w-[90px]">
                  <Eye className="w-4 h-4 mx-auto mb-1.5 text-financial-gold" />
                  <div className="text-xs text-muted-foreground">See</div>
                  <div className="text-lg font-bold text-foreground">holdings</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid lg:grid-cols-[400px_1fr] gap-6">
            {/* Fund picker — sticky on desktop */}
            <div className="lg:sticky lg:top-28 lg:self-start space-y-4">
              <Card className="overflow-hidden border-2">
                {/* Header strip */}
                <div className="bg-gradient-to-r from-financial-accent/10 to-financial-gold/10 px-5 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-financial-accent animate-pulse" />
                    <span className="text-sm font-semibold text-foreground">Selected Funds</span>
                  </div>
                  <div className="text-xs font-bold text-financial-accent tabular-nums">
                    {selected.length} / {MAX_FUNDS}
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Selected list */}
                  {selected.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Search and add funds below
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selected.map((fund, idx) => (
                        <div
                          key={fund.schemeCode}
                          className="group flex items-start gap-3 p-3 rounded-xl border bg-gradient-to-br from-card to-muted/20 hover:border-financial-accent/40 transition-all"
                        >
                          <div className="shrink-0 w-7 h-7 rounded-md bg-financial-accent/10 text-financial-accent flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">
                              {fund.schemeName.split(" - ")[0]}
                            </div>
                            <div className="flex gap-1.5 mt-1 items-center">
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                {fund.subCategory}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {fund.fundHouse}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFund(fund.schemeCode)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity"
                            aria-label="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={
                        selected.length >= MAX_FUNDS
                          ? `Maximum ${MAX_FUNDS} reached`
                          : "Search funds to add..."
                      }
                      disabled={selected.length >= MAX_FUNDS}
                      className="pl-9 h-10"
                    />
                  </div>

                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <ScrollArea className="max-h-72">
                      <div className="space-y-1.5 pr-2">
                        {searchResults.map((fund) => (
                          <button
                            key={fund.schemeCode}
                            onClick={() => addFund(fund)}
                            className="w-full text-left p-2.5 rounded-lg border hover:border-financial-accent hover:bg-financial-accent/5 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">
                                  {fund.schemeName.split(" - ")[0]}
                                </div>
                                <div className="flex gap-1.5 mt-1 items-center">
                                  <Badge variant="outline" className="text-[10px]">
                                    {fund.subCategory}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground truncate">
                                    {fund.fundHouse}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0 w-6 h-6 rounded-md bg-muted group-hover:bg-financial-accent/15 flex items-center justify-center transition-colors">
                                <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-financial-accent" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {/* Suggestions */}
                  {selected.length === 0 && !query && (
                    <div className="pt-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                        <Sparkles className="w-3 h-3" />
                        Popular picks
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((fund) => (
                          <button
                            key={fund.schemeCode}
                            onClick={() => addFund(fund)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border bg-card hover:border-financial-accent hover:bg-financial-accent/5 hover:text-financial-accent transition-all"
                          >
                            {fund.schemeName.split(" - ")[0].slice(0, 22)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected([])}
                      className="w-full text-xs text-muted-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Legend */}
              <Card className="border-dashed bg-muted/20">
                <CardContent className="p-4 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Overlap Guide
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-medium text-foreground">Below 25%</span>
                    <span className="text-muted-foreground">— Well diversified</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-medium text-foreground">25 – 50%</span>
                    <span className="text-muted-foreground">— Moderate overlap</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-medium text-foreground">Above 50%</span>
                    <span className="text-muted-foreground">— High duplication</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overlap output */}
            <div>
              {selected.length < 2 ? (
                <Card className="border-2 border-dashed bg-gradient-to-br from-muted/20 to-card overflow-hidden">
                  <CardContent className="p-12 lg:p-16 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-financial-accent/20 to-financial-gold/20 blur-xl" />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-financial-accent/10 to-financial-gold/10 flex items-center justify-center border-2 border-financial-accent/20">
                        <Layers className="w-10 h-10 text-financial-accent" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {selected.length === 0
                        ? "Pick your first fund"
                        : "Add one more fund to start"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                      Use the search panel on the left to add mutual funds. You'll instantly see how
                      much they overlap, the exact common holdings, and pairwise comparisons.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                      <span className="px-3 py-1.5 rounded-full bg-muted/50 border">
                        ✓ Donut overlap %
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-muted/50 border">
                        ✓ Common stocks
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-muted/50 border">
                        ✓ Pairwise matrix
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <FundOverlap funds={selected} />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PortfolioOverlapPage;
