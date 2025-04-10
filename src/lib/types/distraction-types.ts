import { User } from '@supabase/supabase-js';

export interface BlockedSite {
  id: string;
  user_id: string;
  domain: string;
  schedule_start?: string;
  schedule_end?: string;
  days_active: string[];
  block_intensity: 'strict' | 'moderate' | 'flexible';
  created_at: string;
  category: 'social' | 'entertainment' | 'shopping' | 'news' | 'productivity' | 'other';
  allowedDuration?: number;
  customNotes?: string;
  blockingSchedule: BlockingSchedule[];
  notification_settings?: NotificationSettings;
  override_history?: OverrideHistory[];
}

export interface BlockingSchedule {
  start: string;
  end: string;
  days: string[];
  active: boolean;
  priority: number;
}

export interface NotificationSettings {
  blockStart: boolean;
  blockEnd: boolean;
  overrideWarning: boolean;
  productivityUpdates: boolean;
  customMessages?: string[];
}

export interface OverrideHistory {
  timestamp: string;
  reason: string;
  duration: number;
  reflection?: string;
}

export interface DistractionPattern {
  id: string;
  user_id: string;
  pattern_type: 'time_based' | 'trigger_based' | 'context_based' | 'emotional';
  trigger_conditions: string[];
  frequency: number;
  last_detected: string;
  impact_score: number;
  coping_strategies: string[];
  success_rate: number;
  environmental_factors: string[];
  intervention_history?: InterventionHistory[];
  analysis_notes?: string;
}

export interface InterventionHistory {
  timestamp: string;
  intervention: string;
  effectiveness: number;
  notes?: string;
}

export interface DistractionLog {
  id: string;
  user_id: string;
  timestamp: string;
  site: string;
  duration: number;
  emotional_state: string;
  activity_context: string;
  trigger: string;
  resolution: string;
  insights: string[];
  productivity_impact?: number;
  focus_recovery_time?: number;
}

export interface EnvironmentRecommendation {
  id: string;
  type: 'physical' | 'digital' | 'social';
  description: string;
  impact_level: 'high' | 'medium' | 'low';
  implementation_steps: string[];
  success_metrics: string[];
  personalized_notes?: string;
  scientific_backing?: string;
}

export interface DigitalMinimalismGoal {
  id: string;
  user_id: string;
  goal_type: 'reduction' | 'elimination' | 'mindful_usage';
  target: string;
  current_progress: number;
  total_goal: number;
  start_date: string;
  target_date: string;
  milestones: Milestone[];
  reflections?: GoalReflection[];
  supporting_strategies?: string[];
}

export interface Milestone {
  description: string;
  completed: boolean;
  target_date?: string;
  completion_date?: string;
  celebration_note?: string;
}

export interface GoalReflection {
  date: string;
  mood: number;
  challenges: string[];
  successes: string[];
  insights: string;
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

export interface BlockingStats {
  totalBlocked: number;
  todayBlocked: number;
  mostCommonTime: string;
  productivity: number;
  streakDays: number;
  improvementRate: number;
  focusScore: number;
  weeklyTrend?: number[];
  peakDistractionHours?: string[];
  productiveTimeWindows?: TimeWindow[];
}

export interface TimeWindow {
  start: string;
  end: string;
  productivity_score: number;
  common_distractions: string[];
}

export interface DistractionAPI {
  getBlockedSites: (user_id: string) => Promise<BlockedSite[]>;
  addBlockedSite: (site: Partial<BlockedSite>) => Promise<BlockedSite>;
  removeBlockedSite: (id: string) => Promise<void>;
  updateBlockedSite: (id: string, updates: Partial<BlockedSite>) => Promise<BlockedSite>;
  getDistractionPatterns: (user_id: string) => Promise<DistractionPattern[]>;
  getBlockingStats: (user_id: string) => Promise<BlockingStats>;
  getDistractionLogs: (user_id: string) => Promise<DistractionLog[]>;
  addDistractionLog: (log: Partial<DistractionLog>) => Promise<DistractionLog>;
  getEnvironmentRecommendations: (user_id: string) => Promise<EnvironmentRecommendation[]>;
  getDigitalGoals: (user_id: string) => Promise<DigitalMinimalismGoal[]>;
  updateDigitalGoal: (id: string, updates: Partial<DigitalMinimalismGoal>) => Promise<DigitalMinimalismGoal>;
}
