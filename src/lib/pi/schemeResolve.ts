import { searchAmfi } from "@/lib/amfiSearch";

export type SchemeHit = { schemeCode: number | string; schemeName: string };

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9&\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokens = (s: string) => normalise(s).split(" ").filter((t) => t.length > 1);

/**
 * Score how well an AMFI scheme name matches free-typed text.
 * Higher is better. Purely deterministic — no AI, no guessing of figures.
 */
export const scoreSchemeMatch = (typed: string, candidate: string): number => {
  const t = normalise(typed);
  const c = normalise(candidate);
  if (!t || !c) return 0;

  if (t === c) return 1000;

  let score = 0;
  if (c.startsWith(t)) score += 300;
  else if (c.includes(t)) score += 200;

  const tt = tokens(typed);
  const ct = new Set(tokens(candidate));
  const covered = tt.filter((tok) => ct.has(tok)).length;
  score += tt.length ? (covered / tt.length) * 250 : 0;

  // Prefer the plan/option the advisor actually typed; otherwise default to
  // Direct + Growth, which is the canonical plan for advisory portfolios.
  const wantsDirect = /\bdirect\b/.test(t);
  const wantsRegular = /\bregular\b/.test(t);
  const isDirect = /\bdirect\b/.test(c);
  const isRegular = /\bregular\b/.test(c);
  if (wantsDirect && isDirect) score += 60;
  else if (wantsRegular && isRegular) score += 60;
  else if (!wantsDirect && !wantsRegular && isDirect) score += 25;

  const wantsIdcw = /\b(idcw|dividend|payout)\b/.test(t);
  const isIdcw = /\b(idcw|dividend|payout)\b/.test(c);
  if (wantsIdcw && isIdcw) score += 40;
  else if (!wantsIdcw && /\bgrowth\b/.test(c)) score += 25;
  else if (!wantsIdcw && isIdcw) score -= 30;

  // Shorter names win ties — avoids picking odd long variants.
  score -= Math.min(c.length / 20, 8);
  return score;
};

/** Rank AMFI hits against the typed text, best first. */
export const rankSchemeHits = (typed: string, hits: SchemeHit[]): SchemeHit[] =>
  [...hits]
    .map((h) => ({ h, s: scoreSchemeMatch(typed, h.schemeName) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.h);

/**
 * Resolve free-typed text to the single best AMFI scheme.
 * Tries the full text, then progressively shorter prefixes of it, so a typed
 * full name (with extra words like "fund" / "plan") still resolves.
 */
export const resolveSchemeName = async (
  typed: string,
  signal?: AbortSignal,
): Promise<SchemeHit | null> => {
  const t = typed.trim();
  if (t.length < 3) return null;

  const words = normalise(t).split(" ").filter(Boolean);
  const queries = [t];
  if (words.length > 3) queries.push(words.slice(0, 4).join(" "));
  if (words.length > 2) queries.push(words.slice(0, 3).join(" "));
  if (words.length > 1) queries.push(words.slice(0, 2).join(" "));

  for (const q of queries) {
    let hits: SchemeHit[] = [];
    try {
      hits = (await searchAmfi(q, signal)) as SchemeHit[];
    } catch {
      hits = [];
    }
    if (hits.length === 0) continue;
    const ranked = rankSchemeHits(t, hits);
    const best = ranked[0];
    if (best && scoreSchemeMatch(t, best.schemeName) > 120) return best;
  }
  return null;
};
