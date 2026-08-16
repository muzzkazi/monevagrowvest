import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Gavel, Loader2, Lock, ShieldCheck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NarrativeFacts, collectAllowedNumbers, verifyNarrativeNumbers } from "@/lib/pi/aiFacts";
import { ChallengeFinding, ChallengeReport } from "@/lib/pi/challenge";

export interface AiChallengeReview {
  verdict: "Consistent" | "Needs advisor decision" | "Do not send";
  summary: string;
  flags: Array<{
    severity: "blocker" | "inconsistency" | "watch";
    area: string;
    issue: string;
    whyItMatters: string;
    advisorQuestion: string;
    basedOnDeterministicFindingId: string;
  }>;
  missingData: string[];
  readyForClientNote: boolean;
  blockingReasons: string[];
}

const severityTone: Record<ChallengeFinding["severity"], string> = {
  blocker: "bg-destructive/10 text-destructive",
  inconsistency: "bg-financial-gold/10 text-financial-gold",
  watch: "bg-financial-muted text-muted-foreground",
};

const reviewToText = (r: AiChallengeReview) =>
  [
    r.verdict,
    r.summary,
    ...r.flags.map((x) => `${x.severity} ${x.area}: ${x.issue} ${x.whyItMatters} ${x.advisorQuestion}`),
    ...r.missingData,
    ...r.blockingReasons,
  ].join("\n");

const FindingRow = ({ finding }: { finding: ChallengeFinding }) => (
  <li className="rounded-lg border border-border p-3 space-y-1">
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className={severityTone[finding.severity]}>
        {finding.severity}
      </Badge>
      <Badge variant="secondary">{finding.area}</Badge>
    </div>
    <p className="text-sm text-foreground">{finding.statement}</p>
    <p className="text-xs text-muted-foreground">
      Engine expects: {finding.expected} · Plan shows: {finding.observed}
    </p>
    <p className="text-xs text-foreground/80 italic">Ask: {finding.question}</p>
  </li>
);

const ChallengeReviewPanel = ({
  report,
  facts,
  onClearedChange,
}: {
  report: ChallengeReport;
  facts: NarrativeFacts;
  onClearedChange?: (cleared: boolean) => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<AiChallengeReview | null>(null);
  const [unverified, setUnverified] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);

  const hardBlocked = report.blockers.length > 0;
  const aiBlocked = review ? !review.readyForClientNote : false;

  // The note unlocks only when the deterministic checks pass, the AI review has
  // run, it did not block, and the advisor has explicitly accepted the review.
  const cleared = useMemo(
    () => !hardBlocked && !!review && !aiBlocked && acknowledged,
    [hardBlocked, review, aiBlocked, acknowledged],
  );

  useEffect(() => {
    onClearedChange?.(cleared);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleared]);

  // Any change to the engine facts invalidates a previous clearance.
  useEffect(() => {
    setReview(null);
    setUnverified([]);
    setAcknowledged(false);
  }, [facts]);

  const runReview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pi-challenge", {
        body: { facts, findings: report.findings },
      });
      if (error) throw error;
      const payload = data as { review?: AiChallengeReview; error?: string };
      if (payload?.error || !payload?.review) throw new Error(payload?.error || "No review returned");
      setReview(payload.review);
      setAcknowledged(false);
      setUnverified(verifyNarrativeNumbers(reviewToText(payload.review), collectAllowedNumbers(facts)));
    } catch (e) {
      toast({ title: "Challenge review not generated", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusTone = hardBlocked
    ? "bg-destructive/10 text-destructive"
    : report.inconsistencies.length > 0
      ? "bg-financial-gold/10 text-financial-gold"
      : "bg-financial-accent/10 text-financial-accent";

  return (
    <Card
      role="region"
      aria-labelledby="challenge-review-title"
      className={hardBlocked ? "border-destructive/40" : "border-financial-gold/30"}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle id="challenge-review-title" className="text-base flex items-center gap-2">
            <Gavel className="h-4 w-4 text-financial-gold" aria-hidden /> Challenge &amp; sanity review
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={statusTone}>
              {report.blockers.length} blocker(s) · {report.inconsistencies.length} inconsistency(ies) ·{" "}
              {report.watchItems.length} to watch
            </Badge>
            {review && (
              <Badge
                variant="secondary"
                className={
                  unverified.length === 0
                    ? "bg-financial-accent/10 text-financial-accent gap-1"
                    : "bg-destructive/10 text-destructive gap-1"
                }
              >
                {unverified.length === 0 ? <ShieldCheck className="h-3 w-3" aria-hidden /> : <AlertTriangle className="h-3 w-3" aria-hidden />}
                {unverified.length === 0 ? "All figures match the engine" : `${unverified.length} unverified figure(s)`}
              </Badge>
            )}
            <Button size="sm" variant="outline" className="gap-1.5" onClick={runReview} disabled={loading} aria-busy={loading || undefined}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Gavel className="h-3.5 w-3.5" aria-hidden />}
              {review ? "Re-run review" : "Run challenge review"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          The engine's own output is cross-examined against the recommendations before anything client-facing is
          written. Deterministic checks run first; the AI reviewer may only interpret those numbers and add tensions it
          can point at in the fact sheet.
        </p>

        {report.findings.length === 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-financial-accent/30 bg-financial-accent/5 p-3" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-financial-accent" aria-hidden />
            <p className="text-sm text-foreground">
              Deterministic checks found no contradiction between the engine output and the recommended plan.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Deterministic checks</h4>
            <ul className="space-y-2" aria-label="Deterministic challenge findings">
              {report.findings.map((x) => (
                <FindingRow key={x.id} finding={x} />
              ))}
            </ul>
          </div>
        )}

        {hardBlocked && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3" role="alert" aria-live="assertive">
            <Lock className="h-4 w-4 mt-0.5 text-destructive shrink-0" aria-hidden />
            <p className="text-sm text-foreground">
              The client-facing review note stays locked while a blocker is open. Fix the blocker above, re-run the
              analysis, then review again.
            </p>
          </div>
        )}

        {review && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    review.verdict === "Consistent"
                      ? "bg-financial-accent/10 text-financial-accent"
                      : review.verdict === "Needs advisor decision"
                        ? "bg-financial-gold/10 text-financial-gold"
                        : "bg-destructive/10 text-destructive"
                  }
                >
                  AI verdict: {review.verdict}
                </Badge>
                {!review.readyForClientNote && (
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive gap-1">
                    <XCircle className="h-3 w-3" aria-hidden /> Not ready for a client note
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{review.summary}</p>

              {review.flags.length > 0 && (
                <ul className="space-y-2" aria-label="AI challenge flags">
                  {review.flags.map((x, i) => (
                    <li key={i} className="rounded-lg border border-border p-3 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className={severityTone[x.severity] ?? severityTone.watch}>
                          {x.severity}
                        </Badge>
                        <Badge variant="secondary">{x.area}</Badge>
                        <span className="text-xs text-muted-foreground">
                          source: {x.basedOnDeterministicFindingId}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{x.issue}</p>
                      <p className="text-xs text-muted-foreground">{x.whyItMatters}</p>
                      <p className="text-xs text-foreground/80 italic">Ask: {x.advisorQuestion}</p>
                    </li>
                  ))}
                </ul>
              )}

              {review.missingData.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Missing to judge this properly</h4>
                  <ul className="space-y-1" aria-label="Missing data for the review">
                    {review.missingData.map((x, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {x}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.blockingReasons.length > 0 && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-1" role="alert" aria-live="assertive">
                  <p className="text-sm font-medium text-destructive">Reasons the note is held back</p>
                  <ul className="space-y-1" aria-label="Reasons the client note is held back">
                    {review.blockingReasons.map((x, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {x}</li>
                    ))}
                  </ul>
                </div>
              )}

              {unverified.length > 0 && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3" role="alert" aria-live="assertive">
                  <p className="text-sm text-destructive">
                    The reviewer printed figures the engine never produced ({unverified.join(", ")}). Treat this review
                    as unreliable and re-run it.
                  </p>
                </div>
              )}

              {!hardBlocked && review.readyForClientNote && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-financial-accent/30 bg-financial-accent/5 p-3">
                  <p className="text-sm text-foreground">
                    {acknowledged
                      ? "Review accepted — the client-facing note is unlocked."
                      : "Accept this review to unlock the client-facing note."}
                  </p>
                  <Button
                    size="sm"
                    variant={acknowledged ? "outline" : "default"}
                    className="gap-1.5"
                    onClick={() => setAcknowledged((v) => !v)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    {acknowledged ? "Withdraw acceptance" : "Accept review"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeReviewPanel;
