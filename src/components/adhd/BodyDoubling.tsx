import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { 
  Users, 
  Video, 
  MessageSquare, 
  Mic, 
  MicOff, 
  VideoOff, 
  Clock, 
  UserPlus,
  Share2,
  Volume2,
  VolumeX,
  Timer,
  BookOpen,
  CheckSquare,
  Calendar,
  Plus,
  ChevronRight,
  Info,
  Award,
  Clock8,
  User
} from 'lucide-react';
import { format, addDays, parseISO, isBefore, isAfter } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data for virtual participants
const VIRTUAL_PARTICIPANTS = [
  { 
    id: '1', 
    name: 'Alex Morgan', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    activity: 'Writing',
    focusScore: 92,
    duration: '1:42:15'
  },
  { 
    id: '2', 
    name: 'Jordan Lee', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    activity: 'Studying',
    focusScore: 85,
    duration: '0:58:32'
  },
  { 
    id: '3', 
    name: 'Sam Rivera', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    activity: 'Coding',
    focusScore: 88,
    duration: '2:12:07'
  },
  { 
    id: '4', 
    name: 'Taylor Kim', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    activity: 'Reading',
    focusScore: 79,
    duration: '0:45:18'
  }
];

// Virtual session room types
const SESSION_TYPES = [
  {
    id: 'silent',
    name: 'Silent Co-working',
    description: 'Work quietly with others - no talking, cameras optional',
    participants: 16,
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Group',
    description: '25-minute focus sessions with 5-minute breaks',
    participants: 8,
    icon: <Timer className="h-4 w-4" />
  },
  {
    id: 'checkpoint',
    name: 'Accountability Checkpoints',
    description: 'Set goals and check in regularly with others',
    participants: 12,
    icon: <CheckSquare className="h-4 w-4" />
  }
];

// New scheduled session data
interface ScheduledSession {
  id: string;
  name: string;
  description: string;
  startTime: string; // ISO string
  duration: number; // minutes
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  sessionType: string;
  maxParticipants: number;
  currentParticipants: number;
  tags: string[];
  recurring?: boolean;
  joinUrl?: string;
}

// Mock scheduled sessions
const SCHEDULED_SESSIONS: ScheduledSession[] = [
  {
    id: '1',
    name: 'Morning Productivity Sprint',
    description: 'Start your day with a focused 90-minute work session',
    startTime: addDays(new Date(), 1).toISOString(),
    duration: 90,
    host: {
      id: '101',
      name: 'Maya Johnson',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
    },
    sessionType: 'pomodoro',
    maxParticipants: 12,
    currentParticipants: 5,
    tags: ['morning', 'productivity', 'pomodoro'],
    recurring: true
  },
  {
    id: '2',
    name: 'Deep Work: Coding Session',
    description: 'Focused programming time for developers of all levels',
    startTime: addDays(new Date(), 2).toISOString(),
    duration: 120,
    host: {
      id: '102',
      name: 'Lucas Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
    sessionType: 'silent',
    maxParticipants: 8,
    currentParticipants: 3,
    tags: ['coding', 'programming', 'deep work']
  },
  {
    id: '3',
    name: 'Thesis Writing Group',
    description: 'Academic writing session with check-ins every 30 minutes',
    startTime: addDays(new Date(), 1).toISOString(),
    duration: 180,
    host: {
      id: '103',
      name: 'Dr. Emily Parker',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    },
    sessionType: 'checkpoint',
    maxParticipants: 6,
    currentParticipants: 4,
    tags: ['academic', 'writing', 'thesis']
  }
];

interface SessionParticipant {
  id: string;
  name: string;
  avatar?: string;
  activity?: string;
  focusScore?: number;
  duration?: string;
  isVirtual?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

const BodyDoubling: React.FC = () => {
  const session = useSession();
  const [activeTab, setActiveTab] = useState<string>('join');
  const [activeSessionType, setActiveSessionType] = useState<string>('silent');
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [userSettings, setUserSettings] = useState({
    activity: '',
    goalDescription: '',
    cameraEnabled: false,
    micEnabled: false,
    notificationsEnabled: true,
    autoJoinEnabled: false
  });
  const [sessionCode, setSessionCode] = useState<string>('');
  const [inputSessionCode, setInputSessionCode] = useState<string>('');
  
  // New scheduled sessions state
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>(SCHEDULED_SESSIONS);
  const [newSessionDialog, setNewSessionDialog] = useState<boolean>(false);
  const [newSession, setNewSession] = useState<Partial<ScheduledSession>>({
    name: '',
    description: '',
    startTime: new Date().toISOString(),
    duration: 60,
    sessionType: 'silent',
    maxParticipants: 10,
    tags: [],
    recurring: false
  });
  const [newSessionTag, setNewSessionTag] = useState<string>('');
  const [registeredSessions, setRegisteredSessions] = useState<string[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize with mock data when component mounts
  useEffect(() => {
    // Add virtual participants
    const virtualParticipants = VIRTUAL_PARTICIPANTS.map(p => ({
      ...p,
      isVirtual: true,
      isMuted: Math.random() > 0.3,
      isCameraOff: Math.random() > 0.4
    }));
    
    setParticipants(virtualParticipants);
    
    // Generate random session code
    setSessionCode(generateSessionCode());
    
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startSession = () => {
    setSessionActive(true);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    
    // Add user to participants
    const userParticipant: SessionParticipant = {
      id: session?.user?.id || 'user',
      name: session?.user?.email?.split('@')[0] || 'You',
      activity: userSettings.activity,
      focusScore: 100,
      duration: '0:00:00',
      isMuted: !userSettings.micEnabled,
      isCameraOff: !userSettings.cameraEnabled
    };
    
    setParticipants(prev => [userParticipant, ...prev]);
    
    toast.success('Body doubling session started!');
  };
  
  const endSession = () => {
    setSessionActive(false);
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Remove user from participants
    setParticipants(prev => prev.filter(p => p.id !== (session?.user?.id || 'user')));
    
    toast.info('Body doubling session ended');
  };
  
  const joinSessionWithCode = () => {
    if (inputSessionCode.trim() === '') {
      toast.error('Please enter a session code');
      return;
    }
    
    // In a real application, this would validate the code against the server
    setSessionCode(inputSessionCode);
    setActiveTab('virtual');
    toast.success('Joined session with code: ' + inputSessionCode);
    
    // Start session automatically
    startSession();
  };
  
  const toggleMicrophone = () => {
    setUserSettings(prev => ({
      ...prev,
      micEnabled: !prev.micEnabled
    }));
    
    // Update user in participants list
    setParticipants(prev => 
      prev.map(p => 
        p.id === (session?.user?.id || 'user')
          ? { ...p, isMuted: !userSettings.micEnabled }
          : p
      )
    );
    
    toast.info(userSettings.micEnabled ? 'Microphone muted' : 'Microphone unmuted');
  };
  
  const toggleCamera = () => {
    setUserSettings(prev => ({
      ...prev,
      cameraEnabled: !prev.cameraEnabled
    }));
    
    // Update user in participants list
    setParticipants(prev => 
      prev.map(p => 
        p.id === (session?.user?.id || 'user')
          ? { ...p, isCameraOff: !userSettings.cameraEnabled }
          : p
      )
    );
    
    toast.info(userSettings.cameraEnabled ? 'Camera turned off' : 'Camera turned on');
  };
  
  const toggleNotifications = () => {
    setUserSettings(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled
    }));
  };
  
  const toggleAutoJoin = () => {
    setUserSettings(prev => ({
      ...prev,
      autoJoinEnabled: !prev.autoJoinEnabled
    }));
  };
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const generateSessionCode = (): string => {
    // Generate random 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  
  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode)
      .then(() => {
        toast.success('Session code copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy session code');
      });
  };
  
  // New function for creating a scheduled session
  const createScheduledSession = () => {
    if (!newSession.name || !newSession.startTime || !newSession.duration) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    const createdSession: ScheduledSession = {
      id: Date.now().toString(),
      name: newSession.name || '',
      description: newSession.description || '',
      startTime: newSession.startTime,
      duration: newSession.duration || 60,
      host: {
        id: session?.user?.id || 'user',
        name: session?.user?.email?.split('@')[0] || 'You',
      },
      sessionType: newSession.sessionType || 'silent',
      maxParticipants: newSession.maxParticipants || 10,
      currentParticipants: 1, // Host is first participant
      tags: newSession.tags || [],
      recurring: newSession.recurring
    };
    
    setScheduledSessions([...scheduledSessions, createdSession]);
    setNewSessionDialog(false);
    setNewSession({
      name: '',
      description: '',
      startTime: new Date().toISOString(),
      duration: 60,
      sessionType: 'silent',
      maxParticipants: 10,
      tags: [],
      recurring: false
    });
    
    toast.success('Session scheduled successfully');
  };
  
  const addSessionTag = () => {
    if (newSessionTag.trim() !== '' && !newSession.tags?.includes(newSessionTag)) {
      setNewSession({
        ...newSession,
        tags: [...(newSession.tags || []), newSessionTag]
      });
      setNewSessionTag('');
    }
  };
  
  const removeSessionTag = (tag: string) => {
    setNewSession({
      ...newSession,
      tags: newSession.tags?.filter(t => t !== tag) || []
    });
  };
  
  const registerForSession = (sessionId: string) => {
    // Update the session's participant count
    setScheduledSessions(prev => 
      prev.map(s => 
        s.id === sessionId 
          ? { ...s, currentParticipants: s.currentParticipants + 1 } 
          : s
      )
    );
    
    // Add to user's registered sessions
    setRegisteredSessions([...registeredSessions, sessionId]);
    
    toast.success('You have been registered for this session');
  };
  
  const unregisterFromSession = (sessionId: string) => {
    // Update the session's participant count
    setScheduledSessions(prev => 
      prev.map(s => 
        s.id === sessionId 
          ? { ...s, currentParticipants: Math.max(1, s.currentParticipants - 1) } 
          : s
      )
    );
    
    // Remove from user's registered sessions
    setRegisteredSessions(registeredSessions.filter(id => id !== sessionId));
    
    toast.info('You have been unregistered from this session');
  };
  
  const isSessionUpcoming = (startTime: string): boolean => {
    const sessionTime = parseISO(startTime);
    return isAfter(sessionTime, new Date());
  };
  
  const formatSessionTime = (startTime: string): string => {
    return format(parseISO(startTime), 'MMM d, yyyy h:mm a');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Body Doubling</h1>
        <p className="text-muted-foreground">Work alongside others (virtually or in-person) to improve focus and accountability</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="join">
            <UserPlus className="h-4 w-4 mr-2" />
            Join Session
          </TabsTrigger>
          <TabsTrigger value="virtual">
            <Users className="h-4 w-4 mr-2" />
            Virtual Co-working
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Video className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Join Session Tab */}
        <TabsContent value="join" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Join a Body Doubling Session
              </CardTitle>
              <CardDescription>
                Work alongside others to boost productivity and stay accountable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="session-code">Enter Session Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="session-code"
                    placeholder="Enter 6-digit code (e.g., AB12CD)"
                    value={inputSessionCode}
                    onChange={(e) => setInputSessionCode(e.target.value.toUpperCase())}
                  />
                  <Button onClick={joinSessionWithCode}>Join</Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or browse public sessions
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {SESSION_TYPES.map((type) => (
                  <div 
                    key={type.id}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                      activeSessionType === type.id ? 'border-primary bg-primary/10' : ''
                    }`}
                    onClick={() => setActiveSessionType(type.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {type.icon}
                      </div>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {type.participants}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => {
                  setActiveTab('virtual');
                  setTimeout(() => {
                    startSession();
                  }, 500);
                }}
              >
                Join {SESSION_TYPES.find(t => t.id === activeSessionType)?.name}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Virtual Co-working Tab */}
        <TabsContent value="virtual" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    {!sessionActive ? (
                      <>
                        <Users className="h-5 w-5 mr-2" />
                        Virtual Co-working Space
                      </>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 mr-2" />
                        Session in Progress: {formatDuration(sessionDuration)}
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {sessionActive ? (
                      `${participants.length} participants in ${SESSION_TYPES.find(t => t.id === activeSessionType)?.name}`
                    ) : (
                      'Start a session or join others who are already working'
                    )}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  {sessionActive && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleMicrophone}
                      >
                        {userSettings.micEnabled ? (
                          <Mic className="h-4 w-4" />
                        ) : (
                          <MicOff className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleCamera}
                      >
                        {userSettings.cameraEnabled ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <VideoOff className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant={sessionActive ? "destructive" : "default"}
                    onClick={sessionActive ? endSession : startSession}
                  >
                    {sessionActive ? 'End Session' : 'Start Session'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sessionActive ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participants.map((participant) => (
                      <div 
                        key={participant.id}
                        className="relative rounded-lg border bg-card p-4 shadow-sm"
                      >
                        <div className="absolute top-2 right-2 flex gap-1">
                          {participant.isMuted && (
                            <Badge variant="outline" className="px-1.5 py-0">
                              <MicOff className="h-3 w-3" />
                            </Badge>
                          )}
                          {participant.isCameraOff && (
                            <Badge variant="outline" className="px-1.5 py-0">
                              <VideoOff className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center space-y-3 text-center">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {participant.name}
                              {(participant.id === (session?.user?.id || 'user')) && " (You)"}
                            </h3>
                            <p className="text-sm text-muted-foreground">{participant.activity || "Working"}</p>
                          </div>
                          
                          <div className="w-full space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Focus Score</span>
                              <span>{participant.focusScore}%</span>
                            </div>
                            <Progress 
                              value={participant.focusScore || 0} 
                              className="h-1.5"
                            />
                          </div>
                          
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {participant.duration}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium flex items-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Invite Others
                      </h3>
                      <Badge>{sessionCode}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input value={sessionCode} readOnly />
                      <Button variant="outline" onClick={copySessionCode}>Copy</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-primary/10 p-6 mb-4">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No active session</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Start a session to work alongside others. Body doubling helps many people with ADHD stay focused and motivated.
                  </p>
                  <Button onClick={startSession}>Start Session Now</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Scheduled Sessions Tab */}
        <TabsContent value="scheduled" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Scheduled Sessions
              </h2>
              <p className="text-muted-foreground">
                Register for upcoming body doubling sessions or create your own
              </p>
            </div>
            <Button onClick={() => setNewSessionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>
          
          {scheduledSessions.length > 0 ? (
            <div className="space-y-4">
              {scheduledSessions.map(scheduledSession => {
                const isRegistered = registeredSessions.includes(scheduledSession.id);
                const isUpcoming = isSessionUpcoming(scheduledSession.startTime);
                const sessionTypeInfo = SESSION_TYPES.find(t => t.id === scheduledSession.sessionType);
                
                return (
                  <Card key={scheduledSession.id} className={isRegistered ? 'border-primary/30 bg-primary/5' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              {scheduledSession.name}
                            </CardTitle>
                            {scheduledSession.recurring && (
                              <Badge variant="outline" className="text-xs font-normal">
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Hosted by {scheduledSession.host.name}
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!isUpcoming && (
                            <Badge variant="secondary">Completed</Badge>
                          )}
                          {isRegistered && isUpcoming && (
                            <Badge variant="default" className="bg-green-600">
                              Registered
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <p className="text-sm">{scheduledSession.description}</p>
                          
                          <div className="flex flex-wrap gap-1">
                            {scheduledSession.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-md p-2 flex flex-col">
                              <span className="text-xs text-muted-foreground">Time</span>
                              <span className="font-medium flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatSessionTime(scheduledSession.startTime)}
                              </span>
                            </div>
                            
                            <div className="border rounded-md p-2 flex flex-col">
                              <span className="text-xs text-muted-foreground">Duration</span>
                              <span className="font-medium flex items-center">
                                <Timer className="h-3 w-3 mr-1" />
                                {scheduledSession.duration} minutes
                              </span>
                            </div>
                            
                            <div className="border rounded-md p-2 flex flex-col">
                              <span className="text-xs text-muted-foreground">Type</span>
                              <span className="font-medium flex items-center">
                                {sessionTypeInfo?.icon || <CheckSquare className="h-3 w-3 mr-1" />}
                                {sessionTypeInfo?.name || scheduledSession.sessionType}
                              </span>
                            </div>
                            
                            <div className="border rounded-md p-2 flex flex-col">
                              <span className="text-xs text-muted-foreground">Participants</span>
                              <span className="font-medium flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {scheduledSession.currentParticipants} / {scheduledSession.maxParticipants}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-2">
                      {isUpcoming && (
                        isRegistered ? (
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => unregisterFromSession(scheduledSession.id)}>
                              Cancel Registration
                            </Button>
                            <Button variant="default" disabled={!scheduledSession.joinUrl}>
                              {scheduledSession.joinUrl ? 'Join Session' : 'Waiting to Start'}
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => registerForSession(scheduledSession.id)}
                            disabled={scheduledSession.currentParticipants >= scheduledSession.maxParticipants}
                          >
                            Register
                          </Button>
                        )
                      )}
                      
                      {!isUpcoming && (
                        <Button variant="outline" disabled>
                          Session Ended
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <Calendar className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No scheduled sessions</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  There are no upcoming scheduled sessions. Create your own or check back later.
                </p>
                <Button onClick={() => setNewSessionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule a Session
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* My registered sessions section */}
          {registeredSessions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">My Registered Sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledSessions
                  .filter(s => registeredSessions.includes(s.id))
                  .map(s => (
                    <Card key={s.id} className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{s.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatSessionTime(s.startTime)}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" disabled={!s.joinUrl}>
                            {s.joinUrl ? 'Join' : 'Waiting'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Body Doubling Settings
              </CardTitle>
              <CardDescription>
                Configure your preferences for virtual co-working sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="activity">What are you working on?</Label>
                <Input
                  id="activity"
                  placeholder="e.g., Writing, Studying, Coding"
                  value={userSettings.activity}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, activity: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal">Session goal (optional)</Label>
                <Textarea
                  id="goal"
                  placeholder="What do you hope to accomplish during this session?"
                  value={userSettings.goalDescription}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, goalDescription: e.target.value }))}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Device Settings</h3>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Label htmlFor="camera">Camera</Label>
                    <p className="text-sm text-muted-foreground">Show your video to other participants</p>
                  </div>
                  <Switch
                    id="camera"
                    checked={userSettings.cameraEnabled}
                    onCheckedChange={toggleCamera}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Label htmlFor="microphone">Microphone</Label>
                    <p className="text-sm text-muted-foreground">Enable your microphone for speaking</p>
                  </div>
                  <Switch
                    id="microphone"
                    checked={userSettings.micEnabled}
                    onCheckedChange={toggleMicrophone}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Label htmlFor="notifications">Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts when people join or leave</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={userSettings.notificationsEnabled}
                    onCheckedChange={toggleNotifications}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Label htmlFor="auto-join">Auto-join Next Time</Label>
                    <p className="text-sm text-muted-foreground">Automatically join your last session</p>
                  </div>
                  <Switch
                    id="auto-join"
                    checked={userSettings.autoJoinEnabled}
                    onCheckedChange={toggleAutoJoin}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Session Dialog */}
      <Dialog open={newSessionDialog} onOpenChange={setNewSessionDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Schedule a Body Doubling Session</DialogTitle>
            <DialogDescription>
              Create a new session for others to join. You'll be the host.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-name">Session Name *</Label>
                <Input
                  id="session-name"
                  placeholder="e.g., Morning Focus Group"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-type">Session Type *</Label>
                <select
                  id="session-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newSession.sessionType}
                  onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value })}
                >
                  {SESSION_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session-description">Description *</Label>
              <Textarea
                id="session-description"
                placeholder="Describe what the session is about and who it's for..."
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-date">Date and Time *</Label>
                <Input
                  id="session-date"
                  type="datetime-local"
                  value={newSession.startTime ? new Date(newSession.startTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    startTime: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-duration">Duration (minutes) *</Label>
                <Input
                  id="session-duration"
                  type="number"
                  min="15"
                  max="240"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    duration: parseInt(e.target.value) || 60 
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-max">Max Participants *</Label>
                <Input
                  id="session-max"
                  type="number"
                  min="2"
                  max="50"
                  value={newSession.maxParticipants}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    maxParticipants: parseInt(e.target.value) || 10 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="session-recurring">Recurring Session</Label>
                  <Switch
                    id="session-recurring"
                    checked={newSession.recurring}
                    onCheckedChange={(checked) => setNewSession({ ...newSession, recurring: checked })}
                  />
                </div>
                {newSession.recurring && (
                  <p className="text-xs text-muted-foreground">
                    This session will repeat weekly at the same time
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session-tags">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="session-tags"
                  placeholder="e.g., writing, morning, beginner"
                  value={newSessionTag}
                  onChange={(e) => setNewSessionTag(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addSessionTag}>
                  Add
                </Button>
              </div>
              
              {newSession.tags && newSession.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newSession.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSessionTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Alert className="bg-muted/30 mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Tips for a successful session</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Choose a consistent time, be specific about the session purpose, and consider limiting the group size for more accountability.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSessionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createScheduledSession}>
              Schedule Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BodyDoubling; 