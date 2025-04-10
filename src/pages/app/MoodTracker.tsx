
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  const moods = [
    { label: "Energized", emoji: "⚡" },
    { label: "Focused", emoji: "🧠" },
    { label: "Calm", emoji: "😌" },
    { label: "Tired", emoji: "😴" },
    { label: "Distracted", emoji: "🤔" },
    { label: "Stressed", emoji: "😰" }
  ];
  
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mood & Energy Tracker</h1>
      
      <div className="border rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">How are you feeling?</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.label}
              className={`p-4 rounded-lg border flex flex-col items-center justify-center h-24 transition-colors ${
                selectedMood === mood.label 
                  ? 'bg-primary/10 border-primary' 
                  : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedMood(mood.label)}
            >
              <span className="text-3xl mb-1">{mood.emoji}</span>
              <span className="text-sm">{mood.label}</span>
            </button>
          ))}
        </div>
        <Button className="w-full">Log Mood</Button>
      </div>
      
      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Mood History</h2>
        <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500">Mood Tracking Graph</p>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
