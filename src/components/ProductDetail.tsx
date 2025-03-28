import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  supabaseRestCall, 
  getProductVendors, 
  getCountries,
  Country
} from "../api/apiCompatibility";
import { toast } from 'sonner';
import { 
  Star, 
  ArrowLeft, 
  ShoppingCart, 
  DollarSign, 
  PlusCircle, 
  MinusCircle,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Store
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from './ui/accordion';
import {
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  Separator
} from './ui/avatar';
import { Badge } from './ui/badge';
import confetti from 'canvas-confetti';
import { ProductVendorAvailability, calculateBestDeal } from '../types/vendor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator as UISeparator } from "./ui/separator";

// Component props
interface ProductDetailProps {
  session: Session | null;
  productId: string;
  onBack: () => void;
}

// Product type
interface NRTProduct {
  id: string;
  name: string;
  type: string;
  brand: string;
  rating: number;
  reviews: number;
  price_range: string;
  description: string;
  pros: string[];
  cons: string[];
  best_for: string[];
  image_url: string;
  strength_options: string[];
  available: boolean;
  avg_rating: number;
  review_count: number;
}

// Updated vendor type using the new interface
type ProductVendor = ProductVendorAvailability;

// Review type
interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string;
  pros: string[];
  cons: string[];
  created_at: string;
  user_name: string;
  user_avatar: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ session, productId, onBack }) => {
  const [product, setProduct] = useState<NRTProduct | null>(null);
  const [vendors, setVendors] = useState<ProductVendor[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [userPros, setUserPros] = useState('');
  const [userCons, setUserCons] = useState('');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<ProductVendor | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [countries, setCountries] = useState<Country[]>([]);
  
  useEffect(() => {
      fetchProductDetails();
    loadCountries();
  }, [productId, session]);
  
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch product details using REST API
      const productData = await supabaseRestCall(
        `/rest/v1/nrt_products?id=eq.${productId}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': session ? `Bearer ${session.access_token}` : '',
            'Content-Type': 'application/json'
          }
        },
        session
      );

      if (!productData || productData.length === 0) {
        throw new Error('Product not found');
      }

      // Fetch vendors using the new API function
      const vendorData = await getProductVendors(productId, session);

      // Fetch reviews using REST API
      const reviewData = await supabaseRestCall(
        `/rest/v1/product_reviews?product_id=eq.${productId}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': session ? `Bearer ${session.access_token}` : '',
            'Content-Type': 'application/json'
          }
        },
        session
      );
      
      // Check if user has already reviewed
      if (session?.user?.id) {
        const userReviewData = await supabaseRestCall(
          `/rest/v1/product_reviews?product_id=eq.${productId}&user_id=eq.${session.user.id}`,
          {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          },
          session
        );
        
        setHasUserReviewed(userReviewData && userReviewData.length > 0);
      }
      
      // Process the data
      const transformedProduct = {
        ...productData[0],
        pros: productData[0].pros || [],
        cons: productData[0].cons || [],
        best_for: productData[0].best_for || [],
        strength_options: productData[0].strength_options || []
      };
      
      setProduct(transformedProduct);
      setVendors(vendorData || []);
      setReviews(reviewData || []);
      
      if (vendorData && vendorData.length > 0) {
        setSelectedVendor(vendorData[0]);
      }
      
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitReview = async () => {
    if (!session?.user) {
      toast.error('Please sign in to submit a review');
      return;
    }
    
    if (userRating === 0) {
      toast.error('Please provide a rating before submitting');
      return;
    }
    
    try {
      // Parse pros and cons
      const prosArray = userPros.split('\n').filter(p => p.trim() !== '');
      const consArray = userCons.split('\n').filter(c => c.trim() !== '');
      
      // Submit review using REST API
      await supabaseRestCall(
        `/rest/v1/product_reviews`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
          user_id: session.user.id,
          product_id: productId,
          rating: userRating,
          review_text: userReview,
          pros: prosArray,
            cons: consArray,
            user_name: session.user.email?.split('@')[0] || 'Anonymous',
            user_avatar: ''
          })
        },
        session
      );
      
      toast.success('Your review has been submitted');
      
      // Update UI
      setHasUserReviewed(true);
      setUserRating(0);
      setUserReview('');
      setUserPros('');
      setUserCons('');
      
      // Refresh reviews
      fetchProductDetails();
      
      // Play confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  // Render a star rating of 1-5
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
          <Star
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };
  
  // Render an interactive star rating input
  const renderRatingStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setUserRating(value)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                value <= userRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };
  
  const getAvatarFallback = (name: string) => {
    if (!name) return '?';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Render vendor section with improved UI
  const renderVendorSection = () => (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Where to Buy</h3>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {vendors.length > 0 ? (
        <div className="space-y-4">
          {vendors.map(vendor => (
            <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                {vendor.vendor_logo_url && (
                  <img 
                    src={vendor.vendor_logo_url} 
                    alt={vendor.vendor_name} 
                    className="w-12 h-12 object-contain rounded"
                  />
                )}
                <div>
                  <h4 className="font-medium">{vendor.vendor_name}</h4>
                  <div className="flex items-center mt-1">
                    <Badge 
                      variant={vendor.in_stock ? "success" : "destructive"} 
                      className="text-xs py-0 px-1"
                    >
                      {vendor.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                    {vendor.free_shipping && (
                      <Badge variant="outline" className="ml-2 text-xs py-0 px-1">Free Shipping</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{vendor.shipping_time}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold">${vendor.price.toFixed(2)}</div>
                {vendor.shipping_cost > 0 && (
                  <div className="text-xs text-gray-500">+${vendor.shipping_cost.toFixed(2)} shipping</div>
                )}
                <a 
                  href={vendor.product_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-700 flex items-center justify-end mt-1"
                >
                  View <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          ))}
          
          <div className="text-sm text-gray-500 flex items-center justify-center pt-2">
            <Store className="w-4 h-4 mr-2" />
            <span>All vendors verified by Mission Fresh</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No vendor information available for this region</p>
        </div>
      )}
    </div>
  );
  
  // Load countries for the country selector
  const loadCountries = async () => {
    try {
      const countriesData = await getCountries(session);
      setCountries(countriesData);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-t-2 border-green-500 border-solid rounded-full animate-spin"></div>
          <p className="text-green-600">Loading product details...</p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Product Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="flex items-center text-green-600 hover:bg-green-50 hover:text-green-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Directory
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-4">
          <img 
            src={product.image_url || '/placeholder-product.png'} 
                  alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
          
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Chemical Concerns</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product?.chemical_concerns ? (
                  product?.chemical_concerns.map(concern => (
                    <Badge key={concern} variant="destructive">{concern}</Badge>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No known chemical concerns</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gum Health Rating</h3>
              <div className="mt-2">
                  <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        product?.gum_health_rating > 3 ? 'bg-green-500' : 
                        product?.gum_health_rating > 2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(product?.gum_health_rating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {product?.gum_health_rating ? product?.gum_health_rating.toFixed(1) : 'N/A'}/5
                  </span>
                </div>
              </div>
            </div>
                  </div>
                </div>
                
        <div>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="mb-2">{product.type}</Badge>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
              <div className="flex items-center mt-1 mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">by</span>
                <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{product.brand}</span>
              </div>
              <div className="flex items-center">
                <div className="flex">{renderStars(product.avg_rating || 0)}</div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({product.review_count || 0} reviews)
                </span>
                          </div>
                      </div>
                      
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {product.price_range}
                      </div>
        </div>
        
          <div className="mt-6">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
              <TabsContent value="details" className="pt-4">
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {product.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Pros</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.pros.map((pro, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">{pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Cons</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.cons.map((con, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                    <div>
                    <h3 className="font-medium mb-2">Best For</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.best_for.map((item, i) => (
                        <Badge key={i} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  
                    <div>
                    <h3 className="font-medium mb-2">Strength Options</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.strength_options.map((strength, i) => (
                        <Badge key={i} variant="outline">{strength}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vendors" className="pt-4">
                {renderVendorSection()}
            </TabsContent>
            
              <TabsContent value="reviews" className="pt-4">
                <div className="space-y-6">
                  {!hasUserReviewed && session ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium mb-3">Write a Review</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">Rating</label>
                        {renderRatingStars()}
                      </div>
                        
                        <div>
                          <label className="block text-sm mb-1">Review</label>
                          <Textarea 
                            value={userReview}
                            onChange={e => setUserReview(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="w-full"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm mb-1">Pros (one per line)</label>
                            <Textarea 
                              value={userPros}
                              onChange={e => setUserPros(e.target.value)}
                              placeholder="List the pros..."
                              className="w-full h-24"
                            />
                          </div>
                          
                        <div>
                            <label className="block text-sm mb-1">Cons (one per line)</label>
                          <Textarea 
                            value={userCons}
                              onChange={e => setUserCons(e.target.value)}
                              placeholder="List the cons..."
                              className="w-full h-24"
                          />
                        </div>
                      </div>
                        
                        <Button onClick={handleSubmitReview}>Submit Review</Button>
                      </div>
                    </div>
                  ) : !session ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                      <p className="mb-3">Please sign in to leave a review</p>
                      <Button>Sign In</Button>
                    </div>
                  ) : null}
                  
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b pb-4">
                          <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10">
                                {review.user_avatar && (
                              <AvatarImage src={review.user_avatar} alt={review.user_name} />
                                )}
                              <AvatarFallback>{getAvatarFallback(review.user_name)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <div className="font-medium">{review.user_name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-gray-700 dark:text-gray-300">{review.review_text}</p>
                          </div>
                          
                          {(review.pros?.length > 0 || review.cons?.length > 0) && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {review.pros?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium flex items-center">
                                    <ThumbsUp className="w-4 h-4 mr-1 text-green-500" />
                                    Pros
                                  </h4>
                                  <ul className="mt-1 pl-6 list-disc text-sm">
                                    {review.pros.map((pro, i) => (
                                      <li key={i}>{pro}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {review.cons?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium flex items-center">
                                    <ThumbsDown className="w-4 h-4 mr-1 text-red-500" />
                                    Cons
                                  </h4>
                                  <ul className="mt-1 pl-6 list-disc text-sm">
                                    {review.cons.map((con, i) => (
                                      <li key={i}>{con}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
                    </div>
                  )}
                  </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};