import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ReversiState, GameStatus, GameType, Player } from '@/types/boardGames';
import type { Json } from '@/integrations/supabase/types';

const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export const ReversiGame = () => {
  const { session } = useAuth();
  const [gameState, setGameState] = useState<ReversiState | null>(null);
  const [difficulty, setDifficulty] = useState('1');

  const initializeBoard = (): number[][] => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    // Set up initial pieces
    const mid = BOARD_SIZE / 2;
    board[mid - 1][mid - 1] = 2; // White
    board[mid - 1][mid] = 1; // Black
    board[mid][mid - 1] = 1; // Black
    board[mid][mid] = 2; // White
    return board;
  };

  const getValidMoves = (board: number[][], player: Player): [number, number][] => {
    const playerNum = player === 'black' ? 1 : 2;
    const moves: [number, number][] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== 0) continue;
        
        for (const [dx, dy] of DIRECTIONS) {
          let x = row + dx;
          let y = col + dy;
          let foundOpponent = false;
          
          while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
            if (board[x][y] === 0) break;
            if (board[x][y] === playerNum) {
              if (foundOpponent) {
                moves.push([row, col]);
                break;
              }
              break;
            }
            foundOpponent = true;
            x += dx;
            y += dy;
          }
          if (moves.some(([r, c]) => r === row && c === col)) break;
        }
      }
    }
    return moves;
  };

  const flipPieces = (board: number[][], row: number, col: number, player: Player): number[][] => {
    const playerNum = player === 'black' ? 1 : 2;
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = playerNum;

    for (const [dx, dy] of DIRECTIONS) {
      let x = row + dx;
      let y = col + dy;
      const piecesToFlip: [number, number][] = [];

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        if (board[x][y] === 0) break;
        if (board[x][y] === playerNum) {
          piecesToFlip.forEach(([r, c]) => {
            newBoard[r][c] = playerNum;
          });
          break;
        }
        piecesToFlip.push([x, y]);
        x += dx;
        y += dy;
      }
    }
    return newBoard;
  };

  const calculateScores = (board: number[][]): { black: number; white: number } => {
    let black = 0, white = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (cell === 1) black++;
        if (cell === 2) white++;
      });
    });
    return { black, white };
  };

  const checkGameOver = (board: number[][], currentPlayer: Player): boolean => {
    const opponent: Player = currentPlayer === 'black' ? 'white' : 'black';
    return getValidMoves(board, currentPlayer).length === 0 && 
           getValidMoves(board, opponent).length === 0;
  };

  const startNewGame = async () => {
    const board = initializeBoard();
    const initialGameState: ReversiState = {
      board,
      currentPlayer: 'black',
      scores: calculateScores(board),
      validMoves: getValidMoves(board, 'black'),
      status: 'in_progress',
      winner: null
    };

    try {
      const { error } = await supabase
        .from('board_games')
        .insert([{
          game_type: 'reversi' as GameType,
          difficulty_level: parseInt(difficulty),
          game_state: initialGameState as unknown as Json,
          status: 'in_progress' as GameStatus,
          user_id: session?.user?.id,
        }]);
      
      if (error) throw error;
      
      setGameState(initialGameState);
      toast({
        title: "New game started",
        description: "Good luck!",
      });
    } catch (error) {
      console.error('Error starting new game:', error);
      toast({
        title: "Error",
        description: "Failed to start new game",
        variant: "destructive",
      });
    }
  };

  const makeMove = async (row: number, col: number) => {
    if (!gameState || gameState.status !== 'in_progress') return;
    
    const isValidMove = gameState.validMoves.some(([r, c]) => r === row && c === col);
    if (!isValidMove) return;

    const newBoard = flipPieces(gameState.board, row, col, gameState.currentPlayer);
    const nextPlayer: Player = gameState.currentPlayer === 'black' ? 'white' : 'black';
    const validMoves = getValidMoves(newBoard, nextPlayer);
    const scores = calculateScores(newBoard);
    
    let status: GameStatus = gameState.status;
    let winner = gameState.winner;

    if (checkGameOver(newBoard, nextPlayer)) {
      status = 'completed';
      winner = scores.black > scores.white ? 'black' : 
               scores.white > scores.black ? 'white' : 'draw';
    }

    const newGameState: ReversiState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      scores,
      validMoves,
      status,
      winner
    };
    
    try {
      const { error } = await supabase
        .from('board_games')
        .update({
          game_state: newGameState as unknown as Json,
          last_move_at: new Date().toISOString(),
          status,
          winner: winner === 'draw' ? null : winner,
        })
        .eq('user_id', session?.user?.id)
        .eq('status', 'in_progress')
        .eq('game_type', 'reversi');

      if (error) throw error;
      
      setGameState(newGameState);

      if (status === 'completed') {
        toast({
          title: "Game Over!",
          description: winner === 'draw' ? "It's a draw!" : `${winner} wins!`,
        });
      }
    } catch (error) {
      console.error('Error updating game:', error);
      toast({
        title: "Error",
        description: "Failed to update game",
        variant: "destructive",
      });
    }
  };

  const renderBoard = () => {
    if (!gameState) return null;

    return (
      <div className="grid grid-cols-8 gap-0.5 bg-gray-700 p-0.5">
        {gameState.board.map((row, i) => 
          row.map((cell, j) => {
            const isValidMove = gameState.validMoves.some(([r, c]) => r === i && c === j);
            return (
              <div 
                key={`${i}-${j}`}
                className={`w-12 h-12 bg-green-700 flex items-center justify-center cursor-pointer
                  ${isValidMove ? 'hover:bg-green-600' : ''}`}
                onClick={() => makeMove(i, j)}
              >
                {cell > 0 && (
                  <div 
                    className={`w-8 h-8 rounded-full transition-all
                      ${cell === 1 ? 'bg-black' : 'bg-white'}`}
                  />
                )}
                {isValidMove && (
                  <div className="absolute w-3 h-3 rounded-full bg-green-400 opacity-50" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Easy</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">Hard</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={startNewGame}>New Game</Button>
        </div>

        {gameState ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div>Current Player: {gameState.currentPlayer}</div>
              {gameState.status === 'completed' && (
                <div>Winner: {gameState.winner === 'draw' ? "Draw" : gameState.winner}</div>
              )}
            </div>
            {renderBoard()}
            <div className="flex justify-between text-sm">
              <div>Black: {gameState.scores.black}</div>
              <div>White: {gameState.scores.white}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Start a new game to begin playing
          </div>
        )}
      </div>
    </Card>
  );
};