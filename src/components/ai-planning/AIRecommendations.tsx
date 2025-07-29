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
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIRecommendationsProps {
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

const AIRecommendations = ({ onComplete }: AIRecommendationsProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Simulated AI recommendations data
  const assetAllocation: AssetAllocation[] = [
    {
      category: "Large Cap Equity",
      percentage: 35,
      amount: 350000,
      color: "#3b82f6",
      instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"]
    },
    {
      category: "Mid & Small Cap",
      percentage: 25,
      amount: 250000,
      color: "#8b5cf6",
      instruments: ["Kotak Emerging Equity", "DSP Midcap Fund", "Axis Small Cap Fund"]
    },
    {
      category: "Debt Funds",
      percentage: 25,
      amount: 250000,
      color: "#10b981",
      instruments: ["HDFC Corporate Bond", "ICICI Pru Medium Term", "SBI Corporate Bond"]
    },
    {
      category: "International",
      percentage: 10,
      amount: 100000,
      color: "#f59e0b",
      instruments: ["Motilal NASDAQ 100", "HDFC Sensex ETF", "Nippon India US Equity"]
    },
    {
      category: "Gold ETF",
      percentage: 5,
      amount: 50000,
      color: "#fbbf24",
      instruments: ["HDFC Gold ETF", "SBI Gold ETF", "Nippon Gold BeES"]
    }
  ];

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
    toast({
      title: "Investment Plan Ready",
      description: "Your personalized investment strategy has been prepared. Contact us to start investing."
    });
    onComplete();
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your detailed investment report has been downloaded."
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Your AI-Generated Investment Strategy</h3>
          <p className="text-muted-foreground">
            Based on your goals and risk profile, here's your personalized investment roadmap.
          </p>
        </div>
      </div>

      <Tabs defaultValue="allocation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
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
                {assetAllocation.map((asset) => (
                  <div key={asset.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{asset.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {asset.percentage}% (₹{asset.amount.toLocaleString()})
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
                      {rec.sipAmount && <span><strong>Monthly SIP:</strong> ₹{rec.sipAmount.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                      <h4 className="font-semibold">Month 1-3: Foundation</h4>
                      <p className="text-sm text-muted-foreground">Start SIPs, build emergency fund, establish investment discipline</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="bg-financial-accent/10 p-2 rounded">
                      <BarChart3 className="h-4 w-4 text-financial-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Year 1-2: Growth Phase</h4>
                      <p className="text-sm text-muted-foreground">Monitor performance, rebalance quarterly, increase SIP by 10% annually</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="bg-financial-accent/10 p-2 rounded">
                      <TrendingUp className="h-4 w-4 text-financial-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Year 3+: Optimization</h4>
                      <p className="text-sm text-muted-foreground">Review goals, optimize tax strategy, consider advanced investments</p>
                    </div>
                  </div>
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
    </div>
  );
};

export default AIRecommendations;