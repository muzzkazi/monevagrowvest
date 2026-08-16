import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Info, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { EngineOutput } from "@/lib/pi/types";
import GlossaryTerm from "@/components/portfolio-intelligence/GlossaryTerm";

const inr = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

const NoData = ({ label }: { label: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-xs italic text-muted-foreground">Insufficient current data</span>
  </div>
);

const actionTone: Record<string, string> = {
  KEEP: "bg-financial-muted text-muted-foreground",
  INCREASE: "bg-financial-accent/10 text-financial-accent",
  ADD: "bg-financial-accent/10 text-financial-accent",
  REDUCE: "bg-financial-gold/10 text-financial-gold",
  "STOP SIP": "bg-destructive/10 text-destructive",
};

const AnalysisPanel = ({ output }: { output: EngineOutput }) => {
  const { risk, allocation, equitySleeves, concentration, redundancy, sipPlan, scores, goals, totals, integrity } = output;
  const asOf = new Date(output.asOf).toLocaleString("en-IN");
  const plannedTotal = sipPlan.reduce((s, a) => s + a.recommendedSip, 0);

  return (
    <div className="space-y-6">
      {/* Data integrity first — never silently fix inconsistent data */}
      {integrity.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Data integrity checks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {integrity.map((i) => (
              <p key={i} className="text-sm text-muted-foreground">• {i}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scores */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Portfolio fit score</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-serif font-bold text-foreground">{scores.fitScore}<span className="text-base text-muted-foreground">/100</span></p>
            {scores.fitBreakdown.map((b) => (
              <div key={b.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="text-foreground">{b.score}</span>
                </div>
                <Progress value={b.score} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Complexity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-serif font-bold text-foreground">{scores.complexityScore}</p>
            <Badge variant="secondary">{scores.complexityBand}</Badge>
            <p className="text-xs text-muted-foreground">More funds is not better. Duplicated roles and thematic funds raise this score.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Risk profile</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-serif font-bold text-foreground">{risk.finalProfile}</p>
            <p className="text-xs text-muted-foreground">
              <GlossaryTerm id="equityRange">Equity band</GlossaryTerm> {risk.equityRange[0]}-{risk.equityRange[1]}% ·{" "}
              <GlossaryTerm id="bindingConstraint">binding constraint</GlossaryTerm>:{" "}
              <strong className="text-foreground">{risk.bindingConstraint}</strong>
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[["Tolerance", risk.tolerance], ["Capacity", risk.capacity], ["Need", risk.need]].map(([label, d]) => {
                const dim = d as typeof risk.tolerance;
                return (
                  <div key={label as string} className="rounded-md bg-financial-muted p-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label as string}</p>
                    <p className="text-sm font-semibold text-foreground">{dim.score}</p>
                    <p className="text-[10px] text-muted-foreground">{dim.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk drivers */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Why this risk profile</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {([["Risk tolerance", risk.tolerance, "riskTolerance"], ["Risk capacity", risk.capacity, "riskCapacity"], ["Risk need", risk.need, "riskNeed"]] as const).map(([label, d, gid]) => {
            const dim = d as typeof risk.tolerance;
            return (
              <div key={label as string} className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  <GlossaryTerm id={gid}>{label as string}</GlossaryTerm> — {dim.label}
                </p>
                {dim.drivers.map((x) => <p key={x} className="text-xs text-muted-foreground">• {x}</p>)}
              </div>
            );
          })}
          {risk.notes.length > 0 && (
            <div className="sm:col-span-3 rounded-md bg-financial-muted p-3 space-y-1">
              {risk.notes.map((n) => <p key={n} className="text-xs text-muted-foreground">• {n}</p>)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Total portfolio view</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-5">
          {[
            ["Current MF corpus", inr(totals.currentValue)],
            ["Invested", inr(totals.invested)],
            ["Current monthly SIP", inr(totals.currentSip)],
            ["New monthly SIP", inr(totals.additionalSip)],
            ["Other assets", inr(totals.totalOtherAssets)],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="text-lg font-semibold text-foreground">{v}</p>
            </div>
          ))}
          <div className="sm:col-span-5 space-y-1 pt-2 border-t border-border">
            <NoData label="Portfolio XIRR" />
            <NoData label="Portfolio beta vs Nifty 50" />
            <NoData label="Sharpe / Sortino / max drawdown" />
          </div>
        </CardContent>
      </Card>

      {/* Allocation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Target asset allocation vs current</CardTitle>
          <p className="text-xs text-muted-foreground">Allocation is decided before any fund is selected.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset bucket</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Gap</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocation.map((r) => (
                <TableRow key={r.bucket}>
                  <TableCell className="font-medium text-foreground">{r.bucket}</TableCell>
                  <TableCell className="text-right">{r.currentPct.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{r.targetPct.toFixed(1)}%</TableCell>
                  <TableCell className={`text-right font-medium ${r.gapPct > 1 ? "text-financial-accent" : r.gapPct < -1 ? "text-destructive" : "text-muted-foreground"}`}>
                    <span className="inline-flex items-center gap-1">
                      {r.gapPct > 1 ? <TrendingUp className="h-3 w-3" /> : r.gapPct < -1 ? <TrendingDown className="h-3 w-3" /> : null}
                      {pct(r.gapPct)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{inr(r.currentValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Equity sleeves */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Indian equity sleeves</CardTitle>
          <p className="text-xs text-muted-foreground">Sector and thematic funds are treated as satellite, never core.</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          {equitySleeves.map((s) => (
            <div key={s.sleeve} className="rounded-lg bg-financial-muted p-4">
              <p className="text-xs text-muted-foreground">{s.sleeve}</p>
              <p className="text-xl font-semibold text-foreground">{s.currentPct.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Target {s.targetPct.toFixed(1)}% · gap {pct(s.gapPct)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Concentration + redundancy */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Concentration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {concentration.length === 0 && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-financial-accent" /> No concentration thresholds breached.
              </p>
            )}
            {concentration.map((c) => (
              <div key={c.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{c.label}</p>
                  <Badge variant={c.severity === "Warning" ? "destructive" : "secondary"}>
                    {c.pct.toFixed(1)}% · {c.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Role redundancy &amp; overlap</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {redundancy.length === 0 && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-financial-accent" /> Every fund has a distinct portfolio role.
              </p>
            )}
            {redundancy.map((r) => (
              <div key={r.role} className="space-y-1">
                <p className="text-sm font-medium text-foreground">{r.role}</p>
                <p className="text-xs text-muted-foreground">{r.funds.join(" · ")}</p>
                <p className="text-xs text-muted-foreground">{r.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Goals */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Goal projection</CardTitle></CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals captured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goal</TableHead>
                  <TableHead>Horizon</TableHead>
                  <TableHead className="text-right">Future cost</TableHead>
                  <TableHead className="text-right">Projected</TableHead>
                  <TableHead className="text-right">Funded</TableHead>
                  <TableHead className="text-right">Required return</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((g) => (
                  <TableRow key={g.goal.id}>
                    <TableCell className="font-medium text-foreground">
                      {g.goal.name || g.goal.category}
                      {g.goal.essential && <Badge variant="secondary" className="ml-2">Essential</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{g.yearsToGoal}y · {g.horizonClass}</TableCell>
                    <TableCell className="text-right">{inr(g.futureCost)}</TableCell>
                    <TableCell className="text-right">{inr(g.projectedCorpus)}</TableCell>
                    <TableCell className={`text-right font-medium ${g.fundedPct >= 100 ? "text-financial-accent" : "text-destructive"}`}>
                      {g.fundedPct.toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {g.requiredReturnPct === null
                        ? <span className="text-xs italic text-muted-foreground">Insufficient current data</span>
                        : `${g.requiredReturnPct.toFixed(1)}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* SIP plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recommended SIP plan</CardTitle>
          <p className="text-xs text-muted-foreground">
            New money goes to the largest allocation gaps first. Switches are avoided while contribution redirection can do the job.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sipPlan.length === 0 && <p className="text-sm text-muted-foreground">No holdings captured.</p>}
          {sipPlan.map((a) => (
            <div key={a.fundId} className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{a.schemeName || "Unnamed scheme"}</p>
                <div className="flex items-center gap-2">
                  <Badge className={actionTone[a.action]} variant="secondary">{a.action}</Badge>
                  <Badge variant="secondary">{a.role}</Badge>
                  <Badge variant="secondary">Confidence: {a.confidence}</Badge>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-4 text-xs">
                <div><span className="text-muted-foreground">Current SIP</span><p className="text-foreground font-medium">{inr(a.currentSip)}</p></div>
                <div><span className="text-muted-foreground">Recommended</span><p className="text-foreground font-medium">{inr(a.recommendedSip)}</p></div>
                <div><span className="text-muted-foreground">Change</span><p className={`font-medium ${a.change > 0 ? "text-financial-accent" : a.change < 0 ? "text-destructive" : "text-muted-foreground"}`}>{a.change === 0 ? "—" : `${a.change > 0 ? "+" : "-"}${inr(Math.abs(a.change))}`}</p></div>
                <div><span className="text-muted-foreground">Weight vs target</span><p className="text-foreground font-medium">{a.currentWeightPct.toFixed(1)}% vs {a.targetRange[0]}-{a.targetRange[1]}%</p></div>
              </div>
              <p className="text-xs text-muted-foreground"><strong className="text-foreground">Why:</strong> {a.why}</p>
              <p className="text-xs text-muted-foreground"><strong className="text-foreground">Portfolio impact:</strong> {a.portfolioImpact}</p>
              <p className="text-xs text-muted-foreground"><strong className="text-foreground">Risk impact:</strong> {a.riskImpact}</p>
              <p className="text-[11px] text-muted-foreground">Data as of {asOf}</p>
            </div>
          ))}
          {sipPlan.length > 0 && (
            <p className="text-sm text-foreground">
              Total recommended monthly SIP: <strong>{inr(plannedTotal)}</strong>{" "}
              <span className="text-muted-foreground">
                (current {inr(totals.currentSip)} + new {inr(totals.additionalSip)})
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data provenance */}
      <Card className="bg-financial-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" /> Data provenance &amp; current limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Engine run: {asOf} · all figures computed deterministically, no AI estimation.</p>
          {output.dataFlags.map((f) => <p key={f} className="text-xs text-muted-foreground">• {f}</p>)}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisPanel;
