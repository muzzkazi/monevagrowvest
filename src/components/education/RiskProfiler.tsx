import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  TrendingUp, 
  Target, 
  Zap,
  ChevronRight,
  RotateCcw,
  CheckCircle
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: { value: number; text: string }[];
}

interface RiskProfilerProps {
  onProfileComplete?: (profile: string, score: number) => void;
}

const RiskProfiler = ({ onProfileComplete }: RiskProfilerProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "What's your investment timeline?",
      options: [
        { value: 1, text: "Less than 2 years" },
        { value: 2, text: "2-5 years" },
        { value: 3, text: "5-10 years" },
        { value: 4, text: "More than 10 years" }
      ]
    },
    {
      id: 2,
      question: "How would you react if your investment lost 20% in a month?",
      options: [
        { value: 1, text: "Sell immediately to prevent further losses" },
        { value: 2, text: "Wait and see what happens next month" },
        { value: 3, text: "Hold and maybe invest a small amount more" },
        { value: 4, text: "Invest significantly more - it's a great opportunity!" }
      ]
    },
    {
      id: 3,
      question: "What percentage of your income can you invest?",
      options: [
        { value: 1, text: "Less than 5%" },
        { value: 2, text: "5-10%" },
        { value: 3, text: "10-20%" },
        { value: 4, text: "More than 20%" }
      ]
    },
    {
      id: 4,
      question: "Your investment knowledge level:",
      options: [
        { value: 1, text: "Beginner - I know basic terms" },
        { value: 2, text: "Intermediate - I understand mutual funds" },
        { value: 3, text: "Advanced - I can analyze stocks" },
        { value: 4, text: "Expert - I trade derivatives" }
      ]
    },
    {
      id: 5,
      question: "Primary investment goal:",
      options: [
        { value: 1, text: "Capital preservation" },
        { value: 2, text: "Steady income generation" },
        { value: 3, text: "Balanced growth and income" },
        { value: 4, text: "Maximum wealth creation" }
      ]
    }
  ];

  const handleAnswer = (value: number) => {
    setSelectedAnswer(value);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer, 0);
      const profile = calculateRiskProfile(totalScore);
      onProfileComplete?.(profile, totalScore);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
  };

  const calculateRiskProfile = (totalScore: number): string => {
    if (totalScore <= 8) return 'Conservative';
    if (totalScore <= 12) return 'Moderate';
    if (totalScore <= 16) return 'Balanced';
    return 'Aggressive';
  };

  const getRiskProfileDetails = (profile: string) => {
    switch (profile) {
      case 'Conservative':
        return {
          icon: Shield,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          description: 'You prefer safety and stability over growth potential.',
          allocation: 'Debt: 70-80%, Equity: 20-30%',
          riskLevel: 'Low',
          expectedReturn: '6-8% annually'
        };
      case 'Moderate':
        return {
          icon: Target,
          color: 'text-financial-accent',
          bgColor: 'bg-financial-accent/10',
          description: 'You seek balanced growth with moderate risk tolerance.',
          allocation: 'Debt: 50-60%, Equity: 40-50%',
          riskLevel: 'Medium',
          expectedReturn: '8-12% annually'
        };
      case 'Balanced':
        return {
          icon: TrendingUp,
          color: 'text-financial-gold',
          bgColor: 'bg-financial-gold/10',
          description: 'You aim for growth while accepting higher volatility.',
          allocation: 'Debt: 30-40%, Equity: 60-70%',
          riskLevel: 'Medium-High',
          expectedReturn: '10-14% annually'
        };
      case 'Aggressive':
        return {
          icon: Zap,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          description: 'You prioritize maximum growth and can handle high volatility.',
          allocation: 'Debt: 10-20%, Equity: 80-90%',
          riskLevel: 'High',
          expectedReturn: '12-16% annually'
        };
      default:
        return {
          icon: Target,
          color: 'text-financial-accent',
          bgColor: 'bg-financial-accent/10',
          description: '',
          allocation: '',
          riskLevel: '',
          expectedReturn: ''
        };
    }
  };

  if (showResults) {
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    const profile = calculateRiskProfile(totalScore);
    const details = getRiskProfileDetails(profile);

    return (
      <Card className="glass-card max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${details.bgColor}`}>
            <details.icon className={`w-8 h-8 ${details.color}`} />
          </div>
          <CardTitle className="text-2xl">Your Risk Profile: {profile}</CardTitle>
          <CardDescription>{details.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Recommended Allocation</div>
              <div className="font-medium">{details.allocation}</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Risk Level</div>
              <div className="font-medium">{details.riskLevel}</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Expected Returns</div>
              <div className="font-medium">{details.expectedReturn}</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button onClick={resetQuiz} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Risk Profiler</CardTitle>
          <Badge variant="outline">
            {currentQuestion + 1} of {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">
            {questions[currentQuestion].question}
          </h3>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedAnswer === option.value
                    ? 'border-financial-accent bg-financial-accent/10'
                    : 'border-muted'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.value}
                  checked={selectedAnswer === option.value}
                  onChange={() => handleAnswer(option.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedAnswer === option.value
                    ? 'border-financial-accent bg-financial-accent'
                    : 'border-muted-foreground'
                }`}>
                  {selectedAnswer === option.value && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="flex-1">{option.text}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-financial-accent hover:bg-financial-accent/90"
          >
            {currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskProfiler;