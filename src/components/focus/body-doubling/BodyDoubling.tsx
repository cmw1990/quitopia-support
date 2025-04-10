import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider'; // Corrected import path
import { BodyDoublingTemplates } from './BodyDoublingTemplates';
import { BodyDoublingServiceInstance, BodyDoublingSession } from '@/services/BodyDoublingService'; // Import the service
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Separator } from '../../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Progress } from '../../ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { toast } from 'sonner';
import { Calendar, Clock, Users, Video, Mic, MicOff, Camera, CameraOff, Share2, MessageSquare, UserPlus, AlertCircle, ThumbsUp, Timer, RefreshCw, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

// Mock API removed, will use BodyDoublingServiceInstance

// Use the correct BodyDoublingSession type
interface SessionProps {
  session: BodyDoublingSession; 
  onJoin: (sessionId: string) => void;
  // Add optional placeholder for potential host data if fetched separately
  hostData?: { name: string; avatar?: string }; 
}

// Session Card Component
const SessionCard: React.FC<SessionProps> = ({ session, onJoin, hostData }) => {
  // Remove getCategoryColor as category is not in the schema currently
  // const getCategoryColor = (category: string) => { ... };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'; // Use 'active'
    if (status === 'waiting') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'; // Use 'waiting'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return 'N/A';
    try {
      const time = new Date(timeString);
      // Check if date is valid before formatting
      if (isNaN(time.getTime())) {
         console.warn("Invalid date string received:", timeString);
         return 'Invalid Date';
      }
      return format(time, 'h:mm a');
    } catch (error) {
      console.error("Error formatting time:", timeString, error);
      return 'Error'; // Indicate error state
    }
  };

  // Use hostData if provided, otherwise generate placeholder from host_user_id
  const hostName = hostData?.name || `User ${session.host_user_id.substring(0, 6)}...`;
  const hostAvatar = hostData?.avatar; 
  const hostFallback = hostName?.charAt(0)?.toUpperCase() || 'H'; // Use optional chaining and fallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{session.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                {session.current_participants} participant{session.current_participants !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              {/* Category Badge Removed */}
              <Badge variant="outline" className={getStatusColor(session.status)}>
                 {/* Adjust status display text */}
                {session.status === 'active' ? 'In Progress' : session.status === 'waiting' ? 'Scheduled' : session.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          {/* Use derived host info */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              {hostAvatar && <AvatarImage src={hostAvatar} alt={hostName} />}
              <AvatarFallback>{hostFallback}</AvatarFallback>
            </Avatar>
            <div className="text-sm leading-none">
              Hosted by <span className="font-medium">{hostName}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              {session.status === 'active' ? 'Started at ' : 'Starts at '}
              {/* Prioritize actual start time, then scheduled, then created */}
              {formatTime(session.actual_start_time || session.scheduled_start_time || session.created_at)}
              <span className="mx-1">•</span>
              {session.estimated_duration_minutes} min
            </div>
            
            <div className="flex items-center text-sm gap-2">
              {/* Video/Audio indicators commented out */}
              {session.is_public ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Public Session</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-xs text-muted-foreground">Private</span>
              )}
            </div>
            
             {/* Progress bar commented out */}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => session.id && onJoin(session.id)} // Ensure session.id exists
            variant={session.status === 'active' ? 'default' : 'outline'}
            disabled={!session.id} // Disable if no ID
          >
            {session.status === 'active' ? 'Join Now' : 'View Details'} 
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const VideoOff = CameraOff;

export const BodyDoubling: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeSessions, setActiveSessions] = useState<BodyDoublingSession[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<BodyDoublingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<BodyDoublingSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all'); // Keep for UI filter state
  
  // Removed category from newSession state
  const [newSession, setNewSession] = useState<Partial<BodyDoublingSession> & { name: string }>({ 
    name: '',
    description: '',
    estimated_duration_minutes: 60,
    max_participants: 5, 
    is_public: true,
  });
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const fetchSessions = async (signal?: AbortSignal) => { // Accept optional signal
    try {
      const allSessions = await BodyDoublingServiceInstance.getActivePublicSessions(100, signal); // Pass signal
      
      const now = new Date();
      const active = allSessions.filter(s => s.status === 'active');
      const scheduled = allSessions.filter(s => 
        s.status === 'waiting' && 
        s.scheduled_start_time && 
        new Date(s.scheduled_start_time) > now
      );

      setActiveSessions(active); 
      setScheduledSessions(scheduled);

    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Could not load sessions. Please try again later.");
    }
  };

  useEffect(() => {
    const controller = new AbortController(); // Create AbortController
    const signal = controller.signal;

    fetchSessions(signal); // Pass signal to fetch function
    // Fetch periodically? Or use Realtime? For now, only on mount.

    return () => {
      controller.abort(); // Abort the request on cleanup
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []); // Keep empty dependency array for mount/unmount behavior
  
  const handleJoinSession = async (sessionId: string) => { // sessionId is guaranteed here
    if (!user) {
       toast.error("You must be logged in to join a session.");
       return;
    }
    toast.info("Joining session view..."); // Updated message
    
    const session = [...activeSessions, ...scheduledSessions].find(s => s.id === sessionId);
    if (session) {
        setCurrentSession(session);
        setIsSessionActive(true); 
        toast.success(`Viewing details for "${session.title}"`);
        
        // Timer Logic
        setElapsedTime(0); 
        if(timerInterval) clearInterval(timerInterval); 

        if (session.status === 'active' && session.actual_start_time) {
             const startTime = new Date(session.actual_start_time).getTime();
             const now = Date.now();
             // Calculate initial elapsed time, ensuring it's not negative
             const initialElapsedTime = Math.max(0, Math.floor((now - startTime) / 1000)); 
             setElapsedTime(initialElapsedTime);

             const interval = setInterval(() => {
                 setElapsedTime(prev => prev + 1);
             }, 1000);
             setTimerInterval(interval);
         } else {
             setTimerInterval(null); // Ensure no timer runs for scheduled sessions
         }

    } else {
        toast.error("Session details not found.");
        // Attempt to refetch in case the list is stale
        await fetchSessions(); 
    }
  };
  
  // Simplified handleLeaveSession just closes the view
   const handleLeaveSession = () => {
     if (!currentSession) return; 
     toast.info(`Closing view for "${currentSession.title}".`);
     setIsSessionActive(false);
     setCurrentSession(null);
     if (timerInterval) {
       clearInterval(timerInterval);
       setTimerInterval(null);
     }
     setElapsedTime(0);
    };
  
  const handleCreateSession = async () => {
     if (!user) {
         toast.error("You must be logged in to create a session.");
         return;
     }
     if (!newSession.name) {
         toast.warning("Please provide a name for your session.");
         return;
     }

     try {
         if (!user?.id) {
             toast.error("User ID not found. Cannot create session.");
             return;
         }

         const sessionToCreate: Pick<BodyDoublingSession, 'host_user_id' | 'title' | 'description' | 'max_participants' | 'is_public' | 'estimated_duration_minutes'> = {
             host_user_id: user.id, 
             title: newSession.name,
             description: newSession.description || null,
             max_participants: newSession.max_participants || 5,
             is_public: newSession.is_public ?? true,
             estimated_duration_minutes: newSession.estimated_duration_minutes || 60,
             // status is set server-side or by default in service
         };

         const createdSession = await BodyDoublingServiceInstance.createSession(sessionToCreate);
         
         await fetchSessions(); // Refetch to update lists

         setShowCreateDialog(false);
         toast.success(`Session "${createdSession.title}" created successfully`);

         // Reset form
         setNewSession({
             name: '',
             description: '',
             estimated_duration_minutes: 60,
             max_participants: 5,
             is_public: true,
         });

     } catch (error: any) {
         console.error("Create Session Error:", error);
         toast.error(`Failed to create session: ${error.message || 'Unknown error'}`);
    }
  };
  
  const formatElapsedTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Removed getCategoryIcon as category isn't used currently
  
  // Filtering logic remains, but category filter part is commented out
  const filteredActiveSessions = activeSessions.filter((session: BodyDoublingSession) => { 
    // Category filter commented out
    // if (filterCategory !== 'all' && session.category !== filterCategory) return false; 
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // Ensure title is not null before calling toLowerCase
      return session.title?.toLowerCase().includes(query) ?? false; 
    }
    return true; 
  });
  
  const filteredScheduledSessions = scheduledSessions.filter((session: BodyDoublingSession) => { 
     // Category filter commented out
    // if (filterCategory !== 'all' && session.category !== filterCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // Ensure title is not null before calling toLowerCase
      return session.title?.toLowerCase().includes(query) ?? false; 
    }
    return true; 
  });
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Body Doubling</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Host New Session
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Body doubling helps maintain focus through shared accountability. Join an existing session or create your own.
        </p>
        
        <Separator className="my-4" />
        
        {/* Active Session View */}
        {isSessionActive && currentSession && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted rounded-lg p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  {/* Category Icon removed */}
                  <span className="ml-2">{currentSession.title}</span>
                  <Badge className="ml-3">In Progress</Badge>
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Session with {currentSession.current_participants || 0} participant{currentSession.current_participants !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">ELAPSED TIME</p>
                  <div className="text-xl font-mono">{formatElapsedTime(elapsedTime)}</div> 
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mic className="w-4 h-4 mr-2" />
                    Mic
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleLeaveSession}> 
                    Leave
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-background rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2 h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-2" />
                    <p>Video area will appear here</p>
                    <p className="text-sm">Working quietly together</p>
                  </div>
                </div>
                
                <div className="flex flex-col h-64">
                  <h3 className="font-medium mb-2">Session Goals</h3>
                  <div className="bg-muted p-3 rounded mb-2">
                    <p className="text-sm">{currentSession.description || "No description provided."}</p> 
                  </div>
                  
                  <h3 className="font-medium mb-2 mt-4">Participants ({currentSession.current_participants || 0})</h3>
                  <div className="bg-muted p-3 rounded flex-grow overflow-y-auto">
                    {/* Placeholder/Simplified Participant List */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                         <AvatarFallback>H</AvatarFallback> 
                      </Avatar>
                      <div className="text-sm">Host (ID: {currentSession.host_user_id.substring(0,6)}...)</div>
                    </div>
                    
                    {user && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.user_metadata?.avatar_url} alt="You" />
                          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'Y'}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">You</div>
                      </div>
                    )}
                    
                    {Array.from({ length: Math.max(0, (currentSession.current_participants || 0) - (user ? 1: 0) - 1) }).map((_, index) => (
                       <div className="flex items-center gap-2 mb-1" key={`participant-${index}`}>
                         <Avatar className="h-6 w-6">
                           <AvatarFallback>{index + 1}</AvatarFallback>
                         </Avatar>
                         <div className="text-sm">Participant {index + 1}</div>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Session Browser */}
        <div className="flex items-center justify-between mb-4">
          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="active" className="relative">
                  Active Sessions
                  {filteredActiveSessions.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {filteredActiveSessions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="scheduled">
                  Scheduled
                  {filteredScheduledSessions.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {filteredScheduledSessions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Input
                    placeholder="Search sessions..."
                    className="sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Category Select commented out */}
                {/* <Select value={filterCategory} onValueChange={setFilterCategory}> ... </Select> */}
              </div>
            </div>
            
            <TabsContent value="active" className="m-0">
              {filteredActiveSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredActiveSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onJoin={handleJoinSession}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No active sessions found</h3>
                  <p className="mt-2 text-muted-foreground">
                    {searchQuery ? 
                      'No sessions match your search.' : 
                      'There are no active sessions right now.'}
                  </p>
                  <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>Host a New Session</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="scheduled" className="m-0">
              {filteredScheduledSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredScheduledSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onJoin={handleJoinSession}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No scheduled sessions</h3>
                  <p className="mt-2 text-muted-foreground">
                     {searchQuery ? 
                      'No sessions match your search.' : 
                      'There are no upcoming sessions scheduled.'}
                  </p>
                  <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>Schedule a Session</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="templates" className="m-0">
              <BodyDoublingTemplates />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create Body Doubling Session</DialogTitle>
            <DialogDescription>
              Set up a new body doubling session to stay focused with others.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="session-name">Session Name</Label>
              <Input 
                id="session-name" 
                placeholder="E.g., Deep Work Session, Study Group"
                value={newSession.name || ''} // Ensure controlled component
                onChange={(e) => setNewSession({...newSession, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="session-description">Description (Optional)</Label>
              <Textarea 
                id="session-description" 
                placeholder="What will you be working on in this session?"
                value={newSession.description || ''} // Ensure controlled component
                onChange={(e) => setNewSession({...newSession, description: e.target.value})}
              />
            </div>
            
            {/* Category Selection Removed */}

            <div className="grid grid-cols-2 gap-4">
              
             <div className="grid gap-2">
                <Label htmlFor="session-duration">Duration (minutes)</Label>
                <Select
                  value={String(newSession.estimated_duration_minutes || 60)} 
                  onValueChange={(value) => setNewSession({...newSession, estimated_duration_minutes: parseInt(value)})}
                >
                  <SelectTrigger id="session-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Max Participants Input */}
               <div className="grid gap-2">
                 <Label htmlFor="max-participants">Max Participants</Label>
                 <Input 
                   id="max-participants"
                   type="number"
                   min="1"
                   value={newSession.max_participants || ''} // Ensure controlled
                   onChange={(e) => setNewSession({...newSession, max_participants: parseInt(e.target.value) || 1})}
                 />
               </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Session Settings</Label>
              <div className="grid grid-cols-1 gap-2">
               {/* Scheduled Start Time Removed */}

                <div className="flex items-center justify-between">
                  <Label htmlFor="public-session" className="cursor-pointer flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Public Session (Visible to others)
                  </Label>
                  <Switch
                    id="public-session"
                    checked={newSession.is_public ?? true} // Default to true if undefined
                    onCheckedChange={(checked) => setNewSession({...newSession, is_public: checked})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handleCreateSession} disabled={!newSession.name}>Create Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BodyDoubling;