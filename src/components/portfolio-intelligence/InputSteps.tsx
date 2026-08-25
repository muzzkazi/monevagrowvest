import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ClientProfile, Constraints, Goal, PortfolioFund, RiskAnswers, AssetBucket, FundRole } from "@/lib/pi/types";
import { RISK_QUESTIONS, SECTOR_EXCLUSIONS, newFund, newGoal } from "@/lib/pi/defaults";
import HoldingsImportDialog from "@/components/portfolio-intelligence/HoldingsImportDialog";
import SchemePicker from "@/components/portfolio-intelligence/SchemePicker";
import { schemePatch } from "@/lib/pi/schemeClassify";
import { toPortfolioFund } from "@/lib/pi/holdingsImport";


const num = (v: string) => (v === "" ? 0 : Number(v.replace(/[^0-9.-]/g, "")));

const Field = ({
  label,
  value,
  onChange,
  hint,
  plain,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  hint?: string;
  /** Plain number input (no comma grouping) — for years, ages, percentages. */
  plain?: boolean;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {plain ? (
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
    ) : (
      <NumberInput value={value} onTextChange={onChange} className="h-9" />
    )}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

/* ------------------------------- Profile ------------------------------- */

export const ProfileStep = ({
  profile,
  onChange,
}: {
  profile: ClientProfile;
  onChange: (p: ClientProfile) => void;
}) => {
  const set = <K extends keyof ClientProfile>(k: K, v: ClientProfile[K]) => onChange({ ...profile, [k]: v });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Personal</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Client name</Label>
            <Input value={profile.clientName} onChange={(e) => set("clientName", e.target.value)} className="h-9" />
          </div>
          <Field plain label="Age" value={profile.age} onChange={(v) => set("age", num(v))} />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Employment type</Label>
            <Select value={profile.employmentType} onValueChange={(v) => set("employmentType", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Salaried", "Self-employed", "Business owner", "Retired", "Not working"].map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Country of residence</Label>
            <Input value={profile.countryOfResidence} onChange={(e) => set("countryOfResidence", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tax residency</Label>
            <Input value={profile.taxResidency} onChange={(e) => set("taxResidency", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Marital status</Label>
            <Select value={profile.maritalStatus} onValueChange={(v) => set("maritalStatus", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Single", "Married", "Divorced", "Widowed"].map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field label="Annual income (₹)" value={profile.annualIncome} onChange={(v) => onChange({ ...profile, annualIncome: num(v), monthlyIncome: Math.round(num(v) / 12) })} />
          <Field label="Monthly income (₹)" value={profile.monthlyIncome} onChange={(v) => set("monthlyIncome", num(v))} />
          <Field label="Monthly expenses (₹)" value={profile.monthlyExpenses} onChange={(v) => set("monthlyExpenses", num(v))} />
          <Field plain label="Dependents" value={profile.dependents} onChange={(v) => set("dependents", num(v))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial position</CardTitle>
          <p className="text-xs text-muted-foreground">
            These assets feed risk capacity and reduce the mutual fund debt requirement — the portfolio is never analysed in isolation.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <Field label="Emergency fund (₹)" value={profile.emergencyFund} onChange={(v) => set("emergencyFund", num(v))} />
          <Field label="Total liabilities (₹)" value={profile.liabilities} onChange={(v) => set("liabilities", num(v))} />
          <Field label="Monthly EMI (₹)" value={profile.monthlyEmi} onChange={(v) => set("monthlyEmi", num(v))} />
          <Field label="Life insurance cover (₹)" value={profile.insuranceCover} onChange={(v) => set("insuranceCover", num(v))} />
          <Field label="EPF (₹)" value={profile.epf} onChange={(v) => set("epf", num(v))} />
          <Field label="PPF (₹)" value={profile.ppf} onChange={(v) => set("ppf", num(v))} />
          <Field label="NPS (₹)" value={profile.nps} onChange={(v) => set("nps", num(v))} />
          <Field label="Fixed deposits (₹)" value={profile.fixedDeposits} onChange={(v) => set("fixedDeposits", num(v))} />
          <Field label="Direct equity (₹)" value={profile.directEquity} onChange={(v) => set("directEquity", num(v))} />
          <Field label="Bonds (₹)" value={profile.bonds} onChange={(v) => set("bonds", num(v))} />
          <Field label="Real estate (₹)" value={profile.realEstate} onChange={(v) => set("realEstate", num(v))} />
          <Field label="Other investments (₹)" value={profile.otherInvestments} onChange={(v) => set("otherInvestments", num(v))} />
        </CardContent>
      </Card>
    </div>
  );
};

/* -------------------------------- Goals -------------------------------- */

const GOAL_CATEGORIES = [
  "Retirement", "Child education", "Child marriage", "Property",
  "Wealth creation", "Financial independence", "Emergency corpus", "Other",
] as const;

export const GoalsStep = ({ goals, onChange }: { goals: Goal[]; onChange: (g: Goal[]) => void }) => {
  const update = (id: string, patch: Partial<Goal>) =>
    onChange(goals.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  return (
    <div className="space-y-4">
      {goals.length === 0 && (
        <p className="text-sm text-muted-foreground">No goals added — goals are optional. Add one only if you want the target allocation and gap analysis tied to a specific financial goal.</p>
      )}
      {goals.map((g) => (
        <Card key={g.id}>
          <CardContent className="pt-6 grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Goal name</Label>
              <Input value={g.name} onChange={(e) => update(g.id, { name: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={g.category} onValueChange={(v) => update(g.id, { category: v as Goal["category"] })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select value={String(g.priority)} onValueChange={(v) => update(g.id, { priority: Number(v) as Goal["priority"] })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 — Highest</SelectItem>
                  <SelectItem value="2">2 — Medium</SelectItem>
                  <SelectItem value="3">3 — Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field label="Cost today (₹)" value={g.currentCost} onChange={(v) => update(g.id, { currentCost: num(v) })} />
            <Field plain label="Target year" value={g.targetYear} onChange={(v) => update(g.id, { targetYear: num(v) })} />
            <Field label="Already allocated (₹)" value={g.currentAllocated} onChange={(v) => update(g.id, { currentAllocated: num(v) })} />
            <Field label="Monthly contribution (₹)" value={g.monthlyContribution} onChange={(v) => update(g.id, { monthlyContribution: num(v) })} />
            <Field plain label="Inflation assumption (%)" value={g.inflationPct} onChange={(v) => update(g.id, { inflationPct: num(v) })} />
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch checked={g.essential} onCheckedChange={(v) => update(g.id, { essential: v })} id={`ess-${g.id}`} />
              <Label htmlFor={`ess-${g.id}`} className="text-sm">Essential goal (not discretionary)</Label>
            </div>
            <div className="flex items-end justify-end">
              <Button variant="ghost" size="sm" onClick={() => onChange(goals.filter((x) => x.id !== g.id))}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={() => onChange([...goals, newGoal()])}>
        <Plus className="h-4 w-4 mr-1" /> Add goal
      </Button>
    </div>
  );
};

/* --------------------------------- Risk -------------------------------- */

export const RiskStep = ({
  answers,
  onChange,
}: {
  answers: RiskAnswers;
  onChange: (a: RiskAnswers) => void;
}) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Risk tolerance is measured behaviourally across several questions — never from age alone. Risk capacity and risk
      need are computed from the profile and goals.
    </p>
    {RISK_QUESTIONS.map((q) => (
      <Card key={q.key}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-foreground">{q.question}</p>
            <Badge variant="secondary">{q.labels[answers[q.key] - 1]}</Badge>
          </div>
          <Slider
            value={[answers[q.key]]}
            min={1}
            max={5}
            step={1}
            onValueChange={([v]) => onChange({ ...answers, [q.key]: v })}
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{q.labels[0]}</span>
            <span>{q.labels[4]}</span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

/* ----------------------------- Constraints ----------------------------- */

export const ConstraintsStep = ({
  constraints,
  onChange,
}: {
  constraints: Constraints;
  onChange: (c: Constraints) => void;
}) => {
  const set = <K extends keyof Constraints>(k: K, v: Constraints[K]) => onChange({ ...constraints, [k]: v });
  const toggleSector = (s: string) =>
    set(
      "excludedSectors",
      constraints.excludedSectors.includes(s)
        ? constraints.excludedSectors.filter((x) => x !== s)
        : [...constraints.excludedSectors, s],
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eligibility constraints</CardTitle>
          <p className="text-xs text-muted-foreground">
            These filter which funds are eligible — they are not just narrative notes.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Shariah preference</Label>
            <Select value={constraints.shariah} onValueChange={(v) => set("shariah", v as Constraints["shariah"])}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["No preference", "Meaningful Shariah", "Majority Shariah", "Strict Shariah"].map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Geographic preference</Label>
            <Select value={constraints.geography} onValueChange={(v) => set("geography", v as Constraints["geography"])}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["India only", "India + International", "US", "Emerging Markets", "Global"].map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sector exclusions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {SECTOR_EXCLUSIONS.map((s) => {
            const on = constraints.excludedSectors.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSector(s)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  on
                    ? "bg-destructive/10 border-destructive/40 text-destructive"
                    : "bg-financial-muted border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {on ? "Excluded · " : ""}{s}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mandate preferences</CardTitle>
          <p className="text-xs text-muted-foreground">
            These are hard eligibility filters — funds that don't match a switched-on mandate are excluded from the recommendation.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {([
            ["esg", "ESG / ethical mandate", "Limits funds to those meeting Environmental, Social and Governance (ESG) criteria — excludes funds with poor ESG ratings or controversial holdings."],
            ["taxSaving", "Tax saving required (ELSS)", "Restricts to Equity Linked Savings Schemes (ELSS) — the only equity funds eligible for ₹1.5L Section 80C deduction, with a 3-year lock-in."],
            ["incomeNeed", "Regular income need", "Prefers funds that pay regular dividends / income (e.g. dividend-yield, debt) over pure growth funds."],
            ["capitalPreservation", "Capital preservation priority", "Tilts toward low-volatility, capital-protecting funds (debt, arbitrage, conservative hybrid) over high-growth equity."],
          ] as Array<[keyof Constraints, string, string]>).map(([k, label, desc]) => (
            <div key={k} className="flex items-center gap-3">
              <Switch
                id={`c-${k}`}
                checked={Boolean(constraints[k])}
                onCheckedChange={(v) => set(k, v as never)}
              />
              <Label htmlFor={`c-${k}`} className="text-sm flex items-center gap-1.5">
                {label}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      aria-label={`What is ${label}?`}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="w-64 text-xs leading-relaxed" side="right">
                    {desc}
                  </TooltipContent>
                </Tooltip>
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

/* ------------------------------ Portfolio ------------------------------ */

const BUCKETS: AssetBucket[] = ["Indian Equity", "International Equity", "Debt", "Hybrid", "Gold", "Silver", "Cash"];
const ROLES: FundRole[] = [
  "Core", "Large Cap", "Flexi Cap", "Mid Cap", "Small Cap", "International Developed",
  "International Emerging", "Diversifier", "Gold", "Silver", "Debt", "Hybrid", "Sector", "Thematic", "Satellite",
];

export const PortfolioStep = ({
  funds,
  onChange,
  additionalSip,
  onAdditionalSipChange,
  declaredSipBudget,
  onDeclaredSipChange,
}: {
  funds: PortfolioFund[];
  onChange: (f: PortfolioFund[]) => void;
  additionalSip: number;
  onAdditionalSipChange: (n: number) => void;
  declaredSipBudget: number;
  onDeclaredSipChange: (n: number) => void;
}) => {
  const update = (id: string, patch: Partial<PortfolioFund>) =>
    onChange(funds.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const totalInvested = funds.reduce((s, f) => s + (f.investedAmount || 0), 0);
  const totalCurrent = funds.reduce((s, f) => s + (f.currentValue || 0), 0);
  const totalSip = funds.reduce((s, f) => s + (f.sipAmount || 0), 0);
  const gain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
  const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  const sipMismatch = declaredSipBudget > 0 && Math.abs(declaredSipBudget - totalSip) > 1;

  return (
    <div className="space-y-4">

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SIP budget</CardTitle>
          <p className="text-xs text-muted-foreground">
            Current corpus, current monthly SIP and new contributions are treated as three separate things.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Declared total monthly SIP (₹)"
            value={declaredSipBudget}
            onChange={(v) => onDeclaredSipChange(num(v))}
            hint="Used for the data-integrity check against the fund-wise SIPs."
          />
          <Field
            label="Additional monthly SIP available (₹)"
            value={additionalSip}
            onChange={(v) => onAdditionalSipChange(num(v))}
            hint="Directed to the highest-priority allocation gaps, not spread evenly."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import existing holdings</CardTitle>
          <p className="text-xs text-muted-foreground">
            Upload a holdings screenshot, CAS / broker PDF or CSV / Excel export instead of typing each scheme.
            You review and edit every extracted figure before it is added.
          </p>
        </CardHeader>
        <CardContent>
          <HoldingsImportDialog
            onImport={(rows) => onChange([...funds, ...rows.map(toPortfolioFund)])}
          />
        </CardContent>
      </Card>

      {funds.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No holdings yet. Add one below or import a statement — every edit is saved to this browser automatically, so
          switching tabs or leaving the page won't lose your work.
        </p>
      )}

      {funds.map((f, i) => (
        <Card key={f.id}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Scheme name (search AMFI)</Label>
                <SchemePicker
                  value={f.schemeName}
                  onTextChange={(t) => update(f.id, { schemeName: t, schemeCode: undefined })}
                  onSelect={(hit) => update(f.id, schemePatch(hit.schemeName, hit.schemeCode))}
                />
                <p className="text-[11px] text-muted-foreground">
                  Pick from the list — or just type the full name and move on — and the fund house, sub-category,
                  asset bucket and portfolio role are filled in for you. Only confirm them if something looks wrong.
                </p>
              </div>
              <Badge variant="secondary" className="mt-6">#{i + 1}</Badge>
            </div>

            {f.schemeName && (
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <Badge variant="outline">{f.fundHouse || "Fund house —"}</Badge>
                <Badge variant="outline">{f.subCategory || "Sub-category —"}</Badge>
                <Badge variant="outline">{f.assetBucket}</Badge>
                <Badge variant="outline">{f.role}</Badge>
                {f.schemeCode && <span className="text-muted-foreground">AMFI code {f.schemeCode}</span>}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Current value (₹)" value={f.currentValue} onChange={(v) => update(f.id, { currentValue: num(v) })} />
              <Field label="Invested amount (₹)" value={f.investedAmount} onChange={(v) => update(f.id, { investedAmount: num(v) })} />
              <Field label="Monthly SIP (₹)" value={f.sipAmount} onChange={(v) => update(f.id, { sipAmount: num(v) })} />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">First purchase date</Label>
                <Input type="date" value={f.purchaseDate ?? ""} onChange={(e) => update(f.id, { purchaseDate: e.target.value })} className="h-9" />
              </div>
            </div>

            <details className="rounded-md border border-border bg-financial-muted/40 px-3 py-2">
              <summary className="text-xs text-muted-foreground cursor-pointer select-none">
                Adjust classification (only if the auto-detected values look wrong)
              </summary>
              <div className="grid gap-4 sm:grid-cols-4 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fund house</Label>
                  <Input value={f.fundHouse} onChange={(e) => update(f.id, { fundHouse: e.target.value })} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Sub-category</Label>
                  <Input value={f.subCategory} onChange={(e) => update(f.id, { subCategory: e.target.value })} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Asset bucket</Label>
                  <Select value={f.assetBucket} onValueChange={(v) => update(f.id, { assetBucket: v as AssetBucket })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUCKETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Portfolio role</Label>
                  <Select value={f.role} onValueChange={(v) => update(f.id, { role: v as FundRole })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </details>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => onChange(funds.filter((x) => x.id !== f.id))}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove holding
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={() => onChange([...funds, newFund()])}>
        <Plus className="h-4 w-4 mr-1" /> Add holding
      </Button>

    </div>
  );
};
