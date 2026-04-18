import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import MutualFundPortfolio from "./MutualFundPortfolio";
import { formatCurrency, formatNumber, parseCommaNumber, formatInputValue } from "@/lib/utils";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { computeTax, defaultInputs, type IncomeType, type TaxInputs } from "@/lib/taxEngine";
import { ArrowRight, Sparkles } from "lucide-react";

const Calculators = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'sip');

  useEffect(() => {
    if (tabFromUrl && ['sip', 'emi', 'tax', 'retirement'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
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

  // Tax Calculator State (FY 2024-25, powered by taxEngine)
  const [taxIncome, setTaxIncome] = useState(800000);
  const [taxIncomeInput, setTaxIncomeInput] = useState("8,00,000");
  const [taxIncomeType, setTaxIncomeType] = useState<IncomeType>("salaried");
  const [tax80C, setTax80C] = useState(0);
  const [tax80CInput, setTax80CInput] = useState("0");
  const [tax80D, setTax80D] = useState(25000);
  const [tax80DInput, setTax80DInput] = useState("25,000");
  const [taxHomeLoan, setTaxHomeLoan] = useState(0);
  const [taxHomeLoanInput, setTaxHomeLoanInput] = useState("0");
  const [taxNPS, setTaxNPS] = useState(0);
  const [taxNPSInput, setTaxNPSInput] = useState("0");
  const [taxResult, setTaxResult] = useState<ReturnType<typeof computeTax> | null>(null);

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
    const defaults = defaultInputs(taxIncome);
    const inputs: TaxInputs = {
      totalIncome: taxIncome,
      incomeType: taxIncomeType,
      basicSalary: defaults.basicSalary ?? 0,
      hraReceived: 0,
      rentPerMonth: 0,
      cityType: "metro",
      interestIncome: 0,
      rentalIncome: 0,
      businessIncome: 0,
      shortTermGains: 0,
      longTermGains: 0,
      invested80C: tax80C,
      healthInsuranceSelf: tax80D,
      healthInsuranceParents: 0,
      parentsSenior: false,
      homeLoanInterest: taxHomeLoan,
      npsAmount: taxNPS,
    };
    setTaxResult(computeTax(inputs));
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
    <section className="py-20 min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-financial-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-financial-accent/3 to-transparent rounded-full" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-financial-accent bg-clip-text">
            Financial Calculators
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Make informed financial decisions with our comprehensive suite of calculators. 
            Plan your investments, loans, and retirement with precision.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-10 bg-muted/50 backdrop-blur-sm p-1.5 rounded-xl">
            <TabsTrigger value="sip" className="data-[state=active]:bg-financial-accent data-[state=active]:text-white rounded-lg transition-all">SIP Calculator</TabsTrigger>
            <TabsTrigger value="emi" className="data-[state=active]:bg-financial-accent data-[state=active]:text-white rounded-lg transition-all">EMI Calculator</TabsTrigger>
            <TabsTrigger value="tax" className="data-[state=active]:bg-financial-accent data-[state=active]:text-white rounded-lg transition-all">Tax Calculator</TabsTrigger>
            <TabsTrigger value="retirement" className="data-[state=active]:bg-financial-accent data-[state=active]:text-white rounded-lg transition-all">Retirement</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "sip" && (
              <motion.div
                key="sip"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className={`grid gap-8 w-full max-w-5xl mx-auto ${sipResult ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-xl'}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl h-full">
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
                  </motion.div>

                  {sipResult && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl h-full">
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
                    </motion.div>
                  )}
                </div>

                {showPortfolio && (
                  <motion.div 
                    className="mt-8 w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <MutualFundPortfolio 
                      monthlyAmount={monthlyAmount} 
                      years={timePeriod}
                      expectedReturn={expectedReturn}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "emi" && (
              <motion.div
                key="emi"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className={`grid gap-8 w-full max-w-5xl mx-auto ${emiResult ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-xl'}`}>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl h-full">
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
                  </motion.div>

                  {emiResult && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl h-full">
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
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "tax" && (
              <motion.div
                key="tax"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className={`grid gap-8 w-full max-w-6xl mx-auto ${taxResult ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-xl'}`}>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <CardTitle>Tax Calculator</CardTitle>
                            <CardDescription>
                              Quick Old vs New regime comparison
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-financial-accent/10 text-financial-accent border-financial-accent/20">
                            FY 2024-25
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Income Type</Label>
                          <RadioGroup
                            value={taxIncomeType}
                            onValueChange={(v) => setTaxIncomeType(v as IncomeType)}
                            className="grid grid-cols-2 gap-2"
                          >
                            <Label
                              htmlFor="it-salaried"
                              className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-colors ${taxIncomeType === 'salaried' ? 'border-financial-accent bg-financial-accent/5' : 'border-border'}`}
                            >
                              <RadioGroupItem value="salaried" id="it-salaried" />
                              <span className="text-sm">Salaried</span>
                            </Label>
                            <Label
                              htmlFor="it-self"
                              className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-colors ${taxIncomeType === 'self-employed' ? 'border-financial-accent bg-financial-accent/5' : 'border-border'}`}
                            >
                              <RadioGroupItem value="self-employed" id="it-self" />
                              <span className="text-sm">Self-employed</span>
                            </Label>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tax-income">Annual Income (₹)</Label>
                          <Input
                            id="tax-income"
                            type="text"
                            value={taxIncomeInput}
                            onChange={(e) => {
                              const formatted = formatInputValue(e.target.value);
                              setTaxIncomeInput(formatted);
                              setTaxIncome(parseCommaNumber(formatted));
                            }}
                            placeholder="8,00,000"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tax-80c">80C Invested (₹)</Label>
                            <Input
                              id="tax-80c"
                              type="text"
                              value={tax80CInput}
                              onChange={(e) => {
                                const formatted = formatInputValue(e.target.value);
                                setTax80CInput(formatted);
                                setTax80C(parseCommaNumber(formatted));
                              }}
                              placeholder="1,50,000"
                            />
                            <p className="text-xs text-muted-foreground">Max ₹1.5L</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tax-80d">80D Health Ins. (₹)</Label>
                            <Input
                              id="tax-80d"
                              type="text"
                              value={tax80DInput}
                              onChange={(e) => {
                                const formatted = formatInputValue(e.target.value);
                                setTax80DInput(formatted);
                                setTax80D(parseCommaNumber(formatted));
                              }}
                              placeholder="25,000"
                            />
                            <p className="text-xs text-muted-foreground">Max ₹25K</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tax-home">Home Loan Interest (₹)</Label>
                            <Input
                              id="tax-home"
                              type="text"
                              value={taxHomeLoanInput}
                              onChange={(e) => {
                                const formatted = formatInputValue(e.target.value);
                                setTaxHomeLoanInput(formatted);
                                setTaxHomeLoan(parseCommaNumber(formatted));
                              }}
                              placeholder="2,00,000"
                            />
                            <p className="text-xs text-muted-foreground">Max ₹2L</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tax-nps">NPS 80CCD(1B) (₹)</Label>
                            <Input
                              id="tax-nps"
                              type="text"
                              value={taxNPSInput}
                              onChange={(e) => {
                                const formatted = formatInputValue(e.target.value);
                                setTaxNPSInput(formatted);
                                setTaxNPS(parseCommaNumber(formatted));
                              }}
                              placeholder="50,000"
                            />
                            <p className="text-xs text-muted-foreground">Max ₹50K</p>
                          </div>
                        </div>

                        <Button onClick={calculateTax} className="w-full">
                          Compare Old vs New Regime
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {taxResult && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-4">
                      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Tax Results</CardTitle>
                            {taxResult.savings > 0 && (
                              <Badge className="bg-financial-success/15 text-financial-success border border-financial-success/30 hover:bg-financial-success/20">
                                Save {formatCurrency(taxResult.savings)}
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Recommended: <span className="font-semibold text-foreground">{taxResult.recommended === 'old' ? 'Old' : 'New'} Regime</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {(["old", "new"] as const).map((regime) => {
                            const b = regime === "old" ? taxResult.oldBreakdown : taxResult.newBreakdown;
                            const isRec = taxResult.recommended === regime;
                            const totalTax = regime === "old" ? taxResult.oldTax : taxResult.newTax;
                            const effective = b.grossIncome > 0 ? (totalTax / b.grossIncome) * 100 : 0;
                            return (
                              <div
                                key={regime}
                                className={`rounded-lg border p-4 transition-all ${isRec ? 'border-financial-accent bg-financial-accent/5 ring-1 ring-financial-accent/30' : 'border-border bg-secondary/30'}`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold capitalize">{regime} Regime</span>
                                    {isRec && (
                                      <Badge className="bg-financial-accent text-white text-xs">Best</Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{effective.toFixed(2)}% effective</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Taxable Income</p>
                                    <p className="font-semibold">{formatCurrency(b.taxableIncome)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total Tax</p>
                                    <p className="font-semibold text-financial-danger">{formatCurrency(totalTax)}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>

                      <Link to="/tax-planning" className="block group">
                        <Card className="bg-gradient-to-br from-financial-accent/10 to-financial-accent/5 border-financial-accent/30 hover:border-financial-accent/60 transition-all">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-financial-accent/15 flex items-center justify-center shrink-0">
                              <Sparkles className="h-5 w-5 text-financial-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">Need HRA, capital gains & SIP suggestions?</p>
                              <p className="text-xs text-muted-foreground">Open the full Tax Planning wizard</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-financial-accent group-hover:translate-x-1 transition-transform shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "retirement" && (
              <motion.div
                key="retirement"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className={`grid gap-8 w-full max-w-5xl mx-auto ${retirementResult ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-xl'}`}>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl h-full">
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
                  </motion.div>

                  {retirementResult && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl h-full">
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
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  );
};

export default Calculators;