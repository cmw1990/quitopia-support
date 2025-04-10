import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AlertTriangle, ArrowRight, Brain, Clock } from "lucide-react";
import { motion, AnimatePresence, MotionProps } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description?: string;
  urgency_level: number;
  importance_level: number;
  quadrant: number;
  energy_required?: number;
  estimated_time?: number;
  actual_time?: number;
  deadline?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  tags: string[];
  category?: string;
  color?: string;
  progress?: number;
  priority_score?: number;
  complexity?: 'low' | 'medium' | 'high';
  batch_id?: string;
  parent_task_id?: string;
  subtasks?: Task[];
  last_updated: string;
}

interface QuadrantAnalytics {
  taskCount: number;
  completionRate: number;
  averageTime: number;
  overdueTasks: number;
  priorityScore: number;
}

interface TaskSuggestion {
  title: string;
  quadrant: number;
  reason: string;
  confidence: number;
}

export const EisenhowerMatrix = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quadrantAnalytics, setQuadrantAnalytics] = useState<Record<number, QuadrantAnalytics>>({});
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortingCriteria, setSortingCriteria] = useState<'priority' | 'deadline' | 'energy' | 'complexity'>('priority');
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    quadrant: 4,
    energy_required: 3,
    complexity: 'medium',
    status: 'not_started'
  });
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [showHelp, setShowHelp] = useState(false);
  const [taskViewPreferences, setTaskViewPreferences] = useState({
    showDescription: true,
    showDates: true,
    showProgress: true,
    showTags: true,
    fontSize: 'normal' as 'small' | 'normal' | 'large',
    colorIntensity: 'normal' as 'soft' | 'normal' | 'vibrant'
  });

  // Main task query with expanded data
  const { data: taskData } = useQuery<Task[]>({
    queryKey: ['tasks-with-priority', activeFilters, sortingCriteria],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/tasks?select=*,task_prioritization(urgency_level,importance_level,quadrant,energy_required)&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  });

  // Analytics query for insights
  const { data: analyticsData } = useQuery<any>({
    queryKey: ['matrix-analytics'],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/task_analytics?select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data[0];
    }
  });

  // Update analytics when data changes
  useEffect(() => {
    if (analyticsData) {
      calculateQuadrantAnalytics(analyticsData);
      generateTaskSuggestions(analyticsData);
    }
  }, [analyticsData]);

  // Batch update mutation
  const batchUpdateTasks = useMutation<void, Error, { tasks: string[], updates: Partial<Task> }>({
    mutationFn: async ({ tasks, updates }) => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/task_prioritization`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) throw new Error('Failed to update tasks');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-with-priority'] });
      toast({
        title: "Batch update complete",
        description: `Successfully updated ${selectedTasks.length} tasks.`
      });
      setSelectedTasks([]);
    }
  });

  // Smart task quadrant update
  const updateTaskQuadrant = useMutation({
    mutationFn: async ({ taskId, quadrant, autoAdjust = true }: 
      { taskId: string; quadrant: number; autoAdjust?: boolean }) => {
      // First, get the task's current data
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/task_prioritization?task_id=eq.${taskId}`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch task');
      const currentTask = (await response.json())[0];

      // Calculate optimal quadrant if auto-adjust is enabled
      let finalQuadrant = quadrant;
      if (autoAdjust && currentTask) {
        finalQuadrant = calculateOptimalQuadrant(currentTask, quadrant);
      }

      // Update the task with new quadrant and recalculated priority
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/task_prioritization?task_id=eq.${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            quadrant: finalQuadrant,
            priority_score: calculatePriorityScore(finalQuadrant, currentTask),
            last_updated: new Date().toISOString()
          })
        }
      );

      if (!updateResponse.ok) throw new Error('Failed to update task');

      // Update related tasks if needed
      if (currentTask?.parent_task_id || currentTask?.subtasks?.length > 0) {
        await updateRelatedTasks(taskId, finalQuadrant);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-with-priority'] });
      toast({
        title: "Task updated",
        description: "Task priority has been updated successfully.",
      });
    },
  });

  const calculateOptimalQuadrant = (task: Task, suggestedQuadrant: number): number => {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const now = new Date();
    const isUrgent = deadline && (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 2;
    
    // Consider task complexity and energy requirements
    const isHighComplexity = task.complexity === 'high';
    const isHighEnergy = task.energy_required && task.energy_required > 3;
    
    // If task is urgent and either high complexity or energy-intensive, prioritize it
    if (isUrgent && (isHighComplexity || isHighEnergy)) {
      return 1; // Urgent & Important
    }
    
    // If it's part of a critical path (has dependent tasks)
    if (task.subtasks && task.subtasks.length > 0) {
      return Math.min(suggestedQuadrant, 2); // At least Important
    }
    
    return suggestedQuadrant;
  };

  const calculatePriorityScore = (quadrant: number, task: Task): number => {
    let score = 100 - (quadrant * 20); // Base score by quadrant
    
    // Adjust for deadline proximity
    if (task.deadline) {
      const daysUntilDue = Math.max(0, Math.floor((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      score += Math.max(0, 30 - daysUntilDue);
    }
    
    // Adjust for complexity
    if (task.complexity === 'high') score += 15;
    if (task.complexity === 'medium') score += 8;
    
    // Adjust for energy requirement
    if (task.energy_required) {
      score += task.energy_required * 3;
    }
    
    return Math.min(100, Math.max(0, score));
  };

  const updateRelatedTasks = async (taskId: string, quadrant: number) => {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tasks?or=(parent_task_id.eq.${taskId},id.eq.${taskId})`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session?.access_token}`
        }
      }
    );

    if (!response.ok) throw new Error('Failed to fetch related tasks');
    const relatedTasks = await response.json();
      
    if (relatedTasks) {
      // Update all related tasks to maintain consistency
      await Promise.all(relatedTasks.map((task: Task) => 
        updateTaskQuadrant.mutateAsync({ taskId: task.id, quadrant, autoAdjust: false })
      ));
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceQuadrant = parseInt(result.source.droppableId);
    const destinationQuadrant = parseInt(result.destination.droppableId);
    const taskId = result.draggableId;

    if (sourceQuadrant !== destinationQuadrant) {
      // Check if task is part of a batch
      const task = tasks.find(t => t.id === taskId);
      if (task?.batch_id && batchMode) {
        // Update all tasks in the same batch
        const batchTasks = tasks.filter(t => t.batch_id === task.batch_id);
        await batchUpdateTasks.mutateAsync({
          tasks: batchTasks.map(t => t.id),
          updates: { quadrant: destinationQuadrant }
        });
      } else {
        await updateTaskQuadrant.mutateAsync({ taskId, quadrant: destinationQuadrant });
      }
    }
  };

  const getQuadrantTasks = (quadrant: number) => {
    return tasks.filter(task => task.quadrant === quadrant);
  };

  useEffect(() => {
    if (taskData) {
      const formattedTasks = taskData.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        urgency_level: task.task_prioritization?.[0]?.urgency_level || 3,
        importance_level: task.task_prioritization?.[0]?.importance_level || 3,
        quadrant: task.task_prioritization?.[0]?.quadrant || 4,
        energy_required: task.task_prioritization?.[0]?.energy_required,
        status: task.status || 'not_started',
        tags: task.tags || [],
        last_updated: task.last_updated || new Date().toISOString(),
        category: task.category,
        deadline: task.deadline,
        progress: task.progress,
        complexity: task.complexity,
        batch_id: task.batch_id,
        estimated_time: task.estimated_time,
        actual_time: task.actual_time,
        priority_score: task.priority_score
      }));
      setTasks(formattedTasks);
    }
  }, [taskData]);

  const generateTaskSuggestions = (analyticsData: any) => {
    const suggestions: TaskSuggestion[] = [];
    
    // Analyze task patterns
    const taskPatterns = analyzeTasks(tasks, analyticsData);
    
    // Generate suggestions based on patterns
    taskPatterns.forEach(pattern => {
      if (pattern.type === 'overdue') {
        suggestions.push({
          title: `Move "${pattern.taskTitle}" to Urgent & Important`,
          quadrant: 1,
          reason: 'Task is overdue and needs immediate attention',
          confidence: 0.9
        });
      } else if (pattern.type === 'high_impact') {
        suggestions.push({
          title: `Consider prioritizing "${pattern.taskTitle}"`,
          quadrant: 2,
          reason: 'Task has high impact on project goals',
          confidence: 0.8
        });
      }
    });

    setSuggestions(suggestions);
  };

  const analyzeTasks = (tasks: Task[], analytics: any) => {
    const patterns = [];
    const now = new Date();

    for (const task of tasks) {
      // Check for overdue tasks
      if (task.deadline && new Date(task.deadline) < now) {
        patterns.push({
          type: 'overdue',
          taskTitle: task.title,
          severity: 'high'
        });
      }

      // Identify high-impact tasks
      if (task.priority_score && task.priority_score > 80) {
        patterns.push({
          type: 'high_impact',
          taskTitle: task.title,
          impact: 'high'
        });
      }

      // Analyze time patterns
      if (task.estimated_time && task.actual_time) {
        const timeRatio = task.actual_time / task.estimated_time;
        if (timeRatio > 1.5) {
          patterns.push({
            type: 'time_underestimated',
            taskTitle: task.title,
            ratio: timeRatio
          });
        }
      }
    }

    return patterns;
  };

  const calculateQuadrantAnalytics = (analyticsData: any) => {
    const analytics: Record<number, QuadrantAnalytics> = {};

    [1, 2, 3, 4].forEach(quadrant => {
      const quadrantTasks = tasks.filter(t => t.quadrant === quadrant);
      
      analytics[quadrant] = {
        taskCount: quadrantTasks.length,
        completionRate: quadrantTasks.filter(t => t.status === 'completed').length / quadrantTasks.length,
        averageTime: calculateAverageTime(quadrantTasks),
        overdueTasks: quadrantTasks.filter(t => t.deadline && new Date(t.deadline) < new Date()).length,
        priorityScore: calculateQuadrantPriorityScore(quadrantTasks)
      };
    });

    setQuadrantAnalytics(analytics);
  };

  const calculateAverageTime = (tasks: Task[]): number => {
    const tasksWithTime = tasks.filter(t => t.actual_time);
    if (tasksWithTime.length === 0) return 0;
    return tasksWithTime.reduce((acc, t) => acc + (t.actual_time || 0), 0) / tasksWithTime.length;
  };

  const calculateQuadrantPriorityScore = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    return tasks.reduce((acc, t) => acc + (t.priority_score || 0), 0) / tasks.length;
  };

  const getTaskStyles = (task: Task) => {
    const baseStyles = "bg-white dark:bg-gray-800 p-3 rounded shadow-sm";
    const selectedStyles = selectedTasks.includes(task.id) ? "border-2 border-blue-500" : "";
    const progressStyles = task.progress ? `before:w-[${task.progress}%] before:bg-blue-100` : "";
    const complexityColors = {
      low: "border-l-4 border-green-500",
      medium: "border-l-4 border-yellow-500",
      high: "border-l-4 border-red-500"
    };

    return `${baseStyles} ${selectedStyles} ${progressStyles} ${task.complexity ? complexityColors[task.complexity] : ""}`;
  };

  // Enhanced quadrant styles with visual hierarchy and ADHD-friendly colors
  const quadrantStyles = {
    1: "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800",
    2: "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800",
    3: "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800",
    4: "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800",
  };

  const quadrantTitles = {
    1: "Urgent & Important",
    2: "Important, Not Urgent",
    3: "Urgent, Not Important",
    4: "Neither Urgent Nor Important",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Eisenhower Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="space-y-4">
            {/* Task suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Smart Suggestions
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{suggestion.title}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Implement suggestion
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

      {/* Enhanced Controls */}
      <div className="space-y-4 mb-6">
        {/* Primary Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="bg-green-50 hover:bg-green-100 text-green-700"
            >
              + Quick Add
            </Button>
            <Button
              variant={focusMode ? "default" : "outline"}
              size="sm"
              onClick={() => setFocusMode(!focusMode)}
              className={focusMode ? "bg-purple-600" : ""}
            >
              {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              Tips & Help
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {(['grid', 'list', 'timeline'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
            <Button
              variant={showSuggestions ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="bg-blue-600"
            >
              AI Insights
            </Button>
          </div>
        </div>

        {/* Quick Add Form */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-green-50 p-4 rounded-lg"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Task title"
                    className="p-2 rounded border"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <select
                    value={newTask.quadrant}
                    onChange={(e) => setNewTask(prev => ({ ...prev, quadrant: Number(e.target.value) }))}
                    className="p-2 rounded border"
                  >
                    <option value={1}>Urgent & Important</option>
                    <option value={2}>Important, Not Urgent</option>
                    <option value={3}>Urgent, Not Important</option>
                    <option value={4}>Neither</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => {/* Add task */}}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add Task
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowQuickAdd(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Panel */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-50 p-4 rounded-lg"
            >
              <h4 className="font-medium mb-2">Quick Tips</h4>
              <ul className="text-sm space-y-1">
                <li>• Drag tasks between quadrants to reprioritize</li>
                <li>• Use Focus Mode to highlight one quadrant at a time</li>
                <li>• Quick Add for rapid task capture</li>
                <li>• AI Insights help optimize your task organization</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

            {/* Matrix grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((quadrant) => (
                <Droppable key={quadrant} droppableId={quadrant.toString()}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded-lg ${quadrantStyles[quadrant as keyof typeof quadrantStyles]}`}
                  >
                    <h3 className="font-semibold mb-3">{quadrantTitles[quadrant as keyof typeof quadrantTitles]}</h3>
                    <div className="space-y-2 min-h-[200px]">
                      {/* Quadrant header with analytics */}
                      {showAnalytics && quadrantAnalytics[quadrant] && (
                        <div className="mb-4 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Tasks: {quadrantAnalytics[quadrant].taskCount}</span>
                            <span>Completion: {Math.round(quadrantAnalytics[quadrant].completionRate * 100)}%</span>
                          </div>
                          {quadrantAnalytics[quadrant].overdueTasks > 0 && (
                            <div className="text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{quadrantAnalytics[quadrant].overdueTasks} overdue</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tasks */}
                      {getQuadrantTasks(quadrant).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={getTaskStyles(task)}
                              onClick={() => batchMode && setSelectedTasks(prev => 
                                prev.includes(task.id) 
                                  ? prev.filter(id => id !== task.id)
                                  : [...prev, task.id]
                              )}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{task.title}</p>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground">{task.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {task.energy_required && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Brain className="h-4 w-4" />
                                        <span>{task.energy_required}/5</span>
                                      </div>
                                    )}
                                    {task.deadline && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Task metadata */}
                                {(task.tags?.length > 0 || task.category) && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.category && (
                                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                        {task.category}
                                      </span>
                                    )}
                                    {task.tags?.map((tag, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Progress bar */}
                                {task.progress !== undefined && (
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-blue-500 h-full transition-all duration-300"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};
