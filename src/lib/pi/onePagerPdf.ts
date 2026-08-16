// One-page client summary as PDF. Mirrors renderOnePagerHtml exactly —
// no figure is derived here, everything comes from the OnePagerModel.

import { jsPDF } from "jspdf";
import { OnePagerModel } from "./onePager";

const BLUE: [number, number, number] = [19, 89, 210];
const AMBER: [number, number, number] = [166, 96, 6];
const INK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [110, 122, 140];
const LINE: [number, number, number] = [222, 228, 236];
const M = 40;

const clean = (s: string) =>
  (s ?? "")
    .replace(/[\u2192\u27a1]/g, "->")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u20b9/g, "Rs. ")
    .replace(/[^\x00-\xFF]/g, "");

export const generateOnePagerPdf = (m: OnePagerModel, opts: { save?: boolean } = {}) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const inner = W - M * 2;
  let y = M;

  doc.setProperties({
    title: `Client summary - ${clean(m.clientName)}`,
    subject: clean(`${m.runName} | engine as of ${m.asOf}`),
    author: "Moneva GrowVest",
  });

  const heading = (label: string) => {
    y += 12;
    doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...BLUE);
    doc.text(clean(label.toUpperCase()), M, y);
    y += 4;
    doc.setDrawColor(...LINE).line(M, y, W - M, y);
    y += 10;
  };

  const body = (text: string, size = 9) => {
    doc.setFont("helvetica", "normal").setFontSize(size).setTextColor(...INK);
    const lines = doc.splitTextToSize(clean(text), inner);
    doc.text(lines, M, y);
    y += lines.length * (size + 2.2);
  };

  const bullets = (items: string[], size = 8.5, width = inner) => {
    doc.setFont("helvetica", "normal").setFontSize(size).setTextColor(...INK);
    items.forEach((it) => {
      const lines = doc.splitTextToSize(clean(`- ${it}`), width);
      doc.text(lines, M, y);
      y += lines.length * (size + 2);
    });
  };

  /* Header */
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...INK);
  const hl = doc.splitTextToSize(clean(m.headline), inner);
  doc.text(hl, M, y + 4);
  y += hl.length * 18;
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
  doc.text(clean(`${m.clientName}  |  ${m.runName}  |  engine run as of ${m.asOf}`), M, y);
  y += 14;
  body(m.overview);

  /* Snapshot KPI grid */
  heading("Snapshot");
  const cols = 3;
  const cw = inner / cols;
  const rowsCount = Math.ceil(m.snapshot.length / cols);
  m.snapshot.forEach((s, i) => {
    const cx = M + (i % cols) * cw;
    const cy = y + Math.floor(i / cols) * 34;
    doc.setDrawColor(...LINE).roundedRect(cx, cy - 2, cw - 8, 28, 4, 4);
    doc.setFont("helvetica", "normal").setFontSize(6.5).setTextColor(...MUTED);
    doc.text(clean(s.label.toUpperCase()), cx + 6, cy + 8);
    doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...INK);
    doc.text(clean(s.value), cx + 6, cy + 20);
  });
  y += rowsCount * 34 + 4;

  /* Profile & risk */
  heading("Profile & risk");
  body(m.profileLine, 8.5);
  body(m.riskLine, 8.5);

  /* Goal readiness */
  if (m.goalReadiness.length) {
    heading("Goal readiness");
    m.goalReadiness.forEach((g) => {
      doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...INK);
      doc.text(clean(`${g.goal} - ${g.status}`), M, y);
      y += 11;
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
      const lines = doc.splitTextToSize(clean(g.note), inner);
      doc.text(lines, M, y);
      y += lines.length * 10 + 2;
    });
  }

  /* Fund to goal mapping */
  if (m.fundMapping.length) {
    heading("Fund to goal mapping");
    m.fundMapping.forEach((f) => {
      doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...INK);
      doc.text(clean(`${f.scheme}  [${f.action}]`), M, y);
      y += 10;
      doc.setFont("helvetica", "normal").setFontSize(7.8).setTextColor(...MUTED);
      const lines = doc.splitTextToSize(clean(`${f.role} - ${f.goalMapping}`), inner);
      doc.text(lines, M, y);
      y += lines.length * 9.5 + 3;
    });
  }

  /* Trade-offs + scenarios side by side */
  if (m.tradeOffs.length) {
    heading("Key trade-offs");
    bullets(m.tradeOffs);
  }

  if (m.scenarios.length) {
    heading("One-year scenarios");
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...INK);
    m.scenarios.forEach((s) => {
      doc.text(clean(s.scenario), M, y);
      doc.text(clean(`${s.returnPct > 0 ? "+" : ""}${s.returnPct}%`), M + 220, y, { align: "right" });
      doc.text(clean(`Rs. ${Math.round(s.endValue).toLocaleString("en-IN")}`), M + 340, y, { align: "right" });
      y += 11;
    });
  }

  if (m.nextSteps.length) {
    heading("Next steps");
    bullets(m.nextSteps);
  }

  if (m.assumptions.length) {
    heading("Assumptions");
    bullets(m.assumptions, 8);
  }

  if (m.missing.length) {
    heading("Open items & data gaps");
    doc.setTextColor(...AMBER);
    m.missing.forEach((it) => {
      const lines = doc.splitTextToSize(clean(`- ${it}`), inner);
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...AMBER);
      doc.text(lines, M, y);
      y += lines.length * 10;
    });
  }

  /* Footer */
  const H = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...LINE).line(M, H - 42, W - M, H - 42);
  doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...MUTED);
  doc.text(
    doc.splitTextToSize(
      clean(
        "All figures produced by the Moneva deterministic engine; explanations are advisor-reviewed interpretations of those figures. Advisor review required before sharing.",
      ),
      inner,
    ),
    M,
    H - 30,
  );

  const filename = `moneva-client-summary-${clean(m.clientName).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
  if (opts.save !== false) doc.save(filename);
  return doc;
};
