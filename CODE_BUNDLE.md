# Piano Scale Trainer - Complete Code Bundle

## Issue: Camera Input Not Showing

The main issue is that the **MediaPipe initialization** in `useHandTracking.ts` uses CDN scripts that may not load properly. Here's the corrected implementation:

---

## 1. FIXED: useHandTracking.ts (React Hook)

```typescript
/**
 * useHandTracking - React hook for MediaPipe hand tracking
 * FIXED VERSION: Proper MediaPipe initialization with error handling
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Hand,
  CalibrationData,
  extractHands,
  calibrateKeyboardPlane,
  getActiveFinger,
  smoothLandmarks,
  calculateHandConfidence,
} from "@/lib/handTracking";

interface UseHandTrackingOptions {
  onHandDetected?: (hand: Hand) => void;
  onFingerPress?: (finger: number, hand: "left" | "right") => void;
  onCalibrationComplete?: (calibration: CalibrationData) => void;
  enabled?: boolean;
}

interface UseHandTrackingState {
  isInitialized: boolean;
  isCalibrated: boolean;
  calibration: CalibrationData | null;
  detectedHands: Hand[];
  activeFinger: number | null;
  activeHand: "left" | "right" | null;
  error: string | null;
  isLoading: boolean;
}

export function useHandTracking(options: UseHandTrackingOptions = {}) {
  const {
    onHandDetected,
    onFingerPress,
    onCalibrationComplete,
    enabled = true,
  } = options;

  const [state, setState] = useState<UseHandTrackingState>({
    isInitialized: false,
    isCalibrated: false,
    calibration: null,
    detectedHands: [],
    activeFinger: null,
    activeHand: null,
    error: null,
    isLoading: true,
  });

  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousLandmarksRef = useRef<any>(null);
  const previousFingerRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);

  // Initialize MediaPipe with proper error handling
  useEffect(() => {
    if (!enabled) return;

    const initialize = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Load MediaPipe scripts from CDN
        const cameraScript = document.createElement("script");
        cameraScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
        cameraScript.async = true;

        const handsScript = document.createElement("script");
        handsScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
        handsScript.async = true;

        // Wait for both scripts to load
        await Promise.all([
          new Promise((resolve, reject) => {
            cameraScript.onload = resolve;
            cameraScript.onerror = reject;
            document.head.appendChild(cameraScript);
          }),
          new Promise((resolve, reject) => {
            handsScript.onload = resolve;
            handsScript.onerror = reject;
            document.head.appendChild(handsScript);
          }),
        ]);

        // Initialize Hands model
        // @ts-ignore
        const Hands = window.Hands;
        if (!Hands) {
          throw new Error("MediaPipe Hands not loaded");
        }

        const hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        handsRef.current = hands;

        setState((prev) => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to initialize MediaPipe:", error);
        setState((prev) => ({
          ...prev,
          error: `Failed to initialize hand tracking: ${error}`,
          isLoading: false,
        }));
      }
    };

    initialize();
  }, [enabled]);

  // Start camera and detection
  useEffect(() => {
    if (!state.isInitialized || !videoRef.current || !enabled) return;

    const startCamera = async () => {
      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        // @ts-ignore
        const Camera = window.Camera;
        if (!Camera) {
          throw new Error("Camera utils not loaded");
        }

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch (err) {
                console.error("Error processing frame:", err);
              }
            }
          },
          width: 640,
          height: 480,
        });

        // Set up results handler
        handsRef.current.onResults(onResults);

        camera.start();
        cameraRef.current = camera;

        setState((prev) => ({ ...prev, error: null }));
      } catch (error) {
        console.error("Failed to start camera:", error);
        setState((prev) => ({
          ...prev,
          error: `Camera access denied: ${error}. Please allow camera permissions.`,
        }));
      }
    };

    startCamera();

    return () => {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (err) {
          console.error("Error stopping camera:", err);
        }
      }
    };
  }, [state.isInitialized, enabled]);

  // Process MediaPipe results
  const onResults = useCallback(
    (results: any) => {
      frameCountRef.current++;

      // Extract hands from results
      const hands = extractHands(results);

      if (hands.length === 0) {
        setState((prev) => ({
          ...prev,
          detectedHands: [],
          activeFinger: null,
          activeHand: null,
        }));
        previousLandmarksRef.current = null;
        return;
      }

      // Process each detected hand
      const processedHands: Hand[] = [];

      for (const hand of hands) {
        // Smooth landmarks
        const smoothed = smoothLandmarks(
          hand.landmarks,
          previousLandmarksRef.current,
          0.7
        );

        // Calculate confidence
        const confidence = calculateHandConfidence(smoothed);

        const processedHand: Hand = {
          landmarks: smoothed,
          handedness: hand.handedness,
          confidence,
        };

        processedHands.push(processedHand);

        // Callback for hand detection
        if (onHandDetected && confidence > 0.5) {
          onHandDetected(processedHand);
        }

        // Detect finger press (only if calibrated)
        if (state.isCalibrated && state.calibration) {
          const activeFinger = getActiveFinger(smoothed, state.calibration);

          if (activeFinger && activeFinger !== previousFingerRef.current) {
            previousFingerRef.current = activeFinger;

            // Callback for finger press
            if (onFingerPress) {
              const handType = hand.handedness === "Right" ? "right" : "left";
              onFingerPress(activeFinger, handType);
            }
          } else if (!activeFinger) {
            previousFingerRef.current = null;
          }
        }
      }

      previousLandmarksRef.current = hands[0]?.landmarks;

      setState((prev) => ({
        ...prev,
        detectedHands: processedHands,
      }));
    },
    [state.isCalibrated, state.calibration, onHandDetected, onFingerPress]
  );

  // Calibrate keyboard plane
  const calibrate = useCallback(() => {
    if (state.detectedHands.length === 0) {
      setState((prev) => ({
        ...prev,
        error: "No hand detected. Please position your hand on the keyboard.",
      }));
      return;
    }

    const hand = state.detectedHands[0];
    const calibration = calibrateKeyboardPlane(hand.landmarks);

    setState((prev) => ({
      ...prev,
      isCalibrated: true,
      calibration,
      error: null,
    }));

    if (onCalibrationComplete) {
      onCalibrationComplete(calibration);
    }
  }, [state.detectedHands, onCalibrationComplete]);

  // Reset calibration
  const resetCalibration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCalibrated: false,
      calibration: null,
    }));
    previousFingerRef.current = null;
  }, []);

  return {
    videoRef,
    canvasRef,
    ...state,
    calibrate,
    resetCalibration,
    frameCount: frameCountRef.current,
  };
}
```

---

## 2. FIXED: TrainingView.tsx (Camera Display)

Replace the entire file with this corrected version:

```typescript
/**
 * Training View - Main training interface with camera and real-time feedback
 * FIXED: Proper camera initialization and error handling
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useScaleTraining } from "@/hooks/useScaleTraining";
import { useUserProgress } from "@/hooks/useUserProgress";
import { SCALE_LIBRARY } from "@/lib/scaleLibrary";
import { ArrowLeft, Camera, AlertTriangle, Check } from "lucide-react";

interface TrainingViewProps {
  onBack: () => void;
}

export default function TrainingView({ onBack }: TrainingViewProps) {
  const [selectedScale, setSelectedScale] = useState<string | null>(null);
  const [direction, setDirection] = useState<"ascending" | "descending">("ascending");
  const [showCalibration, setShowCalibration] = useState(false);

  const handTracking = useHandTracking({
    enabled: true,
  });

  const scaleTraining = useScaleTraining({
    targetBPM: 120,
  });

  const { recordSession, saveCalibration } = useUserProgress();

  // Handle finger press from hand tracking
  useEffect(() => {
    if (handTracking.detectedHands.length > 0 && scaleTraining.isActive) {
      const hand = handTracking.detectedHands[0];
      // Detect finger presses here
      if (hand.landmarks) {
        // This will be enhanced with actual finger detection
      }
    }
  }, [handTracking.detectedHands, scaleTraining.isActive]);

  const handleStartTraining = () => {
    if (!selectedScale) {
      return;
    }

    const scale = SCALE_LIBRARY.find((s) => s.id === selectedScale);
    if (scale) {
      if (!handTracking.isCalibrated) {
        setShowCalibration(true);
      } else {
        scaleTraining.startScale(scale, direction);
      }
    }
  };

  const handleCalibrate = () => {
    handTracking.calibrate();
    if (handTracking.isCalibrated && handTracking.calibration) {
      saveCalibration(handTracking.calibration);
      setShowCalibration(false);

      // Start training after calibration
      const scale = SCALE_LIBRARY.find((s) => s.id === selectedScale);
      if (scale) {
        scaleTraining.startScale(scale, direction);
      }
    }
  };

  // If training is active, show the training interface
  if (scaleTraining.isActive && scaleTraining.progress) {
    const sessionInfo = scaleTraining.getSessionInfo();

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Video Feed Container */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {handTracking.error && (
            <Alert className="absolute top-4 left-4 right-4 z-50 bg-red-500 text-white border-red-600">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{handTracking.error}</AlertDescription>
            </Alert>
          )}

          <video
            ref={handTracking.videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* Overlay Information */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
            {/* Top Info */}
            <div className="flex justify-between items-start pointer-events-auto">
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium">{scaleTraining.currentScale?.name}</p>
                <p className="text-xs text-gray-300 capitalize">{direction}</p>
              </div>
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-2xl font-bold">
                  {sessionInfo?.position || 0}/{scaleTraining.progress.expectedSequence.length}
                </p>
              </div>
            </div>

            {/* Bottom Feedback */}
            <div className="space-y-3 pointer-events-auto">
              {/* Next Expected Finger */}
              {sessionInfo?.nextExpected && (
                <div className="bg-blue-500/80 text-white px-4 py-3 rounded-lg backdrop-blur-sm text-center">
                  <p className="text-sm text-blue-100">Next Finger</p>
                  <p className="text-4xl font-bold">{sessionInfo.nextExpected}</p>
                </div>
              )}

              {/* Last Validation Feedback */}
              {scaleTraining.lastValidation && (
                <div
                  className={`px-4 py-3 rounded-lg backdrop-blur-sm text-white text-center font-semibold ${
                    scaleTraining.lastValidation.isCorrect
                      ? "bg-green-500/80"
                      : "bg-red-500/80"
                  }`}
                >
                  {scaleTraining.lastValidation.feedback}
                </div>
              )}

              {/* Accuracy */}
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-xs text-gray-300 mb-1">Accuracy</p>
                <Progress value={sessionInfo?.accuracy || 0} className="h-2" />
                <p className="text-sm font-semibold mt-1">{Math.round(sessionInfo?.accuracy || 0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex gap-3">
          <Button variant="outline" onClick={() => scaleTraining.endSession()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <Button variant="outline" onClick={() => scaleTraining.resetSession()}>
            Reset
          </Button>
        </div>
      </div>
    );
  }

  // Scale selection view
  if (!selectedScale) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold mb-8">Select a Scale</h1>

          {/* Filter by difficulty */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Beginner Scales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCALE_LIBRARY.filter((s) => s.difficulty === "beginner").map((scale) => (
                <Card
                  key={scale.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedScale(scale.id)}
                >
                  <CardContent className="pt-6">
                    <p className="font-semibold">{scale.name}</p>
                    <p className="text-sm text-gray-600">{scale.hand}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Intermediate Scales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCALE_LIBRARY.filter((s) => s.difficulty === "intermediate").map((scale) => (
                <Card
                  key={scale.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedScale(scale.id)}
                >
                  <CardContent className="pt-6">
                    <p className="font-semibold">{scale.name}</p>
                    <p className="text-sm text-gray-600">{scale.hand}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calibration view
  if (showCalibration) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="flex-1 relative bg-black overflow-hidden">
          {handTracking.error && (
            <Alert className="absolute top-4 left-4 right-4 z-50 bg-red-500 text-white border-red-600">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{handTracking.error}</AlertDescription>
            </Alert>
          )}

          <video
            ref={handTracking.videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-8 max-w-md text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h2 className="text-2xl font-bold mb-2">Calibrate Your Hand</h2>
              <p className="text-gray-600 mb-6">
                Place your hand on the piano keyboard in a neutral position. We'll detect your hand and set up the tracking.
              </p>

              {handTracking.detectedHands.length > 0 ? (
                <div className="mb-6">
                  <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-semibold">Hand detected!</p>
                </div>
              ) : (
                <div className="mb-6">
                  <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-orange-600 font-semibold">Move your hand into view</p>
                </div>
              )}

              <Button
                onClick={handleCalibrate}
                disabled={handTracking.detectedHands.length === 0}
                className="w-full"
              >
                Calibrate
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Direction selection view
  const scale = SCALE_LIBRARY.find((s) => s.id === selectedScale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => setSelectedScale(null)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {scale && (
          <Card>
            <CardHeader>
              <CardTitle>{scale.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-900">{scale.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Difficulty</p>
                <p className="text-gray-900 capitalize font-semibold">{scale.difficulty}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-4">Direction</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setDirection("ascending")}
                    variant={direction === "ascending" ? "default" : "outline"}
                    className="h-12"
                  >
                    Ascending
                  </Button>
                  <Button
                    onClick={() => setDirection("descending")}
                    variant={direction === "descending" ? "default" : "outline"}
                    className="h-12"
                  >
                    Descending
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleStartTraining}
                className="w-full h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Training
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

---

## 3. Key Issue: Camera Permissions

Add this to your `client/index.html` in the `<head>` section:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

---

## 4. Testing Checklist

1. **Camera Permission**: When you click "Start Training", your browser should ask for camera access
2. **Video Feed**: You should see your camera feed in the video element
3. **Hand Detection**: Once calibrated, hand landmarks should be detected
4. **Finger Tracking**: Finger presses should be registered

---

## 5. Debugging Tips

Add this to your browser console to check MediaPipe status:

```javascript
// Check if MediaPipe is loaded
console.log("Hands:", window.Hands);
console.log("Camera:", window.Camera);

// Check camera stream
const video = document.querySelector('video');
console.log("Video srcObject:", video?.srcObject);
console.log("Video playing:", video?.playing);
```

---

## Summary of Changes

1. **Fixed MediaPipe initialization** - Proper script loading with error handling
2. **Added camera permission handling** - Better error messages
3. **Fixed video element display** - Ensured proper sizing and display
4. **Added error alerts** - Users see what's wrong
5. **Improved state management** - Better tracking of initialization state

Try these changes and let me know if the camera feed appears!
