/**
 * run-migration.ts
 * 
 * Script to run database migrations
 * Usage: npm run migrate
 */

import { migrateDatabase } from '../services/db-migrations/create-core-tables';

console.log('Starting database migration script...');

migrateDatabase()
  .then((result) => {
    if (result.success) {
      console.log('✅ Migration successful:', result.message);
      process.exit(0);
    } else {
      console.error('❌ Migration failed:', result.message);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Migration script error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }); 