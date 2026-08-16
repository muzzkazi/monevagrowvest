// Moneva Portfolio Intelligence — Layer B (AI advisor layer), phase 2 step 2.
// CHALLENGE / SANITY REVIEW: the model plays devil's advocate against the
// deterministic engine output and the recommendations the advisor is about to
// show, using the deterministic findings as its starting point.
// It interprets only — it never computes, and it may not invent figures.
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

const SYSTEM = `You are the internal challenge reviewer of Moneva's mutual fund advisory engine. You review an advisor's proposed plan BEFORE it is shown to a client.

ABSOLUTE RULES
1. Every number in the deterministic fact sheet is final. You NEVER calculate, estimate, project, add, subtract, average or infer a figure. You may only restate figures that appear in the fact sheet (rupee amounts may be restated in lakh/crore if exact).
2. You do not produce recommendations, targets or allocations of your own. You test whether what the engine produced is internally consistent and defensible.
3. The deterministic findings supplied to you are already proven. Never contradict them, never downgrade a blocker, never claim a blocker is resolved.
4. You may add findings ONLY where the fact sheet itself shows a tension (e.g. a stated risk profile against the actions taken, a goal shortfall against where money is being put, a concentration flag left unaddressed, data gaps that would mislead the client).
5. If information needed to judge something is absent, list it under missingData. Do not guess.
6. Set readyForClientNote to false whenever any blocker exists, any inconsistency is unresolved, or a material figure the client would rely on is missing.
7. Write for the advisor: blunt, specific, no filler, no praise, no marketing language.`;

const challengeTool = {
  type: "function",
  function: {
    name: "submit_challenge_review",
    description: "Return the internal challenge / sanity review of a deterministic engine run.",
    parameters: {
      type: "object",
      properties: {
        verdict: {
          type: "string",
          enum: ["Consistent", "Needs advisor decision", "Do not send"],
        },
        summary: { type: "string", description: "2-4 sentences on whether the plan hangs together." },
        flags: {
          type: "array",
          description: "One entry per inconsistency or contradiction worth the advisor's attention.",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["blocker", "inconsistency", "watch"] },
              area: { type: "string" },
              issue: { type: "string" },
              whyItMatters: { type: "string" },
              advisorQuestion: { type: "string" },
              basedOnDeterministicFindingId: { type: "string", description: "Finding id if it echoes a supplied finding, else 'derived-from-facts'." },
            },
            required: ["severity", "area", "issue", "whyItMatters", "advisorQuestion", "basedOnDeterministicFindingId"],
          },
        },
        missingData: { type: "array", items: { type: "string" } },
        readyForClientNote: { type: "boolean" },
        blockingReasons: { type: "array", items: { type: "string" } },
      },
      required: ["verdict", "summary", "flags", "missingData", "readyForClientNote", "blockingReasons"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => null)) as
      | { facts?: unknown; findings?: unknown }
      | null;
    const facts = body?.facts;
    if (!facts || typeof facts !== "object" || Array.isArray(facts)) {
      return json({ error: "facts object is required" }, 400);
    }
    const findings = Array.isArray(body?.findings) ? body?.findings : [];
    const payload = JSON.stringify({ facts, deterministicFindings: findings });
    if (payload.length > 140_000) return json({ error: "payload too large" }, 400);

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
              "Deterministic fact sheet and proven findings (read-only, every number is final):\n\n" +
              payload +
              "\n\nChallenge this plan. Confirm or extend the supplied findings, expose contradictions between the engine output and the recommendations, and decide whether the client-facing note may be produced.",
          },
        ],
        tools: [challengeTool],
        tool_choice: { type: "function", function: { name: "submit_challenge_review" } },
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
    if (!raw) return json({ error: "AI did not return a structured review" }, 502);

    let review: unknown;
    try {
      review = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "Invalid AI response" }, 502);
    }

    return json({ review, model: "google/gemini-2.5-flash", generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("pi-challenge failed", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
