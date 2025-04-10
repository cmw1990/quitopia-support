import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, Play, Pause, VolumeX, Clock, History, LogIn } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Import our service
import { FocusService, NoiseSession8 } from "@/services/FocusService";

// Define the available sound types
const SOUND_TYPES = [
  { id: "white", name: "White Noise", description: "Consistent noise across all frequencies" },
  { id: "pink", name: "Pink Noise", description: "Softer high frequencies, like rainfall" },
  { id: "brown", name: "Brown Noise", description: "Deep rumbling, like thunder or waterfall" },
  { id: "nature", name: "Nature Sounds", description: "Soothing nature ambiance" },
];

export const WhiteNoiseComponent = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentSound, setCurrentSound] = useState("white");
  const [isMuted, setIsMuted] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<NoiseSession8[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const focusService = FocusService.getInstance();

  // Redirect if not authenticated
  useEffect(() => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [session, navigate, toast]);

  // If not authenticated, don't render the component
  if (!session?.user) {
    return null;
  }

  // Initialize tables when component mounts
  useEffect(() => {
    const initTables = async () => {
      try {
        await focusService.initializeTables();
      } catch (error) {
        console.error("Error initializing tables:", error);
        toast({
          title: "Error",
          description: "Failed to initialize database tables",
          variant: "destructive",
        });
      }
    };

    initTables();
  }, [toast]);

  // Load session history
  useEffect(() => {
    const loadSessionHistory = async () => {
      if (!session?.user?.id) return;
      
      setIsLoading(true);
      try {
        const history = await focusService.getNoiseSessionHistory(session.user.id);
        setSessionHistory(history);
      } catch (error) {
        console.error("Error loading session history:", error);
        toast({
          title: "Error",
          description: "Failed to load session history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionHistory();
  }, [session, toast]);

  const togglePlay = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (isPlaying) {
      // Stop playing and record session end
      if (currentSessionId && startTimeRef.current) {
        const endTime = new Date();
        const durationSeconds = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
        
        try {
          await focusService.updateNoiseSession(
            currentSessionId,
            endTime.toISOString(),
            durationSeconds
          );
          
          // Refresh session history
          const history = await focusService.getNoiseSessionHistory(session.user.id);
          setSessionHistory(history);
          
          toast({
            title: "Session Recorded",
            description: `${formatDuration(durationSeconds)} of ${SOUND_TYPES.find(s => s.id === currentSound)?.name || currentSound} recorded`,
          });
        } catch (error) {
          console.error("Error ending noise session:", error);
          toast({
            title: "Error",
            description: "Failed to record session",
            variant: "destructive",
          });
        }
      }
      
      setCurrentSessionId(null);
      startTimeRef.current = null;
    } else {
      // Start playing and record session start
      startTimeRef.current = new Date();
      
      try {
        const newSessionId = await focusService.startNoiseSession(
          session.user.id,
          currentSound,
          volume,
          startTimeRef.current.toISOString()
        );
        
        setCurrentSessionId(newSessionId);
        
        toast({
          title: "Session Started",
          description: `${SOUND_TYPES.find(s => s.id === currentSound)?.name || currentSound} session started`,
        });
      } catch (error) {
        console.error("Error starting noise session:", error);
        toast({
          title: "Error",
          description: "Failed to start session",
          variant: "destructive",
        });
        startTimeRef.current = null;
        return;
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0]);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">White Noise Machine</h1>
      <p className="text-muted-foreground mb-8">
        Use ambient noise to mask distractions and enhance your focus and productivity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Sound Player
              </CardTitle>
              <CardDescription>
                Choose your preferred noise type and adjust the volume.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="white" value={currentSound} onValueChange={setCurrentSound}>
                <TabsList className="grid grid-cols-4">
                  {SOUND_TYPES.map((sound) => (
                    <TabsTrigger key={sound.id} value={sound.id}>
                      {sound.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {SOUND_TYPES.map((sound) => (
                  <TabsContent key={sound.id} value={sound.id} className="space-y-4">
                    <div className="p-4 bg-muted rounded-md">
                      <p>{sound.description}</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex flex-col gap-4">
                <Label htmlFor="volume-slider">Volume</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className={isMuted ? "text-muted-foreground" : ""}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Slider
                    id="volume-slider"
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      setVolume(value[0]);
                      if (value[0] === 0) {
                        setIsMuted(true);
                      } else if (isMuted) {
                        setIsMuted(false);
                      }
                    }}
                    className="flex-1"
                  />
                  <span className="w-8 text-sm">{isMuted ? 0 : volume}%</span>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className="w-32"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {sessionHistory.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionHistory.map((session, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {SOUND_TYPES.find(s => s.id === session.sound_type)?.name || session.sound_type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.start_time)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(session.duration_seconds)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>How white noise helps you focus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Masks Distractions</h3>
                <p className="text-sm text-muted-foreground">
                  White noise masks sudden sounds that might break your concentration.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Improves Focus</h3>
                <p className="text-sm text-muted-foreground">
                  Creates a consistent sound environment that helps maintain attention.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Reduces Stress</h3>
                <p className="text-sm text-muted-foreground">
                  Calming background noise helps reduce stress and anxiety levels.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Enhances Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Creates sound privacy in open offices or shared spaces.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 