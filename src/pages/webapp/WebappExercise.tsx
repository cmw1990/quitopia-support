import React from 'react';
import { Card } from '@/components/ui/card';
import { ExerciseTracker } from '@/components/exercise/ExerciseTracker';

export default function Exercise() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Exercise Tracking</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExerciseTracker />
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Exercise Tips</h2>
          <ul className="space-y-2">
            <li>Start with gentle exercises</li>
            <li>Listen to your body's energy levels</li>
            <li>Stay hydrated during workouts</li>
            <li>Include rest days in your routine</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
