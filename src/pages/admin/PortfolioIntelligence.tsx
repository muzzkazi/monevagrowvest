import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, BrainCircuit, Calculator, FileDown, Loader2, MessagesSquare, Play, RefreshCw, Save, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

import PageLayout from "@/components/shared/PageLayout";
import AdvisorRouteGuard from "@/components/admin/AdvisorRouteGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ConstraintsStep,
  GoalsStep,
  PortfolioStep,
  ProfileStep,
  RiskStep,
} from "@/components/portfolio-intelligence/InputSteps";
import AnalysisPanel from "@/components/portfolio-intelligence/AnalysisPanel";
import StressTestPanel from "@/components/portfolio-intelligence/StressTestPanel";
import TaxSwitchPanel from "@/components/portfolio-intelligence/TaxSwitchPanel";
import NavDataPanel from "@/components/portfolio-intelligence/NavDataPanel";
import SavedRunsPanel from "@/components/portfolio-intelligence/SavedRunsPanel";
import DataQualityPanel from "@/components/portfolio-intelligence/DataQualityPanel";
import NarrativePanel from "@/components/portfolio-intelligence/NarrativePanel";
import ChallengeReviewPanel from "@/components/portfolio-intelligence/ChallengeReviewPanel";
import FundCommentaryPanel from "@/components/portfolio-intelligence/FundCommentaryPanel";
import AdvisorChatPanel from "@/components/portfolio-intelligence/AdvisorChatPanel";
import ScenarioComparePanel from "@/components/portfolio-intelligence/ScenarioComparePanel";
import OnePageSummaryPanel from "@/components/portfolio-intelligence/OnePageSummaryPanel";
import GlossaryPanel from "@/components/portfolio-intelligence/GlossaryPanel";
import GlossaryTerm from "@/components/portfolio-intelligence/GlossaryTerm";
import type { ClientNarrative } from "@/components/portfolio-intelligence/NarrativePanel";
import type { FundCommentary } from "@/components/portfolio-intelligence/FundCommentaryPanel";
import { buildFundSelectionFacts } from "@/lib/pi/fundFacts";
import VersionHistoryPanel from "@/components/portfolio-intelligence/VersionHistoryPanel";
import { buildDataQualityReport } from "@/lib/pi/dataQuality";
import { buildNarrativeFacts } from "@/lib/pi/aiFacts";
import { runChallengeChecks } from "@/lib/pi/challenge";
import { appendVersion } from "@/lib/pi/versions";
import { generateRunPdf } from "@/lib/pi/runPdf";
import { useToast } from "@/hooks/use-toast";
import { runEngine } from "@/lib/pi/engine";
import { emptyConstraints, emptyProfile, emptyRiskAnswers } from "@/lib/pi/defaults";
import { loadClientPrefill } from "@/lib/pi/clientPrefill";
import { deleteServerDraft, fetchServerDraft, saveServerDraft } from "@/lib/pi/serverDraft";
import { buildSwitchPlan, computeHoldingTaxes } from "@/lib/pi/tax";
import { runStressTest, ScenarioKey } from "@/lib/pi/stress";
import { NavMetrics } from "@/lib/pi/navMetrics";
import { PiRunInputs } from "@/lib/pi/runs";
import { useNavData } from "@/hooks/useNavData";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AssetBucket, ClientProfile, Constraints, EngineOutput, Goal, PortfolioFund, RiskAnswers } from "@/lib/pi/types";

type LayerView = "math" | "plain" | "both";

const ALL_SCENARIOS: ScenarioKey[] = ["base", "downside", "upside", "severe"];

/* ── Draft autosave ─────────────────────────────────────────────────────────
 * Inputs are written to this browser as you type so switching tabs, running
 * the analysis or leaving the page never loses a half-entered portfolio. */
const DRAFT_KEY = "moneva.pi.draft.v1";
const SCROLL_KEY = "moneva.pi.scroll.v1";

/** Each client keeps its own draft so reviews never bleed into one another. */
const draftKeyFor = (clientId: string | null) => (clientId ? `${DRAFT_KEY}.client.${clientId}` : DRAFT_KEY);
const scrollKeyFor = (clientId: string | null) => (clientId ? `${SCROLL_KEY}.client.${clientId}` : SCROLL_KEY);

type Draft = PiRunInputs & { runName: string; tab?: string };

const loadDraft = (key: string): Partial<Draft> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<Draft>) : {};
  } catch {
    return {};
  }
};

const PortfolioIntelligenceInner = () => {
  const { canEdit } = useIsAdmin();
  const { toast } = useToast();
  const clientParam = useMemo(
    () => new URLSearchParams(window.location.search).get("client"),
    [],
  );
  const draftKey = useMemo(() => draftKeyFor(clientParam), [clientParam]);
  const scrollKey = useMemo(() => scrollKeyFor(clientParam), [clientParam]);
  const draft = useMemo(() => loadDraft(draftKey), [draftKey]);
  const [profile, setProfile] = useState<ClientProfile>(() => draft.profile ?? emptyProfile());
  const [goals, setGoals] = useState<Goal[]>(() => draft.goals ?? []);
  const [riskAnswers, setRiskAnswers] = useState<RiskAnswers>(() => draft.riskAnswers ?? emptyRiskAnswers());
  const [constraints, setConstraints] = useState<Constraints>(() => draft.constraints ?? emptyConstraints());
  const [funds, setFunds] = useState<PortfolioFund[]>(() => draft.funds ?? []);
  const [additionalSip, setAdditionalSip] = useState(() => draft.additionalSip ?? 10000);
  const [declaredSipBudget, setDeclaredSipBudget] = useState(() => draft.declaredSipBudget ?? 0);
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get("tab") ?? draft.tab ?? "profile");
  const [runId, setRunId] = useState<string | null>(null);
  const [linkedClientId, setLinkedClientId] = useState<string | null>(clientParam);
  const [prefilling, setPrefilling] = useState(Boolean(clientParam) && !draft.profile);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [prefillAttempt, setPrefillAttempt] = useState(0);
  const [prefillNotes, setPrefillNotes] = useState<string[]>([]);
  const hadLocalDraft = Boolean(draft.profile);
  const [serverChecked, setServerChecked] = useState(false);
  const [serverRestoredAt, setServerRestoredAt] = useState<Date | null>(null);
  const serverAppliedRef = useRef(false);
  const serverSaveTimer = useRef<number | undefined>(undefined);


  const [runName, setRunName] = useState(() => draft.runName ?? "Untitled run");
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [versionToken, setVersionToken] = useState(0);

  const [challengeCleared, setChallengeCleared] = useState(false);
  const [layerView, setLayerView] = useState<LayerView>(() => {
    const v = searchParams.get("layer");
    return v === "math" || v === "plain" || v === "both" ? v : "both";
  });
  const [scenarioKeys, setScenarioKeys] = useState<ScenarioKey[]>(() => {
    const raw = (searchParams.get("scenarios") ?? "").split(",").filter(Boolean) as ScenarioKey[];
    const valid = raw.filter((k) => ALL_SCENARIOS.includes(k));
    return valid.length > 0 ? valid : ALL_SCENARIOS;
  });
  const [narrative, setNarrative] = useState<ClientNarrative | null>(null);
  const [commentary, setCommentary] = useState<FundCommentary | null>(null);
  const restoringScroll = useRef(false);
  const draftSavedAtMs = useRef(0);
  const draftRef = useRef<Draft>({
    profile,
    goals,
    riskAnswers,
    constraints,
    funds,
    additionalSip,
    declaredSipBudget,
    runName,
    tab,
  });
  const showMath = layerView !== "plain";
  const showPlain = layerView !== "math";

  /* Mirror the draft to the database so the review resumes on any device. */
  const flushServerDraft = useCallback((snapshot = draftRef.current) => {
    if (!canEdit) return;
    window.clearTimeout(serverSaveTimer.current);
    void saveServerDraft(clientParam, snapshot);
  }, [canEdit, clientParam]);

  const scheduleServerSave = useCallback((snapshot: Draft) => {
    if (!canEdit) return;
    window.clearTimeout(serverSaveTimer.current);
    serverSaveTimer.current = window.setTimeout(() => {
      void saveServerDraft(clientParam, snapshot);
    }, 1500);
  }, [canEdit, clientParam]);

  const persistDraft = useCallback((snapshot = draftRef.current) => {
    if (prefilling) return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(snapshot));
      const now = Date.now();
      if (now - draftSavedAtMs.current > 1000) {
        draftSavedAtMs.current = now;
        setDraftSavedAt(new Date(now));
      }
    } catch { /* quota — ignore */ }
    scheduleServerSave(snapshot);
  }, [draftKey, prefilling, scheduleServerSave]);


  const updateDraft = useCallback((patch: Partial<Draft>) => {
    draftRef.current = { ...draftRef.current, ...patch };
    persistDraft(draftRef.current);
  }, [persistDraft]);

  const updateProfile = useCallback((next: ClientProfile) => {
    setProfile(next);
    updateDraft({ profile: next });
  }, [updateDraft]);

  const updateGoals = useCallback((next: Goal[]) => {
    setGoals(next);
    updateDraft({ goals: next });
  }, [updateDraft]);

  const updateRiskAnswers = useCallback((next: RiskAnswers) => {
    setRiskAnswers(next);
    updateDraft({ riskAnswers: next });
  }, [updateDraft]);

  const updateConstraints = useCallback((next: Constraints) => {
    setConstraints(next);
    updateDraft({ constraints: next });
  }, [updateDraft]);

  const updateFunds = useCallback((next: PortfolioFund[]) => {
    setFunds(next);
    updateDraft({ funds: next });
  }, [updateDraft]);

  const updateAdditionalSip = useCallback((next: number) => {
    setAdditionalSip(next);
    updateDraft({ additionalSip: next });
  }, [updateDraft]);

  const updateDeclaredSipBudget = useCallback((next: number) => {
    setDeclaredSipBudget(next);
    updateDraft({ declaredSipBudget: next });
  }, [updateDraft]);

  const updateRunName = useCallback((next: string) => {
    setRunName(next);
    updateDraft({ runName: next });
  }, [updateDraft]);

  const saveScrollPosition = useCallback(() => {
    if (restoringScroll.current) return;
    try { window.sessionStorage.setItem(scrollKey, String(window.scrollY)); } catch { /* noop */ }
  }, [scrollKey]);

  /* Deep-linkable view state: tab, Layer A/B toggle and selected scenarios live in the URL. */
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    next.set("layer", layerView);
    next.set("scenarios", scenarioKeys.join(","));
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, layerView, scenarioKeys]);

  /* Server-side draft restore: if this browser has no local draft, pull the
   * stored draft for this client so the review resumes across devices. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (hadLocalDraft) { setServerChecked(true); return; }
      const d = await fetchServerDraft(clientParam);
      if (cancelled) { return; }
      const hasContent = d && (
        Boolean((d.profile as { clientName?: string } | null)?.clientName) ||
        (d.funds?.length ?? 0) > 0 ||
        (d.goals?.length ?? 0) > 0
      );
      if (d && hasContent) {
        serverAppliedRef.current = true;
        setProfile(d.profile);
        setGoals(d.goals ?? []);
        setRiskAnswers(d.riskAnswers);
        setConstraints(d.constraints);
        setFunds(d.funds ?? []);
        setAdditionalSip(d.additionalSip ?? 10000);
        setDeclaredSipBudget(d.declaredSipBudget ?? 0);
        setRunName(d.runName);
        draftRef.current = {
          profile: d.profile,
          goals: d.goals ?? [],
          riskAnswers: d.riskAnswers,
          constraints: d.constraints,
          funds: d.funds ?? [],
          additionalSip: d.additionalSip ?? 10000,
          declaredSipBudget: d.declaredSipBudget ?? 0,
          runName: d.runName,
          tab: draftRef.current.tab,
        };
        try { window.localStorage.setItem(draftKey, JSON.stringify(draftRef.current)); } catch { /* noop */ }
        setServerRestoredAt(new Date(d.updatedAt));
        setPrefilling(false);
        toast({
          title: "Saved draft restored",
          description: `Resuming the in-progress review saved ${new Date(d.updatedAt).toLocaleString("en-IN")}.`,
        });
      }
      setServerChecked(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientParam, hadLocalDraft, draftKey]);

  /* Launched from a client record (?client=<id>) with no draft yet → prefill
   * the wizard from the client book. Nothing is invented: fields the record
   * does not hold stay at the wizard default and are listed for confirmation. */
  useEffect(() => {
    if (!clientParam || draft.profile || !serverChecked || serverAppliedRef.current) return;
    let cancelled = false;
    setPrefilling(true);
    setPrefillError(null);
    (async () => {
      try {
        const p = await loadClientPrefill(clientParam);
        if (cancelled) return;
        if (!p) {
          setPrefilling(false);
          setPrefillError("That client record could not be found. You can retry or start a blank run.");
          return;
        }
        setProfile(p.profile);
        if (p.goals.length > 0) setGoals(p.goals);
        setRiskAnswers(p.riskAnswers);
        setConstraints(p.constraints);
        setFunds(p.funds);
        setDeclaredSipBudget(p.declaredSipBudget);
        setRunName(p.runName);
        setPrefillNotes(p.missing);
        draftRef.current = {
          profile: p.profile,
          goals: p.goals.length > 0 ? p.goals : draftRef.current.goals,
          riskAnswers: p.riskAnswers,
          constraints: p.constraints,
          funds: p.funds,
          additionalSip: draftRef.current.additionalSip,
          declaredSipBudget: p.declaredSipBudget,
          runName: p.runName,
          tab: draftRef.current.tab,
        };
        setPrefilling(false);
        toast({
          title: `Loaded ${p.profile.clientName}`,
          description: `${p.funds.length} holding(s) and ${p.goals.length} goal(s) pulled from the client record.`,
        });
      } catch (e) {
        if (cancelled) return;
        setPrefilling(false);
        setPrefillError((e as Error).message || "Could not load this client's record.");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientParam, prefillAttempt, serverChecked]);


  /* Restore the user's working position after the preview/browser reloads. */
  useLayoutEffect(() => {
    restoringScroll.current = true;
    let raf = 0;
    try {
      const y = Number(window.sessionStorage.getItem(scrollKey) ?? 0);
      raf = window.requestAnimationFrame(() => {
        if (Number.isFinite(y) && y > 0) window.scrollTo({ top: y, behavior: "auto" });
        restoringScroll.current = false;
      });
    } catch {
      restoringScroll.current = false;
    }
    return () => window.cancelAnimationFrame(raf);
  }, [scrollKey]);

  /* Keep the current scroll position in session storage without triggering layout work. */
  useEffect(() => {
    let raf = 0;
    const scheduleSave = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(saveScrollPosition);
    };
    const saveOnHide = () => {
      if (document.visibilityState === "hidden") saveScrollPosition();
    };
    window.addEventListener("scroll", scheduleSave, { passive: true });
    window.addEventListener("blur", saveScrollPosition);
    window.addEventListener("pagehide", saveScrollPosition);
    document.addEventListener("visibilitychange", saveOnHide);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleSave);
      window.removeEventListener("blur", saveScrollPosition);
      window.removeEventListener("pagehide", saveScrollPosition);
      document.removeEventListener("visibilitychange", saveOnHide);
    };
  }, [saveScrollPosition]);

  /* Flush immediately when the browser tab/app is backgrounded or closed. */
  useEffect(() => {
    const flushDraft = () => { persistDraft(); flushServerDraft(); };
    const flushOnHide = () => {
      if (document.visibilityState === "hidden") { persistDraft(); flushServerDraft(); }
    };
    window.addEventListener("blur", flushDraft);
    window.addEventListener("pagehide", flushDraft);
    document.addEventListener("visibilitychange", flushOnHide);
    return () => {
      window.removeEventListener("blur", flushDraft);
      window.removeEventListener("pagehide", flushDraft);
      document.removeEventListener("visibilitychange", flushOnHide);
    };
  }, [persistDraft, flushServerDraft]);

  const clearDraft = () => {
    try { window.localStorage.removeItem(draftKey); } catch { /* noop */ }
    window.clearTimeout(serverSaveTimer.current);
    void deleteServerDraft(clientParam);
    setServerRestoredAt(null);
    setProfile(emptyProfile());
    setGoals([]);
    setRiskAnswers(emptyRiskAnswers());
    setConstraints(emptyConstraints());
    setFunds([]);
    setAdditionalSip(10000);
    setDeclaredSipBudget(0);
    setOutput(null);
    setRunName("Untitled run");
    draftRef.current = {
      profile: emptyProfile(),
      goals: [],
      riskAnswers: emptyRiskAnswers(),
      constraints: emptyConstraints(),
      funds: [],
      additionalSip: 10000,
      declaredSipBudget: 0,
      runName: "Untitled run",
      tab,
    };
    setDraftSavedAt(null);
    setPrefillNotes([]);
    toast({ title: "Draft cleared", description: "All inputs reset to defaults." });
  };

  const setScenarioSelection = useCallback((keys: ScenarioKey[]) => {
    setScenarioKeys(keys.length === 0 ? ALL_SCENARIOS : keys);
  }, []);



  const schemeCodes = useMemo(
    () => funds.map((f) => (f as PortfolioFund & { schemeCode?: string }).schemeCode ?? "").filter(Boolean),
    [funds],
  );
  const nav = useNavData(schemeCodes);

  const assumedReturnPct = useMemo(() => {
    // Deterministic assumption derived from the engine's own equity band —
    // not a prediction, and clearly labelled as an assumption in the report.
    const engineRisk = runEngine({
      profile, goals, constraints, funds, riskAnswers,
      additionalSip, declaredSipBudget, assumedReturnPct: 10,
    }).risk;
    const equityMid = (engineRisk.equityRange[0] + engineRisk.equityRange[1]) / 2;
    return +(6 + (equityMid / 100) * 6).toFixed(1); // 6% debt-like to 12% full equity
  }, [profile, goals, constraints, funds, riskAnswers, additionalSip, declaredSipBudget]);

  const inputs: PiRunInputs = {
    profile, goals, riskAnswers, constraints, funds, additionalSip, declaredSipBudget,
  };

  const changeTab = useCallback((nextTab: string) => {
    updateDraft({ tab: nextTab });
    saveScrollPosition();
    setTab(nextTab);
  }, [saveScrollPosition, updateDraft]);

  const run = (source?: PiRunInputs) => {
    const src = source ?? inputs;
    setOutput(runEngine({ ...src, assumedReturnPct }));
    changeTab("analysis");
  };

  /* Tax-aware switch plan — candidates come only from engine findings. */
  const taxViews = useMemo(() => {
    if (!output || funds.length === 0) return null;
    const holdings = computeHoldingTaxes(funds, { annualIncome: profile.annualIncome });

    const candidates: Array<{ fundId: string; reason: string; amount?: number }> = [];
    output.sipPlan
      .filter((a) => a.action === "REDUCE" || a.action === "STOP SIP")
      .forEach((a) => {
        const fund = funds.find((f) => f.id === a.fundId);
        if (fund) candidates.push({ fundId: a.fundId, reason: a.why, amount: fund.currentValue });
      });
    output.concentration
      .filter((c) => c.severity === "Warning")
      .forEach((c) => {
        const fund = funds.find((f) => f.schemeName === c.label);
        if (fund && !candidates.some((x) => x.fundId === fund.id)) {
          const excess = Math.max(0, ((c.pct - 20) / c.pct) * fund.currentValue);
          candidates.push({ fundId: fund.id, reason: `${c.label} is ${c.pct}% of the portfolio — ${c.note}`, amount: excess });
        }
      });
    output.redundancy.forEach((r) => {
      // Weakest duplicate = the smallest holding in that role.
      const dupes = funds.filter((f) => r.funds.includes(f.schemeName)).sort((a, b) => a.currentValue - b.currentValue);
      const weakest = dupes[0];
      if (weakest && !candidates.some((x) => x.fundId === weakest.id)) {
        candidates.push({ fundId: weakest.id, reason: r.note, amount: weakest.currentValue });
      }
    });

    return {
      holdings,
      plan: buildSwitchPlan(funds, candidates, { annualIncome: profile.annualIncome }),
    };
  }, [output, funds, profile.annualIncome]);

  /* Stress test — real NAV metrics per bucket where available. */
  const stress = useMemo(() => {
    if (!output) return null;
    const bucketMetrics: Partial<Record<AssetBucket, NavMetrics[]>> = {};
    funds.forEach((f) => {
      const code = (f as PortfolioFund & { schemeCode?: string }).schemeCode;
      const m = code ? nav.metrics.get(String(code)) : undefined;
      if (m) bucketMetrics[f.assetBucket] = [...(bucketMetrics[f.assetBucket] ?? []), m];
    });
    const essential = goals.filter((g) => g.essential).map((g) => g.targetYear - new Date().getFullYear());
    return runStressTest({
      allocation: output.allocation,
      portfolioValue: output.totals.currentValue,
      monthlySip: output.totals.currentSip + output.totals.additionalSip,
      bucketMetrics,
      nearestEssentialGoalYears: essential.length ? Math.min(...essential) : null,
    });
  }, [output, funds, goals, nav.metrics]);

  /* Data-quality gate — decides whether taxable switches may be recommended. */
  const quality = useMemo(
    () =>
      buildDataQualityReport({
        funds,
        annualIncome: profile.annualIncome,
        nav: {
          requestedCodes: nav.requestedCodes,
          unavailable: nav.unavailable,
          oldestFetchedAt: nav.oldestFetchedAt,
          error: nav.error,
        },
      }),
    [funds, profile.annualIncome, nav.requestedCodes, nav.unavailable, nav.oldestFetchedAt, nav.error],
  );

  /* Layer B fact sheet — read-only view of the deterministic output. */
  const narrativeFacts = useMemo(
    () =>
      output
        ? buildNarrativeFacts({ runName, inputs, assumedReturnPct, output, quality, stress })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [output, quality, stress, assumedReturnPct, runName],
  );

  /* Fund-selection fact sheet — per-fund reasons, trade-offs, goal/constraint mapping. */
  const fundFacts = useMemo(
    () =>
      output
        ? buildFundSelectionFacts({
            runName,
            assumedReturnPct,
            funds,
            goals,
            constraints,
            output,
            switchingAllowed: quality.switchingAllowed,
            blockers: (quality.blockers ?? []).map((b) => `${b.area}: ${b.message}`),
          })
        : null,
    [output, runName, assumedReturnPct, funds, goals, constraints, quality],
  );

  /* Challenge / sanity review — deterministic contradictions, computed first. */
  const challenge = useMemo(
    () =>
      output
        ? runChallengeChecks({
            inputs,
            output,
            quality,
            switchPlan: taxViews?.plan ?? null,
            stress,
            assumedReturnPct,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [output, quality, stress, taxViews, assumedReturnPct],
  );

  const downloadReport = () => {
    if (!output) return;
    try {
      generateRunPdf({
        runName,
        runId,
        clientId: linkedClientId,
        inputs,
        assumedReturnPct,
        output,
        holdings: taxViews?.holdings ?? [],
        switchPlan: quality.switchingAllowed ? (taxViews?.plan ?? null) : null,
        stress,
        quality,
      });
    } catch (e) {
      toast({ title: "Export failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-8">
      <div className="space-y-4">
        <Link
          to={linkedClientId ? `/admin/clients/${linkedClientId}` : "/admin/clients"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {linkedClientId ? "Back to client record" : "Back to client book"}
        </Link>
        {prefilling && (
          <Card className="border-financial-accent/40 bg-financial-accent/5">
            <CardContent className="pt-5 space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-financial-accent" />
                Loading this client's profile, goals and holdings…
              </p>
              <Progress value={66} aria-label="Loading client record" className="h-1.5" />
            </CardContent>
          </Card>
        )}
        {prefillError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="pt-5 space-y-3">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Could not prefill from the client record
              </p>
              <p className="text-sm text-muted-foreground">{prefillError}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={() => setPrefillAttempt((n) => n + 1)}>
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPrefillError(null)}>
                  Continue with a blank run
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {prefillNotes.length > 0 && (
          <Card className="border-financial-gold/40 bg-financial-gold/5">
            <CardContent className="pt-5 space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                Prefilled from the client record — please confirm what the record doesn't hold:
              </p>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
                {prefillNotes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="secondary" className="gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5" /> Portfolio Intelligence
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              AI Portfolio Intelligence &amp; Recommendation Engine
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Client → goals → risk → asset allocation → portfolio roles → gap analysis → SIP optimisation → tax-aware
              implementation → stress test. Every number is computed deterministically; missing data is reported, never
              filled in.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {output && (
                <Button variant="outline" onClick={downloadReport} className="gap-2">
                  <FileDown className="h-4 w-4" /> Download report
                </Button>
              )}
              <Button onClick={() => run()} className="gap-2">
                <Play className="h-4 w-4" /> Run analysis
              </Button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Save className="h-3 w-3" />
              {draftSavedAt
                ? `Draft saved ${draftSavedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                : "Draft autosaves as you type"}
              <span className="text-muted-foreground/70">· saved to the client record</span>
              <button type="button" onClick={clearDraft} className="underline hover:text-foreground">
                Clear draft
              </button>
            </div>
          </div>

        </div>
      </div>

      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="profile">1 · Client</TabsTrigger>
          <TabsTrigger value="goals">2 · Goals</TabsTrigger>
          <TabsTrigger value="risk">3 · Risk</TabsTrigger>
          <TabsTrigger value="constraints">4 · Constraints</TabsTrigger>
          <TabsTrigger value="portfolio">5 · Portfolio &amp; SIP</TabsTrigger>
          <TabsTrigger value="analysis">6 · Analysis</TabsTrigger>
          <TabsTrigger value="saved">7 · Saved runs</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" forceMount className="mt-6 data-[state=inactive]:hidden">
          <ProfileStep profile={profile} onChange={updateProfile} />
        </TabsContent>
        <TabsContent value="goals" forceMount className="mt-6 data-[state=inactive]:hidden">
          <GoalsStep goals={goals} onChange={updateGoals} />
        </TabsContent>
        <TabsContent value="risk" forceMount className="mt-6 data-[state=inactive]:hidden">
          <RiskStep answers={riskAnswers} onChange={updateRiskAnswers} />
        </TabsContent>
        <TabsContent value="constraints" forceMount className="mt-6 data-[state=inactive]:hidden">
          <ConstraintsStep constraints={constraints} onChange={updateConstraints} />
        </TabsContent>
        <TabsContent value="portfolio" forceMount className="mt-6 data-[state=inactive]:hidden">
          <PortfolioStep
            funds={funds}
            onChange={updateFunds}
            additionalSip={additionalSip}
            onAdditionalSipChange={updateAdditionalSip}
            declaredSipBudget={declaredSipBudget}
            onDeclaredSipChange={updateDeclaredSipBudget}
          />
        </TabsContent>

        {(() => {
          const order = ["profile", "goals", "risk", "constraints", "portfolio"];
          const idx = order.indexOf(tab);
          if (idx === -1) return null;
          const isLast = idx === order.length - 1;
          return (
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                disabled={idx === 0}
                onClick={() => changeTab(order[idx - 1])}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Step {idx + 1} of {order.length}
              </p>
              {isLast ? (
                <Button onClick={() => run()}>
                  <Play className="mr-2 h-4 w-4" />
                  Run analysis
                </Button>
              ) : (
                <Button onClick={() => changeTab(order[idx + 1])}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })()}

        <TabsContent value="analysis" forceMount className="mt-6 space-y-6 data-[state=inactive]:hidden">
          {output ? (
            <>
              <Card className="border-financial-accent/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-financial-accent" /> AI advisor layer
                    </CardTitle>
                    <ToggleGroup
                      type="single"
                      value={layerView}
                      onValueChange={(v) => v && setLayerView(v as LayerView)}
                      aria-label="Show engine math, plain English, or both"
                      className="flex-wrap"
                    >
                      <ToggleGroupItem value="math" className="gap-1.5 text-xs px-3">
                        <Calculator className="h-3.5 w-3.5" /> Layer A · math
                      </ToggleGroupItem>
                      <ToggleGroupItem value="plain" className="gap-1.5 text-xs px-3">
                        <MessagesSquare className="h-3.5 w-3.5" /> Layer B · plain English
                      </ToggleGroupItem>
                      <ToggleGroupItem value="both" className="gap-1.5 text-xs px-3">
                        Both
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <GlossaryTerm id="layerA">Layer A</GlossaryTerm> computes every figure deterministically;{" "}
                    <GlossaryTerm id="layerB">Layer B</GlossaryTerm> only explains those figures in plain English and is
                    blocked from inventing numbers. Use the toggle to see the same recommendation either way.
                    Assumed return used for goal projection:{" "}
                    <strong className="text-foreground">{assumedReturnPct}% p.a.</strong> (derived from the engine's{" "}
                    <GlossaryTerm id="equityRange">equity band</GlossaryTerm>, not a forecast).
                  </p>
                </CardContent>
              </Card>

              {showMath && (
                <>
                  <NavDataPanel
                    series={nav.series}
                    metrics={nav.metrics}
                    unavailable={nav.unavailable}
                    oldestFetchedAt={nav.oldestFetchedAt}
                    loading={nav.loading}
                    error={nav.error}
                    onRefresh={nav.refresh}
                    requestedCodes={nav.requestedCodes}
                  />
                  <DataQualityPanel report={quality} onRefreshNav={nav.refresh} refreshing={nav.loading} />
                  <AnalysisPanel output={output} />
                </>
              )}

              {narrativeFacts && challenge && (
                <ChallengeReviewPanel
                  report={challenge}
                  facts={narrativeFacts}
                  onClearedChange={setChallengeCleared}
                />
              )}

              {showPlain && narrativeFacts && challenge && (
                challengeCleared ? (
                  <NarrativePanel facts={narrativeFacts} onNarrativeChange={setNarrative} />
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-10 text-center space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Client-facing review note is locked
                      </p>
                      <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                        Run the challenge &amp; sanity review above and accept it first. Nothing client-facing is written
                        while the engine output and the recommendations still contradict each other.
                      </p>
                    </CardContent>
                  </Card>
                )
              )}
              {showPlain && fundFacts && (
                <FundCommentaryPanel facts={fundFacts} onCommentaryChange={setCommentary} />
              )}
              {showPlain && narrativeFacts && challengeCleared && (
                <OnePageSummaryPanel
                  facts={narrativeFacts}
                  fundFacts={fundFacts}
                  narrative={narrative}
                  commentary={commentary}
                />
              )}
              {showPlain && narrativeFacts && (
                <AdvisorChatPanel
                  facts={narrativeFacts}
                  fundFacts={fundFacts}
                  gate={{
                    challengeCleared,
                    runName,
                    runId,
                    blockers: (quality.blockers ?? []).map((b) => `${b.area}: ${b.message}`),
                  }}
                />
              )}
              {showMath && taxViews && (
                <TaxSwitchPanel plan={taxViews.plan} holdings={taxViews.holdings} quality={quality} />
              )}
              {stress && (
                <ScenarioComparePanel
                  stress={stress}
                  selected={scenarioKeys}
                  onSelectedChange={setScenarioSelection}
                  meta={{
                    clientName: profile.clientName || "Client",
                    runName,
                    runId,
                    versionId: null,
                  }}
                />
              )}
              {showMath && stress && <StressTestPanel stress={stress} />}
              <GlossaryPanel />
            </>

          ) : (
            <Card>
              <CardContent className="py-16 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Capture the client, goals, risk answers, constraints and holdings, then run the analysis.
                </p>
                <Button onClick={() => run()} className="gap-2"><Play className="h-4 w-4" /> Run analysis</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="saved" forceMount className="mt-6 space-y-6 data-[state=inactive]:hidden">
          <SavedRunsPanel
            inputs={inputs}
            assumedReturnPct={assumedReturnPct}
            output={output}
            canEdit={canEdit}
            currentRunId={runId}
            onRunSaved={(id, name, clientId) => {
              setRunId(id);
              updateRunName(name);
              setLinkedClientId(clientId);
              // Each save appends an immutable version so iterations stay comparable.
              appendVersion({
                runId: id,
                runName: name,
                clientId,
                inputs,
                assumedReturnPct,
                output,
              })
                .then((no) => {
                  setVersionToken((t) => t + 1);
                  toast({ title: `Version v${no} recorded` });
                })
                .catch((e) =>
                  toast({ title: "Version not recorded", description: (e as Error).message, variant: "destructive" }),
                );
            }}
            onRunLoaded={(id, name, clientId, loaded) => {
              setRunId(id);
              updateRunName(name);
              setVersionToken((t) => t + 1);
              setLinkedClientId(clientId);
              setProfile(loaded.profile);
              setGoals(loaded.goals);
              setRiskAnswers(loaded.riskAnswers);
              setConstraints(loaded.constraints);
              setFunds(loaded.funds);
              setAdditionalSip(loaded.additionalSip);
              setDeclaredSipBudget(loaded.declaredSipBudget);
              updateDraft({ ...loaded, runName: name });
              // Re-run the engine on the saved inputs so outputs are reproduced,
              // not restored from a stale snapshot.
              run(loaded);
            }}
          />
          {linkedClientId && (
            <p className="mt-3 text-xs text-muted-foreground">
              This run is linked to a client in the client book.{" "}
              <Link to={`/admin/clients/${linkedClientId}`} className="text-financial-accent hover:underline">
                Open client record
              </Link>
            </p>
          )}
          <VersionHistoryPanel runId={runId} refreshToken={versionToken} />
        </TabsContent>

      </Tabs>
    </div>
  );
};

const PortfolioIntelligence = () => (
  <PageLayout>
    <AdvisorRouteGuard requireRole allowAdvisor>
      <PortfolioIntelligenceInner />
    </AdvisorRouteGuard>
  </PageLayout>
);

export default PortfolioIntelligence;
