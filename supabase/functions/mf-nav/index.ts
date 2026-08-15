// Live NAV feed for the Portfolio Intelligence engine.
//
// Fetches NAV history for one or more scheme codes from the public AMFI-derived
// mfapi.in endpoint, caches it in public.nav_cache and always returns the
// fetched_at freshness timestamp so the UI can label how current the data is.
//
// Public but read-only and strictly validated: the only accepted input is a
// short list of numeric scheme codes.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CODES = 25;
const MAX_AGE_HOURS = 12;
const MAX_POINTS = 1600; // ~6 years of daily NAV

interface CachedRow {
  scheme_code: string;
  scheme_name: string | null;
  fund_house: string | null;
  scheme_category: string | null;
  nav_history: Array<{ date: string; nav: number }>;
  latest_nav: number | null;
  latest_nav_date: string | null;
  source: string;
  fetched_at: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const toIso = (ddmmyyyy: string): string | null => {
  const m = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

const fetchFromApi = async (code: string) => {
  const res = await fetch(`https://api.mfapi.in/mf/${code}`);
  if (!res.ok) {
    const text = await res.text();
    console.error(`mfapi.in failed for ${code} [${res.status}]: ${text.slice(0, 200)}`);
    return null;
  }
  const payload = await res.json();
  const meta = payload?.meta ?? {};
  const raw: Array<{ date: string; nav: string }> = Array.isArray(payload?.data) ? payload.data : [];
  if (!raw.length) return null;

  const history = raw
    .map((p) => {
      const date = toIso(String(p.date));
      const nav = Number(p.nav);
      return date && Number.isFinite(nav) && nav > 0 ? { date, nav } : null;
    })
    .filter((p): p is { date: string; nav: number } => p !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-MAX_POINTS);

  if (!history.length) return null;
  const last = history[history.length - 1];

  return {
    scheme_code: code,
    scheme_name: meta.scheme_name ?? null,
    fund_house: meta.fund_house ?? null,
    scheme_category: meta.scheme_category ?? null,
    nav_history: history,
    latest_nav: last.nav,
    latest_nav_date: last.date,
    source: "mfapi.in",
    fetched_at: new Date().toISOString(),
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const body = await req.json().catch(() => null);
    const rawCodes = (body as Record<string, unknown> | null)?.schemeCodes;
    if (!Array.isArray(rawCodes) || rawCodes.length === 0) {
      return json({ error: "schemeCodes must be a non-empty array" }, 400);
    }
    if (rawCodes.length > MAX_CODES) {
      return json({ error: `At most ${MAX_CODES} scheme codes per request` }, 400);
    }
    const codes = [...new Set(rawCodes.map((c) => String(c).trim()))].filter((c) => /^\d{1,8}$/.test(c));
    if (!codes.length) return json({ error: "No valid numeric scheme codes supplied" }, 400);

    const forceRefresh = (body as Record<string, unknown>)?.forceRefresh === true;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: cachedRows, error: cacheErr } = await supabase
      .from("nav_cache")
      .select("*")
      .in("scheme_code", codes);
    if (cacheErr) console.error("nav_cache read failed", cacheErr.message);

    const cache = new Map<string, CachedRow>((cachedRows ?? []).map((r) => [r.scheme_code, r as CachedRow]));
    const cutoff = Date.now() - MAX_AGE_HOURS * 3600 * 1000;

    const results: CachedRow[] = [];
    const failed: string[] = [];

    for (const code of codes) {
      const hit = cache.get(code);
      const fresh = hit && !forceRefresh && new Date(hit.fetched_at).getTime() > cutoff;
      if (fresh) {
        results.push(hit);
        continue;
      }
      const fetched = await fetchFromApi(code);
      if (fetched) {
        const { error: upsertErr } = await supabase
          .from("nav_cache")
          .upsert({ ...fetched, updated_at: new Date().toISOString() }, { onConflict: "scheme_code" });
        if (upsertErr) console.error(`nav_cache upsert failed for ${code}`, upsertErr.message);
        results.push(fetched as CachedRow);
      } else if (hit) {
        // Upstream is down — serve the stale row and let the UI show its age.
        results.push(hit);
        failed.push(code);
      } else {
        failed.push(code);
      }
    }

    return json({
      series: results.map((r) => ({
        schemeCode: r.scheme_code,
        schemeName: r.scheme_name,
        fundHouse: r.fund_house,
        category: r.scheme_category,
        source: r.source,
        fetchedAt: r.fetched_at,
        latestNav: r.latest_nav,
        latestNavDate: r.latest_nav_date,
        history: r.nav_history ?? [],
      })),
      unavailable: failed,
      cacheMaxAgeHours: MAX_AGE_HOURS,
      servedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("mf-nav error", e);
    return json({ error: "Internal server error" }, 500);
  }
});
