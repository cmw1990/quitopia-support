
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import type { Plan } from "@/types/energyPlans";

export function EnergyPlanDetailsPage() {
  const { id } = useParams();

  const { data: plan, isLoading } = useQuery({
    queryKey: ['energy-plan', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('energy_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Plan;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!plan) {
    return <div>Plan not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>{plan.description}</p>
          <div>
            <h3 className="font-medium">Plan Type</h3>
            <p>{plan.plan_type}</p>
          </div>
          <div>
            <h3 className="font-medium">Category</h3>
            <p>{plan.category}</p>
          </div>
          {plan.energy_level_required && (
            <div>
              <h3 className="font-medium">Required Energy Level</h3>
              <p>{plan.energy_level_required}</p>
            </div>
          )}
          {plan.estimated_duration_minutes && (
            <div>
              <h3 className="font-medium">Estimated Duration</h3>
              <p>{plan.estimated_duration_minutes} minutes</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
