/**
 * Gamification System - Manages XP, levels, streaks, and badges
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (progress: UserProgress) => boolean;
}

export interface UserProgress {
  userId: string;
  totalXP: number;
  currentLevel: number;
  scaleProgress: {
    [scaleId: string]: {
      bestScore: number; // Percentage (0-100)
      attempts: number;
      lastAttempt: string; // ISO date
      personalBest: number; // Best accuracy percentage
    };
  };
  badges: string[]; // Array of badge IDs
  currentStreak: number; // Consecutive days practiced
  longestStreak: number;
  lastPracticeDate: string; // ISO date
  createdAt: string; // ISO date
}

export interface SessionResult {
  scaleId: string;
  accuracy: number; // Percentage (0-100)
  xpEarned: number;
  streakBonus: number;
  perfectScale: boolean;
  completedAt: string; // ISO date
}

/**
 * Calculate XP required for a specific level
 * Formula: 50 * n * (n + 1)
 */
export function getXPForLevel(level: number): number {
  return 50 * level * (level + 1);
}

/**
 * Calculate current level based on total XP
 */
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (getXPForLevel(level) <= totalXP) {
    level++;
  }
  return level;
}

/**
 * Calculate XP progress towards next level
 */
export function getXPProgress(totalXP: number): {
  currentLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercentage: number;
} {
  const currentLevel = getLevelFromXP(totalXP);
  const currentLevelXP = getXPForLevel(currentLevel - 1);
  const nextLevelXP = getXPForLevel(currentLevel);
  const progressPercentage =
    ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  };
}

/**
 * Calculate XP earned for a session
 */
export function calculateSessionXP(
  accuracy: number,
  streakCount: number,
  perfectScale: boolean
): { baseXP: number; streakBonus: number; perfectBonus: number; totalXP: number } {
  let baseXP = 0;
  let streakBonus = 0;
  let perfectBonus = 0;

  // Base XP based on accuracy
  if (accuracy >= 90) {
    baseXP = 50; // Excellent
  } else if (accuracy >= 75) {
    baseXP = 35; // Good
  } else if (accuracy >= 50) {
    baseXP = 20; // Fair
  } else {
    baseXP = 10; // Needs practice
  }

  // Streak bonuses
  if (streakCount >= 10) {
    streakBonus = 50;
  } else if (streakCount >= 5) {
    streakBonus = 25;
  }

  // Perfect scale bonus
  if (perfectScale && accuracy === 100) {
    perfectBonus = 100;
  } else if (perfectScale && accuracy >= 95) {
    perfectBonus = 50;
  }

  return {
    baseXP,
    streakBonus,
    perfectBonus,
    totalXP: baseXP + streakBonus + perfectBonus,
  };
}

/**
 * Badge definitions
 */
export const BADGES: Badge[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first scale",
    icon: "🎹",
    xpReward: 10,
    condition: (progress) => Object.keys(progress.scaleProgress).length > 0,
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete a scale with 100% accuracy",
    icon: "⭐",
    xpReward: 50,
    condition: (progress) =>
      Object.values(progress.scaleProgress).some((scale) => scale.personalBest === 100),
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a scale at 120+ BPM with 90%+ accuracy",
    icon: "⚡",
    xpReward: 75,
    condition: () => false, // Will be set dynamically during session
  },
  {
    id: "scale_master",
    name: "Scale Master",
    description: "Complete all major scales",
    icon: "👑",
    xpReward: 200,
    condition: (progress) => {
      const majorScaleIds = [
        "c_major_rh",
        "c_major_lh",
        "g_major_rh",
        "g_major_lh",
        "f_major_rh",
        "f_major_lh",
        "d_major_rh",
        "d_major_lh",
        "bb_major_rh",
        "bb_major_lh",
        "a_major_rh",
        "a_major_lh",
      ];
      return majorScaleIds.every((id) => id in progress.scaleProgress);
    },
  },
  {
    id: "ambidextrous",
    name: "Ambidextrous",
    description: "Complete scales with both hands",
    icon: "🤝",
    xpReward: 100,
    condition: (progress) => {
      const hasLeftHand = Object.keys(progress.scaleProgress).some((id) =>
        id.includes("_lh")
      );
      const hasRightHand = Object.keys(progress.scaleProgress).some((id) =>
        id.includes("_rh")
      );
      return hasLeftHand && hasRightHand;
    },
  },
  {
    id: "consistency",
    name: "Consistency",
    description: "Maintain a 7-day practice streak",
    icon: "🔥",
    xpReward: 150,
    condition: (progress) => progress.longestStreak >= 7,
  },
  {
    id: "minor_master",
    name: "Minor Master",
    description: "Complete all natural minor scales",
    icon: "🎼",
    xpReward: 150,
    condition: (progress) => {
      const minorScaleIds = [
        "a_minor_rh",
        "a_minor_lh",
        "e_minor_rh",
        "e_minor_lh",
        "d_minor_rh",
        "d_minor_lh",
      ];
      return minorScaleIds.every((id) => id in progress.scaleProgress);
    },
  },
  {
    id: "harmonic_harmony",
    name: "Harmonic Harmony",
    description: "Complete all harmonic minor scales",
    icon: "🎵",
    xpReward: 125,
    condition: (progress) => {
      const harmonicScaleIds = [
        "a_harmonic_minor_rh",
        "a_harmonic_minor_lh",
        "e_harmonic_minor_rh",
        "e_harmonic_minor_lh",
      ];
      return harmonicScaleIds.every((id) => id in progress.scaleProgress);
    },
  },
  {
    id: "arpeggio_ace",
    name: "Arpeggio Ace",
    description: "Master all major arpeggios",
    icon: "🎸",
    xpReward: 175,
    condition: (progress) => {
      const arpeggioIds = [
        "c_major_arpeggio_rh",
        "c_major_arpeggio_lh",
        "g_major_arpeggio_rh",
        "g_major_arpeggio_lh",
        "f_major_arpeggio_rh",
        "f_major_arpeggio_lh",
      ];
      return arpeggioIds.every((id) => id in progress.scaleProgress);
    },
  },
];

/**
 * Check for newly earned badges
 */
export function checkNewBadges(
  progress: UserProgress,
  previousBadges: string[]
): string[] {
  const newBadges: string[] = [];

  for (const badge of BADGES) {
    const alreadyHas = previousBadges.includes(badge.id);
    const nowQualifies = badge.condition(progress);

    if (!alreadyHas && nowQualifies) {
      newBadges.push(badge.id);
    }
  }

  return newBadges;
}

/**
 * Get badge by ID
 */
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id);
}

/**
 * Create initial user progress
 */
export function createInitialProgress(): UserProgress {
  return {
    userId: generateUserId(),
    totalXP: 0,
    currentLevel: 1,
    scaleProgress: {},
    badges: [],
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: "",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate unique user ID
 */
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Update streak based on practice date
 */
export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toDateString();
  const lastPractice = progress.lastPracticeDate
    ? new Date(progress.lastPracticeDate).toDateString()
    : null;

  let newStreak = progress.currentStreak;

  if (lastPractice === today) {
    // Already practiced today, don't increment
  } else if (lastPractice) {
    const lastDate = new Date(progress.lastPracticeDate);
    const currentDate = new Date();
    const daysDiff = Math.floor(
      (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Practiced yesterday, increment streak
      newStreak = progress.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  } else {
    // First practice
    newStreak = 1;
  }

  const newLongestStreak = Math.max(newStreak, progress.longestStreak);

  return {
    ...progress,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastPracticeDate: new Date().toISOString(),
  };
}
