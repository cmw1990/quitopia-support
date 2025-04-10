import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

type Board = number[][];
type Move = {
  row: number;
  col: number;
  oldValue: number;
  newValue: number;
};

const generateSudoku = (difficulty: string): [Board, Board] => {
  // Initialize empty board
  const board: Board = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill diagonal boxes
  for (let box = 0; box < 9; box += 3) {
    fillBox(board, box, box);
  }
  
  // Fill remaining cells
  solveSudoku(board);
  
  // Create solution copy
  const solution: Board = board.map(row => [...row]);
  
  // Remove numbers based on difficulty
  const cellsToRemove = {
    easy: 30,
    medium: 40,
    hard: 50
  }[difficulty] || 30;
  
  removeNumbers(board, cellsToRemove);
  
  return [board, solution];
};

const fillBox = (board: Board, row: number, col: number) => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const randomIndex = Math.floor(Math.random() * nums.length);
      board[row + i][col + j] = nums[randomIndex];
      nums.splice(randomIndex, 1);
    }
  }
};

const solveSudoku = (board: Board): boolean => {
  const emptyCell = findEmptyCell(board);
  if (!emptyCell) return true;
  
  const [row, col] = emptyCell;
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) return true;
      board[row][col] = 0;
    }
  }
  return false;
};

const findEmptyCell = (board: Board): [number, number] | false => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return [row, col];
    }
  }
  return false;
};

const isValid = (board: Board, row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Check box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true;
};

const removeNumbers = (board: Board, count: number) => {
  let removed = 0;
  while (removed < count) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      removed++;
    }
  }
};

export const useSudokuGame = () => {
  const { toast } = useToast();
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [difficulty, setDifficulty] = useState("easy");
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const initializeGame = useCallback(() => {
    const [newBoard, newSolution] = generateSudoku(difficulty);
    setBoard(newBoard);
    setSolution(newSolution);
    setMoves([]);
    setCurrentMove(-1);
    setScore(0);
    setTimeElapsed(0);
    setIsComplete(false);
    setGameStarted(true);
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !isComplete) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, isComplete]);

  const handleCellChange = (row: number, col: number, value: number) => {
    if (isComplete) return;

    const newBoard = board.map(r => [...r]);
    const oldValue = newBoard[row][col];
    newBoard[row][col] = value;
    
    const newMove = { row, col, oldValue, newValue: value };
    const newMoves = [...moves.slice(0, currentMove + 1), newMove];
    
    setBoard(newBoard);
    setMoves(newMoves);
    setCurrentMove(currentMove + 1);
  };

  const checkSolution = () => {
    const isSolved = board.every((row, i) =>
      row.every((cell, j) => cell === solution[i][j])
    );

    if (isSolved) {
      const baseScore = 1000;
      const timeMultiplier = Math.max(0, 1 - timeElapsed / 600); // 10 minutes max
      const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2
      }[difficulty] || 1;
      
      const finalScore = Math.round(baseScore * timeMultiplier * difficultyMultiplier);
      
      setScore(finalScore);
      setIsComplete(true);
      toast({
        title: "Congratulations!",
        description: "You've solved the puzzle!",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Keep trying!",
        variant: "destructive",
      });
    }
  };

  const undoMove = () => {
    if (currentMove >= 0) {
      const move = moves[currentMove];
      const newBoard = board.map(r => [...r]);
      newBoard[move.row][move.col] = move.oldValue;
      setBoard(newBoard);
      setCurrentMove(currentMove - 1);
    }
  };

  const redoMove = () => {
    if (currentMove < moves.length - 1) {
      const move = moves[currentMove + 1];
      const newBoard = board.map(r => [...r]);
      newBoard[move.row][move.col] = move.newValue;
      setBoard(newBoard);
      setCurrentMove(currentMove + 1);
    }
  };

  return {
    board,
    solution,
    difficulty,
    moves,
    score,
    timeElapsed,
    isComplete,
    setDifficulty,
    handleCellChange,
    checkSolution,
    newGame: initializeGame,
    undoMove,
    redoMove,
  };
};