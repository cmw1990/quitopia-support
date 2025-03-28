/**
 * API Compatibility Layer for NRT Directory
 * 
 * This module provides compatibility between old function names and new SSOT8001 standards.
 * It re-exports functions from the api.ts, countryService.ts, and affiliateService.ts modules 
 * with consistent naming to prevent breaking changes in existing code.
 */

import { 
  fetchVendors, 
  getBestPrice, 
  getHealthImpactDetails,
  fetchProductById,
  fetchCountryRegulations
} from './api';

import { getCountryInfo as getCountryInfoFromService } from './countryService';
import { 
  trackAffiliateClick as trackAffiliateClickFromService,
  getAffiliateLink as getAffiliateLinkFromService,
  getAffiliateStats as getAffiliateStatsFromService,
  recordAffiliateConversion as recordAffiliateConversionFromService
} from './affiliateService';

// Re-export with legacy names for backward compatibility
export const getVendors = fetchVendors;
export { getCountryInfoFromService as getCountryInfo };
export { trackAffiliateClickFromService as trackAffiliateClick };
export { getAffiliateLinkFromService as getAffiliateLink };
export { getAffiliateStatsFromService as getAffiliateStats };
export { recordAffiliateConversionFromService as recordAffiliateConversion };

// Also re-export the new standard names
export {
  fetchVendors,
  getBestPrice,
  getHealthImpactDetails,
  fetchProductById,
  fetchCountryRegulations
};
