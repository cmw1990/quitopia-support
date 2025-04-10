import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GomokuBoard from './gomoku/GomokuBoard';
import GomokuSettings from './gomoku/GomokuSettings';
import GomokuStatus from './gomoku/GomokuStatus';
import { useGomokuGame } from './gomoku/hooks/useGomokuGame';
import { isValidMove } from './gomoku/rules';

const GomokuGame = () => {
  const { gameState, settings, setSettings, makeMove, createNewGame } = useGomokuGame();

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
  };

  return (
    <Card className="p-6 w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <GomokuSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
          className="flex-1 mr-4"
        />
        <Button onClick={createNewGame}>
          New Game
        </Button>
      </div>
      <GomokuBoard
        board={gameState.board}
        onCellClick={makeMove}
        currentPlayer={gameState.currentPlayer}
        isValidMove={(row, col) => isValidMove(row, col, gameState)}
      />
      <GomokuStatus gameState={gameState} />
    </Card>
  );
};

export default GomokuGame;