/**
 * Navigation utilities for the Easier Focus application
 * Provides consistent navigation paths across the application
 */

// Core app paths
export const AppPaths = {
  // Public routes
  landing: '/',
  webTools: '/web-tools',
  webApp: '/web-app',
  mobileApp: '/mobile-app',
  download: '/download',
  downloadMobile: '/download/mobile',
  downloadDesktop: '/download/desktop',
  downloadExtension: '/download/extension',
  
  // Auth routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  
  // Protected app routes
  app: '/app',
  dashboard: '/app/dashboard',
  focusTimer: '/app/focus-timer',
  focusJournal: '/app/focus-journal',
  adhdSupport: '/app/adhd-support',
  distractionBlocker: '/app/distraction-blocker',
  energyManagement: '/app/energy-management',
  settings: '/app/settings',
  profile: '/app/profile',
  notifications: '/app/notifications',
  analytics: '/app/analytics',
  
  // Games routes
  games: '/app/games',
  patternMatch: '/app/games/pattern-match',
  memoryCards: '/app/games/memory-cards',
  zenDrift: '/app/games/zen-drift',
  gameStats: '/app/games/stats',
  
  // Tools routes
  tools: '/app/tools',
  whiteNoise: '/app/tools/white-noise',
  binauralBeats: '/app/tools/binaural-beats',
  pomodoro: '/app/tools/pomodoro',
  readingGuide: '/app/tools/reading-guide',
  quickTodo: '/app/tools/quick-todo',
  
  // Individual tool routes
  tool: (slug: string) => `/tools/${slug}`,
  
  // Mobile-specific routes
  mobileOnboarding: '/mobile/onboarding',
  mobileSettings: '/mobile/settings',
  mobileDashboard: '/mobile/dashboard',
  mobileFocusTimer: '/mobile/focus-timer',
  mobileAdhdSupport: '/mobile/adhd-support',
  mobileDistractionBlocker: '/mobile/distraction-blocker',
  mobileEnergyManagement: '/mobile/energy-management',
  mobileGames: '/mobile/games',
  mobilePatternMatch: '/mobile/games/pattern-match',
  mobileMemoryCards: '/mobile/games/memory-cards',
  mobileZenDrift: '/mobile/games/zen-drift',
  mobileGameStats: '/mobile/games/stats',
  
  // Info pages
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  careers: '/careers',
  blog: '/blog',
  research: '/research',
  guides: '/guides',
  support: '/support',
} as const;

// Helper function to check if a user is authenticated
export const isAuthenticated = (): boolean => {
  // Add your authentication check logic here
  // For example:
  // return !!localStorage.getItem('authToken');
  return false;
};

// Helper function to determine if we're on a mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}; 