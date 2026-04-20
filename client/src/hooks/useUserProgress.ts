/**
 * useUserProgress - React hook for managing user progress and gamification
 * 
 * Handles:
 * - Loading/saving progress from storage
 * - XP and level management
 * - Badge tracking
 * - Streak management
 * - Scale statistics
 */

import { useCallback, useEffect, useState } from "react";
import {
  UserProgress,
  createInitialProgress,
  getLevelFromXP,
  getXPProgress,
  calculateSessionXP,
  checkNewBadges,
  updateStreak,
  BADGES,
} from "@/lib/gamification";
import {
  loadUserProgress,
  saveUserProgress,
  loadCalibrationData,
  saveCalibrationData,
} from "@/lib/storage";
import { SessionResult } from "./useScaleTraining";

interface UseUserProgressState {
  progress: UserProgress | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

export function useUserProgress() {
  const [state, setState] = useState<UseUserProgressState>({
    progress: null,
    isLoading: true,
    hasUnsavedChanges: false,
  });

  // Load progress on mount
  useEffect(() => {
    const progress = loadUserProgress();
    setState((prev) => ({
      ...prev,
      progress,
      isLoading: false,
    }));
  }, []);

  // Save progress when it changes
  useEffect(() => {
    if (state.progress && state.hasUnsavedChanges) {
      saveUserProgress(state.progress);
      setState((prev) => ({
        ...prev,
        hasUnsavedChanges: false,
      }));
    }
  }, [state.progress, state.hasUnsavedChanges]);

  /**
   * Record a completed scale session
   */
  const recordSession = useCallback(
    (result: SessionResult) => {
      if (!state.progress) return;

      let updatedProgress = { ...state.progress };

      // Update total XP
      updatedProgress.totalXP += result.xpEarned;

      // Update current level
      updatedProgress.currentLevel = getLevelFromXP(updatedProgress.totalXP);

      // Update scale progress
      if (!updatedProgress.scaleProgress[result.scaleId]) {
        updatedProgress.scaleProgress[result.scaleId] = {
          bestScore: result.score,
          attempts: 1,
          lastAttempt: result.completedAt,
          personalBest: result.accuracy,
        };
      } else {
        const scaleData = updatedProgress.scaleProgress[result.scaleId];
        scaleData.attempts += 1;
        scaleData.lastAttempt = result.completedAt;
        scaleData.bestScore = Math.max(scaleData.bestScore, result.score);
        scaleData.personalBest = Math.max(scaleData.personalBest, result.accuracy);
      }

      // Update streak
      updatedProgress = updateStreak(updatedProgress);

      // Check for new badges
      const previousBadges = updatedProgress.badges;
      const newBadges = checkNewBadges(updatedProgress, previousBadges);

      if (newBadges.length > 0) {
        updatedProgress.badges = [...previousBadges, ...newBadges];
      }

      setState((prev) => ({
        ...prev,
        progress: updatedProgress,
        hasUnsavedChanges: true,
      }));

      const newLevel = getLevelFromXP(updatedProgress.totalXP);
      const leveledUp = newLevel > state.progress.currentLevel;

      return {
        newBadges,
        leveledUp,
        newLevel,
      };
    },
    [state.progress]
  );

  /**
   * Get current level info
   */
  const getLevelInfo = useCallback(() => {
    if (!state.progress) return null;

    const xpProgress = getXPProgress(state.progress.totalXP);
    return {
      totalXP: state.progress.totalXP,
      ...xpProgress,
    };
  }, [state.progress]);

  /**
   * Get badge info
   */
  const getBadgeInfo = useCallback(() => {
    if (!state.progress) return [];

    return state.progress.badges.map((badgeId) => {
      const badge = BADGES.find((b) => b.id === badgeId);
      return {
        id: badgeId,
        ...badge,
      };
    });
  }, [state.progress]);

  /**
   * Get scale statistics
   */
  const getScaleStats = useCallback(
    (scaleId?: string) => {
      if (!state.progress) return null;

      if (scaleId) {
        return state.progress.scaleProgress[scaleId] || null;
      }

      // Return overall stats
      const scales = Object.entries(state.progress.scaleProgress);
      const totalAttempts = scales.reduce((sum, [_, data]) => sum + data.attempts, 0);
      const avgScore =
        scales.length > 0
          ? scales.reduce((sum, [_, data]) => sum + data.bestScore, 0) / scales.length
          : 0;

      return {
        totalScalesCompleted: scales.length,
        totalAttempts,
        averageScore: Math.round(avgScore),
        currentStreak: state.progress.currentStreak,
        longestStreak: state.progress.longestStreak,
      };
    },
    [state.progress]
  );

  /**
   * Reset all progress
   */
  const resetProgress = useCallback(() => {
    const newProgress = createInitialProgress();
    setState((prev) => ({
      ...prev,
      progress: newProgress,
      hasUnsavedChanges: true,
    }));
  }, []);

  /**
   * Get calibration data
   */
  const getCalibration = useCallback(() => {
    return loadCalibrationData();
  }, []);

  /**
   * Save calibration data
   */
  const saveCalibration = useCallback((data: any) => {
    saveCalibrationData(data);
  }, []);

  return {
    ...state,
    recordSession,
    getLevelInfo,
    getBadgeInfo,
    getScaleStats,
    resetProgress,
    getCalibration,
    saveCalibration,
  };
}
