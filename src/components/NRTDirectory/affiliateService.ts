/**
 * Affiliate Service for NRT Directory
 * 
 * Handles affiliate link tracking, clicks, and commission calculations
 * following SSOT8001 guidelines for Supabase REST API access
 */

import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import type { Session } from '@supabase/supabase-js';

// Define types
interface AffiliateStats {
  id: string;
  user_id: string;
  total_clicks: number;
  total_conversions: number;
  total_commission: number;
  last_updated: string;
}

interface AffiliateConversion {
  id?: string;
  user_id: string;
  product_id: string;
  vendor_id: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  conversion_date: string;
}

interface AffiliateLink {
  id: string;
  original_url: string;
  tracking_url: string;
  product_id: string;
  vendor_id: string;
  created_for_user?: string;
  click_count: number;
  conversion_count: number;
  created_at: string;
}

/**
 * Get or create a tracking link for a product
 */
export const getAffiliateLink = async (
  session: Session | null,
  productId: string,
  vendorId: string,
  originalUrl: string
): Promise<string> => {
  try {
    // Check if link already exists
    const query = `/rest/v1/mission4_affiliate_links?product_id=eq.${encodeURIComponent(productId)}&vendor_id=eq.${encodeURIComponent(vendorId)}&select=tracking_url`;
    
    const existingLinks = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (Array.isArray(existingLinks) && existingLinks.length > 0) {
      return existingLinks[0].tracking_url;
    }
    
    // Create new tracking link
    const userId = session?.user?.id;
    const newLink: Omit<AffiliateLink, 'id' | 'created_at'> = {
      original_url: originalUrl,
      tracking_url: `${window.location.origin}/redirect?pid=${productId}&vid=${vendorId}${userId ? `&uid=${userId}` : ''}`,
      product_id: productId,
      vendor_id: vendorId,
      created_for_user: userId,
      click_count: 0,
      conversion_count: 0,
    };
    
    const response = await authenticatedRestCall('/rest/v1/mission4_affiliate_links', {
      method: 'POST',
      body: JSON.stringify(newLink)
    }, session);
    
    if (Array.isArray(response) && response.length > 0) {
      return response[0].tracking_url;
    }
    
    return newLink.tracking_url;
  } catch (error) {
    console.error('Error creating affiliate link:', error);
    // Fall back to original URL if tracking fails
    return originalUrl;
  }
};

/**
 * Track a click on an affiliate link
 */
export const trackAffiliateClick = async (
  session: Session | null,
  productId: string,
  vendorId: string,
  userId?: string
): Promise<void> => {
  try {
    const clickData = {
      product_id: productId,
      vendor_id: vendorId,
      user_id: userId || session?.user?.id,
      device_type: detectDeviceType(),
      click_date: new Date().toISOString()
    };
    
    await authenticatedRestCall('/rest/v1/mission4_affiliate_clicks', {
      method: 'POST',
      body: JSON.stringify(clickData)
    }, session);
    
    // Also update the link's click count
    const query = `/rest/v1/mission4_affiliate_links?product_id=eq.${encodeURIComponent(productId)}&vendor_id=eq.${encodeURIComponent(vendorId)}`;
    
    await authenticatedRestCall(query, {
      method: 'PATCH',
      body: JSON.stringify({ click_count: 'click_count + 1' })
    }, session);
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    // Non-critical feature, should not disrupt user experience
  }
};

/**
 * Get affiliate stats for a user
 */
export const getAffiliateStats = async (
  session: Session | null,
  userId?: string
): Promise<AffiliateStats | null> => {
  try {
    const targetUserId = userId || session?.user?.id;
    if (!targetUserId) {
      return null;
    }
    
    const query = `/rest/v1/affiliate_stats?user_id=eq.${targetUserId}&select=*`;
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (Array.isArray(response) && response.length > 0) {
      return response[0];
    }
    
    // No stats found, create initial stats
    const initialStats: Omit<AffiliateStats, 'id'> = {
      user_id: targetUserId,
      total_clicks: 0,
      total_conversions: 0,
      total_commission: 0,
      last_updated: new Date().toISOString()
    };
    
    const createResponse = await authenticatedRestCall('/rest/v1/affiliate_stats', {
      method: 'POST',
      body: JSON.stringify(initialStats)
    }, session);
    
    if (Array.isArray(createResponse) && createResponse.length > 0) {
      return createResponse[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return null;
  }
};

/**
 * Record a conversion from an affiliate link
 */
export const recordAffiliateConversion = async (
  session: Session | null,
  conversionData: {
    user_id: string;
    product_id: string;
    vendor_id: string;
    amount: number;
    commission_rate: number;
  }
): Promise<void> => {
  try {
    const conversion: AffiliateConversion = {
      ...conversionData,
      commission_amount: conversionData.amount * conversionData.commission_rate,
      conversion_date: new Date().toISOString()
    };
    
    await authenticatedRestCall('/rest/v1/affiliate_conversions', {
      method: 'POST',
      body: JSON.stringify(conversion)
    }, session);
    
    // Update the affiliate stats
    await authenticatedRestCall(`/rest/v1/affiliate_stats?user_id=eq.${conversionData.user_id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        total_conversions: 'total_conversions + 1',
        total_commission: `total_commission + ${conversion.commission_amount}`,
        last_updated: new Date().toISOString()
      })
    }, session);
    
    // Update the link conversion count
    await authenticatedRestCall(`/rest/v1/mission4_affiliate_links?product_id=eq.${conversionData.product_id}&vendor_id=eq.${conversionData.vendor_id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        conversion_count: 'conversion_count + 1'
      })
    }, session);
  } catch (error) {
    console.error('Error recording affiliate conversion:', error);
  }
};

/**
 * Get conversions for a user
 */
export const getUserConversions = async (
  session: Session | null,
  userId: string,
  timeRange?: { start: string; end: string }
): Promise<AffiliateConversion[]> => {
  try {
    let query = `/rest/v1/affiliate_conversions?user_id=eq.${userId}&select=*`;
    
    if (timeRange) {
      query += `&conversion_date=gte.${timeRange.start}&conversion_date=lte.${timeRange.end}`;
    }
    
    query += '&order=conversion_date.desc';
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching user conversions:', error);
    return [];
  }
};

// Helper to detect device type
const detectDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Expose the API
export default {
  getAffiliateLink,
  trackAffiliateClick,
  getAffiliateStats,
  recordAffiliateConversion,
  getUserConversions
}; 