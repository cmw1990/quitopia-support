import { useState, useEffect } from "react";
import { TileType } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";

const GRID_SIZE = 8;
const TILE_TYPES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '×'];

export const useGameLogic = () => {
  const { toast } = useToast();
  const [grid, setGrid] = useState<TileType[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeGrid = () => {
    const newGrid: TileType[] = [];
    const numbers = [...TILE_TYPES];
    
    // Ensure we have enough operators and numbers for valid combinations
    let operatorCount = 0;
    let numberCount = 0;
    
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const remainingSpaces = GRID_SIZE * GRID_SIZE - i;
      const needMoreOperators = operatorCount < Math.floor((GRID_SIZE * GRID_SIZE) / 3);
      const needMoreNumbers = numberCount < (GRID_SIZE * GRID_SIZE * 2) / 3;
      
      let value;
      if (needMoreOperators && (!needMoreNumbers || Math.random() < 0.3)) {
        value = ['+', '-', '×'][Math.floor(Math.random() * 3)];
        operatorCount++;
      } else {
        value = numbers[Math.floor(Math.random() * 9)]; // Only use numbers 1-9
        numberCount++;
      }
      
      newGrid.push({
        id: i,
        value,
        matched: false,
        selected: false
      });
    }
    
    setGrid(newGrid);
    setSelectedTiles([]);
    setScore(0);
    setGameOver(false);
  };

  const checkMathematicalMatch = (values: string[]) => {
    const sorted = [...values].sort();
    const hasOperator = sorted.some(v => ['+', '-', '×'].includes(v));
    const numbers = sorted.filter(v => !isNaN(Number(v)));
    
    if (!hasOperator || numbers.length !== 2) return false;
    
    const operator = values.find(v => ['+', '-', '×'].includes(v));
    const nums = values.filter(v => !isNaN(Number(v))).map(Number);
    
    let result = 0;
    switch(operator) {
      case '+': result = nums[0] + nums[1]; break;
      case '-': result = Math.max(...nums) - Math.min(...nums); break;
      case '×': result = nums[0] * nums[1]; break;
    }
    
    return result % 3 === 0;
  };

  const dropNewTiles = async (matchedIndices: number[]) => {
    const newGrid = [...grid];
    
    for (let col = 0; col < GRID_SIZE; col++) {
      let emptySpaces = 0;
      
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        const index = row * GRID_SIZE + col;
        
        if (matchedIndices.includes(index)) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          const newIndex = (row + emptySpaces) * GRID_SIZE + col;
          newGrid[newIndex] = { ...newGrid[index] };
          newGrid[index] = {
            id: index,
            value: TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
            matched: false,
            selected: false
          };
        }
      }
      
      for (let i = 0; i < emptySpaces; i++) {
        const index = i * GRID_SIZE + col;
        newGrid[index] = {
          id: index,
          value: TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
          matched: false,
          selected: false
        };
      }
    }
    
    setGrid(newGrid);

    // Save score to Supabase
    try {
      const { error } = await supabase
        .from('board_games')
        .insert({
          game_type: 'brain_match',
          score: score,
          game_state: { grid: newGrid },
          difficulty_level: 1,
        });

      if (error) {
        console.error('Error saving score:', error);
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleTileClick = (index: number) => {
    if (grid[index].matched || selectedTiles.includes(index)) return;

    const newGrid = [...grid];
    const newSelectedTiles = [...selectedTiles, index];
    newGrid[index].selected = true;
    setGrid(newGrid);
    setSelectedTiles(newSelectedTiles);

    if (newSelectedTiles.length === 3) {
      const values = newSelectedTiles.map(i => grid[i].value);
      const isValidMatch = checkMathematicalMatch(values);
      
      if (isValidMatch) {
        newSelectedTiles.forEach(i => {
          newGrid[i].matched = true;
          newGrid[i].selected = false;
        });
        
        const newScore = score + 10;
        setScore(newScore);
        setTimeout(() => dropNewTiles(newSelectedTiles), 300);
        
        toast({
          title: "Match found!",
          description: `Great mathematical thinking! Score: ${newScore}`,
        });
      } else {
        newSelectedTiles.forEach(i => {
          newGrid[i].selected = false;
        });
        
        toast({
          title: "Not a match",
          description: "Try finding numbers that make a multiple of 3",
          variant: "destructive",
        });
      }
      
      setGrid(newGrid);
      setSelectedTiles([]);
    }
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  return {
    grid,
    score,
    selectedTiles,
    gameOver,
    initializeGrid,
    handleTileClick
  };
};