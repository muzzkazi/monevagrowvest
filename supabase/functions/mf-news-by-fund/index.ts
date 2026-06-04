// Per-fund news via Google News RSS (public, no key required).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const decodeEntities = (t: string) =>
  t
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));

const cleanText = (t: string) => {
  let out = t.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");
  // Decode first so HTML-encoded <a href=…> tags inside Google News
  // descriptions become real tags we can strip in the next step.
  out = decodeEntities(out);
  // Strip tags twice in case decoding revealed a second layer.
  out = out.replace(/<[^>]*>/g, "").replace(/<[^>]*>/g, "");
  // Collapse whitespace
  return out.replace(/\s+/g, " ").trim();
};

/**
 * Strip plan / option suffixes from a scheme name so the query matches how
 * the fund is actually referenced in news headlines.
 *
 *   "Parag Parikh Flexi Cap Fund - Direct Plan - Growth"
 *     → "Parag Parikh Flexi Cap Fund"
 *   "HDFC Mid-Cap Opportunities Fund (G)" → "HDFC Mid-Cap Opportunities Fund"
 */
const normalizeFundName = (raw: string): string => {
  let n = raw;
  // Remove parenthetical plan/option markers — (G), (Growth), (IDCW), etc.
  n = n.replace(/\(([^)]{1,40})\)/g, "");
  // Drop common plan/option suffixes
  n = n.replace(
    /\s*[-–|]?\s*(direct plan|regular plan|direct|regular)\s*[-–|]?\s*(growth|payout|reinvestment|idcw|dividend)?\s*$/i,
    "",
  );
  n = n.replace(/\s*[-–|]\s*(growth|payout|reinvestment|idcw|dividend)\s*$/i, "");
  // Collapse trailing punctuation / whitespace
  return n.replace(/[\s\-–|]+$/g, "").replace(/\s+/g, " ").trim();
};

async function fetchGoogleNewsForFund(fundName: string, limit = 6) {
  const cleanName = normalizeFundName(fundName) || fundName;
  // Quoted phrase ensures we don't match partial words. `sort=date` asks
  // Google News to return items in publication-date order. We additionally
  // hard-filter anything older than `MAX_AGE_DAYS` below — `when:` operator
  // is unreliable from server-side IPs.
  const q = encodeURIComponent(`"${cleanName}"`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en&sort=date`;
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MonevaBot/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });
    if (!r.ok) return [];
    const xml = await r.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const parsed = items.map((item) => {
      const t = item.match(/<title>([\s\S]*?)<\/title>/);
      const l = item.match(/<link>([\s\S]*?)<\/link>/);
      const d = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const s = item.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      const desc = item.match(/<description>([\s\S]*?)<\/description>/);
      return {
        title: cleanText(t?.[1] || ""),
        url: cleanText(l?.[1] || ""),
        publishedAt: d?.[1] ? new Date(d[1]).toISOString() : new Date().toISOString(),
        source: cleanText(s?.[1] || "Google News"),
        excerpt: cleanText(desc?.[1] || "").slice(0, 180),
      };
    }).filter((x) => x.title && x.url);

    // Hard freshness cutoff so a fund with thin recent coverage doesn't
    // surface multi-year-old headlines.
    const MAX_AGE_DAYS = 120;
    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 3600 * 1000;
    const fresh = parsed.filter((x) => new Date(x.publishedAt).getTime() >= cutoff);

    // If we filtered everything out (very obscure fund), fall back to whatever
    // we got so the UI still shows something — but date-sorted, newest first.
    const finalList = fresh.length > 0 ? fresh : parsed;
    finalList.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    return finalList.slice(0, limit);
  } catch (e) {
    console.error("news fetch failed", fundName, e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const funds: string[] = Array.isArray(body.funds) ? body.funds.slice(0, 15) : [];
    const perFund: number = Math.min(Math.max(Number(body.perFund) || 5, 1), 10);

    if (funds.length === 0) {
      return new Response(JSON.stringify({ error: "Provide funds[] (scheme names)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.all(
      funds.map(async (name) => ({ fund: name, items: await fetchGoogleNewsForFund(name, perFund) }))
    );

    return new Response(
      JSON.stringify({ results, fetchedAt: new Date().toISOString() }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=600",
        },
      }
    );
  } catch (e) {
    console.error("mf-news-by-fund error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
