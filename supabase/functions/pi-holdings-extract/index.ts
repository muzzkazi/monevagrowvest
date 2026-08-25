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
4. SIP detection: fill sipAmount with the instalment amount EXACTLY as printed (do not convert it to a monthly figure) and set sipFrequency to the printed/derivable frequency. Only report a SIP when the document shows an active SIP, recurring instalment, or a repeating debit pattern for that scheme; otherwise sipAmount = 0 and sipFrequency = "None".
4a. SIP LISTS / SIP SCREENSHOTS: when the document is a list of SIPs (headings or columns such as "SIP", "SIPs", "Active SIPs", "Instalment", "Instalment amount", "SIP amount", "Amount", "Monthly amount", "Next instalment", "₹x/month"), EVERY row is an active SIP: put that printed rupee amount in sipAmount and set sipFrequency from the label ("/month", "Monthly" → Monthly), defaulting to "Monthly" when a SIP list prints no frequency (note this in that row's assumptions). Never return sipAmount = 0 for a row that visibly prints an instalment amount.
4b. AMOUNT COLUMN MAPPING: never discard a printed rupee figure. Map each amount column by its header — "Current"/"Market"/"Value"/"Current value" → currentValue; "Invested"/"Cost"/"Total invested" → investedAmount; instalment-style headers (4a) → sipAmount. If a screenshot prints exactly ONE amount per scheme and the header is missing or ambiguous, decide from context (a SIP/instalment screen → sipAmount; a holdings/portfolio screen → currentValue), put the figure there, and record which field you chose in that row's assumptions. Read amounts even when the rupee symbol is rendered as "Rs", "INR", "₹" or is cut off.
5. sipFrequency evidence, in order of preference: an explicit label (Monthly / Weekly / Fortnightly / Quarterly / Daily / Yearly), an instalment schedule ("every 5th"), or a transaction list where equal-amount debits repeat at a regular interval. If a SIP clearly exists but the interval cannot be established, use "Monthly" and note the assumption.
6. Dates: sipStartDate = first SIP instalment / SIP registration date, purchaseDate = first purchase (lumpsum or otherwise). Use YYYY-MM-DD. If only month and year are printed, use the 1st of that month and say so in that row's assumptions. sipDay = day-of-month of the instalment when visible, else 0.
7. Scheme details: keep the scheme name verbatim, and additionally split out plan ("Direct" / "Regular") and option ("Growth" / "IDCW") when the name or a column states it, else "Unknown". Capture folio, isin and schemeCode only when printed.
8. Classify assetBucket and role from the scheme name and category only. If unsure, use "Indian Equity" + "Flexi Cap" and lower the confidence.
9. Set confidence "low" for anything blurry, cropped, ambiguous or derived from a partial screenshot.
10. Assumptions: every time you infer rather than read a value (frequency derived from a debit pattern, plan inferred from the scheme name, a partial date completed, an amount expanded from L/Cr), record one short plain-English sentence in that row's assumptions. Put document-wide assumptions in the top-level assumptions array. Never leave an inference unexplained.`;

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
              plan: { type: "string", enum: ["Direct", "Regular", "Unknown"] },
              option: { type: "string", enum: ["Growth", "IDCW", "Unknown"] },
              folio: { type: "string", description: "Folio number if printed, else empty string." },
              isin: { type: "string", description: "ISIN if printed, else empty string." },
              schemeCode: { type: "string", description: "AMFI / scheme code if printed, else empty string." },
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
              sipAmount: { type: "number", description: "SIP instalment in rupees exactly as printed, at sipFrequency. 0 when no active SIP." },
              sipFrequency: {
                type: "string",
                enum: ["None", "Daily", "Weekly", "Fortnightly", "Monthly", "Quarterly", "Half Yearly", "Yearly", "Unknown"],
                description: "Frequency of the instalment in sipAmount. None when there is no SIP; Unknown when a SIP exists but the interval is not established.",
              },
              sipStartDate: { type: "string", description: "YYYY-MM-DD SIP start / registration date if printed or derivable from the first instalment, else empty string." },
              sipDay: { type: "number", description: "Day of month the instalment is debited, 0 if not visible." },
              units: { type: "number" },
              purchaseDate: { type: "string", description: "YYYY-MM-DD first purchase date if printed, else empty string." },
              confidence: { type: "string", enum: ["high", "medium", "low"] },
              missingFields: { type: "array", items: { type: "string" } },
              assumptions: {
                type: "array",
                items: { type: "string" },
                description: "One short sentence per inferred value for this row (frequency, plan, completed date, expanded amount).",
              },
              sourceNote: { type: "string", description: "Short note on where in the document this row came from, max 80 chars." },
            },
            required: [
              "schemeName", "fundHouse", "plan", "option", "folio", "isin", "schemeCode",
              "category", "subCategory", "assetBucket", "role",
              "currentValue", "investedAmount", "sipAmount", "sipFrequency", "sipStartDate", "sipDay",
              "units", "purchaseDate", "confidence", "missingFields", "assumptions", "sourceNote",
            ],
            additionalProperties: false,
          },
        },
        assumptions: {
          type: "array",
          items: { type: "string" },
          description: "Document-wide assumptions and inference notes in plain English.",
        },
        warnings: {
          type: "array",
          items: { type: "string" },
          description: "Anything the advisor must verify manually: cropped totals, unreadable numbers, mixed currencies, duplicate rows, unresolved SIP frequency.",
        },
      },
      required: ["statementType", "statementDate", "holdings", "assumptions", "warnings"],
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
