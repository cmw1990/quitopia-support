/**
 * NRTDirectory API client
 * 
 * API functions for the Smokeless Nicotine Directory (formerly NRT Directory)
 * Uses REST API calls as required by SSOT8001
 */

// Import the REST client and types
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import type { Session } from '@supabase/supabase-js';
import { NRTProduct, NRTVendor, NRTCountryRegulations, AffiliateClick, HealthImpactDetails } from './nrt-types';

// Helper for handling API errors uniformly
const handleApiError = (error: any) => {
  console.error('NRT Directory API error:', error);
  throw error;
};

/**
 * Fetch NRT products with filtering options
 */
export const fetchNRTProducts = async (
  session: Session | null,
  options: {
    category?: string;
    vendor_id?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    price_min?: number;
    price_max?: number;
    nicotine_min?: number;
    nicotine_max?: number;
    search_term?: string;
  } = {}
): Promise<NRTProduct[]> => {
  try {
    // Build the query parameters
  let query = '/rest/v1/mission4_products?select=*';

  // Add filters
    if (options.category) {
      query += `&category=eq.${encodeURIComponent(options.category)}`;
    }
    
    if (options.vendor_id) {
      query += `&vendor_id=eq.${encodeURIComponent(options.vendor_id)}`;
    }
    
    if (options.price_min !== undefined) {
      query += `&price=gte.${options.price_min}`;
    }
    
    if (options.price_max !== undefined) {
      query += `&price=lte.${options.price_max}`;
    }
    
    if (options.nicotine_min !== undefined) {
      query += `&nicotine_strength=gte.${options.nicotine_min}`;
    }
    
    if (options.nicotine_max !== undefined) {
      query += `&nicotine_strength=lte.${options.nicotine_max}`;
    }
    
    if (options.search_term) {
      query += `&or=(name.ilike.%${encodeURIComponent(options.search_term)}%,description.ilike.%${encodeURIComponent(options.search_term)}%)`;
    }
    
    // Add sorting
    if (options.sort_by) {
      query += `&order=${encodeURIComponent(options.sort_by)}.${options.sort_order || 'asc'}`;
    }
    
    // Add pagination
    if (options.limit) {
      query += `&limit=${options.limit}`;
    }
    
    if (options.offset) {
      query += `&offset=${options.offset}`;
    }
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    return response;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

/**
 * Fetch vendor information
 */
export const fetchVendors = async (
  session: Session | null,
  countryCode: string
): Promise<NRTVendor[]> => {
  try {
    const query = `/rest/v1/mission4_vendors?select=*&countries=cs.{${countryCode}}`;
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    return response;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

/**
 * Fetch a specific product by ID
 */
export const fetchProductById = async (
  session: Session | null,
  productId: string
): Promise<NRTProduct | null> => {
  try {
    const query = `/rest/v1/mission4_products?id=eq.${productId}&select=*`;
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (Array.isArray(response) && response.length > 0) {
      return response[0];
    }
    
    return null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Fetch country regulations
 */
export const fetchCountryRegulations = async (
  session: Session | null,
  countryCode: string
): Promise<NRTCountryRegulations | null> => {
  try {
    const query = `/rest/v1/mission4_country_regulations?code=eq.${countryCode}&select=*`;
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (Array.isArray(response) && response.length > 0) {
      return response[0];
    }
    
    return null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Record affiliate click for tracking
 */
export const recordAffiliateClick = async (
  session: Session | null,
  clickData: {
    user_id?: string;
    product_id: string;
    vendor_id: string;
    country_code: string;
    device_type: string;
  }
): Promise<void> => {
  try {
    await authenticatedRestCall('/rest/v1/mission4_affiliate_clicks', {
        method: 'POST',
      body: JSON.stringify({
        ...clickData,
        click_timestamp: new Date().toISOString()
      })
    }, session);
  } catch (error) {
    // Log but don't fail the operation for tracking
    console.error('Failed to record affiliate click:', error);
  }
};

/**
 * Get affiliate clicks for analytics
 */
export const getAffiliateClicks = async (
  filters: {
    user_id?: string;
    product_id?: string;
    vendor_id?: string;
    country_code?: string;
    from_date?: string;
    to_date?: string;
  } = {}
): Promise<AffiliateClick[]> => {
  try {
    let query = '/rest/v1/mission4_affiliate_clicks?select=*';
    
    if (filters.user_id) {
      query += `&user_id=eq.${filters.user_id}`;
    }
    
    if (filters.product_id) {
      query += `&product_id=eq.${filters.product_id}`;
    }
    
    if (filters.vendor_id) {
      query += `&vendor_id=eq.${filters.vendor_id}`;
    }
    
    if (filters.country_code) {
      query += `&country_code=eq.${filters.country_code}`;
    }
    
    if (filters.from_date) {
      query += `&click_timestamp=gte.${filters.from_date}`;
    }
    
    if (filters.to_date) {
      query += `&click_timestamp=lte.${filters.to_date}`;
    }
    
    // Anonymous requests are okay for aggregate analytics
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    });
    
    return response;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

/**
 * Get the best price for a product across vendors
 */
export const getBestPrice = async (
  session: Session | null,
  productId: string,
  countryCode: string
): Promise<{ vendor_id: string; price: number } | null> => {
  try {
    const query = `/rest/v1/mission4_product_pricing?product_id=eq.${productId}&country_code=eq.${countryCode}&order=price.asc&limit=1`;
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (Array.isArray(response) && response.length > 0) {
      return {
        vendor_id: response[0].vendor_id,
        price: response[0].price
      };
    }
    
    return null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

/**
 * Get health impact details for a product
 */
export const getHealthImpactDetails = async (
  session: Session | null,
  productId: string
): Promise<{
  chemicalDetails: any[];
  clinicalStudies: any[];
  safetyRecommendations: string[];
} | null> => {
  try {
    const query = `/rest/v1/mission4_health_impacts?product_id=eq.${productId}&select=*`;
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (Array.isArray(response) && response.length > 0) {
      return {
        chemicalDetails: response[0].chemical_details || [],
        clinicalStudies: response[0].clinical_studies || [],
        safetyRecommendations: response[0].safety_recommendations || []
      };
    }
    
    return null;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// Export all functions
export default {
  fetchNRTProducts,
  fetchVendors,
  fetchProductById,
  fetchCountryRegulations,
  recordAffiliateClick,
  getAffiliateClicks,
  getBestPrice,
  getHealthImpactDetails
};
