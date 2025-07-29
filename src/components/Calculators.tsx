import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import MutualFundPortfolio from "./MutualFundPortfolio";
import { formatCurrency, formatNumber, parseCommaNumber, formatInputValue } from "@/lib/utils";

const Calculators = () => {
  // SIP Calculator State
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [sipResult, setSipResult] = useState<{
    maturityAmount: number;
    totalInvestment: number;
    wealthGain: number;
  } | null>(null);
  const [showPortfolio, setShowPortfolio] = useState(false);

  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [emiResult, setEmiResult] = useState<{
    emi: number;
    totalAmount: number;
    totalInterest: number;
  } | null>(null);

  // Tax Calculator State
  const [income, setIncome] = useState(800000);
  const [deductions, setDeductions] = useState(150000);
  const [incomeInput, setIncomeInput] = useState("8,00,000");
  const [deductionsInput, setDeductionsInput] = useState("1,50,000");
  const [taxResult, setTaxResult] = useState<{
    taxableIncome: number;
    incomeTax: number;
    netIncome: number;
  } | null>(null);

  // Retirement Calculator State
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [inflationRate, setInflationRate] = useState(6);
  const [retirementReturn, setRetirementReturn] = useState(10);
  const [retirementResult, setRetirementResult] = useState<{
    yearsToRetirement: number;
    futureExpenses: number;
    corpusRequired: number;
    monthlySip: number;
  } | null>(null);

  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = timePeriod * 12;
    const maturityAmount = monthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvestment = monthlyAmount * totalMonths;
    const wealthGain = maturityAmount - totalInvestment;

    setSipResult({
      maturityAmount: Math.round(maturityAmount),
      totalInvestment,
      wealthGain: Math.round(wealthGain)
    });
  };

  const generatePortfolio = () => {
    setShowPortfolio(true);
  };

  const calculateEMI = () => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTenure * 12;
    
    console.log('EMI Calculation Debug:', {
      loanAmount,
      interestRate,
      loanTenure,
      monthlyRate,
      totalMonths
    });
    
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalAmount = emi * totalMonths;
    const totalInterest = totalAmount - loanAmount;
    
    console.log('EMI Results:', {
      emi,
      totalAmount,
      totalInterest,
      emiRounded: Math.round(emi),
      totalAmountRounded: Math.round(totalAmount),
      totalInterestRounded: Math.round(totalInterest)
    });

    setEmiResult({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest)
    });
  };

  const calculateTax = () => {
    const taxableIncome = Math.max(income - deductions, 0);
    let incomeTax = 0;

    // Tax slabs for FY 2023-24 (New Regime)
    if (taxableIncome <= 300000) {
      incomeTax = 0;
    } else if (taxableIncome <= 600000) {
      incomeTax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 900000) {
      incomeTax = 15000 + (taxableIncome - 600000) * 0.10;
    } else if (taxableIncome <= 1200000) {
      incomeTax = 45000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      incomeTax = 90000 + (taxableIncome - 1200000) * 0.20;
    } else {
      incomeTax = 150000 + (taxableIncome - 1500000) * 0.30;
    }

    const netIncome = income - incomeTax;
    setTaxResult({ taxableIncome, incomeTax, netIncome });
  };

  const calculateRetirement = () => {
    const yearsToRetirement = retirementAge - currentAge;
    const futureExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const corpusRequired = (futureExpenses * 12) / (retirementReturn / 100);
    
    const monthlyRate = retirementReturn / 100 / 12;
    const months = yearsToRetirement * 12;
    const monthlySip = corpusRequired * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);

    setRetirementResult({
      yearsToRetirement,
      futureExpenses,
      corpusRequired,
      monthlySip
    });
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Financial Calculators
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Make informed financial decisions with our comprehensive suite of calculators. 
            Plan your investments, loans, and retirement with precision.
          </p>
        </div>

        <Tabs defaultValue="sip" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="sip">SIP Calculator</TabsTrigger>
            <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
            <TabsTrigger value="tax">Tax Calculator</TabsTrigger>
            <TabsTrigger value="retirement">Retirement</TabsTrigger>
          </TabsList>

          <TabsContent value="sip">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>SIP Calculator</CardTitle>
                  <CardDescription>
                    Calculate your Systematic Investment Plan returns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Monthly Investment: {formatCurrency(monthlyAmount)}</Label>
                    <Slider
                      value={[monthlyAmount]}
                      onValueChange={([value]) => setMonthlyAmount(value)}
                      max={100000}
                      min={500}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹500</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Expected Return: {expectedReturn}% p.a.</Label>
                    <Slider
                      value={[expectedReturn]}
                      onValueChange={([value]) => setExpectedReturn(value)}
                      max={20}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1%</span>
                      <span>20%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time Period: {timePeriod} years</Label>
                    <Slider
                      value={[timePeriod]}
                      onValueChange={([value]) => setTimePeriod(value)}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 year</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={calculateSIP} className="flex-1">
                      Calculate SIP
                    </Button>
                    <Button onClick={generatePortfolio} variant="outline" className="flex-1">
                      Get Portfolio
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {sipResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>SIP Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Total Investment</p>
                           <p className="text-lg font-semibold">
                             {formatCurrency(sipResult.totalInvestment)}
                           </p>
                         </div>
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Wealth Gain</p>
                           <p className="text-lg font-semibold text-green-600">
                             {formatCurrency(sipResult.wealthGain)}
                           </p>
                         </div>
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Maturity Amount</p>
                           <p className="text-lg font-semibold text-primary">
                             {formatCurrency(sipResult.maturityAmount)}
                           </p>
                         </div>
                      </div>

                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Investment', value: sipResult.totalInvestment, fill: '#8884d8' },
                                { name: 'Returns', value: sipResult.wealthGain, fill: '#82ca9d' }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              <Cell fill="#8884d8" />
                              <Cell fill="#82ca9d" />
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {showPortfolio && (
              <div className="mt-8">
                <MutualFundPortfolio 
                  monthlyAmount={monthlyAmount} 
                  years={timePeriod}
                  expectedReturn={expectedReturn}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="emi">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>EMI Calculator</CardTitle>
                  <CardDescription>
                    Calculate your Equated Monthly Installment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Loan Amount: {formatCurrency(loanAmount)}</Label>
                    <Slider
                      value={[loanAmount]}
                      onValueChange={([value]) => setLoanAmount(value)}
                      max={10000000}
                      min={100000}
                      step={50000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹1L</span>
                      <span>₹1Cr</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Interest Rate: {interestRate}% p.a.</Label>
                    <Slider
                      value={[interestRate]}
                      onValueChange={([value]) => setInterestRate(value)}
                      max={20}
                      min={5}
                      step={0.25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>5%</span>
                      <span>20%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Loan Tenure: {loanTenure} years</Label>
                    <Slider
                      value={[loanTenure]}
                      onValueChange={([value]) => setLoanTenure(value)}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 year</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  <Button onClick={calculateEMI} className="w-full">
                    Calculate EMI
                  </Button>
                </CardContent>
              </Card>

              {emiResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>EMI Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Monthly EMI</p>
                           <p className="text-lg font-semibold text-primary">
                             {formatCurrency(emiResult.emi)}
                           </p>
                         </div>
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Total Interest</p>
                           <p className="text-lg font-semibold text-red-600">
                             {formatCurrency(emiResult.totalInterest)}
                           </p>
                         </div>
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Total Amount</p>
                           <p className="text-lg font-semibold">
                             {formatCurrency(emiResult.totalAmount)}
                           </p>
                         </div>
                      </div>

                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Principal', value: loanAmount, fill: '#8884d8' },
                                { name: 'Interest', value: emiResult.totalInterest, fill: '#ff8042' }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              <Cell fill="#8884d8" />
                              <Cell fill="#ff8042" />
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tax">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Calculator</CardTitle>
                  <CardDescription>
                    Calculate your income tax liability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="income">Annual Income (₹)</Label>
                     <Input
                       id="income"
                       type="text"
                       value={incomeInput}
                       onChange={(e) => {
                         const formatted = formatInputValue(e.target.value);
                         setIncomeInput(formatted);
                         setIncome(parseCommaNumber(formatted));
                       }}
                       placeholder="8,00,000"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="deductions">Deductions (₹)</Label>
                     <Input
                       id="deductions"
                       type="text"
                       value={deductionsInput}
                       onChange={(e) => {
                         const formatted = formatInputValue(e.target.value);
                         setDeductionsInput(formatted);
                         setDeductions(parseCommaNumber(formatted));
                       }}
                       placeholder="1,50,000"
                     />
                   </div>
                  <Button onClick={calculateTax} className="w-full">
                    Calculate Tax
                  </Button>
                </CardContent>
              </Card>

              {taxResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                       <div className="p-4 bg-secondary/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Taxable Income</p>
                         <p className="text-lg font-semibold">
                           {formatCurrency(taxResult.taxableIncome)}
                         </p>
                       </div>
                       <div className="p-4 bg-secondary/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Income Tax</p>
                         <p className="text-lg font-semibold text-red-600">
                           {formatCurrency(taxResult.incomeTax)}
                         </p>
                       </div>
                       <div className="p-4 bg-secondary/50 rounded-lg">
                         <p className="text-sm text-muted-foreground">Net Income</p>
                         <p className="text-lg font-semibold text-green-600">
                           {formatCurrency(taxResult.netIncome)}
                         </p>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="retirement">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Retirement Calculator</CardTitle>
                  <CardDescription>
                    Plan your retirement corpus and monthly savings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Current Age: {currentAge} years</Label>
                    <Slider
                      value={[currentAge]}
                      onValueChange={([value]) => setCurrentAge(value)}
                      max={60}
                      min={18}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>18 years</span>
                      <span>60 years</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Retirement Age: {retirementAge} years</Label>
                    <Slider
                      value={[retirementAge]}
                      onValueChange={([value]) => setRetirementAge(value)}
                      max={70}
                      min={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>50 years</span>
                      <span>70 years</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Monthly Expenses: {formatCurrency(monthlyExpenses)}</Label>
                    <Slider
                      value={[monthlyExpenses]}
                      onValueChange={([value]) => setMonthlyExpenses(value)}
                      max={200000}
                      min={10000}
                      step={5000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹10K</span>
                      <span>₹2L</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Inflation Rate: {inflationRate}% p.a.</Label>
                    <Slider
                      value={[inflationRate]}
                      onValueChange={([value]) => setInflationRate(value)}
                      max={10}
                      min={3}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>3%</span>
                      <span>10%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Expected Return: {retirementReturn}% p.a.</Label>
                    <Slider
                      value={[retirementReturn]}
                      onValueChange={([value]) => setRetirementReturn(value)}
                      max={15}
                      min={6}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>6%</span>
                      <span>15%</span>
                    </div>
                  </div>

                  <Button onClick={calculateRetirement} className="w-full">
                    Calculate Retirement Plan
                  </Button>
                </CardContent>
              </Card>

              {retirementResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Retirement Plan Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Years to Retirement</p>
                          <p className="text-lg font-semibold">
                            {retirementResult.yearsToRetirement} years
                          </p>
                        </div>
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Future Monthly Expenses</p>
                           <p className="text-lg font-semibold text-orange-600">
                             {formatCurrency(retirementResult.futureExpenses)}
                           </p>
                         </div>
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Corpus Required</p>
                           <p className="text-lg font-semibold text-primary">
                             {formatCurrency(retirementResult.corpusRequired)}
                           </p>
                         </div>
                         <div className="p-4 bg-secondary/50 rounded-lg">
                           <p className="text-sm text-muted-foreground">Monthly SIP Required</p>
                           <p className="text-lg font-semibold text-green-600">
                             {formatCurrency(retirementResult.monthlySip)}
                           </p>
                         </div>
                      </div>

                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <h4 className="font-semibold mb-2">Retirement Summary</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                           <li>• Start investing {formatCurrency(retirementResult.monthlySip)} monthly</li>
                           <li>• Build a corpus of {formatCurrency(retirementResult.corpusRequired)}</li>
                          <li>• Maintain {retirementReturn}% annual returns</li>
                          <li>• Account for {inflationRate}% inflation</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Calculators;