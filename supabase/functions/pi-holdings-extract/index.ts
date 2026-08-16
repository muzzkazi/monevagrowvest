// Moneva — holdings statement / screenshot extraction.
// Reads an uploaded holdings report (image, PDF) or pre-extracted spreadsheet text
// and returns a STRUCTURED list of holdings for advisor review.
// The model only transcribes what is visible — it never estimates a missing figure.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM = `You extract mutual fund holdings from Indian investment statements, broker/AMC holding reports and app screenshots (Groww, Zerodha Coin, Kuvera, MF Central, CAMS/KFin CAS, ICICI, HDFC etc).

RULES
1. Transcribe only what is actually visible in the document. NEVER estimate, average, annualise or compute a figure that is not printed.
2. If a field is absent for a row, return 0 for numeric fields and "" for text fields, and add the field name to that row's missingFields.
3. Amounts are Indian rupees. Strip currency symbols, commas and "Cr"/"L" suffixes by expanding them to plain rupees (1.2 L = 120000, 1.2 Cr = 12000000). Never round to a different order of magnitude.
4. A monthly SIP amount must only be filled when the document clearly shows an active SIP / recurring instalment for that scheme. Otherwise sipAmount = 0.
5. Never invent schemes. One row per scheme as printed. Keep the scheme name verbatim (including Direct/Regular and Growth/IDCW).
6. Classify assetBucket and role from the scheme name and category only. If unsure, use "Indian Equity" + "Flexi Cap" and lower the confidence.
7. Set confidence "low" for anything blurry, cropped, ambiguous or derived from a partial screenshot.`;

const tool = {
  type: "function",
  function: {
    name: "submit_holdings",
    description: "Holdings transcribed verbatim from the supplied documents.",
    parameters: {
      type: "object",
      properties: {
        statementType: { type: "string", description: "e.g. CAS statement, Groww screenshot, broker holdings PDF, spreadsheet export, unknown" },
        statementDate: { type: "string", description: "As-on date printed on the document in YYYY-MM-DD, or empty string." },
        holdings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              schemeName: { type: "string" },
              fundHouse: { type: "string" },
              category: { type: "string", enum: ["Equity", "Debt", "Hybrid", "Other"] },
              subCategory: { type: "string", description: "Large Cap, Mid Cap, Small Cap, Flexi Cap, ELSS, Liquid, Gold, Index etc. Empty if not stated or inferable." },
              assetBucket: {
                type: "string",
                enum: ["Indian Equity", "International Equity", "Debt", "Hybrid", "Gold", "Silver", "Cash"],
              },
              role: {
                type: "string",
                enum: [
                  "Core", "Large Cap", "Flexi Cap", "Mid Cap", "Small Cap", "International Developed",
                  "International Emerging", "Diversifier", "Gold", "Silver", "Debt", "Hybrid", "Sector", "Thematic", "Satellite",
                ],
              },
              currentValue: { type: "number", description: "Current market value in rupees, 0 if not printed." },
              investedAmount: { type: "number", description: "Invested / cost value in rupees, 0 if not printed." },
              sipAmount: { type: "number", description: "Monthly SIP instalment in rupees, 0 unless clearly shown." },
              units: { type: "number" },
              purchaseDate: { type: "string", description: "YYYY-MM-DD first purchase / SIP start date if printed, else empty string." },
              confidence: { type: "string", enum: ["high", "medium", "low"] },
              missingFields: { type: "array", items: { type: "string" } },
              sourceNote: { type: "string", description: "Short note on where in the document this row came from, max 80 chars." },
            },
            required: [
              "schemeName", "fundHouse", "category", "subCategory", "assetBucket", "role",
              "currentValue", "investedAmount", "sipAmount", "units", "purchaseDate",
              "confidence", "missingFields", "sourceNote",
            ],
            additionalProperties: false,
          },
        },
        warnings: {
          type: "array",
          items: { type: "string" },
          description: "Anything the advisor must verify manually: cropped totals, unreadable numbers, mixed currencies, duplicate rows.",
        },
      },
      required: ["statementType", "statementDate", "holdings", "warnings"],
      additionalProperties: false,
    },
  },
};

type InputFile = { name?: string; mimeType?: string; dataUrl?: string; text?: string };

const MAX_BYTES = 12_000_000; // ~12MB of base64 payload per request

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => null)) as { files?: InputFile[] } | null;
    const files = Array.isArray(body?.files) ? body!.files!.slice(0, 5) : [];
    if (files.length === 0) return json({ error: "At least one file is required" }, 400);

    const content: unknown[] = [
      {
        type: "text",
        text: "Extract every mutual fund holding from the attached document(s). Transcribe printed figures only.",
      },
    ];
    let bytes = 0;

    for (const f of files) {
      if (typeof f?.text === "string" && f.text.trim()) {
        const text = f.text.slice(0, 60_000);
        bytes += text.length;
        content.push({ type: "text", text: `Spreadsheet/CSV export "${f.name ?? "file"}":\n${text}` });
        continue;
      }
      const url = typeof f?.dataUrl === "string" ? f.dataUrl : "";
      if (!url.startsWith("data:")) return json({ error: "Each file needs a data URL or text" }, 400);
      bytes += url.length;
      if (bytes > MAX_BYTES) return json({ error: "Uploads are too large. Please upload fewer or smaller files." }, 400);
      const mime = f.mimeType || url.slice(5, url.indexOf(";"));
      if (mime.startsWith("image/")) {
        content.push({ type: "image_url", image_url: { url } });
      } else if (mime === "application/pdf") {
        content.push({ type: "file", file: { filename: f.name || "statement.pdf", file_data: url } });
      } else {
        return json({ error: `Unsupported file type: ${mime}` }, 400);
      }
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI service not configured" }, 500);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "submit_holdings" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return json({ error: "Rate limit reached. Please try again in a minute." }, 429);
      if (resp.status === 402) return json({ error: "AI credits exhausted. Please add credits to continue." }, 402);
      console.error("AI gateway error", resp.status, (await resp.text()).slice(0, 500));
      return json({ error: "Could not read the document. Try a clearer screenshot or the PDF statement." }, 502);
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!raw) return json({ error: "No holdings could be read from this document" }, 502);

    let parsed: unknown;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "Invalid AI response" }, 502);
    }

    return json({ result: parsed, model: "google/gemini-2.5-flash", extractedAt: new Date().toISOString() });
  } catch (e) {
    console.error("pi-holdings-extract failed", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
