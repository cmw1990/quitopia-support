import { z } from 'zod';

// Base schemas for mental health tracking
export const moodSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  moodScore: z.number().min(1).max(10),
  energyLevel: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  anxietyLevel: z.number().min(1).max(10),
  focusLevel: z.number().min(1).max(10),
  notes: z.string().optional(),
  activities: z.array(z.string()),
  triggers: z.array(z.string()).optional(),
  copingStrategies: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const anxietyLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  intensityLevel: z.number().min(1).max(10),
  physicalSymptoms: z.array(z.string()),
  thoughts: z.string(),
  triggers: z.array(z.string()),
  copingMechanisms: z.array(z.string()),
  effectivenessRating: z.number().min(1).max(10),
  duration: z.number(), // in minutes
  location: z.string().optional(),
  accompaniedBy: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const depressionCheckInSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  moodRating: z.number().min(1).max(10),
  sleepQuality: z.number().min(1).max(10),
  sleepHours: z.number(),
  appetite: z.number().min(1).max(10),
  energyLevel: z.number().min(1).max(10),
  motivationLevel: z.number().min(1).max(10),
  socialInteraction: z.number().min(1).max(10),
  thoughtPatterns: z.array(z.string()),
  activities: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const focusSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  duration: z.number(), // in minutes
  taskType: z.string(),
  productivity: z.number().min(1).max(10),
  distractions: z.array(z.string()),
  environment: z.string(),
  techniques: z.array(z.string()),
  breaks: z.array(z.object({
    startTime: z.string(),
    duration: z.number(),
    activity: z.string()
  })),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const meditationSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  duration: z.number(), // in minutes
  type: z.string(),
  guidedBy: z.string().optional(),
  focusLevel: z.number().min(1).max(10),
  calmness: z.number().min(1).max(10),
  interruptions: z.number(),
  environment: z.string(),
  techniques: z.array(z.string()),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const relationshipCheckInSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  relationshipType: z.string(),
  satisfactionLevel: z.number().min(1).max(10),
  communicationQuality: z.number().min(1).max(10),
  concerns: z.array(z.string()),
  positiveAspects: z.array(z.string()),
  goals: z.array(z.string()),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const workLifeBalanceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  workSatisfaction: z.number().min(1).max(10),
  workStressLevel: z.number().min(1).max(10),
  personalTimeQuality: z.number().min(1).max(10),
  hobbiesEngagement: z.number().min(1).max(10),
  boundaryMaintenance: z.number().min(1).max(10),
  workHours: z.number(),
  breaksTaken: z.number(),
  exerciseMinutes: z.number(),
  relaxationMinutes: z.number(),
  goals: z.array(z.string()),
  challenges: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const gratitudeEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  entries: z.array(z.string()),
  mood: z.number().min(1).max(10),
  category: z.string(),
  impact: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const journalEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  title: z.string(),
  content: z.string(),
  mood: z.number().min(1).max(10),
  tags: z.array(z.string()),
  isPrivate: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const habitTrackingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  habitId: z.string(),
  timestamp: z.string(),
  completed: z.boolean(),
  difficulty: z.number().min(1).max(10),
  notes: z.string().optional(),
  mood: z.number().min(1).max(10),
  streak: z.number(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const socialInteractionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string(),
  type: z.string(),
  duration: z.number(),
  quality: z.number().min(1).max(10),
  energyImpact: z.number().min(-5).max(5),
  people: z.array(z.string()),
  location: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Derived types
export type MoodLog = z.infer<typeof moodSchema>;
export type AnxietyLog = z.infer<typeof anxietyLogSchema>;
export type DepressionCheckIn = z.infer<typeof depressionCheckInSchema>;
export type FocusSession = z.infer<typeof focusSessionSchema>;
export type MeditationSession = z.infer<typeof meditationSessionSchema>;
export type RelationshipCheckIn = z.infer<typeof relationshipCheckInSchema>;
export type WorkLifeBalance = z.infer<typeof workLifeBalanceSchema>;
export type GratitudeEntry = z.infer<typeof gratitudeEntrySchema>;
export type JournalEntry = z.infer<typeof journalEntrySchema>;
export type HabitTracking = z.infer<typeof habitTrackingSchema>;
export type SocialInteraction = z.infer<typeof socialInteractionSchema>;

// Mental Health Categories
export const mentalHealthCategories = [
  'Anxiety',
  'Depression',
  'Stress',
  'Focus',
  'Sleep',
  'Relationships',
  'Work-Life Balance',
  'Personal Growth',
  'Emotional Intelligence',
  'Social Connection',
  'Mindfulness',
  'Resilience'
] as const;

export type MentalHealthCategory = typeof mentalHealthCategories[number];

// Mental Health Goals
export interface MentalHealthGoal {
  id: string;
  userId: string;
  category: MentalHealthCategory;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  metrics: {
    metric: string;
    target: number;
    current: number;
  }[];
  checkIns: {
    date: string;
    notes: string;
    rating: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Mental Health Insights
export interface MentalHealthInsight {
  id: string;
  userId: string;
  category: MentalHealthCategory;
  type: 'pattern' | 'correlation' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  actions?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mental Health Progress
export interface MentalHealthProgress {
  userId: string;
  timestamp: string;
  metrics: {
    category: MentalHealthCategory;
    score: number;
    change: number;
    trend: 'improving' | 'declining' | 'stable';
  }[];
  insights: MentalHealthInsight[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}
