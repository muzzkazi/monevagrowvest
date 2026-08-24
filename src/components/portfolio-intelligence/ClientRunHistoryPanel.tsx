// Client-facing history of Portfolio Intelligence runs.
//
// Each row is a saved run for this client. Outputs are read from the snapshot
// captured at save time; when a run has no snapshot the deterministic engine is
// re-run on the saved inputs, so nothing shown here is inferred or estimated.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, BrainCircuit, FileDown, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { listRuns, loadRun, PiRunSummary } from "@/lib/pi/runs";
import { runEngine } from "@/lib/pi/engine";
import { generateRunPdf } from "@/lib/pi/runPdf";
import type { EngineOutput } from "@/lib/pi/types";

const inr = (n: number) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;

interface RunRow extends PiRunSummary {
  output: EngineOutput | null;
}

const delta = (curr: number, prev: number | undefined) => {
  if (prev === undefined || !Number.isFinite(prev) || curr === prev) return null;
  const d = curr - prev;
  return (
    <span className={d > 0 ? "text-financial-accent" : "text-destructive"}>
      {d > 0 ? "+" : ""}
      {Math.round(d)}
    </span>
  );
};

const ClientRunHistoryPanel = ({ clientId, clientName }: { clientId: string; clientName: string }) => {
  const [rows, setRows] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summaries = await listRuns(clientId);
      const full = await Promise.all(
        summaries.map(async (s): Promise<RunRow> => {
          try {
            const run = await loadRun(s.id);
            const output =
              run.snapshot ?? runEngine({ ...run.inputs, assumedReturnPct: run.assumedReturnPct ?? 10 });
            return { ...s, output };
          } catch {
            return { ...s, output: null };
          }
        }),
      );
      setRows(full);
    } catch (e) {
      setError((e as Error).message || "Could not load the run history.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  /* Oldest → newest so each row can be compared with the run before it. */
  const chronological = useMemo(() => [...rows].reverse(), [rows]);

  const exportRun = async (id: string) => {
    setExportingId(id);
    try {
      const run = await loadRun(id);
      const output =
        run.snapshot ?? runEngine({ ...run.inputs, assumedReturnPct: run.assumedReturnPct ?? 10 });
      generateRunPdf({
        runName: run.runName,
        runId: run.id,
        clientId: run.clientId,
        savedAt: run.updatedAt,
        inputs: run.inputs,
        assumedReturnPct: run.assumedReturnPct ?? 10,
        output,
      });
      toast.success("Portfolio review PDF downloaded");
    } catch (e) {
      toast.error("Export failed", { description: (e as Error).message });
    } finally {
      setExportingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading {clientName}'s analysis runs…
        </div>
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 space-y-3 border-destructive/40 bg-destructive/5">
        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4" /> Could not load the run history
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="gap-2" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="p-10 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          No portfolio analysis runs saved for this client yet.
        </p>
        <Button asChild size="sm" className="gap-2">
          <Link to={`/admin/portfolio-intelligence?client=${clientId}`}>
            <BrainCircuit className="h-4 w-4" /> Run portfolio analysis
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length} saved run(s) — oldest first, so you can read how the plan moved over time.
        </p>
        <Button variant="ghost" size="sm" className="gap-2" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run</TableHead>
              <TableHead>Risk profile</TableHead>
              <TableHead>Fit score</TableHead>
              <TableHead>Complexity</TableHead>
              <TableHead>Portfolio value</TableHead>
              <TableHead>Monthly SIP</TableHead>
              <TableHead>Actions raised</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {chronological.map((r, i) => {
              const prev = chronological[i - 1]?.output ?? null;
              const o = r.output;
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{r.runName}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.updatedAt).toLocaleString("en-IN")}
                    </div>
                  </TableCell>
                  {o ? (
                    <>
                      <TableCell className="text-sm capitalize">{o.risk.finalProfile}</TableCell>
                      <TableCell className="text-sm">
                        {o.scores.fitScore}/100 {delta(o.scores.fitScore, prev?.scores.fitScore)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {o.scores.complexityScore}{" "}
                        <Badge variant="secondary" className="ml-1">{o.scores.complexityBand}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{inr(o.totals.currentValue)}</TableCell>
                      <TableCell className="text-sm">{inr(o.totals.currentSip)}/m</TableCell>
                      <TableCell className="text-sm">
                        {o.sipPlan.filter((s) => s.action !== "KEEP").length}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell colSpan={6} className="text-sm text-muted-foreground">
                      Output could not be reproduced from this run's saved inputs.
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/admin/portfolio-intelligence?client=${clientId}`}>Open</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={exportingId === r.id}
                        onClick={() => exportRun(r.id)}
                      >
                        {exportingId === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FileDown className="h-3.5 w-3.5" />
                        )}
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <p className="text-xs text-muted-foreground">
        Every PDF is regenerated from that run's saved inputs, so an export always matches what was reviewed then.
      </p>
    </div>
  );
};

export default ClientRunHistoryPanel;
