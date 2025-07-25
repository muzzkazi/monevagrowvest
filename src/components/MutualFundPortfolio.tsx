import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Star, Target } from "lucide-react";

interface PortfolioProps {
  monthlyAmount: number;
  years: number;
}

const MutualFundPortfolio = ({ monthlyAmount, years }: PortfolioProps) => {
  const getPortfolioRecommendation = () => {
    const riskProfile = years >= 10 ? 'aggressive' : years >= 5 ? 'moderate' : 'conservative';
    
    const portfolios = {
      conservative: [
        { name: "HDFC Liquid Fund", category: "Liquid", allocation: 30, returns: "6-7%", risk: "Very Low" },
        { name: "SBI Magnum Income Fund", category: "Debt", allocation: 40, returns: "7-9%", risk: "Low" },
        { name: "ICICI Pru Bluechip Fund", category: "Large Cap", allocation: 30, returns: "10-12%", risk: "Medium" }
      ],
      moderate: [
        { name: "HDFC Index Fund Sensex", category: "Large Cap", allocation: 40, returns: "11-13%", risk: "Medium" },
        { name: "Axis Midcap Fund", category: "Mid Cap", allocation: 30, returns: "12-15%", risk: "High" },
        { name: "HDFC Hybrid Equity Fund", category: "Hybrid", allocation: 30, returns: "9-11%", risk: "Medium" }
      ],
      aggressive: [
        { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", allocation: 35, returns: "13-16%", risk: "High" },
        { name: "Kotak Small Cap Fund", category: "Small Cap", allocation: 25, returns: "14-18%", risk: "Very High" },
        { name: "Mirae Asset Large & Midcap", category: "Large & Mid Cap", allocation: 40, returns: "12-15%", risk: "High" }
      ]
    };

    return portfolios[riskProfile];
  };

  const portfolio = getPortfolioRecommendation();
  const expectedReturn = years >= 10 ? 14 : years >= 5 ? 11 : 8;
  const projectedValue = monthlyAmount * 12 * years * (1 + expectedReturn/100) ** years;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-financial-accent" />
            Recommended Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {portfolio.map((fund, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{fund.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{fund.category}</Badge>
                    <span className="text-xs text-muted-foreground">Expected: {fund.returns}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-financial-accent">{fund.allocation}%</p>
                  <p className="text-xs text-muted-foreground">₹{Math.round(monthlyAmount * fund.allocation / 100).toLocaleString()}/month</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-gold rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-financial-secondary">Projected Portfolio Value</p>
                <p className="text-2xl font-bold text-financial-primary">₹{projectedValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-financial-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-financial-accent" />
            Portfolio Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Star className="w-6 h-6 text-financial-accent mx-auto mb-2" />
              <p className="text-sm font-medium">Risk Level</p>
              <p className="text-xs text-muted-foreground">
                {years >= 10 ? 'High Growth' : years >= 5 ? 'Balanced' : 'Conservative'}
              </p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-financial-accent mx-auto mb-2" />
              <p className="text-sm font-medium">Expected Returns</p>
              <p className="text-xs text-muted-foreground">{expectedReturn}% annually</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Diversified across market caps and sectors</p>
            <p>• Rebalanced quarterly for optimal performance</p>
            <p>• Tax-efficient ELSS options included</p>
            <p>• Professional fund management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MutualFundPortfolio;