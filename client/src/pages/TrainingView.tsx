/**
 * Training View - Main training interface with camera and real-time feedback
 * 
 * Features:
 * - Live camera feed with hand tracking visualization
 * - Real-time feedback on finger presses
 * - Scale progress tracking
 * - Calibration interface
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
import { ArrowLeft, Camera, AlertTriangle, Check, X } from "lucide-react";

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
      // This would integrate with actual finger detection logic
      // For now, it's a placeholder for the real implementation
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
        {/* Video Feed */}
        <div className="flex-1 relative bg-black overflow-hidden">
          <video
            ref={handTracking.setVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />

          {/* Overlay Information */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {/* Top Info */}
            <div className="flex justify-between items-start">
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium">{scaleTraining.currentScale?.name}</p>
                <p className="text-xs text-gray-300">{direction}</p>
              </div>
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-2xl font-bold">{sessionInfo?.position || 0}/{scaleTraining.progress.expectedSequence.length}</p>
              </div>
            </div>

            {/* Bottom Feedback */}
            <div className="space-y-3">
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
          <video
            ref={handTracking.setVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
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
