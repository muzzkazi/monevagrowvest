import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Gift,
  Heart,
  Home,
  Car,
  Smartphone,
  Coffee,
  ShoppingCart,
  CreditCard,
  Banknote,
  Calculator,
  LineChart,
  Users,
  Briefcase,
  GraduationCap,
  Timer,
  DollarSign,
  Zap,
  AlertTriangle,
  Gamepad2
} from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useModuleGenerator } from '@/hooks/useModuleGenerator';
import { useBadgeSystem } from '@/hooks/useBadgeSystem';
import InvestmentSimulation from './InvestmentSimulation';

interface ScenarioStep {
  id: string;
  title: string;
  description: string;
  choices: {
    text: string;
    consequence: string;
    moneyImpact: number;
    wisdomPoints: number;
  }[];
}

interface GameState {
  currentScenario: string;
  currentStep: number;
  money: number;
  wisdomPoints: number;
  decisions: string[];
  gameComplete: boolean;
}

const FinancialEducation = () => {
  const [activeTab, setActiveTab] = useState('journey');
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: '',
    currentStep: 0,
    money: 1000,
    wisdomPoints: 0,
    decisions: [],
    gameComplete: false
  });
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [simulationActive, setSimulationActive] = useState(false);

  // Use the dynamic system
  const userProgressHook = useUserProgress();
  const { availableModules, nextModules, progressionTips } = useModuleGenerator(
    userProgressHook.progress.behavior, 
    completedModuleIds
  );
  const { earnedBadges, nextBadges, progressTips: badgeProgressTips } = useBadgeSystem(
    userProgressHook.progress.behavior, 
    earnedBadgeIds
  );

  // Real-world financial scenarios
  const scenarios = {
    'college-dilemma': {
      id: 'college-dilemma',
      title: 'The College Choice Crisis',
      icon: GraduationCap,
      description: 'Maya just got accepted to her dream university, but the tuition is $50,000/year. Help her make the right financial decision.',
      initialMoney: 15000,
      steps: [
        {
          id: 'decision-point',
          title: 'The Big Decision',
          description: 'Maya has $15,000 saved and her parents can contribute $20,000/year. She needs to choose her path.',
          choices: [
            {
              text: 'Take out $60,000 in student loans for dream school',
              consequence: 'High debt but prestigious degree. Monthly payments: $600 for 10 years after graduation.',
              moneyImpact: -60000,
              wisdomPoints: 2
            },
            {
              text: 'Choose community college for 2 years, then transfer',
              consequence: 'Save $40,000 in tuition. Same degree, lower cost, but different experience.',
              moneyImpact: -20000,
              wisdomPoints: 8
            },
            {
              text: 'Work part-time while studying at state university',
              consequence: 'Takes 5 years to graduate but only $15,000 debt. Real work experience gained.',
              moneyImpact: -15000,
              wisdomPoints: 10
            }
          ]
        }
      ]
    },
    'first-apartment': {
      id: 'first-apartment',
      title: 'First Apartment Adventure',
      icon: Home,
      description: 'Alex just landed their first job earning $3,500/month. Time to find a place to live!',
      initialMoney: 5000,
      steps: [
        {
          id: 'housing-budget',
          title: 'Setting Your Housing Budget',
          description: 'Financial experts recommend spending no more than 30% of income on housing. What should Alex do?',
          choices: [
            {
              text: 'Rent a luxury studio for $1,800/month (51% of income)',
              consequence: 'Beautiful place but leaves only $1,700 for everything else. Risky!',
              moneyImpact: -1800,
              wisdomPoints: 1
            },
            {
              text: 'Get a modest 1BR for $1,050/month (30% of income)',
              consequence: 'Perfect budget balance. $2,450 left for other expenses and savings.',
              moneyImpact: -1050,
              wisdomPoints: 8
            },
            {
              text: 'Share a 2BR apartment for $600/month (17% of income)',
              consequence: 'Great savings! $2,900 left over. Roommate situation to navigate.',
              moneyImpact: -600,
              wisdomPoints: 10
            }
          ]
        }
      ]
    },
    'emergency-strikes': {
      id: 'emergency-strikes',
      title: 'When Life Happens',
      icon: AlertTriangle,
      description: 'Sarah has been working for 2 years when her car breaks down. Repair cost: $2,400. What should she do?',
      initialMoney: 800,
      steps: [
        {
          id: 'emergency-response',
          title: 'The Emergency Fund Test',
          description: 'Sarah only has $800 in savings. Her car needs immediate repair to get to work.',
          choices: [
            {
              text: 'Put it on a credit card (24% APR)',
              consequence: 'Quick fix but will cost $3,100 total if paying minimum. Debt trap risk.',
              moneyImpact: -2400,
              wisdomPoints: 2
            },
            {
              text: 'Take a personal loan (12% APR)',
              consequence: 'Better than credit card. Total cost: $2,650 over 2 years.',
              moneyImpact: -2400,
              wisdomPoints: 5
            },
            {
              text: 'Ask family for help, arrange payment plan',
              consequence: 'No interest but potential family stress. Create formal agreement.',
              moneyImpact: -2400,
              wisdomPoints: 7
            },
            {
              text: 'Buy used car for $1,500, fix later when affordable',
              consequence: 'Immediate solution with available money. Emergency fund preserved.',
              moneyImpact: -1500,
              wisdomPoints: 9
            }
          ]
        }
      ]
    }
  };

  // Investment simulation game
  const investmentGame = {
    scenarios: [
      { year: 1, event: 'Market is stable', return: 0.07 },
      { year: 2, event: 'Tech bubble burst!', return: -0.20 },
      { year: 3, event: 'Market recovery begins', return: 0.15 },
      { year: 4, event: 'Inflation concerns', return: 0.03 },
      { year: 5, event: 'Strong economic growth', return: 0.12 },
    ]
  };

  const startScenario = (scenarioId: string) => {
    const scenario = scenarios[scenarioId as keyof typeof scenarios];
    setGameState({
      currentScenario: scenarioId,
      currentStep: 0,
      money: scenario.initialMoney,
      wisdomPoints: 0,
      decisions: [],
      gameComplete: false
    });
    setSimulationActive(true);
  };

  const makeChoice = (choiceIndex: number) => {
    const scenario = scenarios[gameState.currentScenario as keyof typeof scenarios];
    const currentStep = scenario.steps[gameState.currentStep];
    const choice = currentStep.choices[choiceIndex];
    
    setGameState(prev => ({
      ...prev,
      money: prev.money + choice.moneyImpact,
      wisdomPoints: prev.wisdomPoints + choice.wisdomPoints,
      decisions: [...prev.decisions, choice.text],
      currentStep: prev.currentStep + 1,
      gameComplete: prev.currentStep + 1 >= scenario.steps.length
    }));

    // Award XP based on wisdom points earned
    if (choice.wisdomPoints > 0) {
      userProgressHook.addXP(choice.wisdomPoints * 5);
    }
  };

  const resetGame = () => {
    setGameState({
      currentScenario: '',
      currentStep: 0,
      money: 0,
      wisdomPoints: 0,
      decisions: [],
      gameComplete: false
    });
    setSimulationActive(false);
  };

  // Auto-update badge earnings
  useEffect(() => {
    const newlyEarnedBadges = earnedBadges
      .filter(badge => badge.earned && !earnedBadgeIds.includes(badge.id))
      .map(badge => badge.id);
    
    if (newlyEarnedBadges.length > 0) {
      setEarnedBadgeIds(prev => [...prev, ...newlyEarnedBadges]);
      const totalBadgeXP = earnedBadges
        .filter(badge => newlyEarnedBadges.includes(badge.id))
        .reduce((total, badge) => total + badge.xpReward, 0);
      
      if (totalBadgeXP > 0) {
        userProgressHook.addXP(totalBadgeXP);
      }
    }
  }, [earnedBadges, earnedBadgeIds, userProgressHook]);

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
            <Gamepad2 className="w-4 h-4 mr-2" />
            Interactive Learning
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Real-World Financial
            <span className="text-financial-accent"> Adventures</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience realistic financial scenarios, make tough decisions, and learn from the consequences. 
            Build money wisdom through interactive storytelling and hands-on simulations.
          </p>
        </div>

        {/* User Progress Dashboard */}
        <Card className="glass-card mb-8 max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-financial-gold" />
                  Financial Wisdom Level {userProgressHook.progress.level}
                </CardTitle>
                <CardDescription>Money decision-maker in training</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-financial-accent">{userProgressHook.progress.xp} XP</div>
                <div className="text-sm text-muted-foreground">Wisdom Points Earned</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-financial-accent" />
                <span className="text-sm">{userProgressHook.progress.behavior.modulesCompleted} scenarios mastered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-financial-gold" />
                <span className="text-sm">{earnedBadges.length} achievements unlocked</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-sm">{userProgressHook.progress.behavior.streakDays} day learning streak</span>
              </div>
            </div>
            
            <Progress value={Math.min(100, (userProgressHook.progress.xp / userProgressHook.progress.totalXP) * 100)} className="h-3" />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="journey" className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Life Scenarios
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center">
              <LineChart className="w-4 h-4 mr-2" />
              Investment Sim
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn & Grow
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Life Scenarios Tab */}
          <TabsContent value="journey" className="space-y-8">
            {!simulationActive ? (
              <>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Choose Your Financial Adventure</h3>
                  <p className="text-muted-foreground">Real situations, real consequences, real learning</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.values(scenarios).map((scenario) => (
                    <Card key={scenario.id} className="glass-card group cursor-pointer hover:scale-105 transition-all duration-300">
                      <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-financial-primary to-financial-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                          <scenario.icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-xl">{scenario.title}</CardTitle>
                        <CardDescription className="text-sm">{scenario.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="flex items-center justify-center mb-4">
                          <DollarSign className="w-4 h-4 mr-1 text-financial-gold" />
                          <span className="text-sm font-medium">Starting: ${scenario.initialMoney.toLocaleString()}</span>
                        </div>
                        <Button 
                          className="w-full group-hover:bg-financial-accent group-hover:text-white transition-colors"
                          onClick={() => startScenario(scenario.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Adventure
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              // Active Scenario Interface
              <div className="max-w-4xl mx-auto">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-2xl">
                          {React.createElement(
                            scenarios[gameState.currentScenario as keyof typeof scenarios].icon,
                            { className: "w-6 h-6 mr-2 text-financial-accent" }
                          )}
                          {scenarios[gameState.currentScenario as keyof typeof scenarios].title}
                        </CardTitle>
                        <CardDescription>Make your choices and see the financial impact</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-financial-accent">${gameState.money.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{gameState.wisdomPoints} wisdom points</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!gameState.gameComplete ? (
                      <div className="space-y-6">
                        {/* Current Step */}
                        {gameState.currentStep < scenarios[gameState.currentScenario as keyof typeof scenarios].steps.length && (
                          <div>
                            <h4 className="text-xl font-bold mb-3">
                              {scenarios[gameState.currentScenario as keyof typeof scenarios].steps[gameState.currentStep].title}
                            </h4>
                            <p className="text-muted-foreground mb-6">
                              {scenarios[gameState.currentScenario as keyof typeof scenarios].steps[gameState.currentStep].description}
                            </p>
                            
                            <div className="grid gap-4">
                              {scenarios[gameState.currentScenario as keyof typeof scenarios].steps[gameState.currentStep].choices.map((choice, index) => (
                                <Card 
                                  key={index} 
                                  className="cursor-pointer hover:bg-accent/5 border-2 hover:border-financial-accent transition-all"
                                  onClick={() => makeChoice(index)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="font-medium mb-2">{choice.text}</p>
                                        <p className="text-sm text-muted-foreground">{choice.consequence}</p>
                                      </div>
                                      <div className="text-right ml-4">
                                        <div className={`text-sm font-bold ${choice.moneyImpact < 0 ? 'text-destructive' : 'text-accent'}`}>
                                          {choice.moneyImpact < 0 ? '-' : '+'}${Math.abs(choice.moneyImpact).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-financial-gold">+{choice.wisdomPoints} wisdom</div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Game Complete
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-financial-gold to-financial-accent rounded-full flex items-center justify-center mx-auto">
                          <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold mb-2">Adventure Complete!</h4>
                          <p className="text-muted-foreground">You've navigated this financial challenge</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
                          <div className="bg-accent/10 rounded-lg p-4">
                            <div className="text-lg font-bold text-financial-accent">${gameState.money.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Final Amount</div>
                          </div>
                          <div className="bg-financial-gold/10 rounded-lg p-4">
                            <div className="text-lg font-bold text-financial-gold">{gameState.wisdomPoints}</div>
                            <div className="text-sm text-muted-foreground">Wisdom Points</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button onClick={resetGame} className="mr-4">
                            Try Another Scenario
                          </Button>
                          <Button variant="outline" onClick={() => setActiveTab('achievements')}>
                            View Achievements
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Investment Simulation Tab */}
          <TabsContent value="simulation" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Investment Time Machine</h3>
              <p className="text-muted-foreground">Experience 20 years of market volatility in 5 minutes</p>
            </div>
            
            <InvestmentSimulation /></TabsContent>

          {/* Learning Modules Tab */}
          <TabsContent value="modules" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Knowledge Building</h3>
              <p className="text-muted-foreground">Build your foundation with bite-sized lessons</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableModules.map((module) => (
                <Card key={module.id} className="glass-card group cursor-pointer hover:scale-105 transition-all">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${module.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform`}>
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
                        <span className="text-sm">Mastered</span>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          userProgressHook.completeModule(module.personalizedXP);
                          setCompletedModuleIds(prev => [...prev, module.id]);
                        }}
                      >
                        Quick Learn
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Your Financial Journey</h3>
              <p className="text-muted-foreground">Track your progress and celebrate your achievements</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Earned Badges */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-6 h-6 mr-2 text-financial-gold" />
                    Earned Achievements
                  </CardTitle>
                  <CardDescription>{earnedBadges.length} badges unlocked</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {earnedBadges.length > 0 ? (
                      earnedBadges.map((badge) => (
                        <div key={badge.id} className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            badge.rarity === 'Legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            badge.rarity === 'Epic' ? 'bg-purple-500' :
                            badge.rarity === 'Rare' ? 'bg-blue-500' : 'bg-muted'
                          }`}>
                            <badge.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-medium">{badge.name}</h6>
                            <p className="text-sm text-muted-foreground">{badge.description}</p>
                          </div>
                          <Badge variant="secondary">{badge.rarity}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Start your financial journey to earn badges!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Next Achievements */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-6 h-6 mr-2 text-financial-accent" />
                    Next Goals
                  </CardTitle>
                  <CardDescription>Coming up achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nextBadges.slice(0, 5).map((badge) => (
                      <div key={badge.id} className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg opacity-75">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <badge.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h6 className="font-medium text-muted-foreground">{badge.name}</h6>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-financial-gold">+{badge.xpReward} XP</div>
                          <Badge variant="outline" className="text-xs">{badge.rarity}</Badge>
                        </div>
                      </div>
                    ))}
                    
                    {/* Progress Tips */}
                    {badgeProgressTips.length > 0 && (
                      <div className="mt-6 p-4 bg-financial-accent/5 rounded-lg">
                        <h6 className="font-medium mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-1 text-financial-accent" />
                          Pro Tips
                        </h6>
                        <div className="space-y-1">
                          {badgeProgressTips.slice(0, 2).map((tip, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {tip}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default FinancialEducation;