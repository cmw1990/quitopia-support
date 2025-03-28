import { NicotineProduct } from '../../types/dataTypes';

// User's saved product
export interface UserProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  nicotine_strength: number;
  is_primary: boolean;
}

// Consumption log entry
export interface ConsumptionLog {
  id?: string;
  product_id: string;
  product_name: string;
  product_category: string;
  quantity: number;
  nicotine_amount: number;
  timestamp: string;
  situation?: string;
  location?: string;
  mood?: string;
  notes?: string;
}

// Tracking stats
export interface TrackingStats {
  dailyConsumption: number;
  weeklyAverage: number;
  lastUse: string;
  nicotineReduction: number;
  weeklyTrend: 'increasing' | 'decreasing' | 'stable';
}

// Tracking preferences
export interface TrackingPreferences {
  automaticReminders: boolean;
  reminderTimes: string[];
  trackMood: boolean;
  trackLocation: boolean;
  trackSituation: boolean;
  healthGoals: string[];
}

// Product comparison props
export interface ProductComparisonProps {
  products: NicotineProduct[];
  onClose: () => void;
}

// Catalyst for quitting
export type QuitCatalyst = 
  | 'health'
  | 'financial'
  | 'family'
  | 'social'
  | 'environmental'
  | 'performance'
  | 'other';

// Health improvement milestone
export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeToReach: number; // hours
  achieved: boolean;
  achievementDate?: string;
} 