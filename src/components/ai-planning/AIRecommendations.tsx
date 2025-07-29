import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  PieChart, 
  Target, 
  DollarSign, 
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Download,
  BookOpen,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContactFormModal from "../ContactFormModal";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface FinancialGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  timeHorizon: number;
  priority: number;
  currentSavings: number;
}

interface AIRecommendationsProps {
  goals: FinancialGoal[];
  riskProfile: string;
  onComplete: () => void;
}

interface AssetAllocation {
  category: string;
  percentage: number;
  amount: number;
  color: string;
  instruments: string[];
}

interface Recommendation {
  id: string;
  name: string;
  type: string;
  allocation: number;
  expectedReturn: string;
  riskLevel: "Low" | "Medium" | "High";
  reason: string;
  sipAmount?: number;
}

const AIRecommendations = ({ goals, riskProfile, onComplete }: AIRecommendationsProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [actionType, setActionType] = useState<"download" | "implement">("download");

  // Calculate total investment needed from goals
  const totalInvestmentNeeded = goals.reduce((total, goal) => {
    return total + (goal.targetAmount - goal.currentSavings);
  }, 0);

  // Calculate total monthly SIP required
  const totalMonthlySIP = goals.reduce((total, goal) => {
    const monthlyRequired = (goal.targetAmount - goal.currentSavings) / (goal.timeHorizon * 12);
    return total + monthlyRequired;
  }, 0);

  // Dynamic asset allocation based on risk profile
  const getRiskBasedAllocation = () => {
    const allocations = {
      Conservative: [
        { category: "Short Duration Debt Funds", percentage: 40, color: "#10b981", instruments: ["HDFC Short Term Debt Fund", "ICICI Pru Short Term Fund", "SBI Short Term Debt Fund"] },
        { category: "Corporate Bond Funds", percentage: 15, color: "#059669", instruments: ["HDFC Corporate Bond Fund", "ICICI Pru Corporate Bond Fund", "Aditya Birla Corporate Bond Fund"] },
        { category: "Conservative Hybrid Funds", percentage: 15, color: "#6366f1", instruments: ["HDFC Balanced Advantage Fund", "ICICI Pru Balanced Advantage Fund", "SBI Conservative Hybrid Fund"] },
        { category: "Arbitrage Funds", percentage: 10, color: "#8b5cf6", instruments: ["ICICI Pru Arbitrage Fund", "Kotak Equity Arbitrage Fund", "Nippon India Arbitrage Fund"] },
        { category: "Large Cap Equity Funds", percentage: 10, color: "#3b82f6", instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"] },
        { category: "Gold ETF", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold ETF", "SBI Gold ETF", "Nippon Gold BeES"] }
      ],
      Moderate: [
        { category: "Balanced Advantage Funds", percentage: 40, color: "#6366f1", instruments: ["HDFC Balanced Advantage Fund", "ICICI Pru Balanced Advantage Fund", "SBI Dynamic Asset Allocation Fund"] },
        { category: "Large Cap Equity Funds", percentage: 30, color: "#3b82f6", instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"] },
        { category: "Short Duration Debt Funds", percentage: 20, color: "#10b981", instruments: ["HDFC Short Term Debt Fund", "ICICI Pru Short Term Fund", "SBI Short Term Debt Fund"] },
        { category: "Gold Funds", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold Fund", "SBI Gold Fund", "Nippon India Gold Savings Fund"] }
      ],
      Balanced: [
        { category: "Flexi Cap Funds", percentage: 40, color: "#8b5cf6", instruments: ["Parag Parikh Flexi Cap Fund", "HDFC Flexi Cap Fund", "ICICI Pru Flexi Cap Fund"] },
        { category: "Large & Mid Cap Funds", percentage: 30, color: "#3b82f6", instruments: ["HDFC Large and Mid Cap Fund", "ICICI Pru Large & Mid Cap Fund", "SBI Large & Midcap Fund"] },
        { category: "Hybrid Equity Funds", percentage: 20, color: "#6366f1", instruments: ["SBI Equity Hybrid Fund", "HDFC Hybrid Equity Fund", "ICICI Pru Equity & Debt Fund"] },
        { category: "Gold Funds", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold Fund", "SBI Gold Fund", "Nippon India Gold Savings Fund"] }
      ],
      Aggressive: [
        { category: "Mid Cap Funds", percentage: 40, color: "#8b5cf6", instruments: ["Kotak Emerging Equity Fund", "HDFC Mid-Cap Opportunities Fund", "DSP Midcap Fund"] },
        { category: "Small Cap Funds", percentage: 30, color: "#ef4444", instruments: ["Axis Small Cap Fund", "SBI Small Cap Fund", "HDFC Small Cap Fund"] },
        { category: "Flexi Cap Funds", percentage: 20, color: "#6366f1", instruments: ["Parag Parikh Flexi Cap Fund", "HDFC Flexi Cap Fund", "ICICI Pru Flexi Cap Fund"] },
        { category: "Large Cap Funds", percentage: 10, color: "#3b82f6", instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"] }
      ]
    };
    return allocations[riskProfile as keyof typeof allocations] || allocations.Moderate;
  };

  const assetAllocation = getRiskBasedAllocation();
  
  // Calculate amounts for each allocation
  const assetAllocationWithAmounts: AssetAllocation[] = assetAllocation.map(asset => ({
    ...asset,
    amount: Math.round((totalInvestmentNeeded * asset.percentage) / 100)
  }));

  // Generate investment projection data
  const generateProjectionData = () => {
    const maxTimeHorizon = Math.max(...goals.map(g => g.timeHorizon));
    const data = [];
    
    // Expected annual return based on risk profile
    const expectedReturns = {
      Conservative: 8.5,
      Moderate: 11,
      Balanced: 13,
      Aggressive: 15
    };
    
    const annualReturn = expectedReturns[riskProfile as keyof typeof expectedReturns] || 11;
    const monthlyReturn = annualReturn / 100 / 12;
    
    for (let month = 0; month <= maxTimeHorizon * 12; month++) {
      const year = month / 12;
      const totalInvested = totalMonthlySIP * month;
      
      // Calculate portfolio value using compound interest formula for SIP
      let portfolioValue = 0;
      if (month > 0) {
        portfolioValue = totalMonthlySIP * (((Math.pow(1 + monthlyReturn, month) - 1) / monthlyReturn) * (1 + monthlyReturn));
      }
      
      data.push({
        month,
        year: parseFloat(year.toFixed(1)),
        totalInvested: Math.round(totalInvested),
        portfolioValue: Math.round(portfolioValue),
        returns: Math.round(portfolioValue - totalInvested)
      });
    }
    
    return data;
  };

  const projectionData = generateProjectionData();

  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(1)}L`;
  };

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const recommendations: Recommendation[] = [
    {
      id: "1",
      name: "HDFC Top 100 Fund",
      type: "Large Cap Equity",
      allocation: 15,
      expectedReturn: "12-14%",
      riskLevel: "Medium",
      reason: "Consistent performer with strong blue-chip holdings. Suitable for your moderate risk profile.",
      sipAmount: 5000
    },
    {
      id: "2",
      name: "Kotak Emerging Equity Fund",
      type: "Mid Cap Equity",
      allocation: 12,
      expectedReturn: "15-18%",
      riskLevel: "High",
      reason: "High growth potential through mid-cap exposure. Aligns with your long-term goals.",
      sipAmount: 4000
    },
    {
      id: "3",
      name: "HDFC Corporate Bond Fund",
      type: "Debt Fund",
      allocation: 20,
      expectedReturn: "7-9%",
      riskLevel: "Low",
      reason: "Provides stability and regular income. Balances your portfolio risk.",
      sipAmount: 6000
    },
    {
      id: "4",
      name: "Motilal NASDAQ 100 Fund",
      type: "International Equity",
      allocation: 8,
      expectedReturn: "10-12%",
      riskLevel: "Medium",
      reason: "Geographic diversification with exposure to US tech giants.",
      sipAmount: 2500
    }
  ];

  useEffect(() => {
    // Simulate AI generation process
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          setIsGenerating(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleImplementPlan = () => {
    setActionType("implement");
    setShowContactForm(true);
  };

  const handleDownloadReport = () => {
    setActionType("download");
    setShowContactForm(true);
  };

  if (isGenerating) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <Brain className="h-16 w-16 text-financial-accent animate-pulse" />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">AI is analyzing your profile...</h3>
          <p className="text-muted-foreground">
            Our advanced algorithms are creating a personalized investment strategy based on your goals and risk profile.
          </p>
          <div className="space-y-2">
            <Progress value={generationProgress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground">{generationProgress}% Complete</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrencyInCard = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Goal Summary Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-financial-accent" />
            Investment Summary Based on Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-financial-accent">{formatCurrencyInCard(totalInvestmentNeeded)}</h4>
              <p className="text-sm text-muted-foreground">Total Investment Needed</p>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold text-financial-accent">{formatCurrencyInCard(totalMonthlySIP)}</h4>
              <p className="text-sm text-muted-foreground">Monthly SIP Required</p>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold text-financial-accent">{goals.length}</h4>
              <p className="text-sm text-muted-foreground">Financial Goals</p>
            </div>
          </div>
          
          {/* Individual Goal Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Goal-wise SIP Breakdown:</h4>
            {goals.map((goal) => {
              const monthlyRequired = (goal.targetAmount - goal.currentSavings) / (goal.timeHorizon * 12);
              return (
                <div key={goal.id} className="flex justify-between items-center p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                  <div>
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({goal.timeHorizon} years)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrencyInCard(monthlyRequired)}/month</div>
                    <div className="text-xs text-muted-foreground">Target: {formatCurrencyInCard(goal.targetAmount)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Your AI-Generated Investment Strategy</h3>
          <p className="text-muted-foreground">
            Based on your {goals.length} goals and {riskProfile.toLowerCase()} risk profile, here's your personalized investment roadmap.
          </p>
        </div>
      </div>

      <Tabs defaultValue="allocation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="projection">Growth Projection</TabsTrigger>
          <TabsTrigger value="recommendations">Fund Selection</TabsTrigger>
          <TabsTrigger value="timeline">Investment Timeline</TabsTrigger>
        </TabsList>

        {/* Asset Allocation Tab */}
        <TabsContent value="allocation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-financial-accent" />
                Recommended Asset Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assetAllocationWithAmounts.map((asset) => (
                  <div key={asset.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{asset.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {asset.percentage}% ({formatCurrencyInCard(asset.amount)})
                      </span>
                    </div>
                    <Progress value={asset.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Suggested: {asset.instruments.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Why This Allocation?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Balanced approach aligning with your moderate risk profile</li>
                    <li>• Diversification across asset classes to reduce risk</li>
                    <li>• Long-term growth potential while maintaining stability</li>
                    <li>• Tax-efficient structure for your income bracket</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fund Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rec.name}</h4>
                      <Badge variant={rec.riskLevel === "Low" ? "secondary" : rec.riskLevel === "Medium" ? "default" : "destructive"}>
                        {rec.riskLevel} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.type}</p>
                    <p className="text-sm">{rec.reason}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span><strong>Allocation:</strong> {rec.allocation}%</span>
                      <span><strong>Expected Return:</strong> {rec.expectedReturn}</span>
                      {rec.sipAmount && <span><strong>Monthly SIP:</strong> {formatCurrencyInCard(rec.sipAmount)}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Growth Projection Tab */}
        <TabsContent value="projection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-financial-accent" />
                Investment Growth Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatTooltipCurrency(value), name]}
                      labelFormatter={(value) => `Year ${value}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalInvested" 
                      stroke="#10b981" 
                      name="Total Invested"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="portfolioValue" 
                      stroke="#3b82f6" 
                      name="Expected Portfolio Value"
                      strokeWidth={3}
                      dot={false}
                    />
                    {goals.map((goal, index) => (
                      <ReferenceLine 
                        key={goal.id}
                        x={goal.timeHorizon} 
                        stroke="#f59e0b" 
                        strokeDasharray="5 5"
                        label={{ value: goal.name, position: "top" }}
                      />
                    ))}
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {formatTooltipCurrency(projectionData[projectionData.length - 1]?.totalInvested || 0)}
                  </h4>
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {formatTooltipCurrency(projectionData[projectionData.length - 1]?.portfolioValue || 0)}
                  </h4>
                  <p className="text-sm text-muted-foreground">Expected Portfolio Value</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    {formatTooltipCurrency(projectionData[projectionData.length - 1]?.returns || 0)}
                  </h4>
                  <p className="text-sm text-muted-foreground">Expected Returns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Key Insights from Your Projection</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your investments are projected to grow at {riskProfile === 'Conservative' ? '8.5%' : riskProfile === 'Moderate' ? '11%' : riskProfile === 'Balanced' ? '13%' : '15%'} annually</li>
                    <li>• The power of compounding becomes evident after 3-5 years</li>
                    <li>• Consistent SIP investing helps average out market volatility</li>
                    <li>• Regular review and rebalancing will help optimize returns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-financial-accent" />
                Investment Timeline & Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="bg-financial-accent/10 p-2 rounded">
                      <Target className="h-4 w-4 text-financial-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Phase 1 (Months 1-6): Foundation Building</h4>
                      <p className="text-sm text-muted-foreground">• Start SIP investments • Build emergency fund (6 months expenses) • Complete KYC and account setup • Establish investment discipline</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="bg-financial-accent/10 p-2 rounded">
                      <BarChart3 className="h-4 w-4 text-financial-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Phase 2 (Year 1-3): Growth & Monitoring</h4>
                      <p className="text-sm text-muted-foreground">• Monitor portfolio performance monthly • Rebalance quarterly if needed • Increase SIP amount by 10-15% annually • Review and adjust goals</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="bg-financial-accent/10 p-2 rounded">
                      <TrendingUp className="h-4 w-4 text-financial-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Phase 3 (Year 3+): Optimization & Wealth Building</h4>
                      <p className="text-sm text-muted-foreground">• Optimize for tax efficiency • Consider advanced investment options • Review and update financial goals • Plan for wealth preservation strategies</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Milestones to Track:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>6 Months:</strong> Emergency fund fully established</li>
                    <li>• <strong>1 Year:</strong> All SIPs running smoothly, first portfolio review</li>
                    <li>• <strong>3 Years:</strong> Significant corpus build-up, goal reassessment</li>
                    <li>• <strong>5 Years:</strong> Mid-term goals achievement, strategy refinement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleDownloadReport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Detailed Report
        </Button>
        <Button
          onClick={handleImplementPlan}
          size="lg"
          className="bg-financial-accent hover:bg-financial-accent/90 flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Implement This Strategy
        </Button>
      </div>

      {/* Educational Note */}
      <Card className="bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-amber-600 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">Next Steps</h4>
              <p className="text-sm text-muted-foreground">
                This AI-generated strategy is a starting point. Our financial advisors will review and customize 
                this plan based on your specific circumstances, current market conditions, and regulatory requirements 
                before implementation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form Modal */}
      <ContactFormModal 
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        actionType={actionType}
      />
    </div>
  );
};

export default AIRecommendations;