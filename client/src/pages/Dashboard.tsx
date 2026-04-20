/**
 * Dashboard - Progress and statistics view
 * 
 * Shows:
 * - Overall statistics
 * - Badges earned
 * - Scale-by-scale progress
 * - Practice history
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProgress } from "@/hooks/useUserProgress";
import { SCALE_LIBRARY } from "@/lib/scaleLibrary";
import { ArrowLeft, Trophy, Flame, Target } from "lucide-react";

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const { progress, getBadgeInfo, getScaleStats } = useUserProgress();

  if (!progress) {
    return null;
  }

  const badges = getBadgeInfo();
  const overallStats = getScaleStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container py-8 max-w-6xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Your Progress</h1>

        {/* Overall Statistics */}
        {overallStats && "totalAttempts" in overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Scales Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">
                  {overallStats.totalScalesCompleted}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {overallStats.totalAttempts}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {overallStats.averageScore}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 flex items-center">
                  <Flame className="w-6 h-6 mr-2" />
                  {overallStats.currentStreak}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badges Section */}
        {badges.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements ({badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="font-semibold text-gray-900">{badge.name}</p>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <p className="text-xs text-amber-600 font-semibold mt-2">+{badge.xpReward} XP</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scale Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-600" />
              Scale Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SCALE_LIBRARY.map((scale) => {
                const scaleData = progress.scaleProgress[scale.id];

                return (
                  <div key={scale.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{scale.name}</p>
                        <p className="text-xs text-gray-600">{scale.hand}</p>
                      </div>
                      {scaleData ? (
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">{scaleData.bestScore}%</p>
                          <p className="text-xs text-gray-600">{scaleData.attempts} attempts</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not started</p>
                      )}
                    </div>
                    {scaleData && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${scaleData.bestScore}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
