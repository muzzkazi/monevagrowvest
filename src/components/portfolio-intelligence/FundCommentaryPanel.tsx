import { useState } from "react";
import { AlertTriangle, Copy, Layers, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { collectAllowedNumbers, verifyNarrativeNumbers } from "@/lib/pi/aiFacts";
import { FundSelectionFacts } from "@/lib/pi/fundFacts";

export interface FundCommentaryEntry {
  schemeName: string;
  roleInPortfolio: string;
  whyItIsHeld: string;
  engineAction: string;
  actionExplanation: string;
  goalMapping: string;
  constraintFit: string;
  constraintNote: string;
  tradeOffs: string[];
  watchFor: string;
}

export interface FundCommentary {
  portfolioLogic: string;
  funds: FundCommentaryEntry[];
  overlapsAndGaps: string[];
  constraintConflicts: string[];
  notVerifiable: string[];
}

const commentaryToText = (c: FundCommentary) =>
  [
    "Portfolio logic",
    c.portfolioLogic,
    "",
    ...c.funds.flatMap((f) => [
      `${f.schemeName} — ${f.roleInPortfolio} [${f.engineAction}]`,
      `Why held: ${f.whyItIsHeld}`,
      `Action: ${f.actionExplanation}`,
      `Goal mapping: ${f.goalMapping}`,
      `Constraint fit: ${f.constraintFit} — ${f.constraintNote}`,
      ...f.tradeOffs.map((t) => `Trade-off: ${t}`),
      `Watch for: ${f.watchFor}`,
      "",
    ]),
    "Overlaps and gaps",
    ...c.overlapsAndGaps.map((x) => `• ${x}`),
    "",
    "Constraint conflicts",
    ...c.constraintConflicts.map((x) => `• ${x}`),
    "",
    "To confirm outside this data",
    ...c.notVerifiable.map((x) => `• ${x}`),
  ].join("\n");

const actionTone = (action: string) =>
  action === "INCREASE" || action === "ADD"
    ? "bg-financial-accent/10 text-financial-accent"
    : action === "REDUCE" || action === "STOP SIP"
      ? "bg-destructive/10 text-destructive"
      : "bg-financial-muted text-muted-foreground";

const fitTone = (fit: string) =>
  fit === "Fits stated constraints"
    ? "bg-financial-accent/10 text-financial-accent"
    : fit === "Conflicts with a stated constraint"
      ? "bg-destructive/10 text-destructive"
      : "bg-financial-gold/10 text-financial-gold";

const Bullets = ({ title, items }: { title: string; items: string[] }) =>
  items.length === 0 ? null : (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((x, i) => (
          <li key={i} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-financial-accent">•</span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );

const FundCommentaryPanel = ({
  facts,
  onCommentaryChange,
}: {
  facts: FundSelectionFacts;
  onCommentaryChange?: (c: FundCommentary | null) => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [commentary, setCommentary] = useState<FundCommentary | null>(null);
  const [unverified, setUnverified] = useState<string[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pi-fund-commentary", { body: { facts } });
      if (error) throw error;
      const payload = data as { commentary?: FundCommentary; error?: string; generatedAt?: string };
      if (payload?.error || !payload?.commentary) throw new Error(payload?.error || "No commentary returned");
      const c = payload.commentary;
      setCommentary(c);
      onCommentaryChange?.(c);
      setGeneratedAt(payload.generatedAt ?? new Date().toISOString());
      // Same numeric guardrail as the client note: no figure may exist here that
      // the deterministic fund fact sheet does not contain.
      setUnverified(verifyNarrativeNumbers(commentaryToText(c), collectAllowedNumbers(facts as never)));
    } catch (e) {
      toast({ title: "Commentary not generated", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!commentary) return;
    await navigator.clipboard.writeText(commentaryToText(commentary));
    toast({ title: "Fund commentary copied" });
  };

  return (
    <Card className="border-financial-gold/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-financial-gold" /> Fund-selection commentary
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {commentary && (
              <Badge
                variant="secondary"
                className={
                  unverified.length === 0
                    ? "bg-financial-accent/10 text-financial-accent gap-1"
                    : "bg-destructive/10 text-destructive gap-1"
                }
              >
                {unverified.length === 0 ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {unverified.length === 0 ? "All figures match the engine" : `${unverified.length} unverified figure(s)`}
              </Badge>
            )}
            {commentary && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={copy}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            )}
            <Button size="sm" onClick={generate} disabled={loading || facts.funds.length === 0} className="gap-1.5">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layers className="h-3.5 w-3.5" />}
              {commentary ? "Regenerate" : "Explain fund selection"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">
          Fund by fund: the reason it is held, the engine's action, the trade-offs, and how it maps to the client's goals
          and stated constraints. No scheme outside this run may be named and no figure may be invented.
        </p>

        {facts.funds.length === 0 && (
          <p className="text-sm text-muted-foreground">Add holdings in step 5 to generate fund-level commentary.</p>
        )}

        {unverified.length > 0 && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-1">
            <p className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Review before using
            </p>
            <p className="text-xs text-muted-foreground">
              These figures are not present in the engine output: {unverified.join(", ")}.
            </p>
          </div>
        )}

        {commentary && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Portfolio logic</h4>
              <p className="text-sm text-muted-foreground">{commentary.portfolioLogic}</p>
            </div>
            <Separator />
            <div className="space-y-3">
              {commentary.funds.map((f, i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{f.schemeName}</span>
                    <Badge variant="secondary" className={actionTone(f.engineAction)}>{f.engineAction}</Badge>
                    <Badge variant="secondary" className={fitTone(f.constraintFit)}>{f.constraintFit}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.roleInPortfolio}</p>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Why held: </strong>{f.whyItIsHeld}</p>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Action: </strong>{f.actionExplanation}</p>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Goal mapping: </strong>{f.goalMapping}</p>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground">Constraints: </strong>{f.constraintNote}</p>
                  {f.tradeOffs.length > 0 && (
                    <ul className="space-y-1">
                      {f.tradeOffs.map((t, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-financial-gold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-muted-foreground"><strong className="text-foreground">Watch for: </strong>{f.watchFor}</p>
                </div>
              ))}
            </div>

            <Bullets title="Overlaps and gaps" items={commentary.overlapsAndGaps} />
            <Bullets title="Constraint conflicts" items={commentary.constraintConflicts} />
            <Bullets title="To confirm outside this data" items={commentary.notVerifiable} />

            {generatedAt && (
              <p className="text-xs text-muted-foreground">
                Drafted {new Date(generatedAt).toLocaleString("en-IN")} from engine run as of {facts.asOf}. Advisor review
                required before sharing.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FundCommentaryPanel;
