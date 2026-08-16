// One-page client summary.
//
// It condenses ONLY material that already exists: the deterministic engine
// facts (Layer A) and the AI-written narrative / fund commentary (Layer B,
// already number-verified before it reaches here). Nothing is recomputed.

import { NarrativeFacts } from "./aiFacts";
import { FundSelectionFacts } from "./fundFacts";
import type { ClientNarrative } from "@/components/portfolio-intelligence/NarrativePanel";
import type { FundCommentary } from "@/components/portfolio-intelligence/FundCommentaryPanel";

export interface OnePagerInput {
  facts: NarrativeFacts;
  fundFacts: FundSelectionFacts | null;
  narrative: ClientNarrative | null;
  commentary: FundCommentary | null;
}

export interface OnePagerModel {
  clientName: string;
  runName: string;
  asOf: string;
  headline: string;
  overview: string;
  profileLine: string;
  riskLine: string;
  snapshot: Array<{ label: string; value: string }>;
  goalReadiness: Array<{ goal: string; status: string; note: string }>;
  tradeOffs: string[];
  fundMapping: Array<{ scheme: string; role: string; action: string; goalMapping: string }>;
  scenarios: Array<{ scenario: string; returnPct: number; endValue: number }>;
  nextSteps: string[];
  assumptions: string[];
  missing: string[];
}

const inr = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-IN")}`;

export const buildOnePager = ({ facts, fundFacts, narrative, commentary }: OnePagerInput): OnePagerModel => {
  const missing: string[] = [];
  if (!narrative) missing.push("Client review note not generated yet — plain-English sections will be sparse.");
  if (!commentary) missing.push("Fund-selection commentary not generated yet — fund reasons use engine text only.");

  const goalStatus = (fundedPct: number) =>
    fundedPct >= 95 ? "On track" : fundedPct >= 75 ? "Slightly short" : "Materially short";

  const narrativeGoal = new Map((narrative?.goalReadiness ?? []).map((g) => [g.goal, g]));
  const commentaryFund = new Map((commentary?.funds ?? []).map((f) => [f.schemeName, f]));

  return {
    clientName: facts.client.name,
    runName: facts.runName,
    asOf: facts.asOf,
    headline: narrative?.headline ?? `Portfolio review for ${facts.client.name}`,
    overview:
      narrative?.openingParagraph ??
      commentary?.portfolioLogic ??
      "This summary condenses the engine's recommendation. Generate the client review note for a plain-English overview.",
    profileLine:
      narrative?.yourProfileInPlainEnglish ??
      `Age ${facts.client.age}, ${facts.client.dependents} dependent(s), monthly surplus ${inr(facts.client.monthlySurplus)}.`,
    riskLine: `Risk profile ${facts.risk.finalProfile} — set by ${facts.risk.bindingConstraint}. Equity range ${facts.risk.equityRangeLowPct}%-${facts.risk.equityRangeHighPct}%.`,
    snapshot: [
      { label: "Portfolio value", value: inr(facts.totals.currentValue) },
      { label: "Current SIP", value: `${inr(facts.totals.currentSip)} / month` },
      { label: "Additional SIP", value: `${inr(facts.totals.additionalSip)} / month` },
      { label: "Fit score", value: `${facts.scores.fitScore} / 100` },
      { label: "Complexity", value: `${facts.scores.complexityScore} (${facts.scores.complexityBand})` },
      { label: "Assumed return", value: `${facts.assumedReturnPct}% p.a.` },
    ],
    goalReadiness: facts.goals.map((g) => {
      const n = narrativeGoal.get(g.name);
      return {
        goal: g.name,
        status: n?.status ?? goalStatus(g.fundedPct),
        note:
          n?.explanation ??
          `${g.fundedPct}% funded by ${g.targetYear}; gap ${inr(g.fundingGap)} against a target cost of ${inr(g.futureCost)}.`,
      };
    }),
    tradeOffs:
      narrative?.tradeOffs && narrative.tradeOffs.length > 0
        ? narrative.tradeOffs
        : [
            ...facts.concentration.filter((c) => c.severity !== "OK").map((c) => `${c.label}: ${c.note}`),
            ...facts.redundancy.map((r) => r.note),
          ].slice(0, 5),
    fundMapping: (fundFacts?.funds ?? []).map((f) => {
      const c = commentaryFund.get(f.schemeName);
      return {
        scheme: f.schemeName,
        role: c?.roleInPortfolio ?? f.role,
        action: f.action ?? "KEEP",
        goalMapping: c?.goalMapping ?? f.engineWhy ?? "Held to maintain the target allocation for its bucket.",
      };
    }),
    scenarios: (facts.stress?.scenarios ?? []).map((s) => ({
      scenario: s.scenario,
      returnPct: s.portfolioReturnPct,
      endValue: s.endValue,
    })),
    nextSteps:
      narrative?.whatWeNeedFromYou && narrative.whatWeNeedFromYou.length > 0
        ? narrative.whatWeNeedFromYou
        : facts.sipPlan
            .filter((a) => a.action !== "KEEP")
            .slice(0, 5)
            .map((a) => `${a.action}: ${a.schemeName} — ${inr(a.currentSip)} to ${inr(a.recommendedSip)} per month.`),
    assumptions:
      narrative?.assumptionsStated && narrative.assumptionsStated.length > 0
        ? narrative.assumptionsStated
        : [`Goal projection uses ${facts.assumedReturnPct}% p.a., derived from the engine's equity band, not a forecast.`],
    missing: [...missing, ...facts.dataQuality.blockers, ...facts.dataFlags],
  };
};

/* ---------------- HTML rendering ---------------- */

const esc = (s: string) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const li = (items: string[]) => items.map((x) => `<li>${esc(x)}</li>`).join("");

export const renderOnePagerHtml = (m: OnePagerModel): string => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<title>${esc(m.clientName)} — portfolio summary</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { --blue:#1359d2; --amber:#a66006; --ink:#1e293b; --muted:#6e7a8c; --line:#dee4ec; }
  * { box-sizing:border-box; }
  body { margin:0; padding:28px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
         color:var(--ink); background:#fff; }
  .sheet { max-width:900px; margin:0 auto; }
  h1 { font-size:22px; margin:0 0 4px; }
  h2 { font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:var(--blue); margin:18px 0 6px; }
  p, li, td, th { font-size:12.5px; line-height:1.5; }
  .meta { color:var(--muted); font-size:11px; margin:0 0 14px; }
  .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .kpi { border:1px solid var(--line); border-radius:8px; padding:8px 10px; }
  .kpi span { display:block; font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }
  .kpi strong { font-size:14px; }
  table { width:100%; border-collapse:collapse; }
  th, td { text-align:left; padding:6px 8px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }
  ul { margin:4px 0 0 18px; padding:0; }
  .cols { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  .warn { border:1px solid var(--amber); background:#fff8ef; border-radius:8px; padding:8px 10px; color:var(--amber); }
  .num { text-align:right; }
  footer { margin-top:20px; border-top:1px solid var(--line); padding-top:8px; color:var(--muted); font-size:10px; }
  @media print { body { padding:0; } }
</style></head>
<body><div class="sheet">
  <h1>${esc(m.headline)}</h1>
  <p class="meta">${esc(m.clientName)} · ${esc(m.runName)} · engine run as of ${esc(m.asOf)}</p>
  <p>${esc(m.overview)}</p>

  <h2>Snapshot</h2>
  <div class="grid">${m.snapshot
    .map((s) => `<div class="kpi"><span>${esc(s.label)}</span><strong>${esc(s.value)}</strong></div>`)
    .join("")}</div>

  <h2>Profile &amp; risk</h2>
  <p>${esc(m.profileLine)}</p>
  <p>${esc(m.riskLine)}</p>

  ${
    m.goalReadiness.length
      ? `<h2>Goal readiness</h2><table><thead><tr><th>Goal</th><th>Status</th><th>Note</th></tr></thead><tbody>${m.goalReadiness
          .map((g) => `<tr><td>${esc(g.goal)}</td><td>${esc(g.status)}</td><td>${esc(g.note)}</td></tr>`)
          .join("")}</tbody></table>`
      : ""
  }

  ${
    m.fundMapping.length
      ? `<h2>Fund to goal mapping</h2><table><thead><tr><th>Fund</th><th>Role</th><th>Action</th><th>How it maps</th></tr></thead><tbody>${m.fundMapping
          .map(
            (f) =>
              `<tr><td>${esc(f.scheme)}</td><td>${esc(f.role)}</td><td>${esc(f.action)}</td><td>${esc(f.goalMapping)}</td></tr>`,
          )
          .join("")}</tbody></table>`
      : ""
  }

  <div class="cols">
    <div>
      ${m.tradeOffs.length ? `<h2>Key trade-offs</h2><ul>${li(m.tradeOffs)}</ul>` : ""}
      ${m.nextSteps.length ? `<h2>Next steps</h2><ul>${li(m.nextSteps)}</ul>` : ""}
    </div>
    <div>
      ${
        m.scenarios.length
          ? `<h2>One-year scenarios</h2><table><thead><tr><th>Scenario</th><th class="num">Return</th><th class="num">Value</th></tr></thead><tbody>${m.scenarios
              .map(
                (s) =>
                  `<tr><td>${esc(s.scenario)}</td><td class="num">${s.returnPct > 0 ? "+" : ""}${s.returnPct}%</td><td class="num">Rs. ${Math.round(
                    s.endValue,
                  ).toLocaleString("en-IN")}</td></tr>`,
              )
              .join("")}</tbody></table>`
          : ""
      }
      ${m.assumptions.length ? `<h2>Assumptions</h2><ul>${li(m.assumptions)}</ul>` : ""}
    </div>
  </div>

  ${m.missing.length ? `<h2>Open items &amp; data gaps</h2><div class="warn"><ul>${li(m.missing)}</ul></div>` : ""}

  <footer>All figures produced by the Moneva deterministic engine; explanations are advisor-reviewed interpretations of
  those figures. Not investment advice on its own — advisor review required before sharing.</footer>
</div></body></html>`;
