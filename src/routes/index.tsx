import React, { lazy, Suspense } from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  BrowserRouter as Router,
  // Remove unused UNSAFE imports
  // UNSAFE_DataRouterContext,
  // UNSAFE_DataRouterStateContext
} from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
// Import the new AppLayout
import AppLayout from '@/layouts/AppLayout'; 

// Public Pages
const LandingPage = lazy(() => import('@/pages/public/LandingPage'));

// Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// App Pages
const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'));
const FocusStrategiesPage = lazy(() => import('@/pages/app/FocusStrategiesPage'));
const MoodTrackingPage = lazy(() => import('@/pages/app/MoodTrackingPage'));
const TasksPage = lazy(() => import('@/pages/app/TasksPage'));
const EnergyTrackingPage = lazy(() => import('@/pages/app/EnergyTrackingPage'));
const AnalyticsPage = lazy(() => import('@/pages/app/AnalyticsPage'));
const GamesPage = lazy(() => import('@/pages/app/GamesPage'));
const PomodoroPage = lazy(() => import('@/pages/app/PomodoroPage'));

// App Pages (New - Placeholder)
// TODO: Create actual page components
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage')); // Assume exists or create
const AchievementsPage = lazy(() => import('@/pages/app/AchievementsPage')); // Assume exists or create
const CommunityPage = lazy(() => import('@/pages/app/CommunityPage')); // Assume exists or create

// Configure future flags
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingOverlay isLoading={true} />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Protected App Routes wrapped in AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}> { /* Wrap app routes */ }
                {/* Existing App Routes */}
                <Route path="/app/dashboard" element={<DashboardPage />} />
                <Route path="/app/focus-strategies" element={<FocusStrategiesPage />} />
                <Route path="/app/mood-tracking" element={<MoodTrackingPage />} />
                <Route path="/app/tasks" element={<TasksPage />} />
                <Route path="/app/energy-tracking" element={<EnergyTrackingPage />} />
                <Route path="/app/analytics" element={<AnalyticsPage />} />
                <Route path="/app/games" element={<GamesPage />} />
                <Route path="/app/pomodoro" element={<PomodoroPage />} />
                
                {/* New App Routes */}
                <Route path="/app/settings" element={<SettingsPage />} /> 
                <Route path="/app/achievements" element={<AchievementsPage />} />
                <Route path="/app/community" element={<CommunityPage />} />
                
                {/* Redirect from base /app to dashboard */}
                <Route path="/app" element={<Navigate to="/app/dashboard" replace />} /> 
              </Route>
            </Route>

            {/* Redirect any unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
