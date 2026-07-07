import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { FlaskConical, ArrowRight, TrendingUp, Rewind, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * Homepage teaser for the "Investing Lab" (Time Machine + Market Explorer).
 * Visually distinct: dark gradient card, gold/amber accent, flask icon.
 */
const InvestingLabTeaser = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  // Two illustrative growth paths — SIP (steady) vs Lumpsum (volatile).
  // Rendered as inline SVG so we get the paint immediately, no chart lib cost.
  const sipPath =
    "M 0 180 C 40 172 60 165 90 155 C 130 145 160 130 200 118 C 240 106 270 92 310 78 C 350 66 380 55 420 44 C 460 34 490 27 520 20";
  const lumpPath =
    "M 0 190 C 30 170 55 195 90 175 C 130 152 155 195 200 160 C 245 128 270 175 310 130 C 350 90 380 140 420 85 C 460 45 490 78 520 50";

  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      {/* Subtle backdrop accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-financial-gold/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-financial-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div
          ref={ref}
          className={`relative rounded-3xl border border-financial-gold/30 bg-gradient-to-br from-financial-primary via-financial-primary to-[#0b1a2e] p-8 sm:p-12 shadow-2xl overflow-hidden transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Decorative grid */}
          <div
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
              <Badge className="mb-5 bg-financial-gold/20 text-financial-gold border border-financial-gold/40 hover:bg-financial-gold/25">
                <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                Investing Lab
              </Badge>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Master Investing{" "}
                <span className="bg-gradient-to-r from-financial-gold to-amber-300 bg-clip-text text-transparent">
                  Before You Invest a Rupee
                </span>
              </h2>

              <p className="text-base sm:text-lg text-white/75 mb-6 max-w-xl">
                Rewind 10 years of the Indian market with our Time Machine — see exactly how a
                SIP, lumpsum, or lazy portfolio would have played out through every crash and
                rally.
              </p>

              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <Rewind className="w-4 h-4 text-financial-gold" />
                  <span>10 yrs of history</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <TrendingUp className="w-4 h-4 text-financial-gold" />
                  <span>Compare strategies</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Sparkles className="w-4 h-4 text-financial-gold" />
                  <span>Zero-risk practice</span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-financial-gold hover:bg-financial-gold/90 text-financial-primary font-semibold shadow-lg shadow-financial-gold/25"
              >
                <Link to="/financial-education">
                  Try the Investing Lab
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Visual — mock chart preview */}
            <div className="relative">
              <div className="relative rounded-2xl bg-[#0a1526]/80 backdrop-blur border border-white/10 p-5 shadow-2xl">
                {/* Faux window chrome */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                  <span className="ml-3 text-[11px] font-mono text-white/50">
                    time-machine · NIFTY 50 · 2015 → 2025
                  </span>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 text-white/80">
                    <span className="w-3 h-0.5 bg-financial-gold rounded" />
                    Monthly SIP
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <span className="w-3 h-0.5 bg-white/50 rounded" />
                    Lumpsum
                  </div>
                </div>

                <svg viewBox="0 0 520 220" className="w-full h-auto" aria-hidden="true">
                  {/* Gridlines */}
                  {[40, 90, 140, 190].map((y) => (
                    <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}

                  {/* Lumpsum (volatile, secondary) */}
                  <path
                    d={lumpPath}
                    fill="none"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="900"
                    strokeDashoffset={isVisible ? 0 : 900}
                    style={{ transition: "stroke-dashoffset 1.6s ease-out 0.2s" }}
                  />

                  {/* SIP (smooth, hero line) */}
                  <defs>
                    <linearGradient id="sipFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--financial-gold))" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="hsl(var(--financial-gold))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${sipPath} L 520 220 L 0 220 Z`}
                    fill="url(#sipFill)"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "opacity 1s ease-out 1s" }}
                  />
                  <path
                    d={sipPath}
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
                    cy="20"
                    r="5"
                    fill="hsl(var(--financial-gold))"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "opacity 0.4s ease-out 1.8s" }}
                  />
                </svg>

                {/* Result strip */}
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Invested</div>
                    <div className="text-sm font-bold text-white font-mono">₹12L</div>
                  </div>
                  <div className="rounded-lg bg-financial-gold/10 border border-financial-gold/30 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-financial-gold/80">Final Value</div>
                    <div className="text-sm font-bold text-financial-gold font-mono">₹24.6L</div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-white/50">XIRR</div>
                    <div className="text-sm font-bold text-green-400 font-mono">14.2%</div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="hidden sm:flex absolute -top-3 -right-3 items-center gap-1.5 rounded-full bg-financial-gold px-3 py-1.5 shadow-lg text-financial-primary text-xs font-bold">
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
