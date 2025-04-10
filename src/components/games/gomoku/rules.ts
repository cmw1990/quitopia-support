import type { GomokuState, Player } from './types';

const WIN_LENGTH = 5;

export const checkWin = (row: number, col: number, board: string[][]): boolean => {
  const directions = [
    [1, 0],   // horizontal
    [0, 1],   // vertical
    [1, 1],   // diagonal right
    [1, -1],  // diagonal left
  ];
  
  const color = board[row][col];
  
  for (const [dx, dy] of directions) {
    let count = 1;
    
    // Check in positive direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const newRow = row + dx * i;
      const newCol = col + dy * i;
      if (
        newRow < 0 || newRow >= board.length || 
        newCol < 0 || newCol >= board.length ||
        board[newRow][newCol] !== color
      ) break;
      count++;
    }
    
    // Check in negative direction
    for (let i = 1; i < WIN_LENGTH; i++) {
      const newRow = row - dx * i;
      const newCol = col - dy * i;
      if (
        newRow < 0 || newRow >= board.length || 
        newCol < 0 || newCol >= board.length ||
        board[newRow][newCol] !== color
      ) break;
      count++;
    }
    
    if (count >= WIN_LENGTH) return true;
  }
  
  return false;
};

const checkPattern = (
  row: number,
  col: number,
  board: string[][],
  pattern: string[],
  dx: number,
  dy: number
): boolean => {
  const color = board[row][col];
  const patternLength = pattern.length;
  
  for (let i = 0; i < patternLength; i++) {
    const newRow = row + dx * i;
    const newCol = col + dy * i;
    
    if (
      newRow < 0 || newRow >= board.length ||
      newCol < 0 || newCol >= board.length ||
      (pattern[i] === '1' && board[newRow][newCol] !== color) ||
      (pattern[i] === '0' && board[newRow][newCol] === color)
    ) {
      return false;
    }
  }
  
  return true;
};

const hasDoubleThree = (row: number, col: number, board: string[][]): boolean => {
  const patterns = [
    '01110', // open four
    '011010', // broken four
    '010110', // broken four
  ];
  
  const directions = [
    [1, 0],   // horizontal
    [0, 1],   // vertical
    [1, 1],   // diagonal right
    [1, -1],  // diagonal left
  ];
  
  let threeCount = 0;
  
  for (const pattern of patterns) {
    for (const [dx, dy] of directions) {
      if (checkPattern(row, col, board, pattern.split(''), dx, dy)) {
        threeCount++;
        if (threeCount >= 2) return true;
      }
    }
  }
  
  return false;
};

const hasDoubleFour = (row: number, col: number, board: string[][]): boolean => {
  const patterns = [
    '011110', // open four
    '011112', // closed four
    '211110', // closed four
  ];
  
  const directions = [
    [1, 0],   // horizontal
    [0, 1],   // vertical
    [1, 1],   // diagonal right
    [1, -1],  // diagonal left
  ];
  
  let fourCount = 0;
  
  for (const pattern of patterns) {
    for (const [dx, dy] of directions) {
      if (checkPattern(row, col, board, pattern.split(''), dx, dy)) {
        fourCount++;
        if (fourCount >= 2) return true;
      }
    }
  }
  
  return false;
};

export const isValidMove = (
  row: number,
  col: number,
  state: GomokuState,
): boolean => {
  if (state.board[row][col] !== '') return false;
  
  if (state.variant === 'pro' && state.currentPlayer === 'black') {
    if (hasDoubleThree(row, col, state.board)) return false;
    if (hasDoubleFour(row, col, state.board)) return false;
  }
  
  return true;
};

export const handleSwap2Move = (
  row: number,
  col: number,
  state: GomokuState,
): GomokuState => {
  const newState = { ...state };
  
  if (!state.isSwap2Phase) {
    return newState;
  }
  
  const swap2Moves = state.swap2Moves || [];
  
  if (swap2Moves.length < 3) {
    // First three moves of Swap2 opening
    newState.board[row][col] = 'black';
    newState.swap2Moves = [...swap2Moves, [row, col]];
    if (newState.swap2Moves.length === 3) {
      newState.currentPlayer = 'white'; // White chooses to swap or continue
    }
  } else {
    // White's decision phase
    newState.isSwap2Phase = false;
    newState.swap2Moves = undefined;
    newState.currentPlayer = 'black';
    // Implement the actual swap logic here based on white's choice
  }
  
  return newState;
};