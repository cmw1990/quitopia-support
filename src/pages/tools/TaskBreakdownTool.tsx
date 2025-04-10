import React, { useState, useMemo } from 'react'; // Import useMemo
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Clock,
  Plus,
  Trash,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkPlus,
  CheckCircle,
  FileText,
  ListPlus,
  ListChecks,
  MoreVertical,
  MoveUp,
  MoveDown,
  Pencil,
  Save,
  Trash2,
  ListTodo,
  SplitSquareVertical,
  Calendar,
  Info,
  ArrowRight,
  Brain,
  CheckSquare,
  Square,
  CornerDownRight,
  Layers,
  AlertCircle,
  Sparkles
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type Priority = 'low' | 'medium' | 'high';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  steps?: Step[];
  priority: Priority;
  estimatedMinutes?: number;
}

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  subtasks: Subtask[];
  priority: Priority;
  estimatedMinutes?: number;
  dueDate?: string;
  templateId?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  subtasks: Omit<Subtask, 'id' | 'completed'>[];
}

// Sample templates
const defaultTemplates: Template[] = [
  {
    id: 'essay-writing',
    name: 'Essay Writing',
    description: 'Break down an essay into manageable steps',
    subtasks: [
      {
        title: 'Research',
        description: 'Gather sources and information',
        priority: 'high',
        estimatedMinutes: 60,
        steps: [
          { id: '1', title: 'Identify key topics', completed: false },
          { id: '2', title: 'Find 3-5 reliable sources', completed: false },
          { id: '3', title: 'Take notes on main points', completed: false }
        ]
      },
      {
        title: 'Create Outline',
        description: 'Structure your essay',
        priority: 'high',
        estimatedMinutes: 30,
        steps: [
          { id: '1', title: 'Write thesis statement', completed: false },
          { id: '2', title: 'Plan introduction', completed: false },
          { id: '3', title: 'List main arguments', completed: false },
          { id: '4', title: 'Plan conclusion', completed: false }
        ]
      },
      {
        title: 'Write First Draft',
        description: 'Focus on getting ideas down',
        priority: 'medium',
        estimatedMinutes: 90,
        steps: [
          { id: '1', title: 'Write introduction', completed: false },
          { id: '2', title: 'Develop main arguments', completed: false },
          { id: '3', title: 'Write conclusion', completed: false }
        ]
      },
      {
        title: 'Revise',
        description: 'Improve your draft',
        priority: 'medium',
        estimatedMinutes: 45,
        steps: [
          { id: '1', title: 'Check for clarity and flow', completed: false },
          { id: '2', title: 'Strengthen arguments', completed: false },
          { id: '3', title: 'Improve transitions', completed: false }
        ]
      },
      {
        title: 'Edit & Proofread',
        description: 'Polish your essay',
        priority: 'low',
        estimatedMinutes: 30,
        steps: [
          { id: '1', title: 'Check grammar and spelling', completed: false },
          { id: '2', title: 'Verify citations and references', completed: false },
          { id: '3', title: 'Read aloud for final check', completed: false }
        ]
      }
    ]
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Organize a new project from start to finish',
    subtasks: [
      {
        title: 'Define Project Scope',
        description: 'Clearly outline what the project will accomplish',
        priority: 'high',
        estimatedMinutes: 45,
        steps: [
          { id: '1', title: 'Define objectives', completed: false },
          { id: '2', title: 'Identify deliverables', completed: false },
          { id: '3', title: 'Set success criteria', completed: false }
        ]
      },
      {
        title: 'Create Task List',
        description: 'Break project into actionable tasks',
        priority: 'high',
        estimatedMinutes: 60,
        steps: [
          { id: '1', title: 'List major components', completed: false },
          { id: '2', title: 'Break components into tasks', completed: false },
          { id: '3', title: 'Estimate time for each task', completed: false }
        ]
      },
      {
        title: 'Assign Resources',
        description: 'Determine who will do what',
        priority: 'medium',
        estimatedMinutes: 30,
      },
      {
        title: 'Set Timeline',
        description: 'Create a schedule with milestones',
        priority: 'medium',
        estimatedMinutes: 45,
      },
      {
        title: 'Plan Communication',
        description: 'Decide how to keep everyone informed',
        priority: 'low',
        estimatedMinutes: 20,
      }
    ]
  }
];

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Create a deep copy of a template to a new task
const createTaskFromTemplate = (template: Template): Task => {
  const subtasks = template.subtasks.map(subtask => ({
    ...subtask,
    id: generateId(),
    completed: false,
    steps: subtask.steps ? subtask.steps.map(step => ({ ...step, completed: false })) : undefined
  }));
  
  return {
    id: generateId(),
    title: '',
    description: '',
    completed: false,
    subtasks,
    priority: 'medium',
    templateId: template.id
  };
};

const TaskBreakdownTool = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { toast } = useToast();
  
  // State for creating a new task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  // Create a new task
  const createNewTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your task',
        variant: 'destructive'
      });
      return;
    }
    
    let newTask: Task;
    
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        newTask = createTaskFromTemplate(template);
        newTask.title = newTaskTitle;
        newTask.description = newTaskDescription;
        newTask.priority = newTaskPriority;
        if (newTaskDueDate) newTask.dueDate = newTaskDueDate;
      } else {
        toast({
          title: 'Template error',
          description: 'The selected template could not be found',
          variant: 'destructive'
        });
        return;
      }
    } else {
      newTask = {
        id: generateId(),
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
        subtasks: [],
        priority: newTaskPriority,
      };
      
      if (newTaskDueDate) newTask.dueDate = newTaskDueDate;
    }
    
    setTasks([newTask, ...tasks]);
    setActiveTask(newTask);
    setActiveTab('active');
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setSelectedTemplateId(null);
    
    toast({
      title: 'Task created',
      description: 'Your task has been created successfully'
    });
    
    // Show signup prompt
    setShowSignupPrompt(true);
  };
  
  // Add a subtask to the active task
  const addSubtask = () => {
    if (!activeTask) return;
    
    const newSubtask: Subtask = {
      id: generateId(),
      title: 'New subtask',
      completed: false,
      priority: 'medium'
    };
    
    const updatedTask = {
      ...activeTask,
      subtasks: [...activeTask.subtasks, newSubtask]
    };
    
    setActiveTask(updatedTask);
    setTasks(tasks.map(task => 
      task.id === activeTask.id ? updatedTask : task
    ));
  };
  
  // Update a subtask
  const updateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    if (!activeTask) return;
    
    const updatedSubtasks = activeTask.subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
    );
    
    const updatedTask = {
      ...activeTask,
      subtasks: updatedSubtasks
    };
    
    setActiveTask(updatedTask);
    setTasks(tasks.map(task => 
      task.id === activeTask.id ? updatedTask : task
    ));
  };
  
  // Delete a subtask
  const deleteSubtask = (subtaskId: string) => {
    if (!activeTask) return;
    
    const updatedSubtasks = activeTask.subtasks.filter(subtask => subtask.id !== subtaskId);
    
    const updatedTask = {
      ...activeTask,
      subtasks: updatedSubtasks
    };
    
    setActiveTask(updatedTask);
    setTasks(tasks.map(task => 
      task.id === activeTask.id ? updatedTask : task
    ));
    
    toast({
      title: 'Subtask deleted',
      description: 'The subtask has been removed'
    });
  };
  
  // Add a step to a subtask
  const addStep = (subtaskId: string) => {
    if (!activeTask) return;
    
    const updatedSubtasks = activeTask.subtasks.map(subtask => {
      if (subtask.id !== subtaskId) return subtask;
      
      const newStep: Step = {
        id: generateId(),
        title: 'New step',
        completed: false
      };
      
      return {
        ...subtask,
        steps: subtask.steps ? [...subtask.steps, newStep] : [newStep]
      };
    });
    
    const updatedTask = {
      ...activeTask,
      subtasks: updatedSubtasks
    };
    
    setActiveTask(updatedTask);
    setTasks(tasks.map(task => 
      task.id === activeTask.id ? updatedTask : task
    ));
  };
  
  // Update a step
  const updateStep = (subtaskId: string, stepId: string, updates: Partial<Step>) => {
    if (!activeTask) return;
    
    const updatedSubtasks = activeTask.subtasks.map(subtask => {
      if (subtask.id !== subtaskId || !subtask.steps) return subtask;
      
      const updatedSteps = subtask.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      );
      
      return {
        ...subtask,
        steps: updatedSteps
      };
    });
    
    const updatedTask = {
      ...activeTask,
      subtasks: updatedSubtasks
    };
    
    setActiveTask(updatedTask);
    setTasks(tasks.map(task => 
      task.id === activeTask.id ? updatedTask : task
    ));
  };
  
  // Delete a step
  const deleteStep = (subtaskId: string, stepId: string) => {
    if (!activeTask) return;
    
    const updatedSubtasks = activeTask.subtasks.map(subtask => {
      if (subtask.id !== subtaskId || !subtask.steps) return subtask;
      
      const updatedSteps = subtask.steps.filter(step => step.id !== stepId);
      
      return {
        ...subtask,
        steps: updatedSteps
      };
    });
    
    const updatedTask = {
      ...activeTask,
      subtasks: updatedSubtasks
    };
    
    setActiveTask(updatedTask);
    setTasks(tasks.map(task => 
      task.id === activeTask.id ? updatedTask : task
    ));
  };
  
  // Calculate task progress
  const calculateProgress = (task: Task): number => {
    if (task.subtasks.length === 0) return 0;
    
    let totalItems = 0;
    let completedItems = 0;
    
    task.subtasks.forEach(subtask => {
      if (subtask.steps && subtask.steps.length > 0) {
        totalItems += subtask.steps.length;
        completedItems += subtask.steps.filter(step => step.completed).length;
      } else {
        totalItems += 1;
        if (subtask.completed) completedItems += 1;
      }
    });
    
    return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  };
  
  // Get priority badge color
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ADHD Task Breakdown Tool</h1>
        <p className="text-muted-foreground">
          Break complex tasks into manageable steps to reduce overwhelm and increase productivity.
        </p>
      </div>

      {showSignupPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center space-x-3">
            <Info className="h-6 w-6 text-primary flex-shrink-0" />
            <p className="font-medium">Create an account to save your tasks, access more templates, and sync across devices.</p>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setShowSignupPrompt(false)}>
              Later
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up Free</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Task</TabsTrigger>
          <TabsTrigger value="active">Active Task</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
        </TabsList>
        
        {/* Create Task Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>
                Break down a complex task into manageable subtasks and steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input 
                    id="task-title" 
                    placeholder="Enter task title" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea 
                    id="task-description" 
                    placeholder="What do you need to accomplish?" 
                    rows={3}
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select 
                    value={newTaskPriority} 
                    onValueChange={(value) => setNewTaskPriority(value as Priority)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="task-due-date">Due Date (Optional)</Label>
                  <Input 
                    id="task-due-date" 
                    type="date" 
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="task-template">Use Template (Optional)</Label>
                  {/* Conditionally render Select only if templates exist */}
                  {Array.isArray(templates) && templates.length > 0 ? (
                    <Select
                      value={selectedTemplateId || ""}
                      onValueChange={setSelectedTemplateId}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {/* Memoize the mapped items */}
                        {useMemo(() => templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        )), [templates])}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input disabled placeholder="Loading templates..." className="mt-1" />
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createNewTask} className="w-full">
                Create Task & Start Breakdown
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Pre-made task structures to help you get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{template.subtasks.length} subtasks</span>
                        <span className="mx-2">•</span>
                        <span>Recommended breakdown</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setActiveTab("create");
                          
                          // Scroll back to top of form
                          window.scrollTo(0, 0);
                        }}
                      >
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Active Task Tab */}
        <TabsContent value="active" className="space-y-6">
          {activeTask ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{activeTask.title}</CardTitle>
                      <CardDescription>{activeTask.description}</CardDescription>
                    </div>
                    <div>
                      <Badge className={getPriorityColor(activeTask.priority)}>
                        {activeTask.priority.charAt(0).toUpperCase() + activeTask.priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progress:</span>
                      <span className="text-sm">{calculateProgress(activeTask)}%</span>
                    </div>
                    <Progress value={calculateProgress(activeTask)} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {activeTask.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {new Date(activeTask.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={addSubtask}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Subtask
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Subtasks Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Subtasks</h3>
                
                {activeTask.subtasks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <SplitSquareVertical className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="mb-4 text-muted-foreground">No subtasks yet. Break down your task into smaller, more manageable pieces.</p>
                    <Button onClick={addSubtask}>
                      <Plus className="h-4 w-4 mr-1" /> Add First Subtask
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {activeTask.subtasks.map((subtask, index) => (
                      <Collapsible key={subtask.id}>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 mr-4">
                                <div className="flex items-start">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 mt-0.5"
                                    onClick={() => updateSubtask(subtask.id, { completed: !subtask.completed })}
                                  >
                                    {subtask.completed ? (
                                      <CheckSquare className="h-5 w-5 text-primary" />
                                    ) : (
                                      <Square className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </Button>
                                  <CollapsibleTrigger asChild>
                                    <div className="flex-1 cursor-pointer">
                                      <CardTitle className={`text-base ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {subtask.title}
                                      </CardTitle>
                                      {subtask.description && (
                                        <CardDescription className="text-sm">
                                          {subtask.description}
                                        </CardDescription>
                                      )}
                                    </div>
                                  </CollapsibleTrigger>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="mr-1">
                                  {subtask.priority}
                                </Badge>
                                {subtask.estimatedMinutes && (
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {subtask.estimatedMinutes} min
                                  </Badge>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Subtask Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => addStep(subtask.id)}>
                                      <ListPlus className="h-4 w-4 mr-2" />
                                      Add Step
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateSubtask(subtask.id, { priority: 'high' })}>
                                      <MoveUp className="h-4 w-4 mr-2" />
                                      Set High Priority
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateSubtask(subtask.id, { priority: 'low' })}>
                                      <MoveDown className="h-4 w-4 mr-2" />
                                      Set Low Priority
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => deleteSubtask(subtask.id)}
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              {subtask.steps && subtask.steps.length > 0 ? (
                                <div className="space-y-2 pl-6 border-l-2 border-muted mt-2">
                                  {subtask.steps.map((step, stepIndex) => (
                                    <div key={step.id} className="flex items-center group">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => updateStep(subtask.id, step.id, { completed: !step.completed })}
                                      >
                                        {step.completed ? (
                                          <CheckSquare className="h-4 w-4 text-primary" />
                                        ) : (
                                          <Square className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </Button>
                                      <span className={`flex-1 text-sm ml-2 ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {step.title}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => deleteStep(subtask.id, step.id)}
                                      >
                                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => addStep(subtask.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Add Step
                                  </Button>
                                </div>
                              ) : (
                                <div className="pl-6 pt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => addStep(subtask.id)}
                                  >
                                    <ListPlus className="h-4 w-4 mr-2" /> Break Into Steps
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Active Task</h3>
              <p className="text-muted-foreground mb-4">
                Create a new task or select an existing one to start breaking it down.
              </p>
              <Button onClick={() => setActiveTab("create")}>
                Create New Task
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* All Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>
                Manage all your tasks and their breakdown progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <ListTodo className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Tasks Created</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first task to get started with breaking it down.
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    Create New Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <Card key={task.id} className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>{task.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-medium">Progress:</span>
                              <span className="text-xs">{calculateProgress(task)}%</span>
                            </div>
                            <Progress value={calculateProgress(task)} className="h-1.5" />
                          </div>
                          
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <div>
                              {task.subtasks.length} subtasks
                            </div>
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setActiveTask(task);
                            setActiveTab("active");
                          }}
                        >
                          <Layers className="h-3 w-3 mr-1" /> View Breakdown
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to optimize your task management?</h2>
        <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
          Create an account to save your tasks, access premium templates, 
          and get personalized ADHD-friendly task management strategies.
        </p>
        <Button size="lg" asChild>
          <Link to="/register">Create Free Account</Link>
        </Button>
      </div>
    </div>
  );
};

export default TaskBreakdownTool; 