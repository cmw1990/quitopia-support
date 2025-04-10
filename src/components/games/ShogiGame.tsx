import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';
import { MoveHistory } from './shared/MoveHistory';
import { CapturedPieces } from './shared/CapturedPieces';
import { GameStatus as GameStatusDisplay } from './shared/GameStatus';
import { GameStatus, GameMove } from '@/types/boardGames';

type Piece = {
  type: string;
  color: 'black' | 'white';
  promoted: boolean;
};

type Position = [number, number];

export const ShogiGame = () => {
  const [board, setBoard] = useState<(Piece | null)[][]>(initializeBoard());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
  const [gameStatus, setGameStatus] = useState<GameStatus>('not_started');
  const [moveHistory, setMoveHistory] = useState<GameMove[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{
    black: Piece[];
    white: Piece[];
  }>({ black: [], white: [] });
  const { session } = useAuth();
  const { toast } = useToast();

  function initializeBoard(): (Piece | null)[][] {
    const board = Array(9).fill(null).map(() => Array(9).fill(null));
    
    // Initialize black pieces (top)
    board[0][0] = { type: '香', color: 'black', promoted: false }; // Lance
    board[0][1] = { type: '桂', color: 'black', promoted: false }; // Knight
    board[0][2] = { type: '銀', color: 'black', promoted: false }; // Silver
    board[0][3] = { type: '金', color: 'black', promoted: false }; // Gold
    board[0][4] = { type: '王', color: 'black', promoted: false }; // King
    board[0][5] = { type: '金', color: 'black', promoted: false }; // Gold
    board[0][6] = { type: '銀', color: 'black', promoted: false }; // Silver
    board[0][7] = { type: '桂', color: 'black', promoted: false }; // Knight
    board[0][8] = { type: '香', color: 'black', promoted: false }; // Lance
    board[1][1] = { type: '飛', color: 'black', promoted: false }; // Rook
    board[1][7] = { type: '角', color: 'black', promoted: false }; // Bishop
    board[2][0] = { type: '歩', color: 'black', promoted: false }; // Pawn
    board[2][1] = { type: '歩', color: 'black', promoted: false };
    board[2][2] = { type: '歩', color: 'black', promoted: false };
    board[2][3] = { type: '歩', color: 'black', promoted: false };
    board[2][4] = { type: '歩', color: 'black', promoted: false };
    board[2][5] = { type: '歩', color: 'black', promoted: false };
    board[2][6] = { type: '歩', color: 'black', promoted: false };
    board[2][7] = { type: '歩', color: 'black', promoted: false };
    board[2][8] = { type: '歩', color: 'black', promoted: false };

    // Initialize white pieces (bottom)
    board[8][0] = { type: '香', color: 'white', promoted: false };
    board[8][1] = { type: '桂', color: 'white', promoted: false };
    board[8][2] = { type: '銀', color: 'white', promoted: false };
    board[8][3] = { type: '金', color: 'white', promoted: false };
    board[8][4] = { type: '王', color: 'white', promoted: false };
    board[8][5] = { type: '金', color: 'white', promoted: false };
    board[8][6] = { type: '銀', color: 'white', promoted: false };
    board[8][7] = { type: '桂', color: 'white', promoted: false };
    board[8][8] = { type: '香', color: 'white', promoted: false };
    board[7][1] = { type: '角', color: 'white', promoted: false };
    board[7][7] = { type: '飛', color: 'white', promoted: false };
    board[6][0] = { type: '歩', color: 'white', promoted: false };
    board[6][1] = { type: '歩', color: 'white', promoted: false };
    board[6][2] = { type: '歩', color: 'white', promoted: false };
    board[6][3] = { type: '歩', color: 'white', promoted: false };
    board[6][4] = { type: '歩', color: 'white', promoted: false };
    board[6][5] = { type: '歩', color: 'white', promoted: false };
    board[6][6] = { type: '歩', color: 'white', promoted: false };
    board[6][7] = { type: '歩', color: 'white', promoted: false };
    board[6][8] = { type: '歩', color: 'white', promoted: false };

    return board;
  }

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
              currentPlayer: currentPlayer === 'black' ? 'white' : 'black',
              status: gameStatus,
              moveHistory,
              capturedPieces
            },
            last_move_at: new Date().toISOString(),
          })
          .eq('user_id', session?.user?.id)
          .eq('game_type', 'shogi')
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
      
      setSelectedPosition(null);
    }
  };

  const startNewGame = async () => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setCurrentPlayer('black');
    setGameStatus('in_progress');
    setSelectedPosition(null);
    setMoveHistory([]);
    setCapturedPieces({ black: [], white: [] });

    try {
      const { error } = await supabase
        .from('board_games')
        .insert([{
          game_type: 'shogi',
          game_state: {
            board: newBoard,
            currentPlayer: 'black',
            status: 'in_progress',
            moveHistory: [],
            capturedPieces: { black: [], white: [] }
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
            pieces={capturedPieces.white}
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
                  <span className={`text-xl ${piece?.color === 'black' ? 'text-gray-900' : 'text-red-600'}`}>
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
            title="Captured by White"
          />
          <MoveHistory moves={moveHistory} />
        </div>
      </div>
    </div>
  );
};
