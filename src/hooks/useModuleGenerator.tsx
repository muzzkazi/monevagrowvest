import { useMemo } from 'react';
import { Coins, PiggyBank, Target, TrendingUp, BookOpen, Calculator, Shield, CreditCard } from 'lucide-react';
import { ModuleTemplate, DynamicModule, UserBehavior } from '@/types/education';

const moduleTemplates: ModuleTemplate[] = [
  {
    id: 'basics',
    title: 'Money Basics',
    description: 'Learn what money is and how it works',
    icon: Coins,
    level: 'Beginner',
    baseXP: 50,
    color: 'bg-financial-gold',
    prerequisites: [],
    unlockCriteria: () => true, // Always available
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
    baseXP: 75,
    color: 'bg-financial-accent',
    prerequisites: ['basics'],
    unlockCriteria: (behavior) => behavior.questionsCorrect >= 1,
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
    baseXP: 100,
    color: 'bg-accent',
    prerequisites: ['saving'],
    unlockCriteria: (behavior) => behavior.modulesCompleted >= 1 || behavior.budgetingAttempts >= 1,
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
    baseXP: 125,
    color: 'bg-financial-primary',
    prerequisites: ['budgeting'],
    unlockCriteria: (behavior) => behavior.modulesCompleted >= 2 && behavior.highestQuizScore >= 2,
    content: {
      lessons: [
        { title: 'What is Investing?', content: 'Putting money into things that can grow in value over time.' },
        { title: 'Types of Investments', content: 'Stocks, bonds, and savings accounts that earn interest.' },
        { title: 'Risk and Reward', content: 'Higher rewards often come with higher risks.' }
      ]
    }
  },
  {
    id: 'emergency-planning',
    title: 'Emergency Planning',
    description: 'Build your financial safety net',
    icon: Shield,
    level: 'Intermediate',
    baseXP: 100,
    color: 'bg-destructive',
    prerequisites: ['budgeting'],
    unlockCriteria: (behavior) => behavior.gamesPlayed.includes('emergency-fund') || behavior.emergencyFundBuilt,
    content: {
      lessons: [
        { title: 'What are Financial Emergencies?', content: 'Unexpected expenses like medical bills or car repairs.' },
        { title: 'Emergency Fund Basics', content: 'Save 3-6 months of expenses for unexpected situations.' },
        { title: 'Building Your Safety Net', content: 'Start small and build your emergency fund over time.' }
      ]
    }
  },
  {
    id: 'career-finance',
    title: 'Career & Finance',
    description: 'Make smart career decisions for financial success',
    icon: Calculator,
    level: 'Advanced',
    baseXP: 150,
    color: 'bg-primary',
    prerequisites: ['investing'],
    unlockCriteria: (behavior) => behavior.careerSimulationCompleted || behavior.modulesCompleted >= 3,
    content: {
      lessons: [
        { title: 'Education ROI', content: 'Calculate the return on investment of different education paths.' },
        { title: 'Career Planning', content: 'Choose careers that align with your financial goals.' },
        { title: 'Salary Negotiation', content: 'Learn to negotiate for better compensation.' }
      ]
    }
  },
  {
    id: 'credit-basics',
    title: 'Credit & Debt',
    description: 'Understanding credit scores and managing debt',
    icon: CreditCard,
    level: 'Advanced',
    baseXP: 125,
    color: 'bg-warning',
    prerequisites: ['career-finance'],
    unlockCriteria: (behavior) => behavior.streakDays >= 7 && behavior.modulesCompleted >= 4,
    content: {
      lessons: [
        { title: 'What is Credit?', content: 'Credit allows you to borrow money that you pay back later.' },
        { title: 'Credit Scores', content: 'A number that shows how good you are at paying back borrowed money.' },
        { title: 'Good vs Bad Debt', content: 'Some debt helps you build wealth, other debt costs you money.' }
      ]
    }
  },
  {
    id: 'advanced-investing',
    title: 'Advanced Investing',
    description: 'Master complex investment strategies',
    icon: BookOpen,
    level: 'Advanced',
    baseXP: 200,
    color: 'bg-secondary',
    prerequisites: ['credit-basics'],
    unlockCriteria: (behavior) => behavior.gamesCompleted.length >= 3 && behavior.modulesCompleted >= 5,
    content: {
      lessons: [
        { title: 'Portfolio Diversification', content: 'Spread your investments to reduce risk.' },
        { title: 'Compound Interest', content: 'How your money grows exponentially over time.' },
        { title: 'Investment Strategies', content: 'Different approaches to building long-term wealth.' }
      ]
    }
  }
];

export const useModuleGenerator = (behavior: UserBehavior, completedModules: string[] = []) => {
  const availableModules = useMemo((): DynamicModule[] => {
    return moduleTemplates
      .filter(template => {
        // Check if prerequisites are met
        const prerequisitesMet = template.prerequisites.every(prereq => 
          completedModules.includes(prereq)
        );
        
        // Check if unlock criteria is met
        const criteriasMet = template.unlockCriteria(behavior);
        
        return prerequisitesMet && criteriasMet;
      })
      .map(template => ({
        ...template,
        completed: completedModules.includes(template.id),
        unlockedAt: new Date(),
        personalizedXP: Math.round(template.baseXP * (1 + behavior.streakDays * 0.1)),
      }));
  }, [behavior, completedModules]);

  const nextModules = useMemo((): ModuleTemplate[] => {
    return moduleTemplates
      .filter(template => {
        const isAlreadyAvailable = availableModules.some(available => available.id === template.id);
        const prerequisitesMet = template.prerequisites.every(prereq => 
          completedModules.includes(prereq)
        );
        
        return !isAlreadyAvailable && prerequisitesMet;
      })
      .slice(0, 3); // Show next 3 potential modules
  }, [availableModules, completedModules]);

  return {
    availableModules,
    nextModules,
    totalModulesUnlocked: availableModules.length,
    progressionTips: generateProgressionTips(behavior, nextModules),
  };
};

const generateProgressionTips = (behavior: UserBehavior, nextModules: ModuleTemplate[]): string[] => {
  const tips: string[] = [];
  
  if (nextModules.length === 0) {
    tips.push("🎉 You've unlocked all available modules! Keep practicing to maintain your skills.");
    return tips;
  }

  nextModules.forEach(module => {
    const unmetCriteria = !module.unlockCriteria(behavior);
    if (unmetCriteria) {
      switch (module.id) {
        case 'saving':
          tips.push("💡 Answer quiz questions correctly to unlock Smart Saving module");
          break;
        case 'budgeting':
          tips.push("💡 Complete a module or try the budgeting game to unlock Budget Like a Pro");
          break;
        case 'investing':
          tips.push("💡 Complete 2 modules and score well on quizzes to unlock Investment Adventures");
          break;
        case 'emergency-planning':
          tips.push("💡 Try the Emergency Fund Builder game to unlock Emergency Planning");
          break;
        case 'career-finance':
          tips.push("💡 Complete the Career Simulation or finish 3 modules to unlock Career & Finance");
          break;
        case 'credit-basics':
          tips.push("💡 Maintain a 7-day learning streak and complete 4 modules to unlock Credit & Debt");
          break;
        case 'advanced-investing':
          tips.push("💡 Complete all 3 games and 5 modules to unlock Advanced Investing");
          break;
      }
    }
  });

  return tips.slice(0, 2); // Limit to 2 tips to avoid overwhelming
};