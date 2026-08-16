import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Lock, MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NarrativeFacts, collectAllowedNumbers, verifyNarrativeNumbers } from "@/lib/pi/aiFacts";
import { FundSelectionFacts } from "@/lib/pi/fundFacts";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  unverified?: string[];
}

const SUGGESTIONS = [
  "Why is the equity target set where it is for this client?",
  "Which goal is most at risk in this run, and what drives it?",
  "Justify the largest SIP change if the client pushes back.",
  "What is still missing before I can implement this plan?",
];

const AdvisorChatPanel = ({
  facts,
  fundFacts,
  gate,
}: {
  facts: NarrativeFacts;
  fundFacts: FundSelectionFacts | null;
  gate: { challengeCleared: boolean; runName: string; runId: string | null; blockers: string[] };
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    const history = [...messages, { role: "user" as const, content: question }];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pi-chat", {
        body: {
          facts,
          fundFacts,
          gate,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      const payload = data as { reply?: string; error?: string };
      if (payload?.error || !payload?.reply) throw new Error(payload?.error || "No answer returned");
      // Same guardrail: any figure in the answer must exist in the run's facts.
      const allowed = collectAllowedNumbers(facts);
      collectAllowedNumbers((fundFacts ?? {}) as never).forEach((n) => allowed.add(n));
      setMessages((m) => [
        ...m,
        { role: "assistant", content: payload.reply!, unverified: verifyNarrativeNumbers(payload.reply!, allowed) },
      ]);
    } catch (e) {
      toast({ title: "Answer not generated", description: (e as Error).message, variant: "destructive" });
      setMessages((m) => m.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Card className="border-financial-accent/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-financial-accent" /> Ask about this run
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={
                gate.challengeCleared
                  ? "bg-financial-accent/10 text-financial-accent"
                  : "bg-financial-gold/10 text-financial-gold gap-1"
              }
            >
              {!gate.challengeCleared && <Lock className="h-3 w-3" />}
              {gate.challengeCleared ? "Review gate cleared" : "Review gate not cleared"}
            </Badge>
            {messages.length > 0 && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setMessages([])}>
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Answers are grounded in this run only — the deterministic engine output, the fund facts and the review gate. The
          assistant cannot compute new figures, name funds outside the run, or overrule the engine; anything absent from
          the data is reported as missing.
        </p>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Button key={s} size="sm" variant="outline" className="text-xs h-auto py-1.5" onClick={() => send(s)}>
                {s}
              </Button>
            ))}
          </div>
        )}

        <div className="space-y-3" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "rounded-lg bg-financial-muted p-3 ml-auto max-w-[85%]"
                  : "rounded-lg border border-border p-3 max-w-[95%] space-y-2"
              }
            >
              <p className="text-sm text-foreground whitespace-pre-wrap">{m.content}</p>
              {m.role === "assistant" && (m.unverified?.length ?? 0) > 0 && (
                <p className="text-xs text-destructive flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  Figures not found in this run's data: {m.unverified!.join(", ")} — verify before repeating them.
                </p>
              )}
            </div>
          ))}
          {loading && (
            <div className="rounded-lg border border-border p-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading the run…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={`Ask a follow-up about "${gate.runName}"…`}
            aria-label="Ask a follow-up question about this run"
            rows={2}
            className="resize-none"
          />
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="gap-1.5">
            <Send className="h-3.5 w-3.5" /> Ask
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvisorChatPanel;
