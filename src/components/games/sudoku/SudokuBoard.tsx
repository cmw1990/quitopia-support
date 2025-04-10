import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SudokuBoardProps {
  board: number[][];
  solution: number[][];
  onCellChange: (row: number, col: number, value: number) => void;
  isComplete: boolean;
}

export const SudokuBoard = ({
  board,
  solution,
  onCellChange,
  isComplete,
}: SudokuBoardProps) => {
  const handleInputChange = (
    row: number,
    col: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value === "" || /^[1-9]$/.test(value)) {
      onCellChange(row, col, value === "" ? 0 : parseInt(value));
    }
  };

  return (
    <div className="grid grid-cols-9 gap-1 max-w-2xl mx-auto">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Input
            key={`${rowIndex}-${colIndex}`}
            type="text"
            value={cell === 0 ? "" : cell.toString()}
            onChange={(e) => handleInputChange(rowIndex, colIndex, e)}
            className={cn(
              "w-10 h-10 text-center p-0",
              (rowIndex + 1) % 3 === 0 && "mb-1",
              (colIndex + 1) % 3 === 0 && "mr-1",
              solution[rowIndex][colIndex] !== 0 && "bg-muted",
              isComplete && "bg-green-100 dark:bg-green-900"
            )}
            disabled={solution[rowIndex][colIndex] !== 0 || isComplete}
          />
        ))
      )}
    </div>
  );
};