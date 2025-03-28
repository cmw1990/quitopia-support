/**
 * Types related to smokeless products in the Mission Fresh application
 */

/**
 * Represents a smokeless tobacco or nicotine alternative product
 */
export interface SmokelessProduct {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  subcategory?: string;
  nicotineContent: number;
  nicotineUnit: 'mg' | 'mg/g' | 'percent';
  flavors: string[];
  imageUrl: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  isNatural: boolean;
  tags: string[];
  countryAvailability: string[];
  ingredients?: string[];
  url: string;
  isAffiliate: boolean;
  affiliateUrl?: string;
  affiliateCommission?: number;
  vendor: Vendor;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  healthImpact?: HealthImpact;
  comparisonScore?: number;
}

/**
 * Information about a vendor that sells smokeless products
 */
export interface Vendor {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl: string;
  rating: number;
  reviewCount: number;
  shippingCountries: string[];
  averageShippingDays: number;
  reliabilityScore: number;
  returnsAllowed: boolean;
  returnPeriodDays?: number;
  paymentMethods: string[];
}

/**
 * Health information related to a smokeless product
 */
export interface HealthImpact {
  riskLevel: 'low' | 'medium' | 'high';
  comparedToCigarettes: string;
  mainRisks: string[];
  benefits: string[];
  longtermEffects: string[];
  additionalInfo?: string;
  references?: string[];
}

/**
 * Preview version of a smokeless product with minimal information
 */
export interface SmokelessProductPreview {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  rating: number;
  category: string;
  isAffiliate: boolean;
}

/**
 * NRT (Nicotine Replacement Therapy) product information
 */
export interface NRTProduct extends SmokelessProduct {
  medicationType: 'gum' | 'patch' | 'lozenge' | 'inhaler' | 'spray' | 'other';
  usageDuration: string;
  treatmentPeriod: string;
  sideEffects: string[];
  effectivenessRating: number;
  prescriptionRequired: boolean;
  fda_approved: boolean;
}

/**
 * Preview version of an NRT product
 */
export interface NRTProductPreview {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  medicationType: string;
  nicotineContent: number;
  isAffiliate: boolean;
}

/**
 * Discount code for products
 */
export interface DiscountCode {
  id: string;
  code: string;
  discountPercentage: number;
  validUntil: string;
  productIds?: string[];
  categories?: string[];
  minPurchase?: number;
  usageLimit?: number;
  usageCount: number;
  description: string;
} 