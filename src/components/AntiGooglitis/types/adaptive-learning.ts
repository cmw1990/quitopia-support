export interface DistractionPattern {
  id: string;
  user_id: string;
  pattern_type: 'website' | 'app' | 'search' | 'notification' | 'activity';
  pattern_value: string;
  frequency: number;
  time_of_day?: string;
  context?: string;
  impact_level: number;
  is_blocked: boolean;
  enable_learning: boolean;
  created_at: string;
  updated_at: string;
}

export interface DistractionInsight {
  id: string;
  user_id: string;
  insight_type: 'time_based' | 'context_based' | 'pattern_based' | 'productivity_impact';
  description: string;
  related_patterns: string[];
  confidence_level: number;
  is_applied: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdaptiveBlockingRule {
  id: string;
  user_id: string;
  pattern_id?: string;
  rule_type: 'time_based' | 'context_based' | 'frequency_based' | 'custom';
  conditions: {
    time_range?: {
      start: string;
      end: string;
    };
    context?: string[];
    threshold?: number;
    custom_logic?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatternFrequency {
  pattern: string;
  count: number;
}

export interface ProductivityTrendPoint {
  date: string;
  blocked_ratio: number;
  total_attempts: number;
}

export interface DistractionMetrics {
  user_id: string;
  total_blocked: number;
  total_allowed: number;
  focus_time_saved: number;
  most_frequent_patterns: PatternFrequency[];
  time_of_day_distribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  context_distribution: Record<string, number>;
  improvement_trend: ProductivityTrendPoint[];
  last_updated: string;
}

export interface NewDistractionPattern {
  pattern_type: DistractionPattern['pattern_type'];
  pattern_value: string;
  context?: string;
  impact_level: number;
} 