/**
 * Scale Library - Contains all piano scales with correct fingerings
 * 
 * Format: Each scale has ascending and descending fingerings for both hands
 * Fingering numbers: 1=Thumb, 2=Index, 3=Middle, 4=Ring, 5=Pinky
 */

export interface Scale {
  id: string;
  name: string;
  key: string;
  hand: "left" | "right" | "both";
  fingering: {
    ascending: number[];
    descending: number[];
  };
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  octaves: number;
}

export const SCALE_LIBRARY: Scale[] = [
  // Major Scales - Beginner
  {
    id: "c_major_rh",
    name: "C Major",
    key: "C",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "beginner",
    description: "C Major scale - Right Hand (no sharps or flats)",
    octaves: 1,
  },
  {
    id: "c_major_lh",
    name: "C Major",
    key: "C",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "beginner",
    description: "C Major scale - Left Hand (no sharps or flats)",
    octaves: 1,
  },
  {
    id: "g_major_rh",
    name: "G Major",
    key: "G",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "beginner",
    description: "G Major scale - Right Hand (1 sharp: F#)",
    octaves: 1,
  },
  {
    id: "g_major_lh",
    name: "G Major",
    key: "G",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "beginner",
    description: "G Major scale - Left Hand (1 sharp: F#)",
    octaves: 1,
  },
  {
    id: "f_major_rh",
    name: "F Major",
    key: "F",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 4, 1, 2, 3, 5],
      descending: [5, 3, 2, 1, 4, 3, 2, 1],
    },
    difficulty: "beginner",
    description: "F Major scale - Right Hand (1 flat: Bb)",
    octaves: 1,
  },
  {
    id: "f_major_lh",
    name: "F Major",
    key: "F",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 4, 3, 2],
      descending: [2, 3, 4, 1, 2, 3, 4, 5],
    },
    difficulty: "beginner",
    description: "F Major scale - Left Hand (1 flat: Bb)",
    octaves: 1,
  },
  {
    id: "d_major_rh",
    name: "D Major",
    key: "D",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "intermediate",
    description: "D Major scale - Right Hand (2 sharps: F#, C#)",
    octaves: 1,
  },
  {
    id: "d_major_lh",
    name: "D Major",
    key: "D",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "intermediate",
    description: "D Major scale - Left Hand (2 sharps: F#, C#)",
    octaves: 1,
  },
  {
    id: "bb_major_rh",
    name: "Bb Major",
    key: "Bb",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 4, 1, 2, 3, 5],
      descending: [5, 3, 2, 1, 4, 3, 2, 1],
    },
    difficulty: "intermediate",
    description: "Bb Major scale - Right Hand (2 flats: Bb, Eb)",
    octaves: 1,
  },
  {
    id: "bb_major_lh",
    name: "Bb Major",
    key: "Bb",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 4, 3, 2],
      descending: [2, 3, 4, 1, 2, 3, 4, 5],
    },
    difficulty: "intermediate",
    description: "Bb Major scale - Left Hand (2 flats: Bb, Eb)",
    octaves: 1,
  },
  {
    id: "a_major_rh",
    name: "A Major",
    key: "A",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "intermediate",
    description: "A Major scale - Right Hand (3 sharps: F#, C#, G#)",
    octaves: 1,
  },
  {
    id: "a_major_lh",
    name: "A Major",
    key: "A",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "intermediate",
    description: "A Major scale - Left Hand (3 sharps: F#, C#, G#)",
    octaves: 1,
  },

  // Natural Minor Scales - Beginner
  {
    id: "a_minor_rh",
    name: "A Minor",
    key: "A",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "beginner",
    description: "A Natural Minor scale - Right Hand (relative to C Major)",
    octaves: 1,
  },
  {
    id: "a_minor_lh",
    name: "A Minor",
    key: "A",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "beginner",
    description: "A Natural Minor scale - Left Hand (relative to C Major)",
    octaves: 1,
  },
  {
    id: "e_minor_rh",
    name: "E Minor",
    key: "E",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "beginner",
    description: "E Natural Minor scale - Right Hand (relative to G Major)",
    octaves: 1,
  },
  {
    id: "e_minor_lh",
    name: "E Minor",
    key: "E",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "beginner",
    description: "E Natural Minor scale - Left Hand (relative to G Major)",
    octaves: 1,
  },
  {
    id: "d_minor_rh",
    name: "D Minor",
    key: "D",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "beginner",
    description: "D Natural Minor scale - Right Hand (relative to F Major)",
    octaves: 1,
  },
  {
    id: "d_minor_lh",
    name: "D Minor",
    key: "D",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "beginner",
    description: "D Natural Minor scale - Left Hand (relative to F Major)",
    octaves: 1,
  },

  // Harmonic Minor Scales - Intermediate
  {
    id: "a_harmonic_minor_rh",
    name: "A Harmonic Minor",
    key: "A",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "intermediate",
    description: "A Harmonic Minor scale - Right Hand (raised 7th: G#)",
    octaves: 1,
  },
  {
    id: "a_harmonic_minor_lh",
    name: "A Harmonic Minor",
    key: "A",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "intermediate",
    description: "A Harmonic Minor scale - Left Hand (raised 7th: G#)",
    octaves: 1,
  },
  {
    id: "e_harmonic_minor_rh",
    name: "E Harmonic Minor",
    key: "E",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "intermediate",
    description: "E Harmonic Minor scale - Right Hand (raised 7th: D#)",
    octaves: 1,
  },
  {
    id: "e_harmonic_minor_lh",
    name: "E Harmonic Minor",
    key: "E",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "intermediate",
    description: "E Harmonic Minor scale - Left Hand (raised 7th: D#)",
    octaves: 1,
  },

  // Melodic Minor Scales - Intermediate
  {
    id: "a_melodic_minor_rh",
    name: "A Melodic Minor",
    key: "A",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "intermediate",
    description: "A Melodic Minor scale - Right Hand (raised 6th & 7th ascending)",
    octaves: 1,
  },
  {
    id: "a_melodic_minor_lh",
    name: "A Melodic Minor",
    key: "A",
    hand: "left",
    fingering: {
      ascending: [5, 4, 3, 2, 1, 3, 2, 1],
      descending: [1, 2, 3, 1, 2, 3, 4, 5],
    },
    difficulty: "intermediate",
    description: "A Melodic Minor scale - Left Hand (raised 6th & 7th ascending)",
    octaves: 1,
  },

  // Arpeggios - Intermediate to Advanced
  {
    id: "c_major_arpeggio_rh",
    name: "C Major Arpeggio",
    key: "C",
    hand: "right",
    fingering: {
      ascending: [1, 3, 5, 1, 3, 5, 1, 3],
      descending: [3, 1, 5, 3, 1, 5, 3, 1],
    },
    difficulty: "intermediate",
    description: "C Major Arpeggio - Right Hand (C-E-G pattern)",
    octaves: 1,
  },
  {
    id: "c_major_arpeggio_lh",
    name: "C Major Arpeggio",
    key: "C",
    hand: "left",
    fingering: {
      ascending: [5, 3, 1, 5, 3, 1, 5, 3],
      descending: [1, 3, 5, 1, 3, 5, 1, 3],
    },
    difficulty: "intermediate",
    description: "C Major Arpeggio - Left Hand (C-E-G pattern)",
    octaves: 1,
  },
  {
    id: "g_major_arpeggio_rh",
    name: "G Major Arpeggio",
    key: "G",
    hand: "right",
    fingering: {
      ascending: [1, 2, 5, 1, 2, 5, 1, 2],
      descending: [2, 1, 5, 2, 1, 5, 2, 1],
    },
    difficulty: "intermediate",
    description: "G Major Arpeggio - Right Hand (G-B-D pattern)",
    octaves: 1,
  },
  {
    id: "g_major_arpeggio_lh",
    name: "G Major Arpeggio",
    key: "G",
    hand: "left",
    fingering: {
      ascending: [5, 3, 1, 5, 3, 1, 5, 3],
      descending: [1, 3, 5, 1, 3, 5, 1, 3],
    },
    difficulty: "intermediate",
    description: "G Major Arpeggio - Left Hand (G-B-D pattern)",
    octaves: 1,
  },
  {
    id: "f_major_arpeggio_rh",
    name: "F Major Arpeggio",
    key: "F",
    hand: "right",
    fingering: {
      ascending: [1, 3, 5, 1, 3, 5, 1, 3],
      descending: [3, 1, 5, 3, 1, 5, 3, 1],
    },
    difficulty: "intermediate",
    description: "F Major Arpeggio - Right Hand (F-A-C pattern)",
    octaves: 1,
  },
  {
    id: "f_major_arpeggio_lh",
    name: "F Major Arpeggio",
    key: "F",
    hand: "left",
    fingering: {
      ascending: [5, 3, 1, 5, 3, 1, 5, 3],
      descending: [1, 3, 5, 1, 3, 5, 1, 3],
    },
    difficulty: "intermediate",
    description: "F Major Arpeggio - Left Hand (F-A-C pattern)",
    octaves: 1,
  },
];

/**
 * Get a scale by ID
 */
export function getScaleById(id: string): Scale | undefined {
  return SCALE_LIBRARY.find((scale) => scale.id === id);
}

/**
 * Get all scales for a specific difficulty
 */
export function getScalesByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced"
): Scale[] {
  return SCALE_LIBRARY.filter((scale) => scale.difficulty === difficulty);
}

/**
 * Get all scales for a specific hand
 */
export function getScalesByHand(hand: "left" | "right"): Scale[] {
  return SCALE_LIBRARY.filter(
    (scale) => scale.hand === hand || scale.hand === "both"
  );
}

/**
 * Get all unique scale keys
 */
export function getAllScaleKeys(): string[] {
  const keys = new Set(SCALE_LIBRARY.map((scale) => scale.key));
  return Array.from(keys).sort();
}

/**
 * Get all scales for a specific key
 */
export function getScalesByKey(key: string): Scale[] {
  return SCALE_LIBRARY.filter((scale) => scale.key === key);
}
