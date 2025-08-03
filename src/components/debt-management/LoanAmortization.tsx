import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingDown, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [lumpSum, setLumpSum] = useState(0);
  const [lumpSumMonth, setLumpSumMonth] = useState(12);

  const baseAmortization = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = loanAmount;
    
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
  }, [loanAmount, interestRate, loanTerm]);

  const prepaymentScenarios = useMemo(() => {
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
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment = baseAmortization.monthlyPayment;
      
      let remainingBalance = loanAmount;
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
  }, [baseAmortization, extraMonthly, lumpSum, lumpSumMonth, interestRate, loanAmount]);

  const currentScenarioSchedule = useMemo(() => {
    if (extraMonthly === 0 && lumpSum === 0) {
      return baseAmortization.schedule;
    }

    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = baseAmortization.monthlyPayment;
    
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = loanAmount;
    
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
  }, [baseAmortization, extraMonthly, lumpSum, lumpSumMonth, interestRate, loanAmount]);

  return (
    <div className="space-y-6">
      {/* Loan Details Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="loan-amount">Loan Amount (₹)</Label>
          <Input
            id="loan-amount"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="interest-rate">Interest Rate (%)</Label>
          <Input
            id="interest-rate"
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="loan-term">Loan Term (Years)</Label>
          <Input
            id="loan-term"
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-end">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Monthly EMI</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(baseAmortization.monthlyPayment)}
            </p>
          </div>
        </div>
      </div>

      {/* Prepayment Options */}
      <div className="border rounded-lg p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-4">Prepayment Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="extra-monthly">Extra Monthly Payment (₹)</Label>
            <Input
              id="extra-monthly"
              type="number"
              value={extraMonthly}
              onChange={(e) => setExtraMonthly(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="lump-sum">Lump Sum Payment (₹)</Label>
            <Input
              id="lump-sum"
              type="number"
              value={lumpSum}
              onChange={(e) => setLumpSum(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="lump-sum-month">Lump Sum in Month</Label>
            <Input
              id="lump-sum-month"
              type="number"
              value={lumpSumMonth}
              onChange={(e) => setLumpSumMonth(parseFloat(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Prepayment Scenarios Comparison</h3>
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
      </div>

      {/* Amortization Schedule */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="schedule">Full Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(loanAmount + currentScenarioSchedule.reduce((sum, entry) => sum + entry.interest, 0))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Total Interest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(currentScenarioSchedule.reduce((sum, entry) => sum + entry.interest, 0))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Payoff Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(currentScenarioSchedule.length / 12)}y {currentScenarioSchedule.length % 12}m
                </div>
              </CardContent>
            </Card>
          </div>
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
    </div>
  );
};

export default LoanAmortization;