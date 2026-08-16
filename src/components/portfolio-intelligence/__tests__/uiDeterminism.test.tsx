// UI-level determinism contract.
//
// The Layer A engines are already proven deterministic. These tests go one step
// further and assert that what the ADVISOR SEES — the rendered metrics, badges,
// verdicts and the width-driven allocation/stress bars ("charts") — is identical
// for the same NAV data and inputs, and matches a committed snapshot so any
// accidental formatting or logic regression fails loudly.

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import AnalysisPanel from "../AnalysisPanel";
import TaxSwitchPanel from "../TaxSwitchPanel";
import StressTestPanel from "../StressTestPanel";
import DataQualityPanel from "../DataQualityPanel";
import { runEngine } from "@/lib/pi/engine";
import { buildSwitchPlan, computeHoldingTaxes } from "@/lib/pi/tax";
import { runStressTest } from "@/lib/pi/stress";
import { buildDataQualityReport } from "@/lib/pi/dataQuality";
import { AssetBucket } from "@/lib/pi/types";
import { NavMetrics } from "@/lib/pi/navMetrics";
import { FIXED_NOW, engineInput, funds, navMetric, profile } from "@/lib/pi/__tests__/fixtures";

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});
afterAll(() => vi.useRealTimers());

const bucketMetrics: Partial<Record<AssetBucket, NavMetrics[]>> = {
  "Indian Equity": [navMetric("100001", 0), navMetric("100002", 1)],
  Debt: [navMetric("100003", 2)],
  Gold: [navMetric("100004", 3)],
};

const output = runEngine(engineInput);

const holdings = computeHoldingTaxes(funds, { annualIncome: profile.annualIncome, asOf: FIXED_NOW });

const switchPlan = buildSwitchPlan(
  funds,
  [{ fundId: "f2", reason: "Small cap sleeve is above the risk band", amount: 300000 }],
  { annualIncome: profile.annualIncome, asOf: FIXED_NOW },
);

const stress = runStressTest({
  allocation: output.allocation,
  portfolioValue: output.totals.currentValue,
  monthlySip: output.totals.currentSip + output.totals.additionalSip,
  bucketMetrics,
  nearestEssentialGoalYears: 8,
  now: FIXED_NOW,
});

const freshNav = {
  requestedCodes: ["100001", "100002", "100003", "100004"],
  unavailable: [],
  oldestFetchedAt: FIXED_NOW.toISOString(),
  error: null,
};

// Same holdings, with AMFI scheme codes present so NAV coverage is satisfied.
const codedFunds = funds.map((f, i) => ({ ...f, schemeCode: String(100001 + i) }));

const completeQuality = buildDataQualityReport({
  funds: codedFunds,
  annualIncome: profile.annualIncome,
  nav: freshNav,
  now: FIXED_NOW,
});

const brokenQuality = buildDataQualityReport({
  funds: funds.map((f, i) => (i === 1 ? { ...f, purchaseDate: "" } : f)),
  annualIncome: 0,
  nav: { requestedCodes: ["100001"], unavailable: ["100001"], oldestFetchedAt: null, error: null },
  now: FIXED_NOW,
});

/** Rendered markup with React's internal ids/keys removed so it is comparable. */
const markup = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const html = container.innerHTML
    .replace(/(id|for|aria-controls|aria-labelledby|aria-describedby)="[^"]*"/g, '$1="X"')
    // "as of" stamps are wall-clock by design — mask them, not the numbers.
    .replace(/\d{1,2}\/\d{1,2}\/\d{4},?\s*/g, "DATE ")
    .replace(/\d{1,2}:\d{2}(:\d{2})?(\s?[apAP]\.?[mM]\.?)?/g, "TIME")
    .replace(/\s+/g, " ");
  cleanup();
  return html;
};

/** Numbers, percentages and bar widths — the "metrics and charts" surface. */
const metricsOf = (html: string) => ({
  values: html.match(/₹[\d,]+|-?\d+(?:\.\d+)?%/g) ?? [],
  barWidths: html.match(/width:\s*[\d.]+%/g) ?? [],
});

const panels: Array<[string, () => React.ReactElement]> = [
  ["AnalysisPanel", () => <AnalysisPanel output={output} />],
  ["StressTestPanel", () => <StressTestPanel stress={stress} />],
  [
    "TaxSwitchPanel (switching unlocked)",
    () => <TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={completeQuality} />,
  ],
  [
    "TaxSwitchPanel (switching blocked)",
    () => <TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={brokenQuality} />,
  ],
  ["DataQualityPanel (clean)", () => <DataQualityPanel report={completeQuality} />],
  ["DataQualityPanel (blocked)", () => <DataQualityPanel report={brokenQuality} />],
];

describe("UI determinism", () => {
  panels.forEach(([name, ui]) => {
    it(`${name} renders identically for the same inputs`, () => {
      expect(markup(ui())).toEqual(markup(ui()));
    });

    it(`${name} metrics and bar widths match the committed snapshot`, () => {
      expect(metricsOf(markup(ui()))).toMatchSnapshot();
    });

    it(`${name} full markup matches the committed snapshot`, () => {
      expect(markup(ui())).toMatchSnapshot();
    });
  });

  it("re-running the engine does not change any displayed metric", () => {
    const second = runEngine(engineInput);
    expect(metricsOf(markup(<AnalysisPanel output={second} />))).toEqual(
      metricsOf(markup(<AnalysisPanel output={output} />)),
    );
  });

  it("blocking data quality replaces every switch verdict with the blocked badge", () => {
    const blocked = markup(<TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={brokenQuality} />);
    expect(blocked).toContain("Switch blocked");
    const unlocked = markup(<TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={completeQuality} />);
    expect(unlocked).not.toContain("Switch blocked");
  });
});
