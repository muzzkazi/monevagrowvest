import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/shared/PageLayout";
import MutualFundScreener from "@/components/MutualFundScreener";
import MutualFundComparison from "@/components/MutualFundComparison";
import { MutualFundInfo } from "@/data/mutualFundDatabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, ArrowRight } from "lucide-react";

const MutualFundComparisonPage = () => {
  const [compareMode, setCompareMode] = useState(false);
  const [compareFunds, setCompareFunds] = useState<MutualFundInfo[]>([]);

  const handleCompare = (funds: MutualFundInfo[]) => {
    setCompareFunds(funds);
    setCompareMode(true);
  };

  return (
    <PageLayout>
      <div className="pt-28">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Mutual Fund Screener
            </h1>
            <p className="text-muted-foreground">
              Screen, filter & compare 40+ top mutual funds across categories
            </p>
          </div>

          {compareMode ? (
            <MutualFundComparison
              funds={compareFunds}
              onBack={() => setCompareMode(false)}
            />
          ) : (
            <>
              {/* Portfolio Overlap promo */}
              <Card className="mb-6 border-amber-200 dark:border-amber-900/40 bg-gradient-to-r from-amber-50 to-amber-100/40 dark:from-amber-950/20 dark:to-amber-900/10">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground">
                        New: Portfolio Overlap Checker
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        See how much your funds duplicate each other and avoid over-diversification.
                      </p>
                    </div>
                    <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                      <Link to="/portfolio-overlap" className="gap-1.5">
                        Check Overlap
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <MutualFundScreener onCompare={handleCompare} />
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MutualFundComparisonPage;
