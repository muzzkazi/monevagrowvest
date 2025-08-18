import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Coins, 
  PiggyBank, 
  TrendingUp, 
  BookOpen,
  Play,
  CheckCircle,
  Star,
  Award,
  Brain,
  Lightbulb,
  Lock,
  Gift
} from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useModuleGenerator } from '@/hooks/useModuleGenerator';
import { useBadgeSystem } from '@/hooks/useBadgeSystem';

const FinancialEducation = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [score, setScore] = useState(0);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [gameState, setGameState] = useState({
    shoppingBudget: { 
      budget: 200, 
      spent: 0, 
      items: [] as {name: string, price: number, essential: boolean}[],
      scenario: 'groceries'
    },
    emergencyFund: { 
      savings: 0, 
      monthlyIncome: 3000,
      expenses: 2500,
      emergencyTarget: 7500, // 3 months expenses
      currentMonth: 1
    },
    careerChoices: { 
      currentJob: '',
      salary: 0,
      education: 0,
      experience: 0,
      totalEarnings: 0
    }
  });

  // Use the new dynamic system
  const userProgressHook = useUserProgress();
  const { availableModules, nextModules, progressionTips } = useModuleGenerator(
    userProgressHook.progress.behavior, 
    completedModuleIds
  );
  const { earnedBadges, nextBadges, progressTips: badgeProgressTips } = useBadgeSystem(
    userProgressHook.progress.behavior, 
    earnedBadgeIds
  );

  // Auto-update badge earnings when criteria are met
  useEffect(() => {
    const newlyEarnedBadges = earnedBadges
      .filter(badge => badge.earned && !earnedBadgeIds.includes(badge.id))
      .map(badge => badge.id);
    
    if (newlyEarnedBadges.length > 0) {
      setEarnedBadgeIds(prev => [...prev, ...newlyEarnedBadges]);
      // Award XP for newly earned badges
      const totalBadgeXP = earnedBadges
        .filter(badge => newlyEarnedBadges.includes(badge.id))
        .reduce((total, badge) => total + badge.xpReward, 0);
      
      if (totalBadgeXP > 0) {
        userProgressHook.addXP(totalBadgeXP);
      }
    }
  }, [earnedBadges, earnedBadgeIds, userProgressHook]);

  const quizQuestions = [
    {
      question: "What's the best way to save money?",
      options: ["Spend it all", "Keep it in a piggy bank", "Put it in a savings account", "Give it away"],
      correct: 2,
      explanation: "Savings accounts are safe and often earn interest!"
    },
    {
      question: "What is a budget?",
      options: ["A shopping list", "A plan for spending money", "A type of bank", "A credit card"],
      correct: 1,
      explanation: "A budget helps you plan how to spend and save your money wisely!"
    },
    {
      question: "Why is it important to save money?",
      options: ["It's not important", "For emergencies and future goals", "To impress friends", "Banks require it"],
      correct: 1,
      explanation: "Saving helps you be prepared for unexpected expenses and reach your goals!"
    }
  ];

  const games = [
    {
      id: 'shopping-budget',
      title: 'Smart Shopping Challenge',
      description: 'Shop for your family within budget and make smart choices',
      icon: Target,
      difficulty: 'Easy',
      xp: 25
    },
    {
      id: 'emergency-fund',
      title: 'Emergency Fund Builder',
      description: 'Save for unexpected expenses like car repairs or medical bills',
      icon: PiggyBank,
      difficulty: 'Medium',
      xp: 50
    },
    {
      id: 'career-choices',
      title: 'Career Path Simulator',
      description: 'Make education and career decisions to maximize lifetime earnings',
      icon: TrendingUp,
      difficulty: 'Hard',
      xp: 75
    }
  ];

  // Get rarity color for badges
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-muted text-muted-foreground';
      case 'Rare': return 'bg-blue-500 text-white';
      case 'Epic': return 'bg-purple-500 text-white';
      case 'Legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleQuizAnswer = (selectedOption: number) => {
    const isCorrect = selectedOption === quizQuestions[currentQuiz].correct;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
    }
    
    setTimeout(() => {
      if (currentQuiz < quizQuestions.length - 1) {
        setCurrentQuiz(currentQuiz + 1);
      } else {
        // Quiz completed - use the new progress system
        userProgressHook.completeQuiz(newScore, quizQuestions.length);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setScore(0);
  };

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-financial-gold/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-financial-accent/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-financial-gold text-financial-primary">
            <Lightbulb className="w-4 h-4 mr-2" />
            Learn & Play
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Financial Education
            <span className="text-financial-accent"> for Students</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Make learning about money fun! Explore interactive modules, play educational games, 
            and earn badges as you master important financial concepts.
          </p>
        </div>

        {/* User Progress Dashboard */}
        <Card className="glass-card mb-8 max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-financial-gold" />
                  Your Progress
                </CardTitle>
                <CardDescription>Level {userProgressHook.progress.level} Student</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-financial-accent">{userProgressHook.progress.xp} XP</div>
                <div className="text-sm text-muted-foreground">
                  Next level: {Math.max(0, userProgressHook.progress.totalXP - userProgressHook.progress.xp)} XP
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to Level {userProgressHook.progress.level + 1}</span>
                  <span>{Math.min(100, Math.round((userProgressHook.progress.xp / userProgressHook.progress.totalXP) * 100))}%</span>
                </div>
                <Progress value={Math.min(100, (userProgressHook.progress.xp / userProgressHook.progress.totalXP) * 100)} className="h-3" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1 text-financial-accent" />
                    <span className="text-sm">{completedModuleIds.length} modules completed</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1 text-financial-gold" />
                    <span className="text-sm">{earnedBadges.length} badges earned</span>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  {earnedBadges.slice(0, 4).map((badge) => (
                    <div
                      key={badge.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getRarityColor(badge.rarity)}`}
                      title={badge.name}
                    >
                      <badge.icon className="w-4 h-4" />
                    </div>
                  ))}
                  {earnedBadges.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      +{earnedBadges.length - 4}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Tips */}
              {(progressionTips.length > 0 || badgeProgressTips.length > 0) && (
                <div className="border-t pt-4">
                  <h6 className="text-sm font-medium mb-2 flex items-center">
                    <Gift className="w-4 h-4 mr-1 text-financial-accent" />
                    Progress Tips
                  </h6>
                  <div className="space-y-1">
                    {[...progressionTips, ...badgeProgressTips].slice(0, 3).map((tip, index) => (
                      <div key={index} className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Education Modules */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Learning Modules</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableModules.map((module) => (
              <Card key={module.id} className="glass-card card-float group cursor-pointer">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${module.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={module.completed ? "default" : "secondary"}>
                      {module.level}
                    </Badge>
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 mr-1 text-financial-gold" />
                      <span className="text-sm font-medium">{module.personalizedXP} XP</span>
                    </div>
                  </div>
                  {module.completed ? (
                    <div className="flex items-center justify-center text-accent">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Completed</span>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setActiveModule(module.id);
                        userProgressHook.startModule(module.id);
                      }}
                    >
                      Start Learning
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Next modules (locked) */}
            {nextModules.slice(0, 2).map((module) => (
              <Card key={`locked-${module.id}`} className="glass-card opacity-60 cursor-not-allowed">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg text-muted-foreground">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">{module.level}</Badge>
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 mr-1 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">{module.baseXP} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Lock className="w-4 h-4 mr-1" />
                    <span className="text-sm">Locked</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Module Content Interface */}
        {activeModule && (
          <div className="mb-16">
            <Card className="glass-card max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {React.createElement(availableModules.find(m => m.id === activeModule)?.icon || BookOpen, {
                      className: "w-6 h-6 mr-2 text-financial-accent"
                    })}
                    {availableModules.find(m => m.id === activeModule)?.title}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveModule(null)}>
                    ✕ Close
                  </Button>
                </div>
                <CardDescription>
                  Learn at your own pace through these interactive lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {availableModules.find(m => m.id === activeModule)?.content.lessons.map((lesson, index) => (
                    <Card key={index} className="border border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-financial-accent rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            {index + 1}
                          </div>
                          <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{lesson.content}</p>
                        <div className="flex items-center text-sm text-financial-accent">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Lesson Complete
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="text-center pt-4">
                    <Button 
                      size="lg"
                      onClick={() => {
                        const module = availableModules.find(m => m.id === activeModule);
                        if (module) {
                          userProgressHook.completeModule(module.personalizedXP);
                          setCompletedModuleIds(prev => [...prev, module.id]);
                        }
                        setActiveModule(null);
                      }}
                    >
                      Complete Module (+{availableModules.find(m => m.id === activeModule)?.personalizedXP} XP)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interactive Quiz Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Quick Quiz Challenge</h3>
          <Card className="glass-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-6 h-6 mr-2 text-financial-accent" />
                Financial Knowledge Quiz
              </CardTitle>
              <CardDescription>
                Test your knowledge! Question {currentQuiz + 1} of {quizQuestions.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentQuiz < quizQuestions.length ? (
                <div className="space-y-4">
                  <div className="mb-4">
                    <Progress value={((currentQuiz) / quizQuestions.length) * 100} className="h-2" />
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-4">
                    {quizQuestions[currentQuiz].question}
                  </h4>
                  
                  <div className="grid gap-3">
                    {quizQuestions[currentQuiz].options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto p-4"
                        onClick={() => handleQuizAnswer(index)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-4xl">🎉</div>
                  <h4 className="text-xl font-bold">Quiz Complete!</h4>
                  <p className="text-lg">
                    You scored {score} out of {quizQuestions.length}!
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button onClick={resetQuiz}>Try Again</Button>
                    <Button variant="outline">Next Quiz</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game Interface */}
        {selectedGame && (
          <div className="mb-16">
            <Card className="glass-card max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {React.createElement(games.find(g => g.id === selectedGame)?.icon || Play, {
                      className: "w-6 h-6 mr-2 text-financial-accent"
                    })}
                    {games.find(g => g.id === selectedGame)?.title}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedGame(null)}>
                    ✕ Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedGame === 'shopping-budget' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🛒</div>
                      <h4 className="text-xl font-bold">Smart Shopping Challenge</h4>
                      <p className="text-muted-foreground">You have $200 to buy groceries for your family this week. Make smart choices!</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-4">
                        <h5 className="font-bold text-financial-accent mb-4">Available Items</h5>
                        <div className="space-y-2">
                          {[
                            { name: 'Milk (1 gallon)', price: 4, essential: true },
                            { name: 'Bread (loaf)', price: 3, essential: true },
                            { name: 'Chicken (2 lbs)', price: 12, essential: true },
                            { name: 'Fresh Vegetables', price: 15, essential: true },
                            { name: 'Cereal (name brand)', price: 6, essential: false },
                            { name: 'Cereal (store brand)', price: 3, essential: false },
                            { name: 'Snack Chips', price: 5, essential: false },
                            { name: 'Ice Cream', price: 7, essential: false },
                            { name: 'Frozen Pizza', price: 8, essential: false }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center">
                                <span className={item.essential ? 'text-financial-accent font-medium' : 'text-muted-foreground'}>
                                  {item.name} {item.essential && '⭐'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold">${item.price}</span>
                                <Button 
                                  size="sm"
                                  disabled={gameState.shoppingBudget.spent + item.price > gameState.shoppingBudget.budget}
                                  onClick={() => {
                                    setGameState(prev => ({
                                      ...prev,
                                      shoppingBudget: {
                                        ...prev.shoppingBudget,
                                        spent: prev.shoppingBudget.spent + item.price,
                                        items: [...prev.shoppingBudget.items, item]
                                      }
                                    }));
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <h5 className="font-bold text-financial-accent mb-4">Your Cart</h5>
                        <div className="space-y-2 mb-4">
                          {gameState.shoppingBudget.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <span className="text-sm">{item.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold">${item.price}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setGameState(prev => ({
                                      ...prev,
                                      shoppingBudget: {
                                        ...prev.shoppingBudget,
                                        spent: prev.shoppingBudget.spent - item.price,
                                        items: prev.shoppingBudget.items.filter((_, i) => i !== index)
                                      }
                                    }));
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span>Budget:</span>
                            <span className="font-bold">${gameState.shoppingBudget.budget}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span>Spent:</span>
                            <span className="font-bold">${gameState.shoppingBudget.spent}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span>Remaining:</span>
                            <span className={`font-bold ${gameState.shoppingBudget.budget - gameState.shoppingBudget.spent < 0 ? 'text-red-500' : 'text-financial-accent'}`}>
                              ${gameState.shoppingBudget.budget - gameState.shoppingBudget.spent}
                            </span>
                          </div>
                          <Progress 
                            value={(gameState.shoppingBudget.spent / gameState.shoppingBudget.budget) * 100} 
                            className="mb-4" 
                          />
                          {gameState.shoppingBudget.items.filter(item => item.essential).length >= 4 && 
                           gameState.shoppingBudget.spent <= gameState.shoppingBudget.budget && (
                            <div className="text-center">
                              <div className="text-financial-accent font-bold mb-2">🎉 Great job! You got all essentials within budget!</div>
                             <Button 
                               onClick={() => {
                                 userProgressHook.completeGame('shopping-budget', 25);
                                 setSelectedGame(null);
                               }}
                             >
                               Complete Shopping (+25 XP)
                             </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {selectedGame === 'emergency-fund' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🚨</div>
                      <h4 className="text-xl font-bold">Emergency Fund Builder</h4>
                      <p className="text-muted-foreground">
                        Save 3 months of expenses ($7,500) for emergencies. Choose how much to save each month!
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-6">
                        <h5 className="font-bold text-financial-accent mb-4">Your Financial Situation</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Monthly Income:</span>
                            <span className="font-bold text-financial-accent">${gameState.emergencyFund.monthlyIncome}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Expenses:</span>
                            <span className="font-bold">${gameState.emergencyFund.expenses}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available to Save:</span>
                            <span className="font-bold text-financial-accent">
                              ${gameState.emergencyFund.monthlyIncome - gameState.emergencyFund.expenses}
                            </span>
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between">
                              <span>Current Month:</span>
                              <span className="font-bold">{gameState.emergencyFund.currentMonth}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 space-y-3">
                          <h6 className="font-medium">How much will you save this month?</h6>
                          <div className="grid grid-cols-2 gap-2">
                            {[100, 250, 400, 500].map((amount) => (
                              <Button 
                                key={amount}
                                variant="outline" 
                                size="sm"
                                disabled={amount > (gameState.emergencyFund.monthlyIncome - gameState.emergencyFund.expenses)}
                                onClick={() => {
                                  setGameState(prev => ({
                                    ...prev,
                                    emergencyFund: {
                                      ...prev.emergencyFund,
                                      savings: prev.emergencyFund.savings + amount,
                                      currentMonth: prev.emergencyFund.currentMonth + 1
                                    }
                                  }));
                                }}
                              >
                                ${amount}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </Card>
                      <Card className="p-6">
                        <h5 className="font-bold text-financial-accent mb-4">Emergency Fund Progress</h5>
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-financial-accent mb-2">
                            ${gameState.emergencyFund.savings}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Goal: ${gameState.emergencyFund.emergencyTarget}
                          </div>
                        </div>
                        <Progress 
                          value={(gameState.emergencyFund.savings / gameState.emergencyFund.emergencyTarget) * 100} 
                          className="h-4 mb-4" 
                        />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Progress:</span>
                            <span>{Math.round((gameState.emergencyFund.savings / gameState.emergencyFund.emergencyTarget) * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span>${Math.max(0, gameState.emergencyFund.emergencyTarget - gameState.emergencyFund.savings)}</span>
                          </div>
                        </div>
                        {gameState.emergencyFund.savings >= gameState.emergencyFund.emergencyTarget && (
                          <div className="mt-6 text-center">
                            <div className="text-financial-accent font-bold mb-2">🎉 Emergency Fund Complete!</div>
                            <p className="text-sm text-muted-foreground mb-4">
                              You're now protected against unexpected expenses!
                            </p>
                            <Button 
                              onClick={() => {
                                userProgressHook.completeGame('emergency-fund', 50);
                                setSelectedGame(null);
                              }}
                            >
                              Claim Achievement (+50 XP)
                            </Button>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                )}

                {selectedGame === 'career-choices' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎓</div>
                      <h4 className="text-xl font-bold">Career Path Simulator</h4>
                      <p className="text-muted-foreground">
                        Make smart choices about education and career to maximize your lifetime earnings!
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-6">
                        <h5 className="font-bold text-financial-accent mb-4">Education Choices</h5>
                        <div className="space-y-3">
                          {[
                            { name: 'High School Only', cost: 0, salaryBonus: 0, years: 0 },
                            { name: 'Trade School', cost: 15000, salaryBonus: 15000, years: 2 },
                            { name: 'Bachelor\'s Degree', cost: 40000, salaryBonus: 25000, years: 4 },
                            { name: 'Master\'s Degree', cost: 80000, salaryBonus: 45000, years: 6 }
                          ].map((option, index) => (
                            <Button 
                              key={index}
                              variant={gameState.careerChoices.education === option.cost ? "default" : "outline"}
                              className="w-full text-left justify-start p-4 h-auto"
                              onClick={() => {
                                setGameState(prev => ({
                                  ...prev,
                                  careerChoices: {
                                    ...prev.careerChoices,
                                    education: option.cost,
                                    salary: 35000 + option.salaryBonus
                                  }
                                }));
                              }}
                            >
                              <div>
                                <div className="font-medium">{option.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Cost: ${option.cost.toLocaleString()} | Years: {option.years} | Salary boost: +${option.salaryBonus.toLocaleString()}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </Card>
                      <Card className="p-6">
                        <h5 className="font-bold text-financial-accent mb-4">Career Simulation</h5>
                        <div className="space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <div className="text-2xl font-bold text-financial-accent mb-2">
                              ${gameState.careerChoices.salary.toLocaleString()}/year
                            </div>
                            <div className="text-sm text-muted-foreground">Annual Salary</div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Education Cost:</span>
                              <span className="font-bold text-red-500">-${gameState.careerChoices.education.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>40-Year Career Earnings:</span>
                              <span className="font-bold text-financial-accent">
                                ${(gameState.careerChoices.salary * 40).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-bold">Net Lifetime Earnings:</span>
                              <span className="font-bold text-financial-accent">
                                ${((gameState.careerChoices.salary * 40) - gameState.careerChoices.education).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {gameState.careerChoices.salary > 0 && (
                            <div className="text-center mt-6">
                              <Button 
                                onClick={() => {
                                  userProgressHook.completeGame('career-choices', 75);
                                  setSelectedGame(null);
                                }}
                              >
                                Start Career (+75 XP)
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Educational Games */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-center">Educational Games</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="glass-card card-float group cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <game.icon className="w-8 h-8 text-financial-gold-light" />
                  </div>
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{game.difficulty}</Badge>
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 mr-1 text-financial-gold" />
                      <span className="text-sm font-medium">{game.xp} XP</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-financial-accent transition-colors"
                    onClick={() => {
                      setSelectedGame(game.id);
                      userProgressHook.playGame(game.id);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Game
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4">Ready to Become a Money Master?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of students who are already learning smart money habits!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-financial-accent hover:bg-financial-accent/90">
                  Start Your Journey
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FinancialEducation;