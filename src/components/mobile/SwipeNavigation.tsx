import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, PanInfo } from 'framer-motion';

interface SwipeNavigationProps {
  children: React.ReactNode;
  routes: {
    path: string;
    label: string;
  }[];
  threshold?: number;
}

/**
 * SwipeNavigation Component
 * 
 * Enables swipe gestures for mobile navigation between routes
 * Part of Mobile Experience Enhancement (Priority 2)
 */
const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  routes,
  threshold = 100
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [startX, setStartX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Find current route index
  const currentIndex = routes.findIndex(route => route.path === location.pathname);
  
  // Handle swipe end
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsSwiping(false);
    setSwipeDirection(null);
    
    // If swipe distance exceeds threshold, navigate
    if (Math.abs(info.offset.x) > threshold) {
      const nextIndex = info.offset.x > 0 
        ? Math.max(0, currentIndex - 1) 
        : Math.min(routes.length - 1, currentIndex + 1);
        
      // Don't navigate if we're already at the edge
      if (nextIndex !== currentIndex) {
        // Add haptic feedback if supported
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        
        navigate(routes[nextIndex].path);
      }
    }
  };
  
  // Handle swipe movement
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isSwiping) {
      setIsSwiping(true);
    }
    
    // Set swipe direction for visual indicators
    if (info.offset.x > 0) {
      setSwipeDirection('right');
    } else if (info.offset.x < 0) {
      setSwipeDirection('left');
    }
  };
  
  // Provide touch feedback on mobile
  useEffect(() => {
    const handleTouchStart = () => {
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);
  
  return (
    <div className="relative overflow-hidden">
      {/* Direction indicators */}
      {swipeDirection === 'left' && currentIndex < routes.length - 1 && (
        <div className="fixed top-1/2 right-4 z-50 transform -translate-y-1/2 rounded-full bg-primary/20 h-12 w-12 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      )}
      
      {swipeDirection === 'right' && currentIndex > 0 && (
        <div className="fixed top-1/2 left-4 z-50 transform -translate-y-1/2 rounded-full bg-primary/20 h-12 w-12 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </div>
      )}
      
      {/* Main content with swipe gesture support */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeNavigation; 