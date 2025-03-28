import { useRef, useEffect, RefCallback } from 'react';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface SwipeHandlers {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  onSwipedUp?: () => void;
  onSwipedDown?: () => void;
  onSwiping?: (delta: { x: number; y: number; absX: number; absY: number }) => void;
  onTap?: () => void;
}

interface SwipeableOptions {
  threshold?: number; // minimum distance in px to be considered a swipe
  timeout?: number; // maximum time in ms allowed for a swipe
  velocity?: number; // minimum velocity to be considered a swipe
  preventDefaultTouchmoveEvent?: boolean; // prevent default touchmove behavior
  enableHapticFeedback?: boolean; // enable haptic feedback for successful swipes
  delta?: number; // minimum delta for onSwiping to trigger
  trackTouch?: boolean; // track touch movements
  trackMouse?: boolean; // track mouse movements
  rotationAngle?: number; // rotation angle in degrees
}

type Touch = {
  x: number;
  y: number;
  time: number;
};

export function useSwipeable(handlers: SwipeHandlers, options: SwipeableOptions = {}) {
  const { 
    threshold = 50, 
    timeout = 300, 
    velocity = 0.3,
    preventDefaultTouchmoveEvent = false,
    enableHapticFeedback = true,
    delta = 10,
    trackTouch = true,
    trackMouse = false,
    rotationAngle = 0,
  } = options;
  
  // Store handlers in refs to prevent unnecessary re-renders
  const handlersRef = useRef(handlers);
  
  // Update refs when handlers change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);
  
  // Track touch start position and time
  const touchStartRef = useRef<Touch | null>(null);
  const touchCurrentRef = useRef<Touch | null>(null);
  const isSwipingRef = useRef(false);
  
  // For React components
  const onTouchStart = (e: React.TouchEvent) => {
    if (!trackTouch) return;
    
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
      touchCurrentRef.current = { ...touchStartRef.current };
      isSwipingRef.current = false;
    }
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (!trackTouch || !touchStartRef.current) return;
    
    if (preventDefaultTouchmoveEvent) e.preventDefault();
    
    touchCurrentRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    
    const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
    const deltaY = touchCurrentRef.current.y - touchStartRef.current.y;
    
    // Apply rotation transformation if needed
    let rotatedDeltaX = deltaX;
    let rotatedDeltaY = deltaY;
    
    if (rotationAngle !== 0) {
      const angleInRadians = (Math.PI * rotationAngle) / 180;
      rotatedDeltaX = deltaX * Math.cos(angleInRadians) + deltaY * Math.sin(angleInRadians);
      rotatedDeltaY = deltaY * Math.cos(angleInRadians) - deltaX * Math.sin(angleInRadians);
    }
    
    // Call onSwiping handler if provided
    if (handlersRef.current.onSwiping && (Math.abs(rotatedDeltaX) > delta || Math.abs(rotatedDeltaY) > delta)) {
      handlersRef.current.onSwiping({
        x: rotatedDeltaX,
        y: rotatedDeltaY,
        absX: Math.abs(rotatedDeltaX),
        absY: Math.abs(rotatedDeltaY)
      });
      
      isSwipingRef.current = true;
    }
  };
  
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!trackTouch || !touchStartRef.current) return;
    
    const touchStart = touchStartRef.current;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };
    
    handleSwipe(touchStart, touchEnd);
    
    // If no significant movement, consider it a tap
    if (!isSwipingRef.current && handlersRef.current.onTap) {
      handlersRef.current.onTap();
    }
    
    touchStartRef.current = null;
    touchCurrentRef.current = null;
    isSwipingRef.current = false;
  };
  
  // For DOM elements
  const handleTouchStart = (e: TouchEvent) => {
    if (!trackTouch) return;
    
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
      touchCurrentRef.current = { ...touchStartRef.current };
      isSwipingRef.current = false;
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!trackTouch || !touchStartRef.current) return;
    
    if (preventDefaultTouchmoveEvent) e.preventDefault();
    
    touchCurrentRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    
    const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
    const deltaY = touchCurrentRef.current.y - touchStartRef.current.y;
    
    // Apply rotation transformation if needed
    let rotatedDeltaX = deltaX;
    let rotatedDeltaY = deltaY;
    
    if (rotationAngle !== 0) {
      const angleInRadians = (Math.PI * rotationAngle) / 180;
      rotatedDeltaX = deltaX * Math.cos(angleInRadians) + deltaY * Math.sin(angleInRadians);
      rotatedDeltaY = deltaY * Math.cos(angleInRadians) - deltaX * Math.sin(angleInRadians);
    }
    
    // Call onSwiping handler if provided
    if (handlersRef.current.onSwiping && (Math.abs(rotatedDeltaX) > delta || Math.abs(rotatedDeltaY) > delta)) {
      handlersRef.current.onSwiping({
        x: rotatedDeltaX,
        y: rotatedDeltaY,
        absX: Math.abs(rotatedDeltaX),
        absY: Math.abs(rotatedDeltaY)
      });
      
      isSwipingRef.current = true;
    }
  };
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (!trackTouch || !touchStartRef.current) return;
    
    const touchStart = touchStartRef.current;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };
    
    handleSwipe(touchStart, touchEnd);
    
    // If no significant movement, consider it a tap
    if (!isSwipingRef.current && handlersRef.current.onTap) {
      handlersRef.current.onTap();
    }
    
    touchStartRef.current = null;
    touchCurrentRef.current = null;
    isSwipingRef.current = false;
  };
  
  // Mouse event handlers for desktop testing
  const handleMouseDown = (e: MouseEvent) => {
    if (!trackMouse) return;
    
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    touchCurrentRef.current = { ...touchStartRef.current };
    isSwipingRef.current = false;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!touchStartRef.current) return;
    
    touchCurrentRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    
    const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
    const deltaY = touchCurrentRef.current.y - touchStartRef.current.y;
    
    // Apply rotation transformation if needed
    let rotatedDeltaX = deltaX;
    let rotatedDeltaY = deltaY;
    
    if (rotationAngle !== 0) {
      const angleInRadians = (Math.PI * rotationAngle) / 180;
      rotatedDeltaX = deltaX * Math.cos(angleInRadians) + deltaY * Math.sin(angleInRadians);
      rotatedDeltaY = deltaY * Math.cos(angleInRadians) - deltaX * Math.sin(angleInRadians);
    }
    
    // Call onSwiping handler if provided
    if (handlersRef.current.onSwiping && (Math.abs(rotatedDeltaX) > delta || Math.abs(rotatedDeltaY) > delta)) {
      handlersRef.current.onSwiping({
        x: rotatedDeltaX,
        y: rotatedDeltaY,
        absX: Math.abs(rotatedDeltaX),
        absY: Math.abs(rotatedDeltaY)
      });
      
      isSwipingRef.current = true;
    }
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (!touchStartRef.current) return;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    const touchStart = touchStartRef.current;
    const touchEnd = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    
    handleSwipe(touchStart, touchEnd);
    
    // If no significant movement, consider it a tap
    if (!isSwipingRef.current && handlersRef.current.onTap) {
      handlersRef.current.onTap();
    }
    
    touchStartRef.current = null;
    touchCurrentRef.current = null;
    isSwipingRef.current = false;
  };
  
  // Common swipe handling logic
  const handleSwipe = (
    touchStart: Touch,
    touchEnd: Touch
  ) => {
    // Calculate distance and time
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const elapsedTime = touchEnd.time - touchStart.time;
    
    // Check if swipe was fast enough
    if (elapsedTime > timeout) {
      return;
    }
    
    // Calculate velocity (pixels per ms)
    const velocityX = Math.abs(deltaX) / elapsedTime;
    const velocityY = Math.abs(deltaY) / elapsedTime;
    
    // Apply rotation transformation if needed
    let rotatedDeltaX = deltaX;
    let rotatedDeltaY = deltaY;
    
    if (rotationAngle !== 0) {
      const angleInRadians = (Math.PI * rotationAngle) / 180;
      rotatedDeltaX = deltaX * Math.cos(angleInRadians) + deltaY * Math.sin(angleInRadians);
      rotatedDeltaY = deltaY * Math.cos(angleInRadians) - deltaX * Math.sin(angleInRadians);
    }
    
    // Determine swipe direction
    if (Math.abs(rotatedDeltaX) > Math.abs(rotatedDeltaY)) {
      // Horizontal swipe
      if (Math.abs(rotatedDeltaX) > threshold && velocityX > velocity) {
        if (rotatedDeltaX > 0 && handlersRef.current.onSwipedRight) {
          if (enableHapticFeedback) hapticFeedback.light();
          handlersRef.current.onSwipedRight();
        } else if (rotatedDeltaX < 0 && handlersRef.current.onSwipedLeft) {
          if (enableHapticFeedback) hapticFeedback.light();
          handlersRef.current.onSwipedLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(rotatedDeltaY) > threshold && velocityY > velocity) {
        if (rotatedDeltaY > 0 && handlersRef.current.onSwipedDown) {
          if (enableHapticFeedback) hapticFeedback.light();
          handlersRef.current.onSwipedDown();
        } else if (rotatedDeltaY < 0 && handlersRef.current.onSwipedUp) {
          if (enableHapticFeedback) hapticFeedback.light();
          handlersRef.current.onSwipedUp();
        }
      }
    }
  };
  
  // Clean up function
  const cleanupRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
  
  // Ref callback for attaching to DOM elements
  const ref: RefCallback<HTMLElement> = (el) => {
    // Clean up old listeners
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    if (!el) return;
    
    // Add listeners
    if (trackTouch) {
      el.addEventListener('touchstart', handleTouchStart, { passive: !preventDefaultTouchmoveEvent });
      el.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmoveEvent });
      el.addEventListener('touchend', handleTouchEnd);
    }
    
    if (trackMouse) {
      el.addEventListener('mousedown', handleMouseDown);
    }
    
    // Store cleanup function
    cleanupRef.current = () => {
      if (trackTouch) {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
      }
      
      if (trackMouse) {
        el.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  };
  
  // Return handlers for both DOM elements via ref and React components via props
  return {
    ref,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
} 