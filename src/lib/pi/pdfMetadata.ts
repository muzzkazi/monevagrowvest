// Identity metadata embedded in every exported Portfolio Intelligence PDF.
//
// A PDF that leaves the advisor's machine must be traceable back to the exact
// saved run and version row it was produced from. The identity is written into
// the PDF document properties (Keywords) in a parseable form, so an export can
// be audited later without trusting the file name.
//
// Nothing here interprets or recomputes engine numbers — it only fingerprints
// the inputs/outputs that were already saved.

import { EngineOutput } from "./types";
import { PiRunInputs } from "./runs";

export const PDF_METADATA_TAG = "moneva-pi";

export interface RunPdfIdentity {
  runId: string | null;
  versionId: string | null;
  versionNo: number | null;
  clientId: string | null;
  runName: string;
  clientName: string;
  assumedReturnPct: number;
  savedAt: string | null;
  fingerprint: string;
}

/** Deterministic JSON with object keys sorted, so key order can never move the hash. */
export const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
};

/** FNV-1a, 32-bit, hex — stable across runs and environments (no Date/Math.random). */
export const contentHash = (input: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

export const runFingerprint = (params: {
  inputs: PiRunInputs;
  assumedReturnPct: number;
  output: EngineOutput | null;
}): string =>
  contentHash(
    stableStringify({
      inputs: params.inputs,
      assumedReturnPct: params.assumedReturnPct,
      output: params.output,
    }),
  );

export const buildRunPdfIdentity = (params: {
  runId?: string | null;
  versionId?: string | null;
  versionNo?: number | null;
  clientId?: string | null;
  runName: string;
  inputs: PiRunInputs;
  assumedReturnPct: number;
  output: EngineOutput | null;
  savedAt?: string | null;
}): RunPdfIdentity => ({
  runId: params.runId ?? null,
  versionId: params.versionId ?? null,
  versionNo: params.versionNo ?? null,
  clientId: params.clientId ?? null,
  runName: params.runName,
  clientName: params.inputs.profile.clientName || "Unnamed client",
  assumedReturnPct: params.assumedReturnPct,
  savedAt: params.savedAt ?? null,
  fingerprint: runFingerprint({
    inputs: params.inputs,
    assumedReturnPct: params.assumedReturnPct,
    output: params.output,
  }),
});

const esc = (v: string | number | null) =>
  v === null || v === undefined ? "-" : String(v).replace(/[;()\\]/g, " ").trim() || "-";

/** Serialises the identity into the PDF Keywords field: `key=value; key=value`. */
export const encodeRunPdfKeywords = (id: RunPdfIdentity): string =>
  [
    PDF_METADATA_TAG,
    `run-id=${esc(id.runId)}`,
    `version-id=${esc(id.versionId)}`,
    `version-no=${esc(id.versionNo)}`,
    `client-id=${esc(id.clientId)}`,
    `run-name=${esc(id.runName)}`,
    `client-name=${esc(id.clientName)}`,
    `assumed-return-pct=${esc(id.assumedReturnPct)}`,
    `saved-at=${esc(id.savedAt)}`,
    `fingerprint=${esc(id.fingerprint)}`,
  ].join("; ");

export const parseRunPdfKeywords = (keywords: string): Record<string, string> => {
  const out: Record<string, string> = {};
  keywords
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      const i = part.indexOf("=");
      if (i === -1) {
        if (part === PDF_METADATA_TAG) out.tag = PDF_METADATA_TAG;
        return;
      }
      out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
    });
  return out;
};

/** Pulls the Keywords string out of raw PDF bytes decoded as latin1. */
export const readRunPdfKeywords = (rawPdf: string): string | null => {
  const m = rawPdf.match(/\/Keywords\s*\(((?:\\.|[^\\()])*)\)/);
  return m ? m[1].replace(/\\([()\\])/g, "$1") : null;
};

export const readRunPdfIdentity = (rawPdf: string): Record<string, string> | null => {
  const kw = readRunPdfKeywords(rawPdf);
  return kw ? parseRunPdfKeywords(kw) : null;
};

/** True only when the embedded identity matches the saved run/version exactly. */
export const pdfIdentityMatches = (
  embedded: Record<string, string> | null,
  expected: RunPdfIdentity,
): boolean =>
  !!embedded &&
  embedded.tag === PDF_METADATA_TAG &&
  embedded["run-id"] === esc(expected.runId) &&
  embedded["version-id"] === esc(expected.versionId) &&
  embedded["version-no"] === esc(expected.versionNo) &&
  embedded["client-id"] === esc(expected.clientId) &&
  embedded["fingerprint"] === expected.fingerprint;
