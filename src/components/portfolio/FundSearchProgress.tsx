import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Loading + estimated-wait indicator shown while the AMFI fund search runs.
 *
 * - Skeleton rows so the result area doesn't collapse and the user can see
 *   something is rendering.
 * - Live elapsed counter + adaptive message: "warm" cached-style searches
 *   show a quick spinner; longer searches escalate to "Still searching…"
 *   so the user knows it's working and roughly how long it'll take.
 */
export const FundSearchProgress = ({
  estimateMs,
  rows = 4,
}: {
  estimateMs: number;
  rows?: number;
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setElapsed(performance.now() - start), 200);
    return () => clearInterval(id);
  }, []);

  const expected = Math.max(estimateMs, 400);
  const pct = Math.min(95, (elapsed / expected) * 100);

  let message = "Searching AMFI scheme list…";
  if (elapsed > 4000) message = "Still searching — AMFI is a bit slow right now";
  else if (elapsed > expected && elapsed > 1200) message = "Almost there…";

  const etaSec = Math.max(0, (expected - elapsed) / 1000);
  const etaLabel =
    elapsed < 400
      ? `~${(expected / 1000).toFixed(1)}s`
      : etaSec > 0.3
        ? `~${etaSec.toFixed(1)}s left`
        : "wrapping up";

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {message}
        </span>
        <span className="tabular-nums">{etaLabel}</span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        <div
          className="h-full bg-financial-accent transition-all duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-1.5 pt-1" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-full animate-pulse rounded-md bg-muted/60"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
};
