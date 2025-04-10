import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusSessionService } from '@/services/focusSessionService';
import type { FocusSession, CreateFocusSessionDto } from '@/types/focusSession';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, StopCircle, PlusCircle, Trash2 } from 'lucide-react';

// Placeholder for a dedicated Timer component if needed
// import { ActiveSessionTimer } from './ActiveSessionTimer';

export const FocusSessionManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSessionData, setNewSessionData] = useState<Partial<CreateFocusSessionDto>>({
    technique: 'pomodoro', // Default technique
    planned_duration_seconds: 1500, // Default 25 mins
    mood_before: '',
    energy_level_before: 3, // Default midpoint
    notes: '',
  });

  // --- React Query Hooks ---
  const { data: sessions, isLoading, error } = useQuery<FocusSession[], Error>({
    queryKey: ['focusSessions'],
    queryFn: async () => {
      const { data, error } = await focusSessionService.getSessions();
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: focusSessionService.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusSessions'] });
      setShowCreateForm(false);
      setNewSessionData({ technique: 'pomodoro', planned_duration_seconds: 1500, mood_before: '', energy_level_before: 3, notes: '' });
      toast({ title: "Success", description: "Focus session planned." });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create session: ${error.message}`, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<FocusSession> }) => focusSessionService.updateSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['focusSessions'] });
      queryClient.invalidateQueries({ queryKey: ['focusSession', variables.id] }); // If using individual queries
      toast({ title: "Success", description: "Session updated." });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update session: ${error.message}`, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: focusSessionService.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusSessions'] });
      toast({ title: "Success", description: "Session deleted." });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete session: ${error.message}`, variant: "destructive" });
    },
  });

  // --- Event Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field: keyof CreateFocusSessionDto | 'energy_level_before_select') => {
    let value: string | number;
    if (typeof e === 'string') { // Handle Select change
      value = e;
      // Special handling if it's the energy level select
      if (field === 'energy_level_before_select') {
          setNewSessionData(prev => ({ ...prev, energy_level_before: parseInt(value, 10) }));
          return;
      }
    } else { // Handle Input/Textarea change
      value = e.target.value;
    }

    setNewSessionData(prev => ({
      ...prev,
      [field]: field === 'planned_duration_seconds' ? parseInt(value, 10) * 60 : value,
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionData.planned_duration_seconds || newSessionData.planned_duration_seconds <= 0) {
      toast({ title: "Invalid Duration", description: "Please enter a valid duration.", variant: "destructive" });
      return;
    }
    createMutation.mutate({ 
        ...newSessionData,
        start_time: new Date().toISOString(), // Set start time when planning
        planned_duration_seconds: newSessionData.planned_duration_seconds || 0, // Ensure it's a number
        technique: newSessionData.technique || 'custom', // Ensure technique is set
    } as CreateFocusSessionDto); // Type assertion might be needed if partial state causes issues
  };

  const handleStartSession = (sessionId: string) => {
    updateMutation.mutate({ id: sessionId, data: { status: 'active', start_time: new Date().toISOString() } });
  };

  const handlePauseSession = (sessionId: string) => {
    // Need to calculate actual duration up to this point if pausing
    // This logic might be better placed in a dedicated timer component or hook
    updateMutation.mutate({ id: sessionId, data: { status: 'paused' } });
  };

  const handleCompleteSession = (sessionId: string, sessionStartTime: string) => {
    const startTime = parseISO(sessionStartTime);
    const actual_duration_seconds = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    updateMutation.mutate({ id: sessionId, data: { status: 'completed', end_time: new Date().toISOString(), actual_duration_seconds } });
    // Potentially show a modal for mood_after, energy_level_after, notes update here
  };

  const handleCancelSession = (sessionId: string) => {
    updateMutation.mutate({ id: sessionId, data: { status: 'cancelled', end_time: new Date().toISOString() } });
  };

  const handleDeleteSession = (sessionId: string) => {
    // Optional: Add a confirmation dialog
    deleteMutation.mutate(sessionId);
  };

  // --- Rendering ---
  const renderSessionCard = (session: FocusSession) => (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{session.technique.charAt(0).toUpperCase() + session.technique.slice(1)} Session</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${ session.status === 'completed' ? 'bg-green-100 text-green-800' : session.status === 'active' ? 'bg-blue-100 text-blue-800' : session.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800' }`}>
              {session.status}
            </span>
          </CardTitle>
          <CardDescription>
            {session.status === 'planned' && `Planned for ${session.planned_duration_seconds / 60} mins`}
            {session.status !== 'planned' && `Started ${formatDistanceToNow(parseISO(session.start_time), { addSuffix: true })}`}
            {session.end_time && `, ended ${formatDistanceToNow(parseISO(session.end_time), { addSuffix: true })}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Basic Timer Display - Replace with ActiveSessionTimer for active/paused */} 
          {(session.status === 'active' || session.status === 'paused') && (
              <div className="text-center my-4">
                  <p className="text-4xl font-bold"> {/* Timer Placeholder */} </p>
                  {/* <ActiveSessionTimer session={session} onUpdate={updateMutation.mutate} /> */}
                  <p className="text-sm text-muted-foreground">Planned: {session.planned_duration_seconds / 60} mins</p>
              </div>
          )}
          {session.notes && <p className="text-sm mt-2">Notes: {session.notes}</p>}
          {/* Add more details: tasks, mood/energy etc. */} 
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {session.status === 'planned' && (
              <Button size="sm" onClick={() => handleStartSession(session.id)}><Play className="mr-1 h-4 w-4" /> Start</Button>
            )}
            {session.status === 'active' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handlePauseSession(session.id)}><Pause className="mr-1 h-4 w-4" /> Pause</Button>
                <Button size="sm" variant="destructive" onClick={() => handleCompleteSession(session.id, session.start_time)}><StopCircle className="mr-1 h-4 w-4" /> End</Button>
              </>
            )}
            {session.status === 'paused' && (
                 <Button size="sm" onClick={() => handleStartSession(session.id)}><Play className="mr-1 h-4 w-4" /> Resume</Button>
                 // Maybe add end from pause? 
            )}
          </div>
            {(session.status === 'planned' || session.status === 'cancelled' || session.status === 'completed') && (
                 <Button size="icon" variant="ghost" onClick={() => handleDeleteSession(session.id)} className="text-red-500 hover:text-red-700">
                     <Trash2 className="h-4 w-4" />
                 </Button>
            )}
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-4 md:p-6">
      <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold">Focus Sessions</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> {showCreateForm ? 'Cancel' : 'Plan New Session'}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Plan a New Focus Session</CardTitle>
                <CardDescription>Set up your next period of focused work.</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="technique">Technique</Label>
                      <Select 
                        value={newSessionData.technique}
                        onValueChange={(value) => handleInputChange(value, 'technique')}
                      >
                        <SelectTrigger id="technique">
                          <SelectValue placeholder="Select technique" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pomodoro">Pomodoro</SelectItem>
                          <SelectItem value="deep_work">Deep Work</SelectItem>
                          <SelectItem value="flowtime">Flowtime</SelectItem>
                           <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Planned Duration (minutes)</Label>
                      <Input 
                        id="duration"
                        type="number" 
                        min="1"
                        value={(newSessionData.planned_duration_seconds ?? 0) / 60}
                        onChange={(e) => handleInputChange(e, 'planned_duration_seconds')}
                        placeholder="e.g., 25"
                        required
                       />
                    </div>
                  </div>
                  {/* Optional fields like mood, energy, notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <Label htmlFor="mood_before">Mood Before</Label>
                         <Input 
                            id="mood_before"
                            value={newSessionData.mood_before || ''}
                            onChange={(e) => handleInputChange(e, 'mood_before')}
                            placeholder="e.g., Focused, Tired, Anxious"
                         />
                     </div>
                     <div>
                        <Label htmlFor="energy_level_before">Energy Level Before (1-5)</Label>
                        <Select 
                            value={String(newSessionData.energy_level_before ?? 3)}
                            onValueChange={(value) => handleInputChange(value, 'energy_level_before_select')}
                        >
                            <SelectTrigger id="energy_level_before">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 (Very Low)</SelectItem>
                                <SelectItem value="2">2 (Low)</SelectItem>
                                <SelectItem value="3">3 (Medium)</SelectItem>
                                <SelectItem value="4">4 (High)</SelectItem>
                                <SelectItem value="5">5 (Very High)</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea 
                      id="notes"
                      value={newSessionData.notes || ''}
                      onChange={(e) => handleInputChange(e, 'notes')}
                      placeholder="Any intentions or context for this session?"
                    />
                  </div>
                   {/* TODO: Add Task Association UI */}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Planning...' : 'Plan Session'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Session History</h2>
        {isLoading && <p>Loading sessions...</p>}
        {error && <p className="text-red-500">Error loading sessions: {error.message}</p>}
        {sessions && sessions.length === 0 && !isLoading && <p>No focus sessions planned or recorded yet.</p>}
        <AnimatePresence>
          {sessions?.map(renderSessionCard)}
        </AnimatePresence>
      </div>
    </div>
  );
}; 