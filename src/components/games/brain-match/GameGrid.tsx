import { Button } from "@/components/ui/button";
import { TileType } from "./types";

interface GameGridProps {
  grid: TileType[];
  onTileClick: (index: number) => void;
  isSubmitting: boolean;
}

export const GameGrid = ({ grid, onTileClick, isSubmitting }: GameGridProps) => {
  return (
    <div className="grid grid-cols-8 gap-2 mb-6">
      {grid.map((tile, index) => (
        <Button
          key={tile.id}
          onClick={() => onTileClick(index)}
          variant={tile.selected ? "default" : "outline"}
          className={`h-12 text-lg transition-all ${
            tile.matched ? 'opacity-0' : ''
          }`}
          disabled={tile.matched || isSubmitting}
        >
          {tile.value}
        </Button>
      ))}
    </div>
  );
};