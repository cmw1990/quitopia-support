"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = void 0;
// import { createClient } from '@supabase/supabase-js'; // Removed Supabase client
var pg_1 = require("pg"); // Use default import for pg
var Pool = pg_1.default.Pool; // Destructure Pool from the default import
var db_client_1 = require("../integrations/supabase/db-client"); // Keep DATABASE_SCHEMA
var url_1 = require("url"); // Added for ESM main module check
// import { runContextSwitchingMigration } from '../services/db-migrations/context-switching-migration'; // This was commented out later, keep it removed/commented
/**
 * Database Migration Script (SSOT8001 compliant)
 *
 * This script creates all necessary tables for the easier-focus application
 * following the SSOT8001 guidelines.
 */
// Database connection string using pg
var connectionString = 'postgresql://postgres.zoubqdwxemivxrjruvam:Superstrongpasswordfor5527@@@@aws-0-us-west-1.pooler.supabase.com:5432/postgres';
// Initialize pg Pool
var pool = new Pool({
    connectionString: connectionString,
});
// Add error listener for the pool
pool.on('error', function (err, client) {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
// SQL statements for creating tables
var createTableStatements = [
    // Drop tables first to ensure clean slate (especially for energy_plans)
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, " CASCADE;"), // Drop others for idempotency too
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_settings, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_distractions, " CASCADE;"),
    "DROP TABLE IF EXISTS focus_stats CASCADE;", // Corrected table name
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_assessments, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_exercises, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_progress, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, " CASCADE;"),
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, " CASCADE;"),
    "DROP TABLE IF EXISTS body_doubling_sessions CASCADE;", // Add drop for body doubling
    "DROP TABLE IF EXISTS body_doubling_participants CASCADE;", // Add drop for participants
    "DROP TABLE IF EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, " CASCADE;"),
    "DROP TABLE IF EXISTS focus_strategies CASCADE;", // ADDED DROP
    "DROP TABLE IF EXISTS recovery_recommendations CASCADE;", // ADDED DROP
    // Focus sessions table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    end_time TIMESTAMPTZ,\n    duration INTEGER,\n    focus_score INTEGER,\n    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),\n    notes TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Focus tasks table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    title TEXT NOT NULL,\n    notes TEXT,\n    completed BOOLEAN NOT NULL DEFAULT FALSE,\n    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),\n    urgency TEXT CHECK (urgency IN ('urgent', 'important', 'normal', 'low')),\n    importance TEXT CHECK (importance IN ('high', 'medium', 'low')),\n    estimated_load INTEGER CHECK (estimated_load BETWEEN 1 AND 5),\n    due_date TIMESTAMPTZ,\n    tags TEXT[] DEFAULT '{}',\n    parent_task_id UUID REFERENCES ").concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, "(id) ON DELETE SET NULL,\n    \"order\" INTEGER,\n    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),\n    scheduled_start_time TIMESTAMPTZ NULL, -- Added from DATABASE_MIGRATIONS.md\n    scheduled_end_time TIMESTAMPTZ NULL,   -- Added from DATABASE_MIGRATIONS.md\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Focus settings table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_settings, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    session_length INTEGER NOT NULL DEFAULT 25,\n    break_length INTEGER NOT NULL DEFAULT 5,\n    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,\n    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,\n    theme TEXT NOT NULL DEFAULT 'light',\n    allowlist_websites TEXT[] NULL DEFAULT '{}', -- Added from DATABASE_MIGRATIONS.md\n    anti_fatigue_settings JSONB NULL, -- ADDED based on error report\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    UNIQUE(user_id)\n  );"),
    // Focus distractions table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_distractions, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    session_id UUID REFERENCES ").concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, "(id) ON DELETE CASCADE,\n    description TEXT NOT NULL,\n    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Corrected Focus stats table (based on ssot8001 and dashboard needs)
    "CREATE TABLE IF NOT EXISTS focus_stats (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    date DATE NOT NULL, -- Added date field, crucial for daily stats\n    total_sessions INTEGER NOT NULL DEFAULT 0,\n    total_minutes INTEGER NOT NULL DEFAULT 0, -- Renamed from total_minutes_focused\n    longest_session INTEGER DEFAULT 0, -- Using INTEGER based on ssot8001\n    completed_tasks INTEGER NOT NULL DEFAULT 0,\n    focus_score INTEGER, -- Added based on dashboard query and ssot8001\n    average_cognitive_load FLOAT, -- Added based on ssot8001\n    distraction_count INTEGER DEFAULT 0, -- Added based on ssot8001\n    mood_energy_correlation FLOAT, -- Added based on ssot8001\n    current_streak INTEGER NOT NULL DEFAULT 0, -- Kept from original migration\n    longest_streak INTEGER NOT NULL DEFAULT 0, -- Kept from original migration\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    UNIQUE(user_id, date) -- Make unique per user per day\n  );",
    // ADHD assessments table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,\n    score INTEGER NOT NULL,\n    intensity_level TEXT CHECK (intensity_level IN ('mild', 'moderate', 'severe')),\n    notes TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Coping strategies table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    strategy_name TEXT NOT NULL,\n    category TEXT NOT NULL,\n    effectiveness_rating INTEGER NOT NULL CHECK (effectiveness_rating BETWEEN 1 AND 10),\n    used_count INTEGER NOT NULL DEFAULT 0,\n    notes TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Mood triggers table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    trigger_name TEXT NOT NULL,\n    trigger_category TEXT NOT NULL,\n    impact_level INTEGER NOT NULL CHECK (impact_level BETWEEN 1 AND 10),\n    frequency TEXT NOT NULL CHECK (frequency IN ('rarely', 'sometimes', 'often', 'very_often')),\n    notes TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Energy plans table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    plan_name TEXT NOT NULL,\n    plan_type TEXT NOT NULL CHECK (plan_type IN ('boost', 'recharge', 'maintain')),\n    activities JSONB NOT NULL,\n    duration_minutes INTEGER NOT NULL,\n    effectiveness_rating INTEGER,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Energy logs table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    log_date DATE NOT NULL DEFAULT CURRENT_DATE,\n    energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),\n    mood TEXT NOT NULL CHECK (mood IN ('terrible', 'bad', 'neutral', 'good', 'great')),\n    activities_completed JSONB,\n    notes TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Energy metrics table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    average_energy_level FLOAT NOT NULL DEFAULT 0,\n    lowest_energy_time TEXT,\n    highest_energy_time TEXT,\n    energy_pattern JSONB,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    UNIQUE(user_id)\n  );"),
    // Block rules table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    rule_name TEXT NOT NULL,\n    rule_type TEXT NOT NULL CHECK (rule_type IN ('website', 'app', 'notification', 'keyword')),\n    pattern TEXT NOT NULL,\n    is_active BOOLEAN NOT NULL DEFAULT TRUE,\n    schedule JSONB,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Distraction logs table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    distraction_type TEXT NOT NULL,\n    source TEXT NOT NULL,\n    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    duration_seconds INTEGER,\n    context TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Cognitive assessments table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_assessments, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    assessment_type TEXT NOT NULL,\n    score INTEGER NOT NULL,\n    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,\n    details JSONB,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Cognitive exercises table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_exercises, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    exercise_name TEXT NOT NULL,\n    description TEXT NOT NULL,\n    target_area TEXT NOT NULL,\n    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),\n    duration_minutes INTEGER NOT NULL,\n    instructions JSONB NOT NULL,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Cognitive progress table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_progress, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    exercise_id UUID REFERENCES ").concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_exercises, "(id) ON DELETE CASCADE,\n    score INTEGER NOT NULL,\n    completion_time INTEGER,\n    log_date DATE NOT NULL DEFAULT CURRENT_DATE,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Context switching templates table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    name TEXT NOT NULL,\n    steps JSONB NOT NULL,\n    duration INTEGER NOT NULL,\n    cognitive_load TEXT CHECK (cognitive_load IN ('low', 'medium', 'high')),\n    is_default BOOLEAN DEFAULT FALSE,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Context saved contexts table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    name TEXT NOT NULL,\n    task TEXT NOT NULL,\n    notes TEXT,\n    resources JSONB,\n    progress INTEGER,\n    cognitive_load TEXT CHECK (cognitive_load IN ('low', 'medium', 'high')),\n    complexity INTEGER CHECK (complexity BETWEEN 1 AND 10),\n    context_snapshot JSONB,\n    last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Context switch logs table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    from_context_id UUID REFERENCES ").concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, "(id) ON DELETE SET NULL,\n    to_context_id UUID REFERENCES ").concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, "(id) ON DELETE SET NULL,\n    template_id UUID REFERENCES ").concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, "(id) ON DELETE SET NULL,\n    from_context_name TEXT,\n    to_context_name TEXT,\n    duration_seconds INTEGER,\n    completed BOOLEAN DEFAULT FALSE,\n    notes TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Context switch stats table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    switch_count INTEGER DEFAULT 0,\n    average_switch_time FLOAT DEFAULT 0,\n    total_switch_time INTEGER DEFAULT 0,\n    most_frequent_contexts JSONB,\n    cognitive_load_level TEXT CHECK (cognitive_load_level IN ('low', 'medium', 'high')),\n    daily_switches JSONB,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    UNIQUE(user_id)\n  );"),
    // Context snapshots table
    "CREATE TABLE IF NOT EXISTS ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, " (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    context_id UUID REFERENCES ").concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, "(id) ON DELETE CASCADE,\n    description TEXT NOT NULL,\n    links JSONB,\n    image_url TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );"),
    // Body Doubling Sessions table
    "CREATE TABLE IF NOT EXISTS body_doubling_sessions (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n    title TEXT NOT NULL,\n    description TEXT NULL,\n    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),\n    max_participants INTEGER NOT NULL DEFAULT 5 CHECK (max_participants > 0),\n    current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),\n    is_public BOOLEAN NOT NULL DEFAULT true,\n    join_code TEXT NULL UNIQUE,\n    scheduled_start_time TIMESTAMPTZ NULL,\n    actual_start_time TIMESTAMPTZ NULL,\n    estimated_duration_minutes INTEGER NOT NULL,\n    actual_end_time TIMESTAMPTZ NULL,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );",
    // Body Doubling Participants table (Example structure)
    "CREATE TABLE IF NOT EXISTS body_doubling_participants (\n      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n      session_id UUID NOT NULL REFERENCES body_doubling_sessions(id) ON DELETE CASCADE,\n      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n      join_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n      UNIQUE(session_id, user_id) -- Ensure user can only join once\n  );",
    // *** ADDED focus_achievements TABLE DEFINITION ***
    "CREATE TABLE IF NOT EXISTS focus_achievements (\n      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n      achievement_id TEXT NOT NULL, -- Changed to TEXT based on ssot8001 line 613\n      name TEXT NOT NULL,\n      description TEXT,\n      category TEXT,\n      difficulty INTEGER,\n      progress INTEGER DEFAULT 0,\n      completed BOOLEAN DEFAULT FALSE,\n      completion_date TIMESTAMPTZ,\n      reward TEXT,\n      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n      -- Consider adding UNIQUE(user_id, achievement_id) if achievements are unique per user\n  );",
    // *** END ADDED focus_achievements TABLE DEFINITION ***
    // *** ADDED focus_strategies TABLE DEFINITION (based on ssot8001) ***
    "CREATE TABLE IF NOT EXISTS focus_strategies (\n      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Foreign key based on ssot8001 relationship\n      strategy_name TEXT NOT NULL,\n      description TEXT,\n      category TEXT,\n      effectiveness_rating INTEGER, -- User rating\n      times_used INTEGER DEFAULT 0,\n      best_for_task_types TEXT[],\n      scientific_backing TEXT,\n      personalized_notes TEXT,\n      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n      -- Consider adding UNIQUE(user_id, strategy_name) if strategies are unique per user\n  );",
    // *** END ADDED focus_strategies TABLE DEFINITION ***
    // *** ADDED recovery_recommendations TABLE DEFINITION (inferred structure) ***
    "CREATE TABLE IF NOT EXISTS recovery_recommendations (\n      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n      name TEXT NOT NULL UNIQUE,\n      description TEXT,\n      category TEXT, -- e.g., 'physical', 'mental', 'social'\n      estimated_duration_minutes INTEGER,\n      related_strategy_id UUID REFERENCES focus_strategies(id) ON DELETE SET NULL, -- Optional link\n      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  );",
    // *** END ADDED recovery_recommendations TABLE DEFINITION ***
    // Updated trigger function for handling updated_at timestamps
    "CREATE OR REPLACE FUNCTION handle_updated_at()\n  RETURNS TRIGGER AS $$\n  BEGIN\n    NEW.updated_at = NOW();\n    RETURN NEW;\n  END;\n  $$ LANGUAGE plpgsql;"
];
// Create policies for row-level security
var createPolicies = [
    // Focus sessions RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, " DISABLE ROW LEVEL SECURITY;"), // TEMP: Disable RLS
    "DROP POLICY IF EXISTS \"Users can view their own focus sessions\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, ";"),
    // `CREATE POLICY "Users can view their own focus sessions"
    //  ON ${DATABASE_SCHEMA.tables.focus_sessions} FOR SELECT
    //  USING (auth.uid() = user_id);`,
    "DROP POLICY IF EXISTS \"Users can create their own focus sessions\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, ";"),
    "CREATE POLICY \"Users can create their own focus sessions\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, " FOR INSERT\n    WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own focus sessions\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, ";"),
    "CREATE POLICY \"Users can update their own focus sessions\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, " FOR UPDATE\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own focus sessions\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, ";"),
    "CREATE POLICY \"Users can delete their own focus sessions\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, " FOR DELETE\n    USING (auth.uid() = user_id);"),
    // Focus tasks RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, " DISABLE ROW LEVEL SECURITY;"), // TEMP: Disable RLS
    "DROP POLICY IF EXISTS \"Users can view their own focus tasks\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, ";"),
    // `CREATE POLICY "Users can view their own focus tasks" ON ${DATABASE_SCHEMA.tables.focus_tasks} FOR SELECT USING (auth.uid() = user_id);`,
    "DROP POLICY IF EXISTS \"Users can create their own focus tasks\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, ";"),
    "CREATE POLICY \"Users can create their own focus tasks\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own focus tasks\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, ";"),
    "CREATE POLICY \"Users can update their own focus tasks\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, " FOR UPDATE USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own focus tasks\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, ";"),
    "CREATE POLICY \"Users can delete their own focus tasks\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_tasks, " FOR DELETE USING (auth.uid() = user_id);"),
    // Focus settings RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_settings, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own focus settings\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_settings, ";"),
    "CREATE POLICY \"Users can view their own focus settings\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_settings, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can upsert their own focus settings\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_settings, ";"), // Typically upsert (insert/update)
    "CREATE POLICY \"Users can upsert their own focus settings\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_settings, " FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);"), // Allow ALL for upsert
    // Focus distractions RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_distractions, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own focus distractions\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_distractions, ";"),
    "CREATE POLICY \"Users can view their own focus distractions\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_distractions, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own focus distractions\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_distractions, ";"),
    "CREATE POLICY \"Users can create their own focus distractions\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_distractions, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    // No update/delete usually needed for simple log tables
    // Corrected Focus stats RLS -- RE-ENABLING
    "ALTER TABLE focus_stats DISABLE ROW LEVEL SECURITY;", // TEMP: Disable RLS
    "DROP POLICY IF EXISTS \"Users can view their own focus stats\" ON focus_stats;",
    // `CREATE POLICY "Users can view their own focus stats" ON focus_stats FOR SELECT USING (auth.uid() = user_id);`, // Restore original policy later
    "DROP POLICY IF EXISTS \"Users can upsert their own focus stats\" ON focus_stats;",
    "CREATE POLICY \"Users can upsert their own focus stats\" ON focus_stats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);",
    // Coping strategies RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own coping strategies\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, ";"),
    "CREATE POLICY \"Users can view their own coping strategies\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own coping strategies\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, ";"),
    "CREATE POLICY \"Users can create their own coping strategies\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own coping strategies\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, ";"),
    "CREATE POLICY \"Users can update their own coping strategies\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, " FOR UPDATE USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own coping strategies\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, ";"),
    "CREATE POLICY \"Users can delete their own coping strategies\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.coping_strategies, " FOR DELETE USING (auth.uid() = user_id);"),
    // Mood triggers RLS (Re-adding)
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, ";"),
    "CREATE POLICY \"Users can view their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, ";"),
    "CREATE POLICY \"Users can create their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, ";"),
    "CREATE POLICY \"Users can update their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " FOR UPDATE USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, ";"),
    "CREATE POLICY \"Users can delete their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " FOR DELETE USING (auth.uid() = user_id);"),
    // Energy plans RLS (Re-adding)
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, ";"),
    "CREATE POLICY \"Users can view their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, ";"),
    "CREATE POLICY \"Users can create their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, ";"),
    "CREATE POLICY \"Users can update their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " FOR UPDATE USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, ";"),
    "CREATE POLICY \"Users can delete their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " FOR DELETE USING (auth.uid() = user_id);"),
    // Energy logs RLS (Re-adding)
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own energy logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, ";"),
    "CREATE POLICY \"Users can view their own energy logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own energy logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, ";"),
    "CREATE POLICY \"Users can create their own energy logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    // Energy metrics RLS (Re-adding)
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own energy metrics\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, ";"),
    "CREATE POLICY \"Users can view their own energy metrics\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can upsert their own energy metrics\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, ";"),
    "CREATE POLICY \"Users can upsert their own energy metrics\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, " FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);"),
    // Block rules RLS (Re-adding)
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, ";"),
    "CREATE POLICY \"Users can view their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, ";"),
    "CREATE POLICY \"Users can create their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, ";"),
    "CREATE POLICY \"Users can update their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " FOR UPDATE USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, ";"),
    "CREATE POLICY \"Users can delete their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " FOR DELETE USING (auth.uid() = user_id);"),
    // Distraction logs RLS (Re-adding)
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own distraction logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, ";"),
    "CREATE POLICY \"Users can view their own distraction logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own distraction logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, ";"),
    "CREATE POLICY \"Users can create their own distraction logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    // Mood triggers RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, ";"),
    "CREATE POLICY \"Users can view their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, ";"),
    "CREATE POLICY \"Users can create their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, ";"),
    "CREATE POLICY \"Users can update their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " FOR UPDATE USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, ";"),
    "CREATE POLICY \"Users can delete their own mood triggers\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.mood_triggers, " FOR DELETE USING (auth.uid() = user_id);"),
    // Energy plans RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, ";"),
    "CREATE POLICY \"Users can view their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, ";"),
    "CREATE POLICY \"Users can create their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, ";"),
    "CREATE POLICY \"Users can update their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " FOR UPDATE USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, ";"),
    "CREATE POLICY \"Users can delete their own energy plans\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_plans, " FOR DELETE USING (auth.uid() = user_id);"),
    // Energy logs RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own energy logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, ";"),
    "CREATE POLICY \"Users can view their own energy logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own energy logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, ";"),
    "CREATE POLICY \"Users can create their own energy logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_logs, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    // No update/delete usually needed
    // Energy metrics RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own energy metrics\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, ";"),
    "CREATE POLICY \"Users can view their own energy metrics\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can upsert their own energy metrics\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, ";"),
    "CREATE POLICY \"Users can upsert their own energy metrics\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.energy_metrics, " FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);"),
    // Block rules RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, ";"),
    "CREATE POLICY \"Users can view their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, ";"),
    "CREATE POLICY \"Users can create their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, ";"),
    "CREATE POLICY \"Users can update their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " FOR UPDATE USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, ";"),
    "CREATE POLICY \"Users can delete their own block rules\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.block_rules, " FOR DELETE USING (auth.uid() = user_id);"),
    // Distraction logs RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own distraction logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, ";"),
    "CREATE POLICY \"Users can view their own distraction logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own distraction logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, ";"),
    "CREATE POLICY \"Users can create their own distraction logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.distraction_logs, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    // No update/delete usually needed
    // Cognitive assessments RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_assessments, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own cog assessments\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_assessments, ";"),
    "CREATE POLICY \"Users can view their own cog assessments\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_assessments, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own cog assessments\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_assessments, ";"),
    "CREATE POLICY \"Users can create their own cog assessments\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_assessments, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    // Usually no update/delete for assessments
    // Cognitive exercises RLS (Assuming public read, private modifications? Adjust if needed)
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_exercises, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Allow public read access to exercises\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_exercises, ";"),
    "CREATE POLICY \"Allow public read access to exercises\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_exercises, " FOR SELECT USING (true);"),
    // Admins can manage:
    // `DROP POLICY IF EXISTS "Admin manage exercises" ON ${DATABASE_SCHEMA.tables.cognitive_exercises};`,
    // `CREATE POLICY "Admin manage exercises" ON ${DATABASE_SCHEMA.tables.cognitive_exercises} FOR ALL USING (is_admin());`, // Requires is_admin() function
    // Cognitive progress RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_progress, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own cog progress\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_progress, ";"),
    "CREATE POLICY \"Users can view their own cog progress\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_progress, " FOR SELECT USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own cog progress\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_progress, ";"),
    "CREATE POLICY \"Users can create their own cog progress\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.cognitive_progress, " FOR INSERT WITH CHECK (auth.uid() = user_id);"),
    // No update/delete usually
    // ADHD assessments RLS (Already defined above, ensure consistency)
    // ADHD assessments RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own cognitive assessments\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, ";"),
    "CREATE POLICY \"Users can view their own cognitive assessments\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, " FOR SELECT\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can create their own cognitive assessments\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, ";"),
    "CREATE POLICY \"Users can create their own cognitive assessments\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, " FOR INSERT\n    WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own cognitive assessments\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, ";"),
    "CREATE POLICY \"Users can update their own cognitive assessments\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, " FOR UPDATE\n    USING (auth.uid() = user_id);"),
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
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view all templates\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, ";"),
    "CREATE POLICY \"Users can view all templates\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, " FOR SELECT\n    USING (true);"), // Note: Changed from context-switching script for broader visibility if intended, adjust if needed.
    "DROP POLICY IF EXISTS \"Users can insert their own templates\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, ";"),
    "CREATE POLICY \"Users can insert their own templates\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, " FOR INSERT\n    WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own templates\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, ";"),
    "CREATE POLICY \"Users can update their own templates\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, " FOR UPDATE\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own templates\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, ";"),
    "CREATE POLICY \"Users can delete their own templates\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, " FOR DELETE\n    USING (auth.uid() = user_id);"),
    // Saved Contexts RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own contexts\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, ";"),
    "CREATE POLICY \"Users can view their own contexts\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, " FOR SELECT\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can insert their own contexts\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, ";"),
    "CREATE POLICY \"Users can insert their own contexts\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, " FOR INSERT\n    WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own contexts\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, ";"),
    "CREATE POLICY \"Users can update their own contexts\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, " FOR UPDATE\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own contexts\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, ";"),
    "CREATE POLICY \"Users can delete their own contexts\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, " FOR DELETE\n    USING (auth.uid() = user_id);"),
    // Switch Logs RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, ";"),
    "CREATE POLICY \"Users can view their own logs\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, " FOR SELECT\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can insert their own logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, ";"),
    "CREATE POLICY \"Users can insert their own logs\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, " FOR INSERT\n    WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, ";"),
    "CREATE POLICY \"Users can update their own logs\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, " FOR UPDATE\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own logs\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, ";"),
    "CREATE POLICY \"Users can delete their own logs\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_logs, " FOR DELETE\n    USING (auth.uid() = user_id);"),
    // Switch Stats RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own stats\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, ";"),
    "CREATE POLICY \"Users can view their own stats\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, " FOR SELECT\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can insert their own stats\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, ";"),
    "CREATE POLICY \"Users can insert their own stats\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, " FOR INSERT\n    WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own stats\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, ";"),
    "CREATE POLICY \"Users can update their own stats\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, " FOR UPDATE\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own stats\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, ";"),
    "CREATE POLICY \"Users can delete their own stats\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, " FOR DELETE\n    USING (auth.uid() = user_id);"),
    // Snapshots RLS
    "ALTER TABLE ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, " ENABLE ROW LEVEL SECURITY;"),
    "DROP POLICY IF EXISTS \"Users can view their own snapshots\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, ";"),
    "CREATE POLICY \"Users can view their own snapshots\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, " FOR SELECT\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can insert their own snapshots\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, ";"),
    "CREATE POLICY \"Users can insert their own snapshots\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, " FOR INSERT\n    WITH CHECK (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can update their own snapshots\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, ";"),
    "CREATE POLICY \"Users can update their own snapshots\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, " FOR UPDATE\n    USING (auth.uid() = user_id);"),
    "DROP POLICY IF EXISTS \"Users can delete their own snapshots\" ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, ";"),
    "CREATE POLICY \"Users can delete their own snapshots\"\n    ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_snapshots, " FOR DELETE\n    USING (auth.uid() = user_id);"),
    // --- End Context Switching Policies ---
    // Body Doubling Sessions RLS
    "ALTER TABLE body_doubling_sessions ENABLE ROW LEVEL SECURITY;",
    "DROP POLICY IF EXISTS \"Allow public read access for public sessions\" ON body_doubling_sessions;",
    "-- Allow anonymous and authenticated users to SELECT public sessions\n  CREATE POLICY \"Allow public read access for public sessions\"\n    ON body_doubling_sessions FOR SELECT\n    USING (is_public = true);",
    "DROP POLICY IF EXISTS \"Allow host read access\" ON body_doubling_sessions;",
    "-- Allow host to SELECT their own sessions (even if private)\n  CREATE POLICY \"Allow host read access\"\n    ON body_doubling_sessions FOR SELECT\n    USING (auth.uid() = host_user_id);",
    "-- Add participant read access if needed (requires join)",
    "DROP POLICY IF EXISTS \"Allow authenticated users to insert sessions\" ON body_doubling_sessions;",
    "CREATE POLICY \"Allow authenticated users to insert sessions\"\n    ON body_doubling_sessions FOR INSERT\n    TO authenticated -- Allow any logged-in user to insert\n    WITH CHECK (auth.uid() = host_user_id); -- Ensure they set themselves as host",
    "DROP POLICY IF EXISTS \"Allow host to update their own sessions\" ON body_doubling_sessions;",
    "CREATE POLICY \"Allow host to update their own sessions\"\n    ON body_doubling_sessions FOR UPDATE\n    USING (auth.uid() = host_user_id)\n    WITH CHECK (auth.uid() = host_user_id); -- Added WITH CHECK",
    "DROP POLICY IF EXISTS \"Allow host to delete their own sessions\" ON body_doubling_sessions;",
    "CREATE POLICY \"Allow host to delete their own sessions\"\n    ON body_doubling_sessions FOR DELETE\n    USING (auth.uid() = host_user_id);",
    // Body Doubling Participants RLS (Example)
    "ALTER TABLE body_doubling_participants ENABLE ROW LEVEL SECURITY;",
    "DROP POLICY IF EXISTS \"Allow session participants and host to view participants\" ON body_doubling_participants;",
    "CREATE POLICY \"Allow session participants and host to view participants\"\n    ON body_doubling_participants FOR SELECT\n    USING (\n      (auth.uid() = user_id) OR\n      (EXISTS (SELECT 1 FROM body_doubling_sessions WHERE id = session_id AND host_user_id = auth.uid()))\n    );", // Allows user to see their own entry, or host to see all in their session
    "DROP POLICY IF EXISTS \"Allow users to join sessions\" ON body_doubling_participants;",
    "CREATE POLICY \"Allow users to join sessions\"\n    ON body_doubling_participants FOR INSERT\n    TO authenticated\n    WITH CHECK (auth.uid() = user_id);", // User can only insert themselves
    "DROP POLICY IF EXISTS \"Allow users to leave sessions\" ON body_doubling_participants;",
    "CREATE POLICY \"Allow users to leave sessions\"\n    ON body_doubling_participants FOR DELETE\n    USING (auth.uid() = user_id);", // User can only delete themselves
    // *** ADDED POLICY FOR EXISTING focus_achievements TABLE ***
    // focus_achievements RLS (Table exists in createTableStatements)
    "ALTER TABLE focus_achievements ENABLE ROW LEVEL SECURITY;", // Corrected table name reference
    "DROP POLICY IF EXISTS \"Users can view their own focus achievements\" ON focus_achievements;",
    "CREATE POLICY \"Users can view their own focus achievements\"\n   ON focus_achievements FOR SELECT\n   USING (auth.uid() = user_id);",
    // ADD INSERT/UPDATE/DELETE if needed based on how achievements are awarded
    "DROP POLICY IF EXISTS \"Users can create their own focus achievements\" ON focus_achievements;",
    "CREATE POLICY \"Users can create their own focus achievements\"\n   ON focus_achievements FOR INSERT\n   WITH CHECK (auth.uid() = user_id);", // Allow insert if needed
    // *** END focus_achievements RLS ***
    // *** ADDED focus_strategies RLS ***
    "ALTER TABLE focus_strategies ENABLE ROW LEVEL SECURITY;",
    "DROP POLICY IF EXISTS \"Users can view their own focus strategies\" ON focus_strategies;",
    "CREATE POLICY \"Users can view their own focus strategies\"\n   ON focus_strategies FOR SELECT USING (auth.uid() = user_id);",
    "DROP POLICY IF EXISTS \"Users can manage their own focus strategies\" ON focus_strategies;",
    "CREATE POLICY \"Users can manage their own focus strategies\"\n   ON focus_strategies FOR ALL -- Using ALL for INSERT, UPDATE, DELETE\n   USING (auth.uid() = user_id)\n   WITH CHECK (auth.uid() = user_id);",
    // *** END focus_strategies RLS ***
    // *** ADDED recovery_recommendations RLS (Assuming public read) ***
    "ALTER TABLE recovery_recommendations ENABLE ROW LEVEL SECURITY;",
    "DROP POLICY IF EXISTS \"Allow public read access for recovery recommendations\" ON recovery_recommendations;",
    "CREATE POLICY \"Allow public read access for recovery recommendations\"\n   ON recovery_recommendations FOR SELECT USING (true);",
    // Add admin policies if only admins should manage these
    // `DROP POLICY IF EXISTS "Allow admin manage recovery recommendations" ON recovery_recommendations;`,
    // `CREATE POLICY "Allow admin manage recovery recommendations" ON recovery_recommendations FOR ALL USING (is_admin());` // Requires is_admin() function
    // *** END recovery_recommendations RLS ***
    // Additional tables that would need configuration in the future - stored as a string literal to avoid TypeScript errors
];
// SQL statements for creating triggers
var createTriggers = [
    // Focus sessions updated_at trigger
    "DROP TRIGGER IF EXISTS set_focus_sessions_updated_at ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, ";"),
    "CREATE TRIGGER set_focus_sessions_updated_at\n    BEFORE UPDATE ON ".concat(db_client_1.DATABASE_SCHEMA.tables.focus_sessions, "\n    FOR EACH ROW\n    EXECUTE FUNCTION handle_updated_at();"),
    // Corrected Focus stats updated_at trigger
    "DROP TRIGGER IF EXISTS set_focus_stats_updated_at ON focus_stats;",
    "CREATE TRIGGER set_focus_stats_updated_at\n    BEFORE UPDATE ON focus_stats\n    FOR EACH ROW\n    EXECUTE FUNCTION handle_updated_at();",
    // User settings updated_at trigger
    "DROP TRIGGER IF EXISTS set_user_settings_updated_at ON ".concat(db_client_1.DATABASE_SCHEMA.tables.user_settings, ";"),
    "CREATE TRIGGER set_user_settings_updated_at\n    BEFORE UPDATE ON ".concat(db_client_1.DATABASE_SCHEMA.tables.user_settings, "\n    FOR EACH ROW\n    EXECUTE FUNCTION handle_updated_at();"),
    // ADHD assessments updated_at trigger
    "DROP TRIGGER IF EXISTS set_adhd_assessments_updated_at ON ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, ";"),
    "CREATE TRIGGER set_adhd_assessments_updated_at\n    BEFORE UPDATE ON ".concat(db_client_1.DATABASE_SCHEMA.tables.adhd_assessments, "\n    FOR EACH ROW\n    EXECUTE FUNCTION handle_updated_at();"),
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
    "DROP TRIGGER IF EXISTS set_context_templates_updated_at ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, ";"),
    "CREATE TRIGGER set_context_templates_updated_at\n    BEFORE UPDATE ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switching_templates, "\n    FOR EACH ROW\n    EXECUTE FUNCTION handle_updated_at();"),
    // Context saved contexts updated_at trigger
    "DROP TRIGGER IF EXISTS set_context_contexts_updated_at ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, ";"),
    "CREATE TRIGGER set_context_contexts_updated_at\n    BEFORE UPDATE ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_saved_contexts, "\n    FOR EACH ROW\n    EXECUTE FUNCTION handle_updated_at();"),
    // Context switch stats updated_at trigger
    "DROP TRIGGER IF EXISTS set_context_stats_updated_at ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, ";"),
    "CREATE TRIGGER set_context_stats_updated_at\n    BEFORE UPDATE ON ".concat(db_client_1.DATABASE_SCHEMA.tables.context_switch_stats, "\n    FOR EACH ROW\n    EXECUTE FUNCTION handle_updated_at();"),
    // --- End Context Switching Triggers ---
    // Body Doubling Sessions updated_at trigger
    "DROP TRIGGER IF EXISTS set_body_doubling_sessions_updated_at ON body_doubling_sessions;",
    "CREATE TRIGGER set_body_doubling_sessions_updated_at\n    BEFORE UPDATE ON body_doubling_sessions\n    FOR EACH ROW\n    EXECUTE FUNCTION handle_updated_at();",
    // *** ADDED focus_achievements updated_at trigger ***
    "DROP TRIGGER IF EXISTS set_focus_achievements_updated_at ON focus_achievements;",
    "CREATE TRIGGER set_focus_achievements_updated_at\n      BEFORE UPDATE ON focus_achievements\n      FOR EACH ROW\n      EXECUTE FUNCTION handle_updated_at();",
    // *** END ADDED focus_achievements updated_at trigger ***
    // *** ADDED focus_strategies updated_at trigger ***
    "DROP TRIGGER IF EXISTS set_focus_strategies_updated_at ON focus_strategies;",
    "CREATE TRIGGER set_focus_strategies_updated_at\n      BEFORE UPDATE ON focus_strategies\n      FOR EACH ROW\n      EXECUTE FUNCTION handle_updated_at();",
    // *** END ADDED focus_strategies updated_at trigger ***
    // *** ADDED recovery_recommendations updated_at trigger ***
    "DROP TRIGGER IF EXISTS set_recovery_recommendations_updated_at ON recovery_recommendations;",
    "CREATE TRIGGER set_recovery_recommendations_updated_at\n      BEFORE UPDATE ON recovery_recommendations\n      FOR EACH ROW\n      EXECUTE FUNCTION handle_updated_at();"
    // *** END ADDED recovery_recommendations updated_at trigger ***
];
// SQL statements for granting permissions
var grantPermissions = [
    "GRANT USAGE ON SCHEMA public TO authenticated, anon;", // Combine grants
    "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;", // Use standard ALL PRIVILEGES
    "GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;", // Grant SELECT to anon role on ALL tables by default (RLS will restrict)
    "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;", // Use standard ALL PRIVILEGES
    "GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;", // Grant USAGE on sequences to anon
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO authenticated;", // Default grant for authenticated
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;", // Default SELECT for anon
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO authenticated;", // Default sequence grant
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO anon;" // Default sequence usage for anon
];
// Execute SQL function using pg Pool
var executeSQL = function (sql) { return __awaiter(void 0, void 0, void 0, function () {
    var client, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                return [4 /*yield*/, client.query(sql)];
            case 3:
                _a.sent();
                console.log("SQL executed successfully: ".concat(sql.substring(0, 60), "..."));
                return [3 /*break*/, 6];
            case 4:
                error_1 = _a.sent();
                console.error("Error executing SQL: ".concat(sql.substring(0, 60), "..."), error_1);
                throw error_1; // Re-throw the error to be caught by runMigration
            case 5:
                client.release(); // Release the client back to the pool
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
// Removed createExecuteSQLFunction as it's not needed with pg direct connection
// Main migration function
var runMigration = function () { return __awaiter(void 0, void 0, void 0, function () {
    var client, _i, createTableStatements_1, sql, _a, createPolicies_1, sql, _b, createTriggers_1, sql, _c, grantPermissions_1, sql, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.log('Starting database migration (SSOT8001 compliant)...');
                _d.label = 1;
            case 1:
                _d.trys.push([1, 19, 20, 22]);
                // Connect to DB to ensure connection works before running migrations
                console.log('Connecting to database...');
                return [4 /*yield*/, pool.connect()];
            case 2:
                client = _d.sent();
                console.log('Database connection successful.');
                client.release();
                // Create tables
                console.log('Creating tables...');
                _i = 0, createTableStatements_1 = createTableStatements;
                _d.label = 3;
            case 3:
                if (!(_i < createTableStatements_1.length)) return [3 /*break*/, 6];
                sql = createTableStatements_1[_i];
                return [4 /*yield*/, executeSQL(sql)];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                // Create RLS policies
                console.log('Creating RLS policies...');
                _a = 0, createPolicies_1 = createPolicies;
                _d.label = 7;
            case 7:
                if (!(_a < createPolicies_1.length)) return [3 /*break*/, 10];
                sql = createPolicies_1[_a];
                return [4 /*yield*/, executeSQL(sql)];
            case 8:
                _d.sent();
                _d.label = 9;
            case 9:
                _a++;
                return [3 /*break*/, 7];
            case 10:
                // Create triggers
                console.log('Creating triggers...');
                _b = 0, createTriggers_1 = createTriggers;
                _d.label = 11;
            case 11:
                if (!(_b < createTriggers_1.length)) return [3 /*break*/, 14];
                sql = createTriggers_1[_b];
                return [4 /*yield*/, executeSQL(sql)];
            case 12:
                _d.sent();
                _d.label = 13;
            case 13:
                _b++;
                return [3 /*break*/, 11];
            case 14:
                // Grant permissions
                console.log('Granting permissions...');
                _c = 0, grantPermissions_1 = grantPermissions;
                _d.label = 15;
            case 15:
                if (!(_c < grantPermissions_1.length)) return [3 /*break*/, 18];
                sql = grantPermissions_1[_c];
                return [4 /*yield*/, executeSQL(sql)];
            case 16:
                _d.sent();
                _d.label = 17;
            case 17:
                _c++;
                return [3 /*break*/, 15];
            case 18:
                // Context switching migration is now integrated into the main script above.
                // console.log('Running context switching migration...'); // Removed redundant call
                // await runContextSwitchingMigration(); // Removed redundant call
                console.log('Database migration completed successfully!');
                return [3 /*break*/, 22];
            case 19:
                error_2 = _d.sent();
                console.error('Migration failed:', error_2);
                throw error_2; // Re-throw original error
            case 20:
                console.log('Ending migration script, closing connection pool.');
                return [4 /*yield*/, pool.end()];
            case 21:
                _d.sent(); // Ensure pool is closed regardless of success/failure
                return [7 /*endfinally*/];
            case 22: return [2 /*return*/];
        }
    });
}); };
exports.runMigration = runMigration;
// Run the migration if this script is executed directly
// Check if this script is being run directly in Node.js (ESM way)
var isMainModule = typeof window === 'undefined' && import.meta.url === (0, url_1.pathToFileURL)(process.argv[1]).href;
if (isMainModule) {
    (0, exports.runMigration)()
        .then(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('Migration script finished.');
            // Pool should be ended in the finally block of runMigration
            process.exit(0);
            return [2 /*return*/];
        });
    }); })
        .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.error('Migration script failed:', err);
            // Pool should be ended in the finally block of runMigration
            process.exit(1);
            return [2 /*return*/];
        });
    }); });
}
