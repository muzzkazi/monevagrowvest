import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BrainCircuit, Play, Sparkles } from "lucide-react";
import PageLayout from "@/components/shared/PageLayout";
import AdvisorRouteGuard from "@/components/admin/AdvisorRouteGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { runEngine } from "@/lib/pi/engine";
import { emptyConstraints, emptyProfile, emptyRiskAnswers, newGoal } from "@/lib/pi/defaults";
import { buildSwitchPlan, computeHoldingTaxes } from "@/lib/pi/tax";
import { runStressTest } from "@/lib/pi/stress";
import { NavMetrics } from "@/lib/pi/navMetrics";
import { PiRunInputs } from "@/lib/pi/runs";
import { useNavData } from "@/hooks/useNavData";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AssetBucket, ClientProfile, Constraints, EngineOutput, Goal, PortfolioFund, RiskAnswers } from "@/lib/pi/types";

const PortfolioIntelligenceInner = () => {
  const { canEdit } = useIsAdmin();
  const [profile, setProfile] = useState<ClientProfile>(emptyProfile);
  const [goals, setGoals] = useState<Goal[]>([newGoal()]);
  const [riskAnswers, setRiskAnswers] = useState<RiskAnswers>(emptyRiskAnswers);
  const [constraints, setConstraints] = useState<Constraints>(emptyConstraints);
  const [funds, setFunds] = useState<PortfolioFund[]>([]);
  const [additionalSip, setAdditionalSip] = useState(10000);
  const [declaredSipBudget, setDeclaredSipBudget] = useState(0);
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [tab, setTab] = useState("profile");
  const [runId, setRunId] = useState<string | null>(null);
  const [linkedClientId, setLinkedClientId] = useState<string | null>(null);

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
          <Button onClick={() => run()} className="gap-2">
            <Play className="h-4 w-4" /> Run analysis
          </Button>
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
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-financial-accent" /> AI advisor layer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The AI advisor layer sits on top of these exact numbers — it interprets, challenges inconsistent
                    proposals and writes the client-facing explanation, but never recalculates or overrides the engine.
                    Assumed return used for goal projection: <strong className="text-foreground">{assumedReturnPct}% p.a.</strong> (derived
                    from the engine's equity band, not a forecast).
                  </p>
                </CardContent>
              </Card>
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
              <AnalysisPanel output={output} />
              {taxViews && <TaxSwitchPanel plan={taxViews.plan} holdings={taxViews.holdings} />}
              {stress && <StressTestPanel stress={stress} />}
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
        <TabsContent value="saved" className="mt-6">
          <SavedRunsPanel
            inputs={inputs}
            assumedReturnPct={assumedReturnPct}
            output={output}
            canEdit={canEdit}
            currentRunId={runId}
            onRunSaved={(id, _name, clientId) => {
              setRunId(id);
              setLinkedClientId(clientId);
            }}
            onRunLoaded={(id, _name, clientId, loaded) => {
              setRunId(id);
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PortfolioIntelligence = () => (
  <PageLayout>
    <AdvisorRouteGuard>
      <PortfolioIntelligenceInner />
    </AdvisorRouteGuard>
  </PageLayout>
);

export default PortfolioIntelligence;
