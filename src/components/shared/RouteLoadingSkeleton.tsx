import Header from "@/components/Header";

/**
 * Global Suspense fallback shown while a lazy-loaded route chunk is fetching.
 *
 * Design goals:
 * - Header stays visible and static — no flash to blank.
 * - A static ticker-band placeholder holds the SecondaryBand's vertical space
 *   so the page doesn't jump when the real (stateful, data-fetching) ticker
 *   re-mounts inside the newly loaded page.
 * - The main content area shows a subtle, layout-shaped skeleton — a hero
 *   headline block plus a responsive grid of card placeholders — so users
 *   perceive that "the next page is loading here", not that the app froze.
 */
const RouteLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Static placeholder that matches SecondaryBand's dark ticker band height */}
      <div
        aria-hidden="true"
        className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white/70"
        style={{ marginTop: 0 }}
      >
        <div className="h-[76px] flex flex-col justify-center gap-2 px-4">
          <div className="h-3 w-2/3 rounded bg-white/10 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse" />
        </div>
      </div>

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero/title skeleton */}
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <div className="h-10 w-3/4 mx-auto rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-1/2 mx-auto rounded bg-muted animate-pulse" />
          </div>

          {/* Card grid skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
                <div className="pt-4 flex gap-2">
                  <div className="h-8 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RouteLoadingSkeleton;
