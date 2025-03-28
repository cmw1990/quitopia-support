/**
 * Progress-specific Deep Linking Utilities
 * 
 * This module provides specialized deep linking functionality for the Progress tracking
 * feature, enabling sharing progress data via deep links and handling incoming
 * progress-specific deep links.
 */

import { generateDeepLink, handleDeepLink, DeepLinkParams } from './deepLink';
import { mobileBridge } from './mobileIntegration';

/**
 * Interface for sharing progress with images
 */
export interface ProgressShareData {
  title: string;
  message: string;
  periodId: string;
  tab?: 'daily' | 'weekly' | 'monthly';
  imageUrl?: string;
  imageBlob?: Blob;
  stats?: {
    daysSmokeFree?: number;
    cigarettesAvoided?: number;
    moneySaved?: number;
    healthScore?: number;
  };
}

/**
 * Generate a deep link to share progress
 */
export const generateProgressShareLink = (
  periodId: string,
  tab: 'daily' | 'weekly' | 'monthly' = 'weekly',
  showShare: boolean = true,
  stats?: {
    daysSmokeFree?: number;
    cigarettesAvoided?: number;
    moneySaved?: number;
    healthScore?: number;
  }
): string => {
  const params: DeepLinkParams = {
    periodId,
    tab,
  };
  
  if (showShare) {
    params.share = 'true';
  }
  
  // Add stats for sharing if provided
  if (stats) {
    if (stats.daysSmokeFree) params.daysSmokeFree = stats.daysSmokeFree.toString();
    if (stats.cigarettesAvoided) params.avoided = stats.cigarettesAvoided.toString();
    if (stats.moneySaved) params.saved = stats.moneySaved.toString();
    if (stats.healthScore) params.score = stats.healthScore.toString();
  }
  
  return generateDeepLink('/progress', params);
};

/**
 * Share progress via the platform's native sharing mechanism
 * Enhanced to support image sharing and more social platforms
 */
export const shareProgress = async (
  shareData: ProgressShareData
): Promise<boolean> => {
  const { title, message, periodId, tab = 'weekly', imageUrl, imageBlob, stats } = shareData;
  const deepLink = generateProgressShareLink(periodId, tab, true, stats);
  
  try {
    // Create share data object
    const webShareData: ShareData = {
      title,
      text: message,
      url: deepLink
    };
    
    // Add image file if available (for mobile devices)
    if (imageBlob) {
      const file = new File(
        [imageBlob], 
        `mission-fresh-progress-${new Date().getTime()}.png`, 
        { type: imageBlob.type }
      );
      webShareData.files = [file];
    }
    
    // Use the mobile bridge for native sharing if available
    if (mobileBridge.canShareContent()) {
      return await mobileBridge.shareContent({
        title,
        text: message,
        url: deepLink,
      });
    } else if (navigator.share) {
      // Fall back to web share API if available
      await navigator.share(webShareData);
      return true;
    } else {
      // Fall back to clipboard copy
      await navigator.clipboard.writeText(`${message} ${deepLink}`);
      return true;
    }
  } catch (error) {
    console.error('Error sharing progress:', error);
    return false;
  }
};

/**
 * Share directly to a specific platform
 */
export const shareToSocialPlatform = (
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp',
  shareData: ProgressShareData
): boolean => {
  const { title, message, periodId, tab = 'weekly', stats } = shareData;
  const deepLink = generateProgressShareLink(periodId, tab, true, stats);
  const encodedMessage = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(deepLink);
  
  let shareUrl = '';
  
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
      break;
    default:
      return false;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank');
    return true;
  }
  
  return false;
};

/**
 * Handle an incoming progress deep link
 */
export const handleProgressDeepLink = (url: string): {
  periodId?: string;
  tab?: string;
  showShare?: boolean;
  stats?: {
    daysSmokeFree?: number;
    cigarettesAvoided?: number;
    moneySaved?: number;
    healthScore?: number;
  };
} => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const result = {
      periodId: params.get('periodId') || undefined,
      tab: params.get('tab') || undefined,
      showShare: params.get('share') === 'true',
      stats: {}
    };
    
    // Parse stats if available
    const daysSmokeFree = params.get('daysSmokeFree');
    const avoided = params.get('avoided');
    const saved = params.get('saved');
    const score = params.get('score');
    
    if (daysSmokeFree || avoided || saved || score) {
      result.stats = {
        daysSmokeFree: daysSmokeFree ? parseInt(daysSmokeFree, 10) : undefined,
        cigarettesAvoided: avoided ? parseInt(avoided, 10) : undefined,
        moneySaved: saved ? parseFloat(saved) : undefined,
        healthScore: score ? parseInt(score, 10) : undefined
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing progress deep link:', error);
    return {};
  }
};

/**
 * Create a notification with a deep link to progress
 */
export const createProgressNotification = async (
  title: string,
  body: string,
  periodId: string,
  tab: 'daily' | 'weekly' | 'monthly' = 'weekly'
): Promise<string | null> => {
  try {
    const deepLink = generateProgressShareLink(periodId, tab, false);
    
    if (mobileBridge.canReceiveNotifications()) {
      const notificationId = await mobileBridge.scheduleNotification({
        title,
        body,
        deepLink
      });
      
      return notificationId;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating progress notification:', error);
    return null;
  }
};

/**
 * Parse progress deep link parameters from a URL
 */
export const parseProgressParams = (url: string): {
  periodId?: string;
  tab?: 'daily' | 'weekly' | 'monthly';
  showShare?: boolean;
  stats?: {
    daysSmokeFree?: number;
    cigarettesAvoided?: number;
    moneySaved?: number;
    healthScore?: number;
  };
} | null => {
  try {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;
    
    if (!urlObj.pathname.includes('/progress')) {
      return null;
    }
    
    const result: {
      periodId?: string;
      tab?: 'daily' | 'weekly' | 'monthly';
      showShare?: boolean;
      stats?: {
        daysSmokeFree?: number;
        cigarettesAvoided?: number;
        moneySaved?: number;
        healthScore?: number;
      };
    } = {};
    
    // Get periodId if present
    const periodId = searchParams.get('periodId');
    if (periodId) {
      result.periodId = periodId;
    }
    
    // Get tab if present and valid
    const tab = searchParams.get('tab');
    if (tab && ['daily', 'weekly', 'monthly'].includes(tab)) {
      result.tab = tab as 'daily' | 'weekly' | 'monthly';
    }
    
    // Check for share flag
    result.showShare = searchParams.get('share') === 'true';
    
    // Parse stats if available
    const daysSmokeFree = searchParams.get('daysSmokeFree');
    const avoided = searchParams.get('avoided');
    const saved = searchParams.get('saved');
    const score = searchParams.get('score');
    
    if (daysSmokeFree || avoided || saved || score) {
      result.stats = {
        daysSmokeFree: daysSmokeFree ? parseInt(daysSmokeFree, 10) : undefined,
        cigarettesAvoided: avoided ? parseInt(avoided, 10) : undefined,
        moneySaved: saved ? parseFloat(saved) : undefined,
        healthScore: score ? parseInt(score, 10) : undefined
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing progress URL parameters:', error);
    return null;
  }
}; 

/**
 * Generate meta tags for link preview
 * This can be used to enhance link previews on social media platforms
 */
export const generateProgressMetaTags = (
  shareData: ProgressShareData
): {[key: string]: string} => {
  const { title, message, imageUrl, stats } = shareData;
  
  // Create a description that includes stats if available
  let description = message;
  if (stats) {
    const details = [];
    if (stats.daysSmokeFree) details.push(`${stats.daysSmokeFree} days smoke-free`);
    if (stats.cigarettesAvoided) details.push(`${stats.cigarettesAvoided} cigarettes avoided`);
    if (stats.moneySaved) details.push(`$${stats.moneySaved.toFixed(2)} saved`);
    if (stats.healthScore) details.push(`${stats.healthScore}% health score`);
    
    if (details.length > 0) {
      description += ` | ${details.join(' | ')}`;
    }
  }
  
  // Basic meta tags
  const metaTags: {[key: string]: string} = {
    'og:title': title,
    'og:description': description,
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description
  };
  
  // Add image if available
  if (imageUrl) {
    metaTags['og:image'] = imageUrl;
    metaTags['twitter:image'] = imageUrl;
  }
  
  return metaTags;
}; 