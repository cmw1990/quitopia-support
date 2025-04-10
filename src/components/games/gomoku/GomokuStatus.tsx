import React from 'react';
import { Card } from '@/components/ui/card';
import type { GomokuState } from './types';

interface Props {
  gameState: GomokuState;
}

const GomokuStatus: React.FC<Props> = ({ gameState }) => {
  if (gameState.status !== 'completed') return null;

  return (
    <div className="mt-4 text-center">
      <Card className="p-4">
        <h3 className="text-lg font-semibold">
          {gameState.winner ? `${gameState.winner} wins!` : 'Game ended in a draw!'}
        </h3>
      </Card>
    </div>
  );
};

export default GomokuStatus;