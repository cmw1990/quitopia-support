import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { Switch } from '../../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Brain, AlertTriangle, Plus, X, ExternalLink, BarChart, Trash2, Edit, Save, ChevronDown, ChevronUp } from 'lucide-react';

interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'not_started' | 'in_progress' | 'completed';
  due_date: string | null;
  cognitive_load: number;
  created_at: string;
  updated_at: string;
  category?: string;
  context_tags?: string[];
  energy_required: 'low' | 'medium' | 'high';
  estimated_time?: number;
  actual_time?: number;
  reward_points?: number;
  executive_function_tips?: string[];
  visual_pattern?: 'dots' | 'stripes' | 'waves' | 'none';
  time_of_day_preference?: 'morning' | 'afternoon' | 'evening' | 'any';
  environment_needs?: string[];
  body_doubling_enabled?: boolean;
  focus_music_preference?: 'none' | 'nature' | 'ambient' | 'lofi' | 'white-noise';
  break_reminder_interval?: number;
  current_energy_level?: number;
  ideal_environment_score?: number;
  completion_streak?: number;
  last_focus_duration?: number;
  associated_timer_sessions?: string[];
  visual_aids?: {
    color_coding?: string;
    icons?: string[];
    progress_style?: 'linear' | 'circular' | 'steps';
  };
  adhd_adaptations?: {
    needs_body_doubling: boolean;
    needs_timer_visibility: boolean;
    needs_frequent_breaks: boolean;
    preferred_reward_type: 'points' | 'badges' | 'streaks' | 'custom';
    distraction_sensitivity: 'low' | 'medium' | 'high';
    time_blindness_aids: string[];
  };
}

interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface SubTask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  order_index: number;
  created_at: string;
}

export const ADHDTaskBreakdown = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subTasks, setSubTasks] = useState<{ [taskId: string]: SubTask[] }>({});
  const [expandedTasks, setExpandedTasks] = useState<{ [key: string]: boolean }>({});
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);
  const [showRewardSystem, setShowRewardSystem] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  
  // Enhanced ADHD-friendly states
  const [showEnvironmentSetup, setShowEnvironmentSetup] = useState(false);
  const [showEnergyTracker, setShowEnergyTracker] = useState(false);
  const [showVisualCustomization, setShowVisualCustomization] = useState(false);
  const [currentEnergyLevel, setCurrentEnergyLevel] = useState(7);
  const [newTaskSettings, setNewTaskSettings] = useState({
    energy_required: 'medium' as 'low' | 'medium' | 'high',
    estimated_time: 25,
    visual_pattern: 'none' as 'dots' | 'stripes' | 'waves' | 'none',
    time_preference: 'any' as 'morning' | 'afternoon' | 'evening' | 'any',
    body_doubling_enabled: false,
    focus_music_preference: 'none' as 'none' | 'nature' | 'ambient' | 'lofi' | 'white-noise',
    break_reminder_interval: 25,
    visual_aids: {
      color_coding: '#4F46E5',
      icons: [],
      progress_style: 'linear' as 'linear' | 'circular' | 'steps'
    },
    adhd_adaptations: {
      needs_body_doubling: false,
      needs_timer_visibility: true,
      needs_frequent_breaks: true,
      preferred_reward_type: 'points' as 'points' | 'badges' | 'streaks' | 'custom',
      distraction_sensitivity: 'medium' as 'low' | 'medium' | 'high',
      time_blindness_aids: ['visual-timer', 'progress-tracking']
    }
  });
  
  const categories: TaskCategory[] = [
    { id: '1', name: 'Deep Work', color: 'blue', icon: '🧠' },
    { id: '2', name: 'Quick Wins', color: 'green', icon: '⚡' },
    { id: '3', name: 'Creative', color: 'purple', icon: '🎨' },
    { id: '4', name: 'Admin', color: 'gray', icon: '📑' },
    { id: '5', name: 'Learning', color: 'yellow', icon: '📚' },
    { id: '6', name: 'Self-Care', color: 'pink', icon: '🌱' }
  ];

  const shuffleTasks = () => {
    setTasks(prev => {
      const activeTasks = prev.filter(t => t.status !== 'completed');
      const completedTasks = prev.filter(t => t.status === 'completed');
      
      // Fisher-Yates shuffle for active tasks
      const shuffled = [...activeTasks];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return [...shuffled, ...completedTasks];
    });
  };

  const generateExecutiveFunctionTips = (difficulty: string): string[] => {
    const tips: string[] = [];
    
    // Add initiation tips for all tasks
    tips.push(executiveFunctionTips.initiation[Math.floor(Math.random() * executiveFunctionTips.initiation.length)]);
    
    // Add planning tips for medium/hard tasks
    if (difficulty !== 'easy') {
      tips.push(executiveFunctionTips.planning[Math.floor(Math.random() * executiveFunctionTips.planning.length)]);
    }
    
    // Add organization tips for hard tasks
    if (difficulty === 'hard') {
      tips.push(executiveFunctionTips.organization[Math.floor(Math.random() * executiveFunctionTips.organization.length)]);
      tips.push(executiveFunctionTips.timeManagement[Math.floor(Math.random() * executiveFunctionTips.timeManagement.length)]);
    }
    
    return tips;
  };

  const calculateRewardPoints = (): number => {
    let points = 10; // Base points
    
    // Adjust based on difficulty
    if (newTaskDifficulty === 'medium') points += 5;
    if (newTaskDifficulty === 'hard') points += 10;
    
    // Adjust based on priority
    if (newTaskPriority === 'high') points += 5;
    
    // Bonus for adding details
    if (newTaskDescription) points += 2;
    if (newTaskDueDate) points += 3;
    if (newTaskSettings.estimated_time) points += 2;
    
    return points;
  };

  const executiveFunctionTips = {
    initiation: [
      "Break the task into 2-minute starts",
      "Set a specific start time",
      "Use the 'if-then' planning method"
    ],
    planning: [
      "Visualize the end result",
      "Work backwards from the goal",
      "Create a checklist before starting"
    ],
    organization: [
      "Group similar subtasks together",
      "Use color coding for different parts",
      "Create a designated workspace"
    ],
    timeManagement: [
      "Set multiple smaller deadlines",
      "Use time blocking",
      "Add buffer time for transitions"
    ]
  };
  const [newSubTaskTitle, setNewSubTaskTitle] = useState<{ [key: string]: string }>({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Load tasks from Supabase
  useEffect(() => {
    if (session?.user?.id) {
      loadTasks();
    }
  }, [session?.user?.id]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Use supabaseRequest, handle response, remove session arg
      const { data, error: tasksError } = await supabaseRequest<Task[]>(
        `/rest/v1/focus_tasks8?user_id=eq.${session?.user?.id}&order=created_at.desc`,
        { method: 'GET' }
        // Removed session argument
      );
      if (tasksError) throw tasksError; // Propagate error
      
      setTasks(data || []);
      
      // Load subtasks for each task
      const subtasksData: { [taskId: string]: SubTask[] } = {};
      
      for (const task of data || []) {
        // Use supabaseRequest, handle response, remove session arg
        const { data: subtasks, error: subtasksError } = await supabaseRequest<SubTask[]>(
          `/rest/v1/focus_subtasks8?task_id=eq.${task.id}&order=order_index.asc`,
          { method: 'GET' }
          // Removed session argument
        );
        if (subtasksError) throw subtasksError; // Propagate error
        
        subtasksData[task.id] = subtasks || [];
      }
      
      setSubTasks(subtasksData);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Failed to load tasks",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim() || !session?.user?.id) return;
    
    try {
      const newTask = {
        user_id: session.user.id,
        title: newTaskTitle,
        description: newTaskDescription || null,
        priority: newTaskPriority,
        difficulty: newTaskDifficulty,
        status: 'not_started',
        due_date: newTaskDueDate || null,
        cognitive_load: calculateCognitiveLoad(newTaskDifficulty, newTaskPriority),
        category: newTaskCategory,
        context_tags: newTaskTags,
        energy_required: newTaskSettings.energy_required,
        estimated_time: newTaskSettings.estimated_time,
        visual_pattern: newTaskSettings.visual_pattern,
        time_of_day_preference: newTaskSettings.time_preference,
        executive_function_tips: generateExecutiveFunctionTips(newTaskDifficulty),
        environment_needs: [],
        reward_points: calculateRewardPoints()
      };
      
       // Use supabaseRequest, handle response, remove session arg
       // Add select=* and Prefer header to get the created item back
       const { data: dataResponse, error: createError } = await supabaseRequest<Task[]>( // Expect array
         '/rest/v1/focus_tasks8?select=*',
         {
           method: 'POST',
           headers: { 'Prefer': 'return=representation' },
           body: JSON.stringify(newTask)
         }
         // Removed session argument
       );
       if (createError) throw createError; // Propagate error
       const data = dataResponse?.[0]; // Extract single item
      
      if (data && data[0]) {
        setTasks(prev => [data[0], ...prev]);
        setSubTasks(prev => ({ ...prev, [data[0].id]: [] }));
        resetNewTaskForm();
        
        toast({
          title: "Task created",
          description: "Your task has been created successfully"
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Failed to create task",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    try {
       // Use supabaseRequest, handle error, remove session arg
       const { error: updateStatusError } = await supabaseRequest(
         `/rest/v1/focus_tasks8?id=eq.${taskId}`,
         {
           method: 'PATCH',
            headers: { 'Prefer': 'return=minimal' }, // Don't need result back
           body: JSON.stringify({ status, updated_at: new Date().toISOString() })
         }
         // Removed session argument
       );
       if (updateStatusError) throw updateStatusError; // Propagate error
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status, updated_at: new Date().toISOString() } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Failed to update task",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      // Delete all subtasks first
       // Use supabaseRequest, handle error, remove session arg
       const { error: deleteSubtasksError } = await supabaseRequest(
         `/rest/v1/focus_subtasks8?task_id=eq.${taskId}`,
         { method: 'DELETE' }
         // Removed session argument
       );
        if (deleteSubtasksError) throw deleteSubtasksError; // Propagate error
      
      // Then delete the task
       // Use supabaseRequest, handle error, remove session arg
       const { error: deleteTaskError } = await supabaseRequest(
         `/rest/v1/focus_tasks8?id=eq.${taskId}`,
         { method: 'DELETE' }
         // Removed session argument
       );
       if (deleteTaskError) throw deleteTaskError; // Propagate error
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      const newSubTasks = { ...subTasks };
      delete newSubTasks[taskId];
      setSubTasks(newSubTasks);
      
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Failed to delete task",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const addSubTask = async (taskId: string) => {
    if (!newSubTaskTitle[taskId]?.trim()) return;
    
    try {
      const order = subTasks[taskId]?.length || 0;
      
      const newSubTask = {
        task_id: taskId,
        title: newSubTaskTitle[taskId],
        is_completed: false,
        order_index: order
      };
      
       // Use supabaseRequest, handle response, remove session arg
       // Add select=* and Prefer header to get the created item back
       const { data: dataResponse, error: addSubtaskError } = await supabaseRequest<SubTask[]>( // Expect array
         '/rest/v1/focus_subtasks8?select=*',
         {
           method: 'POST',
           headers: { 'Prefer': 'return=representation' },
           body: JSON.stringify(newSubTask)
         }
         // Removed session argument
       );
       if (addSubtaskError) throw addSubtaskError; // Propagate error
       const data = dataResponse?.[0]; // Extract single item
      
      if (data && data[0]) {
        setSubTasks(prev => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), data[0]]
        }));
        
        setNewSubTaskTitle(prev => ({
          ...prev,
          [taskId]: ''
        }));
      }
    } catch (error) {
      console.error("Error creating subtask:", error);
      toast({
        title: "Failed to create subtask",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const toggleSubTaskCompletion = async (subTaskId: string, taskId: string, currentStatus: boolean) => {
    try {
       // Use supabaseRequest, handle error, remove session arg
       const { error: toggleError } = await supabaseRequest(
         `/rest/v1/focus_subtasks8?id=eq.${subTaskId}`,
         {
           method: 'PATCH',
            headers: { 'Prefer': 'return=minimal' }, // Don't need result back
           body: JSON.stringify({ is_completed: !currentStatus })
         }
         // Removed session argument
       );
       if (toggleError) throw toggleError; // Propagate error
      
      setSubTasks(prev => ({
        ...prev,
        [taskId]: prev[taskId].map(st => 
          st.id === subTaskId ? { ...st, is_completed: !currentStatus } : st
        )
      }));
      
      // Check if all subtasks are completed, and if so, mark the task as completed
      const updatedSubtasks = subTasks[taskId].map(st => 
        st.id === subTaskId ? { ...st, is_completed: !currentStatus } : st
      );
      
      const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.is_completed);
      
      if (allCompleted) {
        updateTaskStatus(taskId, 'completed');
      } else {
        // If any subtask is marked as complete but was previously complete, check if we need to update task status
        const task = tasks.find(t => t.id === taskId);
        if (task?.status === 'completed') {
          updateTaskStatus(taskId, 'in_progress');
        }
      }
    } catch (error) {
      console.error("Error toggling subtask completion:", error);
      toast({
        title: "Failed to update subtask",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteSubTask = async (subTaskId: string, taskId: string) => {
    try {
       // Use supabaseRequest, handle error, remove session arg
       const { error: deleteSubtaskError } = await supabaseRequest(
         `/rest/v1/focus_subtasks8?id=eq.${subTaskId}`,
         { method: 'DELETE' }
         // Removed session argument
       );
       if (deleteSubtaskError) throw deleteSubtaskError; // Propagate error
      
      setSubTasks(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(st => st.id !== subTaskId)
      }));
    } catch (error) {
      console.error("Error deleting subtask:", error);
      toast({
        title: "Failed to delete subtask",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const calculateCognitiveLoad = (difficulty: string, priority: string): number => {
    // Simple algorithm to calculate cognitive load on a scale of 1-10
    const difficultyScore = 
      difficulty === 'easy' ? 2 : 
      difficulty === 'medium' ? 5 : 8;
    
    const priorityScore = 
      priority === 'low' ? 1 : 
      priority === 'medium' ? 3 : 5;
    
    return Math.min(Math.round((difficultyScore + priorityScore) / 1.3), 10);
  };

  const getCompletionPercentage = (taskId: string): number => {
    const taskSubtasks = subTasks[taskId] || [];
    if (taskSubtasks.length === 0) return 0;
    
    const completedCount = taskSubtasks.filter(st => st.is_completed).length;
    return Math.round((completedCount / taskSubtasks.length) * 100);
  };

  const getPriorityColor = (priority: string): string => {
    return priority === 'low' ? 'text-green-500' :
           priority === 'medium' ? 'text-yellow-500' : 'text-red-500';
  };

  const getDifficultyIcon = (difficulty: string) => {
    return difficulty === 'easy' ? 
      <Brain className="h-4 w-4 text-green-500" /> :
      difficulty === 'medium' ? 
      <Brain className="h-4 w-4 text-yellow-500" /> :
      <Brain className="h-4 w-4 text-red-500" />;
  };

  const getCognitiveLoadColor = (load: number): string => {
    if (load <= 3) return 'bg-green-500';
    if (load <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const resetNewTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskDifficulty('medium');
    setNewTaskDueDate('');
    setIsCreatingTask(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'completed') return task.status === 'completed';
    if (activeFilter === 'active') return task.status !== 'completed';
    return true;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-500" />
          ADHD-Friendly Task Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger 
              value="all" 
              onClick={() => setActiveFilter('all')}
              className="text-sm"
            >
              All Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              onClick={() => setActiveFilter('active')}
              className="text-sm"
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              onClick={() => setActiveFilter('completed')}
              className="text-sm"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Task creation form */}
            {isCreatingTask ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4"
              >
                <h3 className="text-lg font-semibold mb-3">Create New Task</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Task Title</label>
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What do you need to do?"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Description (Optional)</label>
                    <Input
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Add some details..."
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Difficulty</label>
                      <select
                        value={newTaskDifficulty}
                        onChange={(e) => setNewTaskDifficulty(e.target.value as any)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Due Date (Optional)</label>
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={resetNewTaskForm}>
                      Cancel
                    </Button>
                    <Button onClick={createTask}>
                      Create Task
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4 mb-4">
                <Button onClick={() => setIsCreatingTask(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add New Task
                </Button>

                {showRewardSystem && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                          Your Focus Points
                        </h3>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Keep building your streak!
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                        {userPoints} pts
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ADHD-Friendly Control Panel */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRewardSystem(!showRewardSystem)}
                      className={`text-sm ${showRewardSystem ? 'bg-purple-100 text-purple-700' : ''}`}
                    >
                      {showRewardSystem ? 'Hide Rewards' : 'Show Rewards'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEnvironmentSetup(!showEnvironmentSetup)}
                      className={`text-sm ${showEnvironmentSetup ? 'bg-blue-100 text-blue-700' : ''}`}
                    >
                      Environment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEnergyTracker(!showEnergyTracker)}
                      className={`text-sm ${showEnergyTracker ? 'bg-green-100 text-green-700' : ''}`}
                    >
                      Energy Levels
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => shuffleTasks()}
                      className="text-sm"
                    >
                      Shuffle Tasks
                    </Button>
                  </div>

                  {/* Environment Setup Panel */}
                  <AnimatePresence>
                    {showEnvironmentSetup && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
                      >
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">Environment Setup</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-blue-600">Noise Level</label>
                            <select
                              className="w-full p-2 rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800"
                              value={newTaskSettings.adhd_adaptations.needs_frequent_breaks ? 'quiet' : 'moderate'}
                              onChange={(e) => setNewTaskSettings(prev => ({
                                ...prev,
                                adhd_adaptations: {
                                  ...prev.adhd_adaptations,
                                  needs_frequent_breaks: e.target.value === 'quiet'
                                }
                              }))}
                            >
                              <option value="quiet">Need Quiet</option>
                              <option value="moderate">Moderate Noise OK</option>
                              <option value="ambient">Prefer Background Noise</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm text-blue-600">Background Sound</label>
                            <select
                              className="w-full p-2 rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800"
                              value={newTaskSettings.focus_music_preference}
                              onChange={(e) => setNewTaskSettings(prev => ({
                                ...prev,
                                focus_music_preference: e.target.value as typeof prev.focus_music_preference
                              }))}
                            >
                              <option value="none">No Sound</option>
                              <option value="nature">Nature Sounds</option>
                              <option value="ambient">Ambient Music</option>
                              <option value="lofi">Lo-Fi</option>
                              <option value="white-noise">White Noise</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600">Body Doubling</span>
                            <Switch
                              checked={newTaskSettings.body_doubling_enabled}
                              onCheckedChange={(checked: boolean) => setNewTaskSettings(prev => ({
                                ...prev,
                                body_doubling_enabled: checked
                              }))}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Energy Level Tracker */}
                  <AnimatePresence>
                    {showEnergyTracker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg"
                      >
                        <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3">Energy Level Tracker</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm text-green-600 mb-2">
                              <span>Current Energy Level</span>
                              <span>{currentEnergyLevel}/10</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={currentEnergyLevel}
                              onChange={(e) => setCurrentEnergyLevel(Number(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className={`p-2 rounded ${currentEnergyLevel <= 3 ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                              Low Energy Tasks
                            </div>
                            <div className={`p-2 rounded ${currentEnergyLevel > 3 && currentEnergyLevel <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>
                              Medium Energy Tasks
                            </div>
                            <div className={`p-2 rounded ${currentEnergyLevel > 7 ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                              High Energy Tasks
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            {/* Task list */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    {activeFilter === 'completed' ? 
                      "You haven't completed any tasks yet." :
                      activeFilter === 'active' ?
                      "No active tasks at the moment." :
                      "No tasks found. Create one to get started!"}
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`border rounded-lg ${
                        task.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-3">
                            <div>
                              <input 
                                type="checkbox" 
                                checked={task.status === 'completed'}
                                onChange={() => updateTaskStatus(task.id, task.status === 'completed' ? 'in_progress' : 'completed')}
                                className="h-5 w-5 mt-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div>
                              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center mr-2">
                              <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              {getDifficultyIcon(task.difficulty)}
                            </div>
                            <div className="ml-2">
                              {expandedTasks[task.id] ? 
                                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="w-full mr-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{getCompletionPercentage(task.id)}%</span>
                            </div>
                            <Progress value={getCompletionPercentage(task.id)} className="h-2" />
                          </div>
                          
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <div className="text-xs mr-2">
                              <span className="text-gray-500">Cognitive Load:</span>
                            </div>
                            <div 
                              className={`h-4 w-4 rounded-full ${getCognitiveLoadColor(task.cognitive_load)}`}
                              title={`Cognitive Load: ${task.cognitive_load}/10`}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded task details */}
                      {expandedTasks[task.id] && (
                        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
                          <div className="pl-8">
                            {/* Subtasks section */}
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2">Subtasks</h4>
                              <div className="space-y-2">
                                {(subTasks[task.id] || []).map(subtask => (
                                  <div key={subtask.id} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={subtask.is_completed}
                                      onChange={() => toggleSubTaskCompletion(subtask.id, task.id, subtask.is_completed)}
                                      className="h-4 w-4"
                                    />
                                    <span className={`text-sm flex-1 ${subtask.is_completed ? 'line-through text-gray-500' : ''}`}>
                                      {subtask.title}
                                    </span>
                                    <button 
                                      onClick={() => deleteSubTask(subtask.id, task.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Add subtask */}
                            <div className="flex gap-2 mb-4">
                              <Input
                                placeholder="Add a subtask..."
                                value={newSubTaskTitle[task.id] || ''}
                                onChange={(e) => setNewSubTaskTitle({
                                  ...newSubTaskTitle,
                                  [task.id]: e.target.value
                                })}
                                className="text-sm py-1 h-9"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newSubTaskTitle[task.id]) {
                                    addSubTask(task.id);
                                  }
                                }}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => addSubTask(task.id)}
                                disabled={!newSubTaskTitle[task.id]}
                              >
                                Add
                              </Button>
                            </div>
                            
                            {/* Task actions */}
                            <div className="flex justify-between">
                              <div className="text-xs text-gray-500">
                                {task.due_date && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                  }}
                                  className="text-xs h-7 px-2"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
