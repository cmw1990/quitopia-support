export type GameType = 'chess' | 'go' | 'checkers' | 'reversi' | 'xiangqi' | 'shogi' | 'gomoku' | 'connect_four' | 'tic_tac_toe' | 'pattern_recognition' | 'brain_match' | 'n_back' | 'stroop_test' | 'digit_span' | 'mental_rotation' | 'word_pairs' | 'reaction_time';
export type GameStatus = 'not_started' | 'in_progress' | 'completed';
export type Player = 'black' | 'white' | 'red';

export interface BaseGameState {
  currentPlayer: Player;
  status: GameStatus;
  winner: string | null;
}

export interface GameMove {
  [key: string]: any; // Add index signature for JSON compatibility
  from?: [number, number];
  to: [number, number];
  piece?: string;
  capture?: string;
  promotion?: boolean;
  notation: string;
}

export interface BoardProps {
  rows: number;
  cols: number;
  board: Array<Array<any>>;
  onCellClick: (row: number, col: number) => void;
  selectedPosition?: [number, number] | null;
  validMoves?: [number, number][];
  lastMove?: [number, number];
  renderCell: (row: number, col: number) => React.ReactNode;
  className?: string;
}

export interface GameControls {
  onNewGame: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  difficulty?: string;
  onDifficultyChange?: (value: string) => void;
  className?: string;
}

export interface CheckersState extends BaseGameState {
  board: number[][];
  captures: {
    black: number;
    white: number;
  };
  kings: number[][];
}

export interface ReversiState extends BaseGameState {
  board: number[][];
  scores: {
    black: number;
    white: number;
  };
  validMoves: [number, number][];
}

export interface GoState extends BaseGameState {
  board: string[][];
  captures: {
    black: number;
    white: number;
  };
}

export interface XiangqiState extends BaseGameState {
  board: Array<Array<{
    type: string;
    color: 'red' | 'black';
  } | null>>;
  moveHistory: GameMove[];
  capturedPieces: {
    red: Array<{ type: string; color: 'red' | 'black' }>;
    black: Array<{ type: string; color: 'red' | 'black' }>;
  };
}

export interface ShogiState extends BaseGameState {
  board: Array<Array<{
    type: string;
    color: 'black' | 'white';
    promoted: boolean;
  } | null>>;
  moveHistory: GameMove[];
  capturedPieces: {
    black: Array<{ type: string; color: 'black' | 'white'; promoted: boolean }>;
    white: Array<{ type: string; color: 'black' | 'white'; promoted: boolean }>;
  };
}

export interface GomokuState extends BaseGameState {
  board: string[][];
}

export interface ConnectFourState extends BaseGameState {
  board: number[][];
}