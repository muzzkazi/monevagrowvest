import { useState } from "react";
import PageLayout from "@/components/shared/PageLayout";
import MutualFundScreener from "@/components/MutualFundScreener";
import MutualFundComparison from "@/components/MutualFundComparison";
import { MutualFundInfo } from "@/data/mutualFundDatabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Filter } from "lucide-react";

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
            <MutualFundScreener onCompare={handleCompare} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MutualFundComparisonPage;
