
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, Target } from "lucide-react";
import { ClientGoal } from "@/types/ConsultationTypes";
import { format } from "date-fns";

interface ClientGoalsManagerProps {
  clientId: string;
}

export function ClientGoalsManager({ clientId }: ClientGoalsManagerProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>();
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_date: "",
  });

  const { data: goals } = useQuery({
    queryKey: ['client-goals', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_goals')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientGoal[];
    },
    enabled: !!clientId
  });

  const addGoal = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('client_goals')
        .insert([{
          client_id: clientId,
          professional_id: session?.user?.id,
          title: newGoal.title,
          description: newGoal.description,
          target_date: newGoal.target_date,
          status: 'in_progress',
          progress: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-goals'] });
      setNewGoal({ title: "", description: "", target_date: "" });
      toast({
        title: "Success",
        description: "Goal added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive"
      });
      console.error('Goal error:', error);
    }
  });

  const updateGoalProgress = useMutation({
    mutationFn: async ({ goalId, progress }: { goalId: string; progress: number }) => {
      const { data, error } = await supabase
        .from('client_goals')
        .update({ progress })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-goals'] });
      toast({
        title: "Success",
        description: "Progress updated successfully"
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Goal title"
              value={newGoal.title}
              onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Goal description"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newGoal.target_date ? format(new Date(newGoal.target_date), 'PPP') : <span>Pick a target date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    setDate(date);
                    if (date) {
                      setNewGoal(prev => ({ 
                        ...prev, 
                        target_date: date.toISOString().split('T')[0]
                      }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            className="w-full" 
            onClick={() => addGoal.mutate()}
            disabled={!newGoal.title || addGoal.isPending}
          >
            Add Goal
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {goals?.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {goal.title}
                </div>
                <span className="text-sm font-normal">
                  {goal.target_date && format(new Date(goal.target_date), 'PPP')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{goal.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                </div>
                <Slider
                  value={[goal.progress]}
                  max={100}
                  step={5}
                  onValueChange={([value]) => {
                    updateGoalProgress.mutate({ goalId: goal.id, progress: value });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
