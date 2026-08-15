import { jsPDF } from "jspdf";

export type ReportClient = {
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  occupation: string | null;
  city: string | null;
  risk_profile: string;
  monthly_income: number | null;
  monthly_investable: number | null;
  investment_horizon_years: number | null;
  tax_bracket: string | null;
  existing_investments: string | null;
  kyc_status: string;
  status: string;
  notes: string | null;
};

export type ReportGoal = {
  goal_name: string;
  target_amount: number | null;
  target_date: string | null;
  priority: string;
  notes: string | null;
};

export type ReportFund = {
  fund_name: string;
  category: string | null;
  monthly_sip: number;
  lumpsum_amount: number;
  sip_day: number | null;
  start_date: string | null;
  status: string;
  rationale: string | null;
};

export type ReportLog = { action: string; details: string | null; created_at: string };

// Core brand colours (kept in sync with the locked brand palette)
const BLUE: [number, number, number] = [19, 89, 210];
const AMBER: [number, number, number] = [166, 96, 6];
const INK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [110, 122, 140];
const LINE: [number, number, number] = [222, 228, 236];

const M = 44; // page margin
const money = (n: number | null | undefined) =>
  n === null || n === undefined ? "-" : `Rs. ${Math.round(Number(n)).toLocaleString("en-IN")}`;
const dateStr = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");
const cap = (s: string | null | undefined) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "-");

export const generateClientReportPdf = ({
  client,
  goals,
  funds,
  log,
  save = true,
}: {
  client: ReportClient;
  goals: ReportGoal[];
  funds: ReportFund[];
  log: ReportLog[];
  /** set to false to get the document back without triggering a download (used in tests) */
  save?: boolean;
}) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const contentW = W - M * 2;
  let y = 0;

  const footer = () => {
    const page = doc.getNumberOfPages();
    doc.setFontSize(8).setTextColor(...MUTED).setFont("helvetica", "normal");
    doc.text("Confidential advisory record - Moneva GrowVest", M, H - 24);
    doc.text(`Page ${page}`, W - M, H - 24, { align: "right" });
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
    room(46);
    y += 10;
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...BLUE);
    doc.text(text.toUpperCase(), M, y);
    y += 8;
    doc.setDrawColor(...LINE).setLineWidth(1);
    doc.line(M, y, W - M, y);
    y += 18;
  };

  const kv = (rows: [string, string][]) => {
    doc.setFontSize(9.5);
    const colW = contentW / 2;
    rows.forEach((row, i) => {
      const col = i % 2;
      if (col === 0) room(30);
      const x = M + col * colW;
      const rowY = y;
      doc.setFont("helvetica", "normal").setTextColor(...MUTED);
      doc.text(row[0], x, rowY);
      doc.setFont("helvetica", "bold").setTextColor(...INK);
      const value = doc.splitTextToSize(row[1] || "-", colW - 16);
      doc.text(value.slice(0, 2), x, rowY + 13);
      if (col === 1 || i === rows.length - 1) y += 34;
    });
  };

  const paragraph = (label: string, text: string | null) => {
    if (!text) return;
    const lines = doc.splitTextToSize(text, contentW);
    room(28 + lines.length * 12);
    doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...MUTED);
    doc.text(label, M, y);
    y += 13;
    doc.setTextColor(...INK);
    doc.text(lines, M, y);
    y += lines.length * 12 + 8;
  };

  const table = <T,>(cols: { header: string; width: number; align?: "left" | "right"; get: (r: T) => string }[], rows: T[]) => {
    const drawHead = () => {
      room(34);
      doc.setFillColor(245, 247, 250);
      doc.rect(M, y - 12, contentW, 22, "F");
      doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...MUTED);
      let x = M + 8;
      cols.forEach((c) => {
        doc.text(c.header.toUpperCase(), c.align === "right" ? x + c.width - 16 : x, y + 3, {
          align: c.align === "right" ? "right" : "left",
        });
        x += c.width;
      });
      y += 26;
    };

    drawHead();
    doc.setFont("helvetica", "normal").setFontSize(9.5);

    rows.forEach((r) => {
      const cells = cols.map((c) => doc.splitTextToSize(c.get(r) || "-", c.width - 16));
      const h = Math.max(...cells.map((c) => c.length)) * 12 + 10;
      if (y + h > H - 56) {
        newPage();
        drawHead();
        doc.setFont("helvetica", "normal").setFontSize(9.5);
      }
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

  /* ---------- Cover header ---------- */
  doc.setFillColor(11, 26, 48);
  doc.rect(0, 0, W, 116, "F");
  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(255, 255, 255);
  doc.text("Client Advisory Report", M, 54);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(198, 210, 228);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`,
    M,
    74
  );
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...AMBER);
  doc.text("MONEVA GROWVEST", W - M, 54, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(198, 210, 228);
  doc.text("Private - for internal advisory use", W - M, 74, { align: "right" });

  y = 154;
  doc.setFont("helvetica", "bold").setFontSize(17).setTextColor(...INK);
  doc.text(client.full_name, M, y);
  y += 18;
  doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...MUTED);
  doc.text(
    [client.email, client.phone, client.city].filter(Boolean).join("  |  ") || "No contact details on record",
    M,
    y
  );
  y += 24;

  /* ---------- Summary strip ---------- */
  const activeFunds = funds.filter((f) => f.status === "active");
  const totalSip = activeFunds.reduce((a, f) => a + Number(f.monthly_sip || 0), 0);
  const totalLumpsum = funds.reduce((a, f) => a + Number(f.lumpsum_amount || 0), 0);
  const stats: [string, string][] = [
    ["Monthly SIP", money(totalSip)],
    ["Active schemes", String(activeFunds.length)],
    ["Lumpsum invested", money(totalLumpsum)],
    ["Risk profile", cap(client.risk_profile)],
  ];
  const cardW = (contentW - 24) / 4;
  stats.forEach((s, i) => {
    const x = M + i * (cardW + 8);
    doc.setFillColor(247, 249, 252);
    doc.roundedRect(x, y, cardW, 52, 5, 5, "F");
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
    doc.text(s[0].toUpperCase(), x + 10, y + 18);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...INK);
    doc.text(s[1], x + 10, y + 38);
  });
  y += 66;

  /* ---------- Profile ---------- */
  heading("Profile & risk");
  kv([
    ["Date of birth", dateStr(client.date_of_birth)],
    ["Occupation", client.occupation || "-"],
    ["Monthly income", money(client.monthly_income)],
    ["Monthly investable", money(client.monthly_investable)],
    ["Investment horizon", client.investment_horizon_years ? `${client.investment_horizon_years} years` : "-"],
    ["Tax bracket", client.tax_bracket || "-"],
    ["KYC status", cap(client.kyc_status)],
    ["Client status", cap(client.status)],
  ]);
  paragraph("Existing investments elsewhere", client.existing_investments);
  paragraph("Advisor notes", client.notes);

  /* ---------- Goals ---------- */
  heading("Financial goals");
  if (goals.length === 0) {
    doc.setFont("helvetica", "italic").setFontSize(9.5).setTextColor(...MUTED);
    doc.text("No goals recorded yet.", M, y);
    y += 20;
  } else {
    table<ReportGoal>(
      [
        { header: "Goal", width: contentW * 0.36, get: (g) => g.goal_name },
        { header: "Target", width: contentW * 0.2, align: "right", get: (g) => money(g.target_amount) },
        { header: "By", width: contentW * 0.2, get: (g) => dateStr(g.target_date) },
        { header: "Priority", width: contentW * 0.24, get: (g) => cap(g.priority) },
      ],
      goals
    );
    goals.filter((g) => g.notes).forEach((g) => paragraph(g.goal_name, g.notes));
  }

  /* ---------- Portfolio ---------- */
  heading("SIP portfolio");
  if (funds.length === 0) {
    doc.setFont("helvetica", "italic").setFontSize(9.5).setTextColor(...MUTED);
    doc.text("No schemes recorded yet.", M, y);
    y += 20;
  } else {
    table<ReportFund>(
      [
        { header: "Fund", width: contentW * 0.38, get: (f) => f.fund_name },
        { header: "Category", width: contentW * 0.18, get: (f) => f.category || "-" },
        { header: "Monthly SIP", width: contentW * 0.18, align: "right", get: (f) => money(f.monthly_sip) },
        { header: "SIP day", width: contentW * 0.12, align: "right", get: (f) => (f.sip_day ? String(f.sip_day) : "-") },
        { header: "Status", width: contentW * 0.14, get: (f) => cap(f.status) },
      ],
      funds
    );
    room(24);
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...INK);
    doc.text(`Total active monthly SIP: ${money(totalSip)}`, W - M, y, { align: "right" });
    y += 20;

    const withRationale = funds.filter((f) => f.rationale);
    if (withRationale.length) {
      heading("Why these funds");
      withRationale.forEach((f) => paragraph(f.fund_name, f.rationale));
    }
  }

  /* ---------- History ---------- */
  heading("Change history");
  if (log.length === 0) {
    doc.setFont("helvetica", "italic").setFontSize(9.5).setTextColor(...MUTED);
    doc.text("No activity recorded yet.", M, y);
    y += 20;
  } else {
    table<ReportLog>(
      [
        { header: "Date", width: contentW * 0.22, get: (l) => dateStr(l.created_at) },
        { header: "Action", width: contentW * 0.3, get: (l) => l.action },
        { header: "Details", width: contentW * 0.48, get: (l) => l.details || "-" },
      ],
      log
    );
  }

  footer();

  const safeName = client.full_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  if (save) doc.save(`${safeName}-advisory-report-${new Date().toISOString().split("T")[0]}.pdf`);
  return doc;
};
