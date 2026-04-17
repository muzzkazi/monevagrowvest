import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
  Calculator,
  Clock,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { formatCurrency, formatInputValue, parseCommaNumber } from "@/lib/utils";
import { computeTax, defaultInputs, TaxInputs, TaxResult } from "@/lib/taxEngine";

// Lightweight analytics tracker
const track = (event: string, props: Record<string, unknown> = {}) => {
  // eslint-disable-next-line no-console
  console.log(`[tax-planning] ${event}`, props);
};

const TOTAL_STEPS = 11;

const stepTitles = [
  "Welcome",
  "Your Income",
  "Income Type",
  "Salary Breakdown",
  "Other Income",
  "Capital Gains",
  "Section 80C",
  "Health Insurance (80D)",
  "Home Loan",
  "NPS",
  "Your Tax Plan",
];

const TaxPlanningWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [hasHomeLoan, setHasHomeLoan] = useState<boolean | null>(null);
  const [hasNPS, setHasNPS] = useState<boolean | null>(null);
  const [hasCapitalGains, setHasCapitalGains] = useState<boolean | null>(null);

  const [data, setData] = useState<TaxInputs>({
    totalIncome: 0,
    incomeType: "salaried",
    basicSalary: 0,
    hraReceived: 0,
    rentPerMonth: 15000,
    cityType: "metro",
    interestIncome: 0,
    rentalIncome: 0,
    businessIncome: 0,
    shortTermGains: 0,
    longTermGains: 0,
    invested80C: 0,
    healthInsuranceSelf: 25000,
    healthInsuranceParents: 0,
    parentsSenior: false,
    homeLoanInterest: 0,
    npsAmount: 0,
  });

  // Inputs as strings for comma formatting
  const [inputs, setInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    track("page_start");
  }, []);

  useEffect(() => {
    track("step_view", { step, title: stepTitles[step] });
    setStepStartTime(Date.now());
    return () => {
      const dwell = Date.now() - stepStartTime;
      track("step_exit", { step, dwell_ms: dwell });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleNumber = (field: keyof TaxInputs, raw: string) => {
    const formatted = formatInputValue(raw);
    setInputs((p) => ({ ...p, [field]: formatted }));
    setData((p) => ({ ...p, [field]: parseCommaNumber(raw) }));
  };

  const setIncomeWithDefaults = (raw: string) => {
    const formatted = formatInputValue(raw);
    const num = parseCommaNumber(raw);
    setInputs((p) => ({ ...p, totalIncome: formatted }));
    const d = defaultInputs(num);
    setData((p) => ({ ...p, totalIncome: num, ...d } as TaxInputs));
    setInputs((p) => ({
      ...p,
      basicSalary: d.basicSalary ? d.basicSalary.toLocaleString("en-IN") : "",
      hraReceived: d.hraReceived ? d.hraReceived.toLocaleString("en-IN") : "",
      rentPerMonth: "15,000",
    }));
  };

  const result: TaxResult | null = useMemo(() => {
    if (!data.totalIncome) return null;
    return computeTax(data);
  }, [data]);

  const canProceed = (): boolean => {
    if (step === 1) return data.totalIncome > 0;
    return true;
  };

  const next = () => {
    track("step_complete", { step, title: stepTitles[step] });
    let nextStep = step + 1;
    // Skip salary breakdown if self-employed
    if (step === 2 && data.incomeType === "self-employed") nextStep = 4;
    // Skip home loan input if user said no
    if (step === 8 && hasHomeLoan === false) nextStep = 9;
    // Skip NPS input if user said no
    if (step === 9 && hasNPS === false) nextStep = 10;
    if (nextStep === 10) track("result_viewed", { result });
    setStep(Math.min(nextStep, TOTAL_STEPS - 1));
  };

  const back = () => {
    let prev = step - 1;
    if (step === 4 && data.incomeType === "self-employed") prev = 2;
    setStep(Math.max(0, prev));
  };

  const goToSIP = () => {
    if (!result) return;
    track("sip_redirect_click", {
      sip_amount: result.suggestedMonthlySIP,
      tax_saving: result.potentialTaxSaving,
    });
    const params = new URLSearchParams({
      type: "ELSS",
      amount: String(result.suggestedMonthlySIP),
      taxSaving: "true",
      income: String(data.totalIncome),
    });
    navigate(`/sip-based-planning?${params.toString()}`);
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>
              Step {step} of {TOTAL_STEPS - 2}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> ~2 min total
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      <Card className="glass-card shadow-financial overflow-hidden">
        <CardContent className="p-6 sm:p-10 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && <ScreenWelcome onStart={() => setStep(1)} />}

              {step === 1 && (
                <ScreenIncome
                  value={inputs.totalIncome || ""}
                  onChange={setIncomeWithDefaults}
                />
              )}

              {step === 2 && (
                <ScreenIncomeType
                  value={data.incomeType}
                  onChange={(v) => setData((p) => ({ ...p, incomeType: v }))}
                />
              )}

              {step === 3 && (
                <ScreenSalary
                  inputs={inputs}
                  data={data}
                  handleNumber={handleNumber}
                  setCity={(c) => setData((p) => ({ ...p, cityType: c }))}
                />
              )}

              {step === 4 && (
                <ScreenOtherIncome
                  inputs={inputs}
                  handleNumber={handleNumber}
                />
              )}

              {step === 5 && (
                <ScreenCapitalGains
                  hasGains={hasCapitalGains}
                  setHasGains={setHasCapitalGains}
                  inputs={inputs}
                  handleNumber={handleNumber}
                />
              )}

              {step === 6 && (
                <Screen80C inputs={inputs} handleNumber={handleNumber} />
              )}

              {step === 7 && (
                <Screen80D
                  inputs={inputs}
                  data={data}
                  handleNumber={handleNumber}
                  setSenior={(v) => setData((p) => ({ ...p, parentsSenior: v }))}
                />
              )}

              {step === 8 && (
                <ScreenHomeLoan
                  hasLoan={hasHomeLoan}
                  setHasLoan={setHasHomeLoan}
                  inputs={inputs}
                  handleNumber={handleNumber}
                />
              )}

              {step === 9 && (
                <ScreenNPS
                  hasNPS={hasNPS}
                  setHasNPS={setHasNPS}
                  inputs={inputs}
                  handleNumber={handleNumber}
                />
              )}

              {step === 10 && result && (
                <ScreenResult result={result} data={data} onCTA={goToSIP} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={back} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                onClick={next}
                disabled={!canProceed()}
                className="gap-2 bg-financial-accent hover:bg-financial-accent/90 text-white"
              >
                {step === TOTAL_STEPS - 2 ? "See My Tax Plan" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {step === 1 && (
        <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3 text-financial-accent" />
          Financial year ending soon — plan your tax savings now
        </p>
      )}
    </div>
  );
};

/* --------------------------- Screens --------------------------- */

const ScreenWelcome = ({ onStart }: { onStart: () => void }) => (
  <div className="text-center space-y-6 py-8">
    <div className="inline-flex p-4 bg-financial-accent/10 rounded-full">
      <Receipt className="h-12 w-12 text-financial-accent" />
    </div>
    <h2 className="text-3xl sm:text-4xl font-display font-bold">
      Check and reduce your income tax in minutes
    </h2>
    <p className="text-muted-foreground max-w-md mx-auto">
      Compare old vs new regime, find unused deductions, and discover how much
      more you could be saving — all in under 2 minutes.
    </p>
    <Button
      size="lg"
      onClick={() => {
        track("cta_start");
        onStart();
      }}
      className="bg-financial-accent hover:bg-financial-accent/90 text-white gap-2 text-base px-8"
    >
      Start now <ArrowRight className="h-4 w-4" />
    </Button>
    <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-financial-accent" /> 100% Free
      </span>
      <span className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-financial-accent" /> No signup
      </span>
      <span className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-financial-accent" /> 2 minutes
      </span>
    </div>
  </div>
);

const ScreenIncome = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-display font-bold">
      What's your total annual income?
    </h2>
    <p className="text-muted-foreground text-sm">
      Include salary, business income, and any other earnings (before tax)
    </p>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
        ₹
      </span>
      <Input
        autoFocus
        inputMode="numeric"
        placeholder="10,00,000"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-14 text-xl font-semibold"
      />
    </div>
  </div>
);

const ScreenIncomeType = ({
  value,
  onChange,
}: {
  value: "salaried" | "self-employed";
  onChange: (v: "salaried" | "self-employed") => void;
}) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-display font-bold">
      How do you earn your income?
    </h2>
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as "salaried" | "self-employed")}
      className="gap-3"
    >
      {[
        { v: "salaried", label: "Salaried", desc: "I work for an employer" },
        {
          v: "self-employed",
          label: "Self-employed",
          desc: "Business, freelance, or consulting",
        },
      ].map((o) => (
        <Label
          key={o.v}
          htmlFor={o.v}
          className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            value === o.v
              ? "border-financial-accent bg-financial-accent/5"
              : "border-border hover:border-financial-accent/50"
          }`}
        >
          <RadioGroupItem value={o.v} id={o.v} />
          <div className="flex-1">
            <div className="font-semibold">{o.label}</div>
            <div className="text-xs text-muted-foreground">{o.desc}</div>
          </div>
        </Label>
      ))}
    </RadioGroup>
  </div>
);

const ScreenSalary = ({
  inputs,
  data,
  handleNumber,
  setCity,
}: {
  inputs: Record<string, string>;
  data: TaxInputs;
  handleNumber: (f: keyof TaxInputs, v: string) => void;
  setCity: (c: "metro" | "non-metro") => void;
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-2xl font-display font-bold">Your salary breakdown</h2>
      <p className="text-sm text-muted-foreground mt-1">
        We've pre-filled common values — adjust if needed
      </p>
    </div>
    <div className="space-y-4">
      <Field
        label="Basic salary (annual)"
        value={inputs.basicSalary || ""}
        onChange={(v) => handleNumber("basicSalary", v)}
      />
      <Field
        label="HRA received (annual)"
        value={inputs.hraReceived || ""}
        onChange={(v) => handleNumber("hraReceived", v)}
      />
      <Field
        label="Rent paid per month"
        value={inputs.rentPerMonth || "15,000"}
        onChange={(v) => handleNumber("rentPerMonth", v)}
      />
      <div className="space-y-2">
        <Label>City type</Label>
        <Select value={data.cityType} onValueChange={(v) => setCity(v as "metro" | "non-metro")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="metro">Metro (Mumbai, Delhi, Kolkata, Chennai)</SelectItem>
            <SelectItem value="non-metro">Non-metro (other cities)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

const ScreenOtherIncome = ({
  inputs,
  handleNumber,
}: {
  inputs: Record<string, string>;
  handleNumber: (f: keyof TaxInputs, v: string) => void;
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-2xl font-display font-bold">Any other income?</h2>
      <p className="text-sm text-muted-foreground mt-1">All optional — leave blank if none</p>
    </div>
    <Field label="Interest income (FDs, savings)" value={inputs.interestIncome || ""} onChange={(v) => handleNumber("interestIncome", v)} placeholder="0" />
    <Field label="Rental income (annual)" value={inputs.rentalIncome || ""} onChange={(v) => handleNumber("rentalIncome", v)} placeholder="0" />
    <Field label="Business or freelance income" value={inputs.businessIncome || ""} onChange={(v) => handleNumber("businessIncome", v)} placeholder="0" />
  </div>
);

const ScreenCapitalGains = ({
  hasGains,
  setHasGains,
  inputs,
  handleNumber,
}: {
  hasGains: boolean | null;
  setHasGains: (v: boolean) => void;
  inputs: Record<string, string>;
  handleNumber: (f: keyof TaxInputs, v: string) => void;
}) => (
  <div className="space-y-5">
    <h2 className="text-2xl font-display font-bold">
      Did you sell stocks or mutual funds this year?
    </h2>
    <YesNo value={hasGains} onChange={setHasGains} />
    {hasGains && (
      <div className="space-y-4 pt-2">
        <Field label="Short-term capital gains (held < 1 year)" value={inputs.shortTermGains || ""} onChange={(v) => handleNumber("shortTermGains", v)} placeholder="0" />
        <Field label="Long-term capital gains (held > 1 year)" value={inputs.longTermGains || ""} onChange={(v) => handleNumber("longTermGains", v)} placeholder="0" />
      </div>
    )}
  </div>
);

const Screen80C = ({
  inputs,
  handleNumber,
}: {
  inputs: Record<string, string>;
  handleNumber: (f: keyof TaxInputs, v: string) => void;
}) => {
  const num = parseCommaNumber(inputs.invested80C || "0");
  const remaining = Math.max(0, 150000 - num);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-display font-bold">Section 80C investments</h2>
        <p className="text-sm text-muted-foreground mt-1">
          PF, ELSS, LIC, PPF, home loan principal — total invested this year
        </p>
      </div>
      <Field
        label="Total invested under 80C (max ₹1,50,000)"
        value={inputs.invested80C || ""}
        onChange={(v) => handleNumber("invested80C", v)}
        placeholder="50,000"
      />
      {num > 0 && remaining > 0 && (
        <div className="p-4 rounded-lg bg-financial-accent/10 border border-financial-accent/20 text-sm">
          You still have <strong className="text-financial-accent">{formatCurrency(remaining)}</strong> of unused 80C limit
        </div>
      )}
    </div>
  );
};

const Screen80D = ({
  inputs,
  data,
  handleNumber,
  setSenior,
}: {
  inputs: Record<string, string>;
  data: TaxInputs;
  handleNumber: (f: keyof TaxInputs, v: string) => void;
  setSenior: (v: boolean) => void;
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-2xl font-display font-bold">Health insurance (80D)</h2>
      <p className="text-sm text-muted-foreground mt-1">Premiums you paid this year</p>
    </div>
    <Field label="Health insurance — self & family" value={inputs.healthInsuranceSelf || "25,000"} onChange={(v) => handleNumber("healthInsuranceSelf", v)} />
    <Field label="Health insurance — parents" value={inputs.healthInsuranceParents || ""} onChange={(v) => handleNumber("healthInsuranceParents", v)} placeholder="0" />
    <div className="space-y-2">
      <Label>Are your parents senior citizens (60+)?</Label>
      <RadioGroup value={data.parentsSenior ? "yes" : "no"} onValueChange={(v) => setSenior(v === "yes")} className="flex gap-3">
        <Label htmlFor="sr-yes" className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center ${data.parentsSenior ? "border-financial-accent bg-financial-accent/5" : "border-border"}`}>
          <RadioGroupItem value="yes" id="sr-yes" className="sr-only" /> Yes
        </Label>
        <Label htmlFor="sr-no" className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center ${!data.parentsSenior ? "border-financial-accent bg-financial-accent/5" : "border-border"}`}>
          <RadioGroupItem value="no" id="sr-no" className="sr-only" /> No
        </Label>
      </RadioGroup>
    </div>
  </div>
);

const ScreenHomeLoan = ({
  hasLoan,
  setHasLoan,
  inputs,
  handleNumber,
}: {
  hasLoan: boolean | null;
  setHasLoan: (v: boolean) => void;
  inputs: Record<string, string>;
  handleNumber: (f: keyof TaxInputs, v: string) => void;
}) => (
  <div className="space-y-5">
    <h2 className="text-2xl font-display font-bold">Do you have a home loan?</h2>
    <YesNo value={hasLoan} onChange={setHasLoan} />
    {hasLoan && (
      <Field
        label="Home loan interest paid this year (max ₹2,00,000)"
        value={inputs.homeLoanInterest || ""}
        onChange={(v) => handleNumber("homeLoanInterest", v)}
        placeholder="2,00,000"
      />
    )}
  </div>
);

const ScreenNPS = ({
  hasNPS,
  setHasNPS,
  inputs,
  handleNumber,
}: {
  hasNPS: boolean | null;
  setHasNPS: (v: boolean) => void;
  inputs: Record<string, string>;
  handleNumber: (f: keyof TaxInputs, v: string) => void;
}) => (
  <div className="space-y-5">
    <h2 className="text-2xl font-display font-bold">Do you invest in NPS?</h2>
    <p className="text-sm text-muted-foreground -mt-3">National Pension System — extra ₹50,000 deduction under 80CCD(1B)</p>
    <YesNo value={hasNPS} onChange={setHasNPS} />
    {hasNPS && (
      <Field
        label="NPS amount invested (max ₹50,000)"
        value={inputs.npsAmount || ""}
        onChange={(v) => handleNumber("npsAmount", v)}
        placeholder="50,000"
      />
    )}
  </div>
);

const ScreenResult = ({
  result,
  data,
  onCTA,
}: {
  result: TaxResult;
  data: TaxInputs;
  onCTA: () => void;
}) => {
  useEffect(() => {
    if (result.remaining80C > 0) {
      track("elss_plan_viewed", {
        sip_amount: result.suggestedMonthlySIP,
        tax_saving: result.potentialTaxSaving,
      });
    }
  }, [result]);

  const recommendedTax = result.recommended === "old" ? result.oldTax : result.newTax;
  const otherTax = result.recommended === "old" ? result.newTax : result.oldTax;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-financial-accent/10 rounded-full">
          <Calculator className="h-8 w-8 text-financial-accent" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold">Your tax plan is ready</h2>
      </div>

      {/* Regime comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-xl border-2 ${result.recommended === "old" ? "border-financial-accent bg-financial-accent/5" : "border-border bg-muted/30"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Old regime</span>
            {result.recommended === "old" && <CheckCircle2 className="h-4 w-4 text-financial-accent" />}
          </div>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(result.oldTax)}</div>
        </div>
        <div className={`p-4 rounded-xl border-2 ${result.recommended === "new" ? "border-financial-accent bg-financial-accent/5" : "border-border bg-muted/30"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New regime</span>
            {result.recommended === "new" && <CheckCircle2 className="h-4 w-4 text-financial-accent" />}
          </div>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(result.newTax)}</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-financial-accent/10 to-financial-accent/5 border border-financial-accent/20">
        <div className="flex items-start gap-3">
          <TrendingDown className="h-5 w-5 text-financial-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">
              Choose the {result.recommended} regime — save {formatCurrency(result.savings)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll pay {formatCurrency(recommendedTax)} instead of {formatCurrency(otherTax)}
            </p>
          </div>
        </div>
      </div>

      {/* Gap analysis + ELSS conversion */}
      {result.remaining80C > 0 && result.potentialTaxSaving > 0 && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-financial-accent to-financial-accent/80 text-white space-y-4">
          <div className="flex items-start gap-3">
            <PiggyBank className="h-6 w-6 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Opportunity</p>
              <p className="text-lg font-bold leading-tight mt-1">
                You can save {formatCurrency(result.potentialTaxSaving)} more in tax
              </p>
              <p className="text-sm opacity-90 mt-1">
                You have {formatCurrency(result.remaining80C)} of unused 80C limit. Invest in ELSS mutual funds to claim it.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm opacity-90">Suggested monthly SIP</span>
              <span className="text-2xl font-bold">{formatCurrency(result.suggestedMonthlySIP)}</span>
            </div>
            <div className="text-xs opacity-75 mt-1">
              ELSS funds also have the shortest lock-in (3 years) among 80C options
            </div>
          </div>

          <Button
            onClick={onCTA}
            size="lg"
            variant="secondary"
            className="w-full bg-white text-financial-accent hover:bg-white/90 font-semibold gap-2"
          >
            View my investment plan <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {result.remaining80C === 0 && (
        <div className="p-5 rounded-xl bg-financial-accent/10 border border-financial-accent/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-financial-accent mt-0.5" />
            <div>
              <p className="font-semibold text-financial-accent">You've maxed out your 80C limit!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Explore NPS, voluntary PF, or long-term wealth-building SIPs to keep growing.
              </p>
              <Button onClick={onCTA} className="mt-4 bg-financial-accent text-white hover:bg-financial-accent/90 gap-2">
                Explore SIP options <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground pt-2 flex items-center justify-center gap-1.5">
        <Sparkles className="h-3 w-3" /> Financial year ending soon — act before March 31
      </div>
    </div>
  );
};

/* --------------------------- Helpers --------------------------- */

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="space-y-2">
    <Label className="text-sm">{label}</Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
      <Input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-7"
      />
    </div>
  </div>
);

const YesNo = ({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) => (
  <div className="grid grid-cols-2 gap-3">
    {[
      { v: true, label: "Yes" },
      { v: false, label: "No" },
    ].map((o) => (
      <button
        key={String(o.v)}
        onClick={() => onChange(o.v)}
        className={`p-4 rounded-lg border-2 font-semibold transition-all ${
          value === o.v
            ? "border-financial-accent bg-financial-accent/5 text-financial-accent"
            : "border-border hover:border-financial-accent/50"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default TaxPlanningWizard;
