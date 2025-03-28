import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ProductFilters as ProductFiltersType 
} from "@/components/ui/product-filters";
import { 
  ProductSorting, 
  SortOption 
} from "@/components/ui/product-sorting";
import { 
  SmokelessProductCard, 
  SmokelessProduct,
  ProductCategory,
  ProductStrength
} from "@/components/ui/smokeless-product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { 
  LayoutGrid, 
  List, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  PackageX,
  Star,
  ShoppingBag,
  MapPin,
  Repeat,
  DollarSign,
  Gift,
  ExternalLink
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { WebToolsHeader } from "@/components/ui/web-tools-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import {
  Loader2
} from "lucide-react";
import {
  useAuth
} from '../contexts/AuthContext';
import { Vendor, SmokelessProduct as ApiSmokelessProduct } from '../api/missionFreshApiClient';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import { AlertCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { 
  trackAffiliateClick,
  trackAffiliateImpressions as trackAffProducts,
  EnhancedSmokelessProduct
} from '@/utils/affiliateTracking';
import { toast } from "@/components/ui/use-toast";

// Mock data for products (this would come from an API in a real app)
const MOCK_PRODUCTS: EnhancedSmokelessProduct[] = [
  {
    id: "1",
    name: "Zyn Cool Mint",
    brand: "ZYN",
    category: "nicotine_pouch",
    strength: "medium",
    nicotineContent: 6,
    flavors: ["Mint"],
    image: "https://placehold.co/300x200",
    imageUrl: "https://placehold.co/300x200",
    price: 4.99,
    currency: "USD",
    rating: 4.5,
    reviewCount: 120,
    description: "Refreshing mint flavor with a smooth delivery system. Perfect for on-the-go use with a discreet design.",
    highlights: [
      "Discreet white pouches",
      "Refreshing mint flavor",
      "Tobacco-free",
      "30 pouches per can"
    ],
    concerns: [
      "May cause gum irritation"
    ],
    inStock: true,
    stockStatus: "in_stock",
    isNatural: false,
    isNew: false,
    vendor_id: "v001",
    vendor: { id: "v001", name: "NicoDirect" },
    country_availability: ["US", "UK", "CA", "SE"],
    countryAvailability: ["US", "UK", "CA", "SE"],
    tags: ["mint", "pouch", "popular"],
    url: "https://example.com/zyn-mint",
    nicotineUnit: "mg",
    affiliateUrl: "https://example.com/affiliate/zyn-mint",
    isAffiliate: true,
    affiliateDiscount: "10%"
  },
  {
    id: "2",
    name: "On! Wintergreen",
    brand: "On!",
    category: "nicotine_pouch",
    strength: "high",
    nicotineContent: 8,
    flavors: ["Wintergreen"],
    image: "https://placehold.co/300x200",
    imageUrl: "https://placehold.co/300x200",
    price: 3.99,
    currency: "USD",
    rating: 4.2,
    reviewCount: 89,
    description: "Strong wintergreen flavor with a higher nicotine content for those seeking a more intense experience.",
    highlights: [
      "Small discrete pouches",
      "Bold wintergreen flavor",
      "20 pouches per can"
    ],
    concerns: [
      "High nicotine content may be too strong for beginners"
    ],
    inStock: true,
    stockStatus: "in_stock",
    isNatural: false,
    isNew: false,
    vendor_id: "v002",
    vendor: { id: "v002", name: "EuroNicotine" },
    country_availability: ["UK"],
    countryAvailability: ["UK"],
    tags: ["wintergreen", "pouch", "strong"],
    url: "https://example.com/on-wintergreen",
    nicotineUnit: "mg",
    isAffiliate: false
  }
];

// Add mock vendors
const MOCK_VENDORS: Vendor[] = [
  {
    id: "v001",
    name: "NicoDirect",
    website: "https://www.nicodirect.com",
    countries: ["US", "CA"],
    shipping_times: { US: "2-3 days", CA: "3-5 days" },
    has_subscription: true,
    rating: 4.7,
    price_comparison: "competitive"
  },
  {
    id: "v002",
    name: "EuroNicotine",
    website: "https://www.euronicotine.eu",
    countries: ["UK", "DE", "FR", "IT", "ES"],
    shipping_times: { UK: "1-2 days", DE: "2-3 days", FR: "2-4 days" },
    has_subscription: true,
    rating: 4.5,
    price_comparison: "premium"
  }
];

// Product view options
type ViewMode = "grid" | "list";

// Define our interface for filters
interface ProductFilters {
  category: string;
  priceRange: [number, number];
  sortBy: string;
  country: string;
  showAffiliateOnly: boolean;
}

// Function to filter products based on filters
const filterProducts = (products: EnhancedSmokelessProduct[], filters: ProductFilters): EnhancedSmokelessProduct[] => {
  return products.filter(product => {
    // Filter by category
    if (filters.category && filters.category !== "all" && product.category !== filters.category) {
      return false;
    }
    
    // Filter by price range
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    // Filter by country
    if (filters.country && filters.country !== "all") {
      const availableCountries = product.countryAvailability || product.country_availability || [];
      if (!availableCountries.includes(filters.country)) {
        return false;
      }
    }
    
    // Filter for affiliate products only
    if (filters.showAffiliateOnly && !product.isAffiliate) {
      return false;
    }
    
    return true;
  });
};

// Function to sort products
const sortProducts = (products: EnhancedSmokelessProduct[], sortOption: SortOption): EnhancedSmokelessProduct[] => {
  const sortedProducts = [...products];
  
  switch (sortOption) {
    case "name_asc":
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    case "price_asc":
      return sortedProducts.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sortedProducts.sort((a, b) => b.price - a.price);
    case "rating_desc":
      return sortedProducts.sort((a, b) => b.rating - a.rating);
    case "rating_asc":
      return sortedProducts.sort((a, b) => a.rating - b.rating);
    case "popularity_desc":
      return sortedProducts.sort((a, b) => b.reviewCount - a.reviewCount);
    case "newest":
      return sortedProducts.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
    default:
      return sortedProducts;
  }
};

// Function to search products
const searchProducts = (products: EnhancedSmokelessProduct[], searchQuery: string): EnhancedSmokelessProduct[] => {
  if (!searchQuery) return products;
  
  const query = searchQuery.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.brand.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query) ||
    product.flavors.some(flavor => flavor.toLowerCase().includes(query))
  );
};

// Type conversion helper functions to handle API to component type conversions
const convertApiToComponentProduct = (apiProduct: any): any => ({
  ...apiProduct,
  category: apiProduct.category,
  strength: apiProduct.strength,
  // Ensure all required fields are present
  flavors: apiProduct.flavors || [],
  highlights: apiProduct.highlights || [],
  concerns: apiProduct.concerns || [],
  country_availability: apiProduct.country_availability || [],
  isAffiliate: apiProduct.is_affiliate || false,
  affiliateDiscount: apiProduct.affiliate_discount || undefined,
  affiliateUrl: apiProduct.affiliate_url || undefined
});

const convertApiToComponentVendor = (apiVendor: any): Vendor => ({
  ...apiVendor,
  website: apiVendor.website || '',
  countries: apiVendor.countries || [],
  shipping_times: apiVendor.shipping_times || {},
  has_subscription: apiVendor.has_subscription || false,
  price_comparison: apiVendor.price_comparison || 'competitive'
});

// Track impressions for affiliate products when they come into view
const TrackableProductCard = ({ 
  product, 
  layout, 
  onClick 
}: { 
  product: EnhancedSmokelessProduct, 
  layout: "grid" | "list",
  onClick: (product: EnhancedSmokelessProduct) => void
}) => {
  const { session } = useAuth();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });
  
  useEffect(() => {
    if (inView && product.isAffiliate && session) {
      // Use trackAffiliateClick with proper parameters
      trackAffiliateClick(product, {
        position: 0,
        list: 'Product Directory',
        referrer: window.location.pathname
      });
    }
  }, [inView, product, session]);
  
  return (
    <div ref={ref}>
      <SmokelessProductCard 
        product={product} 
        layout={layout} 
        onClick={() => onClick(product)} 
      />
    </div>
  );
};

// Special Offer Banner for Affiliate Products
const AffiliateOfferBanner: React.FC = () => {
  return (
    <Alert className="bg-amber-50 border-amber-200 mb-6">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Special Partner Offers</AlertTitle>
      <AlertDescription className="text-amber-700">
        Look for the <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 ml-1 mr-1"><ShoppingBag className="h-3 w-3 inline mr-1" />Partner</Badge> badge to find exclusive discounts on our partner products.
      </AlertDescription>
    </Alert>
  );
};

export default function SmokelessProductsDirectory() {
  // Get auth context for session
  const { session } = useAuth();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({
    category: 'all',
    priceRange: [0, 200],
    sortBy: 'popularity',
    country: 'all',
    showAffiliateOnly: false,
  });
  const [sortOption, setSortOption] = useState<SortOption>("popularity_desc");
  const [products, setProducts] = useState<EnhancedSmokelessProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnhancedSmokelessProduct[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Navigation and URL params
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Constants
  const ITEMS_PER_PAGE = 12;
  
  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await authenticatedRestCall<ApiSmokelessProduct[]>(
        '/rest/v1/smokeless_products',
        {
          method: 'GET',
          headers: {
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (result.error) {
        throw new Error(String(result.error));
      }
      
      const productsData = result.data || [];
      const enhancedProducts = productsData.map(convertApiToComponentProduct);
      setProducts(enhancedProducts);
      setTotalProducts(enhancedProducts.length);
      
      // Track affiliate product impressions
      const affiliateProducts = enhancedProducts.filter(p => p.isAffiliate);
      if (affiliateProducts.length > 0) {
        // Use the properly imported function with correct parameters
        trackAffProducts(affiliateProducts, 'Product Directory');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // On initial load, get query params and fetch products
  useEffect(() => {
    // Read search params and update state
    const querySearch = searchParams.get("q") || "";
    setSearchQuery(querySearch);
    
    const querySort = searchParams.get("sort") as SortOption;
    if (querySort) setSortOption(querySort);
    
    const queryView = searchParams.get("view") as ViewMode;
    if (queryView) setViewMode(queryView);
    
    const queryPage = parseInt(searchParams.get("page") || "1");
    setCurrentPage(queryPage);
    
    // Get country filter
    const queryCountry = searchParams.get("country") || "";
    if (queryCountry) {
      setFilters(prev => ({
        ...prev,
        country: queryCountry
      }));
    }
    
    // Fetch products
    fetchProducts();
  }, []);
  
  // Update filtered products when filters, search, or sort changes
  useEffect(() => {
    let result = [...products];
    
    // Apply search
    if (searchQuery) {
      result = searchProducts(result, searchQuery);
    }
    
    // Apply filters
    result = filterProducts(result, filters);
    
    // Apply sorting
    result = sortProducts(result, sortOption);
    
    setFilteredProducts(result);
    // Don't reset to first page immediately to avoid jarring UX when filtering
    if (result.length < (currentPage - 1) * ITEMS_PER_PAGE) {
      setCurrentPage(1); // Reset if current page would be empty
    }
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    params.set("sort", sortOption);
    params.set("view", viewMode);
    params.set("page", currentPage.toString());
    if (filters.country) params.set("country", filters.country);
    setSearchParams(params, { replace: true });
  }, [filters, searchQuery, sortOption, products]);
  
  // Fetch products when search query changes significantly
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce search
    
    return () => clearTimeout(handler);
  }, [searchQuery, filters.country]);
  
  // Get unique countries from vendors for dropdown
  const availableCountries = useMemo(() => {
    const countrySet = new Set<string>();
    vendors.forEach(vendor => {
      vendor.countries.forEach(country => countrySet.add(country));
    });
    return Array.from(countrySet).sort();
  }, [vendors]);
  
  // Render vendor info for a product
  const renderVendorInfo = (product: EnhancedSmokelessProduct) => {
    const vendor = vendors.find(v => v.id === product.vendor_id);
    
    if (!vendor) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{vendor.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="text-sm">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mb-3">
          {vendor.countries.includes("US") && (
            <div className="flex items-center mb-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>Ships to US</span>
              {vendor.shipping_times && vendor.shipping_times["US"] && (
                <span className="ml-1">({vendor.shipping_times["US"]})</span>
              )}
            </div>
          )}
          
          {vendor.has_subscription && (
            <div className="flex items-center mb-1">
              <Repeat className="h-3.5 w-3.5 mr-1" />
              <span>Subscription available</span>
            </div>
          )}
          
          <div className="flex items-center">
            <DollarSign className="h-3.5 w-3.5 mr-1" />
            <span>
              {vendor.price_comparison === "discount" && "Discount pricing"}
              {vendor.price_comparison === "competitive" && "Competitive pricing"}
              {vendor.price_comparison === "premium" && "Premium pricing"}
            </span>
          </div>
        </div>
        
        {product.isAffiliate && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
            <div className="font-medium text-amber-800 mb-1 flex items-center">
              <Gift className="h-4 w-4 mr-1" />
              Exclusive Partner Offer
            </div>
            {product.affiliateDiscount && (
              <div className="text-amber-700">
                Save {product.affiliateDiscount} on your purchase through our partner link.
              </div>
            )}
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
          onClick={(e) => {
            e.stopPropagation();
            window.open(vendor.website, '_blank');
          }}
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          Visit Vendor Website
        </Button>
      </div>
    );
  };
  
  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-8">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)} 
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show first page, last page, current page, and pages around current
            let pageToShow: number | null = null;
            
            if (i === 0) {
              pageToShow = 1;
            } else if (i === 1 && currentPage > 3) {
              return (
                <PaginationItem key="ellipsis-start">
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else if (i === 3 && currentPage < totalPages - 2) {
              return (
                <PaginationItem key="ellipsis-end">
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else if (i === 4) {
              pageToShow = totalPages;
            } else if (totalPages <= 5) {
              pageToShow = i + 1;
            } else if (currentPage <= 3) {
              pageToShow = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageToShow = totalPages - 4 + i;
            } else {
              pageToShow = currentPage - 1 + i - 1;
            }
            
            if (pageToShow === null) return null;
            
            return (
              <PaginationItem key={pageToShow}>
                <PaginationLink
                  isActive={pageToShow === currentPage}
                  onClick={() => handlePageChange(pageToShow as number)}
                  className="cursor-pointer"
                >
                  {pageToShow}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)} 
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };
  
  // Handle product click to view detail or visit affiliate link
  const handleProductClick = (product: EnhancedSmokelessProduct) => {
    if (product.isAffiliate && product.affiliateUrl) {
      // Don't navigate, the product card will handle the affiliate link click
      return;
    }
    
    // Navigate to product detail page
    navigate(`/product/${product.id}`);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handle sort option change
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Fix the errant catch block by completing the try block properly
  const fetchRelatedProducts = async (product: EnhancedSmokelessProduct) => {
    try {
      // Fetch products related to the current product
      const response = await authenticatedRestCall<EnhancedSmokelessProduct[]>(
        `/rest/v1/smokeless_products?category=eq.${product.category}&id=neq.${product.id}&limit=4`,
        {
          method: 'GET',
          headers: {
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (response.error) {
        console.error('Error fetching related products:', response.error);
        return MOCK_PRODUCTS.slice(0, 4); // Return mock data as fallback
      }
      
      return response.data || [];
    } catch (err) {
      console.error("Failed to fetch related products:", err);
      return MOCK_PRODUCTS.slice(0, 4); // Return mock data as fallback
    }
  };

  return (
    <>
      <Helmet>
        <title>Smokeless Nicotine Products Directory | Mission Fresh</title>
        <meta name="description" content="Comprehensive directory of smokeless nicotine products including pouches, gum, patches, and more. Find the right product to help you quit smoking." />
      </Helmet>
      
      <WebToolsHeader 
        title="Smokeless Nicotine Product Directory"
        description="Find the perfect nicotine replacement product to help you quit smoking"
      />
      
      <div className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/web-tools">Web Tools</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Smokeless Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Smokeless Nicotine Products</h1>
            <p className="text-muted-foreground max-w-2xl">
              Browse our comprehensive directory of smokeless nicotine products to find the perfect 
              alternative to cigarettes. Compare options, read ratings, and discover what works best 
              for your quit journey.
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="mr-2">
                {filteredProducts.length} Products
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Our directory is regularly updated with new products and honest ratings. 
                      Products are rated based on user experiences and expert evaluations.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" size="icon" className="ml-2">
                <Search className="h-4 w-4" />
              </Button>
              {searchQuery && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="ml-1"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>
        </div>
        
        {/* Affiliate Offer Banner */}
        <AffiliateOfferBanner />
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Filters sidebar */}
          <Card className="lg:sticky top-24 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filter Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Country filter */}
              <div className="space-y-2">
                <Label htmlFor="country-filter">Ship to Country</Label>
                <Select 
                  value={filters.country} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger id="country-filter">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Countries</SelectItem>
                    {availableCountries.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Affiliate Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="affiliate-only"
                  checked={filters.showAffiliateOnly}
                  onCheckedChange={(checked) => {
                    setFilters({
                      ...filters,
                      showAffiliateOnly: !!checked
                    });
                  }}
                />
                <Label htmlFor="affiliate-only" className="cursor-pointer flex items-center">
                  <ShoppingBag className="w-4 h-4 mr-2 text-amber-500" />
                  <span>Show partner offers only</span>
                </Label>
              </div>
              
              {/* Clear filters button */}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => setFilters({
                  category: "all",
                  priceRange: [0, 100],
                  sortBy: "popularity",
                  country: "all",
                  showAffiliateOnly: false
                })}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
          
          {/* Products grid */}
          <div className="lg:col-span-3">
            {/* Sorting and View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <ProductSorting 
                onSortChange={handleSortChange}
                currentSort={sortOption}
              />
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleViewModeChange("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleViewModeChange("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search Results Summary */}
            {searchQuery && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"} for "{searchQuery}"
                </p>
              </div>
            )}
            
            {/* Results Count */}
            {!searchQuery && filteredProducts.length !== products.length && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <PackageX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search term
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      category: "all",
                      priceRange: [0, 100],
                      sortBy: "popularity",
                      country: "all",
                      showAffiliateOnly: false
                    });
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Affiliate banner if affiliate filter is on */}
                {filters.showAffiliateOnly && (
                  <Alert className="mb-6 bg-amber-50 border-amber-200">
                    <ShoppingBag className="h-4 w-4 text-amber-500" />
                    <AlertTitle className="text-amber-800">Partner Products</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      These products include special offers from our retail partners. 
                      When you purchase through these links, you support Mission Fresh at no extra cost to you.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className={viewMode === "grid" ? 
                  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : 
                  "space-y-4"
                }>
                  {paginatedProducts.map((product) => (
                    <div key={product.id}>
                      <TrackableProductCard
                        product={product}
                        layout={viewMode}
                        onClick={handleProductClick}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {renderPagination()}
          </div>
        </div>
        
        {/* Educational Section */}
        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold mb-4">Choosing the Right Smokeless Nicotine Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Understanding Product Types</h3>
              <p className="text-muted-foreground mb-4">
                Smokeless nicotine products come in various forms, each offering unique benefits:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Nicotine Pouches:</strong> Tobacco-free pouches placed between the gum and lip</li>
                <li><strong>Nicotine Gum:</strong> Chewable gum that releases nicotine when chewed</li>
                <li><strong>Patches:</strong> Adhesive patches that deliver nicotine through the skin</li>
                <li><strong>Lozenges:</strong> Tablet-like products that dissolve in the mouth</li>
                <li><strong>Inhalers:</strong> Devices that deliver nicotine when inhaled</li>
                <li><strong>Mouth Sprays:</strong> Quick-acting sprays for immediate craving relief</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Factors to Consider</h3>
              <p className="text-muted-foreground mb-4">
                When selecting a product, keep these considerations in mind:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Nicotine Strength:</strong> Match to your current smoking habits</li>
                <li><strong>Usage Pattern:</strong> Consider how and when you'll use the product</li>
                <li><strong>Flavor Preferences:</strong> Find flavors that will help you stick with it</li>
                <li><strong>Discretion:</strong> Some products are more noticeable than others</li>
                <li><strong>Cost:</strong> Consider long-term affordability</li>
                <li><strong>Side Effects:</strong> Different products have different potential side effects</li>
              </ul>
            </div>
          </div>
          
          {/* Add vendor information section */}
          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-bold mb-4">Trusted Vendor Partners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vendors.map(vendor => (
                <Card key={vendor.id} className="bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{vendor.name}</CardTitle>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{vendor.rating}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ships to: {vendor.countries.join(", ")}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <Badge variant={
                        vendor.price_comparison === "discount" ? "success" : 
                        vendor.price_comparison === "premium" ? "destructive" : 
                        "secondary"
                      }>
                        {vendor.price_comparison === "discount" ? "Best Prices" : 
                         vendor.price_comparison === "premium" ? "Premium" : 
                         "Competitive"}
                      </Badge>
                      <Button variant="outline" size="sm" className="text-xs" asChild>
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                          Visit Site
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-8 mb-16">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium">Are smokeless nicotine products safer than cigarettes?</h3>
                <p className="text-muted-foreground mt-1">
                  While no nicotine product is completely risk-free, most smokeless nicotine products are considered less harmful than cigarettes because they don't involve combustion and don't contain the numerous chemicals found in cigarette smoke.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-medium">How do I choose the right nicotine strength?</h3>
                <p className="text-muted-foreground mt-1">
                  Generally, if you smoke a pack or more per day, start with higher strength products. If you smoke less, or smoke light cigarettes, medium or lower strength may be appropriate. It's often best to start with a higher strength and gradually reduce over time.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-medium">Can smokeless nicotine products help me quit smoking?</h3>
                <p className="text-muted-foreground mt-1">
                  Yes, many products are specifically designed as nicotine replacement therapy (NRT) to help people quit smoking. They can help manage cravings and withdrawal symptoms while breaking the habit of smoking.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="usage" className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium">How long should I use nicotine pouches?</h3>
                <p className="text-muted-foreground mt-1">
                  Most pouches are designed to be used for 15-60 minutes before discarding. Follow the specific product instructions, as duration can vary by brand and strength.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-medium">How do I use nicotine gum correctly?</h3>
                <p className="text-muted-foreground mt-1">
                  Chew nicotine gum slowly until you notice a tingling sensation or peppery taste, then place it between your cheek and gum. When the sensation fades, chew again briefly and repeat the process for about 30 minutes.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-medium">Can I use multiple types of nicotine products together?</h3>
                <p className="text-muted-foreground mt-1">
                  While some cessation programs do combine products (like using a patch for baseline nicotine with gum for breakthrough cravings), you should consult with a healthcare provider before combining products to avoid nicotine overdose.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="safety" className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium">Can I become addicted to these products?</h3>
                <p className="text-muted-foreground mt-1">
                  Yes, these products contain nicotine, which is addictive. However, many are designed to gradually reduce nicotine dependency when used as part of a cessation program.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-medium">Are there side effects?</h3>
                <p className="text-muted-foreground mt-1">
                  Common side effects can include mouth or throat irritation, hiccups, nausea, and headaches. Patches may cause skin irritation. Most side effects diminish with continued use or product adjustment.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-medium">Who should avoid using smokeless nicotine products?</h3>
                <p className="text-muted-foreground mt-1">
                  These products are not recommended for pregnant women, people with cardiovascular conditions, diabetes, oral or throat conditions, or those under 18. Always consult a healthcare provider before starting any nicotine replacement therapy.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
} 