// Game difficulty level
export type GameDifficulty = 'easy' | 'medium' | 'hard';

// Game categories for organization and filtering
export type GameCategory = 
  | 'breathing' 
  | 'distraction' 
  | 'focus' 
  | 'relaxation'
  | 'puzzle';

// Base game interface with common properties
export interface Game {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  thumbnail: string;
  playTime: number; // in minutes
  benefits: string[];
}

// Interface for game progress tracking
export interface GameProgress {
  userId: string;
  gameId: string;
  playCount: number;
  lastPlayed: string;
  bestScore?: number;
  totalTimePlayed: number; // in seconds
  achievements: string[];
}

// Interface for game stats
export interface GameStats {
  timesPlayed: number;
  averageScore: number;
  highScore: number;
  totalTimePlayed: number; // in seconds
  mostPlayed: boolean;
}

// Common props for all game components
export interface GameComponentProps {
  session: any;
  onComplete?: (score: number) => void;
  difficulty?: GameDifficulty;
  onBack?: () => void;
} 