#!/usr/bin/env node

/**
 * Direct Table Creation Script for Supabase - SSOT8001 compliant
 * This script creates tables directly using the Supabase JS client
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables or use default values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // 1. Create User Profiles Table
    console.log('Creating mission4_user_profiles table...');
    const { error: profilesError } = await supabase.from('mission4_user_profiles').select('count').limit(1).maybeSingle();
    
    if (profilesError && profilesError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Table mission4_user_profiles does not exist. Creating...');
      const { error } = await supabase.rpc('create_table', {
        table_name: 'mission4_user_profiles',
        definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL UNIQUE,
          display_name VARCHAR(100),
          bio TEXT,
          avatar_url TEXT,
          quit_date TIMESTAMP WITH TIME ZONE,
          smoking_years INTEGER,
          daily_cigarettes INTEGER,
          preferred_product_type VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        `
      });
      
      if (error) {
        console.error('Error creating mission4_user_profiles:', error);
      } else {
        console.log('Successfully created mission4_user_profiles table');
      }
    } else {
      console.log('Table mission4_user_profiles already exists');
    }
    
    // 2. Create Progress Tracking Table
    console.log('Creating mission4_progress table...');
    const { error: progressError } = await supabase.from('mission4_progress').select('count').limit(1).maybeSingle();
    
    if (progressError && progressError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Table mission4_progress does not exist. Creating...');
      const { error } = await supabase.rpc('create_table', {
        table_name: 'mission4_progress',
        definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          date DATE NOT NULL,
          cigarettes_smoked INTEGER DEFAULT 0,
          cigarettes_avoided INTEGER DEFAULT 0,
          cravings_count INTEGER DEFAULT 0,
          cravings_resisted INTEGER DEFAULT 0,
          money_saved DECIMAL(10, 2) DEFAULT 0,
          health_score INTEGER,
          mood_score INTEGER,
          stress_level INTEGER,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE (user_id, date)
        `
      });
      
      if (error) {
        console.error('Error creating mission4_progress:', error);
      } else {
        console.log('Successfully created mission4_progress table');
      }
    } else {
      console.log('Table mission4_progress already exists');
    }
    
    // 3. Create Health Milestones Table
    console.log('Creating mission4_health_milestones table...');
    const { error: milestonesError } = await supabase.from('mission4_health_milestones').select('count').limit(1).maybeSingle();
    
    if (milestonesError && milestonesError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Table mission4_health_milestones does not exist. Creating...');
      const { error } = await supabase.rpc('create_table', {
        table_name: 'mission4_health_milestones',
        definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          days_required INTEGER NOT NULL,
          icon_name VARCHAR(100),
          category VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        `
      });
      
      if (error) {
        console.error('Error creating mission4_health_milestones:', error);
      } else {
        console.log('Successfully created mission4_health_milestones table');
        
        // Insert default milestones
        const milestones = [
          {
            title: 'Blood Pressure Normalizes',
            description: 'Your blood pressure and pulse rate begin to return to normal levels.',
            days_required: 1,
            icon_name: 'Heart',
            category: 'circulatory'
          },
          {
            title: 'Carbon Monoxide Levels Drop',
            description: 'The carbon monoxide level in your blood drops to normal, increasing the blood\'s oxygen-carrying capacity.',
            days_required: 1,
            icon_name: 'Lungs',
            category: 'respiratory'
          },
          {
            title: 'Improved Sense of Taste and Smell',
            description: 'Your senses of taste and smell begin to improve as nerve endings start to heal.',
            days_required: 2,
            icon_name: 'Nose',
            category: 'sensory'
          },
          {
            title: 'Easier Breathing',
            description: 'Your lung function begins to improve, making breathing easier and reducing coughing.',
            days_required: 3,
            icon_name: 'Lungs',
            category: 'respiratory'
          },
          {
            title: 'Improved Circulation',
            description: 'Your circulation improves, making physical activity easier and reducing the strain on your heart.',
            days_required: 14,
            icon_name: 'Heart',
            category: 'circulatory'
          },
          {
            title: 'Reduced Risk of Heart Attack',
            description: 'Your risk of heart attack begins to drop as your heart doesn\'t have to work as hard.',
            days_required: 28,
            icon_name: 'Heart',
            category: 'cardiovascular'
          },
          {
            title: 'Lung Function Improves',
            description: 'Your lung function has significantly improved, and respiratory infections become less common.',
            days_required: 90,
            icon_name: 'Lungs',
            category: 'respiratory'
          },
          {
            title: 'Reduced Risk of Cancer',
            description: 'Your risk of various smoking-related cancers begins to decrease.',
            days_required: 365,
            icon_name: 'Shield',
            category: 'long-term'
          },
          {
            title: 'Extended Life Expectancy',
            description: 'Your life expectancy approaches that of someone who has never smoked.',
            days_required: 5475,
            icon_name: 'Clock',
            category: 'long-term'
          }
        ];
        
        const { error: insertError } = await supabase.from('mission4_health_milestones').insert(milestones);
        
        if (insertError) {
          console.error('Error inserting milestones:', insertError);
        } else {
          console.log('Successfully inserted default health milestones');
        }
      }
    } else {
      console.log('Table mission4_health_milestones already exists');
    }
    
    // 4. Create Mood Tracking Table
    console.log('Creating mood_logs table...');
    const { error: moodError } = await supabase.from('mood_logs').select('count').limit(1).maybeSingle();
    
    if (moodError && moodError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Table mood_logs does not exist. Creating...');
      const { error } = await supabase.rpc('create_table', {
        table_name: 'mood_logs',
        definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          mood_value INTEGER NOT NULL CHECK (mood_value BETWEEN 1 AND 10),
          mood_category VARCHAR(50),
          notes TEXT,
          associated_triggers TEXT[]
        `
      });
      
      if (error) {
        console.error('Error creating mood_logs:', error);
      } else {
        console.log('Successfully created mood_logs table');
      }
    } else {
      console.log('Table mood_logs already exists');
    }
    
    // 5. Create Focus Tracking Table
    console.log('Creating focus_logs table...');
    const { error: focusError } = await supabase.from('focus_logs').select('count').limit(1).maybeSingle();
    
    if (focusError && focusError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Table focus_logs does not exist. Creating...');
      const { error } = await supabase.rpc('create_table', {
        table_name: 'focus_logs',
        definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          focus_score INTEGER NOT NULL CHECK (focus_score BETWEEN 1 AND 10),
          duration_minutes INTEGER,
          activity_type VARCHAR(100),
          notes TEXT
        `
      });
      
      if (error) {
        console.error('Error creating focus_logs:', error);
      } else {
        console.log('Successfully created focus_logs table');
      }
    } else {
      console.log('Table focus_logs already exists');
    }
    
    // 6. Create Energy Tracking Table
    console.log('Creating energy_focus_logs table...');
    const { error: energyError } = await supabase.from('energy_focus_logs').select('count').limit(1).maybeSingle();
    
    if (energyError && energyError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Table energy_focus_logs does not exist. Creating...');
      const { error } = await supabase.rpc('create_table', {
        table_name: 'energy_focus_logs',
        definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
          affecting_factors TEXT[],
          notes TEXT
        `
      });
      
      if (error) {
        console.error('Error creating energy_focus_logs:', error);
      } else {
        console.log('Successfully created energy_focus_logs table');
      }
    } else {
      console.log('Table energy_focus_logs already exists');
    }
    
    // 7. Setup RLS policies
    console.log('Setting up Row Level Security (RLS) policies...');
    const tables = [
      'mission4_user_profiles',
      'mission4_progress',
      'mission4_health_milestones',
      'mood_logs',
      'focus_logs',
      'energy_focus_logs'
    ];
    
    for (const table of tables) {
      // Enable RLS
      const { error: rlsError } = await supabase.rpc('enable_rls', { table_name: table });
      
      if (rlsError) {
        console.error(`Error enabling RLS for ${table}:`, rlsError);
      } else {
        console.log(`Successfully enabled RLS for ${table}`);
      }
      
      // Create policies based on table type
      if (table === 'mission4_health_milestones') {
        // Public read access for milestones
        const { error: policyError } = await supabase.rpc('create_policy', {
          table_name: table,
          name: `${table}_read_policy`,
          definition: `USING (true)`,
          operation: 'SELECT'
        });
        
        if (policyError) {
          console.error(`Error creating read policy for ${table}:`, policyError);
        } else {
          console.log(`Created read policy for ${table}`);
        }
      } else {
        // User-specific policies for other tables
        // Read policy
        const { error: readError } = await supabase.rpc('create_policy', {
          table_name: table,
          name: `${table}_read_policy`,
          definition: `USING (auth.uid() = user_id)`,
          operation: 'SELECT'
        });
        
        if (readError) {
          console.error(`Error creating read policy for ${table}:`, readError);
        } else {
          console.log(`Created read policy for ${table}`);
        }
        
        // Insert policy
        const { error: insertError } = await supabase.rpc('create_policy', {
          table_name: table,
          name: `${table}_insert_policy`,
          definition: `WITH CHECK (auth.uid() = user_id)`,
          operation: 'INSERT'
        });
        
        if (insertError) {
          console.error(`Error creating insert policy for ${table}:`, insertError);
        } else {
          console.log(`Created insert policy for ${table}`);
        }
        
        // Update policy (only for profiles and progress)
        if (table === 'mission4_user_profiles' || table === 'mission4_progress') {
          const { error: updateError } = await supabase.rpc('create_policy', {
            table_name: table,
            name: `${table}_update_policy`,
            definition: `USING (auth.uid() = user_id)`,
            operation: 'UPDATE'
          });
          
          if (updateError) {
            console.error(`Error creating update policy for ${table}:`, updateError);
          } else {
            console.log(`Created update policy for ${table}`);
          }
        }
      }
    }
    
    console.log('\nDatabase initialization completed!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 