import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

// Define survey types
export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'text' | 'rating' | 'boolean';
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  questionId: string;
  value: string | number | boolean;
  timestamp: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  completedAt?: number;
  responses?: SurveyResponse[];
}

// Define context type
interface SurveyContextType {
  surveys: Survey[];
  activeSurvey: Survey | null;
  loadingSurveys: boolean;
  error: Error | null;
  fetchSurveys: () => Promise<void>;
  getSurvey: (id: string) => Survey | undefined;
  startSurvey: (id: string) => void;
  completeSurvey: (responses: SurveyResponse[]) => Promise<void>;
  dismissSurvey: () => void;
  isSurveyDue: (survey: Survey) => boolean;
}

// Create context with default values
const SurveyContext = createContext<SurveyContextType>({
  surveys: [],
  activeSurvey: null,
  loadingSurveys: false,
  error: null,
  fetchSurveys: async () => {},
  getSurvey: () => undefined,
  startSurvey: () => {},
  completeSurvey: async () => {},
  dismissSurvey: () => {},
  isSurveyDue: () => false,
});

// Provider props interface
interface SurveyProviderProps {
  children: ReactNode;
}

/**
 * SurveyProvider component
 * Manages surveys and user responses
 */
export const SurveyProvider: React.FC<SurveyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use local storage to persist completed surveys
  const [completedSurveys, setCompletedSurveys] = useLocalStorage<Record<string, number>>('completed_surveys', {});
  
  // Example survey data - in a real app, this would come from an API
  const mockSurveys: Survey[] = [
    {
      id: 'initial-assessment',
      title: 'Initial Nicotine Assessment',
      description: 'Help us understand your nicotine usage better.',
      questions: [
        {
          id: 'usage-frequency',
          text: 'How often do you use nicotine products?',
          type: 'multiple-choice',
          options: ['Daily', 'Multiple times per day', 'Weekly', 'Occasionally'],
          required: true,
        },
        {
          id: 'nicotine-products',
          text: 'What nicotine products do you currently use?',
          type: 'multiple-choice',
          options: ['Cigarettes', 'Vape', 'Gum', 'Patches', 'Lozenges', 'Other'],
          required: true,
        },
        {
          id: 'quit-attempts',
          text: 'How many times have you attempted to quit?',
          type: 'multiple-choice',
          options: ['Never', '1-2 times', '3-5 times', 'More than 5 times'],
          required: true,
        },
      ],
      frequency: 'once',
    },
    {
      id: 'weekly-progress',
      title: 'Weekly Progress Check',
      description: 'Let us know how your quit journey is going.',
      questions: [
        {
          id: 'craving-intensity',
          text: 'On a scale of 1-10, how intense are your cravings this week?',
          type: 'rating',
          required: true,
        },
        {
          id: 'nrt-effectiveness',
          text: 'How effective are the NRT products you\'re using?',
          type: 'multiple-choice',
          options: ['Very effective', 'Somewhat effective', 'Not effective', 'Not using NRT'],
          required: true,
        },
        {
          id: 'challenges',
          text: 'What challenges are you facing this week?',
          type: 'text',
          required: false,
        },
      ],
      frequency: 'weekly',
    },
  ];
  
  // Fetch surveys
  const fetchSurveys = async () => {
    if (!user) return;
    
    setLoadingSurveys(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we're just using mock data with a timeout to simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Apply completion data from local storage
      const surveysWithCompletionData = mockSurveys.map(survey => ({
        ...survey,
        completedAt: completedSurveys[survey.id] || undefined,
      }));
      
      setSurveys(surveysWithCompletionData);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch surveys'));
    } finally {
      setLoadingSurveys(false);
    }
  };
  
  // Get a single survey by ID
  const getSurvey = (id: string) => {
    return surveys.find(survey => survey.id === id);
  };
  
  // Start a survey
  const startSurvey = (id: string) => {
    const survey = getSurvey(id);
    if (survey) {
      setActiveSurvey(survey);
    }
  };
  
  // Complete a survey
  const completeSurvey = async (responses: SurveyResponse[]) => {
    if (!activeSurvey) return;
    
    try {
      // In a real app, this would send the responses to an API
      // For now, we're just updating local state
      
      // Mark survey as completed
      const now = Date.now();
      setCompletedSurveys(prev => ({
        ...prev,
        [activeSurvey.id]: now,
      }));
      
      // Update the surveys array
      setSurveys(prevSurveys => 
        prevSurveys.map(survey => 
          survey.id === activeSurvey.id 
            ? { ...survey, completedAt: now, responses } 
            : survey
        )
      );
      
      // Clear the active survey
      setActiveSurvey(null);
    } catch (err) {
      console.error('Error completing survey:', err);
      setError(err instanceof Error ? err : new Error('Failed to complete survey'));
      throw err;
    }
  };
  
  // Dismiss the current survey
  const dismissSurvey = () => {
    setActiveSurvey(null);
  };
  
  // Check if a survey is due based on frequency and last completion
  const isSurveyDue = (survey: Survey): boolean => {
    if (!survey.completedAt) return true;
    
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    switch (survey.frequency) {
      case 'once':
        return false; // Once completed, never due again
      case 'daily':
        return now - survey.completedAt > dayInMs;
      case 'weekly':
        return now - survey.completedAt > 7 * dayInMs;
      case 'monthly':
        return now - survey.completedAt > 30 * dayInMs;
      default:
        return false;
    }
  };
  
  // Load surveys when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchSurveys();
    } else {
      setSurveys([]);
      setActiveSurvey(null);
    }
  }, [user]);
  
  const value: SurveyContextType = {
    surveys,
    activeSurvey,
    loadingSurveys,
    error,
    fetchSurveys,
    getSurvey,
    startSurvey,
    completeSurvey,
    dismissSurvey,
    isSurveyDue,
  };
  
  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
};

/**
 * Hook to use the survey context
 */
export const useSurveys = (): SurveyContextType => {
  const context = useContext(SurveyContext);
  
  if (!context) {
    throw new Error('useSurveys must be used within a SurveyProvider');
  }
  
  return context;
}; 