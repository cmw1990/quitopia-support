import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { SmokelessProduct } from '@/types/product';

/**
 * Interface for affiliate click data
 */
interface AffiliateClickData {
  productId: string;
  userId: string;
  source: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for product impression data
 */
interface ProductImpressionData {
  productId: string;
  userId: string;
  source: string;
  isAffiliate: boolean;
  metadata?: Record<string, any>;
}

/**
 * Interface for any type of smokeless product including affiliate properties
 */
export interface EnhancedSmokelessProduct {
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
  vendor: { id: string; name: string; };
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  healthImpact?: {
    riskLevel: 'low' | 'medium' | 'high';
    mainRisks: string[];
  };
  comparisonScore?: number;
  strength: string;
  image?: string; // For compatibility with SmokelessProductsDirectory.tsx
  inStock?: boolean; // For compatibility with SmokelessProductsDirectory.tsx
  vendor_id?: string; // For compatibility with SmokelessProductsDirectory.tsx
  country_availability?: string[]; // For compatibility with SmokelessProductsDirectory.tsx
  affiliateDiscount?: string; // Additional property
  highlights?: string[]; // For compatibility with SmokelessProductsDirectory.tsx
  concerns?: string[]; // For compatibility with SmokelessProductsDirectory.tsx
  isNew?: boolean; // For compatibility with SmokelessProductsDirectory.tsx
}

/**
 * Track an affiliate link click via REST API
 * 
 * @param data Click data including product ID, user ID, and source
 * @param session Active user session
 * @returns Promise that resolves when tracking is complete
 */
export const trackAffiliateClickREST = async (
  data: AffiliateClickData,
  session: Session | null
): Promise<boolean> => {
  if (!session) {
    console.warn('Cannot track affiliate click: No active session');
    return false;
  }
  
  try {
    await authenticatedRestCall(
      '/rest/v1/affiliate_clicks',
      {
        method: 'POST',
        body: JSON.stringify({
          product_id: data.productId,
          user_id: data.userId,
          source: data.source,
          timestamp: new Date().toISOString(),
          metadata: data.metadata || {}
        })
      },
      session
    );
    
    // Also track in analytics if available
    if (window.gtag) {
      window.gtag('event', 'affiliate_click', {
        product_id: data.productId,
        source: data.source
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return false;
  }
};

/**
 * Track a product impression (view) via REST API
 * 
 * @param data Impression data including product ID, user ID, and source
 * @param session Active user session
 * @returns Promise that resolves when tracking is complete
 */
export const trackProductImpressionREST = async (
  data: ProductImpressionData,
  session: Session | null
): Promise<boolean> => {
  if (!session) {
    return false;
  }
  
  try {
    await authenticatedRestCall(
      '/rest/v1/product_impressions',
      {
        method: 'POST',
        body: JSON.stringify({
          product_id: data.productId,
          user_id: data.userId,
          source: data.source,
          timestamp: new Date().toISOString(),
          is_affiliate: data.isAffiliate,
          metadata: data.metadata || {}
        })
      },
      session
    );
    
    // Also track in analytics if available
    if (window.gtag) {
      window.gtag('event', 'product_impression', {
        product_id: data.productId,
        is_affiliate: data.isAffiliate,
        source: data.source
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking product impression:', error);
    return false;
  }
};

/**
 * Apply affiliate discount code and show notification
 * 
 * @param discountCode The discount code to copy to clipboard
 * @returns Promise that resolves when the code is copied
 */
export const applyAffiliateDiscount = async (
  discountCode: string
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(discountCode);
    toast.success(`Discount code ${discountCode} copied to clipboard!`);
    return true;
  } catch (error) {
    console.error('Failed to copy discount code:', error);
    toast.error('Failed to copy discount code. Please try again.');
    return false;
  }
};

/**
 * Track when a user clicks on an affiliate product link
 * @param product The product that was clicked
 * @param metadata Additional metadata about the click event
 */
export function trackAffiliateClick(
  product: EnhancedSmokelessProduct,
  metadata: {
    position?: number;
    list?: string;
    referrer?: string;
    discount?: number;
  } = {}
) {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Affiliate click tracked:', {
        product_id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category,
        ...metadata
      });
    }

    // In production, this would send to an analytics service
    const event = {
      event: 'affiliate_click',
      product_id: product.id,
      name: product.name,
      price: product.price,
      brand: product.brand,
      category: product.category,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Send the event to the analytics endpoint (commented out for now)
    // analyticsService.trackEvent(event);
    
    // For now, log to console
    console.log('Affiliate click:', event);
    
    // Track this event if Google Analytics is available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        event_category: 'Affiliate',
        event_label: product.name,
        value: product.price
      });
    }
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
  }
}

/**
 * Track when affiliate products are displayed to the user
 * @param products Array of affiliate products that were displayed
 * @param listName Name of the list where products were displayed
 */
export function trackAffiliateImpressions(
  products: EnhancedSmokelessProduct[], 
  listName: string = 'Product Directory'
) {
  try {
    if (products.length === 0) return;
    
    // Prepare the impression data
    const impressions = products.map((product, index) => ({
      product_id: product.id,
      name: product.name,
      price: product.price,
      brand: product.brand,
      category: product.category,
      position: index + 1,
      list: listName
    }));
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Affiliate impressions tracked:', impressions);
    }
    
    // In production, send to analytics service
    const event = {
      event: 'affiliate_impression',
      products: impressions,
      timestamp: new Date().toISOString()
    };
    
    // Send the event to the analytics endpoint (commented out for now)
    // analyticsService.trackEvent(event);
    
    // Track this event if Google Analytics is available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', {
        event_category: 'Affiliate',
        event_label: listName,
        items: impressions.map(item => ({
          id: item.product_id,
          name: item.name,
          brand: item.brand,
          category: item.category,
          list_name: listName,
          position: item.position
        }))
      });
    }
  } catch (error) {
    console.error('Error tracking affiliate impressions:', error);
  }
}

/**
 * Track a product impression (view) via client-side tracking
 * @param product The product that was viewed
 * @param metadata Additional metadata about the impression
 */
export function trackProductImpression(
  product: EnhancedSmokelessProduct,
  metadata: {
    position?: number;
    list?: string;
    referrer?: string;
  } = {}
) {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Product impression tracked:', {
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        is_affiliate: product.isAffiliate,
        ...metadata
      });
    }

    // Prepare the impression data
    const event = {
      event: 'product_impression',
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      is_affiliate: product.isAffiliate,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Send the event to the analytics endpoint (commented out for now)
    // analyticsService.trackEvent(event);
    
    // For now, log to console
    console.log('Product impression:', event);
    
    // Track this event if Google Analytics is available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        event_category: 'Products',
        event_label: product.name,
        items: [{
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          variant: product.strength
        }]
      });
    }
  } catch (error) {
    console.error('Error tracking product impression:', error);
  }
}

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
} 