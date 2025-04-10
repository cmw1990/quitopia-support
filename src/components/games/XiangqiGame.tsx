import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';
import { GameStatus } from '@/types/boardGames';
import { MoveHistory } from './shared/MoveHistory';
import { CapturedPieces } from './shared/CapturedPieces';
import { GameStatus as GameStatusDisplay } from './shared/GameStatus';
import type { GameMove } from '@/types/boardGames';

type Piece = {
  type: string;
  color: 'red' | 'black';
};

type Position = [number, number];

export const XiangqiGame = () => {
  const [board, setBoard] = useState<(Piece | null)[][]>(initializeBoard());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'black'>('red');
  const [gameStatus, setGameStatus] = useState<GameStatus>('not_started');
  const [moveHistory, setMoveHistory] = useState<GameMove[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{
    red: Piece[];
    black: Piece[];
  }>({ red: [], black: [] });
  const { session } = useAuth();
  const { toast } = useToast();

  function initializeBoard(): (Piece | null)[][] {
    const board = Array(10).fill(null).map(() => Array(9).fill(null));
    
    // Initialize red pieces (bottom)
    board[9][0] = { type: '車', color: 'red' }; // Chariot
    board[9][1] = { type: '馬', color: 'red' }; // Horse
    board[9][2] = { type: '象', color: 'red' }; // Elephant
    board[9][3] = { type: '士', color: 'red' }; // Advisor
    board[9][4] = { type: '將', color: 'red' }; // General
    board[9][5] = { type: '士', color: 'red' }; // Advisor
    board[9][6] = { type: '象', color: 'red' }; // Elephant
    board[9][7] = { type: '馬', color: 'red' }; // Horse
    board[9][8] = { type: '車', color: 'red' }; // Chariot
    board[7][1] = { type: '砲', color: 'red' }; // Cannon
    board[7][7] = { type: '砲', color: 'red' }; // Cannon
    board[6][0] = { type: '兵', color: 'red' }; // Soldier
    board[6][2] = { type: '兵', color: 'red' };
    board[6][4] = { type: '兵', color: 'red' };
    board[6][6] = { type: '兵', color: 'red' };
    board[6][8] = { type: '兵', color: 'red' };

    // Initialize black pieces (top)
    board[0][0] = { type: '車', color: 'black' };
    board[0][1] = { type: '馬', color: 'black' };
    board[0][2] = { type: '象', color: 'black' };
    board[0][3] = { type: '士', color: 'black' };
    board[0][4] = { type: '將', color: 'black' };
    board[0][5] = { type: '士', color: 'black' };
    board[0][6] = { type: '象', color: 'black' };
    board[0][7] = { type: '馬', color: 'black' };
    board[0][8] = { type: '車', color: 'black' };
    board[2][1] = { type: '砲', color: 'black' };
    board[2][7] = { type: '砲', color: 'black' };
    board[3][0] = { type: '兵', color: 'black' };
    board[3][2] = { type: '兵', color: 'black' };
    board[3][4] = { type: '兵', color: 'black' };
    board[3][6] = { type: '兵', color: 'black' };
    board[3][8] = { type: '兵', color: 'black' };

    return board;
  }

  const isValidMove = (from: Position, to: Position): boolean => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];

    if (!piece) return false;
    if (targetPiece && targetPiece.color === piece.color) return false;

    switch (piece.type) {
      case '將': // General
        return isValidGeneralMove(from, to);
      case '士': // Advisor
        return isValidAdvisorMove(from, to);
      case '象': // Elephant
        return isValidElephantMove(from, to);
      case '馬': // Horse
        return isValidHorseMove(from, to);
      case '車': // Chariot
        return isValidChariotMove(from, to);
      case '砲': // Cannon
        return isValidCannonMove(from, to);
      case '兵': // Soldier
        return isValidSoldierMove(from, to, piece.color);
      default:
        return false;
    }
  };

  const isValidGeneralMove = ([fromRow, fromCol]: Position, [toRow, toCol]: Position): boolean => {
    const inPalace = (row: number, col: number, color: 'red' | 'black') => {
      if (color === 'red') {
        return row >= 7 && row <= 9 && col >= 3 && col <= 5;
      } else {
        return row >= 0 && row <= 2 && col >= 3 && col <= 5;
      }
    };

    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    return (
      inPalace(toRow, toCol, piece.color) &&
      Math.abs(toRow - fromRow) + Math.abs(toCol - fromCol) === 1
    );
  };

  const isValidAdvisorMove = ([fromRow, fromCol]: Position, [toRow, toCol]: Position): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const inPalace = (row: number, col: number, color: 'red' | 'black') => {
      if (color === 'red') {
        return row >= 7 && row <= 9 && col >= 3 && col <= 5;
      } else {
        return row >= 0 && row <= 2 && col >= 3 && col <= 5;
      }
    };

    return (
      inPalace(toRow, toCol, piece.color) &&
      Math.abs(toRow - fromRow) === 1 &&
      Math.abs(toCol - fromCol) === 1
    );
  };

  const isValidElephantMove = ([fromRow, fromCol]: Position, [toRow, toCol]: Position): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const staysOnSide = piece.color === 'red' ? toRow >= 5 : toRow <= 4;
    const isValidDistance = Math.abs(toRow - fromRow) === 2 && Math.abs(toCol - fromCol) === 2;
    const middleRow = (fromRow + toRow) / 2;
    const middleCol = (fromCol + toCol) / 2;

    return staysOnSide && isValidDistance && !board[middleRow][middleCol];
  };

  const isValidHorseMove = ([fromRow, fromCol]: Position, [toRow, toCol]: Position): boolean => {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
      return false;
    }

    // Check for blocking piece
    const blockingRow = fromRow + Math.sign(toRow - fromRow) * (rowDiff === 2 ? 1 : 0);
    const blockingCol = fromCol + Math.sign(toCol - fromCol) * (colDiff === 2 ? 1 : 0);
    
    return !board[blockingRow][blockingCol];
  };

  const isValidChariotMove = ([fromRow, fromCol]: Position, [toRow, toCol]: Position): boolean => {
    if (fromRow !== toRow && fromCol !== toCol) return false;

    const start = fromRow === toRow ? Math.min(fromCol, toCol) + 1 : Math.min(fromRow, toRow) + 1;
    const end = fromRow === toRow ? Math.max(fromCol, toCol) : Math.max(fromRow, toRow);

    for (let i = start; i < end; i++) {
      if (board[fromRow === toRow ? fromRow : i][fromRow === toRow ? i : fromCol]) {
        return false;
      }
    }

    return true;
  };

  const isValidCannonMove = ([fromRow, fromCol]: Position, [toRow, toCol]: Position): boolean => {
    if (fromRow !== toRow && fromCol !== toCol) return false;

    let pieceCount = 0;
    const start = fromRow === toRow ? Math.min(fromCol, toCol) + 1 : Math.min(fromRow, toRow) + 1;
    const end = fromRow === toRow ? Math.max(fromCol, toCol) : Math.max(fromRow, toRow);

    for (let i = start; i < end; i++) {
      if (board[fromRow === toRow ? fromRow : i][fromRow === toRow ? i : fromCol]) {
        pieceCount++;
      }
    }

    const targetPiece = board[toRow][toCol];
    return targetPiece ? pieceCount === 1 : pieceCount === 0;
  };

  const isValidSoldierMove = ([fromRow, fromCol]: Position, [toRow, toCol]: Position, color: 'red' | 'black'): boolean => {
    const direction = color === 'red' ? -1 : 1;
    const hasCrossedRiver = color === 'red' ? fromRow <= 4 : fromRow >= 5;

    if (!hasCrossedRiver) {
      // Can only move forward
      return toCol === fromCol && toRow === fromRow + direction;
    } else {
      // Can move forward or sideways
      return (
        (toCol === fromCol && toRow === fromRow + direction) ||
        (toRow === fromRow && Math.abs(toCol - fromCol) === 1)
      );
    }
  };

  const handleSquareClick = async (row: number, col: number) => {
    if (gameStatus !== 'in_progress') {
      toast({
        title: "Game not started",
        description: "Please start a new game first.",
      });
      return;
    }

    if (!selectedPosition) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedPosition([row, col]);
      }
    } else {
      const [selectedRow, selectedCol] = selectedPosition;
      
      if (isValidMove(selectedPosition, [row, col])) {
        const newBoard = board.map(row => [...row]);
        const capturedPiece = newBoard[row][col];
        
        // Handle capture
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [currentPlayer]: [...prev[currentPlayer], capturedPiece]
          }));
        }

        // Create move history entry
        const move: GameMove = {
          from: [selectedRow, selectedCol],
          to: [row, col],
          piece: board[selectedRow][selectedCol]?.type,
          capture: capturedPiece?.type,
          notation: `${board[selectedRow][selectedCol]?.type} ${String.fromCharCode(97 + selectedCol)}${9 - selectedRow} to ${String.fromCharCode(97 + col)}${9 - row}${capturedPiece ? ' captures ' + capturedPiece.type : ''}`
        };
        
        setMoveHistory(prev => [...prev, move]);

        newBoard[row][col] = board[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = null;
        
        // Save game state to Supabase
        try {
          const { error } = await supabase
            .from('board_games')
            .update({
              game_state: {
                board: newBoard,
                currentPlayer: currentPlayer === 'red' ? 'black' : 'red',
                status: gameStatus,
                moveHistory,
                capturedPieces
              },
              last_move_at: new Date().toISOString(),
            })
            .eq('user_id', session?.user?.id)
            .eq('game_type', 'xiangqi')
            .eq('status', 'in_progress');

          if (error) throw error;
        } catch (error) {
          console.error('Error saving game state:', error);
          toast({
            title: "Error",
            description: "Failed to save game state",
            variant: "destructive",
          });
        }
      }
      
      setSelectedPosition(null);
    }
  };

  const startNewGame = async () => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setCurrentPlayer('red');
    setGameStatus('in_progress');
    setSelectedPosition(null);
    setMoveHistory([]);
    setCapturedPieces({ red: [], black: [] });

    try {
      const { error } = await supabase
        .from('board_games')
        .insert([{
          game_type: 'xiangqi',
          game_state: {
            board: newBoard,
            currentPlayer: 'red',
            status: 'in_progress',
            moveHistory: [],
            capturedPieces: { red: [], black: [] }
          },
          status: 'in_progress',
          user_id: session?.user?.id,
        }]);

      if (error) throw error;

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

  return (
    <div className="p-6 space-y-6">
      <GameStatusDisplay 
        status={gameStatus}
        currentPlayer={currentPlayer}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <CapturedPieces 
            pieces={capturedPieces.red}
            title="Captured by Black"
          />
        </div>
        
        <Card className="p-4">
          <div className="grid grid-cols-9 gap-1 bg-amber-100 rounded-lg">
            {board.map((row, rowIndex) => (
              row.map((piece, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-12 h-12 border border-amber-900 flex items-center justify-center
                    ${selectedPosition && selectedPosition[0] === rowIndex && selectedPosition[1] === colIndex
                      ? 'bg-amber-300'
                      : piece ? 'bg-amber-50 hover:bg-amber-100' : 'bg-amber-50'}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  <span className={`text-xl ${piece?.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                    {piece?.type}
                  </span>
                </button>
              ))
            ))}
          </div>
          
          <Button 
            className="mt-4 w-full"
            onClick={startNewGame}
          >
            New Game
          </Button>
        </Card>
        
        <div className="space-y-4">
          <CapturedPieces 
            pieces={capturedPieces.black}
            title="Captured by Red"
          />
          <MoveHistory moves={moveHistory} />
        </div>
      </div>
    </div>
  );
};
