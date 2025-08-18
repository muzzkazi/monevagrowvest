import { useMemo } from 'react';
import { Brain, Star, Trophy, Award, Target, Zap, Crown, Gem, Flame, Medal } from 'lucide-react';
import { BadgeTemplate, DynamicBadge, UserBehavior } from '@/types/education';

const badgeTemplates: BadgeTemplate[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Started your financial education journey',
    icon: Star,
    rarity: 'Common',
    unlockCriteria: (behavior) => behavior.modulesStarted >= 1,
    xpReward: 10,
  },
  {
    id: 'quiz-novice',
    name: 'Quiz Novice',
    description: 'Completed your first quiz',
    icon: Brain,
    rarity: 'Common',
    unlockCriteria: (behavior) => behavior.quizzesCompleted >= 1,
    xpReward: 15,
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Got all questions right in a quiz',
    icon: Trophy,
    rarity: 'Rare',
    unlockCriteria: (behavior) => behavior.highestQuizScore >= 3,
    xpReward: 25,
  },
  {
    id: 'module-master',
    name: 'Module Master',
    description: 'Completed 3 learning modules',
    icon: Award,
    rarity: 'Rare',
    unlockCriteria: (behavior) => behavior.modulesCompleted >= 3,
    xpReward: 30,
  },
  {
    id: 'game-explorer',
    name: 'Game Explorer',
    description: 'Played all educational games',
    icon: Target,
    rarity: 'Rare',
    unlockCriteria: (behavior) => behavior.gamesPlayed.length >= 3,
    xpReward: 35,
  },
  {
    id: 'budgeting-pro',
    name: 'Budgeting Pro',
    description: 'Successfully completed the shopping challenge',
    icon: Zap,
    rarity: 'Epic',
    unlockCriteria: (behavior) => behavior.gamesCompleted.includes('shopping-budget'),
    xpReward: 40,
  },
  {
    id: 'emergency-ready',
    name: 'Emergency Ready',
    description: 'Built a complete emergency fund',
    icon: Medal,
    rarity: 'Epic',
    unlockCriteria: (behavior) => behavior.emergencyFundBuilt,
    xpReward: 50,
  },
  {
    id: 'career-strategist',
    name: 'Career Strategist',
    description: 'Completed the career path simulation',
    icon: Crown,
    rarity: 'Epic',
    unlockCriteria: (behavior) => behavior.careerSimulationCompleted,
    xpReward: 45,
  },
  {
    id: 'streak-champion',
    name: 'Streak Champion',
    description: 'Maintained a 7-day learning streak',
    icon: Flame,
    rarity: 'Epic',
    unlockCriteria: (behavior) => behavior.streakDays >= 7,
    xpReward: 60,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Completed all available modules',
    icon: Gem,
    rarity: 'Legendary',
    unlockCriteria: (behavior) => behavior.modulesCompleted >= 5,
    xpReward: 100,
  },
  {
    id: 'financial-guru',
    name: 'Financial Guru',
    description: 'Mastered all games and scored perfectly on quizzes',
    icon: Crown,
    rarity: 'Legendary',
    unlockCriteria: (behavior) => 
      behavior.gamesCompleted.length >= 3 && 
      behavior.highestQuizScore >= 3 && 
      behavior.modulesCompleted >= 4,
    xpReward: 150,
  },
];

export const useBadgeSystem = (behavior: UserBehavior, earnedBadgeIds: string[] = []) => {
  const availableBadges = useMemo((): DynamicBadge[] => {
    return badgeTemplates.map(template => ({
      ...template,
      earned: earnedBadgeIds.includes(template.id) || template.unlockCriteria(behavior),
      earnedAt: earnedBadgeIds.includes(template.id) ? new Date() : undefined,
    }));
  }, [behavior, earnedBadgeIds]);

  const earnedBadges = useMemo(() => {
    return availableBadges.filter(badge => badge.earned);
  }, [availableBadges]);

  const nextBadges = useMemo(() => {
    return availableBadges
      .filter(badge => !badge.earned)
      .sort((a, b) => {
        // Sort by rarity (easier badges first) and then by XP reward
        const rarityOrder = { 'Common': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity] || a.xpReward - b.xpReward;
      })
      .slice(0, 3);
  }, [availableBadges]);

  const badgesByRarity = useMemo(() => {
    return earnedBadges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [earnedBadges]);

  const totalBadgeXP = useMemo(() => {
    return earnedBadges.reduce((total, badge) => total + badge.xpReward, 0);
  }, [earnedBadges]);

  const getBadgeProgressTips = (): string[] => {
    const tips: string[] = [];
    
    nextBadges.forEach(badge => {
      switch (badge.id) {
        case 'first-steps':
          tips.push("🎯 Start any learning module to earn your first badge!");
          break;
        case 'quiz-novice':
          tips.push("🧠 Take the quiz challenge to earn Quiz Novice badge!");
          break;
        case 'perfect-score':
          tips.push("⭐ Get all quiz questions right for Perfect Score badge!");
          break;
        case 'module-master':
          tips.push(`📚 Complete ${3 - behavior.modulesCompleted} more modules for Module Master!`);
          break;
        case 'game-explorer':
          tips.push(`🎮 Play ${3 - behavior.gamesPlayed.length} more games for Game Explorer!`);
          break;
        case 'emergency-ready':
          tips.push("🚨 Complete the Emergency Fund Builder game!");
          break;
        case 'career-strategist':
          tips.push("💼 Complete the Career Path Simulator!");
          break;
        case 'streak-champion':
          tips.push(`🔥 Keep learning for ${7 - behavior.streakDays} more days!`);
          break;
        case 'completionist':
          tips.push(`🏆 Complete ${5 - behavior.modulesCompleted} more modules!`);
          break;
      }
    });

    return tips.slice(0, 2);
  };

  return {
    availableBadges,
    earnedBadges,
    nextBadges,
    badgesByRarity,
    totalBadgeXP,
    progressTips: getBadgeProgressTips(),
  };
};