import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  console.log('Initializing database connection...');
  
  try {
    // Verify database connection
    const { data, error } = await supabase
      .from('schema_version')
      .select('version')
      .limit(1);

    if (error) {
      console.error('Database initialization error:', error);
      throw error;
    }

    console.log('Database connection and initialization successful');
    return supabase;
  } catch (error) {
    console.error('Critical database initialization failure:', error);
    process.exit(1);
  }
}

export { supabase, initializeDatabase };