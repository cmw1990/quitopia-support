
export type PlanType = 
  | 'mental_clarity'
  | 'deep_relaxation'
  | 'stress_relief'
  | 'meditation'
  | 'energizing_boost'
  | 'sustained_focus'
  | 'physical_vitality'
  | 'evening_winddown'
  | 'sleep_preparation'

export type PlanVisibility = 'private' | 'public' | 'shared'
export type PlanCategory = 'charged' | 'recharged'
export type LifeSituation = 'regular' | 'pregnancy' | 'postpartum' | 'breastfeeding'

export interface Plan {
  id: string
  created_at: string
  updated_at: string
  created_by: string
  title: string
  description: string | null
  plan_type: PlanType
  category: PlanCategory
  visibility: PlanVisibility
  is_expert_plan: boolean
  tags: string[]
  likes_count: number
  saves_count: number
  energy_level_required?: number
  recommended_time_of_day?: string[]
  suitable_contexts?: string[]
  estimated_duration_minutes?: number
  celebrity_name?: string
  energy_plan_components?: PlanComponent[]
}

export interface PlanComponent {
  id: string
  component_type: string
  order_number: number 
  duration_minutes: number | null
  settings: any
  notes: string | null
}

export interface ProgressRecord {
  id: string
  user_id: string
  plan_id: string
  component_id: string
  completed_at: string | null
  created_at: string
}
