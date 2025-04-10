import { cn } from '@/lib/utils';
import type { BoardProps } from '@/types/boardGames';
import { motion } from 'framer-motion';

export const GameBoard = ({
  rows,
  cols,
  board,
  onCellClick,
  selectedPosition,
  validMoves = [],
  lastMove,
  renderCell,
  className = '',
}: BoardProps) => {
  const isHighlighted = (row: number, col: number) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove && lastMove[0] === row && lastMove[1] === col;
  };

  const isSelected = (row: number, col: number) => {
    return selectedPosition && selectedPosition[0] === row && selectedPosition[1] === col;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("relative w-full aspect-square", className)}
    >
      <div 
        className={cn(
          "grid gap-0.5 bg-gray-700 p-0.5 absolute inset-0 rounded-lg shadow-lg",
          `grid-cols-${cols}`
        )}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "relative transition-colors duration-200",
                "hover:bg-opacity-90 cursor-pointer",
                isSelected(rowIndex, colIndex) && "ring-2 ring-blue-400",
                isHighlighted(rowIndex, colIndex) && "ring-2 ring-green-400",
                isLastMove(rowIndex, colIndex) && "ring-2 ring-yellow-400"
              )}
              onClick={() => onCellClick(rowIndex, colIndex)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {renderCell(rowIndex, colIndex)}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};