// One-click PDF export of a saved Portfolio Intelligence run.
//
// Everything printed here comes from the deterministic engine output, the tax
// engine and the stress engine. Nothing is re-derived inside the exporter, and
// missing values print as "Insufficient current data" rather than a guess.

import { jsPDF } from "jspdf";
import { EngineOutput } from "./types";
import { PiRunInputs } from "./runs";
import { HoldingTax, SwitchPlan } from "./tax";
import { StressOutput } from "./stress";
import { DataQualityReport } from "./dataQuality";
import { RunPdfIdentity, buildRunPdfIdentity, encodeRunPdfKeywords } from "./pdfMetadata";

const BLUE: [number, number, number] = [19, 89, 210];
const AMBER: [number, number, number] = [166, 96, 6];
const INK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [110, 122, 140];
const LINE: [number, number, number] = [222, 228, 236];
const GREEN: [number, number, number] = [22, 130, 90];
const RED: [number, number, number] = [190, 45, 45];
const M = 44;

const clean = (s: string) =>
  (s ?? "")
    .replace(/[\u2192\u27a1]/g, "->")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u20b9/g, "Rs. ")
    .replace(/[^\x00-\xFF]/g, "");

const money = (n: number | null | undefined) =>
  n === null || n === undefined ? "-" : `Rs. ${Math.round(Number(n)).toLocaleString("en-IN")}`;

export interface RunPdfInput {
  runName: string;
  versionNo?: number | null;
  /** Saved run row id — embedded in the PDF metadata for traceability. */
  runId?: string | null;
  /** pi_run_versions row id for the exported version. */
  versionId?: string | null;
  clientId?: string | null;
  /** created_at / updated_at of the saved row this export represents. */
  savedAt?: string | null;
  inputs: PiRunInputs;
  assumedReturnPct: number;
  output: EngineOutput;
  holdings?: HoldingTax[];
  switchPlan?: SwitchPlan | null;
  stress?: StressOutput | null;
  quality?: DataQualityReport | null;
  save?: boolean;
}

export const generateRunPdf = ({
  runName,
  versionNo,
  runId = null,
  versionId = null,
  clientId = null,
  savedAt = null,
  inputs,
  assumedReturnPct,
  output,
  holdings = [],
  switchPlan = null,
  stress = null,
  quality = null,
  save = true,
}: RunPdfInput) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  /* ---------- Identity metadata (traceable back to the saved run) ---------- */
  const identity: RunPdfIdentity = buildRunPdfIdentity({
    runId,
    versionId,
    versionNo,
    clientId,
    runName,
    inputs,
    assumedReturnPct,
    output,
    savedAt,
  });
  doc.setProperties({
    title: `Portfolio Intelligence - ${clean(runName)}${versionNo ? ` v${versionNo}` : ""}`,
    subject: `Run ${identity.runId ?? "unsaved"} | version ${identity.versionNo ?? "-"} (${identity.versionId ?? "-"}) | fingerprint ${identity.fingerprint}`,
    author: "Moneva GrowVest",
    creator: "Moneva Portfolio Intelligence",
    keywords: encodeRunPdfKeywords(identity),
  });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const contentW = W - M * 2;
  let y = 0;

  const footer = () => {
    doc.setFontSize(8).setTextColor(...MUTED).setFont("helvetica", "normal");
    doc.text("Confidential advisory record - Moneva GrowVest - deterministic engine output", M, H - 24);
    doc.text(`Page ${doc.getNumberOfPages()}`, W - M, H - 24, { align: "right" });
    doc.setFontSize(7);
    doc.text(
      clean(
        `Run ${identity.runId ?? "unsaved"} | version ${identity.versionNo ?? "-"} | version id ${identity.versionId ?? "-"} | fingerprint ${identity.fingerprint}`,
      ),
      M,
      H - 13,
    );
  };
  const newPage = () => {
    footer();
    doc.addPage();
    y = M;
  };
  const room = (needed: number) => {
    if (y + needed > H - 56) newPage();
  };
  const heading = (text: string) => {
    room(48);
    y += 10;
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...BLUE);
    doc.text(clean(text).toUpperCase(), M, y);
    y += 8;
    doc.setDrawColor(...LINE).setLineWidth(1);
    doc.line(M, y, W - M, y);
    y += 18;
  };
  const bullets = (lines: string[]) => {
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTED);
    lines.forEach((l) => {
      const wrapped = doc.splitTextToSize(`- ${clean(l)}`, contentW);
      room(wrapped.length * 11 + 6);
      doc.text(wrapped, M, y);
      y += wrapped.length * 11 + 3;
    });
    y += 6;
  };
  const kv = (rows: [string, string][]) => {
    doc.setFontSize(9.5);
    const colW = contentW / 2;
    rows.forEach((row, i) => {
      const col = i % 2;
      if (col === 0) room(32);
      const x = M + col * colW;
      doc.setFont("helvetica", "normal").setTextColor(...MUTED);
      doc.text(clean(row[0]), x, y);
      doc.setFont("helvetica", "bold").setTextColor(...INK);
      doc.text(doc.splitTextToSize(clean(row[1]) || "-", colW - 16).slice(0, 2), x, y + 13);
      if (col === 1 || i === rows.length - 1) y += 34;
    });
  };
  const table = <T,>(
    cols: { header: string; width: number; align?: "left" | "right"; get: (r: T) => string }[],
    rows: T[],
  ) => {
    const head = () => {
      room(34);
      doc.setFillColor(245, 247, 250);
      doc.rect(M, y - 12, contentW, 22, "F");
      doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...MUTED);
      let x = M + 8;
      cols.forEach((c) => {
        doc.text(c.header.toUpperCase(), c.align === "right" ? x + c.width - 16 : x, y + 3, {
          align: c.align === "right" ? "right" : "left",
        });
        x += c.width;
      });
      y += 26;
    };
    head();
    rows.forEach((r) => {
      const cells = cols.map((c) => doc.splitTextToSize(clean(c.get(r)) || "-", c.width - 16));
      const h = Math.max(...cells.map((c) => c.length)) * 11 + 10;
      if (y + h > H - 56) {
        newPage();
        head();
      }
      doc.setFont("helvetica", "normal").setFontSize(9);
      let x = M + 8;
      cells.forEach((cell, i) => {
        doc.setTextColor(...(i === 0 ? INK : MUTED));
        doc.text(cell, cols[i].align === "right" ? x + cols[i].width - 16 : x, y, {
          align: cols[i].align === "right" ? "right" : "left",
        });
        x += cols[i].width;
      });
      y += h;
      doc.setDrawColor(...LINE).setLineWidth(0.5);
      doc.line(M, y - 8, W - M, y - 8);
    });
    y += 6;
  };

  /* ---------- Cover ---------- */
  doc.setFillColor(11, 26, 48);
  doc.rect(0, 0, W, 116, "F");
  doc.setFont("helvetica", "bold").setFontSize(19).setTextColor(255, 255, 255);
  doc.text("Portfolio Intelligence Report", M, 52);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(198, 210, 228);
  doc.text(
    `${clean(runName)}${versionNo ? ` - version ${versionNo}` : ""} | generated ${new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    M,
    74,
  );
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...AMBER);
  doc.text("MONEVA GROWVEST", W - M, 52, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(198, 210, 228);
  doc.text("Private - for internal advisory use", W - M, 74, { align: "right" });

  y = 150;
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...INK);
  doc.text(clean(inputs.profile.clientName || "Unnamed client"), M, y);
  y += 16;
  doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...MUTED);
  doc.text(
    clean(
      `Age ${inputs.profile.age} | ${inputs.profile.employmentType} | risk profile ${output.risk.finalProfile} | equity band ${output.risk.equityRange[0]}-${output.risk.equityRange[1]}%`,
    ),
    M,
    y,
  );
  y += 22;

  /* ---------- Score strip ---------- */
  const stats: [string, string][] = [
    ["Fit score", `${output.scores.fitScore}/100`],
    ["Complexity", `${output.scores.complexityScore} (${output.scores.complexityBand})`],
    ["Portfolio value", money(output.totals.currentValue)],
    ["Monthly SIP", money(output.totals.currentSip + output.totals.additionalSip)],
  ];
  const cardW = (contentW - 24) / 4;
  stats.forEach((s, i) => {
    const x = M + i * (cardW + 8);
    doc.setFillColor(247, 249, 252);
    doc.roundedRect(x, y, cardW, 52, 5, 5, "F");
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...MUTED);
    doc.text(clean(s[0]).toUpperCase(), x + 10, y + 18);
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...INK);
    doc.text(doc.splitTextToSize(clean(s[1]), cardW - 20)[0], x + 10, y + 38);
  });
  y += 66;

  /* ---------- Recommendation ---------- */
  heading("Recommendation - SIP plan");
  const actions = output.sipPlan.filter((a) => a.action !== "KEEP");
  if (actions.length === 0) {
    doc.setFont("helvetica", "italic").setFontSize(9.5).setTextColor(...MUTED);
    doc.text("No SIP change required - the portfolio already sits inside its target ranges.", M, y);
    y += 20;
  } else {
    table(
      [
        { header: "Scheme", width: contentW * 0.34, get: (a: typeof actions[number]) => a.schemeName },
        { header: "Action", width: contentW * 0.16, get: (a) => a.action },
        { header: "Current", width: contentW * 0.16, align: "right", get: (a) => money(a.currentSip) },
        { header: "Recommended", width: contentW * 0.18, align: "right", get: (a) => money(a.recommendedSip) },
        { header: "Confidence", width: contentW * 0.16, get: (a) => a.confidence },
      ],
      actions,
    );
    bullets(actions.map((a) => `${a.schemeName}: ${a.why} ${a.portfolioImpact}`));
  }

  /* ---------- Assumptions ---------- */
  heading("Assumptions");
  bullets([
    `Goal projections use an assumed ${assumedReturnPct}% p.a. return derived from the engine's equity band. It is an assumption, not a forecast.`,
    `Additional monthly SIP available: ${money(inputs.additionalSip)}; declared SIP budget: ${money(inputs.declaredSipBudget)}.`,
    ...(switchPlan?.assumptions ?? []),
    ...(stress?.notes ?? []),
  ]);

  /* ---------- Data quality ---------- */
  if (quality) {
    heading("Data quality");
    kv([
      ["NAV freshness", quality.navAgeHours === null ? "No NAV loaded" : `${quality.navAgeHours} hours old (${quality.navFreshness})`],
      ["Tax inputs", quality.taxInputsComplete ? "Complete" : "Incomplete"],
      ["Switch recommendations", quality.switchingAllowed ? "Permitted" : "Blocked until requirements are met"],
      ["Open issues", `${quality.blockers.length} blocker(s), ${quality.warnings.length} warning(s)`],
    ]);
    if (quality.issues.length) bullets(quality.issues.map((i) => `[${i.severity}] ${i.message} Fix: ${i.fix}`));
  }

  /* ---------- Allocation and metrics ---------- */
  heading("Allocation vs target");
  table(
    [
      { header: "Bucket", width: contentW * 0.34, get: (r: typeof output.allocation[number]) => r.bucket },
      { header: "Current", width: contentW * 0.22, align: "right", get: (r) => `${r.currentPct}%` },
      { header: "Target", width: contentW * 0.22, align: "right", get: (r) => `${r.targetPct}%` },
      { header: "Gap", width: contentW * 0.22, align: "right", get: (r) => `${r.gapPct > 0 ? "+" : ""}${r.gapPct}%` },
    ],
    output.allocation,
  );

  if (output.goals.length) {
    heading("Goal metrics");
    table(
      [
        { header: "Goal", width: contentW * 0.3, get: (g: typeof output.goals[number]) => g.goal.name || g.goal.category },
        { header: "Years", width: contentW * 0.12, align: "right", get: (g) => String(g.yearsToGoal) },
        { header: "Future cost", width: contentW * 0.2, align: "right", get: (g) => money(g.futureCost) },
        { header: "Projected", width: contentW * 0.2, align: "right", get: (g) => money(g.projectedCorpus) },
        { header: "Funded", width: contentW * 0.18, align: "right", get: (g) => `${g.fundedPct}%` },
      ],
      output.goals,
    );
  }

  /* ---------- Tax ---------- */
  if (holdings.length) {
    heading("Tax position on exit");
    table(
      [
        { header: "Scheme", width: contentW * 0.3, get: (h: HoldingTax) => h.schemeName },
        { header: "Treatment", width: contentW * 0.22, get: (h) => h.treatment },
        { header: "Held", width: contentW * 0.12, align: "right", get: (h) => (h.holdingMonths === null ? "-" : `${h.holdingMonths} mo`) },
        { header: "Gain", width: contentW * 0.18, align: "right", get: (h) => (h.gain === null ? "-" : money(h.gain)) },
        {
          header: "Tax",
          width: contentW * 0.18,
          align: "right",
          get: (h) => (h.taxIfExitedFully === null ? "Insufficient data" : money(h.taxIfExitedFully)),
        },
      ],
      holdings,
    );
  }

  if (switchPlan) {
    heading("Switch decisions");
    if (switchPlan.options.length === 0) {
      doc.setFont("helvetica", "italic").setFontSize(9.5).setTextColor(...MUTED);
      doc.text("No holding was flagged for exit, so no taxable switch is recommended.", M, y);
      y += 20;
    } else {
      table(
        [
          { header: "Scheme", width: contentW * 0.32, get: (o: typeof switchPlan.options[number]) => o.schemeName },
          { header: "Verdict", width: contentW * 0.26, get: (o) => o.verdict },
          { header: "Amount", width: contentW * 0.21, align: "right", get: (o) => money(o.amountConsidered) },
          { header: "Tax cost", width: contentW * 0.21, align: "right", get: (o) => (o.taxCost === null ? "Insufficient data" : money(o.taxCost)) },
        ],
        switchPlan.options,
      );
    }
  }

  /* ---------- Stress chart ---------- */
  if (stress) {
    heading(`Stress test (${stress.basis} basis)`);
    room(190);
    const chartH = 130;
    const chartTop = y;
    const barW = (contentW - 40) / stress.scenarios.length;
    const maxAbs = Math.max(10, ...stress.scenarios.map((s) => Math.abs(s.portfolioReturnPct)));
    const zeroY = chartTop + chartH / 2;

    doc.setDrawColor(...LINE).setLineWidth(0.8);
    doc.line(M, zeroY, W - M, zeroY);

    stress.scenarios.forEach((s, i) => {
      const x = M + 20 + i * barW;
      const h = (Math.abs(s.portfolioReturnPct) / maxAbs) * (chartH / 2 - 12);
      const positive = s.portfolioReturnPct >= 0;
      doc.setFillColor(...(positive ? GREEN : RED));
      doc.rect(x + barW * 0.22, positive ? zeroY - h : zeroY, barW * 0.42, h, "F");
      doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...(positive ? GREEN : RED));
      doc.text(
        `${s.portfolioReturnPct > 0 ? "+" : ""}${s.portfolioReturnPct}%`,
        x + barW * 0.43,
        positive ? zeroY - h - 6 : zeroY + h + 12,
        { align: "center" },
      );
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
      doc.text(clean(s.label), x + barW * 0.43, chartTop + chartH + 16, { align: "center", maxWidth: barW });
    });
    y = chartTop + chartH + 34;

    table(
      [
        { header: "Scenario", width: contentW * 0.22, get: (s: typeof stress.scenarios[number]) => s.label },
        { header: "Return", width: contentW * 0.14, align: "right", get: (s) => `${s.portfolioReturnPct}%` },
        { header: "End value", width: contentW * 0.22, align: "right", get: (s) => money(s.endValue) },
        { header: "Basis", width: contentW * 0.14, get: (s) => s.basis },
        { header: "Recovery", width: contentW * 0.28, get: (s) => s.recoveryNote },
      ],
      stress.scenarios,
    );
    if (stress.dataGaps.length) bullets(stress.dataGaps);
  }

  /* ---------- Engine integrity ---------- */
  if (output.dataFlags.length || output.integrity.length) {
    heading("Engine flags");
    bullets([...output.dataFlags, ...output.integrity]);
  }

  footer();

  const safe = (inputs.profile.clientName || runName || "run").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  if (save) doc.save(`${safe}-portfolio-intelligence${versionNo ? `-v${versionNo}` : ""}-${new Date().toISOString().split("T")[0]}.pdf`);
  return doc;
};
