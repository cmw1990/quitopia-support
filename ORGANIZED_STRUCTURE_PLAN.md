# Mission Fresh Organized Structure Plan

This document outlines how to reorganize the existing codebase into a cleaner structure without duplicate files.

## Directory Structure

```
src/
├── api/                # API clients and services
├── assets/             # Static assets (images, fonts, etc.)
├── components/         # Reusable UI components
│   ├── analytics/      # Analytics-related components
│   ├── common/         # Common components used throughout the app
│   ├── features/       # Feature-specific components
│   ├── games/          # Game components
│   ├── health/         # Health tracking components
│   ├── layouts/        # Layout components
│   ├── routing/        # Routing components
│   └── ui/             # UI components (buttons, cards, etc.)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
│   ├── app/            # Authenticated app pages
│   ├── auth/           # Authentication pages
│   ├── errors/         # Error pages
│   ├── health/         # Health pages
│   ├── public/         # Public pages
│   ├── tracking/       # Tracking pages
│   └── tools/          # Tools pages
├── routes/             # Route definitions
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## File Mapping

### Root Files

| Current Location | New Location |
|------------------|-------------|
| src/App.tsx | src/App.tsx |
| src/main.tsx | src/main.tsx |
| src/MissionFreshApp.tsx | src/MissionFreshApp.tsx |
| src/routes.tsx | src/routes/index.tsx |
| src/router.tsx | src/routes/router.tsx |
| src/index.css | src/styles/index.css |

### Pages

| Current Location | New Location |
|------------------|-------------|
| src/pages/DashboardPage.tsx | src/pages/app/Dashboard.tsx |
| src/pages/LandingPage.tsx | src/pages/LandingPage.tsx |
| src/pages/LoginPage.tsx | src/pages/auth/AuthPage.tsx |
| src/pages/SmokelessProductsDirectory.tsx | src/pages/directories/SmokelessProducts.tsx |
| src/pages/SleepQualityPage.tsx | src/pages/health/SleepQuality.tsx |
| src/pages/MoodTrackingPage.tsx | src/pages/health/MoodTracking.tsx |
| src/pages/TriggerInterventionPage.tsx | src/pages/triggers/TriggerIntervention.tsx |
| src/pages/WebTools.tsx | src/pages/tools/WebTools.tsx |
| src/components/Dashboard.tsx | src/pages/app/Dashboard.tsx |

### Components

| Current Location | New Location |
|------------------|-------------|
| src/components/Navbar.tsx | src/components/common/Navbar.tsx |
| src/components/Footer.tsx | src/components/common/Footer.tsx |
| src/components/PublicNavbar.tsx | src/components/common/PublicNavbar.tsx |
| src/components/TopBar.tsx | src/components/common/TopBar.tsx |
| src/components/BottomTabBar.tsx | src/components/common/BottomTabBar.tsx |
| src/components/ErrorBoundary.tsx | src/components/common/ErrorBoundary.tsx |
| src/components/ApiErrorFallback.tsx | src/components/common/ApiErrorFallback.tsx |
| src/components/OfflineStatusIndicator.tsx | src/components/common/OfflineStatusIndicator.tsx |
| src/components/ProtectedRoute.tsx | src/components/routing/ProtectedRoute.tsx |
| src/components/layouts/* | src/components/layouts/* |
| src/components/ui/* | src/components/ui/* |
| src/components/health/* | src/components/health/* |
| src/components/games/* | src/components/games/* |
| src/components/analytics/* | src/components/analytics/* |
| src/components/community/* | src/components/features/community/* |
| src/components/NRTDirectory/* | src/components/features/nrt-directory/* |

### Features

| Current Location | New Location |
|------------------|-------------|
| src/components/ConsumptionLogger.tsx | src/components/features/tracking/ConsumptionLogger.tsx |
| src/components/SimpleLogger.tsx | src/components/features/tracking/SimpleLogger.tsx |
| src/components/Progress.tsx | src/components/features/tracking/Progress.tsx |
| src/components/TriggerAnalysis.tsx | src/components/features/triggers/TriggerAnalysis.tsx |
| src/components/Achievements.tsx | src/components/features/achievements/Achievements.tsx |
| src/components/StepRewards.tsx | src/components/features/rewards/StepRewards.tsx |
| src/components/GameHub.tsx | src/components/features/games/GameHub.tsx |
| src/components/GameDetails.tsx | src/components/features/games/GameDetails.tsx |
| src/components/GuidesHub.tsx | src/components/features/guides/GuidesHub.tsx |
| src/components/Community.tsx | src/components/features/community/Community.tsx |
| src/components/Settings.tsx | src/components/features/settings/Settings.tsx |
| src/components/AlternativeProducts.tsx | src/components/features/products/AlternativeProducts.tsx |
| src/components/NRTDirectory.tsx | src/components/features/products/NRTDirectory.tsx |

### Hooks & Contexts

| Current Location | New Location |
|------------------|-------------|
| src/hooks/* | src/hooks/* |
| src/contexts/* | src/contexts/* |
| src/context/* | src/contexts/* (merge) |

### API & Services

| Current Location | New Location |
|------------------|-------------|
| src/api/* | src/api/* |
| src/services/* | src/api/services/* |

## Implementation Steps

1. **Backup**: Ensure current `src` is backed up (already done with `src-backup`).
2. **Copy Structure**: Use new structure in `src-restructured`.
3. **Move Files**: Copy files from old location to new following the mapping above.
4. **Fix Imports**: Update import statements to reflect new file locations.
5. **Test**: Verify the app works with the new structure.
6. **Switch**: Rename directories to switch to the new structure:
   ```bash
   mv src src-old
   mv src-restructured src
   ```
7. **Clean Up**: Remove duplicate components and validate functionality.

## Guidelines for Ongoing Development

1. **Naming**: Use consistent naming conventions:
   - Pages: `CamelCase.tsx`
   - Components: `CamelCase.tsx`
   - Hooks: `useCamelCase.ts`
   - Contexts: `CamelCaseContext.tsx`

2. **Imports**: Organize imports by:
   - External libraries first
   - App modules next, grouped by type
   - Local files last

3. **Component Structure**:
   - Keep components in appropriate directories based on their purpose
   - Refactor large components into smaller, reusable parts
   - Use index.ts files to simplify imports for complex feature folders 