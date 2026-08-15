// Determinism contract for the Layer A engines.
//
// Given identical inputs and identical NAV data, the engine, tax, SIP
// optimisation and stress modules must return byte-identical results apart from
// the `asOf` timestamps they stamp on their output. These tests fail loudly if
// any module starts depending on wall-clock time, random ordering or mutation of
// its inputs.

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { runEngine } from "../engine";
import { buildSwitchPlan, computeHoldingTaxes, marginalSlab } from "../tax";
import { runStressTest } from "../stress";
import { buildDataQualityReport } from "../dataQuality";
import { AssetBucket } from "../types";
import { NavMetrics } from "../navMetrics";
import { FIXED_NOW, engineInput, funds, navMetric, profile } from "./fixtures";

/** Removes the wall-clock stamps so the comparison is about the numbers. */
const stripTimestamps = <T>(value: T): T =>
  JSON.parse(
    JSON.stringify(value, (key, v) => (key === "asOf" || key === "fetchedAt" || key === "servedAt" ? "FIXED" : v)),
  ) as T;

const bucketMetrics: Partial<Record<AssetBucket, NavMetrics[]>> = {
  "Indian Equity": [navMetric("100001", 0), navMetric("100002", 1)],
  Debt: [navMetric("100003", 2)],
  Gold: [navMetric("100004", 3)],
};

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});
afterAll(() => vi.useRealTimers());

describe("engine determinism", () => {
  it("returns identical output for identical inputs", () => {
    const a = runEngine(engineInput);
    const b = runEngine(engineInput);
    expect(stripTimestamps(b)).toEqual(stripTimestamps(a));
  });

  it("does not mutate the inputs it is given", () => {
    const snapshot = JSON.stringify(engineInput);
    runEngine(engineInput);
    expect(JSON.stringify(engineInput)).toBe(snapshot);
  });

  it("produces the same SIP optimisation plan across repeated runs", () => {
    const runs = [runEngine(engineInput), runEngine(engineInput), runEngine(engineInput)];
    const plans = runs.map((r) => r.sipPlan.map((a) => `${a.fundId}:${a.action}:${a.recommendedSip}`).join("|"));
    expect(new Set(plans).size).toBe(1);
  });

  it("keeps recommended SIP within the advisor's available budget", () => {
    const out = runEngine(engineInput);
    const total = out.sipPlan.reduce((s, a) => s + a.recommendedSip, 0);
    const available = out.totals.currentSip + out.totals.additionalSip;
    expect(total).toBeLessThanOrEqual(available + 1);
  });

  it("reacts to a changed input rather than returning a constant", () => {
    const conservative = runEngine({
      ...engineInput,
      riskAnswers: { ...engineInput.riskAnswers, drawdownReaction: 1, volatilityComfort: 1, lossHorizon: 1 },
    });
    const base = runEngine(engineInput);
    expect(conservative.risk.finalProfile).not.toBe(base.risk.finalProfile);
  });
});

describe("tax engine determinism", () => {
  const ctx = { annualIncome: profile.annualIncome, asOf: FIXED_NOW };

  it("computes identical per-holding tax positions for identical inputs", () => {
    const a = computeHoldingTaxes(funds, ctx);
    const b = computeHoldingTaxes(funds, ctx);
    expect(b).toEqual(a);
  });

  it("derives the marginal slab purely from income", () => {
    expect(marginalSlab(2400000)?.marginalRatePct).toBe(25);
    expect(marginalSlab(2400001)?.marginalRatePct).toBe(30);
    expect(marginalSlab(0)).toBeNull();
  });

  it("applies the 1.25L equity LTCG exemption once across the portfolio", () => {
    const taxes = computeHoldingTaxes(funds, ctx);
    const used = taxes.reduce((s, t) => s + t.exemptionUsed, 0);
    expect(used).toBeLessThanOrEqual(125000);
  });

  it("refuses to invent missing tax inputs", () => {
    const incomplete = [{ ...funds[0], purchaseDate: undefined, investedAmount: 0 }];
    const [row] = computeHoldingTaxes(incomplete, ctx);
    expect(row.status).toBe("insufficient");
    expect(row.taxIfExitedFully).toBeNull();
    expect(row.missing).toContain("purchase date");
  });

  it("returns an identical switch plan for identical candidates", () => {
    const candidates = [
      { fundId: "f2", reason: "Small cap sleeve is over target", amount: 300000 },
      { fundId: "f4", reason: "Gold above target weight", amount: 50000 },
    ];
    const a = buildSwitchPlan(funds, candidates, ctx);
    const b = buildSwitchPlan(funds, candidates, ctx);
    expect(stripTimestamps(b)).toEqual(stripTimestamps(a));
  });

  it("marks an unpriceable exit as insufficient data instead of guessing", () => {
    const plan = buildSwitchPlan(funds, [{ fundId: "does-not-exist", reason: "hypothetical" }], ctx);
    expect(plan.options[0].verdict).toBe("Insufficient current data");
    expect(plan.options[0].taxCost).toBeNull();
  });
});

describe("stress test determinism", () => {
  const allocation = runEngine(engineInput).allocation;
  const base = {
    allocation,
    portfolioValue: 2600000,
    monthlySip: 43000,
    nearestEssentialGoalYears: 8,
  };

  it("returns identical scenarios for the same allocation and NAV metrics", () => {
    const a = runStressTest({ ...base, bucketMetrics });
    const b = runStressTest({ ...base, bucketMetrics });
    expect(stripTimestamps(b)).toEqual(stripTimestamps(a));
  });

  it("uses the computed basis when every bucket has NAV history", () => {
    const out = runStressTest({ ...base, bucketMetrics });
    expect(out.basis).toBe("computed");
    expect(out.dataGaps).toEqual([]);
  });

  it("falls back to labelled assumptions when NAV history is missing", () => {
    const out = runStressTest(base);
    expect(out.basis).toBe("assumption");
    expect(out.dataGaps.length).toBeGreaterThan(0);
    expect(out.scenarios.every((s) => s.basis === "assumption")).toBe(true);
  });

  it("keeps the severe scenario no better than the downside scenario", () => {
    const out = runStressTest({ ...base, bucketMetrics });
    const downside = out.scenarios.find((s) => s.key === "downside")!;
    const severe = out.scenarios.find((s) => s.key === "severe")!;
    expect(severe.portfolioReturnPct).toBeLessThanOrEqual(downside.portfolioReturnPct);
  });
});

describe("data-quality gate", () => {
  const freshNav = {
    requestedCodes: ["100001"],
    unavailable: [],
    oldestFetchedAt: FIXED_NOW.toISOString(),
    error: null,
  };
  const codedFunds = funds.map((f, i) => ({ ...f, schemeCode: String(100001 + i) }));

  it("allows switching only when tax inputs and NAV data are complete and fresh", () => {
    const report = buildDataQualityReport({
      funds: codedFunds,
      annualIncome: profile.annualIncome,
      nav: { ...freshNav, requestedCodes: codedFunds.map((f) => f.schemeCode) },
      now: FIXED_NOW,
    });
    expect(report.switchingAllowed).toBe(true);
    expect(report.navFreshness).toBe("fresh");
  });

  it("blocks switching when the marginal slab cannot be derived", () => {
    const report = buildDataQualityReport({
      funds: codedFunds,
      annualIncome: 0,
      nav: freshNav,
      now: FIXED_NOW,
    });
    expect(report.switchingAllowed).toBe(false);
    expect(report.taxInputsComplete).toBe(false);
    expect(report.blockers.some((b) => b.id === "tax-income")).toBe(true);
  });

  it("blocks switching on expired NAV data but only warns when mildly stale", () => {
    const stale = buildDataQualityReport({
      funds: codedFunds,
      annualIncome: profile.annualIncome,
      nav: { ...freshNav, oldestFetchedAt: new Date(FIXED_NOW.getTime() - 48 * 3_600_000).toISOString() },
      now: FIXED_NOW,
    });
    expect(stale.navFreshness).toBe("stale");
    expect(stale.switchingAllowed).toBe(true);

    const expired = buildDataQualityReport({
      funds: codedFunds,
      annualIncome: profile.annualIncome,
      nav: { ...freshNav, oldestFetchedAt: new Date(FIXED_NOW.getTime() - 10 * 24 * 3_600_000).toISOString() },
      now: FIXED_NOW,
    });
    expect(expired.navFreshness).toBe("expired");
    expect(expired.switchingAllowed).toBe(false);
  });

  it("is deterministic for the same inputs", () => {
    const args = { funds: codedFunds, annualIncome: profile.annualIncome, nav: freshNav, now: FIXED_NOW };
    expect(buildDataQualityReport(args)).toEqual(buildDataQualityReport(args));
  });
});
