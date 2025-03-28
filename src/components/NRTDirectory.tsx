import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Button,
  Input,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Badge,
  Slider,
  Label,
  Checkbox
} from './ui';
import { 
  Search, 
  Star, 
  Filter, 
  ArrowUpDown, 
  Leaf, 
  ThumbsUp, 
  Droplets, 
  Heart, 
  ShoppingBag,
  AlertTriangle,
  ShieldCheck,
  Pill,
  Scale,
  CheckCircle2,
  CircleDollarSign,
  Globe,
  Truck,
  Bookmark,
  X,
  Check,
  ArrowLeft,
  GlobeIcon, 
  PackageIcon, 
  MapPinIcon, 
  PercentIcon, 
  ExternalLinkIcon, 
  BadgeCheckIcon, 
  CreditCardIcon,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from './ui';
import { supabaseRestCall } from "../api/apiCompatibility";

interface NRTDirectoryProps {
  session: Session | null;
}

// Enhanced interface for NRT product
interface NRTProduct {
  id: number;
  name: string;
  type: 'patch' | 'gum' | 'lozenge' | 'inhaler' | 'spray' | 'pouch' | 'toothpick';
  strengthOptions: string[];
  nicotineContent: number[]; // mg per unit
  brand: string;
  manufacturer: string;
  rating: number;
  reviews: number;
  price: string;
  pricePerDay: number; // estimated cost per day of use
  description: string;
  longDescription?: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  image: string;
  available: boolean;
  
  // Health impact information
  chemicalSafety: {
    containsPG?: boolean; // Propylene Glycol
    containsVG?: boolean; // Vegetable Glycerin
    containsSweeteners?: boolean;
    containsArtificialColors?: boolean;
    containsPreservatives?: boolean;
    chemicalsOfConcern?: string[];
    safetyRating: number; // 1-10 scale
  };
  
  // Gum health impact (for pouches and gums)
  gumHealth?: {
    pHLevel?: number; // pH level affecting gum tissue
    abrasionRisk: number; // 1-10 scale
    gumRecessionRisk: number; // 1-10 scale
    overallGumHealthRating: number; // 1-10 scale
  };
  
  // Usage information
  usage: {
    howToUse: string;
    durationOfEffect: string; // how long it lasts
    dosageRecommendation: string;
    sideEffects: string[];
    warnings: string[];
  };
  
  // Vendor information with enhanced affiliate details
  vendors: {
    name: string;
    price: number;
    url: string;
    inStock: boolean;
    shippingTime: string;
    shippingCost: number;
    countryAvailability: string[];
    discountCodes?: string;
    affiliateUrl?: string; // Affiliate link
    affiliatePercentage?: number; // Commission percentage
    affiliateCode?: string; // Affiliate code to append to URL
    bestSellingProduct?: boolean; // Is this a popular item for this vendor
    exclusiveDiscount?: boolean; // Is this an exclusive discount
  }[];
  
  // Scientific backing
  scientificBacking?: {
    clinicalStudies: boolean;
    effectivenessRating: number; // 1-10 scale
    references: string[];
  };
}

// Interface for tracking affiliate clicks
interface AffiliateClick {
  user_id?: string;
  product_id: number;
  vendor: string;
  timestamp: string;
  country: string;
  device_type: string;
  conversion_type: 'click' | 'purchase';
  discount_used?: string;
  referral_code?: string;
  campaign?: string;
  source?: string;
}

// Add a local ProductDetail component since the imported one has different props structure
const ProductDetail: React.FC<{product: NRTProduct, onBack: () => void, session: Session | null}> = ({ 
  product, 
  onBack,
  session
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('United States');
  const [selectedVendorTab, setSelectedVendorTab] = useState<string>('all');
  const [affiliateTracking, setAffiliateTracking] = useState<{status: string, lastTracked: Date | null}>({
    status: 'ready',
    lastTracked: null
  });
  
  // Filter vendors by availability in selected country
  const availableVendors = product.vendors.filter(vendor => 
    vendor.countryAvailability.includes(selectedCountry) || 
    vendor.countryAvailability.includes('Worldwide')
  );
  
  // Sort vendors by price (lowest first)
  const sortedVendors = [...availableVendors].sort((a, b) => a.price - b.price);
  
  // Get best deal (lowest price)
  const bestDeal = sortedVendors.length > 0 ? sortedVendors[0] : null;
  
  // Group vendors by shipping time
  const fastShipping = sortedVendors.filter(v => 
    v.shippingTime.includes('1-2') || 
    v.shippingTime.includes('Same day') ||
    v.shippingTime.includes('Next day')
  );
  
  // Vendors with free shipping
  const freeShipping = sortedVendors.filter(v => v.shippingCost === 0);
  
  // Vendors with exclusive discounts for our users
  const exclusiveDiscounts = sortedVendors.filter(v => v.exclusiveDiscount === true);

  // Track affiliate link clicks with enhanced analytics
  const trackAffiliateClick = async (vendor: typeof product.vendors[0]) => {
    try {
      setAffiliateTracking({
        status: 'tracking',
        lastTracked: new Date()
      });
      
      // Get device type
      const deviceType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        ? 'mobile'
        : 'desktop';
      
      // Get referral source
      const urlParams = new URLSearchParams(window.location.search);
      const referralSource = urlParams.get('source') || 'direct';
      const campaign = urlParams.get('campaign') || 'none';
      
      // Create affiliate click tracking record with enhanced data
      const clickData: AffiliateClick = {
        user_id: session?.user?.id,
        product_id: product.id,
        vendor: vendor.name,
        timestamp: new Date().toISOString(),
        country: selectedCountry,
        device_type: deviceType,
        conversion_type: 'click',
        discount_used: vendor.discountCodes,
        referral_code: vendor.affiliateCode,
        campaign: campaign,
        source: referralSource
      };
      
      // Track anonymously if not logged in
      const endpoint = `/rest/v1/mission4_affiliate_clicks`;
      await supabaseRestCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(clickData)
      }, session);
      
      setAffiliateTracking({
        status: 'success',
        lastTracked: new Date()
      });
      
      console.log('Affiliate click tracked successfully');
      
      // If we have analytics configured, track this as an event
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'affiliate_click', {
          'product_id': product.id,
          'product_name': product.name,
          'vendor': vendor.name,
          'price': vendor.price,
          'country': selectedCountry,
          'discount_applied': !!vendor.discountCodes
        });
      }
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      setAffiliateTracking({
        status: 'error',
        lastTracked: new Date()
      });
      // Continue even if tracking fails
    }
  };
  
  // Generate the correct affiliate URL with improved handling
  const getAffiliateUrl = (vendor: typeof product.vendors[0]) => {
    // Use explicit affiliate URL if provided
    if (vendor.affiliateUrl) {
      return vendor.affiliateUrl;
    }
    
    // Otherwise, construct from base URL and affiliate code
    if (vendor.url && vendor.affiliateCode) {
      // Check if URL already has parameters
      const hasParams = vendor.url.includes('?');
      const connector = hasParams ? '&' : '?';
      
      // Add any UTM parameters for better tracking
      const utmParams = `utm_source=mission_fresh&utm_medium=affiliate&utm_campaign=nrt_directory`;
      
      return `${vendor.url}${connector}ref=${vendor.affiliateCode}&${utmParams}`;
    }
    
    // Fallback to regular URL if no affiliate information
    return vendor.url;
  };
  
  // Handle vendor link click with improved analytics
  const handleVendorClick = (vendor: typeof product.vendors[0]) => {
    // Track the click
    trackAffiliateClick(vendor);
    
    // Get the affiliate URL
    const url = getAffiliateUrl(vendor);
    
    // Show success message
    toast.success(`Opening ${vendor.name} in a new tab`);
    
    // If this is an exclusive discount, show a special message
    if (vendor.exclusiveDiscount) {
      toast.success(`Exclusive discount applied: ${vendor.discountCodes}`, {
        duration: 6000
      });
    }
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const renderVendorTab = (vendors: typeof sortedVendors) => (
    <div className="space-y-4">
      {vendors.length === 0 ? (
        <div className="text-center py-8">
          <PackageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-muted-foreground">No vendors available with these criteria</p>
        </div>
      ) : (
        vendors.map((vendor, idx) => (
          <div 
            key={`${vendor.name}-${idx}`} 
            className={`p-4 border rounded-lg flex flex-col md:flex-row justify-between transition-colors ${
              vendor === bestDeal ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'hover:bg-muted/30'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h4 className="font-medium">{vendor.name}</h4>
                {vendor === bestDeal && (
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-none">
                    Best Deal
                  </Badge>
                )}
                {vendor.bestSellingProduct && (
                  <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-none">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {vendor.inStock ? (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    Limited Stock
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-muted-foreground mr-1" />
                  <span>{vendor.shippingTime}</span>
                </div>
                <div className="flex items-center">
                  <CircleDollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                  <span>
                    {vendor.shippingCost === 0 
                      ? 'Free shipping' 
                      : `$${vendor.shippingCost.toFixed(2)} shipping`
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <GlobeIcon className="h-4 w-4 text-muted-foreground mr-1" />
                  <span>
                    {vendor.countryAvailability.includes('Worldwide') 
                      ? 'Ships worldwide' 
                      : `Ships to ${vendor.countryAvailability.length} countries`
                    }
                  </span>
                </div>
              </div>
              
              {vendor.discountCodes && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <PercentIcon className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {vendor.exclusiveDiscount ? 'Exclusive discount' : 'Discount'} code: 
                      <span className="font-mono font-medium ml-1">{vendor.discountCodes}</span>
                    </span>
                  </div>
                </div>
              )}
              
              {vendor.affiliatePercentage && (
                <div className="mt-1 text-xs text-muted-foreground">
                  <span>Supports Mission Fresh ({vendor.affiliatePercentage}% goes to our research)</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end justify-between">
              <div className="text-right">
                <div className="text-2xl font-bold">${vendor.price.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  ${(vendor.price / 30).toFixed(2)} per day
                </div>
              </div>
              
              <Button
                onClick={() => handleVendorClick(vendor)}
                className="mt-2 flex items-center bg-indigo-600 hover:bg-indigo-700 text-white transition-colors w-full"
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                <span>Visit Store</span>
                <ExternalLinkIcon className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Add the vendor comparison section
  const renderVendorSection = () => (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <CardTitle>Where to Buy</CardTitle>
            <CardDescription>
              Compare prices and shipping options from verified vendors
            </CardDescription>
          </div>
          <div className="mt-2 sm:mt-0">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Italy">Italy</SelectItem>
                <SelectItem value="Spain">Spain</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="South Korea">South Korea</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {product.vendors.length === 0 ? (
          <div className="text-center py-10 bg-muted/10 rounded-lg">
            <PackageIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No vendor information available</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We're working on adding vendor data for this product.
            </p>
          </div>
        ) : (
          <Tabs value={selectedVendorTab} onValueChange={setSelectedVendorTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All Vendors ({sortedVendors.length})</TabsTrigger>
              <TabsTrigger value="best-price">Best Price</TabsTrigger>
              <TabsTrigger value="fast-shipping">Fast Shipping ({fastShipping.length})</TabsTrigger>
              <TabsTrigger value="free-shipping">Free Shipping ({freeShipping.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {renderVendorTab(sortedVendors)}
            </TabsContent>
            
            <TabsContent value="best-price" className="mt-4">
              {renderVendorTab(bestDeal ? [bestDeal] : [])}
            </TabsContent>
            
            <TabsContent value="fast-shipping" className="mt-4">
              {renderVendorTab(fastShipping)}
            </TabsContent>
            
            <TabsContent value="free-shipping" className="mt-4">
              {renderVendorTab(freeShipping)}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="bg-muted/10 text-xs text-muted-foreground flex justify-between items-center">
        <div className="flex items-center">
          <BadgeCheckIcon className="h-3.5 w-3.5 text-blue-500 mr-1" />
          <span>All vendors verified by Mission Fresh</span>
        </div>
        <div>
          <button 
            className="underline hover:text-foreground"
            onClick={() => toast.info("Report feature will be available soon")}
          >
            Report an issue
          </button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> 
        Back to Directory
      </Button>
      
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className={`bg-${product.type === 'patch' ? 'blue' : product.type === 'gum' ? 'green' : product.type === 'lozenge' ? 'purple' : product.type === 'inhaler' ? 'yellow' : product.type === 'spray' ? 'red' : product.type === 'pouch' ? 'orange' : 'teal'}-50 text-${product.type === 'patch' ? 'blue' : product.type === 'gum' ? 'green' : product.type === 'lozenge' ? 'purple' : product.type === 'inhaler' ? 'yellow' : product.type === 'spray' ? 'red' : product.type === 'pouch' ? 'orange' : 'teal'}-700 border-${product.type === 'patch' ? 'blue' : product.type === 'gum' ? 'green' : product.type === 'lozenge' ? 'purple' : product.type === 'inhaler' ? 'yellow' : product.type === 'spray' ? 'red' : product.type === 'pouch' ? 'orange' : 'teal'}-200`}>
                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{product.brand}</span>
                </div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
              </div>
              <div className="text-2xl font-bold">{product.price}</div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= product.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : star - 0.5 <= product.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews.toLocaleString()} reviews)
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="health">Health Impact</TabsTrigger>
                <TabsTrigger value="science">Science</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <div>
                  <h4 className="font-medium mb-2">Available Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.strengthOptions.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Key Information</h4>
                  <p className="text-sm text-muted-foreground">
                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)} with {product.nicotineContent.join(', ')} mg nicotine options
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <h4 className="font-medium">Price Per Day</h4>
                    <p className="text-sm text-muted-foreground">${product.pricePerDay.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Availability</h4>
                    <p className="text-sm text-muted-foreground">{product.available ? 'In Stock' : 'Out of Stock'}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="usage" className="space-y-4 pt-4">
                <div>
                  <h4 className="font-medium mb-2">How to Use</h4>
                  <p className="text-sm text-muted-foreground">{product.usage?.howToUse}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Duration of Effect</h4>
                  <p className="text-sm text-muted-foreground">{product.usage?.durationOfEffect}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Dosage Recommendations</h4>
                  <p className="text-sm text-muted-foreground">{product.usage?.dosageRecommendation}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Side Effects & Warnings</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {product.usage?.sideEffects.map((effect, idx) => (
                      <li key={idx}>{effect}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="health" className="space-y-4 pt-4">
                <div>
                  <h4 className="font-medium mb-2">Chemical Safety</h4>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Safety Rating:</strong> {product.chemicalSafety.safetyRating}/10
                    </p>
                    <p>
                      <strong>Propylene Glycol:</strong> {product.chemicalSafety.containsPG ? 'Present' : 'Not Present'}
                    </p>
                    <p>
                      <strong>Vegetable Glycerin:</strong> {product.chemicalSafety.containsVG ? 'Present' : 'Not Present'}
                    </p>
                    <p>
                      <strong>Artificial Colors:</strong> {product.chemicalSafety.containsArtificialColors ? 'Present' : 'Not Present'}
                    </p>
                    {product.chemicalSafety.chemicalsOfConcern && product.chemicalSafety.chemicalsOfConcern.length > 0 && (
                      <p>
                        <strong>Chemicals of Concern:</strong> {product.chemicalSafety.chemicalsOfConcern.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                
                {product.gumHealth && (
                  <div>
                    <h4 className="font-medium mb-2">Gum Health Impact</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        <strong>pH Level:</strong> {product.gumHealth.pHLevel}
                      </p>
                      <p>
                        <strong>Abrasion Risk:</strong> {product.gumHealth.abrasionRisk}/10
                      </p>
                      <p>
                        <strong>Gum Recession Risk:</strong> {product.gumHealth.gumRecessionRisk}/10
                      </p>
                      <p>
                        <strong>Overall Gum Health Rating:</strong> {product.gumHealth.overallGumHealthRating}/10
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="science" className="space-y-4 pt-4">
                <div>
                  <h4 className="font-medium mb-2">Clinical Studies</h4>
                  <p className="text-sm text-muted-foreground">
                    {product.scientificBacking?.clinicalStudies ? 'Backed by clinical studies' : 'Limited clinical research available'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Effectiveness</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Craving Reduction</p>
                      <div className="h-2 bg-gray-200 rounded-full mt-1">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(product.scientificBacking?.effectivenessRating || 0) * 10}%` }}></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-muted-foreground">
                        {product.scientificBacking?.effectivenessRating}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Withdrawal Management</p>
                      <div className="h-2 bg-gray-200 rounded-full mt-1">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(product.scientificBacking?.effectivenessRating || 0) * 10}%` }}></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-muted-foreground">
                        {product.scientificBacking?.effectivenessRating}/10
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">References</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {product.scientificBacking?.references.map((ref, idx) => (
                      <li key={idx}>{ref}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="w-full md:w-72 space-y-6">
          {renderVendorSection()}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pros & Cons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 flex items-center mb-2">
                  <Heart className="h-4 w-4 mr-2" /> Pros
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {product.pros.map((pro, idx) => (
                    <li key={idx}>{pro}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-red-600 flex items-center mb-2">
                  <X className="h-4 w-4 mr-2" /> Cons
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {product.cons.map((con, idx) => (
                    <li key={idx}>{con}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium flex items-center mb-2">
                  <Check className="h-4 w-4 mr-2" /> Best For
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {product.bestFor.map((best, idx) => (
                    <li key={idx}>{best}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const NRTDirectory: React.FC<NRTDirectoryProps> = ({ session }) => {
  const [allProducts, setAllProducts] = useState<NRTProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<NRTProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productType, setProductType] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('United States');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [nicotineStrengthRange, setNicotineStrengthRange] = useState<[number, number]>([0, 50]);
  const [safetyRatingRange, setSafetyRatingRange] = useState<[number, number]>([0, 10]);
  const [gumHealthRatingRange, setGumHealthRatingRange] = useState<[number, number]>([0, 10]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'price-asc' | 'price-desc' | 'rating-desc' | 'safety-desc'>('rating-desc');
  const [showExclusiveDeals, setShowExclusiveDeals] = useState(false);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showFreeShippingOnly, setShowFreeShippingOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Current tab
  const [activeTab, setActiveTab] = useState<string>('products');

  // Sample NRT products data
  const nrtProducts: NRTProduct[] = [
    {
      id: 1,
      name: 'NicoDerm CQ Patch',
      type: 'patch',
      strengthOptions: ['21mg', '14mg', '7mg'],
      nicotineContent: [21, 14, 7],
      brand: 'NicoDerm',
      manufacturer: 'NicoDerm',
      rating: 4.5,
      reviews: 1253,
      price: '$42.99',
      pricePerDay: 1.43,
      description: 'Clear patches that deliver a steady flow of nicotine throughout the day to help reduce cravings and withdrawal symptoms.',
      pros: ['24-hour relief', 'Once-a-day application', 'Nearly invisible under clothing'],
      cons: ['Skin irritation for some users', 'Cannot adjust dosage during the day'],
      bestFor: ['Heavy smokers starting to quit', 'People who want all-day coverage'],
      image: 'https://via.placeholder.com/150',
      available: true,
      chemicalSafety: {
        safetyRating: 9
      },
      usage: {
        howToUse: 'Apply one patch to your arm or chest',
        durationOfEffect: '24 hours',
        dosageRecommendation: 'Once a day',
        sideEffects: [],
        warnings: []
      },
      vendors: [
        {
          name: 'NicoDerm',
          price: 42.99,
          url: 'https://www.nicoderm.com',
          inStock: true,
          shippingTime: '2-3 business days',
          shippingCost: 5.99,
          countryAvailability: ['USA'],
          discountCodes: 'NICODEMSAVE'
        }
      ],
      scientificBacking: {
        clinicalStudies: true,
        effectivenessRating: 9,
        references: ['Clinical study 1', 'Clinical study 2']
      }
    },
    {
      id: 2,
      name: 'Nicorette Gum',
      type: 'gum',
      strengthOptions: ['4mg', '2mg'],
      nicotineContent: [4, 2],
      brand: 'Nicorette',
      manufacturer: 'Nicorette',
      rating: 4.3,
      reviews: 982,
      price: '$38.99',
      pricePerDay: 1.29,
      description: 'Chewing gum that releases nicotine to help reduce cravings and withdrawal symptoms when you feel the urge to smoke.',
      pros: ['Rapid relief of cravings', 'Can control when to use it', 'Various flavors available'],
      cons: ['Proper chewing technique required', 'May cause jaw soreness', 'Short duration of effect'],
      bestFor: ['Situational smokers', 'People who need quick relief'],
      image: 'https://via.placeholder.com/150',
      available: true,
      chemicalSafety: {
        safetyRating: 8
      },
      usage: {
        howToUse: 'Chew one piece of gum every 15 minutes',
        durationOfEffect: '1-2 hours',
        dosageRecommendation: 'As needed',
        sideEffects: [],
        warnings: []
      },
      vendors: [
        {
          name: 'Nicorette',
          price: 38.99,
          url: 'https://www.nicorette.com',
          inStock: true,
          shippingTime: '2-3 business days',
          shippingCost: 4.99,
          countryAvailability: ['USA'],
          discountCodes: 'NICORETTESAVE'
        }
      ],
      scientificBacking: {
        clinicalStudies: true,
        effectivenessRating: 8,
        references: ['Clinical study 1', 'Clinical study 2']
      }
    },
    {
      id: 3,
      name: 'Nicorette Lozenge',
      type: 'lozenge',
      strengthOptions: ['4mg', '2mg', '1mg'],
      nicotineContent: [4, 2, 1],
      brand: 'Nicorette',
      manufacturer: 'Nicorette',
      rating: 4.4,
      reviews: 765,
      price: '$39.99',
      pricePerDay: 1.32,
      description: 'Nicotine lozenges dissolve in your mouth and release nicotine to reduce cravings and withdrawal symptoms.',
      pros: ['Discreet to use', 'No chewing required', 'Long-lasting relief'],
      cons: ['May cause hiccups or heartburn', 'Cannot eat or drink 15 minutes before use'],
      bestFor: ['Office workers', 'People who dislike gum'],
      image: 'https://via.placeholder.com/150',
      available: true,
      chemicalSafety: {
        safetyRating: 8
      },
      usage: {
        howToUse: 'Place one lozenge under your tongue',
        durationOfEffect: '30 minutes to 1 hour',
        dosageRecommendation: 'As needed',
        sideEffects: [],
        warnings: []
      },
      vendors: [
        {
          name: 'Nicorette',
          price: 39.99,
          url: 'https://www.nicorette.com',
          inStock: true,
          shippingTime: '2-3 business days',
          shippingCost: 4.99,
          countryAvailability: ['USA'],
          discountCodes: 'NICORETTESAVE'
        }
      ],
      scientificBacking: {
        clinicalStudies: true,
        effectivenessRating: 8,
        references: ['Clinical study 1', 'Clinical study 2']
      }
    },
    {
      id: 4,
      name: 'Nicotrol Inhaler',
      type: 'inhaler',
      strengthOptions: ['10mg cartridge'],
      nicotineContent: [10],
      brand: 'Nicotrol',
      manufacturer: 'Nicotrol',
      rating: 4.0,
      reviews: 432,
      price: '$55.99',
      pricePerDay: 1.86,
      description: 'Plastic mouthpiece with nicotine cartridges that mimic the hand-to-mouth action of smoking.',
      pros: ['Mimics hand-to-mouth smoking ritual', 'Adjustable usage frequency', 'Can be used with patches'],
      cons: ['Requires prescription', 'More expensive than other options', 'Visible when using'],
      bestFor: ['People who miss the physical habit of smoking', 'Those who need the oral fixation'],
      image: 'https://via.placeholder.com/150',
      available: true,
      chemicalSafety: {
        safetyRating: 7
      },
      usage: {
        howToUse: 'Inhale nicotine from the cartridge',
        durationOfEffect: '1-2 hours',
        dosageRecommendation: 'As needed',
        sideEffects: [],
        warnings: []
      },
      vendors: [
        {
          name: 'Nicotrol',
          price: 55.99,
          url: 'https://www.nicotrol.com',
          inStock: true,
          shippingTime: '2-3 business days',
          shippingCost: 5.99,
          countryAvailability: ['USA'],
          discountCodes: 'NICOTROLSAVE'
        }
      ],
      scientificBacking: {
        clinicalStudies: true,
        effectivenessRating: 7,
        references: ['Clinical study 1', 'Clinical study 2']
      }
    },
    {
      id: 5,
      name: 'Nicotrol NS Nasal Spray',
      type: 'spray',
      strengthOptions: ['0.5mg/spray'],
      nicotineContent: [0.5],
      brand: 'Nicotrol',
      manufacturer: 'Nicotrol',
      rating: 3.8,
      reviews: 321,
      price: '$67.99',
      pricePerDay: 2.26,
      description: 'Nasal spray that delivers nicotine quickly through the nasal lining for fast relief from cravings.',
      pros: ['Fastest acting NRT option', 'Highly effective for intense cravings', 'Easily adjusted dosage'],
      cons: ['Nasal irritation common', 'Requires prescription', 'Most expensive option'],
      bestFor: ['Heavy smokers with intense cravings', 'People who need immediate relief'],
      image: 'https://via.placeholder.com/150',
      available: true,
      chemicalSafety: {
        safetyRating: 6
      },
      usage: {
        howToUse: 'Spray nicotine into each nostril',
        durationOfEffect: '1-2 hours',
        dosageRecommendation: 'As needed',
        sideEffects: [],
        warnings: []
      },
      vendors: [
        {
          name: 'Nicotrol',
          price: 67.99,
          url: 'https://www.nicotrol.com',
          inStock: true,
          shippingTime: '2-3 business days',
          shippingCost: 5.99,
          countryAvailability: ['USA'],
          discountCodes: 'NICOTROLSAVE'
        }
      ],
      scientificBacking: {
        clinicalStudies: true,
        effectivenessRating: 6,
        references: ['Clinical study 1', 'Clinical study 2']
      }
    }
  ];

  const handleViewProduct = (productId: number) => {
    setSelectedProductId(productId);
  };

  const handleBackToDirectory = () => {
    setSelectedProductId(null);
  };

  const handleToggleFavorite = (productId: number) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value as [number, number]);
  };

  const handleNicotineStrengthChange = (value: number[]) => {
    setNicotineStrengthRange(value as [number, number]);
  };

  const handleSafetyRatingChange = (value: number[]) => {
    setSafetyRatingRange(value as [number, number]);
  };

  const handleGumHealthRatingChange = (value: number[]) => {
    setGumHealthRatingRange(value as [number, number]);
  };

  const applyFilters = () => {
    let filtered = [...allProducts];
    
    // Search term filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(lowercaseSearch) ||
        product.brand.toLowerCase().includes(lowercaseSearch) ||
        product.description.toLowerCase().includes(lowercaseSearch) ||
        product.type.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Product type filter
    if (productType !== 'all') {
      filtered = filtered.filter(product => product.type === productType);
    }
    
    // Country availability filter
    filtered = filtered.filter(product => 
      product.vendors.some(vendor => 
        vendor.countryAvailability.includes(selectedCountry) || 
        vendor.countryAvailability.includes('Worldwide')
      )
    );
    
    // Price range filter
    filtered = filtered.filter(product => {
      const productPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
      return productPrice >= priceRange[0] && productPrice <= priceRange[1];
    });
    
    // Nicotine strength filter
    filtered = filtered.filter(product => {
      // Find the min and max nicotine content in the product
      const strengths = product.nicotineContent;
      const minStrength = Math.min(...strengths);
      const maxStrength = Math.max(...strengths);
      
      // Product passes if any of its strength options fall within the selected range
      return (
        (minStrength >= nicotineStrengthRange[0] && minStrength <= nicotineStrengthRange[1]) ||
        (maxStrength >= nicotineStrengthRange[0] && maxStrength <= nicotineStrengthRange[1])
      );
    });
    
    // Safety rating filter
    filtered = filtered.filter(product => 
      product.chemicalSafety.safetyRating >= safetyRatingRange[0] && 
      product.chemicalSafety.safetyRating <= safetyRatingRange[1]
    );
    
    // Gum health filter (only for products with gum health data)
    filtered = filtered.filter(product => {
      if (!product.gumHealth) return true; // Skip filter for products without gum health data
      return (
        product.gumHealth.overallGumHealthRating >= gumHealthRatingRange[0] && 
        product.gumHealth.overallGumHealthRating <= gumHealthRatingRange[1]
      );
    });
    
    // Exclusive deals filter
    if (showExclusiveDeals) {
      filtered = filtered.filter(product => 
        product.vendors.some(vendor => vendor.exclusiveDiscount)
      );
    }
    
    // In-stock only filter
    if (showInStockOnly) {
      filtered = filtered.filter(product => 
        product.vendors.some(vendor => 
          vendor.inStock && 
          (vendor.countryAvailability.includes(selectedCountry) || 
           vendor.countryAvailability.includes('Worldwide'))
        )
      );
    }
    
    // Free shipping filter
    if (showFreeShippingOnly) {
      filtered = filtered.filter(product => 
        product.vendors.some(vendor => 
          vendor.shippingCost === 0 && 
          (vendor.countryAvailability.includes(selectedCountry) || 
           vendor.countryAvailability.includes('Worldwide'))
        )
      );
    }
    
    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        selectedBrands.includes(product.brand)
      );
    }
    
    // Sort products
    switch (sortOrder) {
      case 'price-asc':
        filtered.sort((a, b) => parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, '')));
        break;
      case 'price-desc':
        filtered.sort((a, b) => parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, '')));
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'safety-desc':
        filtered.sort((a, b) => b.chemicalSafety.safetyRating - a.chemicalSafety.safetyRating);
        break;
    }
    
    setFilteredProducts(filtered);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : star - 0.5 <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'patch':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Patch</Badge>;
      case 'gum':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Gum</Badge>;
      case 'lozenge':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Lozenge</Badge>;
      case 'inhaler':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Inhaler</Badge>;
      case 'spray':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Spray</Badge>;
      case 'pouch':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pouch</Badge>;
      case 'toothpick':
        return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">Toothpick</Badge>;
      default:
        return null;
    }
  };
  
  const renderSafetyBadge = (rating: number) => {
    let colorClass = '';
    let text = '';
    
    if (rating >= 8) {
      colorClass = 'bg-green-50 text-green-700 border-green-200';
      text = 'Excellent Safety';
    } else if (rating >= 6) {
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      text = 'Good Safety';
    } else if (rating >= 4) {
      colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      text = 'Moderate Safety';
    } else {
      colorClass = 'bg-red-50 text-red-700 border-red-200';
      text = 'Safety Concerns';
    }
    
    return <Badge variant="outline" className={colorClass}>{text}</Badge>;
  };
  
  const renderGumHealthBadge = (rating?: number) => {
    if (!rating) return null;
    
    let colorClass = '';
    let text = '';
    
    if (rating >= 8) {
      colorClass = 'bg-green-50 text-green-700 border-green-200';
      text = 'Gum-Friendly';
    } else if (rating >= 6) {
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      text = 'Minor Gum Impact';
    } else if (rating >= 4) {
      colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      text = 'Moderate Gum Impact';
    } else {
      colorClass = 'bg-red-50 text-red-700 border-red-200';
      text = 'High Gum Impact';
    }
    
    return <Badge variant="outline" className={colorClass}>{text}</Badge>;
  };

  if (selectedProductId) {
    const product = nrtProducts.find(p => p.id === selectedProductId);
    if (!product) {
      return (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <h3 className="text-xl font-medium mb-2">Product Not Found</h3>
            <p className="text-muted-foreground mb-4">The product you're looking for could not be found.</p>
            <Button onClick={handleBackToDirectory}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </div>
        </div>
      );
    }
    return <ProductDetail product={product} onBack={handleBackToDirectory} session={session} />;
  }

  // Apply filters when relevant state changes
  useEffect(() => {
    applyFilters();
  }, [
    searchTerm, 
    productType, 
    selectedCountry, 
    priceRange, 
    nicotineStrengthRange, 
    safetyRatingRange,
    gumHealthRatingRange,
    showExclusiveDeals,
    showInStockOnly,
    showFreeShippingOnly,
    selectedBrands,
    sortOrder,
    allProducts
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">NRT Directory</h1>
          <p className="text-muted-foreground">Explore nicotine replacement therapy options to help you stay fresh</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Simple Filters' : 'Advanced Filters'}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="health">Health & Safety</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search products by name, brand, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger className="w-36 sm:w-48">
                <SelectValue placeholder="Product Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="patch">Patches</SelectItem>
                <SelectItem value="gum">Gum</SelectItem>
                <SelectItem value="lozenge">Lozenges</SelectItem>
                <SelectItem value="inhaler">Inhalers</SelectItem>
                <SelectItem value="spray">Sprays</SelectItem>
                <SelectItem value="pouch">Pouches</SelectItem>
                <SelectItem value="toothpick">Toothpicks</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value) => {
              if (value === 'price-asc' || value === 'price-desc' || value === 'rating-desc' || value === 'safety-desc') {
                setSortOrder(value);
              }
            }}>
              <SelectTrigger className="w-36 sm:w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating-desc">Highest Rating</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="safety-desc">Safest Options</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showFilters && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm">Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        max={100}
                        step={1}
                        onValueChange={handlePriceRangeChange}
                        className="my-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm">Nicotine Strength (mg)</Label>
                    <div className="px-2">
                      <Slider
                        value={nicotineStrengthRange}
                        max={50}
                        step={0.5}
                        onValueChange={handleNicotineStrengthChange}
                        className="my-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{nicotineStrengthRange[0]}mg</span>
                        <span>{nicotineStrengthRange[1]}mg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm">Minimum Safety Rating</Label>
                    <div className="flex items-center space-x-4">
                      <ShieldCheck className="h-5 w-5 text-gray-500" />
                      <Slider
                        value={safetyRatingRange}
                        max={10}
                        step={1}
                        onValueChange={handleSafetyRatingChange}
                      />
                      <span className="w-8 text-center">{safetyRatingRange[0]}/10</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm">Minimum Gum Health Rating</Label>
                    <div className="flex items-center space-x-4">
                      <Droplets className="h-5 w-5 text-gray-500" />
                      <Slider
                        value={gumHealthRatingRange}
                        max={10}
                        step={1}
                        onValueChange={handleGumHealthRatingChange}
                      />
                      <span className="w-8 text-center">{gumHealthRatingRange[0]}/10</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-stock" 
                      checked={showInStockOnly}
                      onCheckedChange={(checked) => setShowInStockOnly(checked as boolean)}
                    />
                    <label 
                      htmlFor="in-stock"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show only in-stock products
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Country Availability</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="European Union">European Union</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPriceRange([0, 100]);
                      setNicotineStrengthRange([0, 50]);
                      setSafetyRatingRange([0, 10]);
                      setGumHealthRatingRange([0, 10]);
                      setShowInStockOnly(false);
                      setSelectedCountry('United States');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {filteredProducts.length === 0 ? (
            <div className="text-center p-12 border rounded-md">
              <Pill className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No products found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or search criteria
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setProductType('all');
                  setSearchTerm('');
                  setPriceRange([0, 100]);
                  setNicotineStrengthRange([0, 50]);
                  setSafetyRatingRange([0, 10]);
                  setGumHealthRatingRange([0, 10]);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredProducts.map((product) => (
                viewMode === 'grid' ? (
                  <Card key={product.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        {renderTypeIcon(product.type)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleFavorite(product.id)}
                        >
                          <Bookmark 
                            className={`h-5 w-5 ${favorites.includes(product.id) 
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-gray-400'}`} 
                          />
                        </Button>
                      </div>
                      <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(product.rating)}
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews.toLocaleString()})
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {renderSafetyBadge(product.chemicalSafety.safetyRating)}
                        {product.gumHealth && renderGumHealthBadge(product.gumHealth.overallGumHealthRating)}
                        {!product.available && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-lg font-bold">{product.price}</div>
                        <div className="text-xs text-muted-foreground">
                          ${product.pricePerDay.toFixed(2)}/day
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              {renderTypeIcon(product.type)}
                              <span className="font-medium text-sm text-muted-foreground">
                                {product.brand}
                              </span>
                            </div>
                            <h3 className="text-lg font-medium">{product.name}</h3>
                            <div className="flex items-center space-x-2">
                              {renderStars(product.rating)}
                              <span className="text-sm text-muted-foreground">
                                ({product.reviews.toLocaleString()})
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleFavorite(product.id)}
                          >
                            <Bookmark 
                              className={`h-5 w-5 ${favorites.includes(product.id) 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-gray-400'}`} 
                            />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {renderSafetyBadge(product.chemicalSafety.safetyRating)}
                          {product.gumHealth && renderGumHealthBadge(product.gumHealth.overallGumHealthRating)}
                          {product.strengthOptions.map((strength, index) => (
                            <Badge key={index} variant="secondary" className="bg-gray-100">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 border-t sm:border-t-0 sm:border-l flex flex-col justify-between sm:w-56">
                        <div>
                          <div className="text-xl font-bold mb-1">{product.price}</div>
                          <div className="text-xs text-muted-foreground mb-4">
                            ${product.pricePerDay.toFixed(2)}/day
                          </div>
                          {!product.available ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mb-4">
                              Out of Stock
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-4">
                              In Stock
                            </Badge>
                          )}
                        </div>
                        <Button 
                          className="w-full" 
                          variant="default"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verified Vendors</CardTitle>
              <CardDescription>
                Find reliable suppliers for NRT products with delivery information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This section will display vendor information, pricing comparisons, 
                  and availability for different regions.
                </p>
                
                {/* Placeholder for vendor information */}
                <div className="text-center p-12 border rounded-md">
                  <Truck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">Vendor information coming soon</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    We're working on adding comprehensive vendor details
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health & Safety Information</CardTitle>
              <CardDescription>
                Learn about the health impacts of different NRT products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">What chemicals should I be concerned about?</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    While NRT products are generally safer than smoking, some contain chemicals that may cause side effects for certain individuals:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li><strong>Propylene Glycol (PG)</strong>: Used in some sprays and solutions, can cause throat irritation in sensitive individuals.</li>
                    <li><strong>Artificial Sweeteners</strong>: Present in gums and lozenges, may cause digestive issues for some people.</li>
                    <li><strong>Preservatives</strong>: Used to extend shelf life, can trigger allergic reactions in rare cases.</li>
                    <li><strong>Food Dyes</strong>: Found in some products, may cause reactions in sensitive individuals.</li>
                  </ul>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">How do NRT products affect oral health?</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Oral NRT products like gums, lozenges, and especially pouches can impact gum health in several ways:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li><strong>pH Levels</strong>: Products with high acidity can erode tooth enamel over time.</li>
                    <li><strong>Gum Recession</strong>: Pouches placed in the same location repeatedly may contribute to gum recession.</li>
                    <li><strong>Irritation</strong>: Some products can cause irritation or sores if used too frequently.</li>
                    <li><strong>Gum Disease</strong>: While less harmful than smoking, some products may still contribute to gum issues.</li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">
                    We recommend rotating placement sites for pouches and following proper oral hygiene practices when using these products.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">How are safety ratings determined?</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Our safety ratings consider multiple factors based on scientific research and clinical studies:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li><strong>Ingredient Safety</strong>: Evaluation of all active and inactive ingredients.</li>
                    <li><strong>Side Effect Profile</strong>: Frequency and severity of reported side effects.</li>
                    <li><strong>Clinical Research</strong>: Amount and quality of supporting research.</li>
                    <li><strong>Regulatory Approval</strong>: Status with regulatory bodies like FDA.</li>
                    <li><strong>Manufacturing Standards</strong>: Quality control and manufacturing practices.</li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Each product receives a rating from 1-10, with 10 being the highest safety rating.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites" className="space-y-6">
          {favorites.length === 0 ? (
            <div className="text-center p-12 border rounded-md">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No favorites yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Products you bookmark will appear here for easy reference
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab('products')}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nrtProducts
                .filter(product => favorites.includes(product.id))
                .map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        {renderTypeIcon(product.type)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleFavorite(product.id)}
                        >
                          <Bookmark className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(product.rating)}
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews.toLocaleString()})
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {renderSafetyBadge(product.chemicalSafety.safetyRating)}
                        {product.gumHealth && renderGumHealthBadge(product.gumHealth.overallGumHealthRating)}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="text-lg font-bold">{product.price}</div>
                        <div className="text-xs text-muted-foreground">
                          ${product.pricePerDay.toFixed(2)}/day
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              }
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 