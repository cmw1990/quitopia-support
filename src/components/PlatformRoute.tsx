import { Navigate, useLocation } from 'react-router-dom';

interface PlatformRouteProps {
  children: React.ReactNode;
  platform: 'webapp' | 'webtool' | 'desktop' | 'mobile' | 'extension';
}

const platformPaths = {
  webapp: '/',
  webtool: '/tool',
  desktop: '/desktop',
  mobile: '/mobile',
  extension: '/ext',
};

export function PlatformRoute({ children, platform }: PlatformRouteProps) {
  const location = useLocation();
  const basePath = platformPaths[platform];
  
  // Check if the current path matches the platform's base path
  const isCorrectPlatform = location.pathname.startsWith(basePath);
  
  if (!isCorrectPlatform) {
    // Redirect to the platform's base path while preserving the rest of the path
    const redirectPath = location.pathname.replace(/^\/[^/]*/, basePath);
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
}
