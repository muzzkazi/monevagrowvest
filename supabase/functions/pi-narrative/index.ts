// Moneva Portfolio Intelligence — Layer B (AI advisor layer), phase 2 step 1.
// Writes the CLIENT-FACING narrative for a deterministic engine run.
// Hard rule enforced by prompt AND by client-side numeric verification:
// the model interprets the supplied facts and must never compute a new figure.
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

const SYSTEM = `You are the client-communication layer of Moneva's mutual fund advisory engine.

ABSOLUTE RULES
1. Every number in the deterministic fact sheet is final and correct. You NEVER calculate, estimate, project, average, add, subtract or infer any figure. You may only restate figures that appear verbatim in the fact sheet (a rupee amount may be restated in lakh/crore if exact).
2. If a figure the client would want is not in the fact sheet, say plainly that it is not available — never fill the gap.
3. No market predictions, no fund performance forecasts, no claims of guaranteed returns. Returns used are labelled assumptions.
4. Write for the client, not the advisor: warm, plain English, short sentences, no jargon without a one-line explanation. Indian context and rupees.
5. Respect data-quality blockers: if switching is not allowed or data is stale, say what is pending instead of recommending action on it.
6. Do not name any fund the fact sheet does not name. Do not invent goals, risks or client circumstances.
7. Tax saving (ELSS / Section 80C) is a client-specific mandate. Mention ELSS, 80C, tax-saving funds or lock-in-for-deduction ONLY when constraints.taxSaving is true in the fact sheet. If it is false or absent, do not raise tax saving at all — not as a suggestion, an opportunity, a trade-off or a missing item. (Exit/capital-gains tax on switches is separate and may always be discussed when the facts contain it.)

Deliver a review note the client can read on their own and understand what is being recommended and why.`;

const narrativeTool = {
  type: "function",
  function: {
    name: "submit_client_narrative",
    description: "The client-facing review note derived only from the deterministic fact sheet.",
    parameters: {
      type: "object",
      properties: {
        headline: { type: "string", description: "One short line summarising the review, max 90 characters." },
        openingParagraph: { type: "string", description: "2-4 sentences: where the portfolio stands today, in plain English." },
        yourProfileInPlainEnglish: { type: "string", description: "Explain the assessed risk profile and what determined it." },
        goalReadiness: {
          type: "array",
          description: "One entry per goal in the fact sheet, in the same order.",
          items: {
            type: "object",
            properties: {
              goal: { type: "string" },
              status: { type: "string", enum: ["On track", "Slightly short", "Materially short", "Not assessable"] },
              explanation: { type: "string" },
            },
            required: ["goal", "status", "explanation"],
          },
        },
        whatWeAreChanging: {
          type: "array",
          description: "The SIP actions translated into client language, one entry per recommended change.",
          items: {
            type: "object",
            properties: {
              change: { type: "string" },
              reason: { type: "string" },
            },
            required: ["change", "reason"],
          },
        },
        whyThisHelps: { type: "array", items: { type: "string" }, description: "3-5 short benefit statements." },
        tradeOffs: { type: "array", items: { type: "string" }, description: "2-4 honest trade-offs or things to accept." },
        whatWeNeedFromYou: { type: "array", items: { type: "string" }, description: "Pending data, documents or decisions, including data-quality blockers." },
        assumptionsStated: { type: "array", items: { type: "string" }, description: "Assumptions used, stated as assumptions." },
        closingParagraph: { type: "string" },
      },
      required: [
        "headline",
        "openingParagraph",
        "yourProfileInPlainEnglish",
        "goalReadiness",
        "whatWeAreChanging",
        "whyThisHelps",
        "tradeOffs",
        "whatWeNeedFromYou",
        "assumptionsStated",
        "closingParagraph",
      ],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => null);
    const facts = (body as { facts?: unknown } | null)?.facts;
    if (!facts || typeof facts !== "object" || Array.isArray(facts)) {
      return json({ error: "facts object is required" }, 400);
    }
    const factsText = JSON.stringify(facts);
    if (factsText.length > 120_000) return json({ error: "facts payload too large" }, 400);

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
              "Deterministic fact sheet (read-only, every number is final):\n\n" +
              factsText +
              "\n\nWrite the client-facing review note. Use only figures present above.",
          },
        ],
        tools: [narrativeTool],
        tool_choice: { type: "function", function: { name: "submit_client_narrative" } },
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
    if (!raw) return json({ error: "AI did not return a structured narrative" }, 502);

    let narrative: unknown;
    try {
      narrative = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "Invalid AI response" }, 502);
    }

    return json({ narrative, model: "google/gemini-2.5-flash", generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("pi-narrative failed", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
