import { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

export interface ChallengeTask {
  id: string;
  challenge_id: string;
  description: string;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  start_date: string;
  end_date: string;
  reward_points: number;
  participants_count: number;
  tasks?: ChallengeTask[];
}

export interface UserProgress {
  id?: string;
  challenge_id: string;
  user_id: string;
  joined_at: string;
  completed_tasks: string[];
  status: 'in_progress' | 'completed' | 'abandoned';
  updated_at?: string;
}

/**
 * Fetch all available challenges
 */
export const getAllChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching challenges:', error);
    throw new Error('Failed to fetch challenges');
  }

  return data || [];
};

/**
 * Fetch tasks for a specific challenge
 */
export const getChallengeTasks = async (challengeId: string): Promise<ChallengeTask[]> => {
  const { data, error } = await supabase
    .from('challenge_tasks')
    .select('*')
    .eq('challenge_id', challengeId);

  if (error) {
    console.error('Error fetching challenge tasks:', error);
    throw new Error('Failed to fetch challenge tasks');
  }

  return data || [];
};

/**
 * Fetch user progress for a specific challenge
 */
export const getUserChallengeProgress = async (
  userId: string,
  challengeId: string
): Promise<UserProgress | null> => {
  const { data, error } = await supabase
    .from('challenge_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is the error code for no rows returned
    console.error('Error fetching user challenge progress:', error);
    throw new Error('Failed to fetch user challenge progress');
  }

  return data;
};

/**
 * Fetch all user progress entries for a user
 */
export const getAllUserProgress = async (userId: string): Promise<UserProgress[]> => {
  const { data, error } = await supabase
    .from('challenge_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user progress:', error);
    throw new Error('Failed to fetch user progress');
  }

  return data || [];
};

/**
 * Join a challenge
 */
export const joinChallenge = async (
  userId: string,
  challengeId: string
): Promise<UserProgress> => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('challenge_progress')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      joined_at: now,
      completed_tasks: [],
      status: 'in_progress',
      updated_at: now
    })
    .select()
    .single();

  if (error) {
    console.error('Error joining challenge:', error);
    throw new Error('Failed to join challenge');
  }

  // Increment the participants count
  await supabase.rpc('increment_participants', { challenge_id: challengeId });

  return data;
};

/**
 * Complete a task in a challenge
 */
export const completeTask = async (
  progressId: string,
  taskId: string,
  completedTasks: string[]
): Promise<UserProgress> => {
  // Add the task to completed tasks if not already completed
  if (!completedTasks.includes(taskId)) {
    completedTasks.push(taskId);
  }

  const { data, error } = await supabase
    .from('challenge_progress')
    .update({
      completed_tasks: completedTasks,
      updated_at: new Date().toISOString()
    })
    .eq('id', progressId)
    .select()
    .single();

  if (error) {
    console.error('Error completing task:', error);
    throw new Error('Failed to complete task');
  }

  return data;
};

/**
 * Check if a challenge is completed and update status if needed
 */
export const checkChallengeCompletion = async (
  progressId: string,
  challengeId: string,
  completedTasks: string[]
): Promise<boolean> => {
  // Get all tasks for the challenge
  const tasks = await getChallengeTasks(challengeId);
  
  // Check if all tasks are completed
  const allTasksCompleted = tasks.every(task => 
    completedTasks.includes(task.id)
  );
  
  if (allTasksCompleted) {
    // Update challenge status to completed
    const { error } = await supabase
      .from('challenge_progress')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', progressId);
      
    if (error) {
      console.error('Error updating challenge status:', error);
      throw new Error('Failed to update challenge status');
    }
    
    return true;
  }
  
  return false;
};

/**
 * Award points to user for completing a challenge
 */
export const awardChallengePoints = async (
  userId: string,
  points: number
): Promise<void> => {
  // First get current points
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw new Error('Failed to fetch user profile');
  }
  
  const currentPoints = profileData?.points || 0;
  const newPoints = currentPoints + points;
  
  // Update points
  const { error } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', userId);
    
  if (error) {
    console.error('Error updating user points:', error);
    throw new Error('Failed to update user points');
  }
}; 