/**
 * Scale Validator - Validates detected fingerings against correct scale sequences
 * and tracks timing accuracy
 */

import { Scale } from "./scaleLibrary";

export interface FingerEvent {
  finger: number; // 1-5
  timestamp: number; // milliseconds
  confidence: number; // 0-1
}

export interface ValidationResult {
  isCorrect: boolean;
  expectedFinger: number;
  detectedFinger: number;
  position: number; // Position in the scale sequence
  timingAccuracy: number; // 0-100 (percentage)
  feedback: string;
}

export interface ScaleProgress {
  scale: Scale;
  direction: "ascending" | "descending";
  expectedSequence: number[];
  detectedSequence: number[];
  fingerEvents: FingerEvent[];
  startTime: number;
  endTime: number | null;
  accuracy: number; // 0-100 (percentage)
  timingAccuracy: number; // 0-100 (percentage)
  isComplete: boolean;
  totalErrors: number;
}

/**
 * Create a new scale progress tracker
 */
export function createScaleProgress(
  scale: Scale,
  direction: "ascending" | "descending"
): ScaleProgress {
  const expectedSequence =
    direction === "ascending" ? scale.fingering.ascending : scale.fingering.descending;

  return {
    scale,
    direction,
    expectedSequence,
    detectedSequence: [],
    fingerEvents: [],
    startTime: Date.now(),
    endTime: null,
    accuracy: 0,
    timingAccuracy: 0,
    isComplete: false,
    totalErrors: 0,
  };
}

/**
 * Validate a detected finger press against the expected sequence
 */
export function validateFinger(
  progress: ScaleProgress,
  detectedFinger: number,
  timestamp: number,
  confidence: number
): ValidationResult {
  const position = progress.detectedSequence.length;
  const expectedFinger = progress.expectedSequence[position];

  const isCorrect = detectedFinger === expectedFinger;

  // Calculate timing accuracy
  const timingAccuracy = calculateTimingAccuracy(progress, timestamp);

  // Generate feedback
  let feedback = "";
  if (!isCorrect) {
    feedback = `Wrong finger! Expected ${expectedFinger}, got ${detectedFinger}`;
    progress.totalErrors++;
  } else if (timingAccuracy < 70) {
    feedback = "Correct finger, but timing is off";
  } else {
    feedback = "Perfect!";
  }

  // Record the finger event
  progress.fingerEvents.push({
    finger: detectedFinger,
    timestamp,
    confidence,
  });

  // Only advance the sequence when the correct finger was played.
  if (isCorrect) {
    progress.detectedSequence.push(detectedFinger);
  }

  // Check if scale is complete
  if (progress.detectedSequence.length === progress.expectedSequence.length) {
    progress.isComplete = true;
    progress.endTime = Date.now();
    updateScaleAccuracy(progress);
  }

  return {
    isCorrect,
    expectedFinger,
    detectedFinger,
    position,
    timingAccuracy,
    feedback,
  };
}

/**
 * Calculate timing accuracy for a finger press
 * Compares actual interval to expected interval based on BPM
 */
export function calculateTimingAccuracy(
  progress: ScaleProgress,
  timestamp: number,
  targetBPM: number = 120
): number {
  if (progress.fingerEvents.length === 0) {
    return 100; // First note, perfect timing
  }

  // Expected interval between notes (in milliseconds)
  const expectedInterval = (60 / targetBPM) * 1000;

  // Actual interval from last finger press
  const lastEvent = progress.fingerEvents[progress.fingerEvents.length - 1];
  const actualInterval = timestamp - lastEvent.timestamp;

  // Calculate accuracy (100% if within ±20% of expected interval)
  const tolerance = expectedInterval * 0.2;
  const difference = Math.abs(actualInterval - expectedInterval);

  if (difference <= tolerance) {
    return 100;
  }

  // Linear decrease in accuracy beyond tolerance
  const accuracy = Math.max(0, 100 - (difference / expectedInterval) * 100);
  return accuracy;
}

/**
 * Update overall accuracy metrics for the scale
 */
export function updateScaleAccuracy(progress: ScaleProgress): void {
  if (progress.expectedSequence.length === 0) {
    progress.accuracy = 0;
    progress.timingAccuracy = 0;
    return;
  }

  // Fingering accuracy: correct notes out of all attempts (correct + wrong).
  const correctFingers = progress.detectedSequence.length;
  const totalAttempts = correctFingers + progress.totalErrors;
  progress.accuracy = totalAttempts > 0 ? (correctFingers / totalAttempts) * 100 : 0;

  // Timing accuracy: average of all timing accuracies
  const timingAccuracies = progress.fingerEvents.map((event, i) => {
    if (i === 0) return 100;
    const expectedInterval = (60 / 120) * 1000; // Default 120 BPM
    const actualInterval = event.timestamp - progress.fingerEvents[i - 1].timestamp;
    const tolerance = expectedInterval * 0.2;
    const difference = Math.abs(actualInterval - expectedInterval);
    return Math.max(0, 100 - (difference / expectedInterval) * 100);
  });

  progress.timingAccuracy =
    timingAccuracies.reduce((a, b) => a + b, 0) / timingAccuracies.length;
}

/**
 * Get current position in the scale
 */
export function getCurrentPosition(progress: ScaleProgress): number {
  return progress.detectedSequence.length;
}

/**
 * Get next expected finger
 */
export function getNextExpectedFinger(progress: ScaleProgress): number | null {
  const position = progress.detectedSequence.length;
  if (position >= progress.expectedSequence.length) {
    return null;
  }
  return progress.expectedSequence[position];
}

/**
 * Reset the scale progress (for retrying)
 */
export function resetScaleProgress(progress: ScaleProgress): ScaleProgress {
  return {
    ...progress,
    detectedSequence: [],
    fingerEvents: [],
    startTime: Date.now(),
    endTime: null,
    accuracy: 0,
    timingAccuracy: 0,
    isComplete: false,
    totalErrors: 0,
  };
}

/**
 * Calculate final score for a completed scale
 * Score is based on accuracy and timing
 */
export function calculateFinalScore(progress: ScaleProgress): {
  score: number;
  accuracy: number;
  timingAccuracy: number;
  grade: string;
} {
  const accuracy = progress.accuracy;
  const timingAccuracy = progress.timingAccuracy;

  // Combined score: 70% fingering accuracy, 30% timing accuracy
  const score = accuracy * 0.7 + timingAccuracy * 0.3;

  let grade = "F";
  if (score >= 95) grade = "A+";
  else if (score >= 90) grade = "A";
  else if (score >= 85) grade = "B+";
  else if (score >= 80) grade = "B";
  else if (score >= 75) grade = "C+";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";

  return {
    score: Math.round(score),
    accuracy: Math.round(accuracy),
    timingAccuracy: Math.round(timingAccuracy),
    grade,
  };
}

/**
 * Detect if a finger press is a duplicate (same finger pressed twice in a row)
 * This helps filter out jitter/noise
 */
export function isDuplicateFinger(progress: ScaleProgress, finger: number): boolean {
  if (progress.detectedSequence.length === 0) {
    return false;
  }

  const lastFinger = progress.detectedSequence[progress.detectedSequence.length - 1];
  return finger === lastFinger;
}

/**
 * Get statistics about the scale attempt
 */
export function getScaleStatistics(progress: ScaleProgress): {
  totalNotes: number;
  correctNotes: number;
  wrongNotes: number;
  duration: number; // milliseconds
  averageInterval: number; // milliseconds between notes
  tempo: number; // BPM
} {
  const totalNotes = progress.detectedSequence.length;
  const correctNotes = progress.detectedSequence.filter(
    (finger, i) => finger === progress.expectedSequence[i]
  ).length;
  const wrongNotes = totalNotes - correctNotes;

  const duration = progress.endTime ? progress.endTime - progress.startTime : 0;

  let averageInterval = 0;
  if (progress.fingerEvents.length > 1) {
    const intervals = [];
    for (let i = 1; i < progress.fingerEvents.length; i++) {
      intervals.push(
        progress.fingerEvents[i].timestamp - progress.fingerEvents[i - 1].timestamp
      );
    }
    averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  const tempo = averageInterval > 0 ? (60000 / averageInterval) : 0;

  return {
    totalNotes,
    correctNotes,
    wrongNotes,
    duration,
    averageInterval,
    tempo: Math.round(tempo),
  };
}

/**
 * Check if the scale was played perfectly
 */
export function isPerfectScale(progress: ScaleProgress): boolean {
  return (
    progress.isComplete &&
    progress.accuracy === 100 &&
    progress.timingAccuracy >= 90
  );
}

/**
 * Detect and filter out duplicate finger presses within a time window
 * Helps reduce false positives from jitter
 */
export function filterDuplicatePresses(
  fingerEvents: FingerEvent[],
  debounceTime: number = 100 // milliseconds
): FingerEvent[] {
  if (fingerEvents.length === 0) return [];

  const filtered: FingerEvent[] = [fingerEvents[0]];

  for (let i = 1; i < fingerEvents.length; i++) {
    const current = fingerEvents[i];
    const last = filtered[filtered.length - 1];

    // Only add if enough time has passed or it's a different finger
    if (current.timestamp - last.timestamp >= debounceTime || current.finger !== last.finger) {
      filtered.push(current);
    }
  }

  return filtered;
}
