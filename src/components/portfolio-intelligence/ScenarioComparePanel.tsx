import { useState } from "react";
import { Check, FileDown, GitCompareArrows, Link2 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import GlossaryTerm from "@/components/portfolio-intelligence/GlossaryTerm";
import { ScenarioKey, StressOutput } from "@/lib/pi/stress";
import { generateScenarioPdf } from "@/lib/pi/scenarioPdf";
import { useToast } from "@/hooks/use-toast";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const GLOSSARY_BY_SCENARIO: Record<ScenarioKey, "base" | "downside" | "upside" | "severe"> = {
  base: "base",
  downside: "downside",
  upside: "upside",
  severe: "severe",
};

const toneFor = (key: ScenarioKey) =>
  key === "upside"
    ? "hsl(142 71% 40%)"
    : key === "base"
      ? "hsl(var(--financial-accent))"
      : key === "downside"
        ? "hsl(var(--financial-gold))"
        : "hsl(var(--destructive))";

const textToneFor = (key: ScenarioKey) =>
  key === "upside"
    ? "text-green-600 dark:text-green-500"
    : key === "base"
      ? "text-financial-accent"
      : key === "downside"
        ? "text-financial-gold"
        : "text-destructive";

/** Side-by-side comparison of the four stress scenarios for the recommended portfolio. */
export interface ScenarioComparePanelProps {
  stress: StressOutput;
  /** Scenario keys currently shown; when omitted all scenarios are shown. */
  selected?: ScenarioKey[];
  onSelectedChange?: (keys: ScenarioKey[]) => void;
  meta?: { clientName?: string; runName?: string; runId?: string | null; versionId?: string | null };
}

const ScenarioComparePanel = ({ stress, selected, onSelectedChange, meta }: ScenarioComparePanelProps) => {
  const allKeys = stress.scenarios.map((s) => s.key);
  const activeKeys = selected && selected.length > 0 ? selected : allKeys;
  const rows = stress.scenarios.filter((s) => activeKeys.includes(s.key));

  const toggleKey = (key: ScenarioKey) => {
    if (!onSelectedChange) return;
    const next = activeKeys.includes(key)
      ? activeKeys.filter((k) => k !== key)
      : [...allKeys.filter((k) => activeKeys.includes(k) || k === key)];
    onSelectedChange(next.length === 0 ? allKeys : next);
  };

  const exportPdf = () => generateScenarioPdf(stress, { ...meta, selected: activeKeys });
  const chartData = rows.map((s) => ({
    name: s.label,
    key: s.key,
    returnPct: s.portfolioReturnPct,
    endValue: s.endValue,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-financial-accent" /> Scenario comparison — recommended portfolio
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              <GlossaryTerm id="stressTest">Stress test basis: {stress.basis}</GlossaryTerm>
            </Badge>
            <Button variant="outline" size="sm" onClick={exportPdf} className="gap-2 text-xs">
              <FileDown className="h-3.5 w-3.5" /> Export scenarios PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-xs text-muted-foreground">
          The same recommended allocation put through four one-year outcomes, side by side. All figures come from the
          deterministic stress engine.
        </p>

        {onSelectedChange && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose which scenarios to compare">
            {stress.scenarios.map((s) => (
              <Toggle
                key={s.key}
                size="sm"
                pressed={activeKeys.includes(s.key)}
                onPressedChange={() => toggleKey(s.key)}
                aria-label={`Show ${s.label} scenario`}
                className="text-xs"
              >
                {s.label}
              </Toggle>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((s) => (
            <div key={s.key} className="rounded-lg border border-border p-4 space-y-1.5">
              <p className="text-sm font-semibold text-foreground">
                <GlossaryTerm id={GLOSSARY_BY_SCENARIO[s.key]}>{s.label}</GlossaryTerm>
              </p>
              <p className={`text-2xl font-serif font-bold ${textToneFor(s.key)}`}>
                {s.portfolioReturnPct > 0 ? "+" : ""}
                {s.portfolioReturnPct}%
              </p>
              <p className="text-xs text-muted-foreground">{inr(s.endValue)} portfolio value</p>
              <p className={`text-xs ${s.valueChange < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {s.valueChange < 0 ? "" : "+"}
                {inr(s.valueChange)} change
              </p>
            </div>
          ))}
        </div>

        <div className="h-56 w-full" role="img" aria-label="Bar chart comparing one-year portfolio return across the four scenarios">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v: number) => `${v}%`}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, _n, item) => [
                  `${value}%  ·  ${inr((item?.payload as { endValue: number }).endValue)}`,
                  "One-year outcome",
                ]}
              />
              <Bar dataKey="returnPct" radius={[4, 4, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.key} fill={toneFor(d.key as ScenarioKey)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Measure</TableHead>
                {rows.map((s) => (
                  <TableHead key={s.key} className="text-right">{s.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-foreground">One-year return</TableCell>
                {rows.map((s) => (
                  <TableCell key={s.key} className={`text-right ${textToneFor(s.key)}`}>
                    {s.portfolioReturnPct > 0 ? "+" : ""}
                    {s.portfolioReturnPct}%
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Portfolio value</TableCell>
                {rows.map((s) => (
                  <TableCell key={s.key} className="text-right text-foreground">{inr(s.endValue)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Value change</TableCell>
                {rows.map((s) => (
                  <TableCell
                    key={s.key}
                    className={`text-right ${s.valueChange < 0 ? "text-destructive" : "text-foreground"}`}
                  >
                    {s.valueChange < 0 ? "" : "+"}
                    {inr(s.valueChange)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Basis</TableCell>
                {rows.map((s) => (
                  <TableCell key={s.key} className="text-right text-muted-foreground text-xs">
                    {s.basis === "computed" ? "Live NAV history" : s.basis === "mixed" ? "Part NAV, part assumption" : "Assumption set"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Recovery view</TableCell>
                {rows.map((s) => (
                  <TableCell key={s.key} className="text-right text-muted-foreground text-xs max-w-[220px]">
                    {s.recoveryNote}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Goal impact</TableCell>
                {rows.map((s) => (
                  <TableCell key={s.key} className="text-right text-xs max-w-[220px] text-financial-gold">
                    {s.goalNote ?? <span className="text-muted-foreground">No essential goal affected</span>}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Scenario set computed {new Date(stress.asOf).toLocaleString("en-IN")}.
        </p>
      </CardContent>
    </Card>
  );
};

export default ScenarioComparePanel;
