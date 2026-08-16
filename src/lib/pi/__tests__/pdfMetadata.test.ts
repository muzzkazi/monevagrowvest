// The exported PDF must carry the identity of the saved run/version it came
// from, and that identity must match the saved row EXACTLY — same run id,
// version id, version number, client id and content fingerprint.

import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import { generateRunPdf, RunPdfInput } from "../runPdf";
import { runEngine } from "../engine";
import {
  PDF_METADATA_TAG,
  buildRunPdfIdentity,
  contentHash,
  encodeRunPdfKeywords,
  parseRunPdfKeywords,
  pdfIdentityMatches,
  readRunPdfIdentity,
  runFingerprint,
  stableStringify,
} from "../pdfMetadata";
import { FIXED_NOW, engineInput, funds } from "./fixtures";

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});
afterAll(() => vi.useRealTimers());

const output = runEngine(engineInput);

/** Stands in for a row read back from pi_runs + pi_run_versions. */
const savedRun = {
  id: "6f2b8c4a-1111-4c2f-9a11-0e6b3c7d5a01",
  clientId: "b21f0a55-2222-4d3e-8c44-91a2f4b7c0d3",
  runName: "Test Client — August review",
  createdAt: "2026-08-14T06:30:00.000Z",
  version: { id: "9d4e7f10-3333-4a5b-bc66-2f8e1d0a4b55", versionNo: 3 },
  assumedReturnPct: engineInput.assumedReturnPct,
  inputs: {
    profile: engineInput.profile,
    goals: engineInput.goals,
    riskAnswers: engineInput.riskAnswers,
    constraints: engineInput.constraints,
    funds,
    additionalSip: engineInput.additionalSip,
    declaredSipBudget: engineInput.declaredSipBudget,
  } as RunPdfInput["inputs"],
};

const pdfInput: RunPdfInput = {
  runName: savedRun.runName,
  runId: savedRun.id,
  versionId: savedRun.version.id,
  versionNo: savedRun.version.versionNo,
  clientId: savedRun.clientId,
  savedAt: savedRun.createdAt,
  inputs: savedRun.inputs,
  assumedReturnPct: savedRun.assumedReturnPct,
  output,
  save: false,
};

const raw = (input: RunPdfInput = pdfInput) => {
  const doc = generateRunPdf(input);
  return new TextDecoder("latin1").decode(new Uint8Array(doc.output("arraybuffer") as ArrayBuffer));
};

const expectedIdentity = buildRunPdfIdentity({
  runId: savedRun.id,
  versionId: savedRun.version.id,
  versionNo: savedRun.version.versionNo,
  clientId: savedRun.clientId,
  runName: savedRun.runName,
  inputs: savedRun.inputs,
  assumedReturnPct: savedRun.assumedReturnPct,
  output,
  savedAt: savedRun.createdAt,
});

describe("fingerprint helpers", () => {
  it("hashes independently of object key order", () => {
    expect(stableStringify({ a: 1, b: { c: 2, d: 3 } })).toBe(stableStringify({ b: { d: 3, c: 2 }, a: 1 }));
    expect(contentHash(stableStringify({ a: 1, b: 2 }))).toBe(contentHash(stableStringify({ b: 2, a: 1 })));
  });

  it("is stable for the same inputs and changes when an input changes", () => {
    const base = runFingerprint({
      inputs: savedRun.inputs,
      assumedReturnPct: savedRun.assumedReturnPct,
      output,
    });
    expect(
      runFingerprint({ inputs: savedRun.inputs, assumedReturnPct: savedRun.assumedReturnPct, output }),
    ).toBe(base);
    expect(
      runFingerprint({ inputs: savedRun.inputs, assumedReturnPct: savedRun.assumedReturnPct + 1, output }),
    ).not.toBe(base);
  });

  it("round-trips through the keywords encoding", () => {
    expect(parseRunPdfKeywords(encodeRunPdfKeywords(expectedIdentity))).toMatchObject({
      tag: PDF_METADATA_TAG,
      "run-id": savedRun.id,
      "version-id": savedRun.version.id,
      "version-no": "3",
      "client-id": savedRun.clientId,
      fingerprint: expectedIdentity.fingerprint,
    });
  });
});

describe("exported PDF metadata", () => {
  it("embeds the run id, version id, version number and client id", () => {
    const embedded = readRunPdfIdentity(raw());
    expect(embedded).not.toBeNull();
    expect(embedded).toMatchObject({
      tag: PDF_METADATA_TAG,
      "run-id": savedRun.id,
      "version-id": savedRun.version.id,
      "version-no": String(savedRun.version.versionNo),
      "client-id": savedRun.clientId,
      "saved-at": savedRun.createdAt,
      fingerprint: expectedIdentity.fingerprint,
    });
  });

  it("matches the saved run exactly", () => {
    expect(pdfIdentityMatches(readRunPdfIdentity(raw()), expectedIdentity)).toBe(true);
  });

  it("rejects an identity from a different run or version", () => {
    const embedded = readRunPdfIdentity(raw());
    expect(pdfIdentityMatches(embedded, { ...expectedIdentity, runId: "another-run" })).toBe(false);
    expect(pdfIdentityMatches(embedded, { ...expectedIdentity, versionId: "another-version" })).toBe(false);
    expect(pdfIdentityMatches(embedded, { ...expectedIdentity, versionNo: 4 })).toBe(false);
    expect(pdfIdentityMatches(embedded, { ...expectedIdentity, fingerprint: "deadbeef" })).toBe(false);
  });

  it("keeps the embedded metadata identical across repeated exports", () => {
    expect(readRunPdfIdentity(raw())).toEqual(readRunPdfIdentity(raw()));
  });

  it("prints the run and version identity on the page itself", () => {
    const text = (raw().match(/\((?:\\.|[^\\()])*\)\s*Tj/g) ?? [])
      .map((m) => m.replace(/\s*Tj$/, "").slice(1, -1).replace(/\\([()\\])/g, "$1"))
      .join("\n");
    expect(text).toContain(savedRun.id);
    expect(text).toContain(savedRun.version.id);
    expect(text).toContain(expectedIdentity.fingerprint);
  });

  it("changes the fingerprint — and only the fingerprint — when inputs change", () => {
    const before = readRunPdfIdentity(raw()) as Record<string, string>;
    const after = readRunPdfIdentity(
      raw({ ...pdfInput, assumedReturnPct: pdfInput.assumedReturnPct + 1 }),
    ) as Record<string, string>;
    expect(after.fingerprint).not.toBe(before.fingerprint);
    expect(after["run-id"]).toBe(before["run-id"]);
    expect(after["version-id"]).toBe(before["version-id"]);
    expect(after["version-no"]).toBe(before["version-no"]);
    expect(after["client-id"]).toBe(before["client-id"]);
  });

  it("marks an unsaved export as unsaved instead of inventing an id", () => {
    const embedded = readRunPdfIdentity(
      raw({ ...pdfInput, runId: null, versionId: null, versionNo: null, clientId: null, savedAt: null }),
    ) as Record<string, string>;
    expect(embedded["run-id"]).toBe("-");
    expect(embedded["version-id"]).toBe("-");
    expect(embedded["version-no"]).toBe("-");
  });
});
