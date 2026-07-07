import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Tiny helper: wraps a percentile label with a hover/tap tooltip explaining it.
const PCT_HELP: Record<string, string> = {
  P5: "5th percentile — only ~5 out of 100 simulated outcomes finish worse than this. The 'bad case'.",
  P25: "25th percentile — 1 in 4 outcomes finish below this. Bottom edge of the 'likely' range.",
  P50: "50th percentile (median) — half of outcomes land above, half below. The 'most likely' middle.",
  P75: "75th percentile — 3 in 4 outcomes finish below this. Top edge of the 'likely' range.",
  P95: "95th percentile — only ~5 out of 100 simulated outcomes finish better than this. The 'best case'.",
};
const PTip = ({ p, children, className }: { p: keyof typeof PCT_HELP; children: React.ReactNode; className?: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span tabIndex={0} className={`underline decoration-dotted decoration-1 underline-offset-2 cursor-help outline-none ${className ?? ""}`}>
        {children}
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
      {PCT_HELP[p]}
    </TooltipContent>
  </Tooltip>
);
import {
  Sparkles, Plus, Trash2, Search, Loader2, AlertTriangle,
  CheckCircle2, ArrowRightLeft, MinusCircle, XCircle, TrendingUp, Activity, ArrowRight,
  Info, ChevronDown,
} from "lucide-react";
import { searchAmfi, prewarmAmfiSearch, estimateAmfiSearchMs, subscribeAmfiUpdates } from "@/lib/amfiSearch";
import { FundSearchProgress } from "@/components/portfolio/FundSearchProgress";
import { inferFundHouse, inferSubCategory } from "@/lib/amfiSearch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PortfolioModeOnboarding from "@/components/portfolio/PortfolioModeOnboarding";
import ReviewVsTrackerChecklist from "@/components/portfolio/ReviewVsTrackerChecklist";


type RiskProfile = "Conservative" | "Moderate" | "Aggressive";

interface SelectedFund {
  schemeCode: string;
  schemeName: string;
  category: string;
  subCategory: string;
  fundHouse: string;
  monthlySip: number;
}

interface ReviewResponse {
  healthScore: number;
  headline: string;
  keyActions: string[];
  allocation: {
    currentEquityPct: number;
    currentDebtPct: number;
    currentHybridPct: number;
    currentOtherPct: number;
    recommendedEquityPct: number;
    recommendedDebtPct: number;
    recommendedHybridPct: number;
    allocationComment: string;
  };
  diversification: {
    overlapRisk: "Low" | "Moderate" | "High";
    redundantFunds: string[];
    comment: string;
  };
  fundVerdicts: Array<{
    schemeName: string;
    verdict: "Keep" | "Reduce" | "Exit" | "Switch";
    reasoning: string;
    suggestedReplacement: string;
    suggestedSipChange: string;
  }>;
}

const DEBT_SUBS = new Set([
  "Liquid", "Short Duration", "Long Duration", "Gilt", "Corporate Bond",
  "Banking & PSU", "Ultra Short Duration", "Medium Duration",
]);
const HYBRID_SUBS = new Set([
  "Aggressive Hybrid", "Conservative Hybrid", "Arbitrage",
  "Balanced Advantage", "Multi Asset Allocation",
]);

const categoryOf = (sub: string): string =>
  DEBT_SUBS.has(sub) ? "Debt" : HYBRID_SUBS.has(sub) ? "Hybrid" : "Equity";

const verdictStyle = (v: string) => {
  switch (v) {
    case "Keep":   return { icon: CheckCircle2,    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50" };
    case "Reduce": return { icon: MinusCircle,     cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50" };
    case "Switch": return { icon: ArrowRightLeft,  cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50" };
    case "Exit":   return { icon: XCircle,         cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50" };
    default:       return { icon: CheckCircle2,    cls: "bg-muted text-muted-foreground border-border" };
  }
};

const FundSearchPicker = ({
  onPick, disabled,
}: { onPick: (f: Omit<SelectedFund, "monthlySip">) => void; disabled?: boolean }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ schemeCode: string; schemeName: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [estimateMs, setEstimateMs] = useState(0);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // Bumped whenever streamed scheme list grows, to re-run the search.
  const [listTick, setListTick] = useState(0);

  useEffect(() => subscribeAmfiUpdates(() => setListTick((t) => t + 1)), []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) { setResults([]); setLoading(false); return; }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setEstimateMs(estimateAmfiSearchMs(q));
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const hits = await searchAmfi(q, ctrl.signal);
        setResults(hits.slice(0, 30).map(h => ({ schemeCode: String(h.schemeCode), schemeName: h.schemeName })));
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => { clearTimeout(handle); ctrl.abort(); };
  }, [query, listTick]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search your fund (e.g. 'parag parikh flexi cap')"
          className="pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {loading && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-3 shadow-lg">
          <FundSearchProgress estimateMs={estimateMs} rows={4} />
        </div>
      )}
      {!loading && open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-md border bg-popover shadow-lg">
          {results.map(r => {
            const sub = inferSubCategory(r.schemeName);
            return (
              <button
                key={r.schemeCode}
                type="button"
                onClick={() => {
                  onPick({
                    schemeCode: r.schemeCode,
                    schemeName: r.schemeName,
                    subCategory: sub,
                    category: categoryOf(sub),
                    fundHouse: inferFundHouse(r.schemeName),
                  });
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 border-b last:border-b-0 flex items-center justify-between gap-2"
              >
                <span className="truncate">{r.schemeName}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{sub}</Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AllocationBar = ({
  label, currentPct, recommendedPct, color,
}: { label: string; currentPct: number; recommendedPct?: number; color: string }) => (
  <div>
    <div className="flex items-center justify-between text-xs mb-1.5">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">
        Now <span className="font-semibold text-foreground">{currentPct.toFixed(0)}%</span>
        {typeof recommendedPct === "number" && (
          <> · Target <span className="font-semibold text-foreground">{recommendedPct.toFixed(0)}%</span></>
        )}
      </span>
    </div>
    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
      <div className={`absolute inset-y-0 left-0 ${color}`} style={{ width: `${Math.min(100, currentPct)}%` }} />
      {typeof recommendedPct === "number" && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground"
          style={{ left: `${Math.min(100, recommendedPct)}%` }}
          title={`Target ${recommendedPct}%`}
        />
      )}
    </div>
  </div>
);

const REVIEW_FUNDS_KEY = "moneva.reviewFunds.v1";
const TRACKER_FUNDS_KEY = "moneva.trackedFunds.v1";

const PortfolioReviewPage = () => {
  const navigate = useNavigate();
  const [funds, setFunds] = useState<SelectedFund[]>(() => {
    // Load saved review funds, then merge in any tracker funds not yet present.
    try {
      const own: SelectedFund[] = JSON.parse(localStorage.getItem(REVIEW_FUNDS_KEY) || "[]");
      const codes = new Set(own.map((f) => f.schemeCode));
      const tracked: Array<{ code: string; name: string; monthlySIP?: number }> = JSON.parse(
        localStorage.getItem(TRACKER_FUNDS_KEY) || "[]"
      );
      const fromTracker = tracked
        .filter((t) => !codes.has(t.code))
        .map((t) => {
          const sub = inferSubCategory(t.name);
          return {
            schemeCode: t.code,
            schemeName: t.name,
            subCategory: sub,
            category: categoryOf(sub),
            fundHouse: inferFundHouse(t.name),
            monthlySip: t.monthlySIP || 5000,
          } as SelectedFund;
        });
      return [...own, ...fromTracker];
    } catch {
      return [];
    }
  });
  const [risk, setRisk] = useState<RiskProfile>("Moderate");
  const [horizon, setHorizon] = useState<string>("10");
  const [goal, setGoal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [showBench, setShowBench] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  // Warm the AMFI scheme list on the edge function so the first keystroke
  // doesn't pay the cold-start cost of fetching ~30k schemes.
  useEffect(() => { prewarmAmfiSearch(); }, []);

  // Persist review funds so they survive reload and can sync into Tracker.
  useEffect(() => {
    try { localStorage.setItem(REVIEW_FUNDS_KEY, JSON.stringify(funds)); } catch { /* ignore */ }
  }, [funds]);



  const sendToTracker = () => {
    if (funds.length === 0) return;
    try {
      const existingRaw = localStorage.getItem("moneva.trackedFunds.v1");
      const existing: Array<{ code: string }> = existingRaw ? JSON.parse(existingRaw) : [];
      const existingCodes = new Set(existing.map((e) => e.code));
      const merged = [
        ...existing,
        ...funds
          .filter((f) => !existingCodes.has(f.schemeCode))
          .map((f) => ({
            code: f.schemeCode,
            name: f.schemeName,
            monthlySIP: f.monthlySip || 0,
            addedAt: new Date().toISOString(),
          })),
      ];
      localStorage.setItem("moneva.trackedFunds.v1", JSON.stringify(merged));
      toast.success(`${funds.length} fund${funds.length > 1 ? "s" : ""} sent to Portfolio Tracker`);
      navigate("/mutual-fund-tracker");
    } catch {
      toast.error("Could not transfer funds. Please add them manually.");
    }
  };


  const totalSip = useMemo(() => funds.reduce((s, f) => s + (f.monthlySip || 0), 0), [funds]);

  const addFund = (f: Omit<SelectedFund, "monthlySip">) => {
    if (funds.some(x => x.schemeCode === f.schemeCode)) {
      toast.info("Fund already added");
      return;
    }
    if (funds.length >= 25) {
      toast.error("Max 25 funds per review");
      return;
    }
    setFunds(prev => [...prev, { ...f, monthlySip: 5000 }]);
  };

  const updateSip = (code: string, val: string) => {
    const n = Math.max(0, Number(val) || 0);
    setFunds(prev => prev.map(f => f.schemeCode === code ? { ...f, monthlySip: n } : f));
  };

  const removeFund = (code: string) => {
    setFunds(prev => prev.filter(f => f.schemeCode !== code));
  };

  const runReview = async () => {
    if (funds.length === 0) {
      toast.error("Add at least one fund to review");
      return;
    }
    if (totalSip === 0) {
      toast.error("Enter monthly SIP amount for at least one fund");
      return;
    }
    setLoading(true);
    setReview(null);
    try {
      const { data, error } = await supabase.functions.invoke("portfolio-review", {
        body: {
          funds,
          riskProfile: risk,
          primaryGoal: goal || undefined,
          horizonYears: Number(horizon) || undefined,
        },
      });
      if (error) {
        const msg = (error as any)?.context?.error || (error as any)?.message || "Review failed";
        toast.error(typeof msg === "string" ? msg : "Review failed");
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      const r = (data as any)?.review as ReviewResponse | undefined;
      if (!r) {
        toast.error("Could not generate review. Please try again.");
        return;
      }
      setReview(r);
      // scroll into view
      setTimeout(() => {
        document.getElementById("review-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      console.error(e);
      toast.error("Review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "text-emerald-600 dark:text-emerald-400"
    : s >= 60 ? "text-amber-600 dark:text-amber-400"
    : s >= 40 ? "text-orange-600 dark:text-orange-400"
    : "text-rose-600 dark:text-rose-400";

  const scoreLabel = (s: number) =>
    s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Needs Attention" : "Poor";

  return (
    <PageLayout>
      <PortfolioModeOnboarding />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-financial-accent to-financial-accent/70 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 text-[10px]">ONE-TIME REVIEW</Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                Portfolio Review (One-Time)
              </h1>
              <p className="text-muted-foreground">
                A one-time diagnostic of your existing mutual funds. For continuous monitoring of NAV, performance, overlap and AMC updates, use{" "}
                <a href="/mutual-fund-tracker" className="text-financial-accent font-medium hover:underline">Portfolio Tracker</a>.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <ReviewVsTrackerChecklist active="review" />
          </div>


          {/* Input Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="risk">Risk profile</Label>
                  <Select value={risk} onValueChange={(v) => setRisk(v as RiskProfile)}>
                    <SelectTrigger
                      id="risk"
                      className="mt-1.5 h-auto min-h-10 items-start py-2 text-left [&>span]:!line-clamp-2 [&>span]:whitespace-normal [&>span]:text-left [&>span]:leading-tight"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-md">
                      {([
                        { v: "Conservative", tag: "Low risk · 6–8% p.a." },
                        { v: "Moderate",     tag: "Balanced risk · 9–11% p.a." },
                        { v: "Aggressive",   tag: "High risk · 12–15% p.a." },
                      ] as const).map((o) => (
                        <SelectItem key={o.v} value={o.v} className="py-2 pr-3">
                          <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 min-w-0">
                            <span className="font-medium truncate">{o.v}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight break-words">{o.tag}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(() => {
                    const params = {
                      Conservative: { lo: 0.06, hi: 0.08, vol: 0.05, worst1y: -0.08, recoverYrs: 1 },
                      Moderate:     { lo: 0.09, hi: 0.11, vol: 0.12, worst1y: -0.20, recoverYrs: 2 },
                      Aggressive:   { lo: 0.12, hi: 0.15, vol: 0.20, worst1y: -0.38, recoverYrs: 4 },
                    }[risk];
                    const yrs = Math.max(1, Math.min(50, Number(horizon) || 1));
                    const PRINCIPAL = 1_00_000; // ₹1 lakh illustrative
                    const fmtINR = (n: number) =>
                      n >= 1_00_00_000 ? `₹${(n / 1_00_00_000).toFixed(2)} Cr`
                      : n >= 1_00_000   ? `₹${(n / 1_00_000).toFixed(1)} L`
                      : `₹${Math.round(n).toLocaleString("en-IN")}`;
                    const median = PRINCIPAL * Math.pow(1 + (params.lo + params.hi) / 2, yrs);
                    const upVal  = PRINCIPAL * Math.pow(1 + params.hi, yrs);
                    const loVal  = PRINCIPAL * Math.pow(1 + params.lo, yrs);
                    // Probability of ending below capital — lognormal tail, shrinks with √time
                    const pctLossProb = Math.max(
                      risk === "Conservative" ? 1 : 2,
                      Math.round(40 * Math.exp(-yrs / (risk === "Aggressive" ? 8 : risk === "Moderate" ? 5 : 3)))
                    );
                    const horizonFit =
                      risk === "Aggressive" ? (yrs >= 10 ? "Great fit" : yrs >= 5 ? "Tight — be ready for swings" : "Too short for this risk") :
                      risk === "Moderate"   ? (yrs >= 5  ? "Great fit" : yrs >= 3 ? "Acceptable" : "Consider Conservative") :
                                              (yrs <= 5  ? "Great fit" : "Likely under-earning vs Moderate");
                    return (
                      <div className="mt-2 rounded-md border bg-financial-muted/40 px-2.5 py-2 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Over {yrs} yr{yrs > 1 ? "s" : ""} · on ₹1 L invested</span>
                          <span className={horizonFit.startsWith("Great") ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            {horizonFit}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center">
                          <div className="rounded bg-rose-500/10 px-1 py-1">
                            <p className="text-[9px] uppercase tracking-wide text-rose-600 dark:text-rose-400">Bear</p>
                            <p className="text-[11px] font-semibold tabular-nums">{fmtINR(PRINCIPAL * (1 + params.worst1y))}</p>
                          </div>
                          <div className="rounded bg-financial-accent/10 px-1 py-1">
                            <p className="text-[9px] uppercase tracking-wide text-financial-accent">Median</p>
                            <p className="text-[11px] font-semibold tabular-nums">{fmtINR(median)}</p>
                          </div>
                          <div className="rounded bg-emerald-500/10 px-1 py-1">
                            <p className="text-[9px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Bull</p>
                            <p className="text-[11px] font-semibold tabular-nums">{fmtINR(upVal)}</p>
                          </div>
                        </div>
                        <p className="text-[10px] leading-snug text-muted-foreground">
                          Range {fmtINR(loVal)}–{fmtINR(upVal)} at {(params.lo*100).toFixed(0)}–{(params.hi*100).toFixed(0)}% CAGR · ~{pctLossProb}% chance of ending below ₹1 L · bad-year drop ~{Math.abs(params.worst1y*100).toFixed(0)}%
                        </p>

                      </div>
                    );
                  })()}
                </div>
                <div>
                  <Label htmlFor="horizon">Investment horizon (years)</Label>
                  <Input
                    id="horizon" type="number" min={1} max={50}
                    value={horizon} onChange={(e) => setHorizon(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="goal">Primary goal (optional)</Label>
                  <Input
                    id="goal" value={goal} onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Retirement, child education"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Scenario projection chart */}
              {(() => {
                const params = {
                  Conservative: { base: 0.07,  vol: 0.05, benchBase: 0.065, benchName: "CRISIL Composite Bond" },
                  Moderate:     { base: 0.10,  vol: 0.12, benchBase: 0.085, benchName: "Nifty 50 Hybrid" },
                  Aggressive:   { base: 0.135, vol: 0.20, benchBase: 0.115, benchName: "Nifty 500 TRI" },
                }[risk];
                const yrs = Math.max(1, Math.min(50, Number(horizon) || 1));
                // Lognormal percentiles per year
                const Z = { p05: -1.645, p25: -0.674, p50: 0, p75: 0.674, p95: 1.645 };
                const mu = Math.log(1 + params.base) - (params.vol * params.vol) / 2;
                const muB = Math.log(1 + params.benchBase) - (params.vol * params.vol) / 2;
                const pct = (t: number, z: number, m = mu) =>
                  Math.exp(m * t + params.vol * Math.sqrt(Math.max(t, 0)) * z);
                const data = Array.from({ length: yrs + 1 }, (_, t) => ({
                  t,
                  dn:   pct(t, Z.p05),
                  p25:  pct(t, Z.p25),
                  base: pct(t, Z.p50),
                  p75:  pct(t, Z.p75),
                  up:   pct(t, Z.p95),
                  bench:    pct(t, Z.p50, muB),
                  benchDn:  pct(t, Z.p05, muB),
                  benchUp:  pct(t, Z.p95, muB),
                }));
                const allMax = showBench
                  ? Math.max(...data.map(d => Math.max(d.up, d.benchUp)))
                  : Math.max(...data.map(d => d.up));
                const allMin = showBench
                  ? Math.min(0.85, ...data.map(d => Math.min(d.dn, d.benchDn)))
                  : Math.min(0.85, ...data.map(d => d.dn));
                const maxY = allMax * 1.05;
                const minY = allMin;
                const W = 720, H = 260, PL = 48, PR = 18, PT = 16, PB = 32;
                const innerW = W - PL - PR, innerH = H - PT - PB;
                const xFor = (t: number) => PL + (t / yrs) * innerW;
                const yFor = (v: number) => PT + innerH - ((v - minY) / (maxY - minY)) * innerH;
                const lineFor = (key: keyof typeof data[0]) =>
                  data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(d.t).toFixed(1)} ${yFor(d[key] as number).toFixed(1)}`).join(" ");
                const bandPath = (hiK: keyof typeof data[0], loK: keyof typeof data[0]) =>
                  data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(d.t).toFixed(1)} ${yFor(d[hiK] as number).toFixed(1)}`).join(" ") +
                  " " +
                  [...data].reverse().map((d) => `L ${xFor(d.t).toFixed(1)} ${yFor(d[loK] as number).toFixed(1)}`).join(" ") +
                  " Z";
                const yTicks = 4;
                const ticks = Array.from({ length: yTicks + 1 }, (_, i) => minY + (i / yTicks) * (maxY - minY));
                // Fewer x ticks so labels never collide on mobile
                const xTickStep = Math.max(1, Math.ceil(yrs / 6));
                const final = data[data.length - 1];
                // Table rows — show key milestones to keep it tidy
                const tableSteps = (() => {
                  const milestones = new Set<number>([1, yrs]);
                  [3, 5, 7, 10, 15, 20, 25, 30].forEach(y => { if (y < yrs) milestones.add(y); });
                  return [...milestones].sort((a, b) => a - b);
                })();
                const fmt = (v: number) => v.toFixed(2) + "×";
                return (
                  <div className="rounded-lg border bg-financial-muted/30 p-4 space-y-3">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Scenario projection · {risk} · {yrs} yr{yrs > 1 ? "s" : ""}</p>
                        <p className="text-[11px] text-muted-foreground">Wealth multiple on ₹1 invested · shaded bands = likelihood ranges</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-financial-accent/15 border border-financial-accent/30" /><PTip p="P5">5</PTip>–<PTip p="P95">95</PTip>% range</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-financial-accent/35 border border-financial-accent/50" /><PTip p="P25">25</PTip>–<PTip p="P75">75</PTip>% range</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-financial-accent" />Base (<PTip p="P50">P50</PTip>)</span>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={showBench}
                            onChange={(e) => setShowBench(e.target.checked)}
                            className="h-3 w-3 accent-foreground"
                          />
                          Overlay {params.benchName}
                        </label>
                      </div>
                    </div>
                    <div className="relative w-full">
                      <svg
                        viewBox={`0 0 ${W} ${H}`}
                        className="w-full h-auto block aspect-[16/7] sm:aspect-[16/6] touch-none"
                        preserveAspectRatio="xMidYMid meet"
                        onMouseLeave={() => setHoverYear(null)}
                        onMouseMove={(e) => {
                          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                          const px = ((e.clientX - rect.left) / rect.width) * W;
                          const t = Math.round(((px - PL) / innerW) * yrs);
                          setHoverYear(Math.max(0, Math.min(yrs, t)));
                        }}
                        onTouchStart={(e) => {
                          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                          const px = ((e.touches[0].clientX - rect.left) / rect.width) * W;
                          const t = Math.round(((px - PL) / innerW) * yrs);
                          setHoverYear(Math.max(0, Math.min(yrs, t)));
                        }}
                        onTouchMove={(e) => {
                          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                          const px = ((e.touches[0].clientX - rect.left) / rect.width) * W;
                          const t = Math.round(((px - PL) / innerW) * yrs);
                          setHoverYear(Math.max(0, Math.min(yrs, t)));
                        }}
                        onTouchEnd={() => setHoverYear(null)}
                      >
                        {ticks.map((v, i) => (
                          <g key={i}>
                            <line x1={PL} x2={W - PR} y1={yFor(v)} y2={yFor(v)} className="stroke-border" strokeDasharray="2 3" />
                            <text x={PL - 8} y={yFor(v) + 4} textAnchor="end" className="fill-muted-foreground" fontSize="12">
                              {v.toFixed(1)}×
                            </text>
                          </g>
                        ))}
                        {data.filter(d => d.t % xTickStep === 0 || d.t === yrs).map((d) => (
                          <text key={d.t} x={xFor(d.t)} y={H - 10} textAnchor="middle" className="fill-muted-foreground" fontSize="12">
                            {d.t}y
                          </text>
                        ))}
                        {/* Probability bands */}
                        <path d={bandPath("up", "dn")}   className="fill-financial-accent/15" />
                        <path d={bandPath("p75", "p25")} className="fill-financial-accent/30" />
                        <path d={lineFor("dn")}   fill="none" className="stroke-rose-500"        strokeWidth={1.25} strokeDasharray="3 3" />
                        <path d={lineFor("up")}   fill="none" className="stroke-emerald-500"     strokeWidth={1.25} strokeDasharray="3 3" />
                        <path d={lineFor("base")} fill="none" className="stroke-financial-accent" strokeWidth={2} />
                        {showBench && (
                          <>
                            <path d={bandPath("benchUp", "benchDn")} className="fill-muted-foreground/10" />
                            <path d={lineFor("bench")} fill="none" className="stroke-muted-foreground" strokeWidth={1.75} strokeDasharray="5 3" />
                            <circle cx={xFor(yrs)} cy={yFor(final.bench)} r={3} className="fill-muted-foreground" />
                          </>
                        )}
                        {(["up","base","dn"] as const).map((k) => (
                          <circle key={k} cx={xFor(yrs)} cy={yFor(final[k])} r={3}
                            className={k === "up" ? "fill-emerald-500" : k === "base" ? "fill-financial-accent" : "fill-rose-500"} />
                        ))}
                        {/* Hover crosshair + dots */}
                        {hoverYear !== null && (() => {
                          const h = data[hoverYear];
                          const cx = xFor(hoverYear);
                          return (
                            <g pointerEvents="none">
                              <line x1={cx} x2={cx} y1={PT} y2={H - PB} className="stroke-foreground/40" strokeDasharray="2 2" />
                              <circle cx={cx} cy={yFor(h.up)}   r={3} className="fill-emerald-500" />
                              <circle cx={cx} cy={yFor(h.p75)}  r={2} className="fill-financial-accent/70" />
                              <circle cx={cx} cy={yFor(h.base)} r={3.5} className="fill-financial-accent stroke-background" strokeWidth={1} />
                              <circle cx={cx} cy={yFor(h.p25)}  r={2} className="fill-financial-accent/70" />
                              <circle cx={cx} cy={yFor(h.dn)}   r={3} className="fill-rose-500" />
                              {showBench && <circle cx={cx} cy={yFor(h.bench)} r={3} className="fill-muted-foreground" />}
                            </g>
                          );
                        })()}
                      </svg>
                      {/* HTML tooltip */}
                      {hoverYear !== null && (() => {
                        const h = data[hoverYear];
                        // Clamp tooltip horizontally so it never overflows the container
                        const leftPct = Math.max(4, Math.min(96, (xFor(hoverYear) / W) * 100));
                        const flip = leftPct > 55;
                        return (
                          <div
                            className="pointer-events-none absolute top-1 sm:top-2 z-10 rounded-md border bg-background/95 backdrop-blur px-2 sm:px-2.5 py-1.5 sm:py-2 shadow-md text-[10px] sm:text-[11px] w-[150px] sm:w-[180px] max-w-[70vw]"
                            style={{
                              left: `${leftPct}%`,
                              transform: flip ? "translateX(calc(-100% - 6px))" : "translateX(6px)",
                            }}
                          >
                            <div className="font-semibold mb-1">Year {hoverYear}</div>
                            <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5">
                              <span className="text-emerald-500">P95 · Up</span><span className="text-right tabular-nums">{fmt(h.up)}</span>
                              <span className="text-muted-foreground">P75</span><span className="text-right tabular-nums">{fmt(h.p75)}</span>
                              <span className="text-financial-accent font-medium">P50 · Base</span><span className="text-right tabular-nums font-medium">{fmt(h.base)}</span>
                              <span className="text-muted-foreground">P25</span><span className="text-right tabular-nums">{fmt(h.p25)}</span>
                              <span className="text-rose-500">P5 · Down</span><span className="text-right tabular-nums">{fmt(h.dn)}</span>
                              {showBench && (
                                <>
                                  <span className="text-muted-foreground border-t pt-0.5 mt-0.5">Bench</span>
                                  <span className="text-right tabular-nums border-t pt-0.5 mt-0.5">{fmt(h.bench)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Legend & explanation — collapsed by default */}
                    <details className="group rounded-md border bg-background/60 text-[11px] leading-snug">
                      <summary className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer list-none select-none text-muted-foreground hover:text-foreground">
                        <Info className="h-3.5 w-3.5" />
                        <span className="font-medium">Legend &amp; how to read this chart</span>
                        <ChevronDown className="h-3.5 w-3.5 ml-auto transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="px-3 pb-2 pt-1 space-y-1.5 border-t">
                        <ul className="space-y-1 text-muted-foreground">
                          <li><span className="text-emerald-500 font-medium"><PTip p="P95">P95</PTip> (Upside)</span> — only ~5% of outcomes do better than this line.</li>
                          <li><span className="font-medium"><PTip p="P75">P75</PTip>–<PTip p="P25">P25</PTip> band</span> — the middle 50% of outcomes (darker shade).</li>
                          <li><span className="text-financial-accent font-medium"><PTip p="P50">P50</PTip> (Base)</span> — the median: half of paths land above, half below.</li>
                          <li><span className="text-rose-500 font-medium"><PTip p="P5">P5</PTip> (Downside)</span> — only ~5% of outcomes do worse than this line.</li>
                          <li>
                            <span className="text-muted-foreground font-medium">Benchmark ({params.benchName})</span> — the <PTip p="P50">P50</PTip> path of the category index assuming {(params.benchBase * 100).toFixed(1)}% CAGR
                            and similar volatility ({(params.vol * 100).toFixed(0)}%). The gap to your Base line is the alpha your fund mix needs to deliver.
                          </li>
                        </ul>
                        <p className="text-[10px] text-muted-foreground/80 pt-1 border-t">
                          Model: lognormal returns with {(params.base * 100).toFixed(1)}% expected CAGR, {(params.vol * 100).toFixed(0)}% annual volatility. Percentiles widen with √time. Illustrative only — not a guarantee.
                        </p>
                      </div>
                    </details>

                    {/* Summary tiles with probability labels */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md border bg-background/60 px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Downside · ~5% chance worse</p>
                        <p className="text-sm font-semibold text-rose-500">{fmt(final.dn)}</p>
                      </div>
                      <div className="rounded-md border bg-background/60 px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Base · 50/50</p>
                        <p className="text-sm font-semibold text-financial-accent">{fmt(final.base)}</p>
                      </div>
                      <div className="rounded-md border bg-background/60 px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Upside · ~5% chance better</p>
                        <p className="text-sm font-semibold text-emerald-500">{fmt(final.up)}</p>
                      </div>
                    </div>
                    {/* Year-by-year table */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-muted-foreground">Year-by-year breakdown</p>
                        <button
                          type="button"
                          onClick={() => setShowTable(v => !v)}
                          className="text-[11px] text-financial-accent hover:underline"
                        >
                          {showTable ? "Hide" : "Show"}
                        </button>
                      </div>
                      {showTable && (
                        <>
                          <div className="overflow-x-auto rounded-md border bg-background/60">
                            <table className="w-full text-[11px]">
                              <thead className="bg-financial-muted/50 text-muted-foreground">
                                <tr>
                                  <th rowSpan={2} className="text-left px-2 py-1.5 font-medium align-bottom">Year</th>
                                  <th rowSpan={2} className="text-right px-2 py-1.5 font-medium text-rose-500 align-bottom">
                                    Bad case<div className="text-[9px] font-normal opacity-70">worst 5%</div>
                                  </th>
                                  <th colSpan={3} className="text-center px-2 pt-1.5 pb-0 font-medium border-l">Likely range (middle 50%)</th>
                                  <th rowSpan={2} className="text-right px-2 py-1.5 font-medium text-emerald-500 align-bottom border-l">
                                    Best case<div className="text-[9px] font-normal opacity-70">top 5%</div>
                                  </th>
                                  {showBench && <th rowSpan={2} className="text-right px-2 py-1.5 font-medium text-muted-foreground align-bottom border-l">Bench</th>}
                                </tr>
                                <tr>
                                  <th className="text-right px-2 pb-1.5 font-normal text-[10px] border-l">Low<div className="opacity-60"><PTip p="P25">P25</PTip></div></th>
                                  <th className="text-right px-2 pb-1.5 font-medium text-financial-accent">Most likely<div className="text-[10px] font-normal opacity-70"><PTip p="P50">median</PTip></div></th>
                                  <th className="text-right px-2 pb-1.5 font-normal text-[10px]">High<div className="opacity-60"><PTip p="P75">P75</PTip></div></th>
                                </tr>
                              </thead>
                              <tbody>
                                {tableSteps.map(y => {
                                  const r = data[y];
                                  return (
                                    <tr key={y} className="border-t">
                                      <td className="px-2 py-1.5">{y}y</td>
                                      <td className="px-2 py-1.5 text-right text-rose-500">{fmt(r.dn)}</td>
                                      <td className="px-2 py-1.5 text-right border-l">{fmt(r.p25)}</td>
                                      <td className="px-2 py-1.5 text-right text-financial-accent font-medium">{fmt(r.base)}</td>
                                      <td className="px-2 py-1.5 text-right">{fmt(r.p75)}</td>
                                      <td className="px-2 py-1.5 text-right text-emerald-500 border-l">{fmt(r.up)}</td>
                                      {showBench && <td className="px-2 py-1.5 text-right text-muted-foreground border-l">{fmt(r.bench)}</td>}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug px-1">
                            Numbers are multiples of money invested (e.g. <span className="font-medium">2.0×</span> on ₹1 L = ₹2 L).
                            Out of 100 simulations: <span className="text-rose-500">~5 end below Bad case</span> · <span>50 land inside the Likely range</span> · <span className="text-emerald-500">~5 finish above Best case</span>.
                          </p>
                        </>
                      )}

                    </div>
                  </div>
                );
              })()}

              {/* Add fund */}
              <div>
                <Label>Add a fund</Label>
                <div className="mt-1.5">
                  <FundSearchPicker onPick={addFund} disabled={loading} />
                </div>
              </div>

              {/* Selected funds */}
              {funds.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{funds.length} fund{funds.length > 1 ? "s" : ""} added</span>
                    <span className="text-muted-foreground">Total monthly SIP: <span className="font-semibold text-foreground">₹{totalSip.toLocaleString("en-IN")}</span></span>
                  </div>
                  <div className="border rounded-lg divide-y overflow-hidden">
                    {funds.map(f => (
                      <div key={f.schemeCode} className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{f.schemeName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">{f.category}</Badge>
                            <Badge variant="outline" className="text-[10px]">{f.subCategory}</Badge>
                            <span className="text-[11px] text-muted-foreground truncate">{f.fundHouse}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-sm text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            min={0}
                            value={f.monthlySip || ""}
                            onChange={(e) => updateSip(f.schemeCode, e.target.value)}
                            className="w-28 h-9"
                            placeholder="Monthly SIP"
                          />
                          <span className="text-xs text-muted-foreground hidden sm:inline">/mo</span>
                        </div>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => removeFund(f.schemeCode)}
                          className="text-muted-foreground hover:text-rose-600 shrink-0"
                          aria-label="Remove fund"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                  Search and add the funds you currently invest in. We'll review allocation, performance fit, and overlap.
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <Button
                  onClick={runReview}
                  disabled={loading || funds.length === 0}
                  className="bg-financial-accent hover:bg-financial-accent/90 text-white gap-2"
                  size="lg"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing portfolio...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Review my portfolio</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  AI suggestions are educational, not investment advice. Always consult a SEBI-registered advisor before changing investments.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          {review && (
            <div id="review-result" className="space-y-6 scroll-mt-32">
              {/* Summary */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-financial-accent/10 to-transparent border-b">
                  <CardContent className="p-6">
                    <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center">
                      <div className="text-center">
                        <div className={`text-5xl font-bold ${scoreColor(review.healthScore)}`}>
                          {Math.round(review.healthScore)}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                          Health Score
                        </div>
                        <div className={`text-xs font-semibold mt-0.5 ${scoreColor(review.healthScore)}`}>
                          {scoreLabel(review.healthScore)}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-3">
                          {review.headline}
                        </h2>
                        <Progress value={review.healthScore} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                  {/* Key actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-financial-accent" />
                      Top Actions
                    </h3>
                    <ol className="space-y-2">
                      {review.keyActions.map((action, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-financial-accent/15 text-financial-accent text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-foreground">{action}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Allocation */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Asset Allocation vs {risk} Target
                    </h3>
                    <div className="space-y-3">
                      <AllocationBar
                        label="Equity"
                        currentPct={review.allocation.currentEquityPct}
                        recommendedPct={review.allocation.recommendedEquityPct}
                        color="bg-blue-500"
                      />
                      <AllocationBar
                        label="Debt"
                        currentPct={review.allocation.currentDebtPct}
                        recommendedPct={review.allocation.recommendedDebtPct}
                        color="bg-emerald-500"
                      />
                      <AllocationBar
                        label="Hybrid"
                        currentPct={review.allocation.currentHybridPct}
                        recommendedPct={review.allocation.recommendedHybridPct}
                        color="bg-amber-500"
                      />
                      {review.allocation.currentOtherPct > 0 && (
                        <AllocationBar
                          label="Other"
                          currentPct={review.allocation.currentOtherPct}
                          color="bg-purple-500"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">{review.allocation.allocationComment}</p>
                  </div>
                </CardContent>

                {/* Diversification */}
                <div className="border-t bg-muted/30 px-6 py-4 flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    review.diversification.overlapRisk === "High" ? "text-rose-500"
                    : review.diversification.overlapRisk === "Moderate" ? "text-amber-500"
                    : "text-emerald-500"
                  }`} />
                  <div className="text-sm">
                    <div className="font-semibold text-foreground">
                      Diversification: {review.diversification.overlapRisk} overlap risk
                    </div>
                    <p className="text-muted-foreground mt-0.5">{review.diversification.comment}</p>
                    {review.diversification.redundantFunds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="text-xs text-muted-foreground">Redundant:</span>
                        {review.diversification.redundantFunds.map((name, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Per-fund verdicts */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Per-Fund Recommendations
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {review.fundVerdicts.map((v, i) => {
                    const { icon: Icon, cls } = verdictStyle(v.verdict);
                    return (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="text-sm font-semibold text-foreground leading-snug flex-1">
                              {v.schemeName}
                            </h3>
                            <Badge className={`gap-1 border ${cls}`}>
                              <Icon className="w-3.5 h-3.5" />
                              {v.verdict}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{v.reasoning}</p>
                          <div className="space-y-2 text-xs">
                            <div className="flex gap-2">
                              <span className="text-muted-foreground shrink-0">SIP action:</span>
                              <span className="font-medium text-foreground">{v.suggestedSipChange}</span>
                            </div>
                            {v.suggestedReplacement && v.suggestedReplacement.trim() && (
                              <div className="flex gap-2">
                                <span className="text-muted-foreground shrink-0">Consider:</span>
                                <span className="font-medium text-foreground">{v.suggestedReplacement}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Cross-link to Tracker */}
              <Card className="border-financial-accent/30 bg-financial-accent/5">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="p-3 rounded-lg bg-financial-accent/15 text-financial-accent shrink-0">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Want to monitor these funds going forward?</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Send them to your Portfolio Tracker to keep an eye on NAV, performance vs benchmark, overlap, AMC/SEBI updates and news — automatically.
                    </p>
                  </div>
                  <Button
                    onClick={sendToTracker}
                    className="bg-financial-accent hover:bg-financial-accent/90 text-white gap-2 shrink-0"
                  >
                    Track these funds <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PortfolioReviewPage;
