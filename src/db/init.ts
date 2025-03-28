import { supabase } from '@/integrations/supabase/client';
import fs from 'fs';
import path from 'path';

/**
 * Initialize the Supabase database with required tables and permissions.
 * This should be run during application setup or first deployment.
 */
export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read migration SQL files
    const migrationsDir = path.resolve(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in alphabetical order
    
    // Execute migrations in order
    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`Executing migration: ${file}`);
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error(`Error executing migration ${file}:`, error);
        throw error;
      }
    }
    
    console.log('Database initialization completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { success: false, error };
  }
}

/**
 * Check if required database tables exist
 */
export async function checkDatabaseTables() {
  try {
    // Check if the mood_logs table exists
    const { data: moodLogsExists, error: moodLogsError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'mood_logs')
      .eq('table_schema', 'public')
      .single();
    
    if (moodLogsError) {
      console.error('Error checking tables:', moodLogsError);
      return { 
        exists: false, 
        missingTables: ['mood_logs'], 
        error: moodLogsError 
      };
    }
    
    const requiredTables = ['mood_logs'];
    const existingTables: string[] = [];
    
    if (moodLogsExists) {
      existingTables.push('mood_logs');
    }
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    return {
      exists: missingTables.length === 0,
      missingTables,
    };
  } catch (error) {
    console.error('Error checking database tables:', error);
    return { exists: false, error };
  }
} 