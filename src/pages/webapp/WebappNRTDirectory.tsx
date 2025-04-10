import React, { useState, useEffect } from "react";
import { Cigarette, Search, Star, ChevronDown, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NRTProduct {
  id: string;
  name: string;
  type: string;
  description: string;
  image_url: string;
  pros: string[];
  cons: string[];
  avg_rating: number;
  reviews_count: number;
  price_range: string;
}

const WebappNRTDirectory = () => {
  const [products, setProducts] = useState<NRTProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<NRTProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("rating");
  const [selectedProduct, setSelectedProduct] = useState<NRTProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter and sort products whenever dependencies change
    let filtered = [...products];

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (product) => product.type.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.type.toLowerCase().includes(query)
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
  }, [products, filterType, searchQuery, sortOption]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Using type assertion to handle the Supabase type error
      const { data, error } = await supabase
        .from('nrt_products' as any)
        .select("*");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Prepare fallback data in case we need it
      const fallbackProducts: NRTProduct[] = [
        {
          id: "1",
          name: "NicoDerm CQ Patch",
          type: "patch",
          description: "Clear nicotine patches that deliver a steady flow of nicotine through the skin and into the body. Available in different strengths for a step-down approach.",
          image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Easy to use", "Discreet", "Steady nicotine delivery", "Once-daily application"],
          cons: ["Skin irritation for some users", "Can't adjust timing of dose", "May not address hand-to-mouth habit"],
          avg_rating: 4.2,
          reviews_count: 127,
          price_range: "$30-45"
        },
        {
          id: "2",
          name: "Nicorette Gum",
          type: "gum",
          description: "Chewing gum that releases nicotine into the bloodstream through the lining of the mouth. Available in different flavors and strengths.",
          image_url: "https://images.unsplash.com/photo-1577076626969-e4a91b8aec68?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Addresses oral fixation", "Control when you use it", "Various flavors available", "Quick craving relief"],
          cons: ["Proper chewing technique required", "May cause jaw soreness", "Can't eat or drink 15 minutes before/during use"],
          avg_rating: 4.0,
          reviews_count: 215,
          price_range: "$40-50"
        },
        {
          id: "3",
          name: "Nicorette Lozenge",
          type: "lozenge",
          description: "Candy-like tablets that dissolve in the mouth, releasing nicotine that is absorbed through the lining of the mouth.",
          image_url: "https://images.unsplash.com/photo-1563241806-025d9b725b88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Discreet to use", "No chewing required", "Various flavors available", "Convenient for sudden cravings"],
          cons: ["Can cause hiccups or heartburn", "Can't eat or drink while using", "May take practice to use correctly"],
          avg_rating: 4.3,
          reviews_count: 178,
          price_range: "$35-45"
        },
        {
          id: "4",
          name: "Nicotrol Inhaler",
          type: "inhaler",
          description: "Plastic mouthpiece and cartridge that delivers nicotine vapor when inhaled. Mimics the hand-to-mouth motion of smoking.",
          image_url: "https://images.unsplash.com/photo-1561197522-b1a50333c03a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Mimics hand-to-mouth action", "Control when you use it", "Can stop and resume using same cartridge", "Addresses behavioral aspect"],
          cons: ["More visible to use", "Can cause mouth/throat irritation", "Frequent use required (6-16 cartridges daily)"],
          avg_rating: 3.8,
          reviews_count: 92,
          price_range: "$50-60"
        },
        {
          id: "5",
          name: "Nicotrol NS Nasal Spray",
          type: "spray",
          description: "Pump bottle containing nicotine solution that is sprayed directly into the nostril. Provides the fastest delivery of nicotine among NRT products.",
          image_url: "https://images.unsplash.com/photo-1585149193051-7201f34b7abe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Fastest acting NRT", "Control when you use it", "Good for intense cravings", "Mimics quick nicotine spike from smoking"],
          cons: ["Can cause nasal and eye irritation", "More visible to use", "More side effects than other NRTs"],
          avg_rating: 3.7,
          reviews_count: 64,
          price_range: "$60-70"
        }
      ];

      if (!data || data.length === 0) {
        console.log("No NRT products found in database, using fallback data");
        
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
      
      // Fallback data
      const fallbackProducts: NRTProduct[] = [
        {
          id: "1",
          name: "NicoDerm CQ Patch",
          type: "patch",
          description: "Clear nicotine patches that deliver a steady flow of nicotine through the skin and into the body. Available in different strengths for a step-down approach.",
          image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Easy to use", "Discreet", "Steady nicotine delivery", "Once-daily application"],
          cons: ["Skin irritation for some users", "Can't adjust timing of dose", "May not address hand-to-mouth habit"],
          avg_rating: 4.2,
          reviews_count: 127,
          price_range: "$30-45"
        },
        {
          id: "2",
          name: "Nicorette Gum",
          type: "gum",
          description: "Chewing gum that releases nicotine into the bloodstream through the lining of the mouth. Available in different flavors and strengths.",
          image_url: "https://images.unsplash.com/photo-1577076626969-e4a91b8aec68?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Addresses oral fixation", "Control when you use it", "Various flavors available", "Quick craving relief"],
          cons: ["Proper chewing technique required", "May cause jaw soreness", "Can't eat or drink 15 minutes before/during use"],
          avg_rating: 4.0,
          reviews_count: 215,
          price_range: "$40-50"
        },
        {
          id: "3",
          name: "Nicorette Lozenge",
          type: "lozenge",
          description: "Candy-like tablets that dissolve in the mouth, releasing nicotine that is absorbed through the lining of the mouth.",
          image_url: "https://images.unsplash.com/photo-1563241806-025d9b725b88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Discreet to use", "No chewing required", "Various flavors available", "Convenient for sudden cravings"],
          cons: ["Can cause hiccups or heartburn", "Can't eat or drink while using", "May take practice to use correctly"],
          avg_rating: 4.3,
          reviews_count: 178,
          price_range: "$35-45"
        },
        {
          id: "4",
          name: "Nicotrol Inhaler",
          type: "inhaler",
          description: "Plastic mouthpiece and cartridge that delivers nicotine vapor when inhaled. Mimics the hand-to-mouth motion of smoking.",
          image_url: "https://images.unsplash.com/photo-1561197522-b1a50333c03a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Mimics hand-to-mouth action", "Control when you use it", "Can stop and resume using same cartridge", "Addresses behavioral aspect"],
          cons: ["More visible to use", "Can cause mouth/throat irritation", "Frequent use required (6-16 cartridges daily)"],
          avg_rating: 3.8,
          reviews_count: 92,
          price_range: "$50-60"
        },
        {
          id: "5",
          name: "Nicotrol NS Nasal Spray",
          type: "spray",
          description: "Pump bottle containing nicotine solution that is sprayed directly into the nostril. Provides the fastest delivery of nicotine among NRT products.",
          image_url: "https://images.unsplash.com/photo-1585149193051-7201f34b7abe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          pros: ["Fastest acting NRT", "Control when you use it", "Good for intense cravings", "Mimics quick nicotine spike from smoking"],
          cons: ["Can cause nasal and eye irritation", "More visible to use", "More side effects than other NRTs"],
          avg_rating: 3.7,
          reviews_count: 64,
          price_range: "$60-70"
        }
      ];
      
      setProducts(fallbackProducts);
      setFilteredProducts(fallbackProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = (product: NRTProduct) => {
    setSelectedProduct(product);
  };

  const productTypes = [
    { value: "all", label: "All Products" },
    { value: "gum", label: "Nicotine Gum" },
    { value: "patch", label: "Nicotine Patches" },
    { value: "lozenge", label: "Nicotine Lozenges" },
    { value: "inhaler", label: "Nicotine Inhalers" },
    { value: "spray", label: "Nicotine Sprays" },
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
          <Cigarette className="h-6 w-6 text-green-600" />
          <h1 className="text-3xl font-bold text-green-800">NRT Directory</h1>
        </div>
        <p className="text-gray-600 text-lg mb-4">
          Browse our comprehensive collection of Nicotine Replacement Therapy products to support your quit smoking journey.
        </p>
        <Separator className="mb-6" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-md px-3 py-2 bg-white text-gray-800"
            >
              {productTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
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
              setFilterType("all");
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
                    <Cigarette size={48} className="text-green-400" />
                    <span className="text-sm mt-2">No image available</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-50 text-green-800 border-green-200")}>
                    {product.type}
                  </div>
                  <span className="text-sm text-gray-500">{product.price_range}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3 mb-4">{product.description}</p>
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
        <h2 className="text-2xl font-bold text-green-800 mb-4">Ready to Quit Smoking?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          NRT products can double your chances of quitting successfully. Sign up now to track your progress,
          get personalized recommendations, and connect with a supportive community.
        </p>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          Create Free Account
        </Button>
      </div>
    </div>
  );
};

export default WebappNRTDirectory; 