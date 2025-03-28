export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  quitDate?: string;
  smokingYears?: number;
  cigarettesPerDay?: number;
  costPerPack?: number;
  email: string;
  avatarUrl?: string;
  created_at: string;
  updated_at: string;
}

export interface CravingLog {
  id: string;
  userId: string;
  intensity: number; // 1-10
  trigger: string;
  location: string;
  mood: string;
  notes?: string;
  interventionUsed?: string;
  interventionEffectiveness?: number; // 1-10
  timestamp: string;
}

export interface MoodLog {
  id: string;
  userId: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  energy: number; // 1-10
  focus: number; // 1-10
  anxiety: number; // 1-10
  irritability: number; // 1-10
  notes?: string;
  timestamp: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  date: string;
  hoursSlept: number;
  quality: number; // 1-10
  wokeUpCount: number;
  notes?: string;
  timestamp: string;
}

export interface ExerciseLog {
  id: string;
  userId: string;
  type: string;
  duration: number; // in minutes
  intensity: number; // 1-10
  notes?: string;
  timestamp: string;
}

export interface HealthMetric {
  id: string;
  userId: string;
  type: 'blood_pressure' | 'heart_rate' | 'weight' | 'oxygen_saturation' | 'other';
  value: number;
  unit: string;
  notes?: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
  isUnlocked?: boolean;
  unlockedAt?: string;
}

export interface SupportResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'hotline' | 'group' | 'online';
  url?: string;
  phone?: string;
  tags: string[];
  createdAt: string;
}

export interface PeerMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  encryptedContent?: string;
  iv?: string;
  isRead: boolean;
  timestamp: string;
}

export interface HealthcareProvider {
  id: string;
  name: string;
  speciality: string;
  organization: string;
  email: string;
  phone?: string;
}

export interface Report {
  id: string;
  userId: string;
  templateId: string;
  format: string;
  dateRange: {
    from: string;
    to: string;
  };
  generatedAt: string;
  url: string;
  sharedWith?: string[];
} 