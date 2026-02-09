import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, X, ArrowLeft } from "lucide-react";
import { MutualFundInfo } from "@/data/mutualFundDatabase";

interface MutualFundComparisonProps {
  funds: MutualFundInfo[];
  onBack: () => void;
}

const MutualFundComparison = ({ funds, onBack }: MutualFundComparisonProps) => {
  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );

  const riskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Moderate": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "High": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Very High": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default: return "";
    }
  };

  const getBestValue = (values: number[], higherIsBetter = true) => {
    if (higherIsBetter) return Math.max(...values);
    return Math.min(...values);
  };

  const rows: { label: string; key: string; format: (fund: MutualFundInfo) => string; higherIsBetter?: boolean; getValue?: (fund: MutualFundInfo) => number }[] = [
    { label: "Category", key: "category", format: (f) => f.category },
    { label: "Sub Category", key: "subCategory", format: (f) => f.subCategory },
    { label: "Fund House", key: "fundHouse", format: (f) => f.fundHouse },
    { label: "NAV", key: "nav", format: (f) => `₹${f.nav.toFixed(2)}` },
    { label: "AUM", key: "aum", format: (f) => `₹${f.aum.toLocaleString()} Cr`, higherIsBetter: true, getValue: (f) => f.aum },
    { label: "Expense Ratio", key: "expenseRatio", format: (f) => `${f.expenseRatio.toFixed(2)}%`, higherIsBetter: false, getValue: (f) => f.expenseRatio },
    { label: "1Y Return", key: "returns1Y", format: (f) => `${f.returns1Y >= 0 ? '+' : ''}${f.returns1Y.toFixed(1)}%`, higherIsBetter: true, getValue: (f) => f.returns1Y },
    { label: "3Y Return (CAGR)", key: "returns3Y", format: (f) => `${f.returns3Y >= 0 ? '+' : ''}${f.returns3Y.toFixed(1)}%`, higherIsBetter: true, getValue: (f) => f.returns3Y },
    { label: "5Y Return (CAGR)", key: "returns5Y", format: (f) => f.returns5Y > 0 ? `+${f.returns5Y.toFixed(1)}%` : '—', higherIsBetter: true, getValue: (f) => f.returns5Y },
    { label: "10Y Return (CAGR)", key: "returns10Y", format: (f) => f.returns10Y > 0 ? `+${f.returns10Y.toFixed(1)}%` : '—', higherIsBetter: true, getValue: (f) => f.returns10Y },
    { label: "Risk Level", key: "riskLevel", format: (f) => f.riskLevel },
    { label: "Min SIP", key: "sipMinimum", format: (f) => `₹${f.sipMinimum}` },
    { label: "Min Lumpsum", key: "lumpSumMinimum", format: (f) => `₹${f.lumpSumMinimum.toLocaleString()}` },
    { label: "Exit Load", key: "exitLoad", format: (f) => f.exitLoad },
    { label: "Benchmark", key: "benchmark", format: (f) => f.benchmark },
    { label: "Fund Manager", key: "fundManager", format: (f) => f.fundManager },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Screener
        </Button>
        <h2 className="text-lg font-semibold">Comparing {funds.length} Funds</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Fund headers */}
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 w-40 text-sm font-medium text-muted-foreground sticky left-0 bg-card z-10">Metric</th>
                  {funds.map(fund => (
                    <th key={fund.schemeCode} className="p-4 text-left min-w-[200px]">
                      <div className="space-y-2">
                        <div className="font-semibold text-sm text-foreground leading-tight">
                          {fund.schemeName.split(" - ")[0]}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{fund.subCategory}</Badge>
                          {renderStars(fund.rating)}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const values = row.getValue ? funds.map(f => row.getValue!(f)) : [];
                  const bestVal = values.length > 0 ? getBestValue(values, row.higherIsBetter) : null;
                  
                  return (
                    <tr key={row.key} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                      <td className="p-4 text-sm font-medium text-muted-foreground sticky left-0 bg-inherit z-10">{row.label}</td>
                      {funds.map(fund => {
                        const val = row.getValue?.(fund);
                        const isBest = bestVal !== null && val === bestVal && funds.length > 1;
                        
                        return (
                          <td key={fund.schemeCode} className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${isBest ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                                {row.format(fund)}
                              </span>
                              {row.key === "riskLevel" && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${riskColor(fund.riskLevel)}`}>
                                  {fund.riskLevel}
                                </span>
                              )}
                              {isBest && (
                                <Badge className="text-[9px] py-0 px-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                                  Best
                                </Badge>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MutualFundComparison;
