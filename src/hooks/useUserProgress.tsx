import { useState, useCallback } from 'react';
import { UserProgress, UserBehavior } from '@/types/education';

const initialBehavior: UserBehavior = {
  quizzesCompleted: 0,
  questionsCorrect: 0,
  modulesStarted: 0,
  modulesCompleted: 0,
  gamesPlayed: [],
  gamesCompleted: [],
  totalTimeSpent: 0,
  streakDays: 1,
  highestQuizScore: 0,
  savingsGameHighScore: 0,
  budgetingAttempts: 0,
  emergencyFundBuilt: false,
  careerSimulationCompleted: false,
};

const initialProgress: UserProgress = {
  level: 1,
  xp: 0,
  totalXP: 300,
  behavior: initialBehavior,
  lastActive: new Date(),
  joinedAt: new Date(),
};

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);

  const updateBehavior = useCallback((updates: Partial<UserBehavior>) => {
    setProgress(prev => ({
      ...prev,
      behavior: { ...prev.behavior, ...updates },
      lastActive: new Date(),
    }));
  }, []);

  const addXP = useCallback((amount: number) => {
    setProgress(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / prev.totalXP) + 1;
      
      return {
        ...prev,
        xp: newXP,
        level: Math.max(prev.level, newLevel),
        totalXP: prev.level !== newLevel ? prev.totalXP + 100 : prev.totalXP,
        lastActive: new Date(),
      };
    });
  }, []);

  const completeQuiz = useCallback((score: number, totalQuestions: number) => {
    updateBehavior({
      quizzesCompleted: progress.behavior.quizzesCompleted + 1,
      questionsCorrect: progress.behavior.questionsCorrect + score,
      highestQuizScore: Math.max(progress.behavior.highestQuizScore, score),
    });
    
    const xpReward = Math.round((score / totalQuestions) * 50);
    addXP(xpReward);
  }, [progress.behavior, updateBehavior, addXP]);

  const startModule = useCallback((moduleId: string) => {
    updateBehavior({
      modulesStarted: progress.behavior.modulesStarted + 1,
    });
  }, [progress.behavior, updateBehavior]);

  const completeModule = useCallback((moduleXP: number) => {
    updateBehavior({
      modulesCompleted: progress.behavior.modulesCompleted + 1,
    });
    addXP(moduleXP);
  }, [progress.behavior, updateBehavior, addXP]);

  const playGame = useCallback((gameId: string) => {
    if (!progress.behavior.gamesPlayed.includes(gameId)) {
      updateBehavior({
        gamesPlayed: [...progress.behavior.gamesPlayed, gameId],
      });
    }
  }, [progress.behavior, updateBehavior]);

  const completeGame = useCallback((gameId: string, xpReward: number) => {
    if (!progress.behavior.gamesCompleted.includes(gameId)) {
      updateBehavior({
        gamesCompleted: [...progress.behavior.gamesCompleted, gameId],
        ...(gameId === 'emergency-fund' && { emergencyFundBuilt: true }),
        ...(gameId === 'career-choices' && { careerSimulationCompleted: true }),
        ...(gameId === 'shopping-budget' && { 
          budgetingAttempts: progress.behavior.budgetingAttempts + 1 
        }),
      });
      addXP(xpReward);
    }
  }, [progress.behavior, updateBehavior, addXP]);

  return {
    progress,
    updateBehavior,
    addXP,
    completeQuiz,
    startModule,
    completeModule,
    playGame,
    completeGame,
  };
};