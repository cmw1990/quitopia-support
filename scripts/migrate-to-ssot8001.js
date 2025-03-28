/**
 * SSOT8001 Migration Script
 * 
 * This script migrates database tables to follow SSOT8001 naming conventions
 * with suffix "8" and ensures all database operations use direct REST API calls
 * instead of Supabase client methods.
 */

// SSOT8001 compliant hardcoded credentials
const SUPABASE_URL = 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';

// Helper function for REST API calls
async function supabaseRestCall(endpoint, options = {}) {
  try {
    const headers = {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...options.headers
    };

    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText
      },
      {
        name: '00006_update_verify_tables_script.sql',
        sql: `
          -- Update the verify-tables.js script to check for all SSOT8001 compliant tables
          -- This is a SQL script that doesn't actually modify the database
          -- but is tracked as a migration for completeness
          
          -- The actual update to verify-tables.js will be done programmatically
          -- This migration is just a placeholder to track that the update was done
        `
      }));
      throw new Error(`API Error (${response.status}): ${error.message || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Supabase REST API call failed:', error);
    throw error;
  }
}

// Create migrations tracking table
async function createMigrationsTable() {
  console.log('Creating migrations tracking table...');
  
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY, 
      name VARCHAR(255) NOT NULL UNIQUE, 
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;
  
  await supabaseRestCall('/rest/v1/sql', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  
  console.log('Migrations table created or already exists.');
}

// Check if migration has been applied
async function isMigrationApplied(migrationName) {
  const result = await supabaseRestCall(
    `/rest/v1/migrations?name=eq.${encodeURIComponent(migrationName)}`,
    { method: 'GET' }
  );
  
  return result && result.length > 0;
}

// Record migration as applied
async function recordMigration(migrationName) {
  await supabaseRestCall('/rest/v1/migrations', {
    method: 'POST',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify({ name: migrationName })
  });
  
  console.log(`Migration '${migrationName}' recorded as applied.`);
}

// Execute SQL migration
async function executeMigration(migrationName, sql) {
  console.log(`Executing migration '${migrationName}'...`);
  
  // Check if already applied
  const applied = await isMigrationApplied(migrationName);
  if (applied) {
    console.log(`Migration '${migrationName}' already applied, skipping.`);
    return;
  }
  
  // Execute SQL
  await supabaseRestCall('/rest/v1/sql', {
    method: 'POST',
    body: JSON.stringify({ query: sql })
  });
  
  // Record migration
  await recordMigration(migrationName);
  
  console.log(`Migration '${migrationName}' applied successfully.`);
}

// Main migration function
async function runMigrations() {
  try {
    // Create migrations table
    await createMigrationsTable();
    
    // Define migrations
    const migrations = [
      {
        name: '00001_rename_tables_to_ssot8001.sql',
        sql: `
          -- Rename tables to follow SSOT8001 naming convention with suffix "8"
          
          -- Drop stored procedures first since they reference the old table names
          DROP FUNCTION IF EXISTS mission4_calculate_step_rewards;
          DROP FUNCTION IF EXISTS mission4_get_consumption_analytics;
          DROP FUNCTION IF EXISTS mission4_get_health_improvements;
          
          -- Rename tables
          ALTER TABLE IF EXISTS mission4_consumption_logs RENAME TO consumption_logs8;
          ALTER TABLE IF EXISTS mission4_products RENAME TO products8;
          ALTER TABLE IF EXISTS mission4_progress RENAME TO progress8;
          ALTER TABLE IF EXISTS mission4_quit_plans RENAME TO quit_plans8;
          ALTER TABLE IF EXISTS mission4_health_metrics RENAME TO health_metrics8;
          ALTER TABLE IF EXISTS mission4_product_reviews RENAME TO product_reviews8;
          
          -- Update foreign key references
          ALTER TABLE product_reviews8 
            DROP CONSTRAINT IF EXISTS mission4_product_reviews_product_id_fkey,
            ADD CONSTRAINT product_reviews8_product_id_fkey 
            FOREIGN KEY (product_id) REFERENCES products8(id);
          
          -- Recreate stored procedures with new table names
          CREATE OR REPLACE FUNCTION calculate_step_rewards8(
            p_user_id UUID,
            p_start_date DATE,
            p_end_date DATE
          ) RETURNS TABLE (
            total_steps BIGINT,
            rewards_earned DECIMAL,
            subscription_discount DECIMAL
          ) LANGUAGE plpgsql AS $$
          BEGIN
            RETURN QUERY
            WITH step_data AS (
              SELECT COALESCE(SUM(step_count), 0) as total_steps
              FROM health_metrics8
              WHERE user_id = p_user_id
              AND date BETWEEN p_start_date AND p_end_date
            )
            SELECT 
              sd.total_steps,
              (sd.total_steps / 10000.0)::DECIMAL as rewards_earned,
              LEAST((sd.total_steps / 100000.0 * 5)::DECIMAL, 30.0) as subscription_discount
            FROM step_data sd;
          END;
          $$;
        `
      },
      {
        name: '00006_update_verify_tables_script.sql',
        sql: `
          -- Update the verify-tables.js script to check for all SSOT8001 compliant tables
          -- This is a SQL script that doesn't actually modify the database
          -- but is tracked as a migration for completeness
          
          -- The actual update to verify-tables.js will be done programmatically
          -- This migration is just a placeholder to track that the update was done
        `
      },
      {
        name: '00002_create_ssot8001_tables.sql',
        sql: `
          -- Create new tables following SSOT8001 naming convention
          
          -- Create energy tracking table
          CREATE TABLE IF NOT EXISTS energy_tracking8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
            focus_level INTEGER CHECK (focus_level BETWEEN 1 AND 10),
            mood TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Create sleep tracking table
          CREATE TABLE IF NOT EXISTS sleep_tracking8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            sleep_date DATE NOT NULL,
            sleep_start TIMESTAMP WITH TIME ZONE,
            sleep_end TIMESTAMP WITH TIME ZONE,
            duration_minutes INTEGER,
            quality INTEGER CHECK (quality BETWEEN 1 AND 10),
            deep_sleep_minutes INTEGER,
            rem_sleep_minutes INTEGER,
            light_sleep_minutes INTEGER,
            awake_minutes INTEGER,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `
      },
      {
        name: '00006_update_verify_tables_script.sql',
        sql: `
          -- Update the verify-tables.js script to check for all SSOT8001 compliant tables
          -- This is a SQL script that doesn't actually modify the database
          -- but is tracked as a migration for completeness
          
          -- The actual update to verify-tables.js will be done programmatically
          -- This migration is just a placeholder to track that the update was done
        `
      },
      {
        name: '00003_migrate_achievement_tables.sql',
        sql: `
          -- Migrate achievement tables to follow SSOT8001 naming convention
          
          -- Create achievements table with suffix "8"
          CREATE TABLE IF NOT EXISTS achievements8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            icon TEXT,
            requirement_value INTEGER NOT NULL,
            reward_points INTEGER NOT NULL,
            badge_color TEXT,
            unlock_message TEXT,
            is_hidden BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Create user achievements table with suffix "8"
          CREATE TABLE IF NOT EXISTS user_achievements8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            achievement_id UUID NOT NULL REFERENCES achievements8(id) ON DELETE CASCADE,
            progress INTEGER DEFAULT 0,
            is_complete BOOLEAN DEFAULT false,
            unlocked_at TIMESTAMP WITH TIME ZONE,
            celebration_shown BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Create achievement shares table with suffix "8"
          CREATE TABLE IF NOT EXISTS achievement_shares8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            achievement_id UUID NOT NULL REFERENCES achievements8(id) ON DELETE CASCADE,
            platform TEXT NOT NULL,
            shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            share_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Add RLS policies for achievements8 table
          ALTER TABLE achievements8 ENABLE ROW LEVEL SECURITY;
          
          -- Allow all authenticated users to view achievements
          CREATE POLICY "Authenticated users can view achievements"
          ON achievements8 FOR SELECT
          USING (auth.role() = 'authenticated');
          
          -- Only allow admins to create, update, or delete achievements
          CREATE POLICY "Only admins can create achievements"
          ON achievements8 FOR INSERT
          USING (auth.role() = 'service_role');
          
          CREATE POLICY "Only admins can update achievements"
          ON achievements8 FOR UPDATE
          USING (auth.role() = 'service_role');
          
          -- Add RLS policies for user_achievements8 table
          ALTER TABLE user_achievements8 ENABLE ROW LEVEL SECURITY;
          
          -- Allow users to view their own achievements
          CREATE POLICY "Users can view their own achievements"
          ON user_achievements8 FOR SELECT
          USING (auth.uid() = user_id);
          
          -- Allow achievement system to update user achievements on their behalf
          CREATE POLICY "Achievement system can update user achievements"
          ON user_achievements8 FOR INSERT
          USING (auth.role() = 'authenticated');
          
          CREATE POLICY "Users can update their own achievements"
          ON user_achievements8 FOR UPDATE
          USING (auth.uid() = user_id);
          
          -- Add RLS policies for achievement_shares8 table
          ALTER TABLE achievement_shares8 ENABLE ROW LEVEL SECURITY;
          
          -- Allow users to share their own achievements
          CREATE POLICY "Users can share their own achievements"
          ON achievement_shares8 FOR INSERT
          USING (auth.uid() = user_id);
          
          -- Allow users to view their own shares
          CREATE POLICY "Users can view their own achievement shares"
          ON achievement_shares8 FOR SELECT
          USING (auth.uid() = user_id);
          
          -- Create indexes for better performance
          CREATE INDEX IF NOT EXISTS achievements8_category_idx ON achievements8 (category);
          CREATE INDEX IF NOT EXISTS user_achievements8_user_id_idx ON user_achievements8 (user_id);
          CREATE INDEX IF NOT EXISTS user_achievements8_achievement_id_idx ON user_achievements8 (achievement_id);
          CREATE INDEX IF NOT EXISTS achievement_shares8_user_id_idx ON achievement_shares8 (user_id);
          CREATE INDEX IF NOT EXISTS achievement_shares8_achievement_id_idx ON achievement_shares8 (achievement_id);
          
          -- Create trigger to initialize achievements for new users
          CREATE OR REPLACE FUNCTION initialize_user_achievements8()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO user_achievements8 (user_id, achievement_id, progress, is_complete)
            SELECT NEW.id, id, 0, false FROM achievements8;
            
            -- Automatically unlock the 'Fresh Start' achievement
            UPDATE user_achievements8
            SET is_complete = true, unlocked_at = now()
            WHERE user_id = NEW.id AND achievement_id IN (
              SELECT id FROM achievements8 WHERE title = 'Fresh Start'
            );
            
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
          
          -- Create trigger to initialize achievements for new users
          DROP TRIGGER IF EXISTS trigger_initialize_user_achievements8 ON auth.users;
          CREATE TRIGGER trigger_initialize_user_achievements8
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION initialize_user_achievements8();
          
          -- Migrate data from old tables if they exist
          DO $$
          BEGIN
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'achievements') THEN
              INSERT INTO achievements8 (id, title, description, category, icon, requirement_value, reward_points, badge_color, unlock_message, is_hidden, created_at, updated_at)
              SELECT id, title, description, category, icon, requirement_value, reward_points, badge_color, unlock_message, is_hidden, created_at, updated_at
              FROM achievements
              ON CONFLICT (id) DO NOTHING;
            END IF;
            
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
              INSERT INTO user_achievements8 (id, user_id, achievement_id, progress, is_complete, unlocked_at, celebration_shown, created_at, updated_at)
              SELECT id, user_id, achievement_id, progress, is_complete, unlocked_at, celebration_shown, created_at, updated_at
              FROM user_achievements
              ON CONFLICT (id) DO NOTHING;
            END IF;
            
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'achievement_shares') THEN
              INSERT INTO achievement_shares8 (id, user_id, achievement_id, platform, shared_at, share_url, created_at)
              SELECT id, user_id, achievement_id, platform, shared_at, share_url, created_at
              FROM achievement_shares
              ON CONFLICT (id) DO NOTHING;
            END IF;
          END
          $$;
        `
      },
      {
        name: '00006_update_verify_tables_script.sql',
        sql: `
          -- Update the verify-tables.js script to check for all SSOT8001 compliant tables
          -- This is a SQL script that doesn't actually modify the database
          -- but is tracked as a migration for completeness
          
          -- The actual update to verify-tables.js will be done programmatically
          -- This migration is just a placeholder to track that the update was done
        `
      },
      {
        name: '00004_migrate_challenge_tables.sql',
        sql: `
          -- Migrate challenge tables to follow SSOT8001 naming convention
          
          -- Create challenges table with suffix "8"
          CREATE TABLE IF NOT EXISTS challenges8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE NOT NULL,
            reward_points INTEGER NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Create challenge tasks table with suffix "8"
          CREATE TABLE IF NOT EXISTS challenge_tasks8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            challenge_id UUID NOT NULL REFERENCES challenges8(id) ON DELETE CASCADE,
            description TEXT NOT NULL,
            points INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Create challenge progress table with suffix "8"
          CREATE TABLE IF NOT EXISTS challenge_progress8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            challenge_id UUID NOT NULL REFERENCES challenges8(id) ON DELETE CASCADE,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            completed_at TIMESTAMP WITH TIME ZONE,
            points_earned INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(user_id, challenge_id)
          );
          
          -- Create challenge task progress table with suffix "8"
          CREATE TABLE IF NOT EXISTS challenge_task_progress8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            challenge_id UUID NOT NULL REFERENCES challenges8(id) ON DELETE CASCADE,
            task_id UUID NOT NULL REFERENCES challenge_tasks8(id) ON DELETE CASCADE,
            completed BOOLEAN DEFAULT false,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(user_id, task_id)
          );
          
          -- Add RLS policies for challenges8 table
          ALTER TABLE challenges8 ENABLE ROW LEVEL SECURITY;
          
          -- Challenges policy
          CREATE POLICY "Challenges are viewable by all authenticated users"
          ON challenges8 FOR SELECT
          USING (auth.role() = 'authenticated');
          
          CREATE POLICY "Only admins can create challenges"
          ON challenges8 FOR INSERT
          USING (auth.role() = 'service_role');
          
          CREATE POLICY "Only admins can update challenges"
          ON challenges8 FOR UPDATE
          USING (auth.role() = 'service_role');
          
          -- Add RLS policies for challenge_tasks8 table
          ALTER TABLE challenge_tasks8 ENABLE ROW LEVEL SECURITY;
          
          -- Challenge tasks policy
          CREATE POLICY "Challenge tasks are viewable by all authenticated users"
          ON challenge_tasks8 FOR SELECT
          USING (auth.role() = 'authenticated');
          
          CREATE POLICY "Only admins can create challenge tasks"
          ON challenge_tasks8 FOR INSERT
          USING (auth.role() = 'service_role');
          
          -- Add RLS policies for challenge_progress8 table
          ALTER TABLE challenge_progress8 ENABLE ROW LEVEL SECURITY;
          
          -- Challenge progress policy
          CREATE POLICY "Users can view their own challenge progress"
          ON challenge_progress8 FOR SELECT
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can join challenges"
          ON challenge_progress8 FOR INSERT
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own challenge progress"
          ON challenge_progress8 FOR UPDATE
          USING (auth.uid() = user_id);
          
          -- Add RLS policies for challenge_task_progress8 table
          ALTER TABLE challenge_task_progress8 ENABLE ROW LEVEL SECURITY;
          
          -- Challenge task progress policy
          CREATE POLICY "Users can view their own task progress"
          ON challenge_task_progress8 FOR SELECT
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can create their own task progress"
          ON challenge_task_progress8 FOR INSERT
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own task progress"
          ON challenge_task_progress8 FOR UPDATE
          USING (auth.uid() = user_id);
          
          -- Create indexes for better performance
          CREATE INDEX IF NOT EXISTS challenges8_difficulty_idx ON challenges8 (difficulty);
          CREATE INDEX IF NOT EXISTS challenges8_start_date_idx ON challenges8 (start_date);
          CREATE INDEX IF NOT EXISTS challenges8_end_date_idx ON challenges8 (end_date);
          CREATE INDEX IF NOT EXISTS challenge_tasks8_challenge_id_idx ON challenge_tasks8 (challenge_id);
          CREATE INDEX IF NOT EXISTS challenge_progress8_user_id_idx ON challenge_progress8 (user_id);
          CREATE INDEX IF NOT EXISTS challenge_progress8_challenge_id_idx ON challenge_progress8 (challenge_id);
          CREATE INDEX IF NOT EXISTS challenge_task_progress8_user_id_idx ON challenge_task_progress8 (user_id);
          CREATE INDEX IF NOT EXISTS challenge_task_progress8_task_id_idx ON challenge_task_progress8 (task_id);
          
          -- Migrate data from old tables if they exist
          DO $$
          BEGIN
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'challenges') THEN
              INSERT INTO challenges8 (id, title, description, difficulty, start_date, end_date, reward_points, image_url, created_at, updated_at)
              SELECT id, title, description, difficulty, start_date, end_date, reward_points, image_url, created_at, updated_at
              FROM challenges
              ON CONFLICT (id) DO NOTHING;
            END IF;
            
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'challenge_tasks') THEN
              INSERT INTO challenge_tasks8 (id, challenge_id, description, points, created_at, updated_at)
              SELECT id, challenge_id, description, points, created_at, updated_at
              FROM challenge_tasks
              ON CONFLICT (id) DO NOTHING;
            END IF;
            
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'challenge_progress') THEN
              INSERT INTO challenge_progress8 (id, user_id, challenge_id, joined_at, completed_at, points_earned, created_at, updated_at)
              SELECT id, user_id, challenge_id, joined_at, completed_at, points_earned, created_at, updated_at
              FROM challenge_progress
              ON CONFLICT (id) DO NOTHING;
            END IF;
          END
          $$;
        `
      },
      {
        name: '00006_update_verify_tables_script.sql',
        sql: `
          -- Update the verify-tables.js script to check for all SSOT8001 compliant tables
          -- This is a SQL script that doesn't actually modify the database
          -- but is tracked as a migration for completeness
          
          -- The actual update to verify-tables.js will be done programmatically
          -- This migration is just a placeholder to track that the update was done
        `
      },
      {
        name: '00005_migrate_social_sharing_tables.sql',
        sql: `
          -- Migrate social sharing tables to follow SSOT8001 naming convention
          
          -- Create social_shares table with suffix "8"
          CREATE TABLE IF NOT EXISTS social_shares8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            item_type TEXT NOT NULL,
            item_id UUID,
            milestone_type TEXT,
            milestone_value INTEGER,
            platform TEXT NOT NULL,
            shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            share_url TEXT,
            share_image TEXT,
            share_text TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Create social_share_analytics table with suffix "8"
          CREATE TABLE IF NOT EXISTS social_share_analytics8 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            share_id UUID REFERENCES social_shares8(id),
            platform TEXT NOT NULL,
            item_type TEXT NOT NULL,
            clicks INTEGER DEFAULT 0,
            impressions INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            reshares INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Add RLS policies for social_shares8 table
          ALTER TABLE social_shares8 ENABLE ROW LEVEL SECURITY;
          
          -- Allow users to view their own shares
          CREATE POLICY "Users can view their own shares"
          ON social_shares8 FOR SELECT
          USING (auth.uid() = user_id);
          
          -- Allow users to create shares
          CREATE POLICY "Users can create shares"
          ON social_shares8 FOR INSERT
          USING (auth.uid() = user_id);
          
          -- Allow users to update their own shares
          CREATE POLICY "Users can update their own shares"
          ON social_shares8 FOR UPDATE
          USING (auth.uid() = user_id);
          
          -- Add RLS policies for social_share_analytics8 table
          ALTER TABLE social_share_analytics8 ENABLE ROW LEVEL SECURITY;
          
          -- Allow users to view their own share analytics
          CREATE POLICY "Users can view their own share analytics"
          ON social_share_analytics8 FOR SELECT
          USING (auth.uid() = user_id);
          
          -- Allow users to create share analytics
          CREATE POLICY "Users can create share analytics"
          ON social_share_analytics8 FOR INSERT
          USING (auth.uid() = user_id);
          
          -- Allow users to update their own share analytics
          CREATE POLICY "Users can update their own share analytics"
          ON social_share_analytics8 FOR UPDATE
          USING (auth.uid() = user_id);
          
          -- Create indexes for better performance
          CREATE INDEX IF NOT EXISTS social_shares8_user_id_idx ON social_shares8 (user_id);
          CREATE INDEX IF NOT EXISTS social_shares8_platform_idx ON social_shares8 (platform);
          CREATE INDEX IF NOT EXISTS social_shares8_item_type_idx ON social_shares8 (item_type);
          CREATE INDEX IF NOT EXISTS social_share_analytics8_user_id_idx ON social_share_analytics8 (user_id);
          CREATE INDEX IF NOT EXISTS social_share_analytics8_platform_idx ON social_share_analytics8 (platform);
          CREATE INDEX IF NOT EXISTS social_share_analytics8_item_type_idx ON social_share_analytics8 (item_type);
          
          -- Migrate data from old tables if they exist
          DO $$
          BEGIN
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_shares') THEN
              INSERT INTO social_shares8 (id, user_id, item_type, item_id, milestone_type, milestone_value, platform, shared_at, share_url, share_image, share_text, created_at)
              SELECT id, user_id, item_type, item_id, milestone_type, milestone_value, platform, shared_at, share_url, share_image, share_text, created_at
              FROM social_shares
              ON CONFLICT (id) DO NOTHING;
            END IF;
            
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_share_analytics') THEN
              INSERT INTO social_share_analytics8 (id, user_id, share_id, platform, item_type, clicks, impressions, likes, comments, reshares, created_at, updated_at)
              SELECT id, user_id, share_id, platform, item_type, clicks, impressions, likes, comments, reshares, created_at, updated_at
              FROM social_share_analytics
              ON CONFLICT (id) DO NOTHING;
            END IF;
          END
          $$;
        `
      },
      {
        name: '00006_update_verify_tables_script.sql',
        sql: `
          -- Update the verify-tables.js script to check for all SSOT8001 compliant tables
          -- This is a SQL script that doesn't actually modify the database
          -- but is tracked as a migration for completeness
          
          -- The actual update to verify-tables.js will be done programmatically
          -- This migration is just a placeholder to track that the update was done
        `
      }