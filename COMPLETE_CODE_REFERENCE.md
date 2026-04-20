# Complete Code Reference - All Key Files

## File Structure
```
client/src/
├── lib/
│   ├── handTracking.ts          ← Hand detection utilities
│   ├── scaleLibrary.ts          ← 30+ piano scales
│   ├── scaleValidator.ts        ← Fingering validation
│   ├── gamification.ts          ← XP, levels, badges
│   └── storage.ts               ← LocalStorage persistence
├── hooks/
│   ├── useHandTracking.ts       ← Camera/hand tracking hook
│   ├── useScaleTraining.ts      ← Scale practice session hook
│   └── useUserProgress.ts       ← Progress tracking hook
└── pages/
    ├── Home.tsx                 ← Dashboard
    ├── TrainingView.tsx         ← Camera training interface
    ├── Dashboard.tsx            ← Progress stats
    ├── Settings.tsx             ← Preferences
    └── ScaleSelector.tsx        ← Scale browser
```

---

## Quick Reference: Key Functions

### Hand Tracking (handTracking.ts)
```typescript
// Detect finger press
detectFingerPress(landmarks, calibration, previousY)

// Calibrate keyboard plane
calibrateKeyboardPlane(landmarks) → CalibrationData

// Extract hand info from MediaPipe results
extractHands(results) → Hand[]

// Get which finger is active
getActiveFinger(landmarks, calibration) → number | null

// Smooth jittery landmarks
smoothLandmarks(current, previous, alpha) → HandLandmark[]
```

### Scale Validation (scaleValidator.ts)
```typescript
// Create new scale session
createScaleProgress(scale, direction) → ScaleProgress

// Validate a finger press
validateFinger(progress, finger, timestamp, confidence) → ValidationResult

// Calculate timing accuracy
calculateTimingAccuracy(progress, timestamp, targetBPM) → number (0-100)

// Get final score
calculateFinalScore(progress) → { score, accuracy, timingAccuracy, grade }

// Check if perfect scale
isPerfectScale(progress) → boolean
```

### Gamification (gamification.ts)
```typescript
// Calculate XP for a session
calculateSessionXP(accuracy, streakCount, perfectScale) → { baseXP, streakBonus, perfectBonus, totalXP }

// Get level from XP
getLevelFromXP(totalXP) → number

// Get XP progress to next level
getXPProgress(totalXP) → { currentLevel, currentLevelXP, nextLevelXP, progressPercentage }

// Check for new badges
checkNewBadges(progress, previousBadges) → string[]

// Update streak
updateStreak(progress) → UserProgress
```

### Storage (storage.ts)
```typescript
// Load/save progress
loadUserProgress() → UserProgress
saveUserProgress(progress) → void

// Load/save calibration
loadCalibrationData() → CalibrationData | null
saveCalibrationData(data) → void

// Export/import
exportUserProgress(progress) → string
importUserProgress(jsonString) → UserProgress | null
```

---

## Data Models

### UserProgress
```typescript
{
  userId: string;
  totalXP: number;
  currentLevel: number;
  scaleProgress: {
    [scaleId]: {
      bestScore: number;
      attempts: number;
      lastAttempt: string;
      personalBest: number;
    }
  };
  badges: string[];
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  createdAt: string;
}
```

### Scale
```typescript
{
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
```

### ScaleProgress
```typescript
{
  scale: Scale;
  direction: "ascending" | "descending";
  expectedSequence: number[];
  detectedSequence: number[];
  fingerEvents: FingerEvent[];
  startTime: number;
  endTime: number | null;
  accuracy: number;           // 0-100
  timingAccuracy: number;     // 0-100
  isComplete: boolean;
  totalErrors: number;
}
```

### ValidationResult
```typescript
{
  isCorrect: boolean;
  expectedFinger: number;
  detectedFinger: number;
  position: number;
  timingAccuracy: number;     // 0-100
  feedback: string;
}
```

---

## Common Tasks

### 1. Start a Training Session
```typescript
const { startScale } = useScaleTraining();
const scale = SCALE_LIBRARY.find(s => s.id === "c_major_rh");
startScale(scale, "ascending");
```

### 2. Record a Completed Session
```typescript
const { recordSession } = useUserProgress();
const result = {
  scaleId: "c_major_rh",
  direction: "ascending",
  accuracy: 95,
  timingAccuracy: 88,
  score: 92,
  grade: "A",
  xpEarned: 75,
  isPerfect: false,
  duration: 45000,
  tempo: 120,
  completedAt: new Date().toISOString(),
};
recordSession(result);
```

### 3. Calibrate Hand Tracking
```typescript
const { calibrate, isCalibrated } = useHandTracking();
calibrate();
if (isCalibrated) {
  console.log("Ready to start training!");
}
```

### 4. Get User Progress
```typescript
const { progress, getLevelInfo, getBadgeInfo, getScaleStats } = useUserProgress();
const levelInfo = getLevelInfo();
const badges = getBadgeInfo();
const stats = getScaleStats();
```

---

## Scoring System

### XP Calculation
- Correct finger + correct timing: **10 XP**
- Correct finger + timing off: **5 XP**
- Wrong finger: **0 XP**
- Complete scale bonus: **+50 XP**
- Perfect scale (100% accuracy): **+100 XP**

### Streak Bonuses
- 5-finger streak: **+25 XP**
- 10-finger streak: **+50 XP**

### Level Progression
Formula: `XP_for_level_n = 50 * n * (n + 1)`

Examples:
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 300 XP
- Level 4: 600 XP
- Level 5: 1000 XP

### Badges (9 Total)
1. **First Steps** - Complete any scale (10 XP)
2. **Perfectionist** - 100% accuracy (50 XP)
3. **Speed Demon** - 120+ BPM with 90%+ accuracy (75 XP)
4. **Scale Master** - All major scales (200 XP)
5. **Ambidextrous** - Both hands (100 XP)
6. **Consistency** - 7-day streak (150 XP)
7. **Minor Master** - All natural minor scales (150 XP)
8. **Harmonic Harmony** - All harmonic minor scales (125 XP)
9. **Arpeggio Ace** - All major arpeggios (175 XP)

---

## Available Scales (30+)

### Beginner (6)
- C Major (RH/LH)
- G Major (RH/LH)
- F Major (RH/LH)
- A Minor (RH/LH)
- E Minor (RH/LH)
- D Minor (RH/LH)

### Intermediate (12)
- D Major (RH/LH)
- Bb Major (RH/LH)
- A Major (RH/LH)
- A Harmonic Minor (RH/LH)
- E Harmonic Minor (RH/LH)
- A Melodic Minor (RH/LH)
- C Major Arpeggio (RH/LH)
- G Major Arpeggio (RH/LH)
- F Major Arpeggio (RH/LH)

### Advanced (More can be added)

---

## Troubleshooting

### Camera Not Showing
1. Check browser console for errors
2. Verify camera permissions granted
3. Check if `videoRef.current.srcObject` has stream
4. Ensure HTTPS (required for camera access)

### Hand Not Detected
1. Improve lighting conditions
2. Position hand clearly in frame
3. Check MediaPipe scripts loaded: `console.log(window.Hands)`
4. Verify hand confidence > 0.5

### Finger Presses Not Registering
1. Ensure calibration completed
2. Check `calibration.calibrated === true`
3. Verify hand is in valid playing position
4. Check finger visibility in landmarks

### XP Not Saving
1. Check localStorage enabled
2. Verify `saveUserProgress()` called
3. Check browser storage quota
4. Look for errors in console

---

## Environment Variables (if needed)
```
VITE_ANALYTICS_ENDPOINT=<your-analytics-endpoint>
VITE_ANALYTICS_WEBSITE_ID=<your-website-id>
```

---

## Next Steps to Enhance

1. **Audio Feedback**
   - Add sound effects for correct/incorrect
   - Add metronome for timing practice

2. **Hand Posture Analysis**
   - Detect hand position (flat, curved, etc.)
   - Provide posture correction tips

3. **MIDI Integration**
   - Connect to MIDI keyboards
   - Validate both fingering AND notes

4. **Leaderboards**
   - Compare scores with other users
   - Weekly challenges

5. **Video Recording**
   - Record practice sessions
   - Review technique later

6. **Music Theory Integration**
   - Teach scale patterns
   - Show note names and intervals

---

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ Limited (camera access works, some features may vary)
- Mobile: ✅ Full support (use environment camera)

---

## Performance Tips
- Use `modelComplexity: 1` for faster detection (default)
- Reduce frame rate if needed (target 30 FPS)
- Smooth landmarks to reduce jitter
- Debounce finger press detection (100ms)

---

For more details, check the source files in `/client/src/`
