export interface Strategy {
  id: string; // UUID, primary key
  title: string;
  description: string;
  category: string; // e.g., "Time Management", "Mindfulness", "Environment"
  effectiveness_rating?: number | null; // Optional: Could be average or user-specific later
  external_url?: string | null; // Optional link for more details
  // Add other relevant fields like 'when_to_use', 'resources_needed', etc.
  created_at?: string;
}

// Example Categories (can be defined elsewhere or dynamically fetched)
export const STRATEGY_CATEGORIES = [
  "Time Management",
  "Mindfulness",
  "Environment Control",
  "Task Decomposition",
  "Energy Management",
  "Motivation & Reward",
  "Planning & Organization",
  "Distraction Management", // Matches Distraction Blocker
]; 