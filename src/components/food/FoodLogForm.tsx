import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Loader2, Upload, Search, Heart } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const FoodLogForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if food is favorited when food name changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session?.user?.id || !foodName) return;
      
      try {
        const { data } = await supabase
          .from('favorite_foods')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('food_name', foodName)
          .maybeSingle();
        
        setIsFavorite(!!data);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [foodName, session?.user?.id]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['food-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { foods: [] };
      const { data, error } = await supabase.functions.invoke('food-database-search', {
        body: { query: searchQuery }
      });
      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length > 2,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFoodSelect = async (food: { 
    name: string; 
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }) => {
    setFoodName(food.name);
    setCalories(food.calories.toString());
    if (food.protein) setProtein(food.protein.toString());
    if (food.carbs) setCarbs(food.carbs.toString());
    if (food.fat) setFat(food.fat.toString());
    setOpen(false);

    // Check if selected food is a favorite
    if (session?.user?.id) {
      try {
        const { data } = await supabase
          .from('favorite_foods')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('food_name', food.name)
          .maybeSingle();
        
        setIsFavorite(!!data);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!session?.user?.id || !foodName) return;
    
    try {
      const { data: existingFavorite } = await supabase
        .from('favorite_foods')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('food_name', foodName)
        .maybeSingle();

      if (existingFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_foods')
          .delete()
          .eq('user_id', session.user.id)
          .eq('food_name', foodName);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: `${foodName} has been removed from your favorites`,
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_foods')
          .insert({
            user_id: session.user.id,
            food_name: foodName,
            calories: calories ? parseInt(calories) : null,
            protein_grams: protein ? parseFloat(protein) : null,
            carbs_grams: carbs ? parseFloat(carbs) : null,
            fat_grams: fat ? parseFloat(fat) : null,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: `${foodName} has been added to your favorites`,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to log food",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = "";
      let aiAnalysis = null;
      
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('food-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;

        setIsAnalyzing(true);
        try {
          const { data: analysisData, error: analysisError } = await supabase.functions
            .invoke('analyze-food', {
              body: { imageUrl, mealType }
            });

          if (analysisError) throw analysisError;
          aiAnalysis = analysisData.analysis;
        } catch (analysisError) {
          console.error('Error analyzing food image:', analysisError);
          toast({
            title: "Warning",
            description: "Food logged successfully, but image analysis failed",
            variant: "default",
          });
        }
      }

      const { error: logError } = await supabase
        .from('food_logs')
        .insert({
          user_id: session.user.id,
          food_name: foodName,
          calories: calories ? parseInt(calories) : null,
          protein_grams: protein ? parseFloat(protein) : null,
          carbs_grams: carbs ? parseFloat(carbs) : null,
          fat_grams: fat ? parseFloat(fat) : null,
          meal_type: mealType,
          image_url: imageUrl || null,
          ai_analysis: aiAnalysis
        });

      if (logError) throw logError;

      toast({
        title: "Success",
        description: "Food logged successfully",
      });

      // Reset form
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setMealType("");
      setSelectedFile(null);
      setSearchQuery("");
      setIsFavorite(false);
    } catch (error) {
      console.error('Error logging food:', error);
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="foodSearch">Search Food</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {foodName || "Search for food..."}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Search food database..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandEmpty>No food found.</CommandEmpty>
              <CommandGroup>
                {isSearching && (
                  <CommandItem disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </CommandItem>
                )}
                {searchResults?.foods?.map((food: any) => (
                  <CommandItem
                    key={food.name}
                    value={food.name}
                    onSelect={() => handleFoodSelect(food)}
                  >
                    <div className="flex flex-col">
                      <span>{food.name}</span>
                      <span className="text-sm text-gray-500">
                        {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g., 500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="protein">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="e.g., 20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carbs">Carbs (g)</Label>
          <Input
            id="carbs"
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="e.g., 50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fat">Fat (g)</Label>
          <Input
            id="fat"
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="e.g., 15"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mealType">Meal Type</Label>
        <Select value={mealType} onValueChange={setMealType}>
          <SelectTrigger>
            <SelectValue placeholder="Select meal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="foodImage">Food Image (for AI analysis)</Label>
        <Input
          id="foodImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isUploading || isAnalyzing || !foodName || !mealType}
        >
          {isUploading || isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isAnalyzing ? 'Analyzing...' : 'Uploading...'}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Log Food
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={toggleFavorite}
          disabled={!foodName}
          className={cn(
            "w-12",
            isFavorite && "bg-pink-100 hover:bg-pink-200"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current text-pink-500")} />
        </Button>
      </div>
    </form>
  );
};