import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Save, Brain, Lightbulb, Activity, BarChart2 } from 'lucide-react';
import { FatigueTypes, FatigueTypesGrid } from './FatigueTypes';
import { useFatigue, FatigueStrategy } from './AntiFatigueContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const activityContexts = [
  { value: 'work', label: 'Work' },
  { value: 'study', label: 'Study' },
  { value: 'home', label: 'Home' },
  { value: 'social', label: 'Social' },
  { value: 'public places', label: 'Public Places' },
  { value: 'computer work', label: 'Computer Work' },
  { value: 'physical activity', label: 'Physical Activity' },
  { value: 'creative work', label: 'Creative Work' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'travel', label: 'Travel' },
];

const commonContributors = [
  'Poor sleep',
  'Skipped meals',
  'Dehydration',
  'Screen time',
  'Stress',
  'Weather changes',
  'Medication issues',
  'Intense focus',
  'Social overload',
  'Noise',
  'Low physical activity',
  'Caffeine',
  'Environmental factors',
  'Decision fatigue',
];

export function FatigueTracker() {
  const { user } = useAuth();
  const { 
    currentEntry, 
    setCurrentEntry, 
    saveEntry, 
    isLoading,
    getStrategiesForType 
  } = useFatigue();
  
  const [date, setDate] = useState<Date>(new Date());
  const [recommendedStrategies, setRecommendedStrategies] = useState<FatigueStrategy[]>([]);
  const [fatigueType, setFatigueType] = useState<'mental' | 'physical' | 'emotional' | 'sensory'>('mental');
  
  // Handlers
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setCurrentEntry({ date: newDate.toISOString() });
    }
  };
  
  const handleSliderChange = (name: keyof typeof currentEntry, value: number[]) => {
    setCurrentEntry({ [name]: value[0] });
  };
  
  const toggleContributor = (contributor: string) => {
    const updatedContributors = currentEntry.contributors.includes(contributor)
      ? currentEntry.contributors.filter(c => c !== contributor)
      : [...currentEntry.contributors, contributor];
    
    setCurrentEntry({ contributors: updatedContributors });
  };
  
  const handleGetRecommendations = () => {
    // Find the highest fatigue type
    const fatigueScores = {
      mental: currentEntry.mental_fatigue,
      physical: currentEntry.physical_fatigue,
      emotional: currentEntry.emotional_fatigue,
      sensory: currentEntry.sensory_fatigue
    };
    
    // Find the highest fatigue type
    let highestType: 'mental' | 'physical' | 'emotional' | 'sensory' = 'mental';
    let highestScore = fatigueScores.mental;
    
    for (const [type, score] of Object.entries(fatigueScores)) {
      if (score > highestScore) {
        highestScore = score;
        highestType = type as any;
      }
    }
    
    setFatigueType(highestType);
    
    // Get strategies
    const strategies = getStrategiesForType(
      highestType, 
      currentEntry.activity_context, 
      30, // Up to 30 minutes
      true // ADHD-specific first
    );
    
    setRecommendedStrategies(strategies.slice(0, 3));
  };
  
  const handleSaveEntry = async () => {
    await saveEntry();
  };
  
  return (
    <div>
      <Tabs defaultValue="track">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="track" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Track Fatigue
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="track">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Fatigue Tracker
              </CardTitle>
              <CardDescription>
                Track your fatigue levels and get personalized strategies to manage energy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selector */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Fatigue Type Grid - compact form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mental Fatigue */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <FatigueTypes 
                        type="mental" 
                        level={currentEntry.mental_fatigue} 
                        compact 
                      />
                    </div>
                    <Slider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[currentEntry.mental_fatigue]} 
                      onValueChange={(value) => handleSliderChange('mental_fatigue', value)}
                      className="h-5"
                    />
                  </div>
                  
                  {/* Physical Fatigue */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <FatigueTypes 
                        type="physical" 
                        level={currentEntry.physical_fatigue} 
                        compact 
                      />
                    </div>
                    <Slider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[currentEntry.physical_fatigue]} 
                      onValueChange={(value) => handleSliderChange('physical_fatigue', value)}
                      className="h-5"
                    />
                  </div>
                  
                  {/* Emotional Fatigue */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <FatigueTypes 
                        type="emotional" 
                        level={currentEntry.emotional_fatigue} 
                        compact 
                      />
                    </div>
                    <Slider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[currentEntry.emotional_fatigue]} 
                      onValueChange={(value) => handleSliderChange('emotional_fatigue', value)}
                      className="h-5"
                    />
                  </div>
                  
                  {/* Sensory Fatigue */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <FatigueTypes 
                        type="sensory" 
                        level={currentEntry.sensory_fatigue} 
                        compact 
                      />
                    </div>
                    <Slider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[currentEntry.sensory_fatigue]} 
                      onValueChange={(value) => handleSliderChange('sensory_fatigue', value)}
                      className="h-5"
                    />
                  </div>
                </div>
              </div>
              
              {/* Activity Context */}
              <div className="space-y-2">
                <Label>Activity Context</Label>
                <div className="flex flex-wrap gap-2">
                  {activityContexts.map((context) => (
                    <Button
                      key={context.value}
                      variant={currentEntry.activity_context === context.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentEntry({ activity_context: context.value })}
                    >
                      {context.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the context in which you're experiencing fatigue
                </p>
              </div>
              
              {/* Contributing Factors */}
              <div className="space-y-2">
                <Label>Contributing Factors</Label>
                <div className="flex flex-wrap gap-2">
                  {commonContributors.map((factor) => (
                    <Button
                      key={factor}
                      variant={currentEntry.contributors.includes(factor) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleContributor(factor)}
                    >
                      {factor}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select factors that may have contributed to your fatigue
                </p>
              </div>
              
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes..."
                  value={currentEntry.notes || ''}
                  onChange={(e) => setCurrentEntry({ notes: e.target.value })}
                  rows={3}
                />
              </div>
              
              {/* Strategies Section */}
              {recommendedStrategies.length > 0 && (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recommended Strategies for {fatigueType.charAt(0).toUpperCase() + fatigueType.slice(1)} Fatigue
                    </h3>
                  </div>
                  
                  <ScrollArea className="h-[220px] rounded-md border">
                    <div className="space-y-3 p-4">
                      {recommendedStrategies.map((strategy) => (
                        <div key={strategy.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{strategy.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{strategy.duration_minutes} min</Badge>
                              <Badge variant="secondary">{strategy.effectiveness_rating}/5</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{strategy.description}</p>
                          <div className="bg-background rounded p-2 text-sm">
                            <strong>How to:</strong> {strategy.instructions}
                          </div>
                          {strategy.adhd_specific && (
                            <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                              ADHD-Friendly
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                onClick={handleGetRecommendations} 
                variant="outline" 
                className="w-full"
                disabled={isLoading}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Get Anti-Fatigue Strategies
              </Button>
              <Button 
                onClick={handleSaveEntry} 
                disabled={isLoading}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Entry
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Fatigue Insights
              </CardTitle>
              <CardDescription>
                Understand your energy patterns and get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <p className="text-center text-muted-foreground">
                  Track your fatigue daily to see insights here. You'll get personalized 
                  recommendations based on your patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 