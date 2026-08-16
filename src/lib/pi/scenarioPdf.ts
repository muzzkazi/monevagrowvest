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

  /* Totals — portfolio return & value change for every selected scenario. */
  const best = rows.reduce((a, b) => (b.portfolioReturnPct > a.portfolioReturnPct ? b : a), rows[0]);
  const worst = rows.reduce((a, b) => (b.portfolioReturnPct < a.portfolioReturnPct ? b : a), rows[0]);
  const boxH = 92;
  const tcw = inner / Math.max(rows.length, 1);
  doc.setFillColor(247, 250, 254).roundedRect(M, y, inner, boxH, 5, 5, "F");
  doc.setDrawColor(...LINE).roundedRect(M, y, inner, boxH, 5, 5, "S");
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...INK);
  doc.text("Portfolio return & value change - totals (all selected scenarios)", M + 12, y + 17);
  rows.forEach((s, i) => {
    const cx = M + i * tcw + 12;
    if (i > 0) doc.setDrawColor(...LINE).line(M + i * tcw, y + 26, M + i * tcw, y + boxH - 24);
    doc.setFont("helvetica", "normal").setFontSize(6.8).setTextColor(...MUTED);
    doc.text(clean(s.label.toUpperCase()), cx, y + 34);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...toneFor(s.key));
    doc.text(clean(`${s.portfolioReturnPct > 0 ? "+" : ""}${s.portfolioReturnPct}%`), cx, y + 50);
    doc.setFont("helvetica", "normal").setFontSize(7.6).setTextColor(...INK);
    doc.text(clean(`${s.valueChange < 0 ? "" : "+"}${rs(s.valueChange)}`), cx, y + 61);
    doc.setFontSize(7).setTextColor(...MUTED);
    doc.text(clean(`value ${rs(s.endValue)}`), cx, y + 70);
  });
  doc.setDrawColor(...LINE).line(M + 10, y + boxH - 20, W - M - 10, y + boxH - 20);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...MUTED);
  doc.text(
    clean(
      `Best: ${best.label} ${best.portfolioReturnPct > 0 ? "+" : ""}${best.portfolioReturnPct}% (${best.valueChange < 0 ? "" : "+"}${rs(best.valueChange)})   |   Worst: ${worst.label} ${worst.portfolioReturnPct > 0 ? "+" : ""}${worst.portfolioReturnPct}% (${worst.valueChange < 0 ? "" : "+"}${rs(worst.valueChange)})`,
    ),
    M + 12,
    y + boxH - 8,
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
  /* Visual comparison — return bars + portfolio value line, page 2. */
  const generatedAt = new Date();
  doc.addPage();
  y = M;
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...INK);
  doc.text("Visual comparison", M, y);
  y += 14;
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
  doc.text("Charted directly from the same deterministic figures shown in the tables above.", M, y);
  y += 18;

  // --- Bar chart: one-year return % (zero baseline) ---
  const AX = M + 60; // left gutter reserved for axis labels
  const plotW = W - M - AX;
  const chartH = 150;
  const chartTop = y + 14;
  const chartBottom = chartTop + chartH;
  const maxAbs = Math.max(...rows.map((s) => Math.abs(s.portfolioReturnPct)), 1);
  const zeroY = chartTop + chartH / 2;
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...INK);
  doc.text("One-year portfolio return (%)", M, y);
  doc.setDrawColor(...LINE).line(AX, chartTop, AX, chartBottom);
  doc.setDrawColor(...LINE).line(AX, zeroY, W - M, zeroY);
  doc.setFont("helvetica", "normal").setFontSize(6.5).setTextColor(...MUTED);
  doc.text("0%", AX - 5, zeroY + 3, { align: "right" });
  doc.text(clean(`+${Math.round(maxAbs)}%`), AX - 5, chartTop + 4, { align: "right" });
  doc.text(clean(`-${Math.round(maxAbs)}%`), AX - 5, chartBottom, { align: "right" });

  const bcw = plotW / Math.max(rows.length, 1);
  const barW = Math.min(52, bcw * 0.5);
  rows.forEach((s, i) => {
    const cx = AX + i * bcw + bcw / 2;
    const h = (Math.abs(s.portfolioReturnPct) / maxAbs) * (chartH / 2);
    const up = s.portfolioReturnPct >= 0;
    doc.setFillColor(...toneFor(s.key));
    doc.rect(cx - barW / 2, up ? zeroY - h : zeroY, barW, h, "F");
    doc.setFont("helvetica", "bold").setFontSize(7.5).setTextColor(...toneFor(s.key));
    doc.text(
      clean(`${up ? "+" : ""}${s.portfolioReturnPct}%`),
      cx,
      up ? zeroY - h - 4 : Math.min(zeroY + h + 9, chartBottom + 8),
      { align: "center" },
    );
    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...MUTED);
    doc.text(clean(s.label), cx, chartBottom + 22, { align: "center" });
  });
  y = chartBottom + 46;

  // --- Line chart: end portfolio value across scenarios ---
  const lh = 120;
  const lTop = y + 14;
  const lBottom = lTop + lh;
  const vals = rows.map((s) => s.endValue);
  const vMax = Math.max(...vals);
  const vMin = Math.min(...vals);
  const span = vMax - vMin || Math.max(vMax, 1);
  const yFor = (v: number) => lBottom - ((v - (vMin - span * 0.2)) / (span * 1.45)) * lh;
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...INK);
  doc.text("Portfolio value by scenario", M, y);
  doc.setDrawColor(...LINE).line(AX, lTop, AX, lBottom);
  doc.setDrawColor(...LINE).line(AX, lBottom, W - M, lBottom);
  doc.setFont("helvetica", "normal").setFontSize(6.5).setTextColor(...MUTED);
  doc.text(clean(rs(vMax)), AX - 5, yFor(vMax) + 3, { align: "right" });
  doc.text(clean(rs(vMin)), AX - 5, yFor(vMin) + 3, { align: "right" });

  const lpw = W - M - AX - 30;
  const pts = rows.map((s, i) => ({
    x: AX + 20 + i * (lpw / Math.max(rows.length - 1, 1)),
    py: yFor(s.endValue),
    s,
  }));
  doc.setDrawColor(...BLUE).setLineWidth(1.2);
  pts.forEach((p, i) => {
    if (i > 0) doc.line(pts[i - 1].x, pts[i - 1].py, p.x, p.py);
  });
  doc.setLineWidth(0.5);
  pts.forEach((p) => {
    doc.setFillColor(...toneFor(p.s.key)).circle(p.x, p.py, 3, "F");
    doc.setFont("helvetica", "bold").setFontSize(7).setTextColor(...INK);
    doc.text(clean(rs(p.s.endValue)), p.x, p.py - 8, { align: "center" });

    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...MUTED);
    doc.text(clean(p.s.label), p.x, lBottom + 12, { align: "center" });
  });
  y = lBottom + 32;

  /* Audit & disclaimer section */
  const auditItems: Array<[string, string]> = [
    [
      "Assumptions",
      `Every figure is a one-year deterministic stress outcome applied to the current recommended allocation. Basis for this run: ${basisLabel(stress.basis)}. Where live NAV history is missing or has fewer than 30 observations, an assumption set is used and the affected bucket is marked "assumption" in the bucket detail. No forecasting, probability or simulation is involved; the same inputs always produce the same numbers.`,
    ],
    [
      "Timestamp meaning",
      `"Computed" (${new Date(stress.asOf).toISOString()}) is when the stress engine produced these numbers from the NAV and allocation data available at that moment. "Generated" (${generatedAt.toISOString()}) is when this PDF was rendered. If the two differ, the PDF was exported from a previously computed run and the underlying market data has not been refreshed since the computed time.`,
    ],
    [
      "Traceability fields",
      `run: ${meta.runId ?? "unsaved"} - the saved Portfolio Intelligence run this export belongs to ("unsaved" means the run was not persisted). version: ${meta.versionId ?? "none"} - the immutable version snapshot of that run. Client: ${meta.clientName ?? "Client"}. Run name: ${meta.runName ?? "Untitled run"}. Scenario set exported: ${rows.map((r) => r.key).join(", ")}. These fields also appear in the PDF document properties and in the page footer.`,
    ],
    [
      "Review and use",
      "This document is an internal advisory working paper. Numbers must be reviewed by the advisor before being shared with a client, and are not a guarantee, projection or recommendation to buy or sell any scheme. Mutual fund investments are subject to market risks.",
    ],
  ];

  if (y > H - 200) {
    doc.addPage();
    y = M;
  }
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...INK);
  doc.text("Audit notes & disclaimer", M, y);
  y += 16;
  auditItems.forEach(([label, body]) => {
    const lines = doc.splitTextToSize(clean(body), inner - 8);
    if (y + lines.length * 9 + 18 > H - 60) {
      doc.addPage();
      y = M;
    }
    doc.setFont("helvetica", "bold").setFontSize(8.2).setTextColor(...BLUE);
    doc.text(clean(label), M, y);
    y += 11;
    doc.setFont("helvetica", "normal").setFontSize(7.6).setTextColor(...INK);
    doc.text(lines, M + 8, y);
    y += lines.length * 9 + 10;
  });

  /* Footer on every page: disclaimer, client/run trace, timestamp, page numbers. */

  const stamp = generatedAt.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(...LINE).line(M, H - 52, W - M, H - 52);
    doc.setFont("helvetica", "normal").setFontSize(6.8).setTextColor(...MUTED);
    doc.text(
      doc.splitTextToSize(
        clean(
          "Scenarios are deterministic stress outcomes, not forecasts. Where live NAV history is unavailable the basis is stated as an assumption set. Advisor review required before sharing.",
        ),
        inner - 70,
      ),
      M,
      H - 40,
    );
    doc.text(
      clean(
        `${meta.clientName ?? "Client"} | ${meta.runName ?? "Untitled run"} | run:${meta.runId ?? "unsaved"} version:${meta.versionId ?? "none"}`,
      ),
      M,
      H - 20,
    );
    doc.text(clean(`Generated ${stamp}`), M, H - 11);
    doc.setFont("helvetica", "bold").setFontSize(7).setTextColor(...INK);
    doc.text(clean(`Page ${p} of ${pageCount}`), W - M, H - 11, { align: "right" });
  }

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
        `generatedAt=${generatedAt.toISOString()}`,
      ].join(";"),
    ),
  });

  const slug = (s: string, fallback: string) => {
    const out = clean(s).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
    return out || fallback;
  };
  const scenarioSet =
    rows.length === stress.scenarios.length ? "all-scenarios" : rows.map((r) => r.key).join("-");
  const dateStr = generatedAt.toISOString().slice(0, 10);
  const filename = `moneva-scenarios_${slug(meta.clientName ?? "", "client")}_${slug(scenarioSet, "scenarios")}_${dateStr}.pdf`;
  if (opts.save !== false) doc.save(filename);

  return doc;
};
