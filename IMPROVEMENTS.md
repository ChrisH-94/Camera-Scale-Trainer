# Piano Scale Trainer - Improvement Roadmap

## 🎯 Planned Features & Enhancements

### Phase 1: Audio & Timing (High Priority)

#### 1.1 Metronome Integration
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 2-3 hours

**What to do**:
```bash
# Install Tone.js for audio
pnpm add tone

# Create new file: client/src/lib/metronome.ts
# Implement:
# - Start/stop metronome
# - Adjustable BPM (60-200)
# - Visual beat indicator
# - Sound options (beep, click, bell)
```

**Implementation hint**:
```typescript
// client/src/lib/metronome.ts
import * as Tone from 'tone';

export class Metronome {
  private synth: Tone.Synth;
  private now: Tone.Transport;
  
  constructor(bpm: number = 120) {
    this.synth = new Tone.Synth().toDestination();
    Tone.Transport.bpm.value = bpm;
  }
  
  start() {
    Tone.Transport.start();
  }
  
  stop() {
    Tone.Transport.stop();
  }
  
  setBPM(bpm: number) {
    Tone.Transport.bpm.value = bpm;
  }
}
```

#### 1.2 Sound Effects
**Status**: 🔴 Not Started  
**Difficulty**: Easy  
**Time**: 1-2 hours

**What to do**:
- Add success sound (correct finger press)
- Add error sound (wrong finger)
- Add completion sound (scale finished)
- Add UI toggle to mute/unmute

**Implementation**:
```typescript
// client/src/lib/sounds.ts
export const playCorrectSound = () => {
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("C4", "8n");
};

export const playErrorSound = () => {
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("G2", "8n");
};
```

#### 1.3 Timing Accuracy Visualization
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 2-3 hours

**What to do**:
- Show timing accuracy in real-time
- Visual indicator (early/on-time/late)
- Waveform display of tempo
- Histogram of timing errors

---

### Phase 2: Hand Posture Analysis (Medium Priority)

#### 2.1 Posture Detection
**Status**: 🔴 Not Started  
**Difficulty**: Hard  
**Time**: 4-6 hours

**What to do**:
```typescript
// Analyze hand landmarks to detect:
// - Finger curvature (curved vs flat)
// - Wrist angle (straight vs bent)
// - Hand height (too high vs too low)
// - Finger spread (proper spacing)

// client/src/lib/postureAnalysis.ts
export function analyzePosture(landmarks: HandLandmark[]) {
  return {
    fingerCurvature: calculateCurvature(landmarks),
    wristAngle: calculateWristAngle(landmarks),
    handHeight: calculateHeight(landmarks),
    fingerSpread: calculateSpread(landmarks),
    feedback: generatePostureFeedback(...),
  };
}
```

#### 2.2 Posture Feedback UI
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 2-3 hours

**What to do**:
- Add posture feedback panel during training
- Show tips for improvement
- Highlight problem areas
- Add posture-specific badges

---

### Phase 3: MIDI Integration (High Priority)

#### 3.1 MIDI Keyboard Connection
**Status**: 🔴 Not Started  
**Difficulty**: Hard  
**Time**: 5-7 hours

**What to do**:
```bash
# Install Web MIDI API polyfill
pnpm add webmidi

# Create: client/src/lib/midiIntegration.ts
```

**Implementation**:
```typescript
// client/src/lib/midiIntegration.ts
import WebMidi from 'webmidi';

export async function initializeMIDI() {
  await WebMidi.enable();
  
  if (WebMidi.inputs.length > 0) {
    const input = WebMidi.inputs[0];
    
    input.addListener('noteon', (e) => {
      console.log('Note pressed:', e.note.number);
    });
    
    input.addListener('noteoff', (e) => {
      console.log('Note released:', e.note.number);
    });
  }
}

export function getMIDINotes(scale: Scale): number[] {
  // Map scale fingerings to MIDI note numbers
  // Return expected MIDI notes for the scale
}
```

#### 3.2 Dual Validation (Fingering + Notes)
**Status**: 🔴 Not Started  
**Difficulty**: Hard  
**Time**: 4-5 hours

**What to do**:
- Validate both hand fingering AND MIDI notes
- Show which notes are correct/incorrect
- Bonus XP for perfect note accuracy
- New badge: "Perfect Pitch"

---

### Phase 4: Video Recording & Playback (Medium Priority)

#### 4.1 Session Recording
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 3-4 hours

**What to do**:
```typescript
// client/src/lib/videoRecorder.ts
import { MediaRecorder } from 'mediarecorder-polyfill';

export class SessionRecorder {
  private mediaRecorder: MediaRecorder;
  private chunks: BlobPart[] = [];
  
  constructor(stream: MediaStream) {
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
    };
  }
  
  start() {
    this.mediaRecorder.start();
  }
  
  stop(): Blob {
    this.mediaRecorder.stop();
    return new Blob(this.chunks, { type: 'video/webm' });
  }
  
  saveToFile(filename: string) {
    const blob = this.stop();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
}
```

#### 4.2 Playback & Analysis
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 3-4 hours

**What to do**:
- Play back recorded sessions
- Overlay hand tracking data
- Show accuracy timeline
- Compare multiple sessions

---

### Phase 5: Social & Leaderboards (Low Priority)

#### 5.1 User Accounts (Requires Backend)
**Status**: 🔴 Not Started  
**Difficulty**: Hard  
**Time**: 8-10 hours

**What to do**:
- Add user authentication
- Cloud sync for progress
- User profiles
- Public leaderboards

**Upgrade needed**: `web-db-user` (adds backend + database)

#### 5.2 Weekly Challenges
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 4-5 hours

**What to do**:
- New challenge each week
- Bonus XP for challenge completion
- Challenge-specific badges
- Leaderboard for challenges

#### 5.3 Social Sharing
**Status**: 🔴 Not Started  
**Difficulty**: Easy  
**Time**: 1-2 hours

**What to do**:
- Share achievements on social media
- Share progress screenshots
- Share personal bests
- Invite friends

---

### Phase 6: Advanced Training Features (Medium Priority)

#### 6.1 Tempo Progression
**Status**: 🔴 Not Started  
**Difficulty**: Easy  
**Time**: 1-2 hours

**What to do**:
- Auto-increase BPM as accuracy improves
- Difficulty levels (Slow, Normal, Fast)
- Custom tempo curves
- Tempo milestone badges

#### 6.2 Randomized Scales
**Status**: 🔴 Not Started  
**Difficulty**: Easy  
**Time**: 1-2 hours

**What to do**:
- Random scale selection mode
- Mixed hand training
- Timed challenges (30 sec, 1 min, etc.)
- Survival mode (increasing difficulty)

#### 6.3 Scale Variations
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 2-3 hours

**What to do**:
- Thirds (scale in thirds)
- Sixths (scale in sixths)
- Octaves (scale in octaves)
- Broken arpeggios

---

### Phase 7: Analytics & Insights (Low Priority)

#### 7.1 Performance Analytics
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 3-4 hours

**What to do**:
- Track improvement over time
- Identify weak scales
- Analyze timing patterns
- Generate practice recommendations

#### 7.2 Practice Statistics
**Status**: 🔴 Not Started  
**Difficulty**: Easy  
**Time**: 2-3 hours

**What to do**:
- Total practice time
- Most-practiced scales
- Accuracy trends
- Consistency metrics

#### 7.3 Export & Reports
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 3-4 hours

**What to do**:
```bash
pnpm add jspdf pdfkit

# Export progress as PDF
# Export stats as CSV
# Generate practice reports
# Share with teachers
```

---

### Phase 8: UI/UX Improvements (Ongoing)

#### 8.1 Dark Mode
**Status**: 🔴 Not Started  
**Difficulty**: Easy  
**Time**: 1-2 hours

**What to do**:
- Add dark theme toggle
- Update color scheme
- Improve contrast
- Save preference

#### 8.2 Mobile Optimization
**Status**: 🟡 Partial  
**Difficulty**: Medium  
**Time**: 2-3 hours

**What to do**:
- Responsive layout improvements
- Touch-friendly controls
- Mobile-specific camera handling
- Landscape orientation support

#### 8.3 Accessibility
**Status**: 🔴 Not Started  
**Difficulty**: Medium  
**Time**: 3-4 hours

**What to do**:
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance (WCAG AA)

---

## 🚀 Quick Win Improvements (Easy to Implement)

### 1. Add More Scales (30 min)
```typescript
// Add these scales to scaleLibrary.ts:
// - B Major, Bb Major, Db Major
// - B Minor, Bb Minor, Db Minor
// - All harmonic/melodic minor variants
// - All major/minor arpeggios
```

### 2. Adjust Difficulty Settings (15 min)
```typescript
// In scaleLibrary.ts, add difficulty levels:
// - Beginner: 60 BPM, simple scales
// - Intermediate: 90 BPM, all major/minor
// - Advanced: 120+ BPM, all variations
```

### 3. Add Practice Modes (1 hour)
```typescript
// New modes:
// - Slow (60 BPM)
// - Normal (120 BPM)
// - Fast (160 BPM)
// - Custom (user-defined)
```

### 4. Improve Error Messages (30 min)
```typescript
// Better feedback:
// - "Finger 2 expected, got Finger 3"
// - "Too slow, try 120 BPM"
// - "Hand moved, recalibrate"
```

### 5. Add Keyboard Shortcuts (45 min)
```typescript
// Shortcuts:
// - Space: Start/Stop
// - R: Reset
// - C: Calibrate
// - S: Settings
// - D: Dashboard
```

---

## 📊 Implementation Priority Matrix

```
High Impact, Easy    │ High Impact, Hard
- More scales        │ - MIDI integration
- Dark mode          │ - Leaderboards
- Keyboard shortcuts │ - Video recording
- Better errors      │ - Posture analysis
                     │
Low Impact, Easy     │ Low Impact, Hard
- UI tweaks          │ - Advanced analytics
- Color adjustments  │ - Complex variations
- Minor fixes        │ - Advanced features
```

---

## 🎓 Learning Path for Improvements

1. **Start with Phase 1** (Audio) - Builds on existing code
2. **Then Phase 2** (Posture) - Extends hand tracking
3. **Then Phase 3** (MIDI) - Adds new data source
4. **Then Phase 4** (Video) - Adds recording capability
5. **Then Phase 5+** (Advanced) - Requires more infrastructure

---

## 💡 Implementation Tips

### For Each Feature:
1. Create a new file in `client/src/lib/`
2. Add TypeScript interfaces for data
3. Create React hook in `client/src/hooks/`
4. Add UI component in `client/src/pages/` or `components/`
5. Test thoroughly before merging
6. Update documentation

### Testing:
```bash
# Type check
pnpm check

# Format code
pnpm format

# Build to catch errors
pnpm build
```

### Code Quality:
- Use TypeScript for type safety
- Add JSDoc comments
- Follow existing code style
- Test on mobile devices
- Test in multiple browsers

---

## 📈 Success Metrics

Track these to measure improvement success:

- **User Engagement**: Daily active users, session duration
- **Accuracy**: Average score, perfect scale percentage
- **Retention**: Week-over-week retention rate
- **Feature Adoption**: % of users trying new features
- **Performance**: Load time, frame rate, memory usage

---

## 🤝 Contributing

To implement improvements:

1. Pick a feature from this roadmap
2. Create a new branch: `git checkout -b feature/metronome`
3. Implement the feature
4. Test thoroughly
5. Create a checkpoint
6. Document changes in code comments
7. Update this roadmap

---

## 📞 Questions?

Refer to:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Installation & setup
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick lookup
- [COMPLETE_CODE_REFERENCE.md](./COMPLETE_CODE_REFERENCE.md) - API docs
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design

---

**Last Updated**: February 2026  
**Status**: 🔴 All features pending implementation  
**Estimated Total Time**: 50-70 hours for all features
