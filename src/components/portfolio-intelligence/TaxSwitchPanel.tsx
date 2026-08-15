import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { HoldingTax, SwitchPlan, SwitchVerdict } from "@/lib/pi/tax";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const verdictTone: Record<SwitchVerdict, string> = {
  "Switch now": "bg-financial-accent/10 text-financial-accent",
  "Stagger the switch": "bg-financial-gold/10 text-financial-gold",
  "Wait for long-term": "bg-financial-gold/10 text-financial-gold",
  "Redirect SIP instead": "bg-financial-muted text-muted-foreground",
  "Insufficient current data": "bg-destructive/10 text-destructive",
};

const TaxSwitchPanel = ({ plan, holdings }: { plan: SwitchPlan; holdings: HoldingTax[] }) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4 text-financial-accent" /> Tax-aware switch plan
        </CardTitle>
        {plan.slab ? (
          <Badge variant="secondary">
            Marginal slab {plan.slab.marginalRatePct}% ({plan.slab.band}) · {plan.slab.effectiveRatePct}% with cess
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-destructive/10 text-destructive">
            Annual income not captured — slab-taxed holdings cannot be priced
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Equity LTCG exemption left this year</p>
          <p className="text-xl font-serif font-bold text-foreground">{inr(plan.exemptionRemaining)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Tax if every flagged switch is executed now</p>
          <p className="text-xl font-serif font-bold text-foreground">
            {plan.totalTaxIfAllSwitched === null ? (
              <span className="text-sm italic text-muted-foreground">Insufficient current data</span>
            ) : (
              inr(plan.totalTaxIfAllSwitched)
            )}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Switch candidates raised by the engine</p>
          <p className="text-xl font-serif font-bold text-foreground">{plan.options.length}</p>
        </div>
      </div>

      {plan.options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          The engine found no holding worth exiting, so no taxable switch is on the table. Allocation gaps are handled
          through SIP redirection only.
        </p>
      ) : (
        <div className="space-y-4">
          {plan.options.map((o) => (
            <div key={o.fundId} className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{o.schemeName}</p>
                  <p className="text-xs text-muted-foreground">Amount considered {inr(o.amountConsidered)}</p>
                </div>
                <Badge variant="secondary" className={verdictTone[o.verdict]}>{o.verdict}</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="text-muted-foreground">
                  Tax on exit:{" "}
                  {o.taxCost === null ? (
                    <span className="italic">Insufficient current data</span>
                  ) : (
                    <strong className="text-foreground">{inr(o.taxCost)} ({o.taxCostPctOfAmount}%)</strong>
                  )}
                </span>
                {o.monthsToLongTerm !== null && (
                  <span className="text-muted-foreground">
                    Long-term treatment in <strong className="text-foreground">{o.monthsToLongTerm} month(s)</strong>
                  </span>
                )}
              </div>
              {o.rationale.map((r) => (
                <p key={r} className="text-xs text-muted-foreground">• {r}</p>
              ))}
              <p className="text-xs text-financial-accent">{o.sipRedirectionAlternative}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Per-holding tax position on a full exit</p>
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead className="text-right">Held</TableHead>
                <TableHead className="text-right">Gain</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Tax on exit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((h) => (
                <TableRow key={h.fundId}>
                  <TableCell className="font-medium text-foreground">{h.schemeName}</TableCell>
                  <TableCell className="text-muted-foreground">{h.treatment}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {h.holdingMonths === null ? "—" : `${h.holdingMonths} mo`}
                  </TableCell>
                  <TableCell className={`text-right ${(h.gain ?? 0) < 0 ? "text-destructive" : "text-foreground"}`}>
                    {h.gain === null ? "—" : inr(h.gain)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {h.ratePct === null ? "—" : `${h.ratePct}%`}
                  </TableCell>
                  <TableCell className="text-right">
                    {h.taxIfExitedFully === null ? (
                      <span className="text-xs italic text-muted-foreground">Insufficient current data</span>
                    ) : (
                      <span className="text-foreground">{inr(h.taxIfExitedFully)}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {holdings.some((h) => h.status === "insufficient") && (
          <div className="mt-2 space-y-1">
            {holdings
              .filter((h) => h.status === "insufficient")
              .map((h) => (
                <p key={h.fundId} className="text-xs text-destructive">
                  {h.schemeName}: missing {h.missing.join(", ")}.
                </p>
              ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {plan.assumptions.map((a) => (
          <p key={a} className="text-xs text-muted-foreground">• {a}</p>
        ))}
        <p className="text-xs text-muted-foreground">
          Tax position computed {new Date(plan.asOf).toLocaleString("en-IN")}.
        </p>
      </div>
    </CardContent>
  </Card>
);

export default TaxSwitchPanel;
