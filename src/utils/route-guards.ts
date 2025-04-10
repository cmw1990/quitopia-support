import { useEffect } from 'react';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

// Route permission levels
export type PermissionLevel = 'public' | 'authenticated' | 'premium' | 'admin';

// Route platform types
export type PlatformType = 'webapp' | 'webtool' | 'desktop' | 'mobile' | 'extension';

// Route requirements interface
export interface RouteRequirements {
  permission: PermissionLevel;
  platform?: PlatformType[];
  features?: string[];
  roles?: string[];
  subscription?: string[];
  minVersion?: string;
  betaAccess?: boolean;
}

// Route state interface
export type RouteState = {
  from?: string;
  returnTo?: string;
  isRedirect?: boolean;
  preserveQuery?: boolean;
};

// Navigation history stack
class NavigationStack {
  private static readonly MAX_HISTORY = 50;
  private static history: string[] = [];

  static push(path: string) {
    this.history.push(path);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }
  }

  static getPrevious(): string | undefined {
    return this.history[this.history.length - 2];
  }

  static clear() {
    this.history = [];
  }
}

// Route guard hook
export function useRouteGuard(requirements: RouteRequirements) {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    user,
    session
  } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      // Wait for auth to initialize
      if (session === undefined) return;

      // Mock subscription and roles for now - these would come from the user object in a real app
      const subscription: string[] = user?.user_metadata?.subscription || [];
      const roles: string[] = user?.user_metadata?.roles || [];

      const redirectPath = await validateAccess({
        requirements,
        isAuthenticated: !!user,
        user,
        subscription,
        roles,
        location,
        navigate
      });

      if (redirectPath) {
        navigateWithFallback(navigate, redirectPath, {
          state: { 
            from: location.pathname,
            isRedirect: true,
            preserveQuery: true
          }
        });
      }
    };

    checkAccess();
  }, [requirements, user, session, location, navigate]);

  return { loading: session === undefined };
}

// Access validation
async function validateAccess({
  requirements,
  isAuthenticated,
  user,
  subscription,
  roles,
  location,
  navigate
}: {
  requirements: RouteRequirements;
  isAuthenticated: boolean;
  user: any;
  subscription: string[];
  roles: string[];
  location: ReturnType<typeof useLocation>;
  navigate: NavigateFunction;
}): Promise<string | null> {
  // Authentication check
  if (requirements.permission !== 'public' && !isAuthenticated) {
    return '/auth/login';
  }

  // Platform check
  if (requirements.platform) {
    const currentPlatform = getPlatformFromPath(location.pathname);
    if (!requirements.platform.includes(currentPlatform)) {
      return '/error/platform-not-supported';
    }
  }

  // Role check
  if (requirements.roles && !requirements.roles.some(role => roles.includes(role))) {
    return '/error/unauthorized';
  }

  // Subscription check
  if (requirements.subscription && 
      !requirements.subscription.some(sub => subscription.includes(sub))) {
    return '/pricing';
  }

  // Version check
  if (requirements.minVersion) {
    const currentVersion = await getCurrentAppVersion();
    if (compareVersions(currentVersion, requirements.minVersion) < 0) {
      return '/error/update-required';
    }
  }

  // Beta access check
  if (requirements.betaAccess && !user?.hasBetaAccess) {
    return '/error/beta-required';
  }

  // Feature flag check
  if (requirements.features) {
    const disabledFeatures = await checkFeatureFlags(requirements.features);
    if (disabledFeatures.length > 0) {
      return '/error/feature-disabled';
    }
  }

  return null;
}

// Safe navigation with fallback
export function navigateWithFallback(
  navigate: NavigateFunction,
  path: string,
  options: { 
    state?: RouteState;
    fallback?: string;
    maxRetries?: number;
  } = {}
) {
  const { 
    state,
    fallback = '/',
    maxRetries = 3
  } = options;

  let retryCount = 0;

  const attemptNavigation = async () => {
    try {
      // Record current path in navigation stack
      NavigationStack.push(path);

      // Perform navigation
      await navigate(path, { state });
    } catch (error) {
      console.error('Navigation failed:', error);
      retryCount++;

      if (retryCount < maxRetries) {
        // Retry with exponential backoff
        setTimeout(attemptNavigation, Math.pow(2, retryCount) * 1000);
      } else {
        // If all retries fail, navigate to fallback
        console.error(`Navigation to ${path} failed after ${maxRetries} attempts`);
        NavigationStack.push(fallback);
        navigate(fallback, { 
          state: { 
            from: path,
            error: 'Navigation failed'
          }
        });
      }
    }
  };

  attemptNavigation();
}

// Platform detection
function getPlatformFromPath(path: string): PlatformType {
  if (path.startsWith('/tool')) return 'webtool';
  if (path.startsWith('/desktop')) return 'desktop';
  if (path.startsWith('/mobile')) return 'mobile';
  if (path.startsWith('/ext')) return 'extension';
  return 'webapp';
}

// Version comparison utility
function compareVersions(v1: string, v2: string): number {
  const normalize = (v: string) => {
    return v.split('.').map(Number);
  };

  const n1 = normalize(v1);
  const n2 = normalize(v2);

  for (let i = 0; i < Math.max(n1.length, n2.length); i++) {
    const num1 = n1[i] || 0;
    const num2 = n2[i] || 0;
    if (num1 !== num2) return num1 - num2;
  }

  return 0;
}

// Get current app version
async function getCurrentAppVersion(): Promise<string> {
  try {
    const response = await fetch('/api/version');
    const { version } = await response.json();
    return version;
  } catch (error) {
    console.error('Failed to get app version:', error);
    return '0.0.0';
  }
}

// Check feature flags
async function checkFeatureFlags(features: string[]): Promise<string[]> {
  try {
    const response = await fetch('/api/features/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    const { disabledFeatures } = await response.json();
    return disabledFeatures;
  } catch (error) {
    console.error('Failed to check feature flags:', error);
    return [];
  }
}
