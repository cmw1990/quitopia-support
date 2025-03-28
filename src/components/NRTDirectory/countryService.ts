/**
 * Country Service for NRT Directory
 * 
 * Handles country-specific information and regulations
 * following SSOT8001 guidelines for Supabase REST API access
 */

import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import type { Session } from '@supabase/supabase-js';
import { CountryInfo } from './types';
import { NRTCountryRegulations } from './nrt-types';

/**
 * Get country information including regulations
 */
export const getCountryInfo = async (
  session: Session | null,
  countryCode: string
): Promise<CountryInfo | null> => {
  try {
    // Fetch country regulations
    const query = `/rest/v1/mission4_country_regulations?code=eq.${countryCode}&select=*`;
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (!Array.isArray(response) || response.length === 0) {
      return null;
    }
    
    const regulations = response[0];
    
    // Convert to CountryInfo format
    const countryInfo: CountryInfo = {
      code: regulations.code,
      name: regulations.name,
      currencyCode: 'USD', // Default, can be enhanced with currency API
      currencySymbol: '$', // Default, can be enhanced with currency API
      regulations: {
        prescriptionRequired: regulations.prescription_required,
        minimumAge: regulations.age_restriction,
        warnings: [regulations.regulatory_notes]
      }
    };
    
    return countryInfo;
  } catch (error) {
    console.error('Error fetching country info:', error);
    return null;
  }
};

/**
 * Get a list of supported countries
 */
export const getSupportedCountries = async (
  session: Session | null
): Promise<{ code: string, name: string }[]> => {
  try {
    const query = '/rest/v1/mission4_country_regulations?select=code,name&order=name.asc';
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (!Array.isArray(response)) {
      return [];
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching supported countries:', error);
    return [];
  }
};

/**
 * Get regulatory warnings for a specific country and product type
 */
export const getCountryWarnings = async (
  session: Session | null,
  countryCode: string,
  productType: string
): Promise<string[]> => {
  try {
    const query = `/rest/v1/mission4_country_regulations?code=eq.${countryCode}&select=regulatory_notes,purchase_limits`;
    
    const response = await authenticatedRestCall(query, {
      method: 'GET'
    }, session);
    
    if (!Array.isArray(response) || response.length === 0) {
      return [];
    }
    
    const regulations = response[0];
    const warnings: string[] = [];
    
    // Add general regulatory notes
    if (regulations.regulatory_notes) {
      warnings.push(regulations.regulatory_notes);
    }
    
    // Add product-specific purchase limits if they exist
    if (Array.isArray(regulations.purchase_limits)) {
      const productLimits = regulations.purchase_limits.filter(
        limit => limit.product_type === productType || limit.product_type === 'all'
      );
      
      productLimits.forEach(limit => {
        warnings.push(
          `Purchase limit: ${limit.limit_quantity} units per ${limit.limit_period}`
        );
      });
    }
    
    return warnings;
  } catch (error) {
    console.error('Error fetching country warnings:', error);
    return [];
  }
}; 