// Database Schema and Client for Supabase
// Following SSOT8001 guidelines with direct REST API calls

import { createClient } from '@supabase/supabase-js';

// Database Schema
export const DATABASE_SCHEMA = {
  tables: {
    // Focus Core Tables
    focus_sessions: 'focus_sessions8',
    focus_tasks: 'focus_tasks',
    focus_stats: 'focus_stats',
    focus_settings: 'focus_settings',
    focus_strategies: 'focus_strategies',
    focus_distractions: 'focus_distractions',
    focus_moods: 'focus_moods',
    focus_achievements: 'focus_achievements',
    focus_environment_logs: 'focus_environment_logs',
    focus_environment_stats: 'focus_environment_stats',
    focus_environment_status: 'focus_environment_status',
    focus_goals: 'focus_goals',
    focus_patterns: 'focus_patterns',
    focus_logs: 'focus_logs',
    focus_recommendations: 'focus_recommendations',
    
    // Energy and Analysis Tables
    energy_plans: 'energy_plans',
    energy_logs: 'energy_logs',
    energy_metrics: 'energy_metrics',
    energy_focus_logs: 'energy_focus_logs',
    
    // ADHD Support Tables
    adhd_assessments: 'adhd_assessments',
    coping_strategies: 'coping_strategies',
    mood_triggers: 'mood_triggers',
    
    // Blocker and Distraction Tables
    block_rules: 'block_rules',
    distraction_logs: 'distraction_logs',
    
    // Cognitive Assessment Tables
    cognitive_assessments: 'cognitive_assessments',
    cognitive_exercises: 'cognitive_exercises',
    cognitive_progress: 'cognitive_progress',
    
    // Context Switching Tables
    context_switching_templates: 'context_switching_templates',
    context_saved_contexts: 'context_saved_contexts',
    context_switch_logs: 'context_switch_logs',
    context_switch_stats: 'context_switch_stats',
    context_snapshots: 'context_snapshots'
  }
};

// Get Supabase connection details from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create and export the Supabase client
export const dbClient = createClient(supabaseUrl, supabaseAnonKey);

// For debugging
console.log('DB Client initialized with URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING');

export default dbClient; 