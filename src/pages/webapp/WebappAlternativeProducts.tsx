import React, { useState, useEffect } from "react";
import { Leaf, Search, Star, ChevronDown, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AlternativeProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  pros: string[];
  cons: string[];
  avg_rating: number;
  reviews_count: number;
  price_range: string;
  nicotine_content: string;
}

const WebappAlternativeProducts = () => {
  const [products, setProducts] = useState<AlternativeProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AlternativeProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortOption, setSortOption] = useState("rating");
  const [selectedProduct, setSelectedProduct] = useState<AlternativeProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter and sort products whenever dependencies change
    let filtered = [...products];

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortOption === "rating") {
      filtered.sort((a, b) => b.avg_rating - a.avg_rating);
    } else if (sortOption === "reviews") {
      filtered.sort((a, b) => b.reviews_count - a.reviews_count);
    } else if (sortOption === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  }, [products, filterCategory, searchQuery, sortOption]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Using type assertion to handle the Supabase type error
      const { data, error } = await supabase
        .from('alternative_products' as any)
        .select("*");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Prepare fallback data in case we need it
      const fallbackProducts: AlternativeProduct[] = [
        {
          id: "1",
          name: "JUUL E-cigarette",
          category: "vape",
          description: "Sleek, USB-shaped e-cigarette that uses pre-filled pods with nicotine salts. Popular for its simplicity and cigarette-like nicotine delivery.",
          image_url: "https://images.unsplash.com/photo-1560373545-e0293a5f9c57?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Easy to use", "Discreet", "Satisfying nicotine hit", "No buttons or settings"],
          cons: ["Limited flavor options", "Expensive pods", "Battery life concerns", "Environmental impact of disposable pods"],
          avg_rating: 3.9,
          reviews_count: 245,
          price_range: "$20-35 (device), $15-20 (pods)",
          nicotine_content: "3-5% (30-50mg/ml)"
        },
        {
          id: "2",
          name: "Vuse Alto",
          category: "vape",
          description: "Pen-style e-cigarette with pre-filled pods. Features a longer battery life than many competitors and a simple draw-activated mechanism.",
          image_url: "https://images.unsplash.com/photo-1560373546-090a23976ce2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Long battery life", "Consistent vapor production", "Widely available", "Draw-activated (no button)"],
          cons: ["Limited flavor selection", "Some users report leaking", "Higher nicotine levels only"],
          avg_rating: 3.8,
          reviews_count: 187,
          price_range: "$15-25 (device), $10-15 (pods)",
          nicotine_content: "1.8-5% (18-50mg/ml)"
        },
        {
          id: "3",
          name: "Zyn Nicotine Pouches",
          category: "snus",
          description: "Tobacco-free nicotine pouches that are placed between the gum and lip. Available in various flavors and strengths.",
          image_url: "https://images.unsplash.com/photo-1567607673554-2048def2c6b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Tobacco-free", "Discreet (no spitting)", "Various flavors", "Different strength options"],
          cons: ["Mouth irritation for some users", "May cause hiccups", "Can be addictive"],
          avg_rating: 4.2,
          reviews_count: 312,
          price_range: "$4-7 per can",
          nicotine_content: "3-6mg per pouch"
        },
        {
          id: "4",
          name: "On! Nicotine Pouches",
          category: "snus",
          description: "Small, discreet tobacco-free nicotine pouches with a variety of flavors and strengths. Known for their small size and quick nicotine release.",
          image_url: "https://images.unsplash.com/photo-1567607673559-2048def2c6b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Very discreet (smaller than most pouches)", "Quick nicotine release", "No tobacco", "Multiple flavor options"],
          cons: ["Short-lasting compared to some alternatives", "Can cause gum irritation", "Small size may be difficult to handle"],
          avg_rating: 4.0,
          reviews_count: 178,
          price_range: "$3-6 per can",
          nicotine_content: "2-8mg per pouch"
        },
        {
          id: "5",
          name: "Honeyrose Herbal Cigarettes",
          category: "herbal",
          description: "Tobacco-free and nicotine-free herbal cigarettes made from a blend of herbs and flowers. Provides the ritual of smoking without nicotine.",
          image_url: "https://images.unsplash.com/photo-1567607673564-2048def2c6b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["No nicotine or tobacco", "Helps with hand-to-mouth habit", "Various flavors available", "Legal in most smoke-free areas"],
          cons: ["Still produces harmful smoke", "May trigger smoking urges", "Not a health product"],
          avg_rating: 3.5,
          reviews_count: 92,
          price_range: "$5-10 per pack",
          nicotine_content: "0mg (nicotine-free)"
        },
        {
          id: "6",
          name: "Cyclones Pre-Rolled Hemp Cones",
          category: "herbal",
          description: "Pre-rolled hemp wraps with wooden tips. Can be filled with herbal smoking blends for a tobacco-free smoking experience.",
          image_url: "https://images.unsplash.com/photo-1567607673569-2048def2c6b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Tobacco-free", "Flavored options available", "Wooden tip prevents soggy ends", "Customizable filling"],
          cons: ["Still involves combustion", "May not satisfy nicotine cravings", "Requires filling"],
          avg_rating: 3.7,
          reviews_count: 64,
          price_range: "$2-4 per cone",
          nicotine_content: "0mg (nicotine-free)"
        },
        {
          id: "7",
          name: "Harmless Cigarette",
          category: "zero",
          description: "A non-electronic quit smoking device that looks like a cigarette and provides sensory cues without nicotine, tobacco, or vapor.",
          image_url: "https://images.unsplash.com/photo-1567607673574-2048def2c6b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Addresses hand-to-mouth habit", "No harmful substances", "Reusable", "Helps with psychological addiction"],
          cons: ["No nicotine (may not satisfy cravings)", "Limited sensory experience", "May not work for heavy smokers"],
          avg_rating: 3.3,
          reviews_count: 128,
          price_range: "$15-25",
          nicotine_content: "0mg (nicotine-free)"
        },
        {
          id: "8",
          name: "Ripple+ Diffuser",
          category: "other",
          description: "Personal aromatherapy device that looks like a vape pen but delivers plant-based essential oils. Provides calming effects without nicotine.",
          image_url: "https://images.unsplash.com/photo-1567607673579-2048def2c6b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["No nicotine or tobacco", "Aromatherapy benefits", "Satisfies hand-to-mouth habit", "Various blends for different effects"],
          cons: ["Doesn't address nicotine addiction", "More expensive than some alternatives", "Effects are subtle"],
          avg_rating: 3.9,
          reviews_count: 87,
          price_range: "$20-30 (device), $8-12 (refills)",
          nicotine_content: "0mg (nicotine-free)"
        }
      ];

      if (!data || data.length === 0) {
        console.log("No alternative products found in database, using fallback data");
        
        // Use fallback data if no data is available in the database
        toast({
          title: "Using demo product data",
          description: "No products found in database, showing sample data instead",
          variant: "default",
        });
        
        setProducts(fallbackProducts);
        setFilteredProducts(fallbackProducts);
      } else {
        // Format and use the data from the database
        const formattedProducts = data.map((product: any) => ({
          ...product,
          pros: product.pros || [],
          cons: product.cons || []
        }));

        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      
      // Use fallback data in case of error
      toast({
        title: "Error connecting to database",
        description: "Using sample product data instead",
        variant: "destructive",
      });
      
      // Fallback data for error case
      const fallbackProducts: AlternativeProduct[] = [
        {
          id: "1",
          name: "JUUL E-cigarette",
          category: "vape",
          description: "Sleek, USB-shaped e-cigarette that uses pre-filled pods with nicotine salts. Popular for its simplicity and cigarette-like nicotine delivery.",
          image_url: "https://images.unsplash.com/photo-1560373545-e0293a5f9c57?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Easy to use", "Discreet", "Satisfying nicotine hit", "No buttons or settings"],
          cons: ["Limited flavor options", "Expensive pods", "Battery life concerns", "Environmental impact of disposable pods"],
          avg_rating: 3.9,
          reviews_count: 245,
          price_range: "$20-35 (device), $15-20 (pods)",
          nicotine_content: "3-5% (30-50mg/ml)"
        },
        {
          id: "2",
          name: "Vuse Alto",
          category: "vape",
          description: "Pen-style e-cigarette with pre-filled pods. Features a longer battery life than many competitors and a simple draw-activated mechanism.",
          image_url: "https://images.unsplash.com/photo-1560373546-090a23976ce2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Long battery life", "Consistent vapor production", "Widely available", "Draw-activated (no button)"],
          cons: ["Limited flavor selection", "Some users report leaking", "Higher nicotine levels only"],
          avg_rating: 3.8,
          reviews_count: 187,
          price_range: "$15-25 (device), $10-15 (pods)",
          nicotine_content: "1.8-5% (18-50mg/ml)"
        },
        {
          id: "3",
          name: "Zyn Nicotine Pouches",
          category: "snus",
          description: "Tobacco-free nicotine pouches that are placed between the gum and lip. Available in various flavors and strengths.",
          image_url: "https://images.unsplash.com/photo-1567607673554-2048def2c6b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Tobacco-free", "Discreet (no spitting)", "Various flavors", "Different strength options"],
          cons: ["Mouth irritation for some users", "May cause hiccups", "Can be addictive"],
          avg_rating: 4.2,
          reviews_count: 312,
          price_range: "$4-7 per can",
          nicotine_content: "3-6mg per pouch"
        },
        {
          id: "4",
          name: "On! Nicotine Pouches",
          category: "snus",
          description: "Small, discreet tobacco-free nicotine pouches with a variety of flavors and strengths. Known for their small size and quick nicotine release.",
          image_url: "https://images.unsplash.com/photo-1567607673559-2048def2c6b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Very discreet (smaller than most pouches)", "Quick nicotine release", "No tobacco", "Multiple flavor options"],
          cons: ["Short-lasting compared to some alternatives", "Can cause gum irritation", "Small size may be difficult to handle"],
          avg_rating: 4.0,
          reviews_count: 178,
          price_range: "$3-6 per can",
          nicotine_content: "2-8mg per pouch"
        }
      ];
      
      setProducts(fallbackProducts);
      setFilteredProducts(fallbackProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = (product: AlternativeProduct) => {
    setSelectedProduct(product);
  };

  const productCategories = [
    { value: "all", label: "All Products" },
    { value: "vape", label: "E-cigarettes/Vapes" },
    { value: "snus", label: "Nicotine Pouches/Snus" },
    { value: "herbal", label: "Herbal Cigarettes" },
    { value: "zero", label: "Zero Nicotine" },
    { value: "other", label: "Other Alternatives" },
  ];

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col items-start mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <h1 className="text-3xl font-bold text-green-800">Alternative Products</h1>
        </div>
        <p className="text-gray-600 text-lg mb-4">
          Explore smokeless alternatives to traditional cigarettes that can help you on your journey to quit smoking.
        </p>
        <Separator className="mb-6" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search alternatives..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-md px-3 py-2 bg-white text-gray-800"
            >
              {productCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <ChevronDown className="h-5 w-5 text-gray-500" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border rounded-md px-3 py-2 bg-white text-gray-800"
            >
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4" />
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No products match your search criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setFilterCategory("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col h-full">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Leaf size={48} className="text-green-400" />
                    <span className="text-sm mt-2">No image available</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-50 text-green-800 border-green-200")}>
                    {product.category}
                  </div>
                  <span className="text-sm text-gray-500">{product.price_range}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3 mb-3">{product.description}</p>
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Nicotine Content: </span>
                  <span className="text-sm text-gray-600">{product.nicotine_content}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {renderStars(product.avg_rating)}
                    <span className="ml-2 text-sm text-gray-600">{product.avg_rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">{product.reviews_count} reviews</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleViewProduct(product)}
                >
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Ready to Explore Alternatives?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Finding the right alternative to traditional cigarettes can be a game-changer for your quit smoking journey.
          Sign up now to track your progress, get personalized recommendations, and connect with others who have successfully quit.
        </p>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          Create Free Account
        </Button>
      </div>
    </div>
  );
};

export default WebappAlternativeProducts; 