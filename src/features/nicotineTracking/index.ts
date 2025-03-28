/**
 * Mission Fresh Nicotine Tracking Feature
 * 
 * This feature provides comprehensive nicotine product tracking and management.
 * It allows users to browse, compare, add to their collection, and log consumption
 * of various nicotine products. The implementation follows the guidelines in ssot5001.
 * 
 * Key components:
 * - ProductCatalog: Browse and filter products by category, brand, etc.
 * - ProductComparisonModal: Compare up to 3 products side by side
 * - MultiProductTracker: Track usage of multiple nicotine products
 */

// Main components
export { ProductCatalog } from './ProductCatalog';
export { ProductComparisonModal } from './ProductComparisonModal';
export { MultiProductTracker } from './MultiProductTracker';

// Data and type exports
export { PRODUCT_CATEGORIES, NICOTINE_PRODUCTS } from './productData';
export type { UserProduct, ConsumptionLog, TrackingStats } from './nicotineTypes'; 