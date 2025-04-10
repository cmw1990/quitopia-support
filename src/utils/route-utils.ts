import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PlatformRoute } from '@/components/PlatformRoute';
import { getPlatform } from './platform';

type Platform = 'webapp' | 'webtool' | 'desktop' | 'mobile' | 'extension';

// Helper to create protected routes
export function createProtectedRoute(path: string, element: React.ReactNode): RouteObject {
  return {
    path,
    element: React.createElement(ProtectedRoute, null, element),
  };
}

// Helper to create platform-specific routes
export function createPlatformRoute(
  path: string, 
  element: React.ReactNode, 
  platform: string
): RouteObject {
  // This would use a platform-specific wrapper component
  return {
    path,
    element: React.createElement('div', null, element),
  };
}

export function validateRouteConfig(routes: RouteObject[]): boolean {
  const validateRoute = (route: RouteObject): boolean => {
    // Check required properties
    if (!route.path && !route.index) {
      console.error('Route must have either path or index property');
      return false;
    }

    if (route.element === undefined) {
      console.error(`Route ${route.path || 'index'} must have an element`);
      return false;
    }

    // Validate children recursively
    if (route.children) {
      return route.children.every(validateRoute);
    }

    return true;
  };

  return routes.every(validateRoute);
}

export const platformPaths = {
  webapp: '/',
  webtool: '/tool',
  desktop: '/desktop',
  mobile: '/mobile',
  extension: '/ext',
} as const;

export function getPlatformFromPath(path: string): Platform | null {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const platform = Object.entries(platformPaths).find(([_, basePath]) =>
    normalizedPath.startsWith(basePath)
  );
  return platform ? (platform[0] as Platform) : null;
}

export function stripPlatformPath(path: string): string {
  const platform = getPlatformFromPath(path);
  if (!platform) return path;
  
  const basePath = platformPaths[platform];
  return path.replace(new RegExp(`^${basePath}`), '') || '/';
}

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
  index?: boolean;
  isPublic?: boolean;
  requiresAuth?: boolean;
}
