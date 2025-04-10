import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PatternGridProps {
  pattern: number[];
  userPattern: number[];
  isShowingPattern: boolean;
  onCellClick: (index: number) => void;
}

export const PatternGrid = ({
  pattern,
  userPattern,
  isShowingPattern,
  onCellClick,
}: PatternGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
      {Array(9)
        .fill(0)
        .map((_, index) => (
          <motion.button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={isShowingPattern}
            className={cn(
              "w-full aspect-square rounded-lg transition-colors",
              "disabled:cursor-not-allowed",
              pattern.includes(index) && isShowingPattern
                ? "bg-primary"
                : userPattern.includes(index)
                ? "bg-secondary"
                : "bg-muted hover:bg-muted/80"
            )}
            whileTap={{ scale: 0.95 }}
          />
        ))}
    </div>
  );
};