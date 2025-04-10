import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sun, Thermometer } from 'lucide-react';

interface EnvironmentStatusProps {
  noise: 'low' | 'moderate' | 'high';
  lighting: 'dark' | 'dim' | 'bright';
  temperature: 'cold' | 'moderate' | 'warm';
  className?: string;
  showLabels?: boolean;
  onStatusClick?: (type: 'noise' | 'lighting' | 'temperature') => void;
}

export const EnvironmentStatus = ({ 
  noise, 
  lighting, 
  temperature,
  className = '',
  showLabels = true,
  onStatusClick
}: EnvironmentStatusProps) => {
  
  const getStatusColor = (level: string, type: 'noise' | 'lighting' | 'temperature') => {
    const colors = {
      noise: {
        low: 'text-green-500',
        moderate: 'text-yellow-500',
        high: 'text-red-500'
      },
      lighting: {
        dark: 'text-purple-500',
        dim: 'text-yellow-500',
        bright: 'text-blue-500'
      },
      temperature: {
        cold: 'text-blue-500',
        moderate: 'text-green-500',
        warm: 'text-orange-500'
      }
    };

    return colors[type][level as keyof typeof colors[typeof type]] || 'text-gray-500';
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onStatusClick?.('noise')}
        className="flex flex-col items-center gap-1"
      >
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getStatusColor(noise, 'noise')}`}>
          <Volume2 className="w-5 h-5" />
        </div>
        {showLabels && (
          <span className="text-xs font-medium capitalize">{noise}</span>
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onStatusClick?.('lighting')}
        className="flex flex-col items-center gap-1"
      >
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getStatusColor(lighting, 'lighting')}`}>
          <Sun className="w-5 h-5" />
        </div>
        {showLabels && (
          <span className="text-xs font-medium capitalize">{lighting}</span>
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onStatusClick?.('temperature')}
        className="flex flex-col items-center gap-1"
      >
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getStatusColor(temperature, 'temperature')}`}>
          <Thermometer className="w-5 h-5" />
        </div>
        {showLabels && (
          <span className="text-xs font-medium capitalize">{temperature}</span>
        )}
      </motion.button>

      {/* Environment Score Indicator */}
      {(noise === 'low' && lighting === 'bright' && temperature === 'moderate') && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        </motion.div>
      )}
    </div>
  );
};
