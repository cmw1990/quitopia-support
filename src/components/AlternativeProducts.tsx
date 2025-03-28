import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
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
  Badge
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
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';

interface AlternativeProductsProps {
  session: Session | null;
}

// Interface for alternative nicotine product
interface AlternativeProduct {
  id: number;
  name: string;
  type: 'pouch' | 'lozenge' | 'tablet' | 'toothpick' | 'gum';
  strengthOptions: string[];
  brand: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  image: string;
  available: boolean;
  flavors: string[];
}

export const AlternativeProducts: React.FC<AlternativeProductsProps> = ({ session }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sample alternative products data
  const alternativeProducts: AlternativeProduct[] = [
    {
      id: 1,
      name: 'ZYN Nicotine Pouches',
      type: 'pouch',
      strengthOptions: ['6mg', '3mg'],
      brand: 'ZYN',
      rating: 4.7,
      reviews: 2453,
      price: '$32.99',
      description: 'Tobacco-free nicotine pouches that fit discreetly under your lip for a clean nicotine experience without smoke or spit.',
      pros: ['Completely smoke-free', 'No tobacco', 'Discreet to use anywhere', 'No staining'],
      cons: ['May cause gum irritation', 'Limited flavor duration'],
      bestFor: ['Social situations', 'Work environments', 'Discreet nicotine use'],
      image: 'https://via.placeholder.com/150',
      available: true,
      flavors: ['Mint', 'Wintergreen', 'Coffee', 'Cinnamon']
    },
    {
      id: 2,
      name: 'VELO Nicotine Lozenges',
      type: 'lozenge',
      strengthOptions: ['4mg', '2mg'],
      brand: 'VELO',
      rating: 4.2,
      reviews: 1182,
      price: '$29.99',
      description: 'Tobacco-free nicotine lozenges that dissolve in your mouth, providing a clean nicotine experience without smoke.',
      pros: ['Discreet', 'No spitting required', 'Convenient for on-the-go'],
      cons: ['May cause hiccups', 'Shorter duration than pouches'],
      bestFor: ['Office workers', 'Public settings', 'Quick nicotine relief'],
      image: 'https://via.placeholder.com/150',
      available: true,
      flavors: ['Mint', 'Citrus', 'Berry']
    },
    {
      id: 3,
      name: 'Lucy Nicotine Gum',
      type: 'gum',
      strengthOptions: ['4mg', '2mg'],
      brand: 'Lucy',
      rating: 4.4,
      reviews: 865,
      price: '$35.99',
      description: 'Modern nicotine gum with improved flavor and texture compared to traditional NRT gum products.',
      pros: ['Better taste than traditional nicotine gum', 'Familiar format', 'Adjustable usage'],
      cons: ['Requires proper chewing technique', 'May cause jaw fatigue'],
      bestFor: ['Former smokers familiar with nicotine gum', 'Those who enjoy chewing gum'],
      image: 'https://via.placeholder.com/150',
      available: true,
      flavors: ['Wintergreen', 'Cinnamon', 'Pomegranate', 'Mango']
    },
    {
      id: 4,
      name: 'ROGUE Nicotine Tablets',
      type: 'tablet',
      strengthOptions: ['4mg', '2mg'],
      brand: 'ROGUE',
      rating: 4.1,
      reviews: 532,
      price: '$27.99',
      description: 'Small nicotine tablets that dissolve under your tongue for a quick nicotine experience.',
      pros: ['Fast-acting', 'Discreet size', 'No chewing required'],
      cons: ['Short duration', 'Limited flavor options'],
      bestFor: ['Quick nicotine needs', 'Discreet usage', 'On-the-go'],
      image: 'https://via.placeholder.com/150',
      available: true,
      flavors: ['Mint', 'Wintergreen']
    },
    {
      id: 5,
      name: 'NicoFix Toothpicks',
      type: 'toothpick',
      strengthOptions: ['3mg per pick'],
      brand: 'NicoFix',
      rating: 3.9,
      reviews: 421,
      price: '$19.99',
      description: 'Wooden toothpicks infused with nicotine that provide both oral stimulation and nicotine delivery.',
      pros: ['Mimics hand-to-mouth habit', 'Provides oral fixation', 'Socially acceptable'],
      cons: ['Variable nicotine delivery', 'Can splinter', 'Limited duration'],
      bestFor: ['Those who miss the hand-to-mouth ritual', 'Social settings', 'After meals'],
      image: 'https://via.placeholder.com/150',
      available: true,
      flavors: ['Cinnamon', 'Mint', 'Unflavored']
    }
  ];

  // Filter products by type and search query
  const filteredProducts = alternativeProducts.filter(product => {
    const matchesType = filterType === 'all' || product.type === filterType;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviews - a.reviews;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${
              i < Math.floor(rating) 
                ? 'text-yellow-500 fill-yellow-500' 
                : i < rating 
                  ? 'text-yellow-500 fill-yellow-500 opacity-50' 
                  : 'text-gray-300'
            }`} 
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Render product type icon
  const renderTypeIcon = (type: string) => {
    switch(type) {
      case 'pouch':
        return <Droplets className="h-5 w-5 text-green-500" />;
      case 'lozenge':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'tablet':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'toothpick':
        return <Leaf className="h-5 w-5 text-amber-500" />;
      case 'gum':
        return <ThumbsUp className="h-5 w-5 text-pink-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-3">Alternative Nicotine Products</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Explore smoke-free, tobacco-free alternatives to help others stay fresh. These modern options
          provide nicotine without the harmful effects of combustion.
        </p>
        
        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-green-200 dark:border-green-700 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="border-green-200 dark:border-green-700">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pouch">Pouches</SelectItem>
                <SelectItem value="lozenge">Lozenges</SelectItem>
                <SelectItem value="tablet">Tablets</SelectItem>
                <SelectItem value="toothpick">Toothpicks</SelectItem>
                <SelectItem value="gum">Gum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-green-200 dark:border-green-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviewed</SelectItem>
                <SelectItem value="name">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {renderTypeIcon(product.type)}
                    <Badge className="text-xs capitalize bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700">
                      {product.type}
                    </Badge>
                  </div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-500">
                    {product.price}
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">{product.name}</CardTitle>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-sm text-gray-500">{product.brand}</div>
                  {renderStars(product.rating)}
                </div>
                <div className="text-xs text-gray-500">{product.reviews} reviews</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{product.description}</p>
                
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Available Strengths:</div>
                  <div className="flex flex-wrap gap-1">
                    {product.strengthOptions.map((strength, idx) => (
                      <Badge key={idx} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-none">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Flavors:</div>
                  <div className="flex flex-wrap gap-1">
                    {product.flavors.map((flavor, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                        {flavor}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Tabs defaultValue="pros" className="mt-4">
                  <TabsList className="w-full bg-green-100 dark:bg-green-900/30">
                    <TabsTrigger value="pros" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Pros</TabsTrigger>
                    <TabsTrigger value="cons" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Cons</TabsTrigger>
                    <TabsTrigger value="bestFor" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Best For</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pros" className="border-none p-2">
                    <ul className="text-sm list-disc pl-5 text-gray-600 dark:text-gray-400">
                      {product.pros.map((pro, idx) => (
                        <li key={idx}>{pro}</li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="cons" className="border-none p-2">
                    <ul className="text-sm list-disc pl-5 text-gray-600 dark:text-gray-400">
                      {product.cons.map((con, idx) => (
                        <li key={idx}>{con}</li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="bestFor" className="border-none p-2">
                    <ul className="text-sm list-disc pl-5 text-gray-600 dark:text-gray-400">
                      {product.bestFor.map((best, idx) => (
                        <li key={idx}>{best}</li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-green-100 dark:border-green-900/50 pt-4">
                <Badge className={product.available ? "bg-green-600" : "bg-gray-400"}>
                  {product.available ? "In Stock" : "Out of Stock"}
                </Badge>
                <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-10 border rounded-lg mt-4 border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
            <Button 
              variant="link" 
              onClick={() => {setFilterType('all'); setSearchQuery('');}}
              className="mt-2 text-green-600 dark:text-green-500"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Help section */}
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mt-12 border border-green-100 dark:border-green-800">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
          Helping Others Stay Fresh with Modern Alternatives
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          These smoke-free, tobacco-free alternatives can help others maintain freshness without the harmful effects of combustion.
          They're ideal for those who find traditional quitting methods too challenging.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-700 dark:text-green-400">Smoke-Free Benefits</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No combustion means no tar, carbon monoxide, or thousands of other harmful chemicals found in smoke.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-700 dark:text-green-400">Transition Products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                These can be used as stepping stones toward complete nicotine cessation or as long-term alternatives.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-700 dark:text-green-400">Harm Reduction</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                While not risk-free, these products are generally considered much less harmful than continued smoking.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-700 dark:text-green-400">Social Acceptance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                These discreet options can be used in many places where smoking is prohibited.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Button className="bg-green-600 hover:bg-green-700">
            Share This Information
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Remember: The best option is complete cessation, but these alternatives can be helpful for those who struggle with traditional methods.
          </p>
        </div>
      </div>
    </div>
  );
}; 