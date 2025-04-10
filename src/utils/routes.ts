// Helper function to get route by name
export function getRoute(name: string): string {
  switch (name) {
    case 'login':
      return '/auth/login';
    case 'register':
      return '/auth/register';
    case 'dashboard':
      return '/app/dashboard';
    case 'focus':
      return '/app/focus';
    case 'sleep':
      return '/app/sleep';
    case 'exercise':
      return '/app/exercise';
    case 'mental-health':
      return '/app/mental-health';
    case 'energy-plans':
      return '/app/energy-plans';
    case 'recovery':
      return '/app/recovery';
    case 'consultation':
      return '/app/consultation';
    case 'recipes':
      return '/app/recipes';
    case 'analytics':
      return '/app/analytics';
    default:
      return '/';
  }
}
