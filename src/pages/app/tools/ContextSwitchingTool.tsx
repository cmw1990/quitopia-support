import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Edit,
  Play,
  Plus,
  RefreshCw,
  Star,
  Trash,
  X,
  Zap,
  BarChart,
  History
} from 'lucide-react';

import { contextSwitchingService, ContextSwitchTemplate, ContextSwitchSession } from '@/services/context-switching/contextSwitchingService';
import { useUser } from '@/hooks/useUser';
import { formatRelativeTime, formatDuration } from '@/lib/utils';

const ContextSwitchingTool = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<ContextSwitchTemplate[]>([]);
  const [sessions, setSessions] = useState<ContextSwitchSession[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState({
    templates: true,
    stats: true,
    sessions: true
  });
  const [activeSession, setActiveSession] = useState<ContextSwitchSession | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<ContextSwitchTemplate | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchTemplates();
      fetchStats();
      fetchSessions();
    }
  }, [user]);

  const fetchTemplates = async () => {
    setLoading(prev => ({ ...prev, templates: true }));
    try {
      const { data, error } = await contextSwitchingService.getTemplates();
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Failed to load templates',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  };

  const fetchStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const { data, error } = await contextSwitchingService.getSwitchingStats();
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchSessions = async () => {
    setLoading(prev => ({ ...prev, sessions: true }));
    // This method needs to be implemented in the service
    try {
      // Placeholder for now, will need to add getSessions to service
      setSessions([]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  };

  const startSession = async (template: ContextSwitchTemplate) => {
    try {
      const sessionData = {
        template_id: template.id,
        from_context: 'Current Task', // These would come from form inputs
        to_context: 'New Task',
      };
      
      const { data, error } = await contextSwitchingService.startSwitchingSession(sessionData);
      if (error) throw error;
      
      setActiveSession(data);
      setActiveTemplate(template);
      setActiveTab("active-session");
      
      toast({
        title: 'Context switching session started',
        description: `Follow the steps to switch from ${sessionData.from_context} to ${sessionData.to_context}`,
      });
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: 'Failed to start session',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const endSession = async (sessionId: string, data: { success_rating?: number; notes?: string }) => {
    try {
      const { error } = await contextSwitchingService.endSwitchingSession(sessionId, data);
      if (error) throw error;
      
      setActiveSession(null);
      setActiveTemplate(null);
      
      // Refresh data
      fetchStats();
      fetchSessions();
      
      toast({
        title: 'Session completed',
        description: 'Your context switch has been recorded',
      });
      
      setActiveTab("templates");
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: 'Failed to end session',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Context Switching Tool</h1>
        <p className="text-muted-foreground">
          Switch between tasks with less mental friction and greater efficiency.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="active-session">Active Session</TabsTrigger>
          <TabsTrigger value="history">History & Stats</TabsTrigger>
        </TabsList>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Templates</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Button>
          </div>
          
          {loading.templates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter className="p-4 pt-2 bg-muted/50">
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{template.name}</CardTitle>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline">{template.complexity}/5</Badge>
                        </div>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        <Clock className="inline-block w-4 h-4 mr-1 -mt-0.5" />
                        {formatDuration(template.estimated_time_seconds)}
                        <span className="mx-2">•</span>
                        {template.steps.length} step{template.steps.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 bg-muted/50">
                      <Button className="w-full" onClick={() => startSession(template)}>
                        Start <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}

              {templates.length === 0 && (
                <div className="col-span-3 p-8 text-center border rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-4">No templates found. Create your first template to get started.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Create Template
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Active Session Tab */}
        <TabsContent value="active-session">
          {activeSession && activeTemplate ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Active: {activeTemplate.name}</CardTitle>
                      <CardDescription>
                        From: {activeSession.from_context} → To: {activeSession.to_context}
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setActiveTab("templates")}>
                      View All Templates
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Progress:</span>
                        <span className="text-sm">Step 0 of {activeTemplate.steps.length}</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-3 border-b font-medium">
                        Steps to Complete
                      </div>
                      <ScrollArea className="h-64">
                        <div className="p-0">
                          {activeTemplate.steps.map((step, index) => (
                            <div 
                              key={step.id} 
                              className="flex items-start p-3 border-b last:border-0 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                                {index + 1}
                              </div>
                              <div className="flex-grow">
                                <div className="font-medium">{step.description}</div>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Badge variant="outline" className="mr-2">
                                    {step.type}
                                  </Badge>
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {formatDuration(step.estimated_time_seconds)}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="flex-shrink-0">
                                <Check className="h-5 w-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <Button variant="outline" className="w-1/3">
                    Pause
                  </Button>
                  <Button 
                    className="w-2/3 ml-2"
                    onClick={() => {
                      if (activeSession) {
                        endSession(activeSession.id, { success_rating: 5 });
                      }
                    }}
                  >
                    Complete Switch
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
              <h3 className="text-lg font-medium mb-2">No Active Session</h3>
              <p className="text-muted-foreground mb-4">Select a template to start a context switching session.</p>
              <Button onClick={() => setActiveTab("templates")}>
                View Templates
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* History & Stats Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Switches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.stats ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    stats?.switch_count || 0
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Avg. Switch Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.stats ? (
                    <Skeleton className="h-9 w-24" />
                  ) : (
                    formatDuration(stats?.average_switch_time || 0)
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Cognitive Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold capitalize flex items-center">
                  {loading.stats ? (
                    <Skeleton className="h-9 w-20" />
                  ) : (
                    <>
                      {stats?.cognitive_load_level || 'low'}
                      <Badge 
                        className="ml-2" 
                        variant={
                          stats?.cognitive_load_level === 'high' ? 'destructive' : 
                          stats?.cognitive_load_level === 'medium' ? 'default' : 
                          'outline'
                        }
                      >
                        {stats?.cognitive_load_level === 'high' ? 'High' : 
                         stats?.cognitive_load_level === 'medium' ? 'Medium' : 
                         'Low'}
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Context Switches</CardTitle>
              <CardDescription>
                Your latest context switching sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.sessions ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-3 border rounded-md">
                      <Skeleton className="h-8 w-8 rounded-full mr-3" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center p-3 border rounded-md">
                      <div className="mr-3 p-1 bg-primary/10 rounded-full">
                        <RefreshCw className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {session.from_context} → {session.to_context}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.start_time).toLocaleDateString()}
                          {session.end_time && ` • ${formatDuration(
                            (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000
                          )}`}
                        </div>
                      </div>
                      <Badge 
                        variant={session.success_rating && session.success_rating > 3 ? 'default' : 'outline'}
                      >
                        {session.success_rating ? `${session.success_rating}/5` : 'Incomplete'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border rounded-lg bg-muted/50">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No History Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your first context switch to build your history.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContextSwitchingTool; 