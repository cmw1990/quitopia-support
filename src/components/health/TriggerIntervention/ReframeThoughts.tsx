import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Check, ArrowRight, BookmarkPlus } from 'lucide-react';

interface ReframeThoughtsProps {
  triggerType: string;
  onComplete: (newIntensity: number) => void;
  onSaveReframe?: (reframe: { trigger: string; thought: string; reframing: string }) => void;
}

// Common thoughts for different trigger types
const triggerThoughts = {
  stress: [
    "I need a cigarette to calm down",
    "I can't handle this stress without smoking",
    "Smoking is my only effective stress reliever",
    "This stress is too much, I deserve a cigarette"
  ],
  social: [
    "I can't enjoy social events without smoking",
    "I'll be left out if I don't smoke with my friends",
    "I feel awkward in social situations without a cigarette",
    "Everyone else is smoking, so I should too"
  ],
  boredom: [
    "Smoking gives me something to do",
    "Time moves too slowly when I'm not smoking",
    "I need cigarettes to break up my day",
    "I have nothing better to do right now"
  ],
  "after meal": [
    "A meal isn't complete without a cigarette after",
    "I can't digest properly without smoking after eating",
    "I deserve a cigarette reward after eating",
    "It's tradition to smoke after eating"
  ],
  habit: [
    "My routine requires smoking at certain times",
    "I automatically need to smoke during certain activities",
    "My body is programmed to need cigarettes at specific times",
    "I've always smoked at this time/place"
  ],
  "emotional": [
    "I need a cigarette to deal with these feelings",
    "Smoking helps me process my emotions",
    "I can't handle feeling this way without nicotine",
    "My emotions are too intense without smoking"
  ],
  "withdrawal": [
    "These withdrawal symptoms are unbearable",
    "The discomfort isn't worth quitting",
    "I need nicotine to feel normal again",
    "Just one cigarette will make this awful feeling go away"
  ],
  "reward": [
    "I deserve a cigarette after accomplishing this task",
    "Smoking is my way to celebrate",
    "I've earned this cigarette",
    "I need a cigarette break as a reward"
  ],
  "morning ritual": [
    "I can't start my day without a cigarette",
    "My morning coffee needs a cigarette with it",
    "I need nicotine to wake up properly",
    "My morning routine isn't complete without smoking"
  ],
  "driving": [
    "I can't drive without smoking",
    "Long drives require cigarettes to stay alert",
    "Driving is boring without smoking",
    "I always smoke while driving"
  ],
  unknown: [
    "I need cigarettes to function normally",
    "I can't be myself without smoking",
    "Life is less enjoyable without cigarettes",
    "I'm missing out if I don't smoke"
  ]
};

// Healthier alternative thoughts
const healthierThoughts = {
  stress: [
    "There are more effective ways to reduce stress, like deep breathing or exercise",
    "This stress is temporary and will pass whether I smoke or not",
    "The relief from smoking is temporary, but the health benefits of quitting are long-lasting",
    "Each time I resist a craving during stress, I'm building resilience",
    "Smoking actually increases stress hormones in the long run"
  ],
  social: [
    "I can still enjoy social events without smoking",
    "Many people socialize without smoking and have a great time",
    "My friends value me for who I am, not whether I smoke",
    "Being smoke-free allows me to be more present in social situations",
    "I can be a positive example for others trying to quit"
  ],
  boredom: [
    "There are healthier ways to occupy my time",
    "This is an opportunity to find new, more fulfilling activities",
    "Boredom is temporary and smoking doesn't actually cure it",
    "I can use this time to develop a new skill or hobby",
    "Being comfortable with quiet moments is a valuable skill"
  ],
  "after meal": [
    "A meal can be complete and satisfying without a cigarette",
    "I can create a new after-meal routine like taking a walk or having tea",
    "My digestion will actually improve without smoking",
    "My food will taste better as my taste buds recover",
    "Walking after a meal is healthier and helps digestion"
  ],
  habit: [
    "I can create new, healthier routines to replace smoking",
    "My habits are learned and can be unlearned with practice",
    "I've changed habits before and I can do it again",
    "Every time I resist, this habit weakens",
    "New habits take time to form, but get easier with repetition"
  ],
  "emotional": [
    "There are healthier ways to process emotions like journaling or talking",
    "Emotions are temporary, and I can ride the wave without smoking",
    "Learning to feel emotions fully is part of a healthier life",
    "Smoking only masks emotions, it doesn't resolve them",
    "I'm developing emotional resilience by facing feelings without cigarettes"
  ],
  "withdrawal": [
    "These withdrawal symptoms are temporary and will diminish over time",
    "Each day without smoking makes the symptoms weaker",
    "Discomfort now leads to greater health and freedom later",
    "These symptoms are signs my body is healing from addiction",
    "I can use mindfulness techniques to observe these sensations without reacting"
  ],
  "reward": [
    "I can find healthier ways to reward myself",
    "True rewards improve my health, not harm it",
    "I deserve to celebrate with something that makes me feel truly good",
    "My real reward is the health and freedom I gain from not smoking",
    "The money I save from not smoking can fund better rewards"
  ],
  "morning ritual": [
    "I can create a new, energizing morning ritual without cigarettes",
    "My morning coffee can be enjoyed on its own",
    "Natural energy from a short walk or stretching is more effective",
    "Starting the day smoke-free sets a positive tone",
    "My lungs will thank me for the fresh morning air"
  ],
  "driving": [
    "I can drive safely and comfortably without smoking",
    "Music, podcasts, or audiobooks can make driving enjoyable",
    "Smoke-free driving means a cleaner car and better visibility",
    "I can use driving time for mindfulness or reflection",
    "My concentration will actually improve without the distraction of smoking"
  ],
  unknown: [
    "My body functions better without nicotine and toxins",
    "I am still myself without cigarettes - in fact, I'm more authentic",
    "Life can be more enjoyable when I'm not controlled by cravings",
    "Freedom from addiction is worth temporary discomfort",
    "My future self will thank me for quitting now"
  ]
};

export const ReframeThoughts: React.FC<ReframeThoughtsProps> = ({ 
  triggerType,
  onComplete,
  onSaveReframe
}) => {
  const [stage, setStage] = useState('identify');
  const [selectedThought, setSelectedThought] = useState('');
  const [customThought, setCustomThought] = useState('');
  const [selectedReframe, setSelectedReframe] = useState('');
  const [customReframe, setCustomReframe] = useState('');
  const [currentIntensity, setCurrentIntensity] = useState(5);
  const [savedToJournal, setSavedToJournal] = useState(false);
  
  const getNormalizedTriggerType = () => {
    // Map the trigger type to one we have predefined thoughts for
    if (triggerThoughts[triggerType as keyof typeof triggerThoughts]) {
      return triggerType;
    }
    // Default to 'unknown' if we don't have specific thoughts for this trigger
    return 'unknown';
  };
  
  const normalizedTrigger = getNormalizedTriggerType();
  const thoughts = triggerThoughts[normalizedTrigger as keyof typeof triggerThoughts];
  const reframes = healthierThoughts[normalizedTrigger as keyof typeof healthierThoughts];
  
  const moveToNextStage = () => {
    if (stage === 'identify') {
      setStage('challenge');
    } else if (stage === 'challenge') {
      setStage('result');
    }
  };
  
  const handleComplete = () => {
    onComplete(currentIntensity);
  };
  
  const handleSaveReframe = () => {
    if (onSaveReframe) {
      onSaveReframe({
        trigger: normalizedTrigger,
        thought: getFinalThought(),
        reframing: getFinalReframe()
      });
      setSavedToJournal(true);
    }
  };
  
  // Helper functions to get the final thought and reframe
  const getFinalThought = () => {
    return selectedThought === 'custom' ? customThought : selectedThought;
  };
  
  const getFinalReframe = () => {
    return selectedReframe === 'custom' ? customReframe : selectedReframe;
  };
  
  // Progress based on current stage
  const getProgress = () => {
    switch (stage) {
      case 'identify':
        return 33;
      case 'challenge':
        return 66;
      case 'result':
        return 100;
      default:
        return 0;
    }
  };
  
  // Get success message based on intensity reduction
  const getSuccessMessage = () => {
    const reduction = 10 - currentIntensity;
    
    if (reduction <= 0) {
      return "Don't worry if your craving hasn't decreased yet. Keep practicing reframing - it gets more effective with time.";
    } else if (reduction <= 3) {
      return "Good job! Even a small reduction in craving intensity is progress. Keep using this technique.";
    } else if (reduction <= 6) {
      return "Excellent! You've significantly reduced your craving through cognitive reframing.";
    } else {
      return "Amazing work! You've mastered this technique and dramatically reduced your craving intensity.";
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Progress value={getProgress()} className="h-2" />
        <div className="flex justify-between mt-1">
          <span className="text-xs">Identify</span>
          <span className="text-xs">Challenge</span>
          <span className="text-xs">Result</span>
        </div>
      </div>
      
      {stage === 'identify' && (
        <div className="space-y-4">
          <h3 className="font-medium">Identify the thought behind your craving</h3>
          <p className="text-sm text-muted-foreground">
            Select a thought that best matches what you're experiencing right now, or write your own.
          </p>
          
          <RadioGroup 
            value={selectedThought} 
            onValueChange={setSelectedThought}
            className="space-y-3"
          >
            {thoughts.map((thought, index) => (
              <div key={index} className="flex items-start space-x-2">
                <RadioGroupItem value={thought} id={`thought-${index}`} className="mt-1" />
                <Label 
                  htmlFor={`thought-${index}`}
                  className="text-sm font-normal leading-relaxed"
                >
                  "{thought}"
                </Label>
              </div>
            ))}
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="custom" id="thought-custom" className="mt-1" />
              <div className="grid gap-1.5 w-full">
                <Label 
                  htmlFor="thought-custom"
                  className="text-sm font-normal"
                >
                  My thought is different:
                </Label>
                <Textarea
                  placeholder="Enter your thought here..."
                  value={customThought}
                  onChange={(e) => setCustomThought(e.target.value)}
                  className="min-h-[80px]"
                  onClick={() => setSelectedThought('custom')}
                />
              </div>
            </div>
          </RadioGroup>
          
          <Button 
            onClick={moveToNextStage}
            disabled={!selectedThought || (selectedThought === 'custom' && !customThought.trim())}
            className="w-full"
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      
      {stage === 'challenge' && (
        <div className="space-y-4">
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-4">
              <p className="italic text-sm">
                "{ getFinalThought() }"
              </p>
            </CardContent>
          </Card>
          
          <h3 className="font-medium">Challenge this thought with a healthier perspective</h3>
          <p className="text-sm text-muted-foreground">
            Choose a healthier way to look at this situation, or create your own.
          </p>
          
          <RadioGroup 
            value={selectedReframe} 
            onValueChange={setSelectedReframe}
            className="space-y-3"
          >
            {reframes.map((reframe, index) => (
              <div key={index} className="flex items-start space-x-2">
                <RadioGroupItem value={reframe} id={`reframe-${index}`} className="mt-1" />
                <Label 
                  htmlFor={`reframe-${index}`}
                  className="text-sm font-normal leading-relaxed"
                >
                  "{reframe}"
                </Label>
              </div>
            ))}
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="custom" id="reframe-custom" className="mt-1" />
              <div className="grid gap-1.5 w-full">
                <Label 
                  htmlFor="reframe-custom"
                  className="text-sm font-normal"
                >
                  I'd like to reframe it as:
                </Label>
                <Textarea
                  placeholder="Enter your healthier thought here..."
                  value={customReframe}
                  onChange={(e) => setCustomReframe(e.target.value)}
                  className="min-h-[80px]"
                  onClick={() => setSelectedReframe('custom')}
                />
              </div>
            </div>
          </RadioGroup>
          
          <Button 
            onClick={moveToNextStage}
            disabled={!selectedReframe || (selectedReframe === 'custom' && !customReframe.trim())}
            className="w-full"
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      
      {stage === 'result' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cognitive Reframing Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Original thought:</h4>
                <Card className="bg-muted/30 border-none">
                  <CardContent className="py-3 px-4">
                    <p className="italic text-sm">"{getFinalThought()}"</p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Healthier perspective:</h4>
                <Card className="bg-primary/10 border-none">
                  <CardContent className="py-3 px-4">
                    <p className="italic text-sm">"{getFinalReframe()}"</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-muted/20 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Tip: </span>
                  {getSuccessMessage()}
                </p>
              </div>
              
              {onSaveReframe && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={handleSaveReframe}
                  disabled={savedToJournal}
                >
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  {savedToJournal ? "Saved to Journal" : "Save to Journal"}
                </Button>
              )}
            </CardContent>
            <CardFooter className="bg-muted/10 border-t">
              <div className="space-y-2 w-full">
                <h3 className="font-medium">How intense is your craving now?</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs">1 (Very Mild)</span>
                    <span className="text-xs">10 (Very Intense)</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[currentIntensity]}
                    onValueChange={(val) => setCurrentIntensity(val[0])}
                  />
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <Button onClick={handleComplete} className="w-full">
            <Check className="mr-2 h-4 w-4" />
            Complete Reframing
          </Button>
        </div>
      )}
    </div>
  );
}; 