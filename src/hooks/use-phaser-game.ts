import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface GameConfig extends Phaser.Types.Core.GameConfig {
  parent: string;
}

export const usePhaserGame = (config: GameConfig) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      try {
        gameRef.current = new Phaser.Game({
          type: Phaser.AUTO,
          ...config,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false
            }
          },
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
          },
          render: {
            pixelArt: false,
            antialias: true,
            antialiasGL: true
          }
        });

        console.log('Phaser game initialized successfully');
      } catch (error) {
        console.error('Error initializing Phaser game:', error);
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        console.log('Phaser game destroyed successfully');
      }
    };
  }, [config]);

  return gameRef;
};