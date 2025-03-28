import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  ChevronDown,
  Check,
  Tag,
  Truck,
  Info,
  ArrowRight,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { supabaseRestCall } from "../api/apiCompatibility";
import { useToast } from './ui/use-toast';

interface MarketplaceProps {
  session: Session | null;
  supabaseClient?: SupabaseClient;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  review_count: number;
  image_url: string | null;
  category: 'nrt' | 'medication' | 'alternative' | 'education';
  tags: string[];
  in_stock: boolean;
  discount_percent?: number;
  free_shipping?: boolean;
}

const Marketplace: React.FC<MarketplaceProps> = ({ session, supabaseClient }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();
  
  // Load products from Supabase
  useEffect(() => {
    fetchProducts();
    
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('missionFreshCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart from localStorage:', e);
      }
    }
  }, []);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('missionFreshCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const endpoint = `/rest/v1/mission4_products?select=*`;
      const data = await supabaseRestCall<Product[]>(endpoint, {}, session);
      
      if (data && Array.isArray(data)) {
        setProducts(data);
      } else {
        console.warn('No products found in the database, using fallback data');
        // Fallback to sample data if the API fails
        setProducts(fallbackProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error loading products',
        description: 'Could not load products. Please try again later.',
        variant: 'destructive'
      });
      // Use fallback data on error
      setProducts(fallbackProducts);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort products based on user selections
  const filteredProducts = products
    .filter(product => {
      // Category filter
      if (filterCategory !== "all" && product.category !== filterCategory) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sorting logic
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          // For this sample, we don't have created_at so let's just use ID as proxy
          return b.id.localeCompare(a.id);
        default:
          // "recommended" - Use a combined score of rating and review count
          const scoreA = a.rating * Math.log(a.review_count + 1);
          const scoreB = b.rating * Math.log(b.review_count + 1);
          return scoreB - scoreA;
      }
    });

  // Record a product view in analytics
  const recordProductView = async (productId: string) => {
    if (!session) return;
    
    try {
      const endpoint = `/rest/v1/mission4_product_views`;
      await supabaseRestCall(endpoint, {
        method: 'POST',
        headers: {
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session.user.id,
          product_id: productId,
          viewed_at: new Date().toISOString()
        })
      }, session);
    } catch (error) {
      console.error('Error recording product view:', error);
      // Silent failure - don't block the user experience
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "nrt":
        return "Nicotine Replacement";
      case "medication":
        return "Medications";
      case "alternative":
        return "Alternative Products";
      case "education":
        return "Educational Resources";
      default:
        return category;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      
      let price = product.price;
      if (product.discount_percent) {
        price = price * (1 - product.discount_percent / 100);
      }
      
      return total + (price * item.quantity);
    }, 0);
  };

  const addToCart = async (productId: string) => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    
    const existingItem = cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      updateCartQuantity(productId, existingItem.quantity + 1);
    } else {
      setCartItems([...cartItems, { productId, quantity: 1 }]);
      
      toast({
        title: "Added to Cart",
        description: "Item successfully added to your cart",
        variant: "default"
      });
      
      // Record analytics
      try {
        const endpoint = `/rest/v1/mission4_cart_actions`;
        await supabaseRestCall(endpoint, {
          method: 'POST',
          headers: {
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: session.user.id,
            product_id: productId,
            action: 'add',
            created_at: new Date().toISOString()
          })
        }, session);
      } catch (error) {
        console.error('Error recording cart action:', error);
      }
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      setCartItems(cartItems.filter(item => item.productId !== productId));
      
      // Record analytics if session exists
      if (session) {
        try {
          const endpoint = `/rest/v1/mission4_cart_actions`;
          await supabaseRestCall(endpoint, {
            method: 'POST',
            headers: {
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: session.user.id,
              product_id: productId,
              action: 'remove',
              created_at: new Date().toISOString()
            })
          }, session);
        } catch (error) {
          console.error('Error recording cart action:', error);
        }
      }
    } else {
      // Update quantity
      setCartItems(
        cartItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Fallback products data in case the API fails
  const fallbackProducts: Product[] = [
    {
      id: "1",
      name: "NicoDerm CQ Patch",
      description: "Step 1 Clear nicotine patches for smoking cessation (21mg, 24-hour)",
      price: 45.99,
      rating: 4.5,
      review_count: 856,
      image_url: "https://placehold.co/300x300",
      category: "nrt",
      tags: ["patch", "transdermal", "24-hour"],
      in_stock: true,
      discount_percent: 15,
      free_shipping: true
    },
    {
      id: "2",
      name: "Nicorette Gum",
      description: "Nicotine gum to help reduce withdrawal symptoms including nicotine craving (2mg, 160 pieces)",
      price: 38.99,
      rating: 4.3,
      review_count: 723,
      image_url: "https://placehold.co/300x300",
      category: "nrt",
      tags: ["gum", "oral", "quick relief"],
      in_stock: true
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Cessation Products Marketplace</h1>
        <button 
          className="relative flex items-center px-4 py-2 bg-primary text-white rounded-lg"
          onClick={() => setShowCart(!showCart)}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          <span>Cart</span>
          {getCartItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {getCartItemCount()}
            </span>
          )}
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="nrt">Nicotine Replacement</option>
            <option value="medication">Medications</option>
            <option value="alternative">Alternative Products</option>
            <option value="education">Educational Resources</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="relative">
          <Sort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      {/* Product grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              onClick={() => recordProductView(product.id)}
            >
              <div className="relative h-48 bg-gray-100">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Info className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {product.discount_percent && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.discount_percent}% OFF
                  </div>
                )}
                {product.free_shipping && (
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                    <Truck className="h-3 w-3 mr-1" />
                    Free Shipping
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 rounded">
                    {getCategoryLabel(product.category)}
                  </span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">({product.review_count})</span>
                  </div>
                </div>
                
                <h3 className="mt-2 text-lg font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                <div className="mt-3 flex items-baseline">
                  {product.discount_percent ? (
                    <>
                      <span className="text-lg font-bold text-primary">
                        ${(product.price * (1 - product.discount_percent / 100)).toFixed(2)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <button 
                    className={`px-4 py-2 rounded ${product.in_stock 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    disabled={!product.in_stock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.in_stock) {
                        addToCart(product.id);
                      }
                    }}
                  >
                    {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button 
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast({
                        title: "Added to Wishlist",
                        description: "This product has been saved to your wishlist",
                      });
                    }}
                  >
                    <Heart className="h-5 w-5 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 rounded"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your filters or search term
          </p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            onClick={() => {
              setSearchQuery("");
              setFilterCategory("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
      
      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setShowCart(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Browse our products and add items to your cart
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {cartItems.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    
                    return (
                      <div key={item.productId} className="p-4 flex">
                        <div className="h-20 w-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden mr-4">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Info className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{product.name}</h4>
                            <span className="font-bold text-primary">
                              ${((product.discount_percent 
                                ? product.price * (1 - product.discount_percent / 100) 
                                : product.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-500">
                            ${(product.discount_percent 
                              ? product.price * (1 - product.discount_percent / 100) 
                              : product.price).toFixed(2)} each
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center border rounded">
                              <button
                                className="px-2 py-1"
                                onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-2">{item.quantity}</span>
                              <button
                                className="px-2 py-1"
                                onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <button
                              className="text-sm text-red-500"
                              onClick={() => updateCartQuantity(product.id, 0)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span>Subtotal</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  <button
                    className="w-full px-4 py-3 bg-primary text-white rounded-lg font-bold"
                    onClick={() => {
                      toast({
                        title: "Checkout Process",
                        description: "Redirecting to checkout page...",
                      });
                      
                      // In a real app, we would redirect to checkout
                      setTimeout(() => {
                        window.location.href = '/checkout';
                      }, 1500);
                    }}
                  >
                    Proceed to Checkout
                  </button>
                  
                  <button
                    className="w-full mt-2 px-4 py-2 text-primary bg-white border border-primary rounded-lg font-medium"
                    onClick={() => setShowCart(false)}
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing icons
const Sort = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="21" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="21" y1="18" x2="3" y2="18"></line>
  </svg>
);

export default Marketplace; 
