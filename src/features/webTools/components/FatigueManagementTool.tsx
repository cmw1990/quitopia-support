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
  RadioGroup,
  RadioGroupItem,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from '../../../components/ui';
import { MountainSnow, Download, Activity, FileText, Clock, Coffee } from 'lucide-react';

interface FatigueManagementToolProps {
  session: Session | null;
}

export const FatigueManagementTool: React.FC<FatigueManagementToolProps> = ({ session }) => {
  // Fatigue assessment state
  const [fatigueLevel, setFatigueLevel] = useState<number>(5);
  const [sleepQuality, setSleepQuality] = useState<string>('average');
  const [fatigueSources, setFatigueSources] = useState<string[]>([]);
  const [fatigueImpact, setFatigueImpact] = useState<string>('moderate');
  const [fatiguePattern, setFatiguePattern] = useState<string>('fluctuating');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  
  // Common fatigue sources
  const commonSources = [
    'Nicotine withdrawal',
    'Poor sleep quality',
    'Dehydration',
    'Lack of physical activity', 
    'Poor nutrition',
    'High stress levels',
    'Mental exhaustion',
    'Medication side effects',
    'Emotional strain',
    'Screen fatigue'
  ];
  
  // Handle fatigue source selection
  const handleSourceSelect = (source: string) => {
    if (fatigueSources.includes(source)) {
      setFatigueSources(fatigueSources.filter(s => s !== source));
    } else {
      setFatigueSources([...fatigueSources, source]);
    }
  };
  
  // Generate fatigue management plan
  const generateFatiguePlan = () => {
    const sources = fatigueSources.map(source => `• ${source}`).join('\n');
    
    // Create fatigue level description
    const getFatigueLevelDesc = () => {
      if (fatigueLevel <= 3) return "mild";
      if (fatigueLevel <= 6) return "moderate";
      return "severe";
    };
    
    // Generate personalized recommendations based on inputs
    const getWithdrawalRecommendations = () => {
      if (fatigueSources.includes('Nicotine withdrawal')) {
        return `
### Managing Nicotine Withdrawal Fatigue

Nicotine withdrawal can significantly contribute to fatigue as your body adjusts to functioning without nicotine. Here are specific strategies:

• Understand that fatigue from withdrawal is temporary (typically peaks in the first week and gradually improves)
• Stay hydrated - drink at least 8 glasses of water daily to help flush toxins and reduce fatigue
• Consider gradually reducing caffeine, which can exacerbate withdrawal symptoms
• Take short 5-10 minute walks when fatigue hits to boost circulation and energy
• Try nicotine replacement therapy if approved by your healthcare provider to ease withdrawal symptoms
• Practice deep breathing exercises (4-7-8 method) when feeling particularly fatigued
• Be patient with yourself - this adjustment period is challenging but temporary
`;
      }
      return '';
    };
    
    // Generate sleep recommendations based on sleep quality
    const getSleepRecommendations = () => {
      if (sleepQuality === 'poor') {
        return `
### Improving Sleep Quality

Your poor sleep quality is likely contributing significantly to your fatigue. Focus on:

• Establish a consistent sleep schedule (same bedtime and wake time daily)
• Create a relaxing bedtime routine that signals your body it's time to sleep
• Keep your bedroom cool, dark, and quiet
• Avoid screens at least 1 hour before bed (blue light blocks melatonin production)
• Limit caffeine after noon and avoid alcohol close to bedtime
• Consider a white noise machine if environmental noise disrupts your sleep
• Try guided sleep meditation to help transition to sleep
• If sleep problems persist beyond 2-3 weeks, consider consulting a healthcare provider
`;
      } else if (sleepQuality === 'average') {
        return `
### Optimizing Your Sleep

Your sleep quality has room for improvement, which could help reduce your fatigue:

• Work toward a more consistent sleep schedule, even on weekends
• Create a wind-down routine 30-60 minutes before bed
• Keep electronics out of the bedroom if possible
• Ensure your mattress and pillows adequately support your body
• Moderate exercise during the day can help improve sleep quality
• Be mindful of evening food and drink intake that might disrupt sleep
`;
      } else {
        return `
### Maintaining Your Good Sleep

Your good sleep quality is a strength to leverage in managing fatigue:

• Continue your effective sleep practices
• Monitor for changes in sleep quality as you progress through your fresh journey
• Use your good sleep foundation to support other energy-building habits
• Consider how you might optimize your sleep timing to match your natural energy patterns
`;
      }
    };
    
    // Impact-based strategies
    const getImpactStrategies = () => {
      if (fatigueImpact === 'severe') {
        return `
### Addressing Severe Fatigue Impact

Since fatigue is significantly affecting your daily life:

• Consider discussing your fatigue with a healthcare provider to rule out medical causes
• Prioritize ruthlessly - focus only on essential activities during this transition period
• Schedule rest periods throughout your day (even 10-15 minutes can help)
• Ask for support from friends, family, or colleagues during this temporary period
• Consider simplified meal planning to ensure nutrition without expending excess energy
• Focus on small wins rather than expecting pre-quit energy levels immediately
`;
      }
      return '';
    };
    
    // Pattern-based recommendations
    const getPatternRecommendations = () => {
      if (fatiguePattern === 'morning') {
        return `
### Managing Morning Fatigue

Your morning fatigue pattern suggests these strategies may help:

• Hydrate immediately upon waking (keep water by your bed)
• Gentle stretching or brief movement to activate your body
• Exposure to natural sunlight within 30 minutes of waking
• Protein-rich breakfast to stabilize energy levels
• Consider adjusting your sleep schedule to allow for more morning rest if possible
`;
      } else if (fatiguePattern === 'afternoon') {
        return `
### Countering Afternoon Energy Dips

For your afternoon fatigue pattern:

• Schedule a 10-minute walking break after lunch
• Keep a water bottle at your desk/workspace and sip regularly
• Consider a small protein snack to stabilize afternoon energy
• Brief stretching or movement breaks every hour
• If possible, schedule less demanding tasks for your typical low-energy period
`;
      } else if (fatiguePattern === 'evening') {
        return `
### Managing Evening Fatigue

For your evening fatigue pattern:

• Front-load important activities earlier in the day when possible
• Plan simple, nutritious dinners that don't require extensive preparation
• Allow yourself to wind down earlier in the evening without guilt
• Consider gentle evening stretching or yoga to ease tension without exhaustion
• Prepare for the next day in advance to reduce morning stress
`;
      }
      return '';
    };
    
    const plan = `
## Your Personal Fatigue Management Plan

### Fatigue Assessment Summary

• Current Fatigue Level: ${fatigueLevel}/10 (${getFatigueLevelDesc()})
• Sleep Quality: ${sleepQuality.charAt(0).toUpperCase() + sleepQuality.slice(1)}
• Fatigue Pattern: ${fatiguePattern.charAt(0).toUpperCase() + fatiguePattern.slice(1)}
• Impact on Daily Life: ${fatigueImpact.charAt(0).toUpperCase() + fatigueImpact.slice(1)}

### Your Identified Fatigue Sources
${sources}

### Core Fatigue Management Strategies

#### Nutritional Support
• Stay consistently hydrated throughout the day
• Eat regular, balanced meals to maintain stable blood sugar
• Include protein with each meal and snack to sustain energy
• Consider B-vitamin rich foods which support energy production
• Minimize processed foods and added sugars which can cause energy crashes

#### Physical Strategies
• Schedule brief movement breaks every 60-90 minutes
• Try a 10-minute walk when fatigue hits as a natural energy booster
• Consider gentle yoga or stretching to improve circulation and reduce tension
• Gradually build a sustainable exercise routine as energy improves
• Use proper breathing techniques (diaphragmatic breathing) to increase oxygen

#### Mental and Emotional Support
• Practice stress management techniques like brief meditation or deep breathing
• Take short mental breaks from demanding tasks (even 5 minutes helps)
• Consider keeping a fatigue journal to identify patterns and improvements
• Celebrate small improvements in your energy as wins on your fresh journey
• Be patient and compassionate with yourself during this transition

${getWithdrawalRecommendations()}
${getSleepRecommendations()}
${getImpactStrategies()}
${getPatternRecommendations()}

### Implementation Plan

1. Start with just 2-3 strategies that feel most manageable
2. Implement them consistently for one week
3. Note improvements or changes in your energy levels
4. Gradually add additional strategies as your capacity increases
5. Revisit this plan regularly and adjust as your needs change during your fresh journey

Remember that fatigue during your fresh journey is temporary. Your energy levels will gradually improve as your body adjusts to life without nicotine.
`;

    setGeneratedPlan(plan);
  };
  
  // Download plan as text file
  const downloadPlan = () => {
    if (!generatedPlan) return;
    
    const element = document.createElement('a');
    const file = new Blob([generatedPlan], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'My_Fatigue_Management_Plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Fatigue Assessment Card */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MountainSnow className="h-5 w-5 text-primary" />
              Fatigue Assessment
            </CardTitle>
            <CardDescription>
              Evaluate your fatigue to create a personalized management plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="fatigue-level">Current Fatigue Level (1-10)</Label>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Minimal</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
              <Slider
                id="fatigue-level"
                min={1}
                max={10}
                step={1}
                value={[fatigueLevel]}
                onValueChange={(value) => setFatigueLevel(value[0])}
              />
              <div className="text-center">
                <span className="font-medium">{fatigueLevel}/10</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="sleep-quality">Sleep Quality</Label>
              <Select 
                value={sleepQuality} 
                onValueChange={setSleepQuality}
              >
                <SelectTrigger id="sleep-quality">
                  <SelectValue placeholder="Select sleep quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor - Difficulty falling/staying asleep</SelectItem>
                  <SelectItem value="average">Average - OK but not fully refreshed</SelectItem>
                  <SelectItem value="good">Good - Wake feeling refreshed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="fatigue-pattern">When do you feel most fatigued?</Label>
              <Select 
                value={fatiguePattern} 
                onValueChange={setFatiguePattern}
              >
                <SelectTrigger id="fatigue-pattern">
                  <SelectValue placeholder="Select fatigue pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Mornings are hardest</SelectItem>
                  <SelectItem value="afternoon">Afternoon slump</SelectItem>
                  <SelectItem value="evening">Evening exhaustion</SelectItem>
                  <SelectItem value="constant">Constant throughout the day</SelectItem>
                  <SelectItem value="fluctuating">Fluctuates unpredictably</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="fatigue-impact">Impact on daily activities</Label>
              <RadioGroup 
                id="fatigue-impact" 
                value={fatigueImpact} 
                onValueChange={setFatigueImpact}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mild" id="mild" />
                  <Label htmlFor="mild">Mild - Noticeable but not limiting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate - Limiting some activities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severe" id="severe" />
                  <Label htmlFor="severe">Severe - Significantly impacts daily life</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        
        {/* Fatigue Sources Card */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Potential Fatigue Sources</CardTitle>
            <CardDescription>
              Select factors that may be contributing to your fatigue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commonSources.map((source, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`source-${index}`}
                    checked={fatigueSources.includes(source)}
                    onChange={() => handleSourceSelect(source)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label 
                    htmlFor={`source-${index}`}
                    className="text-sm"
                  >
                    {source}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="additional-notes">Additional notes about your fatigue</Label>
              <Textarea
                id="additional-notes"
                placeholder="Any other factors or patterns you've noticed..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={generateFatiguePlan}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Fatigue Management Plan
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Fatigue Management Plan Card */}
      {generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Your Fatigue Management Plan
            </CardTitle>
            <CardDescription>
              Personalized strategies based on your assessment
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
                    } else if (line.match(/^\d+\./)) {
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
                Download My Fatigue Management Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Quick Fatigue Relief Strategies
          </CardTitle>
          <CardDescription>
            Try these when you need an immediate energy boost
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-green-500" />
                Physical Reset (2-5 min)
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• 10 gentle shoulder rolls</li>
                <li>• 5 slow, deep breaths</li>
                <li>• Walk up and down stairs once</li>
                <li>• Splash cold water on face</li>
                <li>• Stretch arms overhead for 30 seconds</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Coffee className="h-4 w-4 text-amber-500" />
                Quick Energy Boosters
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• 8oz water with lemon</li>
                <li>• Small protein snack</li>
                <li>• 1-2 minute fresh air break</li>
                <li>• 20 jumping jacks</li>
                <li>• Brief head/neck massage</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <MountainSnow className="h-4 w-4 text-blue-500" />
                Mental Refresh Techniques
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• 60-second mindfulness pause</li>
                <li>• Listen to one upbeat song</li>
                <li>• 4-7-8 breathing technique (3x)</li>
                <li>• Switch tasks briefly</li>
                <li>• Look at nature/green space for 2 minutes</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm">
            <p className="font-medium">Fresh Journey Note:</p>
            <p className="mt-1">Fatigue is a common experience when quitting smoking as your body adjusts to functioning without nicotine. This typically improves significantly after 2-4 weeks as your body's energy systems recalibrate.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 