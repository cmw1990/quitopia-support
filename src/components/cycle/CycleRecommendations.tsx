
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import type { CyclePhaseRecommendation } from "@/types/cycle";

export const CycleRecommendations = ({ phaseType }: { phaseType: string }) => {
  const { data: recommendations } = useQuery<CyclePhaseRecommendation[]>({
    queryKey: ['cycle_recommendations', phaseType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycle_phase_recommendations')
        .select('*')
        .eq('phase_type', phaseType)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!phaseType,
  });

  if (!recommendations?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Phase Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{rec.title}</h3>
              <p className="text-muted-foreground">{rec.description}</p>
              {rec.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {rec.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
