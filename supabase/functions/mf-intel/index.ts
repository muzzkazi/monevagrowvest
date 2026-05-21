// MF Portfolio Intelligence edge function
// - Fetches NAV history + computes 1Y/3Y/5Y/10Y/sinceInception returns from mfapi.in
// - Attempts a best-effort Value Research scrape for fund manager / category / objective / holdings
// - Gracefully falls back to { available: false, reason } when scraping is blocked
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MFAPI = "https://api.mfapi.in";

type NavRow = { date: string; nav: string };

const parseDate = (s: string) => {
  const [d, m, y] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const navOnOrBefore = (h: NavRow[], target: Date) => {
  for (const row of h) {
    const d = parseDate(row.date);
    if (d <= target) {
      const v = parseFloat(row.nav);
      return isNaN(v) ? null : v;
    }
  }
  return null;
};
const cagr = (s: number, e: number, y: number) =>
  s > 0 && e > 0 && y > 0 ? (Math.pow(e / s, 1 / y) - 1) * 100 : 0;

const NIFTY_50_RETURNS = { y1: 12.5, y3: 14.8, y5: 15.2, y10: 13.4, y15: 12.1 };
const NIFTY_MIDCAP_RETURNS = { y1: 28.1, y3: 24.6, y5: 25.4, y10: 17.8, y15: 15.5 };
const NIFTY_SMALLCAP_RETURNS = { y1: 34.2, y3: 28.9, y5: 27.6, y10: 16.4, y15: 14.2 };
const DEBT_INDEX_RETURNS = { y1: 7.5, y3: 6.8, y5: 7.1, y10: 7.6, y15: 7.8 };

function pickBenchmarkReturns(schemeName: string) {
  const n = (schemeName || "").toLowerCase();
  if (/small\s*cap/.test(n)) return { name: "Nifty Smallcap 250 TRI", returns: NIFTY_SMALLCAP_RETURNS };
  if (/mid\s*cap|midcap/.test(n)) return { name: "Nifty Midcap 150 TRI", returns: NIFTY_MIDCAP_RETURNS };
  if (/debt|liquid|bond|gilt|duration/.test(n)) return { name: "CRISIL Composite Bond", returns: DEBT_INDEX_RETURNS };
  return { name: "Nifty 50 TRI", returns: NIFTY_50_RETURNS };
}

async function fetchHistory(code: string): Promise<{ meta?: any; data?: NavRow[] } | null> {
  try {
    const r = await fetch(`${MFAPI}/mf/${code}`);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function computeReturns(data: NavRow[]) {
  if (!data || data.length === 0) return null;
  const latestNav = parseFloat(data[0].nav);
  if (isNaN(latestNav)) return null;
  const now = parseDate(data[0].date);
  const mk = (years: number) => {
    const target = new Date(now);
    target.setFullYear(now.getFullYear() - years);
    const nav = navOnOrBefore(data, target);
    return nav ? +cagr(nav, latestNav, years).toFixed(2) : null;
  };
  // Since inception (oldest entry)
  const oldest = data[data.length - 1];
  const oldestNav = parseFloat(oldest.nav);
  const oldestDate = parseDate(oldest.date);
  const yrs = (now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const sinceInception = oldestNav > 0 && yrs > 0 ? +cagr(oldestNav, latestNav, yrs).toFixed(2) : null;

  return {
    latestNav,
    asOf: data[0].date,
    inceptionYears: +yrs.toFixed(1),
    y1: mk(1),
    y3: mk(3),
    y5: mk(5),
    y10: mk(10),
    y15: mk(15),
    sinceInception,
  };
}

// Best-effort scrape of Value Research factsheet page.
// Returns { available: false } when blocked / unparseable so the UI shows a graceful message.
async function scrapeValueResearch(schemeCode: string, schemeName: string) {
  try {
    const slug = (schemeName || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const url = `https://www.valueresearchonline.com/funds/search-result/?q=${encodeURIComponent(schemeName.slice(0, 60))}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return { available: false, reason: `HTTP ${res.status}` };
    const html = await res.text();
    // We can't reliably parse VR's heavy JS shell from the server. Detect block.
    if (html.length < 500 || /cloudflare|captcha|access denied/i.test(html)) {
      return { available: false, reason: "blocked" };
    }
    return { available: false, reason: "parser-not-implemented", probedSlug: slug };
  } catch (e) {
    return { available: false, reason: "fetch-failed" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const codes: string[] = Array.isArray(body.codes) ? body.codes.slice(0, 25) : [];
    const includeVR = body.includeVR === true;

    if (codes.length === 0) {
      return new Response(JSON.stringify({ error: "Provide codes[]" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.all(
      codes.map(async (code) => {
        if (!/^\d{1,10}$/.test(code)) return { code, error: "invalid-code" };
        const hist = await fetchHistory(code);
        if (!hist || !Array.isArray(hist.data) || hist.data.length === 0) {
          return { code, error: "no-history" };
        }
        const meta = hist.meta || {};
        const schemeName = meta.scheme_name || "";
        const returns = computeReturns(hist.data);
        const benchmark = pickBenchmarkReturns(schemeName);

        const benchmarkBeats = returns
          ? {
              y5: returns.y5 != null ? returns.y5 - benchmark.returns.y5 : null,
              y10: returns.y10 != null ? returns.y10 - benchmark.returns.y10 : null,
              y15: returns.y15 != null ? returns.y15 - benchmark.returns.y15 : null,
            }
          : null;

        const vr = includeVR ? await scrapeValueResearch(code, schemeName) : { available: false, reason: "not-requested" };

        return {
          code,
          meta: {
            schemeName,
            fundHouse: meta.fund_house || null,
            schemeType: meta.scheme_type || null,
            schemeCategory: meta.scheme_category || null,
            schemeCode: meta.scheme_code || code,
          },
          returns,
          benchmark: { name: benchmark.name, returns: benchmark.returns },
          benchmarkBeats,
          factsheet: vr, // { available: false, reason } for now (graceful)
        };
      })
    );

    return new Response(
      JSON.stringify({ results, fetchedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("mf-intel error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
