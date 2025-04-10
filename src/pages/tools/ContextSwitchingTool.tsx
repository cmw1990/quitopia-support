import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  History,
  Info,
  Users,
  Brain
} from 'lucide-react';

import { formatDuration } from '@/lib/utils';

// Sample template data for the public version (no backend connection)
const sampleTemplates = [
  {
    id: '1',
    name: 'Basic Context Switch',
    description: 'A simple template for switching between contexts quickly',
    steps: [
      {
        id: '1-1',
        description: 'Save your current work state',
        estimated_time_seconds: 60,
        type: 'preparation',
        order: 1
      },
      {
        id: '1-2',
        description: 'Close unnecessary applications and tabs',
        estimated_time_seconds: 60,
        type: 'action',
        order: 2
      },
      {
        id: '1-3',
        description: 'Take a 30-second break to clear your mind',
        estimated_time_seconds: 30,
        type: 'break',
        order: 3
      },
      {
        id: '1-4',
        description: 'Open resources needed for the new context',
        estimated_time_seconds: 60,
        type: 'action',
        order: 4
      },
      {
        id: '1-5',
        description: 'Review your task list for the new context',
        estimated_time_seconds: 60,
        type: 'action',
        order: 5
      }
    ],
    estimated_time_seconds: 270,
    complexity: 1,
    tags: ['basic', 'quick']
  },
  {
    id: '2',
    name: 'Detailed Context Switch',
    description: 'A comprehensive template for complex task switching',
    steps: [
      {
        id: '2-1',
        description: 'Document current progress and thoughts',
        estimated_time_seconds: 120,
        type: 'preparation',
        order: 1
      },
      {
        id: '2-2',
        description: 'Create a bookmark list of open resources',
        estimated_time_seconds: 90,
        type: 'preparation',
        order: 2
      },
      {
        id: '2-3',
        description: 'Save and close all applications',
        estimated_time_seconds: 60,
        type: 'action',
        order: 3
      },
      {
        id: '2-4',
        description: 'Take a 2-minute mindfulness break',
        estimated_time_seconds: 120,
        type: 'break',
        order: 4
      },
      {
        id: '2-5',
        description: 'Review notes and requirements for new context',
        estimated_time_seconds: 180,
        type: 'preparation',
        order: 5
      },
      {
        id: '2-6',
        description: 'Set up workspace for new context',
        estimated_time_seconds: 120,
        type: 'action',
        order: 6
      },
      {
        id: '2-7',
        description: 'Plan first 3 tasks to complete',
        estimated_time_seconds: 120,
        type: 'planning',
        order: 7
      }
    ],
    estimated_time_seconds: 810,
    complexity: 3,
    tags: ['detailed', 'comprehensive']
  },
  {
    id: '3',
    name: 'Emergency Switch',
    description: 'For urgent context switches that need to happen quickly',
    steps: [
      {
        id: '3-1',
        description: 'Take a screenshot of your current work',
        estimated_time_seconds: 15,
        type: 'preparation',
        order: 1
      },
      {
        id: '3-2',
        description: 'Write down your current thought process',
        estimated_time_seconds: 30,
        type: 'preparation',
        order: 2
      },
      {
        id: '3-3',
        description: 'Close everything',
        estimated_time_seconds: 15,
        type: 'action',
        order: 3
      },
      {
        id: '3-4',
        description: 'Deep breath for 10 seconds',
        estimated_time_seconds: 10,
        type: 'break',
        order: 4
      },
      {
        id: '3-5',
        description: 'Open new context',
        estimated_time_seconds: 15,
        type: 'action',
        order: 5
      }
    ],
    estimated_time_seconds: 85,
    complexity: 2,
    tags: ['emergency', 'urgent', 'quick']
  }
];

const ContextSwitchingTool = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState({
    templates: true,
    stats: true,
    sessions: true
  });
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [sessionFrom, setSessionFrom] = useState('');
  const [sessionTo, setSessionTo] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchTemplates();
    fetchStats();
    fetchSessions();
  }, []);

  const fetchTemplates = async () => {
    setLoading(prev => ({ ...prev, templates: true }));
    try {
      setTemplates(sampleTemplates);
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
      setStats(null);
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

  const startPreview = (template: any) => {
    setIsDialogOpen(true);
    setActiveTemplate(template);
  };

  const startSession = () => {
    if (!sessionFrom || !sessionTo) {
      toast({
        title: "Missing information",
        description: "Please specify what you're switching from and to.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDialogOpen(false);
    setActiveTab("active-session");
    setCurrentStep(0);
    
    // Show signup prompt after a few steps to encourage registration
    const promptTimer = setTimeout(() => {
      setShowSignupPrompt(true);
    }, 30000); // Show after 30 seconds of use
    
    return () => clearTimeout(promptTimer);
  };

  const completeStep = () => {
    if (!activeTemplate) return;
    
    if (currentStep < activeTemplate.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed all steps
      toast({
        title: "Context switch completed!",
        description: "You've successfully switched contexts. Sign up to save your progress!",
      });
      setActiveTab("templates");
      setActiveTemplate(null);
      setCurrentStep(0);
      setShowSignupPrompt(true);
    }
  };

  const calculateProgress = () => {
    if (!activeTemplate) return 0;
    return (currentStep / activeTemplate.steps.length) * 100;
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Context Switching Tool</h1>
        <p className="text-muted-foreground">
          Switch between tasks with less mental friction and greater efficiency.
        </p>
      </div>

      {showSignupPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex justify-between items-center"
        >
          <div className="flex items-center space-x-3">
            <Info className="h-6 w-6 text-primary" />
            <p className="font-medium">Create an account to save templates, track statistics, and get personalized recommendations.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowSignupPrompt(false)}>
              Later
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up Free</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="active-session">Active Session</TabsTrigger>
        </TabsList>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 items-start md:items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">What are context switches?</h2>
                <p className="text-muted-foreground">
                  Context switching is the mental effort required to shift your focus from one task or topic to another. 
                  For people with ADHD, this can be especially challenging and energy-draining.
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{template.name}</CardTitle>
                      <Badge variant="outline">{template.complexity}/5</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
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
                  <CardFooter className="pt-2">
                    <Button className="w-full" onClick={() => startPreview(template)}>
                      Try Template <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{activeTemplate?.name}</DialogTitle>
                <DialogDescription>{activeTemplate?.description}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="from" className="text-right">
                    From:
                  </Label>
                  <Input
                    id="from"
                    placeholder="Current activity"
                    className="col-span-3"
                    value={sessionFrom}
                    onChange={(e) => setSessionFrom(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="to" className="text-right">
                    To:
                  </Label>
                  <Input
                    id="to"
                    placeholder="New activity"
                    className="col-span-3"
                    value={sessionTo}
                    onChange={(e) => setSessionTo(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={startSession}>
                  Start Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Active Session Tab */}
        <TabsContent value="active-session">
          {activeTemplate ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Active: {activeTemplate.name}</CardTitle>
                      <CardDescription>
                        From: {sessionFrom} → To: {sessionTo}
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setActiveTab("templates")}>
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Progress:</span>
                        <span className="text-sm">Step {currentStep + 1} of {activeTemplate.steps.length}</span>
                      </div>
                      <Progress value={calculateProgress()} className="h-2" />
                    </div>
                    
                    <Card className="bg-muted/20 border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                            {currentStep + 1}
                          </div>
                          <CardTitle className="text-lg">
                            {activeTemplate.steps[currentStep].description}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Badge variant="outline" className="mr-2">
                            {activeTemplate.steps[currentStep].type}
                          </Badge>
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatDuration(activeTemplate.steps[currentStep].estimated_time_seconds)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-3 border-b font-medium">
                        All Steps
                      </div>
                      <ScrollArea className="h-56">
                        <div className="p-0">
                          {activeTemplate.steps.map((step: any, index: number) => (
                            <div 
                              key={step.id} 
                              className={`flex items-start p-3 border-b last:border-0 transition-colors ${
                                index === currentStep ? 'bg-primary/10' : 
                                index < currentStep ? 'bg-muted/50' : ''
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                index === currentStep ? 'bg-primary text-primary-foreground' : 
                                index < currentStep ? 'bg-muted text-muted-foreground' : 
                                'bg-primary/10 text-primary'
                              }`}>
                                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                              </div>
                              <div className="flex-grow">
                                <div className={`font-medium ${index < currentStep ? 'line-through text-muted-foreground' : ''}`}>
                                  {step.description}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Badge variant="outline" className="mr-2">
                                    {step.type}
                                  </Badge>
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {formatDuration(step.estimated_time_seconds)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4">
                  <Button 
                    size="lg"
                    onClick={completeStep}
                  >
                    {currentStep < activeTemplate.steps.length - 1 ? (
                      <>Mark Complete & Continue <ArrowRight className="ml-2 h-5 w-5" /></>
                    ) : (
                      <>Complete Switch <Check className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {showSignupPrompt && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 rounded-lg p-6 border border-primary/20 text-center"
                >
                  <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Enjoying the context switching tool?</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a free account to save your templates, track performance statistics, and get personalized recommendations.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <Button variant="outline" onClick={() => setShowSignupPrompt(false)}>
                      Continue as Guest
                    </Button>
                    <Button asChild>
                      <Link to="/register">Sign Up Free</Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Active Session</h3>
              <p className="text-muted-foreground mb-4">Select a template to start a context switching session.</p>
              <Button onClick={() => setActiveTab("templates")}>
                View Templates
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Need more powerful features?</h2>
        <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
          Get access to custom templates, progress tracking, and ADHD-friendly productivity tools with a free account.
        </p>
        <Button size="lg" asChild>
          <Link to="/register">Sign Up Now - It's Free</Link>
        </Button>
      </div>
    </div>
  );
};

export default ContextSwitchingTool; 