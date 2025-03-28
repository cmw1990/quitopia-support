# Mission Fresh - Route Analysis

## Current Route Structure

Based on the analysis of the router.tsx and routes.tsx files, the application has the following route structure:

### Public Routes
- `/` - Landing Page (accessible to all users)
- `/auth` - Authentication/Login Page

### Web Tools Routes (for non-logged in users)
- `/web-tools/nrt-directory` - NRT Directory (public-facing)
- `/web-tools/*` - Other web tools routes

### Protected Routes (require authentication)
- `/app` - Main Dashboard (default after login)
- `/app/dashboard` - Main Dashboard (explicit route)
- `/app/progress` - Progress Tracking
- `/app/consumption-logger` - Consumption Logging
- `/app/nrt-directory` - NRT Directory (authenticated version)
- `/app/alternative-products` - Alternative Products Directory
- `/app/guides` - Guides Hub
- `/app/community` - Community Features
- `/app/health/*` - Health-related features:
  - `/app/health/mood` - Mood Tracker
  - `/app/health/energy` - Energy Tracker
  - `/app/health/focus` - Focus Tracker
  - `/app/health/craving` - Craving Tracker
  - `/app/health/dashboard` - Holistic Dashboard
- `/app/settings` - User Settings
- `/app/challenges` - Community Challenges
- `/app/achievements` - User Achievements
- `/app/journal` - Journal Feature
- `/app/analytics` - Analytics Dashboard
- `/app/games/*` - Game-related features for craving management

## Navigation Issues

1. **Duplicate Routes**: There are some routes that appear to be duplicated between router.tsx and routes.tsx
2. **Inconsistent Prefixing**: Some features have nested routes (e.g., /health/*) while others are direct (e.g., /progress)
3. **Missing Mobile-Specific Routes**: The mobile-specific UI doesn't have clear route differentiation

## Proposed Route Organization

A cleaner route structure would be:

### Public Routes
- `/` - Landing Page
- `/auth` - Authentication
- `/web-tools/*` - Public-facing web tools for SEO and visitor access

### Protected App Routes
- `/app` - Main Dashboard (default route after login)
- `/app/tracking/*` - All tracking-related features:
  - `/app/tracking/progress` - Progress tracking
  - `/app/tracking/consumption` - Consumption logging
  - `/app/tracking/journal` - Journal entries
- `/app/directories/*` - All directory-related features:
  - `/app/directories/nrt` - NRT Directory
  - `/app/directories/alternatives` - Alternative products
- `/app/health/*` - Health tracking features:
  - `/app/health/dashboard` - Holistic health dashboard
  - `/app/health/mood` - Mood tracking
  - `/app/health/energy` - Energy tracking
  - `/app/health/focus` - Focus tracking
  - `/app/health/sleep` - Sleep tracking
  - `/app/health/cravings` - Craving management
- `/app/community/*` - Community features:
  - `/app/community/feed` - Social feed
  - `/app/community/challenges` - Community challenges
  - `/app/community/messages` - Private messaging
- `/app/tools/*` - Support tools:
  - `/app/tools/games` - Distraction games
  - `/app/tools/guides` - Quitting guides
  - `/app/tools/interventions` - Trigger interventions
- `/app/achievements` - User achievements
- `/app/analytics` - Data analytics
- `/app/settings` - User settings

## Navigation Flow Improvements

1. **Group Related Features**: Related features should be grouped under common prefixes
2. **Consistent Depth**: Maintain a consistent route depth (3 levels max)
3. **Clear Separation**: Separate concerns between public and authenticated routes
4. **Mobile Consideration**: Navigation should adapt based on device type

## Next Steps

1. Restructure the router files to reflect this organization
2. Update navigation components to use the new route structure
3. Create redirects from old routes to maintain backward compatibility
4. Update deep links to use the new route structure 