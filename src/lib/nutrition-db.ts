import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import type { User } from '@supabase/supabase-js';

// Helper to get user ID from response
const getUserId = (user: User | null): string => {
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

// Helper for making Supabase REST API calls
const supabaseRestCall = async (endpoint: string, options: RequestInit = {}, session?: { access_token: string } | null) => {
  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${session?.access_token || SUPABASE_KEY}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || response.statusText);
  }

  return await response.json();
};

// Record meal
export async function recordMeal(user: User | null, data: {
  meal_type: string;
  food_items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/nutrition_tracking8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording meal:', error);
    throw error;
  }
}

// Set nutrition goals
export async function setNutritionGoals(user: User | null, data: {
  daily_calories: number;
  protein_target: number;
  carbs_target: number;
  fats_target: number;
  meal_frequency: number;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/nutrition_goals8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error setting nutrition goals:', error);
    throw error;
  }
}

// Get meal history
export async function getMealHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/nutrition_tracking8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting meal history:', error);
    throw error;
  }
}

// Get nutrition goals
export async function getNutritionGoals(user: User | null, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall(
      `/rest/v1/nutrition_goals8?user_id=eq.${userId}&order=created_at.desc&limit=1`,
      {},
      session
    );
  } catch (error) {
    console.error('Error getting nutrition goals:', error);
    throw error;
  }
}

// Get nutrition analytics
export async function getNutritionAnalytics(user: User | null, timeframe: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    return await supabaseRestCall('/rest/v1/rpc/get_nutrition_analytics', {
      method: 'POST',
      body: JSON.stringify({
        p_user_id: userId,
        p_timeframe: timeframe
      })
    }, session);
  } catch (error) {
    console.error('Error getting nutrition analytics:', error);
    throw error;
  }
}

// Update nutrition goals
export async function updateNutritionGoals(user: User | null, goalId: string, updates: {
  daily_calories?: number;
  protein_target?: number;
  carbs_target?: number;
  fats_target?: number;
  meal_frequency?: number;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/nutrition_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error updating nutrition goals:', error);
    throw error;
  }
}

// Delete nutrition goals
export async function deleteNutritionGoals(user: User | null, goalId: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall(`/rest/v1/nutrition_goals8?id=eq.${goalId}&user_id=eq.${userId}`, {
      method: 'DELETE'
    }, session);
  } catch (error) {
    console.error('Error deleting nutrition goals:', error);
    throw error;
  }
}

// Record water intake
export async function recordWaterIntake(user: User | null, data: {
  amount: number;
  unit: string;
}, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    await supabaseRestCall('/rest/v1/water_tracking8', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    console.error('Error recording water intake:', error);
    throw error;
  }
}

// Get water intake history
export async function getWaterIntakeHistory(user: User | null, startDate?: string, endDate?: string, session?: { access_token: string } | null) {
  const userId = getUserId(user);
  try {
    let url = `/rest/v1/water_tracking8?user_id=eq.${userId}&order=timestamp.desc`;
    if (startDate) url += `&timestamp=gte.${startDate}`;
    if (endDate) url += `&timestamp=lte.${endDate}`;
    
    return await supabaseRestCall(url, {}, session);
  } catch (error) {
    console.error('Error getting water intake history:', error);
    throw error;
  }
} 