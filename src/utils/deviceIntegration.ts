/**
 * Device Integration Utilities
 * 
 * This module provides integration with device capabilities like health tracking,
 * step counting, and other device-specific features to enhance the mobile experience.
 */

import { hapticFeedback } from './hapticFeedback';

// Constants
const LOCAL_STORAGE_STEPS_KEY = 'mission-fresh-steps';
const LOCAL_STORAGE_HEALTH_KEY = 'mission-fresh-health';

// Types
export interface StepData {
  date: string;
  count: number;
  source: 'device' | 'manual' | 'simulated';
}

export interface HealthMetrics {
  heartRate?: number;
  sleepHours?: number;
  activeMinutes?: number;
  caloriesBurned?: number;
  date: string;
  source: 'device' | 'manual' | 'simulated';
}

interface DeviceFeatures {
  hapticFeedbackSupported: boolean;
  orientationSupported: boolean;
  notificationsSupported: boolean;
  touchSupported: boolean;
}

let deviceFeatures: DeviceFeatures = {
  hapticFeedbackSupported: false,
  orientationSupported: false,
  notificationsSupported: false,
  touchSupported: false,
};

/**
 * Device detection utilities
 */
export const isIOS = (): boolean => {
  return typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
};

/**
 * Detects whether the current device is mobile
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Regular expression for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
};

/**
 * Detects whether touch is supported
 */
export const isTouchSupported = (): boolean => {
  return 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    (navigator as any).msMaxTouchPoints > 0;
};

/**
 * Request device motion and orientation permissions
 * Required by iOS for device motion events
 */
export const requestMotionPermission = async (): Promise<boolean> => {
  if (typeof DeviceMotionEvent !== 'undefined' && 
      typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const permissionState = await (DeviceMotionEvent as any).requestPermission();
      return permissionState === 'granted';
    } catch (error) {
      console.error('Error requesting motion permission:', error);
      return false;
    }
  }
  
  // Permission not required on this device
  return true;
};

/**
 * Get step count for today
 * In a real app, this would connect to HealthKit (iOS) or Google Fit (Android)
 */
export const getTodayStepCount = async (): Promise<StepData> => {
  const today = new Date().toISOString().split('T')[0];
  
  // In a real app, we would attempt to get data from the device health APIs
  // For now, we'll use localStorage with simulated data
  try {
    // Check if we have stored step data for today
    const storedData = localStorage.getItem(LOCAL_STORAGE_STEPS_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as StepData;
      if (parsedData.date === today) {
        return parsedData;
      }
    }
    
    // Simulate step data with some randomness to make it look realistic
    const baseSteps = 6000 + Math.floor(Math.random() * 4000);
    
    // Time-based adjustment (more steps later in the day)
    const hourOfDay = new Date().getHours();
    const hourMultiplier = Math.min(hourOfDay / 24, 1); // 0-1 based on time of day
    
    const adjustedSteps = Math.floor(baseSteps * hourMultiplier);
    
    const newStepData: StepData = {
      date: today,
      count: adjustedSteps,
      source: 'simulated'
    };
    
    // Store in localStorage
    localStorage.setItem(LOCAL_STORAGE_STEPS_KEY, JSON.stringify(newStepData));
    
    return newStepData;
  } catch (error) {
    console.error('Error getting step count:', error);
    
    // Return fallback data
    return {
      date: today,
      count: 0,
      source: 'simulated'
    };
  }
};

/**
 * Manually set step count for testing purposes
 */
export const setManualStepCount = (count: number): void => {
  const today = new Date().toISOString().split('T')[0];
  
  const stepData: StepData = {
    date: today,
    count,
    source: 'manual'
  };
  
  localStorage.setItem(LOCAL_STORAGE_STEPS_KEY, JSON.stringify(stepData));
  
  // Provide haptic feedback
  hapticFeedback.success();
};

/**
 * Get health metrics for today
 * In a real app, this would connect to HealthKit (iOS) or Google Fit (Android)
 */
export const getTodayHealthMetrics = async (): Promise<HealthMetrics> => {
  const today = new Date().toISOString().split('T')[0];
  
  // In a real app, we would attempt to get data from the device health APIs
  // For now, we'll use localStorage with simulated data
  try {
    // Check if we have stored health data for today
    const storedData = localStorage.getItem(LOCAL_STORAGE_HEALTH_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as HealthMetrics;
      if (parsedData.date === today) {
        return parsedData;
      }
    }
    
    // Simulate health data
    const healthData: HealthMetrics = {
      heartRate: 65 + Math.floor(Math.random() * 20),
      sleepHours: 6 + Math.random() * 2,
      activeMinutes: 20 + Math.floor(Math.random() * 40),
      caloriesBurned: 1800 + Math.floor(Math.random() * 600),
      date: today,
      source: 'simulated'
    };
    
    // Store in localStorage
    localStorage.setItem(LOCAL_STORAGE_HEALTH_KEY, JSON.stringify(healthData));
    
    return healthData;
  } catch (error) {
    console.error('Error getting health metrics:', error);
    
    // Return fallback data
    return {
      date: today,
      source: 'simulated'
    };
  }
};

/**
 * Native-like transitions for mobile app
 */
export const getPageTransition = (direction: 'forward' | 'backward' = 'forward') => {
  if (!isMobileDevice()) {
    // Default minimal transition for desktop
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    };
  }
  
  // Mobile-specific transitions
  if (direction === 'forward') {
    return {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
    };
  } else {
    return {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
      transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
    };
  }
};

/**
 * Initializes device-specific features
 */
export const initializeDeviceFeatures = async (): Promise<DeviceFeatures> => {
  // Check haptic feedback support
  deviceFeatures.hapticFeedbackSupported = hapticFeedback.isSupported();
  
  // Check device orientation support
  deviceFeatures.orientationSupported = 
    'DeviceOrientationEvent' in window && 
    typeof DeviceOrientationEvent !== 'undefined';
  
  // Check notifications support
  if ('Notification' in window) {
    deviceFeatures.notificationsSupported = true;
    
    // Request permission if not already granted
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }
  
  // Check touch support
  deviceFeatures.touchSupported = isTouchSupported();
  
  // Initialize haptic engine for supported devices
  if (deviceFeatures.hapticFeedbackSupported) {
    // Test haptic with a light tap to ensure it's working
    hapticFeedback.light();
  }
  
  console.info('Device features detected:', deviceFeatures);
  
  return deviceFeatures;
};

/**
 * Gets the current device features
 */
export const getDeviceFeatures = (): DeviceFeatures => {
  return { ...deviceFeatures };
};

/**
 * Lock screen orientation to portrait (mobile only)
 */
export const lockOrientationPortrait = async (): Promise<boolean> => {
  try {
    if (typeof screen.orientation !== 'undefined' && 
        screen.orientation && 
        'lock' in screen.orientation) {
      await (screen.orientation as any).lock('portrait');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error locking orientation:', error);
    return false;
  }
};

/**
 * Lock screen orientation to landscape (mobile only)
 */
export const lockOrientationLandscape = async (): Promise<boolean> => {
  try {
    if (typeof screen.orientation !== 'undefined' && 
        screen.orientation && 
        'lock' in screen.orientation) {
      await (screen.orientation as any).lock('landscape');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error locking orientation:', error);
    return false;
  }
};

/**
 * Unlock screen orientation (mobile only)
 */
export const unlockOrientation = async (): Promise<boolean> => {
  try {
    if (typeof screen.orientation !== 'undefined' && 
        screen.orientation && 
        'unlock' in screen.orientation) {
      (screen.orientation as any).unlock();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unlocking orientation:', error);
    return false;
  }
}; 