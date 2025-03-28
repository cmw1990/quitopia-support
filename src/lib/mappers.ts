import { NicotineProduct as ApiNicotineProduct } from "../api/apiCompatibility";
import { NicotineProduct as CompatNicotineProduct } from "../api/apiCompatibility";
import { NRTProduct } from "../components/NRTDirectory/nrt-types";

/**
 * Maps a NicotineProduct from the API to the richer NRTProduct type
 * used by the NRT Directory components
 */
export const mapToNRTProduct = (product: ApiNicotineProduct | CompatNicotineProduct): NRTProduct => {
  // Create a default variant based on product details
  const defaultVariant = {
    id: `${product.id}-default`,
    name: product.name,
    price: (product as any).price_range ? (product as any).price_range[0] || 0 : 0,
    nicotineStrength: product.nicotine_strength,
    inStock: true
  };

  // Create a mapped NRT product with enhanced metadata
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    // Cast to NRTCategory safely
    category: ((product as any).category || 'all') as any,
    description: product.description || '',
    // Map relevant properties with fallbacks
    rating: (product as any).average_rating || 0,
    // The reviews property is now optional in NRTProduct type
    reviews: (product as any).total_reviews || 0,
    features: [
      `${product.nicotine_strength}mg nicotine`,
      (product as any).nicotine_type ? `${(product as any).nicotine_type} nicotine` : '',
      (product as any).subcategory || ''
    ].filter(Boolean),
    priceRange: {
      min: (product as any).price_range ? (product as any).price_range[0] || 0 : 0,
      max: (product as any).price_range ? (product as any).price_range[1] || 0 : 0
    },
    nicotineContent: `${product.nicotine_strength}mg`,
    effectivenessTime: {
      min: 5,
      max: 30
    },
    effectivenessRating: 4,
    strength: Math.min(Math.ceil(product.nicotine_strength / 5), 5) as 1 | 2 | 3 | 4 | 5,
    sideEffects: (product as any).warnings ? (product as any).warnings.map((w: string) => ({
      name: w,
      description: `Possible side effect: ${w}`,
      frequency: 'common',
      severity: 'mild'
    })) : [],
    usageInstructions: [
      { step: 1, instruction: `Use as directed by manufacturer` },
      { step: 2, instruction: `Contains ${product.nicotine_strength}mg of nicotine` },
    ],
    bestFor: (product as any).flavors ? [(product as any).flavors[0] || 'Regular users'] : ['Regular users'],
    notRecommendedFor: ['Pregnant women', 'People with heart conditions'],
    imageUrl: product.image_url || `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`,
    affiliateLink: `https://example.com/buy/${product.id}`,
    availability: 'over-the-counter',
    // Add required fields for compatibility with ProductDetails component
    type: (product as any).type || (product as any).category || 'unknown',
    image: product.image_url || `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`,
    variants: [defaultVariant]
  };
};

/**
 * Utility function to ensure NicotineProduct objects have a consistent structure
 * This fixes compatibility issues between different API types
 */
export function ensureProductCompatibility(product: CompatNicotineProduct | ApiNicotineProduct): ApiNicotineProduct {
  // Create a compatible product object
  return {
    ...product as any, // Use any to bypass type checking during merge
    // Add missing fields if they don't exist
    type: (product as any).type || (product as any).category || 'unknown',
    price: (product as any).price || 
           ((product as any).price_range ? (product as any).price_range[0] : 0),
    created_at: (product as any).created_at || new Date().toISOString(),
    updated_at: (product as any).updated_at || new Date().toISOString(),
    // Ensure category exists for components that expect it
    category: (product as any).category || (product as any).type || 'unknown'
  } as ApiNicotineProduct;
}

/**
 * Apply compatibility to an array of products
 */
export function ensureProductsCompatibility(
  products: (CompatNicotineProduct | ApiNicotineProduct)[]
): ApiNicotineProduct[] {
  return products.map(ensureProductCompatibility);
}
