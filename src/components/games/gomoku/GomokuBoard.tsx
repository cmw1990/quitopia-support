import React from 'react';
import { cn } from "@/lib/utils";
import type { GomokuState } from './types';

interface Props {
  board: GomokuState['board'];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: string;
  isValidMove: (row: number, col: number) => boolean;
}

const GomokuBoard: React.FC<Props> = ({
  board,
  onCellClick,
  currentPlayer,
  isValidMove,
}) => {
  return (
    <div className="aspect-square w-full bg-yellow-100 relative">
      <div className={`grid grid-cols-${board.length} grid-rows-${board.length} absolute inset-0`}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "border border-black relative",
                cell === 'black' && "bg-black rounded-full",
                cell === 'white' && "bg-white rounded-full border-2",
                !cell && isValidMove(rowIndex, colIndex) && "hover:bg-gray-300"
              )}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={!isValidMove(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GomokuBoard;