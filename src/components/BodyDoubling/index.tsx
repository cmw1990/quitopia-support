import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Users, 
  Clock, 
  Video, 
  ClipboardList, 
  Focus, 
  BarChart, 
  Calendar,
  MessageSquare,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Check,
  User,
  CalendarClock
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface BodyDoublingProps {
  onSessionComplete?: (sessionData: SessionData) => void;
}

interface SessionData {
  id?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  task: string;
  completed: boolean;
  notes?: string;
}

interface ActiveUser {
  id: string;
  name: string;
  avatarUrl?: string;
  task: string;
  startTime: Date;
  duration: number; // in minutes
  isLive: boolean;
}

export const BodyDoubling: React.FC<BodyDoublingProps> = ({ onSessionComplete }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("session");
  
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTask, setSessionTask] = useState("");
  const [sessionDuration, setSessionDuration] = useState(25); // Default 25 minutes
  const [sessionNotes, setSessionNotes] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [completedSessions, setCompletedSessions] = useState<SessionData[]>([]);
  const [useVideo, setUseVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  // Community state
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [isWaitingForPartner, setIsWaitingForPartner] = useState(false);
  
  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Session durations
  const sessionOptions = [
    { value: 15, label: "15 minutes" },
    { value: 25, label: "25 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
  ];
  
  // Mock active users data
  useEffect(() => {
    const mockUsers: ActiveUser[] = [
      {
        id: "user1",
        name: "Alex Chen",
        avatarUrl: "https://ui.shadcn.com/avatars/01.png",
        task: "Writing code for client project",
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        duration: 60,
        isLive: true
      },
      {
        id: "user2",
        name: "Taylor Kim",
        avatarUrl: "https://ui.shadcn.com/avatars/02.png",
        task: "Reading research papers",
        startTime: new Date(Date.now() - 45 * 60 * 1000),
        duration: 120,
        isLive: true
      },
      {
        id: "user3",
        name: "Jamie Rodriguez",
        avatarUrl: "https://ui.shadcn.com/avatars/03.png",
        task: "Working on dissertation",
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        duration: 90,
        isLive: false
      },
      {
        id: "user4",
        name: "Morgan Taylor",
        avatarUrl: "https://ui.shadcn.com/avatars/04.png",
        task: "Preparing presentation",
        startTime: new Date(Date.now() - 10 * 60 * 1000),
        duration: 45,
        isLive: true
      }
    ];
    
    setActiveUsers(mockUsers);
  }, []);
  
  // Start session timer
  const startSession = () => {
    if (!sessionTask) {
      toast.error("Please enter a task for your session");
      return;
    }
    
    const startTime = new Date();
    setSessionStartTime(startTime);
    setIsSessionActive(true);
    setElapsedTime(0);
    
    // Create timer to update elapsed time
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Add self to active users
    const selfSession: ActiveUser = {
      id: user?.id || "self",
      name: user?.email ? user?.email.split('@')[0] : "You",
      avatarUrl: `https://ui.avatars.io/api/?name=${user?.email?.substring(0, 2) || 'U'}`,
      task: sessionTask,
      startTime,
      duration: sessionDuration,
      isLive: useVideo
    };
    
    setActiveUsers(prev => [selfSession, ...prev]);
    
    toast.success("Body doubling session started!");
  };
  
  // Pause session
  const pauseSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsSessionActive(false);
    toast.info("Session paused. Resume when ready.");
  };
  
  // Resume session
  const resumeSession = () => {
    setIsSessionActive(true);
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    toast.success("Session resumed!");
  };
  
  // End session
  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const endTime = new Date();
    const sessionData: SessionData = {
      startTime: sessionStartTime!,
      endTime,
      duration: Math.floor(elapsedTime / 60),
      task: sessionTask,
      completed: true,
      notes: sessionNotes
    };
    
    setCompletedSessions(prev => [sessionData, ...prev]);
    
    if (onSessionComplete) {
      onSessionComplete(sessionData);
    }
    
    // Reset session state
    setIsSessionActive(false);
    setElapsedTime(0);
    setSessionStartTime(null);
    setSessionTask("");
    setSessionNotes("");
    
    // Remove self from active users
    setActiveUsers(prev => prev.filter(user => user.id !== "self" && user.id !== (user?.id || "")));
    
    toast.success("Session completed! Great job staying focused.");
  };
  
  // Format time display (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate session progress percentage
  const getSessionProgress = (): number => {
    const totalSeconds = sessionDuration * 60;
    return Math.min(100, (elapsedTime / totalSeconds) * 100);
  };
  
  // Request to pair with another user
  const requestPartner = (userId: string) => {
    setSelectedPartner(userId);
    setIsWaitingForPartner(true);
    
    // Simulate partner accepting after 3 seconds
    setTimeout(() => {
      setIsWaitingForPartner(false);
      const partner = activeUsers.find(user => user.id === userId);
      if (partner) {
        toast.success(`${partner.name} accepted your request! You can now body double together.`);
      }
    }, 3000);
  };
  
  // Calculate time remaining for a user's session
  const calculateTimeRemaining = (user: ActiveUser): string => {
    const startTimeMs = user.startTime.getTime();
    const durationMs = user.duration * 60 * 1000;
    const endTimeMs = startTimeMs + durationMs;
    const remainingMs = endTimeMs - Date.now();
    
    if (remainingMs <= 0) return "Completed";
    
    const remainingMins = Math.floor(remainingMs / (60 * 1000));
    return `${remainingMins} min left`;
  };
  
  // Format date for session history
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="session">My Session</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        {/* My Session Tab */}
        <TabsContent value="session">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Body Doubling Session</CardTitle>
                <CardDescription>
                  Work alongside others virtually to enhance focus and accountability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isSessionActive && !sessionStartTime ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="task">What are you working on?</Label>
                      <Input 
                        id="task" 
                        placeholder="Enter your task or goal for this session"
                        value={sessionTask}
                        onChange={(e) => setSessionTask(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Session duration</Label>
                      <Select 
                        value={sessionDuration.toString()} 
                        onValueChange={(value) => setSessionDuration(parseInt(value))}
                      >
                        <SelectTrigger id="duration" className="w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {sessionOptions.map(option => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="video" 
                        checked={useVideo} 
                        onCheckedChange={setUseVideo}
                      />
                      <Label htmlFor="video">Enable video (webcam stays local)</Label>
                    </div>
                    
                    <Button onClick={startSession} className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Start Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Current Task</h3>
                        <Badge variant="outline">
                          {isSessionActive ? "In Progress" : "Paused"}
                        </Badge>
                      </div>
                      <p className="text-sm mb-4">{sessionTask}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {formatTime(elapsedTime)} / {sessionDuration}:00
                          </span>
                        </div>
                        <Progress value={getSessionProgress()} className="h-2" />
                      </div>
                    </div>
                    
                    {useVideo && (
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted ? "Unmute" : "Mute"}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Session notes (optional)</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Add any thoughts or progress notes here"
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      {isSessionActive ? (
                        <Button onClick={pauseSession} variant="outline" className="flex-1">
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button onClick={resumeSession} variant="outline" className="flex-1">
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      
                      <Button onClick={endSession} className="flex-1">
                        <Check className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {activeUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Others Working Now</CardTitle>
                  <CardDescription>
                    These people are also focusing on their tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeUsers.slice(0, 3).map(user => (
                      <div key={user.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            {user.isLive && (
                              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                                Live
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{user.task}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{calculateTimeRemaining(user)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" onClick={() => setActiveTab("community")} className="w-full">
                    View All Community Members
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Community Tab */}
        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Body Doubling Community</CardTitle>
              <CardDescription>
                Find accountability partners who are working right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 mb-6 bg-muted/30">
                <h3 className="font-medium mb-2">What is Body Doubling?</h3>
                <p className="text-sm text-muted-foreground">
                  Body doubling is working alongside another person to enhance focus and productivity. 
                  The presence of others (even virtually) can help maintain accountability and reduce procrastination.
                  It's particularly helpful for people with ADHD or focus challenges.
                </p>
              </div>
              
              <div className="space-y-4">
                {activeUsers.map(user => (
                  <div key={user.id} className="flex items-start gap-3 p-4 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {user.isLive && (
                          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                            Live
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">{user.task}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{calculateTimeRemaining(user)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarClock className="h-3 w-3" />
                          <span>Started {formatDate(user.startTime)}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      disabled={selectedPartner === user.id || user.id === "self" || user.id === (user?.id || "")}
                      onClick={() => requestPartner(user.id)}
                    >
                      {selectedPartner === user.id ? (
                        isWaitingForPartner ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )
                      ) : (
                        "Join"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                <Users className="h-4 w-4 inline mr-1" />
                {activeUsers.length} people working now
              </div>
              {!isSessionActive && (
                <Button onClick={() => setActiveTab("session")}>
                  Start Your Session
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                Track your body doubling progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedSessions.length > 0 ? (
                <div className="space-y-4">
                  {completedSessions.map((session, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{session.task}</h3>
                        <Badge variant="outline">
                          {session.duration} min
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(session.startTime)}</span>
                        </div>
                        {session.completed && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                      {session.notes && (
                        <div className="mt-2 text-sm border-t pt-2">
                          <p className="text-muted-foreground">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium text-lg mb-1">No sessions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first body doubling session to track your progress
                  </p>
                  <Button onClick={() => setActiveTab("session")}>
                    Start a Session
                  </Button>
                </div>
              )}
            </CardContent>
            {completedSessions.length > 0 && (
              <CardFooter>
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Total Focus Time</h3>
                    <span className="font-bold text-lg">
                      {completedSessions.reduce((total, session) => total + session.duration, 0)} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Sessions Completed</h3>
                    <span className="font-bold text-lg">
                      {completedSessions.length}
                    </span>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BodyDoubling; 