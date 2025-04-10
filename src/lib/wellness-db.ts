import { supabase } from './supabase';
import type {
  BaseEntity,
  MoodEntry,
  Sleep,
  Exercise,
  Nutrition,
  TherapySession,
  Medication,
  MedicationLog,
  Symptom,
  Goal,
  SocialInteraction,
  Relationship,
  JournalEntry
} from '@/types/wellness';
import { getCurrentUser } from './auth';

// Database helper functions
export async function createRecord<T extends BaseEntity>(
  table: string,
  data: Omit<T, keyof BaseEntity>
): Promise<T> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data: record, error } = await supabase
    .from(table)
    .insert({
      ...data,
      userId: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return record as T;
}

export async function updateRecord<T extends BaseEntity>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<T> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data: record, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .eq('userId', user.id)
    .select()
    .single();

  if (error) throw error;
  return record as T;
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('userId', user.id);

  if (error) throw error;
}

export async function getRecord<T extends BaseEntity>(
  table: string,
  id: string
): Promise<T> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .eq('userId', user.id)
    .single();

  if (error) throw error;
  return data as T;
}

export async function getRecords<T extends BaseEntity>(
  table: string,
  query?: {
    column?: string;
    value?: any;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<T[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  let dbQuery = supabase
    .from(table)
    .select('*')
    .eq('userId', user.id);

  if (query?.column && query?.value !== undefined) {
    dbQuery = dbQuery.eq(query.column, query.value);
  }

  if (query?.startDate) {
    dbQuery = dbQuery.gte('createdAt', query.startDate.toISOString());
  }

  if (query?.endDate) {
    dbQuery = dbQuery.lte('createdAt', query.endDate.toISOString());
  }

  const { data, error } = await dbQuery;

  if (error) throw error;
  return data as T[];
}

// Specific helper functions for each type
export const moodEntries = {
  create: (data: Omit<MoodEntry, keyof BaseEntity>) => createRecord<MoodEntry>('mood_entries', data),
  update: (id: string, data: Partial<MoodEntry>) => updateRecord<MoodEntry>('mood_entries', id, data),
  delete: (id: string) => deleteRecord('mood_entries', id),
  get: (id: string) => getRecord<MoodEntry>('mood_entries', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<MoodEntry>('mood_entries', query),
};

export const sleep = {
  create: (data: Omit<Sleep, keyof BaseEntity>) => createRecord<Sleep>('sleep', data),
  update: (id: string, data: Partial<Sleep>) => updateRecord<Sleep>('sleep', id, data),
  delete: (id: string) => deleteRecord('sleep', id),
  get: (id: string) => getRecord<Sleep>('sleep', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<Sleep>('sleep', query),
};

export const exercise = {
  create: (data: Omit<Exercise, keyof BaseEntity>) => createRecord<Exercise>('exercise', data),
  update: (id: string, data: Partial<Exercise>) => updateRecord<Exercise>('exercise', id, data),
  delete: (id: string) => deleteRecord('exercise', id),
  get: (id: string) => getRecord<Exercise>('exercise', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<Exercise>('exercise', query),
};

export const nutrition = {
  create: (data: Omit<Nutrition, keyof BaseEntity>) => createRecord<Nutrition>('nutrition', data),
  update: (id: string, data: Partial<Nutrition>) => updateRecord<Nutrition>('nutrition', id, data),
  delete: (id: string) => deleteRecord('nutrition', id),
  get: (id: string) => getRecord<Nutrition>('nutrition', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<Nutrition>('nutrition', query),
};

export const therapy = {
  create: (data: Omit<TherapySession, keyof BaseEntity>) => createRecord<TherapySession>('therapy_sessions', data),
  update: (id: string, data: Partial<TherapySession>) => updateRecord<TherapySession>('therapy_sessions', id, data),
  delete: (id: string) => deleteRecord('therapy_sessions', id),
  get: (id: string) => getRecord<TherapySession>('therapy_sessions', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<TherapySession>('therapy_sessions', query),
};

export const medications = {
  create: (data: Omit<Medication, keyof BaseEntity>) => createRecord<Medication>('medications', data),
  update: (id: string, data: Partial<Medication>) => updateRecord<Medication>('medications', id, data),
  delete: (id: string) => deleteRecord('medications', id),
  get: (id: string) => getRecord<Medication>('medications', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<Medication>('medications', query),
};

export const medicationLogs = {
  create: (data: Omit<MedicationLog, keyof BaseEntity>) => createRecord<MedicationLog>('medication_logs', data),
  update: (id: string, data: Partial<MedicationLog>) => updateRecord<MedicationLog>('medication_logs', id, data),
  delete: (id: string) => deleteRecord('medication_logs', id),
  get: (id: string) => getRecord<MedicationLog>('medication_logs', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<MedicationLog>('medication_logs', query),
};

export const symptoms = {
  create: (data: Omit<Symptom, keyof BaseEntity>) => createRecord<Symptom>('symptoms', data),
  update: (id: string, data: Partial<Symptom>) => updateRecord<Symptom>('symptoms', id, data),
  delete: (id: string) => deleteRecord('symptoms', id),
  get: (id: string) => getRecord<Symptom>('symptoms', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<Symptom>('symptoms', query),
};

export const goals = {
  create: (data: Omit<Goal, keyof BaseEntity>) => createRecord<Goal>('goals', data),
  update: (id: string, data: Partial<Goal>) => updateRecord<Goal>('goals', id, data),
  delete: (id: string) => deleteRecord('goals', id),
  get: (id: string) => getRecord<Goal>('goals', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<Goal>('goals', query),
};

export const social = {
  interactions: {
    create: (data: Omit<SocialInteraction, keyof BaseEntity>) => createRecord<SocialInteraction>('social_interactions', data),
    update: (id: string, data: Partial<SocialInteraction>) => updateRecord<SocialInteraction>('social_interactions', id, data),
    delete: (id: string) => deleteRecord('social_interactions', id),
    get: (id: string) => getRecord<SocialInteraction>('social_interactions', id),
    list: (query?: Parameters<typeof getRecords>[1]) => getRecords<SocialInteraction>('social_interactions', query),
  },
  relationships: {
    create: (data: Omit<Relationship, keyof BaseEntity>) => createRecord<Relationship>('relationships', data),
    update: (id: string, data: Partial<Relationship>) => updateRecord<Relationship>('relationships', id, data),
    delete: (id: string) => deleteRecord('relationships', id),
    get: (id: string) => getRecord<Relationship>('relationships', id),
    list: (query?: Parameters<typeof getRecords>[1]) => getRecords<Relationship>('relationships', query),
  },
};

export const journal = {
  create: (data: Omit<JournalEntry, keyof BaseEntity>) => createRecord<JournalEntry>('journal_entries', data),
  update: (id: string, data: Partial<JournalEntry>) => updateRecord<JournalEntry>('journal_entries', id, data),
  delete: (id: string) => deleteRecord('journal_entries', id),
  get: (id: string) => getRecord<JournalEntry>('journal_entries', id),
  list: (query?: Parameters<typeof getRecords>[1]) => getRecords<JournalEntry>('journal_entries', query),
};

// Sleep-specific functions
export async function getSleepGoals(): Promise<Goal[]> {
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('type', 'sleep');
  
  if (error) throw error;
  return goals;
}

export async function setSleepGoals(goals: Omit<Goal, keyof BaseEntity>[]): Promise<Goal[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data: newGoals, error } = await supabase
    .from('goals')
    .insert(goals.map(goal => ({ ...goal, userId: user.id, type: 'sleep' })))
    .select();

  if (error) throw error;
  return newGoals;
}

export async function getSleepRecommendations(): Promise<any[]> {
  const { data: recommendations, error } = await supabase
    .from('sleep_recommendations')
    .select('*');

  if (error) throw error;
  return recommendations;
}

// Additional sleep-specific functions
export async function createSleepEntry(data: Omit<Sleep, keyof BaseEntity>): Promise<Sleep> {
  return sleep.create(data);
}

export async function getSleepHistory(startDate?: Date, endDate?: Date): Promise<Sleep[]> {
  return sleep.list({ startDate, endDate });
}

export async function getSleepStats(startDate?: Date, endDate?: Date): Promise<{
  averageDuration: number;
  averageQuality: number;
  totalEntries: number;
}> {
  const entries = await getSleepHistory(startDate, endDate);
  
  if (entries.length === 0) {
    return {
      averageDuration: 0,
      averageQuality: 0,
      totalEntries: 0
    };
  }

  const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalQuality = entries.reduce((sum, entry) => sum + entry.quality, 0);

  return {
    averageDuration: totalDuration / entries.length,
    averageQuality: totalQuality / entries.length,
    totalEntries: entries.length
  };
}
