import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calculator, TrendingDown, Clock, IndianRupee, Info, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency, formatInputValue, parseCommaNumber } from "@/lib/utils";

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface PrepaymentScenario {
  name: string;
  extraMonthly: number;
  lumpSum: number;
  lumpSumMonth: number;
  totalMonths: number;
  totalInterest: number;
  savings: number;
}

const LoanAmortization = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [lumpSum, setLumpSum] = useState(0);
  const [lumpSumMonth, setLumpSumMonth] = useState(12);
  const [isScenariosCollapsed, setIsScenariosCollapsed] = useState(false);

  // Check if all required inputs are provided
  const hasValidInputs = useMemo(() => {
    const amount = parseCommaNumber(loanAmount);
    const rate = parseFloat(interestRate);
    const term = parseFloat(loanTerm);
    
    return amount > 0 && rate > 0 && term > 0;
  }, [loanAmount, interestRate, loanTerm]);

  const baseAmortization = useMemo(() => {
    if (!hasValidInputs) {
      return {
        schedule: [],
        monthlyPayment: 0,
        totalInterest: 0,
        totalMonths: 0
      };
    }

    const amount = parseCommaNumber(loanAmount);
    const rate = parseFloat(interestRate);
    const term = parseFloat(loanTerm);
    
    const monthlyRate = rate / 100 / 12;
    const totalMonths = term * 12;
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = amount;
    
    for (let month = 1; month <= totalMonths && remainingBalance > 0; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);
      remainingBalance -= principalPayment;
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }
    
    return {
      schedule,
      monthlyPayment,
      totalInterest: schedule.reduce((sum, entry) => sum + entry.interest, 0),
      totalMonths: schedule.length
    };
  }, [loanAmount, interestRate, loanTerm, hasValidInputs]);

  const prepaymentScenarios = useMemo(() => {
    if (!hasValidInputs) return [];
    
    const amount = parseCommaNumber(loanAmount);
    const rate = parseFloat(interestRate);
    
    const scenarios: PrepaymentScenario[] = [];
    
    // Base scenario
    scenarios.push({
      name: "No Prepayment",
      extraMonthly: 0,
      lumpSum: 0,
      lumpSumMonth: 0,
      totalMonths: baseAmortization.totalMonths,
      totalInterest: baseAmortization.totalInterest,
      savings: 0
    });

    // Calculate scenario with current inputs
    const calculateScenario = (extraMonthlyAmount: number, lumpSumAmount: number, lumpSumMonthNum: number) => {
      const monthlyRate = rate / 100 / 12;
      const monthlyPayment = baseAmortization.monthlyPayment;
      
      let remainingBalance = amount;
      let totalInterest = 0;
      let month = 1;
      
      while (remainingBalance > 0 && month <= 600) { // Prevent infinite loop
        const interestPayment = remainingBalance * monthlyRate;
        totalInterest += interestPayment;
        
        let paymentAmount = monthlyPayment + extraMonthlyAmount;
        if (month === lumpSumMonthNum) {
          paymentAmount += lumpSumAmount;
        }
        
        const principalPayment = Math.min(paymentAmount - interestPayment, remainingBalance);
        remainingBalance -= principalPayment;
        
        if (remainingBalance <= 0) break;
        month++;
      }
      
      return {
        totalMonths: month,
        totalInterest,
        savings: baseAmortization.totalInterest - totalInterest
      };
    };

    // Current scenario
    if (extraMonthly > 0 || lumpSum > 0) {
      const result = calculateScenario(extraMonthly, lumpSum, lumpSumMonth);
      scenarios.push({
        name: "Your Scenario",
        extraMonthly,
        lumpSum,
        lumpSumMonth,
        ...result
      });
    }

    // Preset scenarios
    const presets = [
      { name: "₹5,000 Extra Monthly", extra: 5000, lump: 0, lumpMonth: 0 },
      { name: "₹10,000 Extra Monthly", extra: 10000, lump: 0, lumpMonth: 0 },
      { name: "₹1L Lump Sum (Year 1)", extra: 0, lump: 100000, lumpMonth: 12 },
      { name: "₹2L Lump Sum (Year 2)", extra: 0, lump: 200000, lumpMonth: 24 }
    ];

    presets.forEach(preset => {
      const result = calculateScenario(preset.extra, preset.lump, preset.lumpMonth);
      scenarios.push({
        name: preset.name,
        extraMonthly: preset.extra,
        lumpSum: preset.lump,
        lumpSumMonth: preset.lumpMonth,
        ...result
      });
    });

    return scenarios;
  }, [baseAmortization, extraMonthly, lumpSum, lumpSumMonth, interestRate, loanAmount, hasValidInputs]);

  const currentScenarioSchedule = useMemo(() => {
    if (!hasValidInputs) return [];
    
    if (extraMonthly === 0 && lumpSum === 0) {
      return baseAmortization.schedule;
    }

    const amount = parseCommaNumber(loanAmount);
    const rate = parseFloat(interestRate);
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = baseAmortization.monthlyPayment;
    
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = amount;
    
    for (let month = 1; month <= 600 && remainingBalance > 0; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      
      let paymentAmount = monthlyPayment + extraMonthly;
      if (month === lumpSumMonth) {
        paymentAmount += lumpSum;
      }
      
      const principalPayment = Math.min(paymentAmount - interestPayment, remainingBalance);
      remainingBalance -= principalPayment;
      
      schedule.push({
        month,
        payment: paymentAmount,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
      
      if (remainingBalance <= 0) break;
    }
    
    return schedule;
  }, [baseAmortization, extraMonthly, lumpSum, lumpSumMonth, interestRate, loanAmount, hasValidInputs]);

  return (
    <div className="space-y-6">
      {/* Loan Details Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="loan-amount">Loan Amount (₹)</Label>
          <Input
            id="loan-amount"
            type="text"
            placeholder="e.g., 5,00,000"
            value={loanAmount}
            onChange={(e) => {
              const formatted = formatInputValue(e.target.value);
              setLoanAmount(formatted);
            }}
          />
        </div>
        <div>
          <Label htmlFor="interest-rate">Interest Rate (%)</Label>
          <Input
            id="interest-rate"
            type="number"
            step="0.1"
            max="50"
            placeholder="e.g., 8.5"
            value={interestRate}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (value <= 50 || e.target.value === '') {
                setInterestRate(e.target.value);
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="loan-term">Loan Term (Years)</Label>
          <Input
            id="loan-term"
            type="number"
            placeholder="e.g., 20"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <div className="text-center w-full">
            <p className="text-sm text-muted-foreground">Monthly EMI</p>
                       <p className="text-lg font-bold text-primary">
                {hasValidInputs ? formatCurrency(baseAmortization.monthlyPayment) : '₹0'}
              </p>
          </div>
        </div>
      </div>

      {!hasValidInputs && (
        <Card className="bg-muted/30">
          <CardContent className="p-6 text-center">
            <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Enter Loan Details</h3>
            <p className="text-muted-foreground">
              Please enter the loan amount, interest rate, and loan term to see repayment scenarios and calculations.
            </p>
          </CardContent>
        </Card>
      )}

      {hasValidInputs && (
        <>
          {/* Prepayment Options */}
          <TooltipProvider>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Prepayment Options</h3>
              
              {/* Extra Monthly Payment Section */}
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-blue-600" />
                    Extra Monthly Payment
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">
                          <strong>Extra Monthly Payment:</strong> An additional amount you pay every month on top of your regular EMI. 
                          This helps reduce the principal faster and saves significant interest over the loan term.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="max-w-xs">
                    <Label htmlFor="extra-monthly" className="text-xs">Extra Amount (₹)</Label>
                    <Input
                      id="extra-monthly"
                      type="text"
                      placeholder="e.g., 5,000"
                      className="h-8"
                      value={extraMonthly ? formatInputValue(extraMonthly.toString()) : ''}
                      onChange={(e) => {
                        const formatted = formatInputValue(e.target.value);
                        setExtraMonthly(parseCommaNumber(formatted));
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Lump Sum Payment Section */}
              <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    Lump Sum Payment
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">
                          <strong>Lump Sum Payment:</strong> A large one-time payment towards your loan principal. 
                          This could be from a bonus, inheritance, or savings. It dramatically reduces your outstanding balance 
                          and can save substantial interest.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="lump-sum" className="text-xs h-5 flex items-center">Lump Sum Amount (₹)</Label>
                      <Input
                        id="lump-sum"
                        type="text"
                        placeholder="e.g., 1,00,000"
                        className="h-8"
                        value={lumpSum ? formatInputValue(lumpSum.toString()) : ''}
                        onChange={(e) => {
                          const formatted = formatInputValue(e.target.value);
                          setLumpSum(parseCommaNumber(formatted));
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lump-sum-month" className="text-xs h-5 flex items-center gap-1">
                        Payment in Month
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-muted-foreground cursor-help hover:text-green-600" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="text-sm">
                              <strong>Payment Month:</strong> The month number when you plan to make the lump sum payment. 
                              For example, "12" means you'll make the payment at the end of the first year.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="lump-sum-month"
                        type="number"
                        placeholder="e.g., 12"
                        className="h-8"
                        value={lumpSumMonth}
                        onChange={(e) => setLumpSumMonth(parseFloat(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TooltipProvider>

          {/* Scenario Comparison */}
          <Collapsible open={!isScenariosCollapsed} onOpenChange={(open) => setIsScenariosCollapsed(!open)}>
            <div className="space-y-4">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-lg font-semibold p-0 h-auto hover:bg-transparent"
                >
                  <span>Prepayment Scenarios Comparison</span>
                  {isScenariosCollapsed ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4">
                <div className="grid gap-4">
                  {prepaymentScenarios.map((scenario, index) => (
                    <Card key={index} className={scenario.name === "Your Scenario" ? "ring-2 ring-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{scenario.name}</h4>
                          {scenario.savings > 0 && (
                            <Badge variant="secondary" className="text-green-600">
                              Save {formatCurrency(scenario.savings)}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Months</p>
                            <p className="font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {scenario.totalMonths}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Interest</p>
                            <p className="font-medium text-destructive">
                              {formatCurrency(scenario.totalInterest)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time Saved</p>
                            <p className="font-medium text-green-600">
                              {baseAmortization.totalMonths - scenario.totalMonths} months
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Interest Saved</p>
                            <p className="font-medium text-green-600">
                              {formatCurrency(scenario.savings)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Amortization Schedule */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="schedule">Full Schedule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Base Scenario */}
                <Card className="border-2 border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-center text-muted-foreground">
                      Without Extra Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Interest</p>
                      <p className="text-xl font-bold text-destructive">
                        {formatCurrency(baseAmortization.totalInterest)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Loan Tenure</p>
                      <p className="text-xl font-bold">
                        {Math.floor(baseAmortization.totalMonths / 12)}y {baseAmortization.totalMonths % 12}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Payment</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(parseCommaNumber(loanAmount) + baseAmortization.totalInterest)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* User Scenario */}
                <Card className="border-2 border-primary bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-center text-primary">
                      With Your Extra Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Interest</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(currentScenarioSchedule.reduce((sum, entry) => sum + entry.interest, 0))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Loan Tenure</p>
                      <p className="text-xl font-bold text-green-600">
                        {Math.floor(currentScenarioSchedule.length / 12)}y {currentScenarioSchedule.length % 12}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Payment</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(parseCommaNumber(loanAmount) + currentScenarioSchedule.reduce((sum, entry) => sum + entry.interest, 0))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Savings Summary */}
              {(extraMonthly > 0 || lumpSum > 0) && (
                <Card className="border-2 border-green-500 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-center text-green-700">
                      Your Savings Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Saved</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(baseAmortization.totalInterest - currentScenarioSchedule.reduce((sum, entry) => sum + entry.interest, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time Saved</p>
                        <p className="text-2xl font-bold text-green-600">
                          {baseAmortization.totalMonths - currentScenarioSchedule.length} months
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Amortization Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Interest</TableHead>
                          <TableHead>Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentScenarioSchedule.slice(0, 60).map((entry) => (
                          <TableRow key={entry.month}>
                            <TableCell>{entry.month}</TableCell>
                            <TableCell>{formatCurrency(entry.payment)}</TableCell>
                            <TableCell>{formatCurrency(entry.principal)}</TableCell>
                            <TableCell>{formatCurrency(entry.interest)}</TableCell>
                            <TableCell>{formatCurrency(entry.balance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {currentScenarioSchedule.length > 60 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Showing first 60 months. Total: {currentScenarioSchedule.length} months
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default LoanAmortization;