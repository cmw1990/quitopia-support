
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
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, ClipboardList, CheckCircle } from "lucide-react";
import { TreatmentPlan } from "@/types/ConsultationTypes";
import { format } from "date-fns";

interface TreatmentPlanManagerProps {
  clientId: string;
}

export function TreatmentPlanManager({ clientId }: TreatmentPlanManagerProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    goals: [] as { title: string; description?: string; completed: boolean }[],
    interventions: [] as { type: string; description: string; frequency?: string }[],
    start_date: "",
    end_date: ""
  });

  const { data: plans } = useQuery({
    queryKey: ['treatment-plans', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TreatmentPlan[];
    },
    enabled: !!clientId
  });

  const addPlan = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .insert([{
          client_id: clientId,
          professional_id: session?.user?.id,
          title: newPlan.title,
          description: newPlan.description,
          goals: newPlan.goals,
          interventions: newPlan.interventions,
          start_date: newPlan.start_date,
          end_date: newPlan.end_date,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans'] });
      setNewPlan({
        title: "",
        description: "",
        goals: [],
        interventions: [],
        start_date: "",
        end_date: ""
      });
      toast({
        title: "Success",
        description: "Treatment plan added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add treatment plan",
        variant: "destructive"
      });
      console.error('Treatment plan error:', error);
    }
  });

  const addGoal = () => {
    setNewPlan(prev => ({
      ...prev,
      goals: [...prev.goals, { title: "", description: "", completed: false }]
    }));
  };

  const addIntervention = () => {
    setNewPlan(prev => ({
      ...prev,
      interventions: [...prev.interventions, { type: "", description: "", frequency: "" }]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Treatment Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Plan title"
              value={newPlan.title}
              onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Plan description"
              value={newPlan.description}
              onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newPlan.start_date ? format(new Date(newPlan.start_date), 'PPP') : <span>Start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    if (date) {
                      setNewPlan(prev => ({ 
                        ...prev, 
                        start_date: date.toISOString().split('T')[0]
                      }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newPlan.end_date ? format(new Date(newPlan.end_date), 'PPP') : <span>End date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    if (date) {
                      setNewPlan(prev => ({ 
                        ...prev, 
                        end_date: date.toISOString().split('T')[0]
                      }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Goals</h3>
              <Button variant="outline" size="sm" onClick={addGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
            {newPlan.goals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <Input
                  placeholder="Goal title"
                  value={goal.title}
                  onChange={(e) => {
                    const goals = [...newPlan.goals];
                    goals[index].title = e.target.value;
                    setNewPlan(prev => ({ ...prev, goals }));
                  }}
                />
                <Textarea
                  placeholder="Goal description"
                  value={goal.description}
                  onChange={(e) => {
                    const goals = [...newPlan.goals];
                    goals[index].description = e.target.value;
                    setNewPlan(prev => ({ ...prev, goals }));
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Interventions</h3>
              <Button variant="outline" size="sm" onClick={addIntervention}>
                <Plus className="h-4 w-4 mr-2" />
                Add Intervention
              </Button>
            </div>
            {newPlan.interventions.map((intervention, index) => (
              <div key={index} className="space-y-2">
                <Input
                  placeholder="Intervention type"
                  value={intervention.type}
                  onChange={(e) => {
                    const interventions = [...newPlan.interventions];
                    interventions[index].type = e.target.value;
                    setNewPlan(prev => ({ ...prev, interventions }));
                  }}
                />
                <Textarea
                  placeholder="Intervention description"
                  value={intervention.description}
                  onChange={(e) => {
                    const interventions = [...newPlan.interventions];
                    interventions[index].description = e.target.value;
                    setNewPlan(prev => ({ ...prev, interventions }));
                  }}
                />
                <Input
                  placeholder="Frequency (e.g., daily, weekly)"
                  value={intervention.frequency}
                  onChange={(e) => {
                    const interventions = [...newPlan.interventions];
                    interventions[index].frequency = e.target.value;
                    setNewPlan(prev => ({ ...prev, interventions }));
                  }}
                />
              </div>
            ))}
          </div>

          <Button 
            className="w-full" 
            onClick={() => addPlan.mutate()}
            disabled={!newPlan.title || addPlan.isPending}
          >
            Create Treatment Plan
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {plans?.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  {plan.title}
                </div>
                <span className={`text-sm font-normal px-2 py-1 rounded-full ${
                  plan.status === 'active' ? 'bg-green-100 text-green-800' :
                  plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {plan.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{plan.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Start Date:</span>
                  <span className="ml-2">
                    {plan.start_date && format(new Date(plan.start_date), 'PPP')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">End Date:</span>
                  <span className="ml-2">
                    {plan.end_date && format(new Date(plan.end_date), 'PPP')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Goals</h3>
                <div className="space-y-2">
                  {plan.goals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${
                        goal.completed ? 'text-green-500' : 'text-muted-foreground'
                      }`} />
                      <span>{goal.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Interventions</h3>
                <div className="space-y-4">
                  {plan.interventions.map((intervention, index) => (
                    <div key={index} className="space-y-1">
                      <h4 className="font-medium">{intervention.type}</h4>
                      <p className="text-sm text-muted-foreground">{intervention.description}</p>
                      {intervention.frequency && (
                        <p className="text-sm">Frequency: {intervention.frequency}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
