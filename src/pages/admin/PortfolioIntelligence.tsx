import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, BrainCircuit, Calculator, FileDown, MessagesSquare, Play, Save, Sparkles } from "lucide-react";
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
import { emptyConstraints, emptyProfile, emptyRiskAnswers, newGoal } from "@/lib/pi/defaults";
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

/** Each client keeps its own draft so reviews never bleed into one another. */
const draftKeyFor = (clientId: string | null) => (clientId ? `${DRAFT_KEY}.client.${clientId}` : DRAFT_KEY);

type Draft = PiRunInputs & { runName: string };

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
  const draft = useMemo(() => loadDraft(draftKey), [draftKey]);
  const [profile, setProfile] = useState<ClientProfile>(() => draft.profile ?? emptyProfile());
  const [goals, setGoals] = useState<Goal[]>(() => draft.goals ?? [newGoal()]);
  const [riskAnswers, setRiskAnswers] = useState<RiskAnswers>(() => draft.riskAnswers ?? emptyRiskAnswers());
  const [constraints, setConstraints] = useState<Constraints>(() => draft.constraints ?? emptyConstraints());
  const [funds, setFunds] = useState<PortfolioFund[]>(() => draft.funds ?? []);
  const [additionalSip, setAdditionalSip] = useState(() => draft.additionalSip ?? 10000);
  const [declaredSipBudget, setDeclaredSipBudget] = useState(() => draft.declaredSipBudget ?? 0);
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get("tab") ?? "profile");
  const [runId, setRunId] = useState<string | null>(null);
  const [linkedClientId, setLinkedClientId] = useState<string | null>(null);
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
  const showMath = layerView !== "plain";
  const showPlain = layerView !== "math";

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

  /* Autosave the whole input draft (debounced) so nothing is lost on tab switch. */
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ profile, goals, riskAnswers, constraints, funds, additionalSip, declaredSipBudget, runName }),
        );
        setDraftSavedAt(new Date());
      } catch { /* quota — ignore */ }
    }, 500);
    return () => clearTimeout(t);
  }, [profile, goals, riskAnswers, constraints, funds, additionalSip, declaredSipBudget, runName]);

  const clearDraft = () => {
    try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
    setProfile(emptyProfile());
    setGoals([newGoal()]);
    setRiskAnswers(emptyRiskAnswers());
    setConstraints(emptyConstraints());
    setFunds([]);
    setAdditionalSip(10000);
    setDeclaredSipBudget(0);
    setOutput(null);
    setRunName("Untitled run");
    setDraftSavedAt(null);
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

  const run = (source?: PiRunInputs) => {
    const src = source ?? inputs;
    setOutput(runEngine({ ...src, assumedReturnPct }));
    setTab("analysis");
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
        <Link to="/admin/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to client book
        </Link>
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
              <button type="button" onClick={clearDraft} className="underline hover:text-foreground">
                Clear draft
              </button>
            </div>
          </div>

        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="profile">1 · Client</TabsTrigger>
          <TabsTrigger value="goals">2 · Goals</TabsTrigger>
          <TabsTrigger value="risk">3 · Risk</TabsTrigger>
          <TabsTrigger value="constraints">4 · Constraints</TabsTrigger>
          <TabsTrigger value="portfolio">5 · Portfolio &amp; SIP</TabsTrigger>
          <TabsTrigger value="analysis">6 · Analysis</TabsTrigger>
          <TabsTrigger value="saved">7 · Saved runs</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileStep profile={profile} onChange={setProfile} />
        </TabsContent>
        <TabsContent value="goals" className="mt-6">
          <GoalsStep goals={goals} onChange={setGoals} />
        </TabsContent>
        <TabsContent value="risk" className="mt-6">
          <RiskStep answers={riskAnswers} onChange={setRiskAnswers} />
        </TabsContent>
        <TabsContent value="constraints" className="mt-6">
          <ConstraintsStep constraints={constraints} onChange={setConstraints} />
        </TabsContent>
        <TabsContent value="portfolio" className="mt-6">
          <PortfolioStep
            funds={funds}
            onChange={setFunds}
            additionalSip={additionalSip}
            onAdditionalSipChange={setAdditionalSip}
            declaredSipBudget={declaredSipBudget}
            onDeclaredSipChange={setDeclaredSipBudget}
          />
        </TabsContent>
        <TabsContent value="analysis" className="mt-6 space-y-6">
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
        <TabsContent value="saved" className="mt-6 space-y-6">
          <SavedRunsPanel
            inputs={inputs}
            assumedReturnPct={assumedReturnPct}
            output={output}
            canEdit={canEdit}
            currentRunId={runId}
            onRunSaved={(id, name, clientId) => {
              setRunId(id);
              setRunName(name);
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
              setRunName(name);
              setVersionToken((t) => t + 1);
              setLinkedClientId(clientId);
              setProfile(loaded.profile);
              setGoals(loaded.goals);
              setRiskAnswers(loaded.riskAnswers);
              setConstraints(loaded.constraints);
              setFunds(loaded.funds);
              setAdditionalSip(loaded.additionalSip);
              setDeclaredSipBudget(loaded.declaredSipBudget);
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
