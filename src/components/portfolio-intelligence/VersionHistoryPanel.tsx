import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FileDown, History, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FieldChange, PiRunVersion, diffVersions, listVersions } from "@/lib/pi/versions";
import { runEngine } from "@/lib/pi/engine";
import { generateRunPdf } from "@/lib/pi/runPdf";

const ChangeList = ({ title, rows }: { title: string; rows: FieldChange[] }) => {
  if (!rows.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {rows.map((r) => (
        <div key={`${title}-${r.label}`} className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground min-w-[9rem]">{r.label}</span>
          <span className="text-muted-foreground line-through">{r.from}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
          <span className="font-medium text-foreground">{r.to}</span>
        </div>
      ))}
    </div>
  );
};

const VersionHistoryPanel = ({
  runId,
  refreshToken,
}: {
  runId: string | null;
  /** Bump to reload the list after a new save. */
  refreshToken: number;
}) => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<PiRunVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");

  useEffect(() => {
    if (!runId) {
      setVersions([]);
      return;
    }
    setLoading(true);
    listVersions(runId)
      .then((v) => {
        setVersions(v);
        setToId(v[0]?.id ?? "");
        setFromId(v[1]?.id ?? v[0]?.id ?? "");
      })
      .catch((e) => toast({ title: "Could not load version history", description: (e as Error).message, variant: "destructive" }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, refreshToken]);

  const diff = useMemo(() => {
    const a = versions.find((v) => v.id === fromId);
    const b = versions.find((v) => v.id === toId);
    if (!a || !b || a.id === b.id) return null;
    const [older, newer] = a.versionNo <= b.versionNo ? [a, b] : [b, a];
    return diffVersions(older, newer);
  }, [versions, fromId, toId]);

  const exportVersion = (v: PiRunVersion) => {
    try {
      const output =
        v.output ?? runEngine({ ...v.inputs, assumedReturnPct: v.assumedReturnPct ?? 10 });
      generateRunPdf({
        runName: v.runName,
        versionNo: v.versionNo,
        inputs: v.inputs,
        assumedReturnPct: v.assumedReturnPct ?? 10,
        output,
      });
    } catch (e) {
      toast({ title: "Export failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (!runId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-financial-accent" /> Version history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Save the run first. Every save then appends a numbered version you can compare and export.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-financial-accent" /> Version history
          {versions.length > 0 && <Badge variant="secondary">{versions.length} version(s)</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading versions…
          </div>
        ) : versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No versions recorded yet for this run.</p>
        ) : (
          <>
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      v{v.versionNo} · {v.runName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(v.createdAt).toLocaleString("en-IN")}
                      {v.output ? ` · fit ${v.output.scores.fitScore}/100` : " · output not captured"}
                      {v.changeNote ? ` · ${v.changeNote}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportVersion(v)}>
                    <FileDown className="h-3.5 w-3.5" /> PDF
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Compare from</Label>
                <Select value={fromId} onValueChange={setFromId}>
                  <SelectTrigger><SelectValue placeholder="Earlier version" /></SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>v{v.versionNo} — {new Date(v.createdAt).toLocaleDateString("en-IN")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Compare to</Label>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger><SelectValue placeholder="Later version" /></SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>v{v.versionNo} — {new Date(v.createdAt).toLocaleDateString("en-IN")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {diff ? (
              diff.unchanged ? (
                <p className="text-sm text-muted-foreground">
                  v{diff.from.versionNo} and v{diff.to.versionNo} are identical on profile, risk, goals, holdings and
                  engine outputs.
                </p>
              ) : (
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    v{diff.from.versionNo} → v{diff.to.versionNo}
                  </p>
                  <ChangeList title="Profile" rows={diff.profile} />
                  <ChangeList title="Risk answers" rows={diff.risk} />
                  <ChangeList title="Goals" rows={diff.goals} />
                  {diff.holdings.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Holdings</p>
                      {diff.holdings.map((h) => (
                        <div key={`${h.scheme}-${h.kind}`} className="rounded-md border border-border p-2.5">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                h.kind === "added"
                                  ? "bg-financial-accent/10 text-financial-accent"
                                  : h.kind === "removed"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-financial-gold/10 text-financial-gold"
                              }
                            >
                              {h.kind}
                            </Badge>
                            <span className="text-sm text-foreground">{h.scheme}</span>
                          </div>
                          <div className="mt-1.5">
                            <ChangeList title="" rows={h.changes} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <ChangeList title="Engine outputs" rows={diff.outputs} />
                </div>
              )
            ) : (
              <p className="text-xs text-muted-foreground">Pick two different versions to see what changed.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VersionHistoryPanel;
