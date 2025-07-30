import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Shield, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import GoalSetting from "./ai-planning/GoalSetting";
import RiskAssessment from "./ai-planning/RiskAssessment";
import AIRecommendations from "./ai-planning/AIRecommendations";

interface FinancialGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  timeHorizon: number;
  priority: number;
  currentSavings: number;
}

const AIPlanning = () => {
  const [currentStep, setCurrentStep] = useState("goals");
  const [completionProgress, setCompletionProgress] = useState(0);
  const [userGoals, setUserGoals] = useState<FinancialGoal[]>([]);
  const [riskProfile, setRiskProfile] = useState<string>("");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const steps = [
    { id: "goals", label: "Financial Goals", icon: Target, completed: completedSteps.has("goals") },
    { id: "risk", label: "Risk Assessment", icon: Shield, completed: completedSteps.has("risk") },
    { id: "recommendations", label: "AI Recommendations", icon: Brain, completed: completedSteps.has("recommendations") }
  ];

  const isStepAccessible = (stepId: string) => {
    if (stepId === "goals") return true;
    if (stepId === "risk") return completedSteps.has("goals");
    if (stepId === "recommendations") return completedSteps.has("goals") && completedSteps.has("risk");
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-financial-accent" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">
              AI-Powered Portfolio Designer
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience hyper-personalized, goal-oriented investment strategies powered by advanced AI. 
            Our intelligent engine adapts to your unique circumstances and market conditions.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Planning Progress</span>
            <span className="text-sm text-muted-foreground">{completionProgress}% Complete</span>
          </div>
          <Progress value={completionProgress} className="h-2" />
        </div>

        {/* Main Content */}
        <Tabs value={currentStep} className="w-full">
          {/* Step Navigation */}
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {steps.map((step) => {
              const Icon = step.icon;
              const isAccessible = isStepAccessible(step.id);
              return (
                <TabsTrigger 
                  key={step.id} 
                  value={step.id}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 py-3 relative ${
                    !isAccessible ? 'opacity-50 cursor-not-allowed' : ''
                  } ${step.completed ? 'text-green-600' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                  {step.completed && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                  {!isAccessible && (
                    <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-800/50 rounded"></div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Goal Setting Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-financial-accent" />
                  Define Your Financial Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GoalSetting 
                  onComplete={(goals) => {
                    setUserGoals(goals);
                    setCompletedSteps(prev => new Set([...prev, "goals"]));
                    setCompletionProgress(33);
                    setCurrentStep("risk");
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-6">
            {!completedSteps.has("goals") ? (
              <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Your Goals First</h3>
                  <p className="text-muted-foreground">
                    Please define your financial goals before proceeding to risk assessment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-financial-accent" />
                    Risk Profile Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskAssessment 
                    onComplete={(profile) => {
                      setRiskProfile(profile);
                      setCompletedSteps(prev => new Set([...prev, "risk"]));
                      setCompletionProgress(66);
                      setCurrentStep("recommendations");
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {!completedSteps.has("goals") || !completedSteps.has("risk") ? (
              <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <CardContent className="pt-6 text-center">
                  <Brain className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Previous Steps</h3>
                  <p className="text-muted-foreground">
                    Please complete your financial goals and risk assessment before viewing AI recommendations.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className={`flex items-center gap-2 ${completedSteps.has("goals") ? 'text-green-600' : 'text-red-600'}`}>
                      {completedSteps.has("goals") ? '✓' : '✗'} Financial Goals
                    </div>
                    <div className={`flex items-center gap-2 ${completedSteps.has("risk") ? 'text-green-600' : 'text-red-600'}`}>
                      {completedSteps.has("risk") ? '✓' : '✗'} Risk Assessment
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-financial-accent" />
                    Your Personalized Investment Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIRecommendations 
                    goals={userGoals}
                    riskProfile={riskProfile}
                    onComplete={() => {
                      setCompletedSteps(prev => new Set([...prev, "recommendations"]));
                      setCompletionProgress(100);
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-financial-accent/10 to-financial-gold/10 border-financial-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-financial-accent" />
                <h3 className="text-lg font-semibold">Ready to Start Investing?</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Complete your AI-driven financial plan and get started with personalized investment recommendations from qualified advisors.
              </p>
              <Button 
                size="lg" 
                className="bg-financial-accent hover:bg-financial-accent/90"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Free Consultation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Financial Disclaimers */}
        <div className="mt-12">
          <Collapsible open={isDisclaimerOpen} onOpenChange={setIsDisclaimerOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center justify-between p-4 h-auto border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/20"
              >
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Important Financial Disclaimers & Regulatory Information</span>
                </div>
                {isDisclaimerOpen ? (
                  <ChevronUp className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 mt-2">
                <CardContent className="space-y-4 text-sm text-amber-800 dark:text-amber-300 pt-6">
                  <div className="space-y-3">
                    <p>
                      <strong>Regulatory Status:</strong> Moneva Growvest Pvt. Ltd. is a registered sub-broker with Angel One and holds a valid ARN (AMFI Registration Number) for mutual fund distribution. We are authorized to provide investment advisory services and distribute mutual fund products in compliance with SEBI regulations.
                    </p>
                    
                    <p>
                      <strong>Risk Warning:</strong> All investments in mutual funds, stocks, and other financial instruments are subject to market risks. Past performance does not guarantee future returns. The value of investments can go up or down, and you may not get back the original amount invested.
                    </p>
                    
                    <p>
                      <strong>AI-Generated Recommendations:</strong> While our AI tool provides personalized investment recommendations based on your goals and risk profile, these are generated using algorithms and historical data. Actual market performance may vary significantly due to volatility, economic conditions, and unforeseen circumstances.
                    </p>
                    
                    <p>
                      <strong>Professional Guidance:</strong> Our qualified financial advisors review and validate AI-generated recommendations before implementation. We encourage clients to discuss their complete financial situation with our advisors for comprehensive planning.
                    </p>
                    
                    <p>
                      <strong>Accuracy of Information:</strong> While we strive to provide accurate and up-to-date information, market conditions change rapidly. We recommend reviewing all investment decisions with our advisors before execution.
                    </p>
                    
                    <p>
                      <strong>Compliance & Transparency:</strong> All our investment recommendations and transactions are executed in full compliance with SEBI guidelines, Angel One's policies, and AMFI regulations. We maintain complete transparency in our fee structure and commissions.
                    </p>
                    
                    <p>
                      <strong>Tax Implications:</strong> Tax benefits mentioned are subject to current tax laws and individual circumstances. Our advisors can provide guidance on tax-efficient investment strategies as per your tax bracket and financial goals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default AIPlanning;