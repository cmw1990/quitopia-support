import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cigarette, 
  Package, 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ArrowUpDown, 
  Check, 
  Plus, 
  Battery, 
  Shield, 
  Star
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  Button, 
  Input, 
  Badge, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectGroup, 
  SelectLabel, 
  SelectItem,
  Slider,
  Tabs,
  TabsList,
  TabsTrigger,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '../../components/ui';
import { ProductComparisonModal } from './ProductComparisonModal';
import { PRODUCT_CATEGORIES, NICOTINE_PRODUCTS } from './productData';
import { NicotineProduct } from '../../types/dataTypes';

// Helper function to get icon for product category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'cigarette':
      return <Cigarette className="h-5 w-5" />;
    case 'vape':
      return <Battery className="h-5 w-5" />;
    case 'pouch':
    case 'gum':
    case 'lozenge':
      return <Package className="h-5 w-5" />;
    case 'patch':
      return <Shield className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

// Helper function to get color for nicotine strength
const getStrengthColor = (strength: number) => {
  if (strength < 4) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  if (strength < 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
};

export const ProductCatalog: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<NicotineProduct[]>(NICOTINE_PRODUCTS);
  const [selectedProducts, setSelectedProducts] = useState<NicotineProduct[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [strengthRange, setStrengthRange] = useState<[number, number]>([0, 50]);
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [filterFlavors, setFilterFlavors] = useState<string[]>([]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Get unique brands and flavors for filtering
  const uniqueBrands = useMemo(() => {
    const brands = NICOTINE_PRODUCTS.map(product => product.brand);
    return [...new Set(brands)]; // Remove duplicates
  }, []);
  
  const uniqueFlavors = useMemo(() => {
    const flavors: string[] = [];
    NICOTINE_PRODUCTS.forEach(product => {
      if (product.flavors && Array.isArray(product.flavors)) {
        flavors.push(...product.flavors);
      }
    });
    return [...new Set(flavors)]; // Remove duplicates
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...NICOTINE_PRODUCTS];
    
    // Filter by category
    if (activeCategories.length > 0) {
      result = result.filter(product => activeCategories.includes(product.category));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.brand.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }
    
    // Filter by nicotine strength
    result = result.filter(
      product => 
        product.nicotine_strength >= strengthRange[0] && 
        product.nicotine_strength <= strengthRange[1]
    );
    
    // Filter by brands
    if (filterBrands.length > 0) {
      result = result.filter(product => filterBrands.includes(product.brand));
    }
    
    // Filter by flavors
    if (filterFlavors.length > 0) {
      result = result.filter(
        product => 
          product.flavors?.some(flavor => filterFlavors.includes(flavor))
      );
    }
    
    // Sort the filtered products
    result = sortProducts(result, sortBy);
    
    setFilteredProducts(result);
  }, [
    activeCategories, 
    searchQuery, 
    sortBy, 
    strengthRange, 
    filterBrands, 
    filterFlavors
  ]);
  
  // Sort products based on selected criteria
  const sortProducts = (products: NicotineProduct[], sortBy: string) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'strength_asc':
          return a.nicotine_strength - b.nicotine_strength;
        case 'strength_desc':
          return b.nicotine_strength - a.nicotine_strength;
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        default:
          return 0;
      }
    });
  };
  
  // Toggle product selection for comparison
  const toggleProductSelection = (product: NicotineProduct) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      if (selectedProducts.length < 3) {
        setSelectedProducts([...selectedProducts, product]);
      } else {
        // You can add a toast notification here
        alert('You can only compare up to 3 products at a time');
      }
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategories([]);
    setStrengthRange([0, 50]);
    setFilterBrands([]);
    setFilterFlavors([]);
    setSortBy('name');
  };
  
  // Toggle filter helper
  const toggleFilter = (value: string, currentFilters: string[], setFilter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentFilters.includes(value)) {
      setFilter(currentFilters.filter(v => v !== value));
    } else {
      setFilter([...currentFilters, value]);
    }
  };
  
  // Add product to user's collection
  const addToUserProducts = (product: NicotineProduct) => {
    // In a real app, this would add to the user's collection
    // For now we'll just show an alert
    alert(`Added ${product.name} to your collection`);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Nicotine Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse and compare nicotine products across various categories
          </p>
        </div>
        
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedProducts([])}
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsComparisonOpen(true)}
            >
              Compare
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar for desktop */}
        <div className="hidden lg:block w-64 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Categories</h3>
            <div className="space-y-2">
              {PRODUCT_CATEGORIES.map(category => (
                <div 
                  key={category.id}
                  className={`
                    flex items-center justify-between p-2 rounded-md cursor-pointer
                    ${activeCategories.includes(category.id) 
                      ? 'bg-primary/10 text-primary border border-primary/30' 
                      : 'hover:bg-accent'}
                  `}
                  onClick={() => toggleFilter(
                    category.id, 
                    activeCategories, 
                    setActiveCategories
                  )}
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category.id)}
                    <span>{category.name}</span>
                  </div>
                  {activeCategories.includes(category.id) && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Nicotine Strength</h3>
            <div className="px-3">
              <Slider
                defaultValue={[0, 50]}
                value={strengthRange}
                onValueChange={(value) => setStrengthRange(value as [number, number])}
                min={0}
                max={50}
                step={1}
                className="mt-6"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{strengthRange[0]} mg</span>
                <span>{strengthRange[1]} mg</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Brands</h3>
              {filterBrands.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilterBrands([])}
                  className="h-8 px-2"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {uniqueBrands.map((brand) => (
                <div 
                  key={brand}
                  className={`
                    flex items-center justify-between p-2 rounded-md cursor-pointer
                    ${filterBrands.includes(brand) 
                      ? 'bg-primary/10 text-primary border border-primary/30' 
                      : 'hover:bg-accent'}
                  `}
                  onClick={() => toggleFilter(brand, filterBrands, setFilterBrands)}
                >
                  <span>{brand}</span>
                  {filterBrands.includes(brand) && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {uniqueFlavors.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Flavors</h3>
                {filterFlavors.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFilterFlavors([])}
                    className="h-8 px-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueFlavors.map((flavor) => (
                  <Badge 
                    key={flavor}
                    variant={filterFlavors.includes(flavor) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter(flavor, filterFlavors, setFilterFlavors)}
                  >
                    {flavor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="w-full"
          >
            Reset All Filters
          </Button>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 space-y-6">
          {/* Search and sorting */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, brand or description..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <X 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" 
                  onClick={() => setSearchQuery('')}
                />
              )}
            </div>
            
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sort by</SelectLabel>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="brand">Brand (A-Z)</SelectItem>
                    <SelectItem value="strength_asc">Strength (Low to High)</SelectItem>
                    <SelectItem value="strength_desc">Strength (High to Low)</SelectItem>
                    <SelectItem value="rating">Rating (Best First)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              {/* Mobile filter button */}
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                      Refine your product search with these filters
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {PRODUCT_CATEGORIES.map(category => (
                          <Badge 
                            key={category.id}
                            variant={activeCategories.includes(category.id) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleFilter(category.id, activeCategories, setActiveCategories)}
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Nicotine Strength</h4>
                      <div className="px-2">
                        <Slider
                          defaultValue={[0, 50]}
                          value={strengthRange}
                          onValueChange={(value) => setStrengthRange(value as [number, number])}
                          min={0}
                          max={50}
                          step={1}
                          className="mt-6"
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>{strengthRange[0]} mg</span>
                          <span>{strengthRange[1]} mg</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Brands</h4>
                      <div className="flex flex-wrap gap-2">
                        {uniqueBrands.slice(0, 10).map((brand) => (
                          <Badge 
                            key={brand} 
                            variant={filterBrands.includes(brand) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleFilter(brand, filterBrands, setFilterBrands)}
                          >
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {uniqueFlavors.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Flavors</h4>
                        <div className="flex flex-wrap gap-2">
                          {uniqueFlavors.slice(0, 15).map((flavor) => (
                            <Badge 
                              key={flavor} 
                              variant={filterFlavors.includes(flavor) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleFilter(flavor, filterFlavors, setFilterFlavors)}
                            >
                              {flavor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <SheetFooter>
                    <Button variant="outline" onClick={resetFilters}>
                      Reset All Filters
                    </Button>
                    <SheetClose asChild>
                      <Button type="submit">Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Product categories for mobile */}
          <div className="lg:hidden">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full overflow-x-auto flex flex-nowrap whitespace-nowrap justify-start px-1">
                <TabsTrigger value="all" className="flex-shrink-0">All</TabsTrigger>
                {PRODUCT_CATEGORIES.map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex-shrink-0"
                    onClick={() => setActiveCategories([category.id])}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Filter badges */}
          {(activeCategories.length > 0 || filterBrands.length > 0 || filterFlavors.length > 0 || strengthRange[0] > 0 || strengthRange[1] < 50) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Active filters:</span>
              
              {activeCategories.map(categoryId => {
                const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
                return (
                  <Badge key={categoryId} variant="secondary" className="flex gap-1 items-center">
                    {category?.name || categoryId}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setActiveCategories(activeCategories.filter(id => id !== categoryId))}
                    />
                  </Badge>
                );
              })}
              
              {filterBrands.map(brand => (
                <Badge key={brand} variant="secondary" className="flex gap-1 items-center">
                  Brand: {brand}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilterBrands(filterBrands.filter(b => b !== brand))}
                  />
                </Badge>
              ))}
              
              {filterFlavors.map(flavor => (
                <Badge key={flavor} variant="secondary" className="flex gap-1 items-center">
                  Flavor: {flavor}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilterFlavors(filterFlavors.filter(f => f !== flavor))}
                  />
                </Badge>
              ))}
              
              {(strengthRange[0] > 0 || strengthRange[1] < 50) && (
                <Badge variant="secondary" className="flex gap-1 items-center">
                  Strength: {strengthRange[0]}-{strengthRange[1]} mg
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setStrengthRange([0, 50])}
                  />
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters} 
                className="h-7 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
          
          {/* Results summary */}
          <div className="text-sm text-muted-foreground">
            Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </div>
          
          {/* Product grid */}
          <ProductGrid 
            products={filteredProducts} 
            selectedProducts={selectedProducts}
            toggleSelection={toggleProductSelection}
            addToUserProducts={addToUserProducts}
          />
          
          {/* No results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Products Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find products matching your criteria. Try adjusting your filters or search terms.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Product comparison modal */}
      <ProductComparisonModal 
        isOpen={isComparisonOpen} 
        onClose={() => setIsComparisonOpen(false)} 
        products={selectedProducts}
      />
    </div>
  );
};

// Product Grid component
interface ProductGridProps {
  products: NicotineProduct[];
  selectedProducts: NicotineProduct[];
  toggleSelection: (product: NicotineProduct) => void;
  addToUserProducts: (product: NicotineProduct) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  selectedProducts,
  toggleSelection,
  addToUserProducts
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <Card 
          key={product.id}
          className={`overflow-hidden ${
            selectedProducts.some(p => p.id === product.id) 
              ? 'ring-2 ring-primary' 
              : ''
          }`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
                  {getCategoryIcon(product.category)}
                </div>
                <div>
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                </div>
              </div>
              
              <Badge className={getStrengthColor(product.nicotine_strength)}>
                {product.nicotine_strength} mg
              </Badge>
            </div>
            
            <div className="mt-4 space-y-3">
              {product.description && (
                <p className="text-sm line-clamp-2">{product.description}</p>
              )}
              
              {product.flavors && product.flavors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.flavors.slice(0, 3).map(flavor => (
                    <Badge key={flavor} variant="outline" className="text-xs">
                      {flavor}
                    </Badge>
                  ))}
                  {product.flavors.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.flavors.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              {product.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.average_rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product.total_reviews} reviews)
                  </span>
                </div>
              )}
              
              <div className="text-sm">
                <span className="text-muted-foreground">Price:</span> {product.price_range}
              </div>
            </div>
          </div>
          
          <CardFooter className="bg-muted/40 p-3 flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleSelection(product)}
              className={
                selectedProducts.some(p => p.id === product.id) 
                  ? 'bg-primary/10 border-primary/30' 
                  : ''
              }
            >
              {selectedProducts.some(p => p.id === product.id) ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Selected
                </>
              ) : (
                'Compare'
              )}
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => addToUserProducts(product)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}; 