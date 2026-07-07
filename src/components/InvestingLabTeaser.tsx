import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { FlaskConical, ArrowRight, TrendingUp, Rewind, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * Homepage teaser for the "Investing Lab" (Time Machine + Market Explorer).
 *
 * The mini chart mirrors the *actual* default parameters of the full
 * InvestmentSimulation component:
 *   - Seed capital: ₹10,000 per strategy
 *   - Timeframe:    10 yrs (2014 → 2023) — the default preset
 *   - Strategies:   Moderate (0.8x market) vs Aggressive (1.3x up / 1.5x down)
 *
 * Yearly NIFTY-like returns used by the sim for 2014-2023:
 *   0.29, 0.05, 0.02, 0.28, 0.03, 0.14, -0.24, 0.23, 0.04, 0.20
 *
 * Resulting final values (compounded) → Moderate ₹20.8k, Aggressive ₹27.8k
 * XIRR (aggressive) ≈ 10.7%. Chart paths below plot those exact values.
 */
const InvestingLabTeaser = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  // Points precomputed from the sim's real return series (see comment above).
  // viewBox is 520 × 220; y = 200 - ((value - 8000) / 22000) * 180
  const aggressivePath =
    "M 0 184 L 52 153 L 104 146 L 156 143 L 208 98 L 260 91 L 312 59 L 364 133 L 416 94 L 468 85 L 520 39";
  const moderatePath =
    "M 0 184 L 52 165 L 104 161 L 156 159 L 208 135 L 260 132 L 312 117 L 364 146 L 416 124 L 468 119 L 520 96";

  return (
    <section
      aria-labelledby="investing-lab-teaser-heading"
      className="py-16 sm:py-24 bg-background relative overflow-hidden"
    >
      {/* Decorative backdrop — hidden from assistive tech */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-financial-gold/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-financial-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div
          ref={ref}
          className={`relative rounded-3xl border border-financial-gold/40 bg-gradient-to-br from-financial-primary via-financial-primary to-[#0b1a2e] p-8 sm:p-12 shadow-2xl overflow-hidden transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Decorative grid */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--financial-gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--financial-gold)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            {/* Copy */}
            <div className="text-white">
              <Badge className="mb-5 bg-financial-gold/25 text-financial-gold border border-financial-gold/50 hover:bg-financial-gold/30">
                <FlaskConical className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                Investing Lab
              </Badge>

              <h2
                id="investing-lab-teaser-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4"
              >
                Master Investing{" "}
                <span className="bg-gradient-to-r from-financial-gold to-amber-200 bg-clip-text text-transparent">
                  Before You Invest a Rupee
                </span>
              </h2>

              {/* Bumped opacity from /75 → /90 for WCAG AA contrast on dark bg */}
              <p className="text-base sm:text-lg text-white/90 mb-6 max-w-xl">
                Rewind 10 years of the Indian market with our Time Machine — see exactly how a
                Moderate or Aggressive strategy would have played out through every crash and
                rally from 2014 to 2023.
              </p>

              <ul className="flex flex-wrap gap-4 mb-8 text-sm list-none p-0">
                <li className="flex items-center gap-2 text-white/90">
                  <Rewind className="w-4 h-4 text-financial-gold" aria-hidden="true" />
                  <span>10 yrs of history</span>
                </li>
                <li className="flex items-center gap-2 text-white/90">
                  <TrendingUp className="w-4 h-4 text-financial-gold" aria-hidden="true" />
                  <span>Compare strategies</span>
                </li>
                <li className="flex items-center gap-2 text-white/90">
                  <Sparkles className="w-4 h-4 text-financial-gold" aria-hidden="true" />
                  <span>Zero-risk practice</span>
                </li>
              </ul>

              <Button
                asChild
                size="lg"
                className="bg-financial-gold hover:bg-financial-gold/90 text-financial-primary font-semibold shadow-lg shadow-financial-gold/25 focus-visible:ring-2 focus-visible:ring-financial-gold focus-visible:ring-offset-2 focus-visible:ring-offset-financial-primary"
              >
                <Link
                  to="/financial-education"
                  aria-label="Try the Investing Lab — open the Time Machine and Market Explorer"
                >
                  Try the Investing Lab
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {/* Visual — mock chart preview mirroring sim defaults */}
            <div className="relative">
              <div className="relative rounded-2xl bg-[#0a1526]/80 backdrop-blur border border-white/15 p-5 shadow-2xl">
                {/* Faux window chrome */}
                <div className="flex items-center gap-1.5 mb-4" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                  <span className="ml-3 text-[11px] font-mono text-white/70">
                    time-machine · NIFTY · 2014 → 2023 · ₹10,000 seed
                  </span>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 text-white/90">
                    <span className="w-3 h-0.5 bg-financial-gold rounded" aria-hidden="true" />
                    Aggressive
                  </div>
                  <div className="flex items-center gap-1.5 text-white/75">
                    <span className="w-3 h-0.5 bg-white/60 rounded" aria-hidden="true" />
                    Moderate
                  </div>
                </div>

                <svg
                  viewBox="0 0 520 220"
                  className="w-full h-auto"
                  role="img"
                  aria-label="Sample simulation: ₹10,000 grew to ₹27,800 with an Aggressive strategy and ₹20,800 with a Moderate strategy over 10 years (2014 to 2023)."
                >
                  {/* Gridlines */}
                  {[40, 90, 140, 190].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="520"
                      y2={y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Moderate (secondary) */}
                  <path
                    d={moderatePath}
                    fill="none"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="900"
                    strokeDashoffset={isVisible ? 0 : 900}
                    style={{ transition: "stroke-dashoffset 1.6s ease-out 0.2s" }}
                  />

                  {/* Aggressive (hero line) */}
                  <defs>
                    <linearGradient id="aggFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--financial-gold))" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="hsl(var(--financial-gold))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${aggressivePath} L 520 220 L 0 220 Z`}
                    fill="url(#aggFill)"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "opacity 1s ease-out 1s" }}
                  />
                  <path
                    d={aggressivePath}
                    fill="none"
                    stroke="hsl(var(--financial-gold))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="900"
                    strokeDashoffset={isVisible ? 0 : 900}
                    style={{ transition: "stroke-dashoffset 1.8s ease-out 0.3s" }}
                  />

                  {/* End marker */}
                  <circle
                    cx="520"
                    cy="39"
                    r="5"
                    fill="hsl(var(--financial-gold))"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "opacity 0.4s ease-out 1.8s" }}
                  />
                </svg>

                {/* Result strip — real numbers from the sim */}
                <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white/10 border border-white/15 p-2.5">
                    <dt className="text-[10px] uppercase tracking-wider text-white/70">Invested</dt>
                    <dd className="text-sm font-bold text-white font-mono">₹10,000</dd>
                  </div>
                  <div className="rounded-lg bg-financial-gold/15 border border-financial-gold/40 p-2.5">
                    <dt className="text-[10px] uppercase tracking-wider text-financial-gold">
                      Final (Aggr.)
                    </dt>
                    <dd className="text-sm font-bold text-financial-gold font-mono">₹27,800</dd>
                  </div>
                  <div className="rounded-lg bg-white/10 border border-white/15 p-2.5">
                    <dt className="text-[10px] uppercase tracking-wider text-white/70">XIRR</dt>
                    <dd className="text-sm font-bold text-green-300 font-mono">10.7%</dd>
                  </div>
                </dl>
              </div>

              {/* Floating badge */}
              <div
                aria-hidden="true"
                className="hidden sm:flex absolute -top-3 -right-3 items-center gap-1.5 rounded-full bg-financial-gold px-3 py-1.5 shadow-lg text-financial-primary text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Live Simulation
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestingLabTeaser;
