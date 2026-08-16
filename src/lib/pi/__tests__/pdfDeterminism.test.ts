// Determinism contract for the one-click PDF export.
//
// Same NAV data, same inputs => byte-identical PDF content. The only fields
// allowed to differ between two exports are the PDF metadata stamps that jsPDF
// writes from the clock/RNG (CreationDate, file ID), which are normalised out.

import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import { generateRunPdf, RunPdfInput } from "../runPdf";
import { runEngine } from "../engine";
import { buildSwitchPlan, computeHoldingTaxes } from "../tax";
import { runStressTest } from "../stress";
import { buildDataQualityReport } from "../dataQuality";
import { AssetBucket } from "../types";
import { NavMetrics } from "../navMetrics";
import { FIXED_NOW, engineInput, funds, navMetric, profile } from "./fixtures";

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
const holdings = computeHoldingTaxes(funds, { annualIncome: profile.annualIncome });
const switchPlan = buildSwitchPlan(
  funds,
  [{ fundId: "f2", reason: "Small cap sleeve is above the risk band", amount: 300000 }],
  { annualIncome: profile.annualIncome },
);
const stress = runStressTest({
  allocation: output.allocation,
  portfolioValue: output.totals.currentValue,
  monthlySip: output.totals.currentSip + output.totals.additionalSip,
  bucketMetrics,
  nearestEssentialGoalYears: 8,
});
const codedFunds = funds.map((f, i) => ({ ...f, schemeCode: String(100001 + i) }));
const quality = buildDataQualityReport({
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

const pdfInput: RunPdfInput = {
  runName: "Test Client — August review",
  versionNo: 3,
  inputs: {
    profile: engineInput.profile,
    goals: engineInput.goals,
    riskAnswers: engineInput.riskAnswers,
    constraints: engineInput.constraints,
    funds,
    additionalSip: engineInput.additionalSip,
    declaredSipBudget: engineInput.declaredSipBudget,
    assumedReturnPct: engineInput.assumedReturnPct,
  } as RunPdfInput["inputs"],
  assumedReturnPct: engineInput.assumedReturnPct,
  output,
  holdings,
  switchPlan,
  stress,
  quality,
  save: false,
};

/** Raw PDF bytes as a latin1 string, with clock/RNG metadata masked. */
const bytes = (input: RunPdfInput = pdfInput) => {
  const doc = generateRunPdf(input);
  return (doc.output("arraybuffer") as ArrayBuffer)
    ? new TextDecoder("latin1").decode(new Uint8Array(doc.output("arraybuffer") as ArrayBuffer))
    : "";
};

const normalise = (raw: string) =>
  raw
    .replace(/\/CreationDate\s*\(([^)]*)\)/g, "/CreationDate (MASKED)")
    .replace(/\/ID\s*\[[^\]]*\]/g, "/ID [MASKED]");

/** Every text run jsPDF wrote, in page order — the visible content of the PDF. */
const textRuns = (raw: string) =>
  (raw.match(/\((?:\\.|[^\\()])*\)\s*Tj/g) ?? []).map((m) =>
    m
      .replace(/\s*Tj$/, "")
      .slice(1, -1)
      .replace(/\\([()\\])/g, "$1"),
  );

describe("run PDF export determinism", () => {
  it("produces identical bytes for the same NAV data and inputs", () => {
    const a = normalise(bytes());
    const b = normalise(bytes());
    expect(a.length).toBeGreaterThan(1000);
    expect(a).toBe(b);
  });

  it("produces an identical text layer across repeated exports", () => {
    const a = textRuns(bytes());
    const b = textRuns(bytes());
    expect(a.length).toBeGreaterThan(20);
    expect(a).toEqual(b);
  });

  it("keeps the text layer stable against a committed snapshot", () => {
    expect(textRuns(bytes())).toMatchSnapshot();
  });

  it("prints the recommendation, assumptions, metrics and stress sections", () => {
    const text = textRuns(bytes()).join("\n").toLowerCase();
    expect(text).toContain("assumption");
    expect(text).toMatch(/stress/);
    expect(text).toMatch(/sip/);
    expect(text).toContain("test client");
  });

  it("changes deterministically when an input changes, and only then", () => {
    const base = normalise(bytes());
    const changed = normalise(
      bytes({ ...pdfInput, assumedReturnPct: pdfInput.assumedReturnPct + 1 }),
    );
    expect(changed).not.toBe(base);
    // Re-running the changed export is itself reproducible.
    expect(
      normalise(bytes({ ...pdfInput, assumedReturnPct: pdfInput.assumedReturnPct + 1 })),
    ).toBe(changed);
  });

  it("does not leak wall-clock time into the rendered page content", () => {
    vi.setSystemTime(new Date("2026-08-15T00:00:00.000Z"));
    const a = textRuns(bytes());
    vi.setSystemTime(new Date("2026-08-15T18:42:11.000Z"));
    const b = textRuns(bytes());
    vi.setSystemTime(FIXED_NOW);
    expect(a).toEqual(b);
  });
});
