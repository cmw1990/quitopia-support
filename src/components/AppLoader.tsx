import React, { useEffect, useState } from 'react';
import { useTheme } from '@/lib/ThemeProvider';

interface AppLoaderProps {
  children: React.ReactNode;
}

export function AppLoader({ children }: AppLoaderProps) {
  const { resolvedTheme } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure theme variables are set
    const root = document.documentElement;
    // root.style.visibility = 'hidden'; // Temporarily disabled hiding
    
    // Add data attributes needed by shadcn/ui
    root.setAttribute('data-theme', resolvedTheme);
    
    // Force a repaint to ensure styles are applied
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // root.style.visibility = ''; // Temporarily disabled un-hiding
        setIsReady(true); // Assume ready immediately for testing
      });
    });
  }, [resolvedTheme]);

  // if (!isReady) { // Temporarily disabled loading state check
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center bg-background">
  //       <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  return <>{children}</>;
}