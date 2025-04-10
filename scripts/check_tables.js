const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://zoubqdwxemivxrjruvam.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs'
);

async function listTables() {
  const tables = [
    'focus_sessions', 
    'focus_tasks', 
    'focus_strategies', 
    'focus_achievements', 
    'user_profiles'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`Table ${table} may not exist or there was an error: ${error.message}`);
      } else {
        console.log(`Table ${table} exists. Sample data count: ${data.length}`);
      }
    } catch (catchError) {
      console.log(`Unexpected error checking table ${table}: ${catchError.message}`);
    }
  }
}

listTables().catch(console.error);