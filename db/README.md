# Database Setup Guide

This directory contains the necessary files to set up and migrate the Supabase database for the Mission Fresh application, following the SSOT8001 framework.

## Files

- `init_schema.sql` - Contains the database schema definition (tables, functions, policies)
- `create_exec_sql_function.sql` - SQL to create a helper function for migrations
- `setup_exec_sql.js` - Script to guide you in setting up the helper function
- `apply_migrations.js` - Script to apply the database schema migrations

## Setup Process

### 1. Set Up the `exec_sql` Function

First, you need to set up the `exec_sql` function on your Supabase instance. This function is required to execute SQL statements via RPC.

Run the setup script:

```sh
node db/setup_exec_sql.js
```

This will give you instructions on how to create the function in the Supabase SQL Editor.

### 2. Apply Database Migrations

After setting up the `exec_sql` function, you can apply the database migrations:

```sh
node db/apply_migrations.js
```

This will create all the necessary tables, functions, and policies in your Supabase database.

### 3. Verify the Setup

To verify that the database has been set up correctly, check that the following tables exist in your Supabase dashboard:

- `mission4_user_profiles`
- `mission4_progress`
- `mission4_health_milestones`
- `mood_logs`
- `focus_logs`
- `energy_focus_logs`

## Environment Variables

The scripts use the following environment variables:

- `VITE_SUPABASE_URL` - The URL of your Supabase instance
- `VITE_SUPABASE_ANON_KEY` - The anonymous key for your Supabase instance

These are automatically read from your environment or fallback to default values specified in the scripts.

## Troubleshooting

If you encounter any issues during the setup:

1. Check that you have created the `exec_sql` function correctly in Supabase.
2. Verify that your Supabase credentials are correct.
3. Check the Supabase logs for any errors.
4. Make sure you have the required permissions to create tables and functions.

For further assistance, contact the development team. 