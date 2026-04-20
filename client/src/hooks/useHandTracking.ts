/**
 * useHandTracking - React hook for MediaPipe hand tracking
 * 
 * Manages:
 * - MediaPipe initialization
 * - Video stream capture
 * - Frame processing
 * - Hand detection and landmark extraction
 * - Finger press detection
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Hand,
  CalibrationData,
  initializeMediaPipe,
  extractHands,
  calibrateKeyboardPlane,
  getActiveFinger,
  smoothLandmarks,
  calculateHandConfidence,
  isValidPlayingPosition,
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousLandmarksRef = useRef<any>(null);
  const previousFingerRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const setVideoNodeRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoElement(node);
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    if (!enabled) return;

    const initialize = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Load MediaPipe
        const hands = await initializeMediaPipe();
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
          error: "Failed to initialize hand tracking",
          isLoading: false,
        }));
      }
    };

    initialize();
  }, [enabled]);

  // Start camera and detection
  useEffect(() => {
    if (!state.isInitialized || !videoElement || !enabled) return;

    let stopped = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        videoElement.srcObject = stream;
        await videoElement.play().catch(() => undefined);

        const processFrame = async () => {
          if (stopped) return;

          if (!handsRef.current || !videoRef.current) {
            if (!stopped) {
              animationFrameRef.current = requestAnimationFrame(() => {
                void processFrame();
              });
            }
            return;
          }

          if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            await handsRef.current.send({ image: videoRef.current });
          }

          if (!stopped) {
            animationFrameRef.current = requestAnimationFrame(() => {
              void processFrame();
            });
          }
        };

        animationFrameRef.current = requestAnimationFrame(() => {
          void processFrame();
        });
      } catch (error) {
        console.error("Failed to start camera:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to access camera",
        }));
      }
    };

    startCamera();

    return () => {
      stopped = true;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const stream = videoElement.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      videoElement.srcObject = null;
    };
  }, [state.isInitialized, videoElement, enabled]);

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

  // Keep MediaPipe result callback synced with latest React state.
  useEffect(() => {
    if (!handsRef.current) return;
    handsRef.current.onResults(onResults);
  }, [onResults]);

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
    setVideoRef: setVideoNodeRef,
    canvasRef,
    ...state,
    calibrate,
    resetCalibration,
    frameCount: frameCountRef.current,
  };
}
