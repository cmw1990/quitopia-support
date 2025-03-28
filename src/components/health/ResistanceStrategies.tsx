import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Bookmark } from 'lucide-react';
import { Button } from '../ui';

interface Strategy {
  id: number;
  title: string;
  description: string;
  timeToWork: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  expanded?: boolean;
}

export const ResistanceStrategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: 1,
      title: "4D's Technique",
      description: "Delay acting on the urge to smoke. Deep breathe to relax. Drink water slowly. Do something else to distract yourself until the craving passes.",
      timeToWork: "2-5 minutes",
      difficulty: "Easy",
      tags: ["immediate", "physical", "beginner"],
      expanded: true
    },
    {
      id: 2,
      title: "Physical Activity",
      description: "Go for a short walk, do jumping jacks, or stretch. Physical movement helps reduce cravings and releases endorphins that improve your mood.",
      timeToWork: "5-15 minutes",
      difficulty: "Easy",
      tags: ["active", "endorphins", "healthy"]
    },
    {
      id: 3,
      title: "Mindful Breathing",
      description: "Focus on your breath. Inhale deeply through your nose for 4 counts, hold for 2, exhale through your mouth for 6 counts. Repeat 5-10 times.",
      timeToWork: "3-5 minutes",
      difficulty: "Easy",
      tags: ["calming", "meditation", "portable"]
    },
    {
      id: 4,
      title: "Ice Cube Technique",
      description: "Place an ice cube in your mouth and let it melt completely. The cold sensation helps distract from cravings and freshen your mouth.",
      timeToWork: "2-4 minutes",
      difficulty: "Easy",
      tags: ["sensory", "distraction", "oral fixation"]
    },
    {
      id: 5,
      title: "Urge Surfing",
      description: "Visualize your craving as a wave that will rise, peak, and eventually crash. Rather than fight it, observe the sensation without acting on it.",
      timeToWork: "5-10 minutes",
      difficulty: "Medium",
      tags: ["mindfulness", "advanced", "mental"]
    },
    {
      id: 6,
      title: "Remember Your Why",
      description: "Quickly review your personal reasons for quitting. Look at photos of loved ones, review your health goals, or read encouraging messages from your past self.",
      timeToWork: "1-3 minutes",
      difficulty: "Medium",
      tags: ["motivation", "personal", "emotional"]
    }
  ]);

  const [filter, setFilter] = useState<string>('all');

  const toggleExpand = (id: number) => {
    setStrategies(prev => 
      prev.map(strategy => 
        strategy.id === id 
          ? { ...strategy, expanded: !strategy.expanded } 
          : strategy
      )
    );
  };

  const handleSaveStrategy = (id: number) => {
    // In a real app, this would save the strategy to the user's favorites
    console.log(`Strategy ${id} saved`);
    // Show feedback to user
    alert('Strategy saved to your favorites!');
  };

  const filteredStrategies = filter === 'all' 
    ? strategies 
    : strategies.filter(s => s.difficulty.toLowerCase() === filter.toLowerCase());

  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800'
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Filter by difficulty:</div>
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'easy' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'easy' ? 'bg-green-600 hover:bg-green-700' : ''}
            onClick={() => setFilter('easy')}
          >
            Easy
          </Button>
          <Button 
            variant={filter === 'medium' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            onClick={() => setFilter('medium')}
          >
            Medium
          </Button>
          <Button 
            variant={filter === 'hard' ? 'default' : 'outline'} 
            size="sm"
            className={filter === 'hard' ? 'bg-red-600 hover:bg-red-700' : ''}
            onClick={() => setFilter('hard')}
          >
            Hard
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredStrategies.map(strategy => (
          <div key={strategy.id} className="border rounded-lg overflow-hidden bg-white">
            <div 
              className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(strategy.id)}
            >
              <div>
                <h3 className="font-medium text-gray-900">{strategy.title}</h3>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[strategy.difficulty]}`}>
                    {strategy.difficulty}
                  </span>
                  <span className="text-xs text-gray-500">
                    Works in: {strategy.timeToWork}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="mr-1 text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveStrategy(strategy.id);
                  }}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                {strategy.expanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {strategy.expanded && (
              <div className="px-3 pb-3 pt-1 border-t border-gray-200">
                <p className="text-sm text-gray-700 mb-3">
                  {strategy.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {strategy.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <a 
          href="#" 
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          onClick={(e) => {
            e.preventDefault();
            window.open('https://smokefree.gov/challenges-when-quitting/cravings-triggers/ways-manage-cravings', '_blank');
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Learn more about managing cravings
        </a>
      </div>
    </div>
  );
}; 