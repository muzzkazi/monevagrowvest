import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, PieChart, Home, GraduationCap, TrendingUp } from "lucide-react";

const Calculators = () => {
  const [sipData, setSipData] = useState({
    monthlyAmount: '',
    annualReturn: '',
    years: '',
    result: null as number | null
  });

  const [emiData, setEmiData] = useState({
    loanAmount: '',
    interestRate: '',
    tenure: '',
    result: null as number | null
  });

  const [taxData, setTaxData] = useState({
    annualIncome: '',
    deductions: '',
    result: null as number | null
  });

  const calculateSIP = () => {
    const P = parseFloat(sipData.monthlyAmount);
    const r = parseFloat(sipData.annualReturn) / 12 / 100;
    const n = parseInt(sipData.years) * 12;
    
    if (P && r && n) {
      const maturityAmount = P * (((1 + r) ** n - 1) / r) * (1 + r);
      setSipData({ ...sipData, result: Math.round(maturityAmount) });
    }
  };

  const calculateEMI = () => {
    const P = parseFloat(emiData.loanAmount);
    const r = parseFloat(emiData.interestRate) / 12 / 100;
    const n = parseInt(emiData.tenure) * 12;
    
    if (P && r && n) {
      const emi = (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
      setEmiData({ ...emiData, result: Math.round(emi) });
    }
  };

  const calculateTax = () => {
    const income = parseFloat(taxData.annualIncome);
    const deductions = parseFloat(taxData.deductions) || 0;
    const taxableIncome = income - deductions;
    
    let tax = 0;
    if (taxableIncome > 250000) {
      if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05;
      } else if (taxableIncome <= 1000000) {
        tax = 12500 + (taxableIncome - 500000) * 0.2;
      } else {
        tax = 112500 + (taxableIncome - 1000000) * 0.3;
      }
    }
    
    setTaxData({ ...taxData, result: Math.round(tax) });
  };

  return (
    <section id="calculators" className="py-20 bg-financial-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Financial <span className="text-financial-accent">Calculators</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Make informed financial decisions with our comprehensive suite of calculators. Plan your investments, loans, and taxes with precision.
          </p>
        </div>

        <Tabs defaultValue="sip" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-12">
            <TabsTrigger value="sip" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              SIP Calculator
            </TabsTrigger>
            <TabsTrigger value="emi" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              EMI Calculator
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Tax Calculator
            </TabsTrigger>
            <TabsTrigger value="retirement" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Retirement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sip">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-financial-accent" />
                    SIP Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="sipAmount">Monthly Investment Amount (₹)</Label>
                    <Input
                      id="sipAmount"
                      type="number"
                      placeholder="e.g., 5000"
                      value={sipData.monthlyAmount}
                      onChange={(e) => setSipData({ ...sipData, monthlyAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sipReturn">Expected Annual Return (%)</Label>
                    <Input
                      id="sipReturn"
                      type="number"
                      placeholder="e.g., 12"
                      value={sipData.annualReturn}
                      onChange={(e) => setSipData({ ...sipData, annualReturn: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sipYears">Investment Period (Years)</Label>
                    <Input
                      id="sipYears"
                      type="number"
                      placeholder="e.g., 10"
                      value={sipData.years}
                      onChange={(e) => setSipData({ ...sipData, years: e.target.value })}
                    />
                  </div>
                  <Button onClick={calculateSIP} className="w-full bg-financial-accent hover:bg-financial-accent/90">
                    Calculate SIP
                  </Button>
                  
                  {sipData.result && (
                    <Card className="bg-gradient-gold border-0">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-financial-secondary mb-2">Maturity Amount</p>
                        <p className="text-2xl font-bold text-financial-primary">₹{sipData.result.toLocaleString()}</p>
                        <p className="text-xs text-financial-secondary mt-2">
                          Total Investment: ₹{(parseFloat(sipData.monthlyAmount) * parseInt(sipData.years) * 12).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gradient-card border-0 shadow-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-financial-accent">How SIP Works</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Systematic Investment Plan (SIP) allows regular investing</li>
                      <li>• Benefit from rupee cost averaging</li>
                      <li>• Compounding returns over time</li>
                      <li>• Start with as little as ₹500 per month</li>
                      <li>• Flexible investment amounts and durations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-financial-accent">SIP Benefits</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Disciplined investing approach</li>
                      <li>• Reduces market volatility impact</li>
                      <li>• Power of compounding</li>
                      <li>• Tax benefits under Section 80C</li>
                      <li>• Professional fund management</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="emi">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-financial-accent" />
                    EMI Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="e.g., 1000000"
                      value={emiData.loanAmount}
                      onChange={(e) => setEmiData({ ...emiData, loanAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (% per annum)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      placeholder="e.g., 8.5"
                      value={emiData.interestRate}
                      onChange={(e) => setEmiData({ ...emiData, interestRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Loan Tenure (Years)</Label>
                    <Input
                      id="tenure"
                      type="number"
                      placeholder="e.g., 20"
                      value={emiData.tenure}
                      onChange={(e) => setEmiData({ ...emiData, tenure: e.target.value })}
                    />
                  </div>
                  <Button onClick={calculateEMI} className="w-full bg-financial-accent hover:bg-financial-accent/90">
                    Calculate EMI
                  </Button>
                  
                  {emiData.result && (
                    <Card className="bg-gradient-gold border-0">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-financial-secondary mb-2">Monthly EMI</p>
                        <p className="text-2xl font-bold text-financial-primary">₹{emiData.result.toLocaleString()}</p>
                        <p className="text-xs text-financial-secondary mt-2">
                          Total Amount: ₹{(emiData.result * parseInt(emiData.tenure) * 12).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gradient-card border-0 shadow-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-financial-accent">EMI Planning Tips</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Keep EMI under 40% of monthly income</li>
                      <li>• Compare interest rates across lenders</li>
                      <li>• Consider prepayment options</li>
                      <li>• Factor in processing fees and charges</li>
                      <li>• Choose appropriate loan tenure</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-financial-accent">Loan Types We Cover</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Home Loans</li>
                      <li>• Personal Loans</li>
                      <li>• Car Loans</li>
                      <li>• Business Loans</li>
                      <li>• Education Loans</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tax">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-financial-accent" />
                    Income Tax Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual Income (₹)</Label>
                    <Input
                      id="annualIncome"
                      type="number"
                      placeholder="e.g., 800000"
                      value={taxData.annualIncome}
                      onChange={(e) => setTaxData({ ...taxData, annualIncome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Deductions under 80C (₹)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      placeholder="e.g., 150000"
                      value={taxData.deductions}
                      onChange={(e) => setTaxData({ ...taxData, deductions: e.target.value })}
                    />
                  </div>
                  <Button onClick={calculateTax} className="w-full bg-financial-accent hover:bg-financial-accent/90">
                    Calculate Tax
                  </Button>
                  
                  {taxData.result !== null && (
                    <Card className="bg-gradient-gold border-0">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-financial-secondary mb-2">Annual Tax Liability</p>
                        <p className="text-2xl font-bold text-financial-primary">₹{taxData.result.toLocaleString()}</p>
                        <p className="text-xs text-financial-secondary mt-2">
                          Effective Tax Rate: {((taxData.result / parseFloat(taxData.annualIncome)) * 100).toFixed(2)}%
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gradient-card border-0 shadow-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-financial-accent">Tax Saving Options</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Section 80C: ELSS, PPF, NSC (₹1.5L)</li>
                      <li>• Section 80D: Health Insurance (₹25K)</li>
                      <li>• Section 24B: Home Loan Interest (₹2L)</li>
                      <li>• Section 80E: Education Loan Interest</li>
                      <li>• NPS under 80CCD(1B): ₹50,000</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 text-financial-accent">Current Tax Slabs (Old Regime)</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Up to ₹2.5L: 0%</li>
                      <li>• ₹2.5L - ₹5L: 5%</li>
                      <li>• ₹5L - ₹10L: 20%</li>
                      <li>• Above ₹10L: 30%</li>
                      <li>• Cess: 4% of total tax</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retirement">
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-financial-accent mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Retirement Calculator</h3>
              <p className="text-muted-foreground mb-8">Coming Soon! Plan your retirement with our comprehensive calculator.</p>
              <Button className="bg-financial-accent hover:bg-financial-accent/90">
                Get Notified
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Calculators;