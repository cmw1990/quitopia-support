/**
 * This file serves as the integration point between the easier-focus micro-frontend
 * and the main application. It exports key components, hooks, and utilities that
 * can be consumed by the main app.
 */

// Export main page components
export { default as FocusLandingPage } from './pages/LandingPage';
export { default as FocusDashboard } from './pages/app/Dashboard';
export { default as FocusSessionPage } from './pages/app/FocusSession';
export { default as FocusDistractionsPage } from './pages/app/DistractionBlocker';
export { default as FocusAuthPage } from './pages/auth/AuthPage';

// Export key components that might be used individually
export { PomodoroTimer } from './components/focus/PomodoroTimer';

// Export hooks
export { useAuth } from './hooks/useAuth';
export { useToast } from './hooks/useToast';

// Export utilities
export {
  calculateFocusScore,
  formatDuration,
  formatDate,
  formatDateTime,
} from './lib/utils';

// Export all types
export * from './types'; 