# Piano Scale Trainer - Complete Setup Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the App](#running-the-app)
6. [Camera Setup & Troubleshooting](#camera-setup--troubleshooting)
7. [Features Overview](#features-overview)
8. [Customization Guide](#customization-guide)
9. [Performance Optimization](#performance-optimization)
10. [Deployment](#deployment)

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Open browser
# Navigate to http://localhost:3000

# 4. Allow camera permissions when prompted
# Click "Start Training" to begin
```

---

## Prerequisites

### Required
- **Node.js** 18+ (download from [nodejs.org](https://nodejs.org))
- **pnpm** 8+ (install with `npm install -g pnpm`)
- **Modern browser** (Chrome, Edge, Firefox, Safari)
- **Camera** (laptop, phone, or external USB camera)

### Recommended
- **VS Code** with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin

### System Requirements
- **RAM**: 2GB minimum (4GB+ recommended)
- **Storage**: 500MB for node_modules
- **Internet**: Required for MediaPipe CDN scripts

---

## Installation

### Step 1: Extract the Project
```bash
# Extract the ZIP file
unzip piano-scale-trainer.zip
cd piano-scale-trainer
```

### Step 2: Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

**Note**: The first install may take 2-3 minutes as it downloads all packages.

### Step 3: Verify Installation
```bash
# Check if everything installed correctly
pnpm check

# You should see no errors
```

---

## Configuration

### Environment Variables (Optional)

Create a `.env.local` file in the project root if you want to customize:

```bash
# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://your-analytics.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App configuration
VITE_APP_TITLE=Piano Scale Trainer
VITE_APP_LOGO=/logo.png
```

### Camera Permissions

The app requires camera access. When you first use the training feature:

1. Browser will ask for camera permission
2. Click **"Allow"** to grant access
3. If you accidentally blocked it:
   - **Chrome/Edge**: Click the lock icon in the address bar → Camera → Allow
   - **Firefox**: Preferences → Privacy → Permissions → Camera → Allow
   - **Safari**: Settings → Websites → Camera → Allow

### HTTPS Requirement

Camera access requires HTTPS in production. For local development, `localhost` works fine.

---

## Running the App

### Development Mode
```bash
# Start the dev server with hot reload
pnpm dev

# Server will run at http://localhost:3000
# Changes to code automatically refresh the browser
```

### Production Build
```bash
# Build for production
pnpm build

# Preview the production build locally
pnpm preview

# This creates an optimized bundle in the `dist/` folder
```

### Type Checking
```bash
# Check for TypeScript errors without building
pnpm check

# Format code with Prettier
pnpm format
```

---

## Camera Setup & Troubleshooting

### Initial Setup

1. **Position Your Camera**
   - Ensure your entire hand is visible
   - Good lighting is essential (avoid backlighting)
   - Camera should be 12-18 inches from your keyboard
   - Angle: 45-60 degrees above the keyboard

2. **Calibration**
   - When you start training, you'll see a calibration screen
   - Place your hand on the keyboard in a neutral position
   - Wait for "Hand detected!" message
   - Click "Calibrate"

3. **First Training Session**
   - Select a scale (start with C Major)
   - Choose direction (Ascending or Descending)
   - Click "Start Training"
   - The camera feed should appear with overlay information

### Troubleshooting

#### ❌ Camera Feed Not Showing

**Problem**: Video element is black or not displaying

**Solutions**:
1. **Check permissions**: Browser must have camera access
   - Look for permission prompt in browser
   - Check browser settings → Privacy → Camera
   
2. **Check console for errors**:
   ```javascript
   // Open browser DevTools (F12)
   // Go to Console tab
   // Look for red error messages
   ```

3. **Verify MediaPipe loaded**:
   ```javascript
   // In browser console, type:
   console.log(window.Hands);
   console.log(window.Camera);
   // Both should return objects, not undefined
   ```

4. **Try a different camera**:
   - If using external camera, try built-in camera
   - Check if camera works in other apps (Zoom, Skype)

5. **Check browser compatibility**:
   - Use Chrome, Edge, or Firefox (Safari has limited support)
   - Update to latest browser version

#### ❌ Hand Not Detected

**Problem**: Calibration screen shows "Move your hand into view"

**Solutions**:
1. **Improve lighting**:
   - Use natural light or desk lamp
   - Avoid shadows on your hand
   - Face the light source

2. **Adjust camera angle**:
   - Move camera closer (12-18 inches)
   - Adjust angle to see entire hand
   - Ensure keyboard is visible

3. **Check hand visibility**:
   - Remove rings/bracelets that might confuse detection
   - Keep hand steady during calibration
   - Avoid rapid movements

4. **Verify MediaPipe confidence**:
   ```javascript
   // Check detection confidence in console
   // Should be > 0.5 for reliable detection
   ```

#### ❌ Finger Presses Not Registering

**Problem**: Playing scale but no feedback or score

**Solutions**:
1. **Complete calibration first**:
   - Must calibrate before training starts
   - Calibration data is saved locally

2. **Ensure proper hand position**:
   - Keep hand in keyboard playing position
   - Fingers should be on the keys
   - Don't move hand during scale

3. **Check finger visibility**:
   - All fingers must be visible to camera
   - Avoid obscuring fingers with other objects
   - Keep hand in frame throughout

4. **Verify timing**:
   - Play at the target BPM (default 120)
   - Use Settings to adjust BPM if needed
   - Play steadily without rushing

#### ❌ App Crashes or Freezes

**Problem**: App becomes unresponsive

**Solutions**:
1. **Clear browser cache**:
   ```
   Chrome: Ctrl+Shift+Delete → Clear browsing data
   Firefox: Ctrl+Shift+Delete → Clear Recent History
   ```

2. **Restart dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Restart it
   pnpm dev
   ```

3. **Check browser console for errors**:
   - F12 → Console tab
   - Look for red error messages
   - Screenshot and report if needed

4. **Try incognito/private mode**:
   - Some extensions interfere with camera access
   - Test in incognito mode to isolate issues

---

## Features Overview

### 🎯 Training Mode
- **Real-time hand tracking** using MediaPipe
- **Live camera feed** with finger detection
- **Instant feedback** on correct/incorrect fingerings
- **Accuracy scoring** (0-100%)
- **Timing validation** against target BPM

### 📊 Progress Dashboard
- **Level progression** with XP system
- **Scale-by-scale statistics**
- **Achievement badges** (9 total)
- **Practice streaks** and personal bests
- **Detailed history** of all sessions

### 🏆 Gamification System
- **XP Rewards**: 10 XP per correct finger, bonuses for perfect scales
- **Levels**: Exponential progression (100 XP for Level 2, 300 for Level 3, etc.)
- **Streaks**: Bonus XP for consecutive correct fingers
- **Badges**: 9 achievements to unlock (Perfectionist, Speed Demon, Scale Master, etc.)

### 🎹 30+ Piano Scales
- **Major scales** (C, G, F, D, Bb, A)
- **Natural minor scales** (A, E, D, etc.)
- **Harmonic minor scales** (A, E, etc.)
- **Melodic minor scales** (A, etc.)
- **Arpeggios** (Major, minor)
- **Difficulty levels**: Beginner, Intermediate, Advanced

### ⚙️ Settings
- **Camera calibration** (recalibrate anytime)
- **BPM adjustment** (60-200 BPM)
- **Data management** (reset progress)
- **About & tips** section

---

## Customization Guide

### Adding New Scales

Edit `client/src/lib/scaleLibrary.ts`:

```typescript
const SCALE_LIBRARY: Scale[] = [
  // ... existing scales ...
  {
    id: "e_major_rh",
    name: "E Major",
    key: "E",
    hand: "right",
    fingering: {
      ascending: [1, 2, 3, 1, 2, 3, 4, 5],
      descending: [5, 4, 3, 2, 1, 3, 2, 1],
    },
    difficulty: "intermediate",
    description: "E Major scale for right hand",
    octaves: 1,
  },
  // ... more scales ...
];
```

### Adjusting XP System

Edit `client/src/lib/gamification.ts`:

```typescript
// Change XP rewards
const XP_REWARDS = {
  CORRECT_FINGER: 10,        // Points per correct finger
  CORRECT_TIMING: 5,         // Bonus for timing
  COMPLETE_SCALE: 50,        // Bonus for finishing
  PERFECT_SCALE: 100,        // Bonus for 100% accuracy
  STREAK_5: 25,              // 5-finger streak bonus
  STREAK_10: 50,             // 10-finger streak bonus
};

// Change level progression
const LEVEL_FORMULA = (level: number) => 50 * level * (level + 1);
```

### Modifying UI Colors

Edit `client/src/index.css`:

```css
:root {
  --primary: oklch(0.623 0.214 259.815);  /* Change primary color */
  --secondary: oklch(0.98 0.001 286.375); /* Change secondary color */
  /* ... more colors ... */
}
```

### Changing Target BPM

Edit `client/src/pages/TrainingView.tsx`:

```typescript
const scaleTraining = useScaleTraining({
  targetBPM: 120,  // Change default BPM here
});
```

### Customizing Badges

Edit `client/src/lib/gamification.ts`:

```typescript
const BADGES: Badge[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first scale",
    icon: "👣",
    xpReward: 10,
    condition: (progress) => progress.totalScalesCompleted >= 1,
  },
  // ... add more badges ...
];
```

---

## Performance Optimization

### For Slower Devices

1. **Reduce hand tracking frequency**:
   ```typescript
   // In useHandTracking.ts
   hands.setOptions({
     modelComplexity: 0,  // Faster but less accurate
     minDetectionConfidence: 0.6,  // Higher threshold
   });
   ```

2. **Disable animations**:
   ```typescript
   // In index.css
   * {
     animation: none !important;
   }
   ```

3. **Reduce video resolution**:
   ```typescript
   // In useHandTracking.ts
   const stream = await navigator.mediaDevices.getUserMedia({
     video: {
       width: { ideal: 320 },  // Lower resolution
       height: { ideal: 240 },
     },
   });
   ```

### For Better Accuracy

1. **Increase model complexity**:
   ```typescript
   hands.setOptions({
     modelComplexity: 1,  // More accurate
     minDetectionConfidence: 0.3,  // Lower threshold
   });
   ```

2. **Use higher resolution**:
   ```typescript
   video: {
     width: { ideal: 1280 },
     height: { ideal: 720 },
   }
   ```

3. **Improve landmark smoothing**:
   ```typescript
   // In handTracking.ts
   const smoothed = smoothLandmarks(landmarks, previous, 0.9);  // Higher = smoother
   ```

---

## Deployment

### Deploy to Manus (Recommended)

1. **Create a checkpoint** (already done)
2. **Click "Publish"** in the Management UI
3. **Choose domain** (auto-generated or custom)
4. **App goes live** in seconds

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to connect GitHub and deploy
```

### Deploy to Netlify

```bash
# Build the app
pnpm build

# Deploy the dist/ folder to Netlify
# Via CLI or drag-and-drop in dashboard
```

### Deploy to Your Own Server

```bash
# Build for production
pnpm build

# Upload dist/ folder to your server
# Configure web server to serve index.html for all routes

# For Nginx:
location / {
  try_files $uri $uri/ /index.html;
}

# For Apache:
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### HTTPS Requirement

**Important**: Camera access requires HTTPS in production.

- **Manus**: Automatic HTTPS ✅
- **Vercel/Netlify**: Automatic HTTPS ✅
- **Custom server**: Use Let's Encrypt (free) or purchase SSL certificate

---

## Advanced Features to Add

### 1. Audio Feedback
```bash
# Install audio library
pnpm add tone

# Add sound effects for correct/incorrect presses
# See client/src/lib/audio.ts (template provided)
```

### 2. Metronome
```bash
# Use Tone.js to create metronome
# Helps students stay in time
# Adjustable BPM
```

### 3. MIDI Integration
```bash
# Connect to MIDI keyboards
# Validate both fingering AND notes played
# Requires Web MIDI API
```

### 4. Video Recording
```bash
# Record practice sessions
# Review technique later
# Requires MediaRecorder API
```

### 5. Leaderboards
```bash
# Compare scores with other users
# Weekly challenges
# Requires backend database
```

### 6. Export Progress
```bash
# Export stats as PDF/CSV
# Share achievements
# Backup data
```

---

## Troubleshooting Common Issues

### Issue: "Module not found" errors
**Solution**: Run `pnpm install` again and clear cache:
```bash
rm -rf node_modules .pnpm-store
pnpm install
```

### Issue: Port 3000 already in use
**Solution**: Use a different port:
```bash
pnpm dev -- --port 3001
```

### Issue: Hot reload not working
**Solution**: Restart dev server:
```bash
# Ctrl+C to stop
# pnpm dev to restart
```

### Issue: Build fails with TypeScript errors
**Solution**: Check for type errors:
```bash
pnpm check
# Fix errors shown, then try building again
```

### Issue: Camera works in one browser but not another
**Solution**: 
- Ensure browser is up to date
- Try incognito/private mode
- Check browser permissions settings
- Try a different browser to isolate issue

---

## Getting Help

### Resources
- **MediaPipe Docs**: https://mediapipe.dev/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **TypeScript**: https://www.typescriptlang.org/

### Debugging
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for localStorage data

### Common Commands Reference
```bash
# Development
pnpm dev              # Start dev server
pnpm check            # Type check
pnpm format           # Format code

# Production
pnpm build            # Build for production
pnpm preview          # Preview production build

# Maintenance
pnpm install          # Install dependencies
pnpm update           # Update dependencies
```

---

## Next Steps

1. ✅ **Extract and install** the project
2. ✅ **Run `pnpm dev`** and open http://localhost:3000
3. ✅ **Allow camera permissions** when prompted
4. ✅ **Click "Start Training"** to test the app
5. ✅ **Calibrate your hand** on the first scale
6. ✅ **Try a practice session** (C Major recommended)
7. ✅ **Check your progress** in the Dashboard
8. ✅ **Customize** scales, XP, or colors as needed
9. ✅ **Deploy** when ready using Manus or your preferred platform

---

## Support

If you encounter issues:

1. **Check this guide** for solutions
2. **Review browser console** for error messages
3. **Try the troubleshooting section** above
4. **Test in different browser** to isolate issues
5. **Clear cache and restart** dev server

---

**Happy practicing! 🎹**

For updates and improvements, check the GitHub repository or contact support.
