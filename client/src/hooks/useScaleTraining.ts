/**
 * useScaleTraining - React hook for managing scale training sessions
 * 
 * Handles:
 * - Scale selection and setup
 * - Finger press validation
 * - Progress tracking
 * - Score calculation
 * - Session completion
 */

import { useCallback, useRef, useState } from "react";
import { Scale } from "@/lib/scaleLibrary";
import {
  ScaleProgress,
  createScaleProgress,
  validateFinger,
  resetScaleProgress,
  calculateFinalScore,
  getScaleStatistics,
  isPerfectScale,
  filterDuplicatePresses,
  getNextExpectedFinger,
  getCurrentPosition,
} from "@/lib/scaleValidator";
import {
  calculateSessionXP,
  updateStreak,
  UserProgress,
} from "@/lib/gamification";

interface UseScaleTrainingOptions {
  onProgressUpdate?: (progress: ScaleProgress) => void;
  onScaleComplete?: (result: SessionResult) => void;
  targetBPM?: number;
}

export interface SessionResult {
  scaleId: string;
  direction: "ascending" | "descending";
  accuracy: number;
  timingAccuracy: number;
  score: number;
  grade: string;
  xpEarned: number;
  isPerfect: boolean;
  duration: number;
  tempo: number;
  completedAt: string;
}

interface UseScaleTrainingState {
  currentScale: Scale | null;
  direction: "ascending" | "descending";
  progress: ScaleProgress | null;
  isActive: boolean;
  lastValidation: any | null;
  error: string | null;
}

export function useScaleTraining(options: UseScaleTrainingOptions = {}) {
  const { onProgressUpdate, onScaleComplete, targetBPM = 120 } = options;

  const [state, setState] = useState<UseScaleTrainingState>({
    currentScale: null,
    direction: "ascending",
    progress: null,
    isActive: false,
    lastValidation: null,
    error: null,
  });

  const lastFingerTimeRef = useRef<number>(0);
  const debounceTimeRef = useRef<number>(100); // milliseconds

  /**
   * Start a new scale training session
   */
  const startScale = useCallback(
    (scale: Scale, direction: "ascending" | "descending" = "ascending") => {
      const progress = createScaleProgress(scale, direction);

      setState((prev) => ({
        ...prev,
        currentScale: scale,
        direction,
        progress,
        isActive: true,
        error: null,
        lastValidation: null,
      }));

      lastFingerTimeRef.current = Date.now();
    },
    []
  );

  /**
   * Handle a detected finger press
   */
  const handleFingerPress = useCallback(
    (finger: number, hand: "left" | "right") => {
      if (!state.progress || !state.isActive) {
        return;
      }

      const now = Date.now();

      // Debounce: ignore presses within debounce time
      if (now - lastFingerTimeRef.current < debounceTimeRef.current) {
        return;
      }

      lastFingerTimeRef.current = now;

      // Validate the finger press
      const validation = validateFinger(
        state.progress,
        finger,
        now,
        0.8 // Confidence score
      );

      setState((prev) => ({
        ...prev,
        progress: state.progress,
        lastValidation: validation,
      }));

      // Callback for progress update
      if (onProgressUpdate && state.progress) {
        onProgressUpdate(state.progress);
      }

      // Check if scale is complete
      if (state.progress.isComplete) {
        completeScale();
      }
    },
    [state.progress, state.isActive, onProgressUpdate]
  );

  /**
   * Complete the current scale session
   */
  const completeScale = useCallback(() => {
    if (!state.progress || !state.currentScale) {
      return;
    }

    const finalScore = calculateFinalScore(state.progress);
    const stats = getScaleStatistics(state.progress);
    const isPerfect = isPerfectScale(state.progress);

    // Calculate XP
    const { totalXP } = calculateSessionXP(
      finalScore.accuracy,
      0, // Streak count will be handled by parent
      isPerfect
    );

    const result: SessionResult = {
      scaleId: state.currentScale.id,
      direction: state.direction,
      accuracy: finalScore.accuracy,
      timingAccuracy: finalScore.timingAccuracy,
      score: finalScore.score,
      grade: finalScore.grade,
      xpEarned: totalXP,
      isPerfect,
      duration: stats.duration,
      tempo: stats.tempo,
      completedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      isActive: false,
    }));

    // Callback for completion
    if (onScaleComplete) {
      onScaleComplete(result);
    }
  }, [state.progress, state.currentScale, state.direction, onScaleComplete]);

  /**
   * Reset the current session
   */
  const resetSession = useCallback(() => {
    if (!state.progress) {
      return;
    }

    const newProgress = resetScaleProgress(state.progress);

    setState((prev) => ({
      ...prev,
      progress: newProgress,
      lastValidation: null,
      isActive: true,
    }));

    lastFingerTimeRef.current = Date.now();
  }, [state.progress]);

  /**
   * End the session without completing
   */
  const endSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentScale: null,
      progress: null,
      isActive: false,
      lastValidation: null,
    }));

    lastFingerTimeRef.current = 0;
  }, []);

  /**
   * Get current session info
   */
  const getSessionInfo = useCallback(() => {
    if (!state.progress) {
      return null;
    }

    return {
      position: getCurrentPosition(state.progress),
      nextExpected: getNextExpectedFinger(state.progress),
      accuracy: state.progress.accuracy,
      timingAccuracy: state.progress.timingAccuracy,
      isComplete: state.progress.isComplete,
      totalErrors: state.progress.totalErrors,
    };
  }, [state.progress]);

  return {
    ...state,
    startScale,
    handleFingerPress,
    completeScale,
    resetSession,
    endSession,
    getSessionInfo,
  };
}
