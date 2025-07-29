import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Shield, AlertCircle } from "lucide-react";
import GoalSetting from "./ai-planning/GoalSetting";
import RiskAssessment from "./ai-planning/RiskAssessment";
import AIRecommendations from "./ai-planning/AIRecommendations";

const AIPlanning = () => {
  const [currentStep, setCurrentStep] = useState("goals");
  const [completionProgress, setCompletionProgress] = useState(0);

  const steps = [
    { id: "goals", label: "Financial Goals", icon: Target, completed: false },
    { id: "risk", label: "Risk Assessment", icon: Shield, completed: false },
    { id: "recommendations", label: "AI Recommendations", icon: Brain, completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-financial-accent" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">
              AI-Driven Financial Planning
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
        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          {/* Step Navigation */}
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <TabsTrigger 
                  key={step.id} 
                  value={step.id}
                  className="flex items-center gap-2 py-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.label}</span>
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
                  onComplete={() => {
                    setCompletionProgress(33);
                    setCurrentStep("risk");
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-financial-accent" />
                  Risk Profile Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RiskAssessment 
                  onComplete={() => {
                    setCompletionProgress(66);
                    setCurrentStep("recommendations");
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-financial-accent" />
                  Your Personalized Investment Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIRecommendations 
                  onComplete={() => setCompletionProgress(100)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-financial-accent/10 to-financial-gold/10 border-financial-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-financial-accent" />
                <h3 className="text-lg font-semibold">Ready to Start Investing?</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Complete your AI-driven financial plan and get started with personalized investment recommendations.
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
      </div>
    </div>
  );
};

export default AIPlanning;