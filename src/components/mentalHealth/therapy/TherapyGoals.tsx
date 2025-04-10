import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mentalHealthDb } from "@/lib/mental-health-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Circle, CircleDot, PauseCircle } from "lucide-react";

const STATUS_ICONS = {
  'not_started': Circle,
  'in_progress': CircleDot,
  'completed': CheckCircle2,
  'on_hold': PauseCircle
};

const STATUS_COLORS = {
  'not_started': 'bg-gray-200 hover:bg-gray-300',
  'in_progress': 'bg-blue-200 hover:bg-blue-300',
  'completed': 'bg-green-200 hover:bg-green-300',
  'on_hold': 'bg-yellow-200 hover:bg-yellow-300'
};

export function TherapyGoals() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState<Date>();
  const [progressNote, setProgressNote] = useState('');

  // Get therapy goals
  const { data: goals, refetch } = useQuery({
    queryKey: ['therapy-goals'],
    queryFn: async () => {
      const { data, error } = await mentalHealthDb.getTherapyGoals();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const createGoal = async () => {
    if (!session?.user?.id || !title) return;

    try {
      await mentalHealthDb.createTherapyGoal({
        title,
        description: description || undefined,
        target_date: targetDate,
        status: 'not_started',
        progress_notes: []
      });

      toast({
        title: "Success",
        description: "Therapy goal created successfully",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setTargetDate(undefined);

      // Refresh data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create therapy goal",
        variant: "destructive"
      });
    }
  };

  const updateGoalStatus = async (goalId: string, status: 'not_started' | 'in_progress' | 'completed' | 'on_hold') => {
    try {
      await mentalHealthDb.updateTherapyGoal(goalId, { status });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal status",
        variant: "destructive"
      });
    }
  };

  const addProgressNote = async (goalId: string) => {
    if (!progressNote) return;

    try {
      const goal = goals?.find(g => g.id === goalId);
      if (!goal) return;

      await mentalHealthDb.updateTherapyGoal(goalId, {
        progress_notes: [...(goal.progress_notes || []), progressNote]
      });

      setProgressNote('');
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add progress note",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal in detail..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!targetDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={createGoal} className="w-full">
            Create Goal
          </Button>
        </CardContent>
      </Card>

      {goals?.map((goal) => (
        <Card key={goal.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{goal.title}</CardTitle>
                {goal.target_date && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Target: {format(new Date(goal.target_date), "PPP")}
                  </div>
                )}
              </div>
              <Select
                value={goal.status}
                onValueChange={(value: 'not_started' | 'in_progress' | 'completed' | 'on_hold') => 
                  updateGoalStatus(goal.id, value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a progress note..."
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                />
                <Button onClick={() => addProgressNote(goal.id)}>
                  Add Note
                </Button>
              </div>

              {goal.progress_notes && goal.progress_notes.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">Progress Notes</h4>
                  <div className="space-y-2">
                    {goal.progress_notes.map((note, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-muted rounded-md"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
