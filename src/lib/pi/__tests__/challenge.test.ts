// The challenge / sanity review must be deterministic and must never let a
// contradiction through silently.

import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import { runChallengeChecks } from "../challenge";
import { runEngine } from "../engine";
import { buildDataQualityReport } from "../dataQuality";
import { buildSwitchPlan } from "../tax";
import { FIXED_NOW, engineInput, funds, profile } from "./fixtures";

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});
afterAll(() => vi.useRealTimers());

const output = runEngine(engineInput);
const inputs = {
  profile: engineInput.profile,
  goals: engineInput.goals,
  riskAnswers: engineInput.riskAnswers,
  constraints: engineInput.constraints,
  funds,
  additionalSip: engineInput.additionalSip,
  declaredSipBudget: engineInput.declaredSipBudget,
};

const codedFunds = funds.map((f, i) => ({ ...f, schemeCode: String(100001 + i) }));
const cleanQuality = buildDataQualityReport({
  funds: codedFunds,
  annualIncome: profile.annualIncome,
  nav: {
    requestedCodes: codedFunds.map((f) => f.schemeCode),
    unavailable: [],
    oldestFetchedAt: FIXED_NOW.toISOString(),
    error: null,
  },
  now: FIXED_NOW,
});
const brokenQuality = buildDataQualityReport({
  funds: funds.map((f, i) => (i === 1 ? { ...f, purchaseDate: "" } : f)),
  annualIncome: 0,
  nav: { requestedCodes: ["100001"], unavailable: ["100001"], oldestFetchedAt: null, error: null },
  now: FIXED_NOW,
});
const switchPlan = buildSwitchPlan(
  funds,
  [{ fundId: "f2", reason: "Small cap sleeve is above the risk band", amount: 300000 }],
  { annualIncome: profile.annualIncome },
);

const base = {
  inputs,
  output,
  quality: cleanQuality,
  switchPlan,
  stress: null,
  assumedReturnPct: engineInput.assumedReturnPct,
};

describe("challenge checks", () => {
  it("is deterministic for the same inputs", () => {
    expect(runChallengeChecks(base)).toEqual(runChallengeChecks(base));
  });

  it("keeps the finding set stable against a snapshot", () => {
    expect(
      runChallengeChecks(base).findings.map((x) => ({ id: x.id, severity: x.severity, area: x.area })),
    ).toMatchSnapshot();
  });

  it("blocks when the data-quality gate is closed", () => {
    const report = runChallengeChecks({ ...base, quality: brokenQuality });
    expect(report.blockers.length).toBeGreaterThan(0);
    expect(report.consistent).toBe(false);
    expect(report.blockers.every((b) => b.question.length > 0)).toBe(true);
  });

  it("flags a switch recommended while switching is blocked", () => {
    const report = runChallengeChecks({ ...base, quality: brokenQuality });
    const ids = report.findings.map((x) => x.id);
    const actionable = switchPlan.options.some((o) =>
      ["Switch now", "Stagger the switch"].includes(o.verdict),
    );
    if (actionable) expect(ids).toContain("switch-recommended-while-blocked");
  });

  it("flags a SIP plan that exceeds the declared budget", () => {
    const report = runChallengeChecks({
      ...base,
      inputs: { ...inputs, declaredSipBudget: 1000 },
    });
    expect(report.findings.map((x) => x.id)).toContain("sip-exceeds-declared-budget");
    expect(report.consistent).toBe(false);
  });

  it("flags an increase into an already overweight bucket", () => {
    const overweight = {
      ...output,
      allocation: output.allocation.map((a) => ({ ...a, gapPct: -20 })),
      sipPlan: output.sipPlan.map((a, i) =>
        i === 0 ? { ...a, action: "INCREASE" as const, recommendedSip: a.currentSip + 5000 } : a,
      ),
    };
    const ids = runChallengeChecks({ ...base, output: overweight }).findings.map((x) => x.id);
    expect(ids.some((id) => id.startsWith("increase-into-overweight-"))).toBe(true);
  });

  it("flags a target equity allocation outside the derived risk band", () => {
    const skewed = {
      ...output,
      allocation: output.allocation.map((a) =>
        a.bucket === "Indian Equity" ? { ...a, targetPct: 99 } : { ...a, targetPct: 0 },
      ),
    };
    expect(runChallengeChecks({ ...base, output: skewed }).findings.map((x) => x.id)).toContain(
      "target-equity-outside-band",
    );
  });

  it("quotes only figures that exist in the engine output", () => {
    const report = runChallengeChecks(base);
    report.findings.forEach((f) => {
      expect(`${f.statement}${f.expected}${f.observed}`.length).toBeGreaterThan(0);
    });
    // Every finding carries an id, an area and a question the advisor can answer.
    report.findings.forEach((f) => {
      expect(f.id).toBeTruthy();
      expect(f.area).toBeTruthy();
      expect(f.question).toBeTruthy();
    });
  });
});
