import { z } from "zod";

export const GameCategorySchema = z.enum([
  // Cognitive Enhancement Games
  "memory",           // Memory and recall
  "attention",        // Focus and attention
  "problem_solving",  // Logic and reasoning
  "strategy",         // Strategic thinking
  "language",         // Verbal and language skills
  "math",            // Mathematical thinking
  "visual_spatial",   // Visual and spatial skills
  "processing_speed", // Processing speed
  "writing",          // Writing skills
  "mindfulness",      // Mindfulness exercises
  
  // Mental Health Games
  "relaxation",       // Relaxation games
  "emotion",          // Emotional intelligence
  "stress_relief",    // Stress management
  "meditation",       // Meditation exercises
  
  // Energy Management Games
  "energy_boost",     // Quick energy games
  "focus_restore",    // Focus restoration
  "wind_down",        // Evening wind-down
  "morning_boost",    // Morning activation
]);

export type GameCategory = 
  | 'memory'
  | 'attention'
  | 'problem_solving'
  | 'strategy'
  | 'language'
  | 'math'
  | 'visual_spatial'
  | 'processing_speed'
  | 'writing'
  | 'mindfulness';

export const GameTypeSchema = z.enum([
  // Memory Games
  "sequence_recall",      // Remember and repeat sequences
  "pattern_match",        // Match patterns
  "spatial_memory",       // Remember object locations
  "working_memory",       // N-back and similar
  "associative_memory",   // Pair association games
  
  // Attention Games
  "sustained_attention",  // Continuous performance
  "divided_attention",    // Multi-tasking games
  "selective_attention",  // Find target among distractors
  "attention_switch",     // Task switching games
  
  // Processing Games
  "reaction_time",       // Quick response games
  "processing_speed",    // Fast pattern recognition
  "visual_search",       // Quick visual scanning
  
  // Problem Solving
  "logic_puzzle",        // Logic-based puzzles
  "pattern_completion",  // Complete the pattern
  "strategic_planning",  // Planning ahead games
  "rule_discovery",      // Find hidden rules
  
  // Visual Spatial
  "mental_rotation",     // Rotate objects mentally
  "spatial_navigation",  // Navigate 3D spaces
  "pattern_recognition", // Recognize visual patterns
  "block_construction",  // Build with blocks
  
  // Language Games
  "word_association",    // Connect related words
  "vocabulary_builder",  // Learn new words
  "sentence_completion", // Complete sentences
  "verbal_fluency",      // Generate words rapidly
  
  // Math Games
  "mental_arithmetic",   // Quick calculations
  "number_patterns",     // Find number patterns
  "estimation",          // Estimate quantities
  "math_logic",         // Mathematical reasoning
  
  // Mindfulness Games
  "breath_awareness",    // Breathing exercises
  "body_scan",          // Body awareness
  "mindful_observation", // Observe details
  "thought_bubbles",     // Watch thoughts pass
  
  // Relaxation Games
  "color_flow",         // Calming color exercises
  "sound_journey",      // Peaceful sound games
  "nature_walk",        // Virtual nature walks
  "bubble_pop",         // Calming bubble popping
  
  // Emotion Games
  "emotion_recognition", // Identify emotions
  "mood_tracker",       // Track mood changes
  "empathy_builder",    // Build empathy
  "emotional_regulation", // Regulate emotions
  
  // Stress Relief
  "stress_buster",      // Release stress
  "calm_breather",      // Breathing for calm
  "tension_release",    // Release physical tension
  "worry_noter",        // Note and release worries
  
  // Meditation
  "guided_meditation",  // Guided sessions
  "open_awareness",     // Open monitoring
  "loving_kindness",    // Metta meditation
  "body_meditation",    // Body-focused meditation
  
  // Energy Management
  "energy_breather",    // Energizing breathing
  "power_posing",       // Energizing poses
  "quick_activator",    // Quick energy boosts
  "focus_charger"       // Focus restoration
]);

export type GameType = z.infer<typeof GameTypeSchema>;

export interface GameConfig {
  id: string;
  type: GameType;
  category: GameCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // in minutes
  energyImpact: "low" | "medium" | "high";
  moodImpact: "calming" | "neutral" | "energizing";
  settings?: Record<string, any>;
}

export interface GameMetrics {
  reactionTime?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  streaks?: number;
  focusScore?: number;
  energyImpact?: number;
  wordsPerMinute?: number;
  vocabularyLevel?: number;
  grammarScore?: number;
  clarityIndex?: number;
  speedProgression?: number;
  complexityLevel?: number;
  mindfulnessScore?: number;
}

export interface GameProgress {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  accuracy: number;
  timeSpent: number;
  difficulty: string;
  completedAt: string;
  metrics: GameMetrics;
}

export interface GameAchievement {
  id: string;
  userId: string;
  gameId: string;
  type: string;
  title: string;
  description: string;
  criteria: Record<string, any>;
  unlockedAt: string;
}

export interface GameStats {
  id: string;
  userId: string;
  gameType: GameType;
  totalTimePlayed: number;
  gamesCompleted: number;
  averageScore: number;
  highScore: number;
  skillLevel: number;
  lastPlayed: string;
  improvement: number;
  streakDays: number;
}

export interface AdaptiveDifficulty {
  baseLevel: number;
  currentLevel: number;
  progressionRate: number;
  adaptationSpeed: number;
  performanceHistory: number[];
  lastUpdated: string;
}

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  startTime: string;
  endTime?: string;
  initialEnergy: number;
  finalEnergy: number;
  moodBefore: string;
  moodAfter: string;
  focusLevel: number;
  stressLevel: number;
  energyImpact: number;
  notes?: string;
}
