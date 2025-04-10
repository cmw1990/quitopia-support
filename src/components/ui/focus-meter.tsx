import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap } from 'lucide-react';

interface FocusMeterProps {
  value: number;
  maxValue: number;
  streakCount: number;
  flowState: 'building' | 'flowing' | 'declining' | 'resting';
  showStreak?: boolean;
}

export const FocusMeter = ({ value, maxValue, streakCount, flowState, showStreak = true }: FocusMeterProps) => {
  const percentage = (value / maxValue) * 100;

  const getFlowStateColor = () => {
    switch (flowState) {
      case 'flowing': return 'from-green-500 to-blue-500';
      case 'building': return 'from-yellow-500 to-green-500';
      case 'declining': return 'from-orange-500 to-red-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getFlowStateIcon = () => {
    switch (flowState) {
      case 'flowing': return <Zap className="w-5 h-5 text-green-500" />;
      case 'building': return <Brain className="w-5 h-5 text-yellow-500" />;
      case 'declining': return <Brain className="w-5 h-5 text-orange-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-2">
        {getFlowStateIcon()}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium capitalize">{flowState} Focus</span>
            <span className="text-sm text-gray-500">{value}/{maxValue}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getFlowStateColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>

      {showStreak && streakCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400"
        >
          <div className="flex gap-1">
            {Array.from({ length: Math.min(streakCount, 5) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-2 h-2 rounded-full bg-purple-500"
              />
            ))}
          </div>
          <span className="font-medium">{streakCount} Focus Streak!</span>
        </motion.div>
      )}

      {flowState === 'flowing' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
        />
      )}
    </div>
  );
};
