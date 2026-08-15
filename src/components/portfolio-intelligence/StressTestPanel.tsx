import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, AlertTriangle } from "lucide-react";
import { StressOutput } from "@/lib/pi/stress";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const basisBadge = (basis: "computed" | "assumption" | "mixed") =>
  basis === "computed"
    ? { label: "From live NAV history", tone: "bg-financial-accent/10 text-financial-accent" }
    : basis === "mixed"
      ? { label: "Part NAV history, part assumption", tone: "bg-financial-gold/10 text-financial-gold" }
      : { label: "Assumption set — no NAV history", tone: "bg-muted text-muted-foreground" };

const StressTestPanel = ({ stress }: { stress: StressOutput }) => {
  const overall = basisBadge(stress.basis);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-financial-accent" /> Stress test — one-year shocks
          </CardTitle>
          <Badge className={overall.tone} variant="secondary">{overall.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stress.scenarios.map((s) => {
            const negative = s.valueChange < 0;
            const tone = basisBadge(s.basis);
            return (
              <div key={s.key} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <Badge variant="secondary" className={`${tone.tone} text-[10px]`}>
                    {s.basis === "computed" ? "NAV" : s.basis === "mixed" ? "Mixed" : "Assumed"}
                  </Badge>
                </div>
                <p className={`text-2xl font-serif font-bold ${negative ? "text-destructive" : "text-foreground"}`}>
                  {s.portfolioReturnPct > 0 ? "+" : ""}{s.portfolioReturnPct}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {inr(s.endValue)} <span className="opacity-70">({negative ? "" : "+"}{inr(s.valueChange)})</span>
                </p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <p className="text-xs text-muted-foreground">{s.recoveryNote}</p>
                {s.goalNote && <p className="text-xs text-financial-gold">{s.goalNote}</p>}
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset class</TableHead>
                <TableHead className="text-right">Weight</TableHead>
                {stress.scenarios.map((s) => (
                  <TableHead key={s.key} className="text-right">{s.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stress.scenarios[0]?.buckets.map((b, idx) => (
                <TableRow key={b.bucket}>
                  <TableCell className="font-medium text-foreground">
                    {b.bucket}
                    {b.source === "assumption" && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">assumed</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{b.weightPct}%</TableCell>
                  {stress.scenarios.map((s) => {
                    const cell = s.buckets[idx];
                    return (
                      <TableCell
                        key={s.key}
                        className={`text-right ${cell && cell.shockPct < 0 ? "text-destructive" : "text-foreground"}`}
                      >
                        {cell ? `${cell.shockPct > 0 ? "+" : ""}${cell.shockPct}%` : "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {stress.dataGaps.length > 0 && (
          <div className="rounded-lg bg-financial-muted p-4 space-y-1.5">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-financial-gold" /> Where real data is missing
            </p>
            {stress.dataGaps.map((g) => (
              <p key={g} className="text-xs text-muted-foreground">• {g}</p>
            ))}
          </div>
        )}

        <div className="space-y-1">
          {stress.notes.map((n) => (
            <p key={n} className="text-xs text-muted-foreground">• {n}</p>
          ))}
          <p className="text-xs text-muted-foreground">
            Scenario set computed {new Date(stress.asOf).toLocaleString("en-IN")}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StressTestPanel;
