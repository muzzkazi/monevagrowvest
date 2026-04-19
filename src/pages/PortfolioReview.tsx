import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  Sparkles, Plus, Trash2, Search, Loader2, AlertTriangle,
  CheckCircle2, ArrowRightLeft, MinusCircle, XCircle, TrendingUp,
} from "lucide-react";
import { searchAmfi } from "@/lib/amfiSearch";
import { inferFundHouse, inferSubCategory } from "@/lib/amfiSearch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) { setResults([]); return; }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const hits = await searchAmfi(q, ctrl.signal);
        setResults(hits.slice(0, 30).map(h => ({ schemeCode: String(h.schemeCode), schemeName: h.schemeName })));
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(handle); ctrl.abort(); };
  }, [query]);

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
      {open && results.length > 0 && (
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

const PortfolioReviewPage = () => {
  const [funds, setFunds] = useState<SelectedFund[]>([]);
  const [risk, setRisk] = useState<RiskProfile>("Moderate");
  const [horizon, setHorizon] = useState<string>("10");
  const [goal, setGoal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ReviewResponse | null>(null);

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
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-financial-accent to-financial-accent/70 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                AI Portfolio Review
              </h1>
              <p className="text-muted-foreground">
                Add your existing mutual fund SIPs and get AI-powered recommendations on what to keep, reduce, exit or switch.
              </p>
            </div>
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
                    <SelectTrigger id="risk" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conservative">Conservative</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
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
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PortfolioReviewPage;
