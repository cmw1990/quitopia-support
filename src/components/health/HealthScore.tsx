import React from 'react';
import { Session } from '@supabase/supabase-js';
import { Heart } from 'lucide-react';

interface HealthScoreProps {
  userId: string;
  session: Session | null;
  score: number;
  change?: number;
  showLabel?: boolean;
}

export const HealthScore: React.FC<HealthScoreProps> = ({
  userId,
  session,
  score,
  change = 0,
  showLabel = true,
}) => {
  // Calculate the stroke dasharray and dashoffset to create the circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const dashoffset = circumference * (1 - progress);
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Get background color based on text color
  const getBgColor = () => {
    return getColor().replace('text-', 'bg-').replace('500', '100');
  };
  
  // Get health status label
  const getLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            className={getColor()}
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Heart className={`h-6 w-6 ${getColor()} mb-1`} />
          <span className="text-2xl font-bold">{score}</span>
          {change !== 0 && (
            <span className={`text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-2 text-center">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBgColor()} ${getColor()}`}>
            {getLabel()}
          </span>
        </div>
      )}
    </div>
  );
}; 