import { useState, useMemo, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, AlertCircle, Info, ArrowRight, TrendingUp } from "lucide-react";
import { MutualFundInfo } from "@/data/mutualFundDatabase";
import { calculateOverlap } from "@/lib/fundHoldings";

const AnimatedPercent = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => (Math.round(v * 10) / 10).toFixed(1));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

interface FundOverlapProps {
  funds: MutualFundInfo[];
}

const overlapTone = (pct: number) => {
  if (pct >= 50)
    return {
      label: "High Overlap",
      classes: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
      ring: "stroke-rose-500",
      glow: "shadow-rose-500/20",
      gradient: "from-rose-500/10 to-rose-500/5",
      dot: "bg-rose-500",
      advice: "These funds duplicate a large portion of holdings — limited diversification benefit.",
    };
  if (pct >= 25)
    return {
      label: "Moderate Overlap",
      classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      ring: "stroke-amber-500",
      glow: "shadow-amber-500/20",
      gradient: "from-amber-500/10 to-amber-500/5",
      dot: "bg-amber-500",
      advice: "Notable common holdings — review before adding both to your portfolio.",
    };
  return {
    label: "Low Overlap",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    ring: "stroke-emerald-500",
    glow: "shadow-emerald-500/20",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    dot: "bg-emerald-500",
    advice: "Funds are well-diversified relative to each other.",
  };
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

  const matrix = useMemo(() => {
    if (funds.length < 2) return [];
    return funds.map((rowFund, i) =>
      funds.map((colFund, j) => {
        if (i === j) return null;
        return calculateOverlap(rowFund, colFund).overlapPercent;
      }),
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
  const dashLength = overlap ? (overlap.overlapPercent / 100) * 263.9 : 0;

  return (
    <div className="space-y-6">
      {/* Pair selectors */}
      {funds.length > 2 && (
        <Card className="border-financial-accent/20 bg-financial-accent/5">
          <CardContent className="p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              Pair to Analyze
            </div>
            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Fund A</label>
                <Select value={String(fundAIdx)} onValueChange={(v) => setFundAIdx(Number(v))}>
                  <SelectTrigger className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {funds.map((f, i) => (
                      <SelectItem key={f.schemeCode} value={String(i)}>
                        {f.schemeName.split(" - ")[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden sm:flex items-center justify-center pb-2.5">
                <div className="w-8 h-8 rounded-full bg-financial-accent/15 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-financial-accent" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Fund B</label>
                <Select value={String(fundBIdx)} onValueChange={(v) => setFundBIdx(Number(v))}>
                  <SelectTrigger className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
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
          </CardContent>
        </Card>
      )}

      {fundAIdx === fundBIdx ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Pick two different funds to compare.
          </CardContent>
        </Card>
      ) : overlap && tone ? (
        <>
          {/* Headline overlap card — hero treatment */}
          <Card className={`overflow-hidden border-2 shadow-xl ${tone.glow}`}>
            <div className={`bg-gradient-to-br ${tone.gradient} p-6 lg:p-8`}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                {/* Donut */}
                <div className="relative w-44 h-44 mx-auto lg:mx-0 shrink-0">
                  {/* Glow */}
                  <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${tone.gradient} blur-2xl opacity-60`} />
                  <svg viewBox="0 0 100 100" className="relative w-full h-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="fill-none stroke-muted/40"
                      strokeWidth="9"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={`fill-none ${tone.ring}`}
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="263.9 263.9"
                      initial={{ strokeDashoffset: 263.9 }}
                      animate={{ strokeDashoffset: 263.9 - dashLength }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{
                        filter: `drop-shadow(0 0 8px currentColor)`,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-foreground tabular-nums tracking-tight">
                      <AnimatedPercent value={overlap.overlapPercent} />
                      <span className="text-2xl text-muted-foreground">%</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                      Overlap
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${tone.classes}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
                      {tone.label}
                    </span>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Layers className="w-3 h-3" />
                      {overlap.commonStocks.length} common stocks
                    </Badge>
                  </div>

                  {/* Fund A → Fund B */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card/60 backdrop-blur-sm border">
                      <div className="shrink-0 w-7 h-7 rounded-md bg-financial-accent/15 text-financial-accent flex items-center justify-center text-xs font-bold">
                        A
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {fundA.schemeName.split(" - ")[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {fundA.subCategory} • {fundA.fundHouse}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card/60 backdrop-blur-sm border">
                      <div className="shrink-0 w-7 h-7 rounded-md bg-financial-gold/15 text-financial-gold flex items-center justify-center text-xs font-bold">
                        B
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {fundB.schemeName.split(" - ")[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {fundB.subCategory} • {fundB.fundHouse}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/80 flex items-start gap-2 pl-1">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                    {tone.advice}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Common stocks table */}
          {overlap.commonStocks.length > 0 ? (
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-financial-accent/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-financial-accent" />
                  </div>
                  Common Holdings
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {overlap.commonStocks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground bg-muted/30">
                        <th className="text-left p-3 font-bold uppercase tracking-wider">Stock</th>
                        <th className="text-left p-3 font-bold uppercase tracking-wider hidden sm:table-cell">
                          Sector
                        </th>
                        <th className="text-right p-3 font-bold uppercase tracking-wider">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-4 h-4 rounded-md bg-financial-accent/15 text-financial-accent flex items-center justify-center text-[9px] font-bold">
                              A
                            </span>
                          </span>
                        </th>
                        <th className="text-right p-3 font-bold uppercase tracking-wider">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-4 h-4 rounded-md bg-financial-gold/15 text-financial-gold flex items-center justify-center text-[9px] font-bold">
                              B
                            </span>
                          </span>
                        </th>
                        <th className="text-right p-3 font-bold uppercase tracking-wider">
                          Shared
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {overlap.commonStocks.map((s, idx) => {
                        // Bar visualization for shared weight (max ~10% domain)
                        const barPct = Math.min((s.minWeight / 10) * 100, 100);
                        return (
                          <tr
                            key={s.symbol}
                            className={`border-b last:border-b-0 hover:bg-muted/30 transition-colors ${
                              idx % 2 === 0 ? "" : "bg-muted/10"
                            }`}
                          >
                            <td className="p-3">
                              <div className="font-semibold text-foreground">{s.symbol}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {s.name}
                              </div>
                            </td>
                            <td className="p-3 hidden sm:table-cell">
                              <Badge variant="outline" className="text-[10px]">
                                {s.sector}
                              </Badge>
                            </td>
                            <td className="p-3 text-right tabular-nums text-muted-foreground">
                              {s.weights[0].toFixed(2)}%
                            </td>
                            <td className="p-3 text-right tabular-nums text-muted-foreground">
                              {s.weights[1].toFixed(2)}%
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-end gap-2">
                                <div className="hidden md:block w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-financial-accent to-financial-gold rounded-full"
                                    style={{ width: `${barPct}%` }}
                                  />
                                </div>
                                <span className="font-bold text-financial-accent tabular-nums min-w-[48px] text-right">
                                  {s.minWeight.toFixed(2)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-1">
                  No common holdings
                </h4>
                <p className="text-sm text-muted-foreground">
                  These funds invest in completely different stocks — excellent diversification.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      {/* Pairwise matrix when 3+ funds */}
      {funds.length > 2 && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-financial-gold/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-financial-gold" />
              </div>
              Pairwise Overlap Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground bg-muted/30">
                    <th className="text-left p-3 font-bold uppercase tracking-wider sticky left-0 bg-muted/30">
                      Fund
                    </th>
                    {funds.map((f) => (
                      <th
                        key={f.schemeCode}
                        className="p-3 text-center font-bold uppercase tracking-wider min-w-[110px]"
                      >
                        {f.schemeName.split(" - ")[0].slice(0, 18)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {funds.map((rowFund, i) => (
                    <tr
                      key={rowFund.schemeCode}
                      className={`border-b last:border-b-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                    >
                      <td className="p-3 font-semibold text-foreground sticky left-0 bg-inherit">
                        {rowFund.schemeName.split(" - ")[0].slice(0, 22)}
                      </td>
                      {funds.map((_, j) => {
                        const val = matrix[i]?.[j];
                        if (val === null || val === undefined) {
                          return (
                            <td key={j} className="p-3 text-center text-muted-foreground/40">
                              —
                            </td>
                          );
                        }
                        const t = overlapTone(val);
                        return (
                          <td key={j} className="p-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tabular-nums ${t.classes}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
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

      <p className="text-xs text-muted-foreground flex items-start gap-2 pl-1">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        Holdings are illustrative estimates derived from each fund's category & strategy. Actual
        portfolios are disclosed monthly by AMCs.
      </p>
    </div>
  );
};

export default FundOverlap;
