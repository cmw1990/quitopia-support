import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../ui';
import {
  NRTProduct,
  Vendor,
  CountryInfo,
  ProductVariant
} from './types';
import {
  fetchProductById,
  getBestPrice,
  fetchVendors as getVendors,
  getHealthImpactDetails,
  fetchCountryRegulations,
  getCountryInfo,
  trackAffiliateClick
} from './apiCompatibility';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ExternalLink,
  Heart,
  Info,
  Shield,
  ShieldAlert,
  ShoppingBag,
  Star,
  Truck,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductDetailsProps {
  product: NRTProduct;
  session: Session | null;
  onBack: () => void;
}

export const ProductDetails = ({ product, session, onBack }: ProductDetailsProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    const variant = product.variants[0];
    return variant;
  });
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [healthDetails, setHealthDetails] = useState<{
    chemicalDetails: any[];
    clinicalStudies: any[];
    safetyRecommendations: string[];
  } | null>(null);
  const [bestPrice, setBestPrice] = useState<{
    vendorId: string;
    price: number;
    shippingCost: string;
    totalPrice: number;
    deliveryTime: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load necessary data
  useEffect(() => {
    const loadData = async () => {
      if (!session) return;
      setLoading(true);
      try {
        // Get health impact data
        const healthData = await getHealthImpactDetails(session, product.id);
        
        // Get country regulations using countryService
        const countryData = await getCountryInfo(session, selectedCountry);
        
        // Get vendors and adapt to component's Vendor type
        const apiVendors = await getVendors(session, selectedCountry);
        const adaptedVendors: Vendor[] = apiVendors.map(v => ({
          id: v.id,
          name: v.name,
          website: v.website,
          affiliateId: v.id, // Use ID as affiliate ID if not available
          rating: v.trusted_rating,
          deliveryOptions: {
            standard: {
              cost: v.shipping_cost?.[selectedCountry] || 0,
              timeRange: v.shipping_time?.[selectedCountry] || '3-5 days'
            }
          },
          countries: v.shipping_countries || []
        }));
        
        // Get best price
        const priceData = await getBestPrice(session, product.id, selectedCountry);
        const adaptedPrice = priceData ? {
          vendorId: priceData.vendor_id,
          price: priceData.price,
          shippingCost: '0.00', // Default, can be enhanced
          totalPrice: priceData.price, // Add shipping if available
          deliveryTime: '3-5 days' // Default, can be enhanced
        } : null;

        setHealthDetails(healthData);
        setCountryInfo(countryData);
        setVendors(adaptedVendors);
        setBestPrice(adaptedPrice);
      } catch (error) {
        console.error('Error loading product details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [product.id, selectedCountry, session]);

  // Handle affiliate link click
  const handleBuyClick = async (vendor: Vendor) => {
    if (!session) return;

    // Track click
    await trackAffiliateClick(
      session,
      product.id,
      vendor.id,
      session.user.id
    );

    // Open vendor page with affiliate link
    window.open(
      `${vendor.website}/products/${product.id}?ref=${vendor.affiliateId}`,
      '_blank'
    );
  };

  // Update the country info display to use regulations instead of restrictions
  const renderCountryInfo = () => {
    if (!countryInfo) return null;
    
    return (
      <Alert className="flex-1">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Regulatory Information</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 text-sm">
            {countryInfo.regulations.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
            <li>Age Restriction: {countryInfo.regulations.minimumAge}+</li>
            <li>{countryInfo.regulations.prescriptionRequired ? 'Prescription Required' : 'No Prescription Required'}</li>
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  // Inside the vendor comparison section, replace the country info display
  const renderVendorComparison = () => {
    if (!vendors.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-500" />
            Where to Buy
          </CardTitle>
          <CardDescription>
            Compare prices and shipping options across vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Country selection */}
            <div className="flex items-center gap-2">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(vendor => (
                    vendor.countries.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))
                  ))}
                </SelectContent>
              </Select>

              {renderCountryInfo()}
            </div>

            {/* Variant selection */}
            <div>
              <Select 
                value={selectedVariant.id}
                onValueChange={(value) => {
                  const variant = product.variants.find(v => v.id === value);
                  if (variant) setSelectedVariant(variant);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map(variant => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} ({variant.nicotineStrength}mg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vendor listings */}
            <div className="grid gap-4">
              {vendors.map(vendor => {
                // Use the basic price data since we don't have per-vendor prices in the current model
                const price = selectedVariant.price;
                const inStock = selectedVariant.inStock;
                const deliveryInfo = vendor.deliveryOptions.standard;

                return (
                  <Card key={vendor.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {vendor.name}
                          <Badge variant="outline" className="text-xs">
                            {vendor.rating.toFixed(1)}
                            <Star className="h-3 w-3 ml-1 fill-current" />
                          </Badge>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {vendor.deliveryOptions.standard.timeRange}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${price.toFixed(2)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          + ${deliveryInfo.cost} shipping
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant={inStock ? "success" : "secondary"}>
                          {inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                        <span className="text-sm flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          {deliveryInfo.timeRange}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleBuyClick(vendor)}
                        disabled={!inStock}
                      >
                        Buy Now
                      </Button>
                    </div>

                    {deliveryInfo.cost > 0 && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Free shipping on orders over ${deliveryInfo.cost}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render health impact rating
  const renderHealthImpact = () => {
    const { healthImpact } = product;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Health Impact Assessment
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of potential health effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gum Health Rating */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Gum Health Impact</span>
              <Badge variant={
                healthImpact.gumHealth.rating > 7 ? "success" :
                healthImpact.gumHealth.rating > 4 ? "warning" : "destructive"
              }>
                {healthImpact.gumHealth.rating}/10
              </Badge>
            </div>
            <Progress value={healthImpact.gumHealth.rating * 10} className="h-2" />
            <ul className="mt-2 space-y-1">
              {healthImpact.gumHealth.factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${
                    factor.severity === 'high' ? 'text-red-500' :
                    factor.severity === 'moderate' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <span>{factor.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chemicals of Concern */}
          {healthDetails?.chemicalDetails && (
            <div className="space-y-2">
              <h4 className="font-medium">Chemical Analysis</h4>
              <div className="grid gap-2">
                {healthDetails.chemicalDetails.map((chemical, idx) => (
                  <Card key={idx} className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium">{chemical.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {chemical.description}
                        </p>
                      </div>
                      <Badge variant={
                        chemical.warningLevel === 'high' ? "destructive" :
                        chemical.warningLevel === 'moderate' ? "warning" :
                        "outline"
                      }>
                        {chemical.category}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Studies */}
          {healthDetails?.clinicalStudies && (
            <div className="space-y-2">
              <h4 className="font-medium">Clinical Research</h4>
              <div className="grid gap-2">
                {healthDetails.clinicalStudies.map((study, idx) => (
                  <Card key={idx} className="p-3">
                    <h5 className="font-medium">{study.title}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {study.findings}
                    </p>
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      View Study <ExternalLink className="h-3 w-3" />
                    </a>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Safety Guidelines */}
          {healthDetails?.safetyRecommendations && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Safety Recommendations
              </h4>
              <ul className="space-y-1">
                {healthDetails.safetyRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Directory
      </Button>

      {/* Product header */}
      <div className="flex items-start gap-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{product.brand}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{product.type}</Badge>
            <Badge variant="outline">{product.category}</Badge>
          </div>
          <p className="mt-4">{product.description}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Impact</TabsTrigger>
          <TabsTrigger value="purchase">Where to Buy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Usage Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.usage.instructions}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recommended Duration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.usage.duration}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Maximum Daily Use</h4>
                  <Badge variant="info">
                    Maximum {product.usage.maxDaily} per day
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Important Warnings</h4>
                  <ul className="space-y-2">
                    {product.usage.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Select a variant to see detailed information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Select
                      value={selectedVariant.id}
                      onValueChange={(value) => {
                        const variant = product.variants.find(v => v.id === value);
                        if (variant) setSelectedVariant(variant);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.name} - {variant.nicotineStrength}mg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Selected Variant Details</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">Strength:</dt>
                        <dd className="font-medium">{selectedVariant.nicotineStrength}mg</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Manufacturer Information</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Manufacturer:</dt>
                      <dd className="font-medium">{product.manufacturerInfo.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Country of Origin:</dt>
                      <dd className="font-medium">{product.manufacturerInfo.country}</dd>
                    </div>
                    <div className="pt-2">
                      <a
                        href={product.manufacturerInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Visit Manufacturer Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health">
          {renderHealthImpact()}
        </TabsContent>

        <TabsContent value="purchase">
          {renderVendorComparison()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
