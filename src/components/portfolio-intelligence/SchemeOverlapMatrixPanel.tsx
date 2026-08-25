import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy } from "lucide-react";
import { calculateOverlap, getFundHoldings } from "@/lib/fundHoldings";
import type { MutualFundInfo } from "@/data/mutualFundDatabase";

export interface OverlapScheme {
  schemeCode: string;
  schemeName: string;
  subCategory: string;
}

const shortName = (name: string) =>
  name.replace(/\s*-\s*(Direct|Regular).*$/i, "").replace(/\s*Fund\b.*$/i, "").trim() || name;

const tone = (pct: number) =>
  pct >= 60
    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
    : pct >= 40
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    : pct >= 20
    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";

const SchemeOverlapMatrixPanel = ({ schemes }: { schemes: OverlapScheme[] }) => {
  const { list, pairs, dupStocks } = useMemo(() => {
    const list = schemes.filter((s) => s.schemeCode && s.schemeName);
    const asInfo = (s: OverlapScheme) =>
      ({ schemeCode: s.schemeCode, subCategory: s.subCategory } as MutualFundInfo);

    const pairs: Array<{ a: number; b: number; pct: number; common: number }> = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const r = calculateOverlap(asInfo(list[i]), asInfo(list[j]));
        pairs.push({ a: i, b: j, pct: r.overlapPercent, common: r.commonStocks.length });
      }
    }
    pairs.sort((x, y) => y.pct - x.pct);

    const stockMap = new Map<
      string,
      { symbol: string; name: string; schemes: string[]; totalWeight: number }
    >();
    for (const s of list) {
      for (const h of getFundHoldings(asInfo(s))) {
        const prev = stockMap.get(h.symbol);
        if (prev) {
          prev.schemes.push(s.schemeName);
          prev.totalWeight += h.weight;
        } else {
          stockMap.set(h.symbol, {
            symbol: h.symbol,
            name: h.name,
            schemes: [s.schemeName],
            totalWeight: h.weight,
          });
        }
      }
    }
    const dupStocks = [...stockMap.values()]
      .filter((s) => s.schemes.length > 1)
      .sort((a, b) => b.schemes.length - a.schemes.length || b.totalWeight - a.totalWeight);

    return { list, pairs, dupStocks };
  }, [schemes]);

  if (list.length < 2) return null;

  const maxPair = pairs[0];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Copy className="w-5 h-5 text-financial-accent" />
          Scheme Duplication — All {list.length} Schemes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Every scheme is compared against every other scheme ({pairs.length} pairs), not just two at a
          time. Overlap is the sum of the smaller weight for each shared stock.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border border-financial-accent/30 bg-financial-accent/5 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Highest duplication pair
          </div>
          <div className="text-sm font-semibold text-foreground mt-0.5">
            {list[maxPair.a].schemeName} &nbsp;×&nbsp; {list[maxPair.b].schemeName}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {maxPair.pct.toFixed(1)}% overlap across {maxPair.common} shared companies.
          </p>
        </div>

        {/* Full matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-background text-left p-2 font-medium text-muted-foreground">
                  Scheme
                </th>
                {list.map((s, i) => (
                  <th key={s.schemeCode + i} className="p-2 font-medium text-muted-foreground">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((row, i) => (
                <tr key={row.schemeCode + i} className="border-t">
                  <td className="sticky left-0 bg-background p-2 text-foreground whitespace-nowrap">
                    {i + 1}. {shortName(row.schemeName)}
                  </td>
                  {list.map((_, j) => {
                    if (i === j)
                      return (
                        <td key={j} className="p-2 text-center text-muted-foreground">
                          —
                        </td>
                      );
                    const p = pairs.find(
                      (x) => (x.a === i && x.b === j) || (x.a === j && x.b === i),
                    );
                    return (
                      <td key={j} className="p-1 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded tabular-nums font-medium ${tone(p?.pct ?? 0)}`}
                        >
                          {(p?.pct ?? 0).toFixed(0)}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Repeated stocks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Companies held by more than one scheme ({dupStocks.length})
            </h3>
            <span className="text-xs text-muted-foreground">schemes holding it</span>
          </div>
          {dupStocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No company is repeated across these schemes.
            </p>
          ) : (
            <div className="divide-y border rounded-lg">
              {dupStocks.slice(0, 15).map((s) => (
                <div key={s.symbol} className="p-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {s.schemes.map(shortName).join(" · ")}
                    </div>
                  </div>
                  <div className="hidden sm:block w-24 shrink-0">
                    <Progress value={(s.schemes.length / list.length) * 100} className="h-1.5" />
                  </div>
                  <Badge variant="secondary" className="shrink-0 tabular-nums">
                    {s.schemes.length} / {list.length}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Underlying holdings are modelled from each scheme's category and disclosed style, not live AMC
          factsheets, so treat exact weights as indicative. Only schemes picked from the AMFI list are
          included.
        </p>
      </CardContent>
    </Card>
  );
};

export default SchemeOverlapMatrixPanel;
