import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Music, Activity, Timer, Check } from 'lucide-react';

interface DistactionActivitiesProps {
  onComplete: (newIntensity: number) => void;
}

// Distraction activities by category
const activities = {
  mental: [
    {
      id: 'word-game',
      title: 'Word Association',
      description: 'Take a word and think of 10 related words as quickly as possible.',
      duration: '2-3 min',
      steps: [
        'Think of a random starting word (e.g., "blue")',
        'Create a chain of 10 associated words',
        'Each new word should relate to the previous one',
        'Try to avoid obvious connections for more challenge'
      ]
    },
    {
      id: 'math-challenge',
      title: 'Mental Math Sprint',
      description: 'Perform a series of mental calculations without writing anything down.',
      duration: '2-3 min',
      steps: [
        'Start with the number 100',
        'Add 7, then multiply by 2',
        'Subtract 15, then divide by 3',
        'Continue creating your own sequence of operations'
      ]
    },
    {
      id: 'memory-test',
      title: 'Memory Challenge',
      description: 'Test and improve your short-term memory with this quick exercise.',
      duration: '3-4 min',
      steps: [
        'Look around and identify 10 objects in your surroundings',
        'Close your eyes and try to recall all 10 items',
        'For each item, try to remember a specific detail about it',
        'Open your eyes and check your accuracy'
      ]
    }
  ],
  physical: [
    {
      id: 'desk-stretch',
      title: 'Desk Stretches',
      description: 'Simple stretches you can do from your desk or chair.',
      duration: '2-3 min',
      steps: [
        'Shoulder rolls: 10 forward, 10 backward',
        'Neck stretches: gentle tilts in all directions',
        'Wrist circles and finger stretches',
        'Seated spinal twist: rotate torso to each side'
      ]
    },
    {
      id: 'quick-cardio',
      title: 'Mini Cardio Burst',
      description: 'Get your heart rate up with these quick movements.',
      duration: '1-2 min',
      steps: [
        '20 seconds of jumping jacks',
        '10 seconds rest',
        '20 seconds of high knees',
        '10 seconds rest',
        'Repeat once'
      ]
    },
    {
      id: 'tension-release',
      title: 'Progressive Tension Release',
      description: 'Systematically tense and release muscle groups to release physical tension.',
      duration: '3-4 min',
      steps: [
        'Start with your hands: make fists, hold for 5 seconds, release',
        'Move to arms, shoulders, face, torso, legs, and feet',
        'For each area, tense for 5 seconds, then release and notice the difference',
        'End with a few deep breaths'
      ]
    }
  ],
  sensory: [
    {
      id: 'five-senses',
      title: '5-4-3-2-1 Grounding',
      description: 'An exercise to bring your attention to your senses.',
      duration: '2-3 min',
      steps: [
        'Identify 5 things you can see',
        'Focus on 4 things you can touch',
        'Notice 3 things you can hear',
        'Recognize 2 things you can smell',
        'Acknowledge 1 thing you can taste'
      ]
    },
    {
      id: 'texture-focus',
      title: 'Texture Hunt',
      description: 'Explore different textures in your immediate environment.',
      duration: '2-3 min',
      steps: [
        'Find 5 different textures around you (smooth, rough, soft, etc.)',
        'For each texture, focus on the sensation for 20-30 seconds',
        'Compare the different sensations',
        'Notice which textures are most engaging or pleasant'
      ]
    },
    {
      id: 'music-immersion',
      title: 'Music Immersion',
      description: 'Deeply focus on music to engage your auditory sense.',
      duration: '3-4 min',
      steps: [
        'Choose a song with multiple instruments',
        'First listen for one specific instrument throughout the song',
        'Restart and focus on a different instrument',
        'Notice new elements you didn\'t hear before'
      ]
    }
  ]
};

export const DistactionActivities: React.FC<DistactionActivitiesProps> = ({ onComplete }) => {
  const [activeCategory, setActiveCategory] = useState('mental');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [currentIntensity, setCurrentIntensity] = useState(5);
  
  const handleSelectActivity = (id: string) => {
    setSelectedActivity(id);
    setActivityCompleted(false);
  };
  
  const handleCompleteActivity = () => {
    setActivityCompleted(true);
  };
  
  const handleSubmitRating = () => {
    onComplete(currentIntensity);
  };
  
  const getSelectedActivity = () => {
    const categoryActivities = activities[activeCategory as keyof typeof activities];
    return categoryActivities.find(activity => activity.id === selectedActivity);
  };
  
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'mental':
        return <Brain className="h-4 w-4" />;
      case 'physical':
        return <Activity className="h-4 w-4" />;
      case 'sensory':
        return <Music className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {!selectedActivity ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Distraction activities redirect your focus away from cravings. Choose a quick activity to engage your mind and body.
          </p>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="mental" className="flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Mental
              </TabsTrigger>
              <TabsTrigger value="physical" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Physical
              </TabsTrigger>
              <TabsTrigger value="sensory" className="flex items-center">
                <Music className="h-4 w-4 mr-2" />
                Sensory
              </TabsTrigger>
            </TabsList>
            
            {Object.entries(activities).map(([category, categoryActivities]) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid gap-4">
                  {categoryActivities.map(activity => (
                    <Card key={activity.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{activity.title}</CardTitle>
                          <Badge variant="outline">
                            <Timer className="h-3 w-3 mr-1" />
                            {activity.duration}
                          </Badge>
                        </div>
                        <CardDescription>{activity.description}</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          onClick={() => handleSelectActivity(activity.id)}
                        >
                          Start Activity
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : !activityCompleted ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedActivity(null)}
            >
              Back to activities
            </Button>
            <Badge variant="outline">
              {renderCategoryIcon(activeCategory)}
              <span className="ml-1 capitalize">{activeCategory}</span>
            </Badge>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{getSelectedActivity()?.title}</CardTitle>
              <CardDescription>{getSelectedActivity()?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-sm font-medium mb-2">Steps:</h3>
              <ol className="space-y-2 pl-5 list-decimal">
                {getSelectedActivity()?.steps.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleCompleteActivity}
              >
                <Check className="h-4 w-4 mr-2" />
                I've Completed This Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-medium">How intense is your craving now?</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">1 (Very Mild)</span>
              <span className="text-sm">10 (Very Intense)</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[currentIntensity]}
              onValueChange={(val) => setCurrentIntensity(val[0])}
            />
          </div>
          
          <Button onClick={handleSubmitRating} className="w-full">
            Complete & Continue
          </Button>
        </div>
      )}
    </div>
  );
}; 