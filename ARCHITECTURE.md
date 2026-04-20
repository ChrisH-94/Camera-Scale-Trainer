# Piano Scale Trainer - Architecture & Design Document

## 1. Application Overview

The Piano Scale Trainer is a mobile-first web application that leverages Google's MediaPipe hand tracking library to provide real-time feedback to piano students on their scale fingerings and timing. The application combines computer vision with gamification mechanics to create an engaging learning experience.

## 2. Core Architecture

### 2.1 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Framework | React 19 + TypeScript | UI components and state management |
| Hand Tracking | MediaPipe Hands (JavaScript) | Real-time hand pose detection from camera feed |
| Styling | Tailwind CSS 4 | Responsive design and theming |
| UI Components | shadcn/ui | Pre-built accessible components |
| State Management | React Context + Hooks | Local state for game progress and settings |
| Storage | LocalStorage | Persist user progress (XP, levels, completed scales) |
| Routing | Wouter | Client-side navigation |

### 2.2 Application Modules

The application is structured into the following logical modules:

**Hand Tracking Engine** - Captures video from the device camera, processes frames through MediaPipe Hands, and extracts hand landmarks in real-time.

**Scale Library & Fingering Validator** - Contains the database of piano scales with correct fingering sequences. Validates detected finger presses against expected sequences.

**Timing Engine** - Tracks the duration between finger presses and compares against target BPM to determine if timing is correct.

**Gamification System** - Manages XP accumulation, level progression, streaks, and badge achievements based on user performance.

**UI Layer** - Presents the camera feed with visual overlays, real-time feedback, and progress tracking dashboard.

## 3. Hand Tracking & Finger Detection

### 3.1 MediaPipe Hand Landmarks

MediaPipe Hands detects 21 landmarks per hand. The key landmarks for finger identification are:

| Finger | Landmark Index | Description |
|--------|---|---|
| Thumb | 4 | Thumb tip |
| Index | 8 | Index finger tip |
| Middle | 12 | Middle finger tip |
| Ring | 16 | Ring finger tip |
| Pinky | 20 | Pinky finger tip |

### 3.2 Finger Press Detection

A finger press is detected when:
1. The fingertip (landmark) moves downward relative to the hand's palm
2. The fingertip's y-coordinate crosses a calibrated "keyboard plane" threshold
3. The press is sustained for a minimum duration (e.g., 100ms) to avoid false positives

The system maintains a **press state** for each finger to track when a press begins and ends.

### 3.3 Finger Identification

Each detected hand is labeled as either left or right. The finger index (1-5) is determined by the landmark position:
- Thumb = 1
- Index = 2
- Middle = 3
- Ring = 4
- Pinky = 5

## 4. Scale Library & Fingering Data

### 4.1 Scale Data Structure

Scales are stored with the following structure:

```typescript
interface Scale {
  id: string;                    // Unique identifier (e.g., "C_major_rh")
  name: string;                  // Display name (e.g., "C Major")
  key: string;                   // Musical key
  hand: "left" | "right" | "both"; // Which hand(s) to practice
  octaves: number;               // Number of octaves to play
  fingering: number[];           // Correct finger sequence (1-5)
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;           // Brief description
}
```

### 4.2 Standard Piano Fingerings

The application includes fingerings for all major scales, minor scales (natural, harmonic, melodic), and common arpeggios. For example:

**C Major (Right Hand):** 1-2-3-1-2-3-4-5 (ascending), 5-4-3-2-1-3-2-1 (descending)

**A Minor (Right Hand):** 1-2-3-1-2-3-4-5 (natural minor ascending)

## 5. Validation Logic

### 5.1 Fingering Validation

The system validates detected finger presses against the expected sequence:

1. **Sequence Matching:** Compare the detected finger index with the expected finger at the current position in the scale.
2. **Timing Validation:** Check if the interval between consecutive presses matches the target BPM (within a tolerance window, e.g., ±10%).
3. **Feedback Generation:** Provide immediate visual/audio feedback (correct/incorrect/timing off).

### 5.2 Scoring Rules

| Condition | Points Awarded |
|-----------|---|
| Correct finger + correct timing | +10 XP |
| Correct finger + timing off | +5 XP |
| Wrong finger | 0 XP |
| Completed scale (all fingers correct) | +50 XP bonus |
| Perfect scale (all correct + all timing) | +100 XP bonus |

## 6. Gamification System

### 6.1 XP & Levels

- **XP (Experience Points):** Awarded for each correct finger press and scale completion.
- **Levels:** Progress through levels as total XP accumulates. Level thresholds increase exponentially (e.g., Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP, Level 4: 600 XP, etc.).
- **Level Formula:** `XP_for_level_n = 50 * n * (n + 1)`

### 6.2 Streaks

- **Correct Streak:** Incremented for each correct finger press in sequence. Resets on error.
- **Streak Bonus:** At 5-finger streaks, award 25 bonus XP. At 10-finger streaks, award 50 bonus XP.

### 6.3 Badges & Achievements

| Badge | Condition | Reward |
|-------|-----------|--------|
| First Steps | Complete any scale | 10 XP |
| Perfectionist | Complete a scale with 100% accuracy | 50 XP |
| Speed Demon | Complete a scale at 120+ BPM with 90%+ accuracy | 75 XP |
| Scale Master | Complete all major scales | 200 XP |
| Ambidextrous | Complete scales with both hands | 100 XP |
| Consistency | Maintain a 7-day practice streak | 150 XP |

### 6.4 Progress Tracking

User progress is stored locally and includes:
- Total XP and current level
- Completed scales and best scores
- Current streak and longest streak
- Unlocked badges
- Practice history (optional: last 10 sessions)

## 7. User Interface Design

### 7.1 Main Screens

**Home/Dashboard:** Displays current level, XP progress bar, recent achievements, and quick-start buttons for available scales.

**Camera View:** Full-screen camera feed with overlays showing detected hand landmarks, current finger, expected finger, and real-time feedback (correct/incorrect).

**Scale Selection:** Browse and filter scales by difficulty, key, or hand. Shows best score and practice history for each scale.

**Progress Dashboard:** Detailed statistics including total XP, level progression, badges earned, and practice history.

**Settings:** Camera calibration, BPM adjustment, feedback preferences (visual/audio/haptic).

### 7.2 Visual Feedback

- **Real-time Overlays:** Display detected hand landmarks and highlight the currently pressed finger.
- **Feedback Messages:** "Correct!" (green), "Wrong Finger!" (red), "Timing Off" (yellow).
- **Progress Indicators:** Visual representation of expected vs. detected finger sequence.
- **Streak Counter:** Displays current streak prominently during practice.

## 8. Data Persistence

All user data is stored in the browser's LocalStorage:

```typescript
interface UserProgress {
  userId: string;                    // Unique user identifier (generated on first visit)
  totalXP: number;
  currentLevel: number;
  scaleProgress: {
    [scaleId: string]: {
      bestScore: number;
      attempts: number;
      lastAttempt: string;           // ISO date
      personalBest: number;          // Best accuracy percentage
    }
  }
  badges: string[];                  // Array of badge IDs
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;          // ISO date
}
```

## 9. Camera Calibration

On first use, the application guides the user through a calibration process:

1. **Hand Positioning:** User places their hand on the piano keyboard in a neutral position.
2. **Keyboard Plane Detection:** The system records the y-coordinate of the fingertips to establish the "keyboard plane."
3. **Press Threshold:** User performs a few test presses to calibrate the press detection sensitivity.

Calibration data is stored locally and can be reset in settings.

## 10. Performance Considerations

- **Frame Rate:** Target 30 FPS for hand tracking to balance accuracy and performance.
- **Lazy Loading:** Scale library is loaded on demand.
- **Memory Management:** Camera stream is properly released when not in use.
- **Responsive Design:** UI adapts to various screen sizes and orientations.

## 11. Future Enhancements

- Integration with MIDI keyboards for note validation
- Multiplayer challenges and leaderboards
- Custom scale creation and sharing
- Integration with music theory lessons
- Audio feedback (correct/incorrect tones)
- Hand posture analysis and correction tips
