import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Trophy } from 'lucide-react';
import type { GameStatus as GameStatusType } from '@/types/boardGames';
import { motion } from 'framer-motion';

interface GameStatusProps {
  status: GameStatusType;
  winner?: string | null;
  currentPlayer: string;
  score?: {
    black: number;
    white: number;
  };
}

export const GameStatus = ({ status, winner, currentPlayer, score }: GameStatusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'not_started' && (
              <>
                <AlertCircle className="text-yellow-500 animate-pulse" />
                <span>Game not started</span>
              </>
            )}
            {status === 'in_progress' && (
              <>
                <Loader2 className="animate-spin text-blue-500" />
                <span>Current player: <span className="font-semibold">{currentPlayer}</span></span>
              </>
            )}
            {status === 'completed' && (
              <>
                {winner ? (
                  <>
                    <Trophy className="text-yellow-500 animate-bounce" />
                    <span className="font-semibold">{winner} wins!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="text-green-500" />
                    <span>Game ended in a draw</span>
                  </>
                )}
              </>
            )}
          </div>
          {score && (
            <div className="flex gap-4">
              <div>Black: {score.black}</div>
              <div>White: {score.white}</div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};