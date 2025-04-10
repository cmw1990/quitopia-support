import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CheckersState, GameStatus, GameType, Player } from '@/types/boardGames';
import type { Json } from '@/integrations/supabase/types';

const BOARD_SIZE = 8;

export const CheckersGame = () => {
  const { session } = useAuth();
  const [gameState, setGameState] = useState<CheckersState | null>(null);
  const [difficulty, setDifficulty] = useState('1');
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);

  const initializeBoard = (): number[][] => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    
    // Set up black pieces (1)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if ((i + j) % 2 === 1) {
          board[i][j] = 1;
        }
      }
    }
    
    // Set up white pieces (2)
    for (let i = BOARD_SIZE - 3; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if ((i + j) % 2 === 1) {
          board[i][j] = 2;
        }
      }
    }
    
    return board;
  };

  const getValidMoves = (row: number, col: number): [number, number][] => {
    if (!gameState) return [];

    const piece = gameState.board[row][col];
    const isKing = gameState.kings[row][col] === 1;
    const moves: [number, number][] = [];
    const playerNum = gameState.currentPlayer === 'black' ? 1 : 2;
    
    if (piece !== playerNum) return [];

    const directions = isKing ? [-1, 1] : playerNum === 1 ? [1] : [-1];

    // Check regular moves
    for (const dy of directions) {
      for (const dx of [-1, 1]) {
        const newRow = row + dy;
        const newCol = col + dx;
        
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (gameState.board[newRow][newCol] === 0) {
            moves.push([newRow, newCol]);
          }
        }
      }
    }

    // Check jumps
    for (const dy of directions) {
      for (const dx of [-1, 1]) {
        const jumpRow = row + dy * 2;
        const jumpCol = col + dx * 2;
        const midRow = row + dy;
        const midCol = col + dx;
        
        if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE) {
          if (gameState.board[jumpRow][jumpCol] === 0 && 
              gameState.board[midRow][midCol] !== 0 && 
              gameState.board[midRow][midCol] !== playerNum) {
            moves.push([jumpRow, jumpCol]);
          }
        }
      }
    }

    return moves;
  };

  const isJumpMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    return Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2;
  };

  const makeMove = async (toRow: number, toCol: number) => {
    if (!gameState || !selectedPiece || gameState.status !== 'in_progress') return;
    
    const [fromRow, fromCol] = selectedPiece;
    const validMoves = getValidMoves(fromRow, fromCol);
    const isValidMove = validMoves.some(([r, c]) => r === toRow && c === toCol);
    
    if (!isValidMove) {
      setSelectedPiece(null);
      return;
    }

    const newGameState = { ...gameState };
    const playerNum = gameState.currentPlayer === 'black' ? 1 : 2;
    
    // Move the piece
    newGameState.board[toRow][toCol] = playerNum;
    newGameState.board[fromRow][fromCol] = 0;
    
    // Handle jumps and captures
    if (isJumpMove(fromRow, fromCol, toRow, toCol)) {
      const midRow = (fromRow + toRow) / 2;
      const midCol = (fromCol + toCol) / 2;
      newGameState.board[midRow][midCol] = 0;
      
      if (gameState.currentPlayer === 'black') {
        newGameState.captures.black++;
      } else {
        newGameState.captures.white++;
      }
    }

    // Check for king promotion
    if ((playerNum === 1 && toRow === BOARD_SIZE - 1) || (playerNum === 2 && toRow === 0)) {
      newGameState.kings[toRow][toCol] = 1;
    }

    // Check for game over
    const hasWinner = newGameState.captures.black >= 12 || newGameState.captures.white >= 12;
    if (hasWinner) {
      newGameState.status = 'completed';
      newGameState.winner = newGameState.captures.black > newGameState.captures.white ? 'black' : 'white';
    }

    // Switch player
    newGameState.currentPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black';

    try {
      const { error } = await supabase
        .from('board_games')
        .update({
          game_state: newGameState as unknown as Json,
          last_move_at: new Date().toISOString(),
          status: newGameState.status,
          winner: newGameState.winner,
        })
        .eq('user_id', session?.user?.id)
        .eq('status', 'in_progress')
        .eq('game_type', 'checkers');

      if (error) throw error;
      
      setGameState(newGameState);
      setSelectedPiece(null);

      if (newGameState.status === 'completed') {
        toast({
          title: "Game Over!",
          description: `${newGameState.winner} wins!`,
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

  const startNewGame = async () => {
    const initialGameState: CheckersState = {
      board: initializeBoard(),
      currentPlayer: 'black',
      captures: {
        black: 0,
        white: 0
      },
      kings: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)),
      status: 'in_progress',
      winner: null
    };

    try {
      const { error } = await supabase
        .from('board_games')
        .insert([{
          game_type: 'checkers' as GameType,
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

  const handlePieceClick = (row: number, col: number) => {
    if (!gameState || gameState.status !== 'in_progress') return;
    
    const piece = gameState.board[row][col];
    const playerNum = gameState.currentPlayer === 'black' ? 1 : 2;

    if (piece === playerNum) {
      setSelectedPiece([row, col]);
    } else if (selectedPiece) {
      makeMove(row, col);
    }
  };

  const renderBoard = () => {
    if (!gameState) return null;

    return (
      <div className="grid grid-cols-8 gap-0.5 bg-gray-700 p-0.5">
        {gameState.board.map((row, i) => 
          row.map((cell, j) => {
            const isSelected = selectedPiece?.[0] === i && selectedPiece?.[1] === j;
            const validMoves = selectedPiece ? getValidMoves(selectedPiece[0], selectedPiece[1]) : [];
            const isValidMove = validMoves.some(([r, c]) => r === i && c === j);
            
            return (
              <div 
                key={`${i}-${j}`}
                className={`w-12 h-12 flex items-center justify-center cursor-pointer
                  ${(i + j) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-800'}
                  ${isSelected ? 'ring-2 ring-blue-400' : ''}
                  ${isValidMove ? 'ring-2 ring-green-400' : ''}`}
                onClick={() => handlePieceClick(i, j)}
              >
                {cell > 0 && (
                  <div 
                    className={`w-8 h-8 rounded-full transition-transform
                      ${cell === 1 ? 'bg-black' : 'bg-white border-2 border-gray-300'}
                      ${gameState.kings[i][j] ? 'ring-2 ring-yellow-400' : ''}
                      ${isSelected ? 'scale-110' : ''}`}
                  />
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
                <div>Winner: {gameState.winner}</div>
              )}
            </div>
            {renderBoard()}
            <div className="flex justify-between text-sm">
              <div>Black captures: {gameState.captures.black}</div>
              <div>White captures: {gameState.captures.white}</div>
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