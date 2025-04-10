import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerInfoProps {
  currentPlayer: string;
  score?: number;
  isWinner?: boolean;
  className?: string;
}

export const PlayerInfo = ({ currentPlayer, score, isWinner, className = '' }: PlayerInfoProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 ${className} ${isWinner ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              className={`w-3 h-3 rounded-full ${
                currentPlayer === 'black' ? 'bg-black' : 
                currentPlayer === 'white' ? 'bg-white border border-gray-300' :
                'bg-red-500'
              }`}
              animate={{
                scale: [1, 1.2, 1],
                transition: { duration: 1, repeat: Infinity }
              }}
            />
            <span className="font-medium">{currentPlayer}</span>
          </div>
          {score !== undefined && (
            <span className="text-sm text-muted-foreground">
              Score: {score}
            </span>
          )}
          {isWinner && (
            <motion.div 
              className="flex items-center gap-1 text-sm font-medium text-yellow-600 dark:text-yellow-400"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Trophy className="h-4 w-4" />
              Winner!
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};