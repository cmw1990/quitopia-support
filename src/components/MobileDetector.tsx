import React, { useState, useEffect } from 'react';

interface MobileDetectorProps {
  children: (isMobile: boolean) => React.ReactNode;
  mobileBreakpoint?: number;
}

/**
 * MobileDetector Component
 * 
 * Detects whether the current device is mobile based on screen width and
 * provides this information to child components.
 * 
 * Part of Mobile Experience Enhancement (Priority 2)
 */
const MobileDetector: React.FC<MobileDetectorProps> = ({
  children,
  mobileBreakpoint = 768
}) => {
  // Initialize with server-side assumption
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Check viewport width on mount
    const checkViewportWidth = () => {
      const viewportWidth = window.innerWidth;
      setIsMobile(viewportWidth < mobileBreakpoint);
    };
    
    // Run once on mount
    checkViewportWidth();
    setIsInitialized(true);
    
    // Set up event listener for window resize
    window.addEventListener('resize', checkViewportWidth);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', checkViewportWidth);
    };
  }, [mobileBreakpoint]);
  
  // Alternative detection using user agent (as fallback)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !isInitialized) {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      
      if (mobileRegex.test(userAgent)) {
        setIsMobile(true);
      }
    }
  }, [isInitialized]);
  
  // Only render children after we've determined the device type
  if (!isInitialized && typeof window === 'undefined') {
    return null;
  }
  
  // Render children with isMobile flag
  return <>{children(isMobile)}</>;
};

export default MobileDetector; 