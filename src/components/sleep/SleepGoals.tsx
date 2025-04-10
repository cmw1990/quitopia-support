import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Check, Clock, ArrowRight, Edit, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sleepDb } from "@/lib/sleep-db";
import { format, parse } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export function SleepGoals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [goal, setGoal] = useState({
    target_duration: 8,
    target_quality: 8,
    bedtime_target: "22:00",
    wake_time_target: "06:00",
    description: "",
  });

  // Fetch sleep goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["sleep-goals"],
    queryFn: () => sleepDb.getSleepGoals(),
  });

  // Create sleep goal
  const createGoalMutation = useMutation({
    mutationFn: () => sleepDb.createSleepGoal(goal),
    onSuccess: () => {
      toast({
        title: "Goal Created",
        description: "Your sleep goal has been set successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["sleep-goals"] });
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: "Failed to create sleep goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update sleep goal (mark as completed)
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      sleepDb.updateSleepGoal(id, data),
    onSuccess: () => {
      toast({
        title: "Goal Updated",
        description: "Your sleep goal has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["sleep-goals"] });
    },
    onError: (error) => {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update sleep goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setGoal({
      target_duration: 8,
      target_quality: 8,
      bedtime_target: "22:00",
      wake_time_target: "06:00",
      description: "",
    });
  };

  const handleCreateGoal = () => {
    createGoalMutation.mutate();
  };

  const toggleGoalCompletion = (id: string, isCompleted: boolean) => {
    updateGoalMutation.mutate({
      id,
      data: { completed: !isCompleted },
    });
  };

  const formatTimeString = (timeStr: string) => {
    try {
      const time = parse(timeStr, "HH:mm", new Date());
      return format(time, "h:mm a");
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Sleep Goals
          </CardTitle>
          {!isCreating && (
            <Button size="sm" onClick={() => setIsCreating(true)}>
              Add Goal
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreating ? (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Create New Sleep Goal</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Target Sleep Duration (hours)</Label>
                <Slider
                  value={[goal.target_duration]}
                  onValueChange={([value]) =>
                    setGoal({ ...goal, target_duration: value })
                  }
                  min={5}
                  max={12}
                  step={0.5}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5h</span>
                  <span>{goal.target_duration}h</span>
                  <span>12h</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Sleep Quality (1-10)</Label>
                <Slider
                  value={[goal.target_quality]}
                  onValueChange={([value]) =>
                    setGoal({ ...goal, target_quality: value })
                  }
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Poor</span>
                  <span>{goal.target_quality}/10</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Bedtime</Label>
                  <Input
                    type="time"
                    value={goal.bedtime_target}
                    onChange={(e) =>
                      setGoal({ ...goal, bedtime_target: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Wake Time</Label>
                  <Input
                    type="time"
                    value={goal.wake_time_target}
                    onChange={(e) =>
                      setGoal({ ...goal, wake_time_target: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Describe your sleep goal..."
                  value={goal.description}
                  onChange={(e) =>
                    setGoal({ ...goal, description: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>Save Goal</Button>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading your sleep goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
            <div className="text-muted-foreground">No sleep goals set yet</div>
            <Button onClick={() => setIsCreating(true)}>Create First Goal</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goalItem: any) => (
              <Card key={goalItem.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {goalItem.description || "Sleep Goal"}
                      </h3>
                      {goalItem.completed && (
                        <Badge className="bg-green-500">Completed</Badge>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTimeString(goalItem.bedtime_target)}
                          <ArrowRight className="h-3 w-3 inline mx-1" />
                          {formatTimeString(goalItem.wake_time_target)}
                        </span>
                      </div>
                      <div>
                        Target: {goalItem.target_duration} hours,{" "}
                        {goalItem.target_quality}/10 quality
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={goalItem.completed}
                      onCheckedChange={() =>
                        toggleGoalCompletion(goalItem.id, goalItem.completed)
                      }
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <Progress
                    value={goalItem.completed ? 100 : 50}
                    className="h-2"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 