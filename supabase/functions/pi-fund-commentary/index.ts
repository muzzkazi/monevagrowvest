// Moneva Portfolio Intelligence — Layer B (AI advisor layer), phase 2 step 3.
// FUND-SELECTION COMMENTARY: for every fund in the run, explain the reason it is
// held (or changed), the honest trade-offs, and how it maps to the client's goals
// and constraints. Interprets the deterministic fact sheet only — never computes.
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

const SYSTEM = `You are the fund-selection commentary layer of Moneva's mutual fund advisory engine. You explain, fund by fund, why each scheme sits in the portfolio, what the client gives up by holding it, and which goal and constraint it serves.

ABSOLUTE RULES
1. Every number in the fact sheet is final. You NEVER calculate, estimate, project, add, subtract, average or infer a figure. You may only restate figures present in the fact sheet (rupee amounts may be restated in lakh/crore if exact).
2. Only comment on funds named in the fact sheet. Never suggest, name or hint at a scheme that is not listed — no replacements, no "consider XYZ fund".
3. No performance claims, rankings, star ratings, forecasts or statements about which fund will do better. Past returns are not supplied; do not imply them.
4. The engine's action for each fund (KEEP / INCREASE / REDUCE / STOP SIP / ADD) is the decision. You explain it; you never overturn it.
5. Map each fund to goals only by using the goals listed, matching on horizon and essential/non-essential character. If the mapping is not determinable from the facts, say so.
6. Constraint fit must be judged only against the stated constraints (Shariah preference, geography, excluded sectors, ESG, tax saving, income need, capital preservation). If the fact sheet does not establish whether a fund satisfies a constraint, mark it "Not verifiable from data" — never assume compliance.
7. Trade-offs must be real and specific (volatility, concentration, overlap with a duplicate-role peer, liquidity, exit load/tax friction if the fact sheet mentions it). No filler.
8. If switching is blocked or data flags exist, say what is pending instead of recommending action on it.

Write for the advisor, who may paste this to a client after review: precise, plain English, no jargon without a one-line explanation, Indian rupee context.`;

const tool = {
  type: "function",
  function: {
    name: "submit_fund_commentary",
    description: "Fund-by-fund selection commentary derived only from the deterministic fact sheet.",
    parameters: {
      type: "object",
      properties: {
        portfolioLogic: {
          type: "string",
          description: "3-5 sentences on how this set of funds works together as one portfolio for this client.",
        },
        funds: {
          type: "array",
          description: "One entry per fund in the fact sheet, in the same order.",
          items: {
            type: "object",
            properties: {
              schemeName: { type: "string", description: "Exactly as given in the fact sheet." },
              roleInPortfolio: { type: "string", description: "One line: the job this fund does." },
              whyItIsHeld: { type: "string" },
              engineAction: {
                type: "string",
                enum: ["KEEP", "INCREASE", "REDUCE", "STOP SIP", "ADD", "No action in this run"],
              },
              actionExplanation: { type: "string", description: "Plain-English reason for the engine's action." },
              goalMapping: { type: "string", description: "Which listed goal(s) this fund serves and why, or that it is not determinable." },
              constraintFit: {
                type: "string",
                enum: ["Fits stated constraints", "Partial fit", "Conflicts with a stated constraint", "Not verifiable from data"],
              },
              constraintNote: { type: "string" },
              tradeOffs: { type: "array", items: { type: "string" }, description: "1-3 specific trade-offs of holding this fund." },
              watchFor: { type: "string", description: "What would make this fund's place in the portfolio worth revisiting." },
            },
            required: [
              "schemeName",
              "roleInPortfolio",
              "whyItIsHeld",
              "engineAction",
              "actionExplanation",
              "goalMapping",
              "constraintFit",
              "constraintNote",
              "tradeOffs",
              "watchFor",
            ],
          },
        },
        overlapsAndGaps: { type: "array", items: { type: "string" }, description: "Overlaps, duplicate roles and uncovered buckets visible in the facts." },
        constraintConflicts: { type: "array", items: { type: "string" } },
        notVerifiable: { type: "array", items: { type: "string" }, description: "Anything the advisor must confirm outside this data." },
      },
      required: ["portfolioLogic", "funds", "overlapsAndGaps", "constraintConflicts", "notVerifiable"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => null)) as { facts?: unknown } | null;
    const facts = body?.facts;
    if (!facts || typeof facts !== "object" || Array.isArray(facts)) {
      return json({ error: "facts object is required" }, 400);
    }
    const factsText = JSON.stringify(facts);
    if (factsText.length > 140_000) return json({ error: "facts payload too large" }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI service not configured" }, 500);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content:
              "Deterministic fund-selection fact sheet (read-only, every number is final):\n\n" +
              factsText +
              "\n\nWrite the fund-by-fund selection commentary. One entry per fund listed, same order, using only these facts.",
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "submit_fund_commentary" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return json({ error: "Rate limit reached. Please try again in a minute." }, 429);
      if (resp.status === 402) return json({ error: "AI credits exhausted. Please add credits to continue." }, 402);
      console.error("AI gateway error", resp.status, (await resp.text()).slice(0, 500));
      return json({ error: "AI service error" }, 502);
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!raw) return json({ error: "AI did not return structured commentary" }, 502);

    let commentary: unknown;
    try {
      commentary = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "Invalid AI response" }, 502);
    }

    return json({ commentary, model: "google/gemini-2.5-flash", generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("pi-fund-commentary failed", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
