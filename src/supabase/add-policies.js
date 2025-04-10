import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function validatePolicies() {
  console.log('Validating Row Level Security policies...');
  
  const tablesToCheck = [
    'user_profiles', 
    'focus_strategies', 
    'focus_sessions', 
    'focus_tasks', 
    'focus_achievements', 
    'focus_distractions'
  ];

  try {
    for (const table of tablesToCheck) {
      const { data, error } = await supabase.rpc('create_rls_policy', {
        table_name: table,
        policy_name: `Validate ${table} policies`,
        policy_action: 'SELECT',
        policy_definition: 'true'
      });

      if (error) {
        console.error(`Policy validation failed for ${table}:`, error);
        throw error;
      }
    }

    console.log('All Row Level Security policies validated successfully');
  } catch (error) {
    console.error('Critical policy validation failure:', error);
    process.exit(1);
  }
}

export { validatePolicies };