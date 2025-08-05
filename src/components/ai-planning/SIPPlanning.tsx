import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  Calculator,
  IndianRupee,
  Target,
  Clock,
  Receipt,
  BookOpen,
  CheckCircle
} from "lucide-react";

interface SIPPlanningProps {
  onComplete: (data: any) => void;
}

interface Fund {
  name: string;
  category: string;
  allocation: number;
  expectedReturn: number;
  riskLevel: string;
  taxCategory?: 'ELSS' | 'Regular';
  lockIn?: string;
}

const SIPPlanning = ({ onComplete }: SIPPlanningProps) => {
  const [monthlyAmount, setMonthlyAmount] = useState<string>("");
  const [taxBenefit, setTaxBenefit] = useState<string>("");
  const [investmentPeriod, setInvestmentPeriod] = useState<string>("10");
  const [showRecommendations, setShowRecommendations] = useState(false);

  const getPortfolioRecommendation = (wantsTaxBenefit: boolean): Fund[] => {
    if (wantsTaxBenefit) {
      return [
        {
          name: "Axis Long Term Equity Fund",
          category: "ELSS",
          allocation: 40,
          expectedReturn: 12,
          riskLevel: "High",
          taxCategory: 'ELSS',
          lockIn: '3 years'
        },
        {
          name: "Mirae Asset Tax Saver Fund",
          category: "ELSS",
          allocation: 30,
          expectedReturn: 11.5,
          riskLevel: "High",
          taxCategory: 'ELSS',
          lockIn: '3 years'
        },
        {
          name: "HDFC Hybrid Equity Fund",
          category: "Hybrid",
          allocation: 20,
          expectedReturn: 10,
          riskLevel: "Moderate",
          taxCategory: 'Regular'
        },
        {
          name: "ICICI Prudential Liquid Fund",
          category: "Liquid",
          allocation: 10,
          expectedReturn: 6.5,
          riskLevel: "Low",
          taxCategory: 'Regular'
        }
      ];
    } else {
      return [
        {
          name: "SBI Blue Chip Fund",
          category: "Large Cap",
          allocation: 35,
          expectedReturn: 11,
          riskLevel: "Moderate",
          taxCategory: 'Regular'
        },
        {
          name: "Axis Midcap Fund",
          category: "Mid Cap",
          allocation: 25,
          expectedReturn: 13,
          riskLevel: "High",
          taxCategory: 'Regular'
        },
        {
          name: "HDFC Balanced Advantage Fund",
          category: "Hybrid",
          allocation: 25,
          expectedReturn: 9.5,
          riskLevel: "Moderate",
          taxCategory: 'Regular'
        },
        {
          name: "UTI Treasury Advantage Fund",
          category: "Debt",
          allocation: 15,
          expectedReturn: 7,
          riskLevel: "Low",
          taxCategory: 'Regular'
        }
      ];
    }
  };

  const calculateReturns = () => {
    const principal = parseFloat(monthlyAmount) || 0;
    const rate = (taxBenefit === 'yes' ? 11 : 10.5) / 100 / 12;
    const time = parseFloat(investmentPeriod) * 12;
    
    // SIP Future Value Formula
    const futureValue = principal * (((Math.pow(1 + rate, time) - 1) / rate) * (1 + rate));
    const totalInvestment = principal * time;
    const totalReturns = futureValue - totalInvestment;
    
    return {
      futureValue: Math.round(futureValue),
      totalInvestment: Math.round(totalInvestment),
      totalReturns: Math.round(totalReturns)
    };
  };

  const calculateTaxSavings = () => {
    const annualSIP = (parseFloat(monthlyAmount) || 0) * 12;
    const maxTaxSaving = Math.min(annualSIP, 150000); // Max 80C limit
    const taxSaved = maxTaxSaving * 0.3; // Assuming 30% tax bracket
    
    return {
      annualSIP,
      taxSavingAmount: maxTaxSaving,
      taxSaved: Math.round(taxSaved)
    };
  };

  const handlePlanSIP = () => {
    if (!monthlyAmount || !taxBenefit) return;
    setShowRecommendations(true);
  };

  const portfolio = getPortfolioRecommendation(taxBenefit === 'yes');
  const returns = calculateReturns();
  const taxSavings = calculateTaxSavings();

  if (showRecommendations) {
    return (
      <div className="space-y-6">
        {/* Portfolio Summary */}
        <Card className="bg-gradient-to-r from-financial-accent/10 to-financial-gold/10 border-financial-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-financial-accent" />
              Your Personalized SIP Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Monthly SIP</div>
                <div className="text-2xl font-bold text-financial-accent">₹{monthlyAmount}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Investment Period</div>
                <div className="text-2xl font-bold">{investmentPeriod} Years</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Tax Benefits</div>
                <div className="text-2xl font-bold text-green-600">
                  {taxBenefit === 'yes' ? '✓ Enabled' : '✗ Disabled'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="projections">Growth</TabsTrigger>
            <TabsTrigger value="tax">Tax Benefits</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Portfolio Allocation */}
          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Recommended Fund Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.map((fund, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{fund.name}</h4>
                          {fund.taxCategory === 'ELSS' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Tax Saver
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{fund.category}</span>
                          <span>Risk: {fund.riskLevel}</span>
                          <span>Expected: {fund.expectedReturn}%</span>
                          {fund.lockIn && <span>Lock-in: {fund.lockIn}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{fund.allocation}%</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{Math.round((parseFloat(monthlyAmount) * fund.allocation) / 100)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Growth Projections */}
          <TabsContent value="projections" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Total Investment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{returns.totalInvestment.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ₹{monthlyAmount} × {investmentPeriod} years
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Expected Returns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{returns.totalReturns.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Wealth gain over {investmentPeriod} years
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Portfolio Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-financial-accent">
                    ₹{returns.futureValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total corpus in {investmentPeriod} years
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Investment Growth Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                {[5, 10, 15, 20].map((year) => {
                  if (year > parseFloat(investmentPeriod)) return null;
                  const yearlyRate = (taxBenefit === 'yes' ? 11 : 10.5) / 100 / 12;
                  const yearlyTime = year * 12;
                    const yearlyValue = parseFloat(monthlyAmount) * (((Math.pow(1 + yearlyRate, yearlyTime) - 1) / yearlyRate) * (1 + yearlyRate));
                    
                    return (
                      <div key={year} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Year {year}</span>
                        </div>
                        <div className="font-semibold">₹{Math.round(yearlyValue).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Benefits */}
          <TabsContent value="tax" className="space-y-4">
            {taxBenefit === 'yes' ? (
              <>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Receipt className="h-5 w-5" />
                      Tax Optimization Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-green-950/40 rounded-lg border">
                        <div className="text-sm text-muted-foreground">Annual Tax Savings</div>
                        <div className="text-2xl font-bold text-green-600">₹{taxSavings.taxSaved.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Based on 30% tax bracket
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-green-950/40 rounded-lg border">
                        <div className="text-sm text-muted-foreground">Section 80C Benefit</div>
                        <div className="text-2xl font-bold">₹{Math.min(taxSavings.annualSIP, 150000).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Tax deduction under 80C
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        How Tax Benefits Work
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>ELSS Investment:</strong> Your investment in ELSS funds qualifies for tax deduction under Section 80C of the Income Tax Act.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>Tax Deduction:</strong> You can claim up to ₹1,50,000 annually as deduction from your taxable income.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>Lock-in Period:</strong> ELSS has a 3-year lock-in period, making it the shortest among all 80C investments.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>Long-term Capital Gains:</strong> After 3 years, gains up to ₹1 lakh are tax-free. Above ₹1 lakh, 10% LTCG tax applies.
                          </div>
                        </div>
                      </div>
                    </div>

                    {taxSavings.annualSIP > 150000 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="text-sm text-amber-800 dark:text-amber-300">
                          <strong>Note:</strong> Your annual SIP of ₹{taxSavings.annualSIP.toLocaleString()} exceeds the 80C limit. 
                          Only ₹1,50,000 will qualify for tax benefits.
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Tax Implications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Regular Mutual Fund Taxation
                    </h4>
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                      <div>• <strong>Equity Funds:</strong> Long-term gains (&gt;1 year) up to ₹1 lakh tax-free, 10% above that</div>
                      <div>• <strong>Debt Funds:</strong> Long-term gains (&gt;3 years) taxed as per your income slab</div>
                      <div>• <strong>Short-term gains:</strong> Added to your income and taxed as per slab</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      Want to Save Tax?
                    </h4>
                    <div className="text-sm text-green-700 dark:text-green-400 mb-3">
                      Consider adding ELSS funds to your portfolio for tax benefits under Section 80C.
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setTaxBenefit('yes');
                        setShowRecommendations(false);
                      }}
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      Include Tax-Saving Funds
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Key Insights */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Portfolio Risk Level</span>
                    <Badge variant={taxBenefit === 'yes' ? 'destructive' : 'secondary'}>
                      {taxBenefit === 'yes' ? 'Moderate-High' : 'Moderate'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {taxBenefit === 'yes' 
                      ? 'Higher equity allocation due to ELSS funds, suitable for long-term wealth creation.'
                      : 'Balanced mix of equity and debt for steady growth with moderate risk.'
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Investment Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Recommended Period</span>
                    <span className="font-semibold">{investmentPeriod}+ years</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {taxBenefit === 'yes' 
                      ? 'ELSS has 3-year lock-in, but 10+ years recommended for optimal growth.'
                      : 'Long-term investment helps average out market volatility.'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <strong>Start Early:</strong> The power of compounding works best over longer periods.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <strong>Stay Consistent:</strong> Regular SIP helps you buy more units when markets are down.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <strong>Review Annually:</strong> Rebalance your portfolio based on performance and goals.
                    </div>
                  </div>
                  {taxBenefit === 'yes' && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <strong>Tax Planning:</strong> Invest in ELSS by December to claim tax benefits for the financial year.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowRecommendations(false)}
          >
            Modify Plan
          </Button>
          <Button 
            onClick={() => onComplete({ monthlyAmount, taxBenefit, portfolio, returns })}
            className="bg-financial-accent hover:bg-financial-accent/90"
          >
            Start SIP Investment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-financial-accent" />
            Plan Your Monthly SIP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="monthlyAmount">Monthly SIP Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="monthlyAmount"
                  type="number"
                  placeholder="5000"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Minimum ₹500 per fund
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentPeriod">Investment Period (Years)</Label>
              <Input
                id="investmentPeriod"
                type="number"
                placeholder="10"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Recommended: 10+ years for optimal growth
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Do you want to avail tax benefits under Section 80C?</Label>
            <RadioGroup value={taxBenefit} onValueChange={setTaxBenefit}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="yes" id="tax-yes" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="tax-yes" className="font-medium cursor-pointer">
                      Yes, I want tax benefits
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Include ELSS funds for tax deduction up to ₹1,50,000 under Section 80C.
                      <br />
                      <span className="text-green-600 font-medium">
                        Save up to ₹46,800 in taxes annually (30% tax bracket)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="no" id="tax-no" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="tax-no" className="font-medium cursor-pointer">
                      No, focus on diversified portfolio
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Get a balanced mix of large-cap, mid-cap, and debt funds without lock-in restrictions.
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {monthlyAmount && taxBenefit && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Quick Preview:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Monthly Investment:</span> ₹{monthlyAmount}
                </div>
                <div>
                  <span className="font-medium">Annual Investment:</span> ₹{(parseFloat(monthlyAmount) * 12).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Tax Benefits:</span> {taxBenefit === 'yes' ? 'Enabled' : 'Disabled'}
                </div>
                <div>
                  <span className="font-medium">Investment Period:</span> {investmentPeriod} years
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handlePlanSIP}
            disabled={!monthlyAmount || !taxBenefit}
            className="w-full bg-financial-accent hover:bg-financial-accent/90"
          >
            Generate SIP Portfolio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SIPPlanning;