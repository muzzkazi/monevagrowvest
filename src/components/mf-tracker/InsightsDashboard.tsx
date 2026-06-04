import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, TrendingDown, AlertTriangle, Trophy, Layers, PieChart,
  Target, Sparkles, Copy as CopyIcon, ShieldAlert, Lightbulb,
} from "lucide-react";
import { getFundHoldings, calculateOverlap, type Holding } from "@/lib/fundHoldings";
import type { MutualFundInfo } from "@/data/mutualFundDatabase";
import type { TrackedFund } from "@/hooks/useTrackedFunds";

interface IntelResult {
  code: string;
  meta?: { schemeName: string; fundHouse: string | null; schemeCategory: string | null };
  returns?: { latestNav: number; y1: number | null; y3: number | null; y5: number | null; y10: number | null };
  benchmark?: { name: string; returns: { y1: number; y3: number; y5: number; y10: number; y15: number } };
  benchmarkBeats?: { y5: number | null; y10: number | null; y15: number | null };
}

// Infer a subCategory string that fundHoldings.ts understands.
const inferSubCategory = (name: string, category?: string | null): string => {
  const n = `${name} ${category || ""}`.toLowerCase();
  if (/small\s*cap/.test(n)) return "Small Cap";
  if (/mid\s*cap/.test(n)) return "Mid Cap";
  if (/large\s*cap/.test(n)) return "Large Cap";
  if (/elss|tax\s*saver/.test(n)) return "ELSS";
  if (/index|nifty|sensex/.test(n)) return "Index Fund";
  if (/flexi/.test(n)) return "Flexi Cap";
  if (/multi\s*cap/.test(n)) return "Multi Cap";
  if (/value/.test(n)) return "Value";
  if (/large\s*&?\s*mid/.test(n)) return "Large & Mid Cap";
  return "Large Cap";
};

const inferAssetClass = (name: string, category?: string | null): "Equity" | "Debt" | "Hybrid" | "Other" => {
  const n = `${name} ${category || ""}`.toLowerCase();
  if (/debt|liquid|bond|gilt|duration|psu|credit/.test(n)) return "Debt";
  if (/hybrid|balanced|arbitrage|multi\s*asset/.test(n)) return "Hybrid";
  if (/equity|cap|elss|index|sectoral|flexi|value/.test(n)) return "Equity";
  return "Other";
};

const makeSyntheticFund = (code: string, name: string, category?: string | null): MutualFundInfo =>
  ({
    schemeCode: code,
    schemeName: name,
    subCategory: inferSubCategory(name, category),
    category: inferAssetClass(name, category),
  } as MutualFundInfo);

const fmtINR = (v: number) =>
  v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const fmtPct = (v: number | null | undefined, dp = 1) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(dp)}%`;

const SECTOR_COLORS: Record<string, string> = {
  Financials: "bg-blue-500",
  IT: "bg-violet-500",
  Energy: "bg-amber-500",
  FMCG: "bg-emerald-500",
  Healthcare: "bg-rose-500",
  Auto: "bg-orange-500",
  Consumer: "bg-pink-500",
  Telecom: "bg-cyan-500",
  Construction: "bg-stone-500",
  Cement: "bg-slate-500",
  Chemicals: "bg-teal-500",
  Industrials: "bg-indigo-500",
  Retail: "bg-fuchsia-500",
  "Cap Goods": "bg-lime-500",
  "Auto Anc": "bg-yellow-500",
  Metals: "bg-zinc-500",
  Logistics: "bg-sky-500",
  "Consumer Durables": "bg-red-500",
};
const colorFor = (s: string) => SECTOR_COLORS[s] || "bg-muted-foreground";

interface Props {
  funds: TrackedFund[];
  intel: Record<string, IntelResult | undefined>;
}

const InsightsDashboard = ({ funds, intel }: Props) => {
  const data = useMemo(() => {
    if (funds.length === 0) return null;

    const totalSIP = funds.reduce((s, f) => s + (f.monthlySIP || 0), 0);
    const annualSIP = totalSIP * 12;

    // Per-fund enriched view
    const enriched = funds.map((f) => {
      const i = intel[f.code];
      const synthetic = makeSyntheticFund(f.code, f.name, i?.meta?.schemeCategory);
      const holdings = getFundHoldings(synthetic, 12);
      const weight = totalSIP > 0 ? (f.monthlySIP || 0) / totalSIP : 0;
      return {
        fund: f,
        intel: i,
        synthetic,
        holdings,
        portfolioWeight: weight,
        assetClass: inferAssetClass(f.name, i?.meta?.schemeCategory),
      };
    });

    // Asset class allocation (by SIP weight)
    const assetMix: Record<string, number> = {};
    enriched.forEach((e) => {
      assetMix[e.assetClass] = (assetMix[e.assetClass] || 0) + e.portfolioWeight * 100;
    });

    // Sub-category allocation
    const catMix: Record<string, number> = {};
    enriched.forEach((e) => {
      const k = e.synthetic.subCategory;
      catMix[k] = (catMix[k] || 0) + e.portfolioWeight * 100;
    });

    // Aggregated stock exposure & sector exposure (portfolio-weighted)
    const stockAgg = new Map<string, { name: string; sector: string; weight: number; funds: string[] }>();
    const sectorAgg = new Map<string, number>();
    enriched.forEach((e) => {
      e.holdings.forEach((h) => {
        const w = h.weight * e.portfolioWeight; // % of portfolio
        const cur = stockAgg.get(h.symbol);
        if (cur) {
          cur.weight += w;
          cur.funds.push(e.fund.name);
        } else {
          stockAgg.set(h.symbol, { name: h.name, sector: h.sector, weight: w, funds: [e.fund.name] });
        }
        sectorAgg.set(h.sector, (sectorAgg.get(h.sector) || 0) + w);
      });
    });
    const topStocks = [...stockAgg.entries()]
      .map(([symbol, v]) => ({ symbol, ...v }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);
    const topSectors = [...sectorAgg.entries()]
      .map(([sector, weight]) => ({ sector, weight }))
      .sort((a, b) => b.weight - a.weight);
    const totalSectorWeight = topSectors.reduce((s, x) => s + x.weight, 0) || 1;

    // Weighted portfolio returns
    const w = (key: "y1" | "y3" | "y5") => {
      let num = 0, den = 0;
      enriched.forEach((e) => {
        const r = e.intel?.returns?.[key];
        if (r != null) {
          num += r * e.portfolioWeight;
          den += e.portfolioWeight;
        }
      });
      return den > 0 ? num / den : null;
    };
    const portfolio1Y = w("y1");
    const portfolio3Y = w("y3");
    const portfolio5Y = w("y5");

    // Best / worst (by 1Y return)
    const ranked = [...enriched]
      .filter((e) => e.intel?.returns?.y1 != null)
      .sort((a, b) => (b.intel!.returns!.y1! - a.intel!.returns!.y1!));
    const best = ranked[0];
    const worst = ranked[ranked.length - 1];

    // Benchmark laggards (5Y diff < 0)
    const laggards = enriched.filter((e) => {
      const d = e.intel?.benchmarkBeats?.y5;
      return d != null && d < 0;
    });

    // Overlap pairs (only same asset class)
    const overlapPairs: Array<{ a: string; b: string; pct: number; common: number }> = [];
    for (let i = 0; i < enriched.length; i++) {
      for (let j = i + 1; j < enriched.length; j++) {
        if (enriched[i].assetClass !== enriched[j].assetClass) continue;
        const o = calculateOverlap(enriched[i].synthetic, enriched[j].synthetic);
        overlapPairs.push({
          a: enriched[i].fund.name,
          b: enriched[j].fund.name,
          pct: o.overlapPercent,
          common: o.commonStocks.length,
        });
      }
    }
    overlapPairs.sort((a, b) => b.pct - a.pct);
    const redundant = overlapPairs.filter((p) => p.pct >= 50);

    // Concentration: single fund > 40% of SIP
    const concentrated = enriched.filter((e) => e.portfolioWeight > 0.4);

    // Single sector > 40%
    const sectorOver = topSectors.find((s) => s.weight / totalSectorWeight > 0.4);

    return {
      totalSIP, annualSIP, enriched,
      assetMix, catMix, topStocks, topSectors, totalSectorWeight,
      portfolio1Y, portfolio3Y, portfolio5Y,
      best, worst, laggards, overlapPairs, redundant, concentrated, sectorOver,
    };
  }, [funds, intel]);

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Add funds in the Portfolio tab to unlock insights.
        </CardContent>
      </Card>
    );
  }

  // ─── Insight cards (only show what's actionable) ───
  const insights: Array<{ kind: "warn" | "good" | "info"; icon: any; title: string; body: string }> = [];
  if (data.redundant.length > 0) {
    insights.push({
      kind: "warn", icon: CopyIcon,
      title: `${data.redundant.length} overlapping fund pair${data.redundant.length > 1 ? "s" : ""} detected`,
      body: `${data.redundant[0].a} & ${data.redundant[0].b} share ~${data.redundant[0].pct.toFixed(0)}% of stocks. Consider consolidating to reduce redundancy.`,
    });
  }
  if (data.concentrated.length > 0) {
    const c = data.concentrated[0];
    insights.push({
      kind: "warn", icon: ShieldAlert,
      title: "High single-fund concentration",
      body: `${(c.portfolioWeight * 100).toFixed(0)}% of your SIP goes to ${c.fund.name}. Diversifying reduces single-strategy risk.`,
    });
  }
  if (data.sectorOver) {
    insights.push({
      kind: "warn", icon: PieChart,
      title: `${data.sectorOver.sector} exposure is heavy`,
      body: `~${((data.sectorOver.weight / data.totalSectorWeight) * 100).toFixed(0)}% of your equity exposure sits in ${data.sectorOver.sector}. Watch for sector-specific shocks.`,
    });
  }
  if (data.laggards.length > 0) {
    insights.push({
      kind: "warn", icon: TrendingDown,
      title: `${data.laggards.length} fund${data.laggards.length > 1 ? "s" : ""} trailing benchmark on 5Y`,
      body: `${data.laggards[0].fund.name} is ${fmtPct(data.laggards[0].intel?.benchmarkBeats?.y5)} vs benchmark. Review whether to switch.`,
    });
  }
  if (data.best && data.best.intel?.returns?.y1 != null) {
    insights.push({
      kind: "good", icon: Trophy,
      title: `Top performer: ${data.best.fund.name.split(" - ")[0]}`,
      body: `Returned ${fmtPct(data.best.intel.returns.y1)} over 1Y, leading your portfolio.`,
    });
  }
  if (insights.length === 0) {
    insights.push({
      kind: "good", icon: Sparkles,
      title: "Portfolio looks balanced",
      body: "No major concentration, redundancy or laggard issues detected. Keep your SIPs running.",
    });
  }

  const kpis = [
    { label: "Funds tracked", value: funds.length.toString() },
    { label: "Monthly SIP", value: fmtINR(data.totalSIP) },
    { label: "Annual deployment", value: fmtINR(data.annualSIP) },
    { label: "Portfolio 1Y", value: fmtPct(data.portfolio1Y) },
    { label: "Portfolio 3Y", value: fmtPct(data.portfolio3Y) },
    { label: "Portfolio 5Y", value: fmtPct(data.portfolio5Y) },
  ];

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="border border-border rounded-lg p-3 bg-financial-muted/40">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
            <div className="text-lg font-semibold text-foreground mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Smart insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-financial-accent" /> Smart insights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((ins, idx) => {
            const Icon = ins.icon;
            const tone =
              ins.kind === "warn"
                ? "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20"
                : ins.kind === "good"
                ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20"
                : "border-border bg-financial-muted";
            const iconTone =
              ins.kind === "warn" ? "text-amber-600 dark:text-amber-400"
              : ins.kind === "good" ? "text-emerald-600 dark:text-emerald-400"
              : "text-financial-accent";
            return (
              <div key={idx} className={`rounded-lg border p-4 flex gap-3 ${tone}`}>
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconTone}`} />
                <div>
                  <div className="text-sm font-semibold text-foreground">{ins.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{ins.body}</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset & category allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-financial-accent" /> Allocation by SIP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Asset class</div>
              <div className="space-y-2">
                {Object.entries(data.assetMix).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{k}</span>
                      <span className="text-muted-foreground">{v.toFixed(1)}%</span>
                    </div>
                    <Progress value={v} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Sub-category</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(data.catMix).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                  <Badge key={k} variant="secondary" className="text-xs">
                    {k} · {v.toFixed(0)}%
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sector exposure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-financial-accent" /> Sector exposure (portfolio-weighted)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {data.topSectors.slice(0, 8).map((s) => {
                const pct = (s.weight / data.totalSectorWeight) * 100;
                return (
                  <div key={s.sector}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-sm ${colorFor(s.sector)}`} />
                        {s.sector}
                      </span>
                      <span className="text-muted-foreground">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${colorFor(s.sector)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top stocks across portfolio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-financial-accent" /> Top 10 stocks across your portfolio
          </CardTitle>
          <p className="text-xs text-muted-foreground">Aggregated weight across all tracked funds (weighted by SIP allocation).</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">Sector</th>
                  <th className="py-2 pr-3">Held in</th>
                  <th className="py-2 pr-3 text-right">Effective weight</th>
                </tr>
              </thead>
              <tbody>
                {data.topStocks.map((s) => (
                  <tr key={s.symbol} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{s.symbol}</div>
                      <div className="text-xs text-muted-foreground">{s.name}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge variant="outline" className="text-[10px]">{s.sector}</Badge>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                      {s.funds.length} fund{s.funds.length > 1 ? "s" : ""}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold">{s.weight.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Fund overlap matrix */}
      {data.overlapPairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CopyIcon className="h-4 w-4 text-financial-accent" /> Fund overlap
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              High overlap means duplicated exposure. &gt;50% = consider consolidating.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.overlapPairs.slice(0, 8).map((p, idx) => {
                const tone =
                  p.pct >= 50 ? "text-rose-600 dark:text-rose-400"
                  : p.pct >= 30 ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400";
                return (
                  <div key={idx} className="border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="text-xs text-muted-foreground flex-1 min-w-0">
                        <div className="truncate text-foreground font-medium">{p.a}</div>
                        <div className="text-[10px] my-0.5">vs</div>
                        <div className="truncate text-foreground font-medium">{p.b}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${tone}`}>{p.pct.toFixed(1)}%</div>
                        <div className="text-[10px] text-muted-foreground">{p.common} common</div>
                      </div>
                    </div>
                    <Progress value={p.pct} className="h-1.5 mt-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best vs Worst */}
      {data.best && data.worst && data.best !== data.worst && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-emerald-200 dark:border-emerald-900/50">
            <CardContent className="py-5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium uppercase tracking-wide">
                <TrendingUp className="h-4 w-4" /> Best 1Y performer
              </div>
              <div className="font-semibold mt-2">{data.best.fund.name}</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {fmtPct(data.best.intel?.returns?.y1)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-rose-200 dark:border-rose-900/50">
            <CardContent className="py-5">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium uppercase tracking-wide">
                <TrendingDown className="h-4 w-4" /> Weakest 1Y performer
              </div>
              <div className="font-semibold mt-2">{data.worst.fund.name}</div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {fmtPct(data.worst.intel?.returns?.y1)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InsightsDashboard;
