import React, { useState, useEffect, useCallback } from 'react';
import { ReminderServiceInstance, Reminder } from '@/services/ReminderService';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox'; // For marking complete
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Trash2, Edit, PlusCircle, BellRing, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // For shadcn class merging
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ReminderFormState {
    id?: string;
    title: string;
    description: string;
    reminder_time: Date | undefined;
    // is_recurring: boolean; // Recurring functionality TBD
}

const initialFormState: ReminderFormState = {
    title: '',
    description: '',
    reminder_time: undefined,
};

export const ReminderManagement: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ReminderFormState>(initialFormState);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReminders = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ReminderServiceInstance.getReminders(user.id, {
        includeCompleted: true, // Fetch all for potential display toggle
        sortByTime: 'asc',
      });
      setReminders(data);
    } catch (err: any) {
      console.error('Failed to fetch reminders:', err);
      setError('Could not load reminders. Please try refreshing.');
      toast({ title: 'Error', description: err.message || 'Failed to fetch reminders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
      if (date) {
        // Combine selected date with a default time (e.g., 9:00 AM) or current time
        const now = new Date();
        date.setHours(9, 0, 0, 0); // Set to 9:00 AM for simplicity
      }
    setFormData(prev => ({ ...prev, reminder_time: date }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.id || !formData.title || !formData.reminder_time) {
          toast({ title: "Missing Information", description: "Please provide a title and select a date/time.", variant: "destructive" });
          return;
      }
      setIsSubmitting(true);

      const reminderPayload = {
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          reminder_time: formData.reminder_time.toISOString(),
          is_recurring: false, // Hardcoded for now
      };
      
      try {
          if (formData.id) { // Update existing reminder
             await ReminderServiceInstance.updateReminder(formData.id, user.id, reminderPayload);
             toast({ title: "Reminder Updated", description: `'${formData.title}' was updated.` });
          } else { // Create new reminder
             await ReminderServiceInstance.createReminder(reminderPayload);
             toast({ title: "Reminder Created", description: `'${formData.title}' was added.` });
          }
          setIsFormOpen(false);
          setFormData(initialFormState);
          fetchReminders(); // Refresh list
      } catch (err: any) {
          console.error("Failed to save reminder:", err);
          toast({ title: "Save Error", description: err.message || "Could not save the reminder.", variant: "destructive" });
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
      if (!user?.id) return;
      const isCompleted = !reminder.is_completed;

      // Optimistic update
      setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null } : r));

      try {
          await ReminderServiceInstance.updateReminder(reminder.id!, user.id, { is_completed: isCompleted });
          toast({ title: `Reminder ${isCompleted ? 'Completed' : 'Marked Incomplete'}`});
           // Optionally refetch or rely on optimistic update
           fetchReminders(); // Refetch to ensure consistency esp. with filtering
      } catch (err: any) {
          console.error("Failed to toggle reminder completion:", err);
          // Revert optimistic update
          setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, is_completed: reminder.is_completed, completed_at: reminder.completed_at } : r));
          toast({ title: "Update Error", description: err.message || "Could not update reminder status.", variant: "destructive" });
      }
  };

  const handleDeleteReminder = async (id: string, title: string) => {
      if (!user?.id) return;
      if (!window.confirm(`Are you sure you want to delete the reminder "${title}"?`)) return;

      // Optimistic removal
      const originalList = [...reminders];
      setReminders(prev => prev.filter(r => r.id !== id));

      try {
          await ReminderServiceInstance.deleteReminder(id, user.id);
          toast({ title: "Reminder Deleted", description: `'${title}' was removed.` });
      } catch (err: any) { 
          console.error("Failed to delete reminder:", err);
          setReminders(originalList); // Revert
          toast({ title: "Delete Error", description: err.message || "Could not delete the reminder.", variant: "destructive" });
      }
  };

  const openEditForm = (reminder: Reminder) => {
      setFormData({
          id: reminder.id,
          title: reminder.title,
          description: reminder.description || '',
          reminder_time: reminder.reminder_time ? parseISO(reminder.reminder_time) : undefined,
      });
      setIsFormOpen(true);
  };

  const openNewForm = () => {
      setFormData(initialFormState);
      setIsFormOpen(true);
  };
  
  const filteredReminders = reminders.filter(r => showCompleted || !r.is_completed);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
           <CardTitle className="flex items-center"><BellRing className="h-5 w-5 mr-2"/>Reminders</CardTitle>
           <CardDescription>Manage your upcoming reminders.</CardDescription>
        </div>
         <div className="flex items-center gap-2">
             <div className="flex items-center space-x-2">
                <Checkbox 
                    id="showCompleted"
                    checked={showCompleted}
                    onCheckedChange={(checked) => setShowCompleted(!!checked)}
                />
                <Label htmlFor="showCompleted" className="text-sm font-medium">Show Completed</Label>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <DialogTrigger asChild>
                    <Button size="sm" onClick={openNewForm}> 
                         <PlusCircle className="h-4 w-4 mr-1" /> Add Reminder
                    </Button>
                 </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <form onSubmit={handleFormSubmit}>
                         <DialogHeader>
                           <DialogTitle>{formData.id ? 'Edit Reminder' : 'Add New Reminder'}</DialogTitle>
                         </DialogHeader>
                         <div className="grid gap-4 py-4">
                            {/* Title */}
                            <div className="grid grid-cols-4 items-center gap-4">
                               <Label htmlFor="title" className="text-right">Title</Label>
                               <Input 
                                  id="title" 
                                  name="title"
                                  value={formData.title} 
                                  onChange={handleInputChange} 
                                  className="col-span-3" 
                                  required 
                               />
                             </div>
                             {/* Description */}
                             <div className="grid grid-cols-4 items-center gap-4">
                               <Label htmlFor="description" className="text-right">Description</Label>
                               <Textarea 
                                  id="description" 
                                  name="description"
                                  value={formData.description} 
                                  onChange={handleInputChange} 
                                  className="col-span-3" 
                                  rows={3}
                                  placeholder="(Optional)"
                               />
                             </div>
                             {/* Reminder Time */}
                             <div className="grid grid-cols-4 items-center gap-4">
                               <Label htmlFor="reminder_time" className="text-right">Date & Time</Label>
                               <Popover>
                                 <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                          "col-span-3 justify-start text-left font-normal",
                                          !formData.reminder_time && "text-muted-foreground"
                                        )}
                                      >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                       {formData.reminder_time ? format(formData.reminder_time, "PPP 'at' h:mm a") : <span>Pick a date and time</span>}
                                     </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={formData.reminder_time}
                                      onSelect={handleDateChange} 
                                      initialFocus
                                    />
                                     {/* Basic Time Picker - Could be improved with a dedicated component */}
                                    <div className="p-2 border-t">
                                        <Label className="text-sm">Time (HH:MM)</Label>
                                         <Input 
                                             type="time" 
                                             defaultValue={formData.reminder_time ? format(formData.reminder_time, 'HH:mm') : '09:00'}
                                             onChange={(e) => {
                                                 const [hours, minutes] = e.target.value.split(':').map(Number);
                                                 setFormData(prev => {
                                                     const newDate = prev.reminder_time ? new Date(prev.reminder_time) : new Date();
                                                     newDate.setHours(hours, minutes, 0, 0);
                                                     return {...prev, reminder_time: newDate };
                                                 });
                                             }}
                                             className="mt-1"
                                         />
                                    </div>
                                  </PopoverContent>
                                </Popover>
                             </div>
                             {/* Recurring Options (Placeholder) */}
                             {/* <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Recurring</Label>
                                <Checkbox className="col-span-3 justify-self-start" disabled title="Recurring reminders coming soon"/>
                             </div> */}
                         </div>
                         <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !formData.title || !formData.reminder_time}>
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Save Reminder'}
                            </Button>
                         </DialogFooter>
                    </form>
                 </DialogContent>
            </Dialog>
         </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="text-center p-4 text-muted-foreground">Loading reminders...</div>
        )}
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && filteredReminders.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            {showCompleted ? 'No reminders found.' : 'No upcoming reminders. Add one!'}
            </p>
        )}
        {!isLoading && !error && filteredReminders.length > 0 && (
          <div className="space-y-3">
            {filteredReminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className={`flex items-start gap-3 p-3 rounded-md border ${reminder.is_completed ? 'border-dashed border-muted-foreground/30 bg-muted/30' : 'border-border bg-background'}`}
                >
                <Checkbox 
                    id={`reminder-${reminder.id}`}
                    checked={reminder.is_completed}
                    onCheckedChange={() => handleToggleComplete(reminder)}
                    className="mt-1"
                 />
                <div className="flex-grow">
                   <label 
                     htmlFor={`reminder-${reminder.id}`}
                     className={`font-medium block ${reminder.is_completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                    {reminder.title}
                    </label>
                  {reminder.description && (
                    <p className={`text-sm mt-0.5 ${reminder.is_completed ? 'line-through text-muted-foreground/80' : 'text-muted-foreground'}`}>
                        {reminder.description}
                    </p>
                  )}
                  <p className={`text-xs mt-1 ${reminder.is_completed ? 'line-through text-muted-foreground/60' : 'text-muted-foreground/80'}`}>
                      {format(parseISO(reminder.reminder_time), "eee, MMM d, yyyy 'at' h:mm a")}
                      {reminder.is_completed && reminder.completed_at && (
                         <span className="italic"> (Completed {format(parseISO(reminder.completed_at), "MMM d")})</span>
                      )}
                   </p>
                </div>
                {!reminder.is_completed && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditForm(reminder)} title="Edit Reminder">
                        <Edit className="h-4 w-4"/>
                    </Button>
                )}
                 <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteReminder(reminder.id!, reminder.title)} title="Delete Reminder">
                     <Trash2 className="h-4 w-4"/>
                 </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 