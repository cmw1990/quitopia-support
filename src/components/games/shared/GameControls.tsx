import { Button } from '@/components/ui/button';
import { RefreshCw, Undo, Redo, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { GameControls as GameControlsProps } from '@/types/boardGames';
import { motion } from 'framer-motion';

export const GameControls = ({
  onNewGame,
  onUndo,
  onRedo,
  difficulty,
  onDifficultyChange,
  className = '',
}: GameControlsProps) => {
  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button 
        onClick={onNewGame} 
        variant="outline" 
        size="sm"
        className="animate-pulse hover:animate-none"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        New Game
      </Button>
      
      {onUndo && (
        <Button 
          onClick={onUndo} 
          variant="outline" 
          size="sm"
          className="transition-opacity"
        >
          <Undo className="h-4 w-4 mr-2" />
          Undo
        </Button>
      )}
      
      {onRedo && (
        <Button 
          onClick={onRedo} 
          variant="outline" 
          size="sm"
          className="transition-opacity"
        >
          <Redo className="h-4 w-4 mr-2" />
          Redo
        </Button>
      )}

      {difficulty && onDifficultyChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Difficulty: {difficulty}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDifficultyChange('1')}>
              Easy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDifficultyChange('2')}>
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDifficultyChange('3')}>
              Hard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </motion.div>
  );
};