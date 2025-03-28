/**
 * SSOT8001 Migration Runner
 * 
 * This script runs the migration to ensure all database tables follow SSOT8001 naming conventions
 * with suffix "8" and ensures all database operations use direct REST API calls.
 */

// Import the migration script
const { runMigrations } = require('./migrate-to-ssot8001');

// Run migrations
console.log('Starting SSOT8001 migrations...');
runMigrations()
  .then(() => {
    console.log('SSOT8001 migrations completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running SSOT8001 migrations:', error);
    process.exit(1);
  });