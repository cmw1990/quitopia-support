import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRightLeft, BarChart3, BookOpen, FileBox, ListChecks } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { PageHeader } from '@/components/PageHeader';
import { ContainerInner } from '@/components/ContainerInner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import CurrentContextPanel from './CurrentContextPanel';
import TemplatesPanel from './TemplatesPanel';
import SavedContextsPanel from './SavedContextsPanel';
import SwitchingHistoryPanel from './SwitchingHistoryPanel';
import CognitiveLoadPanel from './CognitiveLoadPanel';
import { ContextSwitchingInitializer } from './ContextSwitchingInitializer';

import { contextSwitchingService } from '@/services/context-switching/contextSwitchingService';
import { 
  SwitchingTemplate, 
  SavedContext, 
  ContextSwitchLog, 
  ContextSwitchStats,
  CognitiveMetrics 
} from '@/services/context-switching/types';

const ContextSwitchingAssistant: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  // State for all context switching data
  const [templates, setTemplates] = useState<SwitchingTemplate[]>([]);
  const [savedContexts, setSavedContexts] = useState<SavedContext[]>([]);
  const [switchLogs, setSwitchLogs] = useState<ContextSwitchLog[]>([]);
  const [switchStats, setSwitchStats] = useState<ContextSwitchStats | null>(null);
  const [currentContext, setCurrentContext] = useState<SavedContext | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  
  // Loading states
  const [loading, setLoading] = useState({
    templates: false,
    contexts: false,
    logs: false,
    stats: false,
  });
  
  // Cognitive metrics calculated from stats
  const [cognitiveMetrics, setCognitiveMetrics] = useState<CognitiveMetrics>({
    daily_switches: 0,
    weekly_switches: 0,
    switch_complexity: 0,
    average_duration: 0,
    cognitive_load: 'low',
  });

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Calculate cognitive metrics whenever stats change
  useEffect(() => {
    if (switchStats) {
      calculateCognitiveMetrics();
    }
  }, [switchStats]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadTemplates(),
        loadSavedContexts(),
        loadSwitchLogs(),
        loadSwitchStats(),
      ]);
    } catch (error) {
      console.error('Error loading context switching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load context switching data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const loadTemplates = async () => {
    setLoading(prev => ({ ...prev, templates: true }));
    try {
      const { data } = await contextSwitchingService.getTemplates();
      if (data) {
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  };

  const loadSavedContexts = async () => {
    setLoading(prev => ({ ...prev, contexts: true }));
    try {
      const { data } = await contextSwitchingService.getSavedContexts();
      if (data) {
        setSavedContexts(data);
        
        // Set the most recently used context as current
        if (data.length > 0) {
          // Sort by last_used and get the most recent
          const sortedContexts = [...data].sort((a, b) => {
            if (!a.last_used) return 1;
            if (!b.last_used) return -1;
            return new Date(b.last_used).getTime() - new Date(a.last_used).getTime();
          });
          
          setCurrentContext(sortedContexts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading saved contexts:', error);
    } finally {
      setLoading(prev => ({ ...prev, contexts: false }));
    }
  };

  const loadSwitchLogs = async () => {
    setLoading(prev => ({ ...prev, logs: true }));
    try {
      const { data } = await contextSwitchingService.getSwitchLogs();
      if (data) {
        setSwitchLogs(data);
      }
    } catch (error) {
      console.error('Error loading switch logs:', error);
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  };

  const loadSwitchStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const { data } = await contextSwitchingService.getSwitchingStats();
      if (data) {
        setSwitchStats(data);
      }
    } catch (error) {
      console.error('Error loading switch stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const calculateCognitiveMetrics = () => {
    if (!switchStats) return;
    
    // Calculate daily switches
    const dailySwitches = switchStats.daily_switches 
      ? Object.values(switchStats.daily_switches).reduce((sum, val) => sum + val, 0) / Object.keys(switchStats.daily_switches).length
      : 0;
    
    // Calculate weekly switches (sum of daily switches if available)
    const weeklySwitches = dailySwitches * 7;
    
    // Calculate average complexity from most frequent contexts
    let switchComplexity = 0;
    if (switchStats.most_frequent_contexts && savedContexts.length > 0) {
      const contextIds = Object.keys(switchStats.most_frequent_contexts);
      const relevantContexts = savedContexts.filter(ctx => ctx.id && contextIds.includes(ctx.id));
      if (relevantContexts.length > 0) {
        switchComplexity = relevantContexts.reduce((sum, ctx) => sum + ctx.complexity, 0) / relevantContexts.length;
      }
    }
    
    setCognitiveMetrics({
      daily_switches: Math.round(dailySwitches),
      weekly_switches: Math.round(weeklySwitches),
      switch_complexity: Math.round(switchComplexity * 10) / 10,
      average_duration: Math.round(switchStats.average_switch_time || 0),
      cognitive_load: switchStats.cognitive_load_level || 'low',
    });
  };

  const handleSwitchContext = async (from: SavedContext | null, to: SavedContext) => {
    try {
      // Set the new current context
      setCurrentContext(to);
      
      // Update the last_used time for the context
      if (to.id) {
        await contextSwitchingService.updateSavedContext(to.id, {
          last_used: new Date().toISOString(),
        });
      }
      
      // Create a switch log
      const switchLog: ContextSwitchLog = {
        from_context_id: from?.id,
        to_context_id: to.id,
        from_context_name: from?.name,
        to_context_name: to.name,
        completed: true,
        duration_seconds: 0, // Will be updated later if a template is used
      };
      
      const { data: createdLog } = await contextSwitchingService.createSwitchLog(switchLog);
      if (createdLog) {
        setSwitchLogs(prev => [createdLog, ...prev]);
      }
      
      // Update stats
      await updateSwitchStats(from, to);
      
      toast({
        title: 'Context Switched',
        description: `Switched to "${to.name}"`,
      });
      
      // Refresh the saved contexts list to reflect the updated last_used time
      await loadSavedContexts();
    } catch (error) {
      console.error('Error switching context:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch context. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateSwitchStats = async (from: SavedContext | null, to: SavedContext) => {
    if (!switchStats) {
      // Create initial stats if none exist
      const newStats: Partial<ContextSwitchStats> = {
        switch_count: 1,
        average_switch_time: 0,
        total_switch_time: 0,
        most_frequent_contexts: to.id ? { [to.id]: 1 } : {},
        cognitive_load_level: to.cognitive_load,
        daily_switches: {
          [new Date().toISOString().split('T')[0]]: 1,
        },
      };
      
      const { data: createdStats } = await contextSwitchingService.createSwitchingStats(newStats);
      if (createdStats) {
        setSwitchStats(createdStats);
      }
      return;
    }
    
    // Update existing stats
    const today = new Date().toISOString().split('T')[0];
    const dailySwitches = { ...switchStats.daily_switches } || {};
    dailySwitches[today] = (dailySwitches[today] || 0) + 1;
    
    const mostFrequentContexts = { ...switchStats.most_frequent_contexts } || {};
    if (to.id) {
      mostFrequentContexts[to.id] = (mostFrequentContexts[to.id] || 0) + 1;
    }
    
    const updatedStats: Partial<ContextSwitchStats> = {
      switch_count: (switchStats.switch_count || 0) + 1,
      daily_switches: dailySwitches,
      most_frequent_contexts: mostFrequentContexts,
      cognitive_load_level: calculateOverallCognitiveLoad(to.cognitive_load),
    };
    
    const { data: updatedStatsData } = await contextSwitchingService.updateSwitchingStats(switchStats.id!, updatedStats);
    if (updatedStatsData) {
      setSwitchStats(updatedStatsData);
    }
  };

  const calculateOverallCognitiveLoad = (newContextLoad: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' => {
    const loadMap = { 'low': 1, 'medium': 2, 'high': 3 };
    const currentLoad = switchStats?.cognitive_load_level || 'low';
    
    // Simple algorithm: if new load is higher than current, increase the overall load
    if (loadMap[newContextLoad] > loadMap[currentLoad]) {
      return newContextLoad;
    }
    // If the new load is significantly lower, decrease the overall load
    else if (loadMap[currentLoad] - loadMap[newContextLoad] >= 2) {
      return 'medium';
    }
    // Otherwise, maintain the current load
    return currentLoad;
  };

  // Check if we're still loading initial data
  const isLoading = Object.values(loading).some(Boolean);

  return (
    <>
      {user && <ContextSwitchingInitializer userId={user.id} />}
      <PageHeader
        title="Context Switching Assistant"
        description="Manage your contexts and reduce the cognitive load of switching between tasks."
        icon={<ArrowRightLeft className="h-6 w-6" />}
      />
      <ContainerInner>
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="current">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Current Context</span>
              </TabsTrigger>
              <TabsTrigger value="saved">
                <FileBox className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Saved Contexts</span>
              </TabsTrigger>
              <TabsTrigger value="templates">
                <ListChecks className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="metrics">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Metrics</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              <CurrentContextPanel 
                currentContext={currentContext} 
                templates={templates}
                savedContexts={savedContexts}
                onSwitchContext={handleSwitchContext}
                onRefreshData={loadData}
              />
            </TabsContent>
            
            <TabsContent value="saved">
              <SavedContextsPanel 
                contexts={savedContexts}
                currentContext={currentContext}
                onSwitchContext={handleSwitchContext}
                onRefreshData={loadSavedContexts}
              />
            </TabsContent>
            
            <TabsContent value="templates">
              <TemplatesPanel 
                templates={templates}
                onRefreshData={loadTemplates}
              />
            </TabsContent>
            
            <TabsContent value="history">
              <SwitchingHistoryPanel 
                logs={switchLogs}
                savedContexts={savedContexts}
                onRefreshData={loadSwitchLogs}
              />
            </TabsContent>
            
            <TabsContent value="metrics">
              <CognitiveLoadPanel 
                stats={switchStats}
                metrics={cognitiveMetrics}
                onRefreshData={loadSwitchStats}
              />
            </TabsContent>
          </Tabs>
        )}
      </ContainerInner>
    </>
  );
};

export default ContextSwitchingAssistant; 