export type GomokuVariant = 'standard' | 'swap2' | 'renju' | 'freestyle' | 'pro';
export type BoardSize = 13 | 15 | 17 | 19;
export type Player = 'black' | 'white';

export interface GomokuState {
  board: Array<Array<string>>;
  currentPlayer: Player;
  status: 'in_progress' | 'completed';
  winner: string | null;
  variant: GomokuVariant;
  boardSize: BoardSize;
  moveHistory: Array<[number, number]>;
  isSwap2Phase?: boolean;
  swap2Moves?: Array<[number, number]>;
}

export interface GomokuSettings {
  variant: GomokuVariant;
  boardSize: BoardSize;
  difficulty: string;
}