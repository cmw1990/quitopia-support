import { faker } from '@faker-js/faker';

// Mock user data
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  smokeFreeStreak: number;
  joinDate: string;
  lastLogin: string;
}

// Mock journal entry
export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: number;
  cravingLevel: number;
  triggers: string[];
  isSynced: boolean;
}

// Mock task
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  isSynced: boolean;
}

// Mock health metric
export interface HealthMetric {
  id: string;
  date: string;
  type: 'heartRate' | 'bloodPressure' | 'respiratoryRate' | 'oxygenLevel';
  value: number;
  unit: string;
  isSynced: boolean;
}

// Generate mock user profile
export const getUserProfile = (): UserProfile => {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatarUrl: faker.image.avatar(),
    smokeFreeStreak: faker.number.int({ min: 1, max: 365 }),
    joinDate: faker.date.past().toISOString(),
    lastLogin: faker.date.recent().toISOString()
  };
};

// Generate mock journal entries
export const getJournalEntries = (count = 10): JournalEntry[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: faker.string.uuid(),
    date: faker.date.recent({ days: 30 }).toISOString(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    mood: faker.number.int({ min: 1, max: 5 }),
    cravingLevel: faker.number.int({ min: 0, max: 10 }),
    triggers: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => 
      faker.helpers.arrayElement(['stress', 'social', 'boredom', 'after meal', 'alcohol', 'coffee', 'anxiety'])
    ),
    isSynced: faker.datatype.boolean(0.7)
  }));
};

// Generate mock tasks
export const getTasks = (count = 5): Task[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(4),
    description: faker.lorem.sentence(),
    completed: faker.datatype.boolean(0.3),
    dueDate: faker.date.soon().toISOString(),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
    isSynced: faker.datatype.boolean(0.7)
  }));
};

// Generate mock health metrics
export const getHealthMetrics = (count = 15): HealthMetric[] => {
  const types = ['heartRate', 'bloodPressure', 'respiratoryRate', 'oxygenLevel'] as const;
  const units = {
    heartRate: 'bpm',
    bloodPressure: 'mmHg',
    respiratoryRate: 'breaths/min',
    oxygenLevel: '%'
  };
  
  const valueRanges = {
    heartRate: { min: 60, max: 100 },
    bloodPressure: { min: 110, max: 140 },
    respiratoryRate: { min: 12, max: 20 },
    oxygenLevel: { min: 95, max: 100 }
  };
  
  return Array.from({ length: count }, () => {
    const type = faker.helpers.arrayElement(types);
    return {
      id: faker.string.uuid(),
      date: faker.date.recent({ days: 14 }).toISOString(),
      type,
      value: faker.number.int(valueRanges[type as keyof typeof valueRanges]),
      unit: units[type as keyof typeof units],
      isSynced: faker.datatype.boolean(0.7)
    };
  });
};

// Simulate network delay
export const simulateNetworkDelay = async (minDelay = 300, maxDelay = 2000): Promise<void> => {
  const delay = faker.number.int({ min: minDelay, max: maxDelay });
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate sync progress
export interface SyncProgress {
  total: number;
  processed: number;
  failed: number;
  status: 'idle' | 'syncing' | 'completed' | 'failed';
}

export const getSyncProgress = (): SyncProgress => {
  const total = faker.number.int({ min: 10, max: 50 });
  const processed = faker.number.int({ min: 0, max: total });
  const failed = faker.number.int({ min: 0, max: Math.floor(total * 0.2) });
  
  return {
    total,
    processed,
    failed,
    status: faker.helpers.arrayElement(['idle', 'syncing', 'completed', 'failed'])
  };
};

// Mock API for mobile enhancements demo
const mobileEnhancementsApi = {
  getUserProfile,
  getJournalEntries,
  getTasks,
  getHealthMetrics,
  simulateNetworkDelay,
  getSyncProgress
};

export default mobileEnhancementsApi; 