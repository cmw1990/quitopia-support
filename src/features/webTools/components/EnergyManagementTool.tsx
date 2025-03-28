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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from '../../../components/ui';
import { Battery, Download, Activity, Sun, Moon, Coffee, Zap } from 'lucide-react';

interface EnergyManagementToolProps {
  session: Session | null;
}

export const EnergyManagementTool: React.FC<EnergyManagementToolProps> = ({ session }) => {
  // Energy assessment state
  const [physicalEnergy, setPhysicalEnergy] = useState<number>(5);
  const [mentalEnergy, setMentalEnergy] = useState<number>(5);
  const [emotionalEnergy, setEmotionalEnergy] = useState<number>(5);
  const [sleepQuality, setSleepQuality] = useState<number>(5);
  const [nutritionQuality, setNutritionQuality] = useState<number>(5);
  
  // Energy pattern state
  const [morningEnergy, setMorningEnergy] = useState<number>(5);
  const [afternoonEnergy, setAfternoonEnergy] = useState<number>(5);
  const [eveningEnergy, setEveningEnergy] = useState<number>(5);
  
  // Energy drains and boosters
  const [energyDrains, setEnergyDrains] = useState<string[]>([]);
  const [energyBoosters, setEnergyBoosters] = useState<string[]>([]);
  const [customDrain, setCustomDrain] = useState<string>('');
  const [customBooster, setCustomBooster] = useState<string>('');
  
  // Plan state
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  
  // Common energy drains for selection
  const commonDrains = [
    'Nicotine cravings',
    'Poor sleep',
    'Caffeine crashes',
    'Stress',
    'Dehydration',
    'Skipping meals',
    'Sedentary periods',
    'Screen fatigue',
    'Social media',
    'Negative people'
  ];
  
  // Common energy boosters for selection
  const commonBoosters = [
    'Short walks',
    'Stretching',
    'Deep breathing',
    'Healthy snacks',
    'Power naps',
    'Hydration',
    'Music',
    'Talking to friends',
    'Sunlight exposure',
    'Quick meditation'
  ];
  
  // Handle selecting energy drains
  const handleDrainSelect = (drain: string) => {
    if (energyDrains.includes(drain)) {
      setEnergyDrains(energyDrains.filter(d => d !== drain));
    } else {
      setEnergyDrains([...energyDrains, drain]);
    }
  };
  
  // Handle selecting energy boosters
  const handleBoosterSelect = (booster: string) => {
    if (energyBoosters.includes(booster)) {
      setEnergyBoosters(energyBoosters.filter(b => b !== booster));
    } else {
      setEnergyBoosters([...energyBoosters, booster]);
    }
  };
  
  // Add custom drain
  const addCustomDrain = () => {
    if (customDrain.trim()) {
      setEnergyDrains([...energyDrains, customDrain.trim()]);
      setCustomDrain('');
    }
  };
  
  // Add custom booster
  const addCustomBooster = () => {
    if (customBooster.trim()) {
      setEnergyBoosters([...energyBoosters, customBooster.trim()]);
      setCustomBooster('');
    }
  };
  
  // Calculate overall energy score
  const calculateEnergyScore = () => {
    const average = (physicalEnergy + mentalEnergy + emotionalEnergy) / 3;
    return Math.round(average * 10) / 10;
  };
  
  // Generate energy management plan
  const generateEnergyPlan = () => {
    const energyScore = calculateEnergyScore();
    const drains = energyDrains.map(drain => `• ${drain}`).join('\n');
    const boosters = energyBoosters.map(booster => `• ${booster}`).join('\n');
    
    // Create personalized plan text based on inputs
    const plan = `
## Your Personal Energy Management Plan

### Current Energy Assessment
• Overall Energy Score: ${energyScore}/10
• Physical Energy: ${physicalEnergy}/10
• Mental Energy: ${mentalEnergy}/10
• Emotional Energy: ${emotionalEnergy}/10
• Sleep Quality: ${sleepQuality}/10
• Nutrition Quality: ${nutritionQuality}/10

### Your Energy Pattern
• Morning Energy: ${morningEnergy}/10
• Afternoon Energy: ${afternoonEnergy}/10
• Evening Energy: ${eveningEnergy}/10

### Your Energy Drains
${drains}

### Your Energy Boosters
${boosters}

### Your Personalized Energy Management Strategy

#### Morning Routine (Optimize your start)
${morningEnergy <= 4 ? 
`Your morning energy is on the lower side. Try these morning boosters:
• Start with a large glass of water
• Get 5-10 minutes of natural sunlight
• Consider a protein-rich breakfast
• Gentle stretching or brief exercise
• Delay caffeine by 1-2 hours after waking` : 
`Your morning energy is moderate to good. To optimize it:
• Maintain your natural energy with light activity
• Plan most challenging tasks during this time
• Stay hydrated from the start of your day
• Consider a balanced breakfast with protein and complex carbs
• Use your natural energy for important tasks`}

#### Afternoon Strategy (Beat the slump)
${afternoonEnergy <= 4 ?
`Your afternoon energy tends to dip. Counter it with:
• Take a 10-minute walk after lunch
• Schedule a 5-minute stretching break
• Stay hydrated throughout the afternoon
• Consider a small protein-rich snack
• Brief meditation or deep breathing exercise` :
`Your afternoon energy remains relatively strong. To maintain it:
• Take short breaks to preserve mental energy
• Stay well hydrated
• Avoid heavy carb-loaded lunches
• Brief standing or walking breaks hourly
• Save some moderate-difficulty tasks for this period`}

#### Evening Approach (Restore and recharge)
${eveningEnergy <= 4 ?
`Your evening energy is lower. Focus on recovery:
• Prioritize gentle activities and rest
• Begin winding down 1-2 hours before sleep
• Limit screen time in the final hour before bed
• Consider a relaxing ritual (reading, light stretching)
• Prepare for tomorrow to reduce morning stress` :
`Your evening energy remains good. Balance it with:
• Allow yourself to enjoy activities but set boundaries
• Begin calming activities 1 hour before bed
• Limit stimulation from screens or stressful content
• Prepare for the next day to ease morning routine
• Practice a brief gratitude reflection`}

#### Special Considerations During Your Fresh Journey
• Nicotine withdrawal can temporarily affect energy levels - this is normal and will improve
• Hydration becomes even more important as your body adjusts
• Brief physical activity can help manage both energy dips and cravings
• Your sleep quality will likely improve over time, boosting overall energy
• Energy fluctuations are normal during this transition - be patient with yourself

#### When to Implement Your Energy Boosters
• At the first sign of a craving (as cravings can drain energy)
• When you notice your concentration dropping
• After prolonged sitting or mental focus
• When feeling emotionally drained
• As a preventative measure before typically low-energy periods

Remember that your energy patterns may shift as you progress in your fresh journey. Revisit and adjust this plan as needed.
    `;
    
    setGeneratedPlan(plan);
  };
  
  // Download plan as text file
  const downloadPlan = () => {
    if (!generatedPlan) return;
    
    const element = document.createElement('a');
    const file = new Blob([generatedPlan], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'My_Energy_Management_Plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Get energy level color
  const getEnergyColor = (level: number) => {
    if (level <= 3) return 'text-red-500';
    if (level <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // Get progress color for bar
  const getProgressColor = (level: number) => {
    if (level <= 3) return 'bg-red-500';
    if (level <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="space-y-8">
      <Tabs defaultValue="assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="assessment">
            <Activity className="h-4 w-4 mr-2" />
            Energy Assessment
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <Zap className="h-4 w-4 mr-2" />
            Energy Patterns
          </TabsTrigger>
          <TabsTrigger value="plan">
            <Battery className="h-4 w-4 mr-2" />
            Your Energy Plan
          </TabsTrigger>
        </TabsList>
        
        {/* Energy Assessment Tab */}
        <TabsContent value="assessment">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Energy Self-Assessment
                </CardTitle>
                <CardDescription>
                  Rate your current energy levels to get personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Physical Energy */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="physical-energy">Physical Energy</Label>
                    <span className={`font-medium ${getEnergyColor(physicalEnergy)}`}>{physicalEnergy}/10</span>
                  </div>
                  <Slider
                    id="physical-energy"
                    min={1}
                    max={10}
                    step={1}
                    value={[physicalEnergy]}
                    onValueChange={(value) => setPhysicalEnergy(value[0])}
                  />
                  <Progress value={physicalEnergy * 10} className={`h-2 ${getProgressColor(physicalEnergy)}`} />
                </div>
                
                {/* Mental Energy */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="mental-energy">Mental Energy</Label>
                    <span className={`font-medium ${getEnergyColor(mentalEnergy)}`}>{mentalEnergy}/10</span>
                  </div>
                  <Slider
                    id="mental-energy"
                    min={1}
                    max={10}
                    step={1}
                    value={[mentalEnergy]}
                    onValueChange={(value) => setMentalEnergy(value[0])}
                  />
                  <Progress value={mentalEnergy * 10} className={`h-2 ${getProgressColor(mentalEnergy)}`} />
                </div>
                
                {/* Emotional Energy */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="emotional-energy">Emotional Energy</Label>
                    <span className={`font-medium ${getEnergyColor(emotionalEnergy)}`}>{emotionalEnergy}/10</span>
                  </div>
                  <Slider
                    id="emotional-energy"
                    min={1}
                    max={10}
                    step={1}
                    value={[emotionalEnergy]}
                    onValueChange={(value) => setEmotionalEnergy(value[0])}
                  />
                  <Progress value={emotionalEnergy * 10} className={`h-2 ${getProgressColor(emotionalEnergy)}`} />
                </div>
                
                {/* Sleep Quality */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="sleep-quality">Sleep Quality</Label>
                    <span className={`font-medium ${getEnergyColor(sleepQuality)}`}>{sleepQuality}/10</span>
                  </div>
                  <Slider
                    id="sleep-quality"
                    min={1}
                    max={10}
                    step={1}
                    value={[sleepQuality]}
                    onValueChange={(value) => setSleepQuality(value[0])}
                  />
                  <Progress value={sleepQuality * 10} className={`h-2 ${getProgressColor(sleepQuality)}`} />
                </div>
                
                {/* Nutrition Quality */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="nutrition-quality">Nutrition Quality</Label>
                    <span className={`font-medium ${getEnergyColor(nutritionQuality)}`}>{nutritionQuality}/10</span>
                  </div>
                  <Slider
                    id="nutrition-quality"
                    min={1}
                    max={10}
                    step={1}
                    value={[nutritionQuality]}
                    onValueChange={(value) => setNutritionQuality(value[0])}
                  />
                  <Progress value={nutritionQuality * 10} className={`h-2 ${getProgressColor(nutritionQuality)}`} />
                </div>
                
                <div className="pt-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    Overall Energy Score: <span className={getEnergyColor(calculateEnergyScore())}>{calculateEnergyScore()}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Based on your physical, mental, and emotional energy ratings
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="h-5 w-5 text-red-500" />
                    Energy Drains
                  </CardTitle>
                  <CardDescription>
                    What's depleting your energy during your fresh journey?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {commonDrains.map((drain, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={energyDrains.includes(drain) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDrainSelect(drain)}
                        className="rounded-full"
                      >
                        {drain}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add your own energy drain"
                      value={customDrain}
                      onChange={(e) => setCustomDrain(e.target.value)}
                    />
                    <Button 
                      onClick={addCustomDrain}
                      disabled={!customDrain.trim()}
                      type="button"
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="h-5 w-5 text-green-500" />
                    Energy Boosters
                  </CardTitle>
                  <CardDescription>
                    What helps boost your energy during your fresh journey?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {commonBoosters.map((booster, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={energyBoosters.includes(booster) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleBoosterSelect(booster)}
                        className="rounded-full"
                      >
                        {booster}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add your own energy booster"
                      value={customBooster}
                      onChange={(e) => setCustomBooster(e.target.value)}
                    />
                    <Button 
                      onClick={addCustomBooster}
                      disabled={!customBooster.trim()}
                      type="button"
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Energy Patterns Tab */}
        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Your Energy Patterns
              </CardTitle>
              <CardDescription>
                Understanding your daily energy flow is key to optimizing your day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Morning Energy */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sun className="h-8 w-8 text-yellow-500" />
                    <h3 className="text-lg font-medium">Morning Energy</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[morningEnergy]}
                      onValueChange={(value) => setMorningEnergy(value[0])}
                    />
                    <div className="text-center">
                      <span className={`text-xl font-bold ${getEnergyColor(morningEnergy)}`}>{morningEnergy}/10</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {morningEnergy <= 3 && "Your mornings are challenging energy-wise. Focus on gentle wake-up routines."}
                    {morningEnergy > 3 && morningEnergy <= 6 && "You have moderate morning energy. A good routine can help optimize it further."}
                    {morningEnergy > 6 && "You have strong morning energy! Use this time for important or challenging tasks."}
                  </div>
                </div>
                
                {/* Afternoon Energy */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-8 w-8 text-amber-500" />
                    <h3 className="text-lg font-medium">Afternoon Energy</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[afternoonEnergy]}
                      onValueChange={(value) => setAfternoonEnergy(value[0])}
                    />
                    <div className="text-center">
                      <span className={`text-xl font-bold ${getEnergyColor(afternoonEnergy)}`}>{afternoonEnergy}/10</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {afternoonEnergy <= 3 && "You experience significant afternoon dips. Plan for strategic breaks and light tasks."}
                    {afternoonEnergy > 3 && afternoonEnergy <= 6 && "Your afternoon energy is moderate. Hydration and short breaks can help maintain it."}
                    {afternoonEnergy > 6 && "You maintain good afternoon energy! This is less common and a strength to leverage."}
                  </div>
                </div>
                
                {/* Evening Energy */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Moon className="h-8 w-8 text-indigo-500" />
                    <h3 className="text-lg font-medium">Evening Energy</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[eveningEnergy]}
                      onValueChange={(value) => setEveningEnergy(value[0])}
                    />
                    <div className="text-center">
                      <span className={`text-xl font-bold ${getEnergyColor(eveningEnergy)}`}>{eveningEnergy}/10</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {eveningEnergy <= 3 && "Your energy is low by evening. Focus on restorative activities and good sleep hygiene."}
                    {eveningEnergy > 3 && eveningEnergy <= 6 && "You have moderate evening energy. Balance activity with wind-down time."}
                    {eveningEnergy > 6 && "You're a night owl with high evening energy! Be mindful of setting boundaries for sleep."}
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <h3 className="text-lg font-medium mb-2">Your Energy Pattern Profile</h3>
                <div className="p-4 border rounded-lg bg-card">
                  {morningEnergy > afternoonEnergy && morningEnergy > eveningEnergy && (
                    <div>
                      <p className="font-medium mb-2">You're a "Morning Person"</p>
                      <p className="text-sm text-muted-foreground">
                        Your energy peaks early and gradually declines throughout the day. Prioritize important tasks and decisions in the morning, and use your afternoon and evening for less demanding activities. During your fresh journey, morning may be your strongest time to implement new habits.
                      </p>
                    </div>
                  )}
                  
                  {afternoonEnergy > morningEnergy && afternoonEnergy > eveningEnergy && (
                    <div>
                      <p className="font-medium mb-2">You're a "Mid-day Peak" person</p>
                      <p className="text-sm text-muted-foreground">
                        Your energy builds toward the middle of the day. You may need a gentle morning routine to get going, but can tackle challenging tasks by late morning and early afternoon. Plan for a gradually declining evening to support good sleep.
                      </p>
                    </div>
                  )}
                  
                  {eveningEnergy > morningEnergy && eveningEnergy > afternoonEnergy && (
                    <div>
                      <p className="font-medium mb-2">You're an "Evening Person"</p>
                      <p className="text-sm text-muted-foreground">
                        You build energy throughout the day, peaking in the evening. Plan easier morning tasks, gradually increase complexity, and use your evening energy wisely while being mindful of sleep. During your fresh journey, be extra vigilant about evening triggers that might have been associated with smoking.
                      </p>
                    </div>
                  )}
                  
                  {morningEnergy === afternoonEnergy && afternoonEnergy === eveningEnergy && (
                    <div>
                      <p className="font-medium mb-2">You have a "Consistent Energy" pattern</p>
                      <p className="text-sm text-muted-foreground">
                        Your energy stays relatively stable throughout the day. While this is uncommon, it can be a strength. Focus on maintaining this balance with regular breaks, hydration, and nutrition. Your consistent pattern may help with implementing regular fresh journey habits.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Energy Plan Tab */}
        <TabsContent value="plan">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Battery className="h-5 w-5 text-primary" />
                  Generate Your Energy Management Plan
                </CardTitle>
                <CardDescription>
                  Create a personalized plan based on your energy assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Based on your energy assessment and patterns, we'll create a tailored energy management plan to support your fresh journey.
                  </p>
                  <Button 
                    onClick={generateEnergyPlan}
                    size="lg"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Generate My Energy Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {generatedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Energy Management Plan</CardTitle>
                  <CardDescription>
                    Your personalized strategy for optimal energy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-card overflow-auto max-h-[500px]">
                      <div className="prose prose-sm dark:prose-invert">
                        {generatedPlan.split('\n').map((line, index) => {
                          if (line.startsWith('##')) {
                            return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('##', '').trim()}</h2>;
                          } else if (line.startsWith('###')) {
                            return <h3 key={index} className="text-lg font-bold mt-3 mb-1">{line.replace('###', '').trim()}</h3>;
                          } else if (line.startsWith('####')) {
                            return <h4 key={index} className="text-md font-bold mt-2 mb-1">{line.replace('####', '').trim()}</h4>;
                          } else if (line.startsWith('•')) {
                            return <p key={index} className="ml-4 flex items-start"><span className="mr-2">•</span> {line.replace('•', '').trim()}</p>;
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
                      Download My Energy Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 