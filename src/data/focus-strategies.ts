import { v4 as uuidv4 } from 'uuid';

export interface FocusStrategy {
  id: string;
  name: string;
  description: string;
  instructions: string;
  benefits: string[];
  category: string;
  tags: string[];
  difficulty: number;
  time_requirement: string;
  effectiveness_score?: number;
  user_rating?: number;
  times_used?: number;
  image_url?: string;
  scientific_backing?: string;
  adhd_specific: boolean;
}

export const STRATEGY_CATEGORIES = [
  "Time Management",
  "Distraction Control",
  "Energy Optimization",
  "Deep Work",
  "ADHD Specific",
  "Cognitive Enhancement",
  "Environment Setup",
  "Digital Focus",
  "Motivation"
];

export const FOCUS_STRATEGIES: FocusStrategy[] = [
  {
    id: uuidv4(),
    name: "Pomodoro Technique",
    description: "Work in focused sprints with short breaks to maintain energy and attention",
    instructions: "Set a timer for 25 minutes and work with full focus. When the timer rings, take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.",
    benefits: [
      "Prevents burnout with regular breaks",
      "Creates a sense of urgency to improve focus",
      "Makes large tasks more manageable",
      "Provides clear metrics for productivity",
      "Reduces decision fatigue"
    ],
    category: "Time Management",
    tags: ["time-boxing", "productivity", "focus", "breaks", "beginner-friendly"],
    difficulty: 1,
    time_requirement: "25 min work + 5 min break",
    scientific_backing: "Research shows that short breaks improve focus and prevent mental fatigue. The Pomodoro Technique leverages this principle with structured work/break cycles.",
    adhd_specific: true
  },
  {
    id: uuidv4(),
    name: "Deep Work Sessions",
    description: "Extended periods of distraction-free, high-concentration work on cognitively demanding tasks",
    instructions: "Schedule 1-4 hour blocks of time free from all distractions. Set clear goals for each session. Eliminate all digital notifications and create a dedicated space for deep work.",
    benefits: [
      "Produces high-quality work output",
      "Trains your focus muscle over time",
      "Achieves significant progress on complex projects",
      "Increases professional satisfaction",
      "Reduces context switching costs"
    ],
    category: "Deep Work",
    tags: ["concentration", "flow-state", "cognitive-performance", "advanced"],
    difficulty: 4,
    time_requirement: "1-4 hours per session",
    scientific_backing: "Neuroscience research indicates that deep concentration without interruptions leads to stronger neural connections and higher-quality work outputs.",
    adhd_specific: false
  },
  {
    id: uuidv4(),
    name: "Dopamine Scheduling",
    description: "Strategic timing of rewards and challenges to optimize motivation and focus for ADHD brains",
    instructions: "Identify high-dopamine activities and low-dopamine tasks. Schedule your most challenging work right after a natural dopamine boost (like exercise or music). Break work into small chunks with small rewards after each accomplishment.",
    benefits: [
      "Works with your brain's natural chemistry",
      "Reduces procrastination on difficult tasks",
      "Increases motivation and enjoyment of work",
      "Creates sustainable productivity patterns",
      "Reduces reliance on external stimulation"
    ],
    category: "ADHD Specific",
    tags: ["motivation", "reward-system", "adhd", "brain-chemistry", "procrastination"],
    difficulty: 3,
    time_requirement: "Flexible implementation",
    scientific_backing: "ADHD is associated with differences in dopamine regulation. Strategic dopamine management can help compensate for these differences by timing tasks to align with natural dopamine fluctuations.",
    adhd_specific: true
  },
  {
    id: uuidv4(),
    name: "Body Doubling",
    description: "Working alongside another person to increase accountability and focus",
    instructions: "Arrange to work in the presence of another person, either physically or virtually. Both people work on their own tasks, but the presence of the other creates accountability. Schedule regular check-ins if needed.",
    benefits: [
      "Creates external accountability",
      "Reduces procrastination",
      "Provides social motivation",
      "Helps initiate difficult tasks",
      "Works well for ADHD brains"
    ],
    category: "ADHD Specific",
    tags: ["accountability", "social", "procrastination", "task-initiation"],
    difficulty: 1,
    time_requirement: "Any duration",
    scientific_backing: "Social accountability has been shown to significantly improve task completion and focus in individuals with ADHD, functioning as a form of external executive function support.",
    adhd_specific: true
  },
  {
    id: uuidv4(),
    name: "Mindful Focus Meditation",
    description: "Training your attention through short meditation practices that improve focus capacity",
    instructions: "Sit comfortably and focus on your breath for 5-10 minutes. When your mind wanders (it will), gently bring it back to your breath without judgment. Practice daily, gradually extending the duration as your focus improves.",
    benefits: [
      "Strengthens attention networks in the brain",
      "Improves recovery from distractions",
      "Reduces mental fatigue",
      "Increases awareness of attention patterns",
      "Reduces stress and anxiety"
    ],
    category: "Cognitive Enhancement",
    tags: ["meditation", "mindfulness", "attention-training", "mental-fitness"],
    difficulty: 3,
    time_requirement: "5-20 minutes daily",
    scientific_backing: "Neuroimaging studies show that regular mindfulness meditation strengthens connections in the prefrontal cortex and other brain regions associated with focus and attention control.",
    adhd_specific: false
  },
  {
    id: uuidv4(),
    name: "Task Batching",
    description: "Grouping similar tasks together to reduce context switching and optimize mental energy",
    instructions: "Group similar tasks that use the same mental resources (e.g., emails, phone calls, creative work). Schedule specific time blocks for each batch of tasks. Complete one batch before moving to the next.",
    benefits: [
      "Minimizes mental transition costs",
      "Optimizes workflow efficiency",
      "Reduces decision fatigue",
      "Creates momentum for similar tasks",
      "Maximizes limited attention resources"
    ],
    category: "Time Management",
    tags: ["productivity", "efficiency", "context-switching", "organization"],
    difficulty: 2,
    time_requirement: "30-90 minutes per batch",
    scientific_backing: "Research on attention residue shows that switching between different types of tasks can reduce productivity by up to 40%. Batching minimizes these transition costs.",
    adhd_specific: false
  },
  {
    id: uuidv4(),
    name: "Digital Minimalism",
    description: "Systematically reducing digital distractions to create space for sustained focus",
    instructions: "Conduct a digital declutter for 30 days: uninstall non-essential apps, unsubscribe from distracting content, and set up barriers to digital temptations. After 30 days, reintroduce technology selectively based on core values.",
    benefits: [
      "Eliminates constant attention triggers",
      "Reduces compulsive checking behavior",
      "Creates mental space for deep work",
      "Improves relationship with technology",
      "Increases present-moment awareness"
    ],
    category: "Distraction Control",
    tags: ["digital-detox", "technology", "minimalism", "attention-management"],
    difficulty: 4,
    time_requirement: "30-day initial process",
    scientific_backing: "Studies show that merely having smartphones visible reduces cognitive capacity, and notifications significantly disrupt focus even when ignored. Digital minimalism addresses these attention drains.",
    adhd_specific: false
  },
  {
    id: uuidv4(),
    name: "Time Blocking",
    description: "Scheduling specific activities for defined time periods to ensure important work gets done",
    instructions: "At the beginning of each day or week, divide your calendar into blocks dedicated to specific tasks or types of work. Include blocks for reactive work (like email) as well as proactive work. Defend these time blocks as you would appointments.",
    benefits: [
      "Ensures time for important but not urgent work",
      "Creates clear intentions for each part of your day",
      "Reduces decision fatigue about what to work on",
      "Makes time use visible and intentional",
      "Helps establish work/life boundaries"
    ],
    category: "Time Management",
    tags: ["calendar", "scheduling", "prioritization", "time-management"],
    difficulty: 3,
    time_requirement: "15 min planning + full day execution",
    scientific_backing: "Implementation intentions (specific plans for when and where to perform an action) have been shown to significantly increase follow-through on intentions. Time blocking formalizes this process.",
    adhd_specific: false
  },
  {
    id: uuidv4(),
    name: "Energy Mapping",
    description: "Aligning your most important work with your natural energy patterns throughout the day",
    instructions: "Track your energy and focus levels hourly for one week. Identify your peak mental energy periods and energy slumps. Schedule your most challenging, high-focus work during peak periods and easier, administrative tasks during low-energy times.",
    benefits: [
      "Works with your biology instead of against it",
      "Maximizes productivity during peak hours",
      "Reduces frustration during low-energy periods",
      "Creates sustainable daily rhythms",
      "Personalizes productivity to your unique patterns"
    ],
    category: "Energy Optimization",
    tags: ["chronobiology", "energy-management", "personalization", "self-awareness"],
    difficulty: 2,
    time_requirement: "1 week tracking + ongoing application",
    scientific_backing: "Chronobiology research confirms that cognitive abilities fluctuate predictably throughout the day, with most people having 2-3 hours of peak cognitive function. Aligning work with these patterns improves performance.",
    adhd_specific: true
  },
  {
    id: uuidv4(),
    name: "Implementation Intentions",
    description: "Creating specific if-then plans to overcome specific focus challenges",
    instructions: "Identify specific situations that typically derail your focus (e.g., social media temptation). Create clear if-then plans: 'If [specific trigger happens], then I will [specific focused response].' Write these plans down and review regularly.",
    benefits: [
      "Creates automatic responses to focus challenges",
      "Reduces decision-making during vulnerable moments",
      "Builds new habits more effectively",
      "Addresses specific personal focus weaknesses",
      "Provides clear strategy for common challenges"
    ],
    category: "Distraction Control",
    tags: ["habit-formation", "planning", "psychology", "behavior-change"],
    difficulty: 2,
    time_requirement: "15-30 minutes setup + ongoing application",
    scientific_backing: "Research shows implementation intentions can double or triple the likelihood of following through on intentions by creating mental associations between specific situations and desired behaviors.",
    adhd_specific: true
  },
  {
    id: uuidv4(),
    name: "Binaural Beats",
    description: "Using specific audio frequencies to entrain brainwaves into focused states",
    instructions: "Use stereo headphones to listen to specially designed binaural beats audio in the 12-30 Hz (Beta) range for focus. Start with 15-30 minute sessions during focused work. Adjust volume to be present but not distracting.",
    benefits: [
      "Creates an audio environment conducive to focus",
      "May help entrain brainwaves to focus-supporting patterns",
      "Blocks distracting ambient noise",
      "Provides consistent audio background for focus",
      "No effort required once started"
    ],
    category: "Cognitive Enhancement",
    tags: ["audio", "brainwaves", "neuroscience", "background", "music-alternative"],
    difficulty: 1,
    time_requirement: "15-60 minutes per session",
    scientific_backing: "Some studies suggest binaural beats can influence brainwave activity, potentially enhancing focus and concentration by increasing beta wave activity associated with alert focus.",
    adhd_specific: false
  },
  {
    id: uuidv4(),
    name: "The 2-Minute Rule",
    description: "Immediately completing any task that would take less than two minutes",
    instructions: "When you encounter a new task, quickly assess if it would take less than two minutes to complete. If yes, do it immediately rather than scheduling it for later or adding it to your task list.",
    benefits: [
      "Prevents small tasks from accumulating",
      "Reduces cognitive load from task backlogs",
      "Creates momentum and sense of accomplishment",
      "Eliminates the overhead of tracking small tasks",
      "Keeps your workspace and mind clearer"
    ],
    category: "Time Management",
    tags: ["productivity", "efficiency", "quick-wins", "task-management", "beginner-friendly"],
    difficulty: 1,
    time_requirement: "Ongoing, 2 minutes at a time",
    scientific_backing: "Research on 'completion bias' shows the brain gets a dopamine reward from completing tasks, even small ones. The 2-minute rule leverages this for motivation while preventing small tasks from creating cognitive burden.",
    adhd_specific: true
  }
];

// Helper function to get strategies by category
export const getStrategiesByCategory = (category: string): FocusStrategy[] => {
  return FOCUS_STRATEGIES.filter(strategy => strategy.category === category);
};

// Helper function to get ADHD-specific strategies
export const getADHDStrategies = (): FocusStrategy[] => {
  return FOCUS_STRATEGIES.filter(strategy => strategy.adhd_specific);
};

// Helper function to get strategies by difficulty level (1-5)
export const getStrategiesByDifficulty = (level: number): FocusStrategy[] => {
  return FOCUS_STRATEGIES.filter(strategy => strategy.difficulty === level);
};
