import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Wind } from "lucide-react";

export function HealthImprovements() {
  const { session } = useAuth();

  const { data: milestones } = useQuery({
    queryKey: ['health-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recovery_milestones')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('achieved_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const improvements = [
    {
      icon: Heart,
      title: "Cardiovascular",
      description: "Blood pressure and circulation improving",
      timeframe: "2-12 weeks",
    },
    {
      icon: Brain,
      title: "Mental Clarity",
      description: "Better focus and reduced anxiety",
      timeframe: "1-4 weeks",
    },
    {
      icon: Wind,
      title: "Respiratory",
      description: "Breathing capacity increasing",
      timeframe: "1-9 months",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Improvements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {improvements.map((improvement, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <improvement.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{improvement.title}</h4>
                <p className="text-sm text-muted-foreground">{improvement.description}</p>
                <p className="text-xs text-muted-foreground">Expected: {improvement.timeframe}</p>
              </div>
            </div>
          ))}
        </div>

        {milestones && milestones.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2">Your Achievements</h4>
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="text-sm">
                  {milestone.health_improvements?.map((improvement, i) => (
                    <p key={i} className="text-muted-foreground">• {improvement}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}