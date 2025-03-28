/**
 * NRT Directory Component Types
 * Contains types used by the NRT Directory components
 */

import { NRTProduct as BaseNRTProduct, NRTCategory } from './nrt-types';

// Extend NRTCategory to include 'alternative'
export type ExtendedNRTCategory = NRTCategory | 'alternative' | 'nrt';

// Extended NRTProduct with the additional properties needed for ProductDetails
export interface ExtendedNRTProduct extends Omit<BaseNRTProduct, 'category'> {
  variants: ProductVariant[];
  image: string;
  healthImpact: HealthImpactDetails;
  type: 'patch' | 'gum' | 'lozenge' | 'inhaler' | 'spray' | 'pouch' | 'toothpick';
  category: ExtendedNRTCategory;
  chemicals: ChemicalInfo[];
  gum_health_rating?: number;
  chemical_concerns?: ChemicalInfo[];
  usage: {
    instructions: string;
    duration: string;
    maxDaily: number;
    warnings: string[];
  };
  features: string[];
  pros: string[];
  cons: string[];
  bestFor: string[];
  certifications: string[];
  manufacturerInfo: {
    name: string;
    country: string;
    website: string;
  };
}

// Product variant (a specific version of a product)
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  nicotineStrength: number;
  inStock: boolean;
}

// Health impact factor
export interface HealthImpactFactor {
  description: string;
  severity: 'low' | 'moderate' | 'high';
}

// Health impact category rating
export interface HealthImpactCategory {
  rating: number; // 1-10 scale
  factors: HealthImpactFactor[];
}

// Health impact assessment
export interface HealthImpactDetails {
  gumHealth: HealthImpactCategory;
  lungHealth: HealthImpactCategory;
  heartHealth: HealthImpactCategory;
  overall: number; // 1-10 scale
  oralHealth?: {
    rating: number; // 1-10
    concerns: string[];
  };
  systemicEffects?: {
    description: string;
    riskLevel: 'low' | 'moderate' | 'high';
  }[];
}

// Country information
export interface CountryInfo {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  regulations: {
    prescriptionRequired: boolean;
    minimumAge: number;
    warnings: string[];
  };
}

// Vendor information
export interface Vendor {
  id: string;
  name: string;
  website: string;
  affiliateId: string;
  rating: number;
  deliveryOptions: {
    standard: {
      cost: number;
      timeRange: string;
    };
    express?: {
      cost: number;
      timeRange: string;
    };
  };
  countries: string[];
}

export interface ChemicalInfo {
  name: string;
  category: 'active' | 'inactive' | 'concern';
  description: string;
  effects: string[];
  warningLevel: 'low' | 'moderate' | 'high';
  references: string[];
}

export interface AffiliateClick {
  productId: string;
  variantId: string;
  vendorId: string;
  userId?: string;
  timestamp: string;
  device: string;
  country: string;
}

export interface NRTDirectoryFilters {
  type?: string[];
  category?: string[];
  strength?: [number, number];
  price?: [number, number];
  rating?: number;
  flavored?: boolean;
  inStock?: boolean;
  vendor?: string[];
  country?: string;
  prescriptionFree?: boolean;
  maxHealthImpact?: number;
  certifications?: string[];
}

// Export NRTProduct as an alias for ExtendedNRTProduct for backward compatibility
export type NRTProduct = ExtendedNRTProduct;
