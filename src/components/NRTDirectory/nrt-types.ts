/**
 * NRT Directory Types
 * Defines the data structures used in the NRT Directory component.
 */

// NRT Product Categories
export type NRTCategory = 'all' | 'gum' | 'patch' | 'lozenge' | 'inhaler' | 'spray';

// Product Rating Type (1-5 stars)
export type ProductRating = 1 | 2 | 3 | 4 | 5;

// Product Variant
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  nicotineStrength: number;
  inStock: boolean;
}

// Price range structure
export interface PriceRange {
  min: number;
  max: number;
}

// Effectiveness time range (in minutes)
export interface EffectivenessTime {
  min: number;
  max: number;
}

// Effectiveness rating (1-5)
export type EffectivenessRating = 1 | 2 | 3 | 4 | 5;

// Side effect severity
export type SideEffectSeverity = 'mild' | 'moderate' | 'severe';

// Side effect
export interface SideEffect {
  name: string;
  description: string;
  frequency: string; // e.g., "common", "rare", "uncommon"
  severity: SideEffectSeverity;
}

// Chemical Information
export interface ChemicalInfo {
  name: string;
  description: string;
  category: string;
  warningLevel: 'low' | 'moderate' | 'high';
}

// Health Impact factor
export interface HealthImpactFactor {
  description: string;
  severity: 'low' | 'moderate' | 'high';
}

// Health Impact category
export interface HealthImpactCategory {
  rating: number; // 1-10
  factors: HealthImpactFactor[];
}

// Health Impact assessment
export interface HealthImpact {
  gumHealth: HealthImpactCategory;
  lungHealth: HealthImpactCategory;
  heartHealth: HealthImpactCategory;
  overall: number; // 1-10
}

// Usage instruction step
export interface UsageStep {
  step: number;
  instruction: string;
}

// Nicotine replacement therapy product
export interface NRTProduct {
  id: string;
  name: string;
  brand: string;
  category: NRTCategory;
  description: string;
  rating: number; // 1.0 - 5.0
  features: string[];
  priceRange: PriceRange;
  nicotineContent: string;
  effectivenessTime: EffectivenessTime;
  effectivenessRating: EffectivenessRating;
  strength: 1 | 2 | 3 | 4 | 5; // 1 = lowest, 5 = highest
  sideEffects: SideEffect[];
  usageInstructions: UsageStep[];
  bestFor: string[];
  notRecommendedFor: string[];
  imageUrl?: string;
  affiliateLink: string;
  availability: 'prescription' | 'over-the-counter' | 'online-only';
  additionalNotes?: string;
  // Optional properties that might be present in some contexts
  reviews?: number;
  variants?: ProductVariant[];
  type?: string;
  image?: string;
  healthImpact?: HealthImpact;
}

// User review for an NRT product
export interface NRTReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: ProductRating;
  title: string;
  review: string;
  date: Date;
  helpfulCount: number;
  verified: boolean;
}

// NRT usage progress
export interface NRTUsageProgress {
  productId: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'stopped';
  notes: string[];
  effectivenessRating?: EffectivenessRating;
  sideEffectsExperienced: string[];
}

// Vendor information
export interface NRTVendor {
  id: string;
  name: string;
  description: string;
  website: string;
  logo_url: string;
  shipping_countries: string[];
  shipping_cost: {
    [countryCode: string]: number;
  };
  shipping_time: {
    [countryCode: string]: string;
  };
  payment_methods: string[];
  trusted_rating: number; // 1-5
  verified: boolean;
  countries: string[];
}

// Country regulations for NRT products
export interface NRTCountryRegulations {
  code: string;
  name: string;
  legal_status: string;
  prescription_required: boolean;
  age_restriction: number;
  purchase_limits: {
    product_type: string;
    limit_quantity: number;
    limit_period: string;
  }[];
  regulatory_notes: string;
  tax_rate: number;
  import_restrictions: string;
}

// Affiliate click tracking
export interface AffiliateClick {
  id?: string;
  user_id?: string;
  product_id: string;
  vendor_id: string;
  country_code: string;
  device_type: string;
  click_timestamp: string;
}

// Health impact detailed information
export interface HealthImpactDetails {
  chemicalDetails: ChemicalInfo[];
  clinicalStudies: {
    title: string;
    findings: string;
    url: string;
  }[];
  safetyRecommendations: string[];
} 