// Side-by-side scenario comparison PDF. Every figure is taken verbatim from the
// deterministic stress engine output — nothing is recomputed or estimated here.

import { jsPDF } from "jspdf";
import { ScenarioKey, StressOutput } from "./stress";

const BLUE: [number, number, number] = [19, 89, 210];
const AMBER: [number, number, number] = [166, 96, 6];
const INK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [110, 122, 140];
const LINE: [number, number, number] = [222, 228, 236];
const GREEN: [number, number, number] = [21, 128, 61];
const RED: [number, number, number] = [185, 28, 28];

/** ASCII-only so jsPDF never switches to UTF-16 hex strings. */
const clean = (s: string) => (s ?? "").replace(/[\u2010-\u2015]/g, "-").replace(/[^\x20-\x7E]/g, "");

const rs = (n: number) => `${n < 0 ? "-" : ""}Rs. ${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;

const toneFor = (key: ScenarioKey): [number, number, number] =>
  key === "upside" ? GREEN : key === "base" ? BLUE : key === "downside" ? AMBER : RED;

const basisLabel = (b: string) =>
  b === "computed" ? "Live NAV history" : b === "mixed" ? "Part NAV, part assumption" : "Assumption set";

export interface ScenarioPdfMeta {
  clientName?: string;
  runName?: string;
  runId?: string | null;
  versionId?: string | null;
  /** Only these scenarios are exported; defaults to all four. */
  selected?: ScenarioKey[];
}

export const generateScenarioPdf = (
  stress: StressOutput,
  meta: ScenarioPdfMeta = {},
  opts: { save?: boolean } = {},
) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const inner = W - M * 2;

  const rows = stress.scenarios.filter(
    (s) => !meta.selected || meta.selected.length === 0 || meta.selected.includes(s.key),
  );

  /* Branded header band — Moneva wordmark + amber accent. */
  doc.setFillColor(...BLUE).rect(0, 0, W, 48, "F");
  doc.setFillColor(...AMBER).rect(0, 48, W, 3, "F");
  doc.setFont("helvetica", "bold").setFontSize(17).setTextColor(255, 255, 255);
  doc.text("MONEVA", M, 24);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(226, 232, 240);
  doc.text("PORTFOLIO INTELLIGENCE", M, 36);
  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(255, 255, 255);
  doc.text("SCENARIO COMPARISON", W - M, 24, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(226, 232, 240);
  doc.text(clean(`${meta.clientName ?? "Client"}  |  ${meta.runName ?? "Untitled run"}`), W - M, 36, { align: "right" });

  let y = 64;
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(...INK);
  doc.text("Scenario comparison - recommended portfolio", M, y);
  y += 15;
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
  doc.text(
    clean(
      `Basis: ${basisLabel(stress.basis)}   |   Computed ${new Date(stress.asOf).toISOString()}`,
    ),
    M,
    y,
  );
  y += 16;

  doc.setFontSize(8.5).setTextColor(...INK);
  const intro = doc.splitTextToSize(
    clean(
      "The same recommended allocation put through one-year outcomes side by side. All returns, portfolio values and value changes are produced by the deterministic stress engine.",
    ),
    inner,
  );
  doc.text(intro, M, y);
  y += intro.length * 11 + 10;

  /* Scenario cards */
  const cw = inner / Math.max(rows.length, 1);
  rows.forEach((s, i) => {
    const cx = M + i * cw;
    doc.setDrawColor(...LINE).roundedRect(cx, y, cw - 8, 58, 4, 4);
    doc.setFont("helvetica", "normal").setFontSize(6.8).setTextColor(...MUTED);
    doc.text(clean(s.label.toUpperCase()), cx + 8, y + 14);
    doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...toneFor(s.key));
    doc.text(clean(`${s.portfolioReturnPct > 0 ? "+" : ""}${s.portfolioReturnPct}%`), cx + 8, y + 32);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...INK);
    doc.text(clean(rs(s.endValue)), cx + 8, y + 45);
    doc.setFontSize(7).setTextColor(...MUTED);
    doc.text(clean(`${s.valueChange < 0 ? "" : "+"}${rs(s.valueChange)} change`), cx + 8, y + 54);
  });
  y += 74;

  /* Totals — portfolio return & value change across selected scenarios. */
  const best = rows.reduce((a, b) => (b.portfolioReturnPct > a.portfolioReturnPct ? b : a), rows[0]);
  const worst = rows.reduce((a, b) => (b.portfolioReturnPct < a.portfolioReturnPct ? b : a), rows[0]);
  const boxH = 66;
  const half = inner / 2;
  doc.setFillColor(247, 250, 254).roundedRect(M, y, inner, boxH, 5, 5, "F");
  doc.setDrawColor(...LINE).roundedRect(M, y, inner, boxH, 5, 5, "S");
  doc.setDrawColor(...LINE).line(M + half, y + 26, M + half, y + boxH - 8);
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...INK);
  doc.text("Portfolio return & value change - totals", M + 12, y + 17);
  // Best outcome (left)
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...MUTED);
  doc.text("BEST OUTCOME", M + 12, y + 31);
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(...GREEN);
  doc.text(clean(`${best.portfolioReturnPct > 0 ? "+" : ""}${best.portfolioReturnPct}%`), M + 12, y + 47);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...INK);
  doc.text(
    clean(`${best.valueChange < 0 ? "" : "+"}${rs(best.valueChange)}  (${best.label})`),
    M + 12,
    y + 58,
  );
  // Worst outcome (right)
  const rx = M + half;
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...MUTED);
  doc.text("WORST OUTCOME", rx + 12, y + 31);
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(...RED);
  doc.text(clean(`${worst.portfolioReturnPct > 0 ? "+" : ""}${worst.portfolioReturnPct}%`), rx + 12, y + 47);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...INK);
  doc.text(
    clean(`${worst.valueChange < 0 ? "" : "+"}${rs(worst.valueChange)}  (${worst.label})`),
    rx + 12,
    y + 58,
  );
  y += boxH + 14;

  /* Comparison table */
  const measures: Array<{ label: string; value: (s: (typeof rows)[number]) => string; wrap?: boolean }> = [
    { label: "One-year return", value: (s) => `${s.portfolioReturnPct > 0 ? "+" : ""}${s.portfolioReturnPct}%` },
    { label: "Portfolio value", value: (s) => rs(s.endValue) },
    { label: "Value change", value: (s) => `${s.valueChange < 0 ? "" : "+"}${rs(s.valueChange)}` },
    { label: "Basis", value: (s) => basisLabel(s.basis) },
    { label: "Recovery view", value: (s) => s.recoveryNote ?? "-", wrap: true },
    { label: "Goal impact", value: (s) => s.goalNote ?? "No essential goal affected", wrap: true },
  ];

  const labelW = 110;
  const colW = (inner - labelW) / Math.max(rows.length, 1);

  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(...INK);
  doc.text("Measure", M, y);
  rows.forEach((s, i) => {
    doc.text(clean(s.label), M + labelW + i * colW + colW - 6, y, { align: "right" });
  });
  y += 6;
  doc.setDrawColor(...LINE).line(M, y, W - M, y);
  y += 12;

  measures.forEach((m) => {
    doc.setFont("helvetica", "bold").setFontSize(7.8).setTextColor(...INK);
    doc.text(clean(m.label), M, y);
    let maxLines = 1;
    rows.forEach((s, i) => {
      doc.setFont("helvetica", "normal").setFontSize(7.6).setTextColor(...(m.wrap ? MUTED : INK));
      const text = clean(m.value(s));
      if (m.wrap) {
        const lines = doc.splitTextToSize(text, colW - 10);
        maxLines = Math.max(maxLines, lines.length);
        doc.text(lines, M + labelW + i * colW + colW - 6, y, { align: "right" });
      } else {
        doc.text(text, M + labelW + i * colW + colW - 6, y, { align: "right" });
      }
    });
    y += maxLines * 10 + 6;
    doc.setDrawColor(...LINE).line(M, y - 4, W - M, y - 4);
  });

  /* Bucket detail per scenario */
  y += 8;
  rows.forEach((s) => {
    if (y > H - 140) {
      doc.addPage();
      y = M;
    }
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...toneFor(s.key));
    doc.text(clean(`${s.label} - bucket detail`), M, y);
    y += 12;
    doc.setFont("helvetica", "normal").setFontSize(7.6).setTextColor(...MUTED);
    (s.buckets ?? []).forEach((b) => {
      doc.text(
        clean(
          `${b.bucket}: ${b.weightPct}% weight, shock ${b.shockPct > 0 ? "+" : ""}${b.shockPct}% (${b.source}) -> ${b.valueChange < 0 ? "" : "+"}${rs(b.valueChange)}`,
        ),
        M + 8,
        y,
      );

      y += 10;
    });
    if (!s.buckets?.length) {
      doc.text("No bucket detail available for this scenario.", M + 8, y);
      y += 10;
    }
    y += 6;
  });

  /* Footer + traceability */
  doc.setDrawColor(...LINE).line(M, H - 44, W - M, H - 44);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...MUTED);
  doc.text(
    doc.splitTextToSize(
      clean(
        "Scenarios are deterministic stress outcomes, not forecasts. Where live NAV history is unavailable the basis is stated as an assumption set. Advisor review required before sharing.",
      ),
      inner,
    ),
    M,
    H - 32,
  );
  doc.text(
    clean(`run:${meta.runId ?? "unsaved"} version:${meta.versionId ?? "none"}`),
    M,
    H - 18,
  );

  doc.setProperties({
    title: `Moneva scenario comparison - ${clean(meta.runName ?? "run")}`,
    subject: "Deterministic stress-test scenario comparison",
    creator: "Moneva Portfolio Intelligence",
    keywords: clean(
      [
        `runId=${meta.runId ?? "unsaved"}`,
        `versionId=${meta.versionId ?? "none"}`,
        `scenarios=${rows.map((r) => r.key).join("|")}`,
        `asOf=${stress.asOf}`,
      ].join(";"),
    ),
  });

  const filename = `moneva-scenarios-${clean(meta.runName ?? "run").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
  if (opts.save !== false) doc.save(filename);
  return doc;
};
