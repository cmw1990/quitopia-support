export interface FocusStrategy {
  id: string; // UUID
  user_id: string | null; // UUID of the user if personalized, null if default/global
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  name: string;
  description: string;
  category: string; // e.g., 'Time Management', 'Distraction Control', 'Energy Management', 'ADHD Specific'
  scientific_backing: string | null; // Link or brief description of evidence
  implementation_guide: string | null; // Steps or tips on how to use it
  tags: string[] | null; // Keywords like 'pomodoro', 'planning', 'mindfulness'
  is_favorite: boolean; // User-specific flag
  user_effectiveness_rating: number | null; // User's subjective rating (e.g., 1-5)
  usage_count: number; // How many times the user applied this strategy
  last_used_at: string | null; // ISO 8601 timestamp
}

// DTO for creating default/global strategies (no user_id initially)
export interface CreateDefaultFocusStrategyDto extends Omit<FocusStrategy, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_favorite' | 'user_effectiveness_rating' | 'usage_count' | 'last_used_at'> {

}

// DTO for when a user interacts with a strategy (e.g., favoriting, rating)
// This might involve creating a user-specific record linked to a default one,
// or updating a user-specific record.
export interface UpdateUserFocusStrategyDto extends Partial<Pick<FocusStrategy, 'is_favorite' | 'user_effectiveness_rating' | 'usage_count' | 'last_used_at'>> {
  // Requires strategy_id and user_id for targeting the update
}

// Simplified representation for listing/display
export interface FocusStrategyListItem extends Pick<FocusStrategy, 'id' | 'name' | 'description' | 'category' | 'tags' | 'is_favorite'> {
  // Add other fields if needed for display cards
} 