import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  try {
    console.log('Testing login with test user account...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'hertzofhopes@gmail.com',
      password: 'J4913836j'
    });

    if (error) {
      console.error('Login error:', error.message);
      return;
    }

    console.log('Login successful!');
    console.log('Session:', data.session);

    // Test database tables access
    console.log('\nTesting database access...');
    
    const tables = [
      'focus_sessions',
      'focus_tasks',
      'focus_achievements',
      'focus_distractions'
    ];

    for (const table of tables) {
      const { data: testData, error: testError } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (testError) {
        console.error(`Error accessing ${table}:`, testError.message);
      } else {
        console.log(`Successfully accessed ${table}`);
      }
    }

  } catch (err) {
    console.error('Test error:', err);
  }
}

testLogin();