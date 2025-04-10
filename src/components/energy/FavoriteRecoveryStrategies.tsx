import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { userStrategiesApi } from '@/api/supabase-rest'; // Corrected import
import { Loader2, Star, StarOff, Trash2, Timer, Battery, Brain, Heart, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface FavoriteStrategy {
  id: string;
  strategy_name: string;
  description: string;
  energy_type: 'mental' | 'physical' | 'emotional' | 'overall';
  effectiveness_rating: number;
  contexts_used: string[];
  is_favorite: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export function FavoriteRecoveryStrategies() {
  const { toast } = useToast();
  const { session } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [strategies, setStrategies] = useState<FavoriteStrategy[]>([]);
  const [activeType, setActiveType] = useState<'mental' | 'physical' | 'emotional' | 'overall'>('overall');
  
  useEffect(() => {
    fetchStrategies();
  }, [session]);
  
  const fetchStrategies = async () => {
    setIsLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) {
        console.warn('[FavoriteRecoveryStrategies] No user ID found in session, skipping fetch.');
        setIsLoading(false); // Ensure loading stops if no user ID
        return; // Don't proceed if no user ID
      }
      // Corrected API object name
      const { data, error } = await userStrategiesApi.getUserStrategies(userId);
      if (error) throw error; // Propagate error
      
      if (data && Array.isArray(data)) {
        // Sort by favorite status and usage count
        const sortedData = [...data].sort((a, b) => {
          if (a.is_favorite !== b.is_favorite) {
            return a.is_favorite ? -1 : 1;
          }
          return b.usage_count - a.usage_count;
        });
        
        setStrategies(sortedData);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast({
        title: "Error",
        description: "Failed to load your favorite strategies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleFavorite = async (strategyId: string, currentStatus: boolean) => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        console.error('Error toggling favorite: No user ID available.');
        toast({ title: "Error", description: "Cannot update favorite status: User not authenticated.", variant: "destructive" });
        return;
      }
      // Corrected API object name, remove session arg
      await userStrategiesApi.toggleFavoriteStrategy(strategyId, !currentStatus, userId);
      // Update local state
      setStrategies(strategies.map(strategy => 
        strategy.id === strategyId 
          ? { ...strategy, is_favorite: !currentStatus } 
          : strategy
      ));
      
      toast({
        title: currentStatus ? "Removed from favorites" : "Added to favorites",
        description: `Strategy has been ${currentStatus ? 'removed from' : 'added to'} your favorites.`,
      });
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const incrementUsage = async (strategyId: string) => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        console.error('Error incrementing usage: No user ID available.');
        toast({ title: "Error", description: "Cannot update usage count: User not authenticated.", variant: "destructive" });
        return;
      }
      // Corrected API object name, remove session arg
      await userStrategiesApi.incrementStrategyUsage(strategyId, userId);
      // Update local state
      setStrategies(strategies.map(strategy => 
        strategy.id === strategyId 
          ? { ...strategy, usage_count: strategy.usage_count + 1 } 
          : strategy
      ));
      
      toast({
        title: "Strategy Applied",
        description: "This strategy has been marked as used. Great job!",
      });
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      toast({
        title: "Error",
        description: "Failed to update usage count. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const deleteStrategy = async (strategyId: string) => {
    try {
      // Corrected API object name, remove session arg
      await userStrategiesApi.deleteUserStrategy(strategyId);
      
      // Update local state
      setStrategies(strategies.filter(strategy => strategy.id !== strategyId));
      
      toast({
        title: "Strategy Deleted",
        description: "The strategy has been removed from your list.",
      });
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast({
        title: "Error",
        description: "Failed to delete strategy. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getEnergyTypeIcon = (type: string) => {
    switch (type) {
      case 'mental':
        return <Brain className="h-5 w-5" />;
      case 'physical':
        return <Activity className="h-5 w-5" />;
      case 'emotional':
        return <Heart className="h-5 w-5" />;
      default:
        return <Battery className="h-5 w-5" />;
    }
  };
  
  // Filter strategies by active type or show all if 'overall' is selected
  const filteredStrategies = activeType === 'overall'
    ? strategies
    : strategies.filter(s => s.energy_type === activeType);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Favorite Recovery Strategies
        </CardTitle>
        <CardDescription>
          Your personalized collection of effective energy management strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs defaultValue="overall" value={activeType} onValueChange={(value) => setActiveType(value as any)}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overall" className="flex items-center gap-1">
                  <Battery className="h-4 w-4" />
                  <span className="hidden sm:inline">All</span>
                </TabsTrigger>
                <TabsTrigger value="mental" className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Mental</span>
                </TabsTrigger>
                <TabsTrigger value="physical" className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Physical</span>
                </TabsTrigger>
                <TabsTrigger value="emotional" className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Emotional</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {filteredStrategies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStrategies.map(strategy => (
                  <motion.div
                    key={strategy.id}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getEnergyTypeIcon(strategy.energy_type)}
                            <CardTitle className="text-lg">{strategy.strategy_name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">Used {strategy.usage_count} times</Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => toggleFavorite(strategy.id, strategy.is_favorite)}
                            >
                              {strategy.is_favorite ? (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">{strategy.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {strategy.contexts_used.map(context => (
                            <Badge key={context} variant="outline" className="text-xs">
                              {context}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-muted-foreground">Effectiveness:</span>
                          <div className="flex">
                            {Array.from({ length: strategy.effectiveness_rating }).map((_, i) => (
                              <div key={i} className="w-1 h-3 bg-primary rounded-sm mr-[2px]" />
                            ))}
                            {Array.from({ length: 10 - strategy.effectiveness_rating }).map((_, i) => (
                              <div key={i} className="w-1 h-3 bg-muted rounded-sm mr-[2px]" />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteStrategy(strategy.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => incrementUsage(strategy.id)}
                        >
                          <Timer className="h-4 w-4 mr-1" />
                          Use Strategy
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-lg font-medium">No favorite strategies found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeType === 'overall' 
                    ? "You haven't saved any recovery strategies yet."
                    : `You don't have any ${activeType} recovery strategies saved.`}
                </p>
                <Button className="mt-4">
                  Discover Strategies
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 