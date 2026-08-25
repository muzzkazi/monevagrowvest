import { useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileUp, Loader2, AlertTriangle, Info, X } from "lucide-react";
import {
  ACCEPTED_TYPES, ExtractedHolding, ExtractionResult, extractHoldings,
} from "@/lib/pi/holdingsImport";
import type { AssetBucket, FundRole } from "@/lib/pi/types";

const BUCKETS: AssetBucket[] = ["Indian Equity", "International Equity", "Debt", "Hybrid", "Gold", "Silver", "Cash"];
const ROLES: FundRole[] = [
  "Core", "Large Cap", "Flexi Cap", "Mid Cap", "Small Cap", "International Developed",
  "International Emerging", "Diversifier", "Gold", "Silver", "Debt", "Hybrid", "Sector", "Thematic", "Satellite",
];

const confidenceVariant = (c: ExtractedHolding["confidence"]) =>
  c === "high" ? "secondary" : c === "medium" ? "outline" : "destructive";

/**
 * Uploads a holdings report (screenshot / PDF / CSV / Excel), extracts the
 * holdings with AI, then hands the advisor an editable review table before
 * anything is saved.
 */
const HoldingsImportDialog = ({
  onImport,
  trigger,
  title = "Import holdings from a statement",
}: {
  onImport: (rows: ExtractedHolding[]) => void | Promise<void>;
  trigger?: React.ReactNode;
  title?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [rows, setRows] = useState<ExtractedHolding[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFiles([]); setResult(null); setRows([]); setSelected({}); setBusy(false); setSaving(false);
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 5));
  };

  const run = async () => {
    setBusy(true);
    try {
      const res = await extractHoldings(files);
      if (res.holdings.length === 0) {
        toast.error("No holdings found. Try a clearer screenshot or the full statement.");
      }
      setResult(res);
      setRows(res.holdings);
      setSelected(Object.fromEntries(res.holdings.map((_, i) => [i, true])));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setBusy(false);
    }
  };

  const update = (i: number, patch: Partial<ExtractedHolding>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const confirm = async () => {
    const chosen = rows.filter((r, i) => selected[i] && r.schemeName.trim());
    if (chosen.length === 0) return toast.error("Select at least one holding with a scheme name");
    setSaving(true);
    try {
      await onImport(chosen);
      toast.success(`${chosen.length} holding${chosen.length > 1 ? "s" : ""} imported`);
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not import holdings");
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = rows.filter((_, i) => selected[i]).length;

  /** Document-level assumptions plus every row-level inference, de-duplicated. */
  const allAssumptions = Array.from(
    new Set([
      ...(result?.assumptions ?? []),
      ...rows.flatMap((r, i) =>
        r.assumptions.map((a) => `${r.schemeName || `Row ${i + 1}`}: ${a}`),
      ),
    ]),
  );

  /** SIPs are always monthly — keep the instalment and monthly amount in sync. */
  const updateSip = (i: number, sipInstalment: number) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, sipInstalment, sipAmount: sipInstalment } : r)),
    );

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" /> Upload holdings report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[88vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a holdings screenshot, a CAS / broker / AMC PDF statement, or a CSV / Excel export.
              Existing values and active SIPs are read out for you to review — nothing is saved until you confirm.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-financial-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <FileUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium text-foreground">Choose files</div>
              <div className="text-xs text-muted-foreground mt-1">
                PNG, JPG, PDF, CSV or Excel · up to 5 files, 10 MB each
              </div>
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES}
              className="hidden"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                    <span className="truncate text-foreground">{f.name}</span>
                    <Button
                      variant="ghost" size="icon" aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <DialogFooter>
              <Button onClick={run} disabled={busy || files.length === 0} className="gap-2">
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Reading statement…</> : "Extract holdings"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">{result.statementType}</Badge>
              {result.statementDate && <Badge variant="outline">As on {result.statementDate}</Badge>}
              <span className="text-muted-foreground">{rows.length} rows read · {selectedCount} selected</span>
            </div>

            {result.warnings.length > 0 && (
              <Card className="p-3 border-destructive/40">
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <ul className="space-y-1">
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </Card>
            )}

            {allAssumptions.length > 0 && (
              <Card className="p-3 bg-financial-muted">
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 text-financial-accent shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Assumptions made while reading this report</p>
                    <ul className="space-y-1 list-disc pl-4">
                      {allAssumptions.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            <p className="text-xs text-muted-foreground">
              Check every figure against the document before importing — low-confidence rows were partly unreadable.
              SIPs are stored as a monthly amount; edit the instalment to correct it.
            </p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead className="min-w-[220px]">Scheme</TableHead>
                    <TableHead className="min-w-[140px]">Bucket</TableHead>
                    <TableHead className="min-w-[130px]">Role</TableHead>
                    <TableHead className="min-w-[120px]">Current ₹</TableHead>
                    <TableHead className="min-w-[120px]">Invested ₹</TableHead>
                    <TableHead className="min-w-[200px]">SIP instalment &amp; frequency</TableHead>
                    <TableHead className="min-w-[150px]">SIP start</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Checkbox
                          checked={!!selected[i]}
                          onCheckedChange={(v) => setSelected((s) => ({ ...s, [i]: !!v }))}
                          aria-label={`Include ${r.schemeName || `row ${i + 1}`}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input value={r.schemeName} onChange={(e) => update(i, { schemeName: e.target.value })} className="h-9" />
                        <Input
                          value={r.fundHouse}
                          onChange={(e) => update(i, { fundHouse: e.target.value })}
                          placeholder="Fund house"
                          className="h-8 mt-1 text-xs"
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-[10px]">{r.plan} plan</Badge>
                          <Badge variant="outline" className="text-[10px]">{r.option}</Badge>
                          {r.folio && <Badge variant="outline" className="text-[10px]">Folio {r.folio}</Badge>}
                        </div>
                        {r.sourceNote && <p className="text-[11px] text-muted-foreground mt-1">{r.sourceNote}</p>}
                        {r.assumptions.length > 0 && (
                          <p className="text-[11px] text-financial-accent mt-1">Assumed: {r.assumptions.join(" ")}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select value={r.assetBucket} onValueChange={(v) => update(i, { assetBucket: v as AssetBucket })}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {BUCKETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={r.role} onValueChange={(v) => update(i, { role: v as FundRole })}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <NumberInput
                          value={r.currentValue}
                          onTextChange={(v) => update(i, { currentValue: Number(v.replace(/[^0-9]/g, "") || 0) })}
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <NumberInput
                          value={r.investedAmount}
                          onTextChange={(v) => update(i, { investedAmount: Number(v.replace(/[^0-9]/g, "") || 0) })}
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <NumberInput
                          value={r.sipInstalment}
                          onTextChange={(v) => updateSip(i, Number(v.replace(/[^0-9]/g, "") || 0))}
                          className="h-9"
                          aria-label={`Monthly SIP for ${r.schemeName || `row ${i + 1}`}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={r.sipStartDate}
                          onChange={(e) => update(i, { sipStartDate: e.target.value })}
                          className="h-9"
                          aria-label={`SIP start date for ${r.schemeName || `row ${i + 1}`}`}
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {r.sipDay ? `Debited on day ${r.sipDay}` : "Debit day not printed"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={confidenceVariant(r.confidence)} className="capitalize">{r.confidence}</Badge>
                        {r.missingFields.length > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-1">Missing: {r.missingFields.join(", ")}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={reset}>Upload different files</Button>
              <Button onClick={confirm} disabled={saving}>
                {saving ? "Importing…" : `Import ${selectedCount} holding${selectedCount === 1 ? "" : "s"}`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HoldingsImportDialog;
export type { ExtractedHolding };
