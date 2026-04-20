/**
 * Settings Page - User preferences and calibration
 * 
 * Features:
 * - Camera calibration
 * - BPM adjustment\n * - Data management
 * - About information
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserProgress } from "@/hooks/useUserProgress";
import { ArrowLeft, RotateCcw, Info } from "lucide-react";

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { resetProgress, getCalibration } = useUserProgress();
  const [targetBPM, setTargetBPM] = useState(120);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const calibration = getCalibration();

  const handleReset = () => {
    if (showResetConfirm) {
      resetProgress();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Calibration Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hand Tracking Calibration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              {calibration ? (
                <div>
                  <p className="font-semibold text-green-700">✓ Calibrated</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your hand tracking is set up. You can recalibrate anytime before a training session.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-orange-700">⚠ Not Calibrated</p>
                  <p className="text-sm text-gray-600 mt-1">
                    You'll be guided through calibration when you start your first training session.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* BPM Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Training Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target BPM (Beats Per Minute)
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={targetBPM}
                  onChange={(e) => setTargetBPM(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-indigo-600 w-16 text-right">
                  {targetBPM}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Adjust the target tempo for scale practice. Default is 120 BPM.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showResetConfirm && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  Are you sure? This will permanently delete all your progress, XP, levels, and badges.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleReset}
              variant={showResetConfirm ? "destructive" : "outline"}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {showResetConfirm ? "Confirm Reset" : "Reset All Progress"}
            </Button>

            {showResetConfirm && (
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Piano Scale Trainer</p>
              <p>Version 1.0.0</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">How It Works</p>
              <p>
                This app uses your device's camera and AI-powered hand tracking to detect your piano fingerings in real-time. It validates your finger positions against correct scale patterns and provides instant feedback.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">Technology</p>
              <p>
                Powered by Google's MediaPipe Hands for accurate hand tracking and finger detection.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">Privacy</p>
              <p>
                All your data is stored locally on your device. No information is sent to external servers.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">Tips for Best Results</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use good lighting for accurate hand detection</li>
                <li>Position your camera to see your entire hand and keyboard</li>
                <li>Keep your hand steady during calibration</li>
                <li>Practice regularly to improve accuracy</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
