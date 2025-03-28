/**
 * Haptic feedback utility for providing tactile feedback across platforms
 * Uses Capacitor Haptics plugin when available, falls back to browser vibration API
 */

// Check if we're in a browser environment first
const isBrowser = typeof window !== 'undefined';

// Helper to check if Capacitor and its Haptics plugin are available
const hasCapacitorHaptics = (): boolean => {
  if (!isBrowser) return false;
  
  return !!(
    window &&
    'Capacitor' in window &&
    window.Capacitor &&
    window.Capacitor.Plugins &&
    'Haptics' in window.Capacitor.Plugins &&
    window.Capacitor.Plugins.Haptics
  );
};

// Helper to check if Web Vibration API is available
const hasVibrationAPI = (): boolean => {
  if (!isBrowser) return false;
  return !!(window && 'navigator' in window && navigator && 'vibrate' in navigator && typeof navigator.vibrate === 'function');
};

// Provide a noop function for unsupported environments
const noop = (): void => {};

// Define the haptic feedback utility
export const hapticFeedback = {
  // Light impact feedback - use for subtle interactions
  light: (): void => {
    if (hasCapacitorHaptics() && window?.Capacitor?.Plugins?.Haptics) {
      try {
        window.Capacitor.Plugins.Haptics.impact({ style: 'light' });
      } catch (e) {
        console.error('Error with Capacitor Haptics:', e);
      }
    } else if (hasVibrationAPI() && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch (e) {
        console.error('Error with Vibration API:', e);
      }
    }
  },
  
  // Medium impact feedback - use for typical interactions
  medium: (): void => {
    if (hasCapacitorHaptics() && window?.Capacitor?.Plugins?.Haptics) {
      try {
        window.Capacitor.Plugins.Haptics.impact({ style: 'medium' });
      } catch (e) {
        console.error('Error with Capacitor Haptics:', e);
      }
    } else if (hasVibrationAPI() && navigator.vibrate) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        console.error('Error with Vibration API:', e);
      }
    }
  },
  
  // Heavy impact feedback - use for significant interactions
  heavy: (): void => {
    if (hasCapacitorHaptics() && window?.Capacitor?.Plugins?.Haptics) {
      try {
        window.Capacitor.Plugins.Haptics.impact({ style: 'heavy' });
      } catch (e) {
        console.error('Error with Capacitor Haptics:', e);
      }
    } else if (hasVibrationAPI() && navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch (e) {
        console.error('Error with Vibration API:', e);
      }
    }
  },
  
  // Success feedback - use when an operation completes successfully
  success: (): void => {
    if (hasCapacitorHaptics() && window?.Capacitor?.Plugins?.Haptics) {
      try {
        window.Capacitor.Plugins.Haptics.notification({ type: 'success' });
      } catch (e) {
        console.error('Error with Capacitor Haptics:', e);
      }
    } else if (hasVibrationAPI() && navigator.vibrate) {
      try {
        navigator.vibrate([10, 40, 20]);
      } catch (e) {
        console.error('Error with Vibration API:', e);
      }
    }
  },
  
  // Warning feedback - use to indicate potential issues
  warning: (): void => {
    if (hasCapacitorHaptics() && window?.Capacitor?.Plugins?.Haptics) {
      try {
        window.Capacitor.Plugins.Haptics.notification({ type: 'warning' });
      } catch (e) {
        console.error('Error with Capacitor Haptics:', e);
      }
    } else if (hasVibrationAPI() && navigator.vibrate) {
      try {
        navigator.vibrate([10, 30, 10, 30, 10]);
      } catch (e) {
        console.error('Error with Vibration API:', e);
      }
    }
  },
  
  // Error feedback - use when an operation fails
  error: (): void => {
    if (hasCapacitorHaptics() && window?.Capacitor?.Plugins?.Haptics) {
      try {
        window.Capacitor.Plugins.Haptics.notification({ type: 'error' });
      } catch (e) {
        console.error('Error with Capacitor Haptics:', e);
      }
    } else if (hasVibrationAPI() && navigator.vibrate) {
      try {
        navigator.vibrate([50, 100, 50, 100, 50]);
      } catch (e) {
        console.error('Error with Vibration API:', e);
      }
    }
  },
  
  // Custom vibration pattern
  vibrate: (pattern: number | number[]): void => {
    if (hasCapacitorHaptics() && window?.Capacitor?.Plugins?.Haptics) {
      try {
        if (typeof pattern === 'number') {
          window.Capacitor.Plugins.Haptics.vibrate({ duration: pattern });
        } else if (Array.isArray(pattern)) {
          // For Capacitor, we can't easily reproduce complex patterns 
          // so just vibrate for the sum of the pattern
          const totalDuration = pattern.reduce((sum, val) => sum + val, 0);
          window.Capacitor.Plugins.Haptics.vibrate({ duration: totalDuration });
        }
      } catch (e) {
        console.error('Error with Capacitor Haptics:', e);
      }
    } else if (hasVibrationAPI() && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.error('Error with Vibration API:', e);
      }
    }
  },
  
  // Haptic selection feedback (subtle feedback for selection changes)
  selectionChanged: (): void => {
    if (hasCapacitorHaptics() && window?.Capacitor?.Plugins?.Haptics) {
      try {
        window.Capacitor.Plugins.Haptics.selectionChanged();
      } catch (e) {
        console.error('Error with Capacitor Haptics:', e);
      }
    } else if (hasVibrationAPI() && navigator.vibrate) {
      try {
        navigator.vibrate(5);
      } catch (e) {
        console.error('Error with Vibration API:', e);
      }
    }
  }
};

// Extend Window interface to include Capacitor
declare global {
  interface Window {
    Capacitor?: {
      Plugins?: {
        Haptics?: {
          impact: (options: { style: 'light' | 'medium' | 'heavy' }) => void;
          notification: (options: { type: 'success' | 'warning' | 'error' }) => void;
          selectionStart: () => void;
          selectionChanged: () => void;
          selectionEnd: () => void;
          vibrate: (options: { duration: number }) => void;
        };
        Health?: {
          isAvailable: () => Promise<{value: boolean}>;
          requestPermissions: () => Promise<{granted: boolean}>;
          queryHKStepCount: (options: {startDate: string, endDate: string}) => Promise<{value: number}>;
        };
        HealthKit?: {
          isAvailable: () => Promise<{available: boolean}>;
          requestPermissions: () => Promise<{granted: boolean}>;
          queryHKQuantityTypeSum: (options: {sampleType: string, startDate: string, endDate: string}) => Promise<{value: number}>;
        };
      };
      getPlatform?: () => string;
    };
    healthConnect?: any;
  }
} 