import React from 'react';
import { Brain, Activity, Heart, Ear } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FatigueTypeProps {
  type: 'mental' | 'physical' | 'emotional' | 'sensory';
  level?: number;
  showDescription?: boolean;
  className?: string;
  compact?: boolean;
}

export const FatigueTypes: React.FC<FatigueTypeProps> = ({
  type,
  level,
  showDescription = true,
  className = '',
  compact = false,
}) => {
  const getTypeDetails = () => {
    switch (type) {
      case 'mental':
        return {
          title: 'Mental Fatigue',
          icon: <Brain className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-indigo-500`} />,
          color: 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800',
          textColor: 'text-indigo-700 dark:text-indigo-300',
          badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
          description: 'Cognitive exhaustion from tasks requiring sustained attention, decision-making, or information processing.',
          symptoms: ['Difficulty concentrating', 'Forgetfulness', 'Slower thinking', 'Increased distractibility'],
        };
      case 'physical':
        return {
          title: 'Physical Fatigue',
          icon: <Activity className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-emerald-500`} />,
          color: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800',
          textColor: 'text-emerald-700 dark:text-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
          description: 'Bodily exhaustion affecting muscles, energy levels, and physical capabilities.',
          symptoms: ['Heavy limbs', 'Tiredness', 'Low energy', 'Need for rest'],
        };
      case 'emotional':
        return {
          title: 'Emotional Fatigue',
          icon: <Heart className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-rose-500`} />,
          color: 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800',
          textColor: 'text-rose-700 dark:text-rose-300',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
          description: 'Emotional drain from high-intensity feelings, conflicts, or emotional labor.',
          symptoms: ['Feeling overwhelmed', 'Irritability', 'Reduced patience', 'Emotional numbness'],
        };
      case 'sensory':
        return {
          title: 'Sensory Fatigue',
          icon: <Ear className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-amber-500`} />,
          color: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
          textColor: 'text-amber-700 dark:text-amber-300',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
          description: 'Exhaustion from sensory overload, excessive inputs, and processing environmental stimuli.',
          symptoms: ['Heightened sensitivity', 'Desire to withdraw', 'Irritation at sounds/lights', 'Need for quiet'],
        };
      default:
        return {
          title: 'Unknown Fatigue Type',
          icon: <Brain className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />,
          color: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          description: 'Undefined type of fatigue.',
          symptoms: [],
        };
    }
  };

  const typeDetails = getTypeDetails();

  // Compact view - just showing the icon and label
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {typeDetails.icon}
        <span className={`text-sm font-medium ${typeDetails.textColor}`}>{typeDetails.title}</span>
        {level !== undefined && (
          <Badge variant="outline" className={typeDetails.badge}>
            {level}/10
          </Badge>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <Card className={`border-l-4 ${typeDetails.color} ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {typeDetails.icon}
            <CardTitle className="text-lg">{typeDetails.title}</CardTitle>
          </div>
          {level !== undefined && (
            <Badge variant="outline" className={typeDetails.badge}>
              Level: {level}/10
            </Badge>
          )}
        </div>
        {showDescription && (
          <CardDescription>{typeDetails.description}</CardDescription>
        )}
      </CardHeader>
      {showDescription && (
        <CardContent>
          <div className="text-sm">
            <div className="font-medium mb-1">Common Symptoms:</div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {typeDetails.symptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Composite component to show all fatigue types
interface FatigueTypesGridProps {
  mentalLevel?: number;
  physicalLevel?: number;
  emotionalLevel?: number;
  sensoryLevel?: number;
  showDescriptions?: boolean;
  compact?: boolean;
  className?: string;
}

export const FatigueTypesGrid: React.FC<FatigueTypesGridProps> = ({
  mentalLevel,
  physicalLevel,
  emotionalLevel,
  sensoryLevel,
  showDescriptions = true,
  compact = false,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <FatigueTypes 
        type="mental" 
        level={mentalLevel} 
        showDescription={showDescriptions} 
        compact={compact} 
      />
      <FatigueTypes 
        type="physical" 
        level={physicalLevel} 
        showDescription={showDescriptions} 
        compact={compact} 
      />
      <FatigueTypes 
        type="emotional" 
        level={emotionalLevel} 
        showDescription={showDescriptions} 
        compact={compact} 
      />
      <FatigueTypes 
        type="sensory" 
        level={sensoryLevel} 
        showDescription={showDescriptions} 
        compact={compact} 
      />
    </div>
  );
};

export default FatigueTypes; 