import { rpc } from './db';
import type { User } from '@supabase/supabase-js';
import type { 
  StepPoints, 
  Challenge,
  SubscriptionReward,
  StoreProduct,
  PointsTransaction as DBPointsTransaction,
  ProductPurchase as DBProductPurchase,
  StreakUpdate as DBStreakUpdate
} from '@/integrations/supabase/types';

export interface PointsTransaction {
  userId: string;
  points: number;
  reason: string;
  metadata?: Record<string, any>;
}

export interface ProductPurchase {
  userId: string;
  productId: string;
  quantity: number;
  metadata?: Record<string, any>;
}

export interface StreakUpdate {
  userId: string;
  activityType: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Helper to get user ID from response
const getUserId = (user: User | null): string => {
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

/**
 * Process step points for a user
 */
export async function processStepPoints(user: User | null, steps: StepPoints) {
  const userId = getUserId(user);
  const { data, error } = await rpc('process_step_points', {
    p_user_id: userId,
    p_steps: steps.steps,
    p_source: steps.source
  });
  if (error) throw error;
  return data;
}

/**
 * Get active challenges
 */
export async function getActiveChallenges(): Promise<Challenge[]> {
  const { data, error } = await rpc('get_active_challenges');
  if (error) throw error;
  return data as Challenge[];
}

/**
 * Join a challenge
 */
export async function joinChallenge(user: User | null, challengeId: string) {
  const userId = getUserId(user);
  const { error } = await rpc('join_challenge', {
    challenge_id: challengeId,
    user_id: userId
  });
  if (error) throw error;
}

/**
 * Get user's challenges
 */
export async function getUserChallenges(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_user_challenges', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}

/**
 * Get available subscription rewards
 */
export async function getAvailableSubscriptionRewards(): Promise<SubscriptionReward[]> {
  const { data, error } = await rpc('get_available_subscription_rewards');
  if (error) throw error;
  return data as SubscriptionReward[];
}

/**
 * Claim a subscription reward
 */
export async function claimSubscriptionReward(user: User | null, rewardId: string) {
  const userId = getUserId(user);
  const { error } = await rpc('claim_subscription_reward', {
    user_id: userId,
    reward_id: rewardId,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  });
  if (error) throw error;
}

/**
 * Get user points
 */
export async function getUserPoints(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_user_points', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}

/**
 * Updates user points with a transaction
 */
export async function updateUserPoints(transaction: PointsTransaction) {
  const { error } = await rpc('update_user_points_with_transaction', transaction);
  if (error) throw error;
}

/**
 * Purchases a product with points
 */
export async function purchaseProduct(purchase: ProductPurchase) {
  const { error } = await rpc('purchase_product', purchase);
  if (error) throw error;
}

/**
 * Updates user streak for an activity
 */
export async function updateUserStreak(update: StreakUpdate) {
  const { error } = await rpc('update_user_streak', update);
  if (error) throw error;
}

/**
 * Get store products
 */
export async function getStoreProducts(): Promise<StoreProduct[]> {
  const { data: userPoints } = await rpc('get_user_points');
  const { data: products, error } = await rpc('get_store_products');

  if (error) throw error;
  return (products as StoreProduct[]).map((product) => ({
    ...product,
    discounted: userPoints?.current_streak >= 7
  }));
}

/**
 * Get points transaction history
 */
export async function getTransactionHistory(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_points_transactions', {
    user_id: userId
  });
  if (error) throw error;
  return data as DBPointsTransaction[];
}

/**
 * Get streak stats
 */
export async function getStreakStats(user: User | null) {
  const userId = getUserId(user);
  const { data, error } = await rpc('get_streak_stats', {
    user_id: userId
  });
  if (error) throw error;
  return data;
}
