import { LucideIcon } from 'lucide-react';

export interface UserBehavior {
  quizzesCompleted: number;
  questionsCorrect: number;
  modulesStarted: number;
  modulesCompleted: number;
  gamesPlayed: string[];
  gamesCompleted: string[];
  totalTimeSpent: number;
  streakDays: number;
  highestQuizScore: number;
  savingsGameHighScore: number;
  budgetingAttempts: number;
  emergencyFundBuilt: boolean;
  careerSimulationCompleted: boolean;
}

export interface ModuleTemplate {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  baseXP: number;
  color: string;
  prerequisites: string[];
  unlockCriteria: (behavior: UserBehavior) => boolean;
  content: {
    lessons: {
      title: string;
      content: string;
    }[];
  };
}

export interface BadgeTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockCriteria: (behavior: UserBehavior) => boolean;
  xpReward: number;
}

export interface DynamicModule extends Omit<ModuleTemplate, 'unlockCriteria'> {
  completed: boolean;
  unlockedAt: Date;
  personalizedXP: number;
}

export interface DynamicBadge extends Omit<BadgeTemplate, 'unlockCriteria'> {
  earned: boolean;
  earnedAt?: Date;
}

export interface UserProgress {
  level: number;
  xp: number;
  totalXP: number;
  behavior: UserBehavior;
  lastActive: Date;
  joinedAt: Date;
}