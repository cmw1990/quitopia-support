import React, { useState, useMemo, useCallback } from 'react';
import { Task } from '@/types/tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, AlertCircle, View } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfDay, addHours, addDays, isSameDay, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import { EventInput, EventDropArg, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import './TimeBlockingView.css';

interface TimeBlockingViewProps {
    tasks: Task[];
    updateTask: (updatedTask: Task) => Promise<void>; 
    onEditTask: (task: Task) => void;
}

// Map Task to FullCalendar Event - Enhanced Styling
const taskToEvent = (task: Task): EventInput | null => {
    if (!task.scheduled_start_time) return null;
    const start = parseISO(task.scheduled_start_time);
    if (!isValid(start)) return null;

    let end: Date | null = task.scheduled_end_time ? parseISO(task.scheduled_end_time) : null;
    if (!end || !isValid(end)) {
        end = addHours(start, 1);
    }
    if (end <= start) {
        end = addHours(start, 1);
    }

    const priorityColors: Record<string, { backgroundColor: string, borderColor: string, textColor?: string }> = {
        high: { backgroundColor: 'var(--fc-event-bg-red)', borderColor: 'var(--fc-event-border-red)', textColor: 'var(--fc-event-text-red)' },
        medium: { backgroundColor: 'var(--fc-event-bg-yellow)', borderColor: 'var(--fc-event-border-yellow)', textColor: 'var(--fc-event-text-yellow)' },
        low: { backgroundColor: 'var(--fc-event-bg-blue)', borderColor: 'var(--fc-event-border-blue)', textColor: 'var(--fc-event-text-blue)' },
        default: { backgroundColor: 'var(--fc-event-bg-default)', borderColor: 'var(--fc-event-border-default)', textColor: 'var(--fc-event-text-default)' }
    };
    const colors = priorityColors[task.priority || 'default'] || priorityColors.default;

    return {
        id: task.id,
        title: task.title,
        start: start,
        end: end,
        allDay: false,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        textColor: colors.textColor,
        classNames: ['fc-event-easier-focus', `fc-event-priority-${task.priority || 'default'}`],
        extendedProps: {
           originalTask: task,
        },
    };
};

export const TimeBlockingView: React.FC<TimeBlockingViewProps> = ({ tasks, updateTask, onEditTask }) => {
    const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
    const [currentView, setCurrentView] = useState('timeGridWeek');
    const { toast } = useToast();
    const calendarRef = React.useRef<FullCalendar>(null);

    const calendarEvents = useMemo(() => {
        return tasks.map(taskToEvent).filter(event => event !== null) as EventInput[];
    }, [tasks]);

    const handlePrev = () => calendarRef.current?.getApi().prev();
    const handleNext = () => calendarRef.current?.getApi().next();
    const handleToday = () => calendarRef.current?.getApi().today();
    const handleViewChange = (view: string) => {
        if (view && calendarRef.current) {
             calendarRef.current.getApi().changeView(view);
             setCurrentView(view);
        }
    };

    // --- Calendar Interaction Handlers --- 
    const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
        const { event } = dropInfo;
        const taskId = event.id;
        const originalTask = tasks.find(t => t.id === taskId);
        if (!originalTask || !event.start || !event.end) {
            toast({ title: 'Update Failed', description: 'Could not find original task or new times.', variant: 'destructive' });
            dropInfo.revert();
            return;
        }
        const updatedTask: Task = {
            ...originalTask,
            scheduled_start_time: event.start.toISOString(),
            scheduled_end_time: event.end.toISOString(),
            updated_at: new Date().toISOString(),
        };
        try {
            await updateTask(updatedTask);
            toast({ title: 'Task Rescheduled', description: `"${updatedTask.title}" moved.` });
        } catch (error: any) {
            toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
            dropInfo.revert();
        }
    }, [tasks, updateTask, toast]);

    const handleEventResize = useCallback(async (resizeInfo: EventResizeDoneArg) => {
        const { event } = resizeInfo;
         const taskId = event.id;
         const originalTask = tasks.find(t => t.id === taskId);
         if (!originalTask || !event.start || !event.end) {
             toast({ title: 'Update Failed', description: 'Could not find original task or new times.', variant: 'destructive' });
             resizeInfo.revert();
             return;
         }
         const updatedTask: Task = {
             ...originalTask,
             scheduled_start_time: event.start.toISOString(),
             scheduled_end_time: event.end.toISOString(),
             updated_at: new Date().toISOString(),
         };
         try {
             await updateTask(updatedTask);
             toast({ title: 'Task Duration Updated', description: `"${updatedTask.title}" duration changed.` });
         } catch (error: any) {
             toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
             resizeInfo.revert();
         }
    }, [tasks, updateTask, toast]);

    // Handle clicking on an event to edit the task
    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
        const taskId = clickInfo.event.id;
        const taskToEdit = tasks.find(t => t.id === taskId);
        if (taskToEdit) {
            onEditTask(taskToEdit);
        } else {
             toast({ title: 'Error', description: 'Could not find the selected task data.', variant: 'destructive' });
        }
    }, [tasks, onEditTask, toast]);

    // Handle selecting a time range (placeholder for now, could open quick add)
    const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
        console.log('Selected time range:', selectInfo.startStr, 'to', selectInfo.endStr);
        toast({ title: 'Time Slot Selected', description: 'Quick task creation from calendar coming soon!' });
        calendarRef.current?.getApi().unselect();
    }, [toast]);
    
    const handleDatesSet = (arg: { start: Date; view: { title: string } }) => {
        setCurrentDate(startOfDay(arg.start));
    };

    return (
        <Card className="shadow-sm border bg-card text-card-foreground flex flex-col h-[calc(100vh-160px)] min-h-[650px]">
            <CardHeader className="p-3 border-b flex flex-row items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary flex-shrink-0" />
                     <div>
                         <CardTitle className="text-base font-medium leading-tight">Time Blocking</CardTitle>
                         <p className="text-xs text-muted-foreground leading-tight">
                             {calendarRef.current?.getApi().view.title}
                         </p>
                     </div>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8">
                         <ChevronLeft className="h-4 w-4" />
                     </Button>
                     <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs px-3">Today</Button>
                     <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8">
                         <ChevronRight className="h-4 w-4" />
                     </Button>
                     <ToggleGroup 
                        type="single" 
                        value={currentView} 
                        onValueChange={handleViewChange}
                        aria-label="Calendar view mode"
                        className="ml-2 bg-muted p-0.5 rounded-md h-8"
                     >
                         <ToggleGroupItem value="timeGridWeek" aria-label="Week view" className="h-full px-2 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=off]:text-muted-foreground">
                              Week
                         </ToggleGroupItem>
                         <ToggleGroupItem value="timeGridDay" aria-label="Day view" className="h-full px-2 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=off]:text-muted-foreground">
                             Day
                         </ToggleGroupItem>
                         <ToggleGroupItem value="dayGridMonth" aria-label="Month view" className="h-full px-2 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=off]:text-muted-foreground">
                             Month
                         </ToggleGroupItem>
                     </ToggleGroup>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-hidden relative"> 
                 <div className="p-1 md:p-2 lg:p-3 h-full easier-focus-calendar-wrapper"> 
                     <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView={currentView}
                        headerToolbar={false}
                        events={calendarEvents}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        nowIndicator={true}
                        allDaySlot={false}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        select={handleDateSelect}
                        datesSet={handleDatesSet}
                        eventClick={handleEventClick}
                        height="100%"
                        contentHeight="auto"
                        slotMinTime="06:00:00"
                        slotMaxTime="24:00:00"
                        slotDuration="00:30:00"
                        slotLabelInterval="01:00"
                        eventTimeFormat={{
                           hour: 'numeric',
                           minute: '2-digit',
                           hour12: true,
                           meridiem: 'short' 
                         }}
                        slotLabelFormat={{
                           hour: 'numeric',
                           minute: '2-digit',
                           hour12: true,
                           meridiem: 'short'
                        }}
                        viewClassNames="fc-view-easier-focus"
                        dayHeaderClassNames="fc-header-easier-focus"
                        slotLabelClassNames="fc-slot-label-easier-focus"
                     />
                 </div>
                 {/* Placeholder Alert - removed as implementation is starting */}
                 {/* <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-800 dark:text-amber-200">Feature Pending</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">Displaying tasks on a time grid requires integrating a calendar library. This feature will be implemented once the library choice is confirmed in ssot8001.</AlertDescription>
                </Alert> */}
            </CardContent>
        </Card>
    );
};