import { useState, useMemo } from "react";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, Search, X, Plus, Info } from "lucide-react";
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

  // Suggested popular funds when nothing is selected
  const suggestions = useMemo(() => {
    return mutualFunds
      .filter((f) => f.rating >= 4 && !selectedCodes.has(f.schemeCode))
      .slice(0, 6);
  }, [selectedCodes]);

  return (
    <PageLayout>
      <div className="pt-28">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-financial-accent/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-financial-accent" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Portfolio Overlap Checker
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Pick 2 to 4 mutual funds and instantly see how much they duplicate each other.
              Avoid over-diversification and discover real diversification gaps in your portfolio.
            </p>
          </div>

          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            {/* Fund picker */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Selected Funds</span>
                    <Badge variant="outline" className="text-xs">
                      {selected.length}/{MAX_FUNDS}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selected.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No funds selected yet. Search below to add funds.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selected.map((fund) => (
                        <div
                          key={fund.schemeCode}
                          className="flex items-start gap-2 p-2.5 rounded-lg border bg-muted/30"
                        >
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
                          <button
                            onClick={() => removeFund(fund.schemeCode)}
                            className="text-muted-foreground hover:text-destructive p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative pt-2">
                    <Search className="absolute left-3 top-1/2 mt-1 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={
                        selected.length >= MAX_FUNDS
                          ? `Maximum ${MAX_FUNDS} funds reached`
                          : "Search funds to add..."
                      }
                      disabled={selected.length >= MAX_FUNDS}
                      className="pl-9"
                    />
                  </div>

                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <ScrollArea className="max-h-72">
                      <div className="space-y-1.5">
                        {searchResults.map((fund) => (
                          <button
                            key={fund.schemeCode}
                            onClick={() => addFund(fund)}
                            className="w-full text-left p-2.5 rounded-lg border hover:border-financial-accent hover:bg-financial-accent/5 transition-colors group"
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
                              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-financial-accent shrink-0" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {/* Suggestions when empty */}
                  {selected.length === 0 && !query && (
                    <div className="pt-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Popular picks
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((fund) => (
                          <button
                            key={fund.schemeCode}
                            onClick={() => addFund(fund)}
                            className="text-xs px-2 py-1 rounded-md border hover:border-financial-accent hover:bg-financial-accent/5 transition-colors"
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
                      className="w-full text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      Overlap above 50% means the funds duplicate most of their holdings — adding both gives little diversification benefit.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overlap output */}
            <div>
              {selected.length < 2 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Select at least 2 funds to see overlap
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Use the search panel on the left to pick mutual funds. You can compare up to {MAX_FUNDS} funds at a time.
                    </p>
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
