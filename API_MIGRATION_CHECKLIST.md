# API Migration Checklist

This document tracks the progress of migrating all components to use direct REST API calls via `missionFreshApiClient.ts` instead of Supabase client methods, as required by SSOT8001.

## Components to Migrate

### Core Components
- ✅ ConsumptionLogger.tsx - Updated to use supabaseRestCall for CRUD operations
- ✅ AuthProvider.tsx - Updated imports to use missionFreshApiClient.ts
- ✅ FocusTracker.tsx - Updated imports to use missionFreshApiClient.ts
- ✅ EnergyTracker.tsx - Updated imports to use missionFreshApiClient.ts
- ✅ GameAchievements.tsx - Updated imports and fixed array handling
- ✅ router.tsx - Updated imports to use missionFreshApiClient.ts
- ✅ Achievements.tsx - Removed supabase import
- ✅ Community.tsx - Updated to properly use supabaseRestCall
- ✅ Settings.tsx - Updated to properly use supabaseRestCall
- ✅ SupabaseTest.tsx - Updated imports to use missionFreshApiClient.ts
- ⚠️ GuidesHub.tsx - Created temp file with changes (full file too large to process)
- ✅ ProductDetail.tsx - Already using REST API calls correctly

### Hooks and Utilities
- ✅ useSession.ts - Updated imports to use missionFreshApiClient.ts
- ✅ supabase/client.ts - Updated to use missionFreshApiClient.ts

## Linter Errors to Fix

### FocusTracker.tsx
- Line 559: Cannot find name 'setFocusTrends'
- Line 585-588: Type 'string[]' cannot be used as an index type
- Line 607: Property 'techniques' does not exist on type 'FocusLog'
- Line 644: Property 'date' does not exist on type 'FocusLog'
- Line 662: Cannot find name 'setFocusTrends'

## Implementation Status

1. Auth Functions (90% Complete)
   - ✅ getCurrentSession
   - ✅ getCurrentUser
   - ✅ onAuthStateChange
   - ✅ signInWithEmail
   - ✅ signOut
   - ⬜ signUp

2. Direct REST API Calls (100% Complete)
   - ✅ GET operations
   - ✅ POST operations
   - ✅ PUT/PATCH operations
   - ✅ DELETE operations
   - ✅ Error handling
   - ✅ Optimized batching for related API calls
   
3. UI Component Integration (95% Complete)
   - ✅ Data fetching components
   - ✅ Form submission components
   - ✅ Real-time update components
   - ⬜ Subscription-based components

## Next Steps

1. Fix the linter errors in FocusTracker.tsx
2. Manually merge changes from GuidesHub.tsx.new into GuidesHub.tsx
3. ✅ Update supabase/client.ts to use missionFreshApiClient.ts
4. Test all components to ensure they work with the new API implementation
5. Update the documentation to reflect the migration changes 