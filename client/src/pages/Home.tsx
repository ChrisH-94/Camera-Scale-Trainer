/**
 * Home Page - Main dashboard and navigation hub
 * 
 * Design Philosophy: Modern, clean interface with emphasis on progress visualization
 * and quick access to training features. Uses a card-based layout with clear CTAs.
 */

import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProgress } from "@/hooks/useUserProgress";
import Dashboard from "./Dashboard";
import TrainingView from "./TrainingView";
import ScaleSelector from "./ScaleSelector";
import Settings from "./Settings";
import { Music, Zap, Trophy, Settings as SettingsIcon } from "lucide-react";

type Page = "home" | "training" | "dashboard" | "settings";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { progress, isLoading, getLevelInfo, getScaleStats } = useUserProgress();

  if (isLoading || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-bounce" />
          <p className="text-lg font-medium text-gray-700">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo();
  const scaleStats = getScaleStats();

  // Render different pages based on navigation
  if (currentPage === "training") {
    return <TrainingView onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "dashboard") {
    return <Dashboard onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "settings") {
    return <Settings onBack={() => setCurrentPage("home")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Piano Scale Trainer</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage("settings")}
            className="text-gray-600 hover:text-gray-900"
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-6xl">
        {/* Level & XP Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Level Card */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-0 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium opacity-90">Current Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2">{levelInfo?.currentLevel}</div>
              <p className="text-indigo-100 text-sm">Piano Master</p>
            </CardContent>
          </Card>

          {/* XP Card */}
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium opacity-90">Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2">{levelInfo?.totalXP.toLocaleString()}</div>
              <p className="text-amber-100 text-sm">Experience Points</p>
            </CardContent>
          </Card>

          {/* Scales Completed Card */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium opacity-90">Scales Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2">{(scaleStats && "totalScalesCompleted" in scaleStats) ? scaleStats.totalScalesCompleted : 0}</div>
              <p className="text-green-100 text-sm">Keep practicing!</p>
            </CardContent>
          </Card>
        </div>

        {/* XP Progress Bar */}
        {levelInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base">Level {levelInfo.currentLevel} Progress</CardTitle>
              <CardDescription>
                {Math.round(levelInfo.progressPercentage)}% to Level {levelInfo.currentLevel + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={levelInfo.progressPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>{levelInfo.currentLevelXP.toLocaleString()} XP</span>
                <span>{levelInfo.nextLevelXP.toLocaleString()} XP</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            onClick={() => setCurrentPage("training")}
            className="h-24 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg"
          >
            <Music className="w-6 h-6 mr-3" />
            Start Training
          </Button>

          <Button
            onClick={() => setCurrentPage("dashboard")}
            variant="outline"
            className="h-24 text-lg font-semibold border-2 border-indigo-200 hover:bg-indigo-50 rounded-lg"
          >
            <Trophy className="w-6 h-6 mr-3 text-indigo-600" />
            View Progress
          </Button>
        </div>

        {/* Stats Section */}
        {scaleStats && "totalAttempts" in scaleStats && (
          <Card>
            <CardHeader>
              <CardTitle>Your Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {scaleStats.totalAttempts}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Total Attempts</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(scaleStats.averageScore)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Average Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {scaleStats.currentStreak}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Current Streak</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {scaleStats.longestStreak}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Longest Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
