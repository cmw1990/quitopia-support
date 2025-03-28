import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

// Define Journal entry types
export interface Mood {
  value: 1 | 2 | 3 | 4 | 5;
  label: 'Terrible' | 'Bad' | 'Neutral' | 'Good' | 'Great';
}

export interface Trigger {
  id: string;
  name: string;
  category: 'social' | 'emotional' | 'situational' | 'physical' | 'other';
}

export interface Coping {
  id: string;
  name: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // ISO string
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  mood?: Mood;
  cravingIntensity?: number; // 1-10
  triggers: Trigger[];
  copingStrategies: Coping[];
  notes: string;
  isPrivate: boolean;
  tags: string[];
}

// Context type
interface JournalContextType {
  entries: JournalEntry[];
  isLoading: boolean;
  error: Error | null;
  fetchEntries: () => Promise<void>;
  getEntry: (id: string) => JournalEntry | undefined;
  saveEntry: (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<JournalEntry>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<JournalEntry>;
  deleteEntry: (id: string) => Promise<boolean>;
  getTriggers: () => Trigger[];
  getCopingStrategies: () => Omit<Coping, 'effectiveness' | 'notes'>[];
}

// Create context
const JournalContext = createContext<JournalContextType | null>(null);

// Props interface
interface JournalProviderProps {
  children: ReactNode;
}

// Pre-defined triggers for users to select
const DEFAULT_TRIGGERS: Trigger[] = [
  { id: 'trig-1', name: 'Stress', category: 'emotional' },
  { id: 'trig-2', name: 'After meals', category: 'situational' },
  { id: 'trig-3', name: 'Alcohol', category: 'physical' },
  { id: 'trig-4', name: 'Social gatherings', category: 'social' },
  { id: 'trig-5', name: 'Boredom', category: 'emotional' },
  { id: 'trig-6', name: 'Coffee/caffeine', category: 'physical' },
  { id: 'trig-7', name: 'Seeing others use nicotine', category: 'social' },
  { id: 'trig-8', name: 'Anxiety', category: 'emotional' },
  { id: 'trig-9', name: 'Driving', category: 'situational' },
  { id: 'trig-10', name: 'Morning routine', category: 'situational' },
];

// Pre-defined coping strategies for users to select
const DEFAULT_COPING_STRATEGIES = [
  { id: 'cop-1', name: 'Deep breathing' },
  { id: 'cop-2', name: 'Physical exercise' },
  { id: 'cop-3', name: 'Drinking water' },
  { id: 'cop-4', name: 'Nicotine replacement' },
  { id: 'cop-5', name: 'Distraction activity' },
  { id: 'cop-6', name: 'Calling a friend' },
  { id: 'cop-7', name: 'Meditation' },
  { id: 'cop-8', name: 'Going for a walk' },
  { id: 'cop-9', name: 'Chewing gum' },
  { id: 'cop-10', name: 'Reading' },
];

/**
 * JournalProvider component
 * Manages journal entries for tracking moods, cravings, triggers, and coping strategies
 */
export const JournalProvider: React.FC<JournalProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journal_entries', []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch entries - in a real app this would call an API
  const fetchEntries = async (): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we just simulate a delay and use the stored entries
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Entries are already loaded from localStorage via the useLocalStorage hook
      // This would be where we'd fetch from an API in a real application
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch journal entries'));
      console.error('Error fetching journal entries:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get a single entry by ID
  const getEntry = (id: string): JournalEntry | undefined => {
    return entries.find(entry => entry.id === id);
  };
  
  // Save a new journal entry
  const saveEntry = async (
    entryData: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<JournalEntry> => {
    if (!user) {
      throw new Error('User must be authenticated to save journal entries');
    }
    
    try {
      // Generate a new ID
      const id = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const timestamp = Date.now();
      
      // Create the new entry
      const newEntry: JournalEntry = {
        ...entryData,
        id,
        userId: user.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      // Add to entries
      setEntries(prevEntries => [newEntry, ...prevEntries]);
      
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save journal entry'));
      console.error('Error saving journal entry:', err);
      throw err;
    }
  };
  
  // Update an existing journal entry
  const updateEntry = async (id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> => {
    try {
      // Find the entry to update
      const existingEntry = getEntry(id);
      
      if (!existingEntry) {
        throw new Error(`Journal entry with ID ${id} not found`);
      }
      
      // Update the entry
      const updatedEntry: JournalEntry = {
        ...existingEntry,
        ...updates,
        updatedAt: Date.now(),
      };
      
      // Update in the entries array
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === id ? updatedEntry : entry
        )
      );
      
      return updatedEntry;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update journal entry'));
      console.error('Error updating journal entry:', err);
      throw err;
    }
  };
  
  // Delete a journal entry
  const deleteEntry = async (id: string): Promise<boolean> => {
    try {
      // Remove from entries
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete journal entry'));
      console.error('Error deleting journal entry:', err);
      return false;
    }
  };
  
  // Get all available triggers
  const getTriggers = (): Trigger[] => {
    return DEFAULT_TRIGGERS;
  };
  
  // Get all available coping strategies
  const getCopingStrategies = () => {
    return DEFAULT_COPING_STRATEGIES;
  };
  
  // Load entries when the user changes
  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      // Clear entries when user logs out
      setEntries([]);
    }
  }, [user]);
  
  // Context value
  const value: JournalContextType = {
    entries,
    isLoading,
    error,
    fetchEntries,
    getEntry,
    saveEntry,
    updateEntry,
    deleteEntry,
    getTriggers,
    getCopingStrategies,
  };
  
  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

/**
 * Hook to use the journal context
 */
export const useJournal = (): JournalContextType => {
  const context = useContext(JournalContext);
  
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  
  return context;
}; 