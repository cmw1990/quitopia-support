
export interface BlockedSite {
  id: string;
  user_id: string;
  domain: string;
  block_intensity: 'strict' | 'moderate' | 'light';
  days_active?: string[];
  category: 'social' | 'entertainment' | 'shopping' | 'news' | 'productivity' | 'other' | 'all';
  created_at: string;
  blockingSchedule?: BlockingSchedule[];
}

export interface BlockingSchedule {
  day: string;
  start_time: string;
  end_time: string;
}

export interface DistractionPattern {
  id: string;
  user_id: string;
  pattern_type: string;
  time_of_day?: string;
  day_of_week?: string;
  trigger?: string;
  frequency: number;
  impact_score: number;
}

export interface DistractionLog {
  id?: string;
  user_id: string;
  timestamp: string;
  source?: string;
  duration?: number;
  context?: string;
  emotional_state?: string;
  notes?: string;
}

export interface EnvironmentRecommendation {
  id: string;
  user_id: string;
  category: 'physical' | 'digital' | 'social';
  title: string;
  description: string;
  impact_level: 'high' | 'medium' | 'low';
  implemented: boolean;
  created_at: string;
}

export interface DigitalMinimalismGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  target_date?: string;
  category: 'reduce' | 'replace' | 'reflect';
  progress: number;
  milestones: {
    description: string;
    completed: boolean;
  }[];
  reflections: {
    date: string;
    content: string;
  }[];
  completed: boolean;
}

export interface BlockingStats {
  totalBlocked: number;
  todayBlocked: number;
  mostCommonTime: string;
  productivity: number;
  streakDays: number;
  improvementRate: number;
  focusScore: number;
}

export interface DistractionBlockerState {
  isBlockingEnabled: boolean;
  blockedSites: BlockedSite[];
  distractionPatterns: DistractionPattern[];
  blockingStats: BlockingStats;
  distractionLogs: DistractionLog[];
  environmentRecommendations: EnvironmentRecommendation[];
  digitalGoals: DigitalMinimalismGoal[];
  selectedCategory: BlockedSite['category'];
  showScheduler: boolean;
  showAnalytics: boolean;
  showEnvironment: boolean;
  showJournal: boolean;
  showMinimalism: boolean;
}
