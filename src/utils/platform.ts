// Platform detection utilities
export type Platform = 'webapp' | 'webtool' | 'desktop' | 'mobile' | 'extension';

// Platform-specific path prefixes
export const PlatformPaths = {
  webapp: '',                    // example.com/
  webtool: '/tools',             // tools.example.com/tools/
  desktop: '/desktop',          // desktop://
  mobile: '/mobile',            // capacitor://
  extension: '/ext'             // chrome-extension://
} as const;

// Platform capabilities
export const PlatformFeatures = {
  webapp: ['seo', 'keyboard-shortcuts', 'file-system-access', 'deep-linking'],
  webtool: ['standalone', 'shareable', 'embeddable', 'isolated-storage'],
  desktop: ['system-tray', 'background-running', 'native-menus', 'offline-mode', 'local-storage'],
  mobile: ['push-notifications', 'haptics', 'camera', 'offline-mode', 'deep-linking'],
  extension: ['browser-integration', 'tab-management', 'isolated-storage']
} as const;

// Platform-specific route configurations
export const PlatformRouteConfig = {
  webapp: {
    authPrefix: '/auth',
    appPrefix: '/app',
    toolsPrefix: '/app/tools',
    useHash: false,
    requireAuth: true
  },
  webtool: {
    authPrefix: '/auth',
    appPrefix: '',  // Tools are standalone, no app prefix
    toolsPrefix: '',
    useHash: false,
    requireAuth: false
  },
  desktop: {
    authPrefix: '/auth',
    appPrefix: '/app',
    toolsPrefix: '/tools',
    useHash: true,  // Use hash routing for desktop
    requireAuth: true
  },
  mobile: {
    authPrefix: '/auth',
    appPrefix: '/app',
    toolsPrefix: '/app/tools',
    useHash: true,  // Use hash routing for mobile
    requireAuth: true
  },
  extension: {
    authPrefix: '/auth',
    appPrefix: '/app',
    toolsPrefix: '/tools',
    useHash: true,  // Use hash routing for extension
    requireAuth: true
  }
} as const;

/**
 * Get the current platform based on the URL
 */
export function getPlatform(): Platform {
  const path = window.location.pathname;
  
  if (path.startsWith('/tools')) return 'webtool';
  if (path.startsWith('/desktop')) return 'desktop';
  if (path.startsWith('/mobile')) return 'mobile';
  if (path.startsWith('/ext')) return 'extension';
  
  return 'webapp';
}

/**
 * Check if the current route requires authentication
 */
export function requiresAuth(path: string): boolean {
  return path.startsWith('/app/');
}

/**
 * Get the platform-specific route
 * Handles hash-based routing for desktop/mobile/extension
 */
export function getPlatformRoute(path: string): string {
  const platform = getPlatform();
  const base = getBasePath(platform);
  
  // Hash-based routing for certain platforms
  if (['desktop', 'mobile', 'extension'].includes(platform)) {
    return `${base}#${path}`;
  }
  
  return `${base}${path}`;
}

// Get all supported features for current platform
export const getSupportedFeatures = (platform = getPlatform()): string[] => {
  return [...(PlatformFeatures[platform] || [])];
};

// Check if current platform is standalone tool
export const isStandaloneTool = (): boolean => getPlatform() === 'webtool';

// Get platform-specific route configuration
export const getRouteConfig = (platform = getPlatform()) => {
  return PlatformRouteConfig[platform];
};

// Get appropriate base path for current platform
export const getBasePath = (platform = getPlatform()): string => {
  return PlatformPaths[platform] || '';
};

// Generate platform-aware route
export const getPlatformAwareRoute = (path: string, platform = getPlatform()): string => {
  const config = PlatformRouteConfig[platform];
  const basePath = PlatformPaths[platform];
  
  // Handle hash routing
  if (config.useHash) {
    return `#${basePath}${path}`;
  }
  
  return `${basePath}${path}`;
};

// Check if current route requires authentication
export const requiresAuthRoute = (path: string, platform = getPlatform()): boolean => {
  const config = PlatformRouteConfig[platform];
  
  // Auth routes never require authentication
  if (path.startsWith(config.authPrefix)) return false;
  
  // Webtool doesn't require auth by default
  if (platform === 'webtool') return false;
  
  // All other protected routes require authentication
  return config.requireAuth;
};

// Generate a shareable permalink
export const generatePermalink = (
  path: string,
  platform = getPlatform(),
  params: Record<string, string> = {}
): string => {
  const baseUrl = window.location.origin;
  const basePath = PlatformPaths[platform];
  const queryString = new URLSearchParams(params).toString();
  
  return `${baseUrl}${basePath}${path}${queryString ? `?${queryString}` : ''}`;
};
