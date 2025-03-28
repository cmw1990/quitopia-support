import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { SearchIcon, Filter, Star, Zap, Check, ThumbsUp, ShoppingCart, DollarSign, RefreshCw, ExternalLink } from 'lucide-react';
import { nrtProductsData } from './nrt-data';
import type { NRTProduct, NRTCategory } from './nrt-types';
import ProductDetailModal from './ProductDetailModal';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import { OfflineStatusIndicator } from '../OfflineStatusIndicator';
import useAuthentication from '../../hooks/useAuthentication';
import { 
  getAffiliateLink, 
  trackAffiliateClick, 
  getAffiliateStats, 
  recordAffiliateConversion
} from './apiCompatibility';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const NRTDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<NRTCategory>('all');
  const [sortCriteria, setSortCriteria] = useState<'rating' | 'price' | 'effectiveTime'>('rating');
  const [filteredProducts, setFilteredProducts] = useState<NRTProduct[]>([]);
  const [showAffiliate, setShowAffiliate] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<NRTProduct | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [affiliateStats, setAffiliateStats] = useState<any>(null);
  const [syncingClicks, setSyncingClicks] = useState(false);
  const { isOnline } = useOfflineStatus();
  const isOffline = !isOnline;
  const navigate = useNavigate();
  const { user, session } = useAuthentication();

  // Load favorites from local storage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('nrtFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save favorites to local storage when they change
  useEffect(() => {
    localStorage.setItem('nrtFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load affiliate stats
  useEffect(() => {
    const loadAffiliateStats = async () => {
      if (user && user.id) {
        const stats = await getAffiliateStats(session, user.id);
        setAffiliateStats(stats);
      }
    };
    
    loadAffiliateStats();
  }, [user, session]);

  // No need for sync functions since our REST client handles that
  useEffect(() => {
    const refreshStats = async () => {
      if (isOnline && user?.id) {
        // Refresh affiliate stats when coming back online
        const stats = await getAffiliateStats(session, user.id);
        setAffiliateStats(stats);
        
        toast.success("Affiliate data refreshed", {
          description: "Your affiliate activity has been updated"
        });
      }
    };
    
    refreshStats();
  }, [isOnline, user, session]);

  // Filter and sort products based on current criteria
  useEffect(() => {
    let results = [...nrtProductsData];
    
    // Apply category filter if not showing all
    if (activeTab !== 'all') {
      results = results.filter(product => product.category === activeTab);
    }
    
    // Apply search term filter if it exists
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.brand.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    
    // Apply favorites filter if enabled
    if (showFavorites) {
      results = results.filter(product => favorites.includes(product.id));
    }
    
    // Apply sorting
    results.sort((a, b) => {
      if (sortCriteria === 'rating') {
        return b.rating - a.rating;
      } else if (sortCriteria === 'price') {
        return a.priceRange.min - b.priceRange.min;
      } else {
        // Effectiveness time (sort by min time to feel effects)
        return a.effectivenessTime.min - b.effectivenessTime.min;
      }
    });
    
    setFilteredProducts(results);
  }, [searchTerm, activeTab, sortCriteria, showFavorites, favorites]);

  // Toggle favorite status for a product
  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Format price range for display
  const formatPriceRange = (min: number, max: number) => {
    return `$${min.toFixed(2)}${max > min ? ` - $${max.toFixed(2)}` : ''}`;
  };

  // Format effectiveness time for display
  const formatEffectivenessTime = (min: number, max: number) => {
    return `${min}${max > min ? `-${max}` : ''} min`;
  };

  // Open product detail modal
  const openProductDetail = (product: NRTProduct) => {
    setSelectedProduct(product);
  };

  // Close product detail modal
  const closeProductDetail = () => {
    setSelectedProduct(null);
  };
  
  // Handle affiliate link click with tracking
  const handleAffiliateClick = async (product: NRTProduct) => {
    if (navigator && navigator.vibrate) {
      navigator.vibrate(10); // Haptic feedback
    }
    
    // Get or create affiliate link
    const affiliateLink = await getAffiliateLink(
      session, 
      product.id, 
      product.brand, 
      product.affiliateLink
    );
    
    // Track the click
    trackAffiliateClick(
      session,
      product.id,
      product.brand,
      user?.id
    );
    
    // Show toast notification
    toast.info("Opening product page", {
      description: `You're being directed to ${product.brand}`
    });
    
    // Record a simulated conversion with 10% probability for demo
    if (Math.random() < 0.1 && user?.id) {
      setTimeout(() => {
        recordAffiliateConversion(
          session,
          {
            user_id: user.id,
            product_id: product.id,
            vendor_id: product.brand,
            amount: product.priceRange.min,
            commission_rate: 0.1 // 10% commission
          }
        );
        
        toast.success("Affiliate commission earned!", {
          description: `You earned $${(product.priceRange.min * 0.1).toFixed(2)} from this purchase`
        });
      }, 5000);
    }
    
    window.open(affiliateLink, '_blank');
  };
  
  // Handle manual sync/refresh of affiliate data
  const handleSyncClicks = async () => {
    if (!user?.id) return;
    
    setSyncingClicks(true);
    
    try {
      // Refresh affiliate stats
      const stats = await getAffiliateStats(session, user.id);
      setAffiliateStats(stats);
      
      toast.success("Affiliate data refreshed", {
        description: "Your affiliate statistics have been updated"
      });
    } catch (error) {
      console.error('Error refreshing affiliate data:', error);
      toast.error("Refresh failed", {
        description: "There was an error refreshing your affiliate data"
      });
    } finally {
      setSyncingClicks(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">NRT Directory</h1>
          <p className="text-muted-foreground">
            Find the right NRT product to help you quit smoking
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <OfflineStatusIndicator />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/app/journal')}
            className="h-10 px-4 text-base"
          >
            Track Progress
          </Button>
        </div>
      </div>
      
      {/* Affiliate Stats */}
      {affiliateStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Your Affiliate Stats</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSyncClicks}
                  disabled={syncingClicks || isOffline}
                  className="h-8 px-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${syncingClicks ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{affiliateStats.totalClicks || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{affiliateStats.uniqueProducts || 0}</p>
                  <p className="text-xs text-muted-foreground">Products Viewed</p>
                </div>
                <div>
                  <p className="text-lg font-bold">${affiliateStats.pendingCommission?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-lg font-bold">${affiliateStats.paidCommission?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{(affiliateStats.clickThroughRate * 100).toFixed(0) || 0}%</p>
                  <p className="text-xs text-muted-foreground">CTR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search NRT products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavorites(!showFavorites)}
            className="h-12 px-4 text-base"
          >
            <Star className={`h-5 w-5 mr-2 ${showFavorites ? 'text-yellow-400 fill-yellow-400' : ''}`} />
            Favorites
          </Button>
          
          <Button
            variant={showAffiliate ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAffiliate(!showAffiliate)}
            className="h-12 px-4 text-base"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Shop
          </Button>
        </div>
      </div>
      
      {/* Products tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as NRTCategory)}>
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <TabsList className="mb-4 w-max">
            <TabsTrigger value="all" className="min-w-20 h-12 text-base">All Products</TabsTrigger>
            <TabsTrigger value="gum" className="min-w-20 h-12 text-base">Nicotine Gum</TabsTrigger>
            <TabsTrigger value="pouch" className="min-w-20 h-12 text-base">Nicotine Pouches</TabsTrigger>
            <TabsTrigger value="patch" className="min-w-20 h-12 text-base">Nicotine Patches</TabsTrigger>
            <TabsTrigger value="lozenge" className="min-w-20 h-12 text-base">Lozenges</TabsTrigger>
            <TabsTrigger value="spray" className="min-w-20 h-12 text-base">Nasal Spray</TabsTrigger>
            <TabsTrigger value="inhaler" className="min-w-20 h-12 text-base">Inhalers</TabsTrigger>
          </TabsList>
        </ScrollArea>
        
        {/* Sorting options */}
        <div className="flex items-center justify-end gap-3 mb-4">
          <span className="text-sm font-medium">Sort by:</span>
          <div className="flex rounded-lg overflow-hidden">
            <Button
              size="sm"
              variant={sortCriteria === 'rating' ? 'default' : 'outline'}
              className="rounded-r-none h-10"
              onClick={() => setSortCriteria('rating')}
            >
              <Star className="h-4 w-4 mr-1" />
              Rating
            </Button>
            <Button
              size="sm"
              variant={sortCriteria === 'price' ? 'default' : 'outline'}
              className="rounded-none h-10"
              onClick={() => setSortCriteria('price')}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Price
            </Button>
            <Button
              size="sm"
              variant={sortCriteria === 'effectiveTime' ? 'default' : 'outline'}
              className="rounded-l-none h-10"
              onClick={() => setSortCriteria('effectiveTime')}
            >
              <Zap className="h-4 w-4 mr-1" />
              Speed
            </Button>
          </div>
        </div>
        
        {/* Products grid */}
        <TabsContent value="all" className="mt-0">
          <ProductsGrid
            products={filteredProducts}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            openProductDetail={openProductDetail}
            formatPriceRange={formatPriceRange}
            formatEffectivenessTime={formatEffectivenessTime}
            showAffiliate={showAffiliate}
            onAffiliateClick={handleAffiliateClick}
          />
        </TabsContent>
        
        <TabsContent value="gum" className="mt-0">
          <ProductsGrid
            products={filteredProducts}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            openProductDetail={openProductDetail}
            formatPriceRange={formatPriceRange}
            formatEffectivenessTime={formatEffectivenessTime}
            showAffiliate={showAffiliate}
            onAffiliateClick={handleAffiliateClick}
          />
        </TabsContent>
        
        {/* Repeat for other categories... */}
        
      </Tabs>
      
      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={closeProductDetail}
          onAffiliateClick={handleAffiliateClick}
          showAffiliate={showAffiliate}
          isFavorite={favorites.includes(selectedProduct.id)}
          toggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
};

interface ProductsGridProps {
  products: NRTProduct[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  openProductDetail: (product: NRTProduct) => void;
  formatPriceRange: (min: number, max: number) => string;
  formatEffectivenessTime: (min: number, max: number) => string;
  showAffiliate: boolean;
  onAffiliateClick: (product: NRTProduct) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  favorites,
  toggleFavorite,
  openProductDetail,
  formatPriceRange,
  formatEffectivenessTime,
  showAffiliate,
  onAffiliateClick
}) => {
  // If no products found
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground max-w-md">
          Try changing your search criteria or browse a different category.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <motion.div 
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Card className="overflow-hidden h-full flex flex-col">
            <div 
              className="relative aspect-video bg-muted cursor-pointer"
              onClick={() => openProductDetail(product)}
            >
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                  <ShoppingCart className="h-12 w-12 text-primary/40" />
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="absolute top-2 right-2 h-10 w-10 bg-background/80 hover:bg-background/90"
              >
                <Star className={`h-5 w-5 ${favorites.includes(product.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
            </div>
            
            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <CardTitle 
                    className="text-lg cursor-pointer hover:text-primary transition-colors"
                    onClick={() => openProductDetail(product)}
                  >
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 h-10">
                    {product.description}
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {product.rating.toFixed(1)}★
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pb-0 mt-auto">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Price:</p>
                  <p className="font-medium">{formatPriceRange(product.priceRange.min, product.priceRange.max)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Effect Time:</p>
                  <p className="font-medium">{formatEffectivenessTime(product.effectivenessTime.min, product.effectivenessTime.max)}</p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 mt-2 flex gap-2">
              <Button 
                onClick={() => openProductDetail(product)}
                variant="outline" 
                className="flex-1 h-12"
              >
                Details
              </Button>
              
              {showAffiliate && (
                <Button 
                  onClick={() => onAffiliateClick(product)}
                  className="flex-1 h-12"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Shop
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default NRTDirectory; 