import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Puzzle, Book } from "lucide-react";
import MemoryCards from "@/components/games/MemoryCards";
import SequenceMemory from "@/components/games/SequenceMemory";
import VisualMemory from "@/components/games/VisualMemory";
import WordMemoryChain from "@/components/games/WordMemoryChain";
import PatternRecognition from "@/components/games/PatternRecognition";

export const FocusExercises = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Memory & Focus Exercises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <MemoryCards />
            <SequenceMemory />
            <VisualMemory />
            <WordMemoryChain />
            <PatternRecognition />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};