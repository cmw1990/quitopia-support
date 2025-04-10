// Base interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Insurance related types
export interface InsuranceClaim extends BaseEntity {
  type: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  documents?: string[];
}

// Achievement related types
export interface Achievement extends BaseEntity {
  title: string;
  description: string;
  category: string;
  progress: number;
  completed: boolean;
  milestones?: Milestone[];
}

export interface Milestone {
  title: string;
  completed: boolean;
  completedAt?: string;
}

// Social interaction types
export interface SocialInteraction extends BaseEntity {
  type: string;
  participants: string[];
  duration: number;
  mood?: string;
  notes?: string;
}

export interface Relationship extends BaseEntity {
  name: string;
  type: string;
  quality: number;
  lastInteraction: string;
  notes?: string;
}

// Mental health tracking types
export interface MoodEntry extends BaseEntity {
  mood: number;
  notes?: string;
  triggers?: string[];
  activities?: string[];
}

export interface JournalEntry extends BaseEntity {
  title: string;
  content: string;
  mood?: number;
  tags?: string[];
}

export interface TherapySession extends BaseEntity {
  therapistName: string;
  date: string;
  notes: string;
  followUp?: string;
  goals?: string[];
}

// Physical health tracking types
export interface Exercise extends BaseEntity {
  type: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  calories?: number;
  notes?: string;
}

export interface Sleep extends BaseEntity {
  startTime: string;
  endTime: string;
  quality: number;
  interruptions?: number;
  notes?: string;
}

export interface Nutrition extends BaseEntity {
  meal: string;
  foods: string[];
  calories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  notes?: string;
}

// Medication tracking types
export interface Medication extends BaseEntity {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  sideEffects?: string[];
  notes?: string;
}

export interface MedicationLog extends BaseEntity {
  medicationId: string;
  taken: boolean;
  scheduledTime: string;
  actualTime?: string;
  notes?: string;
}

// Symptom tracking types
export interface Symptom extends BaseEntity {
  name: string;
  severity: number;
  duration: number;
  triggers?: string[];
  notes?: string;
}

// Goal tracking types
export interface Goal extends BaseEntity {
  title: string;
  description: string;
  category: string;
  targetDate?: string;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  milestones?: Milestone[];
}

// Development mode indicator types
export interface DevelopmentModeConfig {
  enabled: boolean;
  icon: string;
  greeting: string;
  position: {
    top: number;
    right: number;
    zIndex: number;
  };
  styling: {
    container: string;
    header: string;
    content: string;
  };
}

// Female Health related types
export interface MenstrualCycle extends BaseEntity {
  startDate: string;
  endDate: string;
  cycleLength?: number;
  periodLength?: number;
  symptoms?: string[];
  notes?: string;
}

export interface FertilityTracking extends BaseEntity {
  date: string;
  basalBodyTemperature?: number;
  cervicalMucus?: string;
  ovulationTestResult?: 'positive' | 'negative' | 'peak';
  notes?: string;
}

export interface PregnancyTracking extends BaseEntity {
  dueDate?: string;
  week: number;
  symptoms?: string[];
  appointments?: { date: string; notes?: string }[];
  notes?: string;
}

// Sleep Tracking related types (extending existing Sleep)
export interface SleepEnvironment extends BaseEntity { // Assuming separate tracking for env
  date: string;
  temperature?: number;
  noiseLevel?: 'quiet' | 'moderate' | 'loud';
  lightLevel?: 'dark' | 'dim' | 'bright';
  notes?: string;
}

export interface SleepStage extends BaseEntity { // Assuming separate tracking for stages
  sleepRecordId: string; // Link to the main Sleep record
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: string;
  endTime: string;
  duration: number;
}

// Nutrition Tracking related types (extending existing Nutrition)
export interface MealPhoto extends BaseEntity { // Assuming separate tracking for photos
  nutritionRecordId: string; // Link to the main Nutrition record
  photoUrl: string;
  timestamp: string;
  notes?: string;
}

export interface NutritionGoal extends BaseEntity { // Defining the missing goal type
  goalType: 'calories' | 'macros' | 'hydration' | 'custom';
  targetValue: number | { protein: number, carbs: number, fats: number };
  unit: string;
  deadline?: string;
  notes?: string;
}

// Recovery Tracking types
export interface RecoveryTracking extends BaseEntity {
  recoveryType: string; // e.g., 'injury', 'surgery', 'illness', 'addiction'
  startDate: string;
  endDate?: string;
  status: 'ongoing' | 'completed' | 'paused';
  notes?: string;
}

export interface RecoveryMilestone extends BaseEntity {
  recoveryTrackingId: string; // Link to the main RecoveryTracking record
  title: string;
  targetDate?: string;
  completedDate?: string;
  notes?: string;
}

// Mental Health Tracking types (extending existing TherapySession, JournalEntry)
export interface CBTEntry extends BaseEntity {
  situation: string;
  automaticThoughts: string;
  emotions: string;
  evidenceFor?: string;
  evidenceAgainst?: string;
  alternativeThought: string;
  outcome: string;
  timestamp: string;
}

// Eye Health Tracking types
export interface EyeStrainTracking extends BaseEntity {
  timestamp: string;
  duration: number; // Duration of screen time or activity causing strain
  strainLevel: number; // e.g., 1-10
  symptoms: string[]; // e.g., 'headache', 'blurred vision', 'dry eyes'
  breakTaken: boolean;
  notes?: string;
}

// Exercise Tracking types (extending existing Exercise)
export interface ExerciseDetail extends BaseEntity {
  exerciseRecordId: string; // Link to the main Exercise record
  setNumber?: number;
  reps?: number;
  weight?: number;
  distance?: number;
  notes?: string;
}
