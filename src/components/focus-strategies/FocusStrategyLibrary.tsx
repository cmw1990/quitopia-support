import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusStrategyService } from '@/services/focusStrategyService';
import type { FocusStrategy } from '@/types/focusStrategy';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { Star, BookOpen, Brain, Zap, Tag } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupedStrategies {
  [category: string]: FocusStrategy[];
}

export const FocusStrategyLibrary: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  // --- React Query Hooks ---
  const { data: strategies, isLoading, error } = useQuery<FocusStrategy[], Error>({
    queryKey: ['focusStrategies'],
    queryFn: async () => {
      const { data, error } = await focusStrategyService.getStrategies();
      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => 
      focusStrategyService.setFavoriteStatus(id, isFavorite),
    onSuccess: (result) => {
      const updatedStrategy = result.data;
      if (!updatedStrategy) return;

       queryClient.setQueryData(['focusStrategies'], (oldData: FocusStrategy[] | undefined) => 
         oldData ? oldData.map(s => s.id === updatedStrategy.id ? updatedStrategy : s) : []
       );
      // Optionally invalidate the whole list if sorting by favorite matters
      // queryClient.invalidateQueries({ queryKey: ['focusStrategies'] });
      toast({ title: "Success", description: `Strategy ${updatedStrategy.is_favorite ? 'favorited' : 'unfavorited'}.` });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update favorite status: ${error.message}`, variant: "destructive" });
    },
  });
  
  // --- Data Processing ---
  const groupedStrategies = useMemo(() => {
    if (!strategies) return {};
    return strategies.reduce((acc, strategy) => {
      const category = strategy.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(strategy);
      return acc;
    }, {} as GroupedStrategies);
  }, [strategies]);

  // --- Event Handlers ---
  const handleToggleFavorite = (strategyId: string, currentStatus: boolean) => {
    favoriteMutation.mutate({ id: strategyId, isFavorite: !currentStatus });
  };

  // --- Rendering ---
  const renderStrategyCard = (strategy: FocusStrategy) => (
      <Card 
        key={strategy.id} 
        className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-primary/20"
      >
        <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{strategy.name}</CardTitle>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleToggleFavorite(strategy.id, strategy.is_favorite)}
                    className={`h-8 w-8 ${strategy.is_favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-yellow-500'}`}
                    aria-label={strategy.is_favorite ? 'Unfavorite' : 'Favorite'}
                 >
                    <Star fill={strategy.is_favorite ? 'currentColor' : 'none'} className="h-5 w-5" />
                 </Button>
            </div>
             <CardDescription className="text-sm pt-1">{strategy.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
            {/* Collapsible additional info */} 
            <Accordion type="single" collapsible value={expandedStrategy === strategy.id ? strategy.id : undefined} onValueChange={() => setExpandedStrategy(expandedStrategy === strategy.id ? null : strategy.id)}>
                <AccordionItem value={strategy.id} className="border-none">
                    {/* Only show trigger if content exists */} 
                    {(strategy.implementation_guide || strategy.scientific_backing) && (
                        <AccordionTrigger className="text-sm py-1 hover:no-underline justify-start text-blue-600 hover:text-blue-800">
                           Details
                        </AccordionTrigger>
                    )}
                    <AccordionContent className="pt-3 space-y-3">
                        {strategy.implementation_guide && (
                            <div>
                                <h4 className="font-semibold text-sm mb-1 flex items-center"><BookOpen className="h-4 w-4 mr-1.5 text-blue-500"/> How to Use:</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strategy.implementation_guide}</p>
                            </div>
                        )}
                         {strategy.scientific_backing && (
                            <div>
                                <h4 className="font-semibold text-sm mb-1 flex items-center"><Brain className="h-4 w-4 mr-1.5 text-purple-500"/> Scientific Backing:</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strategy.scientific_backing}</p>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
        {(strategy.tags && strategy.tags.length > 0) && (
            <CardFooter className="pt-0 pb-3 flex flex-wrap gap-1.5">
                {strategy.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal"><Tag className="h-3 w-3 mr-1"/>{tag}</Badge>
                ))}
            </CardFooter>
        )}
      </Card>
  );

 const renderSkeletonGroup = () => (
     <div className="mb-8">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="mb-4">
                    <CardHeader className="pb-3">
                         <div className="flex justify-between items-start">
                             <Skeleton className="h-5 w-3/5 mb-2" />
                             <Skeleton className="h-6 w-6 rounded-full" />
                         </div>
                         <Skeleton className="h-4 w-4/5" />
                    </CardHeader>
                    <CardContent className="pb-3">
                         <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                     <CardFooter className="pt-0 pb-3 flex flex-wrap gap-1.5">
                         <Skeleton className="h-5 w-12 rounded-full" />
                         <Skeleton className="h-5 w-16 rounded-full" />
                     </CardFooter>
                </Card>
            ))}
        </div>
     </div>
 );

  return (
    <div className="p-4 md:p-6">
      <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
      >
        <h1 className="text-3xl font-bold">Focus Strategy Library</h1>
        <p className="text-muted-foreground mt-1">Explore evidence-based techniques to enhance your focus.</p>
      </motion.div>

      {isLoading && (
           <> 
            {renderSkeletonGroup()}
            {renderSkeletonGroup()}
           </>
      )}
      {error && <p className="text-red-500">Error loading strategies: {error.message}</p>}
      {!isLoading && !error && Object.keys(groupedStrategies).length === 0 && (
          <p>No focus strategies found.</p>
      )}

      {!isLoading && !error && Object.entries(groupedStrategies).map(([category, categoryStrategies]) => (
        <motion.div 
            key={category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * Object.keys(groupedStrategies).indexOf(category) }}
            className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border flex items-center">
            {/* Icon mapping - can be expanded */} 
            {category === 'Time Management' && <Zap className="h-5 w-5 mr-2 text-orange-500" />}
            {category === 'Distraction Control' && <Zap className="h-5 w-5 mr-2 text-red-500" />}
            {category === 'Energy Management' && <Zap className="h-5 w-5 mr-2 text-green-500" />}
            {category === 'ADHD Specific' && <Brain className="h-5 w-5 mr-2 text-indigo-500" />}
             {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {categoryStrategies.map(strategy => (
                 <motion.div
                     key={strategy.id}
                     layout // Animate layout changes (e.g., when details expand)
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ duration: 0.2 }}
                 >
                    {renderStrategyCard(strategy)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 