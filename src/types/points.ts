import { BaseEntity } from './wellness';

export interface StepPoints extends BaseEntity {
  steps: number;
  pointsEarned: number;
  date: string;
  source: 'healthkit' | 'googlefit' | 'manual';
  verified: boolean;
  bonusMultiplier: number;
  challengeId?: string;
  streakBonus: boolean;
}

export interface Challenge extends BaseEntity {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSteps: number;
  rewardPoints: number;
  bonusMultiplier: number;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ChallengeParticipant extends BaseEntity {
  challengeId: string;
  currentSteps: number;
  status: 'joined' | 'completed' | 'failed';
  joinedAt: string;
  completedAt?: string;
}

export interface SubscriptionReward extends BaseEntity {
  title: string;
  description: string;
  requiredSteps: number;
  rewardType: 'discount' | 'free_trial' | 'free_month';
  rewardValue: number;
  minSubscriptionTier?: string;
  validFrom: string;
  validUntil?: string;
}

export interface UserReward extends BaseEntity {
  rewardId: string;
  claimedAt: string;
  usedAt?: string;
  expiresAt: string;
}

export interface PointsTransaction extends BaseEntity {
  amount: number;
  type: 'earned' | 'spent' | 'expired' | 'bonus' | 'challenge' | 'streak';
  description: string;
  category: 'steps' | 'subscription' | 'store' | 'challenge' | 'streak';
  metadata?: Record<string, unknown>;
}

export interface Reward extends BaseEntity {
  title: string;
  description: string;
  type: 'discount' | 'subscription' | 'product' | 'challenge';
  pointsCost: number;
  value: number;
  expiresAt: string;
  limitedQuantity?: number;
  remainingQuantity?: number;
  conditions?: {
    minSteps?: number;
    minPoints?: number;
    requiredSubscriptionTier?: string;
    requiredStreak?: number;
  };
}

export interface StoreProduct extends BaseEntity {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  pointsDiscount?: {
    pointsCost: number;
    discountPercentage: number;
    minStreak?: number;
    bonusDiscount?: number;
  };
  inventory: number;
  metadata?: Record<string, unknown>;
}

export interface UserPoints extends BaseEntity {
  totalPoints: number;
  lifetimePoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  streakMultiplier: number;
  weeklyGoal: number;
  monthlyGoal: number;
  weeklyProgress: number;
  monthlyProgress: number;
  level: number;
  nextLevelPoints: number;
}
