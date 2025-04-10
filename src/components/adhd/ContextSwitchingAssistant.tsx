import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Clock, 
  Save, 
  Play, 
  CheckCircle, 
  ListChecks, 
  AlertCircle,
  Bookmark,
  GanttChart,
  Brain,
  CheckCircle2,
  Activity,
  BarChart,
  Zap,
  AlertTriangle,
  Cloud,
  Database,
  Loader2,
  CloudOff
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { contextSwitchApi } from '@/api/supabase-rest';

// Types for data structures
interface SwitchingTemplate {
  id: string;
  name: string;
  steps: string[];
  duration: number;
  cognitiveLoad?: 'low' | 'medium' | 'high';
}

interface SavedContext {
  id: string;
  name: string;
  task: string;
  notes: string;
  resources: string[];
  progress: number;
  lastActive: string;
  cognitiveLoad?: 'low' | 'medium' | 'high';
  complexity?: number; // 1-10
  contextSnapshot?: string; // JSON stringified state of the context
}

// Interface for cognitive load tracking
interface CognitiveMetrics {
  switchCount: number;
  averageSwitchTime: number;
  totalSwitchTime: number;
  mostFrequentContexts: string[];
  cognitiveLoadLevel: 'low' | 'medium' | 'high';
  dailySwitches: { date: string; count: number }[];
}

const ContextSwitchingAssistant: React.FC = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  // Active switching state
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentTemplate, setCurrentTemplate] = useState<SwitchingTemplate | null>(null);
  const [switchingProgress, setSwitchingProgress] = useState<number>(0);
  const [currentContext, setCurrentContext] = useState<string>('');
  const [nextContext, setNextContext] = useState<string>('');
  const [transitionNotes, setTransitionNotes] = useState<string>('');
  
  // Loading states
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [loadingContexts, setLoadingContexts] = useState<boolean>(false);
  const [loadingSnapshots, setLoadingSnapshots] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // New cognitive metrics state
  const [cognitiveMetrics, setCognitiveMetrics] = useState<CognitiveMetrics>({
    switchCount: 23,
    averageSwitchTime: 8.5, // minutes
    totalSwitchTime: 196, // minutes
    mostFrequentContexts: ['Website Project', 'Client Proposal', 'Study Session'],
    cognitiveLoadLevel: 'medium',
    dailySwitches: [
      { date: '2023-05-01', count: 5 },
      { date: '2023-05-02', count: 7 },
      { date: '2023-05-03', count: 3 },
      { date: '2023-05-04', count: 8 },
      { date: '2023-05-05', count: 4 },
    ]
  });
  
  // Templates state
  const [templates, setTemplates] = useState<SwitchingTemplate[]>([
    {
      id: '1',
      name: 'Standard Transition',
      steps: [
        'Save current work and close unnecessary applications',
        'Take a 5-minute break (stretch, water, brief walk)',
        'Review the next task and set clear objectives',
        'Prepare your workspace for the new context',
        'Start with a small, achievable part of the new task'
      ],
      duration: 10,
      cognitiveLoad: 'medium'
    },
    {
      id: '2',
      name: 'Quick Switch',
      steps: [
        'Note down where you are leaving off',
        'Take 3 deep breaths',
        'Review next task briefly',
        'Begin new task'
      ],
      duration: 3,
      cognitiveLoad: 'high'
    },
    {
      id: '3',
      name: 'Deep Work Transition',
      steps: [
        'Complete a clear stopping point on current task',
        'Write down any open loops or ideas to return to later',
        'Take a 10-minute break (no screens)',
        'Clear desk and prepare materials for next task',
        'Review objectives for the next deep work session',
        'Set a timer for focused work on the new task',
        'Begin with a review of previous progress'
      ],
      duration: 15,
      cognitiveLoad: 'low'
    }
  ]);
  
  // Saved contexts state
  const [savedContexts, setSavedContexts] = useState<SavedContext[]>([
    {
      id: '1',
      name: 'Website Project',
      task: 'Implement new landing page design',
      notes: 'Currently working on responsive breakpoints for mobile view. Need to fix navigation issue.',
      resources: ['Figma design', 'Style guide', 'Component library'],
      progress: 65,
      lastActive: '2 hours ago',
      cognitiveLoad: 'medium',
      complexity: 7
    },
    {
      id: '2',
      name: 'Client Proposal',
      task: 'Write project timeline and budget sections',
      notes: 'Research completed, outline created. Need to add cost breakdown.',
      resources: ['Previous proposals', 'Pricing sheet', 'Project management template'],
      progress: 40,
      lastActive: '1 day ago',
      cognitiveLoad: 'high',
      complexity: 8
    },
    {
      id: '3',
      name: 'Study Session',
      task: 'Complete chapter 7 exercises',
      notes: 'Finished reading the chapter, started first 3 problems.',
      resources: ['Textbook', 'Online course', 'Study notes'],
      progress: 25,
      lastActive: '3 days ago',
      cognitiveLoad: 'low',
      complexity: 4
    }
  ]);
  
  // New context/template state
  const [newTemplate, setNewTemplate] = useState<Partial<SwitchingTemplate>>({
    name: '',
    steps: [''],
    duration: 5,
    cognitiveLoad: 'medium'
  });
  
  const [newContext, setNewContext] = useState<Partial<SavedContext>>({
    name: '',
    task: '',
    notes: '',
    resources: [],
    progress: 0,
    cognitiveLoad: 'medium',
    complexity: 5
  });
  
  const [newResource, setNewResource] = useState<string>('');
  const [newStep, setNewStep] = useState<string>('');
  
  // Transition timer
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  
  // Task snapshot state
  const [snapshots, setSnapshots] = useState<{
    id: string;
    contextId: string;
    timestamp: string;
    description: string;
    links: string[];
    imageUrl?: string;
  }[]>([
    {
      id: '1',
      contextId: '1',
      timestamp: '2023-05-06T14:30:00Z',
      description: 'Fixed the responsive layout for mobile navigation menu. Need to test on multiple devices next.',
      links: ['https://example.com/design-specs', 'https://example.com/project-board/task-123'],
    },
    {
      id: '2',
      contextId: '2',
      timestamp: '2023-05-05T11:15:00Z',
      description: 'Completed cost analysis for Phase 1. Need to review with finance team and incorporate feedback.',
      links: ['https://example.com/budget-spreadsheet'],
    }
  ]);
  
  const [newSnapshot, setNewSnapshot] = useState<{
    description: string;
    links: string[];
    imageUrl?: string;
  }>({
    description: '',
    links: [],
  });
  
  const [newSnapshotLink, setNewSnapshotLink] = useState<string>('');
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  
  // Add the useEffect hook to load user data when the component mounts
  useEffect(() => {
    if (user && session) {
      loadUserData();
    }
  }, [user, session]);
  
  const loadUserData = async () => {
    if (!user || !session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to load your contexts and templates.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Set loading states
      setLoadingTemplates(true);
      setLoadingContexts(true);
      setLoadingSnapshots(true);
      setLoadingStats(true);

      // Load templates
      const templatesResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_switching_templates8?user_id=eq.${user.id}&select=*&order=created_at.desc`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.map((template: any) => ({
          id: template.id,
          name: template.name,
          steps: template.steps || [],
          duration: template.duration || 5,
          cognitiveLoad: template.cognitive_load || 'medium'
        })));
      }

      // Load saved contexts
      const contextsResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/saved_contexts8?user_id=eq.${user.id}&select=*&order=last_used.desc`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      let contextsData: any[] = [];
      if (contextsResponse.ok) {
        contextsData = await contextsResponse.json();
        setSavedContexts(contextsData.map((context: any) => ({
          id: context.id,
          name: context.name,
          task: context.task || '',
          notes: context.notes || '',
          resources: context.resources || [],
          progress: context.progress || 0,
          lastActive: new Date(context.last_used).toLocaleString(),
          cognitiveLoad: context.cognitive_load || 'medium',
          complexity: context.complexity || 5
        })));
      }

      // Load context snapshots
      const snapshotsResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_snapshots8?user_id=eq.${user.id}&select=*&order=created_at.desc`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (snapshotsResponse.ok) {
        const snapshotsData = await snapshotsResponse.json();
        setSnapshots(snapshotsData.map((snapshot: any) => ({
          id: snapshot.id,
          contextId: snapshot.context_id,
          timestamp: snapshot.created_at,
          description: snapshot.description,
          links: snapshot.links || [],
          imageUrl: snapshot.image_url
        })));
      }

      // Load switching stats and metrics
      const statsResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_switching_stats8?user_id=eq.${user.id}&select=*`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        if (statsData.length > 0) {
          const stats = statsData[0];
          const dailySwitches = [];
          
          // Convert daily_switches object to array format
          if (stats.daily_switches) {
            for (const [date, count] of Object.entries(stats.daily_switches)) {
              dailySwitches.push({ date, count: count as number });
            }
          }
          
          // Get most frequent contexts
          const mostFrequent = [];
          if (stats.most_frequent_contexts) {
            const contextIds = Object.keys(stats.most_frequent_contexts)
              .sort((a, b) => (stats.most_frequent_contexts[b] || 0) - (stats.most_frequent_contexts[a] || 0))
              .slice(0, 5);
              
            for (const contextId of contextIds) {
              const context = contextsData.find((c: any) => c.id === contextId);
              if (context) {
                mostFrequent.push(context.name);
              }
            }
          }
          
          setCognitiveMetrics({
            switchCount: stats.switch_count || 0,
            averageSwitchTime: stats.average_switch_time || 0,
            totalSwitchTime: stats.total_switch_time || 0,
            mostFrequentContexts: mostFrequent,
            cognitiveLoadLevel: stats.cognitive_load_level || 'medium',
            dailySwitches: dailySwitches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7)
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingTemplates(false);
      setLoadingContexts(false);
      setLoadingSnapshots(false);
      setLoadingStats(false);
    }
  };
  
  useEffect(() => {
    let interval: number;
    
    if (isSwitching && secondsLeft !== null && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsLeft === 0) {
      // Move to next step
      if (currentTemplate && currentStep < currentTemplate.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSecondsLeft(currentTemplate.duration * 60 / currentTemplate.steps.length);
        setSwitchingProgress(((currentStep + 1) / currentTemplate.steps.length) * 100);
      } else {
        // Finished all steps
        setIsSwitching(false);
        setSwitchingProgress(100);
        
        // Log the completed switch if user is logged in
        if (user && session) {
          logContextSwitch();
        }
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSwitching, secondsLeft, currentStep, currentTemplate]);
  
  const startContextSwitch = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentTemplate(template);
      setCurrentStep(0);
      setIsSwitching(true);
      setSwitchingProgress(0);
      setSecondsLeft(template.duration * 60 / template.steps.length);
    }
  };
  
  const cancelContextSwitch = () => {
    setIsSwitching(false);
    setCurrentTemplate(null);
    setSecondsLeft(null);
    setSwitchingProgress(0);
    setCurrentStep(0);
  };
  
  const skipToNextStep = () => {
    if (currentTemplate && currentStep < currentTemplate.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSecondsLeft(currentTemplate.duration * 60 / currentTemplate.steps.length);
      setSwitchingProgress(((currentStep + 1) / currentTemplate.steps.length) * 100);
    } else {
      // Finished all steps
      setIsSwitching(false);
      setSwitchingProgress(100);
      
      // Log the completed switch if user is logged in
      if (user && session) {
        logContextSwitch();
      }
    }
  };
  
  const logContextSwitch = async () => {
    if (!user || !session || !currentTemplate) return;
    
    try {
      const fromContext = savedContexts.find(c => c.name === currentContext);
      const toContext = savedContexts.find(c => c.name === nextContext);
      
      const switchLogData = {
        user_id: user.id,
        from_context_id: fromContext?.id || null,
        to_context_id: toContext?.id || null,
        template_id: currentTemplate.id,
        from_context_name: currentContext,
        to_context_name: nextContext,
        duration_seconds: currentTemplate.duration * 60,
        completed: true,
        notes: transitionNotes,
        created_at: new Date().toISOString()
      };
      
      // Create context switch log using direct REST API
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_switch_logs8`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(switchLogData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to log context switch: ${response.status} ${response.statusText}`);
      }
      
      // Update cognitive metrics
      const updatedMetrics = { ...cognitiveMetrics };
      updatedMetrics.switchCount += 1;
      updatedMetrics.totalSwitchTime += currentTemplate.duration;
      updatedMetrics.averageSwitchTime = updatedMetrics.totalSwitchTime / updatedMetrics.switchCount;
      
      // Update most frequent contexts
      const contexts = [...updatedMetrics.mostFrequentContexts];
      if (currentContext && !contexts.includes(currentContext)) {
        contexts.push(currentContext);
      }
      if (nextContext && !contexts.includes(nextContext)) {
        contexts.push(nextContext);
      }
      updatedMetrics.mostFrequentContexts = contexts;
      
      // Update daily switches
      const today = new Date().toISOString().split('T')[0];
      const dailySwitches = [...updatedMetrics.dailySwitches];
      const todayIndex = dailySwitches.findIndex(d => d.date === today);
      
      if (todayIndex !== -1) {
        dailySwitches[todayIndex].count += 1;
      } else {
        dailySwitches.push({ date: today, count: 1 });
      }
      updatedMetrics.dailySwitches = dailySwitches;
      
      setCognitiveMetrics(updatedMetrics);
      
      // Update context switch stats in database
      const statsData = {
        user_id: user.id,
        switch_count: updatedMetrics.switchCount,
        average_switch_time: updatedMetrics.averageSwitchTime,
        total_switch_time: updatedMetrics.totalSwitchTime,
        cognitive_load_level: updatedMetrics.cognitiveLoadLevel,
        daily_switches: Object.fromEntries(
          updatedMetrics.dailySwitches.map(d => [d.date, d.count])
        )
      };
      
      // Check if stats exist and update or create
      const statsCheckResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_switching_stats8?user_id=eq.${user.id}`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const existingStats = await statsCheckResponse.json();
      
      if (existingStats && existingStats.length > 0) {
        // Update existing stats
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_switching_stats8?id=eq.${existingStats[0].id}`, {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(statsData)
        });
      } else {
        // Create new stats
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_switching_stats8`, {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(statsData)
        });
      }
      
      toast({
        title: 'Context switch completed',
        description: 'Your transition has been logged successfully.',
      });
    } catch (error) {
      console.error('Error logging context switch:', error);
      toast({
        title: 'Error logging switch',
        description: 'There was a problem saving your context switch.',
        variant: 'destructive',
      });
    }
  };
  
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const addTemplate = async () => {
    if (!newTemplate.name || !newTemplate.steps || newTemplate.steps.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please provide a name and at least one step for the template.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const templateData = {
        user_id: user?.id,
        name: newTemplate.name,
        steps: newTemplate.steps.filter(s => s.trim() !== ''),
        duration: newTemplate.duration || 5,
        cognitive_load: newTemplate.cognitiveLoad || 'medium',
        is_default: false
      };
      
      // Save template using direct REST API
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_switching_templates8`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(templateData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save template: ${response.status} ${response.statusText}`);
      }
      
      const savedTemplate = await response.json();
      
      if (savedTemplate && savedTemplate.length > 0) {
        const templateToAdd: SwitchingTemplate = {
          id: savedTemplate[0].id,
          name: savedTemplate[0].name,
          steps: savedTemplate[0].steps,
          duration: savedTemplate[0].duration,
          cognitiveLoad: savedTemplate[0].cognitive_load,
        };
        
        setTemplates(prev => [...prev, templateToAdd]);
        
        setNewTemplate({
          name: '',
          steps: [''],
          duration: 5,
          cognitiveLoad: 'medium'
        });
        
        toast({
          title: 'Template added',
          description: `"${templateToAdd.name}" has been added to your templates.`,
        });
      }
    } catch (error) {
      console.error('Error adding template:', error);
      toast({
        title: 'Error adding template',
        description: 'There was a problem saving your template.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const addStepToTemplate = () => {
    if (newStep.trim() !== '') {
      setNewTemplate(prev => ({
        ...prev,
        steps: [...(prev.steps || []), newStep]
      }));
      setNewStep('');
    }
  };
  
  const saveContext = async () => {
    if (!newContext.name || !user || !session) {
      toast({
        title: "Error",
        description: "Please provide a name for your context.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const contextData = {
        user_id: user.id,
        name: newContext.name,
        task: newContext.task || '',
        notes: newContext.notes || '',
        resources: newContext.resources || [],
        progress: newContext.progress || 0,
        cognitive_load: newContext.cognitiveLoad || 'medium',
        complexity: newContext.complexity || 5,
        last_used: new Date().toISOString()
      };
      
      // Create new context using direct REST API call
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/saved_contexts8`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(contextData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save context: ${response.status} ${response.statusText}`);
      }
      
      const savedContext = await response.json();
      
      if (savedContext && savedContext.length > 0) {
        // Add new context to state
        const newSavedContext: SavedContext = {
          id: savedContext[0].id,
          name: savedContext[0].name,
          task: savedContext[0].task || '',
          notes: savedContext[0].notes || '',
          resources: savedContext[0].resources || [],
          progress: savedContext[0].progress || 0,
          lastActive: 'Just now',
          cognitiveLoad: savedContext[0].cognitive_load,
          complexity: savedContext[0].complexity
        };
        
        setSavedContexts(prev => [newSavedContext, ...prev]);
        
        // Reset new context form
        setNewContext({
          name: '',
          task: '',
          notes: '',
          resources: [],
          progress: 0,
          cognitiveLoad: 'medium',
          complexity: 5
        });
        
        toast({
          title: "Context saved",
          description: `'${newSavedContext.name}' has been saved.`
        });
      }
    } catch (error) {
      console.error('Error saving context:', error);
      toast({
        title: "Error",
        description: "Failed to save context. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const addResourceToContext = () => {
    if (newResource.trim() !== '') {
      setNewContext(prev => ({
        ...prev,
        resources: [...(prev.resources || []), newResource]
      }));
      setNewResource('');
    }
  };
  
  const addSnapshot = async () => {
    if (!selectedContextId || !newSnapshot.description) {
      toast({
        title: 'Missing information',
        description: 'Please select a context and provide a description.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const snapshotData = {
        user_id: user?.id,
        context_id: selectedContextId,
        description: newSnapshot.description,
        links: newSnapshot.links || [],
        image_url: newSnapshot.imageUrl,
        created_at: new Date().toISOString()
      };
      
      // Create snapshot using direct REST API
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/context_snapshots8`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(snapshotData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save snapshot: ${response.status} ${response.statusText}`);
      }
      
      const savedSnapshot = await response.json();
      
      if (savedSnapshot && savedSnapshot.length > 0) {
        const snapshotToAdd = {
          id: savedSnapshot[0].id,
          contextId: selectedContextId,
          timestamp: savedSnapshot[0].created_at,
          description: newSnapshot.description,
          links: newSnapshot.links || [],
          imageUrl: newSnapshot.imageUrl,
        };
        
        setSnapshots(prev => [snapshotToAdd, ...prev]);
        setNewSnapshot({
          description: '',
          links: [],
        });
        setSelectedContextId(null);
        
        toast({
          title: 'Snapshot saved',
          description: 'Your task snapshot has been saved.',
        });
      }
    } catch (error) {
      console.error('Error adding snapshot:', error);
      toast({
        title: 'Error saving snapshot',
        description: 'There was a problem saving your snapshot.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const addLinkToSnapshot = () => {
    if (newSnapshotLink.trim() !== '') {
      setNewSnapshot(prev => ({
        ...prev,
        links: [...(prev.links || []), newSnapshotLink]
      }));
      setNewSnapshotLink('');
    }
  };
  
  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };
  
  const renderCognitiveLoadBadge = (load?: 'low' | 'medium' | 'high') => {
    switch (load) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Context Switching Assistant | Easier Focus</title> 
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Context Switching Assistant</h1>
            <p className="text-muted-foreground">Tools to help manage transitions between tasks</p>
          </div>
          
          {user && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadUserData}
              disabled={
                loadingTemplates || 
                loadingContexts || 
                loadingSnapshots || 
                loadingStats
              }
            >
              {(loadingTemplates || loadingContexts || loadingSnapshots || loadingStats) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Data...
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
          )}
        </div>
        
        {!user && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sign in to save data</AlertTitle>
            <AlertDescription>
              Sign in to save your context switching templates, contexts, and track your transitions over time.
            </AlertDescription>
          </Alert>
        )}
        
        {isSwitching ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Transition in Progress
                </span>
                <span className="text-sm font-normal">
                  Step {currentStep + 1} of {currentTemplate?.steps.length}
                </span>
              </CardTitle>
              <CardDescription>
                {currentContext && nextContext ? 
                  `Switching from "${currentContext}" to "${nextContext}"` : 
                  'Following transition plan'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pt-4">
                <div className="text-center mb-8">
                  <span className="text-4xl font-mono">{formatTime(secondsLeft)}</span>
                  <p className="text-sm text-muted-foreground">
                    Current step: {secondsLeft && secondsLeft > 0 ? 'In progress' : 'Complete'}
                  </p>
                </div>
                
                <div className="mb-8 space-y-1">
                  <Progress value={switchingProgress} className="h-2 w-full" />
                  <div className="flex justify-between">
                    <span className="text-xs">Start</span>
                    <span className="text-xs">Finish</span>
                  </div>
                </div>
                
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border rounded-lg p-6 shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {currentTemplate?.steps[currentStep]}
                  </h3>
                  <p className="text-muted-foreground">
                    Focus on this step until the timer runs out.
                  </p>
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={cancelContextSwitch}>
                Cancel
              </Button>
              <Button onClick={skipToNextStep}>
                {currentTemplate && currentStep === currentTemplate.steps.length - 1 ? 'Complete' : 'Next Step'} →
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Tabs defaultValue="switch">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="switch">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Switch Contexts
              </TabsTrigger>
              <TabsTrigger value="templates">
                <GanttChart className="h-4 w-4 mr-2" />
                Transition Templates
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Bookmark className="h-4 w-4 mr-2" />
                Saved Contexts
              </TabsTrigger>
              <TabsTrigger value="snapshots">
                <CheckCircle className="h-4 w-4 mr-2" />
                Task Snapshots
              </TabsTrigger>
            </TabsList>
            
            {/* Switch Contexts Tab */}
            <TabsContent value="switch" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Start a Context Switch</CardTitle>
                  <CardDescription>
                    Smoothly transition between tasks or projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Current Context</Label>
                        <Select
                          value={currentContext}
                          onValueChange={setCurrentContext}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="What are you working on now?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="--select--">Select current activity</SelectItem>
                            {savedContexts.map(context => (
                              <SelectItem key={context.id} value={context.name}>
                                {context.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Custom (not saved)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Next Context</Label>
                        <Select
                          value={nextContext}
                          onValueChange={setNextContext}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="--select--">Select next activity</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="--select--">Select next activity</SelectItem>
                            {savedContexts.map(context => (
                              <SelectItem key={context.id} value={context.name}>
                                {context.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Custom (not saved)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Transition Notes (Optional)</Label>
                        <Textarea
                          placeholder="Any thoughts about this transition..."
                          value={transitionNotes}
                          onChange={(e) => setTransitionNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Transition Template</Label>
                        <div className="grid gap-2">
                          {loadingTemplates ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              <span>Loading templates...</span>
                            </div>
                          ) : templates.length === 0 ? (
                            <div className="text-center p-4 border rounded-md">
                              <p className="text-muted-foreground">No templates available.</p>
                              <p className="text-sm">Create a template to get started.</p>
                            </div>
                          ) : (
                            templates.map(template => (
                              <div 
                                key={template.id}
                                className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50"
                                onClick={() => startContextSwitch(template.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <ListChecks className="h-4 w-4" />
                                  <span>{template.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {template.duration} min
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startContextSwitch(template.id);
                                    }}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Alert className="bg-primary/5 border-primary/20">
                          <Brain className="h-4 w-4 text-primary" />
                          <AlertTitle>Support for executive function</AlertTitle>
                          <AlertDescription>
                            Using a structured transition process can reduce cognitive load and make context switching less taxing.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {currentContext && nextContext ? (
                      <>Switching from <strong>{currentContext}</strong> to <strong>{nextContext}</strong></>
                    ) : (
                      'Select contexts to begin'
                    )}
                  </div>
                  <Button 
                    disabled={!currentContext || !nextContext || !templates.length} 
                    onClick={() => {
                      if (templates.length > 0) {
                        startContextSwitch(templates[0].id);
                      }
                    }}
                  >
                    Start Transition
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Context Switching Statistics
                  </CardTitle>
                  <CardDescription>Your cognitive transition patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading statistics...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-3xl font-bold">{cognitiveMetrics.switchCount}</p>
                        <p className="text-sm text-muted-foreground">Total context switches</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold">{cognitiveMetrics.averageSwitchTime.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">Avg. minutes per switch</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold">{cognitiveMetrics.totalSwitchTime}</p>
                        <p className="text-sm text-muted-foreground">Total minutes transitioning</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transition Templates</CardTitle>
                  <CardDescription>
                    Create and manage your context switching routines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {templates.map(template => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {template.duration} min
                          </Badge>
                        </div>
                        
                        <ol className="space-y-1 mt-3 pl-5 list-decimal">
                          {template.steps.map((step, idx) => (
                            <li key={idx} className="text-sm">
                              {step}
                            </li>
                          ))}
                        </ol>
                        
                        <div className="flex justify-end mt-4 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startContextSwitch(template.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Cognitive Load Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Understanding the mental cost of your context switches can help you plan better transitions.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-medium">Total Switches</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{cognitiveMetrics.switchCount}</div>
                          <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-medium">Avg. Switch Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{cognitiveMetrics.averageSwitchTime} min</div>
                          <p className="text-xs text-muted-foreground">Time spent transitioning</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-medium">Cognitive Load</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            {renderCognitiveLoadBadge(cognitiveMetrics.cognitiveLoadLevel)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Based on frequency & complexity</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">Daily Context Switches</h4>
                      <div className="h-32 w-full">
                        {cognitiveMetrics.dailySwitches.map((day, i) => (
                          <div key={day.date} className="flex items-end h-full">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div 
                                    className="bg-primary/80 rounded-sm w-8 mx-1 cursor-help"
                                    style={{ height: `${(day.count / 10) * 100}%` }}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(day.count / 10) * 100}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{new Date(day.date).toLocaleDateString()}: {day.count} switches</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        {cognitiveMetrics.dailySwitches.map(day => (
                          <div key={day.date}>{new Date(day.date).getDate()}</div>
                        ))}
                      </div>
                    </div>
                    
                    <Alert variant="default" className="bg-blue-50 border-blue-200">
                      <Brain className="h-4 w-4 text-blue-500" />
                      <AlertTitle>Optimize Your Transitions</AlertTitle>
                      <AlertDescription className="text-sm">
                        To reduce cognitive load, batch similar tasks together and limit context switches to less than 5 per day.
                        Using structured transitions can save up to 15 minutes of recovery time per switch.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={addTemplate}
                    disabled={!newTemplate.name || 
                              !newTemplate.steps || 
                              newTemplate.steps.filter(s => s.trim()).length === 0 || 
                              !newTemplate.duration}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Saved Contexts Tab */}
            <TabsContent value="saved" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Contexts</CardTitle>
                  <CardDescription>
                    Store details about your tasks and projects for easier switching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedContexts.map(context => (
                      <Card key={context.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{context.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Last active: {context.lastActive}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          <div>
                            <Label className="text-xs">Current Task</Label>
                            <p className="text-sm font-medium">{context.task}</p>
                          </div>
                          
                          {context.notes && (
                            <div>
                              <Label className="text-xs">Notes</Label>
                              <p className="text-sm">{context.notes}</p>
                            </div>
                          )}
                          
                          <div>
                            <Label className="text-xs">Progress</Label>
                            <div className="space-y-1 mt-1">
                              <Progress value={context.progress} className="h-2" />
                              <span className="text-xs text-muted-foreground">{context.progress}% complete</span>
                            </div>
                          </div>
                          
                          {context.resources && context.resources.length > 0 && (
                            <div>
                              <Label className="text-xs">Resources</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {context.resources.map((resource, idx) => (
                                  <div key={idx} className="text-xs bg-muted py-1 px-2 rounded-sm">
                                    {resource}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="bg-muted/20 pt-2">
                          <Button size="sm" className="w-full" onClick={() => setCurrentContext(context.name)}>
                            <ArrowRightLeft className="h-4 w-4 mr-1" />
                            Switch to Context
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                    
                    <Card className="border-dashed">
                      <CardHeader>
                        <CardTitle className="text-base">Save New Context</CardTitle>
                        <CardDescription>Store details about your current task</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="context-name">Context Name</Label>
                          <Input
                            id="context-name"
                            placeholder="e.g., Project X Development"
                            value={newContext.name}
                            onChange={(e) => setNewContext({ ...newContext, name: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="context-task">Current Task</Label>
                          <Input
                            id="context-task"
                            placeholder="What are you working on?"
                            value={newContext.task}
                            onChange={(e) => setNewContext({ ...newContext, task: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="context-notes">Notes (Optional)</Label>
                          <Textarea
                            id="context-notes"
                            placeholder="Any details to remember when you return..."
                            value={newContext.notes}
                            onChange={(e) => setNewContext({ ...newContext, notes: e.target.value })}
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="context-resources">Resources</Label>
                          <div className="flex gap-2">
                            <Input
                              id="context-resources"
                              placeholder="Add a resource..."
                              value={newResource}
                              onChange={(e) => setNewResource(e.target.value)}
                            />
                            <Button variant="outline" onClick={addResourceToContext}>Add</Button>
                          </div>
                          
                          {newContext.resources && newContext.resources.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {newContext.resources.map((resource, idx) => (
                                <div 
                                  key={idx} 
                                  className="text-xs bg-muted py-1 px-2 rounded-sm flex items-center gap-1"
                                >
                                  {resource}
                                  <button
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      const newResources = [...(newContext.resources || [])];
                                      newResources.splice(idx, 1);
                                      setNewContext({ ...newContext, resources: newResources });
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="context-progress">Progress ({newContext.progress}%)</Label>
                          </div>
                          <Input
                            id="context-progress"
                            type="range"
                            min="0"
                            max="100"
                            value={newContext.progress}
                            onChange={(e) => setNewContext({ ...newContext, progress: parseInt(e.target.value) })}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={saveContext}
                          disabled={!newContext.name || !newContext.task}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Context
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Task Snapshots Tab */}
            <TabsContent value="snapshots" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Snapshots</CardTitle>
                  <CardDescription>
                    Capture your current state of work for easy resumption later
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Existing snapshots */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Your Recent Snapshots</h3>
                    
                    {snapshots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {snapshots.map(snapshot => {
                          const context = savedContexts.find(c => c.id === snapshot.contextId);
                          return (
                            <div key={snapshot.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-sm">{context?.name || 'Unknown Context'}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTimestamp(snapshot.timestamp)}
                                  </p>
                                </div>
                                <Badge variant="outline">Snapshot</Badge>
                              </div>
                              
                              <p className="text-sm my-3">{snapshot.description}</p>
                              
                              {snapshot.links.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Related Links:</p>
                                  <ul className="space-y-1">
                                    {snapshot.links.map((link, idx) => (
                                      <li key={idx} className="text-xs text-blue-600 hover:underline">
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                          {link.length > 40 ? link.substring(0, 40) + '...' : link}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {snapshot.imageUrl && (
                                <div className="mt-3">
                                  <img 
                                    src={snapshot.imageUrl} 
                                    alt="Task snapshot" 
                                    className="rounded-md border max-h-32 object-cover" 
                                  />
                                </div>
                              )}
                              
                              <div className="flex justify-end mt-3">
                                <Button variant="outline" size="sm">
                                  Restore Context
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <p>You haven't created any task snapshots yet</p>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Create new snapshot */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Create New Snapshot</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="snapshot-context">Context</Label>
                        <Select
                          value={selectedContextId || ''}
                          onValueChange={setSelectedContextId}
                        >
                          <SelectTrigger id="snapshot-context">
                            <SelectValue placeholder="Select Context" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="--select--">Select Context</SelectItem>
                            {savedContexts.map(context => (
                              <SelectItem key={context.id} value={context.id}>
                                {context.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="snapshot-description">Current Status</Label>
                        <Textarea
                          id="snapshot-description"
                          placeholder="Describe your current state of work, what you've accomplished, and what's next..."
                          value={newSnapshot.description}
                          onChange={(e) => setNewSnapshot({ ...newSnapshot, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="snapshot-links">Add Related Links</Label>
                        <div className="flex gap-2">
                          <Input
                            id="snapshot-links"
                            placeholder="https://..."
                            value={newSnapshotLink}
                            onChange={(e) => setNewSnapshotLink(e.target.value)}
                          />
                          <Button variant="outline" onClick={addLinkToSnapshot}>Add</Button>
                        </div>
                        
                        {newSnapshot.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newSnapshot.links.map((link, idx) => (
                              <div 
                                key={idx}
                                className="bg-muted py-1 px-2 rounded-sm text-xs flex items-center gap-1"
                              >
                                <span className="truncate max-w-[150px]">{link}</span>
                                <button
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    const newLinks = [...newSnapshot.links];
                                    newLinks.splice(idx, 1);
                                    setNewSnapshot({ ...newSnapshot, links: newLinks });
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="snapshot-image">Add Screenshot or Image (Optional)</Label>
                        <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <input
                            type="file"
                            id="snapshot-image"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewSnapshot({
                                    ...newSnapshot,
                                    imageUrl: reader.result as string
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label htmlFor="snapshot-image" className="cursor-pointer">
                            <div className="text-sm text-muted-foreground">
                              Click to upload an image of your current work
                            </div>
                          </label>
                        </div>
                        
                        {newSnapshot.imageUrl && (
                          <div className="mt-2">
                            <img 
                              src={newSnapshot.imageUrl} 
                              alt="Preview" 
                              className="max-h-32 rounded-md border object-cover" 
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 text-xs text-destructive"
                              onClick={() => setNewSnapshot({ ...newSnapshot, imageUrl: undefined })}
                            >
                              Remove Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={addSnapshot}
                    disabled={!selectedContextId || !newSnapshot.description}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Task Snapshot
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
};

export default ContextSwitchingAssistant; 