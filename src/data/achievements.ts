import { v4 as uuidv4 } from 'uuid';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  level: number;
  points: number;
  requirements: {
    type: string;
    value: number;
  };
  reward_description?: string;
  is_secret?: boolean;
}

export const ACHIEVEMENT_CATEGORIES = {
  FOCUS_SESSIONS: "Focus Sessions",
  STREAKS: "Streaks",
  TASKS: "Task Completion",
  STRATEGIES: "Focus Strategies",
  MASTERY: "Focus Mastery"
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: uuidv4(),
    name: "Focus Beginner",
    description: "Complete your first focus session",
    icon: "trophy",
    category: ACHIEVEMENT_CATEGORIES.FOCUS_SESSIONS,
    level: 1,
    points: 10,
    requirements: {
      type: "focus_sessions_completed",
      value: 1
    },
    reward_description: "Unlock basic focus strategy recommendations"
  },
  {
    id: uuidv4(),
    name: "Focus Enthusiast",
    description: "Complete 10 focus sessions",
    icon: "medal",
    category: ACHIEVEMENT_CATEGORIES.FOCUS_SESSIONS,
    level: 2,
    points: 25,
    requirements: {
      type: "focus_sessions_completed",
      value: 10
    },
    reward_description: "Unlock advanced focus statistics"
  },
  {
    id: uuidv4(),
    name: "Focus Master",
    description: "Complete 50 focus sessions",
    icon: "award",
    category: ACHIEVEMENT_CATEGORIES.FOCUS_SESSIONS,
    level: 3,
    points: 100,
    requirements: {
      type: "focus_sessions_completed",
      value: 50
    },
    reward_description: "Unlock personalized focus recommendations"
  },
  {
    id: uuidv4(),
    name: "Deep Worker",
    description: "Complete a focus session of at least 2 hours",
    icon: "clock",
    category: ACHIEVEMENT_CATEGORIES.FOCUS_SESSIONS,
    level: 2,
    points: 30,
    requirements: {
      type: "longest_session_minutes",
      value: 120
    },
    reward_description: "Unlock deep work focus techniques"
  },
  {
    id: uuidv4(),
    name: "Focus Streak: Bronze",
    description: "Maintain a focus streak for 3 consecutive days",
    icon: "flame",
    category: ACHIEVEMENT_CATEGORIES.STREAKS,
    level: 1,
    points: 15,
    requirements: {
      type: "consecutive_days",
      value: 3
    },
    reward_description: "Unlock basic streak visualizations"
  },
  {
    id: uuidv4(),
    name: "Focus Streak: Silver",
    description: "Maintain a focus streak for 7 consecutive days",
    icon: "flame",
    category: ACHIEVEMENT_CATEGORIES.STREAKS,
    level: 2,
    points: 50,
    requirements: {
      type: "consecutive_days",
      value: 7
    },
    reward_description: "Unlock streak calendar features"
  },
  {
    id: uuidv4(),
    name: "Focus Streak: Gold",
    description: "Maintain a focus streak for 21 consecutive days",
    icon: "flame",
    category: ACHIEVEMENT_CATEGORIES.STREAKS,
    level: 3,
    points: 150,
    requirements: {
      type: "consecutive_days",
      value: 21
    },
    reward_description: "Unlock special focus backgrounds and themes"
  },
  {
    id: uuidv4(),
    name: "Task Tackler",
    description: "Complete 25 tasks during focus sessions",
    icon: "check-circle",
    category: ACHIEVEMENT_CATEGORIES.TASKS,
    level: 2,
    points: 40,
    requirements: {
      type: "tasks_completed",
      value: 25
    },
    reward_description: "Unlock advanced task prioritization features"
  },
  {
    id: uuidv4(),
    name: "Strategy Explorer",
    description: "Try 5 different focus strategies",
    icon: "target",
    category: ACHIEVEMENT_CATEGORIES.STRATEGIES,
    level: 1,
    points: 20,
    requirements: {
      type: "strategies_tried",
      value: 5
    },
    reward_description: "Unlock strategy effectiveness tracking"
  },
  {
    id: uuidv4(),
    name: "Strategy Master",
    description: "Use one focus strategy at least 10 times",
    icon: "star",
    category: ACHIEVEMENT_CATEGORIES.STRATEGIES,
    level: 2,
    points: 35,
    requirements: {
      type: "strategy_usage_count",
      value: 10
    },
    reward_description: "Unlock advanced strategy customization"
  },
  {
    id: uuidv4(),
    name: "Distraction Defeater",
    description: "Block 100 distractions during focus sessions",
    icon: "zap",
    category: ACHIEVEMENT_CATEGORIES.FOCUS_SESSIONS,
    level: 2,
    points: 40,
    requirements: {
      type: "distractions_blocked",
      value: 100
    },
    reward_description: "Unlock advanced distraction analytics"
  },
  {
    id: uuidv4(),
    name: "Mood Tracker",
    description: "Log your mood and energy 10 times",
    icon: "brain",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    level: 1,
    points: 20,
    requirements: {
      type: "mood_logs",
      value: 10
    },
    reward_description: "Unlock mood trend visualizations"
  },
  {
    id: uuidv4(),
    name: "Focus Insight Pioneer",
    description: "View your focus analytics 5 days in a row",
    icon: "bar-chart",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    level: 1,
    points: 15,
    requirements: {
      type: "consecutive_analytics_views",
      value: 5
    },
    reward_description: "Unlock advanced analytics dashboards"
  },
  {
    id: uuidv4(),
    name: "Night Owl",
    description: "Complete a focus session after 10 PM",
    icon: "moon",
    category: ACHIEVEMENT_CATEGORIES.FOCUS_SESSIONS,
    level: 1,
    points: 15,
    requirements: {
      type: "late_night_session",
      value: 1
    },
    reward_description: "Unlock night mode theme"
  },
  {
    id: uuidv4(),
    name: "Early Bird",
    description: "Complete a focus session before 8 AM",
    icon: "sun",
    category: ACHIEVEMENT_CATEGORIES.FOCUS_SESSIONS,
    level: 1,
    points: 15,
    requirements: {
      type: "early_morning_session",
      value: 1
    },
    reward_description: "Unlock morning focus recommendations"
  },
  {
    id: uuidv4(),
    name: "Weekend Warrior",
    description: "Complete focus sessions on 3 consecutive weekends",
    icon: "calendar",
    category: ACHIEVEMENT_CATEGORIES.STREAKS,
    level: 2,
    points: 30,
    requirements: {
      type: "consecutive_weekend_sessions",
      value: 3
    },
    reward_description: "Unlock weekend productivity insights"
  },
  {
    id: uuidv4(),
    name: "Secret Achievement: Flow Master",
    description: "Stay in a focus session for over 3 hours without breaks",
    icon: "sparkles",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    level: 3,
    points: 50,
    requirements: {
      type: "flow_state_duration",
      value: 180
    },
    reward_description: "Unlock flow state tracking and insights",
    is_secret: true
  },
  {
    id: uuidv4(),
    name: "Secret Achievement: Distraction Immune",
    description: "Complete 5 focus sessions with zero recorded distractions",
    icon: "shield",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    level: 3,
    points: 75,
    requirements: {
      type: "zero_distraction_sessions",
      value: 5
    },
    reward_description: "Unlock distraction immunity score",
    is_secret: true
  },
  {
    id: uuidv4(),
    name: "Focus Centurion",
    description: "Accumulate 100 hours of focused work",
    icon: "award",
    category: ACHIEVEMENT_CATEGORIES.FOCUS_SESSIONS,
    level: 3,
    points: 100,
    requirements: {
      type: "total_focus_hours",
      value: 100
    },
    reward_description: "Unlock exclusive focus achievement badge"
  },
  {
    id: uuidv4(),
    name: "Balanced Focus",
    description: "Complete focus sessions in each part of the day (morning, afternoon, evening)",
    icon: "activity",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    level: 2,
    points: 30,
    requirements: {
      type: "time_of_day_variety",
      value: 3
    },
    reward_description: "Unlock time-of-day efficiency analysis"
  }
];

// Helper function to get achievements by category
export const getAchievementsByCategory = (category: string): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
};

// Helper function to get achievements by level
export const getAchievementsByLevel = (level: number): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => achievement.level === level);
};

// Helper function to get secret achievements
export const getSecretAchievements = (): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => achievement.is_secret);
};

// Helper function to get non-secret achievements
export const getNonSecretAchievements = (): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => !achievement.is_secret);
};
