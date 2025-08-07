import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Repeat, Calculator, PiggyBank } from "lucide-react";

const SIPBasedPlanning = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-financial-accent/5">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-financial-accent/10 rounded-full">
                <Repeat className="h-12 w-12 text-financial-accent" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              SIP Based Planning
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Build wealth systematically with Systematic Investment Plans. Start small, invest regularly, 
              and watch your money grow through the power of compounding.
            </p>
          </div>

          {/* SIP Calculator */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="glass-card shadow-financial">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calculator className="h-6 w-6 text-financial-accent" />
                  SIP Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="calculate" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="calculate">Calculate SIP</TabsTrigger>
                    <TabsTrigger value="compare">Compare Plans</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="calculate" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="sipAmount">Monthly SIP Amount (₹)</Label>
                        <Input id="sipAmount" type="number" placeholder="5000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="investmentPeriod">Investment Period (Years)</Label>
                        <Input id="investmentPeriod" type="number" placeholder="10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select return rate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8">8% (Conservative)</SelectItem>
                            <SelectItem value="10">10% (Moderate)</SelectItem>
                            <SelectItem value="12">12% (Aggressive)</SelectItem>
                            <SelectItem value="15">15% (High Growth)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sipFrequency">SIP Frequency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-accent/50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Investment</p>
                        <p className="text-2xl font-bold text-financial-accent">₹6,00,000</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Expected Returns</p>
                        <p className="text-2xl font-bold text-green-600">₹3,27,941</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Maturity Value</p>
                        <p className="text-2xl font-bold text-primary">₹9,27,941</p>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-financial-accent hover:bg-financial-accent/90 text-white">
                      Start SIP Investment
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="compare" className="space-y-6 mt-6">
                    <div className="text-center py-12">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Compare SIP Plans</h3>
                      <p className="text-muted-foreground">
                        Compare different SIP scenarios to find the best investment strategy
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* SIP Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="glass-card hover:shadow-financial transition-all duration-300 text-center">
              <CardContent className="pt-6">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Disciplined Investing</h3>
                <p className="text-sm text-muted-foreground">
                  Build a habit of regular investing with automated monthly contributions
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-financial transition-all duration-300 text-center">
              <CardContent className="pt-6">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Rupee Cost Averaging</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce impact of market volatility by averaging purchase costs
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-financial transition-all duration-300 text-center">
              <CardContent className="pt-6">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                  <Repeat className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Power of Compounding</h3>
                <p className="text-sm text-muted-foreground">
                  Earn returns on your returns and accelerate wealth creation
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-financial transition-all duration-300 text-center">
              <CardContent className="pt-6">
                <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
                  <Calculator className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Flexible Amounts</h3>
                <p className="text-sm text-muted-foreground">
                  Start with as low as ₹500 and increase as your income grows
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SIP Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="glass-card shadow-financial">
              <CardHeader>
                <CardTitle>Equity SIP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Invest in equity mutual funds for long-term wealth creation with higher growth potential.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Large Cap Funds - Stable blue-chip companies</li>
                  <li>• Mid Cap Funds - Growing mid-sized companies</li>
                  <li>• Small Cap Funds - High growth small companies</li>
                  <li>• Multi Cap Funds - Diversified across market caps</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Explore Equity SIPs
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-financial">
              <CardHeader>
                <CardTitle>Debt SIP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Invest in debt instruments for stable returns with lower risk and capital preservation.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Liquid Funds - High liquidity, low risk</li>
                  <li>• Short Duration Funds - 1-3 year maturity</li>
                  <li>• Medium Duration Funds - 3-4 year maturity</li>
                  <li>• Gilt Funds - Government securities</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Explore Debt SIPs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="glass-card shadow-financial max-w-2xl mx-auto">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold mb-4">Start Your SIP Journey Today</h2>
                <p className="text-muted-foreground mb-6">
                  Begin your wealth creation journey with systematic investment planning. Our experts will help you choose the right SIP strategy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-financial-accent hover:bg-financial-accent/90 text-white">
                    Start SIP Now
                  </Button>
                  <Button variant="outline">
                    Schedule Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SIPBasedPlanning;