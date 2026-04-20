/**
 * Hand Tracking Engine - Uses MediaPipe Hands for real-time hand detection
 * 
 * This module handles:
 * - Loading MediaPipe Hands model
 * - Processing video frames
 * - Extracting hand landmarks
 * - Detecting finger presses
 * - Identifying which finger is pressed
 */

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Hand {
  landmarks: HandLandmark[];
  handedness: "Left" | "Right";
  confidence: number;
}

export interface FingerPress {
  finger: number; // 1-5 (thumb to pinky)
  hand: "left" | "right";
  timestamp: number;
  confidence: number;
}

export interface CalibrationData {
  keyboardPlaneY: number; // Y-coordinate of the keyboard surface
  pressThreshold: number; // How far down to trigger a press
  baselineTipY: number[]; // Neutral tip Y per finger at calibration time
  baselineCurl: number[]; // Neutral tip-vs-PIP depth per finger
  calibrated: boolean;
}

// Finger landmark indices in MediaPipe (0-20)
const FINGER_TIPS = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
};

const FINGER_PIPS = {
  thumb: 3,
  index: 6,
  middle: 10,
  ring: 14,
  pinky: 18,
};

const PALM_BASE = 0; // Wrist/palm base

/**
 * Initialize MediaPipe Hands
 */
export async function initializeMediaPipe(): Promise<any> {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
  document.head.appendChild(script);

  const handsScript = document.createElement("script");
  handsScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
  document.head.appendChild(handsScript);

  await new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MediaPipe camera_utils"));
  });

  await new Promise<void>((resolve, reject) => {
    handsScript.onload = () => resolve();
    handsScript.onerror = () => reject(new Error("Failed to load MediaPipe hands"));
  });

  // @ts-ignore
  const Hands = window.Hands;
  const hands = new Hands({
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    // Slightly lower thresholds to improve first detection on external/mobile cameras.
    minDetectionConfidence: 0.35,
    minTrackingConfidence: 0.35,
  });

  return hands;
}

/**
 * Detect finger press based on hand landmarks
 * A press is detected when a fingertip moves down relative to its PIP joint
 */
export function detectFingerPress(
  landmarks: HandLandmark[],
  calibration: CalibrationData,
  previousY: number | null
): { finger: number; isPressed: boolean } | null {
  if (!calibration.calibrated) {
    return null;
  }

  // Check each finger
  for (let finger = 1; finger <= 5; finger++) {
    const tipIndex = Object.values(FINGER_TIPS)[finger - 1];
    const pipIndex = Object.values(FINGER_PIPS)[finger - 1];

    const tipLandmark = landmarks[tipIndex];
    const pipLandmark = landmarks[pipIndex];

    if (!tipLandmark || !pipLandmark) continue;

    // Calculate how far down the finger is relative to its PIP joint
    const fingerDepth = tipLandmark.y - pipLandmark.y;

    // If finger is pressed down (negative depth), it's likely touching the keyboard
    const isPressed = tipLandmark.y >= calibration.keyboardPlaneY - calibration.pressThreshold;

    if (isPressed) {
      return { finger, isPressed: true };
    }
  }

  return null;
}

/**
 * Calibrate the keyboard plane based on hand position
 * User should place their hand on the keyboard in a neutral position
 */
export function calibrateKeyboardPlane(
  landmarks: HandLandmark[]
): CalibrationData {
  // Get all fingertips
  const fingerTips = [
    landmarks[FINGER_TIPS.thumb],
    landmarks[FINGER_TIPS.index],
    landmarks[FINGER_TIPS.middle],
    landmarks[FINGER_TIPS.ring],
    landmarks[FINGER_TIPS.pinky],
  ].filter((tip) => tip !== undefined);

  if (fingerTips.length === 0) {
    return {
      keyboardPlaneY: 0.7, // Default fallback
      pressThreshold: 0.05,
      baselineTipY: [0, 0, 0, 0, 0],
      baselineCurl: [0, 0, 0, 0, 0],
      calibrated: false,
    };
  }

  // Average Y position of fingertips = keyboard plane
  const avgY = fingerTips.reduce((sum, tip) => sum + tip.y, 0) / fingerTips.length;
  const baselineTipY: number[] = [];
  const baselineCurl: number[] = [];

  for (let finger = 1; finger <= 5; finger++) {
    const tipIndex = Object.values(FINGER_TIPS)[finger - 1];
    const pipIndex = Object.values(FINGER_PIPS)[finger - 1];

    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];

    baselineTipY.push(tip?.y ?? avgY);
    baselineCurl.push(tip && pip ? tip.y - pip.y : 0);
  }

  return {
    keyboardPlaneY: avgY,
    pressThreshold: 0.08, // Allow 8% of frame height for pressing
    baselineTipY,
    baselineCurl,
    calibrated: true,
  };
}

/**
 * Extract hand information from MediaPipe results
 */
export function extractHands(results: any): Hand[] {
  const hands: Hand[] = [];
  const multiHandLandmarks = results?.multiHandLandmarks ?? [];
  const multiHandedness = results?.multiHandedness ?? [];

  if (multiHandLandmarks.length === 0) {
    return hands;
  }

  for (let i = 0; i < multiHandLandmarks.length; i++) {
    const landmarks = multiHandLandmarks[i];
    const handedness = multiHandedness[i];
    const label = handedness?.label === "Left" ? "Left" : "Right";
    const score = typeof handedness?.score === "number" ? handedness.score : 1;

    hands.push({
      landmarks: landmarks.map((landmark: any) => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility,
      })),
      handedness: label,
      confidence: score,
    });
  }

  return hands;
}

/**
 * Get finger position (1-5) from landmarks
 * Returns the finger that is most likely being pressed
 */
export function getActiveFinger(
  landmarks: HandLandmark[],
  calibration: CalibrationData
): number | null {
  if (!calibration.calibrated) {
    return null;
  }

  let best: { finger: number; score: number } | null = null;
  let runnerUpScore = -Infinity;

  // Pick the finger with the strongest calibrated "press" score.
  for (let finger = 1; finger <= 5; finger++) {
    const tipIndex = Object.values(FINGER_TIPS)[finger - 1];
    const pipIndex = Object.values(FINGER_PIPS)[finger - 1];

    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];

    if (!tip || !pip) continue;

    const baselineTip = calibration.baselineTipY[finger - 1] ?? calibration.keyboardPlaneY;
    const baselineCurl = calibration.baselineCurl[finger - 1] ?? 0;

    // Positive when tip moved down from neutral (screen Y increases downward).
    const tipDrop = tip.y - baselineTip;
    // Positive when finger curls downward vs neutral shape.
    const curlDelta = tip.y - pip.y - baselineCurl;

    const score = tipDrop * 0.7 + curlDelta * 0.3;

    const nearKeyboardPlane = tip.y >= calibration.keyboardPlaneY - calibration.pressThreshold;
    if (!nearKeyboardPlane) continue;

    if (!best || score > best.score) {
      if (best) {
        runnerUpScore = Math.max(runnerUpScore, best.score);
      }
      best = { finger, score };
    } else {
      runnerUpScore = Math.max(runnerUpScore, score);
    }
  }

  // Require minimum certainty and separation to reduce random mislabels.
  if (!best) {
    return null;
  }

  const minPressScore = 0.015;
  const minSeparation = 0.006;

  if (best.score < minPressScore) {
    return null;
  }

  if (runnerUpScore !== -Infinity && best.score - runnerUpScore < minSeparation) {
    return null;
  }

  return best.finger;
}

/**
 * Smooth hand landmarks using exponential moving average
 * Reduces jitter in detection
 */
export function smoothLandmarks(
  current: HandLandmark[],
  previous: HandLandmark[] | null,
  alpha: number = 0.7
): HandLandmark[] {
  if (!previous) {
    return current;
  }

  return current.map((landmark, i) => {
    const prev = previous[i];
    if (!prev) return landmark;

    return {
      x: landmark.x * alpha + prev.x * (1 - alpha),
      y: landmark.y * alpha + prev.y * (1 - alpha),
      z: landmark.z * alpha + prev.z * (1 - alpha),
      visibility: landmark.visibility,
    };
  });
}

/**
 * Calculate hand confidence score (0-1)
 * Based on visibility of key landmarks
 */
export function calculateHandConfidence(landmarks: HandLandmark[]): number {
  const keyLandmarks = [0, 5, 9, 13, 17]; // Wrist, base of each finger
  const visibleLandmarks = keyLandmarks.filter(
    (i) => landmarks[i] && landmarks[i].visibility && landmarks[i].visibility > 0.5
  );

  return visibleLandmarks.length / keyLandmarks.length;
}

/**
 * Detect hand orientation (palm facing up/down)
 * Returns angle in degrees
 */
export function detectHandOrientation(landmarks: HandLandmark[]): number {
  const wrist = landmarks[0];
  const middleBase = landmarks[9];
  const pinkyBase = landmarks[17];

  if (!wrist || !middleBase || !pinkyBase) {
    return 0;
  }

  // Calculate angle between wrist-to-middle and wrist-to-pinky
  const angle = Math.atan2(pinkyBase.y - middleBase.y, pinkyBase.x - middleBase.x);
  return (angle * 180) / Math.PI;
}

/**
 * Check if hand is in valid playing position
 * (palm facing up, fingers extended)
 */
export function isValidPlayingPosition(
  landmarks: HandLandmark[],
  calibration: CalibrationData
): boolean {
  if (!calibration.calibrated) {
    return false;
  }

  // Check if most fingers are visible
  const fingertips = [
    landmarks[FINGER_TIPS.thumb],
    landmarks[FINGER_TIPS.index],
    landmarks[FINGER_TIPS.middle],
    landmarks[FINGER_TIPS.ring],
    landmarks[FINGER_TIPS.pinky],
  ];

  const visibleFingers = fingertips.filter(
    (tip) => tip && tip.visibility && tip.visibility > 0.5
  ).length;

  // At least 4 out of 5 fingers should be visible
  return visibleFingers >= 4;
}

/**
 * Get distance between two landmarks
 */
export function getLandmarkDistance(
  landmark1: HandLandmark,
  landmark2: HandLandmark
): number {
  const dx = landmark2.x - landmark1.x;
  const dy = landmark2.y - landmark1.y;
  const dz = landmark2.z - landmark1.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Detect if a finger is extended or curled
 */
export function isFingerExtended(
  landmarks: HandLandmark[],
  finger: number
): boolean {
  const tipIndex = Object.values(FINGER_TIPS)[finger - 1];
  const pipIndex = Object.values(FINGER_PIPS)[finger - 1];
  const mcpIndex = finger === 1 ? 2 : [5, 9, 13, 17][finger - 2];

  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];
  const mcp = landmarks[mcpIndex];

  if (!tip || !pip || !mcp) return false;

  // Calculate distances
  const tipToPip = getLandmarkDistance(tip, pip);
  const pipToMcp = getLandmarkDistance(pip, mcp);

  // If tip is far from PIP, finger is extended
  return tipToPip > pipToMcp * 0.8;
}
