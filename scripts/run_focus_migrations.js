
/**
 * Script to run Focus App migrations
 * This script helps set up and initialize the database for the Focus application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}=== Running Focus App Migrations ===${colors.reset}`);

// Check if Supabase environment variables are configured
const envFilePath = path.resolve(process.cwd(), '.env');
let envFileExists = false;

try {
  envFileExists = fs.existsSync(envFilePath);
} catch (err) {
  console.error(`${colors.red}Error checking for .env file: ${err.message}${colors.reset}`);
}

if (!envFileExists) {
  console.log(`${colors.yellow}Warning: No .env file found. Using environment variables if available.${colors.reset}`);
  
  // Check if required environment variables are set
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`${colors.yellow}Missing environment variables: ${missingVars.join(', ')}${colors.reset}`);
    console.log(`${colors.yellow}You may need to create a .env file with these variables.${colors.reset}`);
  }
}

// Check for migrations directory
const migrationsDir = path.resolve(process.cwd(), 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.error(`${colors.red}Error: Migrations directory not found at ${migrationsDir}${colors.reset}`);
  console.log(`${colors.yellow}Make sure you're running this script from the project root.${colors.reset}`);
  process.exit(1);
}

// Count migration files
try {
  const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));
  console.log(`${colors.green}Found ${migrationFiles.length} migration files${colors.reset}`);
  
  // Log migration files
  migrationFiles.forEach(file => {
    console.log(`${colors.blue}Migration: ${file}${colors.reset}`);
  });
  
  // Prompt to confirm running migrations
  console.log(`${colors.yellow}This script would normally run these migrations against your Supabase database.${colors.reset}`);
  console.log(`${colors.yellow}For safety, actual execution has been disabled. To enable:${colors.reset}`);
  console.log(`${colors.yellow}1. Ensure your .env file has the correct Supabase credentials${colors.reset}`);
  console.log(`${colors.yellow}2. Modify this script to execute the migrations${colors.reset}`);
  
} catch (err) {
  console.error(`${colors.red}Error reading migrations: ${err.message}${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.cyan}=== Focus App Migrations Check Complete ===${colors.reset}`);
