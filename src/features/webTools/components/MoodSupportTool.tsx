import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
  Textarea,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Progress
} from '../../../components/ui';
import { Brain, Download, Send, Check, Smile, Frown, Meh, ArrowRight } from 'lucide-react';

interface MoodSupportToolProps {
  session: Session | null;
}

export const MoodSupportTool: React.FC<MoodSupportToolProps> = ({ session }) => {
  // Current mood tracking
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [moodContext, setMoodContext] = useState<string>('');
  const [moodTriggers, setMoodTriggers] = useState<string[]>([]);
  const [moodEntry, setMoodEntry] = useState<string>('');
  const [savedMoodEntries, setSavedMoodEntries] = useState<any[]>([]);
  
  // Mood improvement plan
  const [moodGoal, setMoodGoal] = useState<string>('balanced');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  
  // Common mood triggers for selection
  const commonTriggers = [
    'Nicotine cravings',
    'Work stress',
    'Family concerns',
    'Financial worries',
    'Social situations',
    'Sleep issues',
    'Health concerns',
    'Withdrawal symptoms',
    'Boredom',
    'Alcohol consumption'
  ];
  
  // Mood improvement activities
  const moodImprovementActivities = {
    physical: [
      'Light exercise (10-15 min walk)',
      'Stretching routine',
      'Dance to favorite music',
      'Deep breathing exercises',
      'Progressive muscle relaxation'
    ],
    mental: [
      'Guided meditation',
      'Mindfulness practice',
      'Journaling thoughts',
      'Reading a book',
      'Listening to calming music'
    ],
    social: [
      'Call a supportive friend',
      'Join an online support group',
      'Share feelings with someone',
      'Help someone else',
      'Engage in a community activity'
    ],
    creative: [
      'Draw or color',
      'Write creatively',
      'Play or listen to music',
      'Cook a new recipe',
      'Work on a craft project'
    ],
    pleasure: [
      'Take a warm bath/shower',
      'Watch a favorite show',
      'Spend time in nature',
      'Play with a pet',
      'Enjoy a cup of tea or coffee'
    ]
  };
  
  // Handle mood trigger selection
  const handleTriggerSelect = (trigger: string) => {
    if (moodTriggers.includes(trigger)) {
      setMoodTriggers(moodTriggers.filter(t => t !== trigger));
    } else {
      setMoodTriggers([...moodTriggers, trigger]);
    }
  };
  
  // Handle activity selection
  const handleActivitySelect = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };
  
  // Add custom activity
  const addCustomActivity = () => {
    if (customActivity.trim()) {
      setSelectedActivities([...selectedActivities, customActivity.trim()]);
      setCustomActivity('');
    }
  };
  
  // Save current mood entry
  const saveMoodEntry = () => {
    const newEntry = {
      date: new Date().toISOString(),
      mood: currentMood,
      context: moodContext,
      triggers: [...moodTriggers],
      notes: moodEntry
    };
    
    const updatedEntries = [newEntry, ...savedMoodEntries];
    setSavedMoodEntries(updatedEntries);
    
    // Save to localStorage
    localStorage.setItem('mood-entries', JSON.stringify(updatedEntries));
    
    // Reset form
    setMoodContext('');
    setMoodTriggers([]);
    setMoodEntry('');
  };
  
  // Generate mood improvement plan
  const generateMoodPlan = () => {
    if (selectedActivities.length === 0) return;
    
    const moodDescription = 
      currentMood < 3 ? 'low' :
      currentMood < 5 ? 'below average' :
      currentMood < 7 ? 'moderate' :
      currentMood < 9 ? 'good' : 'excellent';
      
    const goalText = 
      moodGoal === 'improve' ? 'improve your mood' :
      moodGoal === 'maintain' ? 'maintain your positive mood' :
      'achieve a more balanced emotional state';
    
    const activities = selectedActivities.map(activity => `• ${activity}`).join('\n');
    
    const plan = `
## Your Personal Mood Support Plan

Based on your current mood (${moodDescription}) and your goal to ${goalText}, here's a personalized plan to help you navigate your fresh journey.

### Selected Activities:
${activities}

### Recommended Schedule:
1. Start your day with one of your mental wellness activities
2. When you notice a mood change or craving, try one of your physical activities
3. End your day with a pleasure activity to reward yourself

### Tips for Success:
• Set specific times for these activities in your daily schedule
• Track how each activity affects your mood
• Be patient and kind with yourself - emotional balance takes time
• Remember that mood fluctuations are normal during your fresh journey

### When to Seek Additional Support:
If you experience persistent low mood for more than two weeks, consider speaking with a healthcare professional.
    `;
    
    setGeneratedPlan(plan);
  };
  
  // Download plan as text file
  const downloadPlan = () => {
    if (!generatedPlan) return;
    
    const element = document.createElement('a');
    const file = new Blob([generatedPlan], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'My_Mood_Support_Plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Load saved entries from localStorage on component mount
  React.useEffect(() => {
    const savedEntries = localStorage.getItem('mood-entries');
    if (savedEntries) {
      try {
        setSavedMoodEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Error parsing saved mood entries:', error);
      }
    }
  }, []);
  
  // Get mood icon based on value
  const getMoodIcon = (value: number) => {
    if (value <= 3) return <Frown className="h-6 w-6 text-red-500" />;
    if (value <= 6) return <Meh className="h-6 w-6 text-yellow-500" />;
    return <Smile className="h-6 w-6 text-green-500" />;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Mood Tracker Card */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Mood Tracker
            </CardTitle>
            <CardDescription>
              Track your mood and identify patterns during your fresh journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="current-mood">Current Mood (1-10)</Label>
                <div className="flex items-center gap-2">
                  {getMoodIcon(currentMood)}
                  <span className="font-medium text-lg">{currentMood}</span>
                </div>
              </div>
              <Slider
                id="current-mood"
                min={1}
                max={10}
                step={1}
                value={[currentMood]}
                onValueChange={(value) => setCurrentMood(value[0])}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mood-context">What are you doing right now?</Label>
              <Input
                id="mood-context"
                placeholder="E.g., at work, relaxing at home, etc."
                value={moodContext}
                onChange={(e) => setMoodContext(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Factors affecting your mood (select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonTriggers.map((trigger, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={moodTriggers.includes(trigger) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTriggerSelect(trigger)}
                    className="rounded-full"
                  >
                    {moodTriggers.includes(trigger) && <Check className="mr-1 h-3 w-3" />}
                    {trigger}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mood-entry">Additional notes (optional)</Label>
              <Textarea
                id="mood-entry"
                placeholder="How are you feeling and why?"
                value={moodEntry}
                onChange={(e) => setMoodEntry(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={saveMoodEntry}
              disabled={!moodContext}
            >
              <Send className="mr-2 h-4 w-4" />
              Save Mood Entry
            </Button>
          </CardContent>
        </Card>
        
        {/* Mood History Card */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Your Mood History</CardTitle>
            <CardDescription>
              Review past entries to identify patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedMoodEntries.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  No mood entries yet. Start tracking to see your history.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {savedMoodEntries.map((entry, index) => (
                  <div 
                    key={index} 
                    className="p-4 border rounded-lg bg-card"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {getMoodIcon(entry.mood)}
                        <span className="font-semibold">Mood: {entry.mood}/10</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">
                      <span className="font-medium">Context:</span> {entry.context}
                    </p>
                    
                    {entry.triggers.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.triggers.map((trigger: string, i: number) => (
                            <span 
                              key={i} 
                              className="text-xs px-2 py-1 bg-secondary rounded-full"
                            >
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {entry.notes && (
                      <p className="text-sm mt-2 italic">"{entry.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Mood Improvement Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Personal Mood Support Plan
          </CardTitle>
          <CardDescription>
            Create a customized plan to manage your mood during your fresh journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mood-goal">What's your mood goal?</Label>
                <Select 
                  value={moodGoal} 
                  onValueChange={setMoodGoal}
                >
                  <SelectTrigger id="mood-goal">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improve">Improve my mood</SelectItem>
                    <SelectItem value="balanced">Achieve more balanced emotions</SelectItem>
                    <SelectItem value="maintain">Maintain positive mood</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <Label>Select activities you're willing to try:</Label>
                
                <Accordion type="multiple" className="w-full">
                  {Object.entries(moodImprovementActivities).map(([category, activities], index) => (
                    <AccordionItem key={index} value={category}>
                      <AccordionTrigger className="capitalize">
                        {category} Activities
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {activities.map((activity, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`activity-${category}-${i}`}
                                checked={selectedActivities.includes(activity)}
                                onChange={() => handleActivitySelect(activity)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label 
                                htmlFor={`activity-${category}-${i}`}
                                className="text-sm"
                              >
                                {activity}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-activity">Add your own activity:</Label>
                <div className="flex space-x-2">
                  <Input
                    id="custom-activity"
                    placeholder="E.g., Gardening for 20 minutes"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                  />
                  <Button 
                    onClick={addCustomActivity}
                    disabled={!customActivity.trim()}
                    type="button"
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              {selectedActivities.length > 0 && (
                <div className="space-y-2">
                  <Label>Your selected activities:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivities.map((activity, index) => (
                      <div 
                        key={index}
                        className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                      >
                        <span>{activity}</span>
                        <button
                          onClick={() => handleActivitySelect(activity)}
                          className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={generateMoodPlan}
                disabled={selectedActivities.length === 0}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Generate My Plan
              </Button>
            </div>
            
            <div>
              {generatedPlan ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-card overflow-auto max-h-[500px]">
                    <div className="prose prose-sm dark:prose-invert">
                      {generatedPlan.split('\n').map((line, index) => {
                        if (line.startsWith('##')) {
                          return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('##', '').trim()}</h2>;
                        } else if (line.startsWith('###')) {
                          return <h3 key={index} className="text-lg font-bold mt-3 mb-1">{line.replace('###', '').trim()}</h3>;
                        } else if (line.startsWith('•')) {
                          return <p key={index} className="ml-4 flex items-start"><span className="mr-2">•</span> {line.replace('•', '').trim()}</p>;
                        } else if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                          return <p key={index} className="ml-4">{line}</p>;
                        } else {
                          return line.trim() ? <p key={index}>{line}</p> : <br key={index} />;
                        }
                      })}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={downloadPlan}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download My Plan
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border rounded-lg border-dashed">
                  <Brain className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Create Your Mood Support Plan</h3>
                  <p className="text-muted-foreground mb-4">
                    Select activities from the categories, then generate your personalized mood support plan.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tip: Choose a mix of activities from different categories for a well-rounded approach.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 