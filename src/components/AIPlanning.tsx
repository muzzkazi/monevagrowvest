import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Shield, AlertCircle, ChevronDown, ChevronUp, PiggyBank, ArrowLeft } from "lucide-react";
import GoalSetting from "./ai-planning/GoalSetting";
import RiskAssessment from "./ai-planning/RiskAssessment";
import AIRecommendations from "./ai-planning/AIRecommendations";
import SIPPlanning from "./ai-planning/SIPPlanning";

interface FinancialGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  timeHorizon: number;
  priority: number;
  currentSavings: number;
}

interface SIPData {
  monthlyAmount: number;
  wantsTaxBenefits: boolean;
  taxBracket: string;
  timeHorizon: number;
}

const AIPlanning = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const initialMode: "goals" | "sip" | null =
    modeParam === "goals" || modeParam === "sip" ? modeParam : null;
  const [planningMode, setPlanningMode] = useState<"goals" | "sip" | null>(initialMode);
  const [currentStep, setCurrentStep] = useState<string>(initialMode ?? "selection");

  useEffect(() => {
    if (modeParam === "goals" || modeParam === "sip") {
      setPlanningMode(modeParam);
      setCurrentStep(modeParam);
    }
  }, [modeParam]);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [userGoals, setUserGoals] = useState<FinancialGoal[]>([]);
  const [sipData, setSipData] = useState<SIPData | null>(null);
  const [riskProfile, setRiskProfile] = useState<string>("");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const goalSteps = [{
    id: "goals",
    label: "Financial Goals",
    icon: Target,
    completed: completedSteps.has("goals")
  }, {
    id: "risk",
    label: "Risk Assessment",
    icon: Shield,
    completed: completedSteps.has("risk")
  }, {
    id: "recommendations",
    label: "AI Recommendations",
    icon: Brain,
    completed: completedSteps.has("recommendations")
  }];

  const sipSteps = [{
    id: "sip",
    label: "SIP Planning",
    icon: PiggyBank,
    completed: completedSteps.has("sip")
  }, {
    id: "risk",
    label: "Risk Assessment",
    icon: Shield,
    completed: completedSteps.has("risk")
  }, {
    id: "recommendations",
    label: "AI Recommendations",
    icon: Brain,
    completed: completedSteps.has("recommendations")
  }];

  const currentSteps = planningMode === "goals" ? goalSteps : planningMode === "sip" ? sipSteps : [];

  const isStepAccessible = (stepId: string) => {
    if (stepId === "goals" || stepId === "sip") return true;
    if (stepId === "risk") return completedSteps.has("goals") || completedSteps.has("sip");
    if (stepId === "recommendations") return (completedSteps.has("goals") || completedSteps.has("sip")) && completedSteps.has("risk");
    return false;
  };

  const resetPlanning = () => {
    setPlanningMode(null);
    setCurrentStep("selection");
    setCompletionProgress(0);
    setUserGoals([]);
    setSipData(null);
    setRiskProfile("");
    setCompletedSteps(new Set());
  };

  // Mode Selection Screen
  if (planningMode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-financial-accent" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">AI-Powered Portfolio Designer</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose your preferred planning approach. Our AI will create personalized investment strategies based on your selection.
            </p>
          </div>

          {/* Planning Mode Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-financial-accent/50 flex flex-col" onClick={() => {
              setPlanningMode("goals");
              setCurrentStep("goals");
            }}>
              <CardContent className="p-8 text-center flex flex-col flex-1">
                <Target className="h-16 w-16 text-financial-accent mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Goal-Based Planning</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Define specific financial goals like retirement, children's education, or buying a home. 
                  Get personalized portfolio recommendations to achieve your targets.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Multiple financial goals</li>
                  <li>• Time-bound objectives</li>
                  <li>• Goal-specific allocations</li>
                  <li>• Priority-based planning</li>
                </ul>
                <Button className="mt-auto w-full bg-financial-accent hover:bg-financial-accent/90">
                  Start Goal-Based Planning
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-financial-accent/50 flex flex-col" onClick={() => {
              setPlanningMode("sip");
              setCurrentStep("sip");
            }}>
              <CardContent className="p-8 text-center flex flex-col flex-1">
                <PiggyBank className="h-16 w-16 text-financial-accent mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">SIP-Based Planning</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Start with your monthly investment capacity. Get optimized portfolio recommendations 
                  based on your SIP amount and tax preferences.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Monthly SIP planning</li>
                  <li>• Tax optimization options</li>
                  <li>• Growth projections</li>
                  <li>• Flexible allocations</li>
                </ul>
                <Button className="mt-auto w-full bg-financial-accent hover:bg-financial-accent/90">
                  Start SIP Planning
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Collapsible Financial Disclaimers */}
          <div className="mt-12">
            <Collapsible open={isDisclaimerOpen} onOpenChange={setIsDisclaimerOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-between p-4 h-auto border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Important Financial Disclaimers & Regulatory Information</span>
                  </div>
                  {isDisclaimerOpen ? <ChevronUp className="h-4 w-4 text-amber-700 dark:text-amber-400" /> : <ChevronDown className="h-4 w-4 text-amber-700 dark:text-amber-400" />}
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Button variant="ghost" onClick={resetPlanning} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <Brain className="h-8 w-8 text-financial-accent" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">
              {planningMode === "goals" ? "Goal-Based" : "SIP-Based"} AI Planning
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {planningMode === "goals" 
              ? "Define your financial goals and get personalized investment strategies."
              : "Plan your monthly SIP and get optimized portfolio recommendations."
            }
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
            {currentSteps.map(step => {
              const Icon = step.icon;
              const isAccessible = isStepAccessible(step.id);
              return (
                <TabsTrigger 
                  key={step.id} 
                  value={step.id} 
                  disabled={!isAccessible} 
                  className={`flex items-center gap-2 py-3 relative ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''} ${step.completed ? 'text-green-600' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                  {step.completed && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>}
                  {!isAccessible && <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-800/50 rounded"></div>}
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
                <GoalSetting onComplete={(goals) => {
                  setUserGoals(goals);
                  setCompletedSteps(prev => new Set([...prev, "goals"]));
                  setCompletionProgress(33);
                  setCurrentStep("risk");
                }} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* SIP Planning Tab */}
          <TabsContent value="sip" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-financial-accent" />
                  Plan Your Monthly SIP
                </CardTitle>
              </CardHeader>
               <CardContent>
                 <SIPPlanning onComplete={(data) => {
                   setSipData(data);
                   setCompletedSteps(prev => new Set([...prev, "sip"]));
                   setCompletionProgress(33);
                   setCurrentStep("risk");
                 }} />
               </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-6">
            {!completedSteps.has("goals") && !completedSteps.has("sip") ? (
              <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Previous Step</h3>
                  <p className="text-muted-foreground">
                    Please complete {planningMode === "goals" ? "financial goals" : "SIP planning"} before proceeding to risk assessment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-financial-accent" />
                      Risk Profile Assessment
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep(planningMode === "goals" ? "goals" : "sip")}
                      className="flex items-center gap-2"
                    >
                      Edit {planningMode === "goals" ? "Goals" : "SIP Plan"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <RiskAssessment onComplete={(profile) => {
                      setRiskProfile(profile);
                      setCompletedSteps(prev => new Set([...prev, "risk"]));
                      setCompletionProgress(66);
                      setCurrentStep("recommendations");
                    }} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {(!completedSteps.has("goals") && !completedSteps.has("sip")) || !completedSteps.has("risk") ? (
              <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <CardContent className="pt-6 text-center">
                  <Brain className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Previous Steps</h3>
                  <p className="text-muted-foreground">
                    Please complete {planningMode === "goals" ? "goals" : "SIP planning"} and risk assessment before viewing AI recommendations.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-financial-accent" />
                      Your Personalized Investment Strategy
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentStep("risk")}
                        className="flex items-center gap-2"
                      >
                        Edit Risk Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentStep(planningMode === "goals" ? "goals" : "sip")}
                        className="flex items-center gap-2"
                      >
                        Edit {planningMode === "goals" ? "Goals" : "SIP Plan"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AIRecommendations 
                      goals={planningMode === "goals" ? userGoals : undefined}
                      sipData={planningMode === "sip" ? sipData : undefined}
                      riskProfile={riskProfile}
                      planningMode={planningMode}
                      onComplete={() => {
                        setCompletedSteps(prev => new Set([...prev, "recommendations"]));
                        setCompletionProgress(100);
                      }} 
                    />
                  </CardContent>
                </Card>
              </div>
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
              <Button size="lg" className="bg-financial-accent hover:bg-financial-accent/90" onClick={() => window.location.href = '/contact'}>
                Schedule Free Consultation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIPlanning;
