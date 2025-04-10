import { z } from 'zod';

// Base schema for all mental health logs
const mentalHealthLogBase = z.object({
  intensity: z.number().min(1).max(10),
  notes: z.string().optional(),
  location: z.string().optional(),
  accompanied_by: z.array(z.string()).optional(),
});

// Anxiety log validation
export const anxietyLogSchema = mentalHealthLogBase.extend({
  physical_symptoms: z.array(z.string()),
  triggers: z.array(z.string()),
  coping_strategies: z.array(z.string()),
  duration_minutes: z.number().positive(),
  effectiveness_rating: z.number().min(1).max(10),
});

// Mood log validation
export const moodLogSchema = mentalHealthLogBase.extend({
  mood_type: z.string(),
  activities: z.array(z.string()),
  energy_level: z.number().min(1).max(10),
  sleep_quality: z.number().min(1).max(10),
});

// Depression log validation
export const depressionLogSchema = mentalHealthLogBase.extend({
  symptoms: z.array(z.string()),
  sleep_hours: z.number().min(0).max(24),
  sleep_quality: z.number().min(1).max(10),
  appetite_level: z.number().min(1).max(10),
  energy_level: z.number().min(1).max(10),
  social_interaction: z.number().min(1).max(10),
  positive_activities: z.array(z.string()),
  suicidal_thoughts: z.boolean(),
});

// Types inferred from schemas
export type AnxietyLogValidation = z.infer<typeof anxietyLogSchema>;
export type MoodLogValidation = z.infer<typeof moodLogSchema>;
export type DepressionLogValidation = z.infer<typeof depressionLogSchema>;
