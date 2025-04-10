
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import type { PlanType, PlanCategory } from "@/types/energyPlans";

export function CreateEnergyPlanPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        visibility: 'public',
        is_expert_plan: false,
        energy_level_required: parseInt(formData.get('energy_level') as string) || null,
        estimated_duration_minutes: parseInt(formData.get('duration') as string) || null,
      };

      const { data, error } = await supabase
        .from('energy_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Plan created",
        description: "Your energy plan has been created successfully."
      });

      navigate(`/energy-plans/${data.id}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Could not create energy plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Energy Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input name="title" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea name="description" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plan Type</label>
            <Input name="plan_type" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Input name="category" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Required Energy Level</label>
            <Input type="number" name="energy_level" min="0" max="10" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <Input type="number" name="duration" min="1" />
          </div>
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/energy-plans")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create Plan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
