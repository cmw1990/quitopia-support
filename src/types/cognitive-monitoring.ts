import { z } from 'zod';

export const CognitiveLoadLevel = z.enum([
  'low',
  'moderate',
  'high',
  'optimal',
  'excessive'
]);

export type CognitiveLoadLevel = z.infer<typeof CognitiveLoadLevel>;

export interface CognitiveVitals {
  id: string;
  userId: string;
  timestamp: string;
  focusScore: number;
  mentalFatigue: number;
  cognitiveLoad: CognitiveLoadLevel;
  attentionSpan: number;
  workingMemoryCapacity: number;
  processingSpeed: number;
  errorRate: number;
  responseLatency: number;
  taskSwitchingCost: number;
  energyLevel: number;
}

export interface CognitiveSession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  sessionType: 'work' | 'training' | 'assessment' | 'recovery';
  initialVitals: CognitiveVitals;
  finalVitals: CognitiveVitals;
  tasks: CognitiveTask[];
  breaks: BreakInterval[];
  performance: SessionPerformance;
  energyImpact: number;
}

export interface CognitiveTask {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  complexity: number;
  accuracy: number;
  completionTime: number;
  cognitiveLoad: CognitiveLoadLevel;
  energyDrain: number;
}

export interface BreakInterval {
  id: string;
  startTime: string;
  endTime: string;
  type: 'microbreak' | 'mindfulness' | 'movement' | 'power_nap';
  effectiveness: number;
  energyRecovery: number;
}

export interface SessionPerformance {
  focusQuality: number;
  productivityScore: number;
  errorRate: number;
  learningProgress: number;
  adaptationLevel: number;
  fatigueIndex: number;
  recoveryRate: number;
}

export interface CognitiveProfile {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  domains: {
    attention: DomainMetrics;
    memory: DomainMetrics;
    executive: DomainMetrics;
    processing: DomainMetrics;
    verbal: DomainMetrics;
    visual: DomainMetrics;
  };
  patterns: {
    peakHours: string[];
    fatiguePoints: string[];
    optimalDuration: number;
    recoveryNeeds: number;
  };
  correlations: {
    sleep: number;
    exercise: number;
    nutrition: number;
    stress: number;
    socialInteraction: number;
  };
}

export interface DomainMetrics {
  score: number;
  potential: number;
  progress: number;
  consistency: number;
  fatigueResistance: number;
  recoveryRate: number;
  exercises: RecommendedExercise[];
}

export interface RecommendedExercise {
  id: string;
  type: string;
  difficulty: number;
  duration: number;
  frequency: number;
  expectedImpact: number;
  energyRequirement: number;
}

export interface NeuroplasticityMetrics {
  id: string;
  userId: string;
  timestamp: string;
  learningRate: number;
  adaptability: number;
  recoverySpeed: number;
  skillRetention: number;
  interferenceResistance: number;
  consolidationQuality: number;
}

export interface CognitiveReport {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  summary: {
    overallProgress: number;
    keyImprovements: string[];
    challenges: string[];
    recommendations: string[];
  };
  metrics: {
    averageFocus: number;
    peakPerformance: number;
    recoveryEfficiency: number;
    learningProgress: number;
    energyManagement: number;
  };
  insights: {
    patterns: Record<string, any>;
    correlations: Record<string, number>;
    predictions: Record<string, any>;
  };
}
