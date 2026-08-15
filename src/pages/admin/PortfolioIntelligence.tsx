import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BrainCircuit, Play, Sparkles } from "lucide-react";
import PageLayout from "@/components/shared/PageLayout";
import AdminGuard from "@/components/admin/AdminGuard";
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
import { runEngine } from "@/lib/pi/engine";
import { emptyConstraints, emptyProfile, emptyRiskAnswers, newGoal } from "@/lib/pi/defaults";
import { ClientProfile, Constraints, EngineOutput, Goal, PortfolioFund, RiskAnswers } from "@/lib/pi/types";

const PortfolioIntelligenceInner = () => {
  const [profile, setProfile] = useState<ClientProfile>(emptyProfile);
  const [goals, setGoals] = useState<Goal[]>([newGoal()]);
  const [riskAnswers, setRiskAnswers] = useState<RiskAnswers>(emptyRiskAnswers);
  const [constraints, setConstraints] = useState<Constraints>(emptyConstraints);
  const [funds, setFunds] = useState<PortfolioFund[]>([]);
  const [additionalSip, setAdditionalSip] = useState(10000);
  const [declaredSipBudget, setDeclaredSipBudget] = useState(0);
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [tab, setTab] = useState("profile");

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

  const run = () => {
    setOutput(
      runEngine({
        profile, goals, constraints, funds, riskAnswers,
        additionalSip, declaredSipBudget, assumedReturnPct,
      }),
    );
    setTab("analysis");
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
              <BrainCircuit className="h-3.5 w-3.5" /> Portfolio Intelligence · Phase 1
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              AI Portfolio Intelligence &amp; Recommendation Engine
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Client → goals → risk → asset allocation → portfolio roles → gap analysis → SIP optimisation. Every number
              below is computed deterministically; the AI advisor layer only explains these outputs and is added next.
            </p>
          </div>
          <Button onClick={run} className="gap-2">
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
                    Phase 2 wires the AI advisor on top of these exact numbers — it interprets, challenges inconsistent
                    proposals and writes the client-facing explanation, but never recalculates or overrides the engine.
                    Assumed return used for goal projection: <strong className="text-foreground">{assumedReturnPct}% p.a.</strong> (derived
                    from the engine's equity band, not a forecast).
                  </p>
                </CardContent>
              </Card>
              <AnalysisPanel output={output} />
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Capture the client, goals, risk answers, constraints and holdings, then run the analysis.
                </p>
                <Button onClick={run} className="gap-2"><Play className="h-4 w-4" /> Run analysis</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PortfolioIntelligence = () => (
  <PageLayout>
    <AdminGuard allowAdvisor>
      <PortfolioIntelligenceInner />
    </AdminGuard>
  </PageLayout>
);

export default PortfolioIntelligence;
