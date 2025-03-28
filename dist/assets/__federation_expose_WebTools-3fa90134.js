import { importShared } from './__federation_fn_import-078a81cf.js';
import { c as createLucideIcon, j as jsxDevRuntimeExports, C as Card, d as CardHeader, e as CardTitle, q as CardDescription, f as CardContent, T as Tabs, m as TabsList, n as TabsTrigger, o as TabsContent, L as Label, r as Slider, B as Button, S as Select, h as SelectTrigger, i as SelectValue, k as SelectContent, l as SelectItem, I as Input } from './proxy-0fb2bf4b.js';
import { C as Checkbox, S as Switch, R as RadioGroup, c as RadioGroupItem } from './smoke-free-counter-a4ff4a5c.js';
import { u as useToast } from './use-toast-614cf0bf.js';
import { s as saveEnergyPlan, a as saveMoodSupportPlan, b as saveFatigueManagementPlan } from './missionFreshApiClient-4a1b4bf0.js';
import { Z as Zap } from './zap-7944e79d.js';
import { S as Smile, D as Droplet, L as LoaderCircle } from './smile-ab1dd02f.js';
import { B as Battery } from './battery-f7580618.js';
import { U as Utensils } from './utensils-0f99a462.js';
import { C as Coffee } from './coffee-a68f3c7d.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const CircleArrowDown = createLucideIcon("CircleArrowDown", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 8v8", key: "napkw2" }],
  ["path", { d: "m8 12 4 4 4-4", key: "k98ssh" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const CircleArrowUp = createLucideIcon("CircleArrowUp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m16 12-4-4-4 4", key: "177agl" }],
  ["path", { d: "M12 16V8", key: "1sbj14" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Dumbbell = createLucideIcon("Dumbbell", [
  ["path", { d: "M14.4 14.4 9.6 9.6", key: "ic80wn" }],
  [
    "path",
    {
      d: "M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z",
      key: "nnl7wr"
    }
  ],
  ["path", { d: "m21.5 21.5-1.4-1.4", key: "1f1ice" }],
  ["path", { d: "M3.9 3.9 2.5 2.5", key: "1evmna" }],
  [
    "path",
    {
      d: "M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z",
      key: "yhosts"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Frown = createLucideIcon("Frown", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M16 16s-1.5-2-4-2-4 2-4 2", key: "epbg0q" }],
  ["line", { x1: "9", x2: "9.01", y1: "9", y2: "9", key: "yxxnd0" }],
  ["line", { x1: "15", x2: "15.01", y1: "9", y2: "9", key: "1p4y9e" }]
]);

const {useState} = await importShared('react');
const WebTools = ({ session }) => {
  const [calories, setCalories] = useState(2e3);
  const [dietType, setDietType] = useState("balanced");
  const [restrictions, setRestrictions] = useState([]);
  const [mealPlanGenerated, setMealPlanGenerated] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [weightForWater, setWeightForWater] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [climate, setClimate] = useState("temperate");
  const [waterRecommendation, setWaterRecommendation] = useState(null);
  const [energyChallenges, setEnergyChallenges] = useState([]);
  const [caffeineIntake, setCaffeineIntake] = useState(2);
  const [energyPlan, setEnergyPlan] = useState("");
  const [energyScheduleGenerated, setEnergyScheduleGenerated] = useState(false);
  const { toast } = useToast();
  const [moodLevel, setMoodLevel] = useState(5);
  const [moodTriggers, setMoodTriggers] = useState([]);
  useState([]);
  const [moodPlan, setMoodPlan] = useState("");
  const [moodSupportGenerated, setMoodSupportGenerated] = useState(false);
  const [fatigueLevel, setFatigueLevel] = useState(5);
  const [fatigueSources, setFatigueSources] = useState([]);
  const [sleepQuality, setSleepQuality] = useState("average");
  const [fatiguePlan, setFatiguePlan] = useState("");
  const [fatigueManagementGenerated, setFatigueManagementGenerated] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const energyChallengeOptions = [
    { id: "morning-fatigue", label: "Morning fatigue without cigarettes" },
    { id: "afternoon-slump", label: "Afternoon energy slump" },
    { id: "withdrawal-tiredness", label: "General tiredness from withdrawal" },
    { id: "poor-sleep", label: "Sleep disruption affecting energy" },
    { id: "brain-fog", label: "Brain fog or trouble concentrating" },
    { id: "stress-response", label: "Low energy from new stress responses" },
    { id: "appetite-changes", label: "Energy fluctuations from appetite changes" }
  ];
  const moodTriggerOptions = [
    { id: "withdrawal-irritability", label: "Irritability from nicotine withdrawal" },
    { id: "social-pressure", label: "Social pressure or isolation" },
    { id: "anxiety-increase", label: "Increased anxiety without smoking" },
    { id: "routine-disruption", label: "Disruption of daily routines" },
    { id: "guilt-setbacks", label: "Guilt from setbacks or cravings" },
    { id: "identity-shift", label: "Loss of smoker identity" },
    { id: "reward-loss", label: "Loss of familiar reward system" }
  ];
  const fatigueSourceOptions = [
    { id: "withdrawal-fatigue", label: "Physical withdrawal symptoms" },
    { id: "sleep-disruption", label: "Sleep pattern disruption" },
    { id: "mental-exertion", label: "Mental effort of resisting cravings" },
    { id: "stress-response", label: "New stress responses without cigarettes" },
    { id: "energy-metabolism", label: "Changes in energy metabolism" },
    { id: "appetite-changes", label: "Increased appetite and digestion changes" },
    { id: "emotional-drain", label: "Emotional processing drain" }
  ];
  const calculateBMI = () => {
    if (!height || !weight)
      return;
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    if (heightInMeters <= 0 || weightInKg <= 0)
      return;
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    setBmiResult(parseFloat(bmi.toFixed(1)));
    if (bmi < 18.5) {
      setBmiCategory("Underweight");
    } else if (bmi >= 18.5 && bmi < 25) {
      setBmiCategory("Normal weight");
    } else if (bmi >= 25 && bmi < 30) {
      setBmiCategory("Overweight");
    } else {
      setBmiCategory("Obese");
    }
  };
  const calculateWaterIntake = () => {
    if (!weightForWater)
      return;
    const weightInKg = parseFloat(weightForWater);
    if (weightInKg <= 0)
      return;
    let waterAmount = weightInKg * 35;
    if (activityLevel === "sedentary") {
      waterAmount *= 0.8;
    } else if (activityLevel === "very_active") {
      waterAmount *= 1.2;
    }
    if (climate === "hot") {
      waterAmount *= 1.1;
    }
    setWaterRecommendation(Math.round(waterAmount));
  };
  const generateMealPlan = () => {
    setMealPlanGenerated(true);
  };
  const generateEnergyPlan = () => {
    let planText = "# Your Energy Management Plan\n\n";
    if (energyChallenges.includes("morning-fatigue")) {
      planText += "## Morning Energy Boost 🌄\n";
      planText += "- Start with 5 minutes of gentle stretching to activate your muscles\n";
      planText += "- Take a cool shower to increase alertness\n";
      planText += "- Have a protein-rich breakfast with complex carbs\n";
      planText += "- Replace your morning cigarette with a 10-minute walk\n\n";
    }
    if (energyChallenges.includes("afternoon-slump")) {
      planText += "## Afternoon Slump Strategy 🕒\n";
      planText += "- Take a 10-minute power nap or meditation break\n";
      planText += "- Have a small protein snack with nuts and fruit\n";
      planText += "- Do 2-3 minutes of deep breathing exercises\n";
      planText += "- Step outside for natural light exposure\n\n";
    }
    if (energyChallenges.includes("withdrawal-tiredness")) {
      planText += "## Withdrawal Fatigue Management 🔋\n";
      planText += "- Break tasks into smaller, manageable chunks\n";
      planText += "- Schedule regular 5-minute mini-breaks throughout the day\n";
      planText += "- Stay hydrated - withdrawal symptoms worsen with dehydration\n";
      planText += "- Try the 'pomodoro technique' with 25-minute work periods\n\n";
    }
    if (energyChallenges.includes("poor-sleep")) {
      planText += "## Sleep Quality Improvement 😴\n";
      planText += "- Establish a consistent bedtime routine\n";
      planText += "- Avoid screens 1 hour before bed\n";
      planText += "- Keep bedroom cool (65-68°F/18-20°C) and dark\n";
      planText += "- Try a warm bath with magnesium salts before bed\n\n";
    }
    if (energyChallenges.includes("brain-fog")) {
      planText += "## Brain Fog Remedies 🧠\n";
      planText += "- Take omega-3 supplements or eat fatty fish 2-3 times weekly\n";
      planText += "- Do 'box breathing' exercises when focus wanes\n";
      planText += "- Try 'brain dumps' - writing all thoughts on paper to clear mental space\n";
      planText += "- Use the 'two-minute rule' - if a task takes under 2 minutes, do it immediately\n\n";
    }
    if (energyChallenges.includes("stress-response")) {
      planText += "## New Stress Response Techniques 🧘\n";
      planText += "- Practice progressive muscle relaxation when cravings hit\n";
      planText += "- Keep a stress ball or fidget toy at hand\n";
      planText += "- Try alternate nostril breathing for 2 minutes\n";
      planText += "- Create a playlist of calming or energizing songs\n\n";
    }
    if (energyChallenges.includes("appetite-changes")) {
      planText += "## Energy Stabilization With New Appetite 🍎\n";
      planText += "- Eat smaller, more frequent meals (every 3-4 hours)\n";
      planText += "- Keep healthy snacks ready (cut vegetables, Greek yogurt, nuts)\n";
      planText += "- Focus on foods with low glycemic index to avoid crashes\n";
      planText += "- Start meals with protein rather than carbohydrates\n\n";
    }
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
    toast.success("Energy management plan generated", "Your personalized energy management plan is ready");
  };
  const saveUserEnergyPlan = async () => {
    if (!session?.user?.id) {
      toast.error("Sign in required", "Please sign in to save your energy plan");
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
          generated_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      }, session);
      toast.success("Plan saved", "Your energy management plan has been saved to your account");
    } catch (error) {
      console.error("Error saving energy plan:", error);
      toast.error("Error saving plan", "There was an error saving your plan. Please try again.");
    } finally {
      setIsSavingPlan(false);
    }
  };
  const generateMoodSupportPlan = () => {
    let planText = "# Your Personalized Mood Support Plan\n\n";
    planText += `## Current Mood Level: ${moodLevel}/10

`;
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
    if (moodTriggers.length > 0) {
      planText += "## Strategies For Your Specific Triggers:\n\n";
      if (moodTriggers.includes("withdrawal-irritability")) {
        planText += "### For Withdrawal Irritability:\n";
        planText += "- Practice 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8 seconds\n";
        planText += "- Use nicotine replacement therapy as prescribed to reduce physical symptoms\n";
        planText += "- Set a 'frustration timer' - wait 5 minutes before reacting when irritated\n";
        planText += "- Try progressive muscle relaxation when tension builds\n\n";
      }
      if (moodTriggers.includes("social-pressure")) {
        planText += "### For Social Pressure and Isolation:\n";
        planText += "- Prepare responses for when others offer cigarettes or question your quit\n";
        planText += "- Schedule regular check-ins with supportive friends who don't smoke\n";
        planText += "- Join our app's community forums for 10 minutes daily\n";
        planText += "- Consider temporarily avoiding high-risk social situations\n\n";
      }
      if (moodTriggers.includes("anxiety-increase")) {
        planText += "### For Increased Anxiety:\n";
        planText += "- Try the 'grounding technique': name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, 1 thing you taste\n";
        planText += "- Schedule brief 'worry periods' - set aside 10 minutes to address anxious thoughts\n";
        planText += "- Use guided meditations from our app's library\n";
        planText += "- Limit caffeine which can amplify anxiety during withdrawal\n\n";
      }
      if (moodTriggers.includes("routine-disruption")) {
        planText += "### For Routine Disruption:\n";
        planText += "- Create a new morning and evening routine with non-smoking activities\n";
        planText += "- Set alarms for former smoking times with alternative micro-activities\n";
        planText += "- Keep hands busy with a stress ball, fidget toy, or craft\n";
        planText += "- Create a 'smoke break' replacement ritual with tea or quick exercise\n\n";
      }
      if (moodTriggers.includes("guilt-setbacks")) {
        planText += "### For Guilt From Setbacks:\n";
        planText += "- Practice the 'setback protocol': log what happened without judgment\n";
        planText += "- Remember that 95% of successful quitters experienced setbacks\n";
        planText += "- Use our 'thought reframing' exercise for negative self-talk\n";
        planText += "- Return to your quit plan immediately without dwelling on lapses\n\n";
      }
      if (moodTriggers.includes("identity-shift")) {
        planText += "### For Identity Transition:\n";
        planText += "- Write about your evolving identity as a non-smoker\n";
        planText += "- List positive characteristics that smoking never defined\n";
        planText += "- Create a vision board of your smoke-free future self\n";
        planText += "- Join our 'Identity Shift' discussion group\n\n";
      }
      if (moodTriggers.includes("reward-loss")) {
        planText += "### For Reward System Restructuring:\n";
        planText += "- Create a list of 10 small, healthy rewards that take 5 minutes or less\n";
        planText += "- Develop a new reward schedule for accomplishments\n";
        planText += "- Start a savings jar with money not spent on cigarettes\n";
        planText += "- Use our app's achievement system to celebrate milestones\n\n";
      }
    }
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
    toast.success("Mood support plan generated", "Your personalized mood support plan is ready");
  };
  const saveUserMoodPlan = async () => {
    if (!session?.user?.id) {
      toast.error("Sign in required", "Please sign in to save your mood support plan");
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
          generated_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      }, session);
      toast.success("Plan saved", "Your mood support plan has been saved to your account");
    } catch (error) {
      console.error("Error saving mood plan:", error);
      toast.error("Error saving plan", "There was an error saving your plan. Please try again.");
    } finally {
      setIsSavingPlan(false);
    }
  };
  const generateFatigueManagementPlan = () => {
    let planText = "# Your Fatigue Management Plan\n\n";
    planText += `## Current Fatigue Level: ${fatigueLevel}/10

`;
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
    planText += "## Sleep Quality Recommendations:\n\n";
    if (sleepQuality === "poor") {
      planText += "### For Poor Sleep Quality:\n";
      planText += "- Create a strict sleep schedule, even on weekends\n";
      planText += "- Remove all screens from bedroom and stop screen time 1 hour before bed\n";
      planText += "- Try our 'Sleep Reset Protocol' for 3 consecutive nights\n";
      planText += "- Consider temporary sleep aids as discussed with your healthcare provider\n";
      planText += "- Create a cool (65-68°F/18-20°C), dark, and quiet sleep environment\n\n";
    } else if (sleepQuality === "average") {
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
    if (fatigueSources.length > 0) {
      planText += "## Strategies For Your Specific Fatigue Sources:\n\n";
      if (fatigueSources.includes("withdrawal-fatigue")) {
        planText += "### For Physical Withdrawal Fatigue:\n";
        planText += "- Ensure adequate hydration (at least 8 glasses of water daily)\n";
        planText += "- Consider B-complex vitamins after consulting with your healthcare provider\n";
        planText += "- Try 5-10 minute microbursts of activity when energy is lowest\n";
        planText += "- Remember this is temporary and typically improves after 2-3 weeks\n\n";
      }
      if (fatigueSources.includes("sleep-disruption")) {
        planText += "### For Sleep Pattern Disruption:\n";
        planText += "- Implement a consistent wake-up time, even after poor sleep nights\n";
        planText += "- Use our 'Sleep Restoration' audio program before bed\n";
        planText += "- Try a 15-20 minute afternoon nap (but not after 3pm)\n";
        planText += "- Create a pre-sleep ritual to signal your body to prepare for rest\n\n";
      }
      if (fatigueSources.includes("mental-exertion")) {
        planText += "### For Mental Effort of Craving Resistance:\n";
        planText += "- Practice the 'mental offloading' technique: write down thoughts to clear mind\n";
        planText += "- Schedule 'decision-free' periods during the day\n";
        planText += "- Try alternate nostril breathing to balance mental energy\n";
        planText += "- Use our guided visualization for mental restoration\n\n";
      }
      if (fatigueSources.includes("stress-response")) {
        planText += "### For New Stress Response Systems:\n";
        planText += "- Practice the STOP technique: Stop, Take a breath, Observe, Proceed\n";
        planText += "- Try guided progressive muscle relaxation\n";
        planText += "- Create a list of 5-minute calming activities for stress spikes\n";
        planText += "- Consider adaptogens after consulting with your healthcare provider\n\n";
      }
      if (fatigueSources.includes("energy-metabolism")) {
        planText += "### For Metabolic Energy Changes:\n";
        planText += "- Eat small, frequent meals with balanced macronutrients\n";
        planText += "- Prioritize protein at breakfast to stabilize energy\n";
        planText += "- Consider chromium supplements (consult healthcare provider)\n";
        planText += "- Monitor blood sugar fluctuations with our tracking tool\n\n";
      }
      if (fatigueSources.includes("appetite-changes")) {
        planText += "### For Appetite and Digestion Changes:\n";
        planText += "- Keep high-protein, low-glycemic index snacks available\n";
        planText += "- Eat fiber-rich foods to stabilize digestion and energy\n";
        planText += "- Try our 'hunger vs. craving' assessment tool\n";
        planText += "- Chew sugar-free gum to manage oral fixation without excess calories\n\n";
      }
      if (fatigueSources.includes("emotional-drain")) {
        planText += "### For Emotional Processing Fatigue:\n";
        planText += "- Schedule specific 'emotion processing' times rather than constant monitoring\n";
        planText += "- Try journaling with our prompted templates\n";
        planText += "- Practice self-compassion meditation\n";
        planText += "- Consider our 'emotional resilience' program\n\n";
      }
    }
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
    toast.success("Fatigue management plan generated", "Your personalized fatigue management plan is ready");
  };
  const saveUserFatiguePlan = async () => {
    if (!session?.user?.id) {
      toast.error("Sign in required", "Please sign in to save your fatigue management plan");
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
          generated_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      }, session);
      toast.success("Plan saved", "Your fatigue management plan has been saved to your account");
    } catch (error) {
      console.error("Error saving fatigue plan:", error);
      toast.error("Error saving plan", "There was an error saving your plan. Please try again.");
    } finally {
      setIsSavingPlan(false);
    }
  };
  const renderEnergyPlanActions = () => {
    if (!energyScheduleGenerated)
      return null;
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 flex justify-end space-x-3", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: "outline",
          onClick: () => {
            setEnergyPlan("");
            setEnergyScheduleGenerated(false);
          },
          children: "Reset"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 590,
          columnNumber: 9
        },
        globalThis
      ),
      session?.user?.id && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          onClick: saveUserEnergyPlan,
          disabled: isSavingPlan,
          children: isSavingPlan ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 606,
              columnNumber: 17
            }, globalThis),
            "Saving..."
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 605,
            columnNumber: 15
          }, globalThis) : "Save Plan"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 600,
          columnNumber: 11
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
      lineNumber: 589,
      columnNumber: 7
    }, globalThis);
  };
  const renderMoodPlanActions = () => {
    if (!moodSupportGenerated)
      return null;
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 flex justify-end space-x-3", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: "outline",
          onClick: () => {
            setMoodPlan("");
            setMoodSupportGenerated(false);
          },
          children: "Reset"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 624,
          columnNumber: 9
        },
        globalThis
      ),
      session?.user?.id && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          onClick: saveUserMoodPlan,
          disabled: isSavingPlan,
          children: isSavingPlan ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 640,
              columnNumber: 17
            }, globalThis),
            "Saving..."
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 639,
            columnNumber: 15
          }, globalThis) : "Save Plan"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 634,
          columnNumber: 11
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
      lineNumber: 623,
      columnNumber: 7
    }, globalThis);
  };
  const renderFatiguePlanActions = () => {
    if (!fatigueManagementGenerated)
      return null;
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 flex justify-end space-x-3", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          variant: "outline",
          onClick: () => {
            setFatiguePlan("");
            setFatigueManagementGenerated(false);
          },
          children: "Reset"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 658,
          columnNumber: 9
        },
        globalThis
      ),
      session?.user?.id && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Button,
        {
          onClick: saveUserFatiguePlan,
          disabled: isSavingPlan,
          children: isSavingPlan ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 674,
              columnNumber: 17
            }, globalThis),
            "Saving..."
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 673,
            columnNumber: 15
          }, globalThis) : "Save Plan"
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 668,
          columnNumber: 11
        },
        globalThis
      )
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
      lineNumber: 657,
      columnNumber: 7
    }, globalThis);
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Wellness Tools" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 690,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Tools to optimize your health and energy during your quit smoking journey" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 691,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
      lineNumber: 689,
      columnNumber: 9
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { defaultValue: "energy-management", className: "w-full", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "grid w-full grid-cols-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "energy-management", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-4 w-4 mr-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 699,
            columnNumber: 17
          }, globalThis),
          "Energy"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 698,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "mood-support", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "h-4 w-4 mr-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 703,
            columnNumber: 17
          }, globalThis),
          "Mood"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 702,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "fatigue-management", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Battery, { className: "h-4 w-4 mr-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 707,
            columnNumber: 17
          }, globalThis),
          "Fatigue"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 706,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "meal-planner", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Utensils, { className: "h-4 w-4 mr-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 711,
            columnNumber: 17
          }, globalThis),
          "Meals"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 710,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "bmi-calculator", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Dumbbell, { className: "h-4 w-4 mr-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 715,
            columnNumber: 17
          }, globalThis),
          "BMI"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 714,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "water-intake", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Droplet, { className: "h-4 w-4 mr-2" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 719,
            columnNumber: 17
          }, globalThis),
          "Water"
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 718,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 697,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "energy-management", className: "space-y-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Energy Management During Quitting" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 728,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Create a personalized energy management plan to help combat fatigue and maintain focus during your quit smoking journey" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 729,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 727,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { className: "text-base", children: "Select your energy challenges" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 735,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Choose all the energy issues you're experiencing while quitting" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 736,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-3", children: energyChallengeOptions.map((option) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Checkbox,
                  {
                    id: option.id,
                    checked: energyChallenges.includes(option.id),
                    onCheckedChange: (checked) => {
                      if (checked) {
                        setEnergyChallenges([...energyChallenges, option.id]);
                      } else {
                        setEnergyChallenges(energyChallenges.filter((id) => id !== option.id));
                      }
                    }
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 740,
                    columnNumber: 27
                  },
                  globalThis
                ),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  "label",
                  {
                    htmlFor: option.id,
                    className: "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    children: option.label
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 751,
                    columnNumber: 27
                  },
                  globalThis
                )
              ] }, option.id, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 739,
                columnNumber: 25
              }, globalThis)) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 737,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 734,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Coffee, { className: "h-4 w-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 764,
                  columnNumber: 23
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Daily Caffeine Intake" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 765,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 763,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-4", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Slider,
                  {
                    value: [caffeineIntake],
                    min: 0,
                    max: 6,
                    step: 1,
                    onValueChange: (value) => setCaffeineIntake(value[0])
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 768,
                    columnNumber: 23
                  },
                  globalThis
                ),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "w-12 text-sm font-medium", children: [
                  caffeineIntake,
                  " ",
                  caffeineIntake === 1 ? "cup" : "cups"
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 775,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 767,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "None" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 778,
                  columnNumber: 23
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Moderate" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 779,
                  columnNumber: 23
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "High" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 780,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 777,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 762,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { className: "w-full", onClick: generateEnergyPlan, children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Battery, { className: "h-4 w-4 mr-2" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 785,
                columnNumber: 21
              }, globalThis),
              "Generate Energy Management Plan"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 784,
              columnNumber: 19
            }, globalThis),
            energyScheduleGenerated && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3 mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Your Personalized Energy Management Plan" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 791,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-muted p-4 rounded-md", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "prose prose-sm max-w-none", children: energyPlan.split("\n").map((line, index) => {
                if (line.startsWith("# ")) {
                  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-xl font-bold mt-0 mb-3", children: line.replace("# ", "") }, index, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 796,
                    columnNumber: 38
                  }, globalThis);
                } else if (line.startsWith("## ")) {
                  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-semibold mt-4 mb-2", children: line.replace("## ", "") }, index, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 798,
                    columnNumber: 38
                  }, globalThis);
                } else if (line.startsWith("- ")) {
                  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { className: "ml-5", children: line.replace("- ", "") }, index, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 800,
                    columnNumber: 38
                  }, globalThis);
                } else if (line === "") {
                  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("br", {}, index, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 802,
                    columnNumber: 38
                  }, globalThis);
                } else {
                  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "my-2", children: line }, index, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 804,
                    columnNumber: 38
                  }, globalThis);
                }
              }) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 793,
                columnNumber: 25
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 792,
                columnNumber: 23
              }, globalThis),
              renderEnergyPlanActions()
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 790,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 733,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 726,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Energy FAQ During Quitting" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 817,
            columnNumber: 19
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 816,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleArrowDown, { className: "h-4 w-4 text-amber-500 mr-2" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 823,
                  columnNumber: 25
                }, globalThis),
                "Why am I so tired after quitting smoking?"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 822,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground mt-1", children: "Nicotine is a stimulant that affects brain chemistry. Your body is adjusting to functioning without it, which can cause temporary fatigue. Most people see energy improvements after 2-4 weeks." }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 826,
                columnNumber: 23
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 821,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleArrowUp, { className: "h-4 w-4 text-green-500 mr-2" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 834,
                  columnNumber: 25
                }, globalThis),
                "Will my energy ever improve?"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 833,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground mt-1", children: "Yes! As your body heals, oxygen transport improves, inflammation decreases, and sleep quality gets better. Most ex-smokers report significantly higher energy levels after the initial withdrawal period." }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 837,
                columnNumber: 23
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 832,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Coffee, { className: "h-4 w-4 text-brown-500 mr-2" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 845,
                  columnNumber: 25
                }, globalThis),
                "Should I drink more coffee to combat fatigue?"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 844,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground mt-1", children: "Be cautious with caffeine during quitting. Nicotine affects how quickly your body processes caffeine, so the same amount may now have stronger effects. Excessive caffeine can worsen anxiety and sleep problems." }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 848,
                columnNumber: 23
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 843,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-4 w-4 text-yellow-500 mr-2" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 856,
                  columnNumber: 25
                }, globalThis),
                "What's the fastest way to boost energy naturally?"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 855,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground mt-1", children: "Physical activity is the most effective natural energy booster. Even a 10-minute walk increases oxygen flow and releases endorphins. Stay hydrated, maintain regular eating patterns, and prioritize quality sleep." }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 859,
                columnNumber: 23
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 854,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 820,
            columnNumber: 19
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 819,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 815,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 725,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "meal-planner", className: "space-y-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Weekly Meal Planner" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 873,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Generate a personalized meal plan based on your preferences and nutritional needs." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 874,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 872,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Daily Calorie Target" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 880,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-4", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Slider,
                  {
                    value: [calories],
                    min: 1200,
                    max: 3500,
                    step: 50,
                    onValueChange: (value) => setCalories(value[0])
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 882,
                    columnNumber: 23
                  },
                  globalThis
                ),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "w-12 text-sm font-medium", children: calories }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 889,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 881,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 879,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Diet Type" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 894,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Select, { value: dietType, onValueChange: setDietType, children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Select a diet type" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 897,
                  columnNumber: 25
                }, globalThis) }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 896,
                  columnNumber: 23
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "balanced", children: "Balanced" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 900,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "low-carb", children: "Low Carb" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 901,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "high-protein", children: "High Protein" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 902,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "keto", children: "Ketogenic" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 903,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "vegetarian", children: "Vegetarian" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 904,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "vegan", children: "Vegan" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 905,
                    columnNumber: 25
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 899,
                  columnNumber: 23
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 895,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 893,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Dietary Restrictions" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 911,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: ["Gluten-Free", "Dairy-Free", "Nut-Free", "Shellfish-Free", "Soy-Free", "Egg-Free"].map((restriction) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Switch,
                  {
                    checked: restrictions.includes(restriction),
                    onCheckedChange: (checked) => {
                      if (checked) {
                        setRestrictions([...restrictions, restriction]);
                      } else {
                        setRestrictions(restrictions.filter((r) => r !== restriction));
                      }
                    }
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 915,
                    columnNumber: 27
                  },
                  globalThis
                ),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: restriction }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 925,
                  columnNumber: 27
                }, globalThis)
              ] }, restriction, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 914,
                columnNumber: 25
              }, globalThis)) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 912,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 910,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { className: "w-full", onClick: generateMealPlan, children: "Generate Meal Plan" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 931,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 878,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 871,
          columnNumber: 15
        }, globalThis),
        mealPlanGenerated && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Your 7-Day Meal Plan" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 940,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: [
              "Based on ",
              calories,
              " calories per day, ",
              dietType,
              " diet",
              restrictions.length > 0 ? `, ${restrictions.join(", ")} free` : ""
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 941,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 939,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "border-b pb-3 last:border-b-0 last:pb-0", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-semibold text-lg mb-2", children: day }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 950,
              columnNumber: 27
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-3 bg-muted rounded-md", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: "Breakfast" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 953,
                  columnNumber: 31
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Overnight oats with berries and almonds" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 954,
                  columnNumber: 31
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 952,
                columnNumber: 29
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-3 bg-muted rounded-md", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: "Lunch" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 959,
                  columnNumber: 31
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Grilled chicken salad with quinoa" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 960,
                  columnNumber: 31
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 958,
                columnNumber: 29
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "p-3 bg-muted rounded-md", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "font-medium", children: "Dinner" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 965,
                  columnNumber: 31
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Baked salmon with roasted vegetables" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 966,
                  columnNumber: 31
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 964,
                columnNumber: 29
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 951,
              columnNumber: 27
            }, globalThis)
          ] }, day, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 949,
            columnNumber: 25
          }, globalThis)) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 947,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 946,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 938,
          columnNumber: 17
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 870,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "bmi-calculator", className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "BMI Calculator" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 983,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Calculate your Body Mass Index (BMI) to assess if your weight is in a healthy range." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 984,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 982,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "height", children: "Height (cm)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 990,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "height",
                type: "number",
                placeholder: "e.g., 175",
                value: height,
                onChange: (e) => setHeight(e.target.value)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 991,
                columnNumber: 21
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 989,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "weight", children: "Weight (kg)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1001,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "weight",
                type: "number",
                placeholder: "e.g., 70",
                value: weight,
                onChange: (e) => setWeight(e.target.value)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1002,
                columnNumber: 21
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1e3,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { className: "w-full", onClick: calculateBMI, children: "Calculate BMI" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1011,
            columnNumber: 19
          }, globalThis),
          bmiResult !== null && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 p-4 bg-muted rounded-md", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-2xl font-bold", children: bmiResult }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1018,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: `text-lg font-medium ${bmiCategory === "Normal weight" ? "text-green-500" : "text-amber-500"}`, children: bmiCategory }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1019,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1017,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-2 w-full bg-gray-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                "div",
                {
                  className: "h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500",
                  style: {
                    width: "100%"
                  }
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1027,
                  columnNumber: 27
                },
                globalThis
              ) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1026,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between text-xs mt-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Underweight" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1035,
                  columnNumber: 27
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Normal" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1036,
                  columnNumber: 27
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Overweight" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1037,
                  columnNumber: 27
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: "Obese" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1038,
                  columnNumber: 27
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1034,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1025,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 text-sm", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("strong", { children: "BMI Categories:" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1042,
                columnNumber: 28
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1042,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "list-disc pl-5 space-y-1", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Underweight: BMI less than 18.5" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1044,
                  columnNumber: 27
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Normal weight: BMI 18.5 to 24.9" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1045,
                  columnNumber: 27
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Overweight: BMI 25 to 29.9" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1046,
                  columnNumber: 27
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Obesity: BMI 30 or greater" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1047,
                  columnNumber: 27
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1043,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mt-2 text-muted-foreground", children: "Note: BMI is a screening tool, not a diagnostic tool. Consult with a healthcare provider for a complete health assessment." }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1049,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1041,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1016,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 988,
          columnNumber: 17
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 981,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 980,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "water-intake", className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Daily Water Intake Calculator" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1063,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Calculate how much water you should drink each day based on your weight and activity level." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1064,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 1062,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "weightForWater", children: "Weight (kg)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1070,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "weightForWater",
                type: "number",
                placeholder: "e.g., 70",
                value: weightForWater,
                onChange: (e) => setWeightForWater(e.target.value)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1071,
                columnNumber: 21
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1069,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Activity Level" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1081,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Select, { value: activityLevel, onValueChange: setActivityLevel, children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Select activity level" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1084,
                columnNumber: 25
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1083,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "sedentary", children: "Sedentary (little or no exercise)" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1087,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "moderate", children: "Moderate (exercise 3-5 days/week)" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1088,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "very active", children: "Very Active (exercise 6-7 days/week)" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1089,
                  columnNumber: 25
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1086,
                columnNumber: 23
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1082,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1080,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Climate" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1095,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Select, { value: climate, onValueChange: setClimate, children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Select climate" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1098,
                columnNumber: 25
              }, globalThis) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1097,
                columnNumber: 23
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "temperate", children: "Temperate/Moderate" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1101,
                  columnNumber: 25
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "hot", children: "Hot/Humid" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1102,
                  columnNumber: 25
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1100,
                columnNumber: 23
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1096,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1094,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { className: "w-full", onClick: calculateWaterIntake, children: "Calculate Water Needs" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1107,
            columnNumber: 19
          }, globalThis),
          waterRecommendation !== null && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 p-4 bg-muted rounded-md", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm font-medium", children: "Recommended Daily Water Intake" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1114,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-2xl font-bold mt-1", children: [
                waterRecommendation,
                " ml"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1115,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-md font-medium mt-1", children: [
                "(",
                (waterRecommendation / 1e3).toFixed(1),
                " liters)"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1116,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-3 flex items-center justify-center space-x-1", children: Array.from({ length: Math.ceil(waterRecommendation / 250) }).map((_, i) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                "div",
                {
                  className: "w-4 h-12 bg-blue-400 rounded-sm",
                  style: {
                    opacity: i < Math.floor(waterRecommendation / 250) ? 1 : 0.5
                  }
                },
                i,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1119,
                  columnNumber: 29
                },
                globalThis
              )) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1117,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "mt-2 text-sm text-muted-foreground", children: [
                "That's about ",
                Math.ceil(waterRecommendation / 250),
                " glasses (250ml each)"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1128,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1113,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 text-sm", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-muted-foreground", children: "This is a general recommendation. Factors like health conditions, pregnancy, and breastfeeding may affect your water needs. Always consult with a healthcare provider for personalized advice." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1133,
              columnNumber: 25
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1132,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1112,
            columnNumber: 21
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 1068,
          columnNumber: 17
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 1061,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 1060,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "mood-support", className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Mood Support During Quitting" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1147,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Create a personalized mood management plan to help maintain emotional balance during your quit journey" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1148,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 1146,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Current Mood Level (1-10)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1155,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-4 mt-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Frown, { className: "h-5 w-5 text-destructive" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1157,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Slider,
                {
                  value: [moodLevel],
                  onValueChange: (value) => setMoodLevel(value[0]),
                  min: 1,
                  max: 10,
                  step: 1,
                  className: "flex-1"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1158,
                  columnNumber: 25
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Smile, { className: "h-5 w-5 text-primary" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1166,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1156,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground mt-1 text-center", children: moodLevel < 4 ? "Low mood - Be gentle with yourself" : moodLevel < 7 ? "Moderate mood - Building stability" : "Positive mood - Great time to build resources" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1168,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1154,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "What's affecting your mood during quitting? (Select all that apply)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1176,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 gap-2", children: moodTriggerOptions.map((option) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Checkbox,
                {
                  id: option.id,
                  checked: moodTriggers.includes(option.id),
                  onCheckedChange: (checked) => {
                    if (checked) {
                      setMoodTriggers([...moodTriggers, option.id]);
                    } else {
                      setMoodTriggers(moodTriggers.filter((id) => id !== option.id));
                    }
                  }
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1180,
                  columnNumber: 29
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: option.id, className: "text-sm", children: option.label }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1191,
                columnNumber: 29
              }, globalThis)
            ] }, option.id, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1179,
              columnNumber: 27
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1177,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1175,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "pt-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: generateMoodSupportPlan, className: "w-full", children: "Generate Mood Support Plan" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1200,
            columnNumber: 23
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1199,
            columnNumber: 21
          }, globalThis),
          moodSupportGenerated && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "pt-4 space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "border rounded-md p-4 bg-secondary/10", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "prose prose-stone dark:prose-invert max-w-none", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "font-medium text-lg mb-2", children: "Your Personalized Mood Support Plan" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1209,
                columnNumber: 29
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "whitespace-pre-wrap text-sm", children: moodPlan }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1210,
                columnNumber: 29
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1208,
              columnNumber: 27
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1207,
              columnNumber: 25
            }, globalThis),
            renderMoodPlanActions()
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1206,
            columnNumber: 23
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 1153,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 1152,
          columnNumber: 17
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 1145,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 1144,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "fatigue-management", className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Fatigue Management During Quitting" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1227,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Create a personalized plan to manage fatigue and maintain energy during your quit smoking journey" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1228,
            columnNumber: 19
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 1226,
          columnNumber: 17
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Current Fatigue Level (1-10)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1235,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-4 mt-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Battery, { className: "h-5 w-5 text-primary" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1237,
                columnNumber: 25
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Slider,
                {
                  value: [fatigueLevel],
                  onValueChange: (value) => setFatigueLevel(value[0]),
                  min: 1,
                  max: 10,
                  step: 1,
                  className: "flex-1"
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1238,
                  columnNumber: 25
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Battery, { className: "h-5 w-5 text-destructive" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1246,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1236,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-muted-foreground mt-1 text-center", children: fatigueLevel < 4 ? "Low fatigue - Good energy levels" : fatigueLevel < 7 ? "Moderate fatigue - Energy conservation needed" : "High fatigue - Prioritize rest and recovery" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1248,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1234,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Sleep Quality" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1256,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              RadioGroup,
              {
                value: sleepQuality,
                onValueChange: setSleepQuality,
                className: "flex space-x-4",
                children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "poor", id: "poor" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                      lineNumber: 1263,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: "poor", className: "text-sm", children: "Poor" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                      lineNumber: 1264,
                      columnNumber: 27
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 1262,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "average", id: "average" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                      lineNumber: 1267,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: "average", className: "text-sm", children: "Average" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                      lineNumber: 1268,
                      columnNumber: 27
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 1266,
                    columnNumber: 25
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "good", id: "good" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                      lineNumber: 1271,
                      columnNumber: 27
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: "good", className: "text-sm", children: "Good" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                      lineNumber: 1272,
                      columnNumber: 27
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                    lineNumber: 1270,
                    columnNumber: 25
                  }, globalThis)
                ]
              },
              void 0,
              true,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1257,
                columnNumber: 23
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1255,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "What's contributing to your fatigue? (Select all that apply)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1278,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 gap-2", children: fatigueSourceOptions.map((option) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Checkbox,
                {
                  id: option.id,
                  checked: fatigueSources.includes(option.id),
                  onCheckedChange: (checked) => {
                    if (checked) {
                      setFatigueSources([...fatigueSources, option.id]);
                    } else {
                      setFatigueSources(fatigueSources.filter((id) => id !== option.id));
                    }
                  }
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                  lineNumber: 1282,
                  columnNumber: 29
                },
                globalThis
              ),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("label", { htmlFor: option.id, className: "text-sm", children: option.label }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1293,
                columnNumber: 29
              }, globalThis)
            ] }, option.id, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1281,
              columnNumber: 27
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1279,
              columnNumber: 23
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1277,
            columnNumber: 21
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "pt-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: generateFatigueManagementPlan, className: "w-full", children: "Generate Fatigue Management Plan" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1302,
            columnNumber: 23
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1301,
            columnNumber: 21
          }, globalThis),
          fatigueManagementGenerated && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "pt-4 space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "border rounded-md p-4 bg-secondary/10", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "prose prose-stone dark:prose-invert max-w-none", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "font-medium text-lg mb-2", children: "Your Fatigue Management Plan" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1311,
                columnNumber: 29
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "whitespace-pre-wrap text-sm", children: fatiguePlan }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
                lineNumber: 1312,
                columnNumber: 29
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1310,
              columnNumber: 27
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
              lineNumber: 1309,
              columnNumber: 25
            }, globalThis),
            renderFatiguePlanActions()
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
            lineNumber: 1308,
            columnNumber: 23
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 1233,
          columnNumber: 19
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
          lineNumber: 1232,
          columnNumber: 17
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 1225,
        columnNumber: 15
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
        lineNumber: 1224,
        columnNumber: 13
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
      lineNumber: 696,
      columnNumber: 11
    }, globalThis) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
      lineNumber: 695,
      columnNumber: 9
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
    lineNumber: 688,
    columnNumber: 7
  }, globalThis) }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/WebTools.tsx",
    lineNumber: 687,
    columnNumber: 5
  }, globalThis);
};

export { WebTools };
