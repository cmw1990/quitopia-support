import { supabase, SUPABASE_URL, SUPABASE_KEY } from '../integrations/supabase/db-client';
import { testSupabaseConnection } from '../integrations/supabase/test-connection';

/**
 * Utility to check and debug authentication and database connection issues
 * This can be called from browser console using:
 * 
 * import('./utils/auth-debug').then(module => module.runDiagnostics())
 */

export async function checkSupabaseConfig() {
  console.log('--- Supabase Configuration Check ---');
  console.log('SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '❌ Missing');
  console.log('SUPABASE_KEY:', SUPABASE_KEY ? '✓ Set' : '❌ Missing');
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Supabase configuration is incomplete. Auth will not work.');
    return false;
  }
  
  return true;
}

export async function checkActiveSession() {
  console.log('--- Session Check ---');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error checking session:', error);
      return false;
    }
    
    if (!data.session) {
      console.log('❌ No active session found. User needs to log in.');
      return false;
    }
    
    console.log('✓ Active session found for user:', data.session.user.email);
    console.log('Session expires at:', new Date(data.session.expires_at! * 1000).toLocaleString());
    return true;
  } catch (error) {
    console.error('❌ Unexpected error checking session:', error);
    return false;
  }
}

export async function testDatabaseConnection() {
  console.log('--- Database Connection Test ---');
  try {
    const result = await testSupabaseConnection();
    
    if (!result.success) {
      console.error('❌ Database connection failed:', result.message);
      if (result.error) {
        console.error('Error details:', result.error);
      }
      return false;
    }
    
    console.log('✓ Database connection successful:', result.message);
    if (result.data) {
      console.log('Data:', result.data);
    }
    return true;
  } catch (error) {
    console.error('❌ Unexpected error testing database connection:', error);
    return false;
  }
}

export async function loginWithDemo() {
  console.log('--- Demo Login ---');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'hertzofhopes@gmail.com',
      password: 'J4913836j',
    });
    
    if (error) {
      console.error('❌ Demo login failed:', error);
      return false;
    }
    
    console.log('✓ Demo login successful for user:', data.user?.email);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during demo login:', error);
    return false;
  }
}

export async function logoutUser() {
  console.log('--- Logout ---');
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout failed:', error);
      return false;
    }
    
    console.log('✓ Logout successful');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during logout:', error);
    return false;
  }
}

export async function runDiagnostics() {
  console.log('=== AUTH & DATABASE DIAGNOSTICS ===');
  console.log('Running diagnostics at:', new Date().toLocaleString());
  
  const configOk = await checkSupabaseConfig();
  if (!configOk) {
    console.error('Configuration issue detected. Fix this before proceeding.');
  }
  
  const sessionActive = await checkActiveSession();
  if (!sessionActive) {
    console.log('No active session found. Would you like to try demo login? Use:');
    console.log('import("./utils/auth-debug").then(module => module.loginWithDemo())');
  }
  
  await testDatabaseConnection();
  
  console.log('=== DIAGNOSTICS COMPLETE ===');
  console.log('To run a specific test, import this module and call the test function:');
  console.log('- checkSupabaseConfig()');
  console.log('- checkActiveSession()');
  console.log('- testDatabaseConnection()');
  console.log('- loginWithDemo()');
  console.log('- logoutUser()');
}

// Allow diagnostics to be run directly by importing the module
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    runDiagnostics,
    checkSupabaseConfig,
    checkActiveSession,
    testDatabaseConnection,
    loginWithDemo,
    logoutUser
  };
  
  console.log('Auth debug utilities loaded. Run diagnostics with: authDebug.runDiagnostics()');
} 