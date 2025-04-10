import { LifeSituation, PlanType } from './energyPlans';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PatternSummary = {
  summary: string;
  confidence: number;
  last_updated: string;
}

export interface Database {
  public: {
    Tables: {
      user_life_situations: {
        Row: {
          id: string
          user_id: string 
          situation: LifeSituation
          started_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          situation: LifeSituation
          started_at?: string
          updated_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          situation?: LifeSituation
          started_at?: string
          updated_at?: string
          notes?: string | null
        }
      }
      pregnancy_wellness_correlations: {
        Row: {
          id: string
          user_id: string
          date: string
          created_at: string
          updated_at: string
          energy_pattern: PatternSummary
          focus_pattern: PatternSummary
          sleep_pattern: PatternSummary
          activity_impact: Json | null
          nutrition_impact: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          created_at?: string
          updated_at?: string
          energy_pattern?: PatternSummary
          focus_pattern?: PatternSummary
          sleep_pattern?: PatternSummary
          activity_impact?: Json | null
          nutrition_impact?: Json | null
        }
        Update: {
          user_id?: string
          date?: string
          updated_at?: string
          energy_pattern?: PatternSummary
          focus_pattern?: PatternSummary
          sleep_pattern?: PatternSummary
          activity_impact?: Json | null
          nutrition_impact?: Json | null
        }
      }
      pregnancy_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          created_at: string
          energy_level: number | null
          focus_level: number | null
          stress_level: number | null
          mood_rating: number | null
          sleep_quality: number | null
          exercise_minutes: number | null
          water_intake_ml: number | null
          blood_pressure_systolic: number | null
          blood_pressure_diastolic: number | null
          weight_kg: number | null
          activity_type: string[] | null
          symptoms: string[] | null
          wellness_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          created_at?: string
          energy_level?: number | null
          focus_level?: number | null
          stress_level?: number | null
          mood_rating?: number | null
          sleep_quality?: number | null
          exercise_minutes?: number | null
          water_intake_ml?: number | null
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          weight_kg?: number | null
          activity_type?: string[] | null
          symptoms?: string[] | null
          wellness_notes?: string | null
        }
        Update: {
          user_id?: string
          date?: string
          energy_level?: number | null
          focus_level?: number | null
          stress_level?: number | null
          mood_rating?: number | null
          sleep_quality?: number | null
          exercise_minutes?: number | null
          water_intake_ml?: number | null
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          weight_kg?: number | null
          activity_type?: string[] | null
          symptoms?: string[] | null
          wellness_notes?: string | null
        }
      }
      energy_plans: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          created_by: string
          title: string
          description: string | null
          plan_type: PlanType
          category: 'charged' | 'recharged'
          visibility: 'private' | 'public' | 'shared'
          is_expert_plan: boolean
          tags: string[]
          likes_count: number
          saves_count: number
          energy_level_required?: number
          recommended_time_of_day?: string[]
          suitable_contexts?: string[]
          estimated_duration_minutes?: number
          celebrity_name?: string
          suitable_life_situations: LifeSituation[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          created_by: string
          title: string
          description?: string | null
          plan_type: PlanType
          category?: 'charged' | 'recharged'
          visibility?: 'private' | 'public' | 'shared'
          is_expert_plan?: boolean
          tags?: string[]
          likes_count?: number
          saves_count?: number
          energy_level_required?: number
          recommended_time_of_day?: string[]
          suitable_contexts?: string[]
          estimated_duration_minutes?: number
          celebrity_name?: string
          suitable_life_situations?: LifeSituation[]
        }
        Update: {
          created_by?: string
          title?: string
          description?: string | null
          plan_type?: PlanType
          category?: 'charged' | 'recharged'
          visibility?: 'private' | 'public' | 'shared'
          is_expert_plan?: boolean
          tags?: string[]
          likes_count?: number
          saves_count?: number
          energy_level_required?: number
          recommended_time_of_day?: string[]
          suitable_contexts?: string[]
          estimated_duration_minutes?: number
          celebrity_name?: string
          suitable_life_situations?: LifeSituation[]
        }
      }
      energy_plan_components: {
        Row: {
          id: string
          created_at: string
          plan_id: string
          component_type: string
          order_number: number
          duration_minutes: number | null
          settings: Json
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          plan_id: string
          component_type: string
          order_number: number
          duration_minutes?: number | null
          settings?: Json
          notes?: string | null
        }
        Update: {
          plan_id?: string
          component_type?: string
          order_number?: number
          duration_minutes?: number | null
          settings?: Json
          notes?: string
        }
      }
      energy_plan_progress: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          component_id: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          component_id: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          plan_id?: string
          component_id?: string
          completed_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          created_at: string | null
          avatar_url: string | null
          full_name: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          created_at?: string | null
          avatar_url?: string | null
          full_name?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          created_at?: string | null
          avatar_url?: string | null
          full_name?: string | null
        }
      }
      expert_profiles: {
        Row: {
          id: string
          created_at: string  
          updated_at: string
          credentials: string[]
          specialties: string[]
          verification_status: 'pending' | 'approved' | 'rejected'
          verified_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          credentials: string[]
          specialties: string[]
          verification_status?: 'pending' | 'approved' | 'rejected'
          verified_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          credentials?: string[]
          specialties?: string[]
          verification_status?: 'pending' | 'approved' | 'rejected'
          verified_at?: string | null
        }
      }
      user_saved_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          plan_id?: string
        }
      }
      pregnancy_milestones: {
        Row: {
          id: string
          user_id: string
          milestone_type: string
          custom_title: string | null
          description: string | null
          achieved_at: string
          created_at: string
          celebration_shared: boolean
          week_number: number | null
          media_url: string | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          milestone_type: string
          custom_title?: string | null
          description?: string | null
          achieved_at?: string
          created_at?: string
          celebration_shared?: boolean
          week_number?: number | null
          media_url?: string | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          milestone_type?: string
          custom_title?: string | null
          description?: string | null
          achieved_at?: string
          created_at?: string
          celebration_shared?: boolean
          week_number?: number | null
          media_url?: string | null
          notes?: string | null
          metadata?: Json | null
        }
      }
      activity_points: {
        Row: {
          id: string
          user_id: string
          activity_type: 'steps' | 'app_usage' | 'subscription_boost' | 'purchase'
          points: number
          source_details: Json | null
          earned_at: string
          expires_at: string | null
          boosted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: 'steps' | 'app_usage' | 'subscription_boost' | 'purchase'
          points: number
          source_details?: Json | null
          earned_at?: string
          expires_at?: string | null
          boosted?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          activity_type?: 'steps' | 'app_usage' | 'subscription_boost' | 'purchase'
          points?: number
          source_details?: Json | null
          earned_at?: string
          expires_at?: string | null
          boosted?: boolean
        }
      }
      points_multipliers: {
        Row: {
          id: string
          subscription_tier: string
          multiplier: number
          created_at: string
        }
        Insert: {
          id?: string
          subscription_tier: string
          multiplier: number
          created_at: string
        }
        Update: {
          subscription_tier?: string
          multiplier?: number
        }
      }
      reward_thresholds: {
        Row: {
          id: string
          vendor_id: string
          points_required: number
          discount_percentage: number
          max_discount_amount: number | null
          is_active: boolean
          valid_from: string
          valid_until: string | null
          terms_conditions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          points_required: number
          discount_percentage: number
          max_discount_amount?: number | null
          is_active?: boolean
          valid_from?: string
          valid_until?: string | null
          terms_conditions?: string | null
          created_at?: string
        }
        Update: {
          vendor_id?: string
          points_required?: number
          discount_percentage?: number
          max_discount_amount?: number | null
          is_active?: boolean
          valid_from?: string
          valid_until?: string | null
          terms_conditions?: string | null
        }
      }
      point_redemptions: {
        Row: {
          id: string
          user_id: string
          vendor_id: string
          points_used: number
          discount_amount: number
          order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vendor_id: string
          points_used: number
          discount_amount: number
          order_id?: string | null
          created_at: string
        }
        Update: {
          user_id?: string
          vendor_id?: string
          points_used?: number
          discount_amount?: number
          order_id?: string | null
        }
      }
      delivery_tracking: {
        Row: DeliveryTracking;
        Insert: Omit<DeliveryTracking, 'id' | 'created_at'>;
        Update: Partial<Omit<DeliveryTracking, 'id' | 'created_at'>>;
      };
      vendor_messages: {
        Row: VendorMessage;
        Insert: Omit<VendorMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<VendorMessage, 'id' | 'created_at'>>;
      };
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          stock: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string
          price: number
          stock?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          stock?: number | null
        }
      }
      vendor_smart_notifications: {
        Row: VendorSmartNotification;
        Insert: Omit<VendorSmartNotification, 'id' | 'created_at'>;
        Update: Partial<Omit<VendorSmartNotification, 'id' | 'created_at'>>;
      };
      marketplace_platform_metrics: {
        Row: MarketplaceMetrics;
        Insert: Omit<MarketplaceMetrics, 'id' | 'created_at'>;
        Update: Partial<Omit<MarketplaceMetrics, 'id' | 'created_at'>>;
      };
      vendor_loyalty_programs: {
        Row: LoyaltyProgram;
        Insert: Omit<LoyaltyProgram, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LoyaltyProgram, 'id' | 'created_at' | 'updated_at'>>;
      };
      consultation_sessions: {
        Row: ConsultationSession
        Insert: Omit<ConsultationSession, 'id' | 'created_at'>
        Update: Partial<Omit<ConsultationSession, 'id' | 'created_at'>>
      }
      consultation_progress: {
        Row: ConsultationProgress
        Insert: Omit<ConsultationProgress, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ConsultationProgress, 'id' | 'created_at' | 'updated_at'>>
      }
      session_feedback: {
        Row: SessionFeedback
        Insert: Omit<SessionFeedback, 'id' | 'created_at'>
        Update: Partial<Omit<SessionFeedback, 'id' | 'created_at'>>
      }
      professional_availability: {
        Row: ProfessionalAvailability
        Insert: Omit<ProfessionalAvailability, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProfessionalAvailability, 'id' | 'created_at' | 'updated_at'>>
      }
      professional_analytics: {
        Row: ProfessionalAnalytics
        Insert: Omit<ProfessionalAnalytics, 'id' | 'updated_at'>
        Update: Partial<Omit<ProfessionalAnalytics, 'id' | 'updated_at'>>
      }
      professional_resources: {
        Row: ProfessionalResource
        Insert: Omit<ProfessionalResource, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProfessionalResource, 'id' | 'created_at' | 'updated_at'>>
      }
      client_progress_tracking: {
        Row: ClientProgressTracking
        Insert: Omit<ClientProgressTracking, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ClientProgressTracking, 'id' | 'created_at' | 'updated_at'>>
      }
      consultation_messages: {
        Row: ConsultationMessage
        Insert: Omit<ConsultationMessage, 'id' | 'created_at'>
        Update: Partial<Omit<ConsultationMessage, 'id' | 'created_at'>>
      }
      professional_scheduling_rules: {
        Row: ProfessionalSchedulingRule;
        Insert: Omit<ProfessionalSchedulingRule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProfessionalSchedulingRule, 'id' | 'created_at' | 'updated_at'>>;
      };
      client_emergency_contacts: {
        Row: ClientEmergencyContact;
        Insert: Omit<ClientEmergencyContact, 'id' | 'created_at'>;
        Update: Partial<Omit<ClientEmergencyContact, 'id' | 'created_at'>>;
      };
      consultation_resources: {
        Row: ConsultationResource;
        Insert: Omit<ConsultationResource, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ConsultationResource, 'id' | 'created_at' | 'updated_at'>>;
      };
      shared_consultation_resources: {
        Row: SharedConsultationResource;
        Insert: Omit<SharedConsultationResource, 'id' | 'created_at'>;
        Update: Partial<Omit<SharedConsultationResource, 'id' | 'created_at'>>;
      };
      consultation_reminders: {
        Row: ConsultationReminder;
        Insert: Omit<ConsultationReminder, 'id' | 'created_at'>;
        Update: Partial<Omit<ConsultationReminder, 'id' | 'created_at'>>;
      };
      insurance_providers: {
        Row: InsuranceProvider;
        Insert: Omit<InsuranceProvider, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InsuranceProvider, 'id' | 'created_at' | 'updated_at'>>;
      };
      client_insurance: {
        Row: ClientInsurance;
        Insert: Omit<ClientInsurance, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ClientInsurance, 'id' | 'created_at' | 'updated_at'>>;
      };
      insurance_claims: {
        Row: InsuranceClaim;
        Insert: Omit<InsuranceClaim, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InsuranceClaim, 'id' | 'created_at' | 'updated_at'>>;
      };
      mood_triggers: {
        Row: {
          id: string
          user_id: string
          trigger_name: string
          trigger_category: string
          impact_level: number
          frequency: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['mood_triggers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mood_triggers']['Insert']>
      }
      coping_strategies: {
        Row: {
          id: string
          user_id: string
          strategy_name: string
          category: string
          effectiveness_rating: number
          used_count: number
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coping_strategies']['Row'], 'id' | 'created_at' | 'used_count'>
        Update: Partial<Database['public']['Tables']['coping_strategies']['Insert']> & { used_count?: number }
      }
      loyalty_programs: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['loyalty_programs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['loyalty_programs']['Insert']>
      }
      loyalty_tiers: {
        Row: {
          id: string
          program_id: string
          level: 'bronze' | 'silver' | 'gold' | 'platinum'
          points_required: number
          benefits: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['loyalty_tiers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['loyalty_tiers']['Insert']>
      }
      loyalty_rewards: {
        Row: {
          id: string
          program_id: string
          name: string
          description: string | null
          points_cost: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['loyalty_rewards']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['loyalty_rewards']['Insert']>
      }
      marketplace_metrics: {
        Row: {
          id: string
          active_users: number
          engagement_rate: number | null
          response_rate: number | null
          peak_hours: Json
          segments: Json
          metrics_data: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['marketplace_metrics']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['marketplace_metrics']['Insert']>
      }
      withdrawal_symptoms: {
        Row: {
          id: string
          user_id: string
          symptom: string
          severity: number | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symptom: string
          severity?: number | null
          date?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          symptom?: string
          severity?: number | null
          date?: string
        }
      }
    }
    Functions: {
      calculate_available_discount: {
        Args: {
          _user_id: string
          _vendor_id: string
        }
        Returns: {
          available_points: number
          max_discount_percentage: number
          max_discount_amount: number
        }[]
      }
    }
  }
}

export type UserLifeSituationRow = Database['public']['Tables']['user_life_situations']['Row']
export type PregnancyWellnessCorrelationsRow = Database['public']['Tables']['pregnancy_wellness_correlations']['Row']
export type PregnancyMilestoneRow = Database['public']['Tables']['pregnancy_milestones']['Row']

export type PregnancyMilestone = Database['public']['Tables']['pregnancy_milestones']['Row'] & {
  category?: string | null;
  photo_urls?: string[] | null;
}

export interface PregnancyMetric {
  id: string;
  user_id: string;
  date: string;
  value: number;
  notes?: string;
  category: string;
  metric_category: 'weight' | 'blood_pressure' | 'nutrition' | 'exercise' | 'sleep' | 'mood' | 'general';
  photo_url?: string;
  created_at: string;
}

export interface DisplayZone {
  id: string;
  zone_type: string;
  price_multiplier: number;
  created_at: string;
}

export interface DemographicData {
  id: string;
  impression_id: string;
  age_range: string;
  created_at: string;
}

export interface CampaignStat {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  conversion_count: number;
  spend: number;
  created_at: string;
}

export interface AdImpression {
  id: string;
  sponsored_product_id: string;
  impressed_at: string;
  clicked_at: string | null;
  cost: number;
  sponsored_products: {
    id: string;
    placement_type: string;
    budget: number;
    spent: number;
    tier: string;
  };
}

export interface DeliveryTracking {
  id: string;
  order_id: string;
  tracking_number: string | null;
  status: string;
  estimated_delivery: string | null;
  created_at: string;
}

export interface VendorMessage {
  id: string;
  vendor_id: string;
  user_id: string;
  message: string;
  is_from_vendor: boolean;
  created_at: string;
}

export interface CustomerEngagement {
  id: string;
  vendor_id: string;
  customer_id: string;
  interaction_type: string;
  interaction_data: Json;
  sentiment_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplacePlatformMetric {
  id: string;
  vendor_id: string;
  platform_name: string;
  metrics_data: Json;
  sync_status: string;
  last_sync_at: string;
  created_at: string;
}

export interface EngagementAnalytic {
  id: string;
  vendor_id: string;
  date: string;
  engagement_metrics: Json;
  created_at: string;
}

// Behavior pattern interface
export interface BehaviorPattern {
  active_users: number;
  engagement_rate: number;
  response_rate: number;
  peak_hours: number[];
  segments: Array<{
    name: string;
    value: number;
  }>;
}

// Added type for customer behavior
export interface CustomerBehavior {
  id: string;
  vendor_id: string;
  behavior_patterns: BehaviorPattern;
  engagement_metrics: Record<string, any>;
  purchase_predictions: Record<string, any>;
  customer_segments: {
    new: number;
    returning: number;
    inactive: number;
  };
  revenue_trends: {
    daily: Array<{date: string; revenue: number}>;
    weekly: Array<{week: string; revenue: number}>;
    monthly: Array<{month: string; revenue: number}>;
  };
}

// Added type for marketplace metrics
export interface MarketplaceMetrics {
  id: string;
  platform_name: string;
  metrics_data: {
    total_revenue: number;
    total_orders: number;
    conversion_rate: number;
    other_metrics?: Record<string, any>;
  };
  sync_status: string;
  last_sync_at: string;
  created_at: string;
  vendor_id: string;
}

// Added type for loyalty program
export interface LoyaltyProgram {
  id: string;
  vendor_id: string;
  program_name: string;
  points_ratio: number;
  tiers: Array<{
    name: string;
    points_required: number;
    benefits: string[];
  }>;
  rewards: Array<{
    name: string;
    points_cost: number;
    description: string;
  }>;
  created_at: string;
  updated_at: string;
}

// Added type for smart notifications
export interface VendorSmartNotification {
  id: string;
  vendor_id: string;
  title: string;
  content: string;
  notification_type: string;
  priority: 'low' | 'medium' | 'high';
  trigger_conditions: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  is_read: boolean;
  scheduled_for: string | null;
}

export interface ConsultationSession {
  id: string;
  user_id: string;
  session_date: string;
  session_type: string;
  session_duration: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultationProgress {
  id: string;
  consultation_id: string;
  progress_status: string;
  progress_details: string;
  created_at: string;
  updated_at: string;
}

export interface SessionFeedback {
  id: string;
  consultation_id: string;
  feedback: string;
  feedback_score: number;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  availability_date: string;
  availability_time: string;
  availability_status: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalAnalytics {
  id: string;
  professional_id: string;
  analytics_data: Json;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalResource {
  id: string;
  professional_id: string;
  resource_type: string;
  resource_url: string;
  created_at: string;
  updated_at: string;
}

export interface ClientProgressTracking {
  id: string;
  client_id: string;
  progress_data: Json;
  created_at: string;
  updated_at: string;
}

export interface ConsultationMessage {
  id: string;
  consultation_id: string;
  message: string;
  message_type: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalSchedulingRule {
  id: string;
  professional_id: string;
  session_duration_minutes: number;
  buffer_minutes: number;
  max_daily_sessions: number;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    reminders: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface ClientEmergencyContact {
  id: string;
  client_id: string;
  contact_name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  created_at: string;
}

export interface ConsultationResource {
  id: string;
  professional_id: string;
  title: string;
  description?: string;
  resource_type: string;
  content?: string;
  file_url?: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharedConsultationResource {
  id: string;
  resource_id: string;
  client_id: string;
  shared_by: string;
  created_at: string;
}

export interface ConsultationReminder {
  id: string;
  session_id: string;
  recipient_id: string;
  reminder_type: string;
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  payer_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientInsurance {
  id: string;
  client_id: string;
  provider_id: string;
  policy_number: string;
  group_number: string | null;
  subscriber_id: string;
  subscriber_name: string;
  relationship_to_subscriber: string;
  verification_status: string;
  coverage_details: Json | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsuranceClaim {
  id: string;
  session_id: string;
  client_insurance_id: string;
  professional_id: string;
  claim_number: string | null;
  service_date: string;
  diagnosis_codes: string[];
  procedure_codes: string[];
  billed_amount: number;
  status: string;
  submission_date: string | null;
  response_details: Json | null;
  created_at: string;
  updated_at: string;
}
export type MoodTrigger = Database['public']['Tables']['mood_triggers']['Row']
export type CopingStrategy = {
  id: string;
  name: string;
  description: string;
  effectiveness_rating: number;
};
