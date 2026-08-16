// Inline glossary for the Portfolio Intelligence console.
// Definitions are static advisor-facing explanations — they never contain
// run-specific figures, so they can be shown anywhere without verification.

export interface GlossaryEntry {
  term: string;
  short: string;
  long: string;
  layer: "A" | "B" | "both";
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  riskTolerance: {
    term: "Risk tolerance",
    short: "How much volatility the client is emotionally willing to sit through.",
    long:
      "Scored from the client's own answers about reaction to losses, experience and stated comfort. It is a preference, not a fact about their finances — a client can be willing to take risk they cannot afford.",
    layer: "A",
  },
  riskCapacity: {
    term: "Risk capacity",
    short: "How much volatility the client's finances can absorb without damage.",
    long:
      "Derived from age, income stability, dependents, EMI load, emergency buffer and time to goals. Capacity is objective: it caps the equity range regardless of how bold the client feels.",
    layer: "A",
  },
  riskNeed: {
    term: "Risk need",
    short: "How much return the goals actually require.",
    long:
      "The engine solves for the return needed to fund the stated goals with the stated surplus. If the required return is low, extra risk adds volatility without adding benefit.",
    layer: "A",
  },
  bindingConstraint: {
    term: "Binding constraint",
    short: "The weakest of tolerance, capacity and need — it sets the final profile.",
    long:
      "The final risk profile is the weakest link, never an average. Whichever dimension is lowest becomes the binding constraint and drives the target equity range.",
    layer: "A",
  },
  equityRange: {
    term: "Equity range",
    short: "The allowed minimum-to-maximum equity share for this client.",
    long:
      "A band, not a single number, so the advisor has room to implement without breaching the risk profile. Target allocation is built inside this band.",
    layer: "A",
  },
  allocationGap: {
    term: "Allocation gap",
    short: "Target weight minus current weight for an asset bucket.",
    long:
      "A positive gap means the bucket is underweight and should receive new money first. A negative gap means it is overweight, so new SIP money is steered elsewhere before any switching is considered.",
    layer: "A",
  },
  fitScore: {
    term: "Fit score",
    short: "How well the existing portfolio matches the recommended structure.",
    long:
      "A composite of allocation alignment, role coverage, concentration and redundancy. Higher is better; the breakdown shows which component is dragging the score.",
    layer: "A",
  },
  complexityScore: {
    term: "Complexity score",
    short: "How complicated the portfolio is to maintain.",
    long:
      "Driven by fund count, overlapping roles and duplicated categories. High complexity usually means consolidation, not more funds.",
    layer: "A",
  },
  stressTest: {
    term: "Stress test",
    short: "One-year 'what if' outcomes for the recommended portfolio.",
    long:
      "Each asset bucket receives a shock, weighted by its target share, to produce a portfolio-level outcome. Where real NAV history exists the shocks are measured from that history; otherwise a published asset-class assumption set is used, and the basis is always labelled.",
    layer: "A",
  },
  base: {
    term: "Base scenario",
    short: "Long-run average behaviour of each asset class over one year.",
    long: "Not a forecast — it is what the asset mix has typically delivered over long periods, applied to one year.",
    layer: "A",
  },
  downside: {
    term: "Downside scenario",
    short: "A normal bad year — a correction without a systemic crisis.",
    long:
      "The kind of year that happens regularly and must be tolerable, otherwise the plan will be abandoned mid-way.",
    layer: "A",
  },
  upside: {
    term: "Upside scenario",
    short: "A strong year, of the kind that follows a recovery.",
    long: "Included to keep expectations symmetric — good years are as unpredictable as bad ones.",
    layer: "A",
  },
  severe: {
    term: "Severe drawdown",
    short: "A 2008/2020-style shock measured peak to trough.",
    long:
      "The survivability test. If a goal within a few years breaks in this scenario, the allocation is too aggressive for that goal regardless of tolerance.",
    layer: "A",
  },
  navFreshness: {
    term: "NAV freshness",
    short: "How recently the fund NAV history was fetched.",
    long:
      "Stale NAV data blocks tax-aware switch recommendations, because realised gains and exit implications would be computed on outdated prices.",
    layer: "A",
  },
  taxAwareSwitch: {
    term: "Tax-aware switch",
    short: "A move between funds that accounts for exit load and capital gains tax.",
    long:
      "The engine only recommends a switch when the structural benefit survives the tax and exit cost, and only when tax inputs and NAV data are complete.",
    layer: "A",
  },
  layerA: {
    term: "Layer A (engine math)",
    short: "The deterministic calculation layer — every figure originates here.",
    long:
      "Same inputs always produce the same output. Scores, allocations, SIP changes, tax and stress numbers are all Layer A.",
    layer: "A",
  },
  layerB: {
    term: "Layer B (plain English)",
    short: "The AI interpretation layer — explains Layer A, never recalculates it.",
    long:
      "Receives the engine output as a read-only fact sheet. Any number it prints is checked back against those facts, and unverified figures are flagged instead of shipped.",
    layer: "B",
  },
};

export const glossaryList = (): GlossaryEntry[] =>
  Object.values(GLOSSARY).sort((a, b) => a.term.localeCompare(b.term));
