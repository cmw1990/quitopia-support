
export type MetricCategory = 'weight' | 'blood_pressure' | 'nutrition' | 'exercise' | 'sleep' | 'mood'

export interface PregnancyMetric {
  id: string
  user_id: string
  date: string // ISO date string
  value: number
  notes: string
  category: string
  metric_category: MetricCategory
  metric_type: string
  created_at: string
}
