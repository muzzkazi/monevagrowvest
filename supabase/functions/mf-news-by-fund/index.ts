// Per-fund news via Google News RSS (public, no key required).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const cleanText = (t: string) =>
  t
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

async function fetchGoogleNewsForFund(fundName: string, limit = 6) {
  const q = encodeURIComponent(`"${fundName}" mutual fund`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
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
    return items.slice(0, limit).map((item) => {
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
