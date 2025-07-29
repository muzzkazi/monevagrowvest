import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RiskAssessmentProps {
  onComplete: (riskProfile: string) => void;
}

interface Question {
  id: number;
  question: string;
  options: { value: number; text: string }[];
}

const RiskAssessment = ({ onComplete }: RiskAssessmentProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "What is your primary investment objective?",
      options: [
        { value: 1, text: "Capital preservation - I want to protect my money" },
        { value: 2, text: "Income generation - I need regular returns" },
        { value: 3, text: "Balanced growth - I want moderate returns with some risk" },
        { value: 4, text: "Capital appreciation - I want high returns and can accept high risk" }
      ]
    },
    {
      id: 2,
      question: "How would you react if your investment lost 20% of its value in one year?",
      options: [
        { value: 1, text: "I would panic and sell immediately" },
        { value: 2, text: "I would be very concerned and consider selling" },
        { value: 3, text: "I would be worried but hold on" },
        { value: 4, text: "I would see it as a buying opportunity" }
      ]
    },
    {
      id: 3,
      question: "What is your investment experience?",
      options: [
        { value: 1, text: "No experience - this is my first investment" },
        { value: 2, text: "Limited - I've invested in FDs and savings accounts" },
        { value: 3, text: "Moderate - I've invested in mutual funds and some stocks" },
        { value: 4, text: "Extensive - I actively trade and understand complex instruments" }
      ]
    },
    {
      id: 4,
      question: "What percentage of your income can you afford to invest?",
      options: [
        { value: 1, text: "Less than 10% - I have many financial obligations" },
        { value: 2, text: "10-20% - I have some disposable income" },
        { value: 3, text: "20-30% - I have good savings capacity" },
        { value: 4, text: "More than 30% - I have substantial disposable income" }
      ]
    },
    {
      id: 5,
      question: "What is your preferred investment time horizon? (How long do you plan to stay invested before needing the money)",
      options: [
        { value: 1, text: "Short term (Less than 2 years) - I may need the money soon" },
        { value: 2, text: "Medium term (2-5 years) - Planning for a specific goal" },
        { value: 3, text: "Long term (5-10 years) - Building wealth for future needs" },
        { value: 4, text: "Very long term (10+ years) - Long-term wealth creation" }
      ]
    },
    {
      id: 6,
      question: "Which statement best describes your attitude towards risk?",
      options: [
        { value: 1, text: "I prefer guaranteed returns even if they are low" },
        { value: 2, text: "I prefer stable returns with minimal risk" },
        { value: 3, text: "I'm willing to accept moderate risk for better returns" },
        { value: 4, text: "I'm comfortable with high risk for potentially high returns" }
      ]
    }
  ];

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (answers[currentQuestion] === undefined) {
      toast({
        title: "Answer Required",
        description: "Please select an answer before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateRiskProfile = () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage <= 25) return "Conservative";
    if (percentage <= 50) return "Moderate";
    if (percentage <= 75) return "Balanced";
    return "Aggressive";
  };

  const getRiskProfileDetails = (profile: string) => {
    const profiles = {
      Conservative: {
        icon: Shield,
        color: "text-green-600",
        description: "You prefer capital preservation and stable returns over high growth.",
        allocation: "Debt: 70-80%, Equity: 20-30%",
        riskLevel: "Low",
        expectedReturns: "6-8% annually"
      },
      Moderate: {
        icon: TrendingUp,
        color: "text-blue-600",
        description: "You seek steady growth with limited risk exposure.",
        allocation: "Debt: 50-60%, Equity: 40-50%",
        riskLevel: "Low to Medium",
        expectedReturns: "8-10% annually"
      },
      Balanced: {
        icon: TrendingUp,
        color: "text-orange-600",
        description: "You balance growth and stability, accepting moderate risk.",
        allocation: "Debt: 30-40%, Equity: 60-70%",
        riskLevel: "Medium",
        expectedReturns: "10-12% annually"
      },
      Aggressive: {
        icon: AlertTriangle,
        color: "text-red-600",
        description: "You prioritize high growth potential and can handle volatility.",
        allocation: "Debt: 10-20%, Equity: 80-90%",
        riskLevel: "High",
        expectedReturns: "12-15% annually"
      }
    };
    return profiles[profile as keyof typeof profiles];
  };

  const handleComplete = () => {
    const profile = calculateRiskProfile();
    toast({
      title: "Risk Assessment Complete",
      description: "Your risk profile has been saved successfully."
    });
    onComplete(profile);
  };

  if (showResults) {
    const riskProfile = calculateRiskProfile();
    const profileDetails = getRiskProfileDetails(riskProfile);
    const Icon = profileDetails.icon;

    return (
      <div className="space-y-6">
        <Card className="border-2 border-financial-accent/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Icon className={`h-16 w-16 ${profileDetails.color}`} />
            </div>
            <CardTitle className="text-2xl">Your Risk Profile: {riskProfile}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground text-lg">
              {profileDetails.description}
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <h4 className="font-semibold mb-2">Recommended Allocation</h4>
                  <p className="text-sm text-muted-foreground">{profileDetails.allocation}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <h4 className="font-semibold mb-2">Risk Level</h4>
                  <p className="text-sm text-muted-foreground">{profileDetails.riskLevel}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <h4 className="font-semibold mb-2">Expected Returns</h4>
                  <p className="text-sm text-muted-foreground">{profileDetails.expectedReturns}</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                Important Note
              </h4>
              <p className="text-sm text-muted-foreground">
                This assessment provides a general indication of your risk tolerance. Market conditions, 
                personal circumstances, and financial goals should always be considered. Our AI will use 
                this profile to create personalized recommendations in the next step.
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleComplete}
                size="lg"
                className="bg-financial-accent hover:bg-financial-accent/90"
              >
                Get AI Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {questions[currentQuestion].question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion]?.toString() || ""}
            onValueChange={(value) => handleAnswer(parseInt(value))}
            className="space-y-4"
          >
            {questions[currentQuestion].options.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} className="mt-1" />
                <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer leading-relaxed">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          className="bg-financial-accent hover:bg-financial-accent/90"
        >
          {currentQuestion === questions.length - 1 ? "Complete Assessment" : "Next Question"}
        </Button>
      </div>
    </div>
  );
};

export default RiskAssessment;