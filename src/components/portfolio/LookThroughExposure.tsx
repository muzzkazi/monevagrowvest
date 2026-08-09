import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Layers, TrendingUp, ChevronDown } from "lucide-react";
import { getFundHoldings } from "@/lib/fundHoldings";
import type { MutualFundInfo } from "@/data/mutualFundDatabase";

export interface ExposureFund {
  schemeCode: string;
  schemeName: string;
  category: string;
  subCategory: string;
  monthlySip: number;
}

interface StockExposure {
  symbol: string;
  name: string;
  sector: string;
  amount: number;          // ₹ per month attributed to this stock
  pctOfPortfolio: number;  // % of total monthly SIP
  pctOfEquity: number;     // % of disclosed equity exposure
  contributors: Array<{ schemeName: string; pct: number; amount: number }>;
}

const inr = (n: number) =>
  n >= 1_00_00_000 ? `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  : n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(2)} L`
  : `₹${Math.round(n).toLocaleString("en-IN")}`;

const LookThroughExposure = ({ funds }: { funds: ExposureFund[] }) => {
  const [expandAll, setExpandAll] = useState(false);
  const [openSymbol, setOpenSymbol] = useState<string | null>(null);

  const { stocks, sectors, totalSip, equitySip, equityFundCount } = useMemo(() => {
    const totalSip = funds.reduce((s, f) => s + (f.monthlySip || 0), 0);
    const equityFunds = funds.filter((f) => f.category === "Equity" && f.monthlySip > 0);
    const equitySip = equityFunds.reduce((s, f) => s + f.monthlySip, 0);

    const map = new Map<string, StockExposure>();
    for (const f of equityFunds) {
      const holdings = getFundHoldings({
        schemeCode: f.schemeCode,
        subCategory: f.subCategory,
      } as MutualFundInfo);
      for (const h of holdings) {
        const amount = f.monthlySip * (h.weight / 100);
        const prev = map.get(h.symbol);
        const contributor = { schemeName: f.schemeName, pct: h.weight, amount };
        if (prev) {
          prev.amount += amount;
          prev.contributors.push(contributor);
        } else {
          map.set(h.symbol, {
            symbol: h.symbol,
            name: h.name,
            sector: h.sector,
            amount,
            pctOfPortfolio: 0,
            pctOfEquity: 0,
            contributors: [contributor],
          });
        }
      }
    }

    const disclosed = [...map.values()].reduce((s, x) => s + x.amount, 0);
    const stocks = [...map.values()]
      .map((s) => ({
        ...s,
        pctOfPortfolio: totalSip > 0 ? (s.amount / totalSip) * 100 : 0,
        pctOfEquity: disclosed > 0 ? (s.amount / disclosed) * 100 : 0,
        contributors: s.contributors.sort((a, b) => b.amount - a.amount),
      }))
      .sort((a, b) => b.amount - a.amount);

    const sectorMap = new Map<string, number>();
    for (const s of stocks) sectorMap.set(s.sector, (sectorMap.get(s.sector) ?? 0) + s.amount);
    const sectors = [...sectorMap.entries()]
      .map(([sector, amount]) => ({
        sector,
        amount,
        pct: disclosed > 0 ? (amount / disclosed) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { stocks, sectors, totalSip, equitySip, equityFundCount: equityFunds.length };
  }, [funds]);

  if (stocks.length === 0) return null;

  const top = stocks[0];
  const visible = expandAll ? stocks : stocks.slice(0, 10);
  const maxPct = stocks[0].pctOfEquity || 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-financial-accent" />
          Look-Through Stock Exposure
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Where your money actually lands. We combine the underlying holdings of your{" "}
          {equityFundCount} equity {equityFundCount === 1 ? "scheme" : "schemes"}, weighted by your
          monthly SIP of {inr(equitySip)}{equitySip !== totalSip && <> (of {inr(totalSip)} total)</>}.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Largest single-stock exposure */}
        <div className="rounded-lg border border-financial-accent/30 bg-financial-accent/5 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="p-3 rounded-lg bg-financial-accent/15 text-financial-accent shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Highest single-stock exposure
            </div>
            <div className="text-lg font-semibold text-foreground">
              {top.name} <span className="text-muted-foreground font-normal">({top.symbol})</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {top.pctOfEquity.toFixed(1)}% of your equity exposure ≈ {inr(top.amount)}/month, coming
              from {top.contributors.length} {top.contributors.length === 1 ? "scheme" : "schemes"}.
            </p>
          </div>
          <Badge
            className={`shrink-0 border ${
              top.pctOfEquity >= 12
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                : top.pctOfEquity >= 8
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
            }`}
          >
            {top.pctOfEquity >= 12 ? "Concentrated" : top.pctOfEquity >= 8 ? "Watch" : "Balanced"}
          </Badge>
        </div>

        {/* Stock breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Stock-wise breakdown ({stocks.length} companies)
            </h3>
            <span className="text-xs text-muted-foreground">% of equity exposure</span>
          </div>
          <div className="divide-y border rounded-lg overflow-hidden">
            {visible.map((s, i) => {
              const open = openSymbol === s.symbol;
              return (
                <div key={s.symbol}>
                  <button
                    type="button"
                    onClick={() => setOpenSymbol(open ? null : s.symbol)}
                    aria-expanded={open}
                    className="w-full text-left p-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs text-muted-foreground tabular-nums shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.symbol} · {s.sector} · {s.contributors.length}{" "}
                          {s.contributors.length === 1 ? "fund" : "funds"}
                        </div>
                      </div>
                      <div className="hidden sm:block w-32 shrink-0">
                        <Progress value={(s.pctOfEquity / maxPct) * 100} className="h-1.5" />
                      </div>
                      <div className="text-right shrink-0 w-24">
                        <div className="text-sm font-semibold text-foreground tabular-nums">
                          {s.pctOfEquity.toFixed(1)}%
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">
                          {inr(s.amount)}/mo
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  {open && (
                    <div className="bg-muted/30 px-3 pb-3 pt-1 space-y-1.5">
                      {s.contributors.map((c, ci) => (
                        <div key={ci} className="flex items-start justify-between gap-3 text-xs">
                          <span className="text-muted-foreground min-w-0 flex-1">{c.schemeName}</span>
                          <span className="text-foreground font-medium tabular-nums shrink-0">
                            {c.pct.toFixed(2)}% of fund · {inr(c.amount)}/mo
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {stocks.length > 10 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-financial-accent"
              onClick={() => setExpandAll((v) => !v)}
            >
              {expandAll ? "Show top 10 only" : `Show all ${stocks.length} companies`}
            </Button>
          )}
        </div>

        {/* Sector breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Sector-wise exposure</h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {sectors.map((sec) => (
              <div key={sec.sector} className="flex items-center gap-3">
                <span className="text-xs text-foreground w-32 shrink-0 truncate">{sec.sector}</span>
                <Progress value={sec.pct} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-foreground tabular-nums w-12 text-right">
                  {sec.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Underlying holdings are modelled from each scheme's category and disclosed style, not live
          AMC factsheets, so treat exact weights as indicative. Debt, hybrid and other non-equity
          schemes are excluded from stock-level look-through.
        </p>
      </CardContent>
    </Card>
  );
};

export default LookThroughExposure;
