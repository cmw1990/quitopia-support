#!/usr/bin/env node

/**
 * L1 Core Migration Script
 * This script creates essential tables for the Mission Fresh app
 */

import { createClient } from '@supabase/supabase-js';

// SSOT8001 compliant hardcoded credentials
const SUPABASE_URL = 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Main function - check for tables and create if needed
async function main() {
  try {
    console.log('Starting L1 Core database setup...');
    
    // Ensure essential tables exist
    await createUserSettings();
    await createGuideArticles();
    await createNRTProducts();
    await createProgress();
    await createConsumptionLogs();
    await createQuitPlans();
    await createFinancialTracking();
    await createCravingLogs();
    await createConnectedDevices();
    
    console.log('\nL1 Core database setup completed!');
  } catch (error) {
    console.error('Error in database setup process:', error);
  }
}

// Create user_settings8 table
async function createUserSettings() {
  const tableName = 'user_settings8';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        theme TEXT DEFAULT 'system',
        notifications_enabled BOOLEAN DEFAULT true,
        daily_reminder_time TIME DEFAULT '09:00:00',
        weekly_summary_enabled BOOLEAN DEFAULT true,
        data_sharing_enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS user_settings8_user_id_idx ON public.${tableName}(user_id);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can only access their own settings"
        ON public.${tableName}
        FOR ALL
        USING (auth.uid() = user_id);
      
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

// Create guide_articles8 table
async function createGuideArticles() {
  const tableName = 'guide_articles8';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT[],
        published_at TIMESTAMPTZ DEFAULT NOW(),
        author TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS guide_articles8_category_idx ON public.${tableName}(category);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Guide articles are viewable by all authenticated users"
        ON public.${tableName}
        FOR SELECT
        USING (auth.role() = 'authenticated');
      
      GRANT SELECT ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

// Create remaining table creation functions
async function createNRTProducts() {
  const tableName = 'nrt_products8';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        price DECIMAL(10, 2),
        image_url TEXT,
        manufacturer TEXT,
        dosage TEXT,
        usage_instructions TEXT,
        side_effects TEXT[],
        effectiveness_rating DECIMAL(3, 2),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS nrt_products8_category_idx ON public.${tableName}(category);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "NRT products are viewable by all authenticated users"
        ON public.${tableName}
        FOR SELECT
        USING (auth.role() = 'authenticated');
      
      GRANT SELECT ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

async function createProgress() {
  const tableName = 'progress8';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        quit_date TIMESTAMPTZ,
        current_streak_days INTEGER DEFAULT 0,
        longest_streak_days INTEGER DEFAULT 0,
        cravings_resisted INTEGER DEFAULT 0,
        health_improvement_stage TEXT,
        money_saved DECIMAL(10, 2) DEFAULT 0,
        cigarettes_avoided INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS progress8_user_id_idx ON public.${tableName}(user_id);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can only access their own progress"
        ON public.${tableName}
        FOR ALL
        USING (auth.uid() = user_id);
      
      GRANT SELECT, INSERT, UPDATE ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

async function createConsumptionLogs() {
  const tableName = 'consumption_logs8';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        product_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        nicotine_amount DECIMAL(10, 2),
        location TEXT,
        mood TEXT,
        trigger TEXT,
        circumstances TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS consumption_logs8_user_id_idx ON public.${tableName}(user_id);
      CREATE INDEX IF NOT EXISTS consumption_logs8_timestamp_idx ON public.${tableName}(timestamp);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can only access their own consumption logs"
        ON public.${tableName}
        FOR ALL
        USING (auth.uid() = user_id);
      
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

async function createQuitPlans() {
  const tableName = 'quit_plans8';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        target_quit_date TIMESTAMPTZ,
        approach TEXT NOT NULL,
        motivation TEXT[],
        support_network TEXT[],
        nrt_products TEXT[],
        coping_strategies TEXT[],
        daily_goals TEXT[],
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS quit_plans8_user_id_idx ON public.${tableName}(user_id);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can only access their own quit plans"
        ON public.${tableName}
        FOR ALL
        USING (auth.uid() = user_id);
      
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

async function createFinancialTracking() {
  const tableName = 'financial_tracking8';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        money_saved DECIMAL(10, 2) NOT NULL,
        previous_spending DECIMAL(10, 2) NOT NULL,
        nrt_spending DECIMAL(10, 2) DEFAULT 0,
        savings_goal TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS financial_tracking8_user_id_idx ON public.${tableName}(user_id);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can only access their own financial tracking"
        ON public.${tableName}
        FOR ALL
        USING (auth.uid() = user_id);
      
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

async function createCravingLogs() {
  const tableName = 'craving_logs8';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
        duration_minutes INTEGER,
        location TEXT,
        trigger TEXT,
        physical_symptoms TEXT[],
        emotional_state TEXT,
        coping_strategy_used TEXT,
        coping_strategy_effectiveness INTEGER CHECK (coping_strategy_effectiveness BETWEEN 1 AND 10),
        resisted BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS craving_logs8_user_id_idx ON public.${tableName}(user_id);
      CREATE INDEX IF NOT EXISTS craving_logs8_timestamp_idx ON public.${tableName}(timestamp);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can only access their own craving logs"
        ON public.${tableName}
        FOR ALL
        USING (auth.uid() = user_id);
      
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

async function createConnectedDevices() {
  const tableName = 'connected_devices';
  const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
  
  if (count !== null && count >= 0) {
    console.log(`Table ${tableName} already exists, skipping`);
    return;
  }
  
  console.log(`Creating table: ${tableName}`);
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        device_name TEXT NOT NULL,
        device_type TEXT NOT NULL,
        manufacturer TEXT NOT NULL,
        connected BOOLEAN DEFAULT true,
        last_sync TIMESTAMPTZ DEFAULT now(),
        connection_status TEXT NOT NULL CHECK (connection_status IN ('connected', 'disconnected', 'pairing')),
        model TEXT,
        firmware_version TEXT,
        battery_level INTEGER,
        capabilities TEXT[],
        connection_type TEXT,
        error_message TEXT,
        retry_attempts INTEGER,
        connected_at TIMESTAMPTZ DEFAULT now(),
        disconnected_at TIMESTAMPTZ,
        permissions JSONB,
        sync_interval INTEGER,
        priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS connected_devices_user_id_idx ON public.${tableName}(user_id);
      CREATE INDEX IF NOT EXISTS connected_devices_status_idx ON public.${tableName}(connection_status);
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can only access their own connected devices"
        ON public.${tableName}
        FOR ALL
        USING (auth.uid() = user_id);
      
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.${tableName} TO authenticated;
    `
  });
  
  if (error) {
    console.error(`Error creating ${tableName}:`, error);
  } else {
    console.log(`Successfully created ${tableName}`);
  }
}

// Run the main function
main(); 