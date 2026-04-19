import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FundInput {
  schemeCode: string;
  schemeName: string;
  category: string;       // Equity / Debt / Hybrid / Other
  subCategory: string;    // Large Cap, Mid Cap, ELSS, ...
  fundHouse: string;
  monthlySip: number;     // INR per month
}

interface ReviewBody {
  funds: FundInput[];
  riskProfile: "Conservative" | "Moderate" | "Aggressive";
  primaryGoal?: string;       // optional free text
  horizonYears?: number;      // optional
}

const isFiniteNumber = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

const validate = (body: unknown): { ok: true; data: ReviewBody } | { ok: false; error: string } => {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.funds) || b.funds.length === 0) return { ok: false, error: "Add at least one fund" };
  if (b.funds.length > 25) return { ok: false, error: "Max 25 funds per review" };
  const allowedRisk = new Set(["Conservative", "Moderate", "Aggressive"]);
  if (typeof b.riskProfile !== "string" || !allowedRisk.has(b.riskProfile)) {
    return { ok: false, error: "Invalid risk profile" };
  }

  const funds: FundInput[] = [];
  for (const raw of b.funds as unknown[]) {
    if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid fund entry" };
    const f = raw as Record<string, unknown>;
    if (typeof f.schemeName !== "string" || !f.schemeName.trim()) return { ok: false, error: "Fund missing name" };
    if (!isFiniteNumber(f.monthlySip) || f.monthlySip < 0 || f.monthlySip > 10_000_000) {
      return { ok: false, error: `Invalid SIP for ${f.schemeName}` };
    }
    funds.push({
      schemeCode: String(f.schemeCode ?? ""),
      schemeName: String(f.schemeName).slice(0, 200),
      category: String(f.category ?? "Equity").slice(0, 40),
      subCategory: String(f.subCategory ?? "Flexi Cap").slice(0, 60),
      fundHouse: String(f.fundHouse ?? "Unknown").slice(0, 80),
      monthlySip: Math.round(Number(f.monthlySip)),
    });
  }

  return {
    ok: true,
    data: {
      funds,
      riskProfile: b.riskProfile as ReviewBody["riskProfile"],
      primaryGoal: typeof b.primaryGoal === "string" ? b.primaryGoal.slice(0, 200) : undefined,
      horizonYears: isFiniteNumber(b.horizonYears) ? Math.max(1, Math.min(50, Math.round(b.horizonYears))) : undefined,
    },
  };
};

const reviewTool = {
  type: "function",
  function: {
    name: "submit_portfolio_review",
    description: "Return a structured portfolio review with summary, allocation, and per-fund verdicts.",
    parameters: {
      type: "object",
      properties: {
        healthScore: { type: "number", description: "0-100 overall portfolio health" },
        headline: { type: "string", description: "One-line verdict on the portfolio" },
        keyActions: {
          type: "array",
          description: "3-5 concrete actions in priority order",
          items: { type: "string" },
        },
        allocation: {
          type: "object",
          properties: {
            currentEquityPct: { type: "number" },
            currentDebtPct: { type: "number" },
            currentHybridPct: { type: "number" },
            currentOtherPct: { type: "number" },
            recommendedEquityPct: { type: "number" },
            recommendedDebtPct: { type: "number" },
            recommendedHybridPct: { type: "number" },
            allocationComment: { type: "string" },
          },
          required: [
            "currentEquityPct", "currentDebtPct", "currentHybridPct", "currentOtherPct",
            "recommendedEquityPct", "recommendedDebtPct", "recommendedHybridPct",
            "allocationComment",
          ],
          additionalProperties: false,
        },
        diversification: {
          type: "object",
          properties: {
            overlapRisk: { type: "string", enum: ["Low", "Moderate", "High"] },
            redundantFunds: {
              type: "array",
              items: { type: "string" },
              description: "Scheme names of funds that significantly duplicate another holding",
            },
            comment: { type: "string" },
          },
          required: ["overlapRisk", "redundantFunds", "comment"],
          additionalProperties: false,
        },
        fundVerdicts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              schemeName: { type: "string" },
              verdict: { type: "string", enum: ["Keep", "Reduce", "Exit", "Switch"] },
              reasoning: { type: "string", description: "2-3 sentence rationale citing performance vs category, fit, or overlap" },
              suggestedReplacement: { type: "string", description: "Optional: suggested category/fund type to switch to. Empty if not switching." },
              suggestedSipChange: {
                type: "string",
                description: "How to change the monthly SIP, e.g. 'Stop new SIP', 'Reduce to ₹3,000', 'Keep at ₹5,000'",
              },
            },
            required: ["schemeName", "verdict", "reasoning", "suggestedReplacement", "suggestedSipChange"],
            additionalProperties: false,
          },
        },
      },
      required: ["healthScore", "headline", "keyActions", "allocation", "diversification", "fundVerdicts"],
      additionalProperties: false,
    },
  },
};

const buildSystemPrompt = () => `You are a SEBI-registered investment advisor reviewing an Indian retail investor's mutual fund SIP portfolio.

Your job is to produce a balanced, conservative review based on:
- Asset allocation fit vs the investor's stated risk profile
- Likely performance vs category/benchmark (use general knowledge of Indian mutual fund categories — be cautious; do not invent specific return numbers)
- Over-diversification and overlap (multiple funds in the same sub-category, especially Large Cap / Flexi Cap / Index funds tend to overlap heavily)

Allocation guardrails for Indian investors:
- Conservative: ~30-40% equity, 50-60% debt, rest hybrid/other
- Moderate:    ~55-70% equity, 25-35% debt, rest hybrid
- Aggressive:  ~75-90% equity, 5-15% debt, rest hybrid/sectoral

Rules:
- Be specific and actionable. Reference the actual scheme names provided.
- If 2+ funds are in the same sub-category (e.g. two Large Cap or two Flexi Cap), recommend Reduce or Exit on the weaker/smaller one.
- Do not fabricate exact returns. Speak in qualitative terms like "below category average" only when reasonably confident from category/sub-category context.
- Prefer Keep when a fund is broadly fine; only suggest Exit/Switch when clearly redundant or misaligned with risk.
- Allocation percentages must sum to ~100 (within 1%).
- healthScore: 80+ = excellent, 60-79 = good, 40-59 = needs attention, <40 = poor.
- Always call the submit_portfolio_review function. Never reply in plain text.`;

const buildUserPrompt = (data: ReviewBody) => {
  const totalSip = data.funds.reduce((s, f) => s + f.monthlySip, 0);
  const lines = data.funds.map((f, i) => {
    const pct = totalSip > 0 ? ((f.monthlySip / totalSip) * 100).toFixed(1) : "0";
    return `${i + 1}. ${f.schemeName}
   • Category: ${f.category} / ${f.subCategory}
   • Fund House: ${f.fundHouse}
   • Monthly SIP: ₹${f.monthlySip.toLocaleString("en-IN")} (${pct}% of total)`;
  }).join("\n");

  return `Investor profile
- Risk profile: ${data.riskProfile}
- Primary goal: ${data.primaryGoal || "Not specified"}
- Horizon: ${data.horizonYears ? `${data.horizonYears} years` : "Not specified"}
- Total monthly SIP: ₹${totalSip.toLocaleString("en-IN")}
- Number of funds: ${data.funds.length}

Current SIP holdings:
${lines}

Review this portfolio and call submit_portfolio_review with the full structured output.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const parsed = validate(body);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(parsed.data) },
        ],
        tools: [reviewTool],
        tool_choice: { type: "function", function: { name: "submit_portfolio_review" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a minute." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await aiResp.text();
      console.error("AI gateway error", aiResp.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) {
      console.error("No tool call in AI response", JSON.stringify(aiJson).slice(0, 500));
      return new Response(JSON.stringify({ error: "AI did not return a structured review" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let review: unknown;
    try {
      review = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
    } catch (e) {
      console.error("Failed to parse AI args", e);
      return new Response(JSON.stringify({ error: "Invalid AI response" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ review }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("portfolio-review error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
