import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { 
  BatteryCharging, 
  Clock, 
  Save, 
  Plus, 
  Trash, 
  Utensils, 
  Activity, 
  Brain, 
  Coffee, 
  Sun, 
  Moon, 
  Droplets, 
  AlertCircle,
  X
} from 'lucide-react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { useAuth } from '../AuthProvider';
import { cn } from '@/lib/utils';

interface EnergyPlan {
  id: string;
  title: string;
  description: string;
  energy_level_required: number;
  time_of_day: string[];
  tags: string[];
  steps: EnergyPlanStep[];
}

interface EnergyPlanStep {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  activity_type: string;
  tips: string[];
}

const ACTIVITY_TYPES = [
  { value: "physical", label: "Physical Activity", icon: <Activity className="h-4 w-4" /> },
  { value: "nutrition", label: "Nutrition", icon: <Utensils className="h-4 w-4" /> },
  { value: "hydration", label: "Hydration", icon: <Droplets className="h-4 w-4" /> },
  { value: "mental", label: "Mental Activity", icon: <Brain className="h-4 w-4" /> },
  { value: "rest", label: "Rest & Recovery", icon: <Moon className="h-4 w-4" /> },
  { value: "stimulation", label: "Stimulation", icon: <Coffee className="h-4 w-4" /> },
  { value: "light", label: "Light Exposure", icon: <Sun className="h-4 w-4" /> },
];

const TIME_OF_DAY_OPTIONS = [
  { value: "morning", label: "Morning (5am-11am)" },
  { value: "noon", label: "Noon (11am-1pm)" },
  { value: "afternoon", label: "Afternoon (1pm-5pm)" },
  { value: "evening", label: "Evening (5pm-9pm)" },
  { value: "night", label: "Night (9pm-5am)" },
];

const TAGS = [
  "low-energy", "high-energy", "adhd", "focus", "recovery", "start-of-day", "mid-day-slump", "end-of-day"
];

const PREDEFINED_TIPS = {
  physical: [
    "Even a 5-minute walk can boost your energy for 1-2 hours",
    "Keep the intensity moderate - you shouldn't be out of breath",
    "Focus on movement that feels good, not exhausting",
    "Stretch major muscle groups for at least 30 seconds each"
  ],
  nutrition: [
    "Combine protein + complex carbs for sustained energy",
    "Avoid high-sugar foods that cause energy crashes",
    "Eat smaller portions more frequently if energy dips between meals",
    "Stay mindful of portion sizes - too much food diverts energy to digestion"
  ],
  hydration: [
    "Dehydration can cause fatigue even before you feel thirsty",
    "Aim for water instead of sugary or caffeinated drinks",
    "Set reminders to drink water throughout the day",
    "Monitor urine color - light yellow indicates good hydration"
  ],
  mental: [
    "Deep breathing for 2 minutes can reset your nervous system",
    "Try the Pomodoro technique (25 min focus, 5 min break)",
    "Mindfulness practices can reduce mental fatigue",
    "Switch between different types of tasks to maintain engagement"
  ],
  rest: [
    "Keep power naps to 20 minutes or less to avoid grogginess",
    "Even a few minutes of closed eyes can help restore mental energy",
    "Progressive muscle relaxation can quickly reduce tension",
    "Set a timer to avoid oversleeping during rest periods"
  ],
  stimulation: [
    "Caffeine takes 20-30 minutes to reach peak effectiveness",
    "Limit caffeine after 2pm to protect sleep quality",
    "Cold exposure (splash of cold water, brief cold shower) can increase alertness",
    "Peppermint or citrus scents can increase alertness"
  ],
  light: [
    "Morning sunlight exposure helps regulate circadian rhythm",
    "Reduce blue light exposure in the evening to improve sleep",
    "Use bright light in the afternoon to combat energy dips",
    "Natural light is more effective than artificial for energy"
  ]
};

export function EnergyPlanCreator() {
  const { toast } = useToast();
  const { session } = useAuth();
  const [plan, setPlan] = useState<EnergyPlan>({
    id: crypto.randomUUID(),
    title: '',
    description: '',
    energy_level_required: 5,
    time_of_day: ['morning'],
    tags: [],
    steps: [
      {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        duration_minutes: 15,
        activity_type: 'physical',
        tips: []
      }
    ]
  });
  const [saving, setSaving] = useState(false);
  const [activeTip, setActiveTip] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  const handleAddStep = () => {
    setPlan({
      ...plan,
      steps: [
        ...plan.steps,
        {
          id: crypto.randomUUID(),
          title: '',
          description: '',
          duration_minutes: 15,
          activity_type: 'physical',
          tips: []
        }
      ]
    });
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...plan.steps];
    newSteps.splice(index, 1);
    setPlan({
      ...plan,
      steps: newSteps
    });
  };

  const handleStepChange = (index: number, field: keyof EnergyPlanStep, value: any) => {
    const newSteps = [...plan.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    
    // If activity type changed, reset tips
    if (field === 'activity_type') {
      newSteps[index].tips = [];
    }
    
    setPlan({
      ...plan,
      steps: newSteps
    });
  };

  const handleAddTip = (stepIndex: number) => {
    if (!activeTip.trim()) return;
    
    const newSteps = [...plan.steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      tips: [...newSteps[stepIndex].tips, activeTip]
    };
    
    setPlan({
      ...plan,
      steps: newSteps
    });
    
    setActiveTip('');
  };

  const handleRemoveTip = (stepIndex: number, tipIndex: number) => {
    const newSteps = [...plan.steps];
    const newTips = [...newSteps[stepIndex].tips];
    newTips.splice(tipIndex, 1);
    
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      tips: newTips
    };
    
    setPlan({
      ...plan,
      steps: newSteps
    });
  };

  const handleToggleTag = (tag: string) => {
    const currentTags = [...plan.tags];
    const index = currentTags.indexOf(tag);
    
    if (index >= 0) {
      currentTags.splice(index, 1);
    } else {
      currentTags.push(tag);
    }
    
    setPlan({
      ...plan,
      tags: currentTags
    });
  };

  const handleToggleTimeOfDay = (time: string) => {
    const currentTimes = [...plan.time_of_day];
    const index = currentTimes.indexOf(time);
    
    if (index >= 0) {
      currentTimes.splice(index, 1);
    } else {
      currentTimes.push(time);
    }
    
    setPlan({
      ...plan,
      time_of_day: currentTimes
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(plan.steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPlan({
      ...plan,
      steps: items
    });
  };

  const handleSavePlan = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your energy plan",
        variant: "destructive"
      });
      return;
    }
    
    if (!plan.title) {
      toast({
        title: "Title required",
        description: "Please provide a title for your energy plan",
        variant: "destructive"
      });
      return;
    }
    
    if (plan.steps.length === 0) {
      toast({
        title: "Steps required",
        description: "Please add at least one step to your energy plan",
        variant: "destructive"
      });
      return;
    }
    
    // Validate each step
    for (const [index, step] of plan.steps.entries()) {
      if (!step.title) {
        toast({
          title: `Step ${index + 1} missing title`,
          description: "Please provide a title for each step",
          variant: "destructive"
        });
        return;
      }
    }
    
    setSaving(true);
    try {
      // Create energy plan in database
      const newPlan = {
        id: plan.id,
        created_by: session.user.id,
        title: plan.title,
        description: plan.description,
        plan_type: "energy",
        category: "energy_management",
        visibility: "private",
        is_expert_plan: false,
        tags: plan.tags,
        energy_level_required: plan.energy_level_required,
        recommended_time_of_day: plan.time_of_day,
        estimated_duration_minutes: plan.steps.reduce((sum, step) => sum + step.duration_minutes, 0)
      };
      
      // Insert the plan
      // Use supabaseRequest, handle error, remove session arg
      const { error: planSaveError } = await supabaseRequest(
        `/rest/v1/energy_plans8`,
        {
          method: "POST",
          headers: { 'Prefer': 'return=minimal' }, // Don't need result back
          body: JSON.stringify(newPlan)
        }
        // Removed session argument
      );
      if (planSaveError) throw planSaveError; // Propagate error
      
      // Insert the steps
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        const stepData = {
          id: step.id,
          plan_id: plan.id,
          component_type: step.activity_type,
          order_number: i,
          duration_minutes: step.duration_minutes,
          settings: {
            title: step.title,
            description: step.description,
            tips: step.tips
          },
          notes: null
        };
        
        // Use supabaseRequest, handle error, remove session arg
        const { error: stepSaveError } = await supabaseRequest(
          `/rest/v1/energy_plan_components8`,
          {
            method: "POST",
            headers: { 'Prefer': 'return=minimal' }, // Don't need result back
            body: JSON.stringify(stepData)
          }
          // Removed session argument
        );
        if (stepSaveError) throw stepSaveError; // Propagate error
      }
      
      toast({
        title: "Plan saved",
        description: "Your energy plan has been saved successfully"
      });
      
      // Reset form
      setPlan({
        id: crypto.randomUUID(),
        title: '',
        description: '',
        energy_level_required: 5,
        time_of_day: ['morning'],
        tags: [],
        steps: [
          {
            id: crypto.randomUUID(),
            title: '',
            description: '',
            duration_minutes: 15,
            activity_type: 'physical',
            tips: []
          }
        ]
      });
      
    } catch (error) {
      console.error("Error saving energy plan:", error);
      toast({
        title: "Error saving plan",
        description: "There was an error saving your energy plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addPredefinedTip = (stepIndex: number, tip: string) => {
    const newSteps = [...plan.steps];
    
    // Only add if not already present
    if (!newSteps[stepIndex].tips.includes(tip)) {
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        tips: [...newSteps[stepIndex].tips, tip]
      };
      
      setPlan({
        ...plan,
        steps: newSteps
      });
    }
  };

  const showTipSuggestions = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const hideTipSuggestions = () => {
    setCurrentStepIndex(null);
  };

  const totalDuration = plan.steps.reduce((sum, step) => sum + step.duration_minutes, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BatteryCharging className="h-5 w-5 mr-2 text-primary" />
            Create Custom Energy Plan
          </CardTitle>
          <CardDescription>
            Design a personalized energy management plan to optimize your energy throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="plan-title">Plan Title</Label>
                <Input
                  id="plan-title"
                  placeholder="e.g., Morning Energy Boost Routine"
                  value={plan.title}
                  onChange={(e) => setPlan({ ...plan, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  placeholder="Brief description of what this plan helps with"
                  value={plan.description}
                  onChange={(e) => setPlan({ ...plan, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label>Energy Level Required</Label>
                  <span className="text-sm font-medium">
                    {plan.energy_level_required}/10
                  </span>
                </div>
                <Slider
                  value={[plan.energy_level_required]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(values) => setPlan({ ...plan, energy_level_required: values[0] })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low Energy</span>
                  <span>High Energy</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label>Recommended Time of Day</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {TIME_OF_DAY_OPTIONS.map((time) => (
                    <div key={time.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${time.value}`}
                        checked={plan.time_of_day.includes(time.value)}
                        onCheckedChange={() => handleToggleTimeOfDay(time.value)}
                      />
                      <label
                        htmlFor={`time-${time.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {time.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={plan.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                  {plan.tags.includes(tag) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Plan Steps ({plan.steps.length})
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  Total Duration: {totalDuration} min
                </Badge>
                <Button size="sm" onClick={handleAddStep}>
                  <Plus className="h-4 w-4 mr-1" /> Add Step
                </Button>
              </div>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="steps">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {plan.steps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border-l-4 border-l-primary"
                          >
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center" {...provided.dragHandleProps}>
                                  <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <CardTitle className="text-base">
                                    {step.title || `Step ${index + 1}`}
                                  </CardTitle>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveStep(index)}
                                  disabled={plan.steps.length === 1}
                                >
                                  <Trash className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label htmlFor={`step-${index}-title`}>Step Title</Label>
                                  <Input
                                    id={`step-${index}-title`}
                                    placeholder="e.g., Morning Stretching"
                                    value={step.title}
                                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-1.5">
                                  <Label htmlFor={`step-${index}-type`}>Activity Type</Label>
                                  <Select
                                    value={step.activity_type}
                                    onValueChange={(value) => handleStepChange(index, 'activity_type', value)}
                                  >
                                    <SelectTrigger id={`step-${index}-type`}>
                                      <SelectValue placeholder="Select activity type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ACTIVITY_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          <div className="flex items-center">
                                            {type.icon}
                                            <span className="ml-2">{type.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-1.5">
                                  <Label htmlFor={`step-${index}-description`}>Description</Label>
                                  <Textarea
                                    id={`step-${index}-description`}
                                    placeholder="Brief instructions for this step"
                                    value={step.description}
                                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                      <Label htmlFor={`step-${index}-duration`}>Duration (minutes)</Label>
                                      <span className="text-sm font-medium">{step.duration_minutes} min</span>
                                    </div>
                                    <Slider
                                      id={`step-${index}-duration`}
                                      value={[step.duration_minutes]}
                                      min={1}
                                      max={60}
                                      step={1}
                                      onValueChange={(values) => handleStepChange(index, 'duration_minutes', values[0])}
                                    />
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <Label>Tips & Instructions</Label>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => showTipSuggestions(index)}
                                      >
                                        Suggestions
                                      </Button>
                                    </div>
                                    
                                    {currentStepIndex === index && (
                                      <Card className="mb-3 border-dashed">
                                        <CardHeader className="py-2 px-3">
                                          <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm">Suggested Tips</CardTitle>
                                            <Button variant="ghost" size="icon" onClick={hideTipSuggestions}>
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="py-2 px-3">
                                          <div className="max-h-32 overflow-y-auto">
                                            {PREDEFINED_TIPS[step.activity_type as keyof typeof PREDEFINED_TIPS]?.map((tip, tipIndex) => (
                                              <div key={tipIndex} className="flex items-center justify-between py-1 border-b last:border-0">
                                                <span className="text-sm">{tip}</span>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm"
                                                  onClick={() => addPredefinedTip(index, tip)}
                                                  disabled={step.tips.includes(tip)}
                                                >
                                                  {step.tips.includes(tip) ? 'Added' : 'Add'}
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                    
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        placeholder="Add a tip or instruction"
                                        value={index === currentStepIndex ? activeTip : ''}
                                        onChange={(e) => index === currentStepIndex && setActiveTip(e.target.value)}
                                        onFocus={() => setCurrentStepIndex(index)}
                                      />
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleAddTip(index)}
                                        disabled={!(index === currentStepIndex && activeTip.trim())}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    {step.tips.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {step.tips.map((tip, tipIndex) => (
                                          <div key={tipIndex} className="flex items-center group">
                                            <div className="flex-1 text-sm py-1 px-2 bg-muted/50 rounded">
                                              {tip}
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={() => handleRemoveTip(index, tipIndex)}
                                            >
                                              <X className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {plan.steps.length === 0 && (
              <div className="text-center py-6 border rounded-lg border-dashed">
                <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h4 className="text-lg font-medium mb-1">No Steps Yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add steps to build your energy management plan
                </p>
                <Button onClick={handleAddStep}>
                  <Plus className="h-4 w-4 mr-1" /> Add First Step
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setPlan({
                id: crypto.randomUUID(),
                title: '',
                description: '',
                energy_level_required: 5,
                time_of_day: ['morning'],
                tags: [],
                steps: [
                  {
                    id: crypto.randomUUID(),
                    title: '',
                    description: '',
                    duration_minutes: 15,
                    activity_type: 'physical',
                    tips: []
                  }
                ]
              });
            }}
          >
            Reset
          </Button>
          <Button onClick={handleSavePlan} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Energy Plan'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 