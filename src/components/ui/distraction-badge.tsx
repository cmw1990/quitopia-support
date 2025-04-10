import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface DistractionBadgeProps {
  count: number;
  intensity: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

export const DistractionBadge = ({ count, intensity, onClick }: DistractionBadgeProps) => {
  const getIntensityColor = () => {
    switch (intensity) {
      case 'low': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'medium': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getIntensityColor()} transition-colors`}
    >
      <AlertCircle className="w-4 h-4" />
      <span className="font-medium">{count}</span>
      {count > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"
        />
      )}
    </motion.button>
  );
};
