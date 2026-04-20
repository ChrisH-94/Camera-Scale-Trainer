/**
 * Local Storage Management - Persists user progress to browser storage
 */

import { UserProgress, createInitialProgress } from "./gamification";

const STORAGE_KEY = "piano_trainer_progress";
const CALIBRATION_KEY = "piano_trainer_calibration";

/**
 * Load user progress from local storage
 */
export function loadUserProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load user progress:", error);
  }

  // Create new progress if none exists
  return createInitialProgress();
}

/**
 * Save user progress to local storage
 */
export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save user progress:", error);
  }
}

/**
 * Load calibration data from local storage
 */
export function loadCalibrationData(): {
  keyboardPlaneY: number;
  pressThreshold: number;
  baselineTipY?: number[];
  baselineCurl?: number[];
  calibrated: boolean;
} | null {
  try {
    const stored = localStorage.getItem(CALIBRATION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load calibration data:", error);
  }

  return null;
}

/**
 * Save calibration data to local storage
 */
export function saveCalibrationData(data: {
  keyboardPlaneY: number;
  pressThreshold: number;
  baselineTipY?: number[];
  baselineCurl?: number[];
  calibrated: boolean;
}): void {
  try {
    localStorage.setItem(CALIBRATION_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save calibration data:", error);
  }
}

/**
 * Clear all user data
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CALIBRATION_KEY);
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}

/**
 * Export user progress as JSON
 */
export function exportUserProgress(progress: UserProgress): string {
  return JSON.stringify(progress, null, 2);
}

/**
 * Import user progress from JSON
 */
export function importUserProgress(jsonString: string): UserProgress | null {
  try {
    const imported = JSON.parse(jsonString);
    // Validate basic structure
    if (imported.userId && typeof imported.totalXP === "number") {
      return imported;
    }
  } catch (error) {
    console.error("Failed to import user progress:", error);
  }

  return null;
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  progressSize: number;
  calibrationSize: number;
  totalSize: number;
  percentUsed: number;
} {
  const progressData = localStorage.getItem(STORAGE_KEY) || "";
  const calibrationData = localStorage.getItem(CALIBRATION_KEY) || "";

  const progressSize = new Blob([progressData]).size;
  const calibrationSize = new Blob([calibrationData]).size;
  const totalSize = progressSize + calibrationSize;

  // Estimate: most browsers allow 5-10MB
  const maxStorage = 5 * 1024 * 1024; // 5MB
  const percentUsed = (totalSize / maxStorage) * 100;

  return {
    progressSize,
    calibrationSize,
    totalSize,
    percentUsed,
  };
}
