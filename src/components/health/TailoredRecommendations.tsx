import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Brain, Battery, Activity, BookOpen } from "lucide-react";

export const TailoredRecommendations = () => {
  const { session } = useAuth();

  const { data: recommendations } = useQuery({
    queryKey: ['tailored-recommendations'],
    queryFn: async () => {
      // First get user's conditions
      const { data: conditions } = await supabase
        .from('user_health_conditions')
        .select('conditions')
        .eq('user_id', session?.user?.id)
        .single();

      if (!conditions?.conditions?.length) return [];

      // Then get recommendations for those conditions
      const { data: recommendations, error } = await supabase
        .from('tailored_recommendations')
        .select('*')
        .in('condition', conditions.conditions)
        .order('priority', { ascending: true });

      if (error) throw error;
      return recommendations;
    },
    enabled: !!session?.user?.id,
  });

  if (!recommendations?.length) return null;

  const getIcon = (category: string) => {
    switch (category) {
      case 'energy':
        return <Battery className="h-5 w-5 text-yellow-500 mt-1" />;
      case 'memory':
        return <BookOpen className="h-5 w-5 text-purple-500 mt-1" />;
      case 'focus':
        return <Brain className="h-5 w-5 text-blue-500 mt-1" />;
      default:
        return <Activity className="h-5 w-5 text-green-500 mt-1" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Personalized Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              {getIcon(rec.category)}
              <div>
                <h4 className="font-medium">{rec.title}</h4>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};