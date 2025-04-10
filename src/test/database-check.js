const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection details
const supabaseUrl = 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

async function performDatabaseCheck() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const databaseReport = {
    connectionStatus: false,
    tableVerification: {},
    crudOperations: {},
    authenticationTests: {}
  };

  try {
    // Test Database Connection
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) throw error;
    databaseReport.connectionStatus = true;

    // Verify Key Tables
    const tablesToCheck = [
      'users', 
      'focus_sessions', 
      'tasks', 
      'energy_tracking', 
      'progress_analytics'
    ];

    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      databaseReport.tableVerification[table] = {
        exists: !error,
        sampleDataAvailable: data && data.length > 0
      };
    }

    // CRUD Operation Tests
    // Create Test
    const testUserData = {
      email: 'test_' + Date.now() + '@example.com',
      password: 'TestPassword123!'
    };

    const { data: createResult, error: createError } = await supabase.auth.signUp({
      email: testUserData.email,
      password: testUserData.password
    });

    databaseReport.crudOperations.userCreation = {
      success: !createError,
      error: createError
    };

    // Authentication Tests
    const { data: signInResult, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'hertzofhopes@gmail.com',
      password: 'J4913836j'
    });

    databaseReport.authenticationTests = {
      loginAttempt: {
        success: !signInError,
        error: signInError
      }
    };

    // Write comprehensive database report
    fs.writeFileSync(
      './chrome-results/database-check-report.json', 
      JSON.stringify(databaseReport, null, 2)
    );

    return databaseReport;

  } catch (error) {
    console.error('Comprehensive Database Check Failed:', error);
    
    // Write error report
    fs.writeFileSync(
      './chrome-results/database-check-error.json', 
      JSON.stringify({
        error: error.message,
        stack: error.stack
      }, null, 2)
    );

    throw error;
  }
}

performDatabaseCheck()
  .then(console.log)
  .catch(console.error);