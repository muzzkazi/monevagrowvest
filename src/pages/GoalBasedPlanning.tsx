import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Calendar, TrendingUp, Calculator } from "lucide-react";

const GoalBasedPlanning = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-financial-accent/5">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-financial-accent/10 rounded-full">
                <Target className="h-12 w-12 text-financial-accent" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Goal Based Financial Planning
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Transform your financial dreams into achievable goals with our AI-powered planning system.
              Set, track, and achieve your financial milestones with precision.
            </p>
          </div>

          {/* Goal Planning Tool */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="glass-card shadow-financial">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calculator className="h-6 w-6 text-financial-accent" />
                  Goal Planning Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Goal</TabsTrigger>
                    <TabsTrigger value="track">Track Progress</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="goalName">Goal Name</Label>
                        <Input id="goalName" placeholder="e.g., Dream Home, Child Education" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goalType">Goal Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home Purchase</SelectItem>
                            <SelectItem value="education">Child Education</SelectItem>
                            <SelectItem value="retirement">Retirement</SelectItem>
                            <SelectItem value="vacation">Vacation</SelectItem>
                            <SelectItem value="emergency">Emergency Fund</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetAmount">Target Amount (₹)</Label>
                        <Input id="targetAmount" type="number" placeholder="1000000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeHorizon">Time Horizon (Years)</Label>
                        <Input id="timeHorizon" type="number" placeholder="10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currentSavings">Current Savings (₹)</Label>
                        <Input id="currentSavings" type="number" placeholder="100000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative (6-8%)</SelectItem>
                            <SelectItem value="moderate">Moderate (8-10%)</SelectItem>
                            <SelectItem value="aggressive">Aggressive (10-12%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-financial-accent hover:bg-financial-accent/90 text-white">
                      Calculate Goal Plan
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="track" className="space-y-6 mt-6">
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Track Your Goals</h3>
                      <p className="text-muted-foreground">
                        Monitor your progress towards achieving your financial goals
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Goal Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="glass-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  Short Term Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Goals achievable within 1-3 years like emergency fund, vacation, or gadgets.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Emergency Fund (6 months expenses)</li>
                  <li>• Vacation Planning</li>
                  <li>• Electronics & Gadgets</li>
                  <li>• Home Renovation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  Medium Term Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Goals spanning 3-7 years like down payment, car purchase, or higher education.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Home Down Payment</li>
                  <li>• Car Purchase</li>
                  <li>• Higher Education</li>
                  <li>• Wedding Planning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card hover:shadow-financial transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  Long Term Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Goals over 7+ years like retirement, child's education, or dream home.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Retirement Planning</li>
                  <li>• Child's Education</li>
                  <li>• Dream Home Purchase</li>
                  <li>• Wealth Creation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="glass-card shadow-financial max-w-2xl mx-auto">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Start Your Financial Journey?</h2>
                <p className="text-muted-foreground mb-6">
                  Get personalized goal-based financial planning recommendations from our experts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-financial-accent hover:bg-financial-accent/90 text-white">
                    Schedule Consultation
                  </Button>
                  <Button variant="outline">
                    Download Goal Planner
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

export default GoalBasedPlanning;