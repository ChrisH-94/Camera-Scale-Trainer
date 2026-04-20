/**
 * Scale Selector - Browse and select scales for training
 * 
 * Features:
 * - Filter by difficulty
 * - Filter by hand (left/right)\n * - View scale details
 * - Quick start training
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SCALE_LIBRARY, Scale } from "@/lib/scaleLibrary";
import { ArrowLeft, Play } from "lucide-react";

interface ScaleSelectorProps {
  onSelectScale: (scale: Scale, direction: "ascending" | "descending") => void;
  onBack: () => void;
}

type Difficulty = "beginner" | "intermediate" | "advanced";
type Hand = "left" | "right" | "both";

export default function ScaleSelector({ onSelectScale, onBack }: ScaleSelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedHand, setSelectedHand] = useState<Hand | null>(null);

  const filteredScales = SCALE_LIBRARY.filter((scale) => {
    if (selectedDifficulty && scale.difficulty !== selectedDifficulty) return false;
    if (selectedHand && scale.hand !== selectedHand && scale.hand !== "both") return false;
    return true;
  });

  const groupedScales = {
    beginner: filteredScales.filter((s) => s.difficulty === "beginner"),
    intermediate: filteredScales.filter((s) => s.difficulty === "intermediate"),
    advanced: filteredScales.filter((s) => s.difficulty === "advanced"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container py-8 max-w-6xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Select a Scale</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Difficulty Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Difficulty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => setSelectedDifficulty(null)}
                variant={selectedDifficulty === null ? "default" : "outline"}
                className="w-full justify-start"
              >
                All Levels
              </Button>
              <Button
                onClick={() => setSelectedDifficulty("beginner")}
                variant={selectedDifficulty === "beginner" ? "default" : "outline"}
                className="w-full justify-start"
              >
                Beginner
              </Button>
              <Button
                onClick={() => setSelectedDifficulty("intermediate")}
                variant={selectedDifficulty === "intermediate" ? "default" : "outline"}
                className="w-full justify-start"
              >
                Intermediate
              </Button>
              <Button
                onClick={() => setSelectedDifficulty("advanced")}
                variant={selectedDifficulty === "advanced" ? "default" : "outline"}
                className="w-full justify-start"
              >
                Advanced
              </Button>
            </CardContent>
          </Card>

          {/* Hand Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => setSelectedHand(null)}
                variant={selectedHand === null ? "default" : "outline"}
                className="w-full justify-start"
              >
                Both Hands
              </Button>
              <Button
                onClick={() => setSelectedHand("left")}
                variant={selectedHand === "left" ? "default" : "outline"}
                className="w-full justify-start"
              >
                Left Hand
              </Button>
              <Button
                onClick={() => setSelectedHand("right")}
                variant={selectedHand === "right" ? "default" : "outline"}
                className="w-full justify-start"
              >
                Right Hand
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Scales Grid */}
        {Object.entries(groupedScales).map(([difficulty, scales]) => {
          if (scales.length === 0) return null;

          return (
            <div key={difficulty} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 capitalize">{difficulty} Scales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scales.map((scale) => (
                  <Card key={scale.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{scale.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">{scale.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => onSelectScale(scale, "ascending")}
                          size="sm"
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Ascending
                        </Button>
                        <Button
                          onClick={() => onSelectScale(scale, "descending")}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Descending
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {filteredScales.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">No scales match your filters. Try adjusting them.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
