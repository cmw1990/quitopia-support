#!/bin/bash

# Mission Fresh Codebase Organization Script
# This script reorganizes the codebase according to the structure in ORGANIZED_STRUCTURE_PLAN.md

# Ensure we're in the correct directory
cd "$(dirname "$0")/.."
echo "Working in directory: $(pwd)"

# Check if src-restructured exists
if [ ! -d "src-restructured" ]; then
  echo "Creating src-restructured directory..."
  mkdir -p src-restructured
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p src-restructured/api
mkdir -p src-restructured/assets
mkdir -p src-restructured/components/analytics
mkdir -p src-restructured/components/common
mkdir -p src-restructured/components/features/achievements
mkdir -p src-restructured/components/features/community
mkdir -p src-restructured/components/features/games
mkdir -p src-restructured/components/features/guides
mkdir -p src-restructured/components/features/nrt-directory
mkdir -p src-restructured/components/features/products
mkdir -p src-restructured/components/features/rewards
mkdir -p src-restructured/components/features/settings
mkdir -p src-restructured/components/features/tracking
mkdir -p src-restructured/components/features/triggers
mkdir -p src-restructured/components/games
mkdir -p src-restructured/components/health
mkdir -p src-restructured/components/layouts
mkdir -p src-restructured/components/routing
mkdir -p src-restructured/components/ui
mkdir -p src-restructured/contexts
mkdir -p src-restructured/hooks
mkdir -p src-restructured/lib
mkdir -p src-restructured/pages/app
mkdir -p src-restructured/pages/auth
mkdir -p src-restructured/pages/errors
mkdir -p src-restructured/pages/health
mkdir -p src-restructured/pages/public
mkdir -p src-restructured/pages/tracking
mkdir -p src-restructured/pages/tools
mkdir -p src-restructured/pages/triggers
mkdir -p src-restructured/pages/directories
mkdir -p src-restructured/routes
mkdir -p src-restructured/styles
mkdir -p src-restructured/types
mkdir -p src-restructured/utils

# Copy root files
echo "Copying root files..."
cp src/App.tsx src-restructured/
cp src/main.tsx src-restructured/
cp src/MissionFreshApp.tsx src-restructured/
cp src/routes.tsx src-restructured/routes/index.tsx
cp src/router.tsx src-restructured/routes/router.tsx
cp src/index.css src-restructured/styles/index.css
cp src/vite-env.d.ts src-restructured/env.d.ts

# Copy pages
echo "Copying pages..."
mkdir -p src-restructured/pages/app
if [ -f "src/pages/DashboardPage.tsx" ]; then
  cp src/pages/DashboardPage.tsx src-restructured/pages/app/Dashboard.tsx
elif [ -f "src/components/Dashboard.tsx" ]; then
  cp src/components/Dashboard.tsx src-restructured/pages/app/Dashboard.tsx
fi

if [ -f "src/pages/LandingPage.tsx" ]; then
  cp src/pages/LandingPage.tsx src-restructured/pages/LandingPage.tsx
elif [ -f "src/components/LandingPage.tsx" ]; then
  cp src/components/LandingPage.tsx src-restructured/pages/LandingPage.tsx
fi

if [ -f "src/pages/LoginPage.tsx" ]; then
  cp src/pages/LoginPage.tsx src-restructured/pages/auth/AuthPage.tsx
elif [ -f "src/components/LoginPage.tsx" ]; then
  cp src/components/LoginPage.tsx src-restructured/pages/auth/AuthPage.tsx
fi

if [ -f "src/pages/SmokelessProductsDirectory.tsx" ]; then
  cp src/pages/SmokelessProductsDirectory.tsx src-restructured/pages/directories/SmokelessProducts.tsx
fi

if [ -f "src/pages/SleepQualityPage.tsx" ]; then
  cp src/pages/SleepQualityPage.tsx src-restructured/pages/health/SleepQuality.tsx
fi

if [ -f "src/pages/MoodTrackingPage.tsx" ]; then
  cp src/pages/MoodTrackingPage.tsx src-restructured/pages/health/MoodTracking.tsx
fi

if [ -f "src/pages/TriggerInterventionPage.tsx" ]; then
  cp src/pages/TriggerInterventionPage.tsx src-restructured/pages/triggers/TriggerIntervention.tsx
fi

if [ -f "src/pages/WebTools.tsx" ]; then
  cp src/pages/WebTools.tsx src-restructured/pages/tools/WebTools.tsx
elif [ -f "src/components/WebTools.tsx" ]; then
  cp src/components/WebTools.tsx src-restructured/pages/tools/WebTools.tsx
fi

# Copy common components
echo "Copying common components..."
if [ -f "src/components/Navbar.tsx" ]; then
  cp src/components/Navbar.tsx src-restructured/components/common/
fi

if [ -f "src/components/Footer.tsx" ]; then
  cp src/components/Footer.tsx src-restructured/components/common/
fi

if [ -f "src/components/PublicNavbar.tsx" ]; then
  cp src/components/PublicNavbar.tsx src-restructured/components/common/
fi

if [ -f "src/components/TopBar.tsx" ]; then
  cp src/components/TopBar.tsx src-restructured/components/common/
fi

if [ -f "src/components/BottomTabBar.tsx" ]; then
  cp src/components/BottomTabBar.tsx src-restructured/components/common/
fi

if [ -f "src/components/ErrorBoundary.tsx" ]; then
  cp src/components/ErrorBoundary.tsx src-restructured/components/common/
fi

if [ -f "src/components/ApiErrorFallback.tsx" ]; then
  cp src/components/ApiErrorFallback.tsx src-restructured/components/common/
fi

if [ -f "src/components/OfflineStatusIndicator.tsx" ]; then
  cp src/components/OfflineStatusIndicator.tsx src-restructured/components/common/
fi

if [ -f "src/components/ProtectedRoute.tsx" ]; then
  cp src/components/ProtectedRoute.tsx src-restructured/components/routing/
fi

# Copy layout components
echo "Copying layout components..."
if [ -d "src/components/layouts" ]; then
  cp -r src/components/layouts/* src-restructured/components/layouts/
fi

# Copy UI components
echo "Copying UI components..."
if [ -d "src/components/ui" ]; then
  cp -r src/components/ui/* src-restructured/components/ui/
fi

# Copy health components
echo "Copying health components..."
if [ -d "src/components/health" ]; then
  cp -r src/components/health/* src-restructured/components/health/
fi

# Copy game components
echo "Copying game components..."
if [ -d "src/components/games" ]; then
  cp -r src/components/games/* src-restructured/components/games/
fi

# Copy analytics components
echo "Copying analytics components..."
if [ -d "src/components/analytics" ]; then
  cp -r src/components/analytics/* src-restructured/components/analytics/
fi

# Copy feature-specific components
echo "Copying feature-specific components..."

# Tracking features
if [ -f "src/components/ConsumptionLogger.tsx" ]; then
  cp src/components/ConsumptionLogger.tsx src-restructured/components/features/tracking/
fi

if [ -f "src/components/SimpleLogger.tsx" ]; then
  cp src/components/SimpleLogger.tsx src-restructured/components/features/tracking/
fi

if [ -f "src/components/Progress.tsx" ]; then
  cp src/components/Progress.tsx src-restructured/components/features/tracking/
fi

# Trigger analysis
if [ -f "src/components/TriggerAnalysis.tsx" ]; then
  cp src/components/TriggerAnalysis.tsx src-restructured/components/features/triggers/
fi

# Achievements
if [ -f "src/components/Achievements.tsx" ]; then
  cp src/components/Achievements.tsx src-restructured/components/features/achievements/
fi

# Step rewards
if [ -f "src/components/StepRewards.tsx" ]; then
  cp src/components/StepRewards.tsx src-restructured/components/features/rewards/
fi

# Game features
if [ -f "src/components/GameHub.tsx" ]; then
  cp src/components/GameHub.tsx src-restructured/components/features/games/
fi

if [ -f "src/components/GameDetails.tsx" ]; then
  cp src/components/GameDetails.tsx src-restructured/components/features/games/
fi

# Guides
if [ -f "src/components/GuidesHub.tsx" ]; then
  cp src/components/GuidesHub.tsx src-restructured/components/features/guides/
fi

# Community
if [ -f "src/components/Community.tsx" ]; then
  cp src/components/Community.tsx src-restructured/components/features/community/
fi

# Community folder
if [ -d "src/components/community" ]; then
  cp -r src/components/community/* src-restructured/components/features/community/
fi

# Settings
if [ -f "src/components/Settings.tsx" ]; then
  cp src/components/Settings.tsx src-restructured/components/features/settings/
fi

# Products
if [ -f "src/components/AlternativeProducts.tsx" ]; then
  cp src/components/AlternativeProducts.tsx src-restructured/components/features/products/
fi

if [ -f "src/components/NRTDirectory.tsx" ]; then
  cp src/components/NRTDirectory.tsx src-restructured/components/features/products/
fi

# NRT Directory folder
if [ -d "src/components/NRTDirectory" ]; then
  cp -r src/components/NRTDirectory/* src-restructured/components/features/nrt-directory/
fi

# Copy hooks and contexts
echo "Copying hooks and contexts..."
if [ -d "src/hooks" ]; then
  cp -r src/hooks/* src-restructured/hooks/
fi

if [ -d "src/contexts" ]; then
  cp -r src/contexts/* src-restructured/contexts/
fi

if [ -d "src/context" ]; then
  cp -r src/context/* src-restructured/contexts/
fi

# Copy API and services
echo "Copying API and services..."
if [ -d "src/api" ]; then
  cp -r src/api/* src-restructured/api/
fi

if [ -d "src/services" ]; then
  mkdir -p src-restructured/api/services
  cp -r src/services/* src-restructured/api/services/
fi

# Copy types
echo "Copying types..."
if [ -d "src/types" ]; then
  cp -r src/types/* src-restructured/types/
fi

# Copy utils
echo "Copying utils..."
if [ -d "src/utils" ]; then
  cp -r src/utils/* src-restructured/utils/
fi

# Copy lib
echo "Copying lib..."
if [ -d "src/lib" ]; then
  cp -r src/lib/* src-restructured/lib/
fi

# Create error pages if they don't exist
echo "Creating error pages if needed..."
if [ ! -f "src-restructured/pages/errors/NotFound.tsx" ]; then
  cat > src-restructured/pages/errors/NotFound.tsx << 'EOF'
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          We couldn't find the page you were looking for. The page might have been moved, deleted, or never existed.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
EOF
fi

if [ ! -f "src-restructured/pages/errors/Unauthorized.tsx" ]; then
  cat > src-restructured/pages/errors/Unauthorized.tsx << 'EOF'
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-yellow-500">401</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-900 dark:text-white">Unauthorized Access</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          You don't have permission to access this page. Please log in or contact an administrator if you believe this is an error.
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600"
          >
            Log In
          </Link>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
EOF
fi

echo "Organization complete! The restructured codebase is now in src-restructured/."
echo "You should now fix import paths and test the restructured codebase before replacing the original src folder." 