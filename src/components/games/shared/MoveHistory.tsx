import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GameMove } from '@/types/boardGames';
import { motion } from 'framer-motion';

interface MoveHistoryProps {
  moves: GameMove[];
  className?: string;
}

export const MoveHistory = ({ moves, className = '' }: MoveHistoryProps) => {
  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        Move History
      </h3>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <motion.div 
          className="space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {moves.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">
              No moves yet
            </div>
          ) : (
            moves.map((move, index) => (
              <motion.div 
                key={index} 
                className="text-sm hover:bg-accent p-1 rounded-sm transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {index + 1}. {move.notation}
              </motion.div>
            ))
          )}
        </motion.div>
      </ScrollArea>
    </Card>
  );
};