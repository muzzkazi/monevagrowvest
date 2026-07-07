/**
 * Layout-shaped skeletons for pages/sections whose real content is delayed
 * by live-data fetches. Each skeleton mirrors the real component's structure
 * (grid columns, card sections, table rows) so the layout doesn't shift when
 * data arrives — only the placeholder blocks swap for real content.
 */

const pulse = "animate-pulse rounded bg-muted";

/** Skeleton for a single brokerage-pick card (StockRecommendations grid). */
export const BrokerRecoCardSkeleton = () => (
  <div className="bg-gradient-card border border-border rounded-lg shadow-card overflow-hidden">
    <div className="p-5 pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className={`h-5 w-3/4 ${pulse}`} />
          <div className={`h-3 w-20 ${pulse}`} />
        </div>
        <div className={`h-6 w-16 ${pulse}`} />
      </div>
    </div>
    <div className="px-5 pb-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/40 rounded-lg p-3 space-y-2">
          <div className={`h-3 w-16 ${pulse}`} />
          <div className={`h-6 w-20 ${pulse}`} />
        </div>
        <div className="bg-muted/40 rounded-lg p-3 space-y-2">
          <div className={`h-3 w-16 ${pulse}`} />
          <div className={`h-6 w-20 ${pulse}`} />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className={`h-3 w-full ${pulse}`} />
        <div className={`h-3 w-5/6 ${pulse}`} />
        <div className={`h-3 w-2/3 ${pulse}`} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className={`h-3 w-24 ${pulse}`} />
        <div className={`h-3 w-16 ${pulse}`} />
      </div>
    </div>
  </div>
);

/** Grid of card skeletons for the homepage brokerage picks section. */
export const BrokerRecoGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <BrokerRecoCardSkeleton key={i} />
    ))}
  </div>
);

/** Table skeleton for the full Brokerage Calls page (table view). */
export const BrokerCallsTableSkeleton = ({ rows = 10 }: { rows?: number }) => (
  <div className="rounded-lg border border-border overflow-hidden">
    <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr_0.9fr_0.7fr_0.6fr] gap-3 px-4 py-3 border-b border-border bg-muted/40">
      {["Stock", "Call", "Target", "CMP", "Upside", "Broker", "Sector", "Date", "Source"].map((h) => (
        <div key={h} className={`h-3 w-16 ${pulse}`} />
      ))}
    </div>
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr_0.9fr_0.7fr_0.6fr] gap-3 px-4 py-3 items-center"
        >
          <div className="space-y-1.5">
            <div className={`h-4 w-32 ${pulse}`} />
            <div className={`h-3 w-16 ${pulse}`} />
          </div>
          <div className={`h-6 w-16 ${pulse}`} />
          <div className={`h-4 w-16 ${pulse} ml-auto`} />
          <div className={`h-4 w-16 ${pulse} ml-auto`} />
          <div className={`h-4 w-14 ${pulse} ml-auto`} />
          <div className={`h-4 w-24 ${pulse}`} />
          <div className={`h-4 w-20 ${pulse}`} />
          <div className={`h-3 w-16 ${pulse}`} />
          <div className={`h-4 w-10 ${pulse} ml-auto`} />
        </div>
      ))}
    </div>
  </div>
);

/** Card-grid skeleton for the Brokerage Calls page (card view). */
export const BrokerCallsCardSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <div className={`h-4 w-28 ${pulse}`} />
            <div className={`h-3 w-16 ${pulse}`} />
          </div>
          <div className={`h-5 w-14 ${pulse}`} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-8 ${pulse}`} />
          <div className={`h-8 ${pulse}`} />
          <div className={`h-8 ${pulse}`} />
        </div>
        <div className="space-y-1">
          <div className={`h-3 w-full ${pulse}`} />
          <div className={`h-3 w-4/5 ${pulse}`} />
        </div>
      </div>
    ))}
  </div>
);

/** Table skeleton for the Mutual Fund Screener results table. */
export const MFScreenerTableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <div className="rounded-lg border border-border overflow-hidden">
    <div className="grid grid-cols-[60px_2fr_0.7fr_0.6fr_0.6fr_0.6fr_0.7fr_0.6fr_0.7fr] gap-3 px-4 py-3 border-b border-border bg-muted/40">
      {["", "Fund", "NAV", "1Y", "3Y", "5Y", "AUM", "Exp", "Rating"].map((h, i) => (
        <div key={i} className={`h-3 w-14 ${pulse}`} />
      ))}
    </div>
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[60px_2fr_0.7fr_0.6fr_0.6fr_0.6fr_0.7fr_0.6fr_0.7fr] gap-3 px-4 py-3 items-center"
        >
          <div className={`h-7 w-14 ${pulse}`} />
          <div className="space-y-2">
            <div className={`h-4 w-3/4 ${pulse}`} />
            <div className="flex gap-1.5">
              <div className={`h-3 w-16 ${pulse}`} />
              <div className={`h-3 w-14 ${pulse}`} />
              <div className={`h-3 w-20 ${pulse}`} />
            </div>
          </div>
          <div className={`h-4 w-14 ${pulse} ml-auto`} />
          <div className={`h-4 w-10 ${pulse} ml-auto`} />
          <div className={`h-4 w-10 ${pulse} ml-auto`} />
          <div className={`h-4 w-10 ${pulse} ml-auto`} />
          <div className={`h-4 w-12 ${pulse} ml-auto`} />
          <div className={`h-4 w-10 ${pulse} ml-auto`} />
          <div className={`h-4 w-16 ${pulse} mx-auto`} />
        </div>
      ))}
    </div>
  </div>
);
