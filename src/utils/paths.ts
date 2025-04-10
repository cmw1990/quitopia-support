import { lazy } from 'react';

/**
 * Type for component import configurations
 */
export interface ComponentImport {
  /** The directory where the component is located */
  dir: 'pages' | 'components' | 'layouts';
  /** The path to the component file relative to the directory */
  path: string;
  /** The name of the exported component */
  exportName: string;
}

/**
 * Creates a path to a component based on its configuration
 */
export function createComponentPath(config: ComponentImport): string {
  return `@/${config.dir}/${config.path}`;
}

/**
 * Creates a lazy-loaded component
 */
export function createLazyComponent(componentPath: string) {
  return lazy(() => {
    // Remove leading slash and .tsx extension if present
    const normalizedPath = componentPath
      .replace(/^\/src\//, '')
      .replace(/\.tsx$/, '');
      
    return import(`../` + normalizedPath);
  });
}

/**
 * Component paths configuration
 */
export const COMPONENT_PATHS = {
  // Layouts
  RootLayout: 'layouts/RootLayout',
  AppLayout: 'layouts/AppLayout',
  
  // Pages
  Landing: 'pages/Landing',
  Login: 'pages/auth/Login',
  Register: 'pages/auth/Register',
  ForgotPassword: 'pages/auth/ForgotPassword',
  Dashboard: 'pages/app/Dashboard',
  Profile: 'pages/app/Profile',
  Settings: 'pages/app/Settings',
  
  // Components
  ErrorBoundary: 'components/ErrorBoundary',
  
  // Features
  Sleep: 'pages/app/Sleep/Sleep',
  Exercise: 'pages/app/Exercise/Exercise',
  Focus: 'pages/app/Focus/Focus',
  Mental: 'pages/app/Mental/Mental',
  Energy: 'pages/app/Energy/Energy',
  Recovery: 'pages/app/Recovery/Recovery',
  Consultation: 'pages/app/Consultation/Consultation',
  Recipes: 'pages/app/Recipes/Recipes',
  Analytics: 'pages/app/Analytics/Analytics',
  
  // Tools
  Tools: 'pages/app/tools/Tools',
  WhiteNoise: 'pages/app/tools/WhiteNoise/WhiteNoise',
  Pomodoro: 'pages/app/tools/Pomodoro/Pomodoro',
  SleepSounds: 'pages/app/tools/SleepSounds/SleepSounds',
  Meditation: 'pages/app/tools/Meditation/Meditation',
  Breathwork: 'pages/app/tools/Breathwork/Breathwork',
  Journal: 'pages/app/tools/Journal/Journal'
} as const;
