import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Shield, Star, Plus, X } from "lucide-react";

interface MutualFund {
  id: string;
  name: string;
  category: string;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  expenseRatio: number;
  aum: string;
  riskLevel: "Low" | "Moderate" | "High";
  rating: number;
  minInvestment: number;
}

const mutualFunds: MutualFund[] = [
  {
    id: "1",
    name: "HDFC Top 100 Fund",
    category: "Large Cap",
    returns1Y: 12.5,
    returns3Y: 15.2,
    returns5Y: 13.8,
    expenseRatio: 1.05,
    aum: "₹45,230 Cr",
    riskLevel: "Moderate",
    rating: 4,
    minInvestment: 500
  },
  {
    id: "2",
    name: "SBI Small Cap Fund",
    category: "Small Cap",
    returns1Y: 18.7,
    returns3Y: 22.1,
    returns5Y: 19.4,
    expenseRatio: 1.75,
    aum: "₹12,450 Cr",
    riskLevel: "High",
    rating: 4,
    minInvestment: 1000
  },
  {
    id: "3",
    name: "ICICI Prudential Bluechip Fund",
    category: "Large Cap",
    returns1Y: 11.8,
    returns3Y: 14.5,
    returns5Y: 12.9,
    expenseRatio: 1.25,
    aum: "₹38,760 Cr",
    riskLevel: "Low",
    rating: 5,
    minInvestment: 100
  },
  {
    id: "4",
    name: "Axis Midcap Fund",
    category: "Mid Cap",
    returns1Y: 16.2,
    returns3Y: 18.9,
    returns5Y: 16.7,
    expenseRatio: 1.45,
    aum: "₹25,680 Cr",
    riskLevel: "Moderate",
    rating: 4,
    minInvestment: 500
  },
  {
    id: "5",
    name: "Mirae Asset Large Cap Fund",
    category: "Large Cap",
    returns1Y: 13.1,
    returns3Y: 15.8,
    returns5Y: 14.2,
    expenseRatio: 0.95,
    aum: "₹22,340 Cr",
    riskLevel: "Low",
    rating: 5,
    minInvestment: 1000
  },
  {
    id: "6",
    name: "UTI Flexi Cap Fund",
    category: "Flexi Cap",
    returns1Y: 14.3,
    returns3Y: 17.2,
    returns5Y: 15.6,
    expenseRatio: 1.35,
    aum: "₹18,920 Cr",
    riskLevel: "Moderate",
    rating: 4,
    minInvestment: 500
  }
];

const MutualFundsComparison = () => {
  const [selectedFunds, setSelectedFunds] = useState<MutualFund[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");

  const categories = ["Large Cap", "Mid Cap", "Small Cap", "Flexi Cap"];
  const riskLevels = ["Low", "Moderate", "High"];

  const filteredFunds = mutualFunds.filter(fund => {
    const categoryMatch = filterCategory === "all" || fund.category === filterCategory;
    const riskMatch = filterRisk === "all" || fund.riskLevel === filterRisk;
    return categoryMatch && riskMatch;
  });

  const addToComparison = (fund: MutualFund) => {
    if (selectedFunds.length < 3 && !selectedFunds.find(f => f.id === fund.id)) {
      setSelectedFunds([...selectedFunds, fund]);
    }
  };

  const removeFromComparison = (fundId: string) => {
    setSelectedFunds(selectedFunds.filter(f => f.id !== fundId));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-600 bg-green-100";
      case "Moderate": return "text-yellow-600 bg-yellow-100";
      case "High": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getReturnIcon = (returns: number) => {
    return returns > 15 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-financial-muted rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filter by Category</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filter by Risk</label>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger>
              <SelectValue placeholder="All Risk Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              {riskLevels.map(risk => (
                <SelectItem key={risk} value={risk}>{risk}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Section */}
      {selectedFunds.length > 0 && (
        <Card className="bg-financial-muted border-financial-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-financial-accent" />
              Fund Comparison ({selectedFunds.length}/3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {selectedFunds.map(fund => (
                <div key={fund.id} className="bg-background p-4 rounded-lg border relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => removeFromComparison(fund.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">{fund.name}</h4>
                    <Badge variant="outline" className="text-xs">{fund.category}</Badge>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>1Y Returns:</span>
                        <span className="flex items-center gap-1 font-medium">
                          {getReturnIcon(fund.returns1Y)}
                          {fund.returns1Y}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>3Y Returns:</span>
                        <span className="flex items-center gap-1 font-medium">
                          {getReturnIcon(fund.returns3Y)}
                          {fund.returns3Y}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>5Y Returns:</span>
                        <span className="flex items-center gap-1 font-medium">
                          {getReturnIcon(fund.returns5Y)}
                          {fund.returns5Y}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expense Ratio:</span>
                        <span className="font-medium">{fund.expenseRatio}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <Badge className={`text-xs ${getRiskColor(fund.riskLevel)}`}>
                          {fund.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Funds */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFunds.map(fund => (
          <Card key={fund.id} className="card-float glass-card group hover:shadow-financial transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{fund.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{fund.category}</Badge>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < fund.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Badge className={getRiskColor(fund.riskLevel)}>
                  {fund.riskLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-financial-accent flex items-center justify-center gap-1">
                    {getReturnIcon(fund.returns1Y)}
                    {fund.returns1Y}%
                  </div>
                  <div className="text-xs text-muted-foreground">1Y Return</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-financial-accent flex items-center justify-center gap-1">
                    {getReturnIcon(fund.returns3Y)}
                    {fund.returns3Y}%
                  </div>
                  <div className="text-xs text-muted-foreground">3Y Return</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-financial-accent flex items-center justify-center gap-1">
                    {getReturnIcon(fund.returns5Y)}
                    {fund.returns5Y}%
                  </div>
                  <div className="text-xs text-muted-foreground">5Y Return</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expense Ratio:</span>
                  <span className="font-medium">{fund.expenseRatio}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AUM:</span>
                  <span className="font-medium">{fund.aum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Investment:</span>
                  <span className="font-medium">₹{fund.minInvestment}</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white"
                onClick={() => addToComparison(fund)}
                disabled={selectedFunds.length >= 3 || selectedFunds.find(f => f.id === fund.id) !== undefined}
              >
                <Plus className="w-4 h-4 mr-2" />
                {selectedFunds.find(f => f.id === fund.id) ? 'Already Added' : 'Add to Compare'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MutualFundsComparison;