// Moneva Portfolio Intelligence — Layer B (AI advisor layer), phase 2 step 4.
// ADVISOR CHAT OVER A SAVED RUN: answers advisor follow-up questions grounded in
// the deterministic fact sheet, the fund-selection facts and the challenge-review
// gate. Interprets only — never computes a new figure, never overrides the engine.
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

const SYSTEM = `You are the advisor's assistant inside Moneva's mutual fund advisory engine. You answer follow-up questions about ONE specific deterministic engine run.

ABSOLUTE RULES
1. The supplied fact sheets are your only source of truth. You NEVER calculate, estimate, project, add, subtract, average or infer a figure. You may restate figures that appear in the facts (rupee amounts may be restated in lakh/crore if exact).
2. If the answer needs a number, comparison or fact that is not in the supplied data, say plainly: "That is not in this run's data" and state what would have to be captured or re-run. Never fill the gap.
3. Never name a fund, goal, scheme, client circumstance or figure that is not in the facts. No fund suggestions, no replacements, no rankings, no performance or market forecasts.
4. Do not overturn the engine. If the advisor disagrees with an engine action, explain what the engine's figures show and what input would have to change — do not produce a competing recommendation.
5. Respect the review gate: if the challenge review is not cleared, or blockers exist, flag that before discussing anything client-facing.
6. Answer the question asked. Short, direct, advisor-to-advisor. Use bullets when listing. No preamble, no marketing language, no disclaimers beyond what is materially needed.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => null)) as
      | { facts?: unknown; fundFacts?: unknown; gate?: unknown; messages?: unknown }
      | null;

    const facts = body?.facts;
    if (!facts || typeof facts !== "object" || Array.isArray(facts)) {
      return json({ error: "facts object is required" }, 400);
    }

    const rawMessages = Array.isArray(body?.messages) ? body!.messages : [];
    const messages = rawMessages
      .filter(
        (m): m is { role: string; content: string } =>
          !!m &&
          typeof m === "object" &&
          typeof (m as { content?: unknown }).content === "string" &&
          ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant"),
      )
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    if (messages.length === 0) return json({ error: "At least one message is required" }, 400);

    const context = JSON.stringify({
      facts,
      fundFacts: body?.fundFacts ?? null,
      reviewGate: body?.gate ?? null,
    });
    if (context.length > 160_000) return json({ error: "context payload too large" }, 400);

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
            role: "system",
            content:
              "Deterministic data for this run (read-only, every number is final):\n\n" + context,
          },
          ...messages,
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return json({ error: "Rate limit reached. Please try again in a minute." }, 429);
      if (resp.status === 402) return json({ error: "AI credits exhausted. Please add credits to continue." }, 402);
      console.error("AI gateway error", resp.status, (await resp.text()).slice(0, 500));
      return json({ error: "AI service error" }, 502);
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply || typeof reply !== "string") return json({ error: "AI did not return an answer" }, 502);

    return json({ reply, model: "google/gemini-2.5-flash", generatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("pi-chat failed", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
