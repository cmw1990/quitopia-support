/**
 * Utility functions for handling images
 */

// Default fallback images for different use cases
export const FALLBACK_IMAGES = {
  avatar: '/easier-focus/images/default-avatar.svg',
  feature: '/easier-focus/images/default-feature.svg',
  banner: '/easier-focus/images/default-banner.svg',
  thumbnail: '/easier-focus/images/default-thumbnail.svg',
  hero: '/easier-focus/images/default-hero.svg',
  supplement: '/easier-focus/images/default-thumbnail.svg', // Reuse thumbnail for supplements
};

/**
 * Handles image loading errors by providing a fallback
 * @param event The error event from the image
 * @param type The type of image (avatar, feature, etc.)
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>, type: keyof typeof FALLBACK_IMAGES = 'thumbnail') {
  const imgElement = event.currentTarget;
  imgElement.onerror = null; // Prevent infinite fallback loop
  imgElement.src = FALLBACK_IMAGES[type];
}

/**
 * Gets a URL for a local image from the public directory
 * @param path The path to the image relative to the public directory
 * @returns The full URL including base path
 */
export function getLocalImageUrl(path: string): string {
  // Ensure the path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If the path already includes the base path, return it as is
  if (normalizedPath.startsWith('/easier-focus/')) {
    return normalizedPath;
  }
  
  // Otherwise prepend the base path
  return `/easier-focus${normalizedPath}`;
}

/**
 * Determines if we're in development mode
 * This is safer than using import.meta.env directly
 */
export const isDevelopment = () => {
  try {
    // @ts-ignore - We know this exists in Vite
    return import.meta.env.DEV === true;
  } catch (e) {
    // Fallback to check for localhost if import.meta isn't available
    return typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1');
  }
};

/**
 * Generates a secure URL for external images using a proxy
 * or falls back to local images for development
 * @param url The original image URL
 * @param type Fallback image type
 * @returns A secure image URL or fallback URL
 */
export function getSecureImageUrl(url: string | null | undefined, type: keyof typeof FALLBACK_IMAGES = 'thumbnail'): string {
  if (!url) return FALLBACK_IMAGES[type];
  
  // Handle relative URLs by prepending base path
  if (url.startsWith('/') && !url.startsWith('/easier-focus/')) {
    return `/easier-focus${url}`;
  }
  
  // Handle unsplash URLs specially - use their optimization API
  if (url.includes('unsplash.com')) {
    try {
      // Parse the URL to get components
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      // Set width and quality for optimization
      params.set('w', '256');
      params.set('q', '80');
      params.set('auto', 'format');
      params.set('fit', 'crop');
      
      // Return optimized URL
      return `${urlObj.origin}${urlObj.pathname}?${params.toString()}`;
    } catch (e) {
      console.warn('Failed to parse unsplash URL:', url);
      return FALLBACK_IMAGES[type];
    }
  }
  
  // For development, just use fallbacks for external images to avoid CORS issues
  if (isDevelopment() && (url.startsWith('http://') || url.startsWith('https://'))) {
    return FALLBACK_IMAGES[type];
  }
  
  return url;
} 