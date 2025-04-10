import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { format, set } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Brain, 
  Zap, 
  Timer, 
  ListChecks, 
  Sparkles, 
  BookOpen,
  Save, 
  Play,
  ChevronsUpDown,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  createFocusSessionPlan, 
  getPlannableTasks,
  FocusTask
} from '@/api/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { Switch } from '@/components/ui/switch';

// Define types needed for planning
type FocusTechnique = 'pomodoro' | 'deep_work' | 'timeboxed' | 'flow'; // Match FocusSession type

// Updated SessionPlan interface
interface SessionPlan {
  technique: FocusTechnique;
  taskId?: string; // Store selected task ID
  taskName?: string; // Store selected task name (for display)
  plannedDurationMinutes: number;
  scheduledStartTime?: Date;
}

// Checklist item structure
interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export const FocusSessionPlanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initial state with taskId
  const initialPlanState: SessionPlan = {
    technique: 'pomodoro',
    plannedDurationMinutes: 25,
    taskId: undefined,
    taskName: undefined,
    scheduledStartTime: undefined
  };

  const [plan, setPlan] = useState<SessionPlan>(initialPlanState);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<FocusTask[]>([]);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
      { id: 'c1', label: 'Silence phone notifications', checked: false },
      { id: 'c2', label: 'Close unnecessary browser tabs', checked: false },
      { id: 'c3', label: 'Prepare water/drink', checked: false },
      { id: 'c4', label: 'Inform colleagues/family (if needed)', checked: false },
      { id: 'c5', label: 'Set clear intention/goal for the session', checked: false },
  ]);

  // Fetch plannable tasks
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      setIsTaskLoading(true);
      try {
        const fetchedTasks = await getPlannableTasks(user.id);
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast.error("Could not load tasks. Please try again.");
      } finally {
        setIsTaskLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const handlePlanChange = useCallback((key: keyof SessionPlan, value: any) => {
    setPlan(prev => ({ ...prev, [key]: value }));

    // Adjust default duration based on technique
    if (key === 'technique') {
      let defaultDuration = 25;
      if (value === 'deep_work') defaultDuration = 90;
      if (value === 'timeboxed') defaultDuration = 60;
      if (value === 'flow') defaultDuration = 0;
      setPlan(prev => ({ ...prev, technique: value, plannedDurationMinutes: defaultDuration }));
    }

    // If task is selected, update duration if task has estimate
    if (key === 'taskId') {
      const selectedTask = tasks.find(t => t.id === value);
      if (selectedTask?.estimated_minutes) {
        setPlan(prev => ({ ...prev, plannedDurationMinutes: selectedTask.estimated_minutes as number }));
      }
      // Update taskName for display
      setPlan(prev => ({ ...prev, taskName: selectedTask?.title }));
    }
  }, [tasks]);

  // Handle date/time changes more robustly
  const handleDateTimeChange = useCallback((newDateTimePart: Partial<{ date: Date | undefined, time: string }>) => {
    const currentScheduledTime = plan.scheduledStartTime || new Date();
    let newScheduledTime = new Date(currentScheduledTime); // Clone the date

    if (newDateTimePart.date) {
      newScheduledTime = set(newScheduledTime, {
        year: newDateTimePart.date.getFullYear(),
        month: newDateTimePart.date.getMonth(),
        date: newDateTimePart.date.getDate(),
      });
    }
    
    if (newDateTimePart.time) {
      const [hours, minutes] = newDateTimePart.time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        newScheduledTime = set(newScheduledTime, { hours, minutes, seconds: 0, milliseconds: 0 });
      }
    }
    
    handlePlanChange('scheduledStartTime', newScheduledTime);

  }, [plan.scheduledStartTime, handlePlanChange]);

  // Toggle checklist item
  const toggleChecklistItem = (itemId: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleSchedule = async () => {
    if (!plan.scheduledStartTime) {
      toast.error("Please select a start time for scheduling.");
      return;
    }
    if (!user) {
       toast.error("You must be logged in to schedule a session.");
       return;
    }
    
    setIsLoading(true);
    try {
      // Prepare data using taskId
      const sessionPayload = {
        user_id: user.id,
        focus_type: plan.technique,
        task_id: plan.taskId || null, // Use taskId
        planned_duration_minutes: plan.plannedDurationMinutes, 
        scheduled_start_time: plan.scheduledStartTime.toISOString(),
        // task_name will be joined/looked up based on task_id in backend or display layer
      };
      
      await createFocusSessionPlan(sessionPayload);
      
      toast.success(`Session for "${plan.taskName || plan.technique}" scheduled for ${format(plan.scheduledStartTime, 'Pp')}`);
      setPlan(initialPlanState); // Reset form
      setChecklist(checklist.map(i => ({...i, checked: false}))); // Reset checklist
      setIsScheduling(false);
    } catch (error) {
      console.error("Failed to schedule session:", error);
      toast.error("Failed to schedule session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNow = async () => {
     if (!user) {
       toast.error("You must be logged in to start a session.");
       return;
     }
     
     // Ensure taskId and taskName are correctly included in the plan object being passed
     const sessionPlanToSend: SessionPlan = {
       ...plan, // Contains technique, plannedDurationMinutes, scheduledStartTime (if set)
       taskId: plan.taskId, // Explicitly include taskId
       taskName: plan.taskName, // Explicitly include taskName
     };

     toast.info("Starting session...");
     // Pass the modified sessionPlanToSend in the navigation state
     navigate('/app/focus-timer', { state: { sessionPlan: sessionPlanToSend } }); 
  };

  return (
    <TooltipProvider>
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-6 w-6" /> Plan New Focus Session
        </CardTitle>
        <CardDescription>
          Choose your technique, link a task, set a duration, and prepare for deep work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technique Selection with Tooltips */}
        <div className="space-y-2">
          <Label htmlFor="technique">Focus Technique</Label>
          <Select 
             value={plan.technique} 
             onValueChange={(value: FocusTechnique) => handlePlanChange('technique', value)}
           >
            <SelectTrigger id="technique">
              <SelectValue placeholder="Select technique" />
            </SelectTrigger>
            <SelectContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <SelectItem value="pomodoro">
                     <div className="flex items-center gap-2">
                       <Timer className="h-4 w-4" /> Pomodoro
                     </div>
                   </SelectItem>
                 </TooltipTrigger>
                 <TooltipContent side="right">
                   <p className="text-xs max-w-xs">Work in focused bursts (e.g., 25 min) with short breaks.</p>
                 </TooltipContent>
               </Tooltip>
              <Tooltip delayDuration={100}>
                 <TooltipTrigger asChild>
                   <SelectItem value="deep_work">
                     <div className="flex items-center gap-2">
                       <Brain className="h-4 w-4" /> Deep Work
                     </div>
                   </SelectItem>
                 </TooltipTrigger>
                 <TooltipContent side="right">
                   <p className="text-xs max-w-xs">Long, uninterrupted focus sessions (e.g., 90+ min) on a single task.</p>
                 </TooltipContent>
               </Tooltip>
              <Tooltip delayDuration={100}>
                 <TooltipTrigger asChild>
                   <SelectItem value="timeboxed">
                     <div className="flex items-center gap-2">
                       <Clock className="h-4 w-4" /> Timeboxing
                     </div>
                   </SelectItem>
                 </TooltipTrigger>
                 <TooltipContent side="right">
                   <p className="text-xs max-w-xs">Allocate a fixed time block for a specific task, regardless of completion.</p>
                 </TooltipContent>
               </Tooltip>
              {/* Flow state not selectable yet */}
            </SelectContent>
          </Select>
        </div>

        {/* Task Selection Combobox */}
        <div className="space-y-2">
           <Label htmlFor="task">Link Task (Optional)</Label>
           <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="w-full justify-between font-normal"
                disabled={isTaskLoading}
              >
                {isTaskLoading ? (
                   <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading...</>
                ) : plan.taskId ? (
                  tasks.find((task) => task.id === plan.taskId)?.title
                ) : (
                  "Select task..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
              <Command shouldFilter={true}>
                <CommandInput placeholder="Search task..." />
                <CommandList>
                  <CommandEmpty>No tasks found.</CommandEmpty>
                  <CommandGroup>
                    {tasks.map((task) => (
                      <CommandItem
                        key={task.id}
                        value={task.id} // Use ID for value
                        onSelect={(currentValue: string) => {
                          handlePlanChange('taskId', currentValue === plan.taskId ? undefined : currentValue);
                          setComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            plan.taskId === task.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {task.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
           {plan.taskName && <p className="text-xs text-muted-foreground pl-1">(Selected: {plan.taskName})</p>}
        </div>

        {/* Planned Duration */}
        {plan.technique !== 'flow' && (
          <div className="space-y-2">
             <Label htmlFor="duration">Planned Duration (minutes)</Label>
             <Input 
               id="duration" 
               type="number" 
               min="5" 
               step="5"
               value={plan.plannedDurationMinutes}
               onChange={(e) => handlePlanChange('plannedDurationMinutes', parseInt(e.target.value) || 0)}
              />
           </div>
         )}

        {/* Interactive Pre-Session Checklist */}
        <div className="space-y-3 pt-4 border-t">
           <Label className="flex items-center gap-2 font-medium">
             <ListChecks className="h-5 w-5"/> Pre-Session Checklist
           </Label>
           <div className="space-y-2 max-h-32 overflow-y-auto text-sm pl-2">
             {checklist.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                   <Checkbox 
                      id={item.id} 
                      checked={item.checked} 
                      onCheckedChange={() => toggleChecklistItem(item.id)} 
                    />
                   <label
                     htmlFor={item.id}
                     className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                     onClick={() => toggleChecklistItem(item.id)} // Allow clicking label
                   >
                     {item.label}
                   </label>
                 </div>
             ))}
           </div>
         </div>
         
        {/* Environment Tips Placeholder */}
         <div className="space-y-2 pt-4 border-t">
           <Label className="flex items-center gap-2 font-medium">
             <Sparkles className="h-5 w-5"/> Focus Environment Tip
           </Label>
           <p className="text-sm text-muted-foreground pl-2 italic">
              Find a quiet space and minimize visual clutter before starting.
           </p>
         </div>

        {/* Scheduling Section */}
         <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 font-medium">
              <CalendarIcon className="h-5 w-5"/> Schedule for Later?
            </Label>
            <Switch checked={isScheduling} onCheckedChange={setIsScheduling} />
          </div>
          {isScheduling && (
            <motion.div 
              className="space-y-3 pl-2 pt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
               <Popover>
                 <PopoverTrigger asChild>
                   <Button
                     variant={"outline"}
                     className={cn(
                       "w-full justify-start text-left font-normal",
                       !plan.scheduledStartTime && "text-muted-foreground"
                     )}
                   >
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {plan.scheduledStartTime ? format(plan.scheduledStartTime, "PPP HH:mm") : <span>Pick a date and time</span>}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0">
                   <Calendar
                     mode="single"
                     selected={plan.scheduledStartTime}
                     onSelect={(date) => handleDateTimeChange({ date })}
                     disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
                     initialFocus
                   />
                    <div className="p-3 border-t border-border">
                       <Label htmlFor="schedule-time" className="text-xs">Time</Label>
                       <Input 
                         id="schedule-time"
                         type="time" 
                         defaultValue={plan.scheduledStartTime ? format(plan.scheduledStartTime, 'HH:mm') : '09:00'}
                         onChange={(e) => handleDateTimeChange({ time: e.target.value })}
                       />
                     </div>
                 </PopoverContent>
               </Popover>
            </motion.div>
          )}
        </div>

      </CardContent>
      <CardFooter className="flex justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={() => { 
            setPlan(initialPlanState); // Reset form
            setChecklist(checklist.map(i => ({...i, checked: false}))); // Reset checklist
            setIsScheduling(false); // Reset scheduling toggle
          }}
        >
           Reset
         </Button>
         {isScheduling ? (
           <Button onClick={handleSchedule} disabled={isLoading || !plan.scheduledStartTime}>
             {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Scheduling...</> : <><Save className="mr-2 h-4 w-4"/> Schedule Session</>}
           </Button>
         ) : (
           <Button onClick={handleStartNow} disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Starting...</> : <><Play className="mr-2 h-4 w-4"/> Start Now</>}
           </Button>
         )}
      </CardFooter>
    </Card>
    </TooltipProvider>
  );
};

export default FocusSessionPlanner; 