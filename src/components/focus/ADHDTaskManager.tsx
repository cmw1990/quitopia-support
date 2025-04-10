import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, ListCheck, Target, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";

interface ADHDTaskOrganization {
  id: string;
  user_id: string;
  task_id: string;
  priority_method: string;
  energy_required: number;
  difficulty_level: number;
  estimated_focus_blocks: number;
  visual_tags: any;
  reward_points: number;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  adhd_task_organization: ADHDTaskOrganization[];
}

export const ADHDTaskManager = () => {
  const { toast } = useToast();
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: tasks } = useQuery({
    queryKey: ['adhd-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          adhd_task_organization (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Task[];
    }
  });

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          ADHD-Friendly Task Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-2"
            >
              <ListCheck className="h-4 w-4" />
              Add Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Prioritize
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Quick Focus Mode
          </Button>
        </div>

        <div className="grid gap-4">
          {tasks?.map((task) => (
            <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {task.adhd_task_organization[0]?.energy_required || 0}/5
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};