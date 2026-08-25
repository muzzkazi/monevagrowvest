import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, BrainCircuit, AlertTriangle, RefreshCw } from "lucide-react";
import { runEngine } from "@/lib/pi/engine";
import { loadClientPrefill } from "@/lib/pi/clientPrefill";
import type { EngineOutput, PortfolioFund } from "@/lib/pi/types";
import AnalysisPanel from "@/components/portfolio-intelligence/AnalysisPanel";
import LookThroughExposure from "@/components/portfolio/LookThroughExposure";
import SchemeOverlapMatrixPanel from "@/components/portfolio-intelligence/SchemeOverlapMatrixPanel";

/**
 * Inline portfolio review, run straight from the client record.
 * Uses the same deterministic engine and the same panels as the
 * Portfolio Intelligence console — no navigation required.
 */
const ClientInlineReview = ({ clientId, clientName }: { clientId: string; clientName: string }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<EngineOutput | null>(null);
  const [funds, setFunds] = useState<PortfolioFund[]>([]);
  const [missing, setMissing] = useState<string[]>([]);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const prefill = await loadClientPrefill(clientId);
      if (!prefill) throw new Error("Client record could not be loaded.");

      const base = {
        profile: prefill.profile,
        goals: prefill.goals,
        riskAnswers: prefill.riskAnswers,
        constraints: prefill.constraints,
        funds: prefill.funds,
        additionalSip: 0,
        declaredSipBudget: prefill.declaredSipBudget,
      };

      const risk = runEngine({ ...base, assumedReturnPct: 10 }).risk;
      const equityMid = (risk.equityRange[0] + risk.equityRange[1]) / 2;
      const assumedReturnPct = +(6 + (equityMid / 100) * 6).toFixed(1);

      setFunds(prefill.funds);
      setMissing(prefill.missing);
      setOutput(runEngine({ ...base, assumedReturnPct }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exposureFunds = funds
    .filter((f) => f.schemeCode)
    .map((f) => ({
      schemeCode: String(f.schemeCode),
      schemeName: f.schemeName,
      category: f.category,
      subCategory: f.subCategory,
      monthlySip: f.currentValue || f.sipAmount || 0,
    }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
          {output ? "Re-run review" : "Run portfolio review"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Runs the deterministic review on {clientName}'s recorded SIPs and holdings — right here.
        </p>
      </div>

      {error && (
        <Card className="border-destructive/40 p-4 space-y-3">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
          <Button variant="outline" size="sm" className="gap-2" onClick={run}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </Card>
      )}

      {output && missing.length > 0 && (
        <Card className="bg-financial-muted p-4 space-y-1">
          <p className="text-sm font-medium text-foreground">Not on record — confirm before advising</p>
          {missing.map((m) => (
            <p key={m} className="text-xs text-muted-foreground">• {m}</p>
          ))}
        </Card>
      )}

      {output && (
        <div className="space-y-6">
          <AnalysisPanel output={output} />
          <LookThroughExposure basis="value" funds={exposureFunds} />
          <SchemeOverlapMatrixPanel
            schemes={funds
              .filter((f) => f.schemeCode)
              .map((f) => ({
                schemeCode: String(f.schemeCode),
                schemeName: f.schemeName,
                subCategory: f.subCategory,
              }))}
          />
        </div>
      )}
    </div>
  );
};

export default ClientInlineReview;
