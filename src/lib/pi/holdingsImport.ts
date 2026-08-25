// Holdings statement / screenshot import — shared by Portfolio Intelligence
// and the admin client book. Files are read locally, spreadsheets are converted
// to text in the browser, then everything is sent to the extraction function.
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import type { AssetBucket, FundRole, PortfolioFund } from "@/lib/pi/types";

export type SipFrequency =
  | "None"
  | "Daily"
  | "Weekly"
  | "Fortnightly"
  | "Monthly"
  | "Quarterly"
  | "Half Yearly"
  | "Yearly"
  | "Unknown";

export type ExtractedHolding = {
  schemeName: string;
  fundHouse: string;
  plan: "Direct" | "Regular" | "Unknown";
  option: "Growth" | "IDCW" | "Unknown";
  folio: string;
  isin: string;
  schemeCode: string;
  category: string;
  subCategory: string;
  assetBucket: AssetBucket;
  role: FundRole;
  currentValue: number;
  investedAmount: number;
  /** Monthly-equivalent SIP used everywhere downstream. */
  sipAmount: number;
  /** Instalment amount exactly as printed, at `sipFrequency`. */
  sipInstalment: number;
  sipFrequency: SipFrequency;
  sipStartDate: string;
  sipDay: number;
  units: number;
  purchaseDate: string;
  confidence: "high" | "medium" | "low";
  missingFields: string[];
  /** Plain-English notes on anything inferred rather than read. */
  assumptions: string[];
  sourceNote: string;
};

export type ExtractionResult = {
  statementType: string;
  statementDate: string;
  holdings: ExtractedHolding[];
  assumptions: string[];
  warnings: string[];
};

/** Instalments per month for each frequency — used to normalise SIPs to monthly. */
export const SIP_PER_MONTH: Record<SipFrequency, number> = {
  None: 0,
  Daily: 21,
  Weekly: 52 / 12,
  Fortnightly: 26 / 12,
  Monthly: 1,
  Quarterly: 1 / 3,
  "Half Yearly": 1 / 6,
  Yearly: 1 / 12,
  Unknown: 1,
};

export const SIP_FREQUENCIES: SipFrequency[] = [
  "None", "Daily", "Weekly", "Fortnightly", "Monthly", "Quarterly", "Half Yearly", "Yearly", "Unknown",
];

/** Monthly-equivalent SIP for an instalment at a given frequency. */
export const monthlyEquivalent = (instalment: number, freq: SipFrequency) =>
  Math.round(Math.max(0, instalment) * (SIP_PER_MONTH[freq] ?? 1));

export const ACCEPTED_TYPES =
  ".png,.jpg,.jpeg,.webp,.pdf,.csv,.xls,.xlsx,image/png,image/jpeg,image/webp,application/pdf";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

const isSpreadsheet = (f: File) =>
  /\.(csv|xlsx?|)$/i.test(f.name) && /\.(csv|xlsx?)$/i.test(f.name);

const readDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

/** Flattens every sheet of a CSV/XLS/XLSX file into plain CSV text. */
const readSheetText = async (file: File) => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  return wb.SheetNames.map(
    (name) => `--- sheet: ${name} ---\n${XLSX.utils.sheet_to_csv(wb.Sheets[name])}`,
  ).join("\n\n");
};

export const extractHoldings = async (files: File[]): Promise<ExtractionResult> => {
  if (files.length === 0) throw new Error("Select at least one file");
  const payload = await Promise.all(
    files.map(async (f) => {
      if (f.size > MAX_FILE_BYTES) throw new Error(`${f.name} is larger than 10 MB`);
      if (isSpreadsheet(f)) {
        const text = await readSheetText(f);
        if (!text.trim()) throw new Error(`${f.name} looks empty`);
        return { name: f.name, mimeType: "text/csv", text };
      }
      const dataUrl = await readDataUrl(f);
      if (!dataUrl.includes("base64,") || dataUrl.endsWith("base64,")) {
        throw new Error(`${f.name} could not be read`);
      }
      return { name: f.name, mimeType: f.type || "application/octet-stream", dataUrl };
    }),
  );

  const { data, error } = await supabase.functions.invoke("pi-holdings-extract", {
    body: { files: payload },
  });
  if (error) throw new Error(error.message || "Extraction failed");
  const result = (data as { result?: ExtractionResult; error?: string })?.result;
  if (!result || !Array.isArray(result.holdings)) {
    throw new Error((data as { error?: string })?.error || "No holdings could be read");
  }
  return {
    statementType: result.statementType || "unknown",
    statementDate: result.statementDate || "",
    holdings: result.holdings.map(normaliseHolding),
    assumptions: Array.isArray(result.assumptions) ? result.assumptions.map(String) : [],
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
  };
};

const BUCKETS: AssetBucket[] = [
  "Indian Equity", "International Equity", "Debt", "Hybrid", "Gold", "Silver", "Cash",
];
const ROLES: FundRole[] = [
  "Core", "Large Cap", "Flexi Cap", "Mid Cap", "Small Cap", "International Developed",
  "International Emerging", "Diversifier", "Gold", "Silver", "Debt", "Hybrid", "Sector", "Thematic", "Satellite",
];

const n = (v: unknown) => {
  const x = Number(v);
  return Number.isFinite(x) && x >= 0 ? Math.round(x) : 0;
};

const date = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : "");

/** Infers plan/option from the scheme name when the model could not read them. */
const planFromName = (name: string): ExtractedHolding["plan"] =>
  /\bdirect\b/i.test(name) ? "Direct" : /\bregular\b/i.test(name) ? "Regular" : "Unknown";
const optionFromName = (name: string): ExtractedHolding["option"] =>
  /\b(growth)\b/i.test(name) ? "Growth" : /\b(idcw|dividend|payout|reinvest)/i.test(name) ? "IDCW" : "Unknown";

const normaliseHolding = (h: Partial<ExtractedHolding>): ExtractedHolding => {
  const schemeName = String(h.schemeName ?? "").trim();
  const assumptions = Array.isArray(h.assumptions) ? h.assumptions.map(String) : [];

  // SIPs are always treated as monthly. When the statement prints a non-monthly
  // instalment (quarterly, yearly, …) the amount is silently converted to its
  // monthly equivalent so downstream math stays correct, with a single note.
  const printedInstalment = n(h.sipInstalment ?? h.sipAmount);
  const detected = SIP_FREQUENCIES.includes(h.sipFrequency as SipFrequency)
    ? (h.sipFrequency as SipFrequency)
    : "Monthly";
  let instalment = printedInstalment;
  if (printedInstalment > 0 && detected !== "Monthly" && detected !== "None" && detected !== "Unknown") {
    instalment = monthlyEquivalent(printedInstalment, detected);
    assumptions.push(
      `${detected} instalment of ₹${printedInstalment.toLocaleString("en-IN")} normalised to ₹${instalment.toLocaleString("en-IN")}/month.`,
    );
  }
  const frequency: SipFrequency = instalment > 0 ? "Monthly" : "None";

  let plan = (["Direct", "Regular", "Unknown"] as const).includes(h.plan as "Direct") ? h.plan! : "Unknown";
  if (plan === "Unknown") {
    const guess = planFromName(schemeName);
    if (guess !== "Unknown") {
      plan = guess;
      assumptions.push(`Plan read as ${guess} from the scheme name.`);
    }
  }
  let option = (["Growth", "IDCW", "Unknown"] as const).includes(h.option as "Growth") ? h.option! : "Unknown";
  if (option === "Unknown") {
    const guess = optionFromName(schemeName);
    if (guess !== "Unknown") {
      option = guess;
      assumptions.push(`Option read as ${guess} from the scheme name.`);
    }
  }

  const sipStartDate = date(h.sipStartDate);
  const purchaseDate = date(h.purchaseDate);
  if (frequency !== "None" && !sipStartDate && purchaseDate) {
    assumptions.push("SIP start date not printed — first purchase date used instead.");
  }
  void detected;

  return {
    schemeName,
    fundHouse: String(h.fundHouse ?? "").trim(),
    plan,
    option,
    folio: String(h.folio ?? "").trim(),
    isin: String(h.isin ?? "").trim(),
    schemeCode: String(h.schemeCode ?? "").trim(),
    category: ["Equity", "Debt", "Hybrid", "Other"].includes(String(h.category)) ? String(h.category) : "Equity",
    subCategory: String(h.subCategory ?? "").trim(),
    assetBucket: BUCKETS.includes(h.assetBucket as AssetBucket) ? (h.assetBucket as AssetBucket) : "Indian Equity",
    role: ROLES.includes(h.role as FundRole) ? (h.role as FundRole) : "Flexi Cap",
    currentValue: n(h.currentValue),
    investedAmount: n(h.investedAmount),
    sipInstalment: instalment,
    sipFrequency: frequency,
    sipAmount: monthlyEquivalent(instalment, frequency),
    sipStartDate: sipStartDate || (frequency !== "None" ? purchaseDate : ""),
    sipDay: Math.min(31, Math.max(0, n(h.sipDay))),
    units: Number.isFinite(Number(h.units)) ? Number(h.units) : 0,
    purchaseDate,
    confidence: (["high", "medium", "low"] as const).includes(h.confidence as "high")
      ? (h.confidence as ExtractedHolding["confidence"])
      : "low",
    missingFields: Array.isArray(h.missingFields) ? h.missingFields.map(String) : [],
    assumptions,
    sourceNote: String(h.sourceNote ?? "").slice(0, 120),
  };
};

/** Maps a reviewed extraction row onto the Portfolio Intelligence fund shape. */
export const toPortfolioFund = (h: ExtractedHolding): PortfolioFund => ({
  id: crypto.randomUUID(),
  schemeName: h.schemeName,
  fundHouse: h.fundHouse,
  category: h.category,
  subCategory: h.subCategory || h.role,
  assetBucket: h.assetBucket,
  role: h.role,
  currentValue: h.currentValue,
  investedAmount: h.investedAmount,
  sipAmount: h.sipAmount,
  purchaseDate: h.sipStartDate || h.purchaseDate || "",
});
