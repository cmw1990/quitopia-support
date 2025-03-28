/**
 * Deep Link Utilities
 * 
 * This module provides utilities for handling deep links in the application,
 * including generating deep link URLs, registering handlers, and simulating
 * deep link events.
 */

import { toast } from 'sonner';

// Types
export interface DeepLinkParams {
  [key: string]: string | number | boolean;
}

export interface DeepLinkOptions {
  addToHistory?: boolean;
  showToast?: boolean;
}

// Constants
export const DEEP_LINK_EVENT = 'deepLink';
export const INITIAL_DEEP_LINK_KEY = 'initialDeepLink';

/**
 * Generate a deep link URL for a specific route in the application
 */
export const generateDeepLink = (
  path: string, 
  params?: DeepLinkParams
): string => {
  // Base URL
  const baseUrl = window.location.origin;
  
  // Add the path
  let url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  
  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    
    url = `${url}?${searchParams.toString()}`;
  }
  
  return url;
};

/**
 * Handle a deep link URL by dispatching an event or directly navigating
 */
export const handleDeepLink = (
  url: string, 
  options: DeepLinkOptions = {}
): void => {
  const { addToHistory = true, showToast = false } = options;

  if (!url) return;
  
  try {
    // Parse the URL
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    
    if (path) {
      // Dispatch deep link event
      const deepLinkEvent = new CustomEvent(DEEP_LINK_EVENT, { 
        detail: { url, path, params: Object.fromEntries(urlObj.searchParams) }
      });
      
      window.dispatchEvent(deepLinkEvent);
      
      // Show toast notification if enabled
      if (showToast) {
        toast.info(`Deep link handled: ${path}`);
      }
      
      // Add to browser history if enabled
      if (addToHistory && window.history) {
        window.history.pushState(null, '', path);
      }
    }
  } catch (error) {
    console.error('Error handling deep link:', error);
    if (showToast) {
      toast.error('Failed to handle deep link');
    }
  }
};

/**
 * Simulate receiving a deep link
 */
export const simulateDeepLink = (
  path: string, 
  params?: DeepLinkParams,
  options?: DeepLinkOptions
): void => {
  const url = generateDeepLink(path, params);
  handleDeepLink(url, options);
};

/**
 * Store initial deep link for later processing
 */
export const storeInitialDeepLink = (url: string): void => {
  if (url) {
    localStorage.setItem(INITIAL_DEEP_LINK_KEY, url);
  }
};

/**
 * Check and process any stored initial deep link
 */
export const checkForStoredDeepLink = (): void => {
  const initialUrl = localStorage.getItem(INITIAL_DEEP_LINK_KEY);
  
  if (initialUrl) {
    handleDeepLink(initialUrl);
    localStorage.removeItem(INITIAL_DEEP_LINK_KEY);
  }
};

/**
 * Register a handler for deep link events
 */
export const registerDeepLinkHandler = (
  handler: (event: CustomEvent) => void
): () => void => {
  const wrappedHandler = (event: Event) => {
    handler(event as CustomEvent);
  };
  
  window.addEventListener(DEEP_LINK_EVENT, wrappedHandler);
  
  // Return a function to remove the event listener
  return () => {
    window.removeEventListener(DEEP_LINK_EVENT, wrappedHandler);
  };
}; 