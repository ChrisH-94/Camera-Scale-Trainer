# Piano Scale Trainer - Quick Reference

## 🚀 Get Started in 3 Steps

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
client/src/
├── lib/
│   ├── handTracking.ts      # MediaPipe hand detection
│   ├── scaleLibrary.ts      # 30+ piano scales
│   ├── scaleValidator.ts    # Fingering validation
│   ├── gamification.ts      # XP, levels, badges
│   └── storage.ts           # LocalStorage management
├── hooks/
│   ├── useHandTracking.ts   # Camera hook
│   ├── useScaleTraining.ts  # Training session hook
│   └── useUserProgress.ts   # Progress tracking hook
├── pages/
│   ├── Home.tsx             # Dashboard
│   ├── TrainingView.tsx     # Camera training
│   ├── Dashboard.tsx        # Statistics
│   ├── Settings.tsx         # Preferences
│   └── ScaleSelector.tsx    # Scale browser
└── components/
    └── ui/                  # shadcn/ui components
```

## 🎯 Key Files to Edit

| File | Purpose | Edit For |
|------|---------|----------|
| `scaleLibrary.ts` | Piano scales | Add/remove scales |
| `gamification.ts` | XP system | Change rewards/levels |
| `useHandTracking.ts` | Camera tracking | Adjust detection settings |
| `index.css` | Colors/styling | Change theme |
| `TrainingView.tsx` | Training UI | Modify training interface |

## 🔧 Common Customizations

### Add a New Scale
```typescript
// In client/src/lib/scaleLibrary.ts
{
  id: "e_major_rh",
  name: "E Major",
  hand: "right",
  fingering: {
    ascending: [1, 2, 3, 1, 2, 3, 4, 5],
    descending: [5, 4, 3, 2, 1, 3, 2, 1],
  },
  difficulty: "intermediate",
  description: "E Major scale for right hand",
  octaves: 1,
}
```

### Change XP Rewards
```typescript
// In client/src/lib/gamification.ts
const XP_REWARDS = {
  CORRECT_FINGER: 10,      // Change this
  COMPLETE_SCALE: 50,      // Or this
  PERFECT_SCALE: 100,      // Or this
};
```

### Adjust Camera Settings
```typescript
// In client/src/hooks/useHandTracking.ts
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,           // 0=fast, 1=accurate
  minDetectionConfidence: 0.5,  // Lower = more sensitive
  minTrackingConfidence: 0.5,
});
```

### Change Colors
```css
/* In client/src/index.css */
:root {
  --primary: oklch(0.623 0.214 259.815);    /* Blue */
  --secondary: oklch(0.98 0.001 286.375);   /* Gray */
  --accent: oklch(0.967 0.001 286.375);     /* Light */
}
```

## 📊 Data Models

### UserProgress
```typescript
{
  userId: string;
  totalXP: number;
  currentLevel: number;
  scaleProgress: { [scaleId]: ScaleStats };
  badges: string[];
  currentStreak: number;
  longestStreak: number;
}
```

### Scale
```typescript
{
  id: string;
  name: string;
  hand: "left" | "right" | "both";
  fingering: { ascending: number[]; descending: number[] };
  difficulty: "beginner" | "intermediate" | "advanced";
}
```

## 🎮 Game Mechanics

### XP System
- Correct finger: **10 XP**
- Complete scale: **+50 XP**
- Perfect scale (100%): **+100 XP**
- Streak bonuses: **+25-50 XP**

### Level Formula
```
XP_for_level = 50 * n * (n + 1)
```
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 300 XP
- Level 4: 600 XP
- Level 5: 1000 XP

### Badges (9 Total)
1. First Steps - Complete any scale
2. Perfectionist - 100% accuracy
3. Speed Demon - 120+ BPM, 90%+ accuracy
4. Scale Master - All major scales
5. Ambidextrous - Both hands
6. Consistency - 7-day streak
7. Minor Master - All natural minor scales
8. Harmonic Harmony - All harmonic minor scales
9. Arpeggio Ace - All major arpeggios

## 🔌 Available Hooks

### useHandTracking
```typescript
const {
  videoRef,           // Attach to <video>
  isInitialized,      // MediaPipe loaded
  isCalibrated,       // Hand calibrated
  detectedHands,      // Current hand data
  calibrate,          // Start calibration
  error,              // Error message
} = useHandTracking({ enabled: true });
```

### useScaleTraining
```typescript
const {
  isActive,           // Session running
  currentScale,       // Current scale
  progress,           // Session progress
  lastValidation,     // Last feedback
  startScale,         // Start session
  endSession,         // End session
  resetSession,       // Reset progress
  getSessionInfo,     // Get stats
} = useScaleTraining({ targetBPM: 120 });
```

### useUserProgress
```typescript
const {
  progress,           // User data
  isLoading,          // Loading state
  recordSession,      // Save session
  getLevelInfo,       // Get level stats
  getBadgeInfo,       // Get badges
  getScaleStats,      // Get scale stats
  resetProgress,      // Reset all data
} = useUserProgress();
```

## 🐛 Debugging

### Check MediaPipe
```javascript
// In browser console
console.log(window.Hands);      // Should be object
console.log(window.Camera);     // Should be object
```

### Check Camera Stream
```javascript
const video = document.querySelector('video');
console.log(video.srcObject);   // Should be MediaStream
console.log(video.playing);     // Should be true
```

### Check LocalStorage
```javascript
// View saved progress
console.log(localStorage.getItem('piano-trainer-progress'));
```

## 📦 Dependencies

Main packages:
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **MediaPipe** - Hand tracking (CDN)
- **Wouter** - Routing

## 🚀 Build & Deploy

```bash
# Development
pnpm dev              # Start dev server

# Production
pnpm build            # Build for production
pnpm preview          # Preview build locally

# Deployment
# 1. Manus: Click Publish in UI
# 2. Vercel: vercel deploy
# 3. Netlify: netlify deploy dist/
```

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best experience |
| Edge | ✅ Full | Same as Chrome |
| Firefox | ✅ Full | Works well |
| Safari | ⚠️ Limited | Camera works, some features may vary |
| Mobile | ✅ Full | Use device camera |

## 🎓 Learning Resources

- **MediaPipe**: https://mediapipe.dev/
- **React**: https://react.dev/
- **Tailwind**: https://tailwindcss.com/
- **TypeScript**: https://www.typescriptlang.org/

## 💡 Tips & Tricks

1. **Hot Reload**: Changes save automatically during `pnpm dev`
2. **Type Checking**: Run `pnpm check` before building
3. **Performance**: Use DevTools Performance tab to profile
4. **Debugging**: Use React DevTools browser extension
5. **Testing**: Add tests in `__tests__` folders

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Camera not showing | Check permissions, restart server |
| Hand not detected | Improve lighting, adjust camera angle |
| Finger presses not registering | Ensure calibration, check hand visibility |
| Build errors | Run `pnpm check` and fix TypeScript errors |
| Port 3000 in use | Use `pnpm dev -- --port 3001` |

## 📞 Support

1. Check **SETUP_GUIDE.md** for detailed help
2. Review **COMPLETE_CODE_REFERENCE.md** for API docs
3. Check browser console (F12) for errors
4. Try different browser to isolate issues

---

**Quick Links**
- [Setup Guide](./SETUP_GUIDE.md)
- [Code Reference](./COMPLETE_CODE_REFERENCE.md)
- [Architecture Docs](./ARCHITECTURE.md)
