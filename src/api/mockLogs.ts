import { MoodLog, EnergyLog, FocusLog } from './apiCompatibility';

/**
 * Generate mock mood logs
 */
export function getMockMoodLogs(userId: string, startDate: string, endDate: string): MoodLog[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.min(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  const mockLogs: MoodLog[] = [];
  
  // Generate 1-2 logs per day
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    
    const logsPerDay = Math.floor(Math.random() * 2) + 1;
    
    for (let j = 0; j < logsPerDay; j++) {
      // Random hour between 7am and 10pm
      const hour = 7 + Math.floor(Math.random() * 15);
      const minute = Math.floor(Math.random() * 60);
      day.setHours(hour, minute);
      
      const timestamp = day.toISOString();
      
      mockLogs.push({
        id: `mood-mock-${mockLogs.length + 1}`,
        user_id: userId,
        timestamp: timestamp,
        mood_score: 3 + Math.floor(Math.random() * 7),
        triggers: ['Stress', 'Boredom', 'Social'][Math.floor(Math.random() * 3)].split(','),
        activities: ['Exercise', 'Work', 'Relaxation'][Math.floor(Math.random() * 3)].split(','),
        notes: Math.random() > 0.7 ? 'Sample mood note' : null,
        related_to_cravings: Math.random() > 0.7,
        created_at: timestamp
      });
    }
  }
  
  // Sort by timestamp descending
  return mockLogs.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Generate mock energy logs
 */
export function getMockEnergyLogs(userId: string, startDate: string, endDate: string): EnergyLog[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.min(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  const mockLogs: EnergyLog[] = [];
  
  // Generate 1 log per day
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    
    // Random hour between 7pm and 10pm (evening check-in)
    const hour = 19 + Math.floor(Math.random() * 3);
    const minute = Math.floor(Math.random() * 60);
    day.setHours(hour, minute);
    
    const timestamp = day.toISOString();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const caffeineConsumed = Math.random() > 0.5;
    
    mockLogs.push({
      id: `energy-mock-${mockLogs.length + 1}`,
      user_id: userId,
      timestamp: timestamp,
      energy_level: 3 + Math.floor(Math.random() * 7),
      time_of_day: timeOfDay,
      caffeine_consumed: caffeineConsumed,
      caffeine_amount_mg: caffeineConsumed ? Math.floor(Math.random() * 4) * 100 : null,
      physical_activity: Math.random() > 0.5,
      sleep_hours: 5 + Math.random() * 4,
      notes: Math.random() > 0.7 ? 'Sample energy note' : null,
      created_at: timestamp
    });
  }
  
  // Sort by timestamp descending
  return mockLogs.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Generate mock focus logs
 */
export function getMockFocusLogs(userId: string, startDate: string, endDate: string): FocusLog[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.min(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  const mockLogs: FocusLog[] = [];
  
  // Generate 0-2 logs per day
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    
    const logsPerDay = Math.floor(Math.random() * 3);
    
    for (let j = 0; j < logsPerDay; j++) {
      // Random hour between 9am and 6pm (work hours)
      const hour = 9 + Math.floor(Math.random() * 9);
      const minute = Math.floor(Math.random() * 60);
      day.setHours(hour, minute);
      
      const timestamp = day.toISOString();
      
      mockLogs.push({
        id: `focus-mock-${mockLogs.length + 1}`,
        user_id: userId,
        timestamp: timestamp,
        focus_level: 3 + Math.floor(Math.random() * 7),
        duration_minutes: 15 + Math.floor(Math.random() * 90),
        interruptions: Math.floor(Math.random() * 6),
        task_type: ['Work', 'Study', 'Creative', 'Problem Solving'][Math.floor(Math.random() * 4)],
        environment: ['Home', 'Office', 'Cafe', 'Library'][Math.floor(Math.random() * 4)],
        notes: Math.random() > 0.7 ? 'Sample focus note' : null,
        created_at: timestamp
      });
    }
  }
  
  // Sort by timestamp descending
  return mockLogs.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
} 