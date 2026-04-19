import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, AlertCircle, Info } from "lucide-react";
import { MutualFundInfo } from "@/data/mutualFundDatabase";
import { calculateOverlap } from "@/lib/fundHoldings";

interface FundOverlapProps {
  funds: MutualFundInfo[];
}

const overlapTone = (pct: number) => {
  if (pct >= 50) return { label: "High Overlap", classes: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", advice: "These funds duplicate a large portion of holdings — limited diversification benefit." };
  if (pct >= 25) return { label: "Moderate Overlap", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", advice: "Notable common holdings — review before adding both to your portfolio." };
  return { label: "Low Overlap", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", advice: "Funds are well-diversified relative to each other." };
};

const FundOverlap = ({ funds }: FundOverlapProps) => {
  const [fundAIdx, setFundAIdx] = useState(0);
  const [fundBIdx, setFundBIdx] = useState(funds.length > 1 ? 1 : 0);

  const fundA = funds[fundAIdx];
  const fundB = funds[fundBIdx];

  const overlap = useMemo(() => {
    if (!fundA || !fundB || fundAIdx === fundBIdx) return null;
    return calculateOverlap(fundA, fundB);
  }, [fundA, fundB, fundAIdx, fundBIdx]);

  // Pairwise matrix for 3+ funds
  const matrix = useMemo(() => {
    if (funds.length < 2) return [];
    return funds.map((rowFund, i) =>
      funds.map((colFund, j) => {
        if (i === j) return null;
        return calculateOverlap(rowFund, colFund).overlapPercent;
      })
    );
  }, [funds]);

  if (funds.length < 2) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Select at least 2 funds to check overlap.
        </CardContent>
      </Card>
    );
  }

  const tone = overlap ? overlapTone(overlap.overlapPercent) : null;

  return (
    <div className="space-y-6">
      {/* Pair selectors */}
      {funds.length > 2 && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Fund A</label>
            <Select value={String(fundAIdx)} onValueChange={(v) => setFundAIdx(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {funds.map((f, i) => (
                  <SelectItem key={f.schemeCode} value={String(i)}>
                    {f.schemeName.split(" - ")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Fund B</label>
            <Select value={String(fundBIdx)} onValueChange={(v) => setFundBIdx(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {funds.map((f, i) => (
                  <SelectItem key={f.schemeCode} value={String(i)}>
                    {f.schemeName.split(" - ")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {fundAIdx === fundBIdx ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Pick two different funds to compare.
          </CardContent>
        </Card>
      ) : overlap && tone ? (
        <>
          {/* Headline overlap card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Donut */}
                <div className="relative w-40 h-40 mx-auto md:mx-0 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" className="fill-none stroke-muted" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="42"
                      className="fill-none stroke-financial-accent transition-all"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(overlap.overlapPercent / 100) * 263.9} 263.9`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{overlap.overlapPercent}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Overlap</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tone.classes}`}>{tone.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {overlap.commonStocks.length} common stocks
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-foreground">{fundA.schemeName.split(" - ")[0]}</div>
                    <div className="text-xs text-muted-foreground">vs</div>
                    <div className="font-medium text-foreground">{fundB.schemeName.split(" - ")[0]}</div>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {tone.advice}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common stocks table */}
          {overlap.commonStocks.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-financial-accent" />
                  Common Holdings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left p-3 font-medium">Stock</th>
                        <th className="text-left p-3 font-medium">Sector</th>
                        <th className="text-right p-3 font-medium">{fundA.schemeName.split(" - ")[0].slice(0, 22)}</th>
                        <th className="text-right p-3 font-medium">{fundB.schemeName.split(" - ")[0].slice(0, 22)}</th>
                        <th className="text-right p-3 font-medium">Overlap Wt.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overlap.commonStocks.map((s, idx) => (
                        <tr key={s.symbol} className={idx % 2 === 0 ? "bg-muted/30" : ""}>
                          <td className="p-3">
                            <div className="font-medium text-foreground">{s.symbol}</div>
                            <div className="text-xs text-muted-foreground">{s.name}</div>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{s.sector}</td>
                          <td className="p-3 text-right tabular-nums">{s.weights[0].toFixed(2)}%</td>
                          <td className="p-3 text-right tabular-nums">{s.weights[1].toFixed(2)}%</td>
                          <td className="p-3 text-right tabular-nums font-medium text-financial-accent">
                            {s.minWeight.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No common holdings detected between these funds.
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      {/* Pairwise matrix when 3+ funds */}
      {funds.length > 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pairwise Overlap Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left p-3 font-medium sticky left-0 bg-card">Fund</th>
                    {funds.map((f) => (
                      <th key={f.schemeCode} className="p-3 text-center font-medium min-w-[110px]">
                        {f.schemeName.split(" - ")[0].slice(0, 18)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {funds.map((rowFund, i) => (
                    <tr key={rowFund.schemeCode} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="p-3 font-medium text-foreground sticky left-0 bg-inherit">
                        {rowFund.schemeName.split(" - ")[0].slice(0, 22)}
                      </td>
                      {funds.map((_, j) => {
                        const val = matrix[i]?.[j];
                        if (val === null || val === undefined) {
                          return <td key={j} className="p-3 text-center text-muted-foreground">—</td>;
                        }
                        const t = overlapTone(val);
                        return (
                          <td key={j} className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium tabular-nums ${t.classes}`}>
                              {val}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground flex items-start gap-2">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        Holdings are illustrative estimates derived from each fund's category & strategy. Actual portfolios are disclosed monthly by AMCs.
      </p>
    </div>
  );
};

export default FundOverlap;
