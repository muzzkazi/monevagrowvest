import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase, Search, Plus, Trash2, Loader2, TrendingUp, TrendingDown,
  CircleDot, ExternalLink, CheckCircle2, Megaphone, History, BarChart2,
} from "lucide-react";

import { searchAmfi, prewarmAmfiSearch, estimateAmfiSearchMs, subscribeAmfiUpdates } from "@/lib/amfiSearch";
import { FundSearchProgress } from "@/components/portfolio/FundSearchProgress";
import { supabase } from "@/integrations/supabase/client";
import { useTrackedFunds, type TrackedFund } from "@/hooks/useTrackedFunds";
import InsightsDashboard from "@/components/mf-tracker/InsightsDashboard";
import { getFundHoldings } from "@/lib/fundHoldings";
import type { MutualFundInfo } from "@/data/mutualFundDatabase";
import { toast } from "sonner";
import PortfolioModeOnboarding from "@/components/portfolio/PortfolioModeOnboarding";
import ReviewVsTrackerChecklist from "@/components/portfolio/ReviewVsTrackerChecklist";

interface IntelResult {
  code: string;
  error?: string;
  meta?: {
    schemeName: string;
    fundHouse: string | null;
    schemeType: string | null;
    schemeCategory: string | null;
  };
  returns?: {
    latestNav: number;
    asOf: string;
    inceptionYears: number;
    y1: number | null;
    y3: number | null;
    y5: number | null;
    y10: number | null;
    y15: number | null;
    sinceInception: number | null;
  };
  benchmark?: {
    name: string;
    returns: { y1: number; y3: number; y5: number; y10: number; y15: number };
  };
  benchmarkBeats?: { y5: number | null; y10: number | null; y15: number | null };
  factsheet?: { available: boolean; reason?: string };
}

interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  excerpt: string;
}

const fmtPct = (v: number | null | undefined) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

const fmtINR = (v: number) =>
  v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const PageHeader = () => (
  <section className="bg-financial-muted py-12 sm:py-16">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-financial-accent/10 text-financial-accent">
          <Briefcase className="h-6 w-6" />
        </div>
        <Badge variant="secondary" className="text-xs">ONGOING TRACKING</Badge>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">
        Mutual Fund Portfolio Tracker
      </h1>
      <p className="text-muted-foreground max-w-3xl">
        Set your funds once and keep an eye on NAV, performance, overlap, AMC/SEBI updates and news — continuously.
        Want a one-time diagnostic with verdicts instead?{" "}
        <a href="/portfolio-review" className="text-financial-accent font-medium hover:underline">Run a Portfolio Review →</a>
      </p>
    </div>
  </section>
);


// ────────────────────────────────────────────────────────────────────
// Fund search / add box
// ────────────────────────────────────────────────────────────────────
const FundPicker = ({ onAdd }: { onAdd: (f: { code: string; name: string }) => void }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Array<{ schemeCode: string; schemeName: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [estimateMs, setEstimateMs] = useState(0);
  // Bumped whenever the streamed scheme list grows, to re-run the search.
  const [listTick, setListTick] = useState(0);

  useEffect(() => subscribeAmfiUpdates(() => setListTick((t) => t + 1)), []);

  useEffect(() => {
    if (q.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setEstimateMs(estimateAmfiSearchMs(q));
    const t = setTimeout(async () => {
      setLoading(true);
      const r = await searchAmfi(q);
      setResults(
        r.slice(0, 12).map((x) => ({ schemeCode: String(x.schemeCode), schemeName: x.schemeName }))
      );
      setLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [q, listTick]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search fund name (e.g. Parag Parikh Flexi Cap)"
          className="pl-9"
        />
      </div>
      {loading && <FundSearchProgress estimateMs={estimateMs} rows={4} />}
      {results.length > 0 && (
        <div className="border border-border rounded-lg max-h-72 overflow-auto divide-y divide-border bg-background">
          {results.map((r) => (
            <button
              key={r.schemeCode}
              onClick={() => {
                onAdd({ code: r.schemeCode, name: r.schemeName });
                setQ("");
                setResults([]);
              }}
              className="w-full text-left px-3 py-2.5 hover:bg-financial-accent/5 transition-colors flex items-center justify-between gap-3"
            >
              <span className="text-sm truncate">{r.schemeName}</span>
              <Plus className="h-4 w-4 text-financial-accent shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// Portfolio tab — list of tracked funds with SIP editing
// ────────────────────────────────────────────────────────────────────
const PortfolioTab = ({
  funds,
  intel,
  removeFund,
  updateSIP,
  addFund,
}: {
  funds: TrackedFund[];
  intel: Record<string, IntelResult | undefined>;
  removeFund: (code: string) => void;
  updateSIP: (code: string, sip: number) => void;
  addFund: (f: Omit<TrackedFund, "addedAt">) => void;
}) => {
  const totalSIP = funds.reduce((s, f) => s + (f.monthlySIP || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a fund to track</CardTitle>
        </CardHeader>
        <CardContent>
          <FundPicker
            onAdd={(f) => {
              addFund({ code: f.code, name: f.name, monthlySIP: 5000 });
              toast.success("Fund added to tracker");
            }}
          />
        </CardContent>
      </Card>

      {funds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No funds tracked yet. Add your first one above.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your tracked portfolio</CardTitle>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total monthly SIP</div>
              <div className="text-xl font-semibold text-financial-accent">{fmtINR(totalSIP)}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {funds.map((f) => {
              const i = intel[f.code];
              return (
                <div
                  key={f.code}
                  className="border border-border rounded-lg p-4 hover:border-financial-accent/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Code: {f.code}</span>
                        {i?.meta?.schemeCategory && (
                          <Badge variant="outline" className="text-[10px] py-0">{i.meta.schemeCategory}</Badge>
                        )}
                        {i?.returns?.latestNav && (
                          <span>NAV ₹{i.returns.latestNav.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">SIP ₹</span>
                      <Input
                        type="number"
                        value={f.monthlySIP}
                        onChange={(e) => updateSIP(f.code, Number(e.target.value) || 0)}
                        className="w-28 h-9"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFund(f.code)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// Performance tab
// ────────────────────────────────────────────────────────────────────
const PerformanceTab = ({
  funds,
  intel,
  loading,
}: {
  funds: TrackedFund[];
  intel: Record<string, IntelResult | undefined>;
  loading: boolean;
}) => {
  if (funds.length === 0) return <EmptyState msg="Add funds to see performance." />;
  if (loading) return <LoadingGrid />;

  // Estimate peer-rank quintile from alpha (fund - benchmark) when no real peer data is available.
  // 1 = top quintile, 5 = bottom quintile.
  const alphaToQuintile = (alpha: number | null): number | null => {
    if (alpha == null) return null;
    if (alpha >= 5) return 1;
    if (alpha >= 2) return 2;
    if (alpha >= 0) return 3;
    if (alpha >= -2) return 4;
    return 5;
  };

  return (
    <div className="space-y-5">
      {funds.map((f) => {
        const i = intel[f.code];
        if (!i || !i.returns) {
          return (
            <Card key={f.code}>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Could not load returns for {f.name}.
              </CardContent>
            </Card>
          );
        }
        const r = i.returns;
        const b = i.benchmark!.returns;
        const periods = [
          { label: "1Y", fund: r.y1, bench: b.y1 },
          { label: "3Y", fund: r.y3, bench: b.y3 },
          { label: "5Y", fund: r.y5, bench: b.y5 },
          { label: "10Y", fund: r.y10, bench: b.y10 },
        ];
        // Scale shared across all periods so bar lengths are comparable
        const scaleMax = Math.max(
          1,
          ...periods.flatMap((row) => [Math.abs(row.fund ?? 0), Math.abs(row.bench ?? 0)])
        );

        const incPositive = (r.sinceInception ?? 0) >= 0;

        return (
          <Card
            key={f.code}
            className="overflow-hidden rounded-sm border-border shadow-sm hover:shadow-md transition-shadow"
          >
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-border">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-tight">
                    {f.name}
                  </h3>
                  {i.meta?.schemeCategory && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-financial-gold/10 text-financial-gold border border-financial-gold/20">
                      {i.meta.schemeCategory.replace(/scheme\s*-\s*/i, "")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 opacity-70" />
                    Benchmark:&nbsp;<span className="font-medium text-foreground">{i.benchmark!.name}</span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>
                    Inception:&nbsp;<span className="font-medium text-foreground">{r.inceptionYears} yrs ago</span>
                  </span>
                </div>
              </div>

              <div className="text-left lg:text-right shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                  Since Inception
                </p>
                <div className="flex items-baseline lg:justify-end gap-1.5">
                  <span className="text-3xl font-bold text-financial-primary tabular-nums">
                    {fmtPct(r.sinceInception)}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      incPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    CAGR
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">NAV as of {r.asOf}</p>
              </div>
            </div>

            {/* ── Performance matrix ───────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-border">
              {periods.map((row, idx) => {
                const diff =
                  row.fund != null && row.bench != null ? row.fund - row.bench : null;
                // Scale each period independently: the larger of fund/bench fills the track.
                const rowMax = Math.max(
                  Math.abs(row.fund ?? 0),
                  Math.abs(row.bench ?? 0),
                  1
                );
                const fundW =
                  row.fund != null ? Math.min(100, (Math.abs(row.fund) / rowMax) * 100) : 0;
                const benchW =
                  row.bench != null ? Math.min(100, (Math.abs(row.bench) / rowMax) * 100) : 0;

                const fundNeg = (row.fund ?? 0) < 0;
                const benchNeg = (row.bench ?? 0) < 0;
                const positive = diff != null && diff >= 0;
                const quintile = alphaToQuintile(diff);

                // Single-bar geometry: fund segment + benchmark overshoot/undershoot
                const minW = Math.min(fundW, benchW);
                const overW = Math.abs(fundW - benchW);
                const fundLeads = fundW >= benchW;

                return (
                  <div
                    key={row.label}
                    className={`p-4 sm:p-5 ${
                      idx < periods.length - 1 ? "lg:border-r border-border" : ""
                    } ${idx % 2 === 0 ? "border-r lg:border-r" : ""} ${
                      idx < 2 ? "border-b lg:border-b-0" : ""
                    } border-border`}
                  >
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      {row.label} Return
                    </p>

                    <div className="flex justify-between items-end mb-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Fund</p>
                        <p
                          className={`text-lg font-bold tabular-nums ${
                            fundNeg ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                          }`}
                        >
                          {fmtPct(row.fund)}
                        </p>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <p
                          className={`text-[10px] uppercase font-semibold ${
                            diff == null
                              ? "text-muted-foreground"
                              : positive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          Alpha
                        </p>
                        <p
                          className={`text-sm font-bold tabular-nums ${
                            diff == null
                              ? "text-muted-foreground"
                              : positive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {diff == null ? "—" : `${positive ? "+" : ""}${diff.toFixed(1)}%`}
                        </p>
                      </div>
                    </div>

                    {/* Two stacked bars: fund (accent / rose if negative) and benchmark (muted) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-[9px] uppercase tracking-wider text-muted-foreground shrink-0">Fund</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${fundNeg ? "bg-rose-500/70" : "bg-financial-accent"}`}
                            style={{ width: `${fundW}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-[9px] uppercase tracking-wider text-muted-foreground shrink-0">Bench</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${benchNeg ? "bg-rose-400/50" : "bg-muted-foreground/40"}`}
                            style={{ width: `${benchW}%` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground shrink-0 w-12 text-right">
                          {row.bench != null ? `${row.bench.toFixed(1)}%` : "—"}
                        </span>
                      </div>
                    </div>


                  </div>
                );
              })}
            </div>

            {/* ── Consistency footer ───────────────────────────────── */}
            {i.benchmarkBeats && (
              <div className="bg-financial-muted/40 px-5 sm:px-6 py-3.5 flex flex-wrap items-center gap-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Consistency Score
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  {([
                    { label: "5Y", diff: i.benchmarkBeats.y5 },
                    { label: "10Y", diff: i.benchmarkBeats.y10 },
                    { label: "15Y", diff: i.benchmarkBeats.y15 },
                  ]).map((c, idx, arr) => {
                    const status = c.diff == null ? "na" : c.diff >= 0 ? "beat" : "miss";
                    const dot =
                      status === "beat"
                        ? "bg-emerald-500"
                        : status === "miss"
                        ? "bg-rose-500"
                        : "bg-border";
                    return (
                      <React.Fragment key={c.label}>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${dot}`} />
                          <span className="text-[11px] font-bold text-foreground tabular-nums">
                            {c.label}{" "}
                            {status === "beat" ? "BEAT" : status === "miss" ? "MISS" : "N/A"}
                          </span>
                          {c.diff != null && (
                            <span
                              className={`text-[10px] tabular-nums ${
                                status === "beat"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {c.diff >= 0 ? `+${c.diff.toFixed(1)}%` : `${c.diff.toFixed(1)}%`}
                            </span>
                          )}
                        </div>
                        {idx < arr.length - 1 && <span className="w-px h-3 bg-border" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};



// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────
// Current Holdings tab — latest snapshot, no diff
// ────────────────────────────────────────────────────────────────────
const inferSubCat = (name: string, category?: string | null): string => {
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

const CurrentHoldingsTab = ({
  funds,
  intel,
}: {
  funds: TrackedFund[];
  intel: Record<string, IntelResult | undefined>;
}) => {
  if (funds.length === 0) return <EmptyState msg="Add funds to view current holdings." />;
  return (
    <div className="space-y-4">
      <Card className="bg-financial-muted">
        <CardContent className="py-4 flex items-start gap-3">
          <CircleDot className="h-5 w-5 text-financial-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Latest disclosed holdings</p>
            <p className="text-muted-foreground mt-1">
              Top stocks each fund currently owns. Use this to know what you're actually invested in.
            </p>
          </div>
        </CardContent>
      </Card>
      {funds.map((f) => {
        const i = intel[f.code];
        const synthetic = {
          schemeCode: f.code,
          schemeName: f.name,
          subCategory: inferSubCat(f.name, i?.meta?.schemeCategory),
          category: "Equity",
        } as MutualFundInfo;
        const holdings = getFundHoldings(synthetic, 10);
        return (
          <Card key={f.code}>
            <CardHeader>
              <CardTitle className="text-base">{f.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Top 10 holdings {i?.meta?.schemeCategory ? `• ${i.meta.schemeCategory}` : ""}
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                      <th className="py-2 pr-3">Stock</th>
                      <th className="py-2 pr-3">Sector</th>
                      <th className="py-2 pr-3 text-right">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => (
                      <tr key={h.symbol} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-3">
                          <div className="font-medium">{h.symbol}</div>
                          <div className="text-xs text-muted-foreground">{h.name}</div>
                        </td>
                        <td className="py-2.5 pr-3">
                          <Badge variant="outline" className="text-[10px]">{h.sector}</Badge>
                        </td>
                        <td className="py-2.5 pr-3 text-right font-semibold">{h.weight.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// Fund Updates tab — AMC / SEBI / manager / strategy news
// ────────────────────────────────────────────────────────────────────
const UPDATE_KEYWORDS = /\b(sebi|amc|fund manager|appointed|resign|reclassif|merger|merge|name change|exit load|expense ratio|strategy|mandate|amend|tenure|wind[- ]?up|side[- ]?pocket|categori[sz]ation)\b/i;

const classifyUpdate = (title: string, excerpt: string): { tag: string; tone: string } => {
  const text = `${title} ${excerpt}`.toLowerCase();
  if (/sebi|regulator|reclassif|categori[sz]ation/.test(text)) return { tag: "Regulatory", tone: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300" };
  if (/manager|appointed|resign|exit|tenure/.test(text)) return { tag: "Manager", tone: "bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300" };
  if (/merger|merge|name change|wind[- ]?up/.test(text)) return { tag: "Scheme Change", tone: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300" };
  if (/strategy|mandate|amend|objective/.test(text)) return { tag: "Strategy", tone: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" };
  if (UPDATE_KEYWORDS.test(text)) return { tag: "AMC Update", tone: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" };
  return { tag: "News", tone: "bg-muted text-muted-foreground" };
};

const FundUpdatesTab = ({ funds }: { funds: TrackedFund[] }) => {
  const [news, setNews] = useState<Record<string, NewsItem[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (funds.length === 0) {
      setNews({});
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("mf-news-by-fund", {
          body: { funds: funds.map((f) => f.name), perFund: 10 },
        });
        if (cancelled) return;
        if (error) {
          toast.error("Failed to load fund updates");
          setNews({});
        } else {
          const map: Record<string, NewsItem[]> = {};
          (data?.results || []).forEach((r: { fund: string; items: NewsItem[] }) => {
            const seen = new Set<string>();
            const deduped = (r.items || []).filter((it) => {
              const key = (it.url || "").split("?")[0] + "|" + (it.title || "").toLowerCase().replace(/\s+/g, " ").trim();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            deduped.sort((a, b) => {
              const ta = new Date(a.publishedAt).getTime() || 0;
              const tb = new Date(b.publishedAt).getTime() || 0;
              return tb - ta;
            });
            map[r.fund] = deduped;
          });
          setNews(map);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [funds]);

  if (funds.length === 0) return <EmptyState msg="Add funds to track updates." />;
  if (loading) return <LoadingGrid />;

  return (
    <div className="space-y-4">
      <Card className="bg-financial-muted">
        <CardContent className="py-4 flex items-start gap-3">
          <Megaphone className="h-5 w-5 text-financial-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Updates & news for your funds</p>
            <p className="text-muted-foreground mt-1">
              One combined feed — AMC announcements, SEBI actions, manager moves, strategy amendments and general fund news. Each item is tagged so you can scan what matters.
            </p>
          </div>
        </CardContent>
      </Card>
      {funds.map((f) => {
        const items = news[f.name] || [];
        return (
          <Card key={f.code}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-financial-accent" />
                {f.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent updates or news found for this fund.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((n) => {
                    const cls = classifyUpdate(n.title, n.excerpt);
                    return (
                      <a
                        key={n.url}
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-border rounded-lg p-3 hover:border-financial-accent/40 hover:bg-financial-accent/5 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cls.tone}`}>
                                {cls.tag}
                              </span>
                            </div>
                            <div className="text-sm font-medium group-hover:text-financial-accent transition-colors">
                              {n.title}
                            </div>
                            {n.excerpt && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.excerpt}</p>
                            )}
                            <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-2">
                              <span className="font-medium">{n.source}</span>
                              <span>•</span>
                              <span>{new Date(n.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-financial-accent shrink-0 mt-0.5" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────
const EmptyState = ({ msg }: { msg: string }) => (
  <Card>
    <CardContent className="py-12 text-center text-muted-foreground">{msg}</CardContent>
  </Card>
);

const LoadingGrid = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <Skeleton key={i} className="h-32 w-full" />
    ))}
  </div>
);

// ────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────
const MutualFundTracker = () => {
  const { funds, addFund, removeFund, updateSIP } = useTrackedFunds();
  const [intel, setIntel] = useState<Record<string, IntelResult | undefined>>({});
  const [loadingIntel, setLoadingIntel] = useState(false);

  // Warm AMFI scheme list so the first search keystroke isn't a cold start.
  useEffect(() => { prewarmAmfiSearch(); }, []);



  const codes = useMemo(() => funds.map((f) => f.code), [funds]);

  useEffect(() => {
    if (codes.length === 0) {
      setIntel({});
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingIntel(true);
      try {
        const { data, error } = await supabase.functions.invoke("mf-intel", {
          body: { codes, includeVR: false },
        });
        if (cancelled) return;
        if (error) {
          toast.error("Failed to load fund intel");
        } else {
          const map: Record<string, IntelResult> = {};
          (data?.results || []).forEach((r: IntelResult) => (map[r.code] = r));
          setIntel(map);
        }
      } finally {
        if (!cancelled) setLoadingIntel(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [codes.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageLayout>
      <PortfolioModeOnboarding />
      <PageHeader />
      <section className="py-10 sm:py-14 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-6">
            <ReviewVsTrackerChecklist active="tracker" />
          </div>

          <Tabs defaultValue="portfolio" className="w-full">
            <div className="overflow-x-auto mb-6">
              <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-auto flex-wrap p-1 gap-1">
                <TabsTrigger value="portfolio" className="text-xs sm:text-sm">Portfolio</TabsTrigger>
                <TabsTrigger value="insights" className="text-xs sm:text-sm">Insights</TabsTrigger>
                <TabsTrigger value="holdings" className="text-xs sm:text-sm">Holdings</TabsTrigger>
                <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
                <TabsTrigger value="updates" className="text-xs sm:text-sm">Updates & News</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="portfolio">
              <PortfolioTab
                funds={funds}
                intel={intel}
                removeFund={removeFund}
                updateSIP={updateSIP}
                addFund={addFund}
              />
            </TabsContent>

            <TabsContent value="insights">
              <InsightsDashboard funds={funds} intel={intel} />
            </TabsContent>

            <TabsContent value="holdings">
              <CurrentHoldingsTab funds={funds} intel={intel} />
            </TabsContent>

            <TabsContent value="performance">
              <PerformanceTab funds={funds} intel={intel} loading={loadingIntel} />
            </TabsContent>

            <TabsContent value="updates">
              <FundUpdatesTab funds={funds} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </PageLayout>
  );
};

export default MutualFundTracker;
