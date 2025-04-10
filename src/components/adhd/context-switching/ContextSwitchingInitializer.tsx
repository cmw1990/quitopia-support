import { useEffect, useState } from 'react';
import { contextSwitchingService } from '@/services/context-switching/contextSwitchingService';
import { useToast } from '@/components/ui/use-toast';
import type { ContextSwitchTemplate, ContextSwitchStep, ContextSwitchStats } from '@/types/contextSwitching.ts'; // Adjust path as needed

interface ContextSwitchingInitializerProps {
  userId: string;
}

export const ContextSwitchingInitializer = ({ userId }: ContextSwitchingInitializerProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if user already has templates
        const { data: templates } = await contextSwitchingService.getTemplates();
        
        // If no templates, create default templates
        if (!templates || templates.length === 0) {
          await createDefaultTemplates();
        }
        
        // Check if user already has stats
        const { data: stats } = await contextSwitchingService.getSwitchingStats();
        
        // If no stats, initialize stats
        if (!stats) {
          await initializeStats();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize context switching data:', error);
        toast({
          title: 'Initialization Error',
          description: 'Could not set up context switching data. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    if (userId && !isInitialized) {
      initializeData();
    }
  }, [userId, isInitialized, toast]);
  
  // Create default templates function
  const createDefaultTemplates = async () => {
    try {
      // Example default templates
      const defaultTemplates = [
        {
          name: 'Basic Context Switch',
          description: 'A simple template for switching between contexts quickly',
          steps: [
            {
              description: 'Save your current work state',
              estimated_time_seconds: 60,
              type: 'preparation'
            },
            {
              description: 'Close unnecessary applications and tabs',
              estimated_time_seconds: 60,
              type: 'action'
            },
            {
              description: 'Take a 30-second break to clear your mind',
              estimated_time_seconds: 30,
              type: 'break'
            },
            {
              description: 'Open resources needed for the new context',
              estimated_time_seconds: 60,
              type: 'action'
            },
            {
              description: 'Review your task list for the new context',
              estimated_time_seconds: 60,
              type: 'action'
            }
          ],
          estimated_time_seconds: 270,
          complexity: 1,
          tags: ['basic', 'quick']
        },
        {
          name: 'Detailed Context Switch',
          description: 'A comprehensive template for complex task switching',
          steps: [
            {
              description: 'Document current progress and thoughts',
              estimated_time_seconds: 120,
              type: 'preparation'
            },
            {
              description: 'Create a bookmark list of open resources',
              estimated_time_seconds: 90,
              type: 'preparation'
            },
            {
              description: 'Save and close all applications',
              estimated_time_seconds: 60,
              type: 'action'
            },
            {
              description: 'Take a 2-minute mindfulness break',
              estimated_time_seconds: 120,
              type: 'break'
            },
            {
              description: 'Review notes and requirements for new context',
              estimated_time_seconds: 180,
              type: 'preparation'
            },
            {
              description: 'Set up workspace for new context',
              estimated_time_seconds: 120,
              type: 'action'
            },
            {
              description: 'Plan first 3 tasks to complete',
              estimated_time_seconds: 120,
              type: 'planning'
            }
          ],
          estimated_time_seconds: 810,
          complexity: 3,
          tags: ['detailed', 'comprehensive']
        },
        {
          name: 'Emergency Switch',
          description: 'For urgent context switches that need to happen quickly',
          steps: [
            {
              description: 'Take a screenshot of your current work',
              estimated_time_seconds: 15,
              type: 'preparation'
            },
            {
              description: 'Write down your current thought process',
              estimated_time_seconds: 30,
              type: 'preparation'
            },
            {
              description: 'Close everything',
              estimated_time_seconds: 15,
              type: 'action'
            },
            {
              description: 'Deep breath for 10 seconds',
              estimated_time_seconds: 10,
              type: 'break'
            },
            {
              description: 'Open new context',
              estimated_time_seconds: 15,
              type: 'action'
            }
          ],
          estimated_time_seconds: 85,
          complexity: 2,
          tags: ['emergency', 'urgent', 'quick']
        }
      ];
      
      // Create each template
      for (const template of defaultTemplates) {
        await contextSwitchingService.createTemplate(template as Omit<ContextSwitchTemplate, "id" | "user_id" | "created_at" | "updated_at">);
      }
      
      toast({
        title: 'Default templates created',
        description: 'We\'ve added some templates to help you get started.',
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to create default templates:', error);
      throw error;
    }
  };
  
  // Initialize stats function
  const initializeStats = async () => {
    try {
      const initialStats = {
        switch_count: 0,
        average_switch_time: 0,
        total_switch_time: 0,
        most_frequent_contexts: {},
        cognitive_load_level: 'low',
        daily_switches: {},
      };
      
      await contextSwitchingService.createSwitchingStats(initialStats as Omit<ContextSwitchStats, "id" | "user_id" | "created_at" | "updated_at">);
    } catch (error) {
      console.error('Failed to initialize stats:', error);
      throw error;
    }
  };

  // This component doesn't render anything visible
  return null;
}; 