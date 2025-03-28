import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Input,
  Button,
  Label,
  Slider,
  Switch,
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Checkbox,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Progress
} from './ui';
import { Battery, Coffee, Utensils, Droplet, Zap, ArrowUpCircle, ArrowDownCircle, Dumbbell, Brain, Moon, Activity, Sun, Smile, Frown, Meh, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  saveEnergyPlan, 
  saveMoodSupportPlan, 
  saveFatigueManagementPlan 
} from "@/api/apiCompatibility";
import { Loader } from "lucide-react";

interface WebToolsProps {
  session: Session | null;
}

export const WebTools: React.FC<WebToolsProps> = ({ session }) => {
  // Meal planner state
  const [calories, setCalories] = useState(2000);
  const [dietType, setDietType] = useState('balanced');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [mealPlanGenerated, setMealPlanGenerated] = useState(false);

  // BMI calculator state
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState('');

  // Water intake calculator state
  const [weightForWater, setWeightForWater] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [climate, setClimate] = useState('temperate');
  const [waterRecommendation, setWaterRecommendation] = useState<number | null>(null);
  
  // Energy management state
  const [energyChallenges, setEnergyChallenges] = useState<string[]>([]);
  const [caffeineIntake, setCaffeineIntake] = useState(2);
  const [energyPlan, setEnergyPlan] = useState('');
  const [energyScheduleGenerated, setEnergyScheduleGenerated] = useState(false);
  
  // Mood Support state
  const [moodLevel, setMoodLevel] = useState(5);
  const [moodTriggers, setMoodTriggers] = useState<string[]>([]);
  const [moodLog, setMoodLog] = useState<{date: Date, level: number, notes: string}[]>([]);
  const [moodPlan, setMoodPlan] = useState('');
  const [moodSupportGenerated, setMoodSupportGenerated] = useState(false);
  
  // Fatigue Management state
  const [fatigueLevel, setFatigueLevel] = useState(5);
  const [fatigueSources, setFatigueSources] = useState<string[]>([]);
  const [sleepQuality, setSleepQuality] = useState('average');
  const [fatiguePlan, setFatiguePlan] = useState('');
  const [fatigueManagementGenerated, setFatigueManagementGenerated] = useState(false);
  
  // API call state
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  
  // List of common energy challenges during quitting
  const energyChallengeOptions = [
    { id: 'morning-fatigue', label: 'Morning fatigue without cigarettes' },
    { id: 'afternoon-slump', label: 'Afternoon energy slump' },
    { id: 'withdrawal-tiredness', label: 'General tiredness from withdrawal' },
    { id: 'poor-sleep', label: 'Sleep disruption affecting energy' },
    { id: 'brain-fog', label: 'Brain fog or trouble concentrating' },
    { id: 'stress-response', label: 'Low energy from new stress responses' },
    { id: 'appetite-changes', label: 'Energy fluctuations from appetite changes' }
  ];

  // List of common mood triggers during quitting
  const moodTriggerOptions = [
    { id: 'withdrawal-irritability', label: 'Irritability from nicotine withdrawal' },
    { id: 'social-pressure', label: 'Social pressure or isolation' },
    { id: 'anxiety-increase', label: 'Increased anxiety without smoking' },
    { id: 'routine-disruption', label: 'Disruption of daily routines' },
    { id: 'guilt-setbacks', label: 'Guilt from setbacks or cravings' },
    { id: 'identity-shift', label: 'Loss of smoker identity' },
    { id: 'reward-loss', label: 'Loss of familiar reward system' }
  ];
  
  // List of common fatigue sources during quitting
  const fatigueSourceOptions = [
    { id: 'withdrawal-fatigue', label: 'Physical withdrawal symptoms' },
    { id: 'sleep-disruption', label: 'Sleep pattern disruption' },
    { id: 'mental-exertion', label: 'Mental effort of resisting cravings' },
    { id: 'stress-response', label: 'New stress responses without cigarettes' },
    { id: 'energy-metabolism', label: 'Changes in energy metabolism' },
    { id: 'appetite-changes', label: 'Increased appetite and digestion changes' },
    { id: 'emotional-drain', label: 'Emotional processing drain' }
  ];

  // Calculate BMI
  const calculateBMI = () => {
    if (!height || !weight) return;
    
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    
    if (heightInMeters <= 0 || weightInKg <= 0) return;
    
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    setBmiResult(parseFloat(bmi.toFixed(1)));
    
    // Determine BMI category
    if (bmi < 18.5) {
      setBmiCategory('Underweight');
    } else if (bmi >= 18.5 && bmi < 25) {
      setBmiCategory('Normal weight');
    } else if (bmi >= 25 && bmi < 30) {
      setBmiCategory('Overweight');
    } else {
      setBmiCategory('Obese');
    }
  };

  // Calculate water intake
  const calculateWaterIntake = () => {
    if (!weightForWater) return;
    
    const weightInKg = parseFloat(weightForWater);
    
    if (weightInKg <= 0) return;
    
    // Base calculation: 35ml per kg of body weight
    let waterAmount = weightInKg * 35;
    
    // Adjust for activity level
    if (activityLevel === 'sedentary') {
      waterAmount *= 0.8;
    } else if (activityLevel === 'very_active') {
      waterAmount *= 1.2;
    }
    
    // Adjust for climate
    if (climate === 'hot') {
      waterAmount *= 1.1;
    }
    
    setWaterRecommendation(Math.round(waterAmount));
  };

  // Generate meal plan
  const generateMealPlan = () => {
    // This would typically call an API, but for demo we'll just set a state
    setMealPlanGenerated(true);
  };
  
  // Generate energy management plan
  const generateEnergyPlan = () => {
    // Based on selected challenges, generate a personalized energy management plan
    let planText = "# Your Energy Management Plan\n\n";
    
    if (energyChallenges.includes('morning-fatigue')) {
      planText += "## Morning Energy Boost 🌄\n";
      planText += "- Start with 5 minutes of gentle stretching to activate your muscles\n";
      planText += "- Take a cool shower to increase alertness\n";
      planText += "- Have a protein-rich breakfast with complex carbs\n";
      planText += "- Replace your morning cigarette with a 10-minute walk\n\n";
    }
    
    if (energyChallenges.includes('afternoon-slump')) {
      planText += "## Afternoon Slump Strategy 🕒\n";
      planText += "- Take a 10-minute power nap or meditation break\n";
      planText += "- Have a small protein snack with nuts and fruit\n";
      planText += "- Do 2-3 minutes of deep breathing exercises\n";
      planText += "- Step outside for natural light exposure\n\n";
    }
    
    if (energyChallenges.includes('withdrawal-tiredness')) {
      planText += "## Withdrawal Fatigue Management 🔋\n";
      planText += "- Break tasks into smaller, manageable chunks\n";
      planText += "- Schedule regular 5-minute mini-breaks throughout the day\n";
      planText += "- Stay hydrated - withdrawal symptoms worsen with dehydration\n";
      planText += "- Try the 'pomodoro technique' with 25-minute work periods\n\n";
    }
    
    if (energyChallenges.includes('poor-sleep')) {
      planText += "## Sleep Quality Improvement 😴\n";
      planText += "- Establish a consistent bedtime routine\n";
      planText += "- Avoid screens 1 hour before bed\n";
      planText += "- Keep bedroom cool (65-68°F/18-20°C) and dark\n";
      planText += "- Try a warm bath with magnesium salts before bed\n\n";
    }
    
    if (energyChallenges.includes('brain-fog')) {
      planText += "## Brain Fog Remedies 🧠\n";
      planText += "- Take omega-3 supplements or eat fatty fish 2-3 times weekly\n";
      planText += "- Do 'box breathing' exercises when focus wanes\n";
      planText += "- Try 'brain dumps' - writing all thoughts on paper to clear mental space\n";
      planText += "- Use the 'two-minute rule' - if a task takes under 2 minutes, do it immediately\n\n";
    }
    
    if (energyChallenges.includes('stress-response')) {
      planText += "## New Stress Response Techniques 🧘\n";
      planText += "- Practice progressive muscle relaxation when cravings hit\n";
      planText += "- Keep a stress ball or fidget toy at hand\n";
      planText += "- Try alternate nostril breathing for 2 minutes\n";
      planText += "- Create a playlist of calming or energizing songs\n\n";
    }
    
    if (energyChallenges.includes('appetite-changes')) {
      planText += "## Energy Stabilization With New Appetite 🍎\n";
      planText += "- Eat smaller, more frequent meals (every 3-4 hours)\n";
      planText += "- Keep healthy snacks ready (cut vegetables, Greek yogurt, nuts)\n";
      planText += "- Focus on foods with low glycemic index to avoid crashes\n";
      planText += "- Start meals with protein rather than carbohydrates\n\n";
    }
    
    // Caffeine intake recommendations
    planText += "## Caffeine Management Plan ☕\n";
    if (caffeineIntake <= 1) {
      planText += "- Your low caffeine intake is ideal during the quit process\n";
      planText += "- Consider green tea for gentle energy without jitters\n";
    } else if (caffeineIntake <= 3) {
      planText += "- Moderate your current caffeine intake - drink water between coffee/tea\n";
      planText += "- No caffeine after 2pm to protect sleep quality\n";
    } else {
      planText += "- Gradually reduce caffeine to prevent additional withdrawal symptoms\n";
      planText += "- Replace every other coffee with decaf or herbal tea\n";
      planText += "- High caffeine can amplify anxiety during nicotine withdrawal\n";
    }
    
    setEnergyPlan(planText);
    setEnergyScheduleGenerated(true);
    
    toast.success("Your personalized energy management plan is ready");
  };
  
  // Save energy plan to user's account
  const saveUserEnergyPlan = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to save your energy plan");
      return;
    }
    
    try {
      setIsSavingPlan(true);
      
      await saveEnergyPlan({
        user_id: session.user.id,
        title: "Energy Management Plan",
        content: energyPlan,
        challenges: energyChallenges,
        caffeine_intake: caffeineIntake,
        settings: {
          generated_at: new Date().toISOString()
        }
      }, session);
      
      toast.success("Your energy management plan has been saved to your account");
    } catch (error) {
      console.error("Error saving energy plan:", error);
      toast.error("There was an error saving your plan. Please try again.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Generate mood support plan
  const generateMoodSupportPlan = () => {
    let planText = "# Your Personalized Mood Support Plan\n\n";
    
    // Add mood level-based recommendations
    planText += `## Current Mood Level: ${moodLevel}/10\n\n`;
    
    if (moodLevel <= 3) {
      planText += "### For Your Low Mood State:\n";
      planText += "- Practice self-compassion - this difficulty is temporary and part of healing\n";
      planText += "- Try 10 minutes of light exercise like walking to boost endorphins\n";
      planText += "- Schedule a brief call with a supportive friend or family member\n";
      planText += "- Use the 'mood boost' breathing exercise in our app\n\n";
    } else if (moodLevel <= 6) {
      planText += "### For Your Moderate Mood State:\n";
      planText += "- Build on your stability with small positive activities\n";
      planText += "- Practice a hobby or activity you enjoy for at least 15 minutes\n";
      planText += "- Set and complete a small, achievable goal today\n";
      planText += "- Try the 'gratitude practice' exercise in our app\n\n";
    } else {
      planText += "### For Your Positive Mood State:\n";
      planText += "- Excellent! Use this good mood to strengthen your quit journey\n";
      planText += "- Record how you feel now to reference during challenging times\n";
      planText += "- Help another quitter in our community forums\n";
      planText += "- Set a slightly challenging goal while your resilience is high\n\n";
    }
    
    // Add trigger-specific strategies
    if (moodTriggers.length > 0) {
      planText += "## Strategies For Your Specific Triggers:\n\n";
      
      if (moodTriggers.includes('withdrawal-irritability')) {
        planText += "### For Withdrawal Irritability:\n";
        planText += "- Practice 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8 seconds\n";
        planText += "- Use nicotine replacement therapy as prescribed to reduce physical symptoms\n";
        planText += "- Set a 'frustration timer' - wait 5 minutes before reacting when irritated\n";
        planText += "- Try progressive muscle relaxation when tension builds\n\n";
      }
      
      if (moodTriggers.includes('social-pressure')) {
        planText += "### For Social Pressure and Isolation:\n";
        planText += "- Prepare responses for when others offer cigarettes or question your quit\n";
        planText += "- Schedule regular check-ins with supportive friends who don't smoke\n";
        planText += "- Join our app's community forums for 10 minutes daily\n";
        planText += "- Consider temporarily avoiding high-risk social situations\n\n";
      }
      
      if (moodTriggers.includes('anxiety-increase')) {
        planText += "### For Increased Anxiety:\n";
        planText += "- Try the 'grounding technique': name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, 1 thing you taste\n";
        planText += "- Schedule brief 'worry periods' - set aside 10 minutes to address anxious thoughts\n";
        planText += "- Use guided meditations from our app's library\n";
        planText += "- Limit caffeine which can amplify anxiety during withdrawal\n\n";
      }
      
      if (moodTriggers.includes('routine-disruption')) {
        planText += "### For Routine Disruption:\n";
        planText += "- Create a new morning and evening routine with non-smoking activities\n";
        planText += "- Set alarms for former smoking times with alternative micro-activities\n";
        planText += "- Keep hands busy with a stress ball, fidget toy, or craft\n";
        planText += "- Create a 'smoke break' replacement ritual with tea or quick exercise\n\n";
      }
      
      if (moodTriggers.includes('guilt-setbacks')) {
        planText += "### For Guilt From Setbacks:\n";
        planText += "- Practice the 'setback protocol': log what happened without judgment\n";
        planText += "- Remember that 95% of successful quitters experienced setbacks\n";
        planText += "- Use our 'thought reframing' exercise for negative self-talk\n";
        planText += "- Return to your quit plan immediately without dwelling on lapses\n\n";
      }
      
      if (moodTriggers.includes('identity-shift')) {
        planText += "### For Identity Transition:\n";
        planText += "- Write about your evolving identity as a non-smoker\n";
        planText += "- List positive characteristics that smoking never defined\n";
        planText += "- Create a vision board of your smoke-free future self\n";
        planText += "- Join our 'Identity Shift' discussion group\n\n";
      }
      
      if (moodTriggers.includes('reward-loss')) {
        planText += "### For Reward System Restructuring:\n";
        planText += "- Create a list of 10 small, healthy rewards that take 5 minutes or less\n";
        planText += "- Develop a new reward schedule for accomplishments\n";
        planText += "- Start a savings jar with money not spent on cigarettes\n";
        planText += "- Use our app's achievement system to celebrate milestones\n\n";
      }
    }
    
    // Daily mood routine
    planText += "## Your Daily Mood-Supporting Routine:\n";
    planText += "- Morning: 2-minute positive visualization of successful day\n";
    planText += "- Mid-morning: Brief physical activity (stretching, walking)\n";
    planText += "- Afternoon: Social connection (text, call, or in-person)\n";
    planText += "- Evening: Reflection and gratitude practice\n";
    planText += "- Before bed: Tomorrow planning to reduce morning anxiety\n\n";
    
    planText += "## Track Your Progress:\n";
    planText += "- Use our mood tracking feature daily to identify patterns\n";
    planText += "- Notice connections between activities and mood improvements\n";
    planText += "- Update your plan weekly based on what works best for you\n";
    
    setMoodPlan(planText);
    setMoodSupportGenerated(true);
    
    toast.success("Your personalized mood support plan is ready");
  };
  
  // Save mood support plan to user's account
  const saveUserMoodPlan = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to save your mood support plan");
      return;
    }
    
    try {
      setIsSavingPlan(true);
      
      await saveMoodSupportPlan({
        user_id: session.user.id,
        title: "Mood Support Plan",
        content: moodPlan,
        mood_level: moodLevel,
        triggers: moodTriggers,
        settings: {
          generated_at: new Date().toISOString()
        }
      }, session);
      
      toast.success("Your mood support plan has been saved to your account");
    } catch (error) {
      console.error("Error saving mood plan:", error);
      toast.error("There was an error saving your plan. Please try again.");
    } finally {
      setIsSavingPlan(false);
    }
  };
  
  // Generate fatigue management plan
  const generateFatigueManagementPlan = () => {
    let planText = "# Your Fatigue Management Plan\n\n";
    
    // Add fatigue level-based recommendations
    planText += `## Current Fatigue Level: ${fatigueLevel}/10\n\n`;
    
    if (fatigueLevel >= 7) {
      planText += "### For Your High Fatigue State:\n";
      planText += "- Prioritize rest and recovery as your top priority\n";
      planText += "- Reduce commitments and responsibilities where possible\n";
      planText += "- Break tasks into very small, manageable steps\n";
      planText += "- Use the 'energy conservation' techniques in our app\n\n";
    } else if (fatigueLevel >= 4) {
      planText += "### For Your Moderate Fatigue State:\n";
      planText += "- Balance activity with strategic rest periods\n";
      planText += "- Apply the 50/10 rule: 50 minutes of activity, 10 minutes of rest\n";
      planText += "- Prioritize tasks by energy requirement\n";
      planText += "- Try our 'afternoon energy boost' exercise\n\n";
    } else {
      planText += "### For Your Lower Fatigue State:\n";
      planText += "- Excellent! Take advantage of your energy for important tasks\n";
      planText += "- Build your energy reserves with light physical activity\n";
      planText += "- Practice stress-management to maintain this state\n";
      planText += "- Record strategies that are working well for you\n\n";
    }
    
    // Sleep quality recommendations
    planText += "## Sleep Quality Recommendations:\n\n";
    
    if (sleepQuality === 'poor') {
      planText += "### For Poor Sleep Quality:\n";
      planText += "- Create a strict sleep schedule, even on weekends\n";
      planText += "- Remove all screens from bedroom and stop screen time 1 hour before bed\n";
      planText += "- Try our 'Sleep Reset Protocol' for 3 consecutive nights\n";
      planText += "- Consider temporary sleep aids as discussed with your healthcare provider\n";
      planText += "- Create a cool (65-68°F/18-20°C), dark, and quiet sleep environment\n\n";
    } else if (sleepQuality === 'average') {
      planText += "### For Average Sleep Quality:\n";
      planText += "- Improve your sleep onset with our 'pre-sleep routine'\n";
      planText += "- Try sleep restriction therapy to consolidate fragmented sleep\n";
      planText += "- Limit fluids 90 minutes before bedtime\n";
      planText += "- Use white noise or nature sounds if environmental noise is an issue\n\n";
    } else {
      planText += "### To Maintain Good Sleep Quality:\n";
      planText += "- Continue your effective sleep habits\n";
      planText += "- Monitor caffeine intake to protect sleep quality\n";
      planText += "- Consider using sleep tracking to identify what works best\n";
      planText += "- Try our advanced sleep optimization program\n\n";
    }
    
    // Add source-specific strategies
    if (fatigueSources.length > 0) {
      planText += "## Strategies For Your Specific Fatigue Sources:\n\n";
      
      if (fatigueSources.includes('withdrawal-fatigue')) {
        planText += "### For Physical Withdrawal Fatigue:\n";
        planText += "- Ensure adequate hydration (at least 8 glasses of water daily)\n";
        planText += "- Consider B-complex vitamins after consulting with your healthcare provider\n";
        planText += "- Try 5-10 minute microbursts of activity when energy is lowest\n";
        planText += "- Remember this is temporary and typically improves after 2-3 weeks\n\n";
      }
      
      if (fatigueSources.includes('sleep-disruption')) {
        planText += "### For Sleep Pattern Disruption:\n";
        planText += "- Implement a consistent wake-up time, even after poor sleep nights\n";
        planText += "- Use our 'Sleep Restoration' audio program before bed\n";
        planText += "- Try a 15-20 minute afternoon nap (but not after 3pm)\n";
        planText += "- Create a pre-sleep ritual to signal your body to prepare for rest\n\n";
      }
      
      if (fatigueSources.includes('mental-exertion')) {
        planText += "### For Mental Effort of Craving Resistance:\n";
        planText += "- Practice the 'mental offloading' technique: write down thoughts to clear mind\n";
        planText += "- Schedule 'decision-free' periods during the day\n";
        planText += "- Try alternate nostril breathing to balance mental energy\n";
        planText += "- Use our guided visualization for mental restoration\n\n";
      }
      
      if (fatigueSources.includes('stress-response')) {
        planText += "### For New Stress Response Systems:\n";
        planText += "- Practice the STOP technique: Stop, Take a breath, Observe, Proceed\n";
        planText += "- Try guided progressive muscle relaxation\n";
        planText += "- Create a list of 5-minute calming activities for stress spikes\n";
        planText += "- Consider adaptogens after consulting with your healthcare provider\n\n";
      }
      
      if (fatigueSources.includes('energy-metabolism')) {
        planText += "### For Metabolic Energy Changes:\n";
        planText += "- Eat small, frequent meals with balanced macronutrients\n";
        planText += "- Prioritize protein at breakfast to stabilize energy\n";
        planText += "- Consider chromium supplements (consult healthcare provider)\n";
        planText += "- Monitor blood sugar fluctuations with our tracking tool\n\n";
      }
      
      if (fatigueSources.includes('appetite-changes')) {
        planText += "### For Appetite and Digestion Changes:\n";
        planText += "- Keep high-protein, low-glycemic index snacks available\n";
        planText += "- Eat fiber-rich foods to stabilize digestion and energy\n";
        planText += "- Try our 'hunger vs. craving' assessment tool\n";
        planText += "- Chew sugar-free gum to manage oral fixation without excess calories\n\n";
      }
      
      if (fatigueSources.includes('emotional-drain')) {
        planText += "### For Emotional Processing Fatigue:\n";
        planText += "- Schedule specific 'emotion processing' times rather than constant monitoring\n";
        planText += "- Try journaling with our prompted templates\n";
        planText += "- Practice self-compassion meditation\n";
        planText += "- Consider our 'emotional resilience' program\n\n";
      }
    }
    
    // Daily energy management routine
    planText += "## Your Daily Energy Management Routine:\n";
    planText += "- Morning: 5-minute gentle stretching to activate muscles\n";
    planText += "- Mid-morning: Brief walk in natural light\n";
    planText += "- Lunch: Balanced meal with protein and complex carbs\n";
    planText += "- Afternoon: 3-minute breathing exercise\n";
    planText += "- Evening: Light activity and preparation for restful sleep\n\n";
    
    planText += "## Track Your Progress:\n";
    planText += "- Use our energy tracking feature daily\n";
    planText += "- Notice patterns in your energy fluctuations\n";
    planText += "- Adjust your plan weekly based on what works best\n";
    
    setFatiguePlan(planText);
    setFatigueManagementGenerated(true);
    
    toast.success("Your personalized fatigue management plan is ready");
  };
  
  // Save fatigue management plan to user's account
  const saveUserFatiguePlan = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to save your fatigue management plan");
      return;
    }
    
    try {
      setIsSavingPlan(true);
      
      await saveFatigueManagementPlan({
        user_id: session.user.id,
        title: "Fatigue Management Plan",
        content: fatiguePlan,
        fatigue_level: fatigueLevel,
        fatigue_sources: fatigueSources,
        sleep_quality: sleepQuality,
        settings: {
          generated_at: new Date().toISOString()
        }
      }, session);
      
      toast.success("Your fatigue management plan has been saved to your account");
    } catch (error) {
      console.error("Error saving fatigue plan:", error);
      toast.error("There was an error saving your plan. Please try again.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Add this to the energy management TabsContent section where the plan is displayed
  const renderEnergyPlanActions = () => {
    if (!energyScheduleGenerated) return null;
    
    return (
      <div className="mt-4 flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={() => {
            setEnergyPlan('');
            setEnergyScheduleGenerated(false);
          }}
        >
          Reset
        </Button>
        {session?.user?.id && (
          <Button 
            onClick={saveUserEnergyPlan} 
            disabled={isSavingPlan}
          >
            {isSavingPlan ? (
              <Loader className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Plan
          </Button>
        )}
      </div>
    );
  };
  
  // Add this to the mood support TabsContent section where the plan is displayed
  const renderMoodPlanActions = () => {
    if (!moodSupportGenerated) return null;
    
    return (
      <div className="mt-4 flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={() => {
            setMoodPlan('');
            setMoodSupportGenerated(false);
          }}
        >
          Reset
        </Button>
        {session?.user?.id && (
          <Button 
            onClick={saveUserMoodPlan} 
            disabled={isSavingPlan}
          >
            {isSavingPlan ? (
              <Loader className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Plan
          </Button>
        )}
      </div>
    );
  };
  
  // Add this to the fatigue management TabsContent section where the plan is displayed
  const renderFatiguePlanActions = () => {
    if (!fatigueManagementGenerated) return null;
    
    return (
      <div className="mt-4 flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={() => {
            setFatiguePlan('');
            setFatigueManagementGenerated(false);
          }}
        >
          Reset
        </Button>
        {session?.user?.id && (
          <Button 
            onClick={saveUserFatiguePlan} 
            disabled={isSavingPlan}
          >
            {isSavingPlan ? (
              <Loader className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Plan
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wellness Tools</CardTitle>
          <CardDescription>
            Tools to optimize your health and energy during your quit smoking journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="energy-management" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="energy-management">
                <Zap className="h-4 w-4 mr-2" />
                Energy
              </TabsTrigger>
              <TabsTrigger value="mood-support">
                <Smile className="h-4 w-4 mr-2" />
                Mood
              </TabsTrigger>
              <TabsTrigger value="fatigue-management">
                <Battery className="h-4 w-4 mr-2" />
                Fatigue
              </TabsTrigger>
              <TabsTrigger value="meal-planner">
                <Utensils className="h-4 w-4 mr-2" />
                Meals
              </TabsTrigger>
              <TabsTrigger value="bmi-calculator">
                <Dumbbell className="h-4 w-4 mr-2" />
                BMI
              </TabsTrigger>
              <TabsTrigger value="water-intake">
                <Droplet className="h-4 w-4 mr-2" />
                Water
              </TabsTrigger>
            </TabsList>
            
            {/* Energy Management Tool - NEW */}
            <TabsContent value="energy-management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Management During Quitting</CardTitle>
                  <CardDescription>
                    Create a personalized energy management plan to help combat fatigue and maintain focus during your quit smoking journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">Select your energy challenges</Label>
                    <p className="text-sm text-muted-foreground">Choose all the energy issues you're experiencing while quitting</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {energyChallengeOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={option.id} 
                            checked={energyChallenges.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEnergyChallenges([...energyChallenges, option.id]);
                              } else {
                                setEnergyChallenges(energyChallenges.filter(id => id !== option.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={option.id}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Coffee className="h-4 w-4 text-muted-foreground" />
                      <Label>Daily Caffeine Intake</Label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[caffeineIntake]}
                        min={0}
                        max={6}
                        step={1}
                        onValueChange={(value) => setCaffeineIntake(value[0])}
                      />
                      <span className="w-12 text-sm font-medium">{caffeineIntake} {caffeineIntake === 1 ? 'cup' : 'cups'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>None</span>
                      <span>Moderate</span>
                      <span>High</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={generateEnergyPlan}>
                    <Battery className="h-4 w-4 mr-2" />
                    Generate Energy Management Plan
                  </Button>
                  
                  {energyScheduleGenerated && (
                    <div className="space-y-3 mt-4">
                      <Label>Your Personalized Energy Management Plan</Label>
                      <div className="bg-muted p-4 rounded-md">
                        <div className="prose prose-sm max-w-none">
                          {energyPlan.split('\n').map((line, index) => {
                            if (line.startsWith('# ')) {
                              return <h2 key={index} className="text-xl font-bold mt-0 mb-3">{line.replace('# ', '')}</h2>;
                            } else if (line.startsWith('## ')) {
                              return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>;
                            } else if (line.startsWith('- ')) {
                              return <li key={index} className="ml-5">{line.replace('- ', '')}</li>;
                            } else if (line === '') {
                              return <br key={index} />;
                            } else {
                              return <p key={index} className="my-2">{line}</p>;
                            }
                          })}
                        </div>
                      </div>
                      {renderEnergyPlanActions()}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Energy FAQ During Quitting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <ArrowDownCircle className="h-4 w-4 text-amber-500 mr-2" />
                        Why am I so tired after quitting smoking?
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nicotine is a stimulant that affects brain chemistry. Your body is adjusting to functioning without it, 
                        which can cause temporary fatigue. Most people see energy improvements after 2-4 weeks.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <ArrowUpCircle className="h-4 w-4 text-green-500 mr-2" />
                        Will my energy ever improve?
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Yes! As your body heals, oxygen transport improves, inflammation decreases, and sleep quality gets better. 
                        Most ex-smokers report significantly higher energy levels after the initial withdrawal period.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <Coffee className="h-4 w-4 text-brown-500 mr-2" />
                        Should I drink more coffee to combat fatigue?
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Be cautious with caffeine during quitting. Nicotine affects how quickly your body processes caffeine, 
                        so the same amount may now have stronger effects. Excessive caffeine can worsen anxiety and sleep problems.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                        What's the fastest way to boost energy naturally?
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Physical activity is the most effective natural energy booster. Even a 10-minute walk increases oxygen flow 
                        and releases endorphins. Stay hydrated, maintain regular eating patterns, and prioritize quality sleep.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Meal Planner Tool - existing */}
            <TabsContent value="meal-planner" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Meal Planner</CardTitle>
                  <CardDescription>
                    Generate a personalized meal plan based on your preferences and nutritional needs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Daily Calorie Target</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[calories]}
                        min={1200}
                        max={3500}
                        step={50}
                        onValueChange={(value) => setCalories(value[0])}
                      />
                      <span className="w-12 text-sm font-medium">{calories}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Diet Type</Label>
                    <Select value={dietType} onValueChange={setDietType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a diet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="low-carb">Low Carb</SelectItem>
                        <SelectItem value="high-protein">High Protein</SelectItem>
                        <SelectItem value="keto">Ketogenic</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dietary Restrictions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Shellfish-Free', 'Soy-Free', 'Egg-Free'].map((restriction) => (
                        <div key={restriction} className="flex items-center space-x-2">
                          <Switch
                            checked={restrictions.includes(restriction)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setRestrictions([...restrictions, restriction]);
                              } else {
                                setRestrictions(restrictions.filter(r => r !== restriction));
                              }
                            }}
                          />
                          <Label>{restriction}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" onClick={generateMealPlan}>
                    Generate Meal Plan
                  </Button>
                </CardContent>
              </Card>

              {mealPlanGenerated && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your 7-Day Meal Plan</CardTitle>
                    <CardDescription>
                      Based on {calories} calories per day, {dietType} diet
                      {restrictions.length > 0 ? `, ${restrictions.join(', ')} free` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <h3 className="font-semibold text-lg mb-2">{day}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-muted rounded-md">
                              <p className="font-medium">Breakfast</p>
                              <p className="text-sm text-muted-foreground">
                                Overnight oats with berries and almonds
                              </p>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                              <p className="font-medium">Lunch</p>
                              <p className="text-sm text-muted-foreground">
                                Grilled chicken salad with quinoa
                              </p>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                              <p className="font-medium">Dinner</p>
                              <p className="text-sm text-muted-foreground">
                                Baked salmon with roasted vegetables
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* BMI Calculator Tool */}
            <TabsContent value="bmi-calculator" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>BMI Calculator</CardTitle>
                  <CardDescription>
                    Calculate your Body Mass Index (BMI) to assess if your weight is in a healthy range.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="e.g., 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g., 70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={calculateBMI}>
                    Calculate BMI
                  </Button>

                  {bmiResult !== null && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{bmiResult}</p>
                        <p className={`text-lg font-medium ${
                          bmiCategory === 'Normal weight' ? 'text-green-500' : 'text-amber-500'
                        }`}>
                          {bmiCategory}
                        </p>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                            style={{
                              width: '100%',
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Underweight</span>
                          <span>Normal</span>
                          <span>Overweight</span>
                          <span>Obese</span>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <p><strong>BMI Categories:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Underweight: BMI less than 18.5</li>
                          <li>Normal weight: BMI 18.5 to 24.9</li>
                          <li>Overweight: BMI 25 to 29.9</li>
                          <li>Obesity: BMI 30 or greater</li>
                        </ul>
                        <p className="mt-2 text-muted-foreground">
                          Note: BMI is a screening tool, not a diagnostic tool. Consult with a healthcare provider for a complete health assessment.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Water Intake Calculator */}
            <TabsContent value="water-intake" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Water Intake Calculator</CardTitle>
                  <CardDescription>
                    Calculate how much water you should drink each day based on your weight and activity level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weightForWater">Weight (kg)</Label>
                    <Input
                      id="weightForWater"
                      type="number"
                      placeholder="e.g., 70"
                      value={weightForWater}
                      onChange={(e) => setWeightForWater(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                        <SelectItem value="very active">Very Active (exercise 6-7 days/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Climate</Label>
                    <Select value={climate} onValueChange={setClimate}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select climate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperate">Temperate/Moderate</SelectItem>
                        <SelectItem value="hot">Hot/Humid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={calculateWaterIntake}>
                    Calculate Water Needs
                  </Button>

                  {waterRecommendation !== null && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <div className="text-center">
                        <p className="text-sm font-medium">Recommended Daily Water Intake</p>
                        <p className="text-2xl font-bold mt-1">{waterRecommendation} ml</p>
                        <p className="text-md font-medium mt-1">({(waterRecommendation / 1000).toFixed(1)} liters)</p>
                        <div className="mt-3 flex items-center justify-center space-x-1">
                          {Array.from({ length: Math.ceil(waterRecommendation / 250) }).map((_, i) => (
                            <div 
                              key={i} 
                              className="w-4 h-12 bg-blue-400 rounded-sm"
                              style={{
                                opacity: i < Math.floor(waterRecommendation / 250) ? 1 : 0.5
                              }}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          That's about {Math.ceil(waterRecommendation / 250)} glasses (250ml each)
                        </p>
                      </div>
                      <div className="mt-4 text-sm">
                        <p className="text-muted-foreground">
                          This is a general recommendation. Factors like health conditions, pregnancy, and breastfeeding may affect your water needs. Always consult with a healthcare provider for personalized advice.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mood Support Tool - NEW */}
            <TabsContent value="mood-support" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Support During Quitting</CardTitle>
                  <CardDescription>
                    Create a personalized mood management plan to help maintain emotional balance during your quit journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Current Mood Level (1-10)</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Frown className="h-5 w-5 text-destructive" />
                        <Slider
                          value={[moodLevel]}
                          onValueChange={(value) => setMoodLevel(value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <Smile className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 text-center">
                        {moodLevel < 4 ? 'Low mood - Be gentle with yourself' : 
                         moodLevel < 7 ? 'Moderate mood - Building stability' : 
                         'Positive mood - Great time to build resources'}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>What's affecting your mood during quitting? (Select all that apply)</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {moodTriggerOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.id}
                              checked={moodTriggers.includes(option.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setMoodTriggers([...moodTriggers, option.id]);
                                } else {
                                  setMoodTriggers(moodTriggers.filter(id => id !== option.id));
                                }
                              }}
                            />
                            <label htmlFor={option.id} className="text-sm">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button onClick={generateMoodSupportPlan} className="w-full">
                        Generate Mood Support Plan
                      </Button>
                    </div>
                    
                    {moodSupportGenerated && (
                      <div className="pt-4 space-y-4">
                        <div className="border rounded-md p-4 bg-secondary/10">
                          <div className="prose prose-stone dark:prose-invert max-w-none">
                            <div className="font-medium text-lg mb-2">Your Personalized Mood Support Plan</div>
                            <div className="whitespace-pre-wrap text-sm">
                              {moodPlan}
                            </div>
                          </div>
                        </div>
                        {renderMoodPlanActions()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Fatigue Management Tool - NEW */}
            <TabsContent value="fatigue-management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fatigue Management During Quitting</CardTitle>
                  <CardDescription>
                    Create a personalized plan to manage fatigue and maintain energy during your quit smoking journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Current Fatigue Level (1-10)</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Battery className="h-5 w-5 text-primary" />
                        <Slider
                          value={[fatigueLevel]}
                          onValueChange={(value) => setFatigueLevel(value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <Battery className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 text-center">
                        {fatigueLevel < 4 ? 'Low fatigue - Good energy levels' : 
                         fatigueLevel < 7 ? 'Moderate fatigue - Energy conservation needed' : 
                         'High fatigue - Prioritize rest and recovery'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Sleep Quality</Label>
                      <RadioGroup
                        value={sleepQuality}
                        onValueChange={setSleepQuality}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="poor" id="poor" />
                          <label htmlFor="poor" className="text-sm">Poor</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="average" id="average" />
                          <label htmlFor="average" className="text-sm">Average</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="good" id="good" />
                          <label htmlFor="good" className="text-sm">Good</label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>What's contributing to your fatigue? (Select all that apply)</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {fatigueSourceOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.id}
                              checked={fatigueSources.includes(option.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFatigueSources([...fatigueSources, option.id]);
                                } else {
                                  setFatigueSources(fatigueSources.filter(id => id !== option.id));
                                }
                              }}
                            />
                            <label htmlFor={option.id} className="text-sm">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button onClick={generateFatigueManagementPlan} className="w-full">
                        Generate Fatigue Management Plan
                      </Button>
                    </div>
                    
                    {fatigueManagementGenerated && (
                      <div className="pt-4 space-y-4">
                        <div className="border rounded-md p-4 bg-secondary/10">
                          <div className="prose prose-stone dark:prose-invert max-w-none">
                            <div className="font-medium text-lg mb-2">Your Fatigue Management Plan</div>
                            <div className="whitespace-pre-wrap text-sm">
                              {fatiguePlan}
                            </div>
                          </div>
                        </div>
                        {renderFatiguePlanActions()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
