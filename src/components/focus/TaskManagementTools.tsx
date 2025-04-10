import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ListCheck, Target, Clock, Brain } from "lucide-react";
import { supabasePost } from "@/lib/supabaseApiService";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  name: string;
  estimatedMinutes: number;
  actualMinutes?: number;
}

export const TaskManagementTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const addTask = () => {
    if (!newTask || !timeEstimate) {
      toast({
        title: "Missing information",
        description: "Please enter both task name and time estimate",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTask,
      estimatedMinutes: parseInt(timeEstimate),
    };

    setTasks([...tasks, task]);
    setNewTask("");
    setTimeEstimate("");

    toast({
      title: "Task added",
      description: "Your task has been added to the list",
    });
  };

  const startTask = (taskId: string) => {
    setCurrentTaskId(taskId);
    setStartTime(new Date());
    setIsTraining(true);
  };

  const completeTask = async (taskId: string) => {
    if (!startTime || !user?.id) return;

    const endTime = new Date();
    const actualMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, actualMinutes } : t
    );
    setTasks(updatedTasks);
    setCurrentTaskId(null);
    setStartTime(null);
    setIsTraining(false);

    const estimationAccuracy = Math.round(
      (Math.min(task.estimatedMinutes, actualMinutes) / 
       Math.max(task.estimatedMinutes, actualMinutes)) * 100
    );

    try {
      const { error } = await supabasePost(
        "energy_focus_logs",
        [{
          user_id: user.id,
          activity_type: "time_estimation",
          activity_name: task.name,
          duration_minutes: actualMinutes,
          focus_rating: estimationAccuracy,
          notes: `Estimated: ${task.estimatedMinutes}min, Actual: ${actualMinutes}min`,
        }]
      );

      if (error) throw error;

      toast({
        title: "Task completed!",
        description: `Estimation accuracy: ${estimationAccuracy}%`,
      });
    } catch (error) {
      console.error("Error saving task completion:", error);
      toast({
        title: "Error saving task",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListCheck className="h-5 w-5" />
          Task Management & Time Estimation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>New Task</Label>
              <Input
                placeholder="Enter task name"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Time Estimate (minutes)</Label>
              <Input
                type="number"
                placeholder="Enter estimated minutes"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
              />
            </div>
            <Button onClick={addTask} className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted"
              >
                <div>
                  <p className="font-medium">{task.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Estimated: {task.estimatedMinutes} minutes
                    {task.actualMinutes && ` • Actual: ${task.actualMinutes} minutes`}
                  </p>
                </div>
                {currentTaskId === task.id ? (
                  <Button
                    variant="default"
                    onClick={() => completeTask(task.id)}
                    className="ml-2"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                ) : (
                  !task.actualMinutes && (
                    <Button
                      variant="outline"
                      onClick={() => startTask(task.id)}
                      className="ml-2"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {isTraining && (
          <div className="p-4 rounded-lg bg-primary/10 space-y-2">
            <h3 className="font-semibold">Time Estimation Training Tips</h3>
            <ul className="space-y-1 text-sm">
              <li>• Focus solely on the current task</li>
              <li>• Notice what affects your timing</li>
              <li>• Learn from each estimation</li>
              <li>• Consider breaking larger tasks into smaller ones</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};