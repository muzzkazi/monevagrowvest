import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, RefreshCw } from "lucide-react";
import { NavMetrics, NavSeries, freshnessLabel, isStale } from "@/lib/pi/navMetrics";

const Metric = ({ value, suffix = "%" }: { value: number | null; suffix?: string }) =>
  value === null ? (
    <span className="text-xs italic text-muted-foreground">Insufficient current data</span>
  ) : (
    <span className={value < 0 ? "text-destructive" : "text-foreground"}>
      {value > 0 && suffix === "%" ? "+" : ""}
      {value}
      {suffix}
    </span>
  );

const NavDataPanel = ({
  series,
  metrics,
  unavailable,
  oldestFetchedAt,
  loading,
  error,
  onRefresh,
  requestedCodes,
}: {
  series: NavSeries[];
  metrics: Map<string, NavMetrics>;
  unavailable: string[];
  oldestFetchedAt: string | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  requestedCodes: string[];
}) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4 text-financial-accent" /> Live NAV data &amp; real risk metrics
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={oldestFetchedAt && isStale(oldestFetchedAt) ? "bg-financial-gold/10 text-financial-gold" : ""}
          >
            {freshnessLabel(oldestFetchedAt)}
          </Badge>
          <Button size="sm" variant="outline" className="gap-2" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {error && <p className="text-sm text-destructive">NAV feed error: {error}</p>}

      {requestedCodes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No scheme codes captured on the holdings. Add the AMFI scheme code to each fund to compute real returns,
          volatility, drawdown, Sharpe and Sortino instead of assumptions.
        </p>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme</TableHead>
                <TableHead className="text-right">1Y</TableHead>
                <TableHead className="text-right">3Y CAGR</TableHead>
                <TableHead className="text-right">5Y CAGR</TableHead>
                <TableHead className="text-right">Volatility</TableHead>
                <TableHead className="text-right">Max drawdown</TableHead>
                <TableHead className="text-right">Sharpe</TableHead>
                <TableHead className="text-right">Sortino</TableHead>
                <TableHead className="text-right">NAV as of</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((s) => {
                const m = metrics.get(s.schemeCode);
                return (
                  <TableRow key={s.schemeCode}>
                    <TableCell className="font-medium text-foreground">
                      {s.schemeName ?? s.schemeCode}
                      <span className="block text-xs text-muted-foreground">
                        {s.source} · {m?.observations ?? 0} NAV points
                      </span>
                    </TableCell>
                    <TableCell className="text-right"><Metric value={m?.return1yPct ?? null} /></TableCell>
                    <TableCell className="text-right"><Metric value={m?.return3yCagrPct ?? null} /></TableCell>
                    <TableCell className="text-right"><Metric value={m?.return5yCagrPct ?? null} /></TableCell>
                    <TableCell className="text-right"><Metric value={m?.annualisedVolPct ?? null} /></TableCell>
                    <TableCell className="text-right"><Metric value={m?.maxDrawdownPct ?? null} /></TableCell>
                    <TableCell className="text-right"><Metric value={m?.sharpe ?? null} suffix="" /></TableCell>
                    <TableCell className="text-right"><Metric value={m?.sortino ?? null} suffix="" /></TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {s.latestNavDate ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {unavailable.length > 0 && (
        <p className="text-xs text-destructive">
          No NAV history available for scheme code(s) {unavailable.join(", ")} — metrics for those funds stay marked as
          insufficient data rather than being estimated.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        NAV history is fetched through the backend NAV function and cached with its fetch timestamp. Nothing on this
        page is hardcoded: a metric that needs a longer NAV window shows "Insufficient current data".
      </p>
    </CardContent>
  </Card>
);

export default NavDataPanel;
