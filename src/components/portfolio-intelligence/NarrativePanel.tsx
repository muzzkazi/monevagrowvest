import { useState } from "react";
import { AlertTriangle, Copy, FileText, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NarrativeFacts, collectAllowedNumbers, verifyNarrativeNumbers } from "@/lib/pi/aiFacts";

export interface ClientNarrative {
  headline: string;
  openingParagraph: string;
  yourProfileInPlainEnglish: string;
  goalReadiness: Array<{ goal: string; status: string; explanation: string }>;
  whatWeAreChanging: Array<{ change: string; reason: string }>;
  whyThisHelps: string[];
  tradeOffs: string[];
  whatWeNeedFromYou: string[];
  assumptionsStated: string[];
  closingParagraph: string;
}

const narrativeToText = (n: ClientNarrative) =>
  [
    n.headline,
    "",
    n.openingParagraph,
    "",
    "Your profile",
    n.yourProfileInPlainEnglish,
    "",
    "Goal readiness",
    ...n.goalReadiness.map((g) => `• ${g.goal} — ${g.status}: ${g.explanation}`),
    "",
    "What we are changing",
    ...n.whatWeAreChanging.map((c) => `• ${c.change} — ${c.reason}`),
    "",
    "Why this helps",
    ...n.whyThisHelps.map((x) => `• ${x}`),
    "",
    "Trade-offs",
    ...n.tradeOffs.map((x) => `• ${x}`),
    "",
    "What we need from you",
    ...n.whatWeNeedFromYou.map((x) => `• ${x}`),
    "",
    "Assumptions",
    ...n.assumptionsStated.map((x) => `• ${x}`),
    "",
    n.closingParagraph,
  ].join("\n");

const statusTone = (status: string) =>
  status === "On track"
    ? "bg-financial-accent/10 text-financial-accent"
    : status === "Slightly short"
      ? "bg-financial-gold/10 text-financial-gold"
      : status === "Materially short"
        ? "bg-destructive/10 text-destructive"
        : "bg-financial-muted text-muted-foreground";

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

const NarrativePanel = ({ facts }: { facts: NarrativeFacts }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState<ClientNarrative | null>(null);
  const [unverified, setUnverified] = useState<string[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pi-narrative", { body: { facts } });
      if (error) throw error;
      const payload = data as { narrative?: ClientNarrative; error?: string; generatedAt?: string };
      if (payload?.error || !payload?.narrative) throw new Error(payload?.error || "No narrative returned");
      const n = payload.narrative;
      setNarrative(n);
      setGeneratedAt(payload.generatedAt ?? new Date().toISOString());
      // Guardrail: no figure may exist in the note that is absent from the engine facts.
      setUnverified(verifyNarrativeNumbers(narrativeToText(n), collectAllowedNumbers(facts)));
    } catch (e) {
      toast({ title: "Narrative not generated", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!narrative) return;
    await navigator.clipboard.writeText(narrativeToText(narrative));
    toast({ title: "Review note copied" });
  };

  return (
    <Card className="border-financial-accent/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-financial-accent" /> Client-facing review note
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {narrative && (
              <Badge
                variant="secondary"
                className={unverified.length === 0 ? "bg-financial-accent/10 text-financial-accent gap-1" : "bg-destructive/10 text-destructive gap-1"}
              >
                {unverified.length === 0 ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {unverified.length === 0 ? "All figures match the engine" : `${unverified.length} unverified figure(s)`}
              </Badge>
            )}
            {narrative && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={copy}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            )}
            <Button size="sm" onClick={generate} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              {narrative ? "Regenerate" : "Write client note"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">
          The AI writes the explanation only. It receives the engine's numbers as read-only facts, is blocked from
          producing new figures, and every figure in the note is checked back against the engine before you send it.
        </p>

        {!narrative && !loading && (
          <p className="text-sm text-muted-foreground">
            Generate a plain-English note for <strong className="text-foreground">{facts.client.name}</strong> covering
            profile, goal readiness, the SIP changes and what is pending.
          </p>
        )}

        {unverified.length > 0 && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-1">
            <p className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Do not send as-is
            </p>
            <p className="text-xs text-muted-foreground">
              These figures are not present in the engine output: {unverified.join(", ")}. Regenerate or remove them.
            </p>
          </div>
        )}

        {narrative && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-semibold text-foreground">{narrative.headline}</h3>
              <p className="text-sm text-muted-foreground">{narrative.openingParagraph}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Your profile</h4>
              <p className="text-sm text-muted-foreground">{narrative.yourProfileInPlainEnglish}</p>
            </div>

            {narrative.goalReadiness.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Goal readiness</h4>
                <div className="space-y-2">
                  {narrative.goalReadiness.map((g, i) => (
                    <div key={i} className="rounded-lg border border-border p-3 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{g.goal}</span>
                        <Badge variant="secondary" className={statusTone(g.status)}>{g.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{g.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {narrative.whatWeAreChanging.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">What we are changing</h4>
                <div className="space-y-2">
                  {narrative.whatWeAreChanging.map((c, i) => (
                    <div key={i} className="rounded-lg bg-financial-muted p-3 space-y-1">
                      <p className="text-sm font-medium text-foreground">{c.change}</p>
                      <p className="text-sm text-muted-foreground">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Bullets title="Why this helps" items={narrative.whyThisHelps} />
            <Bullets title="Trade-offs to accept" items={narrative.tradeOffs} />
            <Bullets title="What we need from you" items={narrative.whatWeNeedFromYou} />
            <Bullets title="Assumptions used" items={narrative.assumptionsStated} />

            <Separator />
            <p className="text-sm text-muted-foreground">{narrative.closingParagraph}</p>
            {generatedAt && (
              <p className="text-xs text-muted-foreground">
                Drafted {new Date(generatedAt).toLocaleString("en-IN")} from engine run as of {facts.asOf}. Advisor review
                required before sending.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NarrativePanel;
