/**
 * Vendor Types for Mission Fresh NRT Directory
 * 
 * These types define the data structures for vendors, pricing, availability,
 * and shipping information for Nicotine Replacement Therapy products.
 */

/**
 * Vendor information for NRT products
 */
export interface Vendor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  description?: string;
  rating?: number;
  verified: boolean;
  shipping_countries: string[];
  shipping_regions?: string[];
  free_shipping_threshold?: number;
  shipping_time_estimates: ShippingTimeEstimate[];
  discount_codes?: DiscountCode[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Shipping time estimates for vendors
 */
export interface ShippingTimeEstimate {
  region: string;
  min_days: number;
  max_days: number;
  shipping_method: string;
  shipping_cost: number;
}

/**
 * Discount codes for vendors
 */
export interface DiscountCode {
  code: string;
  discount_percentage?: number;
  discount_amount?: number;
  expiration_date?: string;
  minimum_purchase?: number;
  description?: string;
}

/**
 * Product vendor availability and pricing
 */
export interface ProductVendorAvailability {
  id: string;
  product_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_logo_url: string;
  price: number;
  currency: string;
  in_stock: boolean;
  product_url: string;
  shipping_cost: number;
  shipping_time: string;
  free_shipping: boolean;
  countryAvailability: string[];
  discountCodes?: string;
  last_checked: string;
}

/**
 * Vendor price comparison result
 */
export interface VendorPriceComparison {
  vendorId: string;
  vendorName: string;
  logoUrl: string;
  price: number;
  shipping: number;
  totalPrice: number;
  discountCode?: string;
  discountAmount?: number;
  availability: boolean;
  region: string;
  shippingTime: string;
  url: string;
}

/**
 * Function to calculate best vendor deal
 */
export const calculateBestDeal = (
  vendors: ProductVendorAvailability[],
  countryCode: string
): ProductVendorAvailability | null => {
  if (!vendors || vendors.length === 0) return null;
  
  // Filter for available vendors in the country
  const availableVendors = vendors.filter(
    v => v.in_stock && 
    (v.countryAvailability.includes(countryCode) || v.countryAvailability.includes('Worldwide'))
  );
  
  if (availableVendors.length === 0) return null;
  
  // Sort by total price (product + shipping)
  return [...availableVendors].sort((a, b) => 
    (a.price + a.shipping_cost) - (b.price + b.shipping_cost)
  )[0];
}; 