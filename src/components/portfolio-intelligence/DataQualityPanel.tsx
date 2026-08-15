import { AlertTriangle, CheckCircle2, Database, RefreshCw, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataQualityReport } from "@/lib/pi/dataQuality";

const freshnessTone: Record<DataQualityReport["navFreshness"], string> = {
  fresh: "bg-financial-accent/10 text-financial-accent",
  stale: "bg-financial-gold/10 text-financial-gold",
  expired: "bg-destructive/10 text-destructive",
  unknown: "bg-financial-muted text-muted-foreground",
};

const DataQualityPanel = ({
  report,
  onRefreshNav,
  refreshing,
}: {
  report: DataQualityReport;
  onRefreshNav?: () => void;
  refreshing?: boolean;
}) => (
  <Card className={report.switchingAllowed ? "" : "border-destructive/40"}>
    <CardHeader className="pb-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4 text-financial-accent" /> Data quality &amp; switch readiness
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={freshnessTone[report.navFreshness]}>
            NAV{" "}
            {report.navAgeHours === null
              ? "not loaded"
              : `${report.navAgeHours}h old · ${report.navFreshness}`}
          </Badge>
          <Badge
            variant="secondary"
            className={report.taxInputsComplete ? "bg-financial-accent/10 text-financial-accent" : "bg-destructive/10 text-destructive"}
          >
            Tax inputs {report.taxInputsComplete ? "complete" : "incomplete"}
          </Badge>
          {onRefreshNav && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={onRefreshNav} disabled={refreshing}>
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh NAV
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {report.switchingAllowed ? (
        <div className="flex items-start gap-2 rounded-lg border border-financial-accent/30 bg-financial-accent/5 p-3">
          <CheckCircle2 className="h-4 w-4 mt-0.5 text-financial-accent" aria-hidden />
          <p className="text-sm text-foreground">
            All tax inputs are captured and the NAV data behind the analysis is current, so switch recommendations are
            unlocked.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3" role="alert">
          <ShieldAlert className="h-4 w-4 mt-0.5 text-destructive" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">
              Switch recommendations are blocked — {report.blockers.length} requirement(s) not met.
            </p>
            <p className="text-xs text-muted-foreground">
              The engine will not price or recommend an exit on incomplete data. SIP redirection stays available because
              it carries no tax event.
            </p>
          </div>
        </div>
      )}

      {report.blockers.length > 0 && (
        <div className="space-y-2">
          {report.blockers.map((i) => (
            <div key={i.id} className="rounded-lg border border-destructive/30 p-3">
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-destructive/10 text-destructive shrink-0">{i.area}</Badge>
                <div>
                  <p className="text-sm text-foreground">{i.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Fix: {i.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="space-y-2">
          {report.warnings.map((i) => (
            <div key={i.id} className="rounded-lg border border-financial-gold/40 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-financial-gold shrink-0" aria-hidden />
                <div>
                  <p className="text-sm text-foreground">{i.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Fix: {i.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default DataQualityPanel;
