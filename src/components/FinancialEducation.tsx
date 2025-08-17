import React, { useState } from 'react';
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
  Lightbulb
} from 'lucide-react';

const FinancialEducation = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [score, setScore] = useState(0);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [gameState, setGameState] = useState({
    piggyBank: { coins: 0, target: 100 },
    budgetBuilder: { income: 1000, expenses: 0, savings: 0 },
    investmentSim: { portfolio: 1000, growth: 0 }
  });
  const [userProgress, setUserProgress] = useState({
    level: 1,
    xp: 50,
    totalXP: 300,
    badges: ['first-quiz'],
    completedModules: 0
  });

  const educationModules = [
    {
      id: 'basics',
      title: 'Money Basics',
      description: 'Learn what money is and how it works',
      icon: Coins,
      level: 'Beginner',
      xp: 50,
      completed: false,
      color: 'bg-financial-gold',
      content: {
        lessons: [
          { title: 'What is Money?', content: 'Money is a tool we use to buy things we need and want.' },
          { title: 'Types of Money', content: 'Cash, coins, and digital money in banks.' },
          { title: 'Money vs Goods', content: 'We trade money for products and services.' }
        ]
      }
    },
    {
      id: 'saving',
      title: 'Smart Saving',
      description: 'Discover the power of saving money',
      icon: PiggyBank,
      level: 'Beginner',
      xp: 75,
      completed: false,
      color: 'bg-financial-accent',
      content: {
        lessons: [
          { title: 'Why Save Money?', content: 'Saving helps you buy bigger things later and be prepared for emergencies.' },
          { title: 'Where to Save', content: 'Piggy banks, savings accounts, and safe places.' },
          { title: 'Setting Savings Goals', content: 'Decide what you want to save for and how much you need.' }
        ]
      }
    },
    {
      id: 'budgeting',
      title: 'Budget Like a Pro',
      description: 'Create and manage your first budget',
      icon: Target,
      level: 'Intermediate',
      xp: 100,
      completed: false,
      color: 'bg-accent',
      content: {
        lessons: [
          { title: 'What is a Budget?', content: 'A plan that shows how much money you have and how to spend it wisely.' },
          { title: 'Income vs Expenses', content: 'Money coming in (income) and money going out (expenses).' },
          { title: 'Making Your Budget', content: 'Write down your money and plan how to use it.' }
        ]
      }
    },
    {
      id: 'investing',
      title: 'Investment Adventures',
      description: 'Learn how money can grow over time',
      icon: TrendingUp,
      level: 'Intermediate',
      xp: 125,
      completed: false,
      color: 'bg-financial-primary',
      content: {
        lessons: [
          { title: 'What is Investing?', content: 'Putting money into things that can grow in value over time.' },
          { title: 'Types of Investments', content: 'Stocks, bonds, and savings accounts that earn interest.' },
          { title: 'Risk and Reward', content: 'Higher rewards often come with higher risks.' }
        ]
      }
    }
  ];

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
      id: 'piggy-bank',
      title: 'Piggy Bank Challenge',
      description: 'Save coins and watch your money grow!',
      icon: PiggyBank,
      difficulty: 'Easy',
      xp: 25
    },
    {
      id: 'budget-builder',
      title: 'Budget Builder',
      description: 'Create the perfect budget for different scenarios',
      icon: Target,
      difficulty: 'Medium',
      xp: 50
    },
    {
      id: 'investment-simulator',
      title: 'Investment Simulator',
      description: 'Make smart investment choices and see results',
      icon: TrendingUp,
      difficulty: 'Hard',
      xp: 75
    }
  ];

  const badges = [
    { id: 'first-quiz', name: 'Quiz Master', icon: Brain, earned: true },
    { id: 'saving-star', name: 'Saving Star', icon: Star, earned: true },
    { id: 'budget-boss', name: 'Budget Boss', icon: Trophy, earned: false },
    { id: 'investment-pro', name: 'Investment Pro', icon: Award, earned: false }
  ];

  const handleQuizAnswer = (selectedOption: number) => {
    if (selectedOption === quizQuestions[currentQuiz].correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuiz < quizQuestions.length - 1) {
        setCurrentQuiz(currentQuiz + 1);
      } else {
        // Quiz completed
        setUserProgress(prev => ({
          ...prev,
          xp: prev.xp + 25,
          completedModules: prev.completedModules + (score >= 2 ? 1 : 0)
        }));
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
                <CardDescription>Level {userProgress.level} Student</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-financial-accent">{userProgress.xp} XP</div>
                <div className="text-sm text-muted-foreground">
                  Next level: {Math.max(0, userProgress.totalXP - userProgress.xp)} XP
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to Level {userProgress.level + 1}</span>
                  <span>{Math.min(100, Math.round((userProgress.xp / userProgress.totalXP) * 100))}%</span>
                </div>
                <Progress value={Math.min(100, (userProgress.xp / userProgress.totalXP) * 100)} className="h-3" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1 text-financial-accent" />
                    <span className="text-sm">{userProgress.completedModules} modules completed</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1 text-financial-gold" />
                    <span className="text-sm">{badges.filter(b => b.earned).length} badges earned</span>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  {badges.slice(0, 4).map((badge) => (
                    <div
                      key={badge.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        badge.earned 
                          ? 'bg-financial-gold text-financial-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <badge.icon className="w-4 h-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Modules */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Learning Modules</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {educationModules.map((module) => (
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
                      <span className="text-sm font-medium">{module.xp} XP</span>
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
                      onClick={() => setActiveModule(module.id)}
                    >
                      Start Learning
                    </Button>
                  )}
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
                    {React.createElement(educationModules.find(m => m.id === activeModule)?.icon || BookOpen, {
                      className: "w-6 h-6 mr-2 text-financial-accent"
                    })}
                    {educationModules.find(m => m.id === activeModule)?.title}
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
                  {educationModules.find(m => m.id === activeModule)?.content.lessons.map((lesson, index) => (
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
                        const module = educationModules.find(m => m.id === activeModule);
                        if (module) {
                          setUserProgress(prev => ({
                            ...prev,
                            xp: prev.xp + module.xp,
                            completedModules: prev.completedModules + 1
                          }));
                          // Mark module as completed
                          module.completed = true;
                        }
                        setActiveModule(null);
                      }}
                    >
                      Complete Module (+{educationModules.find(m => m.id === activeModule)?.xp} XP)
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
                {selectedGame === 'piggy-bank' && (
                  <div className="text-center space-y-6">
                    <div className="text-6xl mb-4">🐷</div>
                    <h4 className="text-xl font-bold">Piggy Bank Challenge</h4>
                    <div className="bg-muted/30 rounded-lg p-6">
                      <div className="text-3xl font-bold text-financial-accent mb-2">
                        ${gameState.piggyBank.coins}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Goal: ${gameState.piggyBank.target}
                      </div>
                      <Progress 
                        value={(gameState.piggyBank.coins / gameState.piggyBank.target) * 100} 
                        className="h-4 mb-4" 
                      />
                      <div className="flex justify-center space-x-3">
                        <Button 
                          onClick={() => {
                            setGameState(prev => ({
                              ...prev,
                              piggyBank: { ...prev.piggyBank, coins: prev.piggyBank.coins + 5 }
                            }));
                          }}
                        >
                          Add $5
                        </Button>
                        <Button 
                          onClick={() => {
                            setGameState(prev => ({
                              ...prev,
                              piggyBank: { ...prev.piggyBank, coins: prev.piggyBank.coins + 10 }
                            }));
                          }}
                        >
                          Add $10
                        </Button>
                        <Button 
                          onClick={() => {
                            setGameState(prev => ({
                              ...prev,
                              piggyBank: { ...prev.piggyBank, coins: prev.piggyBank.coins + 25 }
                            }));
                          }}
                        >
                          Add $25
                        </Button>
                      </div>
                      {gameState.piggyBank.coins >= gameState.piggyBank.target && (
                        <div className="mt-4 p-4 bg-financial-accent/20 rounded-lg">
                          <div className="text-lg font-bold text-financial-accent">🎉 Goal Reached!</div>
                          <Button 
                            className="mt-2"
                            onClick={() => {
                              setUserProgress(prev => ({ ...prev, xp: prev.xp + 25 }));
                              setSelectedGame(null);
                            }}
                          >
                            Collect Reward (+25 XP)
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedGame === 'budget-builder' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl mb-4">💰</div>
                      <h4 className="text-xl font-bold">Budget Builder</h4>
                      <p className="text-muted-foreground">Create a balanced budget!</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <h5 className="font-bold text-financial-accent mb-2">Income</h5>
                        <div className="text-2xl font-bold">${gameState.budgetBuilder.income}</div>
                      </Card>
                      <Card className="p-4">
                        <h5 className="font-bold text-red-500 mb-2">Expenses</h5>
                        <div className="text-2xl font-bold">${gameState.budgetBuilder.expenses}</div>
                        <div className="space-y-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setGameState(prev => ({
                                ...prev,
                                budgetBuilder: { ...prev.budgetBuilder, expenses: prev.budgetBuilder.expenses + 100 }
                              }));
                            }}
                          >
                            Rent (+$100)
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setGameState(prev => ({
                                ...prev,
                                budgetBuilder: { ...prev.budgetBuilder, expenses: prev.budgetBuilder.expenses + 50 }
                              }));
                            }}
                          >
                            Food (+$50)
                          </Button>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <h5 className="font-bold text-financial-accent mb-2">Savings</h5>
                        <div className="text-2xl font-bold">
                          ${gameState.budgetBuilder.income - gameState.budgetBuilder.expenses}
                        </div>
                        {(gameState.budgetBuilder.income - gameState.budgetBuilder.expenses) > 0 && (
                          <div className="mt-4">
                            <div className="text-sm text-financial-accent font-medium">Great job! 🎉</div>
                            <Button 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setUserProgress(prev => ({ ...prev, xp: prev.xp + 50 }));
                                setSelectedGame(null);
                              }}
                            >
                              Complete (+50 XP)
                            </Button>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                )}

                {selectedGame === 'investment-simulator' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📈</div>
                      <h4 className="text-xl font-bold">Investment Simulator</h4>
                      <p className="text-muted-foreground">Watch your money grow!</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-financial-accent mb-2">
                        ${gameState.investmentSim.portfolio}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">Portfolio Value</div>
                      <div className="flex justify-center space-x-3 mb-4">
                        <Button 
                          onClick={() => {
                            const growth = Math.random() > 0.5 ? 50 : -25;
                            setGameState(prev => ({
                              ...prev,
                              investmentSim: { 
                                ...prev.investmentSim, 
                                portfolio: Math.max(0, prev.investmentSim.portfolio + growth),
                                growth: growth
                              }
                            }));
                          }}
                        >
                          Invest in Stocks
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            const growth = 25;
                            setGameState(prev => ({
                              ...prev,
                              investmentSim: { 
                                ...prev.investmentSim, 
                                portfolio: prev.investmentSim.portfolio + growth,
                                growth: growth
                              }
                            }));
                          }}
                        >
                          Safe Savings
                        </Button>
                      </div>
                      {gameState.investmentSim.growth !== 0 && (
                        <div className={`p-3 rounded-lg ${gameState.investmentSim.growth > 0 ? 'bg-financial-accent/20' : 'bg-red-500/20'}`}>
                          <div className={`font-bold ${gameState.investmentSim.growth > 0 ? 'text-financial-accent' : 'text-red-500'}`}>
                            {gameState.investmentSim.growth > 0 ? '+' : ''}${gameState.investmentSim.growth}
                          </div>
                        </div>
                      )}
                      {gameState.investmentSim.portfolio >= 1200 && (
                        <div className="mt-4">
                          <Button 
                            onClick={() => {
                              setUserProgress(prev => ({ ...prev, xp: prev.xp + 75 }));
                              setSelectedGame(null);
                            }}
                          >
                            Cash Out (+75 XP)
                          </Button>
                        </div>
                      )}
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
                    onClick={() => setSelectedGame(game.id)}
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