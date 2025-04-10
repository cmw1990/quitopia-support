import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export const FoodHistory = () => {
  const { session } = useAuth();
  const { data: foodLogs, isLoading } = useQuery({
    queryKey: ['food-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {foodLogs?.map((log) => {
        const analysis = log.ai_analysis ? JSON.parse(log.ai_analysis) : null;
        
        return (
          <Card key={log.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {log.food_name}
              </CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calories:</span>
                  <span className="font-medium">{log.calories}</span>
                </div>
                {analysis && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Protein:</span>
                      <span className="font-medium">{analysis.protein}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Carbs:</span>
                      <span className="font-medium">{analysis.carbs}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fat:</span>
                      <span className="font-medium">{analysis.fat}g</span>
                    </div>
                    {analysis.energyImpact && (
                      <div className="text-sm text-muted-foreground mt-2">
                        {analysis.energyImpact}
                      </div>
                    )}
                  </>
                )}
                {log.image_url && (
                  <img 
                    src={log.image_url} 
                    alt={log.food_name}
                    className="w-full h-48 object-cover rounded-md mt-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {(!foodLogs || foodLogs.length === 0) && (
        <div className="text-center text-muted-foreground py-8">
          No food logs yet
        </div>
      )}
    </div>
  );
};