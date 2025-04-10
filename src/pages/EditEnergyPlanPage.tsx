
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import type { Plan, PlanType, PlanCategory } from "@/types/energyPlans";

export function EditEnergyPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const planData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        plan_type: formData.get('plan_type') as PlanType,
        category: formData.get('category') as PlanCategory,
        energy_level_required: parseInt(formData.get('energy_level') as string) || null,
        estimated_duration_minutes: parseInt(formData.get('duration') as string) || null,
      };

      const { error } = await supabase
        .from('energy_plans')
        .update(planData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Plan updated",
        description: "Your energy plan has been updated successfully."
      });

      navigate(`/energy-plans/${id}`);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Could not update energy plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!plan) {
    return <div>Plan not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Energy Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input name="title" defaultValue={plan.title} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea name="description" defaultValue={plan.description || ''} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plan Type</label>
            <Input name="plan_type" defaultValue={plan.plan_type} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Input name="category" defaultValue={plan.category} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Required Energy Level</label>
            <Input 
              type="number" 
              name="energy_level" 
              min="0" 
              max="10"
              defaultValue={plan.energy_level_required} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <Input 
              type="number" 
              name="duration" 
              min="1"
              defaultValue={plan.estimated_duration_minutes} 
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/energy-plans/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Update Plan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
