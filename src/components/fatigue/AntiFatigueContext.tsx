import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

// Define types
export interface FatigueEntry {
  id?: string;
  user_id: string;
  date: string; // ISO string
  mental_fatigue: number;
  physical_fatigue: number;
  emotional_fatigue: number;
  sensory_fatigue: number;
  activity_context: string;
  contributors: string[];
  strategy_used?: string; // UUID of strategy
  strategy_effectiveness?: number;
  notes?: string;
  created_at?: string;
}

export interface FatigueStrategy {
  id: string;
  name: string;
  description: string;
  instructions: string;
  fatigue_type: 'mental' | 'physical' | 'emotional' | 'sensory';
  application_context: string[];
  duration_minutes: number;
  effectiveness_rating: number;
  scientific_basis?: string;
  contraindications?: string;
  adhd_specific: boolean;
  tags: string[];
}

export interface FatigueContextType {
  // State
  entries: FatigueEntry[];
  strategies: FatigueStrategy[];
  isLoading: boolean;
  // Form state for new entries
  currentEntry: FatigueEntry;
  // Actions
  setCurrentEntry: (entry: Partial<FatigueEntry>) => void;
  saveEntry: () => Promise<void>;
  getStrategiesForType: (
    type: 'mental' | 'physical' | 'emotional' | 'sensory', 
    context: string, 
    availableMinutes: number,
    adhd_specific?: boolean
  ) => FatigueStrategy[];
  fetchEntries: () => Promise<void>;
  fetchStrategies: () => Promise<void>;
  resetForm: () => void;
}

// Create the context with default values
const FatigueContext = createContext<FatigueContextType>({
  entries: [],
  strategies: [],
  isLoading: false,
  currentEntry: {
    user_id: '',
    date: new Date().toISOString(),
    mental_fatigue: 5,
    physical_fatigue: 5,
    emotional_fatigue: 5,
    sensory_fatigue: 5,
    activity_context: 'work',
    contributors: [],
  },
  setCurrentEntry: () => {},
  saveEntry: async () => {},
  getStrategiesForType: () => [],
  fetchEntries: async () => {},
  fetchStrategies: async () => {},
  resetForm: () => {},
});

export const AntiFatigueProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [entries, setEntries] = useState<FatigueEntry[]>([]);
  const [strategies, setStrategies] = useState<FatigueStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [currentEntry, setCurrentEntryState] = useState<FatigueEntry>({
    user_id: user?.id || '',
    date: new Date().toISOString(),
    mental_fatigue: 5,
    physical_fatigue: 5,
    emotional_fatigue: 5,
    sensory_fatigue: 5,
    activity_context: 'work',
    contributors: [],
  });
  
  // Update user_id when auth state changes
  useEffect(() => {
    if (user) {
      setCurrentEntryState(prev => ({ ...prev, user_id: user.id }));
    }
  }, [user]);
  
  // Fetch entries when user is available
  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchStrategies();
    }
  }, [user]);
  
  // Helper to update current entry (partial updates)
  const setCurrentEntry = (partial: Partial<FatigueEntry>) => {
    setCurrentEntryState(prev => ({ ...prev, ...partial }));
  };
  
  // Reset form to default values
  const resetForm = () => {
    setCurrentEntryState({
      user_id: user?.id || '',
      date: new Date().toISOString(),
      mental_fatigue: 5,
      physical_fatigue: 5,
      emotional_fatigue: 5,
      sensory_fatigue: 5,
      activity_context: 'work',
      contributors: [],
    });
  };
  
  // Fetch all entries for the current user
  const fetchEntries = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/fatigue-tracking?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch entries: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching fatigue entries:', error);
      toast({
        title: 'Error fetching fatigue data',
        description: 'Could not load your fatigue tracking data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch strategies
  const fetchStrategies = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/anti-fatigue-strategies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch strategies: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStrategies(data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast({
        title: 'Error fetching strategies',
        description: 'Could not load anti-fatigue strategies.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save a fatigue entry
  const saveEntry = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to track your fatigue levels',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if we're updating or creating
      const isUpdate = entries.some(entry => 
        entry.date.substring(0, 10) === currentEntry.date.substring(0, 10)
      );
      
      let url = '/api/v1/fatigue-tracking';
      let method = 'POST';
      
      if (isUpdate) {
        const existingEntry = entries.find(entry => 
          entry.date.substring(0, 10) === currentEntry.date.substring(0, 10)
        );
        if (existingEntry?.id) {
          url = `/api/v1/fatigue-tracking/${existingEntry.id}`;
          method = 'PUT';
        }
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentEntry),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save entry: ${response.statusText}`);
      }
      
      // Refresh data
      await fetchEntries();
      
      toast({
        title: isUpdate ? 'Entry updated' : 'Entry saved',
        description: `Your fatigue tracking for ${new Date(currentEntry.date).toLocaleDateString()} has been ${isUpdate ? 'updated' : 'saved'}.`,
      });
      
      resetForm();
    } catch (error) {
      console.error('Error saving fatigue entry:', error);
      toast({
        title: 'Error saving data',
        description: 'Could not save your fatigue tracking data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get strategies filtered by type and context
  const getStrategiesForType = (
    type: 'mental' | 'physical' | 'emotional' | 'sensory',
    context: string,
    availableMinutes: number,
    adhd_specific?: boolean
  ) => {
    return strategies.filter(strategy => 
      strategy.fatigue_type === type &&
      strategy.application_context.includes(context) &&
      strategy.duration_minutes <= availableMinutes &&
      (adhd_specific === undefined || strategy.adhd_specific === adhd_specific)
    ).sort((a, b) => b.effectiveness_rating - a.effectiveness_rating);
  };
  
  // Create context value
  const contextValue: FatigueContextType = {
    entries,
    strategies,
    isLoading,
    currentEntry,
    setCurrentEntry,
    saveEntry,
    getStrategiesForType,
    fetchEntries,
    fetchStrategies,
    resetForm,
  };
  
  return (
    <FatigueContext.Provider value={contextValue}>
      {children}
    </FatigueContext.Provider>
  );
};

// Custom hook for using the context
export const useFatigue = () => {
  const context = useContext(FatigueContext);
  if (context === undefined) {
    throw new Error('useFatigue must be used within an AntiFatigueProvider');
  }
  return context;
}; 