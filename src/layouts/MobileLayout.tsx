import React, { useEffect, useState } from 'react';
import { MobileNavigation } from '../components/mobile/MobileNavigation';
import useMediaQuery from '../hooks/useMediaQuery';
import { cn } from '../lib/utils';
import { hapticFeedback } from '../utils/hapticFeedback';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNavigation?: boolean;
  fullHeight?: boolean;
  adaptiveWidth?: boolean;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  hasNotch: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  isLandscape: boolean;
}

/**
 * MobileLayout component wraps content with mobile-optimized navigation
 * when viewport is below a certain breakpoint.
 * Enhanced for tablet support and better device detection.
 */
const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  className,
  hideNavigation = false,
  fullHeight = false,
  adaptiveWidth = true
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isSmallScreen = useMediaQuery('(max-width: 380px)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  // Device info for adaptive layouts
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    hasNotch: false,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    isLandscape: false
  });
  
  // Detect device capabilities and safe areas
  useEffect(() => {
    // Function to detect device type and characteristics
    const detectDevice = () => {
      const ua = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/.test(ua);
      const isAndroid = /Android/.test(ua);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isOrientationLandscape = width > height;
      
      // Determine device type based on screen size and user agent
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      
      if (width <= 768) {
        deviceType = 'mobile';
      } else if (width <= 1024) {
        deviceType = 'tablet';
      }
      
      // Override based on user agent for more accurate detection
      if (isIOS) {
        if (/iPad/.test(ua) || (width >= 768 && width <= 1024)) {
          deviceType = 'tablet';
        } else {
          deviceType = 'mobile';
        }
      }
      
      if (isAndroid) {
        if (/tablet|SM-T|GT-P/.test(ua) || (width >= 768 && width <= 1024)) {
          deviceType = 'tablet';
        } else {
          deviceType = 'mobile';
        }
      }
      
      // Detect if device has a notch (estimate based on screen dimensions and ratio)
      let hasNotch = false;
      let safeAreaTop = 0;
      let safeAreaBottom = 0;
      
      if (isIOS) {
        // iPhone X and newer have notches
        const isModernIphone = 
          /iPhone/.test(ua) && 
          ((window.screen.height / window.screen.width) > 2 || 
           (window.screen.width / window.screen.height) > 2);
        
        if (isModernIphone) {
          hasNotch = true;
          safeAreaTop = isOrientationLandscape ? 0 : 44;
          safeAreaBottom = 34;
        } else if (/iPad/.test(ua)) {
          // Check if in PWA mode on iPad
          const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
          if (isInStandaloneMode) {
            safeAreaTop = 24;
            safeAreaBottom = 20;
          }
        }
      }
      
      if (isAndroid) {
        // Estimate for Android
        const aspectRatio = Math.max(width, height) / Math.min(width, height);
        if (aspectRatio > 2) {
          hasNotch = true;
          safeAreaTop = isOrientationLandscape ? 0 : 32;
          safeAreaBottom = 24;
        }
      }
      
      return {
        type: deviceType,
        hasNotch,
        safeAreaTop,
        safeAreaBottom,
        isLandscape: isOrientationLandscape
      };
    };
    
    // Set viewport meta tag to prevent zooming on iOS devices
    const setViewportMeta = () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute(
          'content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        );
      }
    };
    
    // Handle device changes
    const handleResize = () => {
      const info = detectDevice();
      setDeviceInfo(info);
      
      // Provide subtle haptic feedback on orientation change
      if (info.isLandscape !== deviceInfo.isLandscape) {
        hapticFeedback.medium();
      }
    };
    
    // Initial setup
    setViewportMeta();
    handleResize();
    
    // Handle resize and orientation changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [deviceInfo.isLandscape]);
  
  // If desktop size and not forcing mobile layout, just render children
  if (!isMobile && !isTablet && !adaptiveWidth) {
    return <>{children}</>;
  }
  
  // Calculate max width for tablet mode (to prevent excessive stretching)
  const tabletMaxWidth = isTablet && adaptiveWidth ? '768px' : '100%';
  
  // For mobile and tablet devices, wrap with navigation
  return (
    <div 
      className={cn(
        "flex flex-col",
        fullHeight ? "min-h-screen" : "h-auto",
        isSmallScreen ? "text-sm" : "",
        isTablet && adaptiveWidth ? "mx-auto" : ""
      )}
      style={{
        paddingTop: deviceInfo.safeAreaTop > 0 ? `${deviceInfo.safeAreaTop}px` : '0',
        paddingBottom: !hideNavigation ? '0' : deviceInfo.safeAreaBottom > 0 ? `${deviceInfo.safeAreaBottom}px` : '0',
        maxWidth: tabletMaxWidth
      }}
    >
      <main 
        className={cn(
          "flex-1", 
          !hideNavigation && "pb-16",
          isSmallScreen && "px-2",
          isTablet && "px-4",
          deviceInfo.isLandscape && "pb-14",
          className
        )}
      >
        {children}
      </main>
      
      {!hideNavigation && (
        <div 
          style={{ 
            paddingBottom: deviceInfo.safeAreaBottom > 0 ? `${deviceInfo.safeAreaBottom}px` : '0',
          }}
          className={cn(
            "w-full",
            deviceInfo.isLandscape && "h-14"
          )}
        >
          <MobileNavigation 
            isTablet={isTablet} 
            isLandscape={deviceInfo.isLandscape}
          />
        </div>
      )}
    </div>
  );
};

export default MobileLayout; 