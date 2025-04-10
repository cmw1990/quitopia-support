
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dumbbell, Apple, AlertCircle } from "lucide-react";
import type { 
  CycleExerciseRecommendation, 
  CycleNutritionRecommendation 
} from "@/types/cycle";

interface Props {
  phaseType: string;
}

export const CycleLifestyleRecommendations = ({ phaseType }: Props) => {
  const { data: exerciseRecs } = useQuery<CycleExerciseRecommendation[]>({
    queryKey: ['cycle_exercise_recommendations', phaseType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycle_exercise_recommendations')
        .select('*')
        .eq('phase_type', phaseType)
        .order('created_at', { ascending: false })
        .returns<CycleExerciseRecommendation[]>();

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!phaseType,
  });

  const { data: nutritionRecs } = useQuery<CycleNutritionRecommendation[]>({
    queryKey: ['cycle_nutrition_recommendations', phaseType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycle_nutrition_recommendations')
        .select('*')
        .eq('phase_type', phaseType)
        .order('created_at', { ascending: false })
        .returns<CycleNutritionRecommendation[]>();

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!phaseType,
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Exercise Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {exerciseRecs?.map((rec) => (
                <div key={rec.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{rec.exercise_type}</h3>
                    <span className="text-sm px-2 py-1 bg-primary/10 rounded-full">
                      {rec.intensity_level}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Benefits:</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {rec.benefits.map((benefit, i) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {rec.precautions?.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          Precautions:
                        </h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {rec.precautions.map((precaution, i) => (
                            <li key={i}>{precaution}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-primary" />
            Nutrition Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {nutritionRecs?.map((rec) => (
                <div key={rec.id} className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">{rec.food_category}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{rec.benefits}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Recommended Foods:</h4>
                      <div className="flex flex-wrap gap-1">
                        {rec.food_items.map((food, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 bg-primary/10 rounded-full"
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Key Nutrients:</h4>
                      <div className="flex flex-wrap gap-1">
                        {rec.nutrients.map((nutrient, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 bg-secondary/10 rounded-full"
                          >
                            {nutrient}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
