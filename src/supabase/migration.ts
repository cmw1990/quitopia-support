// import { createClient } from '@supabase/supabase-js'; // Removed Supabase client
import { Pool } from 'pg'; // Import Pool directly
import type { PoolClient } from 'pg'; // Keep PoolClient type import
import { DATABASE_SCHEMA } from '../integrations/supabase/db-client'; // Keep DATABASE_SCHEMA, REMOVED .js extension
import { pathToFileURL } from 'url'; // Added for ESM main module check
// import { runContextSwitchingMigration } from '../services/db-migrations/context-switching-migration'; // This was commented out later, keep it removed/commented
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

/**
 * Database Migration Script (SSOT8001 compliant)
 * 
 * This script creates all necessary tables for the easier-focus application
 * following the SSOT8001 guidelines.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

// Initialize pg Pool
const pool = new Pool({
  connectionString: connectionString,
});

// Add error listener for the pool
pool.on('error', (err: Error, client: PoolClient) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});

// SQL statements for creating tables
const createTableStatements = [
  // Drop tables first to ensure clean slate (especially for energy_plans)
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.energy_plans} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.focus_sessions} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.focus_tasks} CASCADE;`, // Drop others for idempotency too
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.focus_settings} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.focus_distractions} CASCADE;`,
  `DROP TABLE IF EXISTS focus_stats CASCADE;`, // Corrected table name
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.adhd_assessments} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.coping_strategies} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.mood_triggers} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.energy_logs} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.energy_metrics} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.block_rules} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.distraction_logs} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.cognitive_assessments} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.cognitive_exercises} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.cognitive_progress} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.context_switching_templates} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.context_saved_contexts} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.context_switch_logs} CASCADE;`,
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.context_switch_stats} CASCADE;`,
  `DROP TABLE IF EXISTS body_doubling_sessions CASCADE;`, // Add drop for body doubling
  `DROP TABLE IF EXISTS body_doubling_participants CASCADE;`, // Add drop for participants
  `DROP TABLE IF EXISTS ${DATABASE_SCHEMA.tables.context_snapshots} CASCADE;`,
  `DROP TABLE IF EXISTS focus_strategies CASCADE;`, // ADDED DROP
  `DROP TABLE IF EXISTS recovery_recommendations CASCADE;`, // ADDED DROP
  
  // Focus sessions table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.focus_sessions} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration INTEGER,
    focus_score INTEGER,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Focus tasks table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.focus_tasks} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    urgency TEXT CHECK (urgency IN ('urgent', 'important', 'normal', 'low')),
    importance TEXT CHECK (importance IN ('high', 'medium', 'low')),
    estimated_load INTEGER CHECK (estimated_load BETWEEN 1 AND 5),
    due_date TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    parent_task_id UUID REFERENCES ${DATABASE_SCHEMA.tables.focus_tasks}(id) ON DELETE SET NULL,
    "order" INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    scheduled_start_time TIMESTAMPTZ NULL, -- Added from DATABASE_MIGRATIONS.md
    scheduled_end_time TIMESTAMPTZ NULL,   -- Added from DATABASE_MIGRATIONS.md
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Focus settings table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.focus_settings} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_length INTEGER NOT NULL DEFAULT 25,
    break_length INTEGER NOT NULL DEFAULT 5,
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    theme TEXT NOT NULL DEFAULT 'light',
    allowlist_websites TEXT[] NULL DEFAULT '{}', -- Added from DATABASE_MIGRATIONS.md
    anti_fatigue_settings JSONB NULL, -- ADDED based on error report
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
  );`,

  // Focus distractions table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.focus_distractions} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES ${DATABASE_SCHEMA.tables.focus_sessions}(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Corrected Focus stats table (based on ssot8001 and dashboard needs)
  `CREATE TABLE IF NOT EXISTS focus_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- Added date field, crucial for daily stats
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_minutes INTEGER NOT NULL DEFAULT 0, -- Renamed from total_minutes_focused
    longest_session INTEGER DEFAULT 0, -- Using INTEGER based on ssot8001
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    focus_score INTEGER, -- Added based on dashboard query and ssot8001
    average_cognitive_load FLOAT, -- Added based on ssot8001
    distraction_count INTEGER DEFAULT 0, -- Added based on ssot8001
    mood_energy_correlation FLOAT, -- Added based on ssot8001
    current_streak INTEGER NOT NULL DEFAULT 0, -- Kept from original migration
    longest_streak INTEGER NOT NULL DEFAULT 0, -- Kept from original migration
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date) -- Make unique per user per day
  );`,

  // ADHD assessments table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.adhd_assessments} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    score INTEGER NOT NULL,
    intensity_level TEXT CHECK (intensity_level IN ('mild', 'moderate', 'severe')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Coping strategies table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.coping_strategies} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    strategy_name TEXT NOT NULL,
    category TEXT NOT NULL,
    effectiveness_rating INTEGER NOT NULL CHECK (effectiveness_rating BETWEEN 1 AND 10),
    used_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Mood triggers table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.mood_triggers} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trigger_name TEXT NOT NULL,
    trigger_category TEXT NOT NULL,
    impact_level INTEGER NOT NULL CHECK (impact_level BETWEEN 1 AND 10),
    frequency TEXT NOT NULL CHECK (frequency IN ('rarely', 'sometimes', 'often', 'very_often')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Energy plans table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.energy_plans} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('boost', 'recharge', 'maintain')),
    activities JSONB NOT NULL,
    duration_minutes INTEGER NOT NULL,
    effectiveness_rating INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Energy logs table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.energy_logs} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
    mood TEXT NOT NULL CHECK (mood IN ('terrible', 'bad', 'neutral', 'good', 'great')),
    activities_completed JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Energy metrics table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.energy_metrics} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    average_energy_level FLOAT NOT NULL DEFAULT 0,
    lowest_energy_time TEXT,
    highest_energy_time TEXT,
    energy_pattern JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
  );`,

  // Block rules table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.block_rules} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('website', 'app', 'notification', 'keyword')),
    pattern TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    schedule JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Distraction logs table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.distraction_logs} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    distraction_type TEXT NOT NULL,
    source TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER,
    context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Cognitive assessments table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.cognitive_assessments} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Cognitive exercises table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.cognitive_exercises} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_name TEXT NOT NULL,
    description TEXT NOT NULL,
    target_area TEXT NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    duration_minutes INTEGER NOT NULL,
    instructions JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Cognitive progress table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.cognitive_progress} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES ${DATABASE_SCHEMA.tables.cognitive_exercises}(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    completion_time INTEGER,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Context switching templates table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.context_switching_templates} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    steps JSONB NOT NULL,
    duration INTEGER NOT NULL,
    cognitive_load TEXT CHECK (cognitive_load IN ('low', 'medium', 'high')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Context saved contexts table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.context_saved_contexts} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    task TEXT NOT NULL,
    notes TEXT,
    resources JSONB,
    progress INTEGER,
    cognitive_load TEXT CHECK (cognitive_load IN ('low', 'medium', 'high')),
    complexity INTEGER CHECK (complexity BETWEEN 1 AND 10),
    context_snapshot JSONB,
    last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Context switch logs table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.context_switch_logs} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_context_id UUID REFERENCES ${DATABASE_SCHEMA.tables.context_saved_contexts}(id) ON DELETE SET NULL,
    to_context_id UUID REFERENCES ${DATABASE_SCHEMA.tables.context_saved_contexts}(id) ON DELETE SET NULL,
    template_id UUID REFERENCES ${DATABASE_SCHEMA.tables.context_switching_templates}(id) ON DELETE SET NULL,
    from_context_name TEXT,
    to_context_name TEXT,
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Context switch stats table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.context_switch_stats} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    switch_count INTEGER DEFAULT 0,
    average_switch_time FLOAT DEFAULT 0,
    total_switch_time INTEGER DEFAULT 0,
    most_frequent_contexts JSONB,
    cognitive_load_level TEXT CHECK (cognitive_load_level IN ('low', 'medium', 'high')),
    daily_switches JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
  );`,

  // Context snapshots table
  `CREATE TABLE IF NOT EXISTS ${DATABASE_SCHEMA.tables.context_snapshots} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    context_id UUID REFERENCES ${DATABASE_SCHEMA.tables.context_saved_contexts}(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    links JSONB,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  
  // Body Doubling Sessions table
  `CREATE TABLE IF NOT EXISTS body_doubling_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
    max_participants INTEGER NOT NULL DEFAULT 5 CHECK (max_participants > 0),
    current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
    is_public BOOLEAN NOT NULL DEFAULT true,
    join_code TEXT NULL UNIQUE,
    scheduled_start_time TIMESTAMPTZ NULL,
    actual_start_time TIMESTAMPTZ NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    actual_end_time TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // Body Doubling Participants table (Example structure)
  `CREATE TABLE IF NOT EXISTS body_doubling_participants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES body_doubling_sessions(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      join_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(session_id, user_id) -- Ensure user can only join once
  );`,
  // *** ADDED focus_achievements TABLE DEFINITION ***
  `CREATE TABLE IF NOT EXISTS focus_achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      achievement_id TEXT NOT NULL, -- Changed to TEXT based on ssot8001 line 613
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      difficulty INTEGER,
      progress INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      completion_date TIMESTAMPTZ,
      reward TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      -- Consider adding UNIQUE(user_id, achievement_id) if achievements are unique per user
  );`,
  // *** END ADDED focus_achievements TABLE DEFINITION ***
 
  // *** ADDED focus_strategies TABLE DEFINITION (based on ssot8001) ***
  `CREATE TABLE IF NOT EXISTS focus_strategies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Foreign key based on ssot8001 relationship
      strategy_name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      effectiveness_rating INTEGER, -- User rating
      times_used INTEGER DEFAULT 0,
      best_for_task_types TEXT[],
      scientific_backing TEXT,
      personalized_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      -- Consider adding UNIQUE(user_id, strategy_name) if strategies are unique per user
  );`,
  // *** END ADDED focus_strategies TABLE DEFINITION ***
 
  // *** ADDED recovery_recommendations TABLE DEFINITION (inferred structure) ***
  `CREATE TABLE IF NOT EXISTS recovery_recommendations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      category TEXT, -- e.g., 'physical', 'mental', 'social'
      estimated_duration_minutes INTEGER,
      related_strategy_id UUID REFERENCES focus_strategies(id) ON DELETE SET NULL, -- Optional link
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  // *** END ADDED recovery_recommendations TABLE DEFINITION ***
  // Updated trigger function for handling updated_at timestamps
  `CREATE OR REPLACE FUNCTION handle_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`
];

// Create policies for row-level security
const createPolicies = [
  // Focus sessions RLS
  `ALTER TABLE ${DATABASE_SCHEMA.tables.focus_sessions} ENABLE ROW LEVEL SECURITY;`, // Re-enable RLS
  `DROP POLICY IF EXISTS "Users can view their own focus sessions" ON ${DATABASE_SCHEMA.tables.focus_sessions};`,
  `CREATE POLICY "Users can view their own focus sessions"
    ON ${DATABASE_SCHEMA.tables.focus_sessions} FOR SELECT
    USING (auth.uid() = user_id);`, // Re-enable SELECT policy
  `DROP POLICY IF EXISTS "Users can create their own focus sessions" ON ${DATABASE_SCHEMA.tables.focus_sessions};`,
  `CREATE POLICY "Users can create their own focus sessions"
    ON ${DATABASE_SCHEMA.tables.focus_sessions} FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can update their own focus sessions" ON ${DATABASE_SCHEMA.tables.focus_sessions};`,
  `CREATE POLICY "Users can update their own focus sessions"
    ON ${DATABASE_SCHEMA.tables.focus_sessions} FOR UPDATE
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can delete their own focus sessions" ON ${DATABASE_SCHEMA.tables.focus_sessions};`,
  `CREATE POLICY "Users can delete their own focus sessions"
    ON ${DATABASE_SCHEMA.tables.focus_sessions} FOR DELETE
    USING (auth.uid() = user_id);`,
// Focus tasks RLS
`ALTER TABLE ${DATABASE_SCHEMA.tables.focus_tasks} ENABLE ROW LEVEL SECURITY;`, // Re-enable RLS
`DROP POLICY IF EXISTS "Users can view their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks};`,
`CREATE POLICY "Users can view their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks} FOR SELECT USING (auth.uid() = user_id);`, // Re-enable SELECT policy
`DROP POLICY IF EXISTS "Users can create their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks};`,
`CREATE POLICY "Users can create their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can update their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks};`,
`CREATE POLICY "Users can update their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks} FOR UPDATE USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can delete their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks};`,
`CREATE POLICY "Users can delete their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks} FOR DELETE USING (auth.uid() = user_id);`,

// Focus settings RLS
`ALTER TABLE ${DATABASE_SCHEMA.tables.focus_settings} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own focus settings" ON ${DATABASE_SCHEMA.tables.focus_settings};`,
`CREATE POLICY "Users can view their own focus settings" ON ${DATABASE_SCHEMA.tables.focus_settings} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can upsert their own focus settings" ON ${DATABASE_SCHEMA.tables.focus_settings};`, // Typically upsert (insert/update)
`CREATE POLICY "Users can upsert their own focus settings" ON ${DATABASE_SCHEMA.tables.focus_settings} FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`, // Allow ALL for upsert

// Focus distractions RLS
`ALTER TABLE ${DATABASE_SCHEMA.tables.focus_distractions} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own focus distractions" ON ${DATABASE_SCHEMA.tables.focus_distractions};`,
`CREATE POLICY "Users can view their own focus distractions" ON ${DATABASE_SCHEMA.tables.focus_distractions} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own focus distractions" ON ${DATABASE_SCHEMA.tables.focus_distractions};`,
`CREATE POLICY "Users can create their own focus distractions" ON ${DATABASE_SCHEMA.tables.focus_distractions} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
// No update/delete usually needed for simple log tables

// Corrected Focus stats RLS -- RE-ENABLING
`ALTER TABLE focus_stats ENABLE ROW LEVEL SECURITY;`, // Re-enable RLS
`DROP POLICY IF EXISTS "Users can view their own focus stats" ON focus_stats;`,
`CREATE POLICY "Users can view their own focus stats" ON focus_stats FOR SELECT USING (auth.uid() = user_id);`, // Re-enable SELECT policy
`DROP POLICY IF EXISTS "Users can upsert their own focus stats" ON focus_stats;`,
`CREATE POLICY "Users can upsert their own focus stats" ON focus_stats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`,

// Coping strategies RLS
`ALTER TABLE ${DATABASE_SCHEMA.tables.coping_strategies} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own coping strategies" ON ${DATABASE_SCHEMA.tables.coping_strategies};`,
`CREATE POLICY "Users can view their own coping strategies" ON ${DATABASE_SCHEMA.tables.coping_strategies} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own coping strategies" ON ${DATABASE_SCHEMA.tables.coping_strategies};`,
`CREATE POLICY "Users can create their own coping strategies" ON ${DATABASE_SCHEMA.tables.coping_strategies} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can update their own coping strategies" ON ${DATABASE_SCHEMA.tables.coping_strategies};`,
`CREATE POLICY "Users can update their own coping strategies" ON ${DATABASE_SCHEMA.tables.coping_strategies} FOR UPDATE USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can delete their own coping strategies" ON ${DATABASE_SCHEMA.tables.coping_strategies};`,
`CREATE POLICY "Users can delete their own coping strategies" ON ${DATABASE_SCHEMA.tables.coping_strategies} FOR DELETE USING (auth.uid() = user_id);`,

// Mood triggers RLS (Re-adding)
`ALTER TABLE ${DATABASE_SCHEMA.tables.mood_triggers} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own mood triggers" ON ${DATABASE_SCHEMA.tables.mood_triggers};`,
`CREATE POLICY "Users can view their own mood triggers" ON ${DATABASE_SCHEMA.tables.mood_triggers} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own mood triggers" ON ${DATABASE_SCHEMA.tables.mood_triggers};`,
`CREATE POLICY "Users can create their own mood triggers" ON ${DATABASE_SCHEMA.tables.mood_triggers} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can update their own mood triggers" ON ${DATABASE_SCHEMA.tables.mood_triggers};`,
`CREATE POLICY "Users can update their own mood triggers" ON ${DATABASE_SCHEMA.tables.mood_triggers} FOR UPDATE USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can delete their own mood triggers" ON ${DATABASE_SCHEMA.tables.mood_triggers};`,
`CREATE POLICY "Users can delete their own mood triggers" ON ${DATABASE_SCHEMA.tables.mood_triggers} FOR DELETE USING (auth.uid() = user_id);`,

// Energy plans RLS (Re-adding)
`ALTER TABLE ${DATABASE_SCHEMA.tables.energy_plans} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own energy plans" ON ${DATABASE_SCHEMA.tables.energy_plans};`,
`CREATE POLICY "Users can view their own energy plans" ON ${DATABASE_SCHEMA.tables.energy_plans} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own energy plans" ON ${DATABASE_SCHEMA.tables.energy_plans};`,
`CREATE POLICY "Users can create their own energy plans" ON ${DATABASE_SCHEMA.tables.energy_plans} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can update their own energy plans" ON ${DATABASE_SCHEMA.tables.energy_plans};`,
`CREATE POLICY "Users can update their own energy plans" ON ${DATABASE_SCHEMA.tables.energy_plans} FOR UPDATE USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can delete their own energy plans" ON ${DATABASE_SCHEMA.tables.energy_plans};`,
`CREATE POLICY "Users can delete their own energy plans" ON ${DATABASE_SCHEMA.tables.energy_plans} FOR DELETE USING (auth.uid() = user_id);`,

// Energy logs RLS (Re-adding)
`ALTER TABLE ${DATABASE_SCHEMA.tables.energy_logs} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own energy logs" ON ${DATABASE_SCHEMA.tables.energy_logs};`,
`CREATE POLICY "Users can view their own energy logs" ON ${DATABASE_SCHEMA.tables.energy_logs} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own energy logs" ON ${DATABASE_SCHEMA.tables.energy_logs};`,
`CREATE POLICY "Users can create their own energy logs" ON ${DATABASE_SCHEMA.tables.energy_logs} FOR INSERT WITH CHECK (auth.uid() = user_id);`,

// Energy metrics RLS (Re-adding)
`ALTER TABLE ${DATABASE_SCHEMA.tables.energy_metrics} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own energy metrics" ON ${DATABASE_SCHEMA.tables.energy_metrics};`,
`CREATE POLICY "Users can view their own energy metrics" ON ${DATABASE_SCHEMA.tables.energy_metrics} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can upsert their own energy metrics" ON ${DATABASE_SCHEMA.tables.energy_metrics};`,
`CREATE POLICY "Users can upsert their own energy metrics" ON ${DATABASE_SCHEMA.tables.energy_metrics} FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`,

// Block rules RLS (Re-adding)
`ALTER TABLE ${DATABASE_SCHEMA.tables.block_rules} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own block rules" ON ${DATABASE_SCHEMA.tables.block_rules};`,
`CREATE POLICY "Users can view their own block rules" ON ${DATABASE_SCHEMA.tables.block_rules} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own block rules" ON ${DATABASE_SCHEMA.tables.block_rules};`,
`CREATE POLICY "Users can create their own block rules" ON ${DATABASE_SCHEMA.tables.block_rules} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can update their own block rules" ON ${DATABASE_SCHEMA.tables.block_rules};`,
`CREATE POLICY "Users can update their own block rules" ON ${DATABASE_SCHEMA.tables.block_rules} FOR UPDATE USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can delete their own block rules" ON ${DATABASE_SCHEMA.tables.block_rules};`,
`CREATE POLICY "Users can delete their own block rules" ON ${DATABASE_SCHEMA.tables.block_rules} FOR DELETE USING (auth.uid() = user_id);`,

// Distraction logs RLS (Re-adding)
`ALTER TABLE ${DATABASE_SCHEMA.tables.distraction_logs} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own distraction logs" ON ${DATABASE_SCHEMA.tables.distraction_logs};`,
`CREATE POLICY "Users can view their own distraction logs" ON ${DATABASE_SCHEMA.tables.distraction_logs} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own distraction logs" ON ${DATABASE_SCHEMA.tables.distraction_logs};`,
`CREATE POLICY "Users can create their own distraction logs" ON ${DATABASE_SCHEMA.tables.distraction_logs} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
// No update/delete usually needed

// Cognitive assessments RLS
`ALTER TABLE ${DATABASE_SCHEMA.tables.cognitive_assessments} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own cog assessments" ON ${DATABASE_SCHEMA.tables.cognitive_assessments};`,
`CREATE POLICY "Users can view their own cog assessments" ON ${DATABASE_SCHEMA.tables.cognitive_assessments} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own cog assessments" ON ${DATABASE_SCHEMA.tables.cognitive_assessments};`,
`CREATE POLICY "Users can create their own cog assessments" ON ${DATABASE_SCHEMA.tables.cognitive_assessments} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
// Usually no update/delete for assessments

// Cognitive exercises RLS (Assuming public read, private modifications? Adjust if needed)
`ALTER TABLE ${DATABASE_SCHEMA.tables.cognitive_exercises} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Allow public read access to exercises" ON ${DATABASE_SCHEMA.tables.cognitive_exercises};`,
`CREATE POLICY "Allow public read access to exercises" ON ${DATABASE_SCHEMA.tables.cognitive_exercises} FOR SELECT USING (true);`,
// Admins can manage:
// `DROP POLICY IF EXISTS "Admin manage exercises" ON ${DATABASE_SCHEMA.tables.cognitive_exercises};`,
// `CREATE POLICY "Admin manage exercises" ON ${DATABASE_SCHEMA.tables.cognitive_exercises} FOR ALL USING (is_admin());`, // Requires is_admin() function

// Cognitive progress RLS
`ALTER TABLE ${DATABASE_SCHEMA.tables.cognitive_progress} ENABLE ROW LEVEL SECURITY;`,
`DROP POLICY IF EXISTS "Users can view their own cog progress" ON ${DATABASE_SCHEMA.tables.cognitive_progress};`,
`CREATE POLICY "Users can view their own cog progress" ON ${DATABASE_SCHEMA.tables.cognitive_progress} FOR SELECT USING (auth.uid() = user_id);`,
`DROP POLICY IF EXISTS "Users can create their own cog progress" ON ${DATABASE_SCHEMA.tables.cognitive_progress};`,
`CREATE POLICY "Users can create their own cog progress" ON ${DATABASE_SCHEMA.tables.cognitive_progress} FOR INSERT WITH CHECK (auth.uid() = user_id);`,
// No update/delete usually

// ADHD assessments RLS (Already defined above, ensure consistency)
  // ADHD assessments RLS
  `ALTER TABLE ${DATABASE_SCHEMA.tables.adhd_assessments} ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can view their own cognitive assessments" ON ${DATABASE_SCHEMA.tables.adhd_assessments};`,
  `CREATE POLICY "Users can view their own cognitive assessments"
    ON ${DATABASE_SCHEMA.tables.adhd_assessments} FOR SELECT
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can create their own cognitive assessments" ON ${DATABASE_SCHEMA.tables.adhd_assessments};`,
  `CREATE POLICY "Users can create their own cognitive assessments"
    ON ${DATABASE_SCHEMA.tables.adhd_assessments} FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can update their own cognitive assessments" ON ${DATABASE_SCHEMA.tables.adhd_assessments};`,
  `CREATE POLICY "Users can update their own cognitive assessments"
    ON ${DATABASE_SCHEMA.tables.adhd_assessments} FOR UPDATE
    USING (auth.uid() = user_id);`,

  // Digital wellness scores RLS - Commented out as table creation is missing
  /*
  `ALTER TABLE ${DATABASE_SCHEMA.tables.digital_wellness_scores} ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Everyone can view digital wellness scores" ON ${DATABASE_SCHEMA.tables.digital_wellness_scores};`,
  `CREATE POLICY "Everyone can view digital wellness scores"
    ON ${DATABASE_SCHEMA.tables.digital_wellness_scores} FOR SELECT
    USING (true);`,
  `DROP POLICY IF EXISTS "Only admins can manage digital wellness scores" ON ${DATABASE_SCHEMA.tables.digital_wellness_scores};`,
  `CREATE POLICY "Only admins can manage digital wellness scores"
    ON ${DATABASE_SCHEMA.tables.digital_wellness_scores} FOR ALL
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));`,
  */

  // Game stats RLS - Commented out as table creation is missing
  /*
  `ALTER TABLE ${DATABASE_SCHEMA.tables.game_stats} ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can view their own game stats" ON ${DATABASE_SCHEMA.tables.game_stats};`,
  `CREATE POLICY "Users can view their own game stats"
    ON ${DATABASE_SCHEMA.tables.game_stats} FOR SELECT
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can create their own game stats" ON ${DATABASE_SCHEMA.tables.game_stats};`,
  `CREATE POLICY "Users can create their own game stats"
    ON ${DATABASE_SCHEMA.tables.game_stats} FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can update their own game stats" ON ${DATABASE_SCHEMA.tables.game_stats};`,
  `CREATE POLICY "Users can update their own game stats"
    ON ${DATABASE_SCHEMA.tables.game_stats} FOR UPDATE
    USING (auth.uid() = user_id);`,
  */

  // --- Context Switching Policies (Integrated from context-switching-migration.ts) ---

  // Templates RLS
  `ALTER TABLE ${DATABASE_SCHEMA.tables.context_switching_templates} ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can view all templates" ON ${DATABASE_SCHEMA.tables.context_switching_templates};`,
  `CREATE POLICY "Users can view all templates"
    ON ${DATABASE_SCHEMA.tables.context_switching_templates} FOR SELECT
    USING (true);`, // Note: Changed from context-switching script for broader visibility if intended, adjust if needed.
  `DROP POLICY IF EXISTS "Users can insert their own templates" ON ${DATABASE_SCHEMA.tables.context_switching_templates};`,
  `CREATE POLICY "Users can insert their own templates"
    ON ${DATABASE_SCHEMA.tables.context_switching_templates} FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can update their own templates" ON ${DATABASE_SCHEMA.tables.context_switching_templates};`,
  `CREATE POLICY "Users can update their own templates"
    ON ${DATABASE_SCHEMA.tables.context_switching_templates} FOR UPDATE
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can delete their own templates" ON ${DATABASE_SCHEMA.tables.context_switching_templates};`,
  `CREATE POLICY "Users can delete their own templates"
    ON ${DATABASE_SCHEMA.tables.context_switching_templates} FOR DELETE
    USING (auth.uid() = user_id);`,

  // Saved Contexts RLS
  `ALTER TABLE ${DATABASE_SCHEMA.tables.context_saved_contexts} ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can view their own contexts" ON ${DATABASE_SCHEMA.tables.context_saved_contexts};`,
  `CREATE POLICY "Users can view their own contexts"
    ON ${DATABASE_SCHEMA.tables.context_saved_contexts} FOR SELECT
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can insert their own contexts" ON ${DATABASE_SCHEMA.tables.context_saved_contexts};`,
  `CREATE POLICY "Users can insert their own contexts"
    ON ${DATABASE_SCHEMA.tables.context_saved_contexts} FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can update their own contexts" ON ${DATABASE_SCHEMA.tables.context_saved_contexts};`,
  `CREATE POLICY "Users can update their own contexts"
    ON ${DATABASE_SCHEMA.tables.context_saved_contexts} FOR UPDATE
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can delete their own contexts" ON ${DATABASE_SCHEMA.tables.context_saved_contexts};`,
  `CREATE POLICY "Users can delete their own contexts"
    ON ${DATABASE_SCHEMA.tables.context_saved_contexts} FOR DELETE
    USING (auth.uid() = user_id);`,

  // Switch Logs RLS
  `ALTER TABLE ${DATABASE_SCHEMA.tables.context_switch_logs} ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can view their own logs" ON ${DATABASE_SCHEMA.tables.context_switch_logs};`,
  `CREATE POLICY "Users can view their own logs"
    ON ${DATABASE_SCHEMA.tables.context_switch_logs} FOR SELECT
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can insert their own logs" ON ${DATABASE_SCHEMA.tables.context_switch_logs};`,
  `CREATE POLICY "Users can insert their own logs"
    ON ${DATABASE_SCHEMA.tables.context_switch_logs} FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can update their own logs" ON ${DATABASE_SCHEMA.tables.context_switch_logs};`,
  `CREATE POLICY "Users can update their own logs"
    ON ${DATABASE_SCHEMA.tables.context_switch_logs} FOR UPDATE
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can delete their own logs" ON ${DATABASE_SCHEMA.tables.context_switch_logs};`,
  `CREATE POLICY "Users can delete their own logs"
    ON ${DATABASE_SCHEMA.tables.context_switch_logs} FOR DELETE
    USING (auth.uid() = user_id);`,

  // Switch Stats RLS
  `ALTER TABLE ${DATABASE_SCHEMA.tables.context_switch_stats} ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can view their own stats" ON ${DATABASE_SCHEMA.tables.context_switch_stats};`,
  `CREATE POLICY "Users can view their own stats"
    ON ${DATABASE_SCHEMA.tables.context_switch_stats} FOR SELECT
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can insert their own stats" ON ${DATABASE_SCHEMA.tables.context_switch_stats};`,
  `CREATE POLICY "Users can insert their own stats"
    ON ${DATABASE_SCHEMA.tables.context_switch_stats} FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can update their own stats" ON ${DATABASE_SCHEMA.tables.context_switch_stats};`,
  `CREATE POLICY "Users can update their own stats"
    ON ${DATABASE_SCHEMA.tables.context_switch_stats} FOR UPDATE
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can delete their own stats" ON ${DATABASE_SCHEMA.tables.context_switch_stats};`,
  `CREATE POLICY "Users can delete their own stats"
    ON ${DATABASE_SCHEMA.tables.context_switch_stats} FOR DELETE
    USING (auth.uid() = user_id);`,

  // Snapshots RLS
  `ALTER TABLE ${DATABASE_SCHEMA.tables.context_snapshots} ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can view their own snapshots" ON ${DATABASE_SCHEMA.tables.context_snapshots};`,
  `CREATE POLICY "Users can view their own snapshots"
    ON ${DATABASE_SCHEMA.tables.context_snapshots} FOR SELECT
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can insert their own snapshots" ON ${DATABASE_SCHEMA.tables.context_snapshots};`,
  `CREATE POLICY "Users can insert their own snapshots"
    ON ${DATABASE_SCHEMA.tables.context_snapshots} FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can update their own snapshots" ON ${DATABASE_SCHEMA.tables.context_snapshots};`,
  `CREATE POLICY "Users can update their own snapshots"
    ON ${DATABASE_SCHEMA.tables.context_snapshots} FOR UPDATE
    USING (auth.uid() = user_id);`,
  `DROP POLICY IF EXISTS "Users can delete their own snapshots" ON ${DATABASE_SCHEMA.tables.context_snapshots};`,
  `CREATE POLICY "Users can delete their own snapshots"
    ON ${DATABASE_SCHEMA.tables.context_snapshots} FOR DELETE
    USING (auth.uid() = user_id);`,

  // --- End Context Switching Policies ---

  // Body Doubling Sessions RLS
  `ALTER TABLE body_doubling_sessions ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Allow public read access for public sessions" ON body_doubling_sessions;`,
  `-- Allow anonymous and authenticated users to SELECT public sessions
  CREATE POLICY "Allow public read access for public sessions"
    ON body_doubling_sessions FOR SELECT
    USING (is_public = true);`,
  `DROP POLICY IF EXISTS "Allow host read access" ON body_doubling_sessions;`,
  `-- Allow host to SELECT their own sessions (even if private)
  CREATE POLICY "Allow host read access"
    ON body_doubling_sessions FOR SELECT
    USING (auth.uid() = host_user_id);`,
  `-- Add participant read access if needed (requires join)`,
  `DROP POLICY IF EXISTS "Allow authenticated users to insert sessions" ON body_doubling_sessions;`,
  `CREATE POLICY "Allow authenticated users to insert sessions"
    ON body_doubling_sessions FOR INSERT
    TO authenticated -- Allow any logged-in user to insert
    WITH CHECK (auth.uid() = host_user_id); -- Ensure they set themselves as host`,
  `DROP POLICY IF EXISTS "Allow host to update their own sessions" ON body_doubling_sessions;`,
  `CREATE POLICY "Allow host to update their own sessions"
    ON body_doubling_sessions FOR UPDATE
    USING (auth.uid() = host_user_id)
    WITH CHECK (auth.uid() = host_user_id); -- Added WITH CHECK`,
  `DROP POLICY IF EXISTS "Allow host to delete their own sessions" ON body_doubling_sessions;`,
  `CREATE POLICY "Allow host to delete their own sessions"
    ON body_doubling_sessions FOR DELETE
    USING (auth.uid() = host_user_id);`,

  // Body Doubling Participants RLS (Example)
  `ALTER TABLE body_doubling_participants ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Allow session participants and host to view participants" ON body_doubling_participants;`,
  `CREATE POLICY "Allow session participants and host to view participants"
    ON body_doubling_participants FOR SELECT
    USING (
      (auth.uid() = user_id) OR
      (EXISTS (SELECT 1 FROM body_doubling_sessions WHERE id = session_id AND host_user_id = auth.uid()))
    );`, // Allows user to see their own entry, or host to see all in their session
  `DROP POLICY IF EXISTS "Allow users to join sessions" ON body_doubling_participants;`,
  `CREATE POLICY "Allow users to join sessions"
    ON body_doubling_participants FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);`, // User can only insert themselves
  `DROP POLICY IF EXISTS "Allow users to leave sessions" ON body_doubling_participants;`,
  `CREATE POLICY "Allow users to leave sessions"
    ON body_doubling_participants FOR DELETE
    USING (auth.uid() = user_id);`, // User can only delete themselves
 
 // *** ADDED POLICY FOR EXISTING focus_achievements TABLE ***
 // focus_achievements RLS (Table exists in createTableStatements)
 `ALTER TABLE focus_achievements ENABLE ROW LEVEL SECURITY;`, // Corrected table name reference
 `DROP POLICY IF EXISTS "Users can view their own focus achievements" ON focus_achievements;`,
 `CREATE POLICY "Users can view their own focus achievements"
   ON focus_achievements FOR SELECT
   USING (auth.uid() = user_id);`,
 // ADD INSERT/UPDATE/DELETE if needed based on how achievements are awarded
 `DROP POLICY IF EXISTS "Users can create their own focus achievements" ON focus_achievements;`,
 `CREATE POLICY "Users can create their own focus achievements"
   ON focus_achievements FOR INSERT
   WITH CHECK (auth.uid() = user_id);`, // Allow insert if needed
 // *** END focus_achievements RLS ***
 
 // *** ADDED focus_strategies RLS ***
 `ALTER TABLE focus_strategies ENABLE ROW LEVEL SECURITY;`,
 `DROP POLICY IF EXISTS "Users can view their own focus strategies" ON focus_strategies;`,
 `CREATE POLICY "Users can view their own focus strategies"
   ON focus_strategies FOR SELECT USING (auth.uid() = user_id);`,
 `DROP POLICY IF EXISTS "Users can manage their own focus strategies" ON focus_strategies;`,
 `CREATE POLICY "Users can manage their own focus strategies"
   ON focus_strategies FOR ALL -- Using ALL for INSERT, UPDATE, DELETE
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);`,
 // *** END focus_strategies RLS ***
 
 // *** ADDED recovery_recommendations RLS (Assuming public read) ***
 `ALTER TABLE recovery_recommendations ENABLE ROW LEVEL SECURITY;`,
 `DROP POLICY IF EXISTS "Allow public read access for recovery recommendations" ON recovery_recommendations;`,
 `CREATE POLICY "Allow public read access for recovery recommendations"
   ON recovery_recommendations FOR SELECT USING (true);`,
 // Add admin policies if only admins should manage these
 // `DROP POLICY IF EXISTS "Allow admin manage recovery recommendations" ON recovery_recommendations;`,
 // `CREATE POLICY "Allow admin manage recovery recommendations" ON recovery_recommendations FOR ALL USING (is_admin());` // Requires is_admin() function
 // *** END recovery_recommendations RLS ***
 // Additional tables that would need configuration in the future - stored as a string literal to avoid TypeScript errors
 ];

// SQL statements for creating triggers
const createTriggers = [
  // Focus sessions updated_at trigger
  `DROP TRIGGER IF EXISTS set_focus_sessions_updated_at ON ${DATABASE_SCHEMA.tables.focus_sessions};`,
  `CREATE TRIGGER set_focus_sessions_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.focus_sessions}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,

  // Corrected Focus stats updated_at trigger
  `DROP TRIGGER IF EXISTS set_focus_stats_updated_at ON focus_stats;`,
  `CREATE TRIGGER set_focus_stats_updated_at
    BEFORE UPDATE ON focus_stats
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,

  // User settings updated_at trigger
  `DROP TRIGGER IF EXISTS set_focus_settings_updated_at ON ${DATABASE_SCHEMA.tables.focus_settings};`,
  `CREATE TRIGGER set_focus_settings_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.focus_settings}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,

  // ADHD assessments updated_at trigger
  `DROP TRIGGER IF EXISTS set_adhd_assessments_updated_at ON ${DATABASE_SCHEMA.tables.adhd_assessments};`,
  `CREATE TRIGGER set_adhd_assessments_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.adhd_assessments}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,

  // ADHD strategies updated_at trigger - Commented out as table creation is missing
  /*
  `DROP TRIGGER IF EXISTS set_adhd_strategies_updated_at ON ${DATABASE_SCHEMA.tables.adhd_strategies};`,
  `CREATE TRIGGER set_adhd_strategies_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.adhd_strategies}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  */

  // Distraction patterns updated_at trigger - Commented out as table creation is missing
  /*
  `DROP TRIGGER IF EXISTS set_distraction_patterns_updated_at ON ${DATABASE_SCHEMA.tables.distraction_patterns};`,
  `CREATE TRIGGER set_distraction_patterns_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.distraction_patterns}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  */

  // Energy patterns updated_at trigger - Commented out as table creation is missing
  /*
  `DROP TRIGGER IF EXISTS set_energy_patterns_updated_at ON ${DATABASE_SCHEMA.tables.energy_patterns};`,
  `CREATE TRIGGER set_energy_patterns_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.energy_patterns}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  */

  // Energy levels updated_at trigger - Commented out as table creation is missing
  /*
  `DROP TRIGGER IF EXISTS set_energy_levels_updated_at ON ${DATABASE_SCHEMA.tables.energy_levels};`,
  `CREATE TRIGGER set_energy_levels_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.energy_levels}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  */

  // Energy activities updated_at trigger - Commented out as table creation is missing
  /*
  `DROP TRIGGER IF EXISTS set_energy_activities_updated_at ON ${DATABASE_SCHEMA.tables.energy_activities};`,
  `CREATE TRIGGER set_energy_activities_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.energy_activities}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  */

  // Website block rules updated_at trigger - Commented out as table creation is missing
  /*
  `DROP TRIGGER IF EXISTS set_website_block_rules_updated_at ON ${DATABASE_SCHEMA.tables.website_block_rules};`,
  `CREATE TRIGGER set_website_block_rules_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.website_block_rules}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  */

  // ADHD tools updated_at trigger - Commented out as table creation is missing
  /*
  `DROP TRIGGER IF EXISTS set_adhd_tools_updated_at ON ${DATABASE_SCHEMA.tables.adhd_tools};`,
  `CREATE TRIGGER set_adhd_tools_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.adhd_tools}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  */

  // Game stats updated_at trigger - Commented out as table creation is missing
  /*
  `DROP TRIGGER IF EXISTS set_game_stats_updated_at ON ${DATABASE_SCHEMA.tables.game_stats};`,
  `CREATE TRIGGER set_game_stats_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.game_stats}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
   */

  // --- Context Switching Triggers (Integrated from context-switching-migration.ts, using handle_updated_at) ---

  // Context switching templates updated_at trigger
  `DROP TRIGGER IF EXISTS set_context_templates_updated_at ON ${DATABASE_SCHEMA.tables.context_switching_templates};`,
  `CREATE TRIGGER set_context_templates_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.context_switching_templates}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,

  // Context saved contexts updated_at trigger
  `DROP TRIGGER IF EXISTS set_context_contexts_updated_at ON ${DATABASE_SCHEMA.tables.context_saved_contexts};`,
  `CREATE TRIGGER set_context_contexts_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.context_saved_contexts}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  
  // Context switch stats updated_at trigger
  `DROP TRIGGER IF EXISTS set_context_stats_updated_at ON ${DATABASE_SCHEMA.tables.context_switch_stats};`,
  `CREATE TRIGGER set_context_stats_updated_at
    BEFORE UPDATE ON ${DATABASE_SCHEMA.tables.context_switch_stats}
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,

  // --- End Context Switching Triggers ---
    
  // Body Doubling Sessions updated_at trigger
  `DROP TRIGGER IF EXISTS set_body_doubling_sessions_updated_at ON body_doubling_sessions;`,
  `CREATE TRIGGER set_body_doubling_sessions_updated_at
    BEFORE UPDATE ON body_doubling_sessions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();`,
  // *** ADDED focus_achievements updated_at trigger ***
  `DROP TRIGGER IF EXISTS set_focus_achievements_updated_at ON focus_achievements;`,
  `CREATE TRIGGER set_focus_achievements_updated_at
      BEFORE UPDATE ON focus_achievements
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();`,
  // *** END ADDED focus_achievements updated_at trigger ***
  // *** ADDED focus_strategies updated_at trigger ***
  `DROP TRIGGER IF EXISTS set_focus_strategies_updated_at ON focus_strategies;`,
  `CREATE TRIGGER set_focus_strategies_updated_at
      BEFORE UPDATE ON focus_strategies
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();`,
  // *** END ADDED focus_strategies updated_at trigger ***
  // *** ADDED recovery_recommendations updated_at trigger ***
  `DROP TRIGGER IF EXISTS set_recovery_recommendations_updated_at ON recovery_recommendations;`,
  `CREATE TRIGGER set_recovery_recommendations_updated_at
      BEFORE UPDATE ON recovery_recommendations
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();`
  // *** END ADDED recovery_recommendations updated_at trigger ***
];

// SQL statements for granting permissions
const grantPermissions = [
  `GRANT USAGE ON SCHEMA public TO authenticated, anon;`, // Combine grants
  `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;`, // Use standard ALL PRIVILEGES
  `GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;`, // Grant SELECT to anon role on ALL tables by default (RLS will restrict)
  `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;`, // Use standard ALL PRIVILEGES
  `GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;`, // Grant USAGE on sequences to anon
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO authenticated;`, // Default grant for authenticated
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;`, // Default SELECT for anon
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO authenticated;`, // Default sequence grant
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO anon;` // Default sequence usage for anon
];

// Execute SQL function using pg Pool
const executeSQL = async (sql: string): Promise<void> => {
  const client: PoolClient = await pool.connect();
  try {
    await client.query(sql);
    console.log(`SQL executed successfully: ${sql.substring(0, 60)}...`);
  } catch (error) {
    console.error(`Error executing SQL: ${sql.substring(0, 60)}...`, error);
    throw error; // Re-throw the error to be caught by runMigration
  } finally {
    client.release(); // Release the client back to the pool
  }
};

// Removed createExecuteSQLFunction as it's not needed with pg direct connection

// Main migration function
export const runMigration = async (): Promise<void> => {
  console.log('Starting database migration (SSOT8001 compliant)...');
  
  try {
    // Connect to DB to ensure connection works before running migrations
    console.log('Connecting to database...');
    const client: PoolClient = await pool.connect();
    console.log('Database connection successful.');
    client.release();
    
    // Create tables
    console.log('Creating tables...');
    for (const sql of createTableStatements) {
      await executeSQL(sql);
    }
    
    // Create RLS policies
    console.log('Creating RLS policies...');
    for (const sql of createPolicies) {
      await executeSQL(sql);
    }
    
    // Create triggers
    console.log('Creating triggers...');
    for (const sql of createTriggers) {
      await executeSQL(sql);
    }
    
    // Grant permissions
    console.log('Granting permissions...');
    for (const sql of grantPermissions) {
      await executeSQL(sql);
    }
    
    // Context switching migration is now integrated into the main script above.
    // console.log('Running context switching migration...'); // Removed redundant call
    // await runContextSwitchingMigration(); // Removed redundant call
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error; // Re-throw original error
  } finally {
    console.log('Ending migration script, closing connection pool.');
    await pool.end(); // Ensure pool is closed regardless of success/failure
  }
};

// Run the migration if this script is executed directly
// Check if this script is being run directly in Node.js (ESM way)
const isMainModule = typeof window === 'undefined' && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  runMigration()
    .then(async () => {
      console.log('Migration script finished.');
      // Pool should be ended in the finally block of runMigration
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Migration script failed:', err);
       // Pool should be ended in the finally block of runMigration
      process.exit(1);
    });
} 