/**
 * Mobile Integration Utilities
 * 
 * This module provides seamless integration with native mobile features while
 * maintaining web compatibility. It detects the platform and provides appropriate
 * implementations for each feature.
 */

import { storeInitialDeepLink, DEEP_LINK_EVENT } from './deepLink';

// Platform detection utilities
export const isMobile = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth < 768;
  
  return isMobileUserAgent || isSmallScreen;
};

export const isIOS = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /iPhone|iPad|iPod/i.test(userAgent) && !(window as any).MSStream;
};

export const isAndroid = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /Android/i.test(userAgent);
};

/**
 * Interface describing the bridge to native mobile functionality
 */
interface MobileNativeBridge {
  // Native platform capabilities
  canOpenExternalApp: () => boolean;
  canShareContent: () => boolean;
  canReceiveNotifications: () => boolean;
  getDeviceInfo: () => Promise<DeviceInfo>;
  
  // Actions
  openExternalApp: (url: string) => Promise<boolean>;
  shareContent: (content: ShareContent) => Promise<boolean>;
  scheduleNotification: (notification: NotificationOptions) => Promise<string>;
  cancelNotification: (id: string) => Promise<boolean>;
  
  // Deep linking
  registerForDeepLinks: () => Promise<void>;
  unregisterForDeepLinks: () => Promise<void>;
  
  // Persistence
  setPreference: (key: string, value: string) => Promise<void>;
  getPreference: (key: string) => Promise<string | null>;
  
  // Health tracking
  requestHealthPermissions: () => Promise<boolean>;
  getSteps: (date: Date) => Promise<number>;
  getHealthMetrics: () => Promise<HealthMetrics>;
  
  // Device sensors
  startMotionTracking: () => Promise<boolean>;
  stopMotionTracking: () => Promise<void>;
  getMotionData: () => Promise<MotionData | null>;
}

/**
 * Device information returned from native bridge
 */
interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  deviceId: string;
  isTablet: boolean;
  language: string;
  timeZone: string;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
  availableStorage?: number; // in MB
}

/**
 * Content to share via native sharing
 */
interface ShareContent {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Notification options for scheduling native notifications
 */
interface NotificationOptions {
  id?: string;
  title: string;
  body: string;
  deepLink?: string;
  schedule?: {
    at?: Date;
    repeats?: boolean;
    every?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
    count?: number;
    on?: {
      day?: number;
      hour?: number;
      minute?: number;
    };
  };
  actionButtons?: Array<{
    id: string;
    title: string;
    deepLink?: string;
  }>;
  priority?: 'default' | 'high' | 'low';
  sound?: boolean;
  vibrate?: boolean;
  badgeCount?: number;
}

/**
 * Health tracking metrics
 */
interface HealthMetrics {
  steps: number;
  distance: number; // in meters
  calories: number;
  heartRate?: number;
  sleep?: {
    duration: number; // in minutes
    quality: number; // 1-10
  };
  activity?: {
    activeMinutes: number;
    sedentaryMinutes: number;
  };
  lastUpdated: Date;
}

/**
 * Motion data from device sensors
 */
interface MotionData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  rotationRate?: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  orientation?: {
    alpha: number; // z-axis
    beta: number;  // x-axis
    gamma: number; // y-axis
  };
  timestamp: number;
}

/**
 * Simulated mobile bridge implementation
 * In a real app, this would be provided by the native platform
 */
class SimulatedMobileBridge implements MobileNativeBridge {
  private simulatedPlatform: 'ios' | 'android' | 'web';
  private motionTrackingActive = false;
  private lastMotionData: MotionData | null = null;
  private deviceMotionListener: ((event: DeviceMotionEvent) => void) | null = null;
  private deviceOrientationListener: ((event: DeviceOrientationEvent) => void) | null = null;
  private healthPermissionsGranted = false;

  constructor() {
    // Determine platform for simulation
    if (isIOS()) {
      this.simulatedPlatform = 'ios';
    } else if (isAndroid()) {
      this.simulatedPlatform = 'android';
    } else {
      this.simulatedPlatform = 'web';
    }
    
    // Handle deep links on startup
    this.handleInitialDeepLink();
    
    // Setup notification simulation
    if (isMobile() && 'Notification' in window) {
      this.simulateDeepLinkFromNotification();
    }
  }

  // Platform capability checks
  canOpenExternalApp = () => true;
  canShareContent = () => true;
  canReceiveNotifications = () => true;

  // Get device information
  getDeviceInfo = async (): Promise<DeviceInfo> => {
    let batteryLevel: number | undefined = undefined;
    let isLowPowerMode: boolean | undefined = undefined;
    
    // Try to get battery info if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        batteryLevel = battery.level * 100;
        isLowPowerMode = batteryLevel < 20;
      } catch (err) {
        console.warn('Battery API not available:', err);
      }
    }
    
    return {
      platform: this.simulatedPlatform,
      osVersion: 'Simulated',
      appVersion: '1.0.0',
      deviceModel: `Simulated ${this.simulatedPlatform.charAt(0).toUpperCase() + this.simulatedPlatform.slice(1)} Device`,
      deviceId: 'sim-' + Math.random().toString(36).substring(2, 10),
      isTablet: window.innerWidth > 768,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      batteryLevel,
      isLowPowerMode,
      availableStorage: 1000 // Simulated 1GB
    };
  };

  // Open an external app via URL scheme
  openExternalApp = async (url: string): Promise<boolean> => {
    window.open(url, '_blank');
    return true;
  };

  // Share content using the Web Share API if available
  shareContent = async (content: ShareContent): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.text,
          url: content.url
        });
        return true;
      } catch (err) {
        console.error('Error sharing content:', err);
        return false;
      }
    } else {
      // Fallback to clipboard
      if (content.url) {
        try {
          await navigator.clipboard.writeText(content.url);
          return true;
        } catch (err) {
          console.error('Error copying to clipboard:', err);
          return false;
        }
      }
      return false;
    }
  };

  // Schedule a notification
  scheduleNotification = async (notification: NotificationOptions): Promise<string> => {
    const notifId = notification.id || Math.random().toString(36).substring(2, 10);
    
    // Only proceed if Notification API is available and permission is granted
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }
    
    const notificationPermission = await Notification.requestPermission();
    if (notificationPermission !== 'granted') {
      throw new Error('Notification permission denied');
    }
    
    // Create and show notification
    const notif = new Notification(notification.title, {
      body: notification.body,
      tag: notifId
    });
    
    // Add click handler for deep link
    if (notification.deepLink) {
      notif.onclick = () => {
        processDeepLink(notification.deepLink!, { showToast: true });
      };
    }
    
    return notifId;
  };

  // Cancel a scheduled notification
  cancelNotification = async (id: string): Promise<boolean> => {
    // In a real app, this would interact with the native notification system
    console.log(`Cancelling notification: ${id}`);
    return true;
  };

  // Register for deep links
  registerForDeepLinks = async (): Promise<void> => {
    // In a web environment, we'd listen for custom events or URL changes
    console.log('Registered for deep links');
  };

  // Unregister deep link handlers
  unregisterForDeepLinks = async (): Promise<void> => {
    console.log('Unregistered from deep links');
  };

  // Set a preference in persistent storage
  setPreference = async (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
  };

  // Get a preference from persistent storage
  getPreference = async (key: string): Promise<string | null> => {
    return localStorage.getItem(key);
  };

  // Request health tracking permissions
  requestHealthPermissions = async (): Promise<boolean> => {
    // In a real app, this would request permissions from HealthKit or Google Fit
    // Simulate a permission dialog with a confirmation
    try {
      if (!this.healthPermissionsGranted) {
        let granted = false;
        
        // Check if we're on a mobile platform
        if (this.simulatedPlatform === 'ios' || this.simulatedPlatform === 'android') {
          // In a real app, this would be a native permission dialog
          // For simulation, we'll just use a confirm dialog
          granted = confirm('Allow Mission Fresh to access health and fitness data?');
          
          if (granted) {
            console.log('Health permissions granted');
            this.healthPermissionsGranted = true;
          } else {
            console.log('Health permissions denied');
          }
        } else {
          console.log('Health permissions not available on web platform');
        }
        
        return granted;
      }
      
      return this.healthPermissionsGranted;
    } catch (err) {
      console.error('Error requesting health permissions:', err);
      return false;
    }
  };

  // Get step count for a specific date
  getSteps = async (date: Date): Promise<number> => {
    // In a real app, this would get data from HealthKit or Google Fit
    // For simulation, generate consistent step data based on date
    const dateString = date.toISOString().split('T')[0];
    const dateSeed = new Date(dateString).getTime() % 10000;
    
    // Generate between 2000-12000 steps
    return 2000 + (dateSeed % 10000);
  };

  // Get health metrics
  getHealthMetrics = async (): Promise<HealthMetrics> => {
    // In a real app, this would get actual health data
    // For simulation, generate plausible data
    
    // Generate consistent data based on current day
    const today = new Date();
    const dateSeed = today.getDate() + today.getMonth() * 31;
    
    // Steps between 2000-12000
    const steps = 2000 + (dateSeed % 10000);
    
    // Distance based on steps (average stride length)
    const distance = steps * 0.7; // meters
    
    // Calories based on steps
    const calories = steps * 0.04;
    
    // Heart rate between 60-100 BPM
    const heartRate = 60 + (dateSeed % 40);
    
    // Sleep data based on day of week (more on weekends)
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const sleepHours = isWeekend ? 7.5 + (dateSeed % 10) / 10 : 6.5 + (dateSeed % 10) / 10;
    const sleepMinutes = Math.round(sleepHours * 60);
    const sleepQuality = isWeekend ? 7 + (dateSeed % 3) : 5 + (dateSeed % 4);
    
    // Activity data
    const activeMinutes = 30 + (dateSeed % 90);
    const totalWakingHours = 16;
    const sedentaryMinutes = (totalWakingHours * 60) - activeMinutes;
    
    return {
      steps,
      distance,
      calories,
      heartRate,
      sleep: {
        duration: sleepMinutes,
        quality: sleepQuality
      },
      activity: {
        activeMinutes,
        sedentaryMinutes
      },
      lastUpdated: new Date()
    };
  };

  // Start tracking device motion
  startMotionTracking = async (): Promise<boolean> => {
    if (this.motionTrackingActive) {
      return true; // Already tracking
    }
    
    if (isMobile() && 'DeviceMotionEvent' in window) {
      try {
        // Request permission if needed (iOS 13+)
        if (isIOS() && 
            typeof DeviceMotionEvent !== 'undefined' && 
            typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const permissionState = await (DeviceMotionEvent as any).requestPermission();
          if (permissionState !== 'granted') {
            throw new Error('Motion permission denied');
          }
        }
        
        // Setup motion event listener
        this.deviceMotionListener = (event: DeviceMotionEvent) => {
          if (event.acceleration) {
            this.lastMotionData = {
              acceleration: {
                x: event.acceleration.x || 0,
                y: event.acceleration.y || 0,
                z: event.acceleration.z || 0
              },
              timestamp: Date.now()
            };
            
            // Add rotation rate if available
            if (event.rotationRate) {
              this.lastMotionData.rotationRate = {
                alpha: event.rotationRate.alpha || 0,
                beta: event.rotationRate.beta || 0,
                gamma: event.rotationRate.gamma || 0
              };
            }
          }
        };
        
        // Setup orientation event listener
        this.deviceOrientationListener = (event: DeviceOrientationEvent) => {
          if (this.lastMotionData) {
            this.lastMotionData.orientation = {
              alpha: event.alpha || 0,
              beta: event.beta || 0,
              gamma: event.gamma || 0
            };
          }
        };
        
        // Add event listeners
        window.addEventListener('devicemotion', this.deviceMotionListener);
        window.addEventListener('deviceorientation', this.deviceOrientationListener);
        
        this.motionTrackingActive = true;
        return true;
      } catch (err) {
        console.error('Error starting motion tracking:', err);
        return false;
      }
    }
    
    return false;
  };

  // Stop tracking device motion
  stopMotionTracking = async (): Promise<void> => {
    if (this.motionTrackingActive && this.deviceMotionListener && this.deviceOrientationListener) {
      window.removeEventListener('devicemotion', this.deviceMotionListener);
      window.removeEventListener('deviceorientation', this.deviceOrientationListener);
      
      this.deviceMotionListener = null;
      this.deviceOrientationListener = null;
      this.motionTrackingActive = false;
    }
  };

  // Get the latest motion data
  getMotionData = async (): Promise<MotionData | null> => {
    return this.lastMotionData;
  };

  // Handle any initial deep link (e.g., from app launch)
  private handleInitialDeepLink(): void {
    // Check URL for deep link parameters
    const url = window.location.href;
    const urlObj = new URL(url);
    
    // Check for deep link parameters
    if (urlObj.searchParams.has('deep_link')) {
      const deepLinkUrl = urlObj.searchParams.get('deep_link');
      if (deepLinkUrl) {
        // Store for later processing once app is fully initialized
        storeInitialDeepLink(deepLinkUrl);
      }
    }
  }

  // Simulate receiving a deep link from a notification
  private simulateDeepLinkFromNotification(): void {
    // This would typically be handled by the native app,
    // but we can simulate it for testing purposes
    
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Add a test notification click handler after a delay
          setTimeout(() => {
            if (Math.random() < 0.1) { // 10% chance to trigger a simulated notification
              const testNotification = new Notification('Mission Fresh', {
                body: 'Track your progress',
                icon: '/icon.png'
              });
              
              // When clicked, simulate a deep link
              testNotification.onclick = () => {
                processDeepLink('mission-fresh://progress', { showToast: true });
              };
            }
          }, 30000); // After 30 seconds
        }
      });
    }
  }
}

// Initialize web notifications
export const initializeWebNotifications = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
};

// Main initialization function
export const initializeMobileIntegration = async (): Promise<boolean> => {
  try {
    // Only proceed with mobile integrations on mobile devices
    if (!isMobile()) {
      console.log('Not a mobile device, skipping mobile integrations');
      return false;
    }
    
    // Request notification permission
    const notificationPermission = await requestNotificationPermission();
    
    // Initialize haptic feedback
    initializeHapticFeedback();
    
    // Initialize health tracking if on a mobile device
    if (isIOS()) {
      await initializeHealthKit();
    } else if (isAndroid()) {
      await initializeGoogleFit();
    }
    
    return true;
  } catch (err) {
    console.error('Failed to initialize mobile integrations:', err);
    return false;
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Initialize haptic feedback
const initializeHapticFeedback = (): void => {
  // Define haptic feedback methods on window for better access
  if (isMobile() && window.navigator && typeof navigator.vibrate === 'function') {
    (window as any).hapticFeedback = {
      light: () => navigator.vibrate(10),
      medium: () => navigator.vibrate(20),
      heavy: () => navigator.vibrate(30),
      success: () => navigator.vibrate([10, 30, 10]),
      error: () => navigator.vibrate([30, 10, 30]),
      selectionChanged: () => navigator.vibrate(5)
    };
    
    console.log('Haptic feedback initialized');
  } else {
    // Create no-op methods for web
    (window as any).hapticFeedback = {
      light: () => {},
      medium: () => {},
      heavy: () => {},
      success: () => {},
      error: () => {},
      selectionChanged: () => {}
    };
    
    console.log('Haptic feedback not available, using no-op methods');
  }
};

// iOS HealthKit initialization
const initializeHealthKit = async (): Promise<boolean> => {
  // In a real app, this would use Capacitor/Cordova plugins or native code
  console.log('Initializing HealthKit integration');
  return true;
};

// Android Google Fit initialization
const initializeGoogleFit = async (): Promise<boolean> => {
  // In a real app, this would use Capacitor/Cordova plugins or native code
  console.log('Initializing Google Fit integration');
  return true;
};

// Step data interface
export interface StepData {
  steps: number;
  date: string;
  caloriesBurned?: number;
  distanceKm?: number;
}

// Get step count for the given date
export const getStepCount = async (date?: Date): Promise<StepData> => {
  try {
    const targetDate = date || new Date();
    const dateString = targetDate.toISOString().split('T')[0];
    
    // In a production app, this would come from HealthKit or Google Fit
    // Create a simulated bridge for development
    const bridge = new SimulatedMobileBridge();
    
    // Try to get step data
    const steps = await bridge.getSteps(targetDate);
    
    // Calculate distance and calories based on steps
    const distanceKm = steps * 0.0007; // Rough estimate
    const caloriesBurned = steps * 0.04; // Rough estimate
    
    return {
      steps,
      date: dateString,
      caloriesBurned: Math.round(caloriesBurned),
      distanceKm: parseFloat(distanceKm.toFixed(2))
    };
  } catch (error) {
    console.error('Error getting step count:', error);
    
    // Return fallback data
    return fetchCachedStepCount((date || new Date()).toISOString().split('T')[0]);
  }
};

// Helper function to get step data from cache
const fetchCachedStepCount = async (dateString: string): Promise<StepData> => {
  try {
    // In a real app, we would fetch from local storage or API
    // For now, generate deterministic data based on date
    const dateValue = new Date(dateString).getTime();
    const dateSeed = dateValue % 10000;
    
    // Generate between 2000-12000 steps
    const steps = 2000 + (dateSeed % 10000);
    const distanceKm = steps * 0.0007;
    const caloriesBurned = steps * 0.04;
    
    return {
      steps,
      date: dateString,
      caloriesBurned: Math.round(caloriesBurned),
      distanceKm: parseFloat(distanceKm.toFixed(2))
    };
  } catch (error) {
    console.error('Error fetching cached step count:', error);
    return {
      steps: 0,
      date: dateString,
      caloriesBurned: 0,
      distanceKm: 0
    };
  }
};

// Health data interface
export interface HealthData {
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  sleep?: {
    duration: number; // in minutes
    quality: number; // 1-10
  };
  activity?: {
    activeMinutes: number;
    sedentaryMinutes: number;
  };
  lastUpdated: Date;
}

// Get health data
export const getHealthData = async (): Promise<HealthData> => {
  try {
    // Create a simulated bridge for development
    const bridge = new SimulatedMobileBridge();
    
    // Try to get health metrics
    const metrics = await bridge.getHealthMetrics();
    
    // Transform to our HealthData format
    return {
      heartRate: metrics.heartRate,
      sleep: metrics.sleep,
      activity: metrics.activity,
      lastUpdated: metrics.lastUpdated
    };
  } catch (error) {
    console.error('Error getting health data:', error);
    return {
      lastUpdated: new Date()
    };
  }
};

// Request health permissions
export const requestHealthPermissions = async (): Promise<boolean> => {
  const bridge = new SimulatedMobileBridge();
  return bridge.requestHealthPermissions();
};

// Widget configuration
export interface WidgetConfig {
  type: 'progress' | 'steps' | 'streak' | 'next-milestone';
  refreshInterval?: number; // in minutes
  backgroundColor?: string;
  textColor?: string;
}

// Register data for widgets
export const registerWidgetData = (config: WidgetConfig, data: any): boolean => {
  try {
    // In a real app, this would communicate with the native widget system
    // Store widget data in localStorage for simulation
    localStorage.setItem(`widget_${config.type}`, JSON.stringify({
      config,
      data,
      lastUpdated: new Date().toISOString()
    }));
    
    console.log(`Widget data registered for ${config.type}`);
    return true;
  } catch (error) {
    console.error('Error registering widget data:', error);
    return false;
  }
};

// Add TypeScript definitions for window object extensions
declare global {
  interface Window {
    hapticFeedback?: {
      light: () => void;
      medium: () => void;
      heavy: () => void;
      success: () => void;
      error: () => void;
      selectionChanged: () => void;
    };
  }
}

// Process deep links
export const processDeepLink = (url: string, options?: { showToast?: boolean }): void => {
  // Logic moved to the main function above
  if (!url) {
    console.warn('Empty deep link received');
    return;
  }
  
  try {
    console.log(`Processing deep link: ${url}`);
    
    // Parse the URL to extract route and parameters
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const params = Object.fromEntries(urlObj.searchParams);
    
    // Dispatch a custom event with the deep link data
    const event = new CustomEvent(DEEP_LINK_EVENT, {
      detail: { url, path, params }
    });
    window.dispatchEvent(event);
    
    // Show toast message if requested
    if (options?.showToast) {
      // Use the app's toast system
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const toastEvent = new CustomEvent('toast', {
          detail: { message: `Deep link processed: ${path}`, type: 'info' }
        });
        window.dispatchEvent(toastEvent);
      }
    }
  } catch (error) {
    console.error('Error processing deep link', error);
  }
};

// Get mobile feature status
export const getMobileFeatureStatus = (): Record<string, boolean> => {
  const isMobileDevice = isMobile();
  const isNotificationSupported = 'Notification' in window;
  const isVibrationSupported = typeof navigator !== 'undefined' && !!navigator.vibrate;
  const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;
  const isMotionSupported = typeof DeviceMotionEvent !== 'undefined';
  const isBatterySupported = typeof navigator !== 'undefined' && 'getBattery' in navigator;
  
  return {
    mobile: isMobileDevice,
    notifications: isNotificationSupported && isMobileDevice,
    vibration: isVibrationSupported && isMobileDevice,
    share: isShareSupported && isMobileDevice,
    motion: isMotionSupported && isMobileDevice,
    battery: isBatterySupported && isMobileDevice,
    healthKit: isIOS() && isMobileDevice,
    googleFit: isAndroid() && isMobileDevice
  };
};

// Create and export the simulated mobile bridge instance
const simulatedBridge = new SimulatedMobileBridge();
export const mobileBridge: MobileNativeBridge = simulatedBridge; 