import { useMemo } from "react";
import { Code2, FileDown, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { NarrativeFacts } from "@/lib/pi/aiFacts";
import { FundSelectionFacts } from "@/lib/pi/fundFacts";
import { buildOnePager, renderOnePagerHtml } from "@/lib/pi/onePager";
import { generateOnePagerPdf } from "@/lib/pi/onePagerPdf";
import type { ClientNarrative } from "@/components/portfolio-intelligence/NarrativePanel";
import type { FundCommentary } from "@/components/portfolio-intelligence/FundCommentaryPanel";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const OnePageSummaryPanel = ({
  facts,
  fundFacts,
  narrative,
  commentary,
}: {
  facts: NarrativeFacts;
  fundFacts: FundSelectionFacts | null;
  narrative: ClientNarrative | null;
  commentary: FundCommentary | null;
}) => {
  const { toast } = useToast();
  const model = useMemo(
    () => buildOnePager({ facts, fundFacts, narrative, commentary }),
    [facts, fundFacts, narrative, commentary],
  );

  const downloadHtml = () => {
    const blob = new Blob([renderOnePagerHtml(model)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneva-client-summary-${model.clientName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "One-page summary downloaded (HTML)" });
  };

  const openHtml = () => {
    const w = window.open("", "_blank");
    if (!w) {
      toast({ title: "Pop-up blocked", description: "Allow pop-ups to preview the summary.", variant: "destructive" });
      return;
    }
    w.document.write(renderOnePagerHtml(model));
    w.document.close();
  };

  const downloadPdf = () => {
    try {
      generateOnePagerPdf(model);
      toast({ title: "One-page summary downloaded (PDF)" });
    } catch (e) {
      toast({ title: "Export failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <Card className="border-financial-accent/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-financial-accent" /> One-page client summary
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={openHtml}>
              <Code2 className="h-3.5 w-3.5" /> Preview HTML
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadHtml}>
              <FileDown className="h-3.5 w-3.5" /> HTML
            </Button>
            <Button size="sm" className="gap-1.5" onClick={downloadPdf}>
              <FileDown className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">
          A single crisp page for the client: narrative overview, snapshot, goal readiness, fund-to-goal mapping,
          trade-offs and scenarios. It reuses the verified note and commentary — nothing is recomputed here.
        </p>

        {model.missing.length > 0 && (
          <div className="rounded-lg border border-financial-gold/40 bg-financial-gold/5 p-3 space-y-1">
            <p className="text-sm font-medium text-financial-gold">Summary will note these gaps</p>
            {model.missing.slice(0, 4).map((m) => (
              <p key={m} className="text-xs text-muted-foreground">• {m}</p>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-border p-4 space-y-4 bg-card">
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-semibold text-foreground">{model.headline}</h3>
            <p className="text-xs text-muted-foreground">
              {model.clientName} · {model.runName} · engine run as of {model.asOf}
            </p>
            <p className="text-sm text-muted-foreground">{model.overview}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {model.snapshot.map((s) => (
              <div key={s.label} className="rounded-md border border-border px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{model.profileLine}</p>
            <p className="text-sm text-muted-foreground">{model.riskLine}</p>
          </div>

          {model.goalReadiness.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Goal readiness</h4>
              {model.goalReadiness.map((g) => (
                <div key={g.goal} className="rounded-md bg-financial-muted px-3 py-2 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{g.goal}</span>
                    <Badge variant="secondary" className="text-[10px]">{g.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{g.note}</p>
                </div>
              ))}
            </div>
          )}

          {model.fundMapping.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Fund to goal mapping</h4>
              {model.fundMapping.map((f) => (
                <div key={f.scheme} className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {f.scheme} <span className="text-xs text-muted-foreground">· {f.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{f.role} — {f.goalMapping}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {model.tradeOffs.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Key trade-offs</h4>
                {model.tradeOffs.map((t) => (
                  <p key={t} className="text-xs text-muted-foreground">• {t}</p>
                ))}
              </div>
            )}
            {model.scenarios.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">One-year scenarios</h4>
                {model.scenarios.map((s) => (
                  <p key={s.scenario} className="text-xs text-muted-foreground">
                    {s.scenario}: {s.returnPct > 0 ? "+" : ""}{s.returnPct}% · {inr(s.endValue)}
                  </p>
                ))}
              </div>
            )}
          </div>

          {model.nextSteps.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Next steps</h4>
              {model.nextSteps.map((t) => (
                <p key={t} className="text-xs text-muted-foreground">• {t}</p>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnePageSummaryPanel;
