import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { 
  Brain, 
  Target, 
  Puzzle, 
  Users, 
  Zap, 
  Clock, 
  BookOpen, 
  Moon, 
  Flower2, 
  LayoutGrid, 
  BarChart4, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  BrainCircuit 
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { MemoryCards } from "@/components/games/MemoryCards";
import { PatternMatch } from "@/components/games/PatternMatch";
import { WordScramble } from "@/components/games/WordScramble";
import { ColorMatch } from "@/components/games/ColorMatch";
import { MathSpeed } from "@/components/games/MathSpeed";
import { SimonSays } from "@/components/games/SimonSays";
import { SpeedTyping } from "@/components/games/SpeedTyping";
import { VisualMemory } from "@/components/games/VisualMemory";
import { PatternRecognition } from "@/components/games/PatternRecognition";
import { SequenceMemory } from "@/components/games/SequenceMemory";
import { WordAssociation } from "@/components/games/WordAssociation";
import { BrainMatch3 } from "@/components/games/BrainMatch3";
import { ReactionTimeTest } from "@/components/games/ReactionTimeTest";
import { ZenDrift } from "@/components/games/ZenDrift";
import { BreathingTechniques } from "@/components/breathing/BreathingTechniques";

import { FocusTimerTools } from "@/components/focus/FocusTimerTools";
import { FocusZoneCard } from "@/components/focus/zones/FocusZoneCard";
import { FocusRoutineCard } from "@/components/focus/routines/FocusRoutineCard";
import { TimeBlockingCard } from "@/components/focus/tools/TimeBlockingCard";
import { FocusAnalyticsDashboard } from "@/components/focus/analytics/FocusAnalyticsDashboard";
import { FocusEnvironment } from "@/components/focus/FocusEnvironment";
import { ADHDTaskBreakdown } from "@/components/focus/tasks/ADHDTaskBreakdown";
import { FocusInterruptionTracker } from "@/components/focus/FocusInterruptionTracker";
import { SmartBreakSuggestions } from "@/components/focus/SmartBreakSuggestions";
import { FocusHabitTracker } from "@/components/focus/habits/FocusHabitTracker";
import { FocusJournal } from "@/components/focus/journal/FocusJournal";
import { MedicationReminders } from "@/components/focus/medication/MedicationReminders";
import { NoiseSensitivitySettings } from "@/components/focus/noise/NoiseSensitivitySettings";
import { VisualOrganizationTools } from "@/components/focus/visual/VisualOrganizationTools";
import { FocusPriorityQueue } from "@/components/focus/priority/FocusPriorityQueue";
import { BodyDoublingTemplates } from "@/components/focus/body-doubling/BodyDoublingTemplates";
import { FocusGamificationCard } from "@/components/focus/gamification/FocusGamificationCard";
import { TaskTransitionTimer } from "@/components/focus/task-transitions/TaskTransitionTimer";
import { TaskSwitchingStrategies } from "@/components/focus/task-transitions/TaskSwitchingStrategies";

interface BodyDoublingSession {
  id: string;
  title: string;
  host_id: string;
  start_time: string;
  status: string;
  participant_count?: number;
}

const Focus = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [activeSessions, setActiveSessions] = useState<BodyDoublingSession[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Neural network visualization in the header
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Neural network-like visualization
    const nodes: { x: number; y: number; size: number; connections: number[] }[] = [];
    const numNodes = 30;
    
    // Initialize nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        connections: []
      });
    }
    
    // Create connections between nearby nodes
    nodes.forEach((node, i) => {
      for (let j = 0; j < numNodes; j++) {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(nodes[j].x - node.x, 2) + Math.pow(nodes[j].y - node.y, 2)
          );
          if (distance < 150) {
            node.connections.push(j);
          }
        }
      }
    });
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections first (behind nodes)
      ctx.lineWidth = 0.3;
      nodes.forEach((node, i) => {
        node.connections.forEach(j => {
          const targetNode = nodes[j];
          
          const gradient = ctx.createLinearGradient(node.x, node.y, targetNode.x, targetNode.y);
          gradient.addColorStop(0, 'rgba(124, 58, 237, 0.1)');  // primary color with transparency
          gradient.addColorStop(1, 'rgba(79, 70, 229, 0.1)');   // secondary color with transparency
          
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
        });
      });
      
      // Draw nodes
      nodes.forEach(node => {
        // Glow effect
        const glow = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.size * 5
        );
        glow.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
        glow.addColorStop(1, 'rgba(124, 58, 237, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Node center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadActiveSessions();
      subscribeToBodyDoublingSessions();
      checkAndCelebrateStreaks();
    }
  }, [session?.user]);

  const loadActiveSessions = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/body_doubling_sessions?status=eq.active&order=start_time.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      const data = await response.json();
      setActiveSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error loading sessions",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const subscribeToBodyDoublingSessions = () => {
    // Note: Real-time subscriptions require WebSocket connection
    // For now, we'll poll every 30 seconds as a fallback
    const interval = setInterval(loadActiveSessions, 30000);
    return () => clearInterval(interval);
  };

  const checkAndCelebrateStreaks = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/focus_achievements?user_id=eq.${session.user.id}&order=achieved_at.desc&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      const achievements = await response.json();

      if (achievements && achievements.length > 0) {
        const latestAchievement = achievements[0];
        if (latestAchievement.streak_count >= 5) {
          setCelebrationMessage(`🎉 Amazing! You've maintained a ${latestAchievement.streak_count} day focus streak!`);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const saveFocusScore = async (score: number, exercise: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/energy_focus_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session.user.id,
          activity_type: 'focus_exercise',
          activity_name: exercise,
          focus_rating: score,
          duration_minutes: 5,
          notes: `Completed ${exercise} exercise`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Score saved!",
        description: `Your score of ${score} has been recorded.`
      });
    } catch (error) {
      console.error('Error saving focus score:', error);
      toast({
        title: "Error saving score",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const joinBodyDoublingSession = async (sessionId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/body_doubling_participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: session.user.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Joined session",
        description: "You've successfully joined the body doubling session"
      });
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: "Error joining session",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-7xl mx-auto space-y-8 p-4 pb-20">
      {/* Enhanced Header Section with Neural Visualization */}
      <div className="relative overflow-hidden rounded-xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 z-0"></div>
        <canvas ref={canvasRef} className="absolute inset-0 z-10 opacity-60" />
        
        <div className="relative z-20 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-full flex items-center justify-center">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 transition-colors duration-200">
                  Neuroscience-based focus platform
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                Advanced Focus Dashboard
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Harness your cognitive potential with our scientifically designed focus tools, flow state analytics, 
                and neurofeedback systems to achieve unprecedented productivity and mental clarity.
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setActiveTab("dashboard")} variant={activeTab === "dashboard" ? "default" : "outline"} className="gap-2">
                <LayoutGrid className="h-4 w-4" /> Dashboard
              </Button>
              <Button onClick={() => setActiveTab("analytics")} variant={activeTab === "analytics" ? "default" : "outline"} className="gap-2">
                <BarChart4 className="h-4 w-4" /> Analytics
              </Button>
              <Button onClick={() => setActiveTab("tools")} variant={activeTab === "tools" ? "default" : "outline"} className="gap-2">
                <Target className="h-4 w-4" /> Focus Tools
              </Button>
              <Button onClick={() => setActiveTab("social")} variant={activeTab === "social" ? "default" : "outline"} className="gap-2">
                <Users className="h-4 w-4" /> Body Doubling
              </Button>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-background/70 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Daily Focus Time</p>
                  <p className="text-2xl font-bold">3h 45m</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/70 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Focus Score</p>
                  <p className="text-2xl font-bold">78<span className="text-sm text-muted-foreground">/100</span></p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/70 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tasks Completed</p>
                  <p className="text-2xl font-bold">12 <span className="text-sm text-muted-foreground">today</span></p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/70 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Flow Sessions</p>
                  <p className="text-2xl font-bold">3 <span className="text-sm text-muted-foreground">this week</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full"
        >
          <Card className="p-4 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border-2 border-yellow-500/50">
            <div className="flex items-center justify-center text-center">
              <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-lg font-semibold">{celebrationMessage}</p>
            </div>
          </Card>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FocusTimerTools />
              <ADHDTaskBreakdown />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FocusPriorityQueue />
              <FocusGamificationCard />
            </div>
          </motion.div>
        )}
        
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FocusAnalyticsDashboard />
            <div className="mt-6">
              <FocusInterruptionTracker />
            </div>
          </motion.div>
        )}
        
        {activeTab === "tools" && (
          <motion.div
            key="tools"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FocusJournal />
              <SmartBreakSuggestions />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MedicationReminders />
              <NoiseSensitivitySettings />
              <VisualOrganizationTools />
            </div>
          </motion.div>
        )}
        
        {activeTab === "social" && (
          <motion.div
            key="social"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <BodyDoublingTemplates />
            
            {/* Body Doubling Section */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Active Body Doubling Sessions</h2>
              </div>
              
              {activeSessions.length > 0 ? (
                <div className="grid gap-4">
                  {activeSessions.map((session) => (
                    <motion.div 
                      key={session.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div>
                        <h3 className="font-medium">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Started {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {session.participant_count && ` • ${session.participant_count} participants`}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => joinBodyDoublingSession(session.id)}>
                        <Users className="h-4 w-4" /> Join Session
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">No active sessions at the moment</p>
                  <Button className="mt-4" variant="outline">Create a Session</Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fixed Navigation at bottom for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t p-2 lg:hidden">
        <div className="flex justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="flex-col gap-1" onClick={() => setActiveTab("dashboard")}>
            <LayoutGrid className={`h-5 w-5 ${activeTab === "dashboard" ? "text-primary" : ""}`} />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col gap-1" onClick={() => setActiveTab("analytics")}>
            <BarChart4 className={`h-5 w-5 ${activeTab === "analytics" ? "text-primary" : ""}`} />
            <span className="text-xs">Analytics</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col gap-1" onClick={() => setActiveTab("tools")}>
            <Target className={`h-5 w-5 ${activeTab === "tools" ? "text-primary" : ""}`} />
            <span className="text-xs">Tools</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col gap-1" onClick={() => setActiveTab("social")}>
            <Users className={`h-5 w-5 ${activeTab === "social" ? "text-primary" : ""}`} />
            <span className="text-xs">Social</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Focus;
